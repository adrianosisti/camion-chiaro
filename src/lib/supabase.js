const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const configuredCompanyId = import.meta.env.VITE_SUPABASE_COMPANY_ID

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const isCompanyDataConfigured = Boolean(isSupabaseConfigured && configuredCompanyId)
export const driverDocumentsBucket = 'driver-documents'
export const companyAssetsBucket = 'company-assets'
export const companyInvoicesBucket = 'company-invoices'
const signedUrlCache = new Map()
export const legalDocumentVersions = {
  dpa: 'vygo-dpa-2026-07-03',
  marketing: 'vygo-marketing-2026-07-03',
  privacy: 'vygo-privacy-2026-07-03',
  staffTerms: 'vygo-staff-terms-2026-07-03',
  terms: 'vygo-terms-2026-07-03',
}

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

function getRequiredLegalDocuments(accountRole = 'company') {
  return accountRole === 'company'
    ? ['terms', 'privacy', 'dpa']
    : ['staffTerms', 'privacy']
}

function isMissingLegalSchemaError(error) {
  return ['42P01', '42703', 'PGRST204'].includes(error?.code)
}

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
    accessPassword: row.access_password ?? row.accessPassword ?? '',
    id: row.id,
    authEmail: row.auth_email,
    companyId: row.company_id,
    depot: row.depot ?? '',
    email: row.email ?? row.auth_email ?? '',
    name: row.full_name,
    phone: row.phone,
    profileImagePath: row.profile_image_path ?? '',
    role: row.role ?? 'Autista',
    canSubmitChecks: row.can_submit_checks ?? row.canSubmitChecks ?? true,
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
    assetId: row.asset_id ?? '',
    id: row.id,
    documentNumber: row.document_number,
    driverId: row.driver_id,
    dueDate: row.due_date,
    fileBucket: row.file_bucket ?? '',
    filePath: row.file_path ?? '',
    lastReminderAt: row.last_reminder_at,
    owner: row.owner,
    personId: row.person_id ?? '',
    reminderDays: row.reminder_days,
    scope: row.scope,
    status: row.status,
    type: row.type,
    vehicleId: row.vehicle_id,
  }
}

function mapCompanyPerson(row) {
  return {
    accessPassword: row.access_password ?? row.accessPassword ?? '',
    authEmail: row.auth_email ?? '',
    companyId: row.company_id,
    department: row.department ?? 'drivers',
    depot: row.depot ?? '',
    email: row.email ?? '',
    id: row.id,
    jobTitle: row.job_title ?? '',
    linkedDriverId: row.linked_driver_id ?? '',
    name: row.full_name ?? '',
    personType: row.person_type ?? 'office',
    phone: row.phone ?? '',
    status: row.status ?? 'active',
    username: row.username ?? '',
  }
}

function mapCompanyAsset(row) {
  return {
    assetType: row.asset_type ?? 'forklift',
    code: row.code ?? '',
    companyId: row.company_id,
    id: row.id,
    location: row.location ?? '',
    model: row.model ?? '',
    serialNumber: row.serial_number ?? '',
    status: row.status ?? 'active',
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
    resolvedAt: row.resolved_at ?? '',
    resolvedBy: row.resolved_by ?? '',
    semitrailerId: row.semitrailer_id,
    status: row.status ?? 'open',
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
    repairCostCents: Number(row.repair_cost_cents ?? 0),
    repairCostCurrency: row.repair_cost_currency ?? 'EUR',
    repairNotes: row.repair_notes ?? '',
    repairRecordedAt: row.repair_recorded_at ?? '',
    repairRecordedBy: row.repair_recorded_by ?? '',
    semitrailerId: row.semitrailer_id,
    severity: row.severity,
    status: row.status,
    title: row.title,
    updatedAt: row.updated_at,
    vehicleId: row.vehicle_id,
  }
}

function mapCostEntry(row) {
  return {
    amountCents: Number(row.amount_cents ?? 0),
    assetId: row.asset_id ?? '',
    category: row.category ?? 'maintenance',
    companyId: row.company_id,
    createdAt: row.created_at,
    currency: row.currency ?? 'EUR',
    driverId: row.driver_id ?? '',
    fileBucket: row.file_bucket ?? '',
    filePath: row.file_path ?? '',
    id: row.id,
    notes: row.notes ?? '',
    odometerKm: row.odometer_km ?? '',
    sourceType: row.source_type ?? 'manual',
    spentAt: row.spent_at,
    supplier: row.supplier ?? '',
    title: row.title ?? 'Spesa',
    updatedAt: row.updated_at,
    vehicleId: row.vehicle_id ?? '',
  }
}

function mapDeliveryPod(row = {}) {
  return {
    code: row.code ?? '',
    companyId: row.company_id ?? '',
    createdAt: row.created_at ?? '',
    customerName: row.customer_name ?? '',
    deliveryDate: row.delivery_date ?? '',
    driverId: row.driver_id ?? '',
    id: row.id,
    notes: row.notes ?? '',
    proofFileBucket: row.proof_file_bucket ?? '',
    proofFilePath: row.proof_file_path ?? '',
    signatureName: row.signature_name ?? '',
    status: row.status ?? 'open',
    updatedAt: row.updated_at ?? '',
    vehicleId: row.vehicle_id ?? '',
  }
}

function mapCompanyAnnouncement(row = {}) {
  return {
    acknowledgedCount: Number(row.acknowledged_count ?? row.acknowledgedCount ?? 0),
    audienceType: row.audience_type ?? 'all',
    body: row.body ?? '',
    companyId: row.company_id ?? '',
    createdAt: row.created_at ?? '',
    id: row.id,
    publishedAt: row.published_at ?? '',
    readCount: Number(row.read_count ?? row.readCount ?? 0),
    requiresAck: Boolean(row.requires_ack ?? row.requiresAck ?? true),
    status: row.status ?? 'published',
    title: row.title ?? 'Comunicazione',
    updatedAt: row.updated_at ?? '',
  }
}

function mapCompanyProfile(row) {
  return {
    billingActivatedAt: row.billing_activated_at ?? '',
    billingAddonChat: Boolean(row.billing_addon_chat),
    billingAddonCostCenter: Boolean(row.billing_addon_cost_center),
    billingAddonReports: Boolean(row.billing_addon_reports),
    billingCustomerId: row.billing_customer_id ?? '',
    billingCurrentPeriodEnd: row.billing_current_period_end ?? '',
    billingEmail: row.billing_email ?? '',
    billingPlan: row.billing_plan ?? 'starter',
    billingProvider: row.billing_provider ?? 'manual',
    billingStatus: row.billing_status ?? 'active',
    billingStorageExtraGb: Number(row.billing_storage_extra_gb ?? 0),
    billingSubscriptionId: row.billing_subscription_id ?? '',
    headquarters: row.headquarters ?? '',
    id: row.id,
    logoPath: row.logo_path ?? '',
    name: row.name,
    vatNumber: row.vat_number ?? '',
  }
}

function mapCompanyInvoice(row) {
  return {
    amountCents: row.amount_cents ?? 0,
    companyId: row.company_id,
    createdAt: row.created_at,
    currency: row.currency ?? 'eur',
    dueAt: row.due_at ?? '',
    id: row.id,
    invoiceNumber: row.invoice_number,
    issuedAt: row.issued_at ?? '',
    paidAt: row.paid_at ?? '',
    pdfPath: row.pdf_path ?? '',
    status: row.status ?? 'draft',
    updatedAt: row.updated_at,
  }
}

