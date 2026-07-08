import { File } from 'expo-file-system'
import { apiBaseUrl, driverAuthDomain, isSupabaseConfigured, supabase } from './supabaseClient'
import {
  mapChatMessage,
  mapChatThread,
  mapCompanyAnnouncement,
  mapCompanyPerson as mapContextCompanyPerson,
  mapCostEntry,
  mapDriver,
  mapDriverContext,
  mapDriverDocument,
  mapFaultReport,
  mapFuelMovement,
  mapFuelSupplier,
  mapFuelTank,
  mapTeamChatMessage,
  mapTeamChatThread,
  mapVehicle,
  mapVehicleCheck,
  mapVoiceCallSession,
} from './mappers'

const companyAssetsBucket = 'company-assets'
const driverDocumentsBucket = 'driver-documents'
const signedUrlCache = new Map()
const featureNotReadyMessage = 'Funzione non ancora attiva per questa azienda. Contatta l assistenza Vygo.'
const serviceUnavailableMessage = 'Servizio Vygo non disponibile. Riprova tra poco o contatta l assistenza.'

function getCachedSignedUrl(cacheKey) {
  const cached = signedUrlCache.get(cacheKey)
  if (!cached || cached.expiresAt <= Date.now()) {
    signedUrlCache.delete(cacheKey)
    return ''
  }

  return cached.signedUrl
}

function rememberSignedUrl(cacheKey, signedUrl, ttlSeconds) {
  if (!signedUrl) return
  const safetyWindowMs = 60 * 1000
  signedUrlCache.set(cacheKey, {
    expiresAt: Date.now() + Math.max(30, ttlSeconds - 60) * 1000 - safetyWindowMs,
    signedUrl,
  })
}

function normalizeUsername(username = '') {
  return String(username).trim().toLowerCase().replace(/\s+/g, '')
}

