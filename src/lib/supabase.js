const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const configuredCompanyId = import.meta.env.VITE_SUPABASE_COMPANY_ID

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const isCompanyDataConfigured = Boolean(isSupabaseConfigured && configuredCompanyId)
export const driverDocumentsBucket = 'driver-documents'
export const companyAssetsBucket = 'company-assets'

const driverStatusLabels = {
  active: 'In servizio',
  available: 'Disponibile',
  travelling: 'In viaggio',
  paused: 'Sospeso',
  archived: 'Archiviato',
}

const driverStatusValues = {
  'In servizio': 'active',
  Disponibile: 'available',
  'In viaggio': 'travelling',
  Sospeso: 'paused',
  Archiviato: 'archived',
}

const vehicleStatusLabels = {
  active: 'Operativo',
  maintenance: 'In manutenzione',
  watch: 'Da controllare',
  archived: 'Archiviato',
}

const vehicleStatusValues = {
  Operativo: 'active',
  'In manutenzione': 'maintenance',
  'Da controllare': 'watch',
  Archiviato: 'archived',
}

const driverDocumentStatusLabels = {
  missing: 'Mancante',
  uploaded: 'Caricato',
  verified: 'Verificato',
  expired: 'Scaduto',
}

const driverDocumentStatusValues = {
  Mancante: 'missing',
  Caricato: 'uploaded',
  Verificato: 'verified',
  Scaduto: 'expired',
}

function mapDriver(row) {
  return {
    id: row.id,
    authEmail: row.auth_email,
    companyId: row.company_id,
    depot: row.depot ?? '',
    email: row.email ?? row.auth_email ?? '',
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
    id: row.id,
    fleetType: row.fleet_type,
    km: row.km ?? 0,
    model: row.model ?? '',
    plate: row.plate,
    status: vehicleStatusLabels[row.status] ?? row.status,
    type: row.type ?? '',
  }
}

function mapComplianceItem(row) {
  return {
    id: row.id,
    documentNumber: row.document_number,
    driverId: row.driver_id,
    dueDate: row.due_date,
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
    id: row.id,
    documentNumber: row.document_number ?? '',
    driverId: row.driver_id,
    expiresAt: row.expires_at,
    filePath: row.file_path ?? '',
    status: driverDocumentStatusLabels[row.status] ?? row.status,
    type: row.type,
    visibleToDriver: row.visible_to_driver,
  }
}