function mapCompanyStorageSummary(row = {}) {
  return {
    chatBytes: Number(row.chat_bytes ?? 0),
    documentBytes: Number(row.document_bytes ?? 0),
    faultBytes: Number(row.fault_bytes ?? 0),
    fileCount: Number(row.file_count ?? 0),
    profileBytes: Number(row.profile_bytes ?? 0),
    totalBytes: Number(row.total_bytes ?? 0),
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
  billing_activated_at,
  billing_addon_chat,
  billing_addon_cost_center,
  billing_addon_reports,
  billing_storage_extra_gb
`

function isMissingBillingColumn(error) {
  return error?.code === '42703' && String(error.message ?? '').includes('billing_')
}

async function selectCompanyProfileById(supabase, companyId) {
  const billingResult = await supabase
    .from('companies')
    .select(companyProfileBillingSelectColumns)
    .eq('id', companyId)
    .maybeSingle()

  if (!isMissingBillingColumn(billingResult.error)) {
    return billingResult
  }

  return supabase.from('companies').select(companyProfileBaseSelectColumns).eq('id', companyId).maybeSingle()
}

async function registerCompanyStorageFile({
  bucket,
  category = 'other',
  companyId,
  documentId = null,
  driverId = null,
  file,
  filePath,
}) {
  if (!companyId || !filePath || !file) return

  const supabase = await getSupabaseClient()
  if (!supabase) return

  await supabase.rpc('register_company_storage_file', {
    file_size_bytes: file.size ?? 0,
    storage_bucket: bucket,
    storage_category: category,
    storage_path: filePath,
    target_company_id: companyId,
    target_document_id: documentId,
    target_driver_id: driverId,
  })
}

async function markCompanyStorageFileDeleted({ bucket, filePath }) {
  if (!bucket || !filePath || filePath.startsWith('blob:') || filePath.startsWith('http')) return

  const supabase = await getSupabaseClient()
  if (!supabase) return

  await supabase.rpc('mark_company_storage_file_deleted', {
    storage_bucket: bucket,
    storage_path: filePath,
  })
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

function mapTeamChatThread(row) {
  return {
    audienceType: row.audience_type ?? 'custom',
    companyId: row.company_id,
    createdAt: row.created_at,
    directKey: row.direct_key ?? '',
    id: row.id,
    lastMessageAt: row.last_message_at,
    status: row.status ?? 'open',
    threadType: row.thread_type ?? 'group',
    title: row.title ?? 'Gruppo',
    updatedAt: row.updated_at,
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

function mapTeamChatMessage(row) {
  return {
    attachmentPath: row.attachment_path ?? '',
    body: row.body ?? '',
    companyId: row.company_id,
    createdAt: row.created_at,
    id: row.id,
    readByCompanyAt: row.read_by_company_at ?? '',
    readByDriverAt: '',
    reactions: row.reactions ?? {},
    senderPersonId: row.sender_person_id ?? '',
    senderRole: row.sender_role,
    senderUserId: row.sender_user_id,
    threadId: row.thread_id,
  }
}

function mapVoiceCallSession(row = {}) {
  return {
    answeredAt: row.answered_at ?? '',
    callType: row.call_type ?? 'voice',
    callerDriverId: row.caller_driver_id ?? '',
    callerPersonId: row.caller_person_id ?? '',
    callerRole: row.caller_role ?? '',
    callerUserId: row.caller_user_id ?? '',
    companyId: row.company_id ?? '',
    createdAt: row.created_at ?? '',
    durationSeconds: Number(row.duration_seconds ?? 0),
    endedAt: row.ended_at ?? '',
    id: row.id,
    notes: row.notes ?? '',
    provider: row.provider ?? '',
    providerRoomId: row.provider_room_id ?? '',
    receiverDriverId: row.receiver_driver_id ?? '',
    receiverPersonId: row.receiver_person_id ?? '',
    receiverUserId: row.receiver_user_id ?? '',
    startedAt: row.started_at ?? '',
    status: row.status ?? 'ringing',
    teamThreadId: row.team_thread_id ?? '',
    threadId: row.thread_id ?? '',
    updatedAt: row.updated_at ?? '',
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

const teamChatThreadSelectColumns = `
  id,
  company_id,
  thread_type,
  audience_type,
  direct_key,
  title,
  status,
  last_message_at,
  created_at,
  updated_at
`

const teamChatMessageSelectColumns = `
  id,
  thread_id,
  company_id,
  sender_user_id,
  sender_person_id,
  sender_role,
  body,
  attachment_path,
  reactions,
  read_by_company_at,
  created_at
`

const teamChatMessageSelectColumnsWithoutReactions = `
  id,
  thread_id,
  company_id,
  sender_user_id,
  sender_person_id,
  sender_role,
  body,
  attachment_path,
  read_by_company_at,
  created_at
`

const voiceCallSessionSelectColumns = `
  id,
  company_id,
  thread_id,
  team_thread_id,
  caller_role,
  caller_user_id,
  caller_driver_id,
  caller_person_id,
  receiver_user_id,
  receiver_driver_id,
  receiver_person_id,
  call_type,
  status,
  started_at,
  answered_at,
  ended_at,
  duration_seconds,
  provider,
  provider_room_id,
  notes,
  created_at,
  updated_at
`

const faultReportSelectColumns = `
  id,
  company_id,
  driver_id,
  vehicle_id,
  semitrailer_id,
  severity,
  title,
  description,
  photo_path,
  repair_cost_cents,
  repair_cost_currency,
  repair_notes,
  repair_recorded_at,
  repair_recorded_by,
  status,
  created_at,
  updated_at
`

const costEntrySelectColumns = `
  id,
  company_id,
  vehicle_id,
  asset_id,
  driver_id,
  source_type,
  category,
  title,
  supplier,
  amount_cents,
  currency,
  spent_at,
  odometer_km,
  notes,
  file_bucket,
  file_path,
  created_at,
  updated_at
`

const faultReportLegacySelectColumns = `
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
`

function isMissingReactionsColumn(error) {
  return error?.code === '42703' && String(error.message ?? '').includes('reactions')
}

function isMissingDriverCheckPermissionColumn(error) {
  const message = String(error?.message ?? '')
  return ['42703', 'PGRST204'].includes(error?.code) && (
    message.includes('access_password') || message.includes('can_submit_checks')
  )
}

function isMissingWorkforceSchemaError(error) {
  return ['42P01', '42703', 'PGRST200', 'PGRST202', 'PGRST204'].includes(error?.code)
}

const driverSelectBaseColumns = 'id, company_id, username, auth_email, full_name, email, phone, profile_image_path, role, depot, status'
const driverSelectWithCheckColumns = 'id, company_id, username, auth_email, full_name, email, phone, profile_image_path, role, depot, can_submit_checks, access_password, status'
const companyPersonSelectBaseColumns = 'id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status'
const companyPersonSelectWithAccessColumns = 'id, company_id, user_id, linked_driver_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, access_password, status'

function isMissingAccessPasswordColumn(error) {
  const message = String(error?.message ?? '')
  return ['42703', 'PGRST204'].includes(error?.code) && message.includes('access_password')
}

function removeDriverCheckPermissionColumn(payload) {
  const fallbackPayload = { ...payload }
  delete fallbackPayload.access_password
  delete fallbackPayload.can_submit_checks
  return fallbackPayload
}

function toDriverPayload(driver, companyId = configuredCompanyId) {
  return {
    auth_email: driver.authEmail,
    access_password: driver.accessPassword || null,
    company_id: companyId,
    depot: driver.depot,
    email: driver.email || null,
    full_name: driver.name,
    phone: driver.phone,
    profile_image_path: driver.profileImagePath || null,
    role: driver.role,
    can_submit_checks: driver.canSubmitChecks ?? true,
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
  if ('canSubmitChecks' in updates) payload.can_submit_checks = updates.canSubmitChecks !== false
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

function toCompanyPersonPayload(person, companyId = configuredCompanyId) {
  return {
    auth_email: person.authEmail || null,
    access_password: person.accessPassword || null,
    company_id: companyId,
    department: person.department || 'office',
    depot: person.depot || null,
    email: person.email || null,
    full_name: person.name,
    job_title: person.jobTitle || null,
    person_type: person.personType || 'office',
    phone: person.phone || null,
    status: person.status || 'active',
    username: person.username,
  }
}

function toCompanyAssetPayload(asset, companyId = configuredCompanyId) {
  return {
    asset_type: asset.assetType || 'forklift',
    code: asset.code,
    company_id: companyId,
    location: asset.location || null,
    model: asset.model || null,
    serial_number: asset.serialNumber || null,
    status: asset.status || 'active',
  }
}

function toComplianceItemPayload(item, companyId = configuredCompanyId) {
  return {
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
}

function toLegacyComplianceItemPayload(item, companyId = configuredCompanyId) {
  return {
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

function normalizeComparable(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function getDocumentStatusFromExpiry(expiresAt, filePath = '') {
  if (expiresAt) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiryDate = new Date(`${expiresAt}T00:00:00`)

    if (!Number.isNaN(expiryDate.getTime()) && expiryDate < today) return 'expired'
  }

  return filePath ? 'uploaded' : 'missing'
}

function findMatchingDriverDocument(documents = [], item = {}, updates = {}) {
  const wantedType = normalizeComparable(updates.type || item.type)
  const wantedNumber = normalizeComparable(updates.documentNumber || item.documentNumber)

  return documents.find((document) => {
    const typeMatches = wantedType && normalizeComparable(document.type) === wantedType
    const numberMatches = wantedNumber && normalizeComparable(document.document_number) === wantedNumber

    return typeMatches || numberMatches
  }) ?? null
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

function clearStoredAuthSession() {
  if (typeof window === 'undefined' || !window.localStorage) return

  Object.keys(window.localStorage).forEach((key) => {
    if ((key.startsWith('sb-') && key.endsWith('-auth-token')) || key.includes('supabase.auth.token')) {
      window.localStorage.removeItem(key)
    }
  })
}

export async function fetchDrivers(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  let result = await supabase
    .from('drivers')
    .select(driverSelectWithCheckColumns)
    .eq('company_id', companyId)
    .order('full_name', { ascending: true })

  if (isMissingDriverCheckPermissionColumn(result.error)) {
    result = await supabase
      .from('drivers')
      .select(driverSelectBaseColumns)
      .eq('company_id', companyId)
      .order('full_name', { ascending: true })
  }

  const { data, error } = result
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
    const fallbackResult = await selectCompanyProfileById(supabase, configuredCompanyId)

    if (fallbackResult.data && !fallbackResult.error) {
      return { data: mapCompanyProfile(fallbackResult.data), error: null }
    }
  }

  const profile = Array.isArray(data) ? data[0] : data

  if (!profile?.id || error) {
    return { data: profile ? mapCompanyProfile(profile) : null, error }
  }

  const fullProfileResult = await selectCompanyProfileById(supabase, profile.id)

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

  const { data, error } = await selectCompanyProfileById(supabase, companyId)

  return { data: data ? mapCompanyProfile(data) : null, error }
}

export async function fetchCompanyInvoices(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('company_invoices')
    .select('id, company_id, invoice_number, issued_at, due_at, paid_at, amount_cents, currency, status, pdf_path, created_at, updated_at')
    .eq('company_id', companyId)
    .order('issued_at', { ascending: false, nullsFirst: false })

  if (error?.code === '42P01') {
    return { data: [], error: null, missingTable: true }
  }

  return { data: data ? data.map(mapCompanyInvoice) : [], error }
}

export async function fetchCompanyStorageSummary(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: mapCompanyStorageSummary(), error: null }
  }

  const { data, error } = await supabase.rpc('get_company_storage_summary', {
    target_company_id: companyId,
  })

  if (error?.code === '42883' || error?.code === '42P01') {
    return { data: mapCompanyStorageSummary(), error: null, missingTable: true }
  }

  const row = Array.isArray(data) ? data[0] : data
  return { data: mapCompanyStorageSummary(row), error }
}

export async function fetchLegalAcceptanceStatus({ accountRole = 'company', companyId = configuredCompanyId } = {}) {
  const supabase = await getSupabaseClient()
  const requiredDocuments = getRequiredLegalDocuments(accountRole)

  if (!supabase || !companyId) {
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
  companyId = configuredCompanyId,
  marketingAccepted = false,
} = {}) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

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
    },
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
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
      error: { message: 'Registro privacy non ancora attivo. Contatta assistenza Vygo.' },
    }
  }

  return { data, error }
}

export async function fetchAdminOverview() {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: { message: 'Servizio dati non configurato.' } }
  }

  const sessionResult = await supabase.auth.getSession()
  const accessToken = sessionResult.data?.session?.access_token

  if (!accessToken) {
    return { data: null, error: { message: 'Sessione admin mancante. Fai login e riprova.' } }
  }

  try {
    const response = await fetch('/.netlify/functions/admin-overview', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { data: null, error: { message: payload.error ?? 'Pannello admin non disponibile.' } }
    }

    return { data: payload, error: null }
  } catch {
    return {
      data: null,
      error: {
        message: 'Pannello admin non raggiungibile. Riprova dal sito online.',
      },
    }
  }
}

export async function fetchTransportNews({ language = 'it', refresh = false } = {}) {
  try {
    const params = new URLSearchParams({ language })
    if (refresh) params.set('refresh', '1')

    const response = await fetch(`/.netlify/functions/transport-news?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { data: null, error: { message: payload.error ?? 'Radar Trasporti non disponibile.' } }
    }

    return { data: payload, error: null }
  } catch {
    return {
      data: null,
      error: { message: 'Radar Trasporti non raggiungibile. Riprova piu tardi.' },
    }
  }
}

