import { createClient } from '@supabase/supabase-js'

const fallbackAdminEmails = ['sisti.adriano@icloud.com']

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

function getAdminEmails() {
  const configuredEmails = String(process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return new Set(configuredEmails.length ? configuredEmails : fallbackAdminEmails)
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
    return jsonResponse(401, { error: 'Sessione admin mancante. Fai login e riprova.' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Dati richiesta non validi.' })
  }

  const companyId = String(body.companyId ?? '')
  const message = String(body.message ?? '').trim()

  if (!companyId || !message) {
    return jsonResponse(400, { error: 'Cliente o messaggio non valido.' })
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
    return jsonResponse(401, { error: 'Sessione admin non valida. Fai login e riprova.' })
  }

  if (!getAdminEmails().has(String(authData.user.email ?? '').toLowerCase())) {
    return jsonResponse(403, { error: 'Account non autorizzato al Pannello Admin.' })
  }

  const { data, error } = await serviceClient
    .from('pilot_feedback')
    .insert({
      actor_role: 'admin',
      admin_notes: `Risposta Vygo inviata da ${authData.user.email}`,
      category: 'question',
      company_id: companyId,
      message,
      screen: 'area_test',
      status: 'open',
    })
    .select('id, company_id, actor_role, category, screen, message, status, admin_notes, created_at, updated_at')
    .single()

  if (error) {
    if (error.code === '42P01' || error.code === '42703') {
      return jsonResponse(500, {
        error: 'Area test non ancora installata. Esegui in Supabase il file 53_pilot_control.sql.',
      })
    }

    return jsonResponse(500, { error: error.message })
  }

  return jsonResponse(200, { feedback: data, ok: true })
}