function mapDriverDocumentEvent(row) {
  return {
    actorRole: row.actor_role,
    createdAt: row.created_at,
    documentId: row.document_id,
    documentNumber: row.document_number ?? '',
    documentType: row.document_type,
    driverId: row.driver_id,
    eventType: row.event_type,
    filePath: row.file_path ?? '',
    id: row.id,
    notes: row.notes ?? '',
    previousFilePath: row.previous_file_path ?? '',
  }
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
    semitrailerId: row.semitrailer_id,
    tiresOk: row.tires_ok,
    tractorId: row.tractor_id,
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

function mapCompanyProfile(row) {
  return {
    headquarters: row.headquarters ?? '',
    id: row.id,
    logoPath: row.logo_path ?? '',
    name: row.name,
    vatNumber: row.vat_number ?? '',
  }
}

function mapChatThread(row) {
  return {
    companyId: row.company_id,
    contextType: row.context_type,
    createdAt: row.created_at,
    driverId: row.driver_id,
    faultReportId: row.fault_report_id,
    id: row.id,
    lastMessageAt: row.last_message_at,
    status: row.status,
    title: row.title ?? '',
    updatedAt: row.updated_at,
    vehicleCheckId: row.vehicle_check_id,
  }
}

function mapChatMessage(row) {
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

const chatMessageSelectColumnsWithoutReactions = `
  id,
  thread_id,
  company_id,
  sender_user_id,
  sender_role,
  body,
  attachment_path,
  read_by_company_at,
  read_by_driver_at,
  created_at
`

function isMissingReactionsColumn(error) {
  return error?.code === '42703' && String(error.message ?? '').includes('reactions')
}

function toDriverPayload(driver, companyId = configuredCompanyId) {
  return {
    auth_email: driver.authEmail,
    company_id: companyId,
    depot: driver.depot,
    email: driver.email,
    full_name: driver.name,
    phone: driver.phone,
    profile_image_path: driver.profileImagePath || null,
    role: driver.role,
    status: driverStatusValues[driver.status] ?? 'available',
    username: driver.username,
  }
}

function toDriverUpdatePayload(updates) {
  const payload = {}

  if ('authEmail' in updates) payload.auth_email = updates.authEmail
  if ('depot' in updates) payload.depot = updates.depot
  if ('email' in updates) payload.email = updates.email
  if ('name' in updates) payload.full_name = updates.name
  if ('phone' in updates) payload.phone = updates.phone
  if ('profileImagePath' in updates) payload.profile_image_path = updates.profileImagePath || null
  if ('role' in updates) payload.role = updates.role
  if ('status' in updates) payload.status = driverStatusValues[updates.status] ?? updates.status
  if ('username' in updates) payload.username = updates.username

  return payload
}

function toVehiclePayload(vehicle, companyId = configuredCompanyId) {
  return {
    company_id: companyId,
    fleet_type: vehicle.fleetType,
    km: Number(vehicle.km) || 0,
    model: vehicle.model,
    plate: vehicle.plate,
    status: vehicleStatusValues[vehicle.status] ?? 'active',
    type: vehicle.type,
  }
}

function toVehicleUpdatePayload(updates) {
  const payload = {}

  if ('fleetType' in updates) payload.fleet_type = updates.fleetType
  if ('km' in updates) payload.km = Number(updates.km) || 0
  if ('model' in updates) payload.model = updates.model
  if ('plate' in updates) payload.plate = updates.plate
  if ('status' in updates) payload.status = vehicleStatusValues[updates.status] ?? updates.status
  if ('type' in updates) payload.type = updates.type

  return payload
}

function toCompanyProfileUpdatePayload(updates) {
  const payload = {}

  if ('name' in updates) payload.name = updates.name.trim()
  if ('vatNumber' in updates) payload.vat_number = updates.vatNumber.trim() || null
  if ('headquarters' in updates) payload.headquarters = updates.headquarters.trim() || null
  if ('logoPath' in updates) payload.logo_path = updates.logoPath || null

  return payload
}

function toDriverDocumentPayload(document, companyId = configuredCompanyId) {
  return {
    company_id: companyId,
    document_number: document.documentNumber,
    driver_id: document.driverId,
    expires_at: document.expiresAt || null,
    file_path: document.filePath || null,
    status: driverDocumentStatusValues[document.status] ?? 'uploaded',
    type: document.type,
    visible_to_driver: document.visibleToDriver,
  }
}

function toDriverDocumentUpdatePayload(updates) {
  const payload = {}

  if ('documentNumber' in updates) payload.document_number = updates.documentNumber
  if ('driverId' in updates) payload.driver_id = updates.driverId
  if ('expiresAt' in updates) payload.expires_at = updates.expiresAt || null
  if ('filePath' in updates) payload.file_path = updates.filePath || null
  if ('status' in updates) payload.status = driverDocumentStatusValues[updates.status] ?? updates.status
  if ('type' in updates) payload.type = updates.type
  if ('visibleToDriver' in updates) payload.visible_to_driver = updates.visibleToDriver

  return payload
}

function toVehicleCheckPayload(check, companyId = configuredCompanyId) {
  const odometerKm = check.odometerKm === '' || check.odometerKm == null ? null : Number(check.odometerKm)

  return {
    company_id: companyId,
    documents_on_board: check.documentsOnBoard ?? true,
    driver_id: check.driverId,
    lights_ok: check.lightsOk ?? true,
    notes: check.notes?.trim() || null,
    odometer_km: Number.isFinite(odometerKm) ? odometerKm : null,
    semitrailer_id: check.semitrailerId || null,
    tires_ok: check.tiresOk ?? true,
    tractor_id: check.tractorId,
  }
}

function toFaultReportPayload(report, companyId = configuredCompanyId) {
  return {
    company_id: companyId,
    description: report.description?.trim() || null,
    driver_id: report.driverId,
    photo_path: report.photoPath || null,
    semitrailer_id: report.semitrailerId || null,
    severity: report.severity || 'medium',
    title: report.title.trim(),
    vehicle_id: report.vehicleId,
  }
}

function toChatThreadPayload(thread, companyId = configuredCompanyId) {
  return {
    company_id: companyId,
    context_type: thread.contextType ?? 'general',
    driver_id: thread.driverId || null,
    fault_report_id: thread.faultReportId || null,
    status: thread.status ?? 'open',
    title: thread.title?.trim() || null,
    vehicle_check_id: thread.vehicleCheckId || null,
  }
}

function toChatMessagePayload(message, companyId = configuredCompanyId) {
  return {
    attachment_path: message.attachmentPath || null,
    body: message.body?.trim() || null,
    company_id: companyId,
    sender_role: message.senderRole,
    thread_id: message.threadId,
  }
}

const supabaseClientCacheKey = '__camionChiaroSupabaseClientPromise'
let supabaseClientPromise = globalThis[supabaseClientCacheKey] ?? null

function sanitizeStorageFileName(fileName) {
  return (fileName || 'documento')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'documento'
}

export async function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null
  }

  if (!supabaseClientPromise) {
    supabaseClientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(supabaseUrl, supabaseAnonKey),
    )
    globalThis[supabaseClientCacheKey] = supabaseClientPromise
  }

  return supabaseClientPromise
}

