import { createClient } from '@supabase/supabase-js'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

const legalDocumentVersions = {
  dpa: 'vygo-dpa-2026-07-03',
  marketing: 'vygo-marketing-2026-07-03',
  privacy: 'vygo-privacy-2026-07-03',
  staffTerms: 'vygo-staff-terms-2026-07-03',
  terms: 'vygo-terms-2026-07-03',
}

const commercialDocumentVersions = {
  contract: 'vygo-contratto-saas-b2b-2026-07-13',
  commercialOrder: 'vygo-ordine-commerciale-2026-07-13',
  dpaAttachment: legalDocumentVersions.dpa,
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

function getRequestIp(event) {
  return cleanText(
    event.headers['x-nf-client-connection-ip']
      || event.headers['client-ip']
      || event.headers['x-forwarded-for']
      || '',
    120,
  )
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
    legal_name: cleanText(profile.legalName),
    pec: cleanText(profile.pec).toLowerCase(),
    phone: cleanText(profile.phone),
    postal_code: cleanText(profile.postalCode, 20),
    province: cleanText(profile.province, 80).toUpperCase(),
    sdi_code: cleanText(profile.sdiCode, 20).toUpperCase(),
    tax_code: cleanText(profile.taxCode, 40).toUpperCase(),
    vat_number: cleanText(profile.vatNumber, 40).toUpperCase(),
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

function validateAcceptedDocuments(acceptedDocuments) {
  if (!acceptedDocuments?.terms) return 'Accetta Termini e Condizioni Vygo.'
  if (!acceptedDocuments?.privacy) return 'Conferma la lettura dell Informativa Privacy.'
  if (!acceptedDocuments?.dpa) return 'Conferma la nomina privacy per l azienda.'
  if (!acceptedDocuments?.commercialOrder) return 'Accetta l ordine commerciale e il piano scelto.'
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

async function upsertLegalAcceptances(serviceClient, {
  acceptedAt,
  acceptedDocuments,
  companyId,
  ipHint,
  userAgent,
  userId,
}) {
  const documentTypes = ['terms', 'privacy', 'dpa']
  if (acceptedDocuments.marketing) documentTypes.push('marketing')

  const rows = documentTypes.map((documentType) => ({
    accepted_at: acceptedAt,
    account_role: 'company',
    company_id: companyId,
    document_type: documentType,
    document_version: legalDocumentVersions[documentType],
    ip_hint: ipHint,
    metadata: {
      source: 'contract_envelope',
      marketingAccepted: Boolean(acceptedDocuments.marketing),
    },
    user_agent: userAgent,
    user_id: userId,
  }))

  const { error } = await serviceClient
    .from('legal_acceptances')
    .upsert(rows, { onConflict: 'company_id,user_id,document_type,document_version' })

  if (error) throw error
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
    return jsonResponse(500, { error: 'Configurazione Supabase Netlify mancante.' })
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
  const acceptedDocuments = body.acceptedDocuments ?? {}
  const profileError = validateBillingProfile(billingProfile)
  const acceptanceError = validateAcceptedDocuments(acceptedDocuments)

  if (!companyId || !plan) {
    return jsonResponse(400, { error: 'Piano o azienda non valido.' })
  }

  if (profileError) {
    return jsonResponse(400, { error: profileError })
  }

  if (acceptanceError) {
    return jsonResponse(400, { error: acceptanceError })
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
    return jsonResponse(403, { error: 'Solo l azienda puo accettare il contratto online.' })
  }

  const { data: company, error: companyError } = await serviceClient
    .from('companies')
    .select('id, name')
    .eq('id', companyId)
    .maybeSingle()

  if (companyError) {
    return jsonResponse(500, { error: companyError.message })
  }

  if (!company) {
    return jsonResponse(404, { error: 'Azienda non trovata.' })
  }

  const acceptedAt = new Date().toISOString()
  const userAgent = cleanText(event.headers['user-agent'] || event.headers['User-Agent'] || '', 500)
  const ipHint = getRequestIp(event)
  const profilePayload = toBillingProfilePayload(companyId, billingProfile)

  try {
    const { error: profileUpsertError } = await serviceClient
      .from('company_billing_profiles')
      .upsert(profilePayload, { onConflict: 'company_id' })

    if (profileUpsertError) throw profileUpsertError

    await upsertLegalAcceptances(serviceClient, {
      acceptedAt,
      acceptedDocuments,
      companyId,
      ipHint,
      userAgent,
      userId: authData.user.id,
    })

    const documentVersions = {
      ...legalDocumentVersions,
      ...commercialDocumentVersions,
      ...(body.documentVersions ?? {}),
    }
    const acceptanceSnapshot = {
      acceptedDocuments: {
        commercialOrder: true,
        dpa: true,
        marketing: Boolean(acceptedDocuments.marketing),
        privacy: true,
        terms: true,
      },
      companyName: company.name,
      plan,
      profile: profilePayload,
      userEmail: authData.user.email,
    }

    const { data: envelope, error: envelopeError } = await serviceClient
      .from('company_contract_envelopes')
      .insert({
        accepted_at: acceptedAt,
        accepted_ip_hint: ipHint,
        accepted_user_agent: userAgent,
        acceptance_snapshot: acceptanceSnapshot,
        address_line1: profilePayload.address_line1,
        address_line2: profilePayload.address_line2,
        billing_email: profilePayload.billing_email || authData.user.email,
        billing_profile_company_id: companyId,
        city: profilePayload.city,
        company_id: companyId,
        contact_name: profilePayload.contact_name,
        country: profilePayload.country,
        created_by: authData.user.id,
        document_versions: documentVersions,
        legal_name: profilePayload.legal_name || company.name,
        pec: profilePayload.pec,
        phone: profilePayload.phone,
        plan,
        postal_code: profilePayload.postal_code,
        province: profilePayload.province,
        sdi_code: profilePayload.sdi_code,
        signing_mode: 'clickwrap',
        status: 'accepted',
        tax_code: profilePayload.tax_code,
        updated_at: acceptedAt,
        vat_number: profilePayload.vat_number,
      })
      .select('id, status, accepted_at')
      .single()

    if (envelopeError) throw envelopeError

    const { error: eventError } = await serviceClient
      .from('company_contract_events')
      .insert({
        actor_user_id: authData.user.id,
        company_id: companyId,
        envelope_id: envelope.id,
        event_payload: {
          plan,
          signingMode: 'clickwrap',
        },
        event_type: 'accepted_online',
      })

    if (eventError) throw eventError

    return jsonResponse(200, {
      acceptedAt: envelope.accepted_at,
      envelopeId: envelope.id,
      status: envelope.status,
    })
  } catch (error) {
    if (['42P01', '42703', 'PGRST204', 'PGRST205'].includes(error?.code)) {
      return jsonResponse(500, { error: 'Esegui prima il file SQL 67_contratti_attivazione_online.sql in Supabase.' })
    }

    return jsonResponse(500, { error: error.message ?? 'Contratto online non salvato.' })
  }
}