function getDriverEmail(username = '') {
  const cleanUsername = normalizeUsername(username)
  return cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@${driverAuthDomain}`
}

function getDriverLoginEmails(username = '') {
  const cleanUsername = normalizeUsername(username)
  if (!cleanUsername) return []
  if (cleanUsername.includes('@')) return [cleanUsername]

  return [
    driverAuthDomain,
    'drivers.camionchiaro.app',
    'drivers.vy-go.com',
    'drivers.vygo.app',
  ]
    .filter(Boolean)
    .filter((domain, index, domains) => domains.indexOf(domain) === index)
    .map((domain) => `${cleanUsername}@${domain}`)
}

function shouldTryNextDriverEmail(error) {
  return String(error?.message ?? '').toLowerCase().includes('invalid')
}

async function getAccessToken() {
  const sessionResult = await supabase?.auth.getSession()
  return sessionResult?.data?.session?.access_token ?? ''
}

function notConfiguredError() {
  return { data: null, error: { message: serviceUnavailableMessage } }
}

function isMissingWorkforceSchemaError(error) {
  return ['42P01', '42703', 'PGRST200', 'PGRST202', 'PGRST204'].includes(error?.code)
}

function isMissingDriverCheckPermissionColumn(error) {
  const message = String(error?.message ?? '')
  return ['42703', 'PGRST204'].includes(error?.code) && (
    message.includes('access_password') || message.includes('can_submit_checks')
  )
}

function isMissingAccessPasswordColumn(error) {
  const message = String(error?.message ?? '')
  return ['42703', 'PGRST204'].includes(error?.code) && message.includes('access_password')
}

function workforceSchemaError() {
  return { message: featureNotReadyMessage }
}

function putCurrentDriverFirst(driver, drivers = []) {
  if (!driver?.id) return drivers
  return [
    driver,
    ...(drivers ?? []).filter((entry) => entry?.id && entry.id !== driver.id),
  ]
}

const chatThreadSelect = 'id, company_id, driver_id, title, context_type, last_message_at'
const chatMessageSelect =
  'id, company_id, thread_id, sender_user_id, sender_role, body, attachment_path, reactions, read_by_company_at, read_by_driver_at, created_at'
const driverSelectBaseColumns = 'id, company_id, username, auth_email, full_name, email, phone, profile_image_path, role, depot, status'
const driverSelectWithCheckColumns = 'id, company_id, username, auth_email, full_name, email, phone, profile_image_path, role, depot, can_submit_checks, access_password, status'
const companyPersonSelectBaseColumns = 'id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status'
const companyPersonSelectWithAccessColumns = 'id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, access_password, status'
const fuelTankSelectColumns = 'id, company_id, name, location, capacity_liters, warning_threshold_liters, initial_liters, status'
const fuelMovementSelectColumns = 'id, company_id, tank_id, vehicle_id, driver_id, person_id, supplier_id, movement_type, liters, unit_price_cents, total_cost_cents, currency, odometer_km, supplier, document_number, occurred_at, notes, created_at'
const fuelMovementBaseSelectColumns = 'id, company_id, tank_id, vehicle_id, driver_id, person_id, movement_type, liters, unit_price_cents, total_cost_cents, currency, odometer_km, supplier, document_number, occurred_at, notes, created_at'
const fuelSupplierSelectColumns = 'id, company_id, name, vat_number, contact_name, phone, email, notes, status, created_at, updated_at'

function shouldRetryWithBaseFuelMovementColumns(error) {
  return ['42703', 'PGRST200', 'PGRST204'].includes(error?.code)
}

async function runDriverSelect(configureQuery) {
  let result = await configureQuery(supabase.from('drivers').select(driverSelectWithCheckColumns))

  if (isMissingDriverCheckPermissionColumn(result.error)) {
    result = await configureQuery(supabase.from('drivers').select(driverSelectBaseColumns))
  }

  return result
}

async function fetchCompanyDriverRows(companyId) {
  return runDriverSelect((query) => query
    .eq('company_id', companyId)
    .neq('status', 'archived')
    .order('full_name', { ascending: true }))
}

async function fetchCompanyFuelTanks(companyId) {
  if (!companyId) return { data: [], error: null }

  const { data, error } = await supabase
    .from('fuel_tanks')
    .select(fuelTankSelectColumns)
    .eq('company_id', companyId)
    .neq('status', 'archived')
    .order('name', { ascending: true })

  if (isMissingWorkforceSchemaError(error)) return { data: [], error: null, missingSchema: true }
  return { data: (data ?? []).map(mapFuelTank), error }
}

async function fetchCompanyFuelMovements(companyId) {
  if (!companyId) return { data: [], error: null }

  let result = await supabase
    .from('fuel_movements')
    .select(fuelMovementSelectColumns)
    .eq('company_id', companyId)
    .order('occurred_at', { ascending: false })
    .limit(1000)

  if (shouldRetryWithBaseFuelMovementColumns(result.error)) {
    result = await supabase
      .from('fuel_movements')
      .select(fuelMovementBaseSelectColumns)
      .eq('company_id', companyId)
      .order('occurred_at', { ascending: false })
      .limit(1000)
  }

  if (!result.error && result.data?.length) return { data: result.data.map(mapFuelMovement), error: null }

  const rpcResult = await supabase.rpc('get_company_fuel_movements_for_user', {
    target_company_id: companyId,
  })

  if (!rpcResult.error && rpcResult.data?.length) return { data: rpcResult.data.map(mapFuelMovement), error: null }

  if (isMissingWorkforceSchemaError(result.error)) return { data: [], error: null, missingSchema: true }
  return { data: (result.data ?? []).map(mapFuelMovement), error: result.error }
}

async function fetchCompanyFuelSuppliers(companyId) {
  if (!companyId) return { data: [], error: null }

  const { data, error } = await supabase
    .from('fuel_suppliers')
    .select(fuelSupplierSelectColumns)
    .eq('company_id', companyId)
    .neq('status', 'archived')
    .order('name', { ascending: true })
    .limit(100)

  if (isMissingWorkforceSchemaError(error)) return { data: [], error: null, missingSchema: true }
  return { data: (data ?? []).map(mapFuelSupplier), error }
}
const chatMessageSelectWithoutReactions =
  'id, company_id, thread_id, sender_user_id, sender_role, body, attachment_path, read_by_company_at, read_by_driver_at, created_at'
const teamChatThreadSelect = 'id, company_id, thread_type, audience_type, direct_key, title, status, last_message_at, created_at'
const teamChatMessageSelect =
  'id, company_id, thread_id, sender_user_id, sender_person_id, sender_role, body, attachment_path, reactions, read_by_company_at, created_at'
const teamChatMessageLegacySelect =
  'id, company_id, thread_id, sender_user_id, sender_person_id, sender_role, body, attachment_path, created_at'
const companyAnnouncementSelect =
  'id, company_id, title, body, audience_type, requires_ack, status, published_at, created_at, updated_at'

function getAnnouncementAudienceTypes({ driver = null, person = null } = {}) {
  const audiences = new Set(['all'])
  const department = person?.department

  if (driver?.id || person?.linkedDriverId || department === 'drivers') audiences.add('drivers')
  if (['office', 'warehouse', 'management'].includes(department)) audiences.add(department)
  if (person?.personType === 'office') audiences.add('office')
  if (['mechanic', 'warehouse', 'warehouse_worker', 'forklift_operator'].includes(person?.personType)) audiences.add('warehouse')
  if (person?.personType === 'management') audiences.add('management')

  return [...audiences]
}

async function fetchCompanyAnnouncementsForCurrentUser(companyId, audiences = ['all']) {
  if (!isSupabaseConfigured || !companyId) return { data: [], error: null }

  const sessionResult = await supabase.auth.getSession()
  const userId = sessionResult.data?.session?.user?.id

  if (!userId) return { data: [], error: null }

  const safeAudiences = [...new Set(['all', ...(audiences ?? [])])].filter(Boolean)
  const { data, error } = await supabase
    .from('company_announcements')
    .select(companyAnnouncementSelect)
    .eq('company_id', companyId)
    .eq('status', 'published')
    .in('audience_type', safeAudiences)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(80)

  if (isMissingWorkforceSchemaError(error)) return { data: [], error: null, missingSchema: true }
  if (error) return { data: [], error }

  const announcementRows = data ?? []
  const announcementIds = announcementRows.map((announcement) => announcement.id).filter(Boolean)
  let readsByAnnouncementId = {}

  if (announcementIds.length) {
    const readsResult = await supabase
      .from('company_announcement_reads')
      .select('announcement_id, read_at, acknowledged_at')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .in('announcement_id', announcementIds)

    if (!isMissingWorkforceSchemaError(readsResult.error) && !readsResult.error) {
      readsByAnnouncementId = (readsResult.data ?? []).reduce((reads, row) => ({
        ...reads,
        [row.announcement_id]: row,
      }), {})
    }
  }

  return {
    data: announcementRows.map((announcement) => mapCompanyAnnouncement({
      ...announcement,
      acknowledged_at: readsByAnnouncementId[announcement.id]?.acknowledged_at ?? '',
      read_at: readsByAnnouncementId[announcement.id]?.read_at ?? '',
    })),
    error: null,
  }
}
const voiceCallSessionSelect =
  'id, company_id, thread_id, team_thread_id, caller_role, caller_user_id, caller_driver_id, caller_person_id, receiver_user_id, receiver_driver_id, receiver_person_id, call_type, status, started_at, answered_at, ended_at, duration_seconds, provider, provider_room_id, notes, created_at, updated_at'
const vehicleCheckSelect =
  'id, company_id, driver_id, tractor_id, semitrailer_id, odometer_km, lights_ok, tires_ok, documents_on_board, notes, status, resolved_at, created_at'
const vehicleCheckLegacySelect =
  'id, company_id, driver_id, tractor_id, semitrailer_id, odometer_km, lights_ok, tires_ok, documents_on_board, notes, created_at'
const faultReportSelect =
  'id, company_id, driver_id, vehicle_id, semitrailer_id, severity, title, description, photo_path, repair_cost_cents, repair_cost_currency, repair_notes, repair_recorded_at, repair_recorded_by, status, created_at, updated_at'
const faultReportLegacySelect =
  'id, company_id, driver_id, vehicle_id, semitrailer_id, severity, title, description, photo_path, status, created_at, updated_at'
const costEntrySelect =
  'id, company_id, vehicle_id, asset_id, driver_id, source_type, category, title, supplier, amount_cents, currency, spent_at, odometer_km, notes, file_bucket, file_path, created_at, updated_at'
const legalDocumentVersions = {
  dpa: 'vygo-dpa-2026-07-03',
  marketing: 'vygo-marketing-2026-07-03',
  privacy: 'vygo-privacy-2026-07-03',
  staffTerms: 'vygo-staff-terms-2026-07-03',
  terms: 'vygo-terms-2026-07-03',
}

function getRequiredLegalDocuments(accountRole = 'company') {
  return accountRole === 'company'
    ? ['terms', 'privacy', 'dpa']
    : ['staffTerms', 'privacy']
}

function isMissingLegalSchemaError(error) {
  return ['42P01', '42703', 'PGRST204'].includes(error?.code)
}

function mapCompanyProfile(row = {}) {
  return {
    billingActivatedAt: row.billing_activated_at ?? row.billingActivatedAt ?? '',
    billingAddonChat: Boolean(row.billing_addon_chat ?? row.billingAddonChat),
    billingAddonCostCenter: Boolean(row.billing_addon_cost_center ?? row.billingAddonCostCenter),
    billingAddonReports: Boolean(row.billing_addon_reports ?? row.billingAddonReports),
    billingCurrentPeriodEnd: row.billing_current_period_end ?? row.billingCurrentPeriodEnd ?? '',
    billingPlan: row.billing_plan ?? row.billingPlan ?? 'starter',
    billingProvider: row.billing_provider ?? row.billingProvider ?? 'manual',
    billingStatus: row.billing_status ?? row.billingStatus ?? 'active',
    billingStorageExtraGb: Number(row.billing_storage_extra_gb ?? row.billingStorageExtraGb ?? 0),
    headquarters: row.headquarters ?? '',
    id: row.id,
    logoPath: row.logo_path ?? row.logoPath ?? '',
    name: row.name ?? 'Azienda',
    vatNumber: row.vat_number ?? row.vatNumber ?? '',
  }
}

const companyProfileSelect =
  'id, name, vat_number, headquarters, logo_path, billing_plan, billing_status, billing_provider, billing_current_period_end, billing_activated_at, billing_addon_chat, billing_addon_cost_center, billing_addon_reports, billing_storage_extra_gb'

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

function normalizeIdentityForMatch(value = '') {
  return String(value ?? '').trim().toLowerCase()
}

function findMatchingDriverForPerson(person = {}, drivers = []) {
  const personValues = [
    person.linked_driver_id,
    person.linkedDriverId,
    person.username,
    person.auth_email,
    person.authEmail,
    person.email,
    person.phone,
    person.full_name,
    person.name,
  ].map(normalizeIdentityForMatch).filter(Boolean)

  if (!personValues.length) return null

  return (drivers ?? []).find((driver) => {
    const driverValues = [
      driver.id,
      driver.username,
      driver.auth_email,
      driver.authEmail,
      driver.email,
      driver.phone,
      driver.full_name,
      driver.name,
    ].map(normalizeIdentityForMatch).filter(Boolean)

    return driverValues.some((value) => personValues.includes(value))
  }) ?? null
}

function attachDriversToPeople(people = [], drivers = []) {
  return (people ?? []).map((person) => {
    if (person.linked_driver_id || person.linkedDriverId) return person
    const matchingDriver = findMatchingDriverForPerson(person, drivers)
    if (!matchingDriver?.id) return person

    return {
      ...person,
      linked_driver_id: matchingDriver.id,
      linkedDriverId: matchingDriver.id,
    }
  })
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
    access_password: person.accessPassword || person.password || null,
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
  try {
    const bytes = await new File(uri).bytes()

    if (bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength) {
      return bytes.buffer
    }

    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  } catch (fileError) {
    try {
      const response = await fetch(uri)
      if (!response.ok) throw fileError
      return response.arrayBuffer()
    } catch {
      throw fileError
    }
  }
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

async function fetchFaultReportsForCompany(companyId, limit = 50, driverId = '') {
  let query = supabase
    .from('fault_reports')
    .select(faultReportSelect)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (driverId) query = query.eq('driver_id', driverId)

  let result = await query

  if (result.error?.code === '42703') {
    let fallbackQuery = supabase
      .from('fault_reports')
      .select(faultReportLegacySelect)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (driverId) fallbackQuery = fallbackQuery.eq('driver_id', driverId)
    result = await fallbackQuery
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
      .select(companyPersonSelectWithAccessColumns)
      .eq('company_id', companyId)
      .eq('linked_driver_id', driverId)
      .neq('status', 'archived')
      .maybeSingle()

    if (isMissingWorkforceSchemaError(byDriverResult.error)) {
      return { data: null, error: null, missingSchema: true }
    }

    if (byDriverResult.data && userId && !byDriverResult.data.user_id) {
      const updatedResult = await supabase
        .from('company_people')
        .update({ user_id: userId })
        .eq('id', byDriverResult.data.id)
        .select(companyPersonSelectWithAccessColumns)
        .maybeSingle()

      if (!updatedResult.error && updatedResult.data) {
        return {
          data: mapContextCompanyPerson(updatedResult.data),
          error: null,
        }
      }
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
    .select(companyPersonSelectWithAccessColumns)
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

export async function fetchLegalAcceptanceStatus({ accountRole = 'company', companyId = '' } = {}) {
  const requiredDocuments = getRequiredLegalDocuments(accountRole)

  if (!isSupabaseConfigured || !companyId) {
    return {
      data: {
        accepted: true,
        missingDocuments: [],
        requiredDocuments,
      },
      error: null,
    }
  }

  const sessionResult = await supabase.auth.getSession()
  const userId = sessionResult.data?.session?.user?.id

  if (!userId) {
    return { data: null, error: { message: 'Sessione utente mancante. Fai login e riprova.' } }
  }

  const { data, error } = await supabase
    .from('legal_acceptances')
    .select('document_type, document_version')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .in('document_type', requiredDocuments)

  if (isMissingLegalSchemaError(error)) {
    return {
      data: {
        accepted: true,
        missingDocuments: [],
        missingTable: true,
        requiredDocuments,
      },
      error: null,
    }
  }

  if (error) return { data: null, error }

  const acceptedKeys = new Set(
    (data ?? []).map((row) => `${row.document_type}:${row.document_version}`),
  )
  const missingDocuments = requiredDocuments.filter(
    (documentType) => !acceptedKeys.has(`${documentType}:${legalDocumentVersions[documentType]}`),
  )

  return {
    data: {
      accepted: missingDocuments.length === 0,
      missingDocuments,
      requiredDocuments,
    },
    error: null,
  }
}

export async function recordLegalAcceptances({
  accountRole = 'company',
  companyId = '',
  marketingAccepted = false,
} = {}) {
  if (!isSupabaseConfigured || !companyId) return { data: null, error: null }

  const sessionResult = await supabase.auth.getSession()
  const userId = sessionResult.data?.session?.user?.id

  if (!userId) {
    return { data: null, error: { message: 'Sessione utente mancante. Fai login e riprova.' } }
  }

  const acceptedAt = new Date().toISOString()
  const documents = [
    ...getRequiredLegalDocuments(accountRole),
    ...(marketingAccepted ? ['marketing'] : []),
  ]
  const rows = documents.map((documentType) => ({
    accepted_at: acceptedAt,
    account_role: accountRole,
    company_id: companyId,
    document_type: documentType,
    document_version: legalDocumentVersions[documentType],
    metadata: {
      marketingAccepted,
      source: 'native-app',
    },
    user_agent: 'Vygo native app',
    user_id: userId,
  }))

  const { data, error } = await supabase
    .from('legal_acceptances')
    .upsert(rows, {
      onConflict: 'company_id,user_id,document_type,document_version',
    })
    .select('id, document_type, document_version, accepted_at')

  if (isMissingLegalSchemaError(error)) {
    return {
      data: null,
      error: { message: featureNotReadyMessage },
    }
  }

  return { data, error }
}

export async function signInDriver({ password, username }) {
  if (!isSupabaseConfigured) return notConfiguredError()

  const loginEmails = getDriverLoginEmails(username)
  let lastError = null

  for (const email of loginEmails) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error) return { data: data?.session ?? null, error: null }

    lastError = error
    if (!shouldTryNextDriverEmail(error)) break
  }

  return { data: null, error: lastError ?? { message: 'Credenziali autista non valide.' } }
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
      error: { message: featureNotReadyMessage },
    }
  }

  return { data, error }
}

export async function deleteNativePushToken(token = '') {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!token) return { data: false, error: null }

  const { data, error } = await supabase.rpc('delete_native_push_token', {
    token_value: token,
  })

  if (error?.code === '42883' || error?.code === 'PGRST202') {
    return {
      data: null,
      error: { message: featureNotReadyMessage },
    }
  }

  return { data, error }
}

export async function sendPushNotification(payload) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!apiBaseUrl) return { data: null, error: { message: serviceUnavailableMessage } }

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

export async function fetchTransportNews({ language = 'it', refresh = false } = {}) {
  if (!apiBaseUrl) return { data: null, error: { message: serviceUnavailableMessage } }

  try {
    const params = new URLSearchParams({ language })
    if (refresh) params.set('refresh', '1')

    const response = await fetch(`${apiBaseUrl}/.netlify/functions/transport-news?${params.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { data: null, error: { message: data.error ?? 'Radar Trasporti non disponibile.' } }
    }

    return { data, error: null }
  } catch {
    return { data: null, error: { message: 'Radar Trasporti non raggiungibile.' } }
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
      error: { message: fallbackResult.error?.message ?? 'Connessione al server Vygo non riuscita.' },
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

  const driverResult = await runDriverSelect((query) => query
    .eq('user_id', user.id)
    .neq('status', 'archived')
    .limit(1)
    .maybeSingle())

  if (driverResult.error) return { data: null, error: driverResult.error }
  if (!driverResult.data) {
    const personResult = await supabase
      .from('company_people')
      .select(companyPersonSelectWithAccessColumns)
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
    unreadCompanyMessagesResult,
    peopleResult,
    driversResult,
    teamThreadsResult,
    teamUnreadCountsResult,
    announcementsResult,
    fuelTanksResult,
  ] = await Promise.all([
    supabase
      .from('companies')
      .select(companyProfileSelect)
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
    fetchFaultReportsForCompany(driver.company_id, 50, driver.id),
    fetchCurrentCompanyPerson(driver.company_id, user.id, driver.id),
    fetchDriverUnreadCompanyMessages(driver.company_id, driver.id),
    supabase
      .from('company_people')
      .select(companyPersonSelectWithAccessColumns)
      .eq('company_id', driver.company_id)
      .neq('status', 'archived')
      .order('full_name', { ascending: true }),
    fetchCompanyDriverRows(driver.company_id),
    fetchTeamChatThreads(driver.company_id),
    fetchTeamUnreadCounts(driver.company_id),
    fetchCompanyAnnouncementsForCurrentUser(driver.company_id, getAnnouncementAudienceTypes({ driver })),
    fetchCompanyFuelTanks(driver.company_id),
  ])

  const firstError = [
    vehiclesResult.error,
    complianceResult.error,
    documentsResult.error,
    checksResult.error,
    faultsResult.error,
    personResult.error,
    unreadCompanyMessagesResult.error,
    isMissingWorkforceSchemaError(peopleResult.error) ? null : peopleResult.error,
    driversResult.error,
    teamThreadsResult.error,
    teamUnreadCountsResult.error,
    announcementsResult.error,
    fuelTanksResult.error,
  ].find(Boolean)

  if (firstError) return { data: null, error: firstError }

  const companyProfile = companyResult.data
    ? mapCompanyProfile(companyResult.data)
    : { id: driver.company_id, logoPath: '', name: 'Azienda' }
  let finalTeamUnreadCountsResult = teamUnreadCountsResult

  if (personResult.data && !teamUnreadCountsResult.error) {
    const refreshedUnreadCountsResult = await fetchTeamUnreadCounts(driver.company_id)
    if (!refreshedUnreadCountsResult.error) finalTeamUnreadCountsResult = refreshedUnreadCountsResult
  }

  const peopleRows = isMissingWorkforceSchemaError(peopleResult.error)
    ? (personResult.data ? [personResult.data] : [])
    : attachDriversToPeople(peopleResult.data ?? [], driversResult.data ?? [])

  return {
    data: mapDriverContext({
      companyId: driver.company_id,
      announcements: announcementsResult.data ?? [],
      companyProfile,
      complianceItems: (complianceResult.data ?? []).map(mapComplianceItem),
      currentPerson: personResult.data,
      documents: documentsResult.data ?? [],
      drivers: putCurrentDriverFirst(driver, driversResult.data ?? []),
      faultReports: faultsResult.data ?? [],
      fuelTanks: fuelTanksResult.data ?? [],
      people: peopleRows,
      teamChatThreads: teamThreadsResult.data ?? [],
      unreadCompanyMessages: unreadCompanyMessagesResult.data ?? 0,
      unreadTeamMessages: Object.values(finalTeamUnreadCountsResult.data ?? {}).reduce((total, count) => total + Number(count || 0), 0),
      unreadTeamMessagesByThreadId: finalTeamUnreadCountsResult.data ?? {},
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
    driversResult,
    complianceResult,
    teamThreadsResult,
    teamUnreadCountsResult,
    announcementsResult,
    fuelTanksResult,
  ] = await Promise.all([
    supabase
      .from('companies')
      .select(companyProfileSelect)
      .eq('id', companyId)
      .maybeSingle(),
    supabase
      .from('company_people')
      .select(companyPersonSelectWithAccessColumns)
      .eq('company_id', companyId)
      .neq('status', 'archived')
      .order('full_name', { ascending: true }),
    fetchCompanyDriverRows(companyId),
    supabase
      .from('compliance_items')
      .select('id, type, scope, driver_id, vehicle_id, person_id, asset_id, due_date, document_number, status')
      .eq('company_id', companyId)
      .eq('person_id', person.id)
      .neq('status', 'archived')
      .order('due_date', { ascending: true }),
    fetchTeamChatThreads(companyId),
    fetchTeamUnreadCounts(companyId),
    fetchCompanyAnnouncementsForCurrentUser(companyId, getAnnouncementAudienceTypes({ person })),
    fetchCompanyFuelTanks(companyId),
  ])

  const firstError = [
    companyResult.error,
    isMissingWorkforceSchemaError(peopleResult.error) ? null : peopleResult.error,
    driversResult.error,
    complianceResult.error,
    teamThreadsResult.error,
    teamUnreadCountsResult.error,
    announcementsResult.error,
    fuelTanksResult.error,
  ].find(Boolean)

  if (firstError) return { data: null, error: firstError }
  const peopleRows = attachDriversToPeople(peopleResult.data ?? [], driversResult.data ?? [])

  return {
    data: mapDriverContext({
      companyId,
      announcements: announcementsResult.data ?? [],
      companyProfile: companyResult.data ? mapCompanyProfile(companyResult.data) : { id: companyId, logoPath: '', name: 'Azienda' },
      complianceItems: (complianceResult.data ?? []).map(mapComplianceItem),
      currentPerson: person,
      documents: [],
      drivers: driversResult.data ?? [],
      faultReports: [],
      fuelTanks: fuelTanksResult.data ?? [],
      people: peopleRows.map(mapContextCompanyPerson),
      teamChatThreads: teamThreadsResult.data ?? [],
      unreadTeamMessages: Object.values(teamUnreadCountsResult.data ?? {}).reduce((total, count) => total + Number(count || 0), 0),
      unreadTeamMessagesByThreadId: teamUnreadCountsResult.data ?? {},
      vehicleChecks: [],
      vehicles: [],
    }),
    error: null,
  }
}

async function fetchDriverUnreadCompanyMessages(companyId, driverId) {
  if (!companyId || !driverId) return { data: 0, error: null }

  const { data: threadRows, error: threadError } = await supabase
    .from('chat_threads')
    .select('id')
    .eq('company_id', companyId)
    .eq('driver_id', driverId)
    .eq('context_type', 'general')

  if (threadError) return { data: 0, error: threadError }

  const threadIds = (threadRows ?? []).map((thread) => thread.id).filter(Boolean)
  if (!threadIds.length) return { data: 0, error: null }

  const { count, error } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .in('thread_id', threadIds)
    .eq('sender_role', 'company')
    .is('read_by_driver_at', null)

  return { data: count ?? 0, error }
}

async function fetchCompanyCostEntries(companyId) {
  if (!companyId) return { data: [], error: null }

  const { data, error } = await supabase
    .from('cost_entries')
    .select(costEntrySelect)
    .eq('company_id', companyId)
    .order('spent_at', { ascending: false })
    .limit(200)

  if (isMissingWorkforceSchemaError(error)) return { data: [], error: null, missingSchema: true }

  return { data: (data ?? []).map(mapCostEntry), error }
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
    costEntriesResult,
    complianceResult,
    unreadMessagesResult,
    chatThreadsResult,
    teamChatThreadsResult,
    chatMessagesResult,
    teamChatMessagesResult,
    teamUnreadCountsResult,
    fuelTanksResult,
    fuelMovementsResult,
    fuelSuppliersResult,
  ] = await Promise.all([
    supabase
      .from('companies')
      .select(companyProfileSelect)
      .eq('id', companyId)
      .maybeSingle(),
    fetchCompanyDriverRows(companyId),
    supabase
      .from('vehicles')
      .select('id, plate, model, type, fleet_type, km, status')
      .eq('company_id', companyId)
      .neq('status', 'archived')
      .order('plate', { ascending: true }),
    supabase
      .from('company_people')
      .select(companyPersonSelectWithAccessColumns)
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
    fetchFaultReportsForCompany(companyId, 30),
    fetchCompanyCostEntries(companyId),
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
    fetchCompanyFuelTanks(companyId),
    fetchCompanyFuelMovements(companyId),
    fetchCompanyFuelSuppliers(companyId),
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
    costEntriesResult.error,
    complianceResult.error,
    unreadMessagesResult.error,
    chatThreadsResult.error,
    chatMessagesResult.error,
    teamUnreadCountsResult.error,
    fuelTanksResult.error,
    fuelMovementsResult.error,
    fuelSuppliersResult.error,
  ].find(Boolean)

  if (firstError) return { data: null, error: firstError }
  const workforceSchemaReady = !isMissingWorkforceSchemaError(peopleResult.error) && !isMissingWorkforceSchemaError(assetsResult.error)
  const companyPeopleRows = workforceSchemaReady ? attachDriversToPeople(peopleResult.data ?? [], driversResult.data ?? []) : []

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
      costEntries: costEntriesResult.data ?? [],
      faultReports: (faultsResult.data ?? []).map(mapFaultReport),
      fuelMovements: fuelMovementsResult.data ?? [],
      fuelSuppliers: fuelSuppliersResult.data ?? [],
      fuelTanks: fuelTanksResult.data ?? [],
      membership: membershipResult.data,
      people: companyPeopleRows.map(mapCompanyPerson),
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

async function uploadChatAttachment({ attachment, companyId, folder = 'chat', threadId }) {
  if (!attachment?.uri) return { data: '', error: null }

  const cleanFileName = sanitizeFileName(attachment.name ?? `allegato-${Date.now()}`)
  const filePath = `${companyId}/${folder}/${threadId}/${Date.now()}-${cleanFileName}`
  let fileBody

  try {
    fileBody = await getFileBodyFromUri(attachment.uri)
  } catch {
    return {
      data: '',
      error: { message: 'File non leggibile dalla galleria. Riprova selezionandolo di nuovo o scattando una nuova foto.' },
    }
  }

  const { error } = await supabase.storage.from(companyAssetsBucket).upload(filePath, fileBody, {
    cacheControl: '31536000',
    contentType: attachment.type || 'application/octet-stream',
    upsert: false,
  })

  if (error) return { data: '', error }

  await registerCompanyStorageFile({
    bucket: companyAssetsBucket,
    category: 'chat',
    companyId,
    filePath,
    sizeBytes: fileBody?.byteLength ?? attachment.size ?? 0,
  })

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
      error: { message: featureNotReadyMessage },
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

export async function acknowledgeCompanyAnnouncement({
  acknowledge = true,
  announcementId,
  companyId,
  driverId = '',
  personId = '',
}) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!announcementId || !companyId) return { data: null, error: { message: 'Comunicazione mancante.' } }

  const sessionResult = await supabase.auth.getSession()
  const userId = sessionResult.data?.session?.user?.id

  if (!userId) return { data: null, error: { message: 'Sessione scaduta. Fai login e riprova.' } }

  const now = new Date().toISOString()
  const existingResult = await supabase
    .from('company_announcement_reads')
    .select('acknowledged_at, read_at')
    .eq('announcement_id', announcementId)
    .eq('user_id', userId)
    .maybeSingle()

  if (isMissingWorkforceSchemaError(existingResult.error)) {
    return { data: null, error: { message: 'Presa visione non ancora attiva per questa azienda.' } }
  }

  if (existingResult.error) return { data: null, error: existingResult.error }

  const payload = {
    acknowledged_at: acknowledge ? now : existingResult.data?.acknowledged_at ?? null,
    announcement_id: announcementId,
    company_id: companyId,
    driver_id: driverId || null,
    person_id: personId || null,
    read_at: existingResult.data?.read_at ?? now,
    user_id: userId,
  }

  const { data, error } = await supabase
    .from('company_announcement_reads')
    .upsert(payload, { onConflict: 'announcement_id,user_id' })
    .select('announcement_id, read_at, acknowledged_at')
    .single()

  if (isMissingWorkforceSchemaError(error)) {
    return { data: null, error: { message: 'Presa visione non ancora attiva per questa azienda.' } }
  }

  return {
    data: data
      ? {
          acknowledgedAt: data.acknowledged_at ?? '',
          announcementId: data.announcement_id,
          readAt: data.read_at ?? '',
        }
      : null,
    error,
  }
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
    folder: 'team-chat',
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
      error: { message: featureNotReadyMessage },
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

export async function createVoiceCallSession({
  callerDriverId = '',
  callerPersonId = '',
  callerRole = 'company',
  companyId,
  driverId = '',
  receiverDriverId = '',
  receiverPersonId = '',
  teamThreadId = '',
  threadId = '',
  targetName = '',
}) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId) return { data: null, error: { message: 'Azienda non caricata.' } }

  let targetThread = null

  if (!teamThreadId) {
    const targetDriverId = receiverDriverId || driverId || callerDriverId
    const threadResult = await ensureChatThread({
      companyId,
      driverId: targetDriverId,
      threadId,
    })

    if (threadResult.error || !threadResult.data?.id) {
      return { data: null, error: threadResult.error ?? { message: 'Chat chiamata non disponibile.' } }
    }

    targetThread = threadResult.data
  }

  const now = new Date().toISOString()
  const payload = {
    call_type: 'voice',
    caller_driver_id: callerDriverId || null,
    caller_person_id: callerPersonId || null,
    caller_role: callerRole,
    company_id: companyId,
    notes: targetName ? `Richiesta chiamata verso ${targetName}` : 'Richiesta chiamata Vygo',
    receiver_driver_id: receiverDriverId || null,
    receiver_person_id: receiverPersonId || null,
    started_at: now,
    status: 'ringing',
    team_thread_id: teamThreadId || null,
    thread_id: teamThreadId ? null : targetThread?.id,
  }

  const { data, error } = await supabase
    .from('voice_call_sessions')
    .insert(payload)
    .select(voiceCallSessionSelect)
    .single()

  if (isMissingWorkforceSchemaError(error)) {
    return {
      data: null,
      error: { message: featureNotReadyMessage },
    }
  }

  if (error) return { data: null, error }

  return {
    data: {
      call: mapVoiceCallSession(data),
      thread: targetThread,
    },
    error: null,
  }
}

export async function updateVoiceCallSession(callId, patch = {}) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!callId) return { data: null, error: { message: 'Chiamata mancante.' } }

  const nextPatch = {}
  if (patch.status) nextPatch.status = patch.status
  if (Object.prototype.hasOwnProperty.call(patch, 'answeredAt')) nextPatch.answered_at = patch.answeredAt || null
  if (Object.prototype.hasOwnProperty.call(patch, 'endedAt')) nextPatch.ended_at = patch.endedAt || null
  if (Object.prototype.hasOwnProperty.call(patch, 'durationSeconds')) nextPatch.duration_seconds = Math.max(0, Number(patch.durationSeconds) || 0)
  if (Object.prototype.hasOwnProperty.call(patch, 'notes')) nextPatch.notes = patch.notes || null

  const { data, error } = await supabase
    .from('voice_call_sessions')
    .update(nextPatch)
    .eq('id', callId)
    .select(voiceCallSessionSelect)
    .single()

  if (isMissingWorkforceSchemaError(error)) {
    return {
      data: null,
      error: { message: featureNotReadyMessage },
    }
  }

  if (error) return { data: null, error }
  return { data: mapVoiceCallSession(data), error: null }
}

