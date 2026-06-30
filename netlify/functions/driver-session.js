import { createClient } from '@supabase/supabase-js'

const driverStatusLabels = {
  active: 'In servizio',
  available: 'Disponibile',
  travelling: 'In viaggio',
  paused: 'Sospeso',
  archived: 'Archiviato',
}

const vehicleStatusLabels = {
  active: 'Operativo',
  maintenance: 'In manutenzione',
  watch: 'Da controllare',
  archived: 'Archiviato',
}

const driverDocumentStatusLabels = {
  missing: 'Mancante',
  uploaded: 'Caricato',
  verified: 'Verificato',
  expired: 'Scaduto',
}

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

function normalizeDriverUsername(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
}

function mapDriver(row) {
  return {
    authEmail: row.auth_email,
    companyId: row.company_id,
    depot: row.depot ?? '',
    email: row.email ?? row.auth_email ?? '',
    id: row.id,
    name: row.full_name,
    phone: row.phone,
    profileImagePath: row.profile_image_path ?? '',
    role: row.role ?? 'Autista',
    status: driverStatusLabels[row.status] ?? row.status,
    username: row.username,
    vehicleId: '',
  }
}

function mapVehicle(row) {
  return {
    fleetType: row.fleet_type,
    id: row.id,
    km: row.km ?? 0,
    model: row.model ?? '',
    plate: row.plate,
    status: vehicleStatusLabels[row.status] ?? row.status,
    type: row.type ?? '',
  }
}

function mapComplianceItem(row) {
  return {
    documentNumber: row.document_number,
    driverId: row.driver_id,
    dueDate: row.due_date,
    id: row.id,
    lastReminderAt: row.last_reminder_at,
    owner: row.owner,
    reminderDays: row.reminder_days,
    scope: row.scope,
    status: row.status,
    type: row.type,
    vehicleId: row.vehicle_id,
  }
}

function mapDriverDocument(row) {
  return {
    documentNumber: row.document_number ?? '',
    driverId: row.driver_id,
    expiresAt: row.expires_at,
    filePath: row.file_path ?? '',
    id: row.id,
    status: driverDocumentStatusLabels[row.status] ?? row.status,
    type: row.type,
    visibleToDriver: row.visible_to_driver,
  }
}

function mapCompanyPerson(row = {}) {
  return {
    authEmail: row.auth_email ?? '',
    companyId: row.company_id ?? '',
    department: row.department ?? 'drivers',
    depot: row.depot ?? '',
    email: row.email ?? '',
    id: row.id,
    jobTitle: row.job_title ?? '',
    linkedDriverId: row.linked_driver_id ?? '',
    name: row.full_name ?? 'Persona',
    personType: row.person_type ?? 'office',
    phone: row.phone ?? '',
    status: row.status ?? 'active',
    username: row.username ?? '',
  }
}

function mapTeamChatThread(row = {}) {
  return {
    audienceType: row.audience_type ?? 'custom',
    companyId: row.company_id ?? '',
    createdAt: row.created_at ?? '',
    directKey: row.direct_key ?? '',
    id: row.id,
    lastMessageAt: row.last_message_at ?? '',
    status: row.status ?? 'open',
    threadType: row.thread_type ?? 'group',
    title: row.title ?? 'Gruppo',
  }
}

function putCurrentDriverFirst(driver, drivers = []) {
  if (!driver?.id) return drivers
  return [
    driver,
    ...(drivers ?? []).filter((entry) => entry?.id && entry.id !== driver.id),
  ]
}

function mapVehicleCheck(row) {
  return {
    companyId: row.company_id,
    createdAt: row.created_at,
    documentsOnBoard: row.documents_on_board,
    driverId: row.driver_id,
    id: row.id,
    lightsOk: row.lights_ok,
    notes: row.notes ?? '',
    odometerKm: row.odometer_km,
    resolvedAt: row.resolved_at ?? '',
    semitrailerId: row.semitrailer_id,
    status: row.status ?? 'open',
    tiresOk: row.tires_ok,
    tractorId: row.tractor_id,
  }
}

const vehicleCheckSelect =
  'id, company_id, driver_id, tractor_id, semitrailer_id, odometer_km, lights_ok, tires_ok, documents_on_board, notes, status, resolved_at, created_at'
const vehicleCheckLegacySelect =
  'id, company_id, driver_id, tractor_id, semitrailer_id, odometer_km, lights_ok, tires_ok, documents_on_board, notes, created_at'

