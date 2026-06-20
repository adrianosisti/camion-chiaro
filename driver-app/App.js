import { useEffect, useMemo, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { AuthScreen } from './src/screens/AuthScreen'
import { ChatScreen } from './src/screens/ChatScreen'
import { CompanyChatScreen } from './src/screens/CompanyChatScreen'
import { CompanyHomeScreen } from './src/screens/CompanyHomeScreen'
import { CompanyManagementScreen } from './src/screens/CompanyManagementScreen'
import { DocumentsScreen } from './src/screens/DocumentsScreen'
import { HomeScreen } from './src/screens/HomeScreen'
import { OperationsScreen } from './src/screens/OperationsScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import {
  createCompanyAssetSignedUrl,
  createCompanyComplianceItem,
  createCompanyDriverAccount,
  createCompanyVehicle,
  createDriverDocument,
  createFaultReport,
  createVehicleCheck,
  fetchCompanyContext,
  fetchCompanyDriverChat,
  fetchDriverChat,
  fetchDriverContext,
  getCurrentSession,
  getSessionAccountType,
  markChatMessagesRead,
  sendChatMessage,
  sendCompanyChatMessage,
  signOutDriver,
  subscribeToDriverChatMessages,
  subscribeToDriverPresence,
  updateChatMessageReaction,
  uploadDriverDocumentFile,
  uploadDriverProfileImage,
} from './src/services/driverApi'
import { colors, layout } from './src/theme'

const settingsStorageKey = 'camion-chiaro-native-settings'

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

const driverTabs = [
  { id: 'home', icon: 'home-outline', label: 'Home' },
  { id: 'chat', icon: 'chatbubbles-outline', label: 'Chat' },
  { id: 'documents', icon: 'document-text-outline', label: 'Doc' },
  { id: 'operations', icon: 'checkbox-outline', label: 'Check' },
  { id: 'settings', icon: 'settings-outline', label: 'Menu' },
]

const companyTabs = [
  { id: 'home', icon: 'business-outline', label: 'Home' },
  { id: 'manage', icon: 'albums-outline', label: 'Anagraf.' },
  { id: 'chat', icon: 'chatbubbles-outline', label: 'Chat' },
  { id: 'settings', icon: 'settings-outline', label: 'Menu' },
]

function getDriverName(context) {
  return context?.drivers?.[0]?.name || 'Autista'
}

function getCompanyName(context) {
  return context?.companyProfile?.name || 'Azienda'
}

function mergeChatMessage(messages, message) {
  if (!message?.id) return messages
  const exists = messages.some((currentMessage) => currentMessage.id === message.id)
  if (exists) {
    return messages.map((currentMessage) => (currentMessage.id === message.id ? message : currentMessage))
  }

  return [...messages, message].sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt))
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

