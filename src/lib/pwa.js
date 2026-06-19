export const webPushPublicKey = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index)
  }

  return outputArray
}

export function isStandaloneApp() {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(display-mode: standalone)').matches || Boolean(window.navigator.standalone)
}

export function getDeviceInstallHint() {
  if (typeof navigator === 'undefined') return 'Apri Camion Chiaro dal browser del telefono.'

  const ua = navigator.userAgent || ''

  if (/iPhone|iPad|iPod/i.test(ua)) {
    return 'Su iPhone apri Safari, premi Condividi e scegli Aggiungi a schermata Home.'
  }

  if (/Android/i.test(ua)) {
    return 'Su Android apri Chrome e usa Installa app o Aggiungi a schermata Home.'
  }

  return 'Dal browser puoi installarla come app quando compare il comando Installa.'
}

export function getPushSupportStatus() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      supported: false,
      reason: 'Notifiche telefono non disponibili in questo ambiente.',
    }
  }

  if (!('serviceWorker' in navigator)) {
    return {
      supported: false,
      reason: 'Questo browser non supporta il service worker necessario alle notifiche.',
    }
  }

  if (!('PushManager' in window) || !('Notification' in window)) {
    return {
      supported: false,
      reason: 'Questo browser non supporta notifiche push web. Resta attiva la campanella in app.',
    }
  }

  if (!webPushPublicKey) {
    return {
      supported: false,
      reason: 'Manca la chiave pubblica push nelle variabili Netlify.',
    }
  }

  return { supported: true, reason: '' }
}

export async function registerAppServiceWorker() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null
  if (!import.meta.env.PROD) return null

  return navigator.serviceWorker.register('/sw.js')
}

export async function getExistingPushSubscription() {
  const registration = await registerAppServiceWorker()

  if (!registration) return null

  return registration.pushManager.getSubscription()
}

export async function subscribeCurrentBrowserToPush() {
  const support = getPushSupportStatus()

  if (!support.supported) {
    return { error: { message: support.reason }, subscription: null }
  }

  const permission = await window.Notification.requestPermission()

  if (permission !== 'granted') {
    return { error: { message: 'Notifiche non autorizzate su questo telefono.' }, subscription: null }
  }

  const registration = await registerAppServiceWorker()
  if (!registration) {
    return { error: { message: 'Notifiche disponibili dopo la pubblicazione Netlify.' }, subscription: null }
  }

  const existingSubscription = await registration.pushManager.getSubscription()

  if (existingSubscription) {
    return { error: null, subscription: existingSubscription.toJSON() }
  }

  const subscription = await registration.pushManager.subscribe({
    applicationServerKey: urlBase64ToUint8Array(webPushPublicKey),
    userVisibleOnly: true,
  })

  return { error: null, subscription: subscription.toJSON() }
}