async function fetchVehicleChecks(serviceClient, companyId, driverId) {
  let result = await serviceClient
    .from('vehicle_checks')
    .select(vehicleCheckSelect)
    .eq('company_id', companyId)
    .eq('driver_id', driverId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (result.error?.code === '42703') {
    result = await serviceClient
      .from('vehicle_checks')
      .select(vehicleCheckLegacySelect)
      .eq('company_id', companyId)
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })
      .limit(50)
  }

  return result
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

function mapCompanyProfile(row) {
  return {
    billingActivatedAt: row.billing_activated_at ?? '',
    billingCustomerId: row.billing_customer_id ?? '',
    billingCurrentPeriodEnd: row.billing_current_period_end ?? '',
    billingEmail: row.billing_email ?? '',
    billingPlan: row.billing_plan ?? 'starter',
    billingProvider: row.billing_provider ?? 'manual',
    billingStatus: row.billing_status ?? 'active',
    billingSubscriptionId: row.billing_subscription_id ?? '',
    headquarters: row.headquarters ?? '',
    id: row.id,
    logoPath: row.logo_path ?? '',
    name: row.name,
    vatNumber: row.vat_number ?? '',
  }
}

const companyProfileBaseSelectColumns = 'id, name, vat_number, headquarters, logo_path'
const companyProfileBillingSelectColumns = `
  id,
  name,
  vat_number,
  headquarters,
  logo_path,
  billing_plan,
  billing_status,
  billing_email,
  billing_provider,
  billing_customer_id,
  billing_subscription_id,
  billing_current_period_end,
  billing_activated_at
`

function isMissingBillingColumn(error) {
  return error?.code === '42703' && String(error.message ?? '').includes('billing_')
}

async function fetchCompanyProfile(serviceClient, companyId) {
  const billingResult = await serviceClient
    .from('companies')
    .select(companyProfileBillingSelectColumns)
    .eq('id', companyId)
    .maybeSingle()

  if (!isMissingBillingColumn(billingResult.error)) {
    return billingResult
  }

  return serviceClient.from('companies').select(companyProfileBaseSelectColumns).eq('id', companyId).maybeSingle()
}

async function findDriver(serviceClient, authUser) {
  const username = normalizeDriverUsername(
    authUser.user_metadata?.username ?? authUser.email?.replace(/@.+$/, '') ?? '',
  )
  const candidates = [
    { column: 'user_id', value: authUser.id },
    { column: 'auth_email', value: authUser.email },
    { column: 'username', value: username },
  ].filter((candidate) => candidate.value)

  for (const candidate of candidates) {
    const { data, error } = await serviceClient
      .from('drivers')
      .select('id, company_id, user_id, username, auth_email, full_name, email, phone, profile_image_path, role, depot, status')
      .eq(candidate.column, candidate.value)
      .maybeSingle()

    if (error) {
      return { data: null, error }
    }

    if (data) {
      return { data, error: null }
    }
  }

  return { data: null, error: null }
}

async function findCompanyPerson(serviceClient, authUser) {
  const username = normalizeDriverUsername(
    authUser.user_metadata?.username ?? authUser.email?.replace(/@.+$/, '') ?? '',
  )
  const candidates = [
    { column: 'user_id', value: authUser.id },
    { column: 'auth_email', value: authUser.email },
    { column: 'username', value: username },
  ].filter((candidate) => candidate.value)

  for (const candidate of candidates) {
    const { data, error } = await serviceClient
      .from('company_people')
      .select('id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status')
      .eq(candidate.column, candidate.value)
      .neq('status', 'archived')
      .maybeSingle()

    if (error && !['42P01', '42703'].includes(error.code)) {
      return { data: null, error }
    }

    if (data) {
      return { data, error: null }
    }
  }

  return { data: null, error: null }
}