export default function App() {
  const [accountType, setAccountType] = useState('driver')
  const [activeTab, setActiveTab] = useState('home')
  const [appStatus, setAppStatus] = useState('Caricamento app...')
  const [chatSoundEnabled, setChatSoundEnabled] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [chatThread, setChatThread] = useState(null)
  const [companyChatMessages, setCompanyChatMessages] = useState([])
  const [companyChatThread, setCompanyChatThread] = useState(null)
  const [companyContext, setCompanyContext] = useState(null)
  const [companyDriverPhotoUrls, setCompanyDriverPhotoUrls] = useState({})
  const [context, setContext] = useState(null)
  const [driverChatReadWatermark, setDriverChatReadWatermark] = useState(0)
  const [driverProfileUrl, setDriverProfileUrl] = useState('')
  const [isBooting, setIsBooting] = useState(true)
  const [isCompanyOnline, setIsCompanyOnline] = useState(false)
  const [isCompanyTyping, setIsCompanyTyping] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [language, setLanguage] = useState('it')
  const [logoUrl, setLogoUrl] = useState('')
  const [managementInitialSection, setManagementInitialSection] = useState('drivers')
  const [session, setSession] = useState(null)
  const [selectedCompanyDriverId, setSelectedCompanyDriverId] = useState('')
  const [selectedDailyVehicleId, setSelectedDailyVehicleId] = useState('')
  const [settingsReady, setSettingsReady] = useState(false)
  const presenceRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const activeTabRef = useRef(activeTab)
  const driverChatReadVersionRef = useRef(0)

  const driver = context?.drivers?.[0] ?? null
  const visibleTabs = accountType === 'company' ? companyTabs : driverTabs
  const activeCompanyContext = companyContext ?? context
  const companyName = accountType === 'company'
    ? activeCompanyContext?.companyProfile?.name ?? 'Azienda'
    : getCompanyName(context)
  const driverName = getDriverName(context)
  const headerSubtitle = accountType === 'company' ? 'Area azienda' : driverName
  const selectedCompanyDriver = companyContext?.drivers?.find((currentDriver) => currentDriver.id === selectedCompanyDriverId) ?? null
  const rawUnreadDriverMessages = useMemo(
    () => chatMessages.filter((message) => message.senderRole === 'company' && !message.readByDriverAt),
    [chatMessages],
  )
  const unreadCompanyMessages = useMemo(() => {
    if (accountType !== 'driver' || activeTab === 'chat') return 0
    return countUnreadDriverMessages(chatMessages, driverChatReadWatermark)
  }, [accountType, activeTab, chatMessages, driverChatReadWatermark])
  const unreadDriverMessages = companyContext?.unreadDriverMessages ?? 0
  const chatBadgeCount = accountType === 'company'
    ? unreadDriverMessages
    : activeTab === 'chat' ? 0 : unreadCompanyMessages
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

  async function loadDriverChatData(targetDriver = driver, { markAsRead = activeTab === 'chat' } = {}) {
    if (!targetDriver?.companyId || !targetDriver?.id) return false
    const requestReadVersion = driverChatReadVersionRef.current
    const shouldMarkAsRead = markAsRead || activeTabRef.current === 'chat'

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
      if (driverChatReadVersionRef.current !== requestReadVersion || activeTabRef.current === 'chat') {
        clearDriverUnreadMessages(nextMessages)
      }
      return true
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
      await loadDriverChatData(loadedDriver, { markAsRead: activeTab === 'chat' })
    }

    setAppStatus('')
    setIsRefreshing(false)
    return true
  }

  async function loadCompanyData({ silent = false } = {}) {
    if (!silent) setAppStatus('Aggiorno dati azienda...')
    setIsRefreshing(true)

    const contextResult = await fetchCompanyContext()

    if (contextResult.error) {
      setAppStatus(contextResult.error.message)
      setIsRefreshing(false)
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
    setIsRefreshing(false)
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
    if (accountType === 'driver' && activeTab === 'chat') {
      clearDriverUnreadMessages()
    }
  }, [accountType, activeTab])

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
        await loadDriverChatData(driver, { markAsRead: activeTab === 'chat' })
      },
    })

    return () => {
      isActive = false
      unsubscribe?.()
    }
  }, [accountType, activeTab, driver?.companyId, driver?.id])

  useEffect(() => {
    const companyId = companyContext?.companyProfile?.id
    if (accountType !== 'company' || !companyId) return undefined

    let isActive = true
    const unsubscribe = subscribeToDriverChatMessages({
      companyId,
      onMessage: async (message) => {
        if (!isActive) return

        const hasOpenSelectedChat = activeTab === 'chat' && selectedCompanyDriverId && (
          !companyChatThread?.id || message.threadId === companyChatThread.id
        )

        if (hasOpenSelectedChat) {
          const currentDriver = companyContext?.drivers?.find((entry) => entry.id === selectedCompanyDriverId)
          await loadCompanyChatData(currentDriver, { markAsRead: true })
          return
        }

        if (message.senderRole === 'driver') {
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
    if (accountType !== 'driver' || activeTab !== 'chat' || !driver?.companyId || !driver?.id) return
    void loadDriverChatData(driver, { markAsRead: true })
  }, [accountType, activeTab, driver?.companyId, driver?.id])

  useEffect(() => {
    if (accountType !== 'driver' || activeTab !== 'chat' || !chatThread?.id) return

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
  }, [accountType, activeTab, chatMessages, chatThread?.id])

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
    if (accountType !== 'company' || activeTab !== 'chat' || !selectedCompanyDriver?.id) return
    void loadCompanyChatData(selectedCompanyDriver, { markAsRead: true })
  }, [accountType, activeTab, selectedCompanyDriver?.id])

  useEffect(() => {
    if (accountType !== 'driver' || !driver?.companyId || !driver?.id) return undefined

    const presence = subscribeToDriverPresence({
      actor: {
        actorId: driver.id,
        actorName: driver.name,
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
    setChatThread(null)
    setDriverChatReadWatermark(0)
    clearDriverUnreadMessages()
    setCompanyChatMessages([])
    setCompanyChatThread(null)
    setCompanyContext(null)
    setCompanyDriverPhotoUrls({})
    setContext(null)
    setDriverProfileUrl('')
    setIsCompanyOnline(false)
    setIsCompanyTyping(false)
    setLogoUrl('')
    setSelectedCompanyDriverId('')
    setSelectedDailyVehicleId('')
    setSession(null)
  }

  async function handleSelectDailyVehicle(vehicleId) {
    if (!driver?.id || !vehicleId) return false

    setSelectedDailyVehicleId(vehicleId)
    await AsyncStorage.setItem(getDailyVehicleStorageKey(driver.id), vehicleId)
    return true
  }

  function openDriverChat() {
    markDriverChatReadLocally()
    setActiveTab('chat')

    if (driver?.companyId && driver?.id) {
      void loadDriverChatData(driver, { markAsRead: true })
    }
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
    }

    return true
  }

  async function handleSelectCompanyDriver(nextDriver) {
    if (!nextDriver?.id) return
    setSelectedCompanyDriverId(nextDriver.id)
    await loadCompanyChatData(nextDriver)
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
          chatThreads: hasThread
            ? currentThreads.map((thread) => (thread.id === nextThread.id ? { ...thread, ...nextThread } : thread))
            : [nextThread, ...currentThreads],
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

  async function handleCreateDocument(payload) {
    if (!driver || !payload?.type?.trim()) return false

    const result = await createDriverDocument(payload)

    if (result.error) {
      Alert.alert('Documento non creato', result.error.message)
      return false
    }

    await loadDriverData({ silent: true })
    return true
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

  function openCompanyManagement(section = 'drivers') {
    setManagementInitialSection(section)
    setActiveTab('manage')
  }

  const activeScreen = useMemo(() => {
    if (accountType === 'company') {
      if (activeTab === 'chat') {
        return (
          <CompanyChatScreen
            companyLogoUrl={logoUrl}
            companyName={companyName}
            chatThreads={companyContext?.chatThreads ?? []}
            driverPhotoUrls={companyDriverPhotoUrls}
            drivers={companyContext?.drivers ?? []}
            isLoading={isRefreshing}
            messages={companyChatMessages}
            onBackToDrivers={() => {
              setSelectedCompanyDriverId('')
              setCompanyChatMessages([])
              setCompanyChatThread(null)
            }}
            onReactToMessage={handleReactToCompanyMessage}
            onRefresh={() => loadCompanyChatData()}
            onSelectDriver={handleSelectCompanyDriver}
            onSend={handleSendCompanyChatMessage}
            selectedDriver={selectedCompanyDriver}
            soundEnabled={chatSoundEnabled}
            unreadByDriverId={companyContext?.unreadDriverMessagesByDriverId ?? {}}
          />
        )
      }

      if (activeTab === 'settings') {
        return (
          <SettingsScreen
            accountType="company"
            chatSoundEnabled={chatSoundEnabled}
            language={language}
            onChatSoundChange={setChatSoundEnabled}
            onLanguageChange={setLanguage}
            onRefresh={() => loadCompanyData()}
            onSignOut={handleSignOut}
          />
        )
      }

      if (activeTab === 'manage') {
        return (
          <CompanyManagementScreen
            context={companyContext}
            initialSection={managementInitialSection}
            onCreateDeadline={handleCreateCompanyDeadline}
            onCreateDriver={handleCreateCompanyDriver}
            onCreateVehicle={handleCreateCompanyVehicle}
          />
        )
      }

      return (
        <CompanyHomeScreen
          context={companyContext}
          isRefreshing={isRefreshing}
          logoUrl={logoUrl}
          onOpenManagement={openCompanyManagement}
          onOpenSettings={() => setActiveTab('settings')}
          onRefresh={() => loadCompanyData()}
        />
      )
    }

    if (activeTab === 'chat') {
      return (
        <ChatScreen
          companyName={companyName}
          companyOnline={isCompanyOnline}
          companyTyping={isCompanyTyping}
          companyLogoUrl={logoUrl}
          driverProfileUrl={driverProfileUrl}
          driverName={driverName}
          messages={chatMessages}
          onReactToMessage={handleReactToMessage}
          onRefresh={() => loadDriverData({ silent: true })}
          onSend={handleSendChatMessage}
          onTyping={handleTyping}
          soundEnabled={chatSoundEnabled}
        />
      )
    }

    if (activeTab === 'documents') {
      return (
        <DocumentsScreen
          documents={context?.documents ?? []}
          onCreateDocument={handleCreateDocument}
          onUploadDocument={handleUploadDocument}
        />
      )
    }

    if (activeTab === 'operations') {
      return (
        <OperationsScreen
          checks={context?.vehicleChecks ?? []}
          faults={context?.faultReports ?? []}
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
          onChatSoundChange={setChatSoundEnabled}
          onLanguageChange={setLanguage}
          onRefresh={() => loadDriverData()}
          onResetChatBadge={resetDriverChatBadge}
          onSignOut={handleSignOut}
        />
      )
    }

    return (
      <HomeScreen
        companyName={companyName}
        context={context}
        driverProfileUrl={driverProfileUrl}
        logoUrl={logoUrl}
        driverName={driverName}
        onOpenChat={openDriverChat}
        onOpenDocuments={() => setActiveTab('documents')}
        onOpenOperations={() => setActiveTab('operations')}
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
    companyName,
    context,
    driver,
    driverName,
    driverProfileUrl,
    isCompanyOnline,
    isCompanyTyping,
    isRefreshing,
    language,
    logoUrl,
    managementInitialSection,
    selectedCompanyDriver,
    selectedCompanyDriverId,
    selectedDailyVehicleId,
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
        <AuthScreen onAuthenticated={handleAuthenticated} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.shell}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerIdentity}>
          <View style={styles.headerLogo}>
            {logoUrl ? <Image source={{ uri: logoUrl }} style={styles.headerLogoImage} /> : <Text style={styles.headerLogoText}>CC</Text>}
          </View>
          <View>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.driverName}>{headerSubtitle}</Text>
          </View>
        </View>
      </View>

      {appStatus ? <Text style={styles.statusText}>{appStatus}</Text> : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={styles.content}
      >
        {activeScreen}
      </KeyboardAvoidingView>

      <View style={styles.tabBar}>
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id
          const hasBadge = tab.id === 'chat' && chatBadgeCount > 0

          return (
            <Pressable
              accessibilityLabel={tab.label}
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
              <Text numberOfLines={1} style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              {hasBadge ? <Text style={styles.tabBadge}>{chatBadgeCount}</Text> : null}
            </Pressable>
          )
        })}
      </View>
    </SafeAreaView>
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
  shell: {
    backgroundColor: '#07111f',
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
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
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
