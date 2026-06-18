const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const configuredCompanyId = import.meta.env.VITE_SUPABASE_COMPANY_ID

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const isCompanyDataConfigured = Boolean(isSupabaseConfigured && configuredCompanyId)

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
    status: row.status,
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

const supabaseClientCacheKey = '__camionChiaroSupabaseClientPromise'
let supabaseClientPromise = globalThis[supabaseClientCacheKey] ?? null

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
