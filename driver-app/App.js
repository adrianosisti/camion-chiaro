import { Component, useEffect, useMemo, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { useAudioPlayer } from 'expo-audio'
import * as Haptics from 'expo-haptics'
import * as Notifications from 'expo-notifications'
import * as Updates from 'expo-updates'
import { useShareIntent } from 'expo-share-intent'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { AnnouncementsScreen } from './src/screens/AnnouncementsScreen'
import { AuthScreen } from './src/screens/AuthScreen'
import { AssistantModal } from './src/screens/AssistantModal'
import { CompanyChatScreen } from './src/screens/CompanyChatScreen'
import { CompanyHomeScreen } from './src/screens/CompanyHomeScreen'
import { CompanyManagementScreen } from './src/screens/CompanyManagementScreen'
import { DocumentsScreen } from './src/screens/DocumentsScreen'
import { DriverChatHubScreen } from './src/screens/DriverChatHubScreen'
import { FuelMovementScreen } from './src/screens/FuelMovementScreen'
import { HomeScreen } from './src/screens/HomeScreen'
import { OperationsScreen } from './src/screens/OperationsScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { TransportNewsScreen } from './src/screens/TransportNewsScreen'
import { WorkforceHomeScreen } from './src/screens/WorkforceHomeScreen'
import {
  createCompanyAssetSignedUrl,
  createCompanyComplianceItem,
  createCompanyCostEntry,
  createCompanyDriverAccount,
  createCompanyPerson,
  createCompanyVehicle,
  createCompanyWarehouseAsset,
  createDriverDocument,
  createFuelMovement,
  createFuelSupplier,
  createFuelTank,
  createFaultReport,
  createVehicleCheck,
  createVoiceCallSession,
  acknowledgeCompanyAnnouncement,
  deleteNativePushToken,
  deleteCompanyCostEntry,
  ensureDirectTeamThread,
  fetchCompanyContext,
  fetchCompanyDriverChat,
  fetchDriverChat,
  fetchLegalAcceptanceStatus,
  fetchTeamChat,
  fetchDriverContext,
  getCurrentSession,
  getSessionAccountType,
  markChatMessagesRead,
  markTeamThreadRead,
  renewDriverDocument,
  renewCompanyComplianceItem,
  recordLegalAcceptances,
  resetCompanyAccessPassword,
  saveNativePushToken,
  sendChatMessage,
  sendCompanyChatMessage,
  sendTeamChatMessage,
  sendPushNotification,
  signOutDriver,
  subscribeToDriverChatMessages,
  subscribeToCompanyAnnouncements,
  subscribeToTeamChatMessages,
  subscribeToOperationalUpdates,
  subscribeToDriverPresence,
  subscribeToVoiceCallSessions,
  updateChatMessageReaction,
  updateTeamChatMessageReaction,
  updateCompanyComplianceItemStatus,
  updateCompanyCostEntry,
  updateCompanyDriverSettings,
  updateFaultReportStatus,
  updateVoiceCallSession,
  updateVehicleCheckStatus,
  uploadDriverDocumentFile,
  uploadDriverProfileImage,
} from './src/services/driverApi'
import { getNativePushDeviceRegistration, registerNativePushDevice } from './src/services/nativePush'
import { t } from './src/i18n/native'
import { getLegalDocument } from './src/legalDocuments'
import { colors, layout } from './src/theme'

const settingsStorageKey = 'camion-chiaro-native-settings'
const nativePushTokenStorageKey = 'vygo-native-push-token'
const voiceCallsLaunchReady = false
const incomingCallSound = require('./assets/sounds/chat-receive.wav')
const DRIVER_HOME_FALLBACK_REFRESH_MS = 45000
const DRIVER_CHAT_LIST_FALLBACK_REFRESH_MS = 20000
const DRIVER_CHAT_THREAD_FALLBACK_REFRESH_MS = 30000
const DRIVER_TEAM_CHAT_FALLBACK_REFRESH_MS = 15000
const COMPANY_CHAT_FALLBACK_REFRESH_MS = 20000
const COMPANY_HOME_FALLBACK_REFRESH_MS = 60000

const nativeLegalDocuments = {
  dpa: {
    intro: 'Nomina Vygo a responsabile del trattamento per i dati gestiti per conto dell azienda.',
    sections: [
      ['Ruoli privacy', 'L azienda cliente resta titolare dei dati. Vygo opera come fornitore tecnico per app, dashboard, notifiche, documenti, chat, report e assistenza.'],
      ['Dati trattati', 'Vygo puo trattare dati di utenti, autisti, personale, mezzi, documenti, chat, file, foto, video, audio, chiamate vocali, scadenze, guasti, check, costi e log operativi.'],
      ['Sicurezza', 'Il servizio usa autenticazione, permessi per azienda, regole database, archiviazione file, log e separazione dei dati tra aziende.'],
      ['Fine servizio', 'Alla cessazione l azienda potra richiedere esportazione o cancellazione dei dati secondo contratto e procedure operative.'],
    ],
    title: 'Nomina responsabile trattamento',
    version: 'vygo-dpa-2026-07-02',
  },
  privacy: {
    intro: 'Informativa Privacy Vygo per app, dashboard, utenti, chat, documenti, notifiche e file.',
    sections: [
      ['Quali dati trattiamo', 'Vygo tratta i dati necessari a gestire aziende logistiche, personale, mezzi, documenti, scadenze, guasti, chat, chiamate vocali, notifiche, costi, report e assistenza.'],
      ['Perche li usiamo', 'I dati servono a far funzionare il servizio, mostrare documenti e avvisi, inviare notifiche, gestire comunicazioni aziendali, creare report e garantire sicurezza.'],
      ['Chi puo vederli', 'I dati aziendali sono visibili solo agli utenti autorizzati dalla rispettiva azienda. Vygo non vende dati personali.'],
      ['Conservazione e diritti', 'I dati restano per il tempo necessario al servizio e agli obblighi amministrativi. Gli utenti possono chiedere informazioni, rettifica o cancellazione ove applicabile.'],
      ['Chat, chiamate e documenti', 'Chat, foto, audio, video e documenti sono strumenti di lavoro aziendale. Le chiamate vocali, quando attive, usano il microfono solo durante la conversazione: Vygo non registra automaticamente l audio e conserva solo metadati come partecipanti, orari, durata e stato chiamata.'],
    ],
    title: 'Informativa Privacy Vygo',
    version: 'vygo-privacy-2026-07-02',
  },
  staffTerms: {
    intro: 'Regole base per autisti, magazzino, ufficio e personale che usa l app Vygo.',
    sections: [
      ['Account personale', 'Username e password sono personali e non vanno condivisi. Se il dispositivo viene perso bisogna avvisare subito l azienda.'],
      ['Uso corretto', 'L app va usata per finalita lavorative: chat aziendale, check, guasti, documenti, notifiche, scadenze, foto, video, audio e informazioni operative.'],
      ['Allegati', 'Documenti, foto e file caricati devono essere pertinenti, leggibili e collegati al lavoro.'],
      ['Check e guasti', 'Segnalazioni di guasto, check e anomalie devono essere veritiere e complete.'],
      ['Chiamate vocali', 'Le chiamate vocali live, quando disponibili nel piano aziendale, sono strumenti di lavoro. Non vengono registrate automaticamente e possono lasciare storico tecnico di chiamata per tutela operativa.'],
    ],
    title: 'Regole uso app personale',
    version: 'vygo-staff-terms-2026-07-02',
  },
  terms: {
    intro: 'Termini e Condizioni SaaS Vygo per aziende di trasporto e logistica.',
    sections: [
      ['Oggetto del servizio', 'Vygo include dashboard aziendale, app personale, scadenze, documenti, check, guasti, chat, chiamate vocali quando tecnicamente attivate, notifiche, centro costi e report secondo il piano acquistato.'],
      ['Piani e limiti', 'Ogni piano include le funzioni principali Vygo. I limiti commerciali riguardano soprattutto mezzi, strumenti, account utenti e storage. Se un limite viene raggiunto, l azienda potra aggiornare piano o acquistare extra storage.'],
      ['Responsabilita azienda', 'L azienda e responsabile della correttezza dei dati inseriti, della gestione degli utenti e dell uso conforme alle proprie regole interne.'],
      ['Pagamenti', 'Gli abbonamenti sono gestiti dal sistema di pagamento configurato. Mancato pagamento o piano scaduto possono limitare o sospendere il servizio fino alla regolarizzazione.'],
      ['Cessazione', 'Alla fine del rapporto l azienda potra richiedere esportazione o cancellazione dei dati disponibili secondo le procedure concordate.'],
    ],
    title: 'Termini e Condizioni SaaS',
    version: 'vygo-terms-2026-07-02',
  },
}

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

function LegalAcceptanceScreen({
  accountRole = 'staff',
  companyName = 'Vygo',
  isLoading = false,
  isSaving = false,
  language = 'it',
  message = '',
  onAccept,
  onSignOut,
}) {
  const isCompany = accountRole === 'company'
  const [accepted, setAccepted] = useState({
    dpa: false,
    marketing: false,
    privacy: false,
    staffTerms: false,
    terms: false,
  })
  const [openDocumentId, setOpenDocumentId] = useState('')
  const openDocument = openDocumentId ? getLegalDocument(openDocumentId, language) ?? nativeLegalDocuments[openDocumentId] : null
  const canAccept = isCompany
    ? accepted.terms && accepted.privacy && accepted.dpa
    : accepted.staffTerms && accepted.privacy

  function toggleAccepted(field) {
    setAccepted((current) => ({ ...current, [field]: !current[field] }))
  }

  function renderLegalRow(field, text, documentId, buttonLabel = 'Leggi') {
    const isChecked = Boolean(accepted[field])

    return (
      <Pressable onPress={() => toggleAccepted(field)} style={styles.legalNativeRow}>
        <Ionicons
          color={isChecked ? colors.cyanDark : colors.muted}
          name={isChecked ? 'checkbox' : 'square-outline'}
          size={23}
        />
        <View style={styles.legalNativeRowText}>
          <Text style={styles.legalNativeCopy}>{text}</Text>
          {documentId ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation()
                setOpenDocumentId(documentId)
              }}
              style={styles.legalNativeReadButton}
            >
              <Text style={styles.legalNativeReadText}>{buttonLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    )
  }

  if (openDocument) {
    return (
      <SafeAreaView style={styles.legalNativeScreen}>
        <ExpoStatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.legalNativeContent}>
          <View style={styles.legalNativePanel}>
            <View style={styles.legalNativeHeader}>
              <View>
                <Text style={styles.legalNativeOverline}>Documento consultabile</Text>
                <Text style={styles.legalNativeTitle}>{openDocument.title}</Text>
                <Text style={styles.legalNativeVersion}>Versione {openDocument.version}</Text>
              </View>
              <Pressable onPress={() => setOpenDocumentId('')} style={styles.legalNativeIconButton}>
                <Ionicons color={colors.ink} name="close" size={22} />
              </Pressable>
            </View>
            <Text style={styles.legalNativeIntro}>{openDocument.intro}</Text>
            {openDocument.sections.map((section) => {
              const title = section.title ?? section[0]
              const body = section.body ?? section[1]

              return (
                <View key={title} style={styles.legalNativeSection}>
                  <Text style={styles.legalNativeSectionTitle}>{title}</Text>
                  <Text style={styles.legalNativeSectionBody}>{body}</Text>
                </View>
              )
            })}
            <Pressable onPress={() => setOpenDocumentId('')} style={styles.legalNativePrimaryButton}>
              <Text style={styles.legalNativePrimaryText}>Ho letto</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.legalNativeScreen}>
      <ExpoStatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.legalNativeContent}>
        <View style={styles.legalNativePanel}>
          <Image resizeMode="contain" source={vygoLogoHorizontal} style={styles.legalNativeLogo} />
          <Text style={styles.legalNativeOverline}>{isCompany ? 'Primo accesso azienda' : 'Primo accesso personale'}</Text>
          <Text style={styles.legalNativeTitle}>{companyName}</Text>
          <Text style={styles.legalNativeIntro}>
            Prima di usare Vygo leggi e accetta i documenti richiesti. Potrai consultarli di nuovo dalle impostazioni.
          </Text>

          {isLoading ? (
            <View style={styles.legalNativeLoading}>
              <ActivityIndicator color={colors.cyan} />
              <Text style={styles.legalNativeIntro}>Controllo accettazioni...</Text>
            </View>
          ) : (
            <View style={styles.legalNativeList}>
              {isCompany ? (
                <>
                  {renderLegalRow('terms', 'Accetto Termini e Condizioni SaaS Vygo per uso aziendale, abbonamenti, limiti piano e supporto.', 'terms')}
                  {renderLegalRow('privacy', 'Ho letto l Informativa Privacy Vygo per dati aziendali, utenti, chat, documenti, notifiche e file.', 'privacy')}
                  {renderLegalRow('dpa', 'Confermo la nomina Vygo a responsabile del trattamento per i dati gestiti per conto dell azienda.', 'dpa', 'Leggi nomina')}
                  {renderLegalRow('marketing', 'Voglio ricevere comunicazioni commerciali e aggiornamenti prodotto. Facoltativo.', '')}
                </>
              ) : (
                <>
                  {renderLegalRow('privacy', 'Ho letto l informativa privacy sull uso di app, profilo, documenti, notifiche e messaggi aziendali.', 'privacy')}
                  {renderLegalRow('staffTerms', 'Accetto le regole d uso di Vygo per chat, documenti, check, guasti, allegati e notifiche aziendali.', 'staffTerms')}
                </>
              )}
            </View>
          )}

          {message ? <Text style={styles.legalNativeMessage}>{message}</Text> : null}

          <Pressable
            disabled={!canAccept || isLoading || isSaving}
            onPress={() => onAccept?.(accepted.marketing)}
            style={[styles.legalNativePrimaryButton, (!canAccept || isLoading || isSaving) && styles.legalNativeDisabledButton]}
          >
            <Text style={styles.legalNativePrimaryText}>{isSaving ? 'Salvataggio...' : 'Accetta e continua'}</Text>
          </Pressable>
          <Pressable onPress={onSignOut} style={styles.legalNativeSecondaryButton}>
            <Text style={styles.legalNativeSecondaryText}>Esci</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function NativeLicenseGate({ companyName = 'Azienda', onRefresh, onSignOut, profile = {} }) {
  return (
    <SafeAreaView style={styles.legalNativeSafe}>
      <View style={styles.nativeLicenseContent}>
        <View style={styles.nativeLicenseCard}>
          <Image accessibilityIgnoresInvertColors resizeMode="contain" source={vygoLogoHorizontal} style={styles.legalNativeLogo} />
          <Text style={styles.legalNativeOverline}>Piano da attivare</Text>
          <Text style={styles.legalNativeTitle}>{companyName}</Text>
          <Text style={styles.legalNativeIntro}>
            Il piano {getNativeBillingPlanLabel(profile.billingPlan)} risulta {profile.billingStatus || 'da verificare'}.
            Completa o riattiva l abbonamento dal sito Vygo per usare dashboard, chat, documenti e report.
          </Text>
          <View style={styles.nativeLicenseActions}>
            <Pressable onPress={onRefresh} style={styles.legalNativePrimaryButton}>
              <Text style={styles.legalNativePrimaryText}>Aggiorna stato</Text>
            </Pressable>
            <Pressable onPress={onSignOut} style={styles.legalNativeSecondaryButton}>
              <Text style={styles.legalNativeSecondaryText}>Esci</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

function IncomingVoiceCallOverlay({ notice, onAnswer, onDecline, onDismiss, onEnd }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!notice) {
      setElapsedSeconds(0)
      return undefined
    }

    const startedAt = notice.phase === 'active'
      ? notice.answeredAt || notice.startedAt || new Date().toISOString()
      : notice.startedAt || new Date().toISOString()

    function updateElapsed() {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)))
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [notice?.answeredAt, notice?.id, notice?.phase, notice?.startedAt])

  if (!notice) return null

  const isIncoming = notice.phase === 'incoming'
  const isActive = notice.phase === 'active'
  const isOutgoing = notice.phase === 'outgoing'
  const actionLabel = isIncoming ? 'Chiamata in arrivo' : isOutgoing ? 'Sto chiamando' : 'Chiamata attiva'

  return (
    <View style={styles.incomingCallOverlay}>
      <View style={styles.incomingCallHalo}>
        <Ionicons color={colors.ink} name="call" size={42} />
      </View>
      <Text style={styles.incomingCallEyebrow}>{actionLabel}</Text>
      <Text numberOfLines={2} style={styles.incomingCallTitle}>{notice.title}</Text>
      {isActive ? <Text style={styles.incomingCallTimer}>{formatNativeCallDuration(elapsedSeconds)}</Text> : null}
      {notice.body ? <Text style={styles.incomingCallBody}>{notice.body}</Text> : null}
      <View style={[styles.incomingCallActions, !isIncoming && styles.incomingCallSingleAction]}>
        {isIncoming ? (
          <Pressable onPress={onDecline || onDismiss} style={[styles.incomingCallButton, styles.incomingCallButtonMuted]}>
            <Ionicons color="#e2e8f0" name="close" size={21} />
            <Text style={styles.incomingCallButtonMutedText}>Rifiuta</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={isIncoming ? onAnswer : onEnd}
          style={[styles.incomingCallButton, isIncoming ? styles.incomingCallButtonPrimary : styles.incomingCallButtonDanger]}
        >
          <Ionicons color={isIncoming ? colors.ink : '#ffffff'} name={isIncoming ? 'call' : 'close'} size={21} />
          <Text style={[styles.incomingCallButtonText, !isIncoming && styles.incomingCallButtonDangerText]}>
            {isIncoming ? 'Rispondi' : isOutgoing ? 'Annulla' : 'Termina'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
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

const nativeBillingPlanLabels = {
  business: 'Fleet 20',
  enterprise: 'Enterprise',
  fleet10: 'Fleet 10',
  fleet20: 'Fleet 20',
  fleet30: 'Fleet 30',
  fleet50: 'Fleet 50',
  pro: 'Fleet 10',
  starter: 'Start 5',
}

const nativeBillingPlanCapabilities = {
  business: { chat: true, costCenter: true, departments: true, maxAssets: 10, maxUsers: 40, maxVehicles: 20, reports: true, voiceCalls: true },
  enterprise: { chat: true, costCenter: true, departments: true, maxAssets: Infinity, maxUsers: Infinity, maxVehicles: Infinity, reports: true, voiceCalls: true },
  fleet10: { chat: true, costCenter: true, departments: true, maxAssets: 5, maxUsers: 20, maxVehicles: 10, reports: true, voiceCalls: true },
  fleet20: { chat: true, costCenter: true, departments: true, maxAssets: 10, maxUsers: 40, maxVehicles: 20, reports: true, voiceCalls: true },
  fleet30: { chat: true, costCenter: true, departments: true, maxAssets: 15, maxUsers: 60, maxVehicles: 30, reports: true, voiceCalls: true },
  fleet50: { chat: true, costCenter: true, departments: true, maxAssets: 25, maxUsers: 100, maxVehicles: 50, reports: true, voiceCalls: true },
  pro: { chat: true, costCenter: true, departments: true, maxAssets: 5, maxUsers: 20, maxVehicles: 10, reports: true, voiceCalls: true },
  starter: { chat: true, costCenter: true, departments: true, maxAssets: 3, maxUsers: 10, maxVehicles: 5, reports: true, voiceCalls: true },
}

const nativePlanFeatureLabels = {
  chat: 'chat aziendale',
  costCenter: 'centro costi',
  departments: 'reparti e gruppi',
  reports: 'report avanzati',
  voiceCalls: 'chiamate vocali live',
}

const nativePlanResourceLabels = {
  assets: 'strumenti o muletti',
  users: 'account utenti, incluso accesso azienda',
  vehicles: 'mezzi',
}

const nativePlanResourceLimitFields = {
  assets: 'maxAssets',
  users: 'maxUsers',
  vehicles: 'maxVehicles',
}

function getNativeBillingPlanLabel(plan) {
  return nativeBillingPlanLabels[plan] ?? plan ?? 'Start 5'
}

function getNativeCompanyPlanCapabilities(profile = {}) {
  const baseCapabilities = nativeBillingPlanCapabilities[profile?.billingPlan] ?? nativeBillingPlanCapabilities.starter

  return {
    ...baseCapabilities,
    chat: Boolean(baseCapabilities.chat || profile?.billingAddonChat),
    costCenter: Boolean(baseCapabilities.costCenter || profile?.billingAddonCostCenter),
    reports: Boolean(baseCapabilities.reports || profile?.billingAddonReports),
  }
}

function isNativeCompanyLicenseActive(profile = {}) {
  if (!profile?.billingStatus) return true
  if (profile.billingStatus !== 'active') return false
  if (!profile.billingCurrentPeriodEnd) return true

  const periodEnd = new Date(profile.billingCurrentPeriodEnd).getTime()
  if (Number.isNaN(periodEnd)) return true
  return periodEnd > Date.now()
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
  { id: 'home', icon: 'business-outline', label: 'Dashboard', labelKey: 'dashboard' },
  { id: 'manage', icon: 'add-circle-outline', label: 'Anagraf.' },
  { id: 'archive', icon: 'albums-outline', label: 'Archivio', labelKey: 'archive' },
  { id: 'chat', icon: 'chatbubbles-outline', label: 'Chat', labelKey: 'chat' },
]

const camionChiaroIcon = require('./assets/brand/icon.png')
const vygoLogoHorizontal = require('./assets/brand/logo-horizontal.png')

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

function normalizeIdentity(value = '') {
  return String(value).trim().toLowerCase()
}

function getContextActorPerson(context = {}, driver = null) {
  if (context?.currentPerson?.id) return context.currentPerson

  const people = context?.people ?? []
  if (!driver?.id && !driver?.name) return null

  return people.find((person) => person.linkedDriverId === driver?.id)
    ?? people.find((person) => (
      normalizeIdentity(person.username) && normalizeIdentity(person.username) === normalizeIdentity(driver?.username)
    ))
    ?? people.find((person) => (
      normalizeIdentity(person.phone) && normalizeIdentity(person.phone) === normalizeIdentity(driver?.phone)
    ))
    ?? people.find((person) => (
      normalizeIdentity(person.email) && normalizeIdentity(person.email) === normalizeIdentity(driver?.email)
    ))
    ?? people.find((person) => (
      normalizeIdentity(person.name) && normalizeIdentity(person.name) === normalizeIdentity(driver?.name)
    ))
    ?? null
}

function getCompanyName(context) {
  return context?.companyProfile?.name || 'Azienda'
}

function formatLiters(value = 0) {
  const parsedValue = Number.parseFloat(String(value ?? '').replace(/\s/g, '').replace(',', '.'))
  return `${new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 }).format(Number.isFinite(parsedValue) ? parsedValue : 0)} L`
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

function isVoiceCallChatMessage(message = {}) {
  return String(message.body ?? '').trim().startsWith('[Chiamata vocale]')
}

function getVoiceCallIdFromMessage(message = {}) {
  const match = String(message.body ?? '').match(/\[call:([0-9a-f-]{20,})\]/i)
  return match?.[1] ?? ''
}

function getVoiceCallPreviewText(message = {}) {
  return String(message.body ?? '')
    .replace('[Chiamata vocale]', '')
    .replace(/\[call:[^\]]+\]/gi, '')
    .replace('Audio live in preparazione: confermate qui in chat se potete parlare.', '')
    .trim()
}

function getNativeChatNotificationFields(body = '', fallbackType = 'chat') {
  const message = { body }
  const isVoiceCall = isVoiceCallChatMessage(message)

  return {
    body: isVoiceCall ? 'Chiamata in arrivo.' : String(body ?? '').trim(),
    callId: isVoiceCall ? getVoiceCallIdFromMessage(message) : '',
    notificationType: isVoiceCall ? 'voice_call' : fallbackType,
  }
}

function formatNativeCallDuration(totalSeconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = String(safeSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
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

function sumUnreadByThreadId(unreadByThreadId = {}) {
  return Object.values(unreadByThreadId).reduce((total, count) => total + Number(count || 0), 0)
}

function isIncomingTeamMessageForActor(message = {}, actorPersonId = '') {
  if (!message?.threadId) return false
  if (message.senderRole === 'company') return true
  if (!actorPersonId) return true
  return message.senderPersonId !== actorPersonId
}

function incrementTeamUnreadInContext(currentContext, message, actorPersonId = '') {
  if (!currentContext || !isIncomingTeamMessageForActor(message, actorPersonId)) return currentContext

  const messageAlreadyKnown = (currentContext.teamChatMessages ?? []).some((currentMessage) => currentMessage.id === message.id)
  const unreadByThreadId = { ...(currentContext.unreadTeamMessagesByThreadId ?? {}) }

  if (!messageAlreadyKnown) {
    unreadByThreadId[message.threadId] = Number(unreadByThreadId[message.threadId] ?? 0) + 1
  }

  return {
    ...currentContext,
    teamChatMessages: mergeChatMessage(currentContext.teamChatMessages ?? [], message),
    teamChatThreads: (currentContext.teamChatThreads ?? []).map((thread) => (
      thread.id === message.threadId
        ? { ...thread, lastMessageAt: message.createdAt || thread.lastMessageAt }
        : thread
    )),
    unreadTeamMessages: sumUnreadByThreadId(unreadByThreadId),
    unreadTeamMessagesByThreadId: unreadByThreadId,
  }
}

function isIncomingTeamMessageForCompany(message = {}) {
  if (!message?.threadId) return false
  return message.senderRole !== 'company' || Boolean(message.senderPersonId)
}

function updateThreadsWithLastMessage(threads = [], threadId, createdAt) {
  return threads.map((thread) => (
    thread.id === threadId
      ? { ...thread, lastMessageAt: createdAt || thread.lastMessageAt }
      : thread
  ))
}

function incrementCompanyDriverUnreadInContext(currentContext, message = {}) {
  if (!currentContext || message.senderRole !== 'driver' || !message.threadId) return currentContext

  const messageAlreadyKnown = (currentContext.chatMessages ?? []).some((currentMessage) => currentMessage.id === message.id)
  const thread = (currentContext.chatThreads ?? []).find((currentThread) => currentThread.id === message.threadId)
  const driverId = thread?.driverId
  const unreadByDriverId = { ...(currentContext.unreadDriverMessagesByDriverId ?? {}) }

  if (driverId && !messageAlreadyKnown) {
    unreadByDriverId[driverId] = Number(unreadByDriverId[driverId] ?? 0) + 1
  }

  return {
    ...currentContext,
    chatMessages: mergeChatMessage(currentContext.chatMessages ?? [], message),
    chatThreads: updateThreadsWithLastMessage(currentContext.chatThreads ?? [], message.threadId, message.createdAt),
    unreadDriverMessages: Object.values(unreadByDriverId).reduce((total, count) => total + Number(count || 0), 0),
    unreadDriverMessagesByDriverId: unreadByDriverId,
  }
}

function incrementCompanyTeamUnreadInContext(currentContext, message = {}) {
  if (!currentContext || !isIncomingTeamMessageForCompany(message)) return currentContext

  const messageAlreadyKnown = (currentContext.teamChatMessages ?? []).some((currentMessage) => currentMessage.id === message.id)
  const unreadByThreadId = { ...(currentContext.unreadTeamMessagesByThreadId ?? {}) }

  if (!messageAlreadyKnown) {
    unreadByThreadId[message.threadId] = Number(unreadByThreadId[message.threadId] ?? 0) + 1
  }

  return {
    ...currentContext,
    teamChatMessages: mergeChatMessage(currentContext.teamChatMessages ?? [], message),
    teamChatThreads: updateThreadsWithLastMessage(currentContext.teamChatThreads ?? [], message.threadId, message.createdAt),
    unreadTeamMessages: sumUnreadByThreadId(unreadByThreadId),
    unreadTeamMessagesByThreadId: unreadByThreadId,
  }
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
  const [appUpdateStatus, setAppUpdateStatus] = useState('')
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
  const [incomingVoiceCall, setIncomingVoiceCall] = useState(null)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [language, setLanguage] = useState('it')
  const [legalAcceptanceStatus, setLegalAcceptanceStatus] = useState({
    accepted: true,
    isSaving: false,
    loading: false,
    message: '',
  })
  const [logoUrl, setLogoUrl] = useState('')
  const [managementInitialSection, setManagementInitialSection] = useState('drivers')
  const [managementCostStartKey, setManagementCostStartKey] = useState(0)
  const [nativePushStatus, setNativePushStatus] = useState('')
  const [onlineDriverIds, setOnlineDriverIds] = useState([])
  const [onlinePersonIds, setOnlinePersonIds] = useState([])
  const [session, setSession] = useState(null)
  const [selectedCompanyDriverId, setSelectedCompanyDriverId] = useState('')
  const [selectedCompanyTeamThreadId, setSelectedCompanyTeamThreadId] = useState('')
  const [selectedDailyVehicleId, setSelectedDailyVehicleId] = useState('')
  const [selectedDriverTeamThreadId, setSelectedDriverTeamThreadId] = useState('')
  const [settingsReady, setSettingsReady] = useState(false)
  const [teamTypingByThreadId, setTeamTypingByThreadId] = useState({})
  const companyPresenceRef = useRef(null)
  const companyRefreshInFlightRef = useRef(false)
  const companyTypingTimeoutRef = useRef(null)
  const presenceRef = useRef(null)
  const routedShareIdRef = useRef('')
  const typingTimeoutRef = useRef(null)
  const activeTabRef = useRef(activeTab)
  const driverChatModeRef = useRef(driverChatMode)
  const driverChatReadVersionRef = useRef(0)
  const appUpdatePromptRef = useRef(false)
  const nativePushPromptRef = useRef('')
  const incomingVoiceCallMessageIdsRef = useRef(new Set())
  const incomingCallRingTimerRef = useRef(null)
  const incomingCallSoundPlayer = useAudioPlayer(incomingCallSound, { keepAudioSessionActive: true })

  const driver = context?.drivers?.[0] ?? null
  const driverCanSubmitChecks = driver?.canSubmitChecks !== false
  const currentPerson = context?.currentPerson ?? null
  const actorPerson = getContextActorPerson(context, driver)
  const actorPersonId = actorPerson?.id ?? ''
  const isWorkforcePerson = accountType === 'driver' && currentPerson && !driver
  const visibleTabs = useMemo(() => {
    if (accountType === 'company') return companyTabs
    if (isWorkforcePerson) return workforceTabs
    if (driverCanSubmitChecks) return driverTabs
    return driverTabs.map((tab) => (tab.id === 'operations' ? { ...tab, icon: 'construct-outline', label: 'Guasto', labelKey: 'fault' } : tab))
  }, [accountType, driverCanSubmitChecks, isWorkforcePerson])
  const activeCompanyContext = companyContext ?? context
  const companyName = accountType === 'company'
    ? activeCompanyContext?.companyProfile?.name ?? 'Azienda'
    : getCompanyName(context)
  const currentCompanyId = accountType === 'company'
    ? companyContext?.companyProfile?.id ?? ''
    : driver?.companyId ?? currentPerson?.companyId ?? context?.companyProfile?.id ?? ''
  const driverName = getDriverName(context)
  const headerSubtitle = accountType === 'company' ? t(language, 'accountAreaCompany') : driverName
  const selectedCompanyDriver = companyContext?.drivers?.find((currentDriver) => currentDriver.id === selectedCompanyDriverId) ?? null
  const selectedCompanyTeamThread = companyContext?.teamChatThreads?.find((thread) => thread.id === selectedCompanyTeamThreadId) ?? null
  const selectedDriverTeamThread = context?.teamChatThreads?.find((thread) => thread.id === selectedDriverTeamThreadId) ?? null
  const selectedCompanyDriverOnline = Boolean(selectedCompanyDriverId && onlineDriverIds.includes(selectedCompanyDriverId))
  const unreadCompanyMessages = useMemo(() => {
    if (accountType !== 'driver') return 0
    if (activeTab === 'chat' && driverChatMode === 'company') return 0
    return Math.max(
      Number(context?.unreadCompanyMessages ?? 0),
      countUnreadMessagesForRole(chatMessages, 'driver'),
    )
  }, [accountType, activeTab, chatMessages, context?.unreadCompanyMessages, driverChatMode])
  const unreadDriverMessages = companyContext?.unreadDriverMessages ?? 0
  const unreadTeamMessages = accountType === 'company'
    ? companyContext?.unreadTeamMessages ?? 0
    : context?.unreadTeamMessages ?? 0
  const pendingAnnouncements = accountType === 'driver'
    ? (context?.announcements ?? []).filter((announcement) => (
        announcement.requiresAck ? !announcement.acknowledgedAt : !announcement.readAt
      ))
    : []
  const pendingAnnouncementCount = pendingAnnouncements.length
  const driverTotalUnreadMessages = accountType === 'driver'
    ? unreadCompanyMessages + unreadTeamMessages
    : 0
  const chatBadgeCount = accountType === 'company'
    ? unreadDriverMessages + unreadTeamMessages
    : activeTab === 'chat' && driverChatMode !== 'list' ? 0 : driverTotalUnreadMessages
  const currentCompanyProfile = activeCompanyContext?.companyProfile ?? {}
  const currentPlanCapabilities = getNativeCompanyPlanCapabilities(currentCompanyProfile)
  const currentCompanyLicenseActive = isNativeCompanyLicenseActive(currentCompanyProfile)

  function getNativePlanResourceUsage(resource) {
    if (resource === 'assets') {
      return (companyContext?.assets ?? []).filter((asset) => !['archived', 'Archiviato'].includes(asset.status)).length
    }

    if (resource === 'users') {
      const activeDrivers = (companyContext?.drivers ?? []).filter((entry) => entry.status !== 'Archiviato' && entry.status !== 'archived').length
      const activePeople = (companyContext?.people ?? []).filter((entry) => !['archived', 'Archiviato'].includes(entry.status) && entry.department !== 'drivers').length
      return activeDrivers + activePeople + 1
    }

    if (resource === 'vehicles') {
      return (companyContext?.vehicles ?? []).filter((entry) => entry.status !== 'Archiviato' && entry.status !== 'archived').length
    }

    return 0
  }

  function canUseNativePlanResource(resource, nextAmount = 1) {
    const limit = currentPlanCapabilities[nativePlanResourceLimitFields[resource]]
    if (!Number.isFinite(limit)) return true
    return getNativePlanResourceUsage(resource) + nextAmount <= limit
  }

  function showNativePlanResourceLimit(resource) {
    const limit = currentPlanCapabilities[nativePlanResourceLimitFields[resource]]
    const usage = getNativePlanResourceUsage(resource)
    const context = resource === 'users'
      ? 'Il conteggio include azienda, autisti, ufficio e magazzino.'
      : 'Archivia elementi non piu attivi oppure aggiorna piano.'
    Alert.alert(
      'Limite piano raggiunto',
      `${getNativeBillingPlanLabel(currentCompanyProfile.billingPlan)}: limite ${nativePlanResourceLabels[resource]} raggiunto (${usage}/${Number.isFinite(limit) ? limit : 'illimitati'}). ${context} Aggiorna piano per continuare.`,
    )
    return false
  }

  function canUseNativePlanFeature(feature) {
    return Boolean(currentPlanCapabilities[feature])
  }

  function showNativePlanFeatureLimit(feature) {
    Alert.alert(
      'Funzione da verificare',
      `${nativePlanFeatureLabels[feature] ?? 'Questa funzione'} e inclusa nei piani attivi. Se risulta bloccata, controlla attivazione azienda, pagamento o configurazione piano.`,
    )
    return false
  }

  function buildNativeVoiceCallMessage(callerName = 'Vygo', targetName = 'questo contatto') {
    return `[Chiamata vocale] ${callerName} sta chiamando ${targetName}.`
  }

  function buildNativeVoiceCallMessageWithId(callerName = 'Vygo', targetName = 'questo contatto', callId = '') {
    return `${buildNativeVoiceCallMessage(callerName, targetName)}${callId ? ` [call:${callId}]` : ''}`
  }

  function stopIncomingVoiceCallSignal() {
    if (incomingCallRingTimerRef.current) {
      clearInterval(incomingCallRingTimerRef.current)
      incomingCallRingTimerRef.current = null
    }
  }

  function playIncomingVoiceCallSignal() {
    stopIncomingVoiceCallSignal()
    triggerHaptic('critical')

    function ringOnce() {
      if (chatSoundEnabled) {
        try {
          incomingCallSoundPlayer.seekTo(0)
          incomingCallSoundPlayer.play()
        } catch {
          // La chiamata deve restare visibile anche se il telefono blocca il suono.
        }
      }
      triggerHaptic('critical')
    }

    ringOnce()
    incomingCallRingTimerRef.current = setInterval(ringOnce, 1800)
  }

  useEffect(() => () => {
    stopIncomingVoiceCallSignal()
  }, [])

  function showIncomingVoiceCall(message, options = {}) {
    if (!voiceCallsLaunchReady) return
    if (!isVoiceCallChatMessage(message)) return

    const messageId = message?.id ?? `${message?.threadId ?? 'call'}:${message?.createdAt ?? Date.now()}`
    if (incomingVoiceCallMessageIdsRef.current.has(messageId)) return
    incomingVoiceCallMessageIdsRef.current.add(messageId)

    const callId = options.callId ?? getVoiceCallIdFromMessage(message)
    const nextNotice = {
      body: getVoiceCallPreviewText(message),
      callId,
      driverId: options.driverId ?? message?.driverId ?? '',
      id: messageId,
      mode: options.mode ?? 'team',
      phase: options.phase ?? 'incoming',
      startedAt: message?.createdAt ?? new Date().toISOString(),
      teamThreadId: options.teamThreadId ?? '',
      threadId: message?.threadId ?? '',
      title: options.title || 'Chiamata in arrivo',
    }

    if (incomingVoiceCall && ['incoming', 'outgoing', 'active'].includes(incomingVoiceCall.phase)) {
      const endedAt = new Date().toISOString()
      if (callId) {
        void updateVoiceCallSession(callId, {
          durationSeconds: 0,
          endedAt,
          notes: 'Occupato in altra chiamata Vygo.',
          status: 'failed',
        })
      }
      void writeNativeVoiceCallLogMessage(nextNotice, `${getNativeVoiceCallActorName()} risulta occupato in un altra chiamata.`)
      return
    }

    setIncomingVoiceCall(nextNotice)
    playIncomingVoiceCallSignal()
  }

  async function openIncomingVoiceCall() {
    const notice = incomingVoiceCall
    stopIncomingVoiceCallSignal()
    if (!notice) return

    if (accountType === 'company') {
      if (notice.mode === 'team' && notice.teamThreadId) {
        setIncomingVoiceCall(null)
        const targetThread = (companyContext?.teamChatThreads ?? []).find((thread) => thread.id === notice.teamThreadId) ?? { id: notice.teamThreadId }
        await handleSelectCompanyTeamThread(targetThread)
        return
      }

      const targetDriver = (companyContext?.drivers ?? []).find((entry) => entry.id === notice.driverId)
      if (targetDriver) {
        setIncomingVoiceCall(null)
        await handleSelectCompanyDriver(targetDriver)
        return
      }

      setIncomingVoiceCall(null)
      openNativeChatTab()
      return
    }

    if (notice.mode === 'team' && notice.teamThreadId) {
      setIncomingVoiceCall(null)
      const targetThread = (context?.teamChatThreads ?? []).find((thread) => thread.id === notice.teamThreadId) ?? { id: notice.teamThreadId }
      await handleSelectDriverTeamThread(targetThread)
      return
    }

    setIncomingVoiceCall(null)
    openDriverChat('company')
  }

  function getNativeVoiceCallActorName() {
    if (accountType === 'company') return companyName || 'Azienda'
    return driver?.name || actorPerson?.name || 'Persona'
  }

  function getNativeVoiceCallSenderRole() {
    if (accountType === 'company') return 'company'
    if (actorPerson?.department === 'warehouse') return 'warehouse'
    if (actorPerson?.department === 'office') return 'office'
    return 'driver'
  }

  async function writeNativeVoiceCallLogMessage(notice, body) {
    const companyId = currentCompanyId
    if (!companyId || !notice?.mode || !body) return

    if (notice.mode === 'team' && notice.teamThreadId) {
      await sendTeamChatMessage({
        body,
        companyId,
        senderPersonId: accountType === 'company' ? '' : actorPerson?.id ?? '',
        senderRole: getNativeVoiceCallSenderRole(),
        threadId: notice.teamThreadId,
      })
      return
    }

    if (accountType === 'company') {
      await sendCompanyChatMessage({
        body,
        companyId,
        driverId: notice.driverId,
        threadId: notice.threadId,
      })
      return
    }

    await sendChatMessage({
      body,
      companyId,
      driverId: driver?.id || notice.driverId,
      threadId: notice.threadId,
    })
  }

  async function answerIncomingVoiceCall() {
    const notice = incomingVoiceCall
    if (!notice) return

    const answeredAt = new Date().toISOString()
    stopIncomingVoiceCallSignal()
    if (notice.callId) {
      await updateVoiceCallSession(notice.callId, {
        answeredAt,
        status: 'accepted',
      })
    }
    await writeNativeVoiceCallLogMessage(notice, `Chiamata risposta da ${getNativeVoiceCallActorName()}.`)
    setIncomingVoiceCall({
      ...notice,
      answeredAt,
      body: 'Chiamata live attiva. Vygo non registra audio.',
      phase: 'active',
      title: notice.title.replace(' ti sta chiamando', ''),
    })
  }

  async function declineIncomingVoiceCall() {
    const notice = incomingVoiceCall
    if (!notice) return

    stopIncomingVoiceCallSignal()
    const endedAt = new Date().toISOString()
    if (notice.callId) {
      await updateVoiceCallSession(notice.callId, {
        durationSeconds: 0,
        endedAt,
        status: 'declined',
      })
    }
    await writeNativeVoiceCallLogMessage(notice, `Chiamata rifiutata da ${getNativeVoiceCallActorName()}.`)
    setIncomingVoiceCall(null)
  }

  async function endNativeVoiceCall() {
    const notice = incomingVoiceCall
    if (!notice) return

    stopIncomingVoiceCallSignal()
    const endedAt = new Date().toISOString()
    const startedAt = notice.answeredAt || notice.startedAt || endedAt
    const durationSeconds = Math.max(0, Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000))

    if (notice.callId) {
      await updateVoiceCallSession(notice.callId, {
        durationSeconds,
        endedAt,
        status: 'ended',
      })
    }
    await writeNativeVoiceCallLogMessage(
      notice,
      `Chiamata terminata da ${getNativeVoiceCallActorName()}. Durata ${formatNativeCallDuration(durationSeconds)}.`,
    )
    setIncomingVoiceCall(null)
  }

  async function showNativeVoiceCallNotice(callRequest = {}) {
    if (!voiceCallsLaunchReady) {
      Alert.alert('Chiamate in arrivo', 'Le chiamate vocali Vygo sono pronte nel codice ma saranno attivate in una prossima versione.')
      return false
    }

    const request = typeof callRequest === 'string' ? { targetName: callRequest } : callRequest
    const targetName = request.targetName || 'questo contatto'

    if (!canUseNativePlanFeature('voiceCalls')) {
      return showNativePlanFeatureLimit('voiceCalls')
    }

    const companyId = currentCompanyId
    if (!companyId) {
      Alert.alert('Chiamata non avviata', 'Azienda non caricata. Riapri l app e riprova.')
      return false
    }

    const isCompanyActor = accountType === 'company'
    const personSenderRole = actorPerson?.department === 'warehouse'
      ? 'warehouse'
      : actorPerson?.department === 'office'
        ? 'office'
        : 'driver'
    const callerRole = isCompanyActor ? 'company' : personSenderRole
    const callerName = isCompanyActor ? companyName : driver?.name ?? actorPerson?.name ?? 'Persona'
    const activeTeamThread = isCompanyActor ? selectedCompanyTeamThread : selectedDriverTeamThread
    const activeDirectDriver = isCompanyActor ? selectedCompanyDriver : driver
    const activeDirectThread = isCompanyActor ? companyChatThread : chatThread

    if (activeTeamThread?.id) {
      const callResult = await createVoiceCallSession({
        callerDriverId: driver?.id ?? '',
        callerPersonId: isCompanyActor ? '' : actorPerson?.id ?? '',
        callerRole,
        companyId,
        targetName,
        teamThreadId: activeTeamThread.id,
      })

      if (callResult.error) {
        Alert.alert('Chiamata non registrata', callResult.error.message)
        return false
      }

      const callId = callResult.data?.call?.id ?? ''
      const callMessage = buildNativeVoiceCallMessageWithId(callerName, targetName, callId)
      const sent = isCompanyActor
        ? await handleSendCompanyTeamChatMessage(callMessage)
        : await handleSendDriverTeamChatMessage(callMessage)

      if (sent) {
        setIncomingVoiceCall({
          body: 'In attesa di risposta. Vygo non registra audio.',
          callId,
          id: `outgoing-${callId || Date.now()}`,
          mode: 'team',
          phase: 'outgoing',
          startedAt: callResult.data?.call?.startedAt ?? new Date().toISOString(),
          teamThreadId: activeTeamThread.id,
          title: targetName,
        })
      }
      return sent
    }

    if (!activeDirectDriver?.id) {
      Alert.alert('Chiamata non avviata', 'Seleziona una chat prima di chiamare.')
      return false
    }

    const callResult = await createVoiceCallSession({
      callerDriverId: isCompanyActor ? '' : activeDirectDriver.id,
      callerRole: isCompanyActor ? 'company' : 'driver',
      companyId,
      driverId: activeDirectDriver.id,
      receiverDriverId: isCompanyActor ? activeDirectDriver.id : '',
      targetName,
      threadId: activeDirectThread?.id ?? '',
    })

    if (callResult.error) {
      Alert.alert('Chiamata non registrata', callResult.error.message)
      return false
    }

    if (isCompanyActor && callResult.data?.thread && !companyChatThread) {
      setCompanyChatThread(callResult.data.thread)
    }

    if (!isCompanyActor && callResult.data?.thread && !chatThread) {
      setChatThread(callResult.data.thread)
    }

    const callId = callResult.data?.call?.id ?? ''
    const callMessage = buildNativeVoiceCallMessageWithId(callerName, targetName, callId)
    const sent = isCompanyActor
      ? await handleSendCompanyChatMessage(callMessage)
      : await handleSendChatMessage(callMessage)

    if (sent) {
      setIncomingVoiceCall({
        body: 'In attesa di risposta. Vygo non registra audio.',
        callId,
        driverId: activeDirectDriver.id,
        id: `outgoing-${callId || Date.now()}`,
        mode: isCompanyActor ? 'driver' : 'company',
        phase: 'outgoing',
        startedAt: callResult.data?.call?.startedAt ?? new Date().toISOString(),
        threadId: callResult.data?.thread?.id ?? activeDirectThread?.id ?? '',
        title: targetName,
      })
    }
    return sent
  }

  function openNativeChatTab() {
    if (!canUseNativePlanFeature('chat')) {
      showNativePlanFeatureLimit('chat')
      return
    }

    setActiveTab('chat')
  }

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

    setContext((currentContext) => (
      currentContext ? { ...currentContext, unreadCompanyMessages: 0 } : currentContext
    ))
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

  function setTeamTypingState(payload) {
    const threadId = payload?.threadId
    if (!threadId) return

    setTeamTypingByThreadId((currentState) => {
      const nextState = { ...currentState }

      if (payload.isTyping) {
        nextState[threadId] = {
          ...payload,
          expiresAt: Date.now() + 2400,
        }
      } else {
        delete nextState[threadId]
      }

      return nextState
    })

    if (payload.isTyping) {
      setTimeout(() => {
        setTeamTypingByThreadId((currentState) => {
          if (currentState[threadId]?.sentAt !== payload.sentAt) return currentState
          const nextState = { ...currentState }
          delete nextState[threadId]
          return nextState
        })
      }, 2600)
    }
  }

  async function loadAssetUrls(nextContext) {
    const profileDriver = nextContext?.currentPerson?.linkedDriverId
      ? nextContext?.drivers?.find((entry) => entry.id === nextContext.currentPerson.linkedDriverId)
      : nextContext?.drivers?.[0]
    const companyLogoPath = nextContext?.companyProfile?.logoPath
    const driverPhotoPath = profileDriver?.profileImagePath
    const driverPhotoEntriesPromise = Promise.all(
      (nextContext?.drivers ?? []).map(async (currentDriver) => {
        if (!currentDriver.id || !currentDriver.profileImagePath) return [currentDriver.id, '']
        const result = await createCompanyAssetSignedUrl(currentDriver.profileImagePath)
        return [currentDriver.id, result.data?.signedUrl ?? '']
      }),
    )
    const [logoResult, profileResult, driverPhotoEntries] = await Promise.all([
      companyLogoPath ? createCompanyAssetSignedUrl(companyLogoPath) : Promise.resolve({ data: null }),
      driverPhotoPath ? createCompanyAssetSignedUrl(driverPhotoPath) : Promise.resolve({ data: null }),
      driverPhotoEntriesPromise,
    ])

    setLogoUrl(logoResult.data?.signedUrl ?? '')
    setDriverProfileUrl(profileResult.data?.signedUrl ?? '')
    setCompanyDriverPhotoUrls(Object.fromEntries(driverPhotoEntries))
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
      } else if (!shouldMarkAsRead) {
        setContext((currentContext) => (
          currentContext
            ? { ...currentContext, unreadCompanyMessages: countUnreadMessagesForRole(nextMessages, 'driver') }
            : currentContext
        ))
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
    if (!silent) setIsRefreshing(true)

    const contextResult = await fetchDriverContext()

    if (contextResult.error) {
      setAppStatus(contextResult.error.message)
      if (!silent) setIsRefreshing(false)
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
    if (!silent) setIsRefreshing(false)
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

  async function checkForAppUpdates({ silent = false } = {}) {
    if (!Updates.isEnabled) {
      if (!silent) setAppUpdateStatus('Aggiornamenti automatici non disponibili su questa installazione.')
      return false
    }

    if (appUpdatePromptRef.current) return false
    appUpdatePromptRef.current = true

    try {
      if (!silent) setAppUpdateStatus('Controllo aggiornamenti app...')
      const update = await Updates.checkForUpdateAsync()
      if (update.isAvailable) {
        setAppUpdateStatus('Aggiornamento trovato. Riapro Vygo...')
        await Updates.fetchUpdateAsync()
        await Updates.reloadAsync()
        return true
      }
      if (!silent) setAppUpdateStatus('Vygo e gia aggiornata.')
      return false
    } catch {
      if (!silent) setAppUpdateStatus('Aggiornamento non controllato. Riprova tra poco.')
      return false
    } finally {
      appUpdatePromptRef.current = false
    }
  }

  useEffect(() => {
    let isMounted = true

    async function boot() {
      void checkForAppUpdates({ silent: true })
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
    if (!session) {
      setLegalAcceptanceStatus({
        accepted: true,
        isSaving: false,
        loading: false,
        message: '',
      })
      return undefined
    }

    if (!currentCompanyId) return undefined

    let isActive = true
    const accountRole = accountType === 'company' ? 'company' : 'staff'

    setLegalAcceptanceStatus((currentStatus) => ({
      ...currentStatus,
      loading: true,
      message: '',
    }))

    fetchLegalAcceptanceStatus({ accountRole, companyId: currentCompanyId }).then((result) => {
      if (!isActive) return

      if (result.error) {
        setLegalAcceptanceStatus({
          accepted: true,
          isSaving: false,
          loading: false,
          message: result.error.message,
        })
        return
      }

      setLegalAcceptanceStatus({
        accepted: Boolean(result.data?.accepted),
        isSaving: false,
        loading: false,
        message: result.data?.missingTable ? 'Registro privacy non ancora installato. Esegui SQL 46 per attivarlo.' : '',
      })
    })

    return () => {
      isActive = false
    }
  }, [accountType, currentCompanyId, session])

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

    if (!canUseNativePlanFeature('chat')) {
      showNativePlanFeatureLimit('chat')
      return
    }

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
    if (accountType === 'company' && ['news', 'settings'].includes(activeTab)) return
    if (accountType === 'driver' && ['announcements', 'fuel'].includes(activeTab)) return

    if (!visibleTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab('home')
    }
  }, [accountType, activeTab, visibleTabs])

  useEffect(() => {
    if (accountType !== 'driver' || !driver?.companyId || !driver?.id) return undefined

    let isActive = true
    const unsubscribe = subscribeToDriverChatMessages({
      companyId: driver.companyId,
      onMessage: async (message) => {
        if (!isActive) return
        const shouldMarkAsRead = activeTab === 'chat' && driverChatMode === 'company'
        if (message?.senderRole !== 'driver') {
          showIncomingVoiceCall(message, {
            mode: 'company',
            title: `${companyName} ti sta chiamando`,
          })
        }
        if (!chatThread?.id || message?.threadId === chatThread.id) {
          setChatMessages((currentMessages) => mergeChatMessage(currentMessages, message))
        }
        await loadDriverChatData(driver, { markAsRead: shouldMarkAsRead })
      },
    })

    return () => {
      isActive = false
      unsubscribe?.()
    }
  }, [accountType, activeTab, chatThread?.id, driver?.companyId, driver?.id, driverChatMode])

  useEffect(() => {
    if (accountType !== 'driver' || !session) return undefined

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void loadDriverData({ silent: true })
      }
    })

    return () => {
      subscription.remove()
    }
  }, [accountType, session?.user?.id])

  useEffect(() => {
    const companyId = driver?.companyId ?? currentPerson?.companyId
    if (accountType !== 'driver' || !session || !companyId) return undefined

    let refreshTimer = null
    function scheduleAnnouncementRefresh() {
      if (refreshTimer) clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => {
        if (AppState.currentState === 'active') void loadDriverData({ silent: true })
      }, 350)
    }

    const unsubscribe = subscribeToCompanyAnnouncements({
      companyId,
      onChange: scheduleAnnouncementRefresh,
    })

    return () => {
      unsubscribe?.()
      if (refreshTimer) clearTimeout(refreshTimer)
    }
  }, [accountType, currentPerson?.companyId, driver?.companyId, session?.user?.id])

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response?.notification?.request?.content?.data ?? {}
      const notificationType = String(data.notificationType ?? '')
      const url = String(data.url ?? '')

      if (notificationType === 'announcement' || url.includes('view=announcements')) {
        if (accountType === 'driver') setActiveTab('announcements')
        return
      }

      if (['chat', 'team_chat'].includes(notificationType) || url.includes('view=chat')) {
        setActiveTab('chat')
        return
      }

      if (url.includes('view=documents')) {
        setActiveTab('documents')
      }
    })

    return () => {
      subscription.remove()
    }
  }, [accountType])

  useEffect(() => {
    if (accountType !== 'driver' || !session || activeTab === 'chat') return undefined

    const refreshInterval = setInterval(() => {
      if (AppState.currentState === 'active') void loadDriverData({ silent: true })
    }, DRIVER_HOME_FALLBACK_REFRESH_MS)

    return () => {
      clearInterval(refreshInterval)
    }
  }, [accountType, activeTab, session?.user?.id])

  useEffect(() => {
    if (accountType !== 'driver' || !session || activeTab !== 'chat') return undefined

    const refreshInterval = setInterval(() => {
      if (AppState.currentState === 'active') void loadDriverData({ silent: true })
    }, driverChatMode === 'list' ? DRIVER_CHAT_LIST_FALLBACK_REFRESH_MS : DRIVER_CHAT_THREAD_FALLBACK_REFRESH_MS)

    return () => {
      clearInterval(refreshInterval)
    }
  }, [accountType, activeTab, driverChatMode, session?.user?.id])

  useEffect(() => {
    const companyId = driver?.companyId ?? currentPerson?.companyId
    const actorId = actorPersonId || driver?.id
    if (accountType !== 'driver' || !companyId || !actorId) return undefined

    let isActive = true
    const unsubscribe = subscribeToTeamChatMessages({
      companyId,
      onMessage: async (message, payload) => {
        if (!isActive) return

        if (!message?.id) {
          if (payload?.table === 'team_chat_threads') {
            await loadDriverData({ silent: true })
          }
          return
        }

        const isOpenSelectedThread = activeTab === 'chat' && driverChatMode === 'team' && selectedDriverTeamThreadId && message?.threadId === selectedDriverTeamThreadId
        const isIncomingTeamMessage = message?.senderRole === 'company' || Boolean(message?.senderPersonId && message.senderPersonId !== actorPersonId)
        const incomingTeamCallerName = message?.senderRole === 'company' ? companyName : message?.senderName || 'Persona'

        if (isOpenSelectedThread) {
          if (isIncomingTeamMessage) {
            showIncomingVoiceCall(message, {
              mode: 'team',
              teamThreadId: message?.threadId ?? '',
              title: `${incomingTeamCallerName} ti sta chiamando`,
            })
          }

          setDriverTeamChatMessages((currentMessages) => mergeChatMessage(currentMessages, message))
          clearTeamUnreadLocally(setContext, selectedDriverTeamThreadId)
          void markTeamThreadRead(selectedDriverTeamThreadId)
          await loadDriverTeamChatData(selectedDriverTeamThread ?? { id: selectedDriverTeamThreadId })
          return
        }

        setContext((currentContext) => incrementTeamUnreadInContext(currentContext, message, actorPersonId))

        if (isIncomingTeamMessage) {
          showIncomingVoiceCall(message, {
            mode: 'team',
            teamThreadId: message?.threadId ?? '',
            title: `${incomingTeamCallerName} ti sta chiamando`,
          })
          triggerHaptic('light')
        }

        await loadDriverData({ silent: true })
      },
    })

    return () => {
      isActive = false
      unsubscribe?.()
    }
  }, [accountType, activeTab, actorPersonId, currentPerson?.companyId, driver?.companyId, driver?.id, driverChatMode, selectedDriverTeamThread?.id, selectedDriverTeamThreadId])

  useEffect(() => {
    if (!currentCompanyId) return undefined

    const unsubscribe = subscribeToVoiceCallSessions({
      companyId: currentCompanyId,
      onCall: (call) => {
        if (!call?.id) return

        setIncomingVoiceCall((currentCall) => {
          if (!currentCall?.callId || currentCall.callId !== call.id) return currentCall

          if (call.status === 'accepted') {
            stopIncomingVoiceCallSignal()
            return {
              ...currentCall,
              answeredAt: call.answeredAt || new Date().toISOString(),
              body: 'Chiamata live attiva. Vygo non registra audio.',
              phase: 'active',
            }
          }

          if (['declined', 'ended', 'failed', 'missed'].includes(call.status)) {
            stopIncomingVoiceCallSignal()
            return null
          }

          return currentCall
        })
      },
    })

    return () => {
      unsubscribe?.()
    }
  }, [currentCompanyId])

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

        const hasOpenSelectedChat = activeTab === 'chat' && selectedCompanyDriverId && (
          !companyChatThread?.id || message.threadId === companyChatThread.id
        )

        if (hasOpenSelectedChat) {
          if (message.senderRole === 'driver') {
            const currentDriver = companyContext?.drivers?.find((entry) => entry.id === message.driverId || entry.id === selectedCompanyDriverId)
            showIncomingVoiceCall(message, {
              driverId: message.driverId || selectedCompanyDriverId,
              mode: 'driver',
              title: `${currentDriver?.name || 'Autista'} ti sta chiamando`,
            })
          }
          setCompanyContext((currentContext) => (
            currentContext
              ? { ...currentContext, chatMessages: mergeChatMessage(currentContext.chatMessages ?? [], message) }
              : currentContext
          ))
          const currentDriver = companyContext?.drivers?.find((entry) => entry.id === selectedCompanyDriverId)
          await loadCompanyChatData(currentDriver, { markAsRead: true })
          return
        }

        if (message.senderRole === 'driver') {
          const currentDriver = companyContext?.drivers?.find((entry) => entry.id === message.driverId)
          showIncomingVoiceCall(message, {
            driverId: message.driverId,
            mode: 'driver',
            title: `${currentDriver?.name || 'Autista'} ti sta chiamando`,
          })
          setCompanyContext((currentContext) => incrementCompanyDriverUnreadInContext(currentContext, message))
          triggerHaptic('light')
          await loadCompanyData({ silent: true })
          return
        }

        setCompanyContext((currentContext) => (
          currentContext
            ? { ...currentContext, chatMessages: mergeChatMessage(currentContext.chatMessages ?? [], message) }
            : currentContext
        ))
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
      onMessage: async (message, payload) => {
        if (!isActive) return

        if (!message?.id) {
          if (payload?.table === 'team_chat_threads') {
            await loadCompanyData({ silent: true })
          }
          return
        }

        if (activeTab === 'chat' && selectedCompanyTeamThreadId && message?.threadId === selectedCompanyTeamThreadId) {
          if (isIncomingTeamMessageForCompany(message)) {
            showIncomingVoiceCall(message, {
              mode: 'team',
              teamThreadId: message?.threadId ?? '',
              title: `${message?.senderName || 'Persona'} ti sta chiamando`,
            })
          }

          setCompanyContext((currentContext) => (
            currentContext
              ? { ...currentContext, teamChatMessages: mergeChatMessage(currentContext.teamChatMessages ?? [], message) }
              : currentContext
          ))
          setCompanyTeamChatMessages((currentMessages) => mergeChatMessage(currentMessages, message))
          clearTeamUnreadLocally(setCompanyContext, selectedCompanyTeamThreadId)
          void markTeamThreadRead(selectedCompanyTeamThreadId)
          await loadCompanyTeamChatData(selectedCompanyTeamThread ?? { id: selectedCompanyTeamThreadId })
          return
        }

        if (isIncomingTeamMessageForCompany(message)) {
          showIncomingVoiceCall(message, {
            mode: 'team',
            teamThreadId: message?.threadId ?? '',
            title: `${message?.senderName || 'Persona'} ti sta chiamando`,
          })
          setCompanyContext((currentContext) => incrementCompanyTeamUnreadInContext(currentContext, message))
          triggerHaptic('light')
        } else {
          setCompanyContext((currentContext) => (
            currentContext
              ? { ...currentContext, teamChatMessages: mergeChatMessage(currentContext.teamChatMessages ?? [], message) }
              : currentContext
          ))
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

    const intervalMs = activeTab === 'chat' ? COMPANY_CHAT_FALLBACK_REFRESH_MS : COMPANY_HOME_FALLBACK_REFRESH_MS
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
      if (AppState.currentState === 'active') void refreshCompanySilently()
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
    if (accountType !== 'driver' || activeTab !== 'chat' || driverChatMode !== 'team' || !selectedDriverTeamThreadId) return undefined

    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        void loadDriverTeamChatData(selectedDriverTeamThread ?? { id: selectedDriverTeamThreadId })
      }
    }, DRIVER_TEAM_CHAT_FALLBACK_REFRESH_MS)

    return () => {
      clearInterval(interval)
    }
  }, [accountType, activeTab, driverChatMode, selectedDriverTeamThread?.id, selectedDriverTeamThreadId])

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
    const companyId = driver?.companyId ?? currentPerson?.companyId
    const actorId = driver?.id ?? currentPerson?.id
    if (accountType !== 'driver' || !companyId || !actorId) return undefined
    const actorPersonId = currentPerson?.id ?? ''
    const actorRole = currentPerson?.department === 'warehouse'
      ? 'warehouse'
      : currentPerson?.department === 'office'
        ? 'office'
        : 'driver'

    const presence = subscribeToDriverPresence({
      actor: {
        actorId,
        actorName: driver?.name ?? currentPerson?.name ?? '',
        actorPersonId,
        actorRole,
      },
      companyId,
      handlers: {
        onPresenceChange: (presences) => {
          setIsCompanyOnline(presences.some((presence) => presence.actorRole === 'company'))
          const nextOnlinePersonIds = presences
            .map((presence) => presence.actorPersonId)
            .filter(Boolean)
          setOnlinePersonIds([...new Set(nextOnlinePersonIds)])
        },
        onTyping: (payload) => {
          if (payload.actorRole === 'company') {
            if (chatThread?.id && payload.threadId !== chatThread.id) return

            setIsCompanyTyping(Boolean(payload.isTyping))
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
            if (payload.isTyping) {
              typingTimeoutRef.current = setTimeout(() => setIsCompanyTyping(false), 2200)
            }
            return
          }

          if (payload.threadId === selectedDriverTeamThreadId && payload.actorPersonId !== actorPersonId) {
            setTeamTypingState(payload)
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
  }, [accountType, chatThread?.id, currentPerson?.companyId, currentPerson?.department, currentPerson?.id, currentPerson?.name, driver?.companyId, driver?.id, driver?.name, selectedDriverTeamThreadId])

  useEffect(() => {
    const companyId = companyContext?.companyProfile?.id
    if (accountType !== 'company' || !companyId) {
      setOnlineDriverIds([])
      setOnlinePersonIds([])
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
          const nextOnlinePersonIds = presences
            .map((presence) => presence.actorPersonId)
            .filter(Boolean)
          setOnlinePersonIds([...new Set(nextOnlinePersonIds)])
        },
        onTyping: (payload) => {
          if (selectedCompanyTeamThreadId && payload.threadId === selectedCompanyTeamThreadId && payload.actorRole !== 'company') {
            setTeamTypingState(payload)
            return
          }

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
  }, [accountType, companyChatThread?.id, companyContext?.companyProfile?.id, companyName, selectedCompanyDriverId, selectedCompanyTeamThreadId])

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

  async function handleAcceptNativeLegal(marketingAccepted = false) {
    if (!session || !currentCompanyId) return false
    const accountRole = accountType === 'company' ? 'company' : 'staff'

    setLegalAcceptanceStatus((currentStatus) => ({
      ...currentStatus,
      isSaving: true,
      message: 'Salvataggio accettazioni...',
    }))

    const result = await recordLegalAcceptances({
      accountRole,
      companyId: currentCompanyId,
      marketingAccepted,
    })

    if (result.error) {
      setLegalAcceptanceStatus((currentStatus) => ({
        ...currentStatus,
        isSaving: false,
        message: result.error.message,
      }))
      return false
    }

    setLegalAcceptanceStatus({
      accepted: true,
      isSaving: false,
      loading: false,
      message: 'Accettazioni salvate.',
    })
    return true
  }

  async function handleAcknowledgeCompanyAnnouncement(announcement, acknowledge = true) {
    if (!announcement?.id || !currentCompanyId) return false

    const result = await acknowledgeCompanyAnnouncement({
      acknowledge,
      announcementId: announcement.id,
      companyId: currentCompanyId,
      driverId: driver?.id ?? '',
      personId: actorPersonId,
    })

    if (result.error) {
      Alert.alert('Presa visione non salvata', result.error.message)
      return false
    }

    const now = new Date().toISOString()
    setContext((currentContext) => {
      if (!currentContext) return currentContext

      return {
        ...currentContext,
        announcements: (currentContext.announcements ?? []).map((currentAnnouncement) => (
          currentAnnouncement.id === announcement.id
            ? {
                ...currentAnnouncement,
                acknowledgedAt: acknowledge ? result.data?.acknowledgedAt ?? now : currentAnnouncement.acknowledgedAt,
                isAcknowledged: acknowledge ? true : currentAnnouncement.isAcknowledged,
                isRead: true,
                readAt: result.data?.readAt ?? currentAnnouncement.readAt ?? now,
              }
            : currentAnnouncement
        )),
      }
    })

    return true
  }

  async function disableNativePushForCurrentDevice() {
    let token = ''

    try {
      token = await AsyncStorage.getItem(nativePushTokenStorageKey)

      if (!token) {
        const registration = await getNativePushDeviceRegistration()
        token = registration.data?.token ?? ''
      }

      if (token) {
        await deleteNativePushToken(token)
      }
    } catch (error) {
      console.warn('Native push logout cleanup failed', error)
    } finally {
      await AsyncStorage.removeItem(nativePushTokenStorageKey)
      setNativePushStatus('')
    }
  }

  async function handleSignOut() {
    await disableNativePushForCurrentDevice()
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
    setLegalAcceptanceStatus({
      accepted: true,
      isSaving: false,
      loading: false,
      message: '',
    })
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

    await AsyncStorage.setItem(nativePushTokenStorageKey, registration.data.token)
    setNativePushStatus('Notifiche app abilitate su questo telefono.')
    triggerHaptic('success')
    Alert.alert('Notifiche attive', 'Questo telefono ricevera le notifiche Vygo.')
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

  async function handleSubmitFuelMovement(payload) {
    const companyId = driver?.companyId ?? currentPerson?.companyId ?? context?.companyProfile?.id
    if (!companyId) {
      Alert.alert('Azienda mancante', 'Attendi il caricamento dei dati e riprova.')
      return false
    }

    const result = await createFuelMovement({
      companyId,
      movement: {
        ...payload,
        currency: getDefaultCurrency(language),
      },
    })

    if (result.error) {
      Alert.alert('Rifornimento non salvato', result.error.message)
      return false
    }

    if (result.data) {
      setContext((currentContext) => (
        currentContext
          ? { ...currentContext, fuelMovements: [result.data, ...(currentContext.fuelMovements ?? [])] }
          : currentContext
      ))
      const vehicleLabel = getVehicleDisplayName(context?.vehicles ?? [], result.data.vehicleId || payload.vehicleId)
      const actorName = driver?.name || currentPerson?.fullName || currentPerson?.name || 'Operatore'
      void notifyPhone({
        body: `${actorName} ha registrato ${formatLiters(result.data.liters || payload.liters)} su ${vehicleLabel}.`,
        notificationType: 'fuel_movement',
        tag: `fuel-movement-${result.data.id ?? Date.now()}`,
        targetRole: 'company',
        title: 'Rifornimento registrato',
        url: '/?view=management',
      })
    }

    triggerHaptic('success')
    return true
  }

  function openDriverChat(mode = 'list') {
    if (!canUseNativePlanFeature('chat')) {
      showNativePlanFeatureLimit('chat')
      return
    }

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
    if (!canUseNativePlanFeature('chat')) return showNativePlanFeatureLimit('chat')

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
      const notificationFields = getNativeChatNotificationFields(body, 'chat')
      setChatMessages((currentMessages) => mergeChatMessage(currentMessages, result.data.message))
      clearDriverUnreadMessages()
      triggerHaptic('light')
      void notifyPhone({
        body: notificationFields.body || (attachment?.uri ? 'Allegato in chat.' : 'Nuovo messaggio.'),
        callId: notificationFields.callId,
        notificationType: notificationFields.notificationType,
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
    if (!canUseNativePlanFeature('chat')) {
      showNativePlanFeatureLimit('chat')
      return
    }

    setDriverChatMode('team')
    setSelectedDriverTeamThreadId(nextThread.id)
    await loadDriverTeamChatData(nextThread)
  }

  async function handleSelectDriverPerson(nextPerson, displayTitle = '') {
    const companyId = driver?.companyId ?? currentPerson?.companyId
    if (!companyId || !nextPerson?.id) return false
    if (!canUseNativePlanFeature('chat')) return showNativePlanFeatureLimit('chat')

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
    const messageActorPerson = actorPerson
    const companyId = driver?.companyId ?? messageActorPerson?.companyId
    if (!companyId || !messageActorPerson?.id || !selectedDriverTeamThread || (!body.trim() && !attachment?.uri)) return false
    if (!canUseNativePlanFeature('chat')) return showNativePlanFeatureLimit('chat')

    const senderRole = messageActorPerson?.department === 'warehouse'
      ? 'warehouse'
      : messageActorPerson?.department === 'office'
        ? 'office'
        : 'driver'
    const actorName = driver?.name ?? messageActorPerson?.name ?? 'Persona'

    const result = await sendTeamChatMessage({
      attachment,
      body,
      companyId,
      senderPersonId: messageActorPerson.id,
      senderRole,
      threadId: selectedDriverTeamThread.id,
    })

    if (result.error) {
      Alert.alert('Messaggio non inviato', result.error.message)
      return false
    }

    if (result.data?.message) {
      const notificationFields = getNativeChatNotificationFields(body, 'team_chat')
      setDriverTeamChatMessages((currentMessages) => mergeChatMessage(currentMessages, result.data.message))
      triggerHaptic('light')
      void notifyPhone({
        body: notificationFields.body || (attachment?.uri ? 'Allegato nel gruppo.' : 'Nuovo messaggio.'),
        callId: notificationFields.callId,
        notificationType: notificationFields.notificationType,
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
    if (!canUseNativePlanFeature('chat')) {
      showNativePlanFeatureLimit('chat')
      return
    }

    setSelectedCompanyDriverId(nextDriver.id)
    setSelectedCompanyTeamThreadId('')
    setCompanyTeamChatMessages([])
    await loadCompanyChatData(nextDriver)
  }

  async function handleSelectCompanyTeamThread(nextThread) {
    if (!nextThread?.id) return
    if (!canUseNativePlanFeature('chat')) {
      showNativePlanFeatureLimit('chat')
      return
    }

    setSelectedCompanyTeamThreadId(nextThread.id)
    setSelectedCompanyDriverId('')
    setCompanyChatMessages([])
    setCompanyChatThread(null)
    await loadCompanyTeamChatData(nextThread)
  }

  async function handleSelectCompanyPerson(nextPerson) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId || !nextPerson?.id) return false
    if (!canUseNativePlanFeature('chat')) return showNativePlanFeatureLimit('chat')

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
    if (!canUseNativePlanFeature('chat')) return showNativePlanFeatureLimit('chat')

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
      const notificationFields = getNativeChatNotificationFields(body, 'chat')
      setCompanyChatMessages((currentMessages) => mergeChatMessage(currentMessages, result.data.message))
      triggerHaptic('light')
      void notifyPhone({
        body: notificationFields.body || (attachment?.uri ? 'Allegato in chat.' : 'Nuovo messaggio.'),
        callId: notificationFields.callId,
        driverId: selectedCompanyDriver.id,
        notificationType: notificationFields.notificationType,
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
    if (!canUseNativePlanFeature('chat')) return showNativePlanFeatureLimit('chat')

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
      const notificationFields = getNativeChatNotificationFields(body, 'team_chat')
      setCompanyTeamChatMessages((currentMessages) => mergeChatMessage(currentMessages, result.data.message))
      triggerHaptic('light')
      void notifyPhone({
        body: notificationFields.body || (attachment?.uri ? 'Allegato nel gruppo.' : 'Nuovo messaggio.'),
        callId: notificationFields.callId,
        notificationType: notificationFields.notificationType,
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

  async function handleReactToTeamMessage(message, actorRole, reaction) {
    if (!message?.id) return false

    const previousDriverMessages = driverTeamChatMessages
    const previousCompanyMessages = companyTeamChatMessages
    const nextReactions = { ...(message.reactions ?? {}) }
    const currentActorPersonId = actorPersonId
    const reactionKey = actorRole === 'company' ? 'company' : `person:${currentActorPersonId || message.senderPersonId || 'me'}`

    if (reaction) {
      nextReactions[reactionKey] = reaction
    } else {
      delete nextReactions[reactionKey]
    }

    const applyLocalReaction = (currentMessages) => currentMessages.map((currentMessage) => (
      currentMessage.id === message.id ? { ...currentMessage, reactions: nextReactions } : currentMessage
    ))

    setDriverTeamChatMessages(applyLocalReaction)
    setCompanyTeamChatMessages(applyLocalReaction)

    const result = await updateTeamChatMessageReaction({ ...message, reactions: message.reactions ?? {} }, actorRole, reaction)

    if (result.error) {
      setDriverTeamChatMessages(previousDriverMessages)
      setCompanyTeamChatMessages(previousCompanyMessages)
      Alert.alert('Reazione non salvata', result.error.message)
      return false
    }

    if (result.data) {
      const applySavedReaction = (currentMessages) => currentMessages.map((currentMessage) => (
        currentMessage.id === result.data.id ? result.data : currentMessage
      ))
      setDriverTeamChatMessages(applySavedReaction)
      setCompanyTeamChatMessages(applySavedReaction)
    }

    return true
  }

  function handleTyping(isTyping) {
    presenceRef.current?.sendTyping({
      isTyping,
      threadId: driverChatMode === 'team' ? selectedDriverTeamThreadId : chatThread?.id,
    })
  }

  function handleCompanyTyping(isTyping) {
    companyPresenceRef.current?.sendTyping({
      isTyping,
      threadId: selectedCompanyTeamThreadId || companyChatThread?.id,
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
        file: payload.file ?? null,
        type: payload.type,
      })
      return renewed ? { updatedExisting: true } : false
    }

    const result = await createDriverDocument(payload)

    if (result.error) {
      Alert.alert('Documento non creato', result.error.message)
      return false
    }

    if (payload.file?.uri && result.data?.id) {
      const uploadResult = await uploadDriverDocumentFile({
        companyId: driver.companyId,
        documentId: result.data.id,
        driverId: driver.id,
        file: payload.file,
      })

      if (uploadResult.error) {
        Alert.alert('Documento creato', `Documento creato, ma il file non e stato caricato: ${uploadResult.error.message}`)
      }
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

    const updatedDocument = result.data ?? {}
    setContext((currentContext) => {
      if (!currentContext) return currentContext

      return {
        ...currentContext,
        documents: (currentContext.documents ?? []).map((currentDocument) => (
          currentDocument.id === document.id
            ? {
                ...currentDocument,
                documentNumber: updatedDocument.document_number ?? payload?.documentNumber ?? currentDocument.documentNumber,
                expiresAt: updatedDocument.expires_at ?? payload?.expiresAt ?? currentDocument.expiresAt,
                filePath: updatedDocument.file_path ?? currentDocument.filePath,
                status: updatedDocument.status ?? currentDocument.status,
                type: updatedDocument.type ?? payload?.type ?? currentDocument.type,
              }
            : currentDocument
        )),
      }
    })
    setDocumentFocusId('')
    triggerHaptic('success')
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
    if (driver.canSubmitChecks === false) {
      Alert.alert('Check non autorizzato', 'La tua azienda non ha abilitato il check giornaliero per il tuo account. Se devi usarlo, contatta l azienda. I guasti restano sempre disponibili.')
      return false
    }

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
    if (!canUseNativePlanResource('users')) {
      showNativePlanResourceLimit('users')
      return null
    }

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

  async function handleUpdateCompanyDriverSettings(driverId, updates) {
    if (!driverId) return false

    const result = await updateCompanyDriverSettings({ driverId, updates })

    if (result.error) {
      Alert.alert('Autista non aggiornato', result.error.message)
      return false
    }

    await loadCompanyData({ silent: true })
    return true
  }

  async function handleCreateCompanyVehicle(payload) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId) return null
    if (!canUseNativePlanResource('vehicles')) {
      showNativePlanResourceLimit('vehicles')
      return null
    }

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
    if (!canUseNativePlanFeature('departments')) {
      showNativePlanFeatureLimit('departments')
      return null
    }
    if (!canUseNativePlanResource('users')) {
      showNativePlanResourceLimit('users')
      return null
    }

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

  async function handleResetCompanyAccessPassword({ password = '', targetId, targetType, name }) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId || !targetId || !targetType) return false

    const result = await resetCompanyAccessPassword({
      companyId,
      password,
      targetId,
      targetType,
    })

    if (result.error) {
      Alert.alert('Password non aggiornata', result.error.message)
      return false
    }

    await loadCompanyData({ silent: true })
    Alert.alert(
      'Password aggiornata',
      `Utente: ${name || result.data?.username || 'persona'}\nUsername: ${result.data?.username || ''}\nPassword: ${result.data?.password || ''}`,
    )
    return true
  }

  async function handleCreateCompanyWarehouseAsset(payload) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId) return null
    if (!canUseNativePlanFeature('departments')) {
      showNativePlanFeatureLimit('departments')
      return null
    }
    if (!canUseNativePlanResource('assets')) {
      showNativePlanResourceLimit('assets')
      return null
    }

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

  async function handleCreateCompanyCostEntry(payload, file = null) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId) return null
    if (!canUseNativePlanFeature('costCenter')) {
      showNativePlanFeatureLimit('costCenter')
      return null
    }

    const result = await createCompanyCostEntry({
      companyId,
      entry: payload,
      file,
    })

    if (result.error) {
      Alert.alert('Spesa non salvata', result.error.message)
      return null
    }

    setCompanyContext((currentContext) => {
      if (!currentContext) return currentContext

      return {
        ...currentContext,
        costEntries: [result.data, ...(currentContext.costEntries ?? [])],
      }
    })
    return result.data
  }

  async function handleCreateCompanyFuelTank(payload) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId) return null
    if (!canUseNativePlanFeature('costCenter')) {
      showNativePlanFeatureLimit('costCenter')
      return null
    }

    const result = await createFuelTank({
      companyId,
      tank: payload,
    })

    if (result.error) {
      Alert.alert('Cisterna non creata', result.error.message)
      return null
    }

    setCompanyContext((currentContext) => (
      currentContext
        ? { ...currentContext, fuelTanks: [result.data, ...(currentContext.fuelTanks ?? [])] }
        : currentContext
    ))
    return result.data
  }

  async function handleCreateCompanyFuelMovement(payload) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId) return null
    if (!canUseNativePlanFeature('costCenter')) {
      showNativePlanFeatureLimit('costCenter')
      return null
    }

    const result = await createFuelMovement({
      companyId,
      movement: payload,
    })

    if (result.error) {
      Alert.alert('Movimento gasolio non salvato', result.error.message)
      return null
    }

    setCompanyContext((currentContext) => (
      currentContext
        ? { ...currentContext, fuelMovements: [result.data, ...(currentContext.fuelMovements ?? [])] }
        : currentContext
    ))
    return result.data
  }

  async function handleCreateCompanyFuelSupplier(payload) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId) return null
    if (!canUseNativePlanFeature('costCenter')) {
      showNativePlanFeatureLimit('costCenter')
      return null
    }

    const result = await createFuelSupplier({
      companyId,
      supplier: payload,
    })

    if (result.error) {
      Alert.alert('Fornitore non salvato', result.error.message)
      return null
    }

    setCompanyContext((currentContext) => (
      currentContext
        ? { ...currentContext, fuelSuppliers: [result.data, ...(currentContext.fuelSuppliers ?? [])] }
        : currentContext
    ))
    return result.data
  }

  async function handleUpdateCompanyCostEntry(entryId, payload, file = null, previousEntry = null) {
    const companyId = companyContext?.companyProfile?.id
    if (!companyId || !entryId) return null
    if (!canUseNativePlanFeature('costCenter')) {
      showNativePlanFeatureLimit('costCenter')
      return null
    }

    const result = await updateCompanyCostEntry({
      companyId,
      entry: payload,
      entryId,
      file,
      previousFilePath: previousEntry?.filePath ?? '',
    })

    if (result.error) {
      Alert.alert('Spesa non aggiornata', result.error.message)
      return null
    }

    setCompanyContext((currentContext) => {
      if (!currentContext) return currentContext

      return {
        ...currentContext,
        costEntries: (currentContext.costEntries ?? []).map((entry) => (entry.id === entryId ? result.data : entry)),
      }
    })
    return result.data
  }

  async function handleDeleteCompanyCostEntry(entry) {
    if (!entry?.id) return false

    const result = await deleteCompanyCostEntry({ entryId: entry.id })

    if (result.error) {
      Alert.alert('Spesa non eliminata', result.error.message)
      return false
    }

    setCompanyContext((currentContext) => {
      if (!currentContext) return currentContext

      return {
        ...currentContext,
        costEntries: (currentContext.costEntries ?? []).filter((currentEntry) => currentEntry.id !== entry.id),
      }
    })
    return true
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

    if (result.data) {
      setCompanyContext((currentContext) => {
        if (!currentContext) return currentContext

        return {
          ...currentContext,
          complianceItems: (currentContext.complianceItems ?? []).map((currentItem) => (
            currentItem.id === item.id ? { ...currentItem, ...result.data } : currentItem
          )),
        }
      })
    }

    triggerHaptic('success')
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

    const body = `Sollecito Vygo: aggiorna ${item.type || 'documento'} entro la scadenza ${formatReminderDate(item.dueDate)} direttamente dall'app. Se hai gia provveduto, carica il nuovo documento o avvisa l'azienda.`

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
        Object.prototype.hasOwnProperty.call(repair, 'repairNotes') ||
        Boolean(repair.repairCleared)
        ? {
            repairCostCents: Number(repair.repairCostCents ?? 0),
            repairCostCurrency: repair.repairCostCurrency || getDefaultCurrency(language),
            repairNotes: repair.repairNotes ?? '',
            repairRecordedAt: repair.repairCleared ? '' : new Date().toISOString(),
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
        Object.prototype.hasOwnProperty.call(repair, 'repairNotes') ||
        Boolean(repair.repairCleared)
        ? {
            repairCostCents: Number(repair.repairCostCents ?? 0),
            repairCostCurrency: repair.repairCostCurrency || getDefaultCurrency(language),
            repairNotes: repair.repairNotes ?? '',
            repairRecordedAt: repair.repairCleared ? '' : new Date().toISOString(),
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

  function openCompanyManagement(section = 'drivers', options = {}) {
    if (section === 'news') {
      setActiveTab('news')
      return
    }

    if (section === 'costs' && !canUseNativePlanFeature('costCenter')) {
      showNativePlanFeatureLimit('costCenter')
      return
    }

    if (section === 'reports' && !canUseNativePlanFeature('reports')) {
      showNativePlanFeatureLimit('reports')
      return
    }

    if (['people', 'warehouse'].includes(section) && !canUseNativePlanFeature('departments')) {
      showNativePlanFeatureLimit('departments')
      return
    }

    setManagementInitialSection(section)
    if (section === 'costs' && options?.addCost) {
      setManagementCostStartKey(Date.now())
    }
    setActiveTab('archive')
  }

  function handleCompanyMenuNavigate(target = 'dashboard') {
    if (target === 'dashboard') {
      setActiveTab('home')
      return
    }

    if (target === 'news') {
      setActiveTab('news')
      return
    }

    if (target === 'operations') {
      openCompanyManagement('faults')
      return
    }

    if (target === 'deadlines') {
      openCompanyManagement('deadlines')
      return
    }

    if (target === 'costs' || target === 'reports') {
      openCompanyManagement('costs')
      return
    }

    if (target === 'records') {
      setManagementInitialSection('drivers')
      setActiveTab('manage')
      return
    }

    if (target === 'archive') {
      setManagementInitialSection('faults')
      setActiveTab('archive')
      return
    }

    if (target === 'chat') {
      openNativeChatTab()
    }
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
            onStartVoiceCall={voiceCallsLaunchReady ? showNativeVoiceCallNotice : undefined}
            onReactToTeamMessage={handleReactToTeamMessage}
            onTyping={handleCompanyTyping}
            onlinePersonIds={onlinePersonIds}
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
            teamTypingByThreadId={teamTypingByThreadId}
            unreadByDriverId={companyContext?.unreadDriverMessagesByDriverId ?? {}}
            unreadTeamByThreadId={companyContext?.unreadTeamMessagesByThreadId ?? {}}
          />
        )
      }

      if (activeTab === 'settings') {
        return (
          <SettingsScreen
            accountType="company"
            appUpdateStatus={appUpdateStatus}
            chatSoundEnabled={chatSoundEnabled}
            language={language}
            nativePushStatus={nativePushStatus}
            onChatSoundChange={setChatSoundEnabled}
            onCheckAppUpdate={() => checkForAppUpdates()}
            onEnableNativeNotifications={handleEnableNativeNotifications}
            onOpenAssistant={() => setIsAssistantOpen(true)}
            onNavigateCompanyMenu={handleCompanyMenuNavigate}
            onLanguageChange={setLanguage}
            onRefresh={() => loadCompanyData()}
            onSignOut={handleSignOut}
          />
        )
      }

      if (activeTab === 'news') {
        return (
          <TransportNewsScreen
            language={language}
            onBack={() => setActiveTab('settings')}
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
            startCostEntryKey={managementCostStartKey}
            onCreateDeadline={handleCreateCompanyDeadline}
            onCreateCostEntry={handleCreateCompanyCostEntry}
            onCreateDriver={handleCreateCompanyDriver}
            onCreateFuelMovement={handleCreateCompanyFuelMovement}
            onCreateFuelSupplier={handleCreateCompanyFuelSupplier}
            onCreateFuelTank={handleCreateCompanyFuelTank}
            onCreatePerson={handleCreateCompanyPerson}
            onCreateVehicle={handleCreateCompanyVehicle}
            onCreateWarehouseAsset={handleCreateCompanyWarehouseAsset}
            onCloseDeadline={handleCloseCompanyDeadline}
            onDeleteCostEntry={handleDeleteCompanyCostEntry}
            onRenewDeadline={handleRenewCompanyDeadline}
            onResetAccessPassword={handleResetCompanyAccessPassword}
            onSendDeadlineReminder={handleSendCompanyDeadlineReminder}
            onUpdateDriver={handleUpdateCompanyDriverSettings}
            onUpdateCostEntry={handleUpdateCompanyCostEntry}
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
          onOpenChat={openNativeChatTab}
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
          currentPerson={actorPerson}
          driverProfileUrl={driverProfileUrl}
          driverPhotoUrls={companyDriverPhotoUrls}
          driverName={driverName}
          drivers={context?.drivers ?? []}
          messages={chatMessages}
          incomingShare={incomingChatShare}
          onBackToList={closeDriverChatDetail}
          onIncomingShareConsumed={handleIncomingShareConsumed}
          onOpenCompanyChat={handleOpenWorkforceCompanyChat}
          onOpenPersonChat={handleSelectDriverPerson}
          onOpenTeamChat={handleSelectDriverTeamThread}
          onReactToMessage={handleReactToMessage}
          onReactToTeamMessage={handleReactToTeamMessage}
          onRefreshCompanyChat={() => loadDriverChatData(driver, { markAsRead: true })}
          onRefreshTeamChat={() => loadDriverTeamChatData()}
          onSendCompanyMessage={handleSendChatMessage}
          onSendTeamMessage={handleSendDriverTeamChatMessage}
          onStartVoiceCall={voiceCallsLaunchReady ? showNativeVoiceCallNotice : undefined}
          onTyping={handleTyping}
          onlinePersonIds={onlinePersonIds}
          selectedMode={driverChatMode}
          selectedTeamThread={selectedDriverTeamThread}
          soundEnabled={chatSoundEnabled}
          people={context?.people ?? []}
          teamMessages={driverTeamChatMessages}
          teamThreads={context?.teamChatThreads ?? []}
          teamTypingByThreadId={teamTypingByThreadId}
          unreadCompanyMessages={unreadCompanyMessages}
          unreadTeamByThreadId={context?.unreadTeamMessagesByThreadId ?? {}}
        />
      )
    }

    if (activeTab === 'announcements') {
      return (
        <AnnouncementsScreen
          announcements={context?.announcements ?? []}
          onAcknowledge={handleAcknowledgeCompanyAnnouncement}
          onRefresh={() => loadDriverData({ silent: true })}
        />
      )
    }

    if (activeTab === 'fuel') {
      return (
        <FuelMovementScreen
          context={context}
          currentPerson={currentPerson}
          driver={driver}
          onBackHome={() => setActiveTab('home')}
          onSubmit={handleSubmitFuelMovement}
          selectedVehicleId={selectedDailyVehicleId}
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
          canSubmitChecks={driverCanSubmitChecks}
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
          appUpdateStatus={appUpdateStatus}
          chatSoundEnabled={chatSoundEnabled}
          language={language}
          nativePushStatus={nativePushStatus}
          onChatSoundChange={setChatSoundEnabled}
          onCheckAppUpdate={() => checkForAppUpdates()}
          onEnableNativeNotifications={handleEnableNativeNotifications}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onLanguageChange={setLanguage}
          onRefresh={() => loadDriverData()}
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
          onOpenAnnouncements={() => setActiveTab('announcements')}
          onOpenChat={() => openDriverChat('list')}
          onOpenFuel={() => setActiveTab('fuel')}
          onOpenSettings={() => setActiveTab('settings')}
          pendingAnnouncementCount={pendingAnnouncementCount}
          unreadChatMessages={driverTotalUnreadMessages}
        />
      )
    }

    return (
      <HomeScreen
        canSubmitChecks={driverCanSubmitChecks}
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
        onOpenAnnouncements={() => setActiveTab('announcements')}
        onOpenOperations={() => setActiveTab('operations')}
        onOpenFuel={() => setActiveTab('fuel')}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenSettings={() => setActiveTab('settings')}
        onSelectDailyVehicle={handleSelectDailyVehicle}
        onUpdateProfilePhoto={handleUpdateProfilePhoto}
        selectedDailyVehicleId={selectedDailyVehicleId}
        unreadChatMessages={driverTotalUnreadMessages}
        unreadCompanyMessages={unreadCompanyMessages}
        pendingAnnouncementCount={pendingAnnouncementCount}
      />
    )
  }, [
    accountType,
    activeTab,
    chatSoundEnabled,
    chatMessages,
    chatThread?.id,
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
    driverTotalUnreadMessages,
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
    onlinePersonIds,
    selectedCompanyDriver,
    selectedCompanyDriverId,
    selectedCompanyDriverOnline,
    selectedCompanyTeamThread,
    selectedDailyVehicleId,
    selectedDriverTeamThread,
    teamTypingByThreadId,
    unreadCompanyMessages,
  ])

  if (isBooting) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ExpoStatusBar style="light" />
        <ActivityIndicator color={colors.cyan} size="large" />
        <Text style={styles.loadingTitle}>Vygo</Text>
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

  if (currentCompanyId && (!legalAcceptanceStatus.accepted || legalAcceptanceStatus.loading)) {
    return (
      <LegalAcceptanceScreen
        accountRole={accountType === 'company' ? 'company' : 'staff'}
        companyName={companyName}
        isLoading={legalAcceptanceStatus.loading}
        isSaving={legalAcceptanceStatus.isSaving}
        language={language}
        message={legalAcceptanceStatus.message}
        onAccept={handleAcceptNativeLegal}
        onSignOut={handleSignOut}
      />
    )
  }

  if (accountType === 'company' && companyContext?.companyProfile?.id && !currentCompanyLicenseActive) {
    return (
      <NativeLicenseGate
        companyName={companyName}
        onRefresh={() => loadCompanyData()}
        onSignOut={handleSignOut}
        profile={companyContext.companyProfile}
      />
    )
  }

  const screenResetKey = [
    accountType,
    activeTab,
    activeTab === 'chat' ? driverChatMode : '',
    activeTab === 'manage' || activeTab === 'archive' ? managementInitialSection : '',
    selectedCompanyDriverId,
    selectedCompanyTeamThreadId,
    selectedDriverTeamThreadId,
  ].join(':')

  return (
    <View style={styles.shell}>
      <ExpoStatusBar backgroundColor={colors.night} style="light" translucent={false} />
      <StatusBar backgroundColor={colors.night} barStyle="light-content" translucent={false} />
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
        <View style={styles.headerActions}>
          {accountType !== 'company' ? (
            <View style={styles.headerBrandPill}>
              <Image
                accessibilityIgnoresInvertColors
                resizeMode="contain"
                source={vygoLogoHorizontal}
                style={styles.headerBrandLogo}
              />
            </View>
          ) : null}
          {accountType === 'company' ? (
            <Pressable
              accessibilityLabel="Apri menu aziendale"
              onPress={() => setActiveTab((currentTab) => (currentTab === 'settings' ? 'home' : 'settings'))}
              style={[styles.headerMenuButton, activeTab === 'settings' && styles.headerMenuButtonActive]}
            >
              <Ionicons color={activeTab === 'settings' ? colors.ink : colors.white} name="menu" size={19} />
              <Text style={[styles.headerMenuText, activeTab === 'settings' && styles.headerMenuTextActive]}>Menu</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {appStatus ? <Text style={styles.statusText}>{appStatus}</Text> : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={styles.content}
      >
        <ScreenErrorBoundary
          key={screenResetKey}
          resetKey={screenResetKey}
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
	                if (tab.id === 'chat' && accountType === 'company') {
	                  openNativeChatTab()
	                  return
	                }

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
      <IncomingVoiceCallOverlay
        notice={incomingVoiceCall}
        onAnswer={answerIncomingVoiceCall}
        onDecline={declineIncomingVoiceCall}
        onDismiss={() => setIncomingVoiceCall(null)}
        onEnd={endNativeVoiceCall}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  incomingCallActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 26,
    width: '100%',
  },
  incomingCallBody: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    marginTop: 12,
    maxWidth: 330,
    textAlign: 'center',
  },
  incomingCallButton: {
    alignItems: 'center',
    borderRadius: 24,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 14,
  },
  incomingCallButtonMuted: {
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderColor: 'rgba(148, 163, 184, 0.28)',
    borderWidth: 1,
  },
  incomingCallButtonMutedText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '900',
  },
  incomingCallButtonPrimary: {
    backgroundColor: colors.cyan,
  },
  incomingCallButtonDanger: {
    backgroundColor: '#dc2626',
  },
  incomingCallButtonDangerText: {
    color: '#ffffff',
  },
  incomingCallButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  incomingCallChatLink: {
    marginTop: 18,
    padding: 8,
  },
  incomingCallChatLinkText: {
    color: '#93c5fd',
    fontSize: 13,
    fontWeight: '900',
  },
  incomingCallEyebrow: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  incomingCallHalo: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 44,
    height: 88,
    justifyContent: 'center',
    shadowColor: colors.cyan,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    width: 88,
  },
  incomingCallOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.96)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 26,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 80,
  },
  incomingCallSingleAction: {
    maxWidth: 250,
  },
  incomingCallTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 36,
    marginTop: 8,
    maxWidth: 340,
    textAlign: 'center',
  },
  incomingCallTimer: {
    color: colors.cyan,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 14,
  },
  authShell: {
    backgroundColor: colors.background,
    flex: 1,
  },
  legalNativeContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: layout.screenPadding,
    paddingBottom: 30,
  },
  legalNativeCopy: {
    color: colors.ink,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 19,
  },
  legalNativeDisabledButton: {
    opacity: 0.48,
  },
  legalNativeHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  legalNativeIconButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  legalNativeIntro: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  legalNativeList: {
    gap: 10,
    marginTop: 8,
  },
  legalNativeLoading: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  legalNativeLogo: {
    alignSelf: 'center',
    height: 64,
    width: 230,
  },
  legalNativeMessage: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  legalNativeOverline: {
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  legalNativePanel: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    padding: 18,
    shadowColor: colors.night,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  legalNativePrimaryButton: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 4,
    paddingHorizontal: 16,
  },
  legalNativePrimaryText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  legalNativeReadButton: {
    alignSelf: 'center',
    backgroundColor: '#ecfeff',
    borderColor: '#67e8f9',
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 8,
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  legalNativeReadText: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
  },
  legalNativeRow: {
    alignItems: 'flex-start',
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  legalNativeRowText: {
    flex: 1,
    minWidth: 0,
  },
  legalNativeSafe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  legalNativeScreen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  legalNativeSecondaryButton: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  legalNativeSecondaryText: {
    color: colors.cyanDark,
    fontSize: 13,
    fontWeight: '900',
  },
  legalNativeSection: {
    backgroundColor: '#f8fbff',
    borderRadius: 14,
    gap: 5,
    padding: 12,
  },
  legalNativeSectionBody: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  legalNativeSectionTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  legalNativeTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  legalNativeVersion: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  nativeLicenseActions: {
    gap: 10,
    marginTop: 4,
  },
  nativeLicenseCard: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 20,
    shadowColor: colors.night,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  nativeLicenseContent: {
    flex: 1,
    justifyContent: 'center',
    padding: layout.screenPadding,
  },
  companyName: {
    color: colors.ink,
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '900',
  },
  content: {
    backgroundColor: colors.cyan,
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
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  headerBrandLogo: {
    height: 26,
    width: 98,
  },
  headerBrandPill: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: 'rgba(18, 198, 223, 0.28)',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    shadowColor: colors.night,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    width: 108,
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
  headerMenuButton: {
    alignItems: 'center',
    backgroundColor: colors.night,
    borderColor: 'rgba(18, 198, 223, 0.55)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 38,
    paddingHorizontal: 9,
  },
  headerMenuButtonActive: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
  },
  headerMenuText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  headerMenuTextActive: {
    color: colors.ink,
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
    backgroundColor: colors.night,
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
    backgroundColor: colors.night,
    borderTopColor: 'rgba(18, 198, 223, 0.55)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 26 : 12,
    shadowColor: colors.night,
    shadowOffset: { height: -8, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 14,
  },
  tabButton: {
    alignItems: 'center',
    backgroundColor: colors.nightSoft,
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
