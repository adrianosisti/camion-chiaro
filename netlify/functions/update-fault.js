import { createClient } from '@supabase/supabase-js'

const allowedStatuses = new Set(['open', 'seen', 'in_progress', 'closed'])

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

function mapFaultReport(row) {
  return {
    companyId: row.company_id,
    createdAt: row.created_at,
    description: row.description ?? '',
    driverId: row.driver_id,
    id: row.id,
    photoPath: row.photo_path ?? '',
    semitrailerId: row.semitrailer_id,
    severity: row.severity,
    status: row.status,
    title: row.title,
    updatedAt: row.updated_at,
    vehicleId: row.vehicle_id,
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
      error: 'Configurazione Netlify mancante. Controlla SUPABASE_SERVICE_ROLE_KEY.',
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

  const reportId = String(body.reportId ?? '')
  const status = String(body.status ?? '')

  if (!reportId || !allowedStatuses.has(status)) {
    return jsonResponse(400, { error: 'Guasto o stato non valido.' })
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

  const { data: existingReport, error: existingError } = await serviceClient
    .from('fault_reports')
    .select('id, company_id')
    .eq('id', reportId)
    .maybeSingle()

  if (existingError) {
    return jsonResponse(500, { error: existingError.message })
  }

  if (!existingReport) {
    return jsonResponse(404, { error: 'Guasto non trovato.' })
  }

  const operatorCheck = await verifyCompanyOperator(serviceClient, authData.user.id, existingReport.company_id)

  if (operatorCheck.error) {
    return jsonResponse(500, { error: operatorCheck.error.message })
  }

  if (!operatorCheck.allowed) {
    return jsonResponse(403, { error: 'Solo un operatore azienda puo aggiornare i guasti.' })
  }

  const { data, error } = await serviceClient
    .from('fault_reports')
    .update({ status })
    .eq('id', reportId)
    .select(
      `
        id,
        company_id,
        driver_id,
        vehicle_id,
        semitrailer_id,
        severity,
        title,
        description,
        photo_path,
        status,
        created_at,
        updated_at
      `,
    )
    .single()

  if (error) {
    return jsonResponse(500, { error: error.message })
  }

  return jsonResponse(200, { report: mapFaultReport(data) })
}