async function fetchCompanyPersonContext(serviceClient, person) {
  const companyId = person.company_id
  const currentPerson = mapCompanyPerson(person)

  const participantResult = await serviceClient
    .from('team_chat_participants')
    .select('thread_id')
    .eq('company_id', companyId)
    .eq('person_id', person.id)
    .is('left_at', null)

  if (participantResult.error && !['42P01', '42703'].includes(participantResult.error.code)) {
    return { data: null, error: participantResult.error }
  }

  const teamThreadIds = (participantResult.data ?? []).map((entry) => entry.thread_id).filter(Boolean)

  const [
    companyResult,
    peopleResult,
    driversResult,
    complianceResult,
    teamThreadsResult,
  ] = await Promise.all([
    fetchCompanyProfile(serviceClient, companyId),
    serviceClient
      .from('company_people')
      .select('id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status')
      .eq('company_id', companyId)
      .neq('status', 'archived')
      .order('full_name', { ascending: true }),
    serviceClient
      .from('drivers')
      .select('id, company_id, username, auth_email, full_name, email, phone, profile_image_path, role, depot, status')
      .eq('company_id', companyId)
      .neq('status', 'archived')
      .order('full_name', { ascending: true }),
    serviceClient
      .from('compliance_items')
      .select('id, type, scope, driver_id, vehicle_id, due_date, reminder_days, owner, status, document_number, last_reminder_at')
      .eq('company_id', companyId)
      .eq('person_id', person.id)
      .neq('status', 'archived')
      .order('due_date', { ascending: true }),
    teamThreadIds.length
      ? serviceClient
          .from('team_chat_threads')
          .select('id, company_id, thread_type, audience_type, direct_key, title, status, last_message_at, created_at')
          .in('id', teamThreadIds)
          .neq('status', 'archived')
          .order('last_message_at', { ascending: false, nullsFirst: false })
      : Promise.resolve({ data: [], error: null }),
  ])

  const error =
    companyResult.error ||
    peopleResult.error ||
    driversResult.error ||
    complianceResult.error ||
    teamThreadsResult.error

  if (error) return { data: null, error }

  return {
    data: {
      companyId,
      companyProfile: companyResult.data ? mapCompanyProfile(companyResult.data) : null,
      complianceItems: complianceResult.data.map(mapComplianceItem),
      currentPerson,
      documents: [],
      drivers: (driversResult.data ?? []).map(mapDriver),
      faultReports: [],
      people: peopleResult.data.map(mapCompanyPerson),
      teamChatThreads: (teamThreadsResult.data ?? []).map(mapTeamChatThread),
      vehicleChecks: [],
      vehicles: [],
    },
    error: null,
  }
}

