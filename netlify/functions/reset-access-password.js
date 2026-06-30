import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'

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

function uniqueStrings(values) {
  return [...new Set(values.map((value) => String(value ?? '').trim().toLowerCase()).filter(Boolean))]
}

function buildAuthEmailForDomain(username, domain) {
  const cleanUsername = normalizeUsername(username)
  return cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@${domain}`
}

function isTechnicalAuthEmail(value) {
  const email = String(value ?? '').trim().toLowerCase()
  return email.includes('@drivers.') || email.endsWith('@drivers.camionchiaro.app') || email.endsWith('@drivers.vy-go.com')
}

function getCandidateAuthEmails(record, username) {
  if (String(username ?? '').includes('@')) return uniqueStrings([username, record.auth_email])

  return uniqueStrings([
    record.auth_email,
    isTechnicalAuthEmail(record.email) ? record.email : '',
    buildAuthEmail(username),
    buildAuthEmailForDomain(username, 'drivers.camionchiaro.app'),
    buildAuthEmailForDomain(username, 'drivers.vy-go.com'),
    buildAuthEmailForDomain(username, 'drivers.vygo.app'),
  ])
}

function generateTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const bytes = randomBytes(12)
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
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

async function findUsersByEmails(serviceClient, emails) {
  const wantedEmails = new Set(uniqueStrings(emails))
  if (!wantedEmails.size) return []
  const foundUsers = []

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await serviceClient.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) return foundUsers

    for (const user of data?.users ?? []) {
      if (wantedEmails.has(String(user.email ?? '').toLowerCase())) {
        foundUsers.push(user)
      }
    }

    if (foundUsers.length >= wantedEmails.size) return foundUsers
    if (!data?.users?.length || data.users.length < 1000) return foundUsers
  }

  return foundUsers
}

async function loadTargetRecord(serviceClient, companyId, targetType, targetId) {
  if (targetType === 'driver') {
    const result = await serviceClient
      .from('drivers')
      .select('id, company_id, user_id, username, auth_email, full_name, email, phone, role, depot, status')
      .eq('company_id', companyId)
      .eq('id', targetId)
      .maybeSingle()

    return { ...result, table: 'drivers' }
  }

  if (targetType === 'person') {
    const result = await serviceClient
      .from('company_people')
      .select('id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status')
      .eq('company_id', companyId)
      .eq('id', targetId)
      .maybeSingle()

    return { ...result, table: 'company_people' }
  }

  return { data: null, error: { message: 'Tipo utente non valido.' }, table: '' }
}

function getTargetMetadata(targetType, record, companyId) {
  return {
    account_type: 'driver',
    company_id: companyId,
    department: targetType === 'person' ? record.department : 'drivers',
    full_name: record.full_name,
    person_type: targetType === 'person' ? record.person_type : 'driver',
    username: record.username,
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

  const companyId = String(body.companyId ?? '').trim()
  const requestedPassword = String(body.password ?? '').trim()
  const targetId = String(body.targetId ?? '').trim()
  const targetType = String(body.targetType ?? '').trim()

  if (!companyId || !targetId || !['driver', 'person'].includes(targetType)) {
    return jsonResponse(400, { error: 'Seleziona azienda e utente da reimpostare.' })
  }

  if (requestedPassword && requestedPassword.length < 8) {
    return jsonResponse(400, { error: 'La nuova password deve avere almeno 8 caratteri.' })
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
    return jsonResponse(403, { error: 'Solo un operatore azienda puo reimpostare gli accessi.' })
  }

  const targetResult = await loadTargetRecord(serviceClient, companyId, targetType, targetId)

  if (targetResult.error) {
    return jsonResponse(500, { error: targetResult.error.message })
  }

  if (!targetResult.data) {
    return jsonResponse(404, { error: 'Anagrafica non trovata.' })
  }

  const target = targetResult.data
  const username = normalizeUsername(target.username || target.full_name)
  const candidateAuthEmails = getCandidateAuthEmails(target, username)
  const authEmail = candidateAuthEmails[0] || buildAuthEmail(username)
  const temporaryPassword = requestedPassword || generateTemporaryPassword()
  const metadata = getTargetMetadata(targetType, target, companyId)
  const matchingUsers = await findUsersByEmails(serviceClient, candidateAuthEmails)
  const authUserIds = uniqueStrings([target.user_id, ...matchingUsers.map((user) => user.id)])
  const updatedUsers = []
  const updateErrors = []

  for (const authUserId of authUserIds) {
    const { data: updatedUser, error: updateError } = await serviceClient.auth.admin.updateUserById(authUserId, {
      email_confirm: true,
      password: temporaryPassword,
      user_metadata: metadata,
    })

    if (updateError || !updatedUser.user) {
      updateErrors.push(updateError?.message ?? `Account ${authUserId} non aggiornato`)
    } else {
      updatedUsers.push(updatedUser.user)
    }
  }

  let authUserId = updatedUsers[0]?.id ?? ''

  if (!authUserId) {
    const { data: createdUser, error: createError } = await serviceClient.auth.admin.createUser({
      email: authEmail,
      email_confirm: true,
      password: temporaryPassword,
      user_metadata: metadata,
    })

    if (createError || !createdUser.user) {
      return jsonResponse(createError?.status === 422 ? 409 : 400, {
        error: createError?.message ?? 'Account non ricreato.',
      })
    }

    authUserId = createdUser.user.id
  }

  const { error: updateRecordError } = await serviceClient
    .from(targetResult.table)
    .update({ auth_email: authEmail, user_id: authUserId })
    .eq('company_id', companyId)
    .eq('id', targetId)

  if (updateRecordError) {
    return jsonResponse(500, { error: updateRecordError.message })
  }

  return jsonResponse(200, {
    authEmail,
    loginEmails: candidateAuthEmails,
    password: temporaryPassword,
    passwordGenerated: !requestedPassword,
    targetId,
    targetType,
    updatedAccounts: updatedUsers.length,
    updateWarnings: updateErrors,
    username,
  })
}
