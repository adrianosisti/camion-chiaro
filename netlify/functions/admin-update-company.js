import { createClient } from '@supabase/supabase-js'

const fallbackAdminEmails = ['sisti.adriano@icloud.com']
const allowedBillingPlans = new Set(['starter', 'pro', 'business', 'enterprise', 'fleet10', 'fleet20', 'fleet30', 'fleet50'])
const allowedBillingStatuses = new Set(['pending', 'active', 'past_due', 'suspended', 'cancelled'])
const allowedSalesStages = new Set(['lead', 'trial', 'onboarding', 'active', 'risk', 'upsell', 'lost'])
const allowedPriorities = new Set(['low', 'normal', 'high', 'urgent'])

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

function cleanDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

function compactPayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined))
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
  if (!companyId) {
    return jsonResponse(400, { error: 'Cliente non valido.' })
  }

  const billingPlan = String(body.billingPlan ?? '')
  const billingStatus = String(body.billingStatus ?? '')
  const billingAddonPallexTariffs = typeof body.billingAddonPallexTariffs === 'boolean'
    ? body.billingAddonPallexTariffs
    : undefined
  const salesStage = String(body.adminSalesStage ?? 'active')
  const priority = String(body.adminPriority ?? 'normal')

  if (billingPlan && !allowedBillingPlans.has(billingPlan)) {
    return jsonResponse(400, { error: 'Piano non valido.' })
  }

  if (billingStatus && !allowedBillingStatuses.has(billingStatus)) {
    return jsonResponse(400, { error: 'Stato pagamento non valido.' })
  }

  if (!allowedSalesStages.has(salesStage)) {
    return jsonResponse(400, { error: 'Fase commerciale non valida.' })
  }

  if (!allowedPriorities.has(priority)) {
    return jsonResponse(400, { error: 'Priorita non valida.' })
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

  const adminEmails = getAdminEmails()
  const userEmail = String(authData.user.email ?? '').toLowerCase()

  if (!adminEmails.has(userEmail)) {
    return jsonResponse(403, { error: 'Account non autorizzato al Pannello Admin.' })
  }

  const companyPayload = compactPayload({
    billing_plan: billingPlan || undefined,
    billing_status: billingStatus || undefined,
    billing_addon_pallex_tariffs: billingAddonPallexTariffs,
    billing_activated_at: billingStatus === 'active' ? new Date().toISOString() : undefined,
    updated_at: new Date().toISOString(),
  })

  if (Object.keys(companyPayload).length > 1) {
    const { error } = await serviceClient
      .from('companies')
      .update(companyPayload)
      .eq('id', companyId)

    if (error) {
      return jsonResponse(500, { error: error.message })
    }
  }

  const { error: crmError } = await serviceClient
    .from('admin_company_controls')
    .upsert(
      {
        company_id: companyId,
        next_follow_up: cleanDate(body.adminNextFollowUp),
        notes: String(body.adminNotes ?? '').trim() || null,
        owner_name: String(body.adminOwnerName ?? '').trim() || null,
        priority,
        sales_stage: salesStage,
        updated_at: new Date().toISOString(),
        updated_by: authData.user.id,
      },
      { onConflict: 'company_id' },
    )

  if (crmError) {
    if (crmError.code === '42P01' || crmError.code === '42703') {
      return jsonResponse(500, {
        error: 'CRM admin non ancora installato. Esegui in Supabase il file 43_admin_crm_clienti.sql.',
      })
    }

    return jsonResponse(500, { error: crmError.message })
  }

  return jsonResponse(200, { ok: true })
}
