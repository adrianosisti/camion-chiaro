import { createClient } from '@supabase/supabase-js'
import webPush from 'web-push'

const reminderDaysDefault = [60, 30, 15, 7, 1, 0]
const romeTimeZone = 'Europe/Rome'

function jsonResponse(statusCode, body) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: statusCode,
  })
}

function getRomeParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    month: '2-digit',
    timeZone: romeTimeZone,
    year: 'numeric',
  }).formatToParts(date)

  return Object.fromEntries(parts.map((part) => [part.type, part.value]))
}

function getRomeDateKey(date = new Date()) {
  const parts = getRomeParts(date)
  return `${parts.year}-${parts.month}-${parts.day}`
}

function getRomeHour(date = new Date()) {
  return Number(getRomeParts(date).hour)
}

function addDaysToDateKey(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function getDaysUntil(dateKey, todayKey) {
  const due = new Date(`${dateKey}T00:00:00.000Z`)
  const today = new Date(`${todayKey}T00:00:00.000Z`)
  return Math.round((due - today) / 86400000)
}

function shouldSendReminder(dateKey, reminderDays, todayKey) {
  if (!dateKey) return false
  const daysUntil = getDaysUntil(dateKey, todayKey)
  if (daysUntil < 0) return true
  return (reminderDays?.length ? reminderDays : reminderDaysDefault).includes(daysUntil)
}

function getDueLabel(dateKey, todayKey) {
  const daysUntil = getDaysUntil(dateKey, todayKey)
  if (daysUntil < 0) return `scaduta da ${Math.abs(daysUntil)} giorni`
  if (daysUntil === 0) return 'scade oggi'
  if (daysUntil === 1) return 'scade domani'
  return `scade tra ${daysUntil} giorni`
}

async function fetchNativePushTokens(serviceClient, companyId, recipientUserIds) {
  if (!recipientUserIds.length) return { data: [], error: null }

  const { data, error } = await serviceClient
    .from('native_push_tokens')
    .select('id, expo_push_token')
    .eq('company_id', companyId)
    .in('user_id', recipientUserIds)
    .is('disabled_at', null)

  if (['42P01', '42703'].includes(error?.code)) return { data: [], error: null }
  return { data: data ?? [], error }
}

async function sendExpoPushNotifications(tokens, notificationPayload) {
  if (!tokens.length) return { failed: 0, invalidTokenIds: [], sent: 0 }

  const messages = tokens.map((token) => ({
    body: notificationPayload.body,
    data: {
      notificationType: notificationPayload.notificationType,
      tag: notificationPayload.tag,
      url: notificationPayload.url,
    },
    sound: 'default',
    title: notificationPayload.title,
    to: token.expo_push_token,
  }))

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    body: JSON.stringify(messages),
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) return { failed: tokens.length, invalidTokenIds: [], sent: 0 }

  const results = Array.isArray(payload.data) ? payload.data : [payload.data]
  const invalidTokenIds = []
  let sent = 0

  results.forEach((result, index) => {
    if (result?.status === 'ok') {
      sent += 1
      return
    }

    if (result?.details?.error === 'DeviceNotRegistered' && tokens[index]?.id) {
      invalidTokenIds.push(tokens[index].id)
    }
  })

  return {
    failed: Math.max(0, tokens.length - sent),
    invalidTokenIds,
    sent,
  }
}