export function subscribeToVoiceCallSessions({ companyId, onCall }) {
  if (!isSupabaseConfigured || !companyId) return () => {}

  const channel = supabase
    .channel(`voice-call-sessions-${companyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        filter: `company_id=eq.${companyId}`,
        schema: 'public',
        table: 'voice_call_sessions',
      },
      (payload) => {
        const row = payload.new ?? payload.old
        if (!row) return
        onCall?.(mapVoiceCallSession(row), payload)
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
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
      error: { message: featureNotReadyMessage },
    }
  }

  return { data: data ? mapChatMessage(data) : null, error }
}

export async function updateTeamChatMessageReaction(message, actorRole, reaction) {
  if (!isSupabaseConfigured || !message?.id) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase.rpc('set_team_chat_message_reaction', {
    actor_role: actorRole === 'company' ? 'company' : 'person',
    reaction_value: reaction || null,
    target_message_id: message.id,
  })

  if (error?.code === '42883' || error?.code === 'PGRST202') {
    return {
      data: null,
      error: { message: featureNotReadyMessage },
    }
  }

  if (isMissingWorkforceSchemaError(error)) {
    return {
      data: null,
      error: { message: featureNotReadyMessage },
    }
  }

  if (error) return { data: null, error }

  return { data: data ? mapTeamChatMessage(data) : null, error: null }
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
  const ttlSeconds = 86400
  const cacheKey = `${companyAssetsBucket}:${filePath}`
  const cachedSignedUrl = getCachedSignedUrl(cacheKey)
  if (cachedSignedUrl) return { data: { signedUrl: cachedSignedUrl }, error: null }

  const result = await supabase.storage.from(companyAssetsBucket).createSignedUrl(filePath, ttlSeconds)
  rememberSignedUrl(cacheKey, result.data?.signedUrl, ttlSeconds)
  return result
}

export async function createDriverDocumentSignedUrl(filePath) {
  if (!isSupabaseConfigured || !filePath) return { data: null, error: null }
  const ttlSeconds = 86400
  const cacheKey = `${driverDocumentsBucket}:${filePath}`
  const cachedSignedUrl = getCachedSignedUrl(cacheKey)
  if (cachedSignedUrl) return { data: { signedUrl: cachedSignedUrl }, error: null }

  const result = await supabase.storage.from(driverDocumentsBucket).createSignedUrl(filePath, ttlSeconds)
  rememberSignedUrl(cacheKey, result.data?.signedUrl, ttlSeconds)
  return result
}

export async function updateFaultReportStatus(reportId, status, repair = {}) {
  if (!isSupabaseConfigured || !reportId) return { data: null, error: null }

  const accessToken = await getAccessToken()

  if (apiBaseUrl && accessToken) {
    try {
      const response = await fetch(`${apiBaseUrl}/.netlify/functions/update-fault`, {
        body: JSON.stringify({ repair, reportId, status }),
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

  const updatePayload = { status }
  const hasRepairUpdate = Object.prototype.hasOwnProperty.call(repair, 'repairCostCents') ||
    Object.prototype.hasOwnProperty.call(repair, 'repairNotes') ||
    Boolean(repair.repairCleared)

  if (hasRepairUpdate) {
    const repairCleared = Boolean(repair.repairCleared)
    updatePayload.repair_cost_cents = Number(repair.repairCostCents ?? 0)
    updatePayload.repair_cost_currency = repair.repairCostCurrency || 'EUR'
    updatePayload.repair_notes = repair.repairNotes?.trim() || null
    updatePayload.repair_recorded_at = repairCleared ? null : new Date().toISOString()
  }

  let { data, error } = await supabase
    .from('fault_reports')
    .update(updatePayload)
    .eq('id', reportId)
    .select(faultReportSelect)
    .single()

  if (error?.code === '42703' && hasRepairUpdate) {
    return {
      data: null,
      error: { message: featureNotReadyMessage },
    }
  }

  if (error?.code === '42703') {
    const fallbackResult = await supabase
      .from('fault_reports')
      .update({ status })
      .eq('id', reportId)
      .select(faultReportLegacySelect)
      .single()

    data = fallbackResult.data
    error = fallbackResult.error
  }

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
      error: { message: featureNotReadyMessage },
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

  function handleFuelMovement(payload) {
    const row = payload.new
    if (!row) return
    if (driverId && row.driver_id !== driverId) return
    const movement = mapFuelMovement(row)
    handlers.onFuelMovement?.(movement, payload)
    handlers.onChange?.({ item: movement, payload, type: 'fuel_movement' })
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
    .on(
      'postgres_changes',
      {
        event: '*',
        filter: `company_id=eq.${companyId}`,
        schema: 'public',
        table: 'fuel_movements',
      },
      handleFuelMovement,
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToCompanyAnnouncements({ companyId, onChange }) {
  if (!isSupabaseConfigured || !companyId) return () => {}

  const channel = supabase
    .channel(`company-announcements-${companyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        filter: `company_id=eq.${companyId}`,
        schema: 'public',
        table: 'company_announcements',
      },
      (payload) => {
        onChange?.({ payload, type: 'announcement' })
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        filter: `company_id=eq.${companyId}`,
        schema: 'public',
        table: 'company_announcement_reads',
      },
      (payload) => {
        onChange?.({ payload, type: 'announcement_read' })
      },
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

  const actorRole = actor.actorRole || 'driver'
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
        actorPersonId: actor.actorPersonId ?? '',
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
          actorPersonId: actor.actorPersonId ?? '',
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
      error: { message: serviceUnavailableMessage },
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
      error: { message: serviceUnavailableMessage },
    }
  }
}