export async function updateAdminCompanyControl(companyId, updates = {}) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: { message: 'Servizio dati non configurato.' } }
  }

  const sessionResult = await supabase.auth.getSession()
  const accessToken = sessionResult.data?.session?.access_token

  if (!accessToken) {
    return { data: null, error: { message: 'Sessione admin mancante. Fai login e riprova.' } }
  }

  try {
    const response = await fetch('/.netlify/functions/admin-update-company', {
      body: JSON.stringify({ companyId, ...updates }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { data: null, error: { message: payload.error ?? 'Gestione cliente non aggiornata.' } }
    }

    return { data: payload, error: null }
  } catch {
    return {
      data: null,
      error: {
        message: 'Pannello admin non raggiungibile. Riprova dal sito online.',
      },
    }
  }
}

export async function markDriverDocumentStorageFileDeleted(filePath) {
  await markCompanyStorageFileDeleted({ bucket: driverDocumentsBucket, filePath })
}

export async function markCompanyAssetStorageFileDeleted(filePath) {
  await markCompanyStorageFileDeleted({ bucket: companyAssetsBucket, filePath })
}

export async function updateCompanyProfile(updates, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()
  const payload = toCompanyProfileUpdatePayload(updates)

  if (!supabase || !companyId || Object.keys(payload).length === 0) {
    return { data: null, error: null }
  }

  const billingResult = await supabase
    .from('companies')
    .update(payload)
    .eq('id', companyId)
    .select(companyProfileBillingSelectColumns)
    .maybeSingle()

  const { data, error } = isMissingBillingColumn(billingResult.error)
    ? await supabase
        .from('companies')
        .update(payload)
        .eq('id', companyId)
        .select(companyProfileBaseSelectColumns)
        .maybeSingle()
    : billingResult

  return { data: data ? mapCompanyProfile(data) : null, error }
}

export async function fetchVehicles(companyId = configuredCompanyId, options = {}) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  let query = supabase
    .from('vehicles')
    .select('id, plate, model, type, fleet_type, km, status')
    .eq('company_id', companyId)
    .order('plate', { ascending: true })

  if (!options.includeArchived) {
    query = query.neq('status', 'archived')
  }

  const { data, error } = await query

  return { data: data?.map(mapVehicle) ?? null, error }
}

export async function fetchCompanyPeople(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: [], error: null }
  }

  let result = await supabase
    .from('company_people')
    .select(companyPersonSelectWithAccessColumns)
    .eq('company_id', companyId)
    .neq('status', 'archived')
    .order('full_name', { ascending: true })

  if (isMissingAccessPasswordColumn(result.error)) {
    result = await supabase
      .from('company_people')
      .select(companyPersonSelectBaseColumns)
      .eq('company_id', companyId)
      .neq('status', 'archived')
      .order('full_name', { ascending: true })
  }

  const { data, error } = result

  if (isMissingWorkforceSchemaError(error)) {
    return { data: [], error: null, missingSchema: true }
  }

  return { data: data ? data.map(mapCompanyPerson) : [], error }
}

