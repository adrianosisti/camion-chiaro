import { Component, useEffect, useMemo, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import * as Haptics from 'expo-haptics'
import { useShareIntent } from 'expo-share-intent'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { AuthScreen } from './src/screens/AuthScreen'
import { AssistantModal } from './src/screens/AssistantModal'
import { CompanyChatScreen } from './src/screens/CompanyChatScreen'
import { CompanyHomeScreen } from './src/screens/CompanyHomeScreen'
import { CompanyManagementScreen } from './src/screens/CompanyManagementScreen'
import { DocumentsScreen } from './src/screens/DocumentsScreen'
import { DriverChatHubScreen } from './src/screens/DriverChatHubScreen'
import { HomeScreen } from './src/screens/HomeScreen'
import { OperationsScreen } from './src/screens/OperationsScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { WorkforceHomeScreen } from './src/screens/WorkforceHomeScreen'
import {
  createCompanyAssetSignedUrl,
  createCompanyComplianceItem,
  createCompanyDriverAccount,
  createCompanyPerson,
  createCompanyVehicle,
  createCompanyWarehouseAsset,
  createDriverDocument,
  createFaultReport,
  createVehicleCheck,
  ensureDirectTeamThread,
  fetchCompanyContext,
  fetchCompanyDriverChat,
  fetchDriverChat,
  fetchTeamChat,
  fetchDriverContext,
  getCurrentSession,
  getSessionAccountType,
  markChatMessagesRead,
  markTeamThreadRead,
  renewDriverDocument,
  renewCompanyComplianceItem,
  saveNativePushToken,
  sendChatMessage,
  sendCompanyChatMessage,
  sendTeamChatMessage,
  sendPushNotification,
  signOutDriver,
  subscribeToDriverChatMessages,
  subscribeToTeamChatMessages,
  subscribeToOperationalUpdates,
  subscribeToDriverPresence,
  updateChatMessageReaction,
  updateCompanyComplianceItemStatus,
  updateFaultReportStatus,
  updateVehicleCheckStatus,
  uploadDriverDocumentFile,
  uploadDriverProfileImage,
} from './src/services/driverApi'
import { registerNativePushDevice } from './src/services/nativePush'
import { t } from './src/i18n/native'
import { colors, layout } from './src/theme'

const settingsStorageKey = 'camion-chiaro-native-settings'

class ScreenErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.screenError}>
          <Ionicons color={colors.danger} name="warning-outline" size={30} />
          <Text style={styles.screenErrorTitle}>Schermata non caricata</Text>
          <Text style={styles.screenErrorText}>
            Chiudi questa sezione e riaprila. Se ricapita, segnami questa frase:
          </Text>
          <Text selectable style={styles.screenErrorCode}>
            {String(this.state.error?.message ?? this.state.error ?? 'Errore sconosciuto')}
          </Text>
        </View>
      )
    }

    return this.props.children
  }
}

function getNativePushPromptStorageKey(accountType, companyId, driverId = '') {
  return `camion-chiaro-native-push-prompt:${accountType}:${companyId}:${driverId || 'company'}`
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDailyVehicleStorageKey(driverId) {
  return `camion-chiaro-daily-vehicle:${driverId}:${getLocalDateKey()}`
}

function getDriverChatReadStorageKey(driverId) {
  return `camion-chiaro-driver-chat-read:${driverId}`
}

const currencyByLanguage = {
  de: 'EUR',
  en: 'EUR',
  es: 'EUR',
  fr: 'EUR',
  it: 'EUR',
  pl: 'PLN',
  ro: 'RON',
}

function getDefaultCurrency(language = 'it') {
  return currencyByLanguage[language] ?? 'EUR'
}

const driverTabs = [
  { id: 'home', icon: 'home-outline', label: 'Home', labelKey: 'home' },
  { id: 'chat', icon: 'chatbubbles-outline', label: 'Chat', labelKey: 'chat' },
  { id: 'documents', icon: 'document-text-outline', label: 'Doc', labelKey: 'documents' },
  { id: 'operations', icon: 'checkbox-outline', label: 'Check', labelKey: 'check' },
  { id: 'settings', icon: 'settings-outline', label: 'Menu', labelKey: 'menu' },
]

const workforceTabs = [
  { id: 'home', icon: 'home-outline', label: 'Home', labelKey: 'home' },
  { id: 'chat', icon: 'chatbubbles-outline', label: 'Chat', labelKey: 'chat' },
  { id: 'settings', icon: 'settings-outline', label: 'Menu', labelKey: 'menu' },
]

const companyTabs = [
  { id: 'home', icon: 'business-outline', label: 'Home', labelKey: 'home' },
  { id: 'manage', icon: 'add-circle-outline', label: 'Anagraf.' },
  { id: 'archive', icon: 'albums-outline', label: 'Archivio', labelKey: 'archive' },
  { id: 'chat', icon: 'chatbubbles-outline', label: 'Chat', labelKey: 'chat' },
  { id: 'settings', icon: 'settings-outline', label: 'Menu', labelKey: 'menu' },
]

const camionChiaroIcon = require('./assets/brand/icon.png')

function getAndroidTopInset(topInset) {
  if (Platform.OS !== 'android') return topInset
  return Math.max(topInset, StatusBar.currentHeight ?? 0)
}

function getBottomInset(bottomInset) {
  return Math.max(bottomInset, Platform.OS === 'android' ? 24 : 16)
}

function getDriverName(context) {
  return context?.drivers?.[0]?.name || context?.currentPerson?.name || 'Persona'
}

function getCompanyName(context) {
  return context?.companyProfile?.name || 'Azienda'
}

function getVehicleDisplayName(vehicles = [], vehicleId = '') {
  const vehicle = vehicles.find((entry) => entry.id === vehicleId)
  if (!vehicle) return 'mezzo'
  return [vehicle.plate, vehicle.model].filter(Boolean).join(' - ') || 'mezzo'
}

function getCheckIssues(check = {}) {
  return [
    check.lightsOk === false ? 'luci' : null,
    check.tiresOk === false ? 'pneumatici' : null,
    check.documentsOnBoard === false ? 'documenti a bordo' : null,
  ].filter(Boolean)
}

function triggerHaptic(kind = 'light') {
  if (kind === 'critical') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {})
    return
  }

  if (kind === 'success') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
    return
  }

  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
}

function mergeChatMessage(messages, message) {
  if (!message?.id) return messages
  const exists = messages.some((currentMessage) => currentMessage.id === message.id)
  if (exists) {
    return messages.map((currentMessage) => (currentMessage.id === message.id ? message : currentMessage))
  }

  return [...messages, message].sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt))
}

function upsertTeamThread(threads = [], thread) {
  if (!thread?.id) return threads
  const nextThreads = threads.some((currentThread) => currentThread.id === thread.id)
    ? threads.map((currentThread) => (currentThread.id === thread.id ? { ...currentThread, ...thread } : currentThread))
    : [thread, ...threads]

  return nextThreads.sort((first, second) => (
    new Date(second.lastMessageAt || second.createdAt || 0) - new Date(first.lastMessageAt || first.createdAt || 0)
  ))
}

function mergeChatMessageUpdates(messages, updatedMessages = []) {
  const updatesById = new Map(updatedMessages.filter((message) => message?.id).map((message) => [message.id, message]))
  if (!updatesById.size) return messages

  return messages.map((message) => updatesById.get(message.id) ?? message)
}

function countUnreadMessagesForRole(messages, readerRole) {
  if (readerRole === 'company') {
    return messages.filter((message) => message.senderRole === 'driver' && !message.readByCompanyAt).length
  }

  return messages.filter((message) => message.senderRole === 'company' && !message.readByDriverAt).length
}

function getMessageTime(message) {
  const time = new Date(message?.createdAt ?? 0).getTime()
  return Number.isFinite(time) ? time : 0
}

function countUnreadDriverMessages(messages, readWatermark = 0) {
  return messages.filter((message) => (
    message.senderRole === 'company'
      && !message.readByDriverAt
      && getMessageTime(message) > readWatermark
  )).length
}

function markMessagesReadLocally(messages, readerRole, readAt = new Date().toISOString()) {
  const senderRole = readerRole === 'company' ? 'driver' : 'company'
  const timestampField = readerRole === 'company' ? 'readByCompanyAt' : 'readByDriverAt'

  return messages.map((message) => (
    message.senderRole === senderRole && !message[timestampField]
      ? { ...message, [timestampField]: readAt }
      : message
  ))
}

function getShareFileKind(file = {}) {
  const mimeType = String(file.mimeType ?? '').toLowerCase()
  const fileName = String(file.fileName ?? file.path ?? '').toLowerCase()

  if (mimeType.startsWith('video/') || /\.(mp4|mov|m4v|webm)$/i.test(fileName)) return 'video'
  if (mimeType.startsWith('audio/') || /\.(m4a|aac|mp3|mpeg|ogg|opus|wav|webm)$/i.test(fileName)) return 'audio'
  if (mimeType.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif)$/i.test(fileName)) return 'image'
  return 'file'
}

