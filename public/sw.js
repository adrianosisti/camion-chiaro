const CACHE_NAME = 'vygo-v3'
const CORE_ASSETS = ['/', '/index.html', '/favicon.svg', '/manifest.webmanifest']
const activeChatClients = new Map()

async function shouldSuppressNotification(payload) {
  if (payload.notificationType !== 'chat' || !payload.threadId) return false

  const clientList = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' })

  return clientList.some((client) => {
    const activeChat = activeChatClients.get(client.id)
    const isVisible = client.visibilityState === 'visible'

    return isVisible && activeChat?.threadId === payload.threadId
  })
}

async function showPushNotification(payload) {
  if (await shouldSuppressNotification(payload)) return

  const title = payload.title || 'Vygo'
  const options = {
    badge: '/favicon.svg',
    body: payload.body || 'Nuova notifica disponibile.',
    data: {
      url: payload.url || '/',
    },
    icon: '/favicon.svg',
    tag: payload.tag || `vygo-${Date.now()}`,
  }

  await self.registration.showNotification(title, options)
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseClone))
          return response
        })
        .catch(() => caches.match('/index.html')),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response

        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
        return response
      })
    }),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'vygo-active-chat' || !event.source?.id) return

  const threadId = event.data.threadId || ''

  if (!threadId) {
    activeChatClients.delete(event.source.id)
    return
  }

  activeChatClients.set(event.source.id, {
    threadId,
    updatedAt: Date.now(),
  })
})

self.addEventListener('push', (event) => {
  const payload = (() => {
    try {
      return event.data ? event.data.json() : {}
    } catch {
      return {
        body: event.data?.text() ?? '',
      }
    }
  })()

  event.waitUntil(showPushNotification(payload))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && client.url.startsWith(self.location.origin)) {
          client.navigate(url)
          return client.focus()
        }
      }

      return self.clients.openWindow(url)
    }),
  )
})