export async function fetchCompanyAssets(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('company_assets')
    .select('id, company_id, asset_type, code, model, serial_number, location, status')
    .eq('company_id', companyId)
    .neq('status', 'archived')
    .order('code', { ascending: true })

  if (isMissingWorkforceSchemaError(error)) {
    return { data: [], error: null, missingSchema: true }
  }

  return { data: data ? data.map(mapCompanyAsset) : [], error }
}

export async function fetchComplianceItems(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  let result = await supabase
    .from('compliance_items')
    .select(
      `
        id,
        type,
        scope,
        driver_id,
        vehicle_id,
        person_id,
        asset_id,
        due_date,
        reminder_days,
        owner,
        status,
        document_number,
        last_reminder_at,
        file_bucket,
        file_path
      `,
    )
    .eq('company_id', companyId)
    .neq('status', 'archived')
    .order('due_date', { ascending: true })

  if (isMissingWorkforceSchemaError(result.error)) {
    result = await supabase
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
  }

  const { data, error } = result

  return { data: data?.map(mapComplianceItem) ?? null, error }
}

export async function updateComplianceItemRecord(itemId, updates = {}, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId || !itemId) {
    return { data: null, error: null }
  }

  const payload = {}

  if ('documentNumber' in updates) payload.document_number = updates.documentNumber || null
  if ('dueDate' in updates) payload.due_date = updates.dueDate
  if ('lastReminderAt' in updates) payload.last_reminder_at = updates.lastReminderAt || null
  if ('owner' in updates) payload.owner = updates.owner || null
  if ('status' in updates) payload.status = updates.status
  if ('type' in updates) payload.type = updates.type

  if (Object.keys(payload).length === 0) {
    return { data: null, error: null }
  }

  let result = await supabase
    .from('compliance_items')
    .update(payload)
    .eq('company_id', companyId)
    .eq('id', itemId)
    .select(
      `
        id,
        type,
        scope,
        driver_id,
        vehicle_id,
        person_id,
        asset_id,
        due_date,
        reminder_days,
        owner,
        status,
        document_number,
        last_reminder_at,
        file_bucket,
        file_path
      `,
    )
    .single()

  if (isMissingWorkforceSchemaError(result.error)) {
    result = await supabase
      .from('compliance_items')
      .update(payload)
      .eq('company_id', companyId)
      .eq('id', itemId)
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
      .single()
  }

  return { data: result.data ? mapComplianceItem(result.data) : null, error: result.error }
}

export async function renewCompanyComplianceItem({ companyId = configuredCompanyId, file = null, item, updates = {} }) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId || !item?.id) {
    return { data: null, error: null }
  }

  let filePath = ''

  if (file) {
    const cleanFileName = sanitizeStorageFileName(file.name ?? `scadenza-${Date.now()}`)
    const subjectId = item.driverId || item.vehicleId || item.personId || item.assetId || 'azienda'
    filePath = `${companyId}/compliance/${item.scope}/${subjectId}/${Date.now()}-${cleanFileName}`
    const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(filePath, file, {
      cacheControl: '31536000',
      contentType: file.type || undefined,
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

  let result = await supabase
    .from('compliance_items')
    .update(payload)
    .eq('company_id', companyId)
    .eq('id', item.id)
    .select(
      `
        id,
        type,
        scope,
        driver_id,
        vehicle_id,
        person_id,
        asset_id,
        due_date,
        reminder_days,
        owner,
        status,
        document_number,
        last_reminder_at,
        file_bucket,
        file_path
      `,
    )
    .single()

  if ((result.error?.code === '42703' || result.error?.code === 'PGRST204') && filePath) {
    const fallbackPayload = {
      document_number: updates.documentNumber || null,
      due_date: updates.dueDate,
      owner: updates.owner || null,
      status: 'open',
      type: updates.type,
    }

    result = await supabase
      .from('compliance_items')
      .update(fallbackPayload)
      .eq('company_id', companyId)
      .eq('id', item.id)
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
      .single()
  }

  if (result.error) {
    if (filePath) await supabase.storage.from(companyAssetsBucket).remove([filePath])
    return { data: null, error: result.error }
  }

  if (file && filePath) {
    await registerCompanyStorageFile({
      bucket: companyAssetsBucket,
      category: 'document',
      companyId,
      file,
      filePath,
    })
  }

  if (item.scope === 'driver' && item.driverId) {
    const documentsResult = await supabase
      .from('driver_documents')
      .select('id, type, document_number, expires_at, file_path, status')
      .eq('company_id', companyId)
      .eq('driver_id', item.driverId)

    if (documentsResult.error) return { data: null, error: documentsResult.error }

    let targetDocument = findMatchingDriverDocument(documentsResult.data ?? [], item, updates)

    if (!targetDocument) {
      const insertResult = await supabase
        .from('driver_documents')
        .insert({
          company_id: companyId,
          document_number: updates.documentNumber || null,
          driver_id: item.driverId,
          expires_at: updates.dueDate || null,
          file_path: null,
          status: getDocumentStatusFromExpiry(updates.dueDate, ''),
          type: updates.type,
          visible_to_driver: true,
        })
        .select('id, type, document_number, expires_at, file_path, status')
        .single()

      if (insertResult.error) return { data: null, error: insertResult.error }
      targetDocument = insertResult.data
    }

    let driverDocumentFilePath = ''

    if (file) {
      const cleanFileName = sanitizeStorageFileName(file.name ?? `documento-${Date.now()}`)
      driverDocumentFilePath = `${companyId}/${item.driverId}/${targetDocument.id}/${Date.now()}-${cleanFileName}`
      const { error: documentUploadError } = await supabase.storage.from(driverDocumentsBucket).upload(driverDocumentFilePath, file, {
        cacheControl: '31536000',
        contentType: file.type || undefined,
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

    if (file && driverDocumentFilePath) {
      await registerCompanyStorageFile({
        bucket: driverDocumentsBucket,
        category: 'document',
        companyId,
        documentId: targetDocument.id,
        driverId: item.driverId,
        file,
        filePath: driverDocumentFilePath,
      })
    }
  }

  return { data: result.data ? mapComplianceItem(result.data) : null, error: null }
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
        status,
        resolved_at,
        resolved_by,
        created_at
      `,
    )
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(50)

  return { data: data?.map(mapVehicleCheck) ?? null, error }
}

export async function updateVehicleCheckStatus(checkId, status) {
  const supabase = await getSupabaseClient()

  if (!supabase || !checkId) {
    return { data: null, error: null }
  }

  const sessionResult = await supabase.auth.getSession()
  const userId = sessionResult.data?.session?.user?.id ?? null
  const payload = {
    resolved_at: status === 'resolved' ? new Date().toISOString() : null,
    resolved_by: status === 'resolved' ? userId : null,
    status,
  }

  const { data, error } = await supabase
    .from('vehicle_checks')
    .update(payload)
    .eq('id', checkId)
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
        status,
        resolved_at,
        resolved_by,
        created_at
      `,
    )
    .single()

  if (error?.code === '42703') {
    return {
      data: null,
      error: { message: 'Gestione stato check non ancora attiva. Contatta assistenza Vygo.' },
    }
  }

  return { data: data ? mapVehicleCheck(data) : null, error }
}

export async function fetchFaultReports(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  let { data, error } = await supabase
    .from('fault_reports')
    .select(faultReportSelectColumns)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error?.code === '42703') {
    const fallbackResult = await supabase
      .from('fault_reports')
      .select(faultReportLegacySelectColumns)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(50)

    data = fallbackResult.data
    error = fallbackResult.error
  }

  return { data: data?.map(mapFaultReport) ?? null, error }
}

export async function fetchCompanyCostEntries(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('cost_entries')
    .select(costEntrySelectColumns)
    .eq('company_id', companyId)
    .order('spent_at', { ascending: false })
    .limit(200)

  if (isMissingWorkforceSchemaError(error)) {
    return { data: [], error: null, missingSchema: true }
  }

  return { data: data?.map(mapCostEntry) ?? [], error }
}

export async function fetchDeliveryPods(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('delivery_pods')
    .select(
      'id, company_id, code, customer_name, delivery_date, driver_id, vehicle_id, status, signature_name, notes, proof_file_bucket, proof_file_path, created_at, updated_at',
    )
    .eq('company_id', companyId)
    .order('delivery_date', { ascending: false })
    .limit(120)

  if (isMissingWorkforceSchemaError(error)) {
    return { data: [], error: null, missingSchema: true }
  }

  return { data: data?.map(mapDeliveryPod) ?? [], error }
}

export async function fetchCompanyAnnouncements(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('company_announcements_with_counts')
    .select(
      'id, company_id, title, body, audience_type, requires_ack, status, published_at, read_count, acknowledged_count, created_at, updated_at',
    )
    .eq('company_id', companyId)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(80)

  if (isMissingWorkforceSchemaError(error)) {
    return { data: [], error: null, missingSchema: true }
  }

  return { data: data?.map(mapCompanyAnnouncement) ?? [], error }
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

export async function ensureDefaultTeamThreads(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase.rpc('ensure_default_team_threads', {
    target_company_id: companyId,
  })

  if (isMissingWorkforceSchemaError(error)) {
    return { data: null, error: null }
  }

  return { data, error }
}

export async function fetchTeamChatThreads(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('team_chat_threads')
    .select(teamChatThreadSelectColumns)
    .eq('company_id', companyId)
    .neq('status', 'archived')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(200)

  if (isMissingWorkforceSchemaError(error)) {
    return { data: [], error: null }
  }

  return { data: data?.map(mapTeamChatThread) ?? null, error }
}

export async function fetchTeamChatMessages(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  let { data, error } = await supabase
    .from('team_chat_messages')
    .select(teamChatMessageSelectColumns)
    .eq('company_id', companyId)
    .order('created_at', { ascending: true })
    .limit(700)

  if (isMissingReactionsColumn(error)) {
    const fallbackResult = await supabase
      .from('team_chat_messages')
      .select(teamChatMessageSelectColumnsWithoutReactions)
      .eq('company_id', companyId)
      .order('created_at', { ascending: true })
      .limit(700)

    data = fallbackResult.data
    error = fallbackResult.error
  }

  if (isMissingWorkforceSchemaError(error)) {
    return { data: [], error: null }
  }

  return { data: data?.map(mapTeamChatMessage) ?? null, error }
}

export async function ensureDirectTeamThread(companyId = configuredCompanyId, personId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId || !personId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase.rpc('ensure_direct_team_thread', {
    target_company_id: companyId,
    target_person_id: personId,
  })

  if (error?.code === '42883' || error?.code === 'PGRST202') {
    return {
      data: null,
      error: { message: 'Chat diretta personale non ancora attiva. Contatta assistenza Vygo.' },
    }
  }

  if (isMissingWorkforceSchemaError(error)) {
    return { data: null, error: null }
  }

  return { data: data ? mapTeamChatThread(data) : null, error }
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
        message: 'Area autista non raggiungibile. Riprova dal sito online.',
      },
    }
  }
}

export async function createDriverRecord(driver, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const payload = toDriverPayload(driver, companyId)
  let result = await supabase
    .from('drivers')
    .insert(payload)
    .select(driverSelectWithCheckColumns)
    .single()

  if (isMissingDriverCheckPermissionColumn(result.error)) {
    result = await supabase
      .from('drivers')
      .insert(removeDriverCheckPermissionColumn(payload))
      .select(driverSelectBaseColumns)
      .single()
  }

  const { data, error } = result
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
        message: 'Servizio online non raggiungibile. Riprova tra poco.',
      },
    }
  }
}