function createIncomingSharePayload(shareIntent) {
  if (!shareIntent) return null

  const textParts = [
    shareIntent.meta?.title,
    shareIntent.webUrl,
    shareIntent.text,
  ]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index)
  const attachments = (shareIntent.files ?? [])
    .filter((file) => file?.path)
    .map((file, index) => ({
      fileName: file.fileName || `condivisione-${Date.now()}-${index + 1}`,
      kind: getShareFileKind(file),
      mimeType: file.mimeType || 'application/octet-stream',
      type: getShareFileKind(file),
      uri: file.path,
    }))

  if (!textParts.length && !attachments.length) return null

  return {
    attachments,
    id: `share-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: textParts.join('\n'),
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CamionChiaroApp />
    </SafeAreaProvider>
  )
}

function CamionChiaroApp() {
  const safeInsets = useSafeAreaInsets()
  const headerSafeTop = getAndroidTopInset(safeInsets.top)
  const footerSafeBottom = getBottomInset(safeInsets.bottom)
  const shareIntentOptions = useMemo(() => ({
    resetOnBackground: false,
    scheme: 'camionchiaro',
  }), [])
  const {
    error: shareIntentError,
    hasShareIntent,
    resetShareIntent,
    shareIntent,
  } = useShareIntent(shareIntentOptions)
  const [accountType, setAccountType] = useState('driver')
  const [activeTab, setActiveTab] = useState('home')
  const [appStatus, setAppStatus] = useState('Caricamento app...')
  const [chatSoundEnabled, setChatSoundEnabled] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [chatThread, setChatThread] = useState(null)
  const [companyChatMessages, setCompanyChatMessages] = useState([])
  const [companyChatThread, setCompanyChatThread] = useState(null)
  const [companyTeamChatMessages, setCompanyTeamChatMessages] = useState([])
  const [companyContext, setCompanyContext] = useState(null)
  const [companyDriverPhotoUrls, setCompanyDriverPhotoUrls] = useState({})
  const [context, setContext] = useState(null)
  const [driverChatMode, setDriverChatMode] = useState('list')
  const [driverChatReadWatermark, setDriverChatReadWatermark] = useState(0)
  const [documentFocusId, setDocumentFocusId] = useState('')
  const [driverProfileUrl, setDriverProfileUrl] = useState('')
  const [driverTeamChatMessages, setDriverTeamChatMessages] = useState([])
  const [isBooting, setIsBooting] = useState(true)
  const [isCompanyOnline, setIsCompanyOnline] = useState(false)
  const [isCompanyTyping, setIsCompanyTyping] = useState(false)
  const [isSelectedDriverTyping, setIsSelectedDriverTyping] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [incomingChatShare, setIncomingChatShare] = useState(null)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [language, setLanguage] = useState('it')
  const [logoUrl, setLogoUrl] = useState('')
  const [managementInitialSection, setManagementInitialSection] = useState('drivers')
  const [nativePushStatus, setNativePushStatus] = useState('')
  const [onlineDriverIds, setOnlineDriverIds] = useState([])
  const [session, setSession] = useState(null)
  const [selectedCompanyDriverId, setSelectedCompanyDriverId] = useState('')
  const [selectedCompanyTeamThreadId, setSelectedCompanyTeamThreadId] = useState('')
  const [selectedDailyVehicleId, setSelectedDailyVehicleId] = useState('')
  const [selectedDriverTeamThreadId, setSelectedDriverTeamThreadId] = useState('')
  const [settingsReady, setSettingsReady] = useState(false)
  const companyPresenceRef = useRef(null)
  const companyRefreshInFlightRef = useRef(false)
  const companyTypingTimeoutRef = useRef(null)
  const presenceRef = useRef(null)
  const routedShareIdRef = useRef('')
  const typingTimeoutRef = useRef(null)
  const activeTabRef = useRef(activeTab)
  const driverChatModeRef = useRef(driverChatMode)
  const driverChatReadVersionRef = useRef(0)
  const nativePushPromptRef = useRef('')

  const driver = context?.drivers?.[0] ?? null
  const currentPerson = context?.currentPerson ?? null
  const isWorkforcePerson = accountType === 'driver' && currentPerson && !driver
  const visibleTabs = accountType === 'company' ? companyTabs : isWorkforcePerson ? workforceTabs : driverTabs
  const activeCompanyContext = companyContext ?? context
  const companyName = accountType === 'company'
    ? activeCompanyContext?.companyProfile?.name ?? 'Azienda'
    : getCompanyName(context)
  const driverName = getDriverName(context)
  const headerSubtitle = accountType === 'company' ? t(language, 'accountAreaCompany') : driverName
  const selectedCompanyDriver = companyContext?.drivers?.find((currentDriver) => currentDriver.id === selectedCompanyDriverId) ?? null
  const selectedCompanyTeamThread = companyContext?.teamChatThreads?.find((thread) => thread.id === selectedCompanyTeamThreadId) ?? null
  const selectedDriverTeamThread = context?.teamChatThreads?.find((thread) => thread.id === selectedDriverTeamThreadId) ?? null
  const selectedCompanyDriverOnline = Boolean(selectedCompanyDriverId && onlineDriverIds.includes(selectedCompanyDriverId))
  const rawUnreadDriverMessages = useMemo(
    () => chatMessages.filter((message) => message.senderRole === 'company' && !message.readByDriverAt),
    [chatMessages],
  )
  const unreadCompanyMessages = useMemo(() => {
    if (accountType !== 'driver' || activeTab === 'chat') return 0
    return countUnreadDriverMessages(chatMessages, driverChatReadWatermark)
  }, [accountType, activeTab, chatMessages, driverChatReadWatermark])
  const unreadDriverMessages = companyContext?.unreadDriverMessages ?? 0
  const unreadTeamMessages = accountType === 'company'
    ? companyContext?.unreadTeamMessages ?? 0
    : context?.unreadTeamMessages ?? 0
  const chatBadgeCount = accountType === 'company'
    ? unreadDriverMessages + unreadTeamMessages
    : activeTab === 'chat' ? 0 : unreadCompanyMessages + unreadTeamMessages
  const driverChatDiagnostics = useMemo(() => {
    const companyMessages = chatMessages.filter((message) => message.senderRole === 'company')
    const latestCompanyMessage = companyMessages.reduce((latestMessage, message) => (
      getMessageTime(message) > getMessageTime(latestMessage) ? message : latestMessage
    ), null)

    return {
      badgeCount: unreadCompanyMessages,
      latestCompanyAt: latestCompanyMessage?.createdAt ?? '',
      latestCompanyReadAt: latestCompanyMessage?.readByDriverAt ?? '',
      messageCount: chatMessages.length,
      rawUnreadCount: rawUnreadDriverMessages.length,
      readWatermark: driverChatReadWatermark ? new Date(driverChatReadWatermark).toISOString() : '',
    }
  }, [chatMessages, driverChatReadWatermark, rawUnreadDriverMessages.length, unreadCompanyMessages])

  function clearDriverUnreadMessages(messages = chatMessages) {
    const latestCompanyMessageTime = messages
      .filter((message) => message.senderRole === 'company')
      .reduce((latestTime, message) => Math.max(latestTime, getMessageTime(message)), 0)
    const readWatermark = Math.max(Date.now(), latestCompanyMessageTime + 1)
    driverChatReadVersionRef.current += 1
    setDriverChatReadWatermark(readWatermark)

    if (driver?.id) {
      void AsyncStorage.setItem(getDriverChatReadStorageKey(driver.id), String(readWatermark))
    }
  }

  function markDriverChatReadLocally(messages = chatMessages) {
    const nextMessages = markMessagesReadLocally(messages, 'driver')
    clearDriverUnreadMessages(nextMessages)
    setChatMessages(nextMessages)
    return nextMessages
  }

  function clearTeamUnreadLocally(setContextState, threadId) {
    if (!threadId) return

    setContextState((currentContext) => {
      if (!currentContext) return currentContext
      const unreadByThreadId = { ...(currentContext.unreadTeamMessagesByThreadId ?? {}) }
      const previousCount = Number(unreadByThreadId[threadId] ?? 0)
      unreadByThreadId[threadId] = 0

      return {
        ...currentContext,
        unreadTeamMessages: Math.max(0, Number(currentContext.unreadTeamMessages ?? 0) - previousCount),
        unreadTeamMessagesByThreadId: unreadByThreadId,
      }
    })
  }

  async function loadAssetUrls(nextContext) {
    const loadedDriver = nextContext?.drivers?.[0]
    const companyLogoPath = nextContext?.companyProfile?.logoPath
    const driverPhotoPath = loadedDriver?.profileImagePath
    const [logoResult, profileResult] = await Promise.all([
      companyLogoPath ? createCompanyAssetSignedUrl(companyLogoPath) : Promise.resolve({ data: null }),
      driverPhotoPath ? createCompanyAssetSignedUrl(driverPhotoPath) : Promise.resolve({ data: null }),
    ])

    setLogoUrl(logoResult.data?.signedUrl ?? '')
    setDriverProfileUrl(profileResult.data?.signedUrl ?? '')
  }

  async function loadCompanyDriverPhotoUrls(nextContext) {
    const entries = await Promise.all(
      (nextContext?.drivers ?? []).map(async (currentDriver) => {
        if (!currentDriver.profileImagePath) return [currentDriver.id, '']
        const result = await createCompanyAssetSignedUrl(currentDriver.profileImagePath)
        return [currentDriver.id, result.data?.signedUrl ?? '']
      }),
    )

    setCompanyDriverPhotoUrls(Object.fromEntries(entries))
  }

  async function loadDriverChatData(targetDriver = driver, { markAsRead = activeTab === 'chat' && driverChatMode === 'company' } = {}) {
    if (!targetDriver?.companyId || !targetDriver?.id) return false
    const requestReadVersion = driverChatReadVersionRef.current
    const shouldMarkAsRead = markAsRead || (activeTabRef.current === 'chat' && driverChatModeRef.current === 'company')

    const chatResult = await fetchDriverChat({
      companyId: targetDriver.companyId,
      driverId: targetDriver.id,
    })

    if (chatResult.data) {
      let nextMessages = chatResult.data.messages

      if (shouldMarkAsRead && chatResult.data.thread?.id) {
        const unreadCount = countUnreadMessagesForRole(nextMessages, 'driver')
        if (unreadCount) {
          nextMessages = markMessagesReadLocally(nextMessages, 'driver')
          clearDriverUnreadMessages(nextMessages)
        }

        const readResult = await markChatMessagesRead(chatResult.data.thread.id, 'driver')
        if (!readResult.error && readResult.data?.length) {
          nextMessages = mergeChatMessageUpdates(nextMessages, readResult.data)
        }
      }

      setChatMessages(nextMessages)
      setChatThread(chatResult.data.thread)
      if (driverChatReadVersionRef.current !== requestReadVersion || (activeTabRef.current === 'chat' && driverChatModeRef.current === 'company')) {
        clearDriverUnreadMessages(nextMessages)
      }
      return true
    }

    return false
  }

  async function loadDriverTeamChatData(targetThread = selectedDriverTeamThread) {
    const companyId = driver?.companyId ?? currentPerson?.companyId ?? context?.companyProfile?.id
    if (!companyId || !targetThread?.id) return false

    const chatResult = await fetchTeamChat({
      companyId,
      threadId: targetThread.id,
    })

    if (chatResult.data) {
      setDriverTeamChatMessages(chatResult.data.messages)
      clearTeamUnreadLocally(setContext, targetThread.id)
      void markTeamThreadRead(targetThread.id).then((readResult) => {
        if (!readResult?.error) clearTeamUnreadLocally(setContext, targetThread.id)
      })
      return true
    }

    if (chatResult.error) {
      Alert.alert('Gruppo non caricato', chatResult.error.message)
    }

    return false
  }

  async function loadDriverData({ silent = false } = {}) {
    if (!silent) setAppStatus('Aggiorno dati autista...')
    setIsRefreshing(true)

    const contextResult = await fetchDriverContext()

    if (contextResult.error) {
      setAppStatus(contextResult.error.message)
      setIsRefreshing(false)
      return false
    }

    setCompanyContext(null)
    setContext(contextResult.data)
    await loadAssetUrls(contextResult.data)
    const loadedDriver = contextResult.data?.drivers?.[0]

    if (loadedDriver?.companyId && loadedDriver?.id) {
      await loadDriverChatData(loadedDriver, { markAsRead: activeTab === 'chat' && driverChatMode === 'company' })
    }

    setAppStatus('')
    setIsRefreshing(false)
    return true
  }

  async function loadCompanyData({ silent = false } = {}) {
    if (!silent) setAppStatus('Aggiorno dati azienda...')
    if (!silent) setIsRefreshing(true)

    const contextResult = await fetchCompanyContext()

    if (contextResult.error) {
      setAppStatus(contextResult.error.message)
      if (!silent) setIsRefreshing(false)
      return false
    }

    setCompanyContext(contextResult.data)
    setContext(null)

    const companyLogoPath = contextResult.data?.companyProfile?.logoPath
    const logoResult = companyLogoPath
      ? await createCompanyAssetSignedUrl(companyLogoPath)
      : { data: null }

    setLogoUrl(logoResult.data?.signedUrl ?? '')
    await loadCompanyDriverPhotoUrls(contextResult.data)
    setDriverProfileUrl('')
    setAppStatus('')
    if (!silent) setIsRefreshing(false)
    return true
  }

  async function loadCompanyChatData(targetDriver = selectedCompanyDriver, { markAsRead = activeTab === 'chat' } = {}) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId || !targetDriver?.id) return false

    const chatResult = await fetchCompanyDriverChat({
      companyId,
      driverId: targetDriver.id,
    })

    if (chatResult.data) {
      let nextMessages = chatResult.data.messages

      if (markAsRead && chatResult.data.thread?.id) {
        const unreadCount = countUnreadMessagesForRole(nextMessages, 'company')
        if (unreadCount) {
          nextMessages = markMessagesReadLocally(nextMessages, 'company')
          setCompanyContext((currentContext) => {
            if (!currentContext) return currentContext
            const unreadByDriverId = {
              ...(currentContext.unreadDriverMessagesByDriverId ?? {}),
              [targetDriver.id]: 0,
            }

            return {
              ...currentContext,
              unreadDriverMessages: Math.max(0, (currentContext.unreadDriverMessages ?? 0) - unreadCount),
              unreadDriverMessagesByDriverId: unreadByDriverId,
            }
          })
        }

        const readResult = await markChatMessagesRead(chatResult.data.thread.id, 'company')
        if (!readResult.error && readResult.data?.length) {
          nextMessages = mergeChatMessageUpdates(nextMessages, readResult.data)
        }
      }

      setCompanyChatMessages(nextMessages)
      setCompanyChatThread(chatResult.data.thread)
      return true
    }

    if (chatResult.error) {
      Alert.alert('Chat non caricata', chatResult.error.message)
    }

    return false
  }

  async function loadCompanyTeamChatData(targetThread = selectedCompanyTeamThread) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId || !targetThread?.id) return false

    const chatResult = await fetchTeamChat({
      companyId,
      threadId: targetThread.id,
    })

    if (chatResult.data) {
      setCompanyTeamChatMessages(chatResult.data.messages)
      clearTeamUnreadLocally(setCompanyContext, targetThread.id)
      void markTeamThreadRead(targetThread.id).then((readResult) => {
        if (!readResult?.error) clearTeamUnreadLocally(setCompanyContext, targetThread.id)
      })
      return true
    }

    if (chatResult.error) {
      Alert.alert('Gruppo non caricato', chatResult.error.message)
    }

    return false
  }

  useEffect(() => {
    let isMounted = true

    async function boot() {
      const [sessionResult, storedSettings] = await Promise.all([
        getCurrentSession(),
        AsyncStorage.getItem(settingsStorageKey),
      ])
      if (!isMounted) return

      if (storedSettings) {
        try {
          const parsedSettings = JSON.parse(storedSettings)
          if (parsedSettings.language) setLanguage(parsedSettings.language)
          if (typeof parsedSettings.chatSoundEnabled === 'boolean') {
            setChatSoundEnabled(parsedSettings.chatSoundEnabled)
          }
        } catch {
          // Ignore invalid local settings and keep safe defaults.
        }
      }
      setSettingsReady(true)
      setSession(sessionResult.data?.session ?? null)

      if (sessionResult.data?.session) {
        const roleResult = await getSessionAccountType()
        const nextAccountType = roleResult.data === 'company' ? 'company' : 'driver'
        setAccountType(nextAccountType)

        if (nextAccountType === 'company') {
          await loadCompanyData({ silent: true })
        } else {
          await loadDriverData({ silent: true })
        }
      }

      if (isMounted) setIsBooting(false)
    }

    boot()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!settingsReady) return
    AsyncStorage.setItem(settingsStorageKey, JSON.stringify({ chatSoundEnabled, language }))
  }, [chatSoundEnabled, language, settingsReady])

  useEffect(() => {
    activeTabRef.current = activeTab
    driverChatModeRef.current = driverChatMode
    if (accountType === 'driver' && activeTab === 'chat' && driverChatMode === 'company') {
      clearDriverUnreadMessages()
    }
  }, [accountType, activeTab, driverChatMode])

  useEffect(() => {
    if (!hasShareIntent) return

    const payload = createIncomingSharePayload(shareIntent)
    resetShareIntent()
    if (payload) setIncomingChatShare(payload)
  }, [hasShareIntent])

  useEffect(() => {
    if (!shareIntentError) return
    Alert.alert('Condivisione non riuscita', 'Non sono riuscito a leggere il contenuto condiviso. Riprova tra poco.')
  }, [shareIntentError])

  useEffect(() => {
    if (!incomingChatShare?.id || !session || isBooting) return
    if (routedShareIdRef.current === incomingChatShare.id) return

    routedShareIdRef.current = incomingChatShare.id
    setActiveTab('chat')

    if (accountType === 'company') {
      const hasSelectedChat = Boolean(selectedCompanyDriverId || selectedCompanyTeamThreadId)
      if (!hasSelectedChat) {
        Alert.alert('Condivisione pronta', 'Scegli una chat o un gruppo: il contenuto sara gia pronto da inviare.')
      }
      return
    }

    if (isWorkforcePerson) {
      void handleOpenWorkforceCompanyChat()
    } else {
      openDriverChat('company')
    }
  }, [
    accountType,
    incomingChatShare?.id,
    isBooting,
    isWorkforcePerson,
    selectedCompanyDriverId,
    selectedCompanyTeamThreadId,
    session,
  ])

  useEffect(() => {
    if (isBooting || !settingsReady || !session) return undefined

    const companyId = accountType === 'company'
      ? companyContext?.companyProfile?.id
      : driver?.companyId ?? currentPerson?.companyId
    const driverId = accountType === 'driver' ? driver?.id ?? currentPerson?.id : ''

    if (!companyId || (accountType === 'driver' && !driverId)) return undefined

    const promptKey = getNativePushPromptStorageKey(accountType, companyId, driverId)
    if (nativePushPromptRef.current === promptKey) return undefined

    let isActive = true
    let timerId = null

    async function maybePromptNativeNotifications() {
      const hasAlreadyPrompted = await AsyncStorage.getItem(promptKey)
      if (!isActive || hasAlreadyPrompted) return

      nativePushPromptRef.current = promptKey
      timerId = setTimeout(() => {
        if (!isActive) return

        Alert.alert(
          'Attiva notifiche',
          'Vuoi ricevere messaggi, guasti, check e documenti importanti anche quando l app e chiusa?',
          [
            {
              text: 'Dopo',
              style: 'cancel',
              onPress: () => {
                void AsyncStorage.setItem(promptKey, 'dismissed')
              },
            },
            {
              text: 'Attiva ora',
              onPress: () => {
                void AsyncStorage.setItem(promptKey, 'accepted')
                void handleEnableNativeNotifications()
              },
            },
          ],
        )
      }, 900)
    }

    void maybePromptNativeNotifications()

    return () => {
      isActive = false
      if (timerId) clearTimeout(timerId)
    }
  }, [
    accountType,
    companyContext?.companyProfile?.id,
    currentPerson?.companyId,
    currentPerson?.id,
    driver?.companyId,
    driver?.id,
    isBooting,
    session,
    settingsReady,
  ])

  useEffect(() => {
    if (accountType !== 'driver' || !driver?.id) {
      setDriverChatReadWatermark(0)
      return undefined
    }

    let isActive = true

    async function loadDriverChatReadWatermark() {
      const storedWatermark = await AsyncStorage.getItem(getDriverChatReadStorageKey(driver.id))
      const parsedWatermark = Number(storedWatermark)
      if (isActive) {
        setDriverChatReadWatermark((currentWatermark) => Math.max(
          currentWatermark,
          Number.isFinite(parsedWatermark) ? parsedWatermark : 0,
        ))
      }
    }

    void loadDriverChatReadWatermark()

    return () => {
      isActive = false
    }
  }, [accountType, driver?.id])

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab('home')
    }
  }, [activeTab, visibleTabs])

  useEffect(() => {
    if (accountType !== 'driver' || !driver?.companyId || !driver?.id) return undefined

    let isActive = true
    const unsubscribe = subscribeToDriverChatMessages({
      companyId: driver.companyId,
      onMessage: async () => {
        if (!isActive) return
        await loadDriverChatData(driver, { markAsRead: activeTab === 'chat' && driverChatMode === 'company' })
      },
    })

    return () => {
      isActive = false
      unsubscribe?.()
    }
  }, [accountType, activeTab, driver?.companyId, driver?.id, driverChatMode])

  useEffect(() => {
    const companyId = driver?.companyId ?? currentPerson?.companyId
    const actorId = currentPerson?.id ?? driver?.id
    if (accountType !== 'driver' || !companyId || !actorId) return undefined

    let isActive = true
    const unsubscribe = subscribeToTeamChatMessages({
      companyId,
      onMessage: async (message) => {
        if (!isActive) return

        if (activeTab === 'chat' && driverChatMode === 'team' && selectedDriverTeamThreadId && message?.threadId === selectedDriverTeamThreadId) {
          await loadDriverTeamChatData(selectedDriverTeamThread)
          return
        }

        if (message?.senderPersonId && message.senderPersonId !== actorId) {
          triggerHaptic('light')
        }

        await loadDriverData({ silent: true })
      },
    })

    return () => {
      isActive = false
      unsubscribe?.()
    }
  }, [accountType, activeTab, currentPerson?.companyId, currentPerson?.id, driver?.companyId, driver?.id, driverChatMode, selectedDriverTeamThread?.id, selectedDriverTeamThreadId])

  useEffect(() => {
    if (accountType !== 'driver' || !driver?.companyId || !driver?.id) return undefined

    let refreshTimer = null
    function scheduleRefresh() {
      if (refreshTimer) clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => {
        void loadDriverData({ silent: true })
      }, 450)
    }

    const unsubscribe = subscribeToOperationalUpdates({
      companyId: driver.companyId,
      driverId: driver.id,
      handlers: {
        onChange: scheduleRefresh,
      },
    })

    return () => {
      unsubscribe?.()
      if (refreshTimer) clearTimeout(refreshTimer)
    }
  }, [accountType, driver?.companyId, driver?.id])

  useEffect(() => {
    const companyId = companyContext?.companyProfile?.id
    if (accountType !== 'company' || !companyId) return undefined

    let isActive = true
    const unsubscribe = subscribeToDriverChatMessages({
      companyId,
      onMessage: async (message) => {
        if (!isActive) return

        setCompanyContext((currentContext) => (
          currentContext
            ? { ...currentContext, chatMessages: mergeChatMessage(currentContext.chatMessages ?? [], message) }
            : currentContext
        ))

        const hasOpenSelectedChat = activeTab === 'chat' && selectedCompanyDriverId && (
          !companyChatThread?.id || message.threadId === companyChatThread.id
        )

        if (hasOpenSelectedChat) {
          const currentDriver = companyContext?.drivers?.find((entry) => entry.id === selectedCompanyDriverId)
          await loadCompanyChatData(currentDriver, { markAsRead: true })
          return
        }

        if (message.senderRole === 'driver') {
          triggerHaptic('light')
          await loadCompanyData({ silent: true })
        }
      },
    })

    return () => {
      isActive = false
      unsubscribe?.()
    }
  }, [accountType, activeTab, companyChatThread?.id, companyContext?.companyProfile?.id, selectedCompanyDriverId])

  useEffect(() => {
    const companyId = companyContext?.companyProfile?.id
    if (accountType !== 'company' || !companyId) return undefined

    let isActive = true
    const unsubscribe = subscribeToTeamChatMessages({
      companyId,
      onMessage: async (message) => {
        if (!isActive) return

        setCompanyContext((currentContext) => (
          currentContext
            ? { ...currentContext, teamChatMessages: mergeChatMessage(currentContext.teamChatMessages ?? [], message) }
            : currentContext
        ))

        if (activeTab === 'chat' && selectedCompanyTeamThreadId && message?.threadId === selectedCompanyTeamThreadId) {
          await loadCompanyTeamChatData(selectedCompanyTeamThread)
          return
        }

        if (message?.senderPersonId || (message?.senderRole && message.senderRole !== 'company')) {
          triggerHaptic('light')
        }

        await loadCompanyData({ silent: true })
      },
    })

    return () => {
      isActive = false
      unsubscribe?.()
    }
  }, [accountType, activeTab, companyContext?.companyProfile?.id, selectedCompanyTeamThread?.id, selectedCompanyTeamThreadId])

  useEffect(() => {
    const companyId = companyContext?.companyProfile?.id
    if (accountType !== 'company' || !companyId) return undefined

    let refreshTimer = null
    function scheduleRefresh() {
      if (refreshTimer) clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => {
        void loadCompanyData({ silent: true })
      }, 450)
    }

    const unsubscribe = subscribeToOperationalUpdates({
      companyId,
      handlers: {
        onFaultReport: (fault, payload) => {
          if (payload?.eventType === 'INSERT') {
            triggerHaptic(['high', 'stop_vehicle'].includes(fault.severity) ? 'critical' : 'light')
          }
        },
        onVehicleCheck: (check, payload) => {
          if (payload?.eventType === 'INSERT') {
            triggerHaptic(getCheckIssues(check).length ? 'critical' : 'success')
          }
        },
        onChange: scheduleRefresh,
      },
    })

    return () => {
      unsubscribe?.()
      if (refreshTimer) clearTimeout(refreshTimer)
    }
  }, [accountType, companyContext?.companyProfile?.id])

  useEffect(() => {
    const companyId = companyContext?.companyProfile?.id
    if (accountType !== 'company' || !companyId) return undefined

    const intervalMs = activeTab === 'chat' ? 3000 : 4500
    const refreshCompanySilently = async () => {
      if (companyRefreshInFlightRef.current) return

      companyRefreshInFlightRef.current = true
      try {
        await loadCompanyData({ silent: true })
      } finally {
        companyRefreshInFlightRef.current = false
      }
    }
    const refreshInterval = setInterval(() => {
      void refreshCompanySilently()
    }, intervalMs)

    return () => {
      clearInterval(refreshInterval)
    }
  }, [accountType, activeTab, companyContext?.companyProfile?.id])

  useEffect(() => {
    if (accountType !== 'driver' || activeTab !== 'chat' || driverChatMode !== 'company' || !driver?.companyId || !driver?.id) return
    void loadDriverChatData(driver, { markAsRead: true })
  }, [accountType, activeTab, driver?.companyId, driver?.id, driverChatMode])

  useEffect(() => {
    if (accountType !== 'driver' || activeTab !== 'chat' || driverChatMode !== 'company' || !chatThread?.id) return

    const unreadCount = countUnreadMessagesForRole(chatMessages, 'driver')
    if (!unreadCount) return

    const nextMessages = markMessagesReadLocally(chatMessages, 'driver')
    clearDriverUnreadMessages(nextMessages)
    setChatMessages(nextMessages)
    void markChatMessagesRead(chatThread.id, 'driver').then((readResult) => {
      if (!readResult?.error && readResult?.data?.length) {
        setChatMessages((currentMessages) => mergeChatMessageUpdates(currentMessages, readResult.data))
      }
    })
  }, [accountType, activeTab, chatMessages, chatThread?.id, driverChatMode])

  useEffect(() => {
    if (accountType !== 'driver' || !driver?.id) {
      setSelectedDailyVehicleId('')
      return undefined
    }

    let isActive = true

    async function loadDailyVehicle() {
      const storedVehicleId = await AsyncStorage.getItem(getDailyVehicleStorageKey(driver.id))
      if (isActive) setSelectedDailyVehicleId(storedVehicleId ?? '')
    }

    void loadDailyVehicle()

    return () => {
      isActive = false
    }
  }, [accountType, driver?.id])

  useEffect(() => {
    if (!selectedDailyVehicleId) return
    const selectedVehicleExists = (context?.vehicles ?? []).some((vehicle) => (
      vehicle.id === selectedDailyVehicleId && vehicle.fleetType !== 'semirimorchio'
    ))

    if (!selectedVehicleExists) setSelectedDailyVehicleId('')
  }, [context?.vehicles, selectedDailyVehicleId])

  useEffect(() => {
    if (accountType !== 'company' || activeTab !== 'chat' || selectedCompanyTeamThreadId || !selectedCompanyDriver?.id) return
    void loadCompanyChatData(selectedCompanyDriver, { markAsRead: true })
  }, [accountType, activeTab, selectedCompanyDriver?.id, selectedCompanyTeamThreadId])

  useEffect(() => {
    if (accountType !== 'driver' || !driver?.companyId || !driver?.id) return undefined

    const presence = subscribeToDriverPresence({
      actor: {
        actorId: driver.id,
        actorName: driver.name,
        actorRole: 'driver',
      },
      companyId: driver.companyId,
      handlers: {
        onPresenceChange: (presences) => {
          setIsCompanyOnline(presences.some((presence) => presence.actorRole === 'company'))
        },
        onTyping: (payload) => {
          if (payload.actorRole !== 'company') return
          if (chatThread?.id && payload.threadId !== chatThread.id) return

          setIsCompanyTyping(Boolean(payload.isTyping))
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          if (payload.isTyping) {
            typingTimeoutRef.current = setTimeout(() => setIsCompanyTyping(false), 2200)
          }
        },
      },
    })

    presenceRef.current = presence

    return () => {
      presence.cleanup()
      if (presenceRef.current === presence) presenceRef.current = null
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [accountType, driver?.companyId, driver?.id, chatThread?.id])

  useEffect(() => {
    const companyId = companyContext?.companyProfile?.id
    if (accountType !== 'company' || !companyId) {
      setOnlineDriverIds([])
      setIsSelectedDriverTyping(false)
      return undefined
    }

    const presence = subscribeToDriverPresence({
      actor: {
        actorId: companyId,
        actorName: companyName,
        actorRole: 'company',
      },
      companyId,
      handlers: {
        onPresenceChange: (presences) => {
          const nextOnlineDriverIds = presences
            .filter((presence) => presence.actorRole === 'driver')
            .map((presence) => presence.actorId)
          setOnlineDriverIds([...new Set(nextOnlineDriverIds)])
        },
        onTyping: (payload) => {
          if (payload.actorRole !== 'driver') return
          if (selectedCompanyDriverId && payload.actorId !== selectedCompanyDriverId) return
          if (companyChatThread?.id && payload.threadId !== companyChatThread.id) return

          setIsSelectedDriverTyping(Boolean(payload.isTyping))
          if (companyTypingTimeoutRef.current) clearTimeout(companyTypingTimeoutRef.current)
          if (payload.isTyping) {
            companyTypingTimeoutRef.current = setTimeout(() => setIsSelectedDriverTyping(false), 2200)
          }
        },
      },
    })

    companyPresenceRef.current = presence

    return () => {
      presence.cleanup()
      if (companyPresenceRef.current === presence) companyPresenceRef.current = null
      if (companyTypingTimeoutRef.current) clearTimeout(companyTypingTimeoutRef.current)
    }
  }, [accountType, companyChatThread?.id, companyContext?.companyProfile?.id, companyName, selectedCompanyDriverId])

  async function handleAuthenticated(nextSession, nextAccountType = 'driver') {
    const safeAccountType = nextAccountType === 'company' ? 'company' : 'driver'
    setAccountType(safeAccountType)
    setSession(nextSession)
    setActiveTab('home')
    const loaded = safeAccountType === 'company' ? await loadCompanyData() : await loadDriverData()
    if (!loaded) {
      Alert.alert('Accesso riuscito', 'Login ok, ma i dati non sono stati caricati.')
    }
  }

  async function handleSignOut() {
    await signOutDriver()
    setAccountType('driver')
    setActiveTab('home')
    setChatMessages([])
    setDriverChatMode('list')
    setChatThread(null)
    setDriverTeamChatMessages([])
    setDriverChatReadWatermark(0)
    clearDriverUnreadMessages()
    setCompanyChatMessages([])
    setCompanyChatThread(null)
    setCompanyTeamChatMessages([])
    setCompanyContext(null)
    setCompanyDriverPhotoUrls({})
    setContext(null)
    setDriverProfileUrl('')
    setIsCompanyOnline(false)
    setIsCompanyTyping(false)
    setIsSelectedDriverTyping(false)
    setLogoUrl('')
    setOnlineDriverIds([])
    setSelectedCompanyDriverId('')
    setSelectedCompanyTeamThreadId('')
    setSelectedDailyVehicleId('')
    setSelectedDriverTeamThreadId('')
    setSession(null)
  }

  async function handleEnableNativeNotifications() {
    const companyId = accountType === 'company'
      ? companyContext?.companyProfile?.id
      : driver?.companyId ?? currentPerson?.companyId

    if (!companyId) {
      const message = 'Apri l account e attendi il caricamento dati, poi riprova.'
      setNativePushStatus(message)
      Alert.alert('Notifiche non pronte', message)
      return false
    }

    setNativePushStatus('Attivo notifiche su questo telefono...')
    const registration = await registerNativePushDevice()

    if (registration.error) {
      setNativePushStatus(registration.error.message)
      Alert.alert('Notifiche non attivate', registration.error.message)
      return false
    }

    const result = await saveNativePushToken({
      companyId,
      deviceName: registration.data.deviceName,
      platform: registration.data.platform,
      token: registration.data.token,
    })

    if (result.error) {
      setNativePushStatus(result.error.message)
      Alert.alert('Notifiche non salvate', result.error.message)
      return false
    }

    setNativePushStatus('Notifiche app abilitate su questo telefono.')
    triggerHaptic('success')
    Alert.alert('Notifiche attive', 'Questo telefono ricevera le notifiche Camion Chiaro.')
    return true
  }

  async function notifyPhone(payload) {
    const companyId = accountType === 'company'
      ? companyContext?.companyProfile?.id
      : driver?.companyId ?? currentPerson?.companyId

    if (!companyId || !payload?.targetRole) {
      return { data: null, error: { message: 'Azienda o destinatario notifica mancante.' } }
    }

    return sendPushNotification({
      companyId,
      ...payload,
    })
  }

  async function handleSelectDailyVehicle(vehicleId) {
    if (!driver?.id || !vehicleId) return false

    setSelectedDailyVehicleId(vehicleId)
    await AsyncStorage.setItem(getDailyVehicleStorageKey(driver.id), vehicleId)
    return true
  }

  function openDriverChat(mode = 'list') {
    if (mode === 'company') {
      markDriverChatReadLocally()
    }
    setDriverChatMode(mode)
    setSelectedDriverTeamThreadId('')
    setDriverTeamChatMessages([])
    setActiveTab('chat')

    if (mode === 'company' && driver?.companyId && driver?.id) {
      void loadDriverChatData(driver, { markAsRead: true })
    }
  }

  function openDriverUnreadChat() {
    if (unreadCompanyMessages > 0) {
      openDriverChat('company')
      return
    }

    const unreadByThreadId = context?.unreadTeamMessagesByThreadId ?? {}
    const unreadThread = (context?.teamChatThreads ?? []).find((thread) => Number(unreadByThreadId[thread.id] ?? 0) > 0)
    if (unreadThread) {
      void handleSelectDriverTeamThread(unreadThread)
      setActiveTab('chat')
      return
    }

    openDriverChat('list')
  }

  function closeDriverChatDetail() {
    setDriverChatMode('list')
    setSelectedDriverTeamThreadId('')
    setDriverTeamChatMessages([])
  }

  function resetDriverChatBadge() {
    markDriverChatReadLocally()

    if (chatThread?.id) {
      void markChatMessagesRead(chatThread.id, 'driver')
    }

    if (driver?.companyId && driver?.id) {
      void loadDriverChatData(driver, { markAsRead: true })
    }
  }

  async function handleSendChatMessage(body, attachment = null) {
    if (!driver || (!body.trim() && !attachment?.uri)) return false

    const result = await sendChatMessage({
      attachment,
      body,
      companyId: driver.companyId,
      driverId: driver.id,
      threadId: chatThread?.id,
    })

    if (result.error) {
      Alert.alert('Messaggio non inviato', result.error.message)
      return false
    }

    if (result.data?.thread && !chatThread) setChatThread(result.data.thread)
    if (result.data?.message) {
      setChatMessages((currentMessages) => mergeChatMessage(currentMessages, result.data.message))
      clearDriverUnreadMessages()
      triggerHaptic('light')
      void notifyPhone({
        body: body.trim() || (attachment?.uri ? 'Allegato in chat.' : 'Nuovo messaggio.'),
        notificationType: 'chat',
        tag: `chat-company-${result.data.thread?.id ?? chatThread?.id ?? driver.id}`,
        targetRole: 'company',
        threadId: result.data.thread?.id ?? chatThread?.id ?? '',
        title: driver.name,
        url: '/?view=chat',
      })
    }

    return true
  }

  async function handleSelectDriverTeamThread(nextThread) {
    if (!nextThread?.id) return
    setDriverChatMode('team')
    setSelectedDriverTeamThreadId(nextThread.id)
    await loadDriverTeamChatData(nextThread)
  }

  async function handleSelectDriverPerson(nextPerson, displayTitle = '') {
    const companyId = driver?.companyId ?? currentPerson?.companyId
    if (!companyId || !nextPerson?.id) return false

    const result = await ensureDirectTeamThread({
      companyId,
      personId: nextPerson.id,
    })

    if (result.error) {
      Alert.alert('Chat diretta non pronta', result.error.message)
      return false
    }

    const nextThread = displayTitle ? { ...result.data, title: displayTitle } : result.data
    if (!nextThread?.id) return false

    setContext((currentContext) => {
      if (!currentContext) return currentContext
      return {
        ...currentContext,
        teamChatThreads: upsertTeamThread(currentContext.teamChatThreads ?? [], nextThread),
      }
    })
    setDriverChatMode('team')
    setSelectedDriverTeamThreadId(nextThread.id)
    setDriverTeamChatMessages([])
    setActiveTab('chat')
    await loadDriverTeamChatData(nextThread)
    return true
  }

  async function handleOpenWorkforceCompanyChat() {
    if (!isWorkforcePerson || !currentPerson?.id) {
      openDriverChat('company')
      return true
    }

    return handleSelectDriverPerson(currentPerson, companyName)
  }

  async function handleSendDriverTeamChatMessage(body, attachment = null) {
    const actorPerson = context?.currentPerson
    const companyId = driver?.companyId ?? actorPerson?.companyId
    if (!companyId || !actorPerson?.id || !selectedDriverTeamThread || (!body.trim() && !attachment?.uri)) return false

    const senderRole = actorPerson?.department === 'warehouse'
      ? 'warehouse'
      : actorPerson?.department === 'office'
        ? 'office'
        : 'driver'
    const actorName = driver?.name ?? actorPerson?.name ?? 'Persona'

    const result = await sendTeamChatMessage({
      attachment,
      body,
      companyId,
      senderPersonId: actorPerson.id,
      senderRole,
      threadId: selectedDriverTeamThread.id,
    })

    if (result.error) {
      Alert.alert('Messaggio non inviato', result.error.message)
      return false
    }

    if (result.data?.message) {
      setDriverTeamChatMessages((currentMessages) => mergeChatMessage(currentMessages, result.data.message))
      triggerHaptic('light')
      void notifyPhone({
        body: body.trim() || (attachment?.uri ? 'Allegato nel gruppo.' : 'Nuovo messaggio.'),
        notificationType: 'team_chat',
        tag: `team-chat-${selectedDriverTeamThread.id}`,
        targetRole: 'team',
        threadId: selectedDriverTeamThread.id,
        title: `${selectedDriverTeamThread.title} · ${actorName}`,
        url: '/?view=chat',
      })
      setContext((currentContext) => {
        if (!currentContext) return currentContext
        return {
          ...currentContext,
          teamChatThreads: (currentContext.teamChatThreads ?? []).map((thread) => (
            thread.id === selectedDriverTeamThread.id
              ? { ...thread, lastMessageAt: result.data.message.createdAt }
              : thread
          )),
        }
      })
    }

    return true
  }

  async function handleSelectCompanyDriver(nextDriver) {
    if (!nextDriver?.id) return
    setSelectedCompanyDriverId(nextDriver.id)
    setSelectedCompanyTeamThreadId('')
    setCompanyTeamChatMessages([])
    await loadCompanyChatData(nextDriver)
  }

  async function handleSelectCompanyTeamThread(nextThread) {
    if (!nextThread?.id) return
    setSelectedCompanyTeamThreadId(nextThread.id)
    setSelectedCompanyDriverId('')
    setCompanyChatMessages([])
    setCompanyChatThread(null)
    await loadCompanyTeamChatData(nextThread)
  }

  async function handleSelectCompanyPerson(nextPerson) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId || !nextPerson?.id) return false

    const result = await ensureDirectTeamThread({
      companyId,
      personId: nextPerson.id,
    })

    if (result.error) {
      Alert.alert('Chat diretta non pronta', result.error.message)
      return false
    }

    const nextThread = result.data
    if (!nextThread?.id) return false

    setCompanyContext((currentContext) => {
      if (!currentContext) return currentContext
      return {
        ...currentContext,
        teamChatThreads: upsertTeamThread(currentContext.teamChatThreads ?? [], nextThread),
      }
    })
    setSelectedCompanyTeamThreadId(nextThread.id)
    setSelectedCompanyDriverId('')
    setCompanyChatMessages([])
    setCompanyChatThread(null)
    setCompanyTeamChatMessages([])
    await loadCompanyTeamChatData(nextThread)
    return true
  }

  async function handleSendCompanyChatMessage(body, attachment = null) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId || !selectedCompanyDriver || (!body.trim() && !attachment?.uri)) return false

    const result = await sendCompanyChatMessage({
      attachment,
      body,
      companyId,
      driverId: selectedCompanyDriver.id,
      threadId: companyChatThread?.id,
    })

    if (result.error) {
      Alert.alert('Messaggio non inviato', result.error.message)
      return false
    }

    if (result.data?.thread && !companyChatThread) setCompanyChatThread(result.data.thread)
    if (result.data?.message) {
      setCompanyChatMessages((currentMessages) => mergeChatMessage(currentMessages, result.data.message))
      triggerHaptic('light')
      void notifyPhone({
        body: body.trim() || (attachment?.uri ? 'Allegato in chat.' : 'Nuovo messaggio.'),
        driverId: selectedCompanyDriver.id,
        notificationType: 'chat',
        tag: `chat-${result.data.thread?.id ?? companyChatThread?.id ?? selectedCompanyDriver.id}`,
        targetRole: 'driver',
        threadId: result.data.thread?.id ?? companyChatThread?.id ?? '',
        title: companyName,
        url: '/?view=chat',
      })
      setCompanyContext((currentContext) => {
        if (!currentContext || !result.data?.thread) return currentContext

        const nextThread = {
          ...result.data.thread,
          driverId: selectedCompanyDriver.id,
          lastMessageAt: result.data.message.createdAt,
        }
        const currentThreads = currentContext.chatThreads ?? []
        const hasThread = currentThreads.some((thread) => thread.id === nextThread.id)

        return {
          ...currentContext,
          chatMessages: mergeChatMessage(currentContext.chatMessages ?? [], result.data.message),
          chatThreads: hasThread
            ? currentThreads.map((thread) => (thread.id === nextThread.id ? { ...thread, ...nextThread } : thread))
            : [nextThread, ...currentThreads],
        }
      })
    }

    return true
  }

  async function handleSendCompanyTeamChatMessage(body, attachment = null) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId || !selectedCompanyTeamThread || (!body.trim() && !attachment?.uri)) return false

    const result = await sendTeamChatMessage({
      attachment,
      body,
      companyId,
      senderRole: 'company',
      threadId: selectedCompanyTeamThread.id,
    })

    if (result.error) {
      Alert.alert('Messaggio non inviato', result.error.message)
      return false
    }

    if (result.data?.message) {
      setCompanyTeamChatMessages((currentMessages) => mergeChatMessage(currentMessages, result.data.message))
      triggerHaptic('light')
      void notifyPhone({
        body: body.trim() || (attachment?.uri ? 'Allegato nel gruppo.' : 'Nuovo messaggio.'),
        notificationType: 'team_chat',
        tag: `team-chat-${selectedCompanyTeamThread.id}`,
        targetRole: 'team',
        threadId: selectedCompanyTeamThread.id,
        title: `${selectedCompanyTeamThread.title} · ${companyName}`,
        url: '/?view=chat',
      })
      setCompanyContext((currentContext) => {
        if (!currentContext) return currentContext
        return {
          ...currentContext,
          teamChatMessages: mergeChatMessage(currentContext.teamChatMessages ?? [], result.data.message),
          teamChatThreads: (currentContext.teamChatThreads ?? []).map((thread) => (
            thread.id === selectedCompanyTeamThread.id
              ? { ...thread, lastMessageAt: result.data.message.createdAt }
              : thread
          )),
        }
      })
    }

    return true
  }

  async function handleReactToCompanyMessage(message, actorRole, reaction) {
    if (!message?.id) return false

    const previousMessages = companyChatMessages
    const nextReactions = { ...(message.reactions ?? {}) }

    if (reaction) {
      nextReactions[actorRole] = reaction
    } else {
      delete nextReactions[actorRole]
    }

    setCompanyChatMessages((currentMessages) => currentMessages.map((currentMessage) => (
      currentMessage.id === message.id ? { ...currentMessage, reactions: nextReactions } : currentMessage
    )))

    const result = await updateChatMessageReaction({ ...message, reactions: message.reactions ?? {} }, actorRole, reaction)

    if (result.error) {
      setCompanyChatMessages(previousMessages)
      Alert.alert('Reazione non salvata', result.error.message)
      return false
    }

    if (result.data) {
      setCompanyChatMessages((currentMessages) => currentMessages.map((currentMessage) => (
        currentMessage.id === result.data.id ? result.data : currentMessage
      )))
    }

    return true
  }

  async function handleReactToMessage(message, actorRole, reaction) {
    if (!message?.id) return false

    const previousMessages = chatMessages
    const nextReactions = { ...(message.reactions ?? {}) }

    if (reaction) {
      nextReactions[actorRole] = reaction
    } else {
      delete nextReactions[actorRole]
    }

    setChatMessages((currentMessages) => currentMessages.map((currentMessage) => (
      currentMessage.id === message.id ? { ...currentMessage, reactions: nextReactions } : currentMessage
    )))

    const result = await updateChatMessageReaction({ ...message, reactions: message.reactions ?? {} }, actorRole, reaction)

    if (result.error) {
      setChatMessages(previousMessages)
      Alert.alert('Reazione non salvata', result.error.message)
      return false
    }

    if (result.data) {
      setChatMessages((currentMessages) => currentMessages.map((currentMessage) => (
        currentMessage.id === result.data.id ? result.data : currentMessage
      )))
    }

    return true
  }

  function handleTyping(isTyping) {
    presenceRef.current?.sendTyping({
      isTyping,
      threadId: chatThread?.id,
    })
  }

  function handleCompanyTyping(isTyping) {
    companyPresenceRef.current?.sendTyping({
      isTyping,
      threadId: companyChatThread?.id,
    })
  }

  function normalizeDocumentType(value = '') {
    return String(value).trim().toLowerCase().replace(/\s+/g, ' ')
  }

  async function handleCreateDocument(payload) {
    if (!driver || !payload?.type?.trim()) return false

    const cleanPayloadType = normalizeDocumentType(payload.type)
    const sameTypeDocument = (context?.documents ?? []).find((document) => (
      normalizeDocumentType(document.type) === cleanPayloadType
      || normalizeDocumentType(document.type).includes(cleanPayloadType)
      || cleanPayloadType.includes(normalizeDocumentType(document.type))
    ))

    if (sameTypeDocument) {
      const renewed = await handleRenewDocument(sameTypeDocument, {
        documentNumber: payload.documentNumber ?? sameTypeDocument.documentNumber,
        expiresAt: payload.expiresAt ?? sameTypeDocument.expiresAt,
        file: null,
        type: payload.type,
      })
      return renewed ? { updatedExisting: true } : false
    }

    const result = await createDriverDocument(payload)

    if (result.error) {
      Alert.alert('Documento non creato', result.error.message)
      return false
    }

    await loadDriverData({ silent: true })
    return { created: true }
  }

  async function handleUploadDocument(document, file) {
    if (!driver || !document?.id || !file?.uri) return false

    const result = await uploadDriverDocumentFile({
      companyId: driver.companyId,
      documentId: document.id,
      driverId: driver.id,
      file,
    })

    if (result.error) {
      Alert.alert('File non caricato', result.error.message)
      return false
    }

    await loadDriverData({ silent: true })
    return true
  }

  async function handleRenewDocument(document, payload) {
    if (!driver || !document?.id) return false

    const result = await renewDriverDocument({
      companyId: driver.companyId,
      document,
      driverId: driver.id,
      file: payload?.file ?? null,
      updates: {
        documentNumber: payload?.documentNumber ?? '',
        expiresAt: payload?.expiresAt ?? null,
        type: payload?.type ?? document.type,
      },
    })

    if (result.error) {
      Alert.alert('Rinnovo non salvato', result.error.message)
      return false
    }

    await loadDriverData({ silent: true })
    return true
  }

  async function handleUpdateProfilePhoto(file) {
    if (!driver || !file?.uri) return false

    const result = await uploadDriverProfileImage({
      companyId: driver.companyId,
      driverId: driver.id,
      file,
    })

    if (result.error) {
      Alert.alert('Foto non caricata', result.error.message)
      return false
    }

    await loadDriverData({ silent: true })
    return true
  }

  async function handleSubmitCheck(payload) {
    if (!driver) return false

    const result = await createVehicleCheck({
      ...payload,
      companyId: driver.companyId,
      driverId: driver.id,
    })

    if (result.error) {
      Alert.alert('Check non inviato', result.error.message)
      return false
    }

    const checkIssues = getCheckIssues(payload)
    triggerHaptic(checkIssues.length ? 'critical' : 'success')
    void notifyPhone({
      body: checkIssues.length
        ? `Check critico: ${checkIssues.join(', ')} su ${getVehicleDisplayName(context?.vehicles ?? [], payload.tractorId)}.`
        : `Check completato su ${getVehicleDisplayName(context?.vehicles ?? [], payload.tractorId)}.`,
      notificationType: checkIssues.length ? 'check_critical' : 'check',
      tag: `vehicle-check-${result.data?.id ?? Date.now()}`,
      targetRole: 'company',
      title: driver.name,
      url: '/?view=notifications',
    })
    await loadDriverData({ silent: true })
    return true
  }

  async function handleSubmitFault(payload) {
    if (!driver) return false

    const result = await createFaultReport({
      ...payload,
      companyId: driver.companyId,
      driverId: driver.id,
    })

    if (result.error) {
      Alert.alert('Guasto non inviato', result.error.message)
      return false
    }

    triggerHaptic(['high', 'stop_vehicle'].includes(payload.severity) ? 'critical' : 'success')
    void notifyPhone({
      body: `${payload.title || 'Guasto segnalato'} su ${getVehicleDisplayName(context?.vehicles ?? [], payload.vehicleId)}.`,
      notificationType: 'fault',
      tag: `fault-report-${result.data?.id ?? Date.now()}`,
      targetRole: 'company',
      title: driver.name,
      url: '/?view=notifications',
    })
    await loadDriverData({ silent: true })
    return true
  }

  async function handleCreateCompanyDriver(payload, password) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId) return null

    const result = await createCompanyDriverAccount({
      companyId,
      driver: payload,
      password,
    })

    if (result.error) {
      Alert.alert('Autista non creato', result.error.message)
      return null
    }

    await loadCompanyData({ silent: true })
    return result.data
  }

  async function handleCreateCompanyVehicle(payload) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId) return null

    const result = await createCompanyVehicle({
      companyId,
      vehicle: payload,
    })

    if (result.error) {
      Alert.alert('Mezzo non creato', result.error.message)
      return null
    }

    await loadCompanyData({ silent: true })
    return result.data
  }

  async function handleCreateCompanyPerson(payload) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId) return null

    const result = await createCompanyPerson({
      companyId,
      person: payload,
    })

    if (result.error) {
      Alert.alert('Persona non creata', result.error.message)
      return null
    }

    await loadCompanyData({ silent: true })
    return result.data
  }

  async function handleCreateCompanyWarehouseAsset(payload) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId) return null

    const result = await createCompanyWarehouseAsset({
      asset: payload,
      companyId,
    })

    if (result.error) {
      Alert.alert('Attrezzatura non creata', result.error.message)
      return null
    }

    await loadCompanyData({ silent: true })
    return result.data
  }

  async function handleCreateCompanyDeadline(payload, file = null) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId) return null

    const result = await createCompanyComplianceItem({
      companyId,
      file,
      item: payload,
    })

    if (result.error) {
      Alert.alert('Scadenza non creata', result.error.message)
      return null
    }

    await loadCompanyData({ silent: true })
    return result.data
  }

  async function handleRenewCompanyDeadline(item, payload, file = null) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId || !item?.id) return null

    const result = await renewCompanyComplianceItem({
      companyId,
      file,
      item,
      updates: payload,
    })

    if (result.error) {
      Alert.alert('Scadenza non aggiornata', result.error.message)
      return null
    }

    await loadCompanyData({ silent: true })
    return result.data
  }

  async function handleCloseCompanyDeadline(itemId) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId || !itemId) return false

    const result = await updateCompanyComplianceItemStatus({
      companyId,
      itemId,
      status: 'done',
    })

    if (result.error) {
      Alert.alert('Pratica non chiusa', result.error.message)
      return false
    }

    await loadCompanyData({ silent: true })
    return true
  }

  function getCompanyDeadlineTarget(item = {}) {
    if (item.driverId) {
      const driverTarget = companyContext?.drivers?.find((entry) => entry.id === item.driverId)
      if (driverTarget) return { label: driverTarget.name, type: 'driver', value: driverTarget }
    }

    if (item.personId) {
      const personTarget = companyContext?.people?.find((entry) => entry.id === item.personId)
      if (personTarget) return { label: personTarget.name, type: 'person', value: personTarget }
    }

    return null
  }

  function formatReminderDate(value) {
    if (!value) return 'senza data indicata'

    try {
      return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
    } catch {
      return value
    }
  }

  async function handleSendCompanyDeadlineReminder(item) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId || !item?.id) return false

    const target = getCompanyDeadlineTarget(item)
    if (!target) {
      Alert.alert('Sollecito non disponibile', 'Questa scadenza non e collegata a un autista o a una persona aziendale.')
      return false
    }

    const body = `Sollecito Camion Chiaro: aggiorna ${item.type || 'documento'} entro la scadenza ${formatReminderDate(item.dueDate)} direttamente dall'app. Se hai gia provveduto, carica il nuovo documento o avvisa l'azienda.`

    if (target.type === 'driver') {
      const result = await sendCompanyChatMessage({
        body,
        companyId,
        driverId: target.value.id,
      })

      if (result.error) {
        Alert.alert('Sollecito non inviato', result.error.message)
        return false
      }

      void notifyPhone({
        body,
        driverId: target.value.id,
        notificationType: 'deadline_reminder',
        tag: `deadline-${item.id}`,
        targetRole: 'driver',
        threadId: result.data?.thread?.id ?? '',
        title: companyName,
        url: '/?view=documents',
      })
      await loadCompanyData({ silent: true })
      return true
    }

    const threadResult = await ensureDirectTeamThread({
      companyId,
      personId: target.value.id,
    })

    if (threadResult.error) {
      Alert.alert('Chat non pronta', threadResult.error.message)
      return false
    }

    const result = await sendTeamChatMessage({
      body,
      companyId,
      senderRole: 'company',
      threadId: threadResult.data.id,
    })

    if (result.error) {
      Alert.alert('Sollecito non inviato', result.error.message)
      return false
    }

    void notifyPhone({
      body,
      notificationType: 'deadline_reminder',
      tag: `deadline-${item.id}`,
      targetRole: 'team',
      threadId: threadResult.data.id,
      title: companyName,
      url: '/?view=chat',
    })
    await loadCompanyData({ silent: true })
    return true
  }

  async function handleResolveCompanyFault(reportId, repair = {}) {
    if (!reportId) return false

    const result = await updateFaultReportStatus(reportId, 'closed', repair)

    if (result.error) {
      Alert.alert('Guasto non chiuso', result.error.message)
      return false
    }

    setCompanyContext((currentContext) => {
      if (!currentContext) return currentContext
      const updatedReport = result.data
      const localRepairPatch = Object.prototype.hasOwnProperty.call(repair, 'repairCostCents') ||
        Object.prototype.hasOwnProperty.call(repair, 'repairNotes')
        ? {
            repairCostCents: Number(repair.repairCostCents ?? 0),
            repairCostCurrency: repair.repairCostCurrency || getDefaultCurrency(language),
            repairNotes: repair.repairNotes ?? '',
            repairRecordedAt: new Date().toISOString(),
          }
        : {}

      return {
        ...currentContext,
        faultReports: currentContext.faultReports.map((report) => (
          report.id === reportId ? { ...report, ...localRepairPatch, ...(updatedReport ?? {}), status: 'closed' } : report
        )),
      }
    })

    return true
  }

  async function handleUpdateCompanyFaultRepair(reportId, repair = {}) {
    if (!reportId) return false

    const currentReport = companyContext?.faultReports?.find((report) => report.id === reportId)
    const result = await updateFaultReportStatus(reportId, currentReport?.status || 'open', repair)

    if (result.error) {
      Alert.alert('Costo non salvato', result.error.message)
      return false
    }

    setCompanyContext((currentContext) => {
      if (!currentContext) return currentContext
      const updatedReport = result.data
      const localRepairPatch = Object.prototype.hasOwnProperty.call(repair, 'repairCostCents') ||
        Object.prototype.hasOwnProperty.call(repair, 'repairNotes')
        ? {
            repairCostCents: Number(repair.repairCostCents ?? 0),
            repairCostCurrency: repair.repairCostCurrency || getDefaultCurrency(language),
            repairNotes: repair.repairNotes ?? '',
            repairRecordedAt: new Date().toISOString(),
          }
        : {}

      return {
        ...currentContext,
        faultReports: currentContext.faultReports.map((report) => (
          report.id === reportId ? { ...report, ...localRepairPatch, ...(updatedReport ?? {}) } : report
        )),
      }
    })

    return true
  }

  async function handleResolveCompanyCheck(checkId) {
    if (!checkId) return false

    const result = await updateVehicleCheckStatus(checkId, 'resolved')

    if (result.error) {
      Alert.alert('Check non risolto', result.error.message)
      return false
    }

    setCompanyContext((currentContext) => {
      if (!currentContext) return currentContext
      const updatedCheck = result.data

      return {
        ...currentContext,
        vehicleChecks: currentContext.vehicleChecks.map((check) => (
          check.id === checkId ? { ...check, ...(updatedCheck ?? {}), status: 'resolved' } : check
        )),
      }
    })

    return true
  }

  function openCompanyManagement(section = 'drivers') {
    setManagementInitialSection(section)
    setActiveTab('archive')
  }

  function handleIncomingShareConsumed() {
    setIncomingChatShare(null)
  }

  const activeScreen = useMemo(() => {
    if (accountType === 'company') {
      if (activeTab === 'chat') {
        return (
          <CompanyChatScreen
            companyLogoUrl={logoUrl}
            companyName={companyName}
            chatThreads={companyContext?.chatThreads ?? []}
            currentUserRole="company"
            driverPhotoUrls={companyDriverPhotoUrls}
            drivers={companyContext?.drivers ?? []}
            isLoading={isRefreshing}
            messages={companyChatMessages}
            incomingShare={incomingChatShare}
            onBackToDrivers={() => {
              setSelectedCompanyDriverId('')
              setSelectedCompanyTeamThreadId('')
              setIsSelectedDriverTyping(false)
              setCompanyChatMessages([])
              setCompanyChatThread(null)
              setCompanyTeamChatMessages([])
            }}
            onReactToMessage={handleReactToCompanyMessage}
            onIncomingShareConsumed={handleIncomingShareConsumed}
            onRefresh={() => (selectedCompanyTeamThread ? loadCompanyTeamChatData() : loadCompanyChatData())}
            onSelectDriver={handleSelectCompanyDriver}
            onSelectPerson={handleSelectCompanyPerson}
            onSelectTeamThread={handleSelectCompanyTeamThread}
            onSend={handleSendCompanyChatMessage}
            onSendTeamMessage={handleSendCompanyTeamChatMessage}
            onTyping={handleCompanyTyping}
            people={companyContext?.people ?? []}
            selectedDriver={selectedCompanyDriver}
            selectedDriverOnline={selectedCompanyDriverOnline}
            selectedDriverTyping={isSelectedDriverTyping}
            selectedTeamThread={selectedCompanyTeamThread}
            soundEnabled={chatSoundEnabled}
            auditMessages={companyContext?.chatMessages ?? []}
            auditTeamMessages={companyContext?.teamChatMessages ?? []}
            teamMessages={companyTeamChatMessages}
            teamThreads={companyContext?.teamChatThreads ?? []}
            unreadByDriverId={companyContext?.unreadDriverMessagesByDriverId ?? {}}
            unreadTeamByThreadId={companyContext?.unreadTeamMessagesByThreadId ?? {}}
          />
        )
      }

      if (activeTab === 'settings') {
        return (
          <SettingsScreen
            accountType="company"
            chatSoundEnabled={chatSoundEnabled}
            language={language}
            nativePushStatus={nativePushStatus}
            onChatSoundChange={setChatSoundEnabled}
            onEnableNativeNotifications={handleEnableNativeNotifications}
            onOpenAssistant={() => setIsAssistantOpen(true)}
            onLanguageChange={setLanguage}
            onRefresh={() => loadCompanyData()}
            onSignOut={handleSignOut}
          />
        )
      }

      if (activeTab === 'manage' || activeTab === 'archive') {
        return (
          <CompanyManagementScreen
            context={companyContext}
            initialSection={managementInitialSection}
            initialMode={activeTab === 'manage' ? 'create' : 'archive'}
            language={language}
            onCreateDeadline={handleCreateCompanyDeadline}
            onCreateDriver={handleCreateCompanyDriver}
            onCreatePerson={handleCreateCompanyPerson}
            onCreateVehicle={handleCreateCompanyVehicle}
            onCreateWarehouseAsset={handleCreateCompanyWarehouseAsset}
            onCloseDeadline={handleCloseCompanyDeadline}
            onRenewDeadline={handleRenewCompanyDeadline}
            onSendDeadlineReminder={handleSendCompanyDeadlineReminder}
            onUpdateFaultRepair={handleUpdateCompanyFaultRepair}
          />
        )
      }

      return (
        <CompanyHomeScreen
          context={companyContext}
          isRefreshing={isRefreshing}
          language={language}
          logoUrl={logoUrl}
          onOpenChat={() => setActiveTab('chat')}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenManagement={openCompanyManagement}
          onRefresh={() => loadCompanyData()}
          onCloseDeadline={handleCloseCompanyDeadline}
          onRenewDeadline={handleRenewCompanyDeadline}
          onResolveCheck={handleResolveCompanyCheck}
          onResolveFault={handleResolveCompanyFault}
          onUpdateFaultRepair={handleUpdateCompanyFaultRepair}
          onSendDeadlineReminder={handleSendCompanyDeadlineReminder}
        />
      )
    }

    if (activeTab === 'chat') {
      return (
        <DriverChatHubScreen
          chatThread={chatThread}
          companyName={companyName}
          companyOnline={isCompanyOnline}
          companyTyping={isCompanyTyping}
          companyLogoUrl={logoUrl}
          currentPerson={context?.currentPerson}
          driverProfileUrl={driverProfileUrl}
          driverName={driverName}
          messages={chatMessages}
          incomingShare={incomingChatShare}
          onBackToList={closeDriverChatDetail}
          onIncomingShareConsumed={handleIncomingShareConsumed}
          onOpenCompanyChat={handleOpenWorkforceCompanyChat}
          onOpenPersonChat={handleSelectDriverPerson}
          onOpenTeamChat={handleSelectDriverTeamThread}
          onReactToMessage={handleReactToMessage}
          onRefreshCompanyChat={() => loadDriverChatData(driver, { markAsRead: true })}
          onRefreshTeamChat={() => loadDriverTeamChatData()}
          onSendCompanyMessage={handleSendChatMessage}
          onSendTeamMessage={handleSendDriverTeamChatMessage}
          onTyping={handleTyping}
          selectedMode={driverChatMode}
          selectedTeamThread={selectedDriverTeamThread}
          soundEnabled={chatSoundEnabled}
          people={context?.people ?? []}
          teamMessages={driverTeamChatMessages}
          teamThreads={context?.teamChatThreads ?? []}
          unreadCompanyMessages={unreadCompanyMessages}
          unreadTeamByThreadId={context?.unreadTeamMessagesByThreadId ?? {}}
        />
      )
    }

    if (activeTab === 'documents') {
      return (
        <DocumentsScreen
          focusDocumentId={documentFocusId}
          documents={context?.documents ?? []}
          language={language}
          onCreateDocument={handleCreateDocument}
          onRenewDocument={handleRenewDocument}
          onUploadDocument={handleUploadDocument}
        />
      )
    }

    if (activeTab === 'operations') {
      return (
        <OperationsScreen
          checks={context?.vehicleChecks ?? []}
          faults={context?.faultReports ?? []}
          language={language}
          onOpenHome={() => setActiveTab('home')}
          onSubmitCheck={handleSubmitCheck}
          onSubmitFault={handleSubmitFault}
          selectedVehicleId={selectedDailyVehicleId}
          vehicles={context?.vehicles ?? []}
        />
      )
    }

    if (activeTab === 'settings') {
      return (
        <SettingsScreen
          accountType="driver"
          chatSoundEnabled={chatSoundEnabled}
          chatDiagnostics={driverChatDiagnostics}
          language={language}
          nativePushStatus={nativePushStatus}
          onChatSoundChange={setChatSoundEnabled}
          onEnableNativeNotifications={handleEnableNativeNotifications}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onLanguageChange={setLanguage}
          onRefresh={() => loadDriverData()}
          onResetChatBadge={resetDriverChatBadge}
          onSignOut={handleSignOut}
        />
      )
    }

    if (isWorkforcePerson) {
      return (
        <WorkforceHomeScreen
          companyName={companyName}
          context={context}
          language={language}
          onOpenChat={() => openDriverChat('list')}
          onOpenSettings={() => setActiveTab('settings')}
        />
      )
    }

    return (
      <HomeScreen
        companyName={companyName}
        context={context}
        driverName={driverName}
        driverProfileUrl={driverProfileUrl}
        language={language}
        logoUrl={logoUrl}
        onOpenChat={openDriverUnreadChat}
        onOpenDocuments={(nextDocumentId = '') => {
          setDocumentFocusId(nextDocumentId || '')
          setActiveTab('documents')
        }}
        onOpenOperations={() => setActiveTab('operations')}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenSettings={() => setActiveTab('settings')}
        onSelectDailyVehicle={handleSelectDailyVehicle}
        onUpdateProfilePhoto={handleUpdateProfilePhoto}
        selectedDailyVehicleId={selectedDailyVehicleId}
        unreadCompanyMessages={unreadCompanyMessages}
      />
    )
  }, [
    accountType,
    activeTab,
    chatSoundEnabled,
    chatMessages,
    chatThread?.id,
    driverChatDiagnostics,
    companyContext,
    companyChatMessages,
    companyChatThread?.id,
    companyDriverPhotoUrls,
    companyTeamChatMessages,
    companyName,
    context,
    documentFocusId,
    driver,
    driverName,
    driverTeamChatMessages,
    driverProfileUrl,
    isCompanyOnline,
    isCompanyTyping,
    isSelectedDriverTyping,
    isWorkforcePerson,
    isRefreshing,
    incomingChatShare,
    language,
    logoUrl,
    managementInitialSection,
    nativePushStatus,
    onlineDriverIds,
    selectedCompanyDriver,
    selectedCompanyDriverId,
    selectedCompanyDriverOnline,
    selectedCompanyTeamThread,
    selectedDailyVehicleId,
    selectedDriverTeamThread,
    unreadCompanyMessages,
  ])

  if (isBooting) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ExpoStatusBar style="light" />
        <ActivityIndicator color={colors.cyan} size="large" />
        <Text style={styles.loadingTitle}>Camion Chiaro</Text>
        <Text style={styles.loadingText}>{appStatus}</Text>
      </SafeAreaView>
    )
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.authShell}>
        <ExpoStatusBar style="dark" />
        <AuthScreen language={language} onAuthenticated={handleAuthenticated} />
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.shell}>
      <ExpoStatusBar backgroundColor="#020617" style="light" translucent={false} />
      <StatusBar backgroundColor="#020617" barStyle="light-content" translucent={false} />
      <View style={[styles.header, { paddingTop: headerSafeTop + 10 }]}>
        <View style={styles.headerIdentity}>
          <View style={styles.headerLogo}>
            <Image source={logoUrl ? { uri: logoUrl } : camionChiaroIcon} style={styles.headerLogoImage} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text numberOfLines={1} style={styles.companyName}>{companyName}</Text>
            <Text numberOfLines={1} style={styles.driverName}>{headerSubtitle}</Text>
          </View>
        </View>
      </View>

      {appStatus ? <Text style={styles.statusText}>{appStatus}</Text> : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={styles.content}
      >
        <ScreenErrorBoundary
          resetKey={[
            accountType,
            activeTab,
            selectedCompanyDriverId,
            selectedCompanyTeamThreadId,
            driverChatMode,
            selectedDriverTeamThreadId,
          ].join(':')}
        >
          {activeScreen}
        </ScreenErrorBoundary>
      </KeyboardAvoidingView>

      <View style={[styles.tabBar, { paddingBottom: footerSafeBottom }]}>
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id
          const hasBadge = tab.id === 'chat' && chatBadgeCount > 0
          const tabLabel = t(language, tab.labelKey, tab.label)

          return (
            <Pressable
              accessibilityLabel={tabLabel}
              key={tab.id}
              onPress={() => {
                if (accountType === 'driver' && tab.id === 'chat') {
                  openDriverChat()
                  return
                }

                setActiveTab(tab.id)
              }}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <View style={[styles.tabIconShell, isActive && styles.tabIconShellActive]}>
                <Ionicons
                  color={isActive ? colors.ink : colors.cyan}
                  name={tab.icon}
                  size={19}
                />
              </View>
              <Text numberOfLines={1} style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tabLabel}</Text>
              {hasBadge ? <Text style={styles.tabBadge}>{chatBadgeCount}</Text> : null}
            </Pressable>
          )
        })}
      </View>
      <AssistantModal
        accountType={accountType}
        actorName={accountType === 'company' ? companyName : driverName}
        companyName={companyName}
        onClose={() => setIsAssistantOpen(false)}
        visible={isAssistantOpen}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  authShell: {
    backgroundColor: colors.background,
    flex: 1,
  },
  companyName: {
    color: colors.ink,
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '900',
  },
  content: {
    backgroundColor: colors.background,
    flex: 1,
  },
  driverName: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 14,
  },
  headerIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    paddingRight: 10,
  },
  headerLogo: {
    alignItems: 'center',
    backgroundColor: '#e0faff',
    borderColor: colors.cyan,
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 44,
  },
  headerLogoImage: {
    height: '100%',
    width: '100%',
  },
  headerLogoText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#a7f3ff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingTitle: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '900',
    marginTop: 18,
  },
  screenError: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  screenErrorCode: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    color: '#991b1b',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: 12,
    padding: 12,
    textAlign: 'center',
  },
  screenErrorText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 8,
    textAlign: 'center',
  },
  screenErrorTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
    marginTop: 12,
  },
  shell: {
    backgroundColor: '#020617',
    flex: 1,
  },
  statusText: {
    backgroundColor: '#ecfeff',
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 8,
  },
  tabBadge: {
    backgroundColor: colors.danger,
    borderColor: colors.white,
    borderWidth: 1,
    borderRadius: 999,
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
    minWidth: 18,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 2,
    position: 'absolute',
    right: 7,
    top: 5,
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: '#020617',
    borderTopColor: 'rgba(18, 198, 223, 0.55)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 26 : 12,
    shadowColor: '#000',
    shadowOffset: { height: -8, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 14,
  },
  tabButton: {
    alignItems: 'center',
    backgroundColor: '#0b1220',
    borderColor: 'rgba(148, 163, 184, 0.26)',
    borderWidth: 1,
    borderRadius: 18,
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    minHeight: 64,
    paddingHorizontal: 2,
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: colors.cyan,
    borderColor: '#a7f3ff',
  },
  tabIconShell: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderColor: 'rgba(18, 198, 223, 0.35)',
    borderRadius: 999,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  tabIconShellActive: {
    backgroundColor: '#ecfeff',
    borderColor: colors.white,
  },
  tabLabel: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.ink,
  },
})
