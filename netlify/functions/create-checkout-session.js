import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripeApiVersion = '2026-02-25.clover'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

const planConfig = {
  business: {
    label: 'Business',
    priceEnv: ['STRIPE_PRICE_BUSINESS', 'STRIPE_PRICE_BUSINESS_MONTHLY'],
  },
  pro: {
    label: 'Pro',
    priceEnv: ['STRIPE_PRICE_PRO', 'STRIPE_PRICE_PRO_MONTHLY'],
  },
  starter: {
    label: 'Starter',
    priceEnv: ['STRIPE_PRICE_STARTER', 'STRIPE_PRICE_STARTER_MONTHLY'],
  },
}

function jsonResponse(statusCode, body) {
  return {
    body: JSON.stringify(body),
    headers: jsonHeaders,
    statusCode,
  }
}

function cleanText(value, maxLength = 240) {
  return String(value ?? '').trim().slice(0, maxLength)
}

function getOrigin(event) {
  const requestOrigin = event.headers.origin ?? event.headers.Origin
  return process.env.URL || process.env.DEPLOY_PRIME_URL || requestOrigin || 'http://localhost:5173'
}

function getPlanPriceId(plan) {
  const config = planConfig[plan]
  if (!config) return ''

  return config.priceEnv.map((envName) => process.env[envName]).find(Boolean) ?? ''
}

function toBillingProfilePayload(companyId, profile) {
  return {
    address_line1: cleanText(profile.addressLine1),
    address_line2: cleanText(profile.addressLine2),
    billing_email: cleanText(profile.billingEmail).toLowerCase(),
    city: cleanText(profile.city),
    company_id: companyId,
    contact_name: cleanText(profile.contactName),
    country: cleanText(profile.country || 'IT', 2).toUpperCase(),
    pec: cleanText(profile.pec).toLowerCase(),
    phone: cleanText(profile.phone),
    postal_code: cleanText(profile.postalCode, 20),
    province: cleanText(profile.province, 80).toUpperCase(),
    sdi_code: cleanText(profile.sdiCode, 20).toUpperCase(),
    tax_code: cleanText(profile.taxCode, 40).toUpperCase(),
    vat_number: cleanText(profile.vatNumber, 40).toUpperCase(),
    legal_name: cleanText(profile.legalName),
  }
}

function validateBillingProfile(profile) {
  const requiredFields = [
    ['legalName', 'ragione sociale'],
    ['billingEmail', 'email fatturazione'],
    ['addressLine1', 'indirizzo sede legale'],
    ['postalCode', 'CAP'],
    ['city', 'citta'],
    ['country', 'nazione'],
  ]

  const missingField = requiredFields.find(([field]) => !cleanText(profile[field]))
  if (missingField) return `Compila ${missingField[1]}.`

  return ''
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
  const plan = cleanText(body.plan).toLowerCase()
  const billingProfile = body.billingProfile ?? {}
  const priceId = getPlanPriceId(plan)
  const profileError = validateBillingProfile(billingProfile)

  if (!companyId || !planConfig[plan]) {
    return jsonResponse(400, { error: 'Piano o azienda non valido.' })
  }

  if (!priceId) {
    return jsonResponse(500, { error: `Configura il prezzo Stripe per il piano ${planConfig[plan].label}.` })
  }

  if (profileError) {
    return jsonResponse(400, { error: profileError })
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
    return jsonResponse(403, { error: 'Solo l azienda puo attivare un piano.' })
  }

  const { data: company, error: companyError } = await serviceClient
    .from('companies')
    .select('id, name, vat_number, headquarters, billing_customer_id')
    .eq('id', companyId)
    .maybeSingle()

  if (companyError) {
    return jsonResponse(500, { error: companyError.message })
  }

  if (!company) {
    return jsonResponse(404, { error: 'Azienda non trovata.' })
  }

  const profilePayload = toBillingProfilePayload(companyId, billingProfile)
  const { error: profileUpsertError } = await serviceClient
    .from('company_billing_profiles')
    .upsert(profilePayload, { onConflict: 'company_id' })

  if (profileUpsertError?.code === '42P01') {
    return jsonResponse(500, { error: 'Esegui prima il file SQL 24_dati_fatturazione_stripe.sql in Supabase.' })
  }

  if (profileUpsertError) {
    return jsonResponse(500, { error: profileUpsertError.message })
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: stripeApiVersion })
  const customerPayload = {
    address: {
      city: profilePayload.city || undefined,
      country: profilePayload.country || undefined,
      line1: profilePayload.address_line1 || undefined,
      line2: profilePayload.address_line2 || undefined,
      postal_code: profilePayload.postal_code || undefined,
      state: profilePayload.province || undefined,
    },
    email: profilePayload.billing_email || authData.user.email,
    metadata: {
      company_id: companyId,
      sdi_code: profilePayload.sdi_code,
      vat_number: profilePayload.vat_number,
    },
    name: profilePayload.legal_name || company.name,
    phone: profilePayload.phone || undefined,
  }

  const customer = company.billing_customer_id
    ? await stripe.customers.update(company.billing_customer_id, customerPayload)
    : await stripe.customers.create(customerPayload)

  const { error: companyUpdateError } = await serviceClient
    .from('companies')
    .update({
      billing_customer_id: customer.id,
      billing_email: profilePayload.billing_email || authData.user.email,
      billing_plan: plan,
      billing_provider: 'stripe',
      billing_status: 'pending',
      headquarters: company.headquarters || profilePayload.city || null,
      updated_at: new Date().toISOString(),
      vat_number: company.vat_number || profilePayload.vat_number || null,
    })
    .eq('id', companyId)

  if (companyUpdateError) {
    return jsonResponse(500, { error: companyUpdateError.message })
  }

  const origin = getOrigin(event)
  const checkoutSession = await stripe.checkout.sessions.create({
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    customer: customer.id,
    customer_update: {
      address: 'auto',
      name: 'auto',
    },
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      company_id: companyId,
      plan,
      user_id: authData.user.id,
    },
    mode: 'subscription',
    subscription_data: {
      metadata: {
        company_id: companyId,
        plan,
        user_id: authData.user.id,
      },
    },
    success_url: `${origin}/?billing=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?billing=cancelled`,
    tax_id_collection: {
      enabled: true,
    },
  })

  return jsonResponse(200, { id: checkoutSession.id, url: checkoutSession.url })
}
