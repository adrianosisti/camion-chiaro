const CACHE_NAME = 'camion-chiaro-v2'
const CORE_ASSETS = ['/', '/index.html', '/favicon.svg', '/manifest.webmanifest']

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

  const title = payload.title || 'Camion Chiaro'
  const options = {
    badge: '/favicon.svg',
    body: payload.body || 'Nuova notifica disponibile.',
    data: {
      url: payload.url || '/',
    },
    icon: '/favicon.svg',
    tag: payload.tag || `camion-chiaro-${Date.now()}`,
  }

  event.waitUntil(self.registration.showNotification(title, options))
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
