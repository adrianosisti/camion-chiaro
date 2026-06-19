import { createClient } from '@supabase/supabase-js'

const driverStatusLabels = {
  active: 'In servizio',
  available: 'Disponibile',
  travelling: 'In viaggio',
  paused: 'Sospeso',
  archived: 'Archiviato',
}

const driverStatusValues = {
  'In servizio': 'active',
  Disponibile: 'available',
  'In viaggio': 'travelling',
  Sospeso: 'paused',
  Archiviato: 'archived',
}

const jsonHeaders = {
  'Content-Type': 'application/json',
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(body),
  }
}

function normalizeDriverUsername(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
}

function buildDriverAuthEmail(username) {
  const driverAuthDomain = process.env.VITE_DRIVER_AUTH_DOMAIN ?? 'drivers.camionchiaro.app'
  const cleanUsername = normalizeDriverUsername(username)
  return cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@${driverAuthDomain}`
}

function mapDriver(row) {
  return {
    id: row.id,
    authEmail: row.auth_email,
    depot: row.depot ?? '',
    email: row.email ?? row.auth_email ?? '',
    name: row.full_name,
    phone: row.phone,
    profileImagePath: row.profile_image_path ?? '',
    role: row.role ?? 'Autista',
    status: driverStatusLabels[row.status] ?? row.status,
    username: row.username,
    vehicleId: '',
  }
}

function toDriverPayload(driver, companyId, authUserId, authEmail, username) {
  return {
    auth_email: authEmail,
    company_id: companyId,
    depot: driver.depot ?? '',
    email: driver.email || authEmail,
    full_name: driver.name,
    phone: driver.phone,
    profile_image_path: driver.profileImagePath || null,
    role: driver.role ?? 'Autista',
    status: driverStatusValues[driver.status] ?? 'available',
    user_id: authUserId,
    username,
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

  const { companyId, driver, password } = body
  const username = normalizeDriverUsername(driver?.username)
  const authEmail = buildDriverAuthEmail(username)
  const cleanPassword = String(password ?? '').trim()

  if (!companyId || !driver?.name?.trim() || !driver?.phone?.trim() || !username || !cleanPassword) {
    return jsonResponse(400, { error: 'Compila nome, telefono, username e password.' })
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
    return jsonResponse(403, { error: 'Solo un operatore azienda puo creare autisti.' })
  }

  const { data: createdUser, error: createUserError } = await serviceClient.auth.admin.createUser({
    email: authEmail,
    email_confirm: true,
    password: cleanPassword,
    user_metadata: {
      account_type: 'driver',
      company_id: companyId,
      full_name: driver.name,
      username,
    },
  })

  if (createUserError || !createdUser.user) {
    return jsonResponse(createUserError?.status === 422 ? 409 : 400, {
      error: createUserError?.message ?? 'Impossibile creare utente autista.',
    })
  }

  const { data: driverRow, error: insertDriverError } = await serviceClient
    .from('drivers')
    .insert(toDriverPayload(driver, companyId, createdUser.user.id, authEmail, username))
    .select('id, username, auth_email, full_name, email, phone, profile_image_path, role, depot, status')
    .single()

  if (insertDriverError) {
    await serviceClient.auth.admin.deleteUser(createdUser.user.id)
    return jsonResponse(409, { error: insertDriverError.message })
  }

  return jsonResponse(200, { driver: mapDriver(driverRow) })
}