export async function updateCompanyDriverSettings({ driverId, updates = {} }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!driverId) return { data: null, error: { message: 'Autista mancante.' } }

  const payload = {}
  if ('canSubmitChecks' in updates) payload.can_submit_checks = updates.canSubmitChecks !== false

  if (Object.keys(payload).length === 0) {
    return { data: null, error: { message: 'Nessuna modifica da salvare.' } }
  }

  let result = await supabase
    .from('drivers')
    .update(payload)
    .eq('id', driverId)
    .select(driverSelectWithCheckColumns)
    .single()

  if (isMissingDriverCheckPermissionColumn(result.error) && 'can_submit_checks' in payload) {
    return {
      data: null,
      error: { message: 'Permesso check non salvato. Esegui il file SQL 51 in Supabase e riprova.' },
    }
  }

  const { data, error } = result
  return { data: data ? mapDriver(data) : null, error }
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
        error: { message: serviceUnavailableMessage },
      }
    }
  }

  const payload = toCompanyPersonPayload(person, companyId)
  if (!payload.full_name) return { data: null, error: { message: 'Nome persona obbligatorio.' } }

  let insertResult = await supabase
    .from('company_people')
    .insert(payload)
    .select(companyPersonSelectWithAccessColumns)
    .single()

  if (isMissingAccessPasswordColumn(insertResult.error)) {
    const fallbackPayload = { ...payload }
    delete fallbackPayload.access_password
    insertResult = await supabase
      .from('company_people')
      .insert(fallbackPayload)
      .select(companyPersonSelectBaseColumns)
      .single()
  }

  const { data, error } = insertResult

  if (isMissingWorkforceSchemaError(error)) {
    return { data: null, error: workforceSchemaError() }
  }

  return { data: data ? mapCompanyPerson(data) : null, error }
}

