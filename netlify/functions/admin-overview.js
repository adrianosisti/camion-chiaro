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
  business: 65000,
  enterprise: 150000,
  fleet10: 45000,
  fleet20: 65000,
  fleet30: 85000,
  fleet50: 120000,
  pro: 45000,
  starter: 30000,
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
  return ['42P01', '42703', '42883'].includes(error?.code)
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

function buildCompanySummary(company, collections) {
  const companyId = company.id
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
  const monthlyPlanCents = billingStatus === 'active' ? getMonthlyPlanCents(company.billing_plan ?? 'starter') : 0
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
    billingStatus !== 'active'
      ? 'billing'
      : alertCount > 0
        ? 'attention'
        : storageBytes > storageLimitBytes * 0.85
          ? 'storage'
          : 'ok'

  return {
    alertCount,
    adminNextFollowUp: control.next_follow_up ?? '',
    adminNotes: control.notes ?? '',
    adminOwnerName: control.owner_name ?? '',
    adminPriority: control.priority ?? 'normal',
    adminSalesStage: control.sales_stage ?? 'active',
    adminUpdatedAt: control.updated_at ?? '',
    billingEmail: company.billing_email ?? '',
    billingPlan: company.billing_plan ?? 'starter',
    billingProvider: company.billing_provider ?? 'manual',
    billingStatus,
    costMonthCents,
    createdAt: company.created_at ?? '',
    documentExpiredCount: expiredDocuments.length,
    driverCount: drivers.filter((driver) => !isArchivedStatus(driver.status)).length,
    fleetCount: vehicles.filter((vehicle) => !isArchivedStatus(vehicle.status)).length,
    health,
    headquarters: company.headquarters ?? '',
    id: companyId,
    invoiceMonthCents,
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
    vatNumber: company.vat_number ?? '',
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
    let companies = await safeSelect(
      serviceClient,
      'companies',
      'id, name, vat_number, headquarters, created_at, updated_at, billing_plan, billing_status, billing_email, billing_provider, billing_current_period_end',
      issues,
      { orderBy: 'created_at', limit: 500 },
    )

    if (!companies.length && issues.some((issue) => issue.includes('billing_'))) {
      companies = await safeSelect(
        serviceClient,
        'companies',
        'id, name, vat_number, headquarters, created_at, updated_at',
        issues,
        { orderBy: 'created_at', limit: 500 },
      )
    }

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
      safeSelect(serviceClient, 'drivers', 'company_id, status, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'vehicles', 'company_id, status, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'company_people', 'company_id, department, status, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'company_assets', 'company_id, status, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'compliance_items', 'company_id, status, due_date, scope, type', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'driver_documents', 'company_id, status, expires_at, file_path', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'vehicle_checks', 'company_id, status, lights_ok, tires_ok, documents_on_board, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'fault_reports', 'company_id, status, severity, repair_cost_cents, repair_recorded_at, updated_at, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'cost_entries', 'company_id, amount_cents, spent_at, category, currency, updated_at, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'chat_messages', 'company_id, sender_role, read_by_company_at, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'team_chat_messages', 'company_id, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'company_storage_files', 'company_id, size_bytes, category, deleted_at, created_at', issues, { limit: 10000 }),
      safeSelect(serviceClient, 'company_invoices', 'company_id, invoice_number, issued_at, paid_at, amount_cents, currency, status, created_at', issues, { limit: 10000 }),
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
    const companySummaries = companies.map((company) => buildCompanySummary(company, collections))
    const summary = companySummaries.reduce(
      (totals, company) => ({
        activeCompanies: totals.activeCompanies + (company.billingStatus === 'active' ? 1 : 0),
        alertCount: totals.alertCount + company.alertCount,
        companyCount: totals.companyCount + 1,
        costMonthCents: totals.costMonthCents + company.costMonthCents,
        driverCount: totals.driverCount + company.driverCount,
        fleetCount: totals.fleetCount + company.fleetCount,
        invoiceMonthCents: totals.invoiceMonthCents + company.invoiceMonthCents,
        lifetimeRevenueCents: totals.lifetimeRevenueCents + company.lifetimeRevenueCents,
        mrrCents: totals.mrrCents + company.monthlyPlanCents,
        storageBytes: totals.storageBytes + company.storageBytes,
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
        storageBytes: 0,
      },
    )

    return jsonResponse(200, {
      generatedAt: new Date().toISOString(),
      issues,
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