export async function fetchDrivers(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('drivers')
    .select('id, username, auth_email, full_name, email, phone, profile_image_path, role, depot, status')
    .eq('company_id', companyId)
    .order('full_name', { ascending: true })

  return { data: data?.map(mapDriver) ?? null, error }
}

export async function ensureCompanyForCurrentUser(companyName) {
  const supabase = await getSupabaseClient()
  const cleanCompanyName = companyName?.trim() || 'Nuova azienda'

  if (!supabase) {
    return { data: null, error: null, demo: true }
  }

  const { data, error } = await supabase.rpc('ensure_company_for_current_user', {
    input_company_name: cleanCompanyName,
    input_headquarters: null,
    input_vat_number: null,
  })

  if (error && configuredCompanyId) {
    const fallbackResult = await supabase
      .from('companies')
      .select('id, name, vat_number, headquarters, logo_path')
      .eq('id', configuredCompanyId)
      .maybeSingle()

    if (fallbackResult.data && !fallbackResult.error) {
      return { data: mapCompanyProfile(fallbackResult.data), error: null }
    }
  }

  const profile = Array.isArray(data) ? data[0] : data

  if (!profile?.id || error) {
    return { data: profile ? mapCompanyProfile(profile) : null, error }
  }

  const fullProfileResult = await supabase
    .from('companies')
    .select('id, name, vat_number, headquarters, logo_path')
    .eq('id', profile.id)
    .maybeSingle()

  if (fullProfileResult.data && !fullProfileResult.error) {
    return { data: mapCompanyProfile(fullProfileResult.data), error: null }
  }

  return { data: mapCompanyProfile(profile), error: fullProfileResult.error }
}

export async function fetchCompanyProfile(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('companies')
    .select('id, name, vat_number, headquarters, logo_path')
    .eq('id', companyId)
    .maybeSingle()

  return { data: data ? mapCompanyProfile(data) : null, error }
}

export async function updateCompanyProfile(updates, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()
  const payload = toCompanyProfileUpdatePayload(updates)

  if (!supabase || !companyId || Object.keys(payload).length === 0) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('companies')
    .update(payload)
    .eq('id', companyId)
    .select('id, name, vat_number, headquarters, logo_path')
    .maybeSingle()

  return { data: data ? mapCompanyProfile(data) : null, error }
}

export async function fetchVehicles(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('id, plate, model, type, fleet_type, km, status')
    .eq('company_id', companyId)
    .neq('status', 'archived')
    .order('plate', { ascending: true })

  return { data: data?.map(mapVehicle) ?? null, error }
}

export async function fetchComplianceItems(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('compliance_items')
    .select(
      `
        id,
        type,
        scope,
        driver_id,
        vehicle_id,
        due_date,
        reminder_days,
        owner,
        status,
        document_number,
        last_reminder_at
      `,
    )
    .eq('company_id', companyId)
    .neq('status', 'archived')
    .order('due_date', { ascending: true })

  return { data: data?.map(mapComplianceItem) ?? null, error }
}

export async function fetchDriverDocuments(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('driver_documents')
    .select('id, driver_id, type, document_number, expires_at, file_path, status, visible_to_driver')
    .eq('company_id', companyId)
    .order('expires_at', { ascending: true, nullsFirst: false })

  return { data: data?.map(mapDriverDocument) ?? null, error }
}

