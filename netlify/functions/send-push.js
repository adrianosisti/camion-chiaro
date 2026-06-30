import { createClient } from '@supabase/supabase-js'
import webPush from 'web-push'

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

async function getSenderContext(serviceClient, userId, companyId) {
  const [membershipResult, driverResult, personResult] = await Promise.all([
    serviceClient
      .from('company_members')
      .select('role')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .maybeSingle(),
    serviceClient
      .from('drivers')
      .select('id, company_id, full_name')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .neq('status', 'archived')
      .maybeSingle(),
    serviceClient
      .from('company_people')
      .select('id, company_id, full_name, department, person_type')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .neq('status', 'archived')
      .maybeSingle(),
  ])

  if (membershipResult.error) return { data: null, error: membershipResult.error }
  if (driverResult.error) return { data: null, error: driverResult.error }
  if (personResult.error && !['42P01', '42703'].includes(personResult.error.code)) {
    return { data: null, error: personResult.error }
  }

  if (membershipResult.data) {
    return {
      data: {
        companyId,
        driverId: null,
        personId: null,
        role: 'company',
      },
      error: null,
    }
  }

  if (driverResult.data) {
    return {
      data: {
        companyId,
        driverId: driverResult.data.id,
        personId: personResult.data?.id ?? null,
        role: 'driver',
      },
      error: null,
    }
  }

  if (personResult.data) {
    const departmentRole = personResult.data.department === 'warehouse'
      ? 'warehouse'
      : personResult.data.department === 'office'
        ? 'office'
        : 'driver'

    return {
      data: {
        companyId,
        driverId: null,
        personId: personResult.data.id,
        role: departmentRole,
      },
      error: null,
    }
  }

  return { data: null, error: null }
}

async function getTeamRecipientUserIds(serviceClient, senderContext, threadId) {
  if (!threadId) return { data: null, error: { message: 'Gruppo chat mancante.' } }

  const { data: thread, error: threadError } = await serviceClient
    .from('team_chat_threads')
    .select('id, company_id, thread_type')
    .eq('company_id', senderContext.companyId)
    .eq('id', threadId)
    .maybeSingle()

  if (threadError) return { data: null, error: threadError }
  if (!thread) return { data: null, error: { message: 'Gruppo chat non trovato.' } }

  if (senderContext.role !== 'company') {
    const { data: participant, error: participantError } = await serviceClient
      .from('team_chat_participants')
      .select('person_id')
      .eq('thread_id', threadId)
      .eq('person_id', senderContext.personId)
      .is('left_at', null)
      .maybeSingle()

    if (participantError) return { data: null, error: participantError }
    if (!participant) return { data: null, error: { message: 'Non puoi scrivere in questo gruppo.' } }
  }

  const participantsResult = await serviceClient
    .from('team_chat_participants')
    .select('person_id')
    .eq('thread_id', threadId)
    .is('left_at', null)

  if (participantsResult.error) return { data: null, error: participantsResult.error }

  const personIds = (participantsResult.data ?? []).map((participant) => participant.person_id).filter(Boolean)
  const shouldIncludeCompanyMembers =
    senderContext.role === 'company' ||
    thread.thread_type !== 'direct' ||
    personIds.length <= 1
  const membersResult = shouldIncludeCompanyMembers
    ? await serviceClient
        .from('company_members')
        .select('user_id')
        .eq('company_id', senderContext.companyId)
        .in('role', ['owner', 'admin', 'operator'])
    : { data: [], error: null }

  if (membersResult.error) return { data: null, error: membersResult.error }

  let personUserIds = []

  if (personIds.length) {
    const { data: people, error: peopleError } = await serviceClient
      .from('company_people')
      .select('user_id')
      .eq('company_id', senderContext.companyId)
      .in('id', personIds)
      .neq('status', 'archived')

    if (peopleError) return { data: null, error: peopleError }
    personUserIds = (people ?? []).map((person) => person.user_id).filter(Boolean)
  }

  return {
    data: [
      ...(membersResult.data ?? []).map((member) => member.user_id).filter(Boolean),
      ...personUserIds,
    ],
    error: null,
  }
}