async function sendPushToUsers(serviceClient, config, companyId, recipientUserIds, payload) {
  const uniqueUserIds = [...new Set(recipientUserIds.filter(Boolean))]
  if (!uniqueUserIds.length) return { failed: 0, sent: 0, skipped: true }

  const nativeTokensResult = await fetchNativePushTokens(serviceClient, companyId, uniqueUserIds)
  if (nativeTokensResult.error) throw nativeTokensResult.error

  let subscriptions = []
  if (config.webPushConfigured) {
    const subscriptionsResult = await serviceClient
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('company_id', companyId)
      .in('user_id', uniqueUserIds)
      .is('disabled_at', null)

    if (subscriptionsResult.error) throw subscriptionsResult.error
    subscriptions = subscriptionsResult.data ?? []
  }

  const nativeTokens = nativeTokensResult.data ?? []
  if (!subscriptions.length && !nativeTokens.length) return { failed: 0, sent: 0, skipped: true }

  let webResults = []
  if (config.webPushConfigured && subscriptions.length) {
    webPush.setVapidDetails(config.vapidSubject, config.vapidPublicKey, config.vapidPrivateKey)
    webResults = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.auth,
              p256dh: subscription.p256dh,
            },
          },
          JSON.stringify(payload),
        ),
      ),
    )
  }

  const nativeResult = await sendExpoPushNotifications(nativeTokens, payload)
  const expiredSubscriptionIds = webResults
    .map((result, index) => ({ result, subscription: subscriptions[index] }))
    .filter(({ result }) => {
      const statusCode = result.reason?.statusCode
      return result.status === 'rejected' && [404, 410].includes(statusCode)
    })
    .map(({ subscription }) => subscription.id)

  if (expiredSubscriptionIds.length) {
    await serviceClient
      .from('push_subscriptions')
      .update({ disabled_at: new Date().toISOString() })
      .in('id', expiredSubscriptionIds)
  }

  if (nativeResult.invalidTokenIds.length) {
    await serviceClient
      .from('native_push_tokens')
      .update({ disabled_at: new Date().toISOString() })
      .in('id', nativeResult.invalidTokenIds)
  }

  const webSent = webResults.filter((result) => result.status === 'fulfilled').length
  const webFailed = webResults.length - webSent

  return {
    failed: webFailed + nativeResult.failed,
    sent: webSent + nativeResult.sent,
    skipped: false,
  }
}

async function getCompanyMemberUserIds(serviceClient, companyId) {
  const { data, error } = await serviceClient
    .from('company_members')
    .select('user_id')
    .eq('company_id', companyId)
    .in('role', ['owner', 'admin', 'operator'])

  if (error) throw error
  return (data ?? []).map((member) => member.user_id).filter(Boolean)
}

async function getDriverUserId(serviceClient, companyId, driverId) {
  if (!driverId) return ''

  const { data, error } = await serviceClient
    .from('drivers')
    .select('user_id')
    .eq('company_id', companyId)
    .eq('id', driverId)
    .maybeSingle()

  if (error) throw error
  return data?.user_id ?? ''
}

async function getPersonUserId(serviceClient, companyId, personId) {
  if (!personId) return ''

  const { data, error } = await serviceClient
    .from('company_people')
    .select('user_id')
    .eq('company_id', companyId)
    .eq('id', personId)
    .maybeSingle()

  if (['42P01', '42703'].includes(error?.code)) return ''
  if (error) throw error
  return data?.user_id ?? ''
}

async function hasReminderLog(serviceClient, companyId, recipient) {
  const { data, error } = await serviceClient
    .from('reminder_logs')
    .select('id')
    .eq('company_id', companyId)
    .eq('recipient', recipient)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return Boolean(data?.id)
}

async function saveReminderLog(serviceClient, entry) {
  const { error } = await serviceClient.from('reminder_logs').insert(entry)
  if (error) throw error
}

async function processReminder(serviceClient, config, reminder) {
  const recipientUserIds = [...new Set(reminder.recipientUserIds.filter(Boolean))]
  if (!recipientUserIds.length) return { skipped: 1, sent: 0 }

  let sent = 0
  let skipped = 0

  for (const userId of recipientUserIds) {
    const recipient = `${reminder.logKey}:${userId}`
    const alreadySent = await hasReminderLog(serviceClient, reminder.companyId, recipient)
    if (alreadySent) {
      skipped += 1
      continue
    }

    const result = await sendPushToUsers(serviceClient, config, reminder.companyId, [userId], reminder.payload)
    await saveReminderLog(serviceClient, {
      channel: 'push',
      company_id: reminder.companyId,
      compliance_item_id: reminder.complianceItemId || null,
      driver_id: reminder.driverId || null,
      payload: {
        ...reminder.payload,
        source: reminder.source,
        sourceId: reminder.sourceId,
      },
      recipient,
      status: result.sent > 0 ? 'sent' : 'queued',
    })

    if (result.sent > 0) sent += result.sent
    else skipped += 1
  }

  return { skipped, sent }
}

async function getComplianceReminders(serviceClient, todayKey) {
  const maxDateKey = addDaysToDateKey(todayKey, 60)
  const { data, error } = await serviceClient
    .from('compliance_items')
    .select('id, company_id, driver_id, person_id, vehicle_id, asset_id, scope, type, due_date, reminder_days, status')
    .lte('due_date', maxDateKey)
    .not('status', 'in', '("done","archived")')

  if (error) throw error
  return (data ?? []).filter((item) => shouldSendReminder(item.due_date, item.reminder_days, todayKey))
}