export async function createCompanyPerson(person, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const password = String(person.password ?? '').trim()

  if (password) {
    const sessionResult = await supabase.auth.getSession()
    const accessToken = sessionResult.data?.session?.access_token

    if (!accessToken) {
      return { data: null, error: { message: 'Sessione azienda mancante. Fai login e riprova.' } }
    }

    const cleanPerson = { ...person }
    delete cleanPerson.password

    try {
      const response = await fetch('/.netlify/functions/create-person', {
        body: JSON.stringify({ companyId, password, person: cleanPerson }),
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

      return { data: payload.person ?? null, error: null }
    } catch {
      return {
        data: null,
        error: {
          message: 'Servizio online non raggiungibile. Riprova tra poco.',
        },
      }
    }
  }

  const { data, error } = await supabase
    .from('company_people')
    .insert(toCompanyPersonPayload(person, companyId))
    .select(companyPersonSelectWithAccessColumns)
    .single()

  if (isMissingAccessPasswordColumn(error)) {
    const fallbackPayload = { ...toCompanyPersonPayload(person, companyId) }
    delete fallbackPayload.access_password
    const fallbackResult = await supabase
      .from('company_people')
      .insert(fallbackPayload)
      .select(companyPersonSelectBaseColumns)
      .single()

    if (isMissingWorkforceSchemaError(fallbackResult.error)) {
      return { data: null, error: { message: 'Persone e reparti non ancora attivi. Contatta assistenza Vygo.' } }
    }

    return { data: fallbackResult.data ? mapCompanyPerson(fallbackResult.data) : null, error: fallbackResult.error }
  }

  if (isMissingWorkforceSchemaError(error)) {
    return { data: null, error: { message: 'Persone e reparti non ancora attivi. Contatta assistenza Vygo.' } }
  }

  return { data: data ? mapCompanyPerson(data) : null, error }
}

export async function createCompanyAssetRecord(asset, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('company_assets')
    .insert(toCompanyAssetPayload(asset, companyId))
    .select('id, company_id, asset_type, code, model, serial_number, location, status')
    .single()

  if (isMissingWorkforceSchemaError(error)) {
    return { data: null, error: { message: 'Attrezzature e magazzino non ancora attivi. Contatta assistenza Vygo.' } }
  }

  return { data: data ? mapCompanyAsset(data) : null, error }
}

export async function resetCompanyAccessPassword({ password = '', targetId, targetType }, companyId = configuredCompanyId) {
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
    const response = await fetch('/.netlify/functions/reset-access-password', {
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
      error: {
        message: 'Servizio online non raggiungibile. Riprova tra poco.',
      },
    }
  }
}

export async function createComplianceItemRecord(item, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  let result = await supabase
    .from('compliance_items')
    .insert(toComplianceItemPayload(item, companyId))
    .select('id, type, scope, driver_id, vehicle_id, person_id, asset_id, due_date, reminder_days, owner, status, document_number, last_reminder_at, file_bucket, file_path')
    .single()

  if (isMissingWorkforceSchemaError(result.error) && ['person', 'asset'].includes(item.scope)) {
    return { data: null, error: { message: 'Scadenze persone e attrezzature non ancora attive. Contatta assistenza Vygo.' } }
  }

  if (result.error?.code === 'PGRST204' || result.error?.code === '42703') {
    result = await supabase
      .from('compliance_items')
      .insert(toLegacyComplianceItemPayload(item, companyId))
      .select('id, type, scope, driver_id, vehicle_id, due_date, reminder_days, owner, status, document_number, last_reminder_at')
      .single()
  }

  return { data: result.data ? mapComplianceItem(result.data) : null, error: result.error }
}

export async function updateDriverRecord(driverId, updates) {
  const supabase = await getSupabaseClient()

  if (!supabase || !driverId) {
    return { data: null, error: null }
  }

  const payload = toDriverUpdatePayload(updates)
  let result = await supabase
    .from('drivers')
    .update(payload)
    .eq('id', driverId)
    .select(driverSelectWithCheckColumns)
    .single()

  if (isMissingDriverCheckPermissionColumn(result.error) && 'can_submit_checks' in payload) {
    const fallbackPayload = removeDriverCheckPermissionColumn(payload)

    if (Object.keys(fallbackPayload).length === 0) {
      return {
        data: null,
        error: { message: 'Permesso check non salvato. Esegui il file SQL 51 in Supabase e riprova.' },
      }
    }

    result = await supabase
      .from('drivers')
      .update(fallbackPayload)
      .eq('id', driverId)
      .select(driverSelectBaseColumns)
      .single()
  }

  const { data, error } = result
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
      cacheControl: '31536000',
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
    .select(faultReportLegacySelectColumns)
    .single()

  if (error && photoPath) {
    await supabase.storage.from(companyAssetsBucket).remove([photoPath])
  }

  if (!error && photoFile && photoPath) {
    await registerCompanyStorageFile({
      bucket: companyAssetsBucket,
      category: 'fault',
      companyId,
      driverId: report.driverId,
      file: photoFile,
      filePath: photoPath,
    })
  }

  return { data: data ? mapFaultReport(data) : null, error }
}

export async function createCostEntryRecord(entry, companyId = configuredCompanyId, receiptFile = null) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  let filePath = entry.filePath ?? ''

  if (receiptFile) {
    const cleanFileName = sanitizeStorageFileName(receiptFile.name ?? `spesa-${Date.now()}`)
    filePath = `${companyId}/costs/${Date.now()}-${cleanFileName}`
    const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(filePath, receiptFile, {
      cacheControl: '31536000',
      contentType: receiptFile.type || undefined,
      upsert: false,
    })

    if (uploadError) {
      return { data: null, error: uploadError }
    }
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
    .select(costEntrySelectColumns)
    .single()

  if (error && filePath) {
    await supabase.storage.from(companyAssetsBucket).remove([filePath])
  }

  if (!error && receiptFile && filePath) {
    await registerCompanyStorageFile({
      bucket: companyAssetsBucket,
      category: 'other',
      companyId,
      file: receiptFile,
      filePath,
    })
  }

  if (isMissingWorkforceSchemaError(error)) {
    return {
      data: null,
      error: { message: 'Centro costi non ancora attivo. Contatta assistenza Vygo.' },
    }
  }

  return { data: data ? mapCostEntry(data) : null, error }
}

export async function createDeliveryPodRecord(pod, companyId = configuredCompanyId, proofFile = null) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  let proofFilePath = pod.proofFilePath ?? ''

  if (proofFile) {
    const cleanFileName = sanitizeStorageFileName(proofFile.name ?? `pod-${Date.now()}`)
    proofFilePath = `${companyId}/pods/${Date.now()}-${cleanFileName}`
    const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(proofFilePath, proofFile, {
      cacheControl: '31536000',
      contentType: proofFile.type || undefined,
      upsert: false,
    })

    if (uploadError) {
      return { data: null, error: uploadError }
    }
  }

  const sessionResult = await supabase.auth.getSession()
  const payload = {
    code: pod.code?.trim() || null,
    company_id: companyId,
    created_by_user_id: sessionResult.data?.session?.user?.id ?? null,
    customer_name: pod.customerName?.trim() || null,
    delivery_date: pod.deliveryDate || new Date().toISOString().slice(0, 10),
    driver_id: pod.driverId || null,
    notes: pod.notes?.trim() || null,
    proof_file_bucket: companyAssetsBucket,
    proof_file_path: proofFilePath || null,
    signature_name: pod.signatureName?.trim() || null,
    status: pod.status || (proofFilePath || pod.signatureName ? 'completed' : 'open'),
    vehicle_id: pod.vehicleId || null,
  }

  const { data, error } = await supabase
    .from('delivery_pods')
    .insert(payload)
    .select(
      'id, company_id, code, customer_name, delivery_date, driver_id, vehicle_id, status, signature_name, notes, proof_file_bucket, proof_file_path, created_at, updated_at',
    )
    .single()

  if (error && proofFilePath) {
    await supabase.storage.from(companyAssetsBucket).remove([proofFilePath])
  }

  if (!error && proofFile && proofFilePath) {
    await registerCompanyStorageFile({
      bucket: companyAssetsBucket,
      category: 'document',
      companyId,
      file: proofFile,
      filePath: proofFilePath,
    })
  }

  if (isMissingWorkforceSchemaError(error)) {
    return {
      data: null,
      error: { message: 'POD digitale non ancora attivo. Esegui il file SQL 58 e riprova.' },
    }
  }

  return { data: data ? mapDeliveryPod(data) : null, error }
}

export async function createCompanyAnnouncementRecord(announcement, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const sessionResult = await supabase.auth.getSession()
  const payload = {
    audience_type: announcement.audienceType || 'all',
    body: announcement.body?.trim() || '',
    company_id: companyId,
    created_by_user_id: sessionResult.data?.session?.user?.id ?? null,
    published_at: new Date().toISOString(),
    requires_ack: announcement.requiresAck !== false,
    status: 'published',
    title: announcement.title?.trim() || 'Comunicazione aziendale',
  }

  const { data, error } = await supabase
    .from('company_announcements')
    .insert(payload)
    .select(
      'id, company_id, title, body, audience_type, requires_ack, status, published_at, created_at, updated_at',
    )
    .single()

  if (isMissingWorkforceSchemaError(error)) {
    return {
      data: null,
      error: { message: 'Presa visione non ancora attiva. Esegui il file SQL 58 e riprova.' },
    }
  }

  return { data: data ? mapCompanyAnnouncement(data) : null, error }
}

export async function updateCostEntryRecord(entryId, updates = {}, companyId = configuredCompanyId, receiptFile = null, previousFilePath = '') {
  const supabase = await getSupabaseClient()

  if (!supabase || !entryId) {
    return { data: null, error: null }
  }

  let filePath = updates.filePath ?? previousFilePath ?? ''

  if (receiptFile && companyId) {
    const cleanFileName = sanitizeStorageFileName(receiptFile.name ?? `spesa-${Date.now()}`)
    filePath = `${companyId}/costs/${Date.now()}-${cleanFileName}`
    const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(filePath, receiptFile, {
      cacheControl: '31536000',
      contentType: receiptFile.type || undefined,
      upsert: false,
    })

    if (uploadError) {
      return { data: null, error: uploadError }
    }
  }

  const payload = {
    amount_cents: Number(updates.amountCents ?? 0),
    asset_id: updates.assetId || null,
    category: updates.category || 'maintenance',
    currency: updates.currency || 'EUR',
    driver_id: updates.driverId || null,
    file_bucket: companyAssetsBucket,
    file_path: filePath || null,
    notes: updates.notes?.trim() || null,
    odometer_km: updates.odometerKm ? Number(updates.odometerKm) : null,
    source_type: updates.sourceType || 'manual',
    spent_at: updates.spentAt,
    supplier: updates.supplier?.trim() || null,
    title: updates.title?.trim() || 'Spesa',
    updated_at: new Date().toISOString(),
    vehicle_id: updates.vehicleId || null,
  }

  const { data, error } = await supabase
    .from('cost_entries')
    .update(payload)
    .eq('id', entryId)
    .select(costEntrySelectColumns)
    .single()

  if (error && receiptFile && filePath && filePath !== previousFilePath) {
    await supabase.storage.from(companyAssetsBucket).remove([filePath])
  }

  if (!error && receiptFile && filePath) {
    await registerCompanyStorageFile({
      bucket: companyAssetsBucket,
      category: 'other',
      companyId,
      file: receiptFile,
      filePath,
    })
    await markCompanyStorageFileDeleted({ bucket: companyAssetsBucket, filePath: previousFilePath })
  }

  if (isMissingWorkforceSchemaError(error)) {
    return {
      data: null,
      error: { message: 'Centro costi non ancora attivo. Contatta assistenza Vygo.' },
    }
  }

  return { data: data ? mapCostEntry(data) : null, error }
}

export async function deleteCostEntryRecord(entry) {
  const supabase = await getSupabaseClient()
  const entryId = typeof entry === 'string' ? entry : entry?.id
  const filePath = typeof entry === 'string' ? '' : entry?.filePath

  if (!supabase || !entryId) {
    return { data: null, error: null }
  }

  const { error } = await supabase.from('cost_entries').delete().eq('id', entryId)

  if (isMissingWorkforceSchemaError(error)) {
    return {
      data: null,
      error: { message: 'Centro costi non ancora attivo. Contatta assistenza Vygo.' },
    }
  }

  if (!error && filePath) {
    await markCompanyStorageFileDeleted({ bucket: companyAssetsBucket, filePath })
  }

  return { data: null, error }
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
      cacheControl: '31536000',
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

  if (!error && attachmentFile && attachmentPath) {
    await registerCompanyStorageFile({
      bucket: companyAssetsBucket,
      category: 'chat',
      companyId,
      file: attachmentFile,
      filePath: attachmentPath,
    })
  }

  return { data: data ? mapChatMessage(data) : null, error }
}

export async function createTeamChatMessageRecord(message, companyId = configuredCompanyId, attachmentFile = null) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId || !message?.threadId) {
    return { data: null, error: null }
  }

  let attachmentPath = message.attachmentPath ?? ''

  if (attachmentFile) {
    const cleanFileName = sanitizeStorageFileName(attachmentFile.name)
    attachmentPath = `${companyId}/team-chat/${message.threadId}/${Date.now()}-${cleanFileName}`
    const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(attachmentPath, attachmentFile, {
      cacheControl: '31536000',
      contentType: attachmentFile.type || undefined,
      upsert: false,
    })

    if (uploadError) {
      return { data: null, error: uploadError }
    }
  }

  const payload = {
    attachment_path: attachmentPath || null,
    body: message.body?.trim() || null,
    company_id: companyId,
    sender_person_id: message.senderPersonId || null,
    sender_role: message.senderRole,
    thread_id: message.threadId,
  }

  let { data, error } = await supabase
    .from('team_chat_messages')
    .insert(payload)
    .select(teamChatMessageSelectColumns)
    .single()

  if (isMissingReactionsColumn(error)) {
    const fallbackResult = await supabase
      .from('team_chat_messages')
      .insert(payload)
      .select(teamChatMessageSelectColumnsWithoutReactions)
      .single()

    data = fallbackResult.data
    error = fallbackResult.error
  }

  if (error && attachmentPath) {
    await supabase.storage.from(companyAssetsBucket).remove([attachmentPath])
  }

  if (!error && attachmentFile && attachmentPath) {
    await registerCompanyStorageFile({
      bucket: companyAssetsBucket,
      category: 'chat',
      companyId,
      file: attachmentFile,
      filePath: attachmentPath,
    })
  }

  if (isMissingWorkforceSchemaError(error)) {
    return { data: null, error: { message: 'Chat gruppi e reparti non ancora attiva. Contatta assistenza Vygo.' } }
  }

  return { data: data ? mapTeamChatMessage(data) : null, error }
}