export async function fetchDriverDocumentEvents(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('driver_document_events')
    .select(
      'id, driver_id, document_id, document_type, document_number, event_type, actor_role, file_path, previous_file_path, notes, created_at',
    )
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(80)

  return { data: data?.map(mapDriverDocumentEvent) ?? null, error }
}

export async function fetchVehicleChecks(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('vehicle_checks')
    .select(
      `
        id,
        company_id,
        driver_id,
        tractor_id,
        semitrailer_id,
        odometer_km,
        lights_ok,
        tires_ok,
        documents_on_board,
        notes,
        created_at
      `,
    )
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(50)

  return { data: data?.map(mapVehicleCheck) ?? null, error }
}

export async function fetchFaultReports(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('fault_reports')
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
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(50)

  return { data: data?.map(mapFaultReport) ?? null, error }
}

export async function fetchChatThreads(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('chat_threads')
    .select(
      `
        id,
        company_id,
        driver_id,
        context_type,
        fault_report_id,
        vehicle_check_id,
        title,
        status,
        last_message_at,
        created_at,
        updated_at
      `,
    )
    .eq('company_id', companyId)
    .order('updated_at', { ascending: false })
    .limit(200)

  return { data: data?.map(mapChatThread) ?? null, error }
}

export async function fetchChatMessages(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  let { data, error } = await supabase
    .from('chat_messages')
    .select(chatMessageSelectColumns)
    .eq('company_id', companyId)
    .order('created_at', { ascending: true })
    .limit(500)

  if (isMissingReactionsColumn(error)) {
    const fallbackResult = await supabase
      .from('chat_messages')
      .select(chatMessageSelectColumnsWithoutReactions)
      .eq('company_id', companyId)
      .order('created_at', { ascending: true })
      .limit(500)

    data = fallbackResult.data
    error = fallbackResult.error
  }

  return { data: data?.map(mapChatMessage) ?? null, error }
}

export async function fetchDriverSessionData() {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: null }
  }

  const sessionResult = await supabase.auth.getSession()
  const accessToken = sessionResult.data?.session?.access_token

  if (!accessToken) {
    return { data: null, error: { message: 'Sessione autista mancante. Fai login e riprova.' } }
  }

  try {
    const response = await fetch('/.netlify/functions/driver-session', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { data: null, error: { message: payload.error ?? 'Caricamento area autista non riuscito.' } }
    }

    return { data: payload, error: null }
  } catch {
    return {
      data: null,
      error: {
        message: 'Funzione Netlify autista non raggiungibile. Controlla che l ultimo deploy sia pubblicato.',
      },
    }
  }
}

export async function createDriverRecord(driver, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('drivers')
    .insert(toDriverPayload(driver, companyId))
    .select('id, company_id, username, auth_email, full_name, email, phone, profile_image_path, role, depot, status')
    .single()

  return { data: data ? mapDriver(data) : null, error }
}