async function getRecipientUserIds(serviceClient, senderContext, targetRole, driverId, threadId) {
  if (targetRole === 'company') {
    const { data, error } = await serviceClient
      .from('company_members')
      .select('user_id')
      .eq('company_id', senderContext.companyId)
      .in('role', ['owner', 'admin', 'operator'])

    if (error) return { data: null, error }

    return {
      data: data.map((member) => member.user_id).filter((userId) => userId),
      error: null,
    }
  }

  if (targetRole === 'driver') {
    if (senderContext.role !== 'company') {
      return { data: null, error: { message: 'Solo l azienda puo inviare notifiche push agli autisti.' } }
    }

    const { data, error } = await serviceClient
      .from('drivers')
      .select('user_id')
      .eq('company_id', senderContext.companyId)
      .eq('id', driverId)
      .neq('status', 'archived')
      .maybeSingle()

    if (error) return { data: null, error }

    return {
      data: data?.user_id ? [data.user_id] : [],
      error: null,
      reason: data?.user_id ? '' : 'Autista senza account collegato. Fallo entrare almeno una volta o ricrea l accesso autista.',
    }
  }

  if (targetRole === 'team') {
    return getTeamRecipientUserIds(serviceClient, senderContext, threadId)
  }

  return { data: null, error: { message: 'Destinatario notifica non valido.' } }
}

async function fetchNativePushTokens(serviceClient, companyId, recipientUserIds) {
  if (!recipientUserIds.length) return { data: [], error: null }

  const { data, error } = await serviceClient
    .from('native_push_tokens')
    .select('id, expo_push_token')
    .eq('company_id', companyId)
    .in('user_id', recipientUserIds)
    .is('disabled_at', null)

  if (error?.code === '42P01' || error?.code === '42703') {
    return { data: [], error: null }
  }

  return { data: data ?? [], error }
}