export async function createVoiceCallSessionRecord(call, companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  const now = new Date().toISOString()
  const payload = {
    call_type: 'voice',
    caller_driver_id: call.callerDriverId || null,
    caller_person_id: call.callerPersonId || null,
    caller_role: call.callerRole || 'company',
    company_id: companyId,
    notes: call.notes || null,
    receiver_driver_id: call.receiverDriverId || null,
    receiver_person_id: call.receiverPersonId || null,
    started_at: now,
    status: call.status || 'ringing',
    team_thread_id: call.teamThreadId || null,
    thread_id: call.threadId || null,
  }

  const { data, error } = await supabase
    .from('voice_call_sessions')
    .insert(payload)
    .select(voiceCallSessionSelectColumns)
    .single()

  if (isMissingWorkforceSchemaError(error)) {
    return {
      data: null,
      error: { message: 'Chiamate vocali non ancora attive per questa azienda.' },
    }
  }

  return { data: data ? mapVoiceCallSession(data) : null, error }
}

export async function markChatMessagesRead(threadId, readerRole) {
  const supabase = await getSupabaseClient()

  if (!supabase || !threadId || !['company', 'driver'].includes(readerRole)) {
    return { data: null, error: null }
  }

  const sessionResult = await supabase.auth.getSession()
  const accessToken = sessionResult.data?.session?.access_token

  if (accessToken) {
    try {
      const response = await fetch('/.netlify/functions/mark-chat-read', {
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
        return { data: null, error: { message: payload.error ?? 'Lettura chat non aggiornata.' } }
      }
    } catch {
      // Fall back to the direct client update below for local/offline development.
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

export async function markTeamThreadRead(threadId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !threadId) {
    return { data: 0, error: null }
  }

  const { data, error } = await supabase.rpc('mark_team_thread_read', {
    target_thread_id: threadId,
  })

  if (error?.code === '42883' || error?.code === 'PGRST202') {
    return { data: 0, error: null }
  }

  return { data: Number(data ?? 0), error }
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
        message: 'Reazioni chat non ancora attive. Contatta assistenza Vygo.',
      },
    }
  }

  return { data: data ? mapChatMessage(data) : null, error }
}