async function fetchDriverContext(serviceClient, driver) {
  const personResult = await serviceClient
    .from('company_people')
    .select('id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status')
    .eq('company_id', driver.company_id)
    .eq('linked_driver_id', driver.id)
    .neq('status', 'archived')
    .maybeSingle()

  const currentPerson = personResult.data ? mapCompanyPerson(personResult.data) : null
  let teamThreadIds = []

  if (currentPerson?.id) {
    const participantResult = await serviceClient
      .from('team_chat_participants')
      .select('thread_id')
      .eq('company_id', driver.company_id)
      .eq('person_id', currentPerson.id)
      .is('left_at', null)

    if (participantResult.error && !['42P01', '42703'].includes(participantResult.error.code)) {
      return { data: null, error: participantResult.error }
    }

    teamThreadIds = (participantResult.data ?? []).map((entry) => entry.thread_id).filter(Boolean)
  }

  const [
    companyResult,
    vehiclesResult,
    complianceResult,
    documentsResult,
    checksResult,
    faultsResult,
    peopleResult,
    driversResult,
    teamThreadsResult,
  ] = await Promise.all([
    fetchCompanyProfile(serviceClient, driver.company_id),
    serviceClient
      .from('vehicles')
      .select('id, plate, model, type, fleet_type, km, status')
      .eq('company_id', driver.company_id)
      .neq('status', 'archived')
      .order('plate', { ascending: true }),
    serviceClient
      .from('compliance_items')
      .select('id, type, scope, driver_id, vehicle_id, due_date, reminder_days, owner, status, document_number, last_reminder_at')
      .eq('company_id', driver.company_id)
      .neq('status', 'archived')
      .or(`driver_id.eq.${driver.id},scope.eq.vehicle`)
      .order('due_date', { ascending: true }),
    serviceClient
      .from('driver_documents')
      .select('id, driver_id, type, document_number, expires_at, file_path, status, visible_to_driver')
      .eq('company_id', driver.company_id)
      .eq('driver_id', driver.id)
      .eq('visible_to_driver', true)
      .order('expires_at', { ascending: true, nullsFirst: false }),
    fetchVehicleChecks(serviceClient, driver.company_id, driver.id),
    serviceClient
      .from('fault_reports')
      .select('id, company_id, driver_id, vehicle_id, semitrailer_id, severity, title, description, photo_path, status, created_at, updated_at')
      .eq('company_id', driver.company_id)
      .eq('driver_id', driver.id)
      .order('created_at', { ascending: false })
      .limit(50),
    serviceClient
      .from('company_people')
      .select('id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status')
      .eq('company_id', driver.company_id)
      .neq('status', 'archived')
      .order('full_name', { ascending: true }),
    serviceClient
      .from('drivers')
      .select('id, company_id, username, auth_email, full_name, email, phone, profile_image_path, role, depot, status')
      .eq('company_id', driver.company_id)
      .neq('status', 'archived')
      .order('full_name', { ascending: true }),
    teamThreadIds.length
      ? serviceClient
          .from('team_chat_threads')
          .select('id, company_id, thread_type, audience_type, direct_key, title, status, last_message_at, created_at')
          .in('id', teamThreadIds)
          .neq('status', 'archived')
          .order('last_message_at', { ascending: false, nullsFirst: false })
      : Promise.resolve({ data: [], error: null }),
  ])

  const error =
    (personResult.error && !['42P01', '42703'].includes(personResult.error.code) ? personResult.error : null) ||
    companyResult.error ||
    vehiclesResult.error ||
    complianceResult.error ||
    documentsResult.error ||
    checksResult.error ||
    faultsResult.error ||
    (peopleResult.error && !['42P01', '42703'].includes(peopleResult.error.code) ? peopleResult.error : null) ||
    driversResult.error ||
    teamThreadsResult.error

  if (error) {
    return { data: null, error }
  }

  return {
    data: {
      companyId: driver.company_id,
      companyProfile: companyResult.data ? mapCompanyProfile(companyResult.data) : null,
      complianceItems: complianceResult.data.map(mapComplianceItem),
      currentPerson,
      documents: documentsResult.data.map(mapDriverDocument),
      drivers: putCurrentDriverFirst(driver, driversResult.data ?? []).map(mapDriver),
      faultReports: faultsResult.data.map(mapFaultReport),
      people: peopleResult.error ? (currentPerson ? [currentPerson] : []) : peopleResult.data.map(mapCompanyPerson),
      teamChatThreads: (teamThreadsResult.data ?? []).map(mapTeamChatThread),
      vehicleChecks: checksResult.data.map(mapVehicleCheck),
      vehicles: vehiclesResult.data.map(mapVehicle),
    },
    error: null,
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
      error: 'Configurazione Netlify mancante. Controlla SUPABASE_SERVICE_ROLE_KEY.',
    })
  }

  const authorization = event.headers.authorization ?? event.headers.Authorization ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  if (!token) {
    return jsonResponse(401, { error: 'Sessione autista mancante. Fai login e riprova.' })
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
    return jsonResponse(401, { error: 'Sessione autista non valida. Fai login e riprova.' })
  }

  const driverResult = await findDriver(serviceClient, authData.user)

  if (driverResult.error) {
    return jsonResponse(500, { error: driverResult.error.message })
  }

  if (!driverResult.data) {
    const personResult = await findCompanyPerson(serviceClient, authData.user)

    if (personResult.error) {
      return jsonResponse(500, { error: personResult.error.message })
    }

    if (!personResult.data) {
      return jsonResponse(404, {
        error: 'Account non collegato. Ricrea l utente dal pannello azienda o controlla username e password.',
      })
    }

    if (personResult.data.user_id && personResult.data.user_id !== authData.user.id) {
      return jsonResponse(403, { error: 'Questo accesso non corrisponde all anagrafica persona.' })
    }

    let person = personResult.data

    if (!person.user_id) {
      const { data, error } = await serviceClient
        .from('company_people')
        .update({ user_id: authData.user.id })
        .eq('id', person.id)
        .select('id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status')
        .single()

      if (error) {
        return jsonResponse(500, { error: error.message })
      }

      person = data
    }

    const personContextResult = await fetchCompanyPersonContext(serviceClient, person)

    if (personContextResult.error) {
      return jsonResponse(500, { error: personContextResult.error.message })
    }

    return jsonResponse(200, personContextResult.data)
  }

  if (driverResult.data.user_id && driverResult.data.user_id !== authData.user.id) {
    return jsonResponse(403, { error: 'Questo accesso non corrisponde all anagrafica autista.' })
  }

  let driver = driverResult.data

  if (!driver.user_id) {
    const { data, error } = await serviceClient
      .from('drivers')
      .update({ user_id: authData.user.id })
      .eq('id', driver.id)
      .select('id, company_id, user_id, username, auth_email, full_name, email, phone, profile_image_path, role, depot, status')
      .single()

    if (error) {
      return jsonResponse(500, { error: error.message })
    }

    driver = data
  }

  const contextResult = await fetchDriverContext(serviceClient, driver)

  if (contextResult.error) {
    return jsonResponse(500, { error: contextResult.error.message })
  }

  return jsonResponse(200, contextResult.data)
}