export async function resetCompanyAccessPassword({ companyId, password = '', targetId, targetType }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!apiBaseUrl) {
    return {
      data: null,
      error: { message: serviceUnavailableMessage },
    }
  }

  const accessToken = await getAccessToken()

  if (!accessToken) {
    return { data: null, error: { message: 'Sessione azienda scaduta. Fai login.' } }
  }

  try {
    const response = await fetch(`${apiBaseUrl}/.netlify/functions/reset-access-password`, {
      body: JSON.stringify({ companyId, password, targetId, targetType }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { data: null, error: { message: payload.error ?? 'Password non reimpostata.' } }
    }

    return { data: payload, error: null }
  } catch {
    return {
      data: null,
      error: { message: serviceUnavailableMessage },
    }
  }
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
      error: { message: featureNotReadyMessage },
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
      cacheControl: '31536000',
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
        error: { message: featureNotReadyMessage },
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

export async function createCompanyCostEntry({ companyId, entry, file = null }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId) return { data: null, error: { message: 'Azienda non trovata.' } }

  let filePath = ''
  let fileBody = null

  if (file?.uri) {
    const cleanFileName = sanitizeFileName(file.name ?? `spesa-${Date.now()}`)
    filePath = `${companyId}/costs/${Date.now()}-${cleanFileName}`
    fileBody = await getFileBodyFromUri(file.uri)

    const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(filePath, fileBody, {
      cacheControl: '31536000',
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

    if (uploadError) return { data: null, error: uploadError }
  }

  const sessionResult = await supabase.auth.getSession()
  const payload = {
    amount_cents: Number(entry.amountCents ?? 0),
    asset_id: entry.assetId || null,
    category: entry.category || 'maintenance',
    company_id: companyId,
    created_by_user_id: sessionResult.data?.session?.user?.id ?? null,
    currency: entry.currency || 'EUR',
    driver_id: entry.driverId || null,
    file_bucket: companyAssetsBucket,
    file_path: filePath || null,
    notes: entry.notes?.trim() || null,
    odometer_km: entry.odometerKm ? Number(entry.odometerKm) : null,
    source_type: entry.sourceType || 'manual',
    spent_at: entry.spentAt,
    supplier: entry.supplier?.trim() || null,
    title: entry.title?.trim() || 'Spesa',
    vehicle_id: entry.vehicleId || null,
  }

  const { data, error } = await supabase
    .from('cost_entries')
    .insert(payload)
    .select(costEntrySelect)
    .single()

  if (error && filePath) {
    await supabase.storage.from(companyAssetsBucket).remove([filePath])
  }

  if (!error && filePath) {
    await registerCompanyStorageFile({
      bucket: companyAssetsBucket,
      category: 'other',
      companyId,
      filePath,
      sizeBytes: fileBody?.byteLength ?? 0,
    })
  }

  if (isMissingWorkforceSchemaError(error)) {
    return {
      data: null,
      error: { message: featureNotReadyMessage },
    }
  }

  return { data: data ? mapCostEntry(data) : null, error }
}

export async function createFuelMovement({ companyId, movement }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId) return { data: null, error: { message: 'Azienda non trovata.' } }

  const parseFuelNumber = (value) => {
    const parsed = Number.parseFloat(String(value ?? '').replace(/\s/g, '').replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : 0
  }
  const normalizeUuid = (value) => {
    const cleanValue = String(value ?? '').trim()
    if (!cleanValue) return null
    return cleanValue.replace(/^(driver|person|vehicle|asset|tank)-/, '')
  }
  const normalizePersonUuid = (value) => {
    const cleanValue = String(value ?? '').trim()
    if (!cleanValue || cleanValue.startsWith('driver-')) return null
    return normalizeUuid(cleanValue)
  }
  const liters = parseFuelNumber(movement.liters)
  const odometerKm = parseFuelNumber(movement.odometerKm)
  const movementType = movement.movementType || 'dispense'
  if (!movement.tankId || liters <= 0 || (movementType === 'dispense' && !movement.vehicleId)) {
    return { data: null, error: { message: movementType === 'dispense' ? 'Seleziona cisterna, mezzo e litri riforniti.' : 'Seleziona cisterna e litri caricati.' } }
  }

  const sessionResult = await supabase.auth.getSession()
  const unitPriceCents = movement.unitPriceCents === '' || movement.unitPriceCents == null
    ? null
    : Number(movement.unitPriceCents)
  const totalCostCents = movement.totalCostCents === '' || movement.totalCostCents == null
    ? unitPriceCents && liters ? Math.round(unitPriceCents * liters) : null
    : Number(movement.totalCostCents)
  const payload = {
    company_id: companyId,
    created_by_user_id: sessionResult.data?.session?.user?.id ?? null,
    currency: movement.currency || 'EUR',
    document_number: movementType === 'dispense' ? null : movement.documentNumber?.trim() || null,
    driver_id: movementType === 'dispense' ? normalizeUuid(movement.driverId) : null,
    liters,
    movement_type: movementType,
    notes: movement.notes?.trim() || null,
    occurred_at: movement.occurredAt || new Date().toISOString(),
    odometer_km: movement.odometerKm ? odometerKm : null,
    person_id: normalizePersonUuid(movement.personId),
    supplier: movementType === 'dispense' ? null : movement.supplier?.trim() || null,
    supplier_id: movementType === 'dispense' ? null : normalizeUuid(movement.supplierId),
    tank_id: normalizeUuid(movement.tankId),
    total_cost_cents: movementType === 'dispense' ? null : totalCostCents,
    unit_price_cents: movementType === 'dispense' ? null : unitPriceCents,
    vehicle_id: movementType === 'dispense' ? normalizeUuid(movement.vehicleId) : null,
  }

  const { data, error } = await supabase
    .from('fuel_movements')
    .insert(payload)
    .select(fuelMovementSelectColumns)
    .single()

  if (isMissingWorkforceSchemaError(error)) {
    return { data: null, error: { message: 'Modulo gasolio non ancora attivo. Esegui SQL 60 e 61 in Supabase.' } }
  }

  return { data: data ? mapFuelMovement(data) : null, error }
}

export async function createFuelSupplier({ companyId, supplier }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId) return { data: null, error: { message: 'Azienda non trovata.' } }

  const payload = {
    company_id: companyId,
    contact_name: supplier.contactName?.trim() || null,
    email: supplier.email?.trim() || null,
    name: supplier.name?.trim(),
    notes: supplier.notes?.trim() || null,
    phone: supplier.phone?.trim() || null,
    status: 'active',
    vat_number: supplier.vatNumber?.trim() || null,
  }

  if (!payload.name) {
    return { data: null, error: { message: 'Inserisci il nome del fornitore gasolio.' } }
  }

  const { data, error } = await supabase
    .from('fuel_suppliers')
    .insert(payload)
    .select(fuelSupplierSelectColumns)
    .single()

  if (isMissingWorkforceSchemaError(error)) {
    return { data: null, error: { message: 'Anagrafica fornitori gasolio non ancora attiva. Esegui SQL 62 in Supabase.' } }
  }

  return { data: data ? mapFuelSupplier(data) : null, error }
}

export async function createFuelTank({ companyId, tank }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId) return { data: null, error: { message: 'Azienda non trovata.' } }
  const parseFuelNumber = (value) => {
    const parsed = Number.parseFloat(String(value ?? '').replace(/\s/g, '').replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : 0
  }

  const payload = {
    capacity_liters: parseFuelNumber(tank.capacityLiters),
    company_id: companyId,
    initial_liters: parseFuelNumber(tank.initialLiters),
    location: tank.location?.trim() || null,
    name: tank.name?.trim() || 'Cisterna gasolio',
    notes: tank.notes?.trim() || null,
    status: 'active',
    warning_threshold_liters: parseFuelNumber(tank.warningThresholdLiters),
  }

  if (!payload.name || payload.capacity_liters <= 0) {
    return { data: null, error: { message: 'Inserisci nome cisterna e capienza in litri.' } }
  }

  const { data, error } = await supabase
    .from('fuel_tanks')
    .insert(payload)
    .select(fuelTankSelectColumns)
    .single()

  if (isMissingWorkforceSchemaError(error)) {
    return { data: null, error: { message: 'Modulo gasolio non ancora attivo. Esegui SQL 60 e 61 in Supabase.' } }
  }

  return { data: data ? mapFuelTank(data) : null, error }
}

export async function updateCompanyCostEntry({ companyId, entryId, entry, file = null, previousFilePath = '' }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId || !entryId) return { data: null, error: { message: 'Spesa non trovata.' } }

  let filePath = entry.filePath ?? previousFilePath ?? ''
  let fileBody = null

  if (file?.uri) {
    const cleanFileName = sanitizeFileName(file.name ?? `spesa-${Date.now()}`)
    filePath = `${companyId}/costs/${Date.now()}-${cleanFileName}`
    fileBody = await getFileBodyFromUri(file.uri)

    const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(filePath, fileBody, {
      cacheControl: '31536000',
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

    if (uploadError) return { data: null, error: uploadError }
  }

  const payload = {
    amount_cents: Number(entry.amountCents ?? 0),
    asset_id: entry.assetId || null,
    category: entry.category || 'maintenance',
    currency: entry.currency || 'EUR',
    driver_id: entry.driverId || null,
    file_bucket: companyAssetsBucket,
    file_path: filePath || null,
    notes: entry.notes?.trim() || null,
    odometer_km: entry.odometerKm ? Number(entry.odometerKm) : null,
    source_type: entry.sourceType || 'manual',
    spent_at: entry.spentAt,
    supplier: entry.supplier?.trim() || null,
    title: entry.title?.trim() || 'Spesa',
    updated_at: new Date().toISOString(),
    vehicle_id: entry.vehicleId || null,
  }

  const { data, error } = await supabase
    .from('cost_entries')
    .update(payload)
    .eq('id', entryId)
    .select(costEntrySelect)
    .single()

  if (error && filePath && filePath !== previousFilePath) {
    await supabase.storage.from(companyAssetsBucket).remove([filePath])
  }

  if (!error && filePath && filePath !== previousFilePath) {
    await registerCompanyStorageFile({
      bucket: companyAssetsBucket,
      category: 'other',
      companyId,
      filePath,
      sizeBytes: fileBody?.byteLength ?? 0,
    })
  }

  if (isMissingWorkforceSchemaError(error)) {
    return {
      data: null,
      error: { message: featureNotReadyMessage },
    }
  }

  return { data: data ? mapCostEntry(data) : null, error }
}

export async function deleteCompanyCostEntry({ entryId }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!entryId) return { data: null, error: { message: 'Spesa non trovata.' } }

  const { error } = await supabase.from('cost_entries').delete().eq('id', entryId)

  if (isMissingWorkforceSchemaError(error)) {
    return {
      data: null,
      error: { message: featureNotReadyMessage },
    }
  }

  return { data: null, error }
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
      cacheControl: '31536000',
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
      error: { message: featureNotReadyMessage },
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
        cacheControl: '31536000',
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
    cacheControl: '31536000',
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
      cacheControl: '31536000',
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
      error: { message: featureNotReadyMessage },
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
    cacheControl: '31536000',
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
      cacheControl: '31536000',
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