export async function updateTeamChatMessageReaction(message, actorRole, reaction) {
  const supabase = await getSupabaseClient()

  if (!supabase || !message?.id) {
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
      error: {
        message: 'Reazioni gruppi non ancora attive. Contatta assistenza Vygo.',
      },
    }
  }

  return { data: data ? mapTeamChatMessage(data) : null, error }
}

export async function updateFaultReportStatus(reportId, status, repair = {}) {
  const supabase = await getSupabaseClient()

  if (!supabase || !reportId) {
    return { data: null, error: null }
  }

  const sessionResult = await supabase.auth.getSession()
  const accessToken = sessionResult.data?.session?.access_token

  if (accessToken) {
    try {
      const response = await fetch('/.netlify/functions/update-fault', {
        body: JSON.stringify({ repair, reportId, status }),
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
    .select(faultReportSelectColumns)
    .single()

  if (error?.code === '42703' && hasRepairUpdate) {
    return {
      data: null,
      error: { message: 'Costi guasti non ancora attivi. Contatta assistenza Vygo.' },
    }
  }

  if (error?.code === '42703') {
    const fallbackResult = await supabase
      .from('fault_reports')
      .update({ status })
      .eq('id', reportId)
      .select(faultReportLegacySelectColumns)
      .single()

    data = fallbackResult.data
    error = fallbackResult.error
  }

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
    cacheControl: '31536000',
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

  await registerCompanyStorageFile({
    bucket: driverDocumentsBucket,
    category: 'document',
    companyId,
    documentId: document.id,
    driverId: document.driverId,
    file,
    filePath,
  })
  await markCompanyStorageFileDeleted({ bucket: driverDocumentsBucket, filePath: document.filePath })

  return { data: data ? mapDriverDocument(data) : null, error: null }
}

export async function uploadCompanyLogoFile(file, companyId = configuredCompanyId, previousLogoPath = '') {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId || !file) {
    return { data: null, error: null }
  }

  const cleanFileName = sanitizeStorageFileName(file.name)
  const filePath = `${companyId}/company-logo/${Date.now()}-${cleanFileName}`
  const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(filePath, file, {
    cacheControl: '31536000',
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

  await registerCompanyStorageFile({
    bucket: companyAssetsBucket,
    category: 'logo',
    companyId,
    file,
    filePath,
  })
  await markCompanyStorageFileDeleted({ bucket: companyAssetsBucket, filePath: previousLogoPath })

  return { data: data ? mapCompanyProfile(data) : null, error: null }
}

export async function uploadDriverProfileImageFile(driverId, file, companyId = configuredCompanyId, previousProfileImagePath = '') {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId || !driverId || !file) {
    return { data: null, error: null }
  }

  const cleanFileName = sanitizeStorageFileName(file.name)
  const filePath = `${companyId}/drivers/${driverId}/profile/${Date.now()}-${cleanFileName}`
  const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(filePath, file, {
    cacheControl: '31536000',
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

  await registerCompanyStorageFile({
    bucket: companyAssetsBucket,
    category: 'profile',
    companyId,
    driverId,
    file,
    filePath,
  })
  await markCompanyStorageFileDeleted({ bucket: companyAssetsBucket, filePath: previousProfileImagePath })

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

  const ttlSeconds = 86400
  const cacheKey = `${driverDocumentsBucket}:${filePath}`
  const cachedSignedUrl = getCachedSignedUrl(cacheKey)
  if (cachedSignedUrl) return { data: { signedUrl: cachedSignedUrl }, error: null }

  const result = await supabase.storage.from(driverDocumentsBucket).createSignedUrl(filePath, ttlSeconds)
  rememberSignedUrl(cacheKey, result.data?.signedUrl, ttlSeconds)
  return result
}

export async function createCompanyAssetSignedUrl(filePath) {
  const supabase = await getSupabaseClient()

  if (!supabase || !filePath) {
    return { data: null, error: null }
  }

  const ttlSeconds = 86400
  const cacheKey = `${companyAssetsBucket}:${filePath}`
  const cachedSignedUrl = getCachedSignedUrl(cacheKey)
  if (cachedSignedUrl) return { data: { signedUrl: cachedSignedUrl }, error: null }

  const result = await supabase.storage.from(companyAssetsBucket).createSignedUrl(filePath, ttlSeconds)
  rememberSignedUrl(cacheKey, result.data?.signedUrl, ttlSeconds)
  return result
}

export async function createCompanyInvoiceSignedUrl(filePath) {
  const supabase = await getSupabaseClient()

  if (!supabase || !filePath) {
    return { data: null, error: null }
  }

  const ttlSeconds = 600
  const cacheKey = `${companyInvoicesBucket}:${filePath}`
  const cachedSignedUrl = getCachedSignedUrl(cacheKey)
  if (cachedSignedUrl) return { data: { signedUrl: cachedSignedUrl }, error: null }

  const result = await supabase.storage.from(companyInvoicesBucket).createSignedUrl(filePath, ttlSeconds)
  rememberSignedUrl(cacheKey, result.data?.signedUrl, ttlSeconds)
  return result
}

export async function createBillingCheckoutSession({ billingProfile, companyId = configuredCompanyId, plan }) {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: null, demo: true }
  }

  const sessionResult = await supabase.auth.getSession()
  const accessToken = sessionResult.data?.session?.access_token

  if (!accessToken) {
    return { data: null, error: { message: 'Sessione azienda mancante. Fai login e riprova.' } }
  }

  try {
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      body: JSON.stringify({
        billingProfile,
        companyId,
        plan,
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const responsePayload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { data: null, error: { message: responsePayload.error ?? 'Checkout non avviato.' } }
    }

    return { data: responsePayload, error: null }
  } catch {
    return { data: null, error: { message: 'Checkout non raggiungibile. Riprova dal sito online.' } }
  }
}

export async function createBillingPortalSession(companyId = configuredCompanyId) {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: null, demo: true }
  }

  const sessionResult = await supabase.auth.getSession()
  const accessToken = sessionResult.data?.session?.access_token

  if (!accessToken) {
    return { data: null, error: { message: 'Sessione azienda mancante. Fai login e riprova.' } }
  }

  try {
    const response = await fetch('/.netlify/functions/create-billing-portal', {
      body: JSON.stringify({ companyId }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const responsePayload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return { data: null, error: { message: responsePayload.error ?? 'Portale fatturazione non aperto.' } }
    }

    return { data: responsePayload, error: null }
  } catch {
    return { data: null, error: { message: 'Portale fatturazione non raggiungibile. Riprova dal sito online.' } }
  }
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

export async function subscribeToTeamChatMessages(companyId, onMessage) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return () => {}
  }

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
      (payload) => {
        onMessage?.(null, payload)
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
      (payload) => {
        onMessage?.(null, payload)
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

  const sessionResult = await supabase.auth.getSession()
  const session = sessionResult.data?.session

  if (sessionResult.error || !session) {
    return sessionResult
  }

  const userResult = await supabase.auth.getUser()

  if (userResult.error || !userResult.data?.user) {
    await supabase.auth.signOut().catch(() => {})
    clearStoredAuthSession()
    return { data: { session: null }, error: userResult.error }
  }

  return {
    data: {
      session: {
        ...session,
        user: userResult.data.user,
      },
    },
    error: null,
  }
}

export function hasPasswordRecoveryUrlParams() {
  if (typeof window === 'undefined') return false

  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))

  return (
    searchParams.get('type') === 'recovery' ||
    hashParams.get('type') === 'recovery' ||
    searchParams.get('recovery') === '1'
  )
}

function cleanPasswordRecoveryUrl() {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  url.searchParams.delete('code')
  url.searchParams.delete('type')
  url.searchParams.delete('recovery')
  window.history.replaceState({}, '', `${url.pathname}${url.search}`)
}

export async function sendPasswordRecoveryEmail(email) {
  const supabase = await getSupabaseClient()
  const cleanEmail = String(email ?? '').trim().toLowerCase()

  if (!supabase) {
    return { data: null, error: null, demo: true }
  }

  if (!cleanEmail) {
    return { data: null, error: { message: 'Inserisci prima la email aziendale.' } }
  }

  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/?type=recovery` : undefined

  return supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo })
}

export async function updatePasswordFromRecovery(password) {
  const supabase = await getSupabaseClient()
  const cleanPassword = String(password ?? '').trim()

  if (!supabase) {
    return { data: null, error: null, demo: true }
  }

  if (cleanPassword.length < 8) {
    return { data: null, error: { message: 'La nuova password deve avere almeno 8 caratteri.' } }
  }

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const hashParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.hash.replace(/^#/, '')) : new URLSearchParams()
  const code = searchParams.get('code')
  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')

  let sessionResult = await supabase.auth.getSession()

  if (!sessionResult.data?.session && code) {
    const exchangeResult = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeResult.error) return exchangeResult
    sessionResult = await supabase.auth.getSession()
  }

  if (!sessionResult.data?.session && accessToken && refreshToken) {
    const setSessionResult = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    if (setSessionResult.error) return setSessionResult
    sessionResult = await supabase.auth.getSession()
  }

  if (!sessionResult.data?.session) {
    return {
      data: null,
      error: { message: 'Link di recupero scaduto o non valido. Richiedi una nuova email di reset.' },
    }
  }

  const updateResult = await supabase.auth.updateUser({ password: cleanPassword })

  if (updateResult.error) return updateResult

  cleanPasswordRecoveryUrl()

  return {
    data: {
      user: updateResult.data?.user ?? sessionResult.data.session.user,
    },
    error: null,
  }
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
        message: 'Servizio notifiche non raggiungibile. Riprova dal sito online.',
      },
    }
  }
}

export async function signUpCompany({
  email,
  password,
  companyName,
  marketingAccepted = false,
  privacyAccepted = false,
  termsAccepted = false,
}) {
  const supabase = await getSupabaseClient()
  const cleanCompanyName = companyName?.trim() ?? ''
  const emailRedirectTo = typeof window !== 'undefined' ? window.location.origin : undefined
  const acceptedAt = new Date().toISOString()

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
        legal_marketing_accepted: Boolean(marketingAccepted),
        legal_marketing_version: legalDocumentVersions.marketing,
        legal_privacy_accepted: Boolean(privacyAccepted),
        legal_privacy_accepted_at: privacyAccepted ? acceptedAt : null,
        legal_privacy_version: legalDocumentVersions.privacy,
        legal_terms_accepted: Boolean(termsAccepted),
        legal_terms_accepted_at: termsAccepted ? acceptedAt : null,
        legal_terms_version: legalDocumentVersions.terms,
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

  const driverAuthDomain = import.meta.env.VITE_DRIVER_AUTH_DOMAIN ?? 'drivers.vy-go.com'
  const cleanUsername = username.trim().toLowerCase()
  const loginEmails = cleanUsername.includes('@')
    ? [cleanUsername]
    : [driverAuthDomain, 'drivers.camionchiaro.app', 'drivers.vy-go.com', 'drivers.vygo.app']
        .filter(Boolean)
        .filter((domain, index, domains) => domains.indexOf(domain) === index)
        .map((domain) => `${cleanUsername}@${domain}`)

  let lastError = null

  for (const email of loginEmails) {
    const result = await supabase.auth.signInWithPassword({ email, password })

    if (!result.error) return result

    lastError = result.error
    if (!String(result.error.message ?? '').toLowerCase().includes('invalid')) return result
  }

  return { data: null, error: lastError }
}

export async function signOut() {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { error: null, demo: true }
  }

  const result = await supabase.auth.signOut()
  clearStoredAuthSession()
  return result
}