async function sendExpoPushNotifications(tokens, notificationPayload) {
  if (!tokens.length) return { failed: 0, invalidTokenIds: [], sent: 0 }

  const messages = tokens.map((token) => ({
    body: notificationPayload.body,
    data: {
      notificationType: notificationPayload.notificationType,
      tag: notificationPayload.tag,
      threadId: notificationPayload.threadId,
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

  if (!response.ok) {
    return { failed: tokens.length, invalidTokenIds: [], sent: 0 }
  }

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
  const vapidPublicKey = process.env.WEB_PUSH_PUBLIC_KEY ?? process.env.VITE_WEB_PUSH_PUBLIC_KEY
  const vapidPrivateKey = process.env.WEB_PUSH_PRIVATE_KEY
  const vapidSubject = process.env.WEB_PUSH_SUBJECT ?? 'mailto:info@movigo.app'

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse(500, { error: 'Configurazione Supabase Netlify mancante.' })
  }

  const webPushConfigured = Boolean(vapidPublicKey && vapidPrivateKey)

  const authorization = event.headers.authorization ?? event.headers.Authorization ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  if (!token) {
    return jsonResponse(401, { error: 'Sessione mancante. Fai login e riprova.' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Dati richiesta non validi.' })
  }

  const companyId = String(body.companyId ?? '')
  const targetRole = String(body.targetRole ?? '')
  const driverId = body.driverId ? String(body.driverId) : ''
  const title = String(body.title ?? 'Movigo').slice(0, 120)
  const messageBody = String(body.body ?? 'Nuovo aggiornamento disponibile.').slice(0, 240)
  const url = String(body.url ?? '/')
  const tag = String(body.tag ?? `camion-chiaro-${Date.now()}`)
  const notificationType = String(body.notificationType ?? '').slice(0, 40)
  const threadId = String(body.threadId ?? '').slice(0, 120)

  if (!companyId || !['company', 'driver', 'team'].includes(targetRole)) {
    return jsonResponse(400, { error: 'Azienda o destinatario non valido.' })
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
    return jsonResponse(401, { error: 'Sessione non valida. Fai login e riprova.' })
  }

  const senderContextResult = await getSenderContext(serviceClient, authData.user.id, companyId)

  if (senderContextResult.error) {
    return jsonResponse(500, { error: senderContextResult.error.message })
  }

  if (!senderContextResult.data) {
    return jsonResponse(403, { error: 'Utente non collegato a questa azienda.' })
  }

  const recipientsResult = await getRecipientUserIds(
    serviceClient,
    senderContextResult.data,
    targetRole,
    driverId,
    threadId,
  )

  if (recipientsResult.error) {
    return jsonResponse(403, { error: recipientsResult.error.message })
  }

  const recipientUserIds = recipientsResult.data.filter((userId) => userId !== authData.user.id)

  if (recipientUserIds.length === 0) {
    return jsonResponse(200, {
      reason: recipientsResult.reason || 'Nessun destinatario valido per questa notifica.',
      sent: 0,
      skipped: true,
    })
  }

  let subscriptions = []
  let subscriptionsError = null

  if (webPushConfigured) {
    const subscriptionsResult = await serviceClient
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('company_id', companyId)
      .in('user_id', recipientUserIds)
      .is('disabled_at', null)

    subscriptions = subscriptionsResult.data ?? []
    subscriptionsError = subscriptionsResult.error
  }

  if (subscriptionsError) {
    return jsonResponse(500, { error: subscriptionsError.message })
  }

  const nativeTokensResult = await fetchNativePushTokens(serviceClient, companyId, recipientUserIds)

  if (nativeTokensResult.error) {
    return jsonResponse(500, { error: nativeTokensResult.error.message })
  }

  const nativeTokens = nativeTokensResult.data ?? []

  if ((!subscriptions || subscriptions.length === 0) && nativeTokens.length === 0) {
    return jsonResponse(200, {
      reason:
        targetRole === 'company'
          ? 'Nessun telefono azienda registrato. Entra come azienda dal telefono e premi Abilita notifiche.'
          : targetRole === 'driver'
            ? 'Nessun telefono registrato per questo autista. Apri l app autista dal telefono e premi Abilita notifiche.'
            : 'Nessun telefono registrato per i partecipanti del gruppo.',
      sent: 0,
      skipped: true,
    })
  }

  const payload = JSON.stringify({
    body: messageBody,
    notificationType,
    tag,
    threadId,
    title,
    url,
  })

  let results = []

  if (webPushConfigured && subscriptions.length) {
    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
    results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.auth,
              p256dh: subscription.p256dh,
            },
          },
          payload,
        ),
      ),
    )
  }

  const nativeResult = await sendExpoPushNotifications(nativeTokens, {
    body: messageBody,
    notificationType,
    tag,
    threadId,
    title,
    url,
  })

  const expiredSubscriptionIds = results
    .map((result, index) => ({ result, subscription: subscriptions[index] }))
    .filter(({ result }) => {
      const statusCode = result.reason?.statusCode
      return result.status === 'rejected' && [404, 410].includes(statusCode)
    })
    .map(({ subscription }) => subscription.id)

  if (expiredSubscriptionIds.length > 0) {
    await serviceClient
      .from('push_subscriptions')
      .update({ disabled_at: new Date().toISOString() })
      .in('id', expiredSubscriptionIds)
  }

  if (nativeResult.invalidTokenIds.length > 0) {
    await serviceClient
      .from('native_push_tokens')
      .update({ disabled_at: new Date().toISOString() })
      .in('id', nativeResult.invalidTokenIds)
  }

  const webSent = results.filter((result) => result.status === 'fulfilled').length
  const webFailed = results.length - webSent
  const sent = webSent + nativeResult.sent
  const failed = webFailed + nativeResult.failed

  if (sent === 0 && failed > 0) {
    const firstFailure = results.find((result) => result.status === 'rejected')?.reason
    return jsonResponse(502, {
      error: firstFailure?.body || firstFailure?.message || 'Provider push non ha accettato la notifica.',
      failed,
      sent,
    })
  }

  return jsonResponse(200, {
    failed,
    nativeSent: nativeResult.sent,
    sent,
    webSent,
  })
}
