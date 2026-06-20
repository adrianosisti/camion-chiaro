import { createClient } from '@supabase/supabase-js'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

const chatMessageSelectColumns = `
  id,
  thread_id,
  company_id,
  sender_user_id,
  sender_role,
  body,
  attachment_path,
  read_by_company_at,
  read_by_driver_at,
  created_at,
  reactions
`

function jsonResponse(statusCode, body) {
  return {
    body: JSON.stringify(body),
    headers: jsonHeaders,
    statusCode,
  }
}

function mapChatMessage(row = {}) {
  return {
    attachmentPath: row.attachment_path ?? '',
    body: row.body ?? '',
    companyId: row.company_id,
    createdAt: row.created_at,
    id: row.id,
    readByCompanyAt: row.read_by_company_at,
    readByDriverAt: row.read_by_driver_at,
    reactions: row.reactions ?? {},
    senderRole: row.sender_role,
    senderUserId: row.sender_user_id,
    threadId: row.thread_id,
  }
}

function normalizeDriverUsername(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
}

async function canCompanyReadThread(serviceClient, userId, thread) {
  const { data, error } = await serviceClient
    .from('company_members')
    .select('role')
    .eq('company_id', thread.company_id)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  return { allowed: Boolean(data && !error), error }
}

async function canDriverReadThread(serviceClient, user, thread) {
  if (!thread.driver_id) return { allowed: false, error: null }

  const { data, error } = await serviceClient
    .from('drivers')
    .select('id, user_id, auth_email, username')
    .eq('id', thread.driver_id)
    .maybeSingle()

  if (error || !data) return { allowed: false, error }
  if (data.user_id === user.id) return { allowed: true, error: null }

  const username = normalizeDriverUsername(user.user_metadata?.username ?? user.email?.replace(/@.+$/, '') ?? '')
  const matchesLegacyDriver = data.auth_email === user.email || data.username === username

  if (!data.user_id && matchesLegacyDriver) {
    await serviceClient.from('drivers').update({ user_id: user.id }).eq('id', data.id)
    return { allowed: true, error: null }
  }

  return { allowed: matchesLegacyDriver, error: null }
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
      error: 'Configurazione Netlify mancante. Controlla SUPABASE_SERVICE_ROLE_KEY.',
    })
  }

  const authorization = event.headers.authorization ?? event.headers.Authorization ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  if (!token) {
    return jsonResponse(401, { error: 'Sessione mancante. Fai login e riprova.' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Dati richiesta non validi.' })
  }

  const threadId = String(body.threadId ?? '')
  const readerRole = String(body.readerRole ?? '')

  if (!threadId || !['company', 'driver'].includes(readerRole)) {
    return jsonResponse(400, { error: 'Chat o ruolo non valido.' })
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
    return jsonResponse(401, { error: 'Sessione non valida. Fai login e riprova.' })
  }

  const { data: thread, error: threadError } = await serviceClient
    .from('chat_threads')
    .select('id, company_id, driver_id')
    .eq('id', threadId)
    .maybeSingle()

  if (threadError) return jsonResponse(500, { error: threadError.message })
  if (!thread) return jsonResponse(404, { error: 'Chat non trovata.' })

  const permission =
    readerRole === 'company'
      ? await canCompanyReadThread(serviceClient, authData.user.id, thread)
      : await canDriverReadThread(serviceClient, authData.user, thread)

  if (permission.error) return jsonResponse(500, { error: permission.error.message })
  if (!permission.allowed) return jsonResponse(403, { error: 'Non puoi aggiornare questa chat.' })

  const timestampColumn = readerRole === 'company' ? 'read_by_company_at' : 'read_by_driver_at'
  const senderRole = readerRole === 'company' ? 'driver' : 'company'

  const { data, error } = await serviceClient
    .from('chat_messages')
    .update({ [timestampColumn]: new Date().toISOString() })
    .eq('thread_id', threadId)
    .eq('sender_role', senderRole)
    .is(timestampColumn, null)
    .select(chatMessageSelectColumns)

  if (error) return jsonResponse(500, { error: error.message })

  return jsonResponse(200, {
    messages: (data ?? []).map(mapChatMessage),
  })
}
