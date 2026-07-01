import { createClient } from '@supabase/supabase-js'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

function jsonResponse(statusCode, body) {
  return {
    body: JSON.stringify(body),
    headers: jsonHeaders,
    statusCode,
  }
}

function normalizeUsername(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
}

function buildAuthEmail(username) {
  const authDomain = process.env.VITE_DRIVER_AUTH_DOMAIN ?? 'drivers.vy-go.com'
  const cleanUsername = normalizeUsername(username)
  return cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@${authDomain}`
}

function mapCompanyPerson(row = {}) {
  return {
    authEmail: row.auth_email ?? '',
    companyId: row.company_id ?? '',
    department: row.department ?? 'office',
    depot: row.depot ?? '',
    email: row.email ?? '',
    id: row.id,
    jobTitle: row.job_title ?? '',
    linkedDriverId: row.linked_driver_id ?? '',
    name: row.full_name ?? 'Persona',
    personType: row.person_type ?? 'office',
    phone: row.phone ?? '',
    status: row.status ?? 'active',
    username: row.username ?? '',
  }
}

const planUserLimits = {
  business: 40,
  enterprise: Infinity,
  fleet10: 20,
  fleet20: 40,
  fleet30: 60,
  fleet50: 100,
  pro: 20,
  starter: 10,
}

function getPlanUserLimit(plan) {
  return planUserLimits[plan] ?? planUserLimits.starter
}

async function countRows(query) {
  const { count, error } = await query
  if (error?.code === '42P01' || error?.code === '42703') return { count: 0, error: null }
  return { count: count ?? 0, error }
}

async function verifyPlanUserLimit(serviceClient, companyId) {
  const { data: companyRow, error: companyError } = await serviceClient
    .from('companies')
    .select('billing_plan, billing_provider, billing_status')
    .eq('id', companyId)
    .maybeSingle()

  if (companyError) return { allowed: false, error: companyError }

  if (companyRow?.billing_provider === 'manual' && companyRow?.billing_status === 'active') {
    return { allowed: true, error: null }
  }

  const limit = getPlanUserLimit(companyRow?.billing_plan)
  if (!Number.isFinite(limit)) return { allowed: true, error: null }

  const [membersResult, driversResult, peopleResult] = await Promise.all([
    countRows(
      serviceClient
        .from('company_members')
        .select('user_id', { count: 'exact', head: true })
        .eq('company_id', companyId),
    ),
    countRows(
      serviceClient
        .from('drivers')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .neq('status', 'archived'),
    ),
    countRows(
      serviceClient
        .from('company_people')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .neq('status', 'archived')
        .neq('department', 'drivers'),
    ),
  ])

  const firstError = membersResult.error || driversResult.error || peopleResult.error
  if (firstError) return { allowed: false, error: firstError }

  const currentCount = membersResult.count + driversResult.count + peopleResult.count
  return {
    allowed: currentCount < limit,
    currentCount,
    error: null,
    limit,
  }
}

async function verifyCompanyOperator(serviceClient, userId, companyId) {
  const { data, error } = await serviceClient
    .from('company_members')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .in('role', ['owner', 'admin', 'operator'])
    .maybeSingle()

  return { allowed: Boolean(data && !error), error }
}

function toPersonPayload(person, companyId, userId, authEmail, username) {
  return {
    auth_email: authEmail,
    company_id: companyId,
    department: person.department || 'office',
    depot: person.depot || null,
    email: person.email || authEmail,
    full_name: String(person.name ?? '').trim(),
    job_title: person.jobTitle || null,
    person_type: person.personType || 'office',
    phone: person.phone || null,
    status: 'active',
    user_id: userId,
    username,
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(204, {})
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Metodo non consentito.' })
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse(500, {
      error: 'Configurazione Netlify mancante. Aggiungi SUPABASE_SERVICE_ROLE_KEY nelle variabili ambiente.',
    })
  }

  const authorization = event.headers.authorization ?? event.headers.Authorization ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  if (!token) {
    return jsonResponse(401, { error: 'Sessione azienda mancante. Fai login e riprova.' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Dati richiesta non validi.' })
  }

  const { companyId, password, person } = body
  const username = normalizeUsername(person?.username)
  const authEmail = buildAuthEmail(username)
  const cleanPassword = String(password ?? '').trim()
  const cleanName = String(person?.name ?? '').trim()

  if (!companyId || !cleanName || !username || !cleanPassword) {
    return jsonResponse(400, { error: 'Compila nome, username e password temporanea.' })
  }

  if (!['office', 'warehouse'].includes(person?.department)) {
    return jsonResponse(400, { error: 'Scegli ufficio o magazzino.' })
  }

  if (!/^[a-z0-9._@-]{3,80}$/.test(username)) {
    return jsonResponse(400, { error: 'Username non valido. Usa lettere, numeri, punto o trattino.' })
  }

  if (cleanPassword.length < 8) {
    return jsonResponse(400, { error: 'La password temporanea deve avere almeno 8 caratteri.' })
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey)
  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data: authData, error: authError } = await userClient.auth.getUser(token)

  if (authError || !authData.user) {
    return jsonResponse(401, { error: 'Sessione azienda non valida. Fai login e riprova.' })
  }

  const operatorCheck = await verifyCompanyOperator(serviceClient, authData.user.id, companyId)

  if (operatorCheck.error) {
    return jsonResponse(500, { error: operatorCheck.error.message })
  }

  if (!operatorCheck.allowed) {
    return jsonResponse(403, { error: 'Solo un operatore azienda puo creare persone.' })
  }

  const planCheck = await verifyPlanUserLimit(serviceClient, companyId)

  if (planCheck.error) {
    return jsonResponse(500, { error: planCheck.error.message })
  }

  if (!planCheck.allowed) {
    return jsonResponse(403, {
      error: `Limite account utenti raggiunto (${planCheck.limit}). Aggiorna piano per creare altri accessi.`,
    })
  }

  const { data: createdUser, error: createUserError } = await serviceClient.auth.admin.createUser({
    email: authEmail,
    email_confirm: true,
    password: cleanPassword,
    user_metadata: {
      account_type: 'driver',
      company_id: companyId,
      department: person.department,
      full_name: cleanName,
      person_type: person.personType,
      username,
    },
  })

  if (createUserError || !createdUser.user) {
    return jsonResponse(createUserError?.status === 422 ? 409 : 400, {
      error: createUserError?.message ?? 'Impossibile creare utente persona.',
    })
  }

  const { data: personRow, error: insertPersonError } = await serviceClient
    .from('company_people')
    .insert(toPersonPayload(person, companyId, createdUser.user.id, authEmail, username))
    .select('id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status')
    .single()

  if (insertPersonError) {
    await serviceClient.auth.admin.deleteUser(createdUser.user.id)
    return jsonResponse(409, { error: insertPersonError.message })
  }

  return jsonResponse(200, { person: mapCompanyPerson(personRow) })
}
