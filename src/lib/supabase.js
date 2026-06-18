const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const configuredCompanyId = import.meta.env.VITE_SUPABASE_COMPANY_ID

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const isCompanyDataConfigured = Boolean(isSupabaseConfigured && configuredCompanyId)
export const driverDocumentsBucket = 'driver-documents'

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
    depot: row.depot ?? '',
    email: row.email ?? row.auth_email ?? '',
    name: row.full_name,
    phone: row.phone,
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
    semitrailerId: row.semitrailer_id,
    severity: row.severity,
    status: row.status,
    title: row.title,
    updatedAt: row.updated_at,
    vehicleId: row.vehicle_id,
  }
}

function toDriverPayload(driver, companyId = configuredCompanyId) {
  return {
    auth_email: driver.authEmail,
    company_id: companyId,
    depot: driver.depot,
    email: driver.email,
    full_name: driver.name,
    phone: driver.phone,
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
    semitrailer_id: report.semitrailerId || null,
    severity: report.severity || 'medium',
    title: report.title.trim(),
    vehicle_id: report.vehicleId,
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
    .select('id, username, auth_email, full_name, email, phone, role, depot, status')
    .eq('company_id', companyId)
    .order('full_name', { ascending: true })

  return { data: data?.map(mapDriver) ?? null, error }
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
    .select('id, username, auth_email, full_name, email, phone, role, depot, status')
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
    .select('id, username, auth_email, full_name, email, phone, role, depot, status')
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

export async function createFaultReportRecord(report, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('fault_reports')
    .insert(toFaultReportPayload(report, companyId))
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

export async function createDriverDocumentSignedUrl(filePath) {
  const supabase = await getSupabaseClient()

  if (!supabase || !filePath) {
    return { data: null, error: null }
  }

  return supabase.storage.from(driverDocumentsBucket).createSignedUrl(filePath, 600)
}

export async function getCurrentAuthSession() {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: null }
  }

  return supabase.auth.getSession()
}

export async function signUpCompany({ email, password, companyName }) {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: null, demo: true }
  }

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        account_type: 'company',
        company_name: companyName,
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
