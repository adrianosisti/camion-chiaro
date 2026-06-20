import { apiBaseUrl, driverAuthDomain, isSupabaseConfigured, supabase } from './supabaseClient'
import { mapChatMessage, mapChatThread, mapDriverContext } from './mappers'

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

const chatThreadSelect = 'id, company_id, driver_id, title, context_type, last_message_at'
const chatMessageSelect =
  'id, company_id, thread_id, sender_user_id, sender_role, body, attachment_path, read_by_company_at, read_by_driver_at, created_at'

function sanitizeFileName(value = 'file') {
  return String(value)
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'file'
}

async function getBlobFromUri(uri) {
  const response = await fetch(uri)
  return response.blob()
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

export async function signOutDriver() {
  if (!isSupabaseConfigured) return
  await supabase.auth.signOut()
}

export async function fetchDriverContext() {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!apiBaseUrl) {
    return {
      data: null,
      error: { message: 'Configura EXPO_PUBLIC_API_BASE_URL con il sito Netlify.' },
    }
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
      return { data: null, error: { message: payload.error ?? 'Dati autista non disponibili.' } }
    }

    return { data: mapDriverContext(payload), error: null }
  } catch {
    return {
      data: null,
      error: { message: 'Connessione al server Camion Chiaro non riuscita.' },
    }
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
  const blob = await getBlobFromUri(attachment.uri)
  const { error } = await supabase.storage.from(companyAssetsBucket).upload(filePath, blob, {
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

export async function createCompanyAssetSignedUrl(filePath) {
  if (!isSupabaseConfigured || !filePath) return { data: null, error: null }
  return supabase.storage.from(companyAssetsBucket).createSignedUrl(filePath, 3600)
}

export async function createDriverDocumentSignedUrl(filePath) {
  if (!isSupabaseConfigured || !filePath) return { data: null, error: null }
  return supabase.storage.from(driverDocumentsBucket).createSignedUrl(filePath, 600)
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

export function subscribeToDriverPresence({ actor, companyId, handlers = {} }) {
  if (!isSupabaseConfigured || !companyId || !actor?.actorId) {
    return {
      cleanup: () => {},
      sendTyping: () => {},
    }
  }

  const clientId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  const channel = supabase
    .channel(`chat-presence-${companyId}`, {
      config: {
        presence: {
          key: `driver:${actor.actorId}:${clientId}`,
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
      if (!payload?.actorId || payload.actorId === actor.actorId) return
      handlers.onTyping?.(payload)
    })
    .subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return
      await channel.track({
        actorId: actor.actorId,
        actorName: actor.actorName ?? '',
        actorRole: 'driver',
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
          actorRole: 'driver',
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

export async function uploadDriverDocumentFile({ companyId, documentId, driverId, file }) {
  if (!isSupabaseConfigured) return notConfiguredError()
  if (!companyId || !documentId || !driverId || !file?.uri) {
    return { data: null, error: { message: 'Documento o file mancante.' } }
  }

  const cleanFileName = sanitizeFileName(file.name ?? `documento-${Date.now()}`)
  const filePath = `${companyId}/${driverId}/${documentId}/${Date.now()}-${cleanFileName}`
  const blob = await getBlobFromUri(file.uri)

  const { error: uploadError } = await supabase.storage.from(driverDocumentsBucket).upload(filePath, blob, {
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
    .select('id')
    .single()

  return { data, error }
}

export async function createFaultReport(payload) {
  if (!isSupabaseConfigured) return notConfiguredError()

  let photoPath = ''

  if (payload.photo?.uri) {
    const cleanFileName = sanitizeFileName(payload.photo.name ?? `guasto-${Date.now()}.jpg`)
    photoPath = `${payload.companyId}/faults/${payload.driverId}/${Date.now()}-${cleanFileName}`
    const blob = await getBlobFromUri(payload.photo.uri)
    const { error: uploadError } = await supabase.storage.from(companyAssetsBucket).upload(photoPath, blob, {
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
    .select('id')
    .single()

  if (error && photoPath) {
    await supabase.storage.from(companyAssetsBucket).remove([photoPath])
  }

  return { data, error }
}