async function getDriverDocumentReminders(serviceClient, todayKey) {
  const maxDateKey = addDaysToDateKey(todayKey, 60)
  const { data, error } = await serviceClient
    .from('driver_documents')
    .select('id, company_id, driver_id, type, expires_at, status, visible_to_driver')
    .lte('expires_at', maxDateKey)
    .neq('status', 'archived')

  if (error) throw error
  return (data ?? []).filter((item) => item.expires_at && shouldSendReminder(item.expires_at, reminderDaysDefault, todayKey))
}

export default async function handler() {
  const now = new Date()
  const localHour = getRomeHour(now)

  if (localHour !== 10) {
    return jsonResponse(200, { skipped: true, reason: 'Fuori orario 10:00 Europe/Rome.' })
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const vapidPublicKey = process.env.WEB_PUSH_PUBLIC_KEY ?? process.env.VITE_WEB_PUSH_PUBLIC_KEY
  const vapidPrivateKey = process.env.WEB_PUSH_PRIVATE_KEY
  const vapidSubject = process.env.WEB_PUSH_SUBJECT ?? 'mailto:info@vyko.app'

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return jsonResponse(500, { error: 'Configurazione Supabase Netlify mancante.' })
  }

  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  const config = {
    vapidPrivateKey,
    vapidPublicKey,
    vapidSubject,
    webPushConfigured: Boolean(vapidPublicKey && vapidPrivateKey),
  }
  const todayKey = getRomeDateKey(now)
  const [complianceItems, driverDocuments] = await Promise.all([
    getComplianceReminders(serviceClient, todayKey),
    getDriverDocumentReminders(serviceClient, todayKey),
  ])

  const companyUsersCache = new Map()
  async function companyUsers(companyId) {
    if (!companyUsersCache.has(companyId)) {
      companyUsersCache.set(companyId, await getCompanyMemberUserIds(serviceClient, companyId))
    }
    return companyUsersCache.get(companyId)
  }

  let sent = 0
  let skipped = 0

  for (const item of complianceItems) {
    const companyRecipientIds = await companyUsers(item.company_id)
    const userRecipientIds = []

    if (item.driver_id) userRecipientIds.push(await getDriverUserId(serviceClient, item.company_id, item.driver_id))
    if (item.person_id) userRecipientIds.push(await getPersonUserId(serviceClient, item.company_id, item.person_id))

    const recipientUserIds = [...companyRecipientIds, ...userRecipientIds]
    const reminder = await processReminder(serviceClient, config, {
      companyId: item.company_id,
      complianceItemId: item.id,
      driverId: item.driver_id,
      logKey: `deadline:${todayKey}:compliance:${item.id}`,
      payload: {
        body: `${item.type} ${getDueLabel(item.due_date, todayKey)}.`,
        notificationType: 'deadline',
        tag: `deadline-${item.id}-${todayKey}`,
        title: 'Scadenza Vyko',
        url: '/?view=deadlines',
      },
      recipientUserIds,
      source: 'compliance_item',
      sourceId: item.id,
    })

    sent += reminder.sent
    skipped += reminder.skipped

    await serviceClient
      .from('compliance_items')
      .update({ last_reminder_at: new Date().toISOString() })
      .eq('id', item.id)
  }

  for (const document of driverDocuments) {
    const companyRecipientIds = await companyUsers(document.company_id)
    const driverUserId = document.visible_to_driver
      ? await getDriverUserId(serviceClient, document.company_id, document.driver_id)
      : ''

    const reminder = await processReminder(serviceClient, config, {
      companyId: document.company_id,
      driverId: document.driver_id,
      logKey: `deadline:${todayKey}:driver-document:${document.id}`,
      payload: {
        body: `${document.type} ${getDueLabel(document.expires_at, todayKey)}.`,
        notificationType: 'deadline',
        tag: `driver-document-${document.id}-${todayKey}`,
        title: 'Documento in scadenza',
        url: '/?view=documents',
      },
      recipientUserIds: [...companyRecipientIds, driverUserId],
      source: 'driver_document',
      sourceId: document.id,
    })

    sent += reminder.sent
    skipped += reminder.skipped
  }

  return jsonResponse(200, {
    checked: complianceItems.length + driverDocuments.length,
    date: todayKey,
    sent,
    skipped,
  })
}

export const config = {
  schedule: '0 8,9 * * *',
}