export async function createDriverAccount(driver, password, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const sessionResult = await supabase.auth.getSession()
  const accessToken = sessionResult.data?.session?.access_token

  if (!accessToken) {
    return { data: null, error: { message: 'Sessione azienda mancante. Fai login e riprova.' } }
  }

  try {
    const response = await fetch('/.netlify/functions/create-driver', {
      body: JSON.stringify({ companyId, driver, password }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { data: null, error: { message: payload.error ?? 'Creazione account autista non riuscita.' } }
    }

    return { data: payload.driver ?? null, error: null }
  } catch {
    return {
      data: null,
      error: {
        message: 'Funzione Netlify non raggiungibile. Dopo il deploy su Netlify riprova dal sito online.',
      },
    }
  }
}

export async function updateDriverRecord(driverId, updates) {
  const supabase = await getSupabaseClient()

  if (!supabase || !driverId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('drivers')
    .update(toDriverUpdatePayload(updates))
    .eq('id', driverId)
    .select('id, username, auth_email, full_name, email, phone, profile_image_path, role, depot, status')
    .single()

  return { data: data ? mapDriver(data) : null, error }
}

export async function archiveDriverRecord(driverId) {
  return updateDriverRecord(driverId, { status: 'Archiviato' })
}

export async function createVehicleRecord(vehicle, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('vehicles')
    .insert(toVehiclePayload(vehicle, companyId))
    .select('id, plate, model, type, fleet_type, km, status')
    .single()

  return { data: data ? mapVehicle(data) : null, error }
}

export async function updateVehicleRecord(vehicleId, updates) {
  const supabase = await getSupabaseClient()

  if (!supabase || !vehicleId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('vehicles')
    .update(toVehicleUpdatePayload(updates))
    .eq('id', vehicleId)
    .select('id, plate, model, type, fleet_type, km, status')
    .single()

  return { data: data ? mapVehicle(data) : null, error }
}

export async function archiveVehicleRecord(vehicleId) {
  return updateVehicleRecord(vehicleId, { status: 'Archiviato' })
}

export async function createDriverDocumentRecord(document, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('driver_documents')
    .insert(toDriverDocumentPayload(document, companyId))
    .select('id, driver_id, type, document_number, expires_at, file_path, status, visible_to_driver')
    .single()

  return { data: data ? mapDriverDocument(data) : null, error }
}

export async function createOwnDriverDocumentRecord(document) {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase.rpc('create_driver_document_for_current_driver', {
    document_expires_at: document.expiresAt || null,
    document_number: document.documentNumber || null,
    document_type: document.type,
  })

  return { data: data ? mapDriverDocument(data) : null, error }
}

export async function createVehicleCheckRecord(check, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('vehicle_checks')
    .insert(toVehicleCheckPayload(check, companyId))
    .select(
      `
        id,
        company_id,
        driver_id,
        tractor_id,
        semitrailer_id,
        odometer_km,
        lights_ok,
        tires_ok,
        documents_on_board,
        notes,
        created_at
      `,
    )
    .single()

  return { data: data ? mapVehicleCheck(data) : null, error }
}

export async function createFaultReportRecord(report, companyId = configuredCompanyId, photoFile = null) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  let photoPath = report.photoPath ?? ''

  if (photoFile) {
    const cleanFileName = sanitizeStorageFileName(photoFile.name)
    photoPath = `${companyId}/faults/${report.driverId}/${Date.now()}-${cleanFileName}`
    const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(photoPath, photoFile, {
      cacheControl: '3600',
      contentType: photoFile.type || undefined,
      upsert: false,
    })

    if (uploadError) {
      return { data: null, error: uploadError }
    }
  }

  const { data, error } = await supabase
    .from('fault_reports')
    .insert(toFaultReportPayload({ ...report, photoPath }, companyId))
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

  if (error && photoPath) {
    await supabase.storage.from(companyAssetsBucket).remove([photoPath])
  }

  return { data: data ? mapFaultReport(data) : null, error }
}

export async function createChatThreadRecord(thread, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const selectColumns = `
    id,
    company_id,
    driver_id,
    context_type,
    fault_report_id,
    vehicle_check_id,
    title,
    status,
    last_message_at,
    created_at,
    updated_at
  `
  const payload = toChatThreadPayload(thread, companyId)
  const { data, error } = await supabase.from('chat_threads').insert(payload).select(selectColumns).single()

  if (error?.code === '23505' && payload.context_type === 'general' && payload.driver_id) {
    const existingThread = await supabase
      .from('chat_threads')
      .select(selectColumns)
      .eq('company_id', companyId)
      .eq('driver_id', payload.driver_id)
      .eq('context_type', 'general')
      .maybeSingle()

    return { data: existingThread.data ? mapChatThread(existingThread.data) : null, error: existingThread.error }
  }

  return { data: data ? mapChatThread(data) : null, error }
}

export async function createChatMessageRecord(message, companyId = configuredCompanyId, attachmentFile = null) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId || !message?.threadId) {
    return { data: null, error: null }
  }

  let attachmentPath = message.attachmentPath ?? ''

  if (attachmentFile) {
    const cleanFileName = sanitizeStorageFileName(attachmentFile.name)
    attachmentPath = `${companyId}/chat/${message.threadId}/${Date.now()}-${cleanFileName}`
    const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(attachmentPath, attachmentFile, {
      cacheControl: '3600',
      contentType: attachmentFile.type || undefined,
      upsert: false,
    })

    if (uploadError) {
      return { data: null, error: uploadError }
    }
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert(toChatMessagePayload({ ...message, attachmentPath }, companyId))
    .select(chatMessageSelectColumnsWithoutReactions)
    .single()

  if (error && attachmentPath) {
    await supabase.storage.from(companyAssetsBucket).remove([attachmentPath])
  }

  return { data: data ? mapChatMessage(data) : null, error }
}

export async function markChatMessagesRead(threadId, readerRole) {
  const supabase = await getSupabaseClient()

  if (!supabase || !threadId || !['company', 'driver'].includes(readerRole)) {
    return { data: null, error: null }
  }

  const timestampColumn = readerRole === 'company' ? 'read_by_company_at' : 'read_by_driver_at'
  const senderRole = readerRole === 'company' ? 'driver' : 'company'
  let { data, error } = await supabase
    .from('chat_messages')
    .update({ [timestampColumn]: new Date().toISOString() })
    .eq('thread_id', threadId)
    .eq('sender_role', senderRole)
    .is(timestampColumn, null)
    .select(chatMessageSelectColumns)

  if (isMissingReactionsColumn(error)) {
    const fallbackResult = await supabase
      .from('chat_messages')
      .update({ [timestampColumn]: new Date().toISOString() })
      .eq('thread_id', threadId)
      .eq('sender_role', senderRole)
      .is(timestampColumn, null)
      .select(chatMessageSelectColumnsWithoutReactions)

    data = fallbackResult.data
    error = fallbackResult.error
  }

  return { data: data?.map(mapChatMessage) ?? null, error }
}

export async function updateChatMessageReaction(message, actorRole, reaction) {
  const supabase = await getSupabaseClient()

  if (!supabase || !message?.id || !['company', 'driver'].includes(actorRole)) {
    return { data: null, error: null }
  }

  const reactions = { ...(message.reactions ?? {}) }

  if (reaction) {
    reactions[actorRole] = reaction
  } else {
    delete reactions[actorRole]
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .update({ reactions })
    .eq('id', message.id)
    .select(chatMessageSelectColumns)
    .single()

  if (isMissingReactionsColumn(error)) {
    return {
      data: null,
      error: {
        message: 'Manca SQL reazioni chat. Esegui il file 19_chat_reazioni.sql in Supabase.',
      },
    }
  }

  return { data: data ? mapChatMessage(data) : null, error }
}

export async function updateFaultReportStatus(reportId, status) {
  const supabase = await getSupabaseClient()

  if (!supabase || !reportId) {
    return { data: null, error: null }
  }

  const sessionResult = await supabase.auth.getSession()
  const accessToken = sessionResult.data?.session?.access_token

  if (accessToken) {
    try {
      const response = await fetch('/.netlify/functions/update-fault', {
        body: JSON.stringify({ reportId, status }),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      const payload = await response.json().catch(() => ({}))

      if (response.ok) {
        return { data: payload.report ?? null, error: null }
      }

      if (response.status !== 404) {
        return { data: null, error: { message: payload.error ?? 'Aggiornamento guasto non riuscito.' } }
      }
    } catch {
      // Fallback RLS below keeps local/dev previews usable before Netlify publishes the function.
    }
  }

  const { data, error } = await supabase
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

  return { data: data ? mapFaultReport(data) : null, error }
}

export async function updateDriverDocumentRecord(documentId, updates) {
  const supabase = await getSupabaseClient()

  if (!supabase || !documentId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('driver_documents')
    .update(toDriverDocumentUpdatePayload(updates))
    .eq('id', documentId)
    .select('id, driver_id, type, document_number, expires_at, file_path, status, visible_to_driver')
    .single()

  return { data: data ? mapDriverDocument(data) : null, error }
}

export async function deleteDriverDocumentRecord(documentId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !documentId) {
    return { error: null }
  }

  return supabase.from('driver_documents').delete().eq('id', documentId)
}

export async function logDriverDocumentEvent(documentId, eventType, details = {}) {
  const supabase = await getSupabaseClient()

  if (!supabase || !documentId || !eventType) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase.rpc('log_driver_document_event', {
    event_file_path: details.filePath || null,
    event_notes: details.notes || null,
    event_previous_file_path: details.previousFilePath || null,
    event_type: eventType,
    target_document_id: documentId,
  })

  return { data: data ? mapDriverDocumentEvent(data) : null, error }
}

export async function uploadDriverDocumentFile(document, file, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId || !document?.id || !document?.driverId || !file) {
    return { data: null, error: null }
  }

  const cleanFileName = sanitizeStorageFileName(file.name)
  const filePath = `${companyId}/${document.driverId}/${document.id}/${Date.now()}-${cleanFileName}`
  const { error: uploadError } = await supabase.storage.from(driverDocumentsBucket).upload(filePath, file, {
    cacheControl: '3600',
    contentType: file.type || undefined,
    upsert: false,
  })

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  const { data, error } = await supabase.rpc('set_driver_document_file', {
    target_document_id: document.id,
    uploaded_file_path: filePath,
  })

  if (error) {
    await supabase.storage.from(driverDocumentsBucket).remove([filePath])
    return { data: null, error }
  }

  return { data: data ? mapDriverDocument(data) : null, error: null }
}

export async function uploadCompanyLogoFile(file, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId || !file) {
    return { data: null, error: null }
  }

  const cleanFileName = sanitizeStorageFileName(file.name)
  const filePath = `${companyId}/company-logo/${Date.now()}-${cleanFileName}`
  const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(filePath, file, {
    cacheControl: '3600',
    contentType: file.type || undefined,
    upsert: false,
  })

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  const { data, error } = await supabase.rpc('set_company_logo_file', {
    target_company_id: companyId,
    uploaded_file_path: filePath,
  })

  if (error) {
    await supabase.storage.from(companyAssetsBucket).remove([filePath])
    return { data: null, error }
  }

  return { data: data ? mapCompanyProfile(data) : null, error: null }
}

export async function uploadDriverProfileImageFile(driverId, file, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId || !driverId || !file) {
    return { data: null, error: null }
  }

  const cleanFileName = sanitizeStorageFileName(file.name)
  const filePath = `${companyId}/drivers/${driverId}/profile/${Date.now()}-${cleanFileName}`
  const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(filePath, file, {
    cacheControl: '3600',
    contentType: file.type || undefined,
    upsert: false,
  })

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  const { data, error } = await supabase.rpc('set_driver_profile_image_file', {
    target_driver_id: driverId,
    uploaded_file_path: filePath,
  })

  if (error) {
    await supabase.storage.from(companyAssetsBucket).remove([filePath])
    return { data: null, error }
  }

  return { data: data ? mapDriver(data) : null, error: null }
}

export async function clearDriverProfileImageFile(driverId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !driverId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase.rpc('clear_driver_profile_image_file', {
    target_driver_id: driverId,
  })

  return { data: data ? mapDriver(data) : null, error }
}

export async function createDriverDocumentSignedUrl(filePath) {
  const supabase = await getSupabaseClient()

  if (!supabase || !filePath) {
    return { data: null, error: null }
  }

  return supabase.storage.from(driverDocumentsBucket).createSignedUrl(filePath, 600)
}

export async function createCompanyAssetSignedUrl(filePath) {
  const supabase = await getSupabaseClient()

  if (!supabase || !filePath) {
    return { data: null, error: null }
  }

  return supabase.storage.from(companyAssetsBucket).createSignedUrl(filePath, 3600)
}

export async function subscribeToChatMessages(companyId, onMessage) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return () => {}
  }

  const channel = supabase
    .channel(`chat-messages-${companyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        filter: `company_id=eq.${companyId}`,
        schema: 'public',
        table: 'chat_messages',
      },
      (payload) => {
        if (payload.new) onMessage?.(mapChatMessage(payload.new), payload)
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export async function subscribeToChatPresence(companyId, actor, handlers = {}) {
  const supabase = await getSupabaseClient()
  const actorId = actor?.actorId
  const actorRole = actor?.actorRole

  if (!supabase || !companyId || !actorId || !['company', 'driver'].includes(actorRole)) {
    return {
      cleanup: () => {},
      sendTyping: () => {},
    }
  }

  const clientId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  const presencePayload = {
    actorId,
    actorName: actor.actorName ?? '',
    actorRole,
    lastSeenAt: new Date().toISOString(),
    onlineAt: new Date().toISOString(),
  }
  const channel = supabase
    .channel(`chat-presence-${companyId}`, {
      config: {
        presence: {
          key: `${actorRole}:${actorId}:${clientId}`,
        },
      },
    })
    .on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState()
      const presences = Object.values(presenceState)
        .flat()
        .filter((presence) => presence?.actorId && presence?.actorRole)

      handlers.onPresenceChange?.(presences)
    })
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (!payload?.threadId || !payload?.actorId || payload.actorId === actorId) return
      handlers.onTyping?.(payload)
    })
    .subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return
      await channel.track(presencePayload)
    })

  return {
    cleanup: () => {
      channel.untrack()
      supabase.removeChannel(channel)
    },
    sendTyping: ({ isTyping = false, threadId }) => {
      if (!threadId) return
      channel.send({
        event: 'typing',
        payload: {
          actorId,
          actorName: actor.actorName ?? '',
          actorRole,
          isTyping,
          sentAt: new Date().toISOString(),
          threadId,
        },
        type: 'broadcast',
      })
    },
  }
}

export async function subscribeToOperationalUpdates(companyId, handlers = {}) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return () => {}
  }

  const channel = supabase
    .channel(`operations-${companyId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        filter: `company_id=eq.${companyId}`,
        schema: 'public',
        table: 'vehicle_checks',
      },
      (payload) => {
        if (payload.new) handlers.onVehicleCheck?.(mapVehicleCheck(payload.new))
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        filter: `company_id=eq.${companyId}`,
        schema: 'public',
        table: 'fault_reports',
      },
      (payload) => {
        if (payload.new) handlers.onFaultReport?.(mapFaultReport(payload.new))
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        filter: `company_id=eq.${companyId}`,
        schema: 'public',
        table: 'fault_reports',
      },
      (payload) => {
        if (payload.new) handlers.onFaultReportUpdate?.(mapFaultReport(payload.new))
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export async function getCurrentAuthSession() {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: null }
  }

  return supabase.auth.getSession()
}

export async function savePushSubscription(subscription, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: null, demo: true }
  }

  const endpoint = subscription?.endpoint
  const keys = subscription?.keys ?? {}

  if (!endpoint || !keys.p256dh || !keys.auth) {
    return { data: null, error: { message: 'Iscrizione notifiche non valida.' } }
  }

  const { data, error } = await supabase.rpc('upsert_push_subscription', {
    subscription_auth: keys.auth,
    subscription_endpoint: endpoint,
    subscription_p256dh: keys.p256dh,
    subscription_target_company_id: companyId || null,
    subscription_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  })

  return { data, error }
}

