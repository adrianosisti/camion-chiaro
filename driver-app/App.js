import { useEffect, useMemo, useRef, useState } from 'react'
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
import { AuthScreen } from './src/screens/AuthScreen'
import { ChatScreen } from './src/screens/ChatScreen'
import { DocumentsScreen } from './src/screens/DocumentsScreen'
import { HomeScreen } from './src/screens/HomeScreen'
import { OperationsScreen } from './src/screens/OperationsScreen'
import {
  createCompanyAssetSignedUrl,
  createDriverDocument,
  createFaultReport,
  createVehicleCheck,
  fetchDriverChat,
  fetchDriverContext,
  getCurrentSession,
  sendChatMessage,
  signOutDriver,
  subscribeToDriverChatMessages,
  subscribeToDriverPresence,
  uploadDriverDocumentFile,
  uploadDriverProfileImage,
} from './src/services/driverApi'
import { colors, layout } from './src/theme'

const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'chat', label: 'Chat' },
  { id: 'documents', label: 'Documenti' },
  { id: 'operations', label: 'Check' },
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

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [appStatus, setAppStatus] = useState('Caricamento app...')
  const [chatMessages, setChatMessages] = useState([])
  const [chatThread, setChatThread] = useState(null)
  const [context, setContext] = useState(null)
  const [driverProfileUrl, setDriverProfileUrl] = useState('')
  const [isBooting, setIsBooting] = useState(true)
  const [isCompanyOnline, setIsCompanyOnline] = useState(false)
  const [isCompanyTyping, setIsCompanyTyping] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [session, setSession] = useState(null)
  const presenceRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const driver = context?.drivers?.[0] ?? null
  const companyName = getCompanyName(context)
  const driverName = getDriverName(context)
  const unreadCompanyMessages = chatMessages.filter(
    (message) => message.senderRole === 'company' && !message.readByDriverAt,
  ).length

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

  async function loadDriverChatData(targetDriver = driver) {
    if (!targetDriver?.companyId || !targetDriver?.id) return false

    const chatResult = await fetchDriverChat({
      companyId: targetDriver.companyId,
      driverId: targetDriver.id,
    })

    if (chatResult.data) {
      setChatMessages(chatResult.data.messages)
      setChatThread(chatResult.data.thread)
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

    setContext(contextResult.data)
    await loadAssetUrls(contextResult.data)
    const loadedDriver = contextResult.data?.drivers?.[0]

    if (loadedDriver?.companyId && loadedDriver?.id) {
      await loadDriverChatData(loadedDriver)
    }

    setAppStatus('')
    setIsRefreshing(false)
    return true
  }

  useEffect(() => {
    let isMounted = true

    async function boot() {
      const sessionResult = await getCurrentSession()
      if (!isMounted) return

      setSession(sessionResult.data?.session ?? null)

      if (sessionResult.data?.session) {
        await loadDriverData({ silent: true })
      }

      if (isMounted) setIsBooting(false)
    }

    boot()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!driver?.companyId || !driver?.id) return undefined

    let isActive = true
    const unsubscribe = subscribeToDriverChatMessages({
      companyId: driver.companyId,
      onMessage: async () => {
        if (!isActive) return
        await loadDriverChatData(driver)
      },
    })

    return () => {
      isActive = false
      unsubscribe?.()
    }
  }, [driver?.companyId, driver?.id])

  useEffect(() => {
    if (!driver?.companyId || !driver?.id) return undefined

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
  }, [driver?.companyId, driver?.id, chatThread?.id])

  async function handleAuthenticated(nextSession) {
    setSession(nextSession)
    const loaded = await loadDriverData()
    if (!loaded) {
      Alert.alert('Accesso riuscito', 'Login ok, ma i dati autista non sono stati caricati.')
    }
  }

  async function handleSignOut() {
    await signOutDriver()
    setActiveTab('home')
    setChatMessages([])
    setChatThread(null)
    setContext(null)
    setDriverProfileUrl('')
    setIsCompanyOnline(false)
    setIsCompanyTyping(false)
    setLogoUrl('')
    setSession(null)
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

  const activeScreen = useMemo(() => {
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
          onRefresh={() => loadDriverData({ silent: true })}
          onSend={handleSendChatMessage}
          onTyping={handleTyping}
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
          onSubmitCheck={handleSubmitCheck}
          onSubmitFault={handleSubmitFault}
          vehicles={context?.vehicles ?? []}
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
        isRefreshing={isRefreshing}
        onUpdateProfilePhoto={handleUpdateProfilePhoto}
        onRefresh={() => loadDriverData()}
        unreadCompanyMessages={unreadCompanyMessages}
      />
    )
  }, [
    activeTab,
    chatMessages,
    chatThread?.id,
    companyName,
    context,
    driver,
    driverName,
    driverProfileUrl,
    isCompanyOnline,
    isCompanyTyping,
    isRefreshing,
    logoUrl,
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
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerIdentity}>
          <View style={styles.headerLogo}>
            {logoUrl ? <Image source={{ uri: logoUrl }} style={styles.headerLogoImage} /> : <Text style={styles.headerLogoText}>CC</Text>}
          </View>
          <View>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.driverName}>{driverName}</Text>
          </View>
        </View>
        <Pressable onPress={handleSignOut} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Esci</Text>
        </Pressable>
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
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const hasBadge = tab.id === 'chat' && unreadCompanyMessages > 0

          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              {hasBadge ? <Text style={styles.tabBadge}>{unreadCompanyMessages}</Text> : null}
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
  logoutButton: {
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  logoutText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  shell: {
    backgroundColor: colors.background,
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
    borderRadius: 999,
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
    minWidth: 18,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 2,
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 6,
    padding: 10,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 42,
  },
  tabButtonActive: {
    backgroundColor: colors.ink,
  },
  tabText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  tabTextActive: {
    color: colors.white,
  },
})
