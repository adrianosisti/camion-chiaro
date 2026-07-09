import { createClient } from '@supabase/supabase-js'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

const fallbackAdminEmails = ['sisti.adriano@icloud.com']
const storagePlanLimitsBytes = {
  enterprise: 100 * 1024 * 1024 * 1024,
  fleet10: 20 * 1024 * 1024 * 1024,
  fleet20: 30 * 1024 * 1024 * 1024,
  fleet30: 50 * 1024 * 1024 * 1024,
  fleet50: 75 * 1024 * 1024 * 1024,
  starter: 10 * 1024 * 1024 * 1024,
}
const monthlyPlanAmountsCents = {
  business: 69900,
  enterprise: 150000,
  fleet10: 44900,
  fleet20: 69900,
  fleet30: 89900,
  fleet50: 119900,
  pro: 44900,
  starter: 29900,
}

function jsonResponse(statusCode, body) {
  return {
    body: JSON.stringify(body),
    headers: jsonHeaders,
    statusCode,
  }
}

function getAdminEmails() {
  const configuredEmails = String(process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return new Set(configuredEmails.length ? configuredEmails : fallbackAdminEmails)
}

function isMissingRelation(error) {
  return ['42P01', '42703', '42883', 'PGRST204', 'PGRST205'].includes(error?.code)
    || String(error?.message ?? '').toLowerCase().includes('could not find')
}

async function safeSelect(serviceClient, tableName, columns, issues, options = {}) {
  let query = serviceClient.from(tableName).select(columns)

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? false })
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (!error) return data ?? []

  if (isMissingRelation(error)) {
    issues.push(`${tableName}: ${error.message}`)
    return []
  }

  throw error
}

async function fetchCompanies(serviceClient, issues) {
  const baseColumns = 'id, name, vat_number, headquarters, created_at, updated_at'
  const fullColumns = `${baseColumns}, billing_plan, billing_status, billing_email, billing_provider, billing_current_period_end, billing_addon_pallex_tariffs`
  const options = { orderBy: 'created_at', limit: 500 }
  const companies = await safeSelect(serviceClient, 'companies', fullColumns, issues, options)

  if (companies.length || !issues.some((issue) => issue.startsWith('companies:'))) {
    return companies
  }

  const fallbackCompanies = await safeSelect(serviceClient, 'companies', baseColumns, issues, options)

  return fallbackCompanies.map((company) => ({
    ...company,
    billing_email: '',
    billing_addon_pallex_tariffs: false,
    billing_plan: 'starter',
    billing_provider: 'manual',
    billing_status: 'active',
  }))
}

function isArchivedStatus(value) {
  return ['archived', 'Archiviato'].includes(value)
}

function isClosedStatus(value) {
  return ['closed', 'archived', 'done', 'resolved'].includes(value)
}

function getDaysUntil(value) {
  if (!value) return Number.POSITIVE_INFINITY

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)

  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY
  return Math.ceil((date - today) / 86400000)
}

