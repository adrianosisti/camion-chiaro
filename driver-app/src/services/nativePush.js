import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

function getProjectId() {
  return Constants.expoConfig?.extra?.eas?.projectId
    ?? Constants.easConfig?.projectId
    ?? ''
}

export async function registerNativePushDevice() {
  if (!Device.isDevice) {
    return { data: null, error: { message: 'Le notifiche push si provano su un telefono vero.' } }
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      importance: Notifications.AndroidImportance.MAX,
      lightColor: '#12c6df',
      name: 'Movigo',
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    })
  }

  const currentPermission = await Notifications.getPermissionsAsync()
  let finalStatus = currentPermission.status

  if (finalStatus !== 'granted') {
    const requestedPermission = await Notifications.requestPermissionsAsync()
    finalStatus = requestedPermission.status
  }

  if (finalStatus !== 'granted') {
    return { data: null, error: { message: 'Notifiche non autorizzate su questo telefono.' } }
  }

  const projectId = getProjectId()
  if (!projectId) {
    return { data: null, error: { message: 'Project ID Expo mancante nella build.' } }
  }

  const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId })
  const token = tokenResult.data

  if (!token) {
    return { data: null, error: { message: 'Token notifiche non generato.' } }
  }

  return {
    data: {
      deviceName: Device.deviceName || Device.modelName || Platform.OS,
      platform: Platform.OS,
      token,
    },
    error: null,
  }
}
