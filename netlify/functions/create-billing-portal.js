import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripeApiVersion = '2026-02-25.clover'

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

function cleanText(value) {
  return String(value ?? '').trim()
}

function getOrigin(event) {
  const requestOrigin = event.headers.origin ?? event.headers.Origin
  return process.env.URL || process.env.DEPLOY_PRIME_URL || requestOrigin || 'http://localhost:5173'
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
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse(500, { error: 'Configurazione Supabase Netlify mancante.' })
  }

  if (!stripeSecretKey) {
    return jsonResponse(500, { error: 'Configura STRIPE_SECRET_KEY su Netlify.' })
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

  const companyId = cleanText(body.companyId)

  if (!companyId) {
    return jsonResponse(400, { error: 'Azienda non valida.' })
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
    return jsonResponse(403, { error: 'Solo l azienda puo gestire la fatturazione.' })
  }

  const { data: company, error: companyError } = await serviceClient
    .from('companies')
    .select('billing_customer_id')
    .eq('id', companyId)
    .maybeSingle()

  if (companyError) {
    return jsonResponse(500, { error: companyError.message })
  }

  if (!company?.billing_customer_id) {
    return jsonResponse(400, { error: 'Nessun cliente Stripe collegato a questa azienda.' })
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: stripeApiVersion })
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: company.billing_customer_id,
    return_url: `${getOrigin(event)}/?billing=portal`,
  })

  return jsonResponse(200, { url: portalSession.url })
}
