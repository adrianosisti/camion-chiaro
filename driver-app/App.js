import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
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
  createFaultReport,
  createVehicleCheck,
  fetchDriverChat,
  fetchDriverContext,
  getCurrentSession,
  sendChatMessage,
  signOutDriver,
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

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [appStatus, setAppStatus] = useState('Caricamento app...')
  const [chatMessages, setChatMessages] = useState([])
  const [chatThread, setChatThread] = useState(null)
  const [context, setContext] = useState(null)
  const [isBooting, setIsBooting] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [session, setSession] = useState(null)

  const driver = context?.drivers?.[0] ?? null
  const companyName = getCompanyName(context)
  const driverName = getDriverName(context)
  const unreadCompanyMessages = chatMessages.filter(
    (message) => message.senderRole === 'company' && !message.readByDriverAt,
  ).length

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
    const loadedDriver = contextResult.data?.drivers?.[0]

    if (loadedDriver?.companyId && loadedDriver?.id) {
      const chatResult = await fetchDriverChat({
        companyId: loadedDriver.companyId,
        driverId: loadedDriver.id,
      })

      if (chatResult.data) {
        setChatMessages(chatResult.data.messages)
        setChatThread(chatResult.data.thread)
      }
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
    setSession(null)
  }

  async function handleSendChatMessage(body) {
    if (!driver || !body.trim()) return false

    const result = await sendChatMessage({
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
      setChatMessages((currentMessages) => [...currentMessages, result.data.message])
    }

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
          driverName={driverName}
          messages={chatMessages}
          onRefresh={() => loadDriverData({ silent: true })}
          onSend={handleSendChatMessage}
        />
      )
    }

    if (activeTab === 'documents') {
      return <DocumentsScreen documents={context?.documents ?? []} />
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
        driverName={driverName}
        isRefreshing={isRefreshing}
        onRefresh={() => loadDriverData()}
        unreadCompanyMessages={unreadCompanyMessages}
      />
    )
  }, [activeTab, chatMessages, chatThread?.id, companyName, context, driver, driverName, isRefreshing])

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
        <View>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.driverName}>{driverName}</Text>
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