function isCurrentMonth(value) {
  if (!value) return false

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false

  const now = new Date()
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

function getCompanyRows(rows, companyId) {
  return rows.filter((row) => row.company_id === companyId)
}

function getLatestDate(...values) {
  const timestamps = values
    .flat()
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter(Number.isFinite)

  if (!timestamps.length) return ''
  return new Date(Math.max(...timestamps)).toISOString()
}

function getStorageLimitBytes(plan) {
  return storagePlanLimitsBytes[plan] ?? storagePlanLimitsBytes.starter
}

function getMonthlyPlanCents(plan) {
  return monthlyPlanAmountsCents[plan] ?? monthlyPlanAmountsCents.starter
}

function isPaidInvoice(invoice) {
  return ['paid', 'succeeded'].includes(invoice.status) || Boolean(invoice.paid_at)
}

function isRecentActivity(value, days = 7) {
  if (!value) return false
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return false
  return Date.now() - timestamp <= days * 86400000
}

function buildUsageChecklist({ company, compliance, costs, documents, drivers, faults, people, teamMessages, vehicles, checks }) {
  const activeDrivers = drivers.filter((driver) => !isArchivedStatus(driver.status))
  const activePeople = people.filter((person) => !isArchivedStatus(person.status))
  const activeVehicles = vehicles.filter((vehicle) => !isArchivedStatus(vehicle.status))
  const checklist = [
    { id: 'profile', label: 'Azienda configurata', done: Boolean(company.name) },
    { id: 'people', label: 'Persone create', done: activeDrivers.length + activePeople.length > 0 },
    { id: 'fleet', label: 'Flotta inserita', done: activeVehicles.length > 0 },
    { id: 'documents', label: 'Documenti e scadenze', done: documents.length + compliance.length > 0 },
    { id: 'checks', label: 'Check provato', done: checks.length > 0 },
    { id: 'faults', label: 'Guasti provati', done: faults.length > 0 },
    { id: 'chat', label: 'Chat usata', done: teamMessages.length > 0 },
    { id: 'costs', label: 'Centro costi provato', done: costs.length > 0 || faults.some((fault) => Number(fault.repair_cost_cents ?? 0) > 0) },
  ]
  const doneCount = checklist.filter((item) => item.done).length

  return {
    checklist,
    doneCount,
    score: checklist.length ? Math.round((doneCount / checklist.length) * 100) : 0,
    totalCount: checklist.length,
  }
}

function addActivityEvent(events, { createdAt, detail, id, kind, title }) {
  if (!createdAt) return

  events.push({
    createdAt,
    detail,
    id: id || `${kind}-${createdAt}-${events.length}`,
    kind,
    title,
  })
}

function buildActivityTimeline({ assets, chatMessages, checks, compliance, costs, documents, drivers, faults, invoices, people, teamMessages, vehicles }) {
  const events = []

  drivers.forEach((driver, index) => addActivityEvent(events, {
    createdAt: driver.created_at,
    detail: driver.full_name || driver.username || 'Autista senza nome',
    id: `driver-${driver.id || index}`,
    kind: 'Anagrafica',
    title: 'Autista creato',
  }))
  people.forEach((person, index) => addActivityEvent(events, {
    createdAt: person.created_at,
    detail: `${person.full_name || 'Persona aziendale'}${person.department ? ` · ${person.department}` : ''}`,
    id: `person-${person.id || index}`,
    kind: 'Anagrafica',
    title: 'Persona creata',
  }))
  vehicles.forEach((vehicle, index) => addActivityEvent(events, {
    createdAt: vehicle.created_at,
    detail: `${vehicle.plate || 'Targa non indicata'}${vehicle.fleet_type ? ` · ${vehicle.fleet_type}` : ''}`,
    id: `vehicle-${vehicle.id || index}`,
    kind: 'Flotta',
    title: 'Mezzo inserito',
  }))
  assets.forEach((asset, index) => addActivityEvent(events, {
    createdAt: asset.created_at,
    detail: `${asset.code || asset.model || 'Attrezzatura'}${asset.asset_type ? ` · ${asset.asset_type}` : ''}`,
    id: `asset-${asset.id || index}`,
    kind: 'Magazzino',
    title: 'Attrezzatura inserita',
  }))
  compliance.forEach((item, index) => addActivityEvent(events, {
    createdAt: item.updated_at || item.created_at || item.due_date,
    detail: `${item.type || 'Scadenza'} · ${item.status || 'open'}${item.due_date ? ` · ${item.due_date}` : ''}`,
    id: `deadline-${item.id || index}`,
    kind: 'Scadenze',
    title: 'Scadenza gestita',
  }))
  documents.forEach((document, index) => addActivityEvent(events, {
    createdAt: document.updated_at || document.created_at || document.expires_at,
    detail: `${document.type || 'Documento'} · ${document.status || 'caricato'}${document.expires_at ? ` · scade ${document.expires_at}` : ''}`,
    id: `document-${document.id || index}`,
    kind: 'Documenti',
    title: 'Documento caricato',
  }))
  checks.forEach((check, index) => addActivityEvent(events, {
    createdAt: check.created_at,
    detail: check.lights_ok === false || check.tires_ok === false || check.documents_on_board === false
      ? 'Check con anomalia'
      : 'Check completato senza anomalie',
    id: `check-${check.id || index}`,
    kind: 'Check',
    title: 'Check mattutino ricevuto',
  }))
  faults.forEach((fault, index) => addActivityEvent(events, {
    createdAt: fault.updated_at || fault.created_at,
    detail: `${fault.title || 'Segnalazione guasto'} · ${fault.status || 'open'}${Number(fault.repair_cost_cents ?? 0) > 0 ? ` · costo ${Math.round(Number(fault.repair_cost_cents) / 100)} ${fault.repair_cost_currency || 'EUR'}` : ''}`,
    id: `fault-${fault.id || index}`,
    kind: 'Guasti',
    title: 'Guasto segnalato',
  }))
  costs.forEach((entry, index) => addActivityEvent(events, {
    createdAt: entry.updated_at || entry.created_at || entry.spent_at,
    detail: `${entry.title || entry.category || 'Spesa'} · ${Math.round(Number(entry.amount_cents ?? 0) / 100)} ${entry.currency || 'EUR'}`,
    id: `cost-${entry.id || index}`,
    kind: 'Costi',
    title: 'Costo registrato',
  }))
  chatMessages.forEach((message, index) => addActivityEvent(events, {
    createdAt: message.created_at,
    detail: `${message.sender_role || 'utente'} · messaggio diretto`,
    id: `chat-${message.id || index}`,
    kind: 'Chat',
    title: 'Messaggio diretto',
  }))
  teamMessages.forEach((message, index) => addActivityEvent(events, {
    createdAt: message.created_at,
    detail: 'Messaggio in gruppo o reparto',
    id: `team-chat-${message.id || index}`,
    kind: 'Chat gruppi',
    title: 'Messaggio gruppo',
  }))
  invoices.forEach((invoice, index) => addActivityEvent(events, {
    createdAt: invoice.paid_at || invoice.issued_at || invoice.created_at,
    detail: `${invoice.invoice_number || 'Fattura'} · ${invoice.status || 'creata'}`,
    id: `invoice-${invoice.id || index}`,
    kind: 'Fatture',
    title: invoice.paid_at ? 'Fattura pagata' : 'Fattura registrata',
  }))

  return events
    .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
    .slice(0, 32)
}

function buildCompanySummary(company, collections, options = {}) {
  const companyId = company.id
  const isInternalAdminCompany =
    options.adminCompanyIds?.has(companyId) ||
    options.adminEmails?.has(String(company.billing_email ?? '').trim().toLowerCase())
  const drivers = getCompanyRows(collections.drivers, companyId)
  const vehicles = getCompanyRows(collections.vehicles, companyId)
  const people = getCompanyRows(collections.people, companyId)
  const assets = getCompanyRows(collections.assets, companyId)
  const compliance = getCompanyRows(collections.compliance, companyId)
  const documents = getCompanyRows(collections.documents, companyId)
  const checks = getCompanyRows(collections.checks, companyId)
  const faults = getCompanyRows(collections.faults, companyId)
  const costs = getCompanyRows(collections.costs, companyId)
  const invoices = getCompanyRows(collections.invoices, companyId)
  const control = getCompanyRows(collections.controls, companyId)[0] ?? {}
  const chatMessages = getCompanyRows(collections.chatMessages, companyId)
  const teamMessages = getCompanyRows(collections.teamMessages, companyId)
  const storageFiles = getCompanyRows(collections.storageFiles, companyId).filter((file) => !file.deleted_at)
  const openFaults = faults.filter((fault) => !isClosedStatus(fault.status))
  const criticalChecks = checks.filter(
    (check) =>
      !isClosedStatus(check.status) &&
      (check.lights_ok === false || check.tires_ok === false || check.documents_on_board === false),
  )
  const urgentDeadlines = compliance.filter((item) => !isClosedStatus(item.status) && getDaysUntil(item.due_date) <= 30)
  const expiredDocuments = documents.filter(
    (document) =>
      !isClosedStatus(document.status) &&
      (document.status === 'expired' || getDaysUntil(document.expires_at) < 0),
  )
  const storageBytes = storageFiles.reduce((total, file) => total + Number(file.size_bytes ?? 0), 0)
  const storageLimitBytes = getStorageLimitBytes(company.billing_plan)
  const billingStatus = company.billing_status ?? 'active'
  const monthlyPlanCents = !isInternalAdminCompany && billingStatus === 'active' ? getMonthlyPlanCents(company.billing_plan ?? 'starter') : 0
  const paidInvoices = invoices.filter(isPaidInvoice)
  const lifetimeRevenueCents = paidInvoices.reduce((total, invoice) => total + Number(invoice.amount_cents ?? 0), 0)
  const invoiceMonthCents = paidInvoices
    .filter((invoice) => isCurrentMonth(invoice.paid_at || invoice.issued_at || invoice.created_at))
    .reduce((total, invoice) => total + Number(invoice.amount_cents ?? 0), 0)
  const costMonthCents =
    costs
      .filter((entry) => isCurrentMonth(entry.spent_at))
      .reduce((total, entry) => total + Number(entry.amount_cents ?? 0), 0) +
    faults
      .filter((fault) => Number(fault.repair_cost_cents ?? 0) > 0)
      .filter((fault) => isCurrentMonth(fault.repair_recorded_at || fault.updated_at || fault.created_at))
      .reduce((total, fault) => total + Number(fault.repair_cost_cents ?? 0), 0)
  const usageChecklist = buildUsageChecklist({
    checks,
    company,
    compliance,
    costs,
    documents,
    drivers,
    faults,
    people,
    teamMessages,
    vehicles,
  })
  const activityTimeline = buildActivityTimeline({
    assets,
    chatMessages,
    checks,
    compliance,
    costs,
    documents,
    drivers,
    faults,
    invoices,
    people,
    teamMessages,
    vehicles,
  })
  const weekActivityCount = [
    ...drivers.map((row) => row.created_at),
    ...vehicles.map((row) => row.created_at),
    ...people.map((row) => row.created_at),
    ...assets.map((row) => row.created_at),
    ...checks.map((row) => row.created_at),
    ...faults.map((row) => row.updated_at || row.created_at),
    ...costs.map((row) => row.updated_at || row.created_at),
    ...chatMessages.map((row) => row.created_at),
    ...teamMessages.map((row) => row.created_at),
  ].filter((value) => isRecentActivity(value, 7)).length
  const latestActivityAt = getLatestDate(
    company.updated_at,
    drivers.map((row) => row.created_at),
    vehicles.map((row) => row.created_at),
    people.map((row) => row.created_at),
    assets.map((row) => row.created_at),
    checks.map((row) => row.created_at),
    faults.map((row) => row.updated_at || row.created_at),
    costs.map((row) => row.updated_at || row.created_at),
    chatMessages.map((row) => row.created_at),
    teamMessages.map((row) => row.created_at),
  )
  const alertCount = openFaults.length + criticalChecks.length + urgentDeadlines.length + expiredDocuments.length
  const health =
    isInternalAdminCompany
      ? 'internal'
      : billingStatus !== 'active'
      ? 'billing'
      : alertCount > 0
        ? 'attention'
        : storageBytes > storageLimitBytes * 0.85
          ? 'storage'
          : 'ok'

  return {
    alertCount,
    activityTimeline,
    adminNextFollowUp: control.next_follow_up ?? '',
    adminNotes: control.notes ?? '',
    adminOwnerName: control.owner_name ?? '',
    adminPriority: control.priority ?? 'normal',
    adminSalesStage: control.sales_stage ?? 'active',
    adminUpdatedAt: control.updated_at ?? '',
    billingEmail: company.billing_email ?? '',
    billingAddonPallexTariffs: Boolean(company.billing_addon_pallex_tariffs),
    billingPlan: company.billing_plan ?? 'starter',
    billingProvider: company.billing_provider ?? 'manual',
    billingStatus: isInternalAdminCompany ? 'internal' : billingStatus,
    costMonthCents,
    createdAt: company.created_at ?? '',
    documentExpiredCount: expiredDocuments.length,
    driverCount: drivers.filter((driver) => !isArchivedStatus(driver.status)).length,
    fleetCount: vehicles.filter((vehicle) => !isArchivedStatus(vehicle.status)).length,
    health,
    headquarters: company.headquarters ?? '',
    id: companyId,
    invoiceMonthCents,
    isInternalAdminCompany,
    lastActivityAt: latestActivityAt,
    lifetimeRevenueCents,
    monthlyPlanCents,
    name: company.name ?? 'Azienda',
    openFaultCount: openFaults.length,
    peopleCount: people.filter((person) => !isArchivedStatus(person.status)).length,
    storageBytes,
    storageFileCount: storageFiles.length,
    storageLimitBytes,
    storageUsagePercent: storageLimitBytes ? Math.min(100, Math.round((storageBytes / storageLimitBytes) * 100)) : 0,
    toolCount: assets.filter((asset) => !isArchivedStatus(asset.status)).length,
    unreadChatCount: chatMessages.filter((message) => message.sender_role === 'driver' && !message.read_by_company_at).length,
    urgentCheckCount: criticalChecks.length,
    urgentDeadlineCount: urgentDeadlines.length,
    usageChecklist: usageChecklist.checklist,
    usageDoneCount: usageChecklist.doneCount,
    usageScore: usageChecklist.score,
    usageTotalCount: usageChecklist.totalCount,
    vatNumber: company.vat_number ?? '',
    weekActivityCount,
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(204, {})
  }

  if (event.httpMethod !== 'GET') {
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
    return jsonResponse(401, { error: 'Sessione admin mancante. Fai login e riprova.' })
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
    return jsonResponse(401, { error: 'Sessione admin non valida. Fai login e riprova.' })
  }

  const adminEmails = getAdminEmails()
  const userEmail = String(authData.user.email ?? '').toLowerCase()

  if (!adminEmails.has(userEmail)) {
    return jsonResponse(403, {
      error: 'Account non autorizzato al Pannello Admin. Aggiungi la mail in ADMIN_EMAILS su Netlify.',
    })
  }

  const issues = []

  try {
    const companies = await fetchCompanies(serviceClient, issues)

    const { data: adminMembershipRows, error: adminMembershipError } = await serviceClient
      .from('company_members')
      .select('company_id')
      .eq('user_id', authData.user.id)

    if (adminMembershipError) {
      if (isMissingRelation(adminMembershipError)) {
        issues.push(`company_members: ${adminMembershipError.message}`)
      } else {
        throw adminMembershipError
      }
    }

    const adminCompanyIds = new Set((adminMembershipRows ?? []).map((row) => row.company_id).filter(Boolean))

    const [
      drivers,
      vehicles,
      people,
      assets,
      compliance,
      documents,
      checks,
      faults,
      costs,
      chatMessages,
      teamMessages,
      storageFiles,
      invoices,
      controls,
    ] = await Promise.all([
      safeSelect(serviceClient, 'drivers', 'id, company_id, full_name, username, status, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'vehicles', 'id, company_id, plate, fleet_type, status, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'company_people', 'id, company_id, full_name, department, person_type, status, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'company_assets', 'id, company_id, asset_type, code, model, status, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'compliance_items', 'id, company_id, status, due_date, scope, type, created_at, updated_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'driver_documents', 'id, company_id, status, expires_at, type, file_path, created_at, updated_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'vehicle_checks', 'id, company_id, status, lights_ok, tires_ok, documents_on_board, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'fault_reports', 'id, company_id, status, severity, title, repair_cost_cents, repair_cost_currency, repair_recorded_at, updated_at, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'cost_entries', 'id, company_id, amount_cents, spent_at, category, title, currency, updated_at, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'chat_messages', 'id, company_id, sender_role, read_by_company_at, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'team_chat_messages', 'id, company_id, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'company_storage_files', 'company_id, size_bytes, category, deleted_at, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'company_invoices', 'id, company_id, invoice_number, issued_at, paid_at, amount_cents, currency, status, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'admin_company_controls', 'company_id, sales_stage, priority, owner_name, next_follow_up, notes, updated_at', issues, { limit: 10000 }),
    ])

    const collections = {
      assets,
      chatMessages,
      checks,
      compliance,
      controls,
      costs,
      documents,
      drivers,
      faults,
      invoices,
      people,
      storageFiles,
      teamMessages,
      vehicles,
    }
    const companySummaries = companies.map((company) => buildCompanySummary(company, collections, {
      adminCompanyIds,
      adminEmails,
    }))
    const summary = companySummaries.reduce(
      (totals, company) => ({
        activeCompanies: totals.activeCompanies + (!company.isInternalAdminCompany && company.billingStatus === 'active' ? 1 : 0),
        alertCount: totals.alertCount + (!company.isInternalAdminCompany ? company.alertCount : 0),
        companyCount: totals.companyCount + (!company.isInternalAdminCompany ? 1 : 0),
        costMonthCents: totals.costMonthCents + company.costMonthCents,
        driverCount: totals.driverCount + company.driverCount,
        fleetCount: totals.fleetCount + company.fleetCount,
        invoiceMonthCents: totals.invoiceMonthCents + company.invoiceMonthCents,
        lifetimeRevenueCents: totals.lifetimeRevenueCents + company.lifetimeRevenueCents,
        mrrCents: totals.mrrCents + company.monthlyPlanCents,
        readyCompanyCount: totals.readyCompanyCount + (!company.isInternalAdminCompany && company.usageScore >= 82 ? 1 : 0),
        storageBytes: totals.storageBytes + company.storageBytes,
        weekActivityCount: totals.weekActivityCount + company.weekActivityCount,
      }),
      {
        activeCompanies: 0,
        alertCount: 0,
        companyCount: 0,
        costMonthCents: 0,
        driverCount: 0,
        fleetCount: 0,
        invoiceMonthCents: 0,
        lifetimeRevenueCents: 0,
        mrrCents: 0,
        readyCompanyCount: 0,
        storageBytes: 0,
        weekActivityCount: 0,
      },
    )

    return jsonResponse(200, {
      generatedAt: new Date().toISOString(),
      issues,
      diagnostics: {
        companyRows: companies.length,
        issueCount: issues.length,
      },
      overview: {
        companies: companySummaries.sort((first, second) => {
          if (first.health !== second.health) {
            const order = { billing: 0, attention: 1, storage: 2, ok: 3 }
            return order[first.health] - order[second.health]
          }

          return new Date(second.lastActivityAt || second.createdAt) - new Date(first.lastActivityAt || first.createdAt)
        }),
        summary,
      },
    })
  } catch (error) {
    return jsonResponse(500, { error: error.message ?? 'Pannello admin non disponibile.' })
  }
}
