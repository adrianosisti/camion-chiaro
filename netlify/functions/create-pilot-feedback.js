import { createClient } from '@supabase/supabase-js'

const allowedCategories = new Set(['problem', 'idea', 'question', 'praise', 'training'])
const allowedRoles = new Set(['company', 'driver', 'office', 'warehouse', 'admin', 'unknown'])
const allowedScreens = new Set(['dashboard', 'chat', 'records', 'documents', 'operations', 'reports', 'mobile', 'other', 'area_test'])

const jsonHeaders = {
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

function jsonResponse(statusCode, body) {
  return {
    body: JSON.stringify(body),
    headers: jsonHeaders,
    statusCode,
  }
}

function normalizeRole(role) {
  const cleanRole = String(role ?? '').trim()
  return allowedRoles.has(cleanRole) ? cleanRole : 'unknown'
}

function normalizeCategory(category) {
  const cleanCategory = String(category ?? '').trim()
  return allowedCategories.has(cleanCategory) ? cleanCategory : 'problem'
}

function normalizeScreen(screen) {
  const cleanScreen = String(screen ?? '').trim()
  return allowedScreens.has(cleanScreen) ? cleanScreen : 'other'
}

async function getCompanyAccess(serviceClient, userId, companyId) {
  const companyMemberResult = await serviceClient
    .from('company_members')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .maybeSingle()

  if (companyMemberResult.error) return { allowed: false, error: companyMemberResult.error }
  if (companyMemberResult.data) return { allowed: true, role: 'company' }

  const driverResult = await serviceClient
    .from('drivers')
    .select('id, status')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .neq('status', 'archived')
    .maybeSingle()

  if (driverResult.error) return { allowed: false, error: driverResult.error }
  if (driverResult.data) return { allowed: true, role: 'driver' }

  const personResult = await serviceClient
    .from('company_people')
    .select('id, department, status')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .neq('status', 'archived')
    .maybeSingle()

  if (personResult.error) return { allowed: false, error: personResult.error }
  if (personResult.data) {
    return {
      allowed: true,
      role: personResult.data.department === 'warehouse' ? 'warehouse' : 'office',
    }
  }

  return { allowed: false, error: null }
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

  const companyId = String(body.companyId ?? '').trim()
  const message = String(body.message ?? '').trim()

  if (!companyId || !message) {
    return jsonResponse(400, { error: 'Azienda o messaggio non valido.' })
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

  const access = await getCompanyAccess(serviceClient, authData.user.id, companyId)

  if (access.error) {
    return jsonResponse(500, { error: access.error.message })
  }

  if (!access.allowed) {
    return jsonResponse(403, { error: 'Account non autorizzato per questa azienda.' })
  }

  const actorRole = normalizeRole(body.actorRole) === 'unknown'
    ? access.role
    : normalizeRole(body.actorRole)

  const { data, error } = await serviceClient
    .from('pilot_feedback')
    .insert({
      actor_role: actorRole,
      actor_user_id: authData.user.id,
      category: normalizeCategory(body.category),
      company_id: companyId,
      message,
      screen: normalizeScreen(body.screen),
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
