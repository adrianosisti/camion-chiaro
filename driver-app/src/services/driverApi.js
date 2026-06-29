import { File } from 'expo-file-system'
import { apiBaseUrl, driverAuthDomain, isSupabaseConfigured, supabase } from './supabaseClient'
import {
  mapChatMessage,
  mapChatThread,
  mapCompanyPerson as mapContextCompanyPerson,
  mapDriver,
  mapDriverContext,
  mapDriverDocument,
  mapFaultReport,
  mapTeamChatMessage,
  mapTeamChatThread,
  mapVehicle,
  mapVehicleCheck,
} from './mappers'

const companyAssetsBucket = 'company-assets'
const driverDocumentsBucket = 'driver-documents'

function normalizeUsername(username = '') {
  return String(username).trim().toLowerCase().replace(/\s+/g, '')
}

function getDriverEmail(username = '') {
  const cleanUsername = normalizeUsername(username)
  return cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@${driverAuthDomain}`
}

async function getAccessToken() {
  const sessionResult = await supabase?.auth.getSession()
  return sessionResult?.data?.session?.access_token ?? ''
}

function notConfiguredError() {
  return { data: null, error: { message: 'Configura le chiavi Supabase in driver-app/.env.' } }
}

function isMissingWorkforceSchemaError(error) {
  return ['42P01', '42703', 'PGRST200', 'PGRST202', 'PGRST204'].includes(error?.code)
}

function workforceSchemaError() {
  return { message: 'Per usare reparti, ufficio e magazzino esegui prima il file 31_personale_reparti_gruppi.sql in Supabase.' }
}

const chatThreadSelect = 'id, company_id, driver_id, title, context_type, last_message_at'
const chatMessageSelect =
  'id, company_id, thread_id, sender_user_id, sender_role, body, attachment_path, reactions, read_by_company_at, read_by_driver_at, created_at'
const chatMessageSelectWithoutReactions =
  'id, company_id, thread_id, sender_user_id, sender_role, body, attachment_path, read_by_company_at, read_by_driver_at, created_at'
const teamChatThreadSelect = 'id, company_id, thread_type, audience_type, direct_key, title, status, last_message_at, created_at'
const teamChatMessageSelect =
  'id, company_id, thread_id, sender_user_id, sender_person_id, sender_role, body, attachment_path, read_by_company_at, created_at'
const teamChatMessageLegacySelect =
  'id, company_id, thread_id, sender_user_id, sender_person_id, sender_role, body, attachment_path, created_at'
const vehicleCheckSelect =
  'id, company_id, driver_id, tractor_id, semitrailer_id, odometer_km, lights_ok, tires_ok, documents_on_board, notes, status, resolved_at, created_at'
const vehicleCheckLegacySelect =
  'id, company_id, driver_id, tractor_id, semitrailer_id, odometer_km, lights_ok, tires_ok, documents_on_board, notes, created_at'

function mapCompanyProfile(row = {}) {
  return {
    headquarters: row.headquarters ?? '',
    id: row.id,
    logoPath: row.logo_path ?? row.logoPath ?? '',
    name: row.name ?? 'Azienda',
    vatNumber: row.vat_number ?? row.vatNumber ?? '',
  }
}

function mapComplianceItem(row = {}) {
  return {
    assetId: row.asset_id ?? '',
    documentNumber: row.document_number ?? '',
    driverId: row.driver_id ?? '',
    dueDate: row.due_date ?? '',
    fileBucket: row.file_bucket ?? row.fileBucket ?? '',
    filePath: row.file_path ?? row.filePath ?? '',
    id: row.id,
    personId: row.person_id ?? '',
    scope: row.scope ?? '',
    status: row.status ?? 'open',
    type: row.type ?? 'Scadenza',
    vehicleId: row.vehicle_id ?? '',
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

function mapCompanyAsset(row = {}) {
  return {
    assetType: row.asset_type ?? 'forklift',
    code: row.code ?? '',
    companyId: row.company_id ?? '',
    id: row.id,
    location: row.location ?? '',
    model: row.model ?? '',
    serialNumber: row.serial_number ?? '',
    status: row.status ?? 'active',
  }
}

function toCompanyVehiclePayload(vehicle, companyId) {
  return {
    company_id: companyId,
    fleet_type: vehicle.fleetType || 'trattore',
    km: Number(vehicle.km) || 0,
    model: vehicle.model || null,
    plate: String(vehicle.plate ?? '').trim().toUpperCase(),
    status: vehicle.status || 'active',
    type: vehicle.type || null,
  }
}

function toComplianceItemPayload(item, companyId) {
  const payload = {
    asset_id: item.scope === 'asset' ? item.assigneeId : null,
    company_id: companyId,
    document_number: item.documentNumber || null,
    driver_id: item.scope === 'driver' ? item.assigneeId : null,
    due_date: item.dueDate,
    owner: item.owner || null,
    person_id: item.scope === 'person' ? item.assigneeId : null,
    scope: item.scope,
    status: 'open',
    type: item.type,
    vehicle_id: item.scope === 'vehicle' ? item.assigneeId : null,
  }

  if (item.filePath) {
    payload.file_bucket = companyAssetsBucket
    payload.file_path = item.filePath
  }

  return payload
}

function toLegacyComplianceItemPayload(item, companyId) {
  const payload = {
    company_id: companyId,
    document_number: item.documentNumber || null,
    driver_id: item.scope === 'driver' ? item.assigneeId : null,
    due_date: item.dueDate,
    owner: item.owner || null,
    scope: item.scope,
    status: 'open',
    type: item.type,
    vehicle_id: item.scope === 'vehicle' ? item.assigneeId : null,
  }

  if (item.filePath) {
    payload.file_bucket = companyAssetsBucket
    payload.file_path = item.filePath
  }

  return payload
}

function toCompanyPersonPayload(person, companyId) {
  const cleanName = String(person.name ?? '').trim()

  return {
    company_id: companyId,
    department: person.department || 'office',
    depot: person.depot || null,
    email: person.email || null,
    full_name: cleanName,
    job_title: person.jobTitle || null,
    person_type: person.personType || 'office',
    phone: person.phone || null,
    status: person.status || 'active',
    username: person.username ? normalizeUsername(person.username) : null,
  }
}

function toCompanyAssetPayload(asset, companyId) {
  return {
    asset_type: asset.assetType || 'forklift',
    code: String(asset.code ?? '').trim().toUpperCase(),
    company_id: companyId,
    location: asset.location || null,
    model: asset.model || null,
    serial_number: asset.serialNumber || null,
    status: asset.status || 'active',
  }
}

function sanitizeFileName(value = 'file') {
  return String(value)
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'file'
}

async function getFileBodyFromUri(uri) {
  const bytes = await new File(uri).bytes()

  if (bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength) {
    return bytes.buffer
  }

  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
}

function normalizeComparable(value = '') {
  return String(value ?? '').trim().toLowerCase()
}

function getDocumentStatusFromExpiry(expiresAt, filePath = '') {
  if (expiresAt) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiresAt)
    expiry.setHours(0, 0, 0, 0)
    if (Number.isFinite(expiry.getTime()) && expiry < today) return 'expired'
  }

  return filePath ? 'uploaded' : 'missing'
}

function findMatchingDriverDocument(documents = [], item = {}, updates = {}) {
  const wantedTypes = new Set([item.type, updates.type].map(normalizeComparable).filter(Boolean))
  const wantedNumbers = new Set([item.documentNumber, updates.documentNumber].map(normalizeComparable).filter(Boolean))

  return documents.find((document) => wantedNumbers.has(normalizeComparable(document.document_number)))
    || documents.find((document) => wantedTypes.has(normalizeComparable(document.type)))
    || null
}

async function registerCompanyStorageFile({
  bucket,
  category = 'other',
  companyId,
  documentId = null,
  driverId = null,
  filePath,
  sizeBytes = 0,
}) {
  if (!companyId || !filePath) return

  await supabase.rpc('register_company_storage_file', {
    file_size_bytes: sizeBytes,
    storage_bucket: bucket,
    storage_category: category,
    storage_path: filePath,
    target_company_id: companyId,
    target_document_id: documentId,
    target_driver_id: driverId,
  })
}

async function fetchVehicleChecksForDriver(companyId, driverId, limit = 50) {
  let result = await supabase
    .from('vehicle_checks')
    .select(vehicleCheckSelect)
    .eq('company_id', companyId)
    .eq('driver_id', driverId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (result.error?.code === '42703') {
    result = await supabase
      .from('vehicle_checks')
      .select(vehicleCheckLegacySelect)
      .eq('company_id', companyId)
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })
      .limit(limit)
  }

  return result
}

async function fetchVehicleChecksForCompany(companyId, limit = 30) {
  let result = await supabase
    .from('vehicle_checks')
    .select(vehicleCheckSelect)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (result.error?.code === '42703') {
    result = await supabase
      .from('vehicle_checks')
      .select(vehicleCheckLegacySelect)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit)
  }

  return result
}

async function fetchCompanyComplianceItems(companyId, limit = 50) {
  let result = await supabase
    .from('compliance_items')
    .select('id, type, scope, driver_id, vehicle_id, person_id, asset_id, due_date, document_number, status, file_bucket, file_path')
    .eq('company_id', companyId)
    .neq('status', 'archived')
    .order('due_date', { ascending: true })
    .limit(limit)

  if (isMissingWorkforceSchemaError(result.error)) {
    result = await supabase
      .from('compliance_items')
      .select('id, type, scope, driver_id, vehicle_id, due_date, document_number, status')
      .eq('company_id', companyId)
      .neq('status', 'archived')
      .order('due_date', { ascending: true })
      .limit(limit)
  }

  return result
}

async function ensureDefaultTeamThreads(companyId) {
  if (!companyId) return { data: null, error: null }

  const { data, error } = await supabase.rpc('ensure_default_team_threads', {
    target_company_id: companyId,
  })

  if (isMissingWorkforceSchemaError(error)) {
    return { data: null, error: null, missingSchema: true }
  }

  return { data, error }
}

async function fetchTeamChatThreads(companyId) {
  if (!companyId) return { data: [], error: null }

  const { data, error } = await supabase
    .from('team_chat_threads')
    .select(teamChatThreadSelect)
    .eq('company_id', companyId)
    .neq('status', 'archived')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (isMissingWorkforceSchemaError(error)) {
    return { data: [], error: null, missingSchema: true }
  }

  return { data: (data ?? []).map(mapTeamChatThread), error }
}

async function fetchCurrentCompanyPerson(companyId, userId, driverId = '') {
  if (!companyId) return { data: null, error: null }

  if (driverId) {
    const byDriverResult = await supabase
      .from('company_people')
      .select('id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status')
      .eq('company_id', companyId)
      .eq('linked_driver_id', driverId)
      .neq('status', 'archived')
      .maybeSingle()

    if (isMissingWorkforceSchemaError(byDriverResult.error)) {
      return { data: null, error: null, missingSchema: true }
    }

    if (byDriverResult.error || byDriverResult.data) {
      return {
        data: byDriverResult.data ? mapContextCompanyPerson(byDriverResult.data) : null,
        error: byDriverResult.error,
      }
    }
  }

  if (!userId) return { data: null, error: null }

  const byUserResult = await supabase
    .from('company_people')
    .select('id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .neq('status', 'archived')
    .maybeSingle()

  if (isMissingWorkforceSchemaError(byUserResult.error)) {
    return { data: null, error: null, missingSchema: true }
  }

  return {
    data: byUserResult.data ? mapContextCompanyPerson(byUserResult.data) : null,
    error: byUserResult.error,
  }
}

export async function getCurrentSession() {
  if (!isSupabaseConfigured) return { data: { session: null }, error: null }
  return supabase.auth.getSession()
}

export async function signInDriver({ password, username }) {
  if (!isSupabaseConfigured) return notConfiguredError()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: getDriverEmail(username),
    password,
  })

  return { data: data?.session ?? null, error }
}

export async function signInCompany({ email, password }) {
  if (!isSupabaseConfigured) return notConfiguredError()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email ?? '').trim(),
    password,
  })

  return { data: data?.session ?? null, error }
}

export async function signOutDriver() {
  if (!isSupabaseConfigured) return
  await supabase.auth.signOut()
}

export async function saveNativePushToken({ companyId = '', deviceName = '', platform = '', token = '' }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!token) return { data: null, error: { message: 'Token notifiche mancante.' } }

  const { data, error } = await supabase.rpc('upsert_native_push_token', {
    token_device_name: deviceName || null,
    token_platform: platform || null,
    token_target_company_id: companyId || null,
    token_value: token,
  })

  if (error?.code === '42883' || error?.code === 'PGRST202') {
    return {
      data: null,
      error: { message: 'Manca SQL notifiche app native. Esegui il file 30_native_push_tokens.sql in Supabase.' },
    }
  }

  return { data, error }
}

export async function sendPushNotification(payload) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!apiBaseUrl) return { data: null, error: { message: 'Configura EXPO_PUBLIC_API_BASE_URL con il sito Netlify.' } }

  const token = await getAccessToken()
  if (!token) return { data: null, error: { message: 'Sessione mancante per inviare notifica telefono.' } }

  try {
    const response = await fetch(`${apiBaseUrl}/.netlify/functions/send-push`, {
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { data: null, error: { message: data.error ?? 'Notifica telefono non inviata.' } }
    }

    return { data, error: null }
  } catch {
    return { data: null, error: { message: 'Server notifiche non raggiungibile.' } }
  }
}

export async function getSessionAccountType() {
  if (!isSupabaseConfigured) return { data: 'driver', error: null }

  const sessionResult = await supabase.auth.getSession()
  const userId = sessionResult.data?.session?.user?.id

  if (!userId) return { data: 'driver', error: null }

  const profileResult = await supabase
    .from('user_profiles')
    .select('account_type')
    .eq('user_id', userId)
    .maybeSingle()

  if (profileResult.data?.account_type === 'company') {
    return { data: 'company', error: null }
  }

  const memberResult = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (memberResult.data?.company_id) {
    return { data: 'company', error: null }
  }

  return { data: 'driver', error: profileResult.error ?? memberResult.error ?? null }
}

export async function fetchDriverContext() {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!apiBaseUrl) {
    return fetchDriverContextDirect()
  }

  const token = await getAccessToken()

  if (!token) {
    return { data: null, error: { message: 'Sessione autista scaduta. Fai login.' } }
  }

  try {
    const response = await fetch(`${apiBaseUrl}/.netlify/functions/driver-session`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'POST',
    })
    const payload = await response.json()

    if (!response.ok) {
      const fallbackResult = await fetchDriverContextDirect()
      if (fallbackResult.data) return fallbackResult
      return { data: null, error: { message: payload.error ?? fallbackResult.error?.message ?? 'Dati autista non disponibili.' } }
    }

    return { data: mapDriverContext(payload), error: null }
  } catch {
    const fallbackResult = await fetchDriverContextDirect()
    if (fallbackResult.data) return fallbackResult

    return {
      data: null,
      error: { message: fallbackResult.error?.message ?? 'Connessione al server Camion Chiaro non riuscita.' },
    }
  }
}

async function fetchDriverContextDirect() {
  if (!isSupabaseConfigured) return notConfiguredError()

  const sessionResult = await supabase.auth.getSession()
  const user = sessionResult.data?.session?.user

  if (!user?.id) {
    return { data: null, error: { message: 'Sessione autista scaduta. Fai login.' } }
  }

  const driverResult = await supabase
    .from('drivers')
    .select('id, company_id, username, auth_email, full_name, email, phone, profile_image_path, role, depot, status')
    .eq('user_id', user.id)
    .neq('status', 'archived')
    .limit(1)
    .maybeSingle()

  if (driverResult.error) return { data: null, error: driverResult.error }
  if (!driverResult.data) {
    const personResult = await supabase
      .from('company_people')
      .select('id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status')
      .eq('user_id', user.id)
      .neq('status', 'archived')
      .limit(1)
      .maybeSingle()

    if (isMissingWorkforceSchemaError(personResult.error)) {
      return {
        data: null,
        error: { message: 'Autista non collegato. Apri l anagrafica azienda e controlla che l account sia attivo.' },
      }
    }

    if (personResult.error) return { data: null, error: personResult.error }
    if (!personResult.data) {
      return {
        data: null,
        error: { message: 'Account non collegato. Apri l anagrafica azienda e controlla che l account sia attivo.' },
      }
    }

    return fetchCompanyPersonContextDirect(user, mapContextCompanyPerson(personResult.data))
  }

  const driver = driverResult.data
  const [
    companyResult,
    vehiclesResult,
    complianceResult,
    documentsResult,
    checksResult,
    faultsResult,
    personResult,
    peopleResult,
    teamThreadsResult,
    teamUnreadCountsResult,
  ] = await Promise.all([
    supabase
      .from('companies')
      .select('id, name, vat_number, headquarters, logo_path')
      .eq('id', driver.company_id)
      .maybeSingle(),
    supabase
      .from('vehicles')
      .select('id, plate, model, type, fleet_type, km, status')
      .eq('company_id', driver.company_id)
      .neq('status', 'archived')
      .order('plate', { ascending: true }),
    supabase
      .from('compliance_items')
      .select('id, type, scope, driver_id, vehicle_id, due_date, document_number, status')
      .eq('company_id', driver.company_id)
      .eq('driver_id', driver.id)
      .neq('status', 'archived')
      .order('due_date', { ascending: true }),
    supabase
      .from('driver_documents')
      .select('id, driver_id, type, document_number, expires_at, file_path, status, visible_to_driver')
      .eq('company_id', driver.company_id)
      .eq('driver_id', driver.id)
      .eq('visible_to_driver', true)
      .order('expires_at', { ascending: true, nullsFirst: false }),
    fetchVehicleChecksForDriver(driver.company_id, driver.id, 50),
    supabase
      .from('fault_reports')
      .select('id, company_id, driver_id, vehicle_id, semitrailer_id, severity, title, description, photo_path, status, created_at, updated_at')
      .eq('company_id', driver.company_id)
      .eq('driver_id', driver.id)
      .order('created_at', { ascending: false })
      .limit(50),
    fetchCurrentCompanyPerson(driver.company_id, user.id, driver.id),
    supabase
      .from('company_people')
      .select('id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status')
      .eq('company_id', driver.company_id)
      .neq('status', 'archived')
      .order('full_name', { ascending: true }),
    fetchTeamChatThreads(driver.company_id),
    fetchTeamUnreadCounts(driver.company_id),
  ])

  const firstError = [
    vehiclesResult.error,
    complianceResult.error,
    documentsResult.error,
    checksResult.error,
    faultsResult.error,
    personResult.error,
    isMissingWorkforceSchemaError(peopleResult.error) ? null : peopleResult.error,
    teamThreadsResult.error,
    teamUnreadCountsResult.error,
  ].find(Boolean)

  if (firstError) return { data: null, error: firstError }

  const companyProfile = companyResult.data
    ? mapCompanyProfile(companyResult.data)
    : { id: driver.company_id, logoPath: '', name: 'Azienda' }

  return {
    data: mapDriverContext({
      companyId: driver.company_id,
      companyProfile,
      complianceItems: (complianceResult.data ?? []).map(mapComplianceItem),
      currentPerson: personResult.data,
      documents: documentsResult.data ?? [],
      drivers: [driver],
      faultReports: faultsResult.data ?? [],
      people: isMissingWorkforceSchemaError(peopleResult.error)
        ? (personResult.data ? [personResult.data] : [])
        : (peopleResult.data ?? []),
      teamChatThreads: teamThreadsResult.data ?? [],
      unreadTeamMessages: Object.values(teamUnreadCountsResult.data ?? {}).reduce((total, count) => total + Number(count || 0), 0),
      unreadTeamMessagesByThreadId: teamUnreadCountsResult.data ?? {},
      vehicleChecks: checksResult.data ?? [],
      vehicles: vehiclesResult.data ?? [],
    }),
    error: null,
  }
}

async function fetchCompanyPersonContextDirect(user, person) {
  const companyId = person?.companyId
  if (!companyId || !user?.id) return { data: null, error: { message: 'Persona aziendale non collegata.' } }

  const [
    companyResult,
    peopleResult,
    complianceResult,
    teamThreadsResult,
    teamUnreadCountsResult,
  ] = await Promise.all([
    supabase
      .from('companies')
      .select('id, name, vat_number, headquarters, logo_path')
      .eq('id', companyId)
      .maybeSingle(),
    supabase
      .from('company_people')
      .select('id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status')
      .eq('company_id', companyId)
      .neq('status', 'archived')
      .order('full_name', { ascending: true }),
    supabase
      .from('compliance_items')
      .select('id, type, scope, driver_id, vehicle_id, person_id, asset_id, due_date, document_number, status')
      .eq('company_id', companyId)
      .eq('person_id', person.id)
      .neq('status', 'archived')
      .order('due_date', { ascending: true }),
    fetchTeamChatThreads(companyId),
    fetchTeamUnreadCounts(companyId),
  ])

  const firstError = [
    companyResult.error,
    isMissingWorkforceSchemaError(peopleResult.error) ? null : peopleResult.error,
    complianceResult.error,
    teamThreadsResult.error,
    teamUnreadCountsResult.error,
  ].find(Boolean)

  if (firstError) return { data: null, error: firstError }

  return {
    data: mapDriverContext({
      companyId,
      companyProfile: companyResult.data ? mapCompanyProfile(companyResult.data) : { id: companyId, logoPath: '', name: 'Azienda' },
      complianceItems: (complianceResult.data ?? []).map(mapComplianceItem),
      currentPerson: person,
      documents: [],
      drivers: [],
      faultReports: [],
      people: (peopleResult.data ?? []).map(mapContextCompanyPerson),
      teamChatThreads: teamThreadsResult.data ?? [],
      unreadTeamMessages: Object.values(teamUnreadCountsResult.data ?? {}).reduce((total, count) => total + Number(count || 0), 0),
      unreadTeamMessagesByThreadId: teamUnreadCountsResult.data ?? {},
      vehicleChecks: [],
      vehicles: [],
    }),
    error: null,
  }
}

export async function fetchCompanyContext() {
  if (!isSupabaseConfigured) return notConfiguredError()

  const sessionResult = await supabase.auth.getSession()
  const userId = sessionResult.data?.session?.user?.id

  if (!userId) {
    return { data: null, error: { message: 'Sessione azienda scaduta. Fai login.' } }
  }

  const membershipResult = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (membershipResult.error || !membershipResult.data?.company_id) {
    return {
      data: null,
      error: membershipResult.error ?? { message: 'Account azienda non collegato a nessuna azienda.' },
    }
  }

  const companyId = membershipResult.data.company_id
  await ensureDefaultTeamThreads(companyId)
  const [
    companyResult,
    driversResult,
    vehiclesResult,
    peopleResult,
    assetsResult,
    documentsResult,
    checksResult,
    faultsResult,
    complianceResult,
    unreadMessagesResult,
    chatThreadsResult,
    teamChatThreadsResult,
    chatMessagesResult,
    teamChatMessagesResult,
    teamUnreadCountsResult,
  ] = await Promise.all([
    supabase
      .from('companies')
      .select('id, name, vat_number, headquarters, logo_path')
      .eq('id', companyId)
      .maybeSingle(),
    supabase
      .from('drivers')
      .select('id, company_id, username, auth_email, full_name, email, phone, profile_image_path, role, depot, status')
      .eq('company_id', companyId)
      .neq('status', 'archived')
      .order('full_name', { ascending: true }),
    supabase
      .from('vehicles')
      .select('id, plate, model, type, fleet_type, km, status')
      .eq('company_id', companyId)
      .neq('status', 'archived')
      .order('plate', { ascending: true }),
    supabase
      .from('company_people')
      .select('id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status')
      .eq('company_id', companyId)
      .neq('status', 'archived')
      .order('full_name', { ascending: true }),
    supabase
      .from('company_assets')
      .select('id, company_id, asset_type, code, model, serial_number, location, status')
      .eq('company_id', companyId)
      .neq('status', 'archived')
      .order('code', { ascending: true }),
    supabase
      .from('driver_documents')
      .select('id, driver_id, type, document_number, expires_at, file_path, status, visible_to_driver')
      .eq('company_id', companyId)
      .order('expires_at', { ascending: true, nullsFirst: false }),
    fetchVehicleChecksForCompany(companyId, 30),
    supabase
      .from('fault_reports')
      .select('id, company_id, driver_id, vehicle_id, semitrailer_id, severity, title, description, photo_path, status, created_at, updated_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(30),
    fetchCompanyComplianceItems(companyId, 50),
    supabase
      .from('chat_messages')
      .select('thread_id', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('sender_role', 'driver')
      .is('read_by_company_at', null),
    supabase
      .from('chat_threads')
      .select(chatThreadSelect)
      .eq('company_id', companyId)
      .eq('context_type', 'general')
      .order('last_message_at', { ascending: false, nullsFirst: false }),
    fetchTeamChatThreads(companyId),
    supabase
      .from('chat_messages')
      .select(chatMessageSelect)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(120),
    supabase
      .from('team_chat_messages')
      .select(teamChatMessageSelect)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(120),
    fetchTeamUnreadCounts(companyId),
  ])

  const firstError = [
    companyResult.error,
    driversResult.error,
    vehiclesResult.error,
    isMissingWorkforceSchemaError(peopleResult.error) ? null : peopleResult.error,
    isMissingWorkforceSchemaError(assetsResult.error) ? null : assetsResult.error,
    documentsResult.error,
    checksResult.error,
    faultsResult.error,
    complianceResult.error,
    unreadMessagesResult.error,
    chatThreadsResult.error,
    chatMessagesResult.error,
    teamUnreadCountsResult.error,
  ].find(Boolean)

  if (firstError) return { data: null, error: firstError }
  const workforceSchemaReady = !isMissingWorkforceSchemaError(peopleResult.error) && !isMissingWorkforceSchemaError(assetsResult.error)

  const driverIdByThreadId = new Map(
    (chatThreadsResult.data ?? []).map((thread) => [thread.id, thread.driver_id]),
  )
  const unreadDriverMessagesByDriverId = (unreadMessagesResult.data ?? []).reduce((counts, message) => {
    const driverId = driverIdByThreadId.get(message.thread_id)
    if (!driverId) return counts
    return {
      ...counts,
      [driverId]: (counts[driverId] ?? 0) + 1,
    }
  }, {})

  return {
    data: {
      companyProfile: mapCompanyProfile(companyResult.data),
      assets: workforceSchemaReady ? (assetsResult.data ?? []).map(mapCompanyAsset) : [],
      chatMessages: (chatMessagesResult.data ?? []).map(mapChatMessage),
      chatThreads: (chatThreadsResult.data ?? []).map(mapChatThread),
      complianceItems: (complianceResult.data ?? []).map(mapComplianceItem),
      documents: (documentsResult.data ?? []).map(mapDriverDocument),
      drivers: (driversResult.data ?? []).map(mapDriver),
      faultReports: (faultsResult.data ?? []).map(mapFaultReport),
      membership: membershipResult.data,
      people: workforceSchemaReady ? (peopleResult.data ?? []).map(mapCompanyPerson) : [],
      teamChatMessages: teamChatMessagesResult.error
        ? []
        : (teamChatMessagesResult.data ?? []).map(mapTeamChatMessage),
      teamChatThreads: teamChatThreadsResult.error ? [] : (teamChatThreadsResult.data ?? []),
      unreadDriverMessages: unreadMessagesResult.count ?? 0,
      unreadDriverMessagesByDriverId,
      unreadTeamMessages: Object.values(teamUnreadCountsResult.data ?? {}).reduce((total, count) => total + Number(count || 0), 0),
      unreadTeamMessagesByThreadId: teamUnreadCountsResult.data ?? {},
      vehicleChecks: (checksResult.data ?? []).map(mapVehicleCheck),
      vehicles: (vehiclesResult.data ?? []).map(mapVehicle),
      workforceSchemaReady,
    },
    error: null,
  }
}

export async function fetchDriverChat({ companyId, driverId }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId || !driverId) return { data: { messages: [], thread: null }, error: null }

  const { data: threadData, error: threadError } = await supabase
    .from('chat_threads')
    .select(chatThreadSelect)
    .eq('company_id', companyId)
    .eq('driver_id', driverId)
    .eq('context_type', 'general')
    .maybeSingle()

  if (threadError) return { data: null, error: threadError }
  if (!threadData) return { data: { messages: [], thread: null }, error: null }

  const { data: messageData, error: messageError } = await supabase
    .from('chat_messages')
    .select(chatMessageSelect)
    .eq('company_id', companyId)
    .eq('thread_id', threadData.id)
    .order('created_at', { ascending: true })

  if (messageError) return { data: null, error: messageError }

  return {
    data: {
      messages: (messageData ?? []).map(mapChatMessage),
      thread: mapChatThread(threadData),
    },
    error: null,
  }
}

export async function fetchCompanyDriverChat({ companyId, driverId }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId || !driverId) return { data: { messages: [], thread: null }, error: null }

  const threadResult = await ensureChatThread({ companyId, driverId })
  if (threadResult.error || !threadResult.data) return threadResult

  const { data: messageData, error: messageError } = await supabase
    .from('chat_messages')
    .select(chatMessageSelect)
    .eq('company_id', companyId)
    .eq('thread_id', threadResult.data.id)
    .order('created_at', { ascending: true })

  if (messageError) return { data: null, error: messageError }

  return {
    data: {
      messages: (messageData ?? []).map(mapChatMessage),
      thread: threadResult.data,
    },
    error: null,
  }
}

async function ensureChatThread({ companyId, driverId, threadId }) {
  if (threadId) {
    return {
      data: {
        companyId,
        driverId,
        id: threadId,
      },
      error: null,
    }
  }

  const { data: existingData, error: existingError } = await supabase
    .from('chat_threads')
    .select(chatThreadSelect)
    .eq('company_id', companyId)
    .eq('driver_id', driverId)
    .eq('context_type', 'general')
    .maybeSingle()

  if (existingError) return { data: null, error: existingError }
  if (existingData) return { data: mapChatThread(existingData), error: null }

  const { data, error } = await supabase
    .from('chat_threads')
    .insert({
      company_id: companyId,
      context_type: 'general',
      driver_id: driverId,
      title: 'Chat autista',
    })
    .select(chatThreadSelect)
    .single()

  if (error?.code === '23505') {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('chat_threads')
      .select(chatThreadSelect)
      .eq('company_id', companyId)
      .eq('driver_id', driverId)
      .eq('context_type', 'general')
      .maybeSingle()

    return { data: fallbackData ? mapChatThread(fallbackData) : null, error: fallbackError }
  }

  return { data: data ? mapChatThread(data) : null, error }
}

async function uploadChatAttachment({ attachment, companyId, threadId }) {
  if (!attachment?.uri) return { data: '', error: null }

  const cleanFileName = sanitizeFileName(attachment.name ?? `allegato-${Date.now()}`)
  const filePath = `${companyId}/chat/${threadId}/${Date.now()}-${cleanFileName}`
  const fileBody = await getFileBodyFromUri(attachment.uri)
  const { error } = await supabase.storage.from(companyAssetsBucket).upload(filePath, fileBody, {
    cacheControl: '3600',
    contentType: attachment.type || 'application/octet-stream',
    upsert: false,
  })

  if (error) return { data: '', error }
  return { data: filePath, error: null }
}

export async function sendChatMessage({ attachment = null, body, companyId, driverId, threadId }) {
  if (!isSupabaseConfigured) return notConfiguredError()

  const threadResult = await ensureChatThread({ companyId, driverId, threadId })
  if (threadResult.error || !threadResult.data) return threadResult

  const uploadResult = await uploadChatAttachment({
    attachment,
    companyId,
    threadId: threadResult.data.id,
  })

  if (uploadResult.error) return { data: null, error: uploadResult.error }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      attachment_path: uploadResult.data || null,
      body,
      company_id: companyId,
      sender_role: 'driver',
      thread_id: threadResult.data.id,
    })
    .select(chatMessageSelect)
    .single()

  if (error && uploadResult.data) {
    await supabase.storage.from(companyAssetsBucket).remove([uploadResult.data])
  }

  if (error) return { data: null, error }

  return {
    data: {
      message: mapChatMessage(data),
      thread: threadResult.data,
    },
    error: null,
  }
}

export async function sendCompanyChatMessage({ attachment = null, body, companyId, driverId, threadId }) {
  if (!isSupabaseConfigured) return notConfiguredError()

  const threadResult = await ensureChatThread({ companyId, driverId, threadId })
  if (threadResult.error || !threadResult.data) return threadResult

  const uploadResult = await uploadChatAttachment({
    attachment,
    companyId,
    threadId: threadResult.data.id,
  })

  if (uploadResult.error) return { data: null, error: uploadResult.error }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      attachment_path: uploadResult.data || null,
      body,
      company_id: companyId,
      sender_role: 'company',
      thread_id: threadResult.data.id,
    })
    .select(chatMessageSelect)
    .single()

  if (error && uploadResult.data) {
    await supabase.storage.from(companyAssetsBucket).remove([uploadResult.data])
  }

  if (error) return { data: null, error }

  return {
    data: {
      message: mapChatMessage(data),
      thread: threadResult.data,
    },
    error: null,
  }
}

export async function fetchTeamChat({ companyId, threadId }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId || !threadId) return { data: { messages: [], thread: null }, error: null }

  const [threadResult, initialMessageResult] = await Promise.all([
    supabase
      .from('team_chat_threads')
      .select(teamChatThreadSelect)
      .eq('company_id', companyId)
      .eq('id', threadId)
      .maybeSingle(),
    supabase
      .from('team_chat_messages')
      .select(teamChatMessageSelect)
      .eq('company_id', companyId)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true }),
  ])
  let messageResult = initialMessageResult

  if (initialMessageResult.error?.code === '42703' || initialMessageResult.error?.code === 'PGRST204') {
    messageResult = await supabase
      .from('team_chat_messages')
      .select(teamChatMessageLegacySelect)
      .eq('company_id', companyId)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
  }

  const error = threadResult.error || messageResult.error
  if (isMissingWorkforceSchemaError(error)) {
    return {
      data: null,
      error: { message: 'Per usare chat gruppi/reparti esegui il file SQL 31 in Supabase.' },
    }
  }
  if (error) return { data: null, error }

  const messageRows = messageResult.data ?? []
  let readCountsByMessageId = {}

  if (messageRows.length) {
    const readsResult = await supabase
      .from('team_chat_message_reads')
      .select('message_id')
      .in('message_id', messageRows.map((message) => message.id))

    if (!isMissingWorkforceSchemaError(readsResult.error) && !readsResult.error) {
      readCountsByMessageId = (readsResult.data ?? []).reduce((counts, row) => ({
        ...counts,
        [row.message_id]: (counts[row.message_id] ?? 0) + 1,
      }), {})
    }
  }

  return {
    data: {
      messages: messageRows.map((row) => mapTeamChatMessage({
        ...row,
        read_count: readCountsByMessageId[row.id] ?? 0,
      })),
      thread: threadResult.data ? mapTeamChatThread(threadResult.data) : null,
    },
    error: null,
  }
}

export async function fetchTeamUnreadCounts(companyId) {
  if (!isSupabaseConfigured || !companyId) return { data: {}, error: null }

  const { data, error } = await supabase.rpc('get_team_thread_unread_counts', {
    target_company_id: companyId,
  })

  if (error?.code === '42883' || error?.code === 'PGRST202') {
    return { data: {}, error: null }
  }

  if (isMissingWorkforceSchemaError(error)) {
    return { data: {}, error: null }
  }

  if (error) return { data: {}, error }

  return {
    data: (data ?? []).reduce((counts, row) => ({
      ...counts,
      [row.thread_id ?? row.threadId]: Number(row.unread_count ?? row.unreadCount ?? 0),
    }), {}),
    error: null,
  }
}

export async function markTeamThreadRead(threadId) {
  if (!isSupabaseConfigured || !threadId) return { data: 0, error: null }

  const { data, error } = await supabase.rpc('mark_team_thread_read', {
    target_thread_id: threadId,
  })

  if (error?.code === '42883' || error?.code === 'PGRST202') {
    return { data: 0, error: null }
  }

  if (isMissingWorkforceSchemaError(error)) {
    return { data: 0, error: null }
  }

  return { data: Number(data ?? 0), error }
}

export async function sendTeamChatMessage({
  attachment = null,
  body,
  companyId,
  senderPersonId = '',
  senderRole = 'company',
  threadId,
}) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId || !threadId) return { data: null, error: { message: 'Gruppo chat mancante.' } }

  const uploadResult = await uploadChatAttachment({
    attachment,
    companyId,
    threadId,
  })

  if (uploadResult.error) return { data: null, error: uploadResult.error }

  const payload = {
    attachment_path: uploadResult.data || null,
    body,
    company_id: companyId,
    sender_person_id: senderPersonId || null,
    sender_role: senderRole,
    thread_id: threadId,
  }

  let { data, error } = await supabase
    .from('team_chat_messages')
    .insert(payload)
    .select(teamChatMessageSelect)
    .single()

  if (error?.code === '42703' || error?.code === 'PGRST204') {
    const fallbackResult = await supabase
      .from('team_chat_messages')
      .insert(payload)
      .select(teamChatMessageLegacySelect)
      .single()
    data = fallbackResult.data
    error = fallbackResult.error
  }

  if (error && uploadResult.data) {
    await supabase.storage.from(companyAssetsBucket).remove([uploadResult.data])
  }

  if (isMissingWorkforceSchemaError(error)) {
    return {
      data: null,
      error: { message: 'Per usare chat gruppi/reparti esegui il file SQL 31 in Supabase.' },
    }
  }

  if (error) return { data: null, error }

  return {
    data: {
      message: mapTeamChatMessage(data),
      thread: { companyId, id: threadId },
    },
    error: null,
  }
}

export async function updateChatMessageReaction(message, actorRole, reaction) {
  if (!isSupabaseConfigured || !message?.id || !['company', 'driver'].includes(actorRole)) {
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
    .select(chatMessageSelect)
    .single()

  if (error?.code === '42703') {
    return {
      data: null,
      error: { message: 'Manca SQL reazioni chat. Esegui il file 19_chat_reazioni.sql in Supabase.' },
    }
  }

  return { data: data ? mapChatMessage(data) : null, error }
}

export async function markChatMessagesRead(threadId, readerRole) {
  if (!isSupabaseConfigured || !threadId || !['company', 'driver'].includes(readerRole)) {
    return { data: [], error: null }
  }

  const accessToken = await getAccessToken()

  if (apiBaseUrl && accessToken) {
    try {
      const response = await fetch(`${apiBaseUrl}/.netlify/functions/mark-chat-read`, {
        body: JSON.stringify({ readerRole, threadId }),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      const payload = await response.json().catch(() => ({}))

      if (response.ok) {
        return { data: payload.messages ?? [], error: null }
      }

      if (response.status !== 404) {
        return { data: [], error: { message: payload.error ?? 'Lettura chat non aggiornata.' } }
      }
    } catch {
      // Fall back to direct Supabase update for local development.
    }
  }

  const timestampColumn = readerRole === 'company' ? 'read_by_company_at' : 'read_by_driver_at'
  const senderRole = readerRole === 'company' ? 'driver' : 'company'
  let { data, error } = await supabase
    .from('chat_messages')
    .update({ [timestampColumn]: new Date().toISOString() })
    .eq('thread_id', threadId)
    .eq('sender_role', senderRole)
    .is(timestampColumn, null)
    .select(chatMessageSelect)

  if (error?.code === '42703') {
    const fallbackResult = await supabase
      .from('chat_messages')
      .update({ [timestampColumn]: new Date().toISOString() })
      .eq('thread_id', threadId)
      .eq('sender_role', senderRole)
      .is(timestampColumn, null)
      .select(chatMessageSelectWithoutReactions)

    data = fallbackResult.data
    error = fallbackResult.error
  }

  return { data: (data ?? []).map(mapChatMessage), error }
}

export async function createCompanyAssetSignedUrl(filePath) {
  if (!isSupabaseConfigured || !filePath) return { data: null, error: null }
  return supabase.storage.from(companyAssetsBucket).createSignedUrl(filePath, 3600)
}

export async function createDriverDocumentSignedUrl(filePath) {
  if (!isSupabaseConfigured || !filePath) return { data: null, error: null }
  return supabase.storage.from(driverDocumentsBucket).createSignedUrl(filePath, 600)
}

export async function updateFaultReportStatus(reportId, status) {
  if (!isSupabaseConfigured || !reportId) return { data: null, error: null }

  const accessToken = await getAccessToken()

  if (apiBaseUrl && accessToken) {
    try {
      const response = await fetch(`${apiBaseUrl}/.netlify/functions/update-fault`, {
        body: JSON.stringify({ reportId, status }),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      const payload = await response.json().catch(() => ({}))

      if (response.ok) {
        return { data: payload.report ? mapFaultReport(payload.report) : null, error: null }
      }

      if (response.status !== 404) {
        return { data: null, error: { message: payload.error ?? 'Aggiornamento guasto non riuscito.' } }
      }
    } catch {
      // Fall back to the direct Supabase update for Expo previews.
    }
  }

  const { data, error } = await supabase
    .from('fault_reports')
    .update({ status })
    .eq('id', reportId)
    .select('id, company_id, driver_id, vehicle_id, semitrailer_id, severity, title, description, photo_path, status, created_at, updated_at')
    .single()

  return { data: data ? mapFaultReport(data) : null, error }
}

export async function updateVehicleCheckStatus(checkId, status) {
  if (!isSupabaseConfigured || !checkId) return { data: null, error: null }

  const sessionResult = await supabase.auth.getSession()
  const userId = sessionResult.data?.session?.user?.id ?? null
  const payload = {
    status,
    resolved_at: status === 'resolved' ? new Date().toISOString() : null,
    resolved_by: status === 'resolved' ? userId : null,
  }

  const { data, error } = await supabase
    .from('vehicle_checks')
    .update(payload)
    .eq('id', checkId)
    .select(vehicleCheckSelect)
    .single()

  if (error?.code === '42703') {
    return {
      data: null,
      error: { message: 'Manca SQL stato check. Esegui il file 29_stato_check_risolti.sql in Supabase.' },
    }
  }

  return { data: data ? mapVehicleCheck(data) : null, error }
}

export function subscribeToDriverChatMessages({ companyId, onMessage }) {
  if (!isSupabaseConfigured || !companyId) return () => {}

  const channel = supabase
    .channel(`driver-chat-messages-${companyId}`)
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

export function subscribeToTeamChatMessages({ companyId, onMessage }) {
  if (!isSupabaseConfigured || !companyId) return () => {}

  const channel = supabase
    .channel(`team-chat-messages-${companyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        filter: `company_id=eq.${companyId}`,
        schema: 'public',
        table: 'team_chat_messages',
      },
      (payload) => {
        if (payload.new) onMessage?.(mapTeamChatMessage(payload.new), payload)
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        filter: `company_id=eq.${companyId}`,
        schema: 'public',
        table: 'team_chat_threads',
      },
      (_payload) => {
        onMessage?.(null, _payload)
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        filter: `company_id=eq.${companyId}`,
        schema: 'public',
        table: 'team_chat_message_reads',
      },
      (_payload) => {
        onMessage?.(null, _payload)
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToOperationalUpdates({ companyId, driverId, handlers = {} }) {
  if (!isSupabaseConfigured || !companyId) return () => {}

  function shouldNotifyDriver(row) {
    return !driverId || row?.driver_id === driverId
  }

  function handleVehicleCheck(payload) {
    const row = payload.new
    if (!row || !shouldNotifyDriver(row)) return
    const check = mapVehicleCheck(row)
    handlers.onVehicleCheck?.(check, payload)
    handlers.onChange?.({ item: check, payload, type: 'vehicle_check' })
  }

  function handleFaultReport(payload) {
    const row = payload.new
    if (!row || !shouldNotifyDriver(row)) return
    const fault = mapFaultReport(row)
    handlers.onFaultReport?.(fault, payload)
    handlers.onChange?.({ item: fault, payload, type: 'fault_report' })
  }

  const channel = supabase
    .channel(`operations-${companyId}-${driverId || 'company'}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        filter: `company_id=eq.${companyId}`,
        schema: 'public',
        table: 'vehicle_checks',
      },
      handleVehicleCheck,
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        filter: `company_id=eq.${companyId}`,
        schema: 'public',
        table: 'fault_reports',
      },
      handleFaultReport,
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToDriverPresence({ actor, companyId, handlers = {} }) {
  if (!isSupabaseConfigured || !companyId || !actor?.actorId) {
    return {
      cleanup: () => {},
      sendTyping: () => {},
    }
  }

  const actorRole = actor.actorRole === 'company' ? 'company' : 'driver'
  const clientId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  const channel = supabase
    .channel(`chat-presence-${companyId}`, {
      config: {
        presence: {
          key: `${actorRole}:${actor.actorId}:${clientId}`,
        },
      },
    })
    .on('presence', { event: 'sync' }, () => {
      const presences = Object.values(channel.presenceState())
        .flat()
        .filter((presence) => presence?.actorId && presence?.actorRole)

      handlers.onPresenceChange?.(presences)
    })
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (!payload?.actorId) return
      if (payload.actorId === actor.actorId && payload.actorRole === actorRole) return
      handlers.onTyping?.(payload)
    })
    .subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return
      await channel.track({
        actorId: actor.actorId,
        actorName: actor.actorName ?? '',
        actorRole,
        lastSeenAt: new Date().toISOString(),
        onlineAt: new Date().toISOString(),
      })
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
          actorId: actor.actorId,
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

export async function createDriverDocument({ documentNumber = '', expiresAt = null, type }) {
  if (!isSupabaseConfigured) return notConfiguredError()

  const { data, error } = await supabase.rpc('create_driver_document_for_current_driver', {
    document_expires_at: expiresAt || null,
    document_number: documentNumber || null,
    document_type: type,
  })

  return { data, error }
}

export async function createCompanyDriverAccount({ companyId, driver, password }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!apiBaseUrl) {
    return {
      data: null,
      error: { message: 'Configura EXPO_PUBLIC_API_BASE_URL con il sito Netlify.' },
    }
  }

  const accessToken = await getAccessToken()

  if (!accessToken) {
    return { data: null, error: { message: 'Sessione azienda scaduta. Fai login.' } }
  }

  try {
    const response = await fetch(`${apiBaseUrl}/.netlify/functions/create-driver`, {
      body: JSON.stringify({ companyId, driver, password }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { data: null, error: { message: payload.error ?? 'Creazione autista non riuscita.' } }
    }

    return { data: payload.driver ? mapDriver(payload.driver) : null, error: null }
  } catch {
    return {
      data: null,
      error: { message: 'Server Camion Chiaro non raggiungibile. Controlla il deploy Netlify.' },
    }
  }
}

export async function createCompanyVehicle({ companyId, vehicle }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId) return { data: null, error: { message: 'Azienda non trovata.' } }

  const { data, error } = await supabase
    .from('vehicles')
    .insert(toCompanyVehiclePayload(vehicle, companyId))
    .select('id, plate, model, type, fleet_type, km, status')
    .single()

  return { data: data ? mapVehicle(data) : null, error }
}

export async function createCompanyPerson({ companyId, person }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId) return { data: null, error: { message: 'Azienda non trovata.' } }

  const password = String(person.password ?? '').trim()
  if (apiBaseUrl && password) {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return { data: null, error: { message: 'Sessione azienda scaduta. Fai login.' } }
    }

    try {
      const response = await fetch(`${apiBaseUrl}/.netlify/functions/create-person`, {
        body: JSON.stringify({ companyId, password, person }),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        return { data: null, error: { message: payload.error ?? 'Creazione persona non riuscita.' } }
      }

      return { data: payload.person ? mapCompanyPerson(payload.person) : null, error: null }
    } catch {
      return {
        data: null,
        error: { message: 'Server Camion Chiaro non raggiungibile. Controlla il deploy Netlify.' },
      }
    }
  }

  const payload = toCompanyPersonPayload(person, companyId)
  if (!payload.full_name) return { data: null, error: { message: 'Nome persona obbligatorio.' } }

  const { data, error } = await supabase
    .from('company_people')
    .insert(payload)
    .select('id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status')
    .single()

  if (isMissingWorkforceSchemaError(error)) {
    return { data: null, error: workforceSchemaError() }
  }

  return { data: data ? mapCompanyPerson(data) : null, error }
}

export async function ensureDirectTeamThread({ companyId, personId }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId || !personId) return { data: null, error: { message: 'Persona mancante.' } }

  const { data, error } = await supabase.rpc('ensure_direct_team_thread', {
    target_company_id: companyId,
    target_person_id: personId,
  })

  if (error?.code === '42883' || error?.code === 'PGRST202') {
    return {
      data: null,
      error: { message: 'Manca SQL chat dirette personale. Esegui il file 32_chat_dirette_personale.sql in Supabase.' },
    }
  }

  if (isMissingWorkforceSchemaError(error)) {
    return { data: null, error: workforceSchemaError() }
  }

  return { data: data ? mapTeamChatThread(data) : null, error }
}

export async function createCompanyWarehouseAsset({ asset, companyId }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId) return { data: null, error: { message: 'Azienda non trovata.' } }

  const payload = toCompanyAssetPayload(asset, companyId)
  if (!payload.code) return { data: null, error: { message: 'Codice attrezzatura obbligatorio.' } }

  const { data, error } = await supabase
    .from('company_assets')
    .insert(payload)
    .select('id, company_id, asset_type, code, model, serial_number, location, status')
    .single()

  if (isMissingWorkforceSchemaError(error)) {
    return { data: null, error: workforceSchemaError() }
  }

  return { data: data ? mapCompanyAsset(data) : null, error }
}

export async function createCompanyComplianceItem({ companyId, file = null, item }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId) return { data: null, error: { message: 'Azienda non trovata.' } }

  let filePath = ''
  let fileBody = null

  if (file?.uri) {
    const cleanFileName = sanitizeFileName(file.name ?? `scadenza-${Date.now()}`)
    const subjectId = item.assigneeId || 'azienda'
    filePath = `${companyId}/compliance/${item.scope}/${subjectId}/${Date.now()}-${cleanFileName}`
    fileBody = await getFileBodyFromUri(file.uri)

    const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(filePath, fileBody, {
      cacheControl: '3600',
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

    if (uploadError) return { data: null, error: uploadError }
  }

  let { data, error } = await supabase
    .from('compliance_items')
    .insert(toComplianceItemPayload({ ...item, filePath }, companyId))
    .select('id, type, scope, driver_id, vehicle_id, person_id, asset_id, due_date, document_number, status, file_bucket, file_path')
    .single()

  if (isMissingWorkforceSchemaError(error) && ['person', 'asset'].includes(item.scope)) {
    if (filePath) await supabase.storage.from(companyAssetsBucket).remove([filePath])
    return { data: null, error: workforceSchemaError() }
  }

  if (error?.code === 'PGRST204') {
    const fallbackResult = await supabase
      .from('compliance_items')
      .insert(toLegacyComplianceItemPayload({ ...item, filePath }, companyId))
      .select('id, type, scope, driver_id, vehicle_id, due_date, document_number, status, file_bucket, file_path')
      .single()

    data = fallbackResult.data
    error = fallbackResult.error
  }

  if (error?.code === '42703') {
    if (filePath) {
      await supabase.storage.from(companyAssetsBucket).remove([filePath])
      return {
        data: null,
        error: { message: 'Manca SQL allegati scadenze. Esegui il file 27_scadenze_file_allegati.sql in Supabase.' },
      }
    }

    const fallbackResult = await supabase
      .from('compliance_items')
      .insert(toLegacyComplianceItemPayload(item, companyId))
      .select('id, type, scope, driver_id, vehicle_id, due_date, document_number, status')
      .single()

    data = fallbackResult.data
    error = fallbackResult.error
  }

  if (error && filePath) {
    await supabase.storage.from(companyAssetsBucket).remove([filePath])
  }

  if (!error && filePath) {
    await registerCompanyStorageFile({
      bucket: companyAssetsBucket,
      category: 'document',
      companyId,
      filePath,
      sizeBytes: fileBody?.byteLength ?? 0,
    })
  }

  return { data: data ? mapComplianceItem(data) : null, error }
}

export async function renewCompanyComplianceItem({ companyId, file = null, item, updates }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId || !item?.id) return { data: null, error: { message: 'Scadenza mancante.' } }

  let filePath = ''
  let fileBody = null
  let uploadedFileName = ''
  let uploadedFileType = ''

  if (file?.uri) {
    const cleanFileName = sanitizeFileName(file.name ?? `scadenza-${Date.now()}`)
    uploadedFileName = cleanFileName
    uploadedFileType = file.type || 'application/octet-stream'
    const subjectId = item.driverId || item.vehicleId || item.personId || item.assetId || 'azienda'
    filePath = `${companyId}/compliance/${item.scope}/${subjectId}/${Date.now()}-${cleanFileName}`
    fileBody = await getFileBodyFromUri(file.uri)

    const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(filePath, fileBody, {
      cacheControl: '3600',
      contentType: uploadedFileType,
      upsert: false,
    })

    if (uploadError) return { data: null, error: uploadError }
  }

  const payload = {
    document_number: updates.documentNumber || null,
    due_date: updates.dueDate,
    owner: updates.owner || null,
    status: 'open',
    type: updates.type,
  }

  if (filePath) {
    payload.file_bucket = companyAssetsBucket
    payload.file_path = filePath
  }

  let { data, error } = await supabase
    .from('compliance_items')
    .update(payload)
    .eq('company_id', companyId)
    .eq('id', item.id)
    .select('id, type, scope, driver_id, vehicle_id, person_id, asset_id, due_date, document_number, status, file_bucket, file_path')
    .single()

  if (error?.code === '42703' && filePath) {
    await supabase.storage.from(companyAssetsBucket).remove([filePath])
    return {
      data: null,
      error: { message: 'Manca SQL allegati scadenze. Esegui il file 27_scadenze_file_allegati.sql in Supabase.' },
    }
  }

  if (error?.code === 'PGRST204' || error?.code === '42703') {
    const fallbackPayload = {
      document_number: updates.documentNumber || null,
      due_date: updates.dueDate,
      owner: updates.owner || null,
      status: 'open',
      type: updates.type,
    }
    const fallbackResult = await supabase
      .from('compliance_items')
      .update(fallbackPayload)
      .eq('company_id', companyId)
      .eq('id', item.id)
      .select('id, type, scope, driver_id, vehicle_id, due_date, document_number, status')
      .single()

    data = fallbackResult.data
    error = fallbackResult.error
  }

  if (error && filePath) {
    await supabase.storage.from(companyAssetsBucket).remove([filePath])
  }

  if (!error && filePath) {
    await registerCompanyStorageFile({
      bucket: companyAssetsBucket,
      category: 'document',
      companyId,
      filePath,
      sizeBytes: fileBody?.byteLength ?? 0,
    })
  }

  if (!error && item.scope === 'driver' && item.driverId) {
    const documentsResult = await supabase
      .from('driver_documents')
      .select('id, type, document_number, expires_at, file_path, status')
      .eq('company_id', companyId)
      .eq('driver_id', item.driverId)

    if (documentsResult.error) {
      return { data: null, error: documentsResult.error }
    }

    let targetDocument = findMatchingDriverDocument(documentsResult.data ?? [], item, updates)
    let driverDocumentFilePath = ''

    if (!targetDocument) {
      const insertResult = await supabase
        .from('driver_documents')
        .insert({
          company_id: companyId,
          document_number: updates.documentNumber || null,
          driver_id: item.driverId,
          expires_at: updates.dueDate || null,
          status: getDocumentStatusFromExpiry(updates.dueDate, ''),
          type: updates.type,
          visible_to_driver: true,
        })
        .select('id, type, document_number, expires_at, file_path, status')
        .single()

      if (insertResult.error) return { data: null, error: insertResult.error }
      targetDocument = insertResult.data
    }

    if (file?.uri && fileBody) {
      driverDocumentFilePath = `${companyId}/${item.driverId}/${targetDocument.id}/${Date.now()}-${uploadedFileName || sanitizeFileName(file.name ?? 'documento')}`
      const { error: documentUploadError } = await supabase.storage.from(driverDocumentsBucket).upload(driverDocumentFilePath, fileBody, {
        cacheControl: '3600',
        contentType: uploadedFileType || file.type || 'application/octet-stream',
        upsert: false,
      })

      if (documentUploadError) return { data: null, error: documentUploadError }
    }

    const nextFilePath = driverDocumentFilePath || targetDocument.file_path || ''
    const updateResult = await supabase
      .from('driver_documents')
      .update({
        document_number: updates.documentNumber || null,
        expires_at: updates.dueDate || null,
        file_path: nextFilePath || null,
        status: getDocumentStatusFromExpiry(updates.dueDate, nextFilePath),
        type: updates.type,
        visible_to_driver: true,
      })
      .eq('company_id', companyId)
      .eq('id', targetDocument.id)
      .select('id')
      .single()

    if (updateResult.error) {
      if (driverDocumentFilePath) await supabase.storage.from(driverDocumentsBucket).remove([driverDocumentFilePath])
      return { data: null, error: updateResult.error }
    }

    if (driverDocumentFilePath) {
      await registerCompanyStorageFile({
        bucket: driverDocumentsBucket,
        category: 'document',
        companyId,
        documentId: targetDocument.id,
        driverId: item.driverId,
        filePath: driverDocumentFilePath,
        sizeBytes: fileBody?.byteLength ?? 0,
      })
    }
  }

  return { data: data ? mapComplianceItem(data) : null, error }
}

export async function updateCompanyComplianceItemStatus({ companyId, itemId, status }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId || !itemId || !status) return { data: null, error: { message: 'Scadenza mancante.' } }

  let { data, error } = await supabase
    .from('compliance_items')
    .update({ status })
    .eq('company_id', companyId)
    .eq('id', itemId)
    .select('id, type, scope, driver_id, vehicle_id, person_id, asset_id, due_date, document_number, status, file_bucket, file_path')
    .single()

  if (isMissingWorkforceSchemaError(error)) {
    const fallbackResult = await supabase
      .from('compliance_items')
      .update({ status })
      .eq('company_id', companyId)
      .eq('id', itemId)
      .select('id, type, scope, driver_id, vehicle_id, due_date, document_number, status')
      .single()

    data = fallbackResult.data
    error = fallbackResult.error
  }

  return { data: data ? mapComplianceItem(data) : null, error }
}

export async function uploadDriverDocumentFile({ companyId, documentId, driverId, file }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId || !documentId || !driverId || !file?.uri) {
    return { data: null, error: { message: 'Documento o file mancante.' } }
  }

  const cleanFileName = sanitizeFileName(file.name ?? `documento-${Date.now()}`)
  const filePath = `${companyId}/${driverId}/${documentId}/${Date.now()}-${cleanFileName}`
  const fileBody = await getFileBodyFromUri(file.uri)

  const { error: uploadError } = await supabase.storage.from(driverDocumentsBucket).upload(filePath, fileBody, {
    cacheControl: '3600',
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })

  if (uploadError) return { data: null, error: uploadError }

  const { data, error } = await supabase.rpc('set_driver_document_file', {
    target_document_id: documentId,
    uploaded_file_path: filePath,
  })

  if (error) {
    await supabase.storage.from(driverDocumentsBucket).remove([filePath])
  }

  return { data, error }
}

export async function renewDriverDocument({ companyId, document, driverId, file = null, updates = {} }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId || !document?.id || !driverId) {
    return { data: null, error: { message: 'Documento mancante.' } }
  }

  let filePath = ''
  let fileBody = null

  if (file?.uri) {
    const cleanFileName = sanitizeFileName(file.name ?? `documento-${Date.now()}`)
    filePath = `${companyId}/${driverId}/${document.id}/${Date.now()}-${cleanFileName}`
    fileBody = await getFileBodyFromUri(file.uri)

    const { error: uploadError } = await supabase.storage.from(driverDocumentsBucket).upload(filePath, fileBody, {
      cacheControl: '3600',
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

    if (uploadError) return { data: null, error: uploadError }
  }

  const { data, error } = await supabase.rpc('renew_driver_document', {
    document_expires_at: updates.expiresAt || null,
    document_number: updates.documentNumber ?? null,
    document_type: updates.type ?? null,
    target_document_id: document.id,
    uploaded_file_path: filePath || null,
  })

  if (error && filePath) {
    await supabase.storage.from(driverDocumentsBucket).remove([filePath])
  }

  if (error?.code === '42883' || error?.code === 'PGRST202') {
    return {
      data: null,
      error: { message: 'Manca SQL rinnovo documenti. Esegui il file 37_rinnovo_documenti_autista.sql in Supabase.' },
    }
  }

  if (!error && filePath) {
    await registerCompanyStorageFile({
      bucket: driverDocumentsBucket,
      category: 'document',
      companyId,
      documentId: document.id,
      driverId,
      filePath,
      sizeBytes: fileBody?.byteLength ?? 0,
    })
  }

  return { data, error }
}

export async function uploadDriverProfileImage({ companyId, driverId, file }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId || !driverId || !file?.uri) {
    return { data: null, error: { message: 'Foto profilo mancante.' } }
  }

  const cleanFileName = sanitizeFileName(file.name ?? `profilo-${Date.now()}.jpg`)
  const filePath = `${companyId}/drivers/${driverId}/profile/${Date.now()}-${cleanFileName}`
  const fileBody = await getFileBodyFromUri(file.uri)

  const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(filePath, fileBody, {
    cacheControl: '3600',
    contentType: file.type || 'image/jpeg',
    upsert: false,
  })

  if (uploadError) return { data: null, error: uploadError }

  const { data, error } = await supabase.rpc('set_driver_profile_image_file', {
    target_driver_id: driverId,
    uploaded_file_path: filePath,
  })

  if (error) {
    await supabase.storage.from(companyAssetsBucket).remove([filePath])
  }

  return { data, error }
}

export async function createVehicleCheck(payload) {
  if (!isSupabaseConfigured) return notConfiguredError()

  const { data, error } = await supabase
    .from('vehicle_checks')
    .insert({
      company_id: payload.companyId,
      documents_on_board: Boolean(payload.documentsOnBoard),
      driver_id: payload.driverId,
      lights_ok: Boolean(payload.lightsOk),
      notes: payload.notes || null,
      odometer_km: Number(payload.odometerKm) || 0,
      semitrailer_id: payload.semitrailerId || null,
      tires_ok: Boolean(payload.tiresOk),
      tractor_id: payload.tractorId,
    })
    .select(vehicleCheckSelect)
    .single()

  return { data: data ? mapVehicleCheck(data) : null, error }
}

export async function createFaultReport(payload) {
  if (!isSupabaseConfigured) return notConfiguredError()

  let photoPath = ''

  if (payload.photo?.uri) {
    const cleanFileName = sanitizeFileName(payload.photo.name ?? `guasto-${Date.now()}.jpg`)
    photoPath = `${payload.companyId}/faults/${payload.driverId}/${Date.now()}-${cleanFileName}`
    const fileBody = await getFileBodyFromUri(payload.photo.uri)
    const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(photoPath, fileBody, {
      cacheControl: '3600',
      contentType: payload.photo.type || 'image/jpeg',
      upsert: false,
    })

    if (uploadError) return { data: null, error: uploadError }
  }

  const { data, error } = await supabase
    .from('fault_reports')
    .insert({
      company_id: payload.companyId,
      description: payload.description || '',
      driver_id: payload.driverId,
      photo_path: photoPath || null,
      semitrailer_id: payload.semitrailerId || null,
      severity: payload.severity || 'medium',
      title: payload.title,
      vehicle_id: payload.vehicleId,
    })
    .select('id, company_id, driver_id, vehicle_id, semitrailer_id, severity, title, description, photo_path, status, created_at, updated_at')
    .single()

  if (error && photoPath) {
    await supabase.storage.from(companyAssetsBucket).remove([photoPath])
  }

  return { data: data ? mapFaultReport(data) : null, error }
}