export async function deletePushSubscription(endpoint) {
  const supabase = await getSupabaseClient()

  if (!supabase || !endpoint) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase.rpc('delete_push_subscription', {
    subscription_endpoint: endpoint,
  })

  return { data, error }
}

export async function sendPushNotification(payload) {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: null, demo: true }
  }

  const sessionResult = await supabase.auth.getSession()
  const accessToken = sessionResult.data?.session?.access_token

  if (!accessToken) {
    return { data: null, error: { message: 'Sessione mancante per inviare notifica telefono.' } }
  }

  try {
    const response = await fetch('/.netlify/functions/send-push', {
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const responsePayload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { data: null, error: { message: responsePayload.error ?? 'Notifica telefono non inviata.' } }
    }

    return { data: responsePayload, error: null }
  } catch {
    return {
      data: null,
      error: {
        message: 'Funzione notifiche non raggiungibile. Dopo il deploy Netlify riprova dal sito online.',
      },
    }
  }
}

export async function signUpCompany({ email, password, companyName }) {
  const supabase = await getSupabaseClient()
  const cleanCompanyName = companyName?.trim() ?? ''
  const emailRedirectTo = typeof window !== 'undefined' ? window.location.origin : undefined

  if (!supabase) {
    return { data: null, error: null, demo: true }
  }

  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        account_type: 'company',
        company_name: cleanCompanyName,
      },
    },
  })
}

export async function signInCompany({ email, password }) {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: null, demo: true }
  }

  return supabase.auth.signInWithPassword({ email, password })
}

export async function signInDriver({ username, password }) {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: null, demo: true }
  }

  const driverAuthDomain = import.meta.env.VITE_DRIVER_AUTH_DOMAIN ?? 'drivers.camionchiaro.app'
  const cleanUsername = username.trim().toLowerCase()
  const email = cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@${driverAuthDomain}`

  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { error: null, demo: true }
  }

  return supabase.auth.signOut()
}
