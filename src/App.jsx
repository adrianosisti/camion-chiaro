import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left.mjs'
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle.mjs'
import Bell from 'lucide-react/dist/esm/icons/bell.mjs'
import BadgeCheck from 'lucide-react/dist/esm/icons/badge-check.mjs'
import BookOpen from 'lucide-react/dist/esm/icons/book-open.mjs'
import Building2 from 'lucide-react/dist/esm/icons/building-2.mjs'
import CalendarClock from 'lucide-react/dist/esm/icons/calendar-clock.mjs'
import Camera from 'lucide-react/dist/esm/icons/camera.mjs'
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2.mjs'
import Check from 'lucide-react/dist/esm/icons/check.mjs'
import CheckCheck from 'lucide-react/dist/esm/icons/check-check.mjs'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right.mjs'
import ClipboardCheck from 'lucide-react/dist/esm/icons/clipboard-check.mjs'
import Copy from 'lucide-react/dist/esm/icons/copy.mjs'
import Clock3 from 'lucide-react/dist/esm/icons/clock-3.mjs'
import Download from 'lucide-react/dist/esm/icons/download.mjs'
import ExternalLink from 'lucide-react/dist/esm/icons/external-link.mjs'
import FileText from 'lucide-react/dist/esm/icons/file-text.mjs'
import Filter from 'lucide-react/dist/esm/icons/filter.mjs'
import Gauge from 'lucide-react/dist/esm/icons/gauge.mjs'
import Globe2 from 'lucide-react/dist/esm/icons/globe-2.mjs'
import ImageIcon from 'lucide-react/dist/esm/icons/image.mjs'
import KeyRound from 'lucide-react/dist/esm/icons/key-round.mjs'
import LockKeyhole from 'lucide-react/dist/esm/icons/lock-keyhole.mjs'
import LogOut from 'lucide-react/dist/esm/icons/log-out.mjs'
import Mail from 'lucide-react/dist/esm/icons/mail.mjs'
import Mic from 'lucide-react/dist/esm/icons/mic.mjs'
import Paperclip from 'lucide-react/dist/esm/icons/paperclip.mjs'
import Pencil from 'lucide-react/dist/esm/icons/pencil.mjs'
import Plus from 'lucide-react/dist/esm/icons/plus.mjs'
import RadioTower from 'lucide-react/dist/esm/icons/radio-tower.mjs'
import Reply from 'lucide-react/dist/esm/icons/reply.mjs'
import Save from 'lucide-react/dist/esm/icons/save.mjs'
import Search from 'lucide-react/dist/esm/icons/search.mjs'
import Send from 'lucide-react/dist/esm/icons/send.mjs'
import SettingsIcon from 'lucide-react/dist/esm/icons/settings.mjs'
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.mjs'
import SmilePlus from 'lucide-react/dist/esm/icons/smile-plus.mjs'
import Smartphone from 'lucide-react/dist/esm/icons/smartphone.mjs'
import Stethoscope from 'lucide-react/dist/esm/icons/stethoscope.mjs'
import Square from 'lucide-react/dist/esm/icons/square.mjs'
import Truck from 'lucide-react/dist/esm/icons/truck.mjs'
import Upload from 'lucide-react/dist/esm/icons/upload.mjs'
import UserPlus from 'lucide-react/dist/esm/icons/user-plus.mjs'
import UserRound from 'lucide-react/dist/esm/icons/user-round.mjs'
import Users from 'lucide-react/dist/esm/icons/users.mjs'
import Volume2 from 'lucide-react/dist/esm/icons/volume-2.mjs'
import VolumeX from 'lucide-react/dist/esm/icons/volume-x.mjs'
import Wrench from 'lucide-react/dist/esm/icons/wrench.mjs'
import X from 'lucide-react/dist/esm/icons/x.mjs'
import { company, complianceItems, driverDocuments, drivers, vehicles } from './data/sampleData'
import { daysUntil, decorateComplianceWithWorkforce, formatDate, getSummary } from './lib/expiry'
import {
  archiveDriverRecord as archiveSupabaseDriver,
  archiveVehicleRecord as archiveSupabaseVehicle,
  clearDriverProfileImageFile as clearSupabaseDriverProfileImageFile,
  createCompanyAssetSignedUrl,
  createBillingCheckoutSession,
  createBillingPortalSession,
  createCompanyInvoiceSignedUrl,
  fetchCompanyAssets,
  createChatMessageRecord as createSupabaseChatMessage,
  createChatThreadRecord as createSupabaseChatThread,
  createDriverDocumentSignedUrl,
  createDriverAccount as createSupabaseDriverAccount,
  createFaultReportRecord as createSupabaseFaultReport,
  createDriverRecord as createSupabaseDriver,
  createDriverDocumentRecord as createSupabaseDriverDocument,
  createOwnDriverDocumentRecord as createSupabaseOwnDriverDocument,
  createVehicleRecord as createSupabaseVehicle,
  createVehicleCheckRecord as createSupabaseVehicleCheck,
  deleteDriverDocumentRecord as deleteSupabaseDriverDocument,
  fetchDriverDocumentEvents,
  ensureCompanyForCurrentUser,
  fetchChatMessages,
  fetchChatThreads,
  fetchComplianceItems,
  fetchCompanyInvoices,
  fetchCompanyPeople,
  fetchCompanyStorageSummary,
  fetchDriverDocuments,
  fetchDriverSessionData,
  fetchDrivers,
  fetchFaultReports,
  fetchVehicleChecks,
  fetchVehicles,
  getCurrentAuthSession,
  isSupabaseConfigured,
  logDriverDocumentEvent as logSupabaseDriverDocumentEvent,
  markCompanyAssetStorageFileDeleted,
  markDriverDocumentStorageFileDeleted,
  savePushSubscription,
  sendPushNotification,
  markChatMessagesRead as markSupabaseChatMessagesRead,
  signInDriver,
  signInCompany,
  signOut,
  signUpCompany,
  subscribeToChatMessages,
  subscribeToChatPresence,
  subscribeToOperationalUpdates,
  uploadCompanyLogoFile as uploadSupabaseCompanyLogoFile,
  uploadDriverDocumentFile as uploadSupabaseDriverDocumentFile,
  uploadDriverProfileImageFile as uploadSupabaseDriverProfileImageFile,
  updateDriverDocumentRecord as updateSupabaseDriverDocument,
  updateDriverRecord as updateSupabaseDriver,
  updateChatMessageReaction as updateSupabaseChatMessageReaction,
  updateCompanyProfile as updateSupabaseCompanyProfile,
  updateFaultReportStatus as updateSupabaseFaultReportStatus,
  updateVehicleRecord as updateSupabaseVehicle,
} from './lib/supabase'
import {
  getDeviceInstallHint,
  getExistingPushSubscription,
  getPushSupportStatus,
  isAppleMobileDevice,
  isStandaloneApp,
  subscribeCurrentBrowserToPush,
} from './lib/pwa'
import './App.css'

const filters = [
  { id: 'all', label: 'Tutte' },
  { id: 'urgent', label: 'Critiche' },
  { id: 'month', label: '30 giorni' },
  { id: 'driver', label: 'Autisti' },
  { id: 'vehicle', label: 'Mezzi' },
  { id: 'medical', label: 'Mediche' },
]

const documentTypes = [
  'Patente C',
  'Patente C+E',
  'CQC',
  'Carta tachigrafica',
  'Visita medica',
  'Revisione mezzo',
  'Assicurazione RCA',
  'Bollo',
  'Formazione ADR',
]

const driverDocumentStatusOptions = ['Caricato', 'Verificato', 'Scaduto', 'Mancante']
const maxDriverDocumentFileSize = 10 * 1024 * 1024
const maxOperationalImageFileSize = 8 * 1024 * 1024
const maxProfileImageFileSize = 5 * 1024 * 1024
const maxChatImageFileSize = 8 * 1024 * 1024
const maxChatAudioFileSize = 16 * 1024 * 1024
const maxChatVideoFileSize = 64 * 1024 * 1024
const imageCompressionMaxSide = 1600
const imageCompressionQuality = 0.76
const storagePlanLimitsBytes = {
  business: 50 * 1024 * 1024 * 1024,
  enterprise: 200 * 1024 * 1024 * 1024,
  pro: 10 * 1024 * 1024 * 1024,
  starter: 2 * 1024 * 1024 * 1024,
}
const emptyCompanyStorageSummary = {
  chatBytes: 0,
  documentBytes: 0,
  faultBytes: 0,
  fileCount: 0,
  profileBytes: 0,
  totalBytes: 0,
}

const driverAuthDomain = import.meta.env.VITE_DRIVER_AUTH_DOMAIN ?? 'drivers.camionchiaro.app'
const demoCompanyName = 'Spedifast SRL'
const placeholderCompanyNames = new Set(['Camion Chiaro', 'Camion Chiaro Demo'])
const fleetTypeOptions = [
  { value: 'furgone', label: 'Furgone' },
  { value: 'motrice', label: 'Motrice' },
  { value: 'trattore', label: 'Trattore' },
  { value: 'semirimorchio', label: 'Semirimorchio' },
]

const vehicleStatusOptions = ['Operativo', 'Da controllare', 'In manutenzione']
const billingPlanLabels = {
  business: 'Business',
  enterprise: 'Enterprise',
  pro: 'Pro',
  starter: 'Starter',
}
const billingStatusLabels = {
  active: 'Attivo',
  cancelled: 'Disdetto',
  past_due: 'Pagamento da verificare',
  pending: 'In attesa di attivazione',
  suspended: 'Sospeso',
}
const billingCheckoutPlans = [
  {
    bestFor: 'Piccole flotte che vogliono partire ordinate.',
    features: ['Fino a 5 autisti', 'Fino a 5 mezzi', 'Scadenze e documenti', 'Notifiche base'],
    id: 'starter',
    price: '49 euro/mese',
    title: 'Starter',
  },
  {
    bestFor: 'La scelta giusta per la maggior parte delle aziende.',
    features: ['Fino a 20 autisti', 'Fino a 25 mezzi', 'Chat, check e guasti', 'Documenti autista e push'],
    id: 'pro',
    isRecommended: true,
    price: '99 euro/mese',
    title: 'Pro',
  },
  {
    bestFor: 'Flotte piu strutturate con piu controllo operativo.',
    features: ['Fino a 60 autisti', 'Fino a 80 mezzi', 'Priorita supporto', 'Storico e gestione avanzata'],
    id: 'business',
    price: '199 euro/mese',
    title: 'Business',
  },
]
const faultSeverityOptions = [
  { value: 'low', label: 'Bassa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'stop_vehicle', label: 'Fermo mezzo' },
]
const faultStatusOptions = [
  { value: 'open', label: 'Da leggere' },
  { value: 'seen', label: 'Da leggere' },
  { value: 'in_progress', label: 'Da leggere' },
  { value: 'closed', label: 'Archiviato' },
]
const chatReactionOptions = [
  { emoji: '👍', label: 'OK', value: 'ok' },
  { emoji: '❤️', label: 'Cuore', value: 'heart' },
  { emoji: '🙏', label: 'Grazie', value: 'thanks' },
  { emoji: '👀', label: 'Visto', value: 'seen' },
  { emoji: '✅', label: 'Fatto', value: 'done' },
  { emoji: '⚠️', label: 'Attenzione', value: 'warning' },
]
const chatTypingExpiryMs = 3500
const emptyChatLiveState = {
  lastSeenByActor: {},
  onlineByActor: {},
  typingByThread: {},
}
const deepLinkViews = new Set(['chat', 'documents', 'drivers', 'fleet', 'notifications', 'records', 'settings', 'support'])
const languageStorageKey = 'camionChiaroLanguage'
const chatSoundStorageKey = 'camionChiaroChatSoundEnabled'
const driverMediaSaveStorageKey = 'camionChiaroDriverMediaSavePreference'
const chatMediaAccept = 'image/*,video/*,audio/*'
const chatGalleryMediaAccept = 'image/*,video/*'
const chatReplyPrefix = '[[cc-reply:'
const chatReplySuffix = ']]'
const driverMediaSaveOptions = [
  { value: 'never', labelKey: 'chat.autoSaveNever' },
  { value: 'photos', labelKey: 'chat.autoSavePhotos' },
  { value: 'all', labelKey: 'chat.autoSaveAll' },
]
const defaultLanguage = 'it'
const languageOptions = [
  { code: 'it', label: 'Italiano', shortLabel: 'IT' },
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'es', label: 'Español', shortLabel: 'ES' },
  { code: 'fr', label: 'Français', shortLabel: 'FR' },
  { code: 'de', label: 'Deutsch', shortLabel: 'DE' },
  { code: 'ro', label: 'Romana', shortLabel: 'RO' },
  { code: 'pl', label: 'Polski', shortLabel: 'PL' },
]
const supportedLanguageCodes = new Set(languageOptions.map((option) => option.code))
const translations = {
  it: {
    'auth.companyEmailLabel': 'Email aziendale',
    'auth.companyEmailPlaceholder': 'azienda@esempio.it',
    'auth.companyNameLabel': 'Nome trasportatore / Ragione sociale',
    'auth.companyNameMissing': 'Inserisci il nome del trasportatore o la ragione sociale.',
    'auth.companyNamePlaceholder': 'Es. Spedifast SRL',
    'auth.companySigninOverline': 'Accesso azienda',
    'auth.companySigninTitle': 'Entra nel pannello',
    'auth.companySignupOverline': 'Registrazione azienda',
    'auth.companySignupTitle': 'Crea account azienda',
    'auth.companyTab': 'Azienda',
    'auth.companyToggleSignin': 'Ho gia un account azienda',
    'auth.companyToggleSignup': 'Devo creare l account azienda',
    'auth.demoNote': 'Modalita demo: quando aggiungi le chiavi Supabase in `.env`, questi form useranno login reali.',
    'auth.driverButton': 'Entra come autista',
    'auth.driverMissing': 'Inserisci nome utente autista e password.',
    'auth.driverOverline': 'Accesso autista',
    'auth.driverTab': 'Autista',
    'auth.driverTitle': 'Entra con nome utente',
    'auth.driverUsernameLabel': 'Nome utente autista',
    'auth.driverUsernamePlaceholder': 'Es. mario.rossi',
    'auth.emailPasswordMissing': 'Inserisci email aziendale e password.',
    'auth.heroText': 'L azienda controlla patenti, revisioni, assicurazioni e visite mediche. L autista entra con il nome utente creato dall azienda, riceve notifiche in app, carica documenti e segnala guasti.',
    'auth.heroTitle': 'Login azienda e autista, tutto nello stesso posto.',
    'auth.passwordLabel': 'Password',
    'auth.passwordPlaceholder': 'Password',
    'auth.proofDriver': 'Area autista',
    'auth.proofOperations': 'Check e guasti',
    'auth.proofSecurity': 'RLS Supabase',
    'auth.registrationSent': 'Registrazione inviata. Controlla la mail per confermare l account.',
    'auth.signinButton': 'Accedi',
    'auth.signupButton': 'Registrati',
    'brand.tagline': 'Scadenze e notifiche flotta',
    'driver.area': 'Area autista',
    'driver.emptyMessage': 'Riprova tra qualche secondo o accedi di nuovo.',
    'driver.emptyTitle': 'Area autista non disponibile',
    'driver.loadingDetail': 'Sto recuperando i dati del profilo.',
    'driver.loadingTitle': 'Caricamento area autista',
    'driver.noteBody': 'Quando Supabase sara collegato, questa vista leggera solo le scadenze dell autista loggato e mostrera avvisi personali, documenti caricati, check mattutini e segnalazioni guasto.',
    'driver.noteOverline': 'Notifiche',
    'driver.noteTitle': 'Qui arrivano gli avvisi in app',
    'hero.aria': 'Controllo scadenze',
    'hero.description': 'Una schermata pulita per vedere subito scadenze, check mattutini e guasti da gestire.',
    'hero.factDrivers': 'autisti attivi',
    'hero.factNotifications': 'notifiche aperte',
    'hero.factVehicles': 'mezzi in flotta',
    'hero.newDeadline': 'Nuova scadenza',
    'hero.openBell': 'Apri campanella',
    'hero.priorityAria': 'Priorita di oggi',
    'hero.priorityCriticalDetail': 'check con anomalie da aprire',
    'hero.priorityCriticalLabel': 'Check critici',
    'hero.priorityDeadlineDetail': '{count} critiche o scadute',
    'hero.priorityDeadlineLabel': 'Scadenze 30 giorni',
    'hero.priorityFaultDetail': 'segnalazioni ancora aperte',
    'hero.priorityFaultLabel': 'Guasti aperti',
    'language.label': 'Lingua',
    'language.short': 'Lingua',
    'nav.chat': 'Chat',
    'nav.deadlines': 'Scadenze',
    'nav.notifications': 'Notifiche',
    'nav.records': 'Anagrafiche',
    'nav.settings': 'Impostazioni',
    'nav.support': 'Guida',
    'onboarding.body': 'Completa questi passaggi per rendere Camion Chiaro operativo senza confusione.',
    'onboarding.companyBody': 'Nome azienda, sede e logo visibili nella dashboard.',
    'onboarding.companyTitle': 'Completa profilo azienda',
    'onboarding.completed': '{count}/{total} completati',
    'onboarding.deadlinesBody': 'Inserisci almeno una patente, visita, revisione o assicurazione da ricordare.',
    'onboarding.deadlinesTitle': 'Aggiungi una scadenza',
    'onboarding.done': 'Fatto',
    'onboarding.driversBody': 'Crea il primo autista con nome utente e telefono.',
    'onboarding.driversTitle': 'Aggiungi autista',
    'onboarding.fleetBody': 'Registra furgoni, motrici, trattori o semirimorchi.',
    'onboarding.fleetTitle': 'Aggiungi mezzo',
    'onboarding.notificationsBody': 'Attiva notifiche su telefono per chat, guasti e check critici.',
    'onboarding.notificationsTitle': 'Attiva notifiche',
    'onboarding.overline': 'Primi passi',
    'onboarding.progress': 'Configurazione',
    'onboarding.title': 'Prepara l azienda',
    'records.aria': 'Anagrafiche azienda',
    'records.documentsLabel': 'Documenti',
    'records.documentsText': 'Scadenze documentali e file autisti',
    'records.driversLabel': 'Autisti',
    'records.driversText': 'Credenziali, telefono e profilo autista',
    'records.fleetLabel': 'Flotta',
    'records.fleetText': 'Furgoni, motrici, trattori e semirimorchi',
    'records.overline': 'Archivio azienda',
    'records.tablist': 'Scegli anagrafica',
    'records.title': 'Anagrafiche',
    'session.companyArea': 'Area azienda',
    'session.dashboardTitle': 'Dashboard azienda',
    'session.signOut': 'Esci',
    'support.faq': 'FAQ',
    'support.launch': 'Presentazione',
    'support.manual': 'Manuale rapido',
    'support.overline': 'Centro supporto',
    'support.subtitle': 'FAQ, manuale, script video e idee commerciali sempre a portata di mano.',
    'support.title': 'Guida e materiali',
    'support.videos': 'Video',
    'support.vision': 'Visione prodotto',
    'sync.addKeys': 'Aggiungi le chiavi .env',
    'sync.connected': 'Supabase collegato',
    'sync.demo': 'Demo locale',
    'topbar.searchPlaceholder': 'Cerca patente, targa, autista...',
    'topbar.searchSr': 'Cerca scadenze',
  },
  en: {
    'auth.companyEmailLabel': 'Company email',
    'auth.companyEmailPlaceholder': 'company@example.com',
    'auth.companyNameLabel': 'Carrier name / Legal name',
    'auth.companyNameMissing': 'Enter the carrier name or legal company name.',
    'auth.companyNamePlaceholder': 'Example: Spedifast Ltd',
    'auth.companySigninOverline': 'Company access',
    'auth.companySigninTitle': 'Enter the dashboard',
    'auth.companySignupOverline': 'Company registration',
    'auth.companySignupTitle': 'Create company account',
    'auth.companyTab': 'Company',
    'auth.companyToggleSignin': 'I already have a company account',
    'auth.companyToggleSignup': 'I need to create a company account',
    'auth.demoNote': 'Demo mode: after you add Supabase keys in `.env`, these forms will use real logins.',
    'auth.driverButton': 'Enter as driver',
    'auth.driverMissing': 'Enter driver username and password.',
    'auth.driverOverline': 'Driver access',
    'auth.driverTab': 'Driver',
    'auth.driverTitle': 'Enter with username',
    'auth.driverUsernameLabel': 'Driver username',
    'auth.driverUsernamePlaceholder': 'Example: mario.rossi',
    'auth.emailPasswordMissing': 'Enter company email and password.',
    'auth.heroText': 'The company tracks licences, inspections, insurance and medical checks. Drivers enter with the username created by the company, receive in-app alerts, upload documents and report faults.',
    'auth.heroTitle': 'Company and driver login, all in one place.',
    'auth.passwordLabel': 'Password',
    'auth.passwordPlaceholder': 'Password',
    'auth.proofDriver': 'Driver area',
    'auth.proofOperations': 'Checks and faults',
    'auth.proofSecurity': 'Supabase RLS',
    'auth.registrationSent': 'Registration sent. Check your email to confirm the account.',
    'auth.signinButton': 'Sign in',
    'auth.signupButton': 'Register',
    'brand.tagline': 'Fleet deadlines and alerts',
    'driver.area': 'Driver area',
    'driver.emptyMessage': 'Try again in a few seconds or sign in again.',
    'driver.emptyTitle': 'Driver area unavailable',
    'driver.loadingDetail': 'Retrieving profile data.',
    'driver.loadingTitle': 'Loading driver area',
    'driver.noteBody': 'When Supabase is connected, this view will read only the signed-in driver data and show personal alerts, uploaded documents, morning checks and fault reports.',
    'driver.noteOverline': 'Notifications',
    'driver.noteTitle': 'In-app alerts arrive here',
    'hero.aria': 'Deadline control',
    'hero.description': 'A clean screen to see deadlines, morning checks and faults to manage right away.',
    'hero.factDrivers': 'active drivers',
    'hero.factNotifications': 'open notifications',
    'hero.factVehicles': 'fleet vehicles',
    'hero.newDeadline': 'New deadline',
    'hero.openBell': 'Open notifications',
    'hero.priorityAria': 'Today priorities',
    'hero.priorityCriticalDetail': 'checks with issues to open',
    'hero.priorityCriticalLabel': 'Critical checks',
    'hero.priorityDeadlineDetail': '{count} critical or expired',
    'hero.priorityDeadlineLabel': '30-day deadlines',
    'hero.priorityFaultDetail': 'reports still open',
    'hero.priorityFaultLabel': 'Open faults',
    'language.label': 'Language',
    'language.short': 'Language',
    'nav.chat': 'Chat',
    'nav.deadlines': 'Deadlines',
    'nav.notifications': 'Notifications',
    'nav.records': 'Records',
    'nav.settings': 'Settings',
    'nav.support': 'Guide',
    'onboarding.body': 'Complete these steps to make Camion Chiaro operational without confusion.',
    'onboarding.companyBody': 'Company name, headquarters and logo visible in the dashboard.',
    'onboarding.companyTitle': 'Complete company profile',
    'onboarding.completed': '{count}/{total} completed',
    'onboarding.deadlinesBody': 'Add at least one licence, medical check, inspection or insurance deadline.',
    'onboarding.deadlinesTitle': 'Add a deadline',
    'onboarding.done': 'Done',
    'onboarding.driversBody': 'Create the first driver with username and phone.',
    'onboarding.driversTitle': 'Add driver',
    'onboarding.fleetBody': 'Register vans, rigids, tractors or semi-trailers.',
    'onboarding.fleetTitle': 'Add vehicle',
    'onboarding.notificationsBody': 'Enable phone notifications for chat, faults and critical checks.',
    'onboarding.notificationsTitle': 'Enable notifications',
    'onboarding.overline': 'First steps',
    'onboarding.progress': 'Setup',
    'onboarding.title': 'Prepare the company',
    'records.aria': 'Company records',
    'records.documentsLabel': 'Documents',
    'records.documentsText': 'Driver document files and deadlines',
    'records.driversLabel': 'Drivers',
    'records.driversText': 'Credentials, phone and driver profile',
    'records.fleetLabel': 'Fleet',
    'records.fleetText': 'Vans, rigids, tractors and semi-trailers',
    'records.overline': 'Company archive',
    'records.tablist': 'Choose record area',
    'records.title': 'Records',
    'session.companyArea': 'Company area',
    'session.dashboardTitle': 'Company dashboard',
    'session.signOut': 'Sign out',
    'support.faq': 'FAQ',
    'support.launch': 'Presentation',
    'support.manual': 'Quick manual',
    'support.overline': 'Support center',
    'support.subtitle': 'FAQ, manual, video scripts and sales ideas always at hand.',
    'support.title': 'Guide and materials',
    'support.videos': 'Videos',
    'support.vision': 'Product vision',
    'sync.addKeys': 'Add .env keys',
    'sync.connected': 'Supabase connected',
    'sync.demo': 'Local demo',
    'topbar.searchPlaceholder': 'Search licence, plate, driver...',
    'topbar.searchSr': 'Search deadlines',
  },
  es: {
    'auth.companyEmailLabel': 'Email de empresa',
    'auth.companyEmailPlaceholder': 'empresa@ejemplo.com',
    'auth.companyNameLabel': 'Nombre del transportista / Razon social',
    'auth.companyNameMissing': 'Introduce el nombre del transportista o la razon social.',
    'auth.companyNamePlaceholder': 'Ej. Spedifast SL',
    'auth.companySigninOverline': 'Acceso empresa',
    'auth.companySigninTitle': 'Entrar al panel',
    'auth.companySignupOverline': 'Registro empresa',
    'auth.companySignupTitle': 'Crear cuenta de empresa',
    'auth.companyTab': 'Empresa',
    'auth.companyToggleSignin': 'Ya tengo una cuenta de empresa',
    'auth.companyToggleSignup': 'Necesito crear una cuenta de empresa',
    'auth.demoNote': 'Modo demo: cuando añadas las claves Supabase en `.env`, estos formularios usaran accesos reales.',
    'auth.driverButton': 'Entrar como conductor',
    'auth.driverMissing': 'Introduce usuario de conductor y contraseña.',
    'auth.driverOverline': 'Acceso conductor',
    'auth.driverTab': 'Conductor',
    'auth.driverTitle': 'Entrar con usuario',
    'auth.driverUsernameLabel': 'Usuario conductor',
    'auth.driverUsernamePlaceholder': 'Ej. mario.rossi',
    'auth.emailPasswordMissing': 'Introduce email de empresa y contraseña.',
    'auth.heroText': 'La empresa controla permisos, inspecciones, seguros y revisiones medicas. El conductor entra con el usuario creado por la empresa, recibe avisos en la app, sube documentos y comunica averias.',
    'auth.heroTitle': 'Login de empresa y conductor, todo en el mismo sitio.',
    'auth.passwordLabel': 'Contraseña',
    'auth.passwordPlaceholder': 'Contraseña',
    'auth.proofDriver': 'Area conductor',
    'auth.proofOperations': 'Checks y averias',
    'auth.proofSecurity': 'RLS Supabase',
    'auth.registrationSent': 'Registro enviado. Revisa el email para confirmar la cuenta.',
    'auth.signinButton': 'Acceder',
    'auth.signupButton': 'Registrarse',
    'brand.tagline': 'Vencimientos y avisos de flota',
    'driver.area': 'Area conductor',
    'driver.emptyMessage': 'Prueba de nuevo en unos segundos o inicia sesion otra vez.',
    'driver.emptyTitle': 'Area conductor no disponible',
    'driver.loadingDetail': 'Recuperando datos del perfil.',
    'driver.loadingTitle': 'Cargando area conductor',
    'driver.noteBody': 'Cuando Supabase este conectado, esta vista leera solo los datos del conductor conectado y mostrara avisos personales, documentos, checks matinales y averias.',
    'driver.noteOverline': 'Notificaciones',
    'driver.noteTitle': 'Aqui llegan los avisos en app',
    'hero.aria': 'Control de vencimientos',
    'hero.description': 'Una pantalla limpia para ver vencimientos, checks matinales y averias pendientes.',
    'hero.factDrivers': 'conductores activos',
    'hero.factNotifications': 'notificaciones abiertas',
    'hero.factVehicles': 'vehiculos en flota',
    'hero.newDeadline': 'Nuevo vencimiento',
    'hero.openBell': 'Abrir avisos',
    'hero.priorityAria': 'Prioridades de hoy',
    'hero.priorityCriticalDetail': 'checks con incidencias por abrir',
    'hero.priorityCriticalLabel': 'Checks criticos',
    'hero.priorityDeadlineDetail': '{count} criticos o vencidos',
    'hero.priorityDeadlineLabel': 'Vencimientos 30 dias',
    'hero.priorityFaultDetail': 'avisos aun abiertos',
    'hero.priorityFaultLabel': 'Averias abiertas',
    'language.label': 'Idioma',
    'language.short': 'Idioma',
    'nav.chat': 'Chat',
    'nav.deadlines': 'Vencimientos',
    'nav.notifications': 'Avisos',
    'nav.records': 'Ficheros',
    'nav.settings': 'Ajustes',
    'nav.support': 'Guia',
    'onboarding.body': 'Completa estos pasos para poner Camion Chiaro operativo sin confusion.',
    'onboarding.companyBody': 'Nombre empresa, sede y logo visibles en el panel.',
    'onboarding.companyTitle': 'Completar perfil empresa',
    'onboarding.completed': '{count}/{total} completados',
    'onboarding.deadlinesBody': 'Añade al menos un permiso, revision medica, inspeccion o seguro.',
    'onboarding.deadlinesTitle': 'Añadir vencimiento',
    'onboarding.done': 'Hecho',
    'onboarding.driversBody': 'Crea el primer conductor con usuario y telefono.',
    'onboarding.driversTitle': 'Añadir conductor',
    'onboarding.fleetBody': 'Registra furgonetas, rigidos, tractoras o semirremolques.',
    'onboarding.fleetTitle': 'Añadir vehiculo',
    'onboarding.notificationsBody': 'Activa avisos en telefono para chat, averias y checks criticos.',
    'onboarding.notificationsTitle': 'Activar avisos',
    'onboarding.overline': 'Primeros pasos',
    'onboarding.progress': 'Configuracion',
    'onboarding.title': 'Preparar empresa',
    'records.aria': 'Ficheros empresa',
    'records.documentsLabel': 'Documentos',
    'records.documentsText': 'Vencimientos y archivos de conductores',
    'records.driversLabel': 'Conductores',
    'records.driversText': 'Credenciales, telefono y perfil',
    'records.fleetLabel': 'Flota',
    'records.fleetText': 'Furgones, rigidos, tractoras y semirremolques',
    'records.overline': 'Archivo empresa',
    'records.tablist': 'Elige fichero',
    'records.title': 'Ficheros',
    'session.companyArea': 'Area empresa',
    'session.dashboardTitle': 'Panel empresa',
    'session.signOut': 'Salir',
    'support.faq': 'FAQ',
    'support.launch': 'Presentacion',
    'support.manual': 'Manual rapido',
    'support.overline': 'Centro ayuda',
    'support.subtitle': 'FAQ, manual, guiones video e ideas comerciales siempre disponibles.',
    'support.title': 'Guia y materiales',
    'support.videos': 'Videos',
    'support.vision': 'Vision producto',
    'sync.addKeys': 'Añade claves .env',
    'sync.connected': 'Supabase conectado',
    'sync.demo': 'Demo local',
    'topbar.searchPlaceholder': 'Buscar permiso, matricula, conductor...',
    'topbar.searchSr': 'Buscar vencimientos',
  },
  fr: {
    'auth.companyEmailLabel': 'Email entreprise',
    'auth.companyEmailPlaceholder': 'entreprise@exemple.fr',
    'auth.companyNameLabel': 'Nom transporteur / Raison sociale',
    'auth.companyNameMissing': 'Saisis le nom du transporteur ou la raison sociale.',
    'auth.companyNamePlaceholder': 'Ex. Spedifast SARL',
    'auth.companySigninOverline': 'Acces entreprise',
    'auth.companySigninTitle': 'Entrer dans le tableau',
    'auth.companySignupOverline': 'Inscription entreprise',
    'auth.companySignupTitle': 'Creer un compte entreprise',
    'auth.companyTab': 'Entreprise',
    'auth.companyToggleSignin': 'J ai deja un compte entreprise',
    'auth.companyToggleSignup': 'Je dois creer un compte entreprise',
    'auth.demoNote': 'Mode demo : apres ajout des cles Supabase dans `.env`, ces formulaires utiliseront de vrais acces.',
    'auth.driverButton': 'Entrer comme chauffeur',
    'auth.driverMissing': 'Saisis le nom utilisateur chauffeur et le mot de passe.',
    'auth.driverOverline': 'Acces chauffeur',
    'auth.driverTab': 'Chauffeur',
    'auth.driverTitle': 'Entrer avec nom utilisateur',
    'auth.driverUsernameLabel': 'Utilisateur chauffeur',
    'auth.driverUsernamePlaceholder': 'Ex. mario.rossi',
    'auth.emailPasswordMissing': 'Saisis email entreprise et mot de passe.',
    'auth.heroText': 'L entreprise suit permis, controles, assurances et visites medicales. Le chauffeur entre avec le nom utilisateur cree par l entreprise, recoit des alertes dans l app, charge ses documents et signale les pannes.',
    'auth.heroTitle': 'Connexion entreprise et chauffeur, tout au meme endroit.',
    'auth.passwordLabel': 'Mot de passe',
    'auth.passwordPlaceholder': 'Mot de passe',
    'auth.proofDriver': 'Espace chauffeur',
    'auth.proofOperations': 'Checks et pannes',
    'auth.proofSecurity': 'RLS Supabase',
    'auth.registrationSent': 'Inscription envoyee. Controle ton email pour confirmer le compte.',
    'auth.signinButton': 'Se connecter',
    'auth.signupButton': 'S inscrire',
    'brand.tagline': 'Echeances et alertes flotte',
    'driver.area': 'Espace chauffeur',
    'driver.emptyMessage': 'Reessaie dans quelques secondes ou reconnecte-toi.',
    'driver.emptyTitle': 'Espace chauffeur indisponible',
    'driver.loadingDetail': 'Recuperation des donnees du profil.',
    'driver.loadingTitle': 'Chargement espace chauffeur',
    'driver.noteBody': 'Quand Supabase sera connecte, cette vue lira seulement les donnees du chauffeur connecte et affichera alertes personnelles, documents, checks du matin et pannes.',
    'driver.noteOverline': 'Notifications',
    'driver.noteTitle': 'Les alertes app arrivent ici',
    'hero.aria': 'Controle des echeances',
    'hero.description': 'Un ecran clair pour voir tout de suite echeances, checks du matin et pannes a gerer.',
    'hero.factDrivers': 'chauffeurs actifs',
    'hero.factNotifications': 'notifications ouvertes',
    'hero.factVehicles': 'vehicules en flotte',
    'hero.newDeadline': 'Nouvelle echeance',
    'hero.openBell': 'Ouvrir alertes',
    'hero.priorityAria': 'Priorites du jour',
    'hero.priorityCriticalDetail': 'checks avec anomalies a ouvrir',
    'hero.priorityCriticalLabel': 'Checks critiques',
    'hero.priorityDeadlineDetail': '{count} critiques ou expirees',
    'hero.priorityDeadlineLabel': 'Echeances 30 jours',
    'hero.priorityFaultDetail': 'signalements encore ouverts',
    'hero.priorityFaultLabel': 'Pannes ouvertes',
    'language.label': 'Langue',
    'language.short': 'Langue',
    'nav.chat': 'Chat',
    'nav.deadlines': 'Echeances',
    'nav.notifications': 'Alertes',
    'nav.records': 'Fiches',
    'nav.settings': 'Reglages',
    'nav.support': 'Guide',
    'onboarding.body': 'Complete ces etapes pour rendre Camion Chiaro operationnel sans confusion.',
    'onboarding.companyBody': 'Nom entreprise, siege et logo visibles dans le tableau.',
    'onboarding.companyTitle': 'Completer profil entreprise',
    'onboarding.completed': '{count}/{total} termines',
    'onboarding.deadlinesBody': 'Ajoute au moins un permis, visite medicale, controle ou assurance.',
    'onboarding.deadlinesTitle': 'Ajouter echeance',
    'onboarding.done': 'Fait',
    'onboarding.driversBody': 'Cree le premier chauffeur avec utilisateur et telephone.',
    'onboarding.driversTitle': 'Ajouter chauffeur',
    'onboarding.fleetBody': 'Enregistre fourgons, porteurs, tracteurs ou semi-remorques.',
    'onboarding.fleetTitle': 'Ajouter vehicule',
    'onboarding.notificationsBody': 'Active les alertes telephone pour chat, pannes et checks critiques.',
    'onboarding.notificationsTitle': 'Activer alertes',
    'onboarding.overline': 'Premiers pas',
    'onboarding.progress': 'Configuration',
    'onboarding.title': 'Preparer entreprise',
    'records.aria': 'Fiches entreprise',
    'records.documentsLabel': 'Documents',
    'records.documentsText': 'Echeances et fichiers chauffeurs',
    'records.driversLabel': 'Chauffeurs',
    'records.driversText': 'Identifiants, telephone et profil',
    'records.fleetLabel': 'Flotte',
    'records.fleetText': 'Fourgons, porteurs, tracteurs et semi-remorques',
    'records.overline': 'Archive entreprise',
    'records.tablist': 'Choisir une fiche',
    'records.title': 'Fiches',
    'session.companyArea': 'Espace entreprise',
    'session.dashboardTitle': 'Tableau entreprise',
    'session.signOut': 'Sortir',
    'support.faq': 'FAQ',
    'support.launch': 'Presentation',
    'support.manual': 'Manuel rapide',
    'support.overline': 'Centre support',
    'support.subtitle': 'FAQ, manuel, scripts video et idees commerciales toujours disponibles.',
    'support.title': 'Guide et materiels',
    'support.videos': 'Videos',
    'support.vision': 'Vision produit',
    'sync.addKeys': 'Ajoute les cles .env',
    'sync.connected': 'Supabase connecte',
    'sync.demo': 'Demo locale',
    'topbar.searchPlaceholder': 'Chercher permis, plaque, chauffeur...',
    'topbar.searchSr': 'Chercher echeances',
  },
  de: {
    'auth.companyEmailLabel': 'Firmen-E-Mail',
    'auth.companyEmailPlaceholder': 'firma@beispiel.de',
    'auth.companyNameLabel': 'Transportunternehmen / Firmenname',
    'auth.companyNameMissing': 'Firmennamen oder rechtlichen Namen eingeben.',
    'auth.companyNamePlaceholder': 'z. B. Spedifast GmbH',
    'auth.companySigninOverline': 'Firmenzugang',
    'auth.companySigninTitle': 'Dashboard offnen',
    'auth.companySignupOverline': 'Firma registrieren',
    'auth.companySignupTitle': 'Firmenkonto erstellen',
    'auth.companyTab': 'Firma',
    'auth.companyToggleSignin': 'Ich habe bereits ein Firmenkonto',
    'auth.companyToggleSignup': 'Ich muss ein Firmenkonto erstellen',
    'auth.demoNote': 'Demo-Modus: Nach dem Hinzufugen der Supabase-Schlussel in `.env` nutzen diese Formulare echte Logins.',
    'auth.driverButton': 'Als Fahrer offnen',
    'auth.driverMissing': 'Fahrer-Benutzername und Passwort eingeben.',
    'auth.driverOverline': 'Fahrerzugang',
    'auth.driverTab': 'Fahrer',
    'auth.driverTitle': 'Mit Benutzername offnen',
    'auth.driverUsernameLabel': 'Fahrer-Benutzername',
    'auth.driverUsernamePlaceholder': 'z. B. mario.rossi',
    'auth.emailPasswordMissing': 'Firmen-E-Mail und Passwort eingeben.',
    'auth.heroText': 'Die Firma uberwacht Fuhrerscheine, Prufungen, Versicherungen und medizinische Checks. Fahrer melden sich mit dem von der Firma erstellten Benutzernamen an, erhalten App-Hinweise, laden Dokumente hoch und melden Schaden.',
    'auth.heroTitle': 'Login fur Firma und Fahrer, alles an einem Ort.',
    'auth.passwordLabel': 'Passwort',
    'auth.passwordPlaceholder': 'Passwort',
    'auth.proofDriver': 'Fahrerbereich',
    'auth.proofOperations': 'Checks und Schaden',
    'auth.proofSecurity': 'Supabase RLS',
    'auth.registrationSent': 'Registrierung gesendet. E-Mail bestatigen, um das Konto zu aktivieren.',
    'auth.signinButton': 'Einloggen',
    'auth.signupButton': 'Registrieren',
    'brand.tagline': 'Flottenfristen und Hinweise',
    'driver.area': 'Fahrerbereich',
    'driver.emptyMessage': 'In einigen Sekunden erneut versuchen oder neu anmelden.',
    'driver.emptyTitle': 'Fahrerbereich nicht verfugbar',
    'driver.loadingDetail': 'Profildaten werden geladen.',
    'driver.loadingTitle': 'Fahrerbereich wird geladen',
    'driver.noteBody': 'Wenn Supabase verbunden ist, liest diese Ansicht nur die Daten des angemeldeten Fahrers und zeigt personliche Hinweise, Dokumente, Morgenchecks und Schadenmeldungen.',
    'driver.noteOverline': 'Benachrichtigungen',
    'driver.noteTitle': 'App-Hinweise kommen hier an',
    'hero.aria': 'Fristenkontrolle',
    'hero.description': 'Eine klare Ansicht fur Fristen, Morgenchecks und offene Schaden.',
    'hero.factDrivers': 'aktive Fahrer',
    'hero.factNotifications': 'offene Hinweise',
    'hero.factVehicles': 'Fahrzeuge',
    'hero.newDeadline': 'Neue Frist',
    'hero.openBell': 'Hinweise offnen',
    'hero.priorityAria': 'Prioritaten heute',
    'hero.priorityCriticalDetail': 'Checks mit Problemen offnen',
    'hero.priorityCriticalLabel': 'Kritische Checks',
    'hero.priorityDeadlineDetail': '{count} kritisch oder abgelaufen',
    'hero.priorityDeadlineLabel': 'Fristen 30 Tage',
    'hero.priorityFaultDetail': 'Meldungen noch offen',
    'hero.priorityFaultLabel': 'Offene Schaden',
    'language.label': 'Sprache',
    'language.short': 'Sprache',
    'nav.chat': 'Chat',
    'nav.deadlines': 'Fristen',
    'nav.notifications': 'Hinweise',
    'nav.records': 'Stammdaten',
    'nav.settings': 'Einstellungen',
    'nav.support': 'Hilfe',
    'onboarding.body': 'Schliesse diese Schritte ab, damit Camion Chiaro sauber einsatzbereit ist.',
    'onboarding.companyBody': 'Firmenname, Sitz und Logo sichtbar im Dashboard.',
    'onboarding.companyTitle': 'Firmenprofil vervollstandigen',
    'onboarding.completed': '{count}/{total} erledigt',
    'onboarding.deadlinesBody': 'Mindestens eine Lizenz, Untersuchung, Prufung oder Versicherung eintragen.',
    'onboarding.deadlinesTitle': 'Frist hinzufugen',
    'onboarding.done': 'Erledigt',
    'onboarding.driversBody': 'Ersten Fahrer mit Benutzername und Telefon erstellen.',
    'onboarding.driversTitle': 'Fahrer hinzufugen',
    'onboarding.fleetBody': 'Transporter, Lkw, Sattelzugmaschinen oder Auflieger erfassen.',
    'onboarding.fleetTitle': 'Fahrzeug hinzufugen',
    'onboarding.notificationsBody': 'Telefon-Hinweise fur Chat, Schaden und kritische Checks aktivieren.',
    'onboarding.notificationsTitle': 'Hinweise aktivieren',
    'onboarding.overline': 'Erste Schritte',
    'onboarding.progress': 'Einrichtung',
    'onboarding.title': 'Firma vorbereiten',
    'records.aria': 'Firmen-Stammdaten',
    'records.documentsLabel': 'Dokumente',
    'records.documentsText': 'Fahrerdokumente und Fristen',
    'records.driversLabel': 'Fahrer',
    'records.driversText': 'Zugangsdaten, Telefon und Profil',
    'records.fleetLabel': 'Flotte',
    'records.fleetText': 'Transporter, Lkw, Sattelzugmaschinen und Auflieger',
    'records.overline': 'Firmenarchiv',
    'records.tablist': 'Stammdaten auswahlen',
    'records.title': 'Stammdaten',
    'session.companyArea': 'Firmenbereich',
    'session.dashboardTitle': 'Firmen-Dashboard',
    'session.signOut': 'Ausloggen',
    'support.faq': 'FAQ',
    'support.launch': 'Prasentation',
    'support.manual': 'Kurzanleitung',
    'support.overline': 'Hilfecenter',
    'support.subtitle': 'FAQ, Handbuch, Videoskripte und Verkaufsideen immer griffbereit.',
    'support.title': 'Hilfe und Materialien',
    'support.videos': 'Videos',
    'support.vision': 'Produktvision',
    'sync.addKeys': '.env-Schlussel hinzufugen',
    'sync.connected': 'Supabase verbunden',
    'sync.demo': 'Lokale Demo',
    'topbar.searchPlaceholder': 'Fuhrerschein, Kennzeichen, Fahrer suchen...',
    'topbar.searchSr': 'Fristen suchen',
  },
}

const workflowTranslations = {
  it: {
    'chat.companyTitle': 'Chat autisti',
    'chat.companyAria': 'Chat azienda autisti',
    'chat.conversation': 'Conversazione',
    'chat.gallery': 'Galleria',
    'chat.messages': 'Messaggi',
    'chat.noDrivers': 'Nessun autista',
    'chat.noDriversHint': 'Aggiungi un autista prima di aprire una chat.',
    'chat.noMessages': 'Nessun messaggio',
    'chat.noMessagesYet': 'Nessun messaggio ancora',
    'chat.online': 'Online',
    'chat.firstMessageHint': 'Scrivi il primo messaggio all autista.',
    'chat.createdOnFirstMessage': 'La chat verra creata al primo messaggio.',
    'chat.selectDriver': 'Seleziona autista',
    'chat.selectDriverBody': 'Apri una chat dalla lista per leggere e rispondere.',
    'chat.writePlaceholder': 'Scrivi un messaggio...',
    'chat.messagePlaceholder': 'Messaggio',
    'chat.photo': 'Foto',
    'chat.photoAttached': 'Foto allegata',
    'chat.photoLoading': 'Foto in caricamento...',
    'chat.photoReady': 'Foto pronta: {name}',
    'chat.company': 'Azienda',
    'chat.driver': 'Autista',
    'chat.you': 'Tu',
    'chat.send': 'Invia',
    'chat.sending': 'Invio...',
    'messageStatus.delivered': 'Consegnato',
    'messageStatus.read': 'Letto',
    'messageStatus.sent': 'Inviato',
    'chat.open': 'Apri chat',
    'chat.openWithCount': 'Apri chat ({count})',
    'chat.emptyDriverHint': 'Scrivi all azienda quando hai bisogno di comunicare velocemente.',
    'chat.typing': 'Sta scrivendo...',
    'common.add': 'Aggiungi',
    'common.addDocument': 'Aggiungi documento',
    'common.archive': 'Archivia',
    'common.archived': 'Archiviato',
    'common.back': 'Indietro',
    'common.cancel': 'Annulla',
    'common.change': 'Cambia',
    'common.close': 'Chiudi',
    'common.company': 'Azienda',
    'common.delete': 'Elimina',
    'common.driver': 'Autista',
    'common.edit': 'Modifica',
    'common.file': 'File',
    'common.loading': 'Caricamento...',
    'common.notAvailable': 'Non disponibile',
    'common.notInserted': 'Non inserita',
    'common.notes': 'Note',
    'common.open': 'Apri',
    'common.photo': 'Foto',
    'common.readyPhoto': 'Foto pronta: {name}',
    'common.remove': 'Rimuovi',
    'common.save': 'Salva',
    'common.saveChanges': 'Salva modifiche',
    'common.saving': 'Salvataggio...',
    'common.status': 'Stato',
    'common.time': 'Ora',
    'common.upload': 'Carica',
    'common.vehicle': 'Mezzo',
    'common.vehicleMissing': 'Mezzo non trovato',
    'common.driverMissing': 'Autista non trovato',
    'common.trailer': 'Semirimorchio',
    'companyLogo.body': 'Appare accanto al nome nella dashboard.',
    'companyLogo.change': 'Cambia logo',
    'companyLogo.title': 'Logo azienda',
    'companyLogo.upload': 'Carica logo',
    'deadline.add': 'Nuova scadenza',
    'deadline.addFirstHint': 'Aggiungi prima almeno un autista o un mezzo.',
    'deadline.advancedFilters': 'Filtri avanzati',
    'deadline.agenda': 'Agenda operativa',
    'deadline.atLeastOneDriver': 'almeno un autista',
    'deadline.atLeastOneVehicle': 'almeno un mezzo',
    'deadline.boardTitle': 'Scadenze documentali',
    'deadline.close': 'Chiudi',
    'deadline.days': '{count} giorni',
    'deadline.daysAgo': '{count} giorni fa',
    'deadline.driverScope': 'Autista',
    'deadline.dueDate': 'Scadenza',
    'deadline.emptyText': 'Le prossime scadenze compariranno qui.',
    'deadline.emptyTitle': 'Nessuna scadenza inserita',
    'deadline.filterAria': 'Filtra scadenze',
    'deadline.inApp': 'In app',
    'deadline.owner': 'Responsabile',
    'deadline.quickInsert': 'Inserimento rapido',
    'deadline.renew': 'Rinnovo',
    'deadline.scope': 'Ambito',
    'deadline.subject': 'Soggetto',
    'deadline.type': 'Tipo',
    'deadline.vehicleScope': 'Mezzo',
    'documents.createOverline': 'Nuovo documento',
    'documents.document': 'Documento',
    'documents.driverPoliceTitle': 'Documenti da mostrare alla polizia',
    'documents.expiry': 'Scadenza',
    'documents.fileReady': 'File pronto: {name}',
    'documents.chooseFileFirst': 'Scegli una foto o un PDF prima di salvare.',
    'documents.noVisible': 'Nessun documento visibile',
    'documents.fileOrLink': 'File o link',
    'documents.filePresent': 'File/link presente',
    'documents.fileMissing': 'File da caricare',
    'documents.noDocuments': 'Nessun documento inserito.',
    'documents.noDriver': 'Autista non assegnato',
    'documents.onlyCompany': 'Solo azienda',
    'documents.historyTitle': 'Storico documenti',
    'documents.historyOverline': 'Storico',
    'documents.historyMovements': 'Movimenti documenti',
    'documents.historyEmpty': 'Lo storico comparira al prossimo movimento documento.',
    'documents.visibleApp': 'visibili in app',
    'documents.visibleDriver': 'Visibile all autista',
    'documents.visibleInApp': 'Visibile in app',
    'documents.withFile': 'con file/link',
    'documents.within30': 'entro 30 giorni',
    'documents.number': 'Numero documento',
    'documents.numberPlaceholder': 'Numero o riferimento',
    'documents.openOrSave': 'Apri/salva',
    'documents.removeFile': 'Elimina file',
    'documents.save': 'Salva documento',
    'documents.uploadCamera': 'Scatta foto',
    'documents.uploadFile': 'Carica foto/PDF',
    'documents.uploading': 'Caricamento in corso...',
    'docStatus.uploaded': 'Caricato',
    'docStatus.verified': 'Verificato',
    'docStatus.expired': 'Scaduto',
    'docStatus.missing': 'Mancante',
    'docType.adr': 'Formazione ADR',
    'docType.cqc': 'CQC',
    'docType.driverCard': 'Carta tachigrafica',
    'docType.insurance': 'Assicurazione RCA',
    'docType.licenseC': 'Patente C',
    'docType.licenseCE': 'Patente C+E',
    'docType.medical': 'Visita medica',
    'docType.roadTax': 'Bollo',
    'docType.vehicleInspection': 'Revisione mezzo',
    'driverApp.checkSent': 'Check inviato',
    'driverApp.companyMessages': 'Messaggi azienda',
    'driverApp.currentKm': 'Km attuali',
    'driverApp.documentUploaded': 'Documento caricato',
    'driverApp.faultReported': 'Guasto segnalato',
    'driverApp.greeting': 'Buongiorno',
    'driverApp.messageUnread': '{count} messaggi azienda da leggere',
    'driverApp.messages': '{count} messaggi',
    'driverApp.none': 'Nessuno',
    'driverApp.notesCheck': 'Note check',
    'driverApp.notesPlaceholder': 'Es. pressione gomme controllata',
    'driverApp.morningCheck': 'Check mattutino',
    'driverApp.noVehicle': 'Nessun mezzo selezionabile. L azienda deve aggiungere almeno un furgone, motrice o trattore in Flotta.',
    'driverApp.previewDriver': 'Autista in anteprima',
    'driverApp.uploadDocument': 'Carica documento',
    'driverApp.usedVehicle': 'Mezzo usato',
    'driverApp.attachedTrailer': 'Semirimorchio agganciato',
    'driverApp.quickChecks': 'Controlli rapidi',
    'driverApp.lightsOk': 'Luci ok',
    'driverApp.tiresOk': 'Gomme ok',
    'driverApp.documentsBoard': 'Documenti bordo',
    'driverApp.sendCheck': 'Invia check',
    'driverApp.lastCheck': 'Ultimo check: {time}',
    'drivers.addTitle': 'Nuovo autista',
    'drivers.archive': 'Archivia autista',
    'drivers.authEmail': 'Email accesso autista',
    'drivers.credentials': 'Credenziali',
    'drivers.depot': 'Deposito',
    'drivers.edit': 'Modifica autista',
    'drivers.name': 'Nome e cognome',
    'drivers.password': 'Password temporanea',
    'drivers.phone': 'Cellulare',
    'drivers.photo': 'Foto profilo',
    'drivers.role': 'Ruolo',
    'drivers.username': 'Nome utente',
    'fault.description': 'Descrizione',
    'fault.details': 'Dettagli',
    'fault.detailsPlaceholder': 'Descrivi cosa succede',
    'fault.openFaults': '{count} guasti aperti',
    'fault.photo': 'Foto guasto',
    'fault.photoRemove': 'Rimuovi foto',
    'fault.photoTake': 'Scatta foto',
    'fault.titlePlaceholder': 'Es. spia motore accesa',
    'fault.report': 'Segnala guasto',
    'fault.reportShort': 'Segnala',
    'fault.send': 'Invia guasto',
    'fault.severity': 'Gravita',
    'fault.title': 'Titolo guasto',
    'faultStatus.closed': 'Archiviato',
    'faultStatus.open': 'Da leggere',
    'faultStatus.seen': 'Da leggere',
    'faultStatus.in_progress': 'Da leggere',
    'faultSeverity.high': 'Alta',
    'faultSeverity.low': 'Bassa',
    'faultSeverity.medium': 'Media',
    'faultSeverity.stop_vehicle': 'Fermo mezzo',
    'fleet.empty': 'Furgoni, motrici, trattori e semirimorchi compariranno qui.',
    'fleet.addToFleet': 'Aggiungi alla flotta',
    'fleet.archivedHidden': '{count} mezzi archiviati nascosti dall elenco operativo.',
    'fleet.assignedVehicles': 'Mezzi assegnati',
    'fleet.category': 'Categoria',
    'fleet.managementAria': 'Gestione flotta e inserimento',
    'fleet.setup': 'Allestimento',
    'fleet.setupMissing': 'Allestimento da completare',
    'fleet.noFleetTitle': 'Nessun mezzo in flotta',
    'fleet.vehicleActive': 'mezzi attivi',
    'fleet.model': 'Modello',
    'fleet.modelMissing': 'Modello non inserito',
    'fleet.newVehicle': 'Nuovo mezzo',
    'fleet.plate': 'Targa',
    'fleet.title': 'Flotta',
    'fleet.type': 'Tipo flotta',
    'fleetType.furgone': 'Furgone',
    'fleetType.furgonePlural': 'Furgoni',
    'fleetType.motrice': 'Motrice',
    'fleetType.motricePlural': 'Motrici',
    'fleetType.trattore': 'Trattore',
    'fleetType.trattorePlural': 'Trattori',
    'fleetType.semirimorchio': 'Semirimorchio',
    'fleetType.semirimorchioPlural': 'Semirimorchi',
    'filter.all': 'Tutte',
    'filter.driver': 'Autisti',
    'filter.medical': 'Mediche',
    'filter.month': '30 giorni',
    'filter.urgent': 'Critiche',
    'filter.vehicle': 'Mezzi',
    'form.missingFields': 'Mancano: {fields}.',
    'notifications.bellAria': 'Notifiche: {count} da leggere',
    'notifications.companyAria': 'Notifiche azienda',
    'notifications.empty': 'Nessuna notifica in questa sezione.',
    'notifications.filterAria': 'Filtra notifiche',
    'notifications.fullView': 'Vista completa',
    'operations.archive': 'Archivia',
    'operations.archived': 'Archivio',
    'operations.archivedCount': 'archiviati',
    'operations.activeFaults': 'guasti attivi',
    'operations.bell': 'Campanella',
    'operations.created': 'Creato',
    'operations.updated': 'Aggiornato',
    'operations.detail': 'Dettaglio',
    'operations.check': 'Check',
    'operations.checkIssues': 'Anomalie check',
    'operations.checkCriticalOpen': 'Critico da aprire',
    'operations.lights': 'Luci',
    'operations.tires': 'Gomme',
    'operations.documentsOnBoard': 'Documenti bordo',
    'operations.present': 'Presenti',
    'operations.missing': 'Mancanti',
    'operations.checkCritical': 'Check critici',
    'operations.critical': 'Critiche',
    'operations.criticalCount': 'critiche',
    'operations.detailEmptyTitle': 'Apri una notifica',
    'operations.detailEmptyText': 'Seleziona un guasto o un check per vedere tutti i dettagli.',
    'operations.empty': 'Nessuna notifica in questa vista.',
    'operations.fault': 'Guasto',
    'operations.faults': 'Guasti',
    'operations.inbox': 'Da aprire',
    'operations.markUnread': 'Segna da leggere',
    'operations.open': 'Apri',
    'operations.title': 'Notifiche operative',
    'phone.enable': 'Abilita notifiche',
    'phone.enabled': 'Attive',
    'phone.installed': 'Installata',
    'phone.install': 'Installa app',
    'phone.installHow': 'Come installare',
    'phone.installReady': 'Pronta',
    'phone.needInstall': 'Prima installa',
    'phone.notAvailable': 'Non disponibili',
    'phone.notifications': 'Notifiche telefono',
    'phone.openAsApp': 'Aperta come app',
    'phone.panelTitle': 'App e notifiche',
    'phone.refresh': 'Aggiorna',
    'phone.refreshApp': 'Aggiorna app',
    'phone.refreshBody': 'Ricarica la versione pubblicata.',
    'phone.scope': 'Telefono',
    'phone.toActivate': 'Da attivare',
    'phone.toAdd': 'Da aggiungere',
    'phone.verify': 'Verifica notifiche',
    'reaction.add': 'Aggiungi reazione',
    'reaction.choose': 'Scegli reazione',
    'reaction.company': 'Reazione azienda',
    'reaction.driver': 'Reazione autista',
    'reaction.heart': 'Cuore',
    'reaction.ok': 'OK',
    'reaction.seen': 'Visto',
    'reaction.summary': 'Reazioni al messaggio',
    'reaction.thanks': 'Grazie',
    'urgency.critical': 'Critica',
    'urgency.expired': 'Scaduta',
    'urgency.ok': 'Regolare',
    'urgency.soon': 'In scadenza',
    'urgency.watch': 'Da monitorare',
    'settings.companyData': 'Dati azienda',
    'settings.companyPreview': 'Anteprima',
    'settings.emailAccess': 'Email accesso',
    'settings.headquarters': 'Sede',
    'settings.legalName': 'Ragione sociale',
    'settings.profileOverline': 'Profilo trasportatore',
    'settings.vatNumber': 'Partita IVA',
    'vehicleStatus.active': 'Operativo',
    'vehicleStatus.maintenance': 'In manutenzione',
    'vehicleStatus.watch': 'Da controllare',
  },
  en: {
    'chat.companyTitle': 'Driver chat',
    'chat.companyAria': 'Company driver chat',
    'chat.conversation': 'Conversation',
    'chat.gallery': 'Gallery',
    'chat.messages': 'Messages',
    'chat.noDrivers': 'No drivers',
    'chat.noDriversHint': 'Add a driver before opening a chat.',
    'chat.noMessages': 'No messages',
    'chat.noMessagesYet': 'No messages yet',
    'chat.online': 'Online',
    'chat.firstMessageHint': 'Write the first message to the driver.',
    'chat.createdOnFirstMessage': 'The chat will be created with the first message.',
    'chat.selectDriver': 'Select driver',
    'chat.selectDriverBody': 'Open a chat from the list to read and reply.',
    'chat.writePlaceholder': 'Write a message...',
    'chat.messagePlaceholder': 'Message',
    'chat.photo': 'Photo',
    'chat.photoAttached': 'Photo attached',
    'chat.photoLoading': 'Photo loading...',
    'chat.photoReady': 'Photo ready: {name}',
    'chat.company': 'Company',
    'chat.driver': 'Driver',
    'chat.you': 'You',
    'chat.send': 'Send',
    'chat.sending': 'Sending...',
    'messageStatus.delivered': 'Delivered',
    'messageStatus.read': 'Read',
    'messageStatus.sent': 'Sent',
    'chat.open': 'Open chat',
    'chat.openWithCount': 'Open chat ({count})',
    'chat.emptyDriverHint': 'Write to the company when you need quick communication.',
    'chat.typing': 'Typing...',
    'common.add': 'Add',
    'common.addDocument': 'Add document',
    'common.archive': 'Archive',
    'common.archived': 'Archived',
    'common.back': 'Back',
    'common.cancel': 'Cancel',
    'common.change': 'Change',
    'common.close': 'Close',
    'common.company': 'Company',
    'common.delete': 'Delete',
    'common.driver': 'Driver',
    'common.edit': 'Edit',
    'common.file': 'File',
    'common.loading': 'Loading...',
    'common.notAvailable': 'Not available',
    'common.notInserted': 'Not entered',
    'common.notes': 'Notes',
    'common.open': 'Open',
    'common.photo': 'Photo',
    'common.readyPhoto': 'Photo ready: {name}',
    'common.remove': 'Remove',
    'common.save': 'Save',
    'common.saveChanges': 'Save changes',
    'common.saving': 'Saving...',
    'common.status': 'Status',
    'common.time': 'Time',
    'common.upload': 'Upload',
    'common.vehicle': 'Vehicle',
    'common.vehicleMissing': 'Vehicle not found',
    'common.driverMissing': 'Driver not found',
    'common.trailer': 'Semi-trailer',
    'companyLogo.body': 'Shown next to the company name in the dashboard.',
    'companyLogo.change': 'Change logo',
    'companyLogo.title': 'Company logo',
    'companyLogo.upload': 'Upload logo',
    'deadline.add': 'New deadline',
    'deadline.addFirstHint': 'Add at least one driver or vehicle first.',
    'deadline.advancedFilters': 'Advanced filters',
    'deadline.agenda': 'Operations agenda',
    'deadline.atLeastOneDriver': 'at least one driver',
    'deadline.atLeastOneVehicle': 'at least one vehicle',
    'deadline.boardTitle': 'Document deadlines',
    'deadline.close': 'Close',
    'deadline.days': '{count} days',
    'deadline.daysAgo': '{count} days ago',
    'deadline.driverScope': 'Driver',
    'deadline.dueDate': 'Deadline',
    'deadline.emptyText': 'Upcoming deadlines will appear here.',
    'deadline.emptyTitle': 'No deadlines added',
    'deadline.filterAria': 'Filter deadlines',
    'deadline.inApp': 'In app',
    'deadline.owner': 'Owner',
    'deadline.quickInsert': 'Quick entry',
    'deadline.renew': 'Renewal',
    'deadline.scope': 'Scope',
    'deadline.subject': 'Subject',
    'deadline.type': 'Type',
    'deadline.vehicleScope': 'Vehicle',
    'documents.createOverline': 'New document',
    'documents.document': 'Document',
    'documents.driverPoliceTitle': 'Documents to show to police',
    'documents.expiry': 'Expiry',
    'documents.fileReady': 'File ready: {name}',
    'documents.chooseFileFirst': 'Choose a photo or PDF before saving.',
    'documents.noVisible': 'No visible documents',
    'documents.fileOrLink': 'File or link',
    'documents.filePresent': 'File/link present',
    'documents.fileMissing': 'File to upload',
    'documents.noDocuments': 'No documents entered.',
    'documents.noDriver': 'Driver not assigned',
    'documents.onlyCompany': 'Company only',
    'documents.historyTitle': 'Document history',
    'documents.historyOverline': 'History',
    'documents.historyMovements': 'Document movements',
    'documents.historyEmpty': 'History will appear after the next document movement.',
    'documents.visibleApp': 'visible in app',
    'documents.visibleDriver': 'Visible to driver',
    'documents.visibleInApp': 'Visible in app',
    'documents.withFile': 'with file/link',
    'documents.within30': 'within 30 days',
    'documents.number': 'Document number',
    'documents.numberPlaceholder': 'Number or reference',
    'documents.openOrSave': 'Open/save',
    'documents.removeFile': 'Remove file',
    'documents.save': 'Save document',
    'documents.uploadCamera': 'Take photo',
    'documents.uploadFile': 'Upload photo/PDF',
    'documents.uploading': 'Uploading...',
    'docStatus.uploaded': 'Uploaded',
    'docStatus.verified': 'Verified',
    'docStatus.expired': 'Expired',
    'docStatus.missing': 'Missing',
    'docType.adr': 'ADR training',
    'docType.cqc': 'CQC',
    'docType.driverCard': 'Tachograph card',
    'docType.insurance': 'RCA insurance',
    'docType.licenseC': 'C licence',
    'docType.licenseCE': 'C+E licence',
    'docType.medical': 'Medical check',
    'docType.roadTax': 'Road tax',
    'docType.vehicleInspection': 'Vehicle inspection',
    'driverApp.checkSent': 'Check sent',
    'driverApp.companyMessages': 'Company messages',
    'driverApp.currentKm': 'Current km',
    'driverApp.documentUploaded': 'Document uploaded',
    'driverApp.faultReported': 'Fault reported',
    'driverApp.greeting': 'Good morning',
    'driverApp.messageUnread': '{count} company messages unread',
    'driverApp.messages': '{count} messages',
    'driverApp.none': 'None',
    'driverApp.notesCheck': 'Check notes',
    'driverApp.notesPlaceholder': 'Example: tyre pressure checked',
    'driverApp.morningCheck': 'Morning check',
    'driverApp.noVehicle': 'No selectable vehicle. The company must add at least one van, rigid truck or tractor in Fleet.',
    'driverApp.previewDriver': 'Preview driver',
    'driverApp.uploadDocument': 'Upload document',
    'driverApp.usedVehicle': 'Vehicle used',
    'driverApp.attachedTrailer': 'Attached semi-trailer',
    'driverApp.quickChecks': 'Quick checks',
    'driverApp.lightsOk': 'Lights ok',
    'driverApp.tiresOk': 'Tyres ok',
    'driverApp.documentsBoard': 'On-board documents',
    'driverApp.sendCheck': 'Send check',
    'driverApp.lastCheck': 'Last check: {time}',
    'drivers.addTitle': 'New driver',
    'drivers.archive': 'Archive driver',
    'drivers.authEmail': 'Driver login email',
    'drivers.credentials': 'Credentials',
    'drivers.depot': 'Depot',
    'drivers.edit': 'Edit driver',
    'drivers.name': 'Full name',
    'drivers.password': 'Temporary password',
    'drivers.phone': 'Mobile phone',
    'drivers.photo': 'Profile photo',
    'drivers.role': 'Role',
    'drivers.username': 'Username',
    'fault.description': 'Description',
    'fault.details': 'Details',
    'fault.detailsPlaceholder': 'Describe what is happening',
    'fault.openFaults': '{count} open faults',
    'fault.photo': 'Fault photo',
    'fault.photoRemove': 'Remove photo',
    'fault.photoTake': 'Take photo',
    'fault.titlePlaceholder': 'Example: engine warning light on',
    'fault.report': 'Report fault',
    'fault.reportShort': 'Report',
    'fault.send': 'Send fault',
    'fault.severity': 'Severity',
    'fault.title': 'Fault title',
    'faultStatus.closed': 'Archived',
    'faultStatus.open': 'Unread',
    'faultStatus.seen': 'Unread',
    'faultStatus.in_progress': 'Unread',
    'faultSeverity.high': 'High',
    'faultSeverity.low': 'Low',
    'faultSeverity.medium': 'Medium',
    'faultSeverity.stop_vehicle': 'Stop vehicle',
    'fleet.empty': 'Vans, rigids, tractors and semi-trailers will appear here.',
    'fleet.addToFleet': 'Add to fleet',
    'fleet.archivedHidden': '{count} archived vehicles hidden from the operational list.',
    'fleet.assignedVehicles': 'Assigned vehicles',
    'fleet.category': 'Category',
    'fleet.managementAria': 'Fleet management and entry',
    'fleet.setup': 'Configuration',
    'fleet.setupMissing': 'Configuration to complete',
    'fleet.noFleetTitle': 'No vehicles in fleet',
    'fleet.vehicleActive': 'active vehicles',
    'fleet.model': 'Model',
    'fleet.modelMissing': 'Model not entered',
    'fleet.newVehicle': 'New vehicle',
    'fleet.plate': 'Plate',
    'fleet.title': 'Fleet',
    'fleet.type': 'Fleet type',
    'fleetType.furgone': 'Van',
    'fleetType.furgonePlural': 'Vans',
    'fleetType.motrice': 'Rigid truck',
    'fleetType.motricePlural': 'Rigids',
    'fleetType.trattore': 'Tractor',
    'fleetType.trattorePlural': 'Tractors',
    'fleetType.semirimorchio': 'Semi-trailer',
    'fleetType.semirimorchioPlural': 'Semi-trailers',
    'filter.all': 'All',
    'filter.driver': 'Drivers',
    'filter.medical': 'Medical',
    'filter.month': '30 days',
    'filter.urgent': 'Critical',
    'filter.vehicle': 'Vehicles',
    'form.missingFields': 'Missing: {fields}.',
    'notifications.bellAria': 'Notifications: {count} unread',
    'notifications.companyAria': 'Company notifications',
    'notifications.empty': 'No notifications in this section.',
    'notifications.filterAria': 'Filter notifications',
    'notifications.fullView': 'Full view',
    'operations.archive': 'Archive',
    'operations.archived': 'Archive',
    'operations.archivedCount': 'archived',
    'operations.activeFaults': 'active faults',
    'operations.bell': 'Notifications',
    'operations.created': 'Created',
    'operations.updated': 'Updated',
    'operations.detail': 'Detail',
    'operations.check': 'Check',
    'operations.checkIssues': 'Check issues',
    'operations.checkCriticalOpen': 'Critical to open',
    'operations.lights': 'Lights',
    'operations.tires': 'Tyres',
    'operations.documentsOnBoard': 'On-board documents',
    'operations.present': 'Present',
    'operations.missing': 'Missing',
    'operations.checkCritical': 'Critical checks',
    'operations.critical': 'Critical',
    'operations.criticalCount': 'critical',
    'operations.detailEmptyTitle': 'Open a notification',
    'operations.detailEmptyText': 'Select a fault or check to see all details.',
    'operations.empty': 'No notifications in this view.',
    'operations.fault': 'Fault',
    'operations.faults': 'Faults',
    'operations.inbox': 'To open',
    'operations.markUnread': 'Mark unread',
    'operations.open': 'Open',
    'operations.title': 'Operational notifications',
    'phone.enable': 'Enable notifications',
    'phone.enabled': 'Active',
    'phone.installed': 'Installed',
    'phone.install': 'Install app',
    'phone.installHow': 'How to install',
    'phone.installReady': 'Ready',
    'phone.needInstall': 'Install first',
    'phone.notAvailable': 'Unavailable',
    'phone.notifications': 'Phone notifications',
    'phone.openAsApp': 'Opened as app',
    'phone.panelTitle': 'App and notifications',
    'phone.refresh': 'Refresh',
    'phone.refreshApp': 'Refresh app',
    'phone.refreshBody': 'Reload the published version.',
    'phone.scope': 'Phone',
    'phone.toActivate': 'To activate',
    'phone.toAdd': 'To add',
    'phone.verify': 'Check notifications',
    'reaction.add': 'Add reaction',
    'reaction.choose': 'Choose reaction',
    'reaction.company': 'Company reaction',
    'reaction.driver': 'Driver reaction',
    'reaction.heart': 'Heart',
    'reaction.ok': 'OK',
    'reaction.seen': 'Seen',
    'reaction.summary': 'Message reactions',
    'reaction.thanks': 'Thanks',
    'urgency.critical': 'Critical',
    'urgency.expired': 'Expired',
    'urgency.ok': 'Regular',
    'urgency.soon': 'Expiring soon',
    'urgency.watch': 'Watch',
    'settings.companyData': 'Company data',
    'settings.companyPreview': 'Preview',
    'settings.emailAccess': 'Login email',
    'settings.headquarters': 'Headquarters',
    'settings.legalName': 'Legal name',
    'settings.profileOverline': 'Carrier profile',
    'settings.vatNumber': 'VAT number',
    'vehicleStatus.active': 'Operational',
    'vehicleStatus.maintenance': 'In maintenance',
    'vehicleStatus.watch': 'To check',
  },
  es: {
    'chat.companyTitle': 'Chat conductores',
    'chat.companyAria': 'Chat empresa conductores',
    'chat.conversation': 'Conversacion',
    'chat.gallery': 'Galeria',
    'chat.messages': 'Mensajes',
    'chat.noDrivers': 'Ningun conductor',
    'chat.noDriversHint': 'Añade un conductor antes de abrir una chat.',
    'chat.noMessages': 'Ningun mensaje',
    'chat.noMessagesYet': 'Ningun mensaje aun',
    'chat.firstMessageHint': 'Escribe el primer mensaje al conductor.',
    'chat.createdOnFirstMessage': 'La chat se creara con el primer mensaje.',
    'chat.selectDriver': 'Selecciona conductor',
    'chat.selectDriverBody': 'Abre una chat de la lista para leer y responder.',
    'chat.writePlaceholder': 'Escribe un mensaje...',
    'chat.messagePlaceholder': 'Mensaje',
    'chat.photo': 'Foto',
    'chat.photoAttached': 'Foto adjunta',
    'chat.photoLoading': 'Foto cargando...',
    'chat.photoReady': 'Foto lista: {name}',
    'chat.company': 'Empresa',
    'chat.driver': 'Conductor',
    'chat.you': 'Tu',
    'chat.send': 'Enviar',
    'chat.sending': 'Enviando...',
    'messageStatus.delivered': 'Entregado',
    'messageStatus.read': 'Leido',
    'messageStatus.sent': 'Enviado',
    'chat.open': 'Abrir chat',
    'chat.openWithCount': 'Abrir chat ({count})',
    'chat.emptyDriverHint': 'Escribe a la empresa cuando necesites comunicarte rapido.',
    'common.add': 'Añadir',
    'common.addDocument': 'Añadir documento',
    'common.archive': 'Archivar',
    'common.archived': 'Archivado',
    'common.back': 'Atras',
    'common.cancel': 'Cancelar',
    'common.change': 'Cambiar',
    'common.close': 'Cerrar',
    'common.company': 'Empresa',
    'common.delete': 'Eliminar',
    'common.driver': 'Conductor',
    'common.edit': 'Modificar',
    'common.file': 'Archivo',
    'common.loading': 'Cargando...',
    'common.notAvailable': 'No disponible',
    'common.notInserted': 'No introducido',
    'common.notes': 'Notas',
    'common.open': 'Abrir',
    'common.photo': 'Foto',
    'common.readyPhoto': 'Foto lista: {name}',
    'common.remove': 'Quitar',
    'common.save': 'Guardar',
    'common.saveChanges': 'Guardar cambios',
    'common.saving': 'Guardando...',
    'common.status': 'Estado',
    'common.time': 'Hora',
    'common.upload': 'Subir',
    'common.vehicle': 'Vehiculo',
    'common.vehicleMissing': 'Vehiculo no encontrado',
    'common.driverMissing': 'Conductor no encontrado',
    'common.trailer': 'Semirremolque',
    'companyLogo.body': 'Aparece junto al nombre en el panel.',
    'companyLogo.change': 'Cambiar logo',
    'companyLogo.title': 'Logo empresa',
    'companyLogo.upload': 'Subir logo',
    'deadline.add': 'Nuevo vencimiento',
    'deadline.addFirstHint': 'Añade primero al menos un conductor o vehiculo.',
    'deadline.advancedFilters': 'Filtros avanzados',
    'deadline.agenda': 'Agenda operativa',
    'deadline.atLeastOneDriver': 'al menos un conductor',
    'deadline.atLeastOneVehicle': 'al menos un vehiculo',
    'deadline.boardTitle': 'Vencimientos documentales',
    'deadline.close': 'Cerrar',
    'deadline.days': '{count} dias',
    'deadline.daysAgo': 'hace {count} dias',
    'deadline.driverScope': 'Conductor',
    'deadline.dueDate': 'Vencimiento',
    'deadline.emptyText': 'Los proximos vencimientos apareceran aqui.',
    'deadline.emptyTitle': 'Ningun vencimiento introducido',
    'deadline.filterAria': 'Filtrar vencimientos',
    'deadline.inApp': 'En app',
    'deadline.owner': 'Responsable',
    'deadline.quickInsert': 'Alta rapida',
    'deadline.renew': 'Renovacion',
    'deadline.scope': 'Ambito',
    'deadline.subject': 'Sujeto',
    'deadline.type': 'Tipo',
    'deadline.vehicleScope': 'Vehiculo',
    'documents.createOverline': 'Nuevo documento',
    'documents.document': 'Documento',
    'documents.driverPoliceTitle': 'Documentos para mostrar a la policia',
    'documents.expiry': 'Vencimiento',
    'documents.fileReady': 'Archivo listo: {name}',
    'documents.chooseFileFirst': 'Elige una foto o PDF antes de guardar.',
    'documents.noVisible': 'Ningun documento visible',
    'documents.fileOrLink': 'Archivo o enlace',
    'documents.filePresent': 'Archivo/enlace presente',
    'documents.fileMissing': 'Archivo por subir',
    'documents.noDocuments': 'Ningun documento introducido.',
    'documents.noDriver': 'Conductor no asignado',
    'documents.onlyCompany': 'Solo empresa',
    'documents.historyTitle': 'Historial documentos',
    'documents.historyOverline': 'Historial',
    'documents.historyMovements': 'Movimientos documentos',
    'documents.historyEmpty': 'El historial aparecera en el proximo movimiento de documento.',
    'documents.visibleApp': 'visibles en app',
    'documents.visibleDriver': 'Visible al conductor',
    'documents.visibleInApp': 'Visible en app',
    'documents.withFile': 'con archivo/enlace',
    'documents.within30': 'en 30 dias',
    'documents.number': 'Numero documento',
    'documents.numberPlaceholder': 'Numero o referencia',
    'documents.openOrSave': 'Abrir/guardar',
    'documents.removeFile': 'Eliminar archivo',
    'documents.save': 'Guardar documento',
    'documents.uploadCamera': 'Hacer foto',
    'documents.uploadFile': 'Subir foto/PDF',
    'documents.uploading': 'Cargando...',
    'docStatus.uploaded': 'Cargado',
    'docStatus.verified': 'Verificado',
    'docStatus.expired': 'Caducado',
    'docStatus.missing': 'Faltante',
    'docType.adr': 'Formacion ADR',
    'docType.cqc': 'CQC',
    'docType.driverCard': 'Tarjeta tacografo',
    'docType.insurance': 'Seguro RCA',
    'docType.licenseC': 'Permiso C',
    'docType.licenseCE': 'Permiso C+E',
    'docType.medical': 'Revision medica',
    'docType.roadTax': 'Impuesto circulacion',
    'docType.vehicleInspection': 'Inspeccion vehiculo',
    'driverApp.checkSent': 'Check enviado',
    'driverApp.companyMessages': 'Mensajes empresa',
    'driverApp.currentKm': 'Km actuales',
    'driverApp.documentUploaded': 'Documento cargado',
    'driverApp.faultReported': 'Averia comunicada',
    'driverApp.greeting': 'Buenos dias',
    'driverApp.messageUnread': '{count} mensajes empresa por leer',
    'driverApp.messages': '{count} mensajes',
    'driverApp.none': 'Ninguno',
    'driverApp.notesCheck': 'Notas check',
    'driverApp.notesPlaceholder': 'Ej. presion neumaticos revisada',
    'driverApp.morningCheck': 'Check matinal',
    'driverApp.noVehicle': 'No hay vehiculos seleccionables. La empresa debe añadir al menos una furgoneta, rigido o tractora en Flota.',
    'driverApp.previewDriver': 'Conductor en vista previa',
    'driverApp.uploadDocument': 'Subir documento',
    'driverApp.usedVehicle': 'Vehiculo usado',
    'driverApp.attachedTrailer': 'Semirremolque enganchado',
    'driverApp.quickChecks': 'Controles rapidos',
    'driverApp.lightsOk': 'Luces ok',
    'driverApp.tiresOk': 'Neumaticos ok',
    'driverApp.documentsBoard': 'Documentos a bordo',
    'driverApp.sendCheck': 'Enviar check',
    'driverApp.lastCheck': 'Ultimo check: {time}',
    'drivers.addTitle': 'Nuevo conductor',
    'drivers.archive': 'Archivar conductor',
    'drivers.authEmail': 'Email acceso conductor',
    'drivers.credentials': 'Credenciales',
    'drivers.depot': 'Base',
    'drivers.edit': 'Modificar conductor',
    'drivers.name': 'Nombre completo',
    'drivers.password': 'Contraseña temporal',
    'drivers.phone': 'Movil',
    'drivers.photo': 'Foto perfil',
    'drivers.role': 'Rol',
    'drivers.username': 'Usuario',
    'fault.description': 'Descripcion',
    'fault.details': 'Detalles',
    'fault.detailsPlaceholder': 'Describe lo que ocurre',
    'fault.openFaults': '{count} averias abiertas',
    'fault.photo': 'Foto averia',
    'fault.photoRemove': 'Quitar foto',
    'fault.photoTake': 'Hacer foto',
    'fault.titlePlaceholder': 'Ej. testigo motor encendido',
    'fault.report': 'Comunicar averia',
    'fault.reportShort': 'Comunicar',
    'fault.send': 'Enviar averia',
    'fault.severity': 'Gravedad',
    'fault.title': 'Titulo averia',
    'faultStatus.closed': 'Archivado',
    'faultStatus.open': 'No leido',
    'faultStatus.seen': 'No leido',
    'faultStatus.in_progress': 'No leido',
    'faultSeverity.high': 'Alta',
    'faultSeverity.low': 'Baja',
    'faultSeverity.medium': 'Media',
    'faultSeverity.stop_vehicle': 'Vehiculo parado',
    'fleet.empty': 'Furgones, rigidos, tractoras y semirremolques apareceran aqui.',
    'fleet.addToFleet': 'Añadir a la flota',
    'fleet.archivedHidden': '{count} vehiculos archivados ocultos de la lista operativa.',
    'fleet.assignedVehicles': 'Vehiculos asignados',
    'fleet.category': 'Categoria',
    'fleet.managementAria': 'Gestion flota y alta rapida',
    'fleet.setup': 'Configuracion',
    'fleet.setupMissing': 'Configuracion por completar',
    'fleet.noFleetTitle': 'Ningun vehiculo en flota',
    'fleet.vehicleActive': 'vehiculos activos',
    'fleet.model': 'Modelo',
    'fleet.modelMissing': 'Modelo no introducido',
    'fleet.newVehicle': 'Nuevo vehiculo',
    'fleet.plate': 'Matricula',
    'fleet.title': 'Flota',
    'fleet.type': 'Tipo flota',
    'fleetType.furgone': 'Furgoneta',
    'fleetType.furgonePlural': 'Furgonetas',
    'fleetType.motrice': 'Rigido',
    'fleetType.motricePlural': 'Rigidos',
    'fleetType.trattore': 'Tractora',
    'fleetType.trattorePlural': 'Tractoras',
    'fleetType.semirimorchio': 'Semirremolque',
    'fleetType.semirimorchioPlural': 'Semirremolques',
    'filter.all': 'Todas',
    'filter.driver': 'Conductores',
    'filter.medical': 'Medicas',
    'filter.month': '30 dias',
    'filter.urgent': 'Criticas',
    'filter.vehicle': 'Vehiculos',
    'form.missingFields': 'Faltan: {fields}.',
    'notifications.bellAria': 'Avisos: {count} por leer',
    'notifications.companyAria': 'Avisos empresa',
    'notifications.empty': 'Ningun aviso en esta seccion.',
    'notifications.filterAria': 'Filtrar avisos',
    'notifications.fullView': 'Vista completa',
    'operations.archive': 'Archivar',
    'operations.archived': 'Archivo',
    'operations.archivedCount': 'archivadas',
    'operations.activeFaults': 'averias activas',
    'operations.bell': 'Campana',
    'operations.created': 'Creado',
    'operations.updated': 'Actualizado',
    'operations.detail': 'Detalle',
    'operations.check': 'Check',
    'operations.checkIssues': 'Anomalias check',
    'operations.checkCriticalOpen': 'Critico por abrir',
    'operations.lights': 'Luces',
    'operations.tires': 'Neumaticos',
    'operations.documentsOnBoard': 'Documentos a bordo',
    'operations.present': 'Presentes',
    'operations.missing': 'Faltan',
    'operations.checkCritical': 'Checks criticos',
    'operations.critical': 'Criticas',
    'operations.criticalCount': 'criticas',
    'operations.detailEmptyTitle': 'Abre una notificacion',
    'operations.detailEmptyText': 'Selecciona una averia o un check para ver todos los detalles.',
    'operations.empty': 'Ninguna notificacion en esta vista.',
    'operations.fault': 'Averia',
    'operations.faults': 'Averias',
    'operations.inbox': 'Por abrir',
    'operations.markUnread': 'Marcar no leida',
    'operations.open': 'Abrir',
    'operations.title': 'Notificaciones operativas',
    'phone.enable': 'Activar notificaciones',
    'phone.enabled': 'Activas',
    'phone.installed': 'Instalada',
    'phone.install': 'Instalar app',
    'phone.installHow': 'Como instalar',
    'phone.installReady': 'Lista',
    'phone.needInstall': 'Primero instala',
    'phone.notAvailable': 'No disponibles',
    'phone.notifications': 'Notificaciones telefono',
    'phone.openAsApp': 'Abierta como app',
    'phone.panelTitle': 'App y notificaciones',
    'phone.refresh': 'Actualizar',
    'phone.refreshApp': 'Actualizar app',
    'phone.refreshBody': 'Recarga la version publicada.',
    'phone.scope': 'Telefono',
    'phone.toActivate': 'Por activar',
    'phone.toAdd': 'Por añadir',
    'phone.verify': 'Verificar notificaciones',
    'reaction.add': 'Añadir reaccion',
    'reaction.choose': 'Elegir reaccion',
    'reaction.company': 'Reaccion empresa',
    'reaction.driver': 'Reaccion conductor',
    'reaction.heart': 'Corazon',
    'reaction.ok': 'OK',
    'reaction.seen': 'Visto',
    'reaction.summary': 'Reacciones al mensaje',
    'reaction.thanks': 'Gracias',
    'urgency.critical': 'Critica',
    'urgency.expired': 'Caducada',
    'urgency.ok': 'Regular',
    'urgency.soon': 'Por vencer',
    'urgency.watch': 'A vigilar',
    'settings.companyData': 'Datos empresa',
    'settings.companyPreview': 'Vista previa',
    'settings.emailAccess': 'Email acceso',
    'settings.headquarters': 'Sede',
    'settings.legalName': 'Razon social',
    'settings.profileOverline': 'Perfil transportista',
    'settings.vatNumber': 'NIF/CIF',
    'vehicleStatus.active': 'Operativo',
    'vehicleStatus.maintenance': 'En mantenimiento',
    'vehicleStatus.watch': 'Por controlar',
  },
  fr: {
    'chat.companyTitle': 'Chat chauffeurs',
    'chat.companyAria': 'Chat entreprise chauffeurs',
    'chat.conversation': 'Conversation',
    'chat.gallery': 'Galerie',
    'chat.messages': 'Messages',
    'chat.noDrivers': 'Aucun chauffeur',
    'chat.noDriversHint': 'Ajoute un chauffeur avant d ouvrir une chat.',
    'chat.noMessages': 'Aucun message',
    'chat.noMessagesYet': 'Aucun message encore',
    'chat.firstMessageHint': 'Ecris le premier message au chauffeur.',
    'chat.createdOnFirstMessage': 'La chat sera creee au premier message.',
    'chat.selectDriver': 'Selectionner chauffeur',
    'chat.selectDriverBody': 'Ouvre une chat depuis la liste pour lire et repondre.',
    'chat.writePlaceholder': 'Ecrire un message...',
    'chat.messagePlaceholder': 'Message',
    'chat.photo': 'Photo',
    'chat.photoAttached': 'Photo jointe',
    'chat.photoLoading': 'Photo en chargement...',
    'chat.photoReady': 'Photo prete : {name}',
    'chat.company': 'Entreprise',
    'chat.driver': 'Chauffeur',
    'chat.you': 'Toi',
    'chat.send': 'Envoyer',
    'chat.sending': 'Envoi...',
    'messageStatus.delivered': 'Livre',
    'messageStatus.read': 'Lu',
    'messageStatus.sent': 'Envoye',
    'chat.open': 'Ouvrir chat',
    'chat.openWithCount': 'Ouvrir chat ({count})',
    'chat.emptyDriverHint': 'Ecris a l entreprise quand tu dois communiquer rapidement.',
    'common.add': 'Ajouter',
    'common.addDocument': 'Ajouter document',
    'common.archive': 'Archiver',
    'common.archived': 'Archive',
    'common.back': 'Retour',
    'common.cancel': 'Annuler',
    'common.change': 'Changer',
    'common.close': 'Fermer',
    'common.company': 'Entreprise',
    'common.delete': 'Supprimer',
    'common.driver': 'Chauffeur',
    'common.edit': 'Modifier',
    'common.file': 'Fichier',
    'common.loading': 'Chargement...',
    'common.notAvailable': 'Non disponible',
    'common.notInserted': 'Non renseigne',
    'common.notes': 'Notes',
    'common.open': 'Ouvrir',
    'common.photo': 'Photo',
    'common.readyPhoto': 'Photo prete : {name}',
    'common.remove': 'Retirer',
    'common.save': 'Enregistrer',
    'common.saveChanges': 'Enregistrer',
    'common.saving': 'Enregistrement...',
    'common.status': 'Statut',
    'common.time': 'Heure',
    'common.upload': 'Charger',
    'common.vehicle': 'Vehicule',
    'common.vehicleMissing': 'Vehicule introuvable',
    'common.driverMissing': 'Chauffeur introuvable',
    'common.trailer': 'Semi-remorque',
    'companyLogo.body': 'Apparait pres du nom dans le tableau.',
    'companyLogo.change': 'Changer logo',
    'companyLogo.title': 'Logo entreprise',
    'companyLogo.upload': 'Charger logo',
    'deadline.add': 'Nouvelle echeance',
    'deadline.addFirstHint': 'Ajoute d abord au moins un chauffeur ou un vehicule.',
    'deadline.advancedFilters': 'Filtres avances',
    'deadline.agenda': 'Agenda operationnel',
    'deadline.atLeastOneDriver': 'au moins un chauffeur',
    'deadline.atLeastOneVehicle': 'au moins un vehicule',
    'deadline.boardTitle': 'Echeances documents',
    'deadline.close': 'Fermer',
    'deadline.days': '{count} jours',
    'deadline.daysAgo': 'il y a {count} jours',
    'deadline.driverScope': 'Chauffeur',
    'deadline.dueDate': 'Echeance',
    'deadline.emptyText': 'Les prochaines echeances apparaitront ici.',
    'deadline.emptyTitle': 'Aucune echeance saisie',
    'deadline.filterAria': 'Filtrer echeances',
    'deadline.inApp': 'Dans app',
    'deadline.owner': 'Responsable',
    'deadline.quickInsert': 'Saisie rapide',
    'deadline.renew': 'Renouvellement',
    'deadline.scope': 'Perimetre',
    'deadline.subject': 'Sujet',
    'deadline.type': 'Type',
    'deadline.vehicleScope': 'Vehicule',
    'documents.createOverline': 'Nouveau document',
    'documents.document': 'Document',
    'documents.driverPoliceTitle': 'Documents a montrer a la police',
    'documents.expiry': 'Echeance',
    'documents.fileReady': 'Fichier pret : {name}',
    'documents.chooseFileFirst': 'Choisis une photo ou un PDF avant d enregistrer.',
    'documents.noVisible': 'Aucun document visible',
    'documents.fileOrLink': 'Fichier ou lien',
    'documents.filePresent': 'Fichier/lien present',
    'documents.fileMissing': 'Fichier a charger',
    'documents.noDocuments': 'Aucun document saisi.',
    'documents.noDriver': 'Chauffeur non assigne',
    'documents.onlyCompany': 'Entreprise seulement',
    'documents.historyTitle': 'Historique documents',
    'documents.historyOverline': 'Historique',
    'documents.historyMovements': 'Mouvements documents',
    'documents.historyEmpty': 'L historique apparaitra au prochain mouvement de document.',
    'documents.visibleApp': 'visibles dans app',
    'documents.visibleDriver': 'Visible au chauffeur',
    'documents.visibleInApp': 'Visible dans app',
    'documents.withFile': 'avec fichier/lien',
    'documents.within30': 'sous 30 jours',
    'documents.number': 'Numero document',
    'documents.numberPlaceholder': 'Numero ou reference',
    'documents.openOrSave': 'Ouvrir/enregistrer',
    'documents.removeFile': 'Supprimer fichier',
    'documents.save': 'Enregistrer document',
    'documents.uploadCamera': 'Prendre photo',
    'documents.uploadFile': 'Charger photo/PDF',
    'documents.uploading': 'Chargement...',
    'docStatus.uploaded': 'Charge',
    'docStatus.verified': 'Verifie',
    'docStatus.expired': 'Expire',
    'docStatus.missing': 'Manquant',
    'docType.adr': 'Formation ADR',
    'docType.cqc': 'CQC',
    'docType.driverCard': 'Carte tachygraphe',
    'docType.insurance': 'Assurance RCA',
    'docType.licenseC': 'Permis C',
    'docType.licenseCE': 'Permis C+E',
    'docType.medical': 'Visite medicale',
    'docType.roadTax': 'Taxe vehicule',
    'docType.vehicleInspection': 'Controle vehicule',
    'driverApp.checkSent': 'Check envoye',
    'driverApp.companyMessages': 'Messages entreprise',
    'driverApp.currentKm': 'Km actuels',
    'driverApp.documentUploaded': 'Document charge',
    'driverApp.faultReported': 'Panne signalee',
    'driverApp.greeting': 'Bonjour',
    'driverApp.messageUnread': '{count} messages entreprise a lire',
    'driverApp.messages': '{count} messages',
    'driverApp.none': 'Aucun',
    'driverApp.notesCheck': 'Notes check',
    'driverApp.notesPlaceholder': 'Ex. pression pneus controlee',
    'driverApp.morningCheck': 'Check du matin',
    'driverApp.noVehicle': 'Aucun vehicule selectionnable. L entreprise doit ajouter au moins un fourgon, porteur ou tracteur dans Flotte.',
    'driverApp.previewDriver': 'Chauffeur en apercu',
    'driverApp.uploadDocument': 'Charger document',
    'driverApp.usedVehicle': 'Vehicule utilise',
    'driverApp.attachedTrailer': 'Semi-remorque accrochee',
    'driverApp.quickChecks': 'Controles rapides',
    'driverApp.lightsOk': 'Feux ok',
    'driverApp.tiresOk': 'Pneus ok',
    'driverApp.documentsBoard': 'Documents de bord',
    'driverApp.sendCheck': 'Envoyer check',
    'driverApp.lastCheck': 'Dernier check : {time}',
    'drivers.addTitle': 'Nouveau chauffeur',
    'drivers.archive': 'Archiver chauffeur',
    'drivers.authEmail': 'Email acces chauffeur',
    'drivers.credentials': 'Identifiants',
    'drivers.depot': 'Depot',
    'drivers.edit': 'Modifier chauffeur',
    'drivers.name': 'Nom complet',
    'drivers.password': 'Mot de passe temporaire',
    'drivers.phone': 'Telephone mobile',
    'drivers.photo': 'Photo profil',
    'drivers.role': 'Role',
    'drivers.username': 'Nom utilisateur',
    'fault.description': 'Description',
    'fault.details': 'Details',
    'fault.detailsPlaceholder': 'Decris ce qui se passe',
    'fault.openFaults': '{count} pannes ouvertes',
    'fault.photo': 'Photo panne',
    'fault.photoRemove': 'Retirer photo',
    'fault.photoTake': 'Prendre photo',
    'fault.titlePlaceholder': 'Ex. voyant moteur allume',
    'fault.report': 'Signaler panne',
    'fault.reportShort': 'Signaler',
    'fault.send': 'Envoyer panne',
    'fault.severity': 'Gravite',
    'fault.title': 'Titre panne',
    'faultStatus.closed': 'Archive',
    'faultStatus.open': 'Non lu',
    'faultStatus.seen': 'Non lu',
    'faultStatus.in_progress': 'Non lu',
    'faultSeverity.high': 'Haute',
    'faultSeverity.low': 'Basse',
    'faultSeverity.medium': 'Moyenne',
    'faultSeverity.stop_vehicle': 'Vehicule bloque',
    'fleet.empty': 'Fourgons, porteurs, tracteurs et semi-remorques apparaitront ici.',
    'fleet.addToFleet': 'Ajouter a la flotte',
    'fleet.archivedHidden': '{count} vehicules archives caches de la liste operationnelle.',
    'fleet.assignedVehicles': 'Vehicules assignes',
    'fleet.category': 'Categorie',
    'fleet.managementAria': 'Gestion flotte et saisie',
    'fleet.setup': 'Configuration',
    'fleet.setupMissing': 'Configuration a completer',
    'fleet.noFleetTitle': 'Aucun vehicule en flotte',
    'fleet.vehicleActive': 'vehicules actifs',
    'fleet.model': 'Modele',
    'fleet.modelMissing': 'Modele non renseigne',
    'fleet.newVehicle': 'Nouveau vehicule',
    'fleet.plate': 'Plaque',
    'fleet.title': 'Flotte',
    'fleet.type': 'Type flotte',
    'fleetType.furgone': 'Fourgon',
    'fleetType.furgonePlural': 'Fourgons',
    'fleetType.motrice': 'Porteur',
    'fleetType.motricePlural': 'Porteurs',
    'fleetType.trattore': 'Tracteur',
    'fleetType.trattorePlural': 'Tracteurs',
    'fleetType.semirimorchio': 'Semi-remorque',
    'fleetType.semirimorchioPlural': 'Semi-remorques',
    'filter.all': 'Toutes',
    'filter.driver': 'Chauffeurs',
    'filter.medical': 'Medicales',
    'filter.month': '30 jours',
    'filter.urgent': 'Critiques',
    'filter.vehicle': 'Vehicules',
    'form.missingFields': 'Manquent : {fields}.',
    'notifications.bellAria': 'Alertes : {count} a lire',
    'notifications.companyAria': 'Alertes entreprise',
    'notifications.empty': 'Aucune alerte dans cette section.',
    'notifications.filterAria': 'Filtrer alertes',
    'notifications.fullView': 'Vue complete',
    'operations.archive': 'Archiver',
    'operations.archived': 'Archive',
    'operations.archivedCount': 'archivees',
    'operations.activeFaults': 'pannes actives',
    'operations.bell': 'Cloche',
    'operations.created': 'Cree',
    'operations.updated': 'Mis a jour',
    'operations.detail': 'Detail',
    'operations.check': 'Check',
    'operations.checkIssues': 'Anomalies check',
    'operations.checkCriticalOpen': 'Critique a ouvrir',
    'operations.lights': 'Feux',
    'operations.tires': 'Pneus',
    'operations.documentsOnBoard': 'Documents de bord',
    'operations.present': 'Presents',
    'operations.missing': 'Manquants',
    'operations.checkCritical': 'Checks critiques',
    'operations.critical': 'Critiques',
    'operations.criticalCount': 'critiques',
    'operations.detailEmptyTitle': 'Ouvre une notification',
    'operations.detailEmptyText': 'Selectionne une panne ou un check pour voir tous les details.',
    'operations.empty': 'Aucune notification dans cette vue.',
    'operations.fault': 'Panne',
    'operations.faults': 'Pannes',
    'operations.inbox': 'A ouvrir',
    'operations.markUnread': 'Marquer non lu',
    'operations.open': 'Ouvrir',
    'operations.title': 'Notifications operationnelles',
    'phone.enable': 'Activer notifications',
    'phone.enabled': 'Actives',
    'phone.installed': 'Installee',
    'phone.install': 'Installer app',
    'phone.installHow': 'Comment installer',
    'phone.installReady': 'Prete',
    'phone.needInstall': 'Installer d abord',
    'phone.notAvailable': 'Non disponibles',
    'phone.notifications': 'Notifications telephone',
    'phone.openAsApp': 'Ouverte comme app',
    'phone.panelTitle': 'App et notifications',
    'phone.refresh': 'Actualiser',
    'phone.refreshApp': 'Actualiser app',
    'phone.refreshBody': 'Recharge la version publiee.',
    'phone.scope': 'Telephone',
    'phone.toActivate': 'A activer',
    'phone.toAdd': 'A ajouter',
    'phone.verify': 'Verifier notifications',
    'reaction.add': 'Ajouter reaction',
    'reaction.choose': 'Choisir reaction',
    'reaction.company': 'Reaction entreprise',
    'reaction.driver': 'Reaction chauffeur',
    'reaction.heart': 'Coeur',
    'reaction.ok': 'OK',
    'reaction.seen': 'Vu',
    'reaction.summary': 'Reactions au message',
    'reaction.thanks': 'Merci',
    'urgency.critical': 'Critique',
    'urgency.expired': 'Expiree',
    'urgency.ok': 'Reguliere',
    'urgency.soon': 'Bientot expiree',
    'urgency.watch': 'A surveiller',
    'settings.companyData': 'Donnees entreprise',
    'settings.companyPreview': 'Apercu',
    'settings.emailAccess': 'Email acces',
    'settings.headquarters': 'Siege',
    'settings.legalName': 'Raison sociale',
    'settings.profileOverline': 'Profil transporteur',
    'settings.vatNumber': 'TVA',
    'vehicleStatus.active': 'Operationnel',
    'vehicleStatus.maintenance': 'En maintenance',
    'vehicleStatus.watch': 'A controler',
  },
  de: {
    'chat.companyTitle': 'Fahrerchat',
    'chat.companyAria': 'Firmenchat mit Fahrern',
    'chat.conversation': 'Unterhaltung',
    'chat.gallery': 'Galerie',
    'chat.messages': 'Nachrichten',
    'chat.noDrivers': 'Keine Fahrer',
    'chat.noDriversHint': 'Fahrer hinzufugen, bevor ein Chat geoffnet wird.',
    'chat.noMessages': 'Keine Nachrichten',
    'chat.noMessagesYet': 'Noch keine Nachrichten',
    'chat.firstMessageHint': 'Schreibe die erste Nachricht an den Fahrer.',
    'chat.createdOnFirstMessage': 'Der Chat wird mit der ersten Nachricht erstellt.',
    'chat.selectDriver': 'Fahrer auswahlen',
    'chat.selectDriverBody': 'Chat aus der Liste offnen, um zu lesen und zu antworten.',
    'chat.writePlaceholder': 'Nachricht schreiben...',
    'chat.messagePlaceholder': 'Nachricht',
    'chat.photo': 'Foto',
    'chat.photoAttached': 'Foto angehangt',
    'chat.photoLoading': 'Foto wird geladen...',
    'chat.photoReady': 'Foto bereit: {name}',
    'chat.company': 'Firma',
    'chat.driver': 'Fahrer',
    'chat.you': 'Du',
    'chat.send': 'Senden',
    'chat.sending': 'Senden...',
    'messageStatus.delivered': 'Zugestellt',
    'messageStatus.read': 'Gelesen',
    'messageStatus.sent': 'Gesendet',
    'chat.open': 'Chat offnen',
    'chat.openWithCount': 'Chat offnen ({count})',
    'chat.emptyDriverHint': 'Schreibe der Firma, wenn du schnell kommunizieren musst.',
    'common.add': 'Hinzufugen',
    'common.addDocument': 'Dokument hinzufugen',
    'common.archive': 'Archivieren',
    'common.archived': 'Archiviert',
    'common.back': 'Zuruck',
    'common.cancel': 'Abbrechen',
    'common.change': 'Andern',
    'common.close': 'Schliessen',
    'common.company': 'Firma',
    'common.delete': 'Loschen',
    'common.driver': 'Fahrer',
    'common.edit': 'Bearbeiten',
    'common.file': 'Datei',
    'common.loading': 'Laden...',
    'common.notAvailable': 'Nicht verfugbar',
    'common.notInserted': 'Nicht eingetragen',
    'common.notes': 'Notizen',
    'common.open': 'Offnen',
    'common.photo': 'Foto',
    'common.readyPhoto': 'Foto bereit: {name}',
    'common.remove': 'Entfernen',
    'common.save': 'Speichern',
    'common.saveChanges': 'Anderungen speichern',
    'common.saving': 'Speichern...',
    'common.status': 'Status',
    'common.time': 'Uhrzeit',
    'common.upload': 'Hochladen',
    'common.vehicle': 'Fahrzeug',
    'common.vehicleMissing': 'Fahrzeug nicht gefunden',
    'common.driverMissing': 'Fahrer nicht gefunden',
    'common.trailer': 'Auflieger',
    'companyLogo.body': 'Wird neben dem Firmennamen im Dashboard angezeigt.',
    'companyLogo.change': 'Logo andern',
    'companyLogo.title': 'Firmenlogo',
    'companyLogo.upload': 'Logo hochladen',
    'deadline.add': 'Neue Frist',
    'deadline.addFirstHint': 'Zuerst mindestens einen Fahrer oder ein Fahrzeug hinzufugen.',
    'deadline.advancedFilters': 'Erweiterte Filter',
    'deadline.agenda': 'Operativer Plan',
    'deadline.atLeastOneDriver': 'mindestens ein Fahrer',
    'deadline.atLeastOneVehicle': 'mindestens ein Fahrzeug',
    'deadline.boardTitle': 'Dokumentenfristen',
    'deadline.close': 'Schliessen',
    'deadline.days': '{count} Tage',
    'deadline.daysAgo': 'vor {count} Tagen',
    'deadline.driverScope': 'Fahrer',
    'deadline.dueDate': 'Frist',
    'deadline.emptyText': 'Die nachsten Fristen erscheinen hier.',
    'deadline.emptyTitle': 'Keine Frist eingetragen',
    'deadline.filterAria': 'Fristen filtern',
    'deadline.inApp': 'In App',
    'deadline.owner': 'Verantwortlich',
    'deadline.quickInsert': 'Schnelleingabe',
    'deadline.renew': 'Verlangerung',
    'deadline.scope': 'Bereich',
    'deadline.subject': 'Betreff',
    'deadline.type': 'Typ',
    'deadline.vehicleScope': 'Fahrzeug',
    'documents.createOverline': 'Neues Dokument',
    'documents.document': 'Dokument',
    'documents.driverPoliceTitle': 'Dokumente fur Polizeikontrolle',
    'documents.expiry': 'Ablauf',
    'documents.fileReady': 'Datei bereit: {name}',
    'documents.chooseFileFirst': 'Foto oder PDF vor dem Speichern auswahlen.',
    'documents.noVisible': 'Keine sichtbaren Dokumente',
    'documents.fileOrLink': 'Datei oder Link',
    'documents.filePresent': 'Datei/Link vorhanden',
    'documents.fileMissing': 'Datei hochladen',
    'documents.noDocuments': 'Keine Dokumente eingetragen.',
    'documents.noDriver': 'Fahrer nicht zugewiesen',
    'documents.onlyCompany': 'Nur Firma',
    'documents.historyTitle': 'Dokumentenverlauf',
    'documents.historyOverline': 'Verlauf',
    'documents.historyMovements': 'Dokumentbewegungen',
    'documents.historyEmpty': 'Der Verlauf erscheint bei der nachsten Dokumentbewegung.',
    'documents.visibleApp': 'in App sichtbar',
    'documents.visibleDriver': 'Fur Fahrer sichtbar',
    'documents.visibleInApp': 'In App sichtbar',
    'documents.withFile': 'mit Datei/Link',
    'documents.within30': 'innerhalb 30 Tagen',
    'documents.number': 'Dokumentnummer',
    'documents.numberPlaceholder': 'Nummer oder Referenz',
    'documents.openOrSave': 'Offnen/speichern',
    'documents.removeFile': 'Datei entfernen',
    'documents.save': 'Dokument speichern',
    'documents.uploadCamera': 'Foto aufnehmen',
    'documents.uploadFile': 'Foto/PDF hochladen',
    'documents.uploading': 'Hochladen...',
    'docStatus.uploaded': 'Hochgeladen',
    'docStatus.verified': 'Gepruft',
    'docStatus.expired': 'Abgelaufen',
    'docStatus.missing': 'Fehlt',
    'docType.adr': 'ADR-Schulung',
    'docType.cqc': 'CQC',
    'docType.driverCard': 'Fahrerkarte',
    'docType.insurance': 'RCA-Versicherung',
    'docType.licenseC': 'Fuhrerschein C',
    'docType.licenseCE': 'Fuhrerschein C+E',
    'docType.medical': 'Medizinischer Check',
    'docType.roadTax': 'Kfz-Steuer',
    'docType.vehicleInspection': 'Fahrzeugprufung',
    'driverApp.checkSent': 'Check gesendet',
    'driverApp.companyMessages': 'Firmennachrichten',
    'driverApp.currentKm': 'Aktuelle km',
    'driverApp.documentUploaded': 'Dokument hochgeladen',
    'driverApp.faultReported': 'Schaden gemeldet',
    'driverApp.greeting': 'Guten Morgen',
    'driverApp.messageUnread': '{count} Firmennachrichten ungelesen',
    'driverApp.messages': '{count} Nachrichten',
    'driverApp.none': 'Keiner',
    'driverApp.notesCheck': 'Check-Notizen',
    'driverApp.notesPlaceholder': 'z. B. Reifendruck gepruft',
    'driverApp.morningCheck': 'Morgencheck',
    'driverApp.noVehicle': 'Kein Fahrzeug auswählbar. Die Firma muss in Flotte mindestens Transporter, Lkw oder Sattelzugmaschine anlegen.',
    'driverApp.previewDriver': 'Fahrer Vorschau',
    'driverApp.uploadDocument': 'Dokument hochladen',
    'driverApp.usedVehicle': 'Benutztes Fahrzeug',
    'driverApp.attachedTrailer': 'Angekoppelter Auflieger',
    'driverApp.quickChecks': 'Schnellchecks',
    'driverApp.lightsOk': 'Lichter ok',
    'driverApp.tiresOk': 'Reifen ok',
    'driverApp.documentsBoard': 'Borddokumente',
    'driverApp.sendCheck': 'Check senden',
    'driverApp.lastCheck': 'Letzter Check: {time}',
    'drivers.addTitle': 'Neuer Fahrer',
    'drivers.archive': 'Fahrer archivieren',
    'drivers.authEmail': 'Fahrer Login-E-Mail',
    'drivers.credentials': 'Zugangsdaten',
    'drivers.depot': 'Depot',
    'drivers.edit': 'Fahrer bearbeiten',
    'drivers.name': 'Vollstandiger Name',
    'drivers.password': 'Temporäres Passwort',
    'drivers.phone': 'Mobiltelefon',
    'drivers.photo': 'Profilfoto',
    'drivers.role': 'Rolle',
    'drivers.username': 'Benutzername',
    'fault.description': 'Beschreibung',
    'fault.details': 'Details',
    'fault.detailsPlaceholder': 'Beschreibe, was passiert',
    'fault.openFaults': '{count} offene Schaden',
    'fault.photo': 'Schadenfoto',
    'fault.photoRemove': 'Foto entfernen',
    'fault.photoTake': 'Foto aufnehmen',
    'fault.titlePlaceholder': 'z. B. Motorwarnleuchte an',
    'fault.report': 'Schaden melden',
    'fault.reportShort': 'Melden',
    'fault.send': 'Schaden senden',
    'fault.severity': 'Schweregrad',
    'fault.title': 'Schadentitel',
    'faultStatus.closed': 'Archiviert',
    'faultStatus.open': 'Ungelesen',
    'faultStatus.seen': 'Ungelesen',
    'faultStatus.in_progress': 'Ungelesen',
    'faultSeverity.high': 'Hoch',
    'faultSeverity.low': 'Niedrig',
    'faultSeverity.medium': 'Mittel',
    'faultSeverity.stop_vehicle': 'Fahrzeug stoppen',
    'fleet.empty': 'Transporter, Lkw, Sattelzugmaschinen und Auflieger erscheinen hier.',
    'fleet.addToFleet': 'Zur Flotte hinzufugen',
    'fleet.archivedHidden': '{count} archivierte Fahrzeuge in der operativen Liste ausgeblendet.',
    'fleet.assignedVehicles': 'Zugewiesene Fahrzeuge',
    'fleet.category': 'Kategorie',
    'fleet.managementAria': 'Flottenverwaltung und Eingabe',
    'fleet.setup': 'Aufbau',
    'fleet.setupMissing': 'Aufbau zu erganzen',
    'fleet.noFleetTitle': 'Keine Fahrzeuge in der Flotte',
    'fleet.vehicleActive': 'aktive Fahrzeuge',
    'fleet.model': 'Modell',
    'fleet.modelMissing': 'Modell nicht eingetragen',
    'fleet.newVehicle': 'Neues Fahrzeug',
    'fleet.plate': 'Kennzeichen',
    'fleet.title': 'Flotte',
    'fleet.type': 'Flottentyp',
    'fleetType.furgone': 'Transporter',
    'fleetType.furgonePlural': 'Transporter',
    'fleetType.motrice': 'Lkw',
    'fleetType.motricePlural': 'Lkw',
    'fleetType.trattore': 'Sattelzugmaschine',
    'fleetType.trattorePlural': 'Sattelzugmaschinen',
    'fleetType.semirimorchio': 'Auflieger',
    'fleetType.semirimorchioPlural': 'Auflieger',
    'filter.all': 'Alle',
    'filter.driver': 'Fahrer',
    'filter.medical': 'Medizinisch',
    'filter.month': '30 Tage',
    'filter.urgent': 'Kritisch',
    'filter.vehicle': 'Fahrzeuge',
    'form.missingFields': 'Fehlt: {fields}.',
    'notifications.bellAria': 'Hinweise: {count} ungelesen',
    'notifications.companyAria': 'Firmenhinweise',
    'notifications.empty': 'Keine Hinweise in diesem Bereich.',
    'notifications.filterAria': 'Hinweise filtern',
    'notifications.fullView': 'Ganze Ansicht',
    'operations.archive': 'Archivieren',
    'operations.archived': 'Archiv',
    'operations.archivedCount': 'archiviert',
    'operations.activeFaults': 'aktive Schaden',
    'operations.bell': 'Glocke',
    'operations.created': 'Erstellt',
    'operations.updated': 'Aktualisiert',
    'operations.detail': 'Detail',
    'operations.check': 'Check',
    'operations.checkIssues': 'Check-Abweichungen',
    'operations.checkCriticalOpen': 'Kritisch zu offnen',
    'operations.lights': 'Lichter',
    'operations.tires': 'Reifen',
    'operations.documentsOnBoard': 'Borddokumente',
    'operations.present': 'Vorhanden',
    'operations.missing': 'Fehlt',
    'operations.checkCritical': 'Kritische Checks',
    'operations.critical': 'Kritisch',
    'operations.criticalCount': 'kritisch',
    'operations.detailEmptyTitle': 'Benachrichtigung offnen',
    'operations.detailEmptyText': 'Wahle einen Schaden oder Check aus, um alle Details zu sehen.',
    'operations.empty': 'Keine Benachrichtigungen in dieser Ansicht.',
    'operations.fault': 'Schaden',
    'operations.faults': 'Schaden',
    'operations.inbox': 'Zu offnen',
    'operations.markUnread': 'Als ungelesen markieren',
    'operations.open': 'Offnen',
    'operations.title': 'Operative Hinweise',
    'phone.enable': 'Hinweise aktivieren',
    'phone.enabled': 'Aktiv',
    'phone.installed': 'Installiert',
    'phone.install': 'App installieren',
    'phone.installHow': 'Installation anzeigen',
    'phone.installReady': 'Bereit',
    'phone.needInstall': 'Erst installieren',
    'phone.notAvailable': 'Nicht verfugbar',
    'phone.notifications': 'Telefon-Hinweise',
    'phone.openAsApp': 'Als App geoffnet',
    'phone.panelTitle': 'App und Hinweise',
    'phone.refresh': 'Aktualisieren',
    'phone.refreshApp': 'App aktualisieren',
    'phone.refreshBody': 'Veroffentlichte Version neu laden.',
    'phone.scope': 'Telefon',
    'phone.toActivate': 'Zu aktivieren',
    'phone.toAdd': 'Hinzufugen',
    'phone.verify': 'Hinweise prufen',
    'reaction.add': 'Reaktion hinzufugen',
    'reaction.choose': 'Reaktion wahlen',
    'reaction.company': 'Firmenreaktion',
    'reaction.driver': 'Fahrerreaktion',
    'reaction.heart': 'Herz',
    'reaction.ok': 'OK',
    'reaction.seen': 'Gesehen',
    'reaction.summary': 'Nachrichtenreaktionen',
    'reaction.thanks': 'Danke',
    'urgency.critical': 'Kritisch',
    'urgency.expired': 'Abgelaufen',
    'urgency.ok': 'Regelmassig',
    'urgency.soon': 'Lauft bald ab',
    'urgency.watch': 'Beobachten',
    'settings.companyData': 'Firmendaten',
    'settings.companyPreview': 'Vorschau',
    'settings.emailAccess': 'Login-E-Mail',
    'settings.headquarters': 'Sitz',
    'settings.legalName': 'Firmenname',
    'settings.profileOverline': 'Transportprofil',
    'settings.vatNumber': 'USt-ID',
    'vehicleStatus.active': 'Betriebsbereit',
    'vehicleStatus.maintenance': 'In Wartung',
    'vehicleStatus.watch': 'Zu prufen',
  },
}

Object.entries(workflowTranslations).forEach(([translationLanguage, translationEntries]) => {
  translations[translationLanguage] = {
    ...translations[translationLanguage],
    ...translationEntries,
  }
})

const checkIssueTranslations = {
  it: {
    'check.issueDocuments': 'documenti bordo mancanti',
    'check.issueLights': 'luci da controllare',
    'check.issueTires': 'gomme da controllare',
  },
  en: {
    'check.issueDocuments': 'on-board documents missing',
    'check.issueLights': 'lights to check',
    'check.issueTires': 'tyres to check',
  },
  es: {
    'check.issueDocuments': 'documentos a bordo faltantes',
    'check.issueLights': 'luces por revisar',
    'check.issueTires': 'neumaticos por revisar',
  },
  fr: {
    'check.issueDocuments': 'documents de bord manquants',
    'check.issueLights': 'feux a controler',
    'check.issueTires': 'pneus a controler',
  },
  de: {
    'check.issueDocuments': 'Borddokumente fehlen',
    'check.issueLights': 'Lichter prufen',
    'check.issueTires': 'Reifen prufen',
  },
}

Object.entries(checkIssueTranslations).forEach(([translationLanguage, translationEntries]) => {
  translations[translationLanguage] = {
    ...translations[translationLanguage],
    ...translationEntries,
  }
})

const microcopyTranslations = {
  it: {
    'common.actions': 'Azioni',
    'common.activePlural': 'attivi',
    'common.archiving': 'Archivio...',
    'common.noFileSelected': 'Nessun file selezionato',
    'common.removing': 'Rimuovo...',
    'common.saveShort': 'Salva',
    'common.savingShort': 'Salvo...',
    'drivers.archivedHidden': '{count} autisti archiviati nascosti dall elenco operativo.',
    'drivers.assignedNone': 'Non assegnato',
    'drivers.assignVehicle': 'Da assegnare',
    'drivers.createAccessOverline': 'Nuovo accesso',
    'drivers.createAccount': 'Crea account autista',
    'drivers.creatingAccount': 'Creazione account...',
    'drivers.generatePassword': 'Genera',
    'drivers.createTitle': 'Crea autista',
    'drivers.noVehicle': 'Nessun mezzo',
    'drivers.supabaseEmail': 'Email tecnica Supabase',
    'drivers.usernameHelp': 'Compila username per generarla',
    'drivers.vehicleAssigned': 'Mezzo assegnato',
    'drivers.statusAvailable': 'Disponibile',
    'drivers.statusPaused': 'Sospeso',
    'drivers.statusService': 'In servizio',
    'drivers.statusTravelling': 'In viaggio',
    'phone.channels': 'Chat, guasti e documenti',
    'chat.actions': 'Azioni messaggio',
    'chat.attach': 'Allega',
    'chat.audioAttached': 'Audio allegato',
    'chat.audioMessage': 'Messaggio audio',
    'chat.autoSaveAll': 'Tutti i media',
    'chat.autoSaveHint': 'Prova a scaricare automaticamente i media sul telefono quando arrivano in chat. Il telefono puo comunque chiedere conferma.',
    'chat.autoSaveNever': 'Mai',
    'chat.autoSavePhotos': 'Foto e video',
    'chat.cancelReply': 'Annulla risposta',
    'chat.copied': 'Copiato',
    'chat.copy': 'Copia',
    'chat.downloadMedia': 'Scarica',
    'chat.fileAttached': 'File allegato',
    'chat.mediaReady': 'Allegato pronto: {name}',
    'chat.mediaSaveTitle': 'Salvataggio media',
    'chat.photoVideo': 'Foto/video',
    'chat.recordAudio': 'Audio',
    'chat.recording': 'Registrazione',
    'chat.recordingFailed': 'Microfono non disponibile',
    'chat.releaseToCancel': 'Rilascia per annullare',
    'chat.reply': 'Rispondi',
    'chat.replyPreview': 'Risposta',
    'chat.replyTo': 'Risposta a {name}',
    'chat.soundOff': 'Suono chat spento',
    'chat.soundOn': 'Suono chat attivo',
    'chat.stopRecording': 'Stop',
    'chat.swipeToReply': 'Scorri per rispondere',
    'chat.slideToCancel': 'Trascina a sinistra per annullare',
    'chat.unsupportedRecorder': 'Registrazione audio non supportata',
    'chat.videoAttached': 'Video allegato',
    'reaction.done': 'Fatto',
    'reaction.warning': 'Attenzione',
  },
  en: {
    'common.actions': 'Actions',
    'common.activePlural': 'active',
    'common.archiving': 'Archiving...',
    'common.noFileSelected': 'No file selected',
    'common.removing': 'Removing...',
    'common.saveShort': 'Save',
    'common.savingShort': 'Saving...',
    'drivers.archivedHidden': '{count} archived drivers hidden from the operational list.',
    'drivers.assignedNone': 'Not assigned',
    'drivers.assignVehicle': 'To assign',
    'drivers.createAccessOverline': 'New access',
    'drivers.createAccount': 'Create driver account',
    'drivers.creatingAccount': 'Creating account...',
    'drivers.generatePassword': 'Generate',
    'drivers.createTitle': 'Create driver',
    'drivers.noVehicle': 'No vehicle',
    'drivers.supabaseEmail': 'Technical Supabase email',
    'drivers.usernameHelp': 'Enter username to generate it',
    'drivers.vehicleAssigned': 'Assigned vehicle',
    'drivers.statusAvailable': 'Available',
    'drivers.statusPaused': 'Paused',
    'drivers.statusService': 'On duty',
    'drivers.statusTravelling': 'Travelling',
    'phone.channels': 'Chat, faults and documents',
    'chat.actions': 'Message actions',
    'chat.attach': 'Attach',
    'chat.audioAttached': 'Audio attached',
    'chat.audioMessage': 'Audio message',
    'chat.autoSaveAll': 'All media',
    'chat.autoSaveHint': 'Tries to automatically download incoming chat media to the phone. The phone may still ask for confirmation.',
    'chat.autoSaveNever': 'Never',
    'chat.autoSavePhotos': 'Photos and videos',
    'chat.cancelReply': 'Cancel reply',
    'chat.copied': 'Copied',
    'chat.copy': 'Copy',
    'chat.downloadMedia': 'Download',
    'chat.fileAttached': 'File attached',
    'chat.mediaReady': 'Attachment ready: {name}',
    'chat.mediaSaveTitle': 'Media saving',
    'chat.photoVideo': 'Photo/video',
    'chat.recordAudio': 'Audio',
    'chat.recording': 'Recording',
    'chat.recordingFailed': 'Microphone unavailable',
    'chat.releaseToCancel': 'Release to cancel',
    'chat.reply': 'Reply',
    'chat.replyPreview': 'Reply',
    'chat.replyTo': 'Reply to {name}',
    'chat.soundOff': 'Chat sound off',
    'chat.soundOn': 'Chat sound on',
    'chat.stopRecording': 'Stop',
    'chat.swipeToReply': 'Swipe to reply',
    'chat.slideToCancel': 'Slide left to cancel',
    'chat.unsupportedRecorder': 'Audio recording not supported',
    'chat.videoAttached': 'Video attached',
    'reaction.done': 'Done',
    'reaction.warning': 'Warning',
  },
  es: {
    'common.actions': 'Acciones',
    'common.activePlural': 'activos',
    'common.archiving': 'Archivando...',
    'common.noFileSelected': 'Ningun archivo seleccionado',
    'common.removing': 'Quitando...',
    'common.saveShort': 'Guardar',
    'common.savingShort': 'Guardando...',
    'drivers.archivedHidden': '{count} conductores archivados ocultos de la lista operativa.',
    'drivers.assignedNone': 'No asignado',
    'drivers.assignVehicle': 'Por asignar',
    'drivers.createAccessOverline': 'Nuevo acceso',
    'drivers.createAccount': 'Crear cuenta conductor',
    'drivers.creatingAccount': 'Creando cuenta...',
    'drivers.generatePassword': 'Generar',
    'drivers.createTitle': 'Crear conductor',
    'drivers.noVehicle': 'Sin vehiculo',
    'drivers.supabaseEmail': 'Email tecnico Supabase',
    'drivers.usernameHelp': 'Introduce usuario para generarlo',
    'drivers.vehicleAssigned': 'Vehiculo asignado',
    'drivers.statusAvailable': 'Disponible',
    'drivers.statusPaused': 'Suspendido',
    'drivers.statusService': 'En servicio',
    'drivers.statusTravelling': 'En viaje',
    'phone.channels': 'Chat, averias y documentos',
    'chat.actions': 'Acciones mensaje',
    'chat.attach': 'Adjuntar',
    'chat.audioAttached': 'Audio adjunto',
    'chat.audioMessage': 'Mensaje audio',
    'chat.autoSaveAll': 'Todos los media',
    'chat.autoSaveHint': 'Intenta descargar automaticamente los media entrantes en el telefono. El telefono puede pedir confirmacion.',
    'chat.autoSaveNever': 'Nunca',
    'chat.autoSavePhotos': 'Fotos y videos',
    'chat.cancelReply': 'Cancelar respuesta',
    'chat.copied': 'Copiado',
    'chat.copy': 'Copiar',
    'chat.downloadMedia': 'Descargar',
    'chat.fileAttached': 'Archivo adjunto',
    'chat.mediaReady': 'Adjunto listo: {name}',
    'chat.mediaSaveTitle': 'Guardado media',
    'chat.photoVideo': 'Foto/video',
    'chat.recordAudio': 'Audio',
    'chat.recording': 'Grabando',
    'chat.recordingFailed': 'Microfono no disponible',
    'chat.releaseToCancel': 'Suelta para cancelar',
    'chat.reply': 'Responder',
    'chat.replyPreview': 'Respuesta',
    'chat.replyTo': 'Respuesta a {name}',
    'chat.soundOff': 'Sonido chat apagado',
    'chat.soundOn': 'Sonido chat activo',
    'chat.stopRecording': 'Stop',
    'chat.swipeToReply': 'Desliza para responder',
    'chat.slideToCancel': 'Desliza a la izquierda para cancelar',
    'chat.unsupportedRecorder': 'Grabacion audio no soportada',
    'chat.videoAttached': 'Video adjunto',
    'reaction.done': 'Hecho',
    'reaction.warning': 'Atencion',
  },
  fr: {
    'common.actions': 'Actions',
    'common.activePlural': 'actifs',
    'common.archiving': 'Archivage...',
    'common.noFileSelected': 'Aucun fichier selectionne',
    'common.removing': 'Suppression...',
    'common.saveShort': 'Enregistrer',
    'common.savingShort': 'Enregistrement...',
    'drivers.archivedHidden': '{count} chauffeurs archives caches de la liste operationnelle.',
    'drivers.assignedNone': 'Non assigne',
    'drivers.assignVehicle': 'A assigner',
    'drivers.createAccessOverline': 'Nouvel acces',
    'drivers.createAccount': 'Creer compte chauffeur',
    'drivers.creatingAccount': 'Creation compte...',
    'drivers.generatePassword': 'Generer',
    'drivers.createTitle': 'Creer chauffeur',
    'drivers.noVehicle': 'Aucun vehicule',
    'drivers.supabaseEmail': 'Email technique Supabase',
    'drivers.usernameHelp': 'Saisis le nom utilisateur pour le generer',
    'drivers.vehicleAssigned': 'Vehicule assigne',
    'drivers.statusAvailable': 'Disponible',
    'drivers.statusPaused': 'Suspendu',
    'drivers.statusService': 'En service',
    'drivers.statusTravelling': 'En trajet',
    'phone.channels': 'Chat, pannes et documents',
    'chat.actions': 'Actions message',
    'chat.attach': 'Joindre',
    'chat.audioAttached': 'Audio joint',
    'chat.audioMessage': 'Message audio',
    'chat.autoSaveAll': 'Tous les medias',
    'chat.autoSaveHint': 'Essaie de telecharger automatiquement les medias entrants sur le telephone. Le telephone peut demander confirmation.',
    'chat.autoSaveNever': 'Jamais',
    'chat.autoSavePhotos': 'Photos et videos',
    'chat.cancelReply': 'Annuler reponse',
    'chat.copied': 'Copie',
    'chat.copy': 'Copier',
    'chat.downloadMedia': 'Telecharger',
    'chat.fileAttached': 'Fichier joint',
    'chat.mediaReady': 'Piece jointe prete : {name}',
    'chat.mediaSaveTitle': 'Sauvegarde medias',
    'chat.photoVideo': 'Photo/video',
    'chat.recordAudio': 'Audio',
    'chat.recording': 'Enregistrement',
    'chat.recordingFailed': 'Microphone indisponible',
    'chat.releaseToCancel': 'Relache pour annuler',
    'chat.reply': 'Repondre',
    'chat.replyPreview': 'Reponse',
    'chat.replyTo': 'Reponse a {name}',
    'chat.soundOff': 'Son chat coupe',
    'chat.soundOn': 'Son chat actif',
    'chat.stopRecording': 'Stop',
    'chat.swipeToReply': 'Glisser pour repondre',
    'chat.slideToCancel': 'Glisse a gauche pour annuler',
    'chat.unsupportedRecorder': 'Enregistrement audio non supporte',
    'chat.videoAttached': 'Video jointe',
    'reaction.done': 'Fait',
    'reaction.warning': 'Attention',
  },
  de: {
    'common.actions': 'Aktionen',
    'common.activePlural': 'aktiv',
    'common.archiving': 'Archivieren...',
    'common.noFileSelected': 'Keine Datei ausgewahlt',
    'common.removing': 'Entfernen...',
    'common.saveShort': 'Speichern',
    'common.savingShort': 'Speichern...',
    'drivers.archivedHidden': '{count} archivierte Fahrer in der operativen Liste ausgeblendet.',
    'drivers.assignedNone': 'Nicht zugewiesen',
    'drivers.assignVehicle': 'Zuweisen',
    'drivers.createAccessOverline': 'Neuer Zugang',
    'drivers.createAccount': 'Fahrerkonto erstellen',
    'drivers.creatingAccount': 'Konto wird erstellt...',
    'drivers.generatePassword': 'Generieren',
    'drivers.createTitle': 'Fahrer erstellen',
    'drivers.noVehicle': 'Kein Fahrzeug',
    'drivers.supabaseEmail': 'Technische Supabase-E-Mail',
    'drivers.usernameHelp': 'Benutzername eingeben, um sie zu erzeugen',
    'drivers.vehicleAssigned': 'Zugewiesenes Fahrzeug',
    'drivers.statusAvailable': 'Verfugbar',
    'drivers.statusPaused': 'Pausiert',
    'drivers.statusService': 'Im Einsatz',
    'drivers.statusTravelling': 'Unterwegs',
    'phone.channels': 'Chat, Schaden und Dokumente',
    'chat.actions': 'Nachrichtenaktionen',
    'chat.attach': 'Anhang',
    'chat.audioAttached': 'Audio angehangt',
    'chat.audioMessage': 'Audionachricht',
    'chat.autoSaveAll': 'Alle Medien',
    'chat.autoSaveHint': 'Versucht eingehende Chat-Medien automatisch auf das Telefon herunterzuladen. Das Telefon kann trotzdem Bestatigung verlangen.',
    'chat.autoSaveNever': 'Nie',
    'chat.autoSavePhotos': 'Fotos und Videos',
    'chat.cancelReply': 'Antwort abbrechen',
    'chat.copied': 'Kopiert',
    'chat.copy': 'Kopieren',
    'chat.downloadMedia': 'Herunterladen',
    'chat.fileAttached': 'Datei angehangt',
    'chat.mediaReady': 'Anhang bereit: {name}',
    'chat.mediaSaveTitle': 'Medien speichern',
    'chat.photoVideo': 'Foto/Video',
    'chat.recordAudio': 'Audio',
    'chat.recording': 'Aufnahme',
    'chat.recordingFailed': 'Mikrofon nicht verfugbar',
    'chat.releaseToCancel': 'Loslassen zum Abbrechen',
    'chat.reply': 'Antworten',
    'chat.replyPreview': 'Antwort',
    'chat.replyTo': 'Antwort an {name}',
    'chat.soundOff': 'Chat-Ton aus',
    'chat.soundOn': 'Chat-Ton an',
    'chat.stopRecording': 'Stop',
    'chat.swipeToReply': 'Zum Antworten wischen',
    'chat.slideToCancel': 'Nach links ziehen zum Abbrechen',
    'chat.unsupportedRecorder': 'Audioaufnahme nicht unterstutzt',
    'chat.videoAttached': 'Video angehangt',
    'reaction.done': 'Erledigt',
    'reaction.warning': 'Achtung',
  },
}

Object.entries(microcopyTranslations).forEach(([translationLanguage, translationEntries]) => {
  translations[translationLanguage] = {
    ...translations[translationLanguage],
    ...translationEntries,
  }
})

const dailyTranslations = {
  it: {
    'daily.overline': 'Frase del giorno',
    'daily.company.0': 'Ogni scadenza vista in tempo vale una telefonata in meno domani.',
    'daily.company.1': 'Una flotta ordinata lavora meglio e costa meno.',
    'daily.company.2': 'Il controllo di oggi e la serenita del viaggio di domani.',
    'daily.company.3': 'Meno rincorse, piu strada chiara.',
    'daily.company.4': 'I dettagli giusti salvano tempo, multe e nervi.',
    'daily.company.5': 'Un avviso aperto adesso evita un problema in piazzale.',
    'daily.driver.0': 'Un check fatto bene protegge te, il mezzo e chi ti aspetta.',
    'daily.driver.1': 'La strada premia chi parte preparato.',
    'daily.driver.2': 'Una foto chiara oggi aiuta l azienda a risolvere prima.',
    'daily.driver.3': 'Documenti pronti, testa libera.',
    'daily.driver.4': 'Ogni segnalazione precisa fa viaggiare tutti meglio.',
    'daily.driver.5': 'Partire ordinati e gia mezzo lavoro.',
  },
  en: {
    'daily.overline': 'Today note',
    'daily.company.0': 'A deadline handled today is one less call tomorrow.',
    'daily.company.1': 'An ordered fleet works better and costs less.',
    'daily.company.2': 'Today s control is tomorrow s calmer trip.',
    'daily.company.3': 'Less chasing, clearer roads.',
    'daily.company.4': 'The right details save time, fines and nerves.',
    'daily.company.5': 'Opening an alert now prevents a yard problem later.',
    'daily.driver.0': 'A good check protects you, the vehicle and the people waiting.',
    'daily.driver.1': 'The road rewards those who start prepared.',
    'daily.driver.2': 'A clear photo today helps the company solve faster.',
    'daily.driver.3': 'Documents ready, mind clear.',
    'daily.driver.4': 'Every precise report helps everyone travel better.',
    'daily.driver.5': 'Starting organized is already half the job.',
  },
  es: {
    'daily.overline': 'Frase del dia',
    'daily.company.0': 'Un vencimiento visto a tiempo es una llamada menos manana.',
    'daily.company.1': 'Una flota ordenada trabaja mejor y cuesta menos.',
    'daily.company.2': 'El control de hoy es el viaje tranquilo de manana.',
    'daily.company.3': 'Menos persecuciones, mas carretera clara.',
    'daily.company.4': 'Los detalles correctos ahorran tiempo, multas y nervios.',
    'daily.company.5': 'Abrir un aviso ahora evita un problema luego.',
    'daily.driver.0': 'Un buen check te protege a ti, al vehiculo y a quien te espera.',
    'daily.driver.1': 'La carretera premia a quien sale preparado.',
    'daily.driver.2': 'Una foto clara hoy ayuda a resolver antes.',
    'daily.driver.3': 'Documentos listos, mente libre.',
    'daily.driver.4': 'Cada aviso preciso ayuda a viajar mejor.',
    'daily.driver.5': 'Salir ordenado ya es medio trabajo.',
  },
  fr: {
    'daily.overline': 'Phrase du jour',
    'daily.company.0': 'Une echeance vue a temps fait un appel de moins demain.',
    'daily.company.1': 'Une flotte ordonnee travaille mieux et coute moins.',
    'daily.company.2': 'Le controle d aujourd hui, c est le trajet serein de demain.',
    'daily.company.3': 'Moins de poursuites, plus de route claire.',
    'daily.company.4': 'Les bons details economisent temps, amendes et nerfs.',
    'daily.company.5': 'Ouvrir une alerte maintenant evite un probleme plus tard.',
    'daily.driver.0': 'Un bon check te protege, protege le vehicule et ceux qui t attendent.',
    'daily.driver.1': 'La route recompense ceux qui partent prepares.',
    'daily.driver.2': 'Une photo claire aujourd hui aide a resoudre plus vite.',
    'daily.driver.3': 'Documents prets, esprit libre.',
    'daily.driver.4': 'Chaque signalement precis aide tout le monde a mieux rouler.',
    'daily.driver.5': 'Partir organise, c est deja la moitie du travail.',
  },
  de: {
    'daily.overline': 'Satz des Tages',
    'daily.company.0': 'Eine heute geklarte Frist ist morgen ein Anruf weniger.',
    'daily.company.1': 'Eine geordnete Flotte arbeitet besser und kostet weniger.',
    'daily.company.2': 'Die Kontrolle von heute ist die ruhige Fahrt von morgen.',
    'daily.company.3': 'Weniger Hinterherlaufen, klarere Wege.',
    'daily.company.4': 'Die richtigen Details sparen Zeit, Strafen und Nerven.',
    'daily.company.5': 'Ein jetzt geoffneter Hinweis verhindert spater Probleme.',
    'daily.driver.0': 'Ein guter Check schutzt dich, das Fahrzeug und alle, die warten.',
    'daily.driver.1': 'Die Strasse belohnt, wer vorbereitet startet.',
    'daily.driver.2': 'Ein klares Foto heute hilft der Firma schneller zu losen.',
    'daily.driver.3': 'Dokumente bereit, Kopf frei.',
    'daily.driver.4': 'Jede genaue Meldung hilft allen besser zu fahren.',
    'daily.driver.5': 'Gut geordnet starten ist schon die halbe Arbeit.',
  },
  ro: {
    'daily.overline': 'Mesajul zilei',
    'daily.company.0': 'O scadenta rezolvata azi inseamna un telefon mai putin maine.',
    'daily.company.1': 'O flota ordonata lucreaza mai bine si costa mai putin.',
    'daily.company.2': 'Controlul de azi aduce drumul linistit de maine.',
    'daily.company.3': 'Mai putina alergatura, drum mai clar.',
    'daily.company.4': 'Detaliile corecte economisesc timp, amenzi si nervi.',
    'daily.company.5': 'O alerta deschisa acum evita o problema mai tarziu.',
    'daily.driver.0': 'Un check facut bine te protejeaza pe tine, vehiculul si pe cei care te asteapta.',
    'daily.driver.1': 'Drumul ii rasplateste pe cei care pleaca pregatiti.',
    'daily.driver.2': 'O poza clara azi ajuta firma sa rezolve mai repede.',
    'daily.driver.3': 'Documente pregatite, minte libera.',
    'daily.driver.4': 'Fiecare raport precis ajuta pe toti sa circule mai bine.',
    'daily.driver.5': 'Sa pleci organizat inseamna deja jumatate de treaba.',
  },
  pl: {
    'daily.overline': 'Zdanie dnia',
    'daily.company.0': 'Termin dopilnowany dzisiaj to jeden telefon mniej jutro.',
    'daily.company.1': 'Uporzadkowana flota pracuje lepiej i kosztuje mniej.',
    'daily.company.2': 'Dzisiejsza kontrola to spokojniejsza trasa jutro.',
    'daily.company.3': 'Mniej gonienia, wiecej jasnej drogi.',
    'daily.company.4': 'Dobre szczegoly oszczedzaja czas, mandaty i nerwy.',
    'daily.company.5': 'Alert otwarty teraz zapobiega problemom pozniej.',
    'daily.driver.0': 'Dobry check chroni ciebie, pojazd i tych, ktorzy czekaja.',
    'daily.driver.1': 'Droga nagradza tych, ktorzy ruszaja przygotowani.',
    'daily.driver.2': 'Wyrazne zdjecie dzis pomaga firmie szybciej reagowac.',
    'daily.driver.3': 'Dokumenty gotowe, glowa spokojna.',
    'daily.driver.4': 'Kazde precyzyjne zgloszenie pomaga wszystkim jechac lepiej.',
    'daily.driver.5': 'Start w porzadku to juz polowa pracy.',
  },
}

Object.entries(dailyTranslations).forEach(([translationLanguage, translationEntries]) => {
  translations[translationLanguage] = {
    ...translations[translationLanguage],
    ...translationEntries,
  }
})

const regionalTranslations = {
  ro: {
    'auth.companyTab': 'Firma',
    'auth.driverTab': 'Sofer',
    'brand.tagline': 'Scadente si notificari flota',
    'common.add': 'Adauga',
    'common.back': 'Inapoi',
    'common.close': 'Inchide',
    'common.open': 'Deschide',
    'common.save': 'Salveaza',
    'driver.area': 'Zona sofer',
    'driverApp.greeting': 'Buna ziua',
    'hero.description': 'O pagina clara pentru scadente, check-uri de dimineata si defectiuni de gestionat.',
    'hero.factDrivers': 'soferi activi',
    'hero.factNotifications': 'notificari deschise',
    'hero.factVehicles': 'vehicule in flota',
    'hero.newDeadline': 'Scadenta noua',
    'hero.openBell': 'Deschide notificari',
    'language.label': 'Limba',
    'language.short': 'Limba',
    'nav.chat': 'Chat',
    'nav.deadlines': 'Scadente',
    'nav.notifications': 'Notificari',
    'nav.records': 'Date',
    'nav.settings': 'Setari',
    'nav.support': 'Ghid',
    'onboarding.body': 'Completeaza acesti pasi pentru a porni Camion Chiaro fara confuzie.',
    'onboarding.companyTitle': 'Completeaza profilul firmei',
    'onboarding.completed': '{count}/{total} completate',
    'onboarding.deadlinesTitle': 'Adauga o scadenta',
    'onboarding.done': 'Gata',
    'onboarding.driversTitle': 'Adauga sofer',
    'onboarding.fleetTitle': 'Adauga vehicul',
    'onboarding.notificationsTitle': 'Activeaza notificari',
    'onboarding.overline': 'Primii pasi',
    'onboarding.title': 'Pregateste firma',
    'records.documentsLabel': 'Documente',
    'records.driversLabel': 'Soferi',
    'records.fleetLabel': 'Flota',
    'records.title': 'Date',
    'session.signOut': 'Iesi',
    'support.faq': 'FAQ',
    'support.launch': 'Prezentare',
    'support.manual': 'Manual rapid',
    'support.overline': 'Centru suport',
    'support.subtitle': 'FAQ, manual, scripturi video si idei comerciale la indemana.',
    'support.title': 'Ghid si materiale',
    'support.videos': 'Video',
    'support.vision': 'Viziune produs',
  },
  pl: {
    'auth.companyTab': 'Firma',
    'auth.driverTab': 'Kierowca',
    'brand.tagline': 'Terminy i powiadomienia floty',
    'common.add': 'Dodaj',
    'common.back': 'Wstecz',
    'common.close': 'Zamknij',
    'common.open': 'Otworz',
    'common.save': 'Zapisz',
    'driver.area': 'Strefa kierowcy',
    'driverApp.greeting': 'Dzien dobry',
    'hero.description': 'Czytelny ekran terminow, porannych kontroli i usterek do obslugi.',
    'hero.factDrivers': 'aktywni kierowcy',
    'hero.factNotifications': 'otwarte powiadomienia',
    'hero.factVehicles': 'pojazdy we flocie',
    'hero.newDeadline': 'Nowy termin',
    'hero.openBell': 'Otworz powiadomienia',
    'language.label': 'Jezyk',
    'language.short': 'Jezyk',
    'nav.chat': 'Chat',
    'nav.deadlines': 'Terminy',
    'nav.notifications': 'Powiadomienia',
    'nav.records': 'Kartoteki',
    'nav.settings': 'Ustawienia',
    'nav.support': 'Pomoc',
    'onboarding.body': 'Wykonaj te kroki, aby Camion Chiaro bylo gotowe do pracy.',
    'onboarding.companyTitle': 'Uzupelnij profil firmy',
    'onboarding.completed': '{count}/{total} gotowe',
    'onboarding.deadlinesTitle': 'Dodaj termin',
    'onboarding.done': 'Gotowe',
    'onboarding.driversTitle': 'Dodaj kierowce',
    'onboarding.fleetTitle': 'Dodaj pojazd',
    'onboarding.notificationsTitle': 'Wlacz powiadomienia',
    'onboarding.overline': 'Pierwsze kroki',
    'onboarding.title': 'Przygotuj firme',
    'records.documentsLabel': 'Dokumenty',
    'records.driversLabel': 'Kierowcy',
    'records.fleetLabel': 'Flota',
    'records.title': 'Kartoteki',
    'session.signOut': 'Wyjdz',
    'support.faq': 'FAQ',
    'support.launch': 'Prezentacja',
    'support.manual': 'Szybka instrukcja',
    'support.overline': 'Centrum pomocy',
    'support.subtitle': 'FAQ, instrukcja, scenariusze wideo i pomysly sprzedazowe pod reka.',
    'support.title': 'Pomoc i materialy',
    'support.videos': 'Wideo',
    'support.vision': 'Wizja produktu',
  },
}

Object.entries(regionalTranslations).forEach(([translationLanguage, translationEntries]) => {
  translations[translationLanguage] = {
    ...translations[translationLanguage],
    ...translationEntries,
  }
})

const supportSections = [
  {
    description: 'Risposte rapide alle domande che un azienda o un autista fanno prima di acquistare.',
    icon: BadgeCheck,
    id: 'faq',
    titleKey: 'support.faq',
    items: [
      {
        body: 'Tiene insieme autisti, flotta, scadenze, documenti, check mattutini, guasti, chat e notifiche.',
        title: 'A cosa serve Camion Chiaro?',
      },
      {
        body: 'No. L azienda entra dal browser. Da telefono puo aggiungere Camion Chiaro alla schermata home come web app.',
        title: 'Devo installare un programma?',
      },
      {
        body: 'No. L azienda crea username e password. L autista vede solo la sua area: documenti, chat, check, guasti e notifiche.',
        title: 'L autista vede tutti i dati aziendali?',
      },
      {
        body: 'Si. L autista puo aprire i documenti visibili nella sezione Documenti da mostrare.',
        title: 'Si possono mostrare documenti alla polizia?',
      },
      {
        body: 'Si. Se l autista segnala luci, gomme o documenti non ok, l azienda riceve una notifica critica.',
        title: 'Il check mattutino avvisa l azienda?',
      },
      {
        body: 'Si. Le notifiche web push arrivano se telefono e browser le supportano e l utente le ha abilitate.',
        title: 'Le notifiche arrivano anche con app chiusa?',
      },
    ],
  },
  {
    description: 'Percorso operativo minimo per configurare un cliente senza perdersi.',
    icon: BookOpen,
    id: 'manual',
    titleKey: 'support.manual',
    items: [
      {
        points: ['Entra come azienda.', 'Completa ragione sociale, sede e logo.', 'Scegli la lingua preferita.', 'Attiva notifiche se il titolare usera il telefono.'],
        title: '1. Primo accesso',
      },
      {
        points: ['Aggiungi nome e telefono.', 'Genera username e password.', 'Assegna un mezzo se gia disponibile.', 'Carica foto profilo se utile.'],
        title: '2. Crea autisti',
      },
      {
        points: ['Inserisci furgoni, motrici, trattori e semirimorchi.', 'Compila targa, modello, km e stato.', 'Archivia i mezzi non operativi.'],
        title: '3. Registra flotta',
      },
      {
        points: ['Aggiungi patente, CQC, carta tachigrafica e visite mediche.', 'Carica file o foto.', 'Decidi cosa e visibile all autista.'],
        title: '4. Documenti e scadenze',
      },
      {
        points: ['L autista seleziona mezzo e semirimorchio opzionale.', 'Compila luci, gomme, documenti e km.', 'Se qualcosa non va, arriva notifica critica.'],
        title: '5. Check mattutino',
      },
      {
        points: ['L autista invia guasto con foto.', 'L azienda apre il dettaglio.', 'Quando gestito, archivia e mantiene lo storico.'],
        title: '6. Guasti e storico',
      },
    ],
  },
  {
    description: 'Traccia pronta per una presentazione clienti orientata all acquisto.',
    icon: FileText,
    id: 'launch',
    titleKey: 'support.launch',
    items: [
      {
        body: 'Camion Chiaro: la piattaforma semplice per non dimenticare scadenze, documenti, guasti e comunicazioni della flotta.',
        title: 'Titolo',
      },
      {
        body: 'Patenti, CQC, revisioni, assicurazioni, documenti dispersi, guasti comunicati male e autisti che chiamano per tutto.',
        title: 'Il problema',
      },
      {
        body: 'Dashboard azienda, app autista, notifiche, documenti da mostrare, chat e storico operativo.',
        title: 'La soluzione',
      },
      {
        body: 'Meno dimenticanze, meno telefonate, piu controllo, piu prove, piu ordine.',
        title: 'Benefici',
      },
      {
        body: 'Acquisto abbonamento, attivazione rapida e onboarding iniziale per mettere ordine alla flotta.',
        title: 'Chiusura',
      },
    ],
  },
  {
    description: 'Idee video brevi da usare su sito, social, WhatsApp e vendita diretta.',
    icon: Smartphone,
    id: 'videos',
    titleKey: 'support.videos',
    items: [
      {
        body: 'Titolare con fogli e telefono. Poi dashboard ordinata. Messaggio: basta una scadenza dimenticata per fermare tutto.',
        title: 'La scadenza dimenticata',
      },
      {
        body: 'Autista vede una spia, scatta foto, segnala guasto. L azienda riceve tutto in dashboard.',
        title: 'Il guasto senza telefonate',
      },
      {
        body: 'Controllo stradale. L autista apre Documenti da mostrare e trova subito quello che serve.',
        title: 'Documenti sempre pronti',
      },
      {
        body: 'Prima di partire: luci, gomme, documenti, km. Se qualcosa non va, avviso critico.',
        title: 'Check mattutino',
      },
      {
        body: '60 secondi: problema, dashboard, app autista, guasto con foto, documento, chat, invito ad acquistare.',
        title: 'Video prodotto completo',
      },
    ],
  },
  {
    description: 'La direzione per farlo diventare un must-have per aziende di trasporto.',
    icon: ShieldCheck,
    id: 'vision',
    titleKey: 'support.vision',
    items: [
      {
        body: 'Prima di partire tutto verde: autista ok, mezzo ok, documenti ok, check ok, nessun guasto urgente.',
        title: 'Semaforo partenza',
      },
      {
        body: 'Un pulsante pulito per aprire solo i documenti utili durante un controllo.',
        title: 'Modalita controllo stradale',
      },
      {
        body: 'Adesivo QR sul mezzo: apre check, guasto, documenti e storico del mezzo corretto.',
        title: 'QR mezzo',
      },
      {
        body: 'Notizie operative filtrate: blocchi, divieti, valichi, scioperi, normative, meteo pesante e carburante.',
        title: 'Osservatorio trasporti',
      },
      {
        body: 'OCR documenti, report mensili, ruoli avanzati, multi-sede, export Excel, white label e integrazioni.',
        title: 'Premium',
      },
    ],
  },
]

const documentTypeTranslationKeys = {
  'Assicurazione RCA': 'docType.insurance',
  Bollo: 'docType.roadTax',
  CQC: 'docType.cqc',
  'Carta tachigrafica': 'docType.driverCard',
  'Formazione ADR': 'docType.adr',
  'Patente C': 'docType.licenseC',
  'Patente C+E': 'docType.licenseCE',
  'Revisione mezzo': 'docType.vehicleInspection',
  'Visita medica': 'docType.medical',
}
const documentStatusTranslationKeys = {
  Caricato: 'docStatus.uploaded',
  Verificato: 'docStatus.verified',
  Scaduto: 'docStatus.expired',
  Mancante: 'docStatus.missing',
}
const fleetTypeTranslationKeys = {
  furgone: 'fleetType.furgone',
  motrice: 'fleetType.motrice',
  semirimorchio: 'fleetType.semirimorchio',
  trattore: 'fleetType.trattore',
}
const faultSeverityTranslationKeys = {
  high: 'faultSeverity.high',
  low: 'faultSeverity.low',
  medium: 'faultSeverity.medium',
  stop_vehicle: 'faultSeverity.stop_vehicle',
}
const faultStatusTranslationKeys = {
  closed: 'faultStatus.closed',
  in_progress: 'faultStatus.in_progress',
  open: 'faultStatus.open',
  seen: 'faultStatus.seen',
}
const vehicleStatusTranslationKeys = {
  'Da controllare': 'vehicleStatus.watch',
  'In manutenzione': 'vehicleStatus.maintenance',
  Operativo: 'vehicleStatus.active',
}
const driverStatusTranslationKeys = {
  Disponibile: 'drivers.statusAvailable',
  'In servizio': 'drivers.statusService',
  'In viaggio': 'drivers.statusTravelling',
  Sospeso: 'drivers.statusPaused',
}
const filterTranslationKeys = {
  all: 'filter.all',
  urgent: 'filter.urgent',
  month: 'filter.month',
  driver: 'filter.driver',
  vehicle: 'filter.vehicle',
  medical: 'filter.medical',
}
const urgencyTranslationKeys = {
  critical: 'urgency.critical',
  expired: 'urgency.expired',
  ok: 'urgency.ok',
  soon: 'urgency.soon',
  watch: 'urgency.watch',
}
const dailyMotivationKeys = {
  company: Array.from({ length: 6 }, (_, index) => `daily.company.${index}`),
  driver: Array.from({ length: 6 }, (_, index) => `daily.driver.${index}`),
}

function translatedValue(t, keyMap, value, fallback = value) {
  return keyMap[value] ? t(keyMap[value]) : fallback
}

function getDocumentTypeLabel(value, t) {
  return translatedValue(t, documentTypeTranslationKeys, value)
}

function getDocumentStatusLabel(value, t) {
  return translatedValue(t, documentStatusTranslationKeys, value)
}

function getVehicleStatusLabel(value, t) {
  return translatedValue(t, vehicleStatusTranslationKeys, value)
}

function getDriverStatusLabel(value, t) {
  return translatedValue(t, driverStatusTranslationKeys, value)
}

function getFilterLabel(filter, t) {
  return t(filterTranslationKeys[filter.id] ?? filter.label)
}

function getUrgencyLabel(urgency, t) {
  return t(urgencyTranslationKeys[urgency.key] ?? urgency.label)
}

function getDailyMotivation(role, t, date = new Date()) {
  const keys = dailyMotivationKeys[role] ?? dailyMotivationKeys.company
  const dayStart = new Date(date.getFullYear(), 0, 0)
  const dayNumber = Math.floor((date - dayStart) / 86400000)
  return t(keys[dayNumber % keys.length])
}

function getInitialLanguage() {
  if (typeof window === 'undefined') return defaultLanguage

  const storedLanguage = localStorage.getItem(languageStorageKey)
  if (supportedLanguageCodes.has(storedLanguage)) return storedLanguage

  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language]
  const detectedLanguage = browserLanguages
    .map((language) => language?.slice(0, 2).toLowerCase())
    .find((language) => supportedLanguageCodes.has(language))

  return detectedLanguage ?? defaultLanguage
}

function translate(language, key, values = {}) {
  const message = translations[language]?.[key] ?? translations.en?.[key] ?? translations[defaultLanguage][key] ?? key

  return Object.entries(values).reduce(
    (currentMessage, [valueKey, value]) => currentMessage.replaceAll(`{${valueKey}}`, String(value)),
    message,
  )
}

const I18nContext = createContext({
  language: defaultLanguage,
  onLanguageChange: () => {},
  t: (key, values) => translate(defaultLanguage, key, values),
})

function useI18n() {
  return useContext(I18nContext)
}

function getChatReactionEmoji(value) {
  const legacyReactionMap = {
    Cuore: '❤️',
    Grazie: '🙏',
    OK: '👍',
    Visto: '👀',
  }

  return chatReactionOptions.find((reaction) => reaction.value === value)?.emoji ?? legacyReactionMap[value] ?? value
}

function getChatReactionLabel(value) {
  const legacyReactionMap = {
    Cuore: 'cuore',
    Grazie: 'grazie',
    OK: 'ok',
    Visto: 'visto',
  }

  return chatReactionOptions.find((reaction) => reaction.value === value)?.label.toLowerCase() ?? legacyReactionMap[value] ?? 'reaction'
}

function hasChatReactions(message) {
  return Object.values(message?.reactions ?? {}).some(Boolean)
}

function truncateChatText(value, maxLength = 120) {
  const cleanValue = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (cleanValue.length <= maxLength) return cleanValue
  return `${cleanValue.slice(0, maxLength - 1).trim()}...`
}

function encodeChatReplyPayload(reply) {
  if (!reply) return ''

  try {
    return window.btoa(encodeURIComponent(JSON.stringify(reply)))
  } catch {
    return ''
  }
}

function decodeChatReplyPayload(value) {
  if (!value) return null

  try {
    const parsed = JSON.parse(decodeURIComponent(window.atob(value)))
    return {
      id: String(parsed.id ?? ''),
      sender: String(parsed.sender ?? ''),
      text: String(parsed.text ?? ''),
    }
  } catch {
    return null
  }
}

function parseChatMessageBody(body = '') {
  const messageBody = String(body ?? '')

  if (!messageBody.startsWith(chatReplyPrefix)) {
    return { reply: null, text: messageBody }
  }

  const suffixIndex = messageBody.indexOf(chatReplySuffix)
  if (suffixIndex < 0) return { reply: null, text: messageBody }

  const encodedReply = messageBody.slice(chatReplyPrefix.length, suffixIndex)
  const reply = decodeChatReplyPayload(encodedReply)
  const text = messageBody.slice(suffixIndex + chatReplySuffix.length).replace(/^\n+/, '')

  return { reply, text }
}

function composeChatMessageBody(text, reply) {
  const cleanText = String(text ?? '').trim()
  const encodedReply = encodeChatReplyPayload(reply)
  if (!encodedReply) return cleanText

  return `${chatReplyPrefix}${encodedReply}${chatReplySuffix}${cleanText ? `\n${cleanText}` : ''}`
}

function getChatMessageDisplay(message) {
  return parseChatMessageBody(message?.body ?? '')
}

function getChatMessageText(message, fallback = 'Messaggio') {
  const display = getChatMessageDisplay(message)
  if (display.text) return display.text
  if (!message?.attachmentPath) return fallback

  const attachmentKind = getChatAttachmentKind(message.attachmentPath)
  if (attachmentKind === 'audio') return 'Audio allegato'
  if (attachmentKind === 'video') return 'Video allegato'
  if (attachmentKind === 'image') return 'Foto allegata'
  return 'File allegato'
}

function createChatReplyReference(message, sender) {
  if (!message?.id) return null

  return {
    id: message.id,
    sender,
    text: truncateChatText(getChatMessageText(message), 140),
  }
}

async function copyChatText(message) {
  const text = getChatMessageText(message, '')
  if (!text) return false

  try {
    await navigator.clipboard?.writeText(text)
    return true
  } catch {
    return false
  }
}

function playChatTone(kind = 'incoming') {
  if (typeof window === 'undefined') return

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return

    const context = new AudioContext()
    const now = context.currentTime
    const compressor = context.createDynamicsCompressor()
    const toneFilter = context.createBiquadFilter()
    const masterGain = context.createGain()
    const notes =
      kind === 'outgoing'
        ? [
            { duration: 0.13, frequency: 660, start: 0 },
            { duration: 0.16, frequency: 988, start: 0.09 },
          ]
        : [
            { duration: 0.12, frequency: 784, start: 0 },
            { duration: 0.15, frequency: 1046, start: 0.08 },
            { duration: 0.2, frequency: 1397, start: 0.17 },
          ]

    toneFilter.type = 'lowpass'
    toneFilter.frequency.setValueAtTime(3600, now)
    compressor.threshold.setValueAtTime(-24, now)
    compressor.knee.setValueAtTime(18, now)
    compressor.ratio.setValueAtTime(8, now)
    compressor.attack.setValueAtTime(0.004, now)
    compressor.release.setValueAtTime(0.18, now)

    masterGain.gain.setValueAtTime(0.0001, now)
    masterGain.gain.exponentialRampToValueAtTime(kind === 'outgoing' ? 0.22 : 0.28, now + 0.012)
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === 'outgoing' ? 0.34 : 0.5))
    masterGain.connect(toneFilter)
    toneFilter.connect(compressor)
    compressor.connect(context.destination)

    notes.forEach((note, index) => {
      const oscillator = context.createOscillator()
      const shimmer = context.createOscillator()
      const noteGain = context.createGain()
      const shimmerGain = context.createGain()
      const startAt = now + note.start
      const stopAt = startAt + note.duration

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(note.frequency, startAt)
      shimmer.type = index === 0 ? 'triangle' : 'sine'
      shimmer.frequency.setValueAtTime(note.frequency * 2, startAt)
      noteGain.gain.setValueAtTime(0.0001, startAt)
      noteGain.gain.exponentialRampToValueAtTime(0.3, startAt + 0.014)
      noteGain.gain.exponentialRampToValueAtTime(0.0001, stopAt)
      shimmerGain.gain.setValueAtTime(0.0001, startAt)
      shimmerGain.gain.exponentialRampToValueAtTime(0.08, startAt + 0.018)
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, stopAt - 0.01)
      oscillator.connect(noteGain)
      shimmer.connect(shimmerGain)
      noteGain.connect(masterGain)
      shimmerGain.connect(masterGain)
      oscillator.start(startAt)
      shimmer.start(startAt)
      oscillator.stop(stopAt + 0.03)
      shimmer.stop(stopAt + 0.03)
    })

    if (context.state === 'suspended') void context.resume()

    window.setTimeout(() => context.close().catch(() => {}), 700)
  } catch {
    // Browser audio can be blocked before the first user gesture.
  }
}

function useChatSoundPreference() {
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof localStorage === 'undefined') return true
    return localStorage.getItem(chatSoundStorageKey) !== 'false'
  })

  const toggleSound = useCallback(() => {
    setIsEnabled((currentValue) => {
      const nextValue = !currentValue
      localStorage.setItem(chatSoundStorageKey, String(nextValue))
      return nextValue
    })
  }, [])

  const playSound = useCallback(
    (kind) => {
      if (isEnabled) playChatTone(kind)
    },
    [isEnabled],
  )

  return { isEnabled, playSound, toggleSound }
}

function updateActiveChatForPush(threadId = '') {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  const payload = {
    threadId: threadId || '',
    type: 'camion-chiaro-active-chat',
  }

  navigator.serviceWorker.controller?.postMessage(payload)
  navigator.serviceWorker.ready
    .then((registration) => registration.active?.postMessage(payload))
    .catch(() => {})
}

function useDriverMediaSavePreference() {
  const [preference, setPreference] = useState(() => {
    if (typeof localStorage === 'undefined') return 'never'
    const storedPreference = localStorage.getItem(driverMediaSaveStorageKey)
    return driverMediaSaveOptions.some((option) => option.value === storedPreference) ? storedPreference : 'never'
  })

  const updatePreference = useCallback((nextPreference) => {
    const safePreference = driverMediaSaveOptions.some((option) => option.value === nextPreference) ? nextPreference : 'never'
    localStorage.setItem(driverMediaSaveStorageKey, safePreference)
    setPreference(safePreference)
  }, [])

  return [preference, updatePreference]
}

function getChatActorKey(actorRole, actorId) {
  return actorRole && actorId ? `${actorRole}:${actorId}` : ''
}

function getThreadTypingKey(threadId, actorRole, actorId) {
  return threadId && actorRole && actorId ? `${threadId}:${actorRole}:${actorId}` : ''
}

function isChatActorOnline(chatLiveState, actorRole, actorId) {
  const actorKey = getChatActorKey(actorRole, actorId)
  return Boolean(actorKey && chatLiveState?.onlineByActor?.[actorKey])
}

function getChatActorLastSeenAt(chatLiveState, actorRole, actorId) {
  const actorKey = getChatActorKey(actorRole, actorId)
  return actorKey ? chatLiveState?.lastSeenByActor?.[actorKey] ?? '' : ''
}

function getTypingActors(chatLiveState, threadId, actorRole) {
  const now = Date.now()

  return Object.values(chatLiveState?.typingByThread ?? {}).filter(
    (entry) =>
      entry.threadId === threadId &&
      entry.actorRole === actorRole &&
      entry.expiresAt > now,
  )
}

function removeExpiredTypingEntries(chatLiveState) {
  const now = Date.now()
  const typingByThread = Object.fromEntries(
    Object.entries(chatLiveState.typingByThread ?? {}).filter(([, entry]) => entry.expiresAt > now),
  )

  if (Object.keys(typingByThread).length === Object.keys(chatLiveState.typingByThread ?? {}).length) {
    return chatLiveState
  }

  return { ...chatLiveState, typingByThread }
}

function formatRelativeChatTime(value) {
  if (!value) return ''

  const distanceSeconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (distanceSeconds < 60) return 'ora'

  const distanceMinutes = Math.floor(distanceSeconds / 60)
  if (distanceMinutes < 60) return `${distanceMinutes} min fa`

  const distanceHours = Math.floor(distanceMinutes / 60)
  if (distanceHours < 24) return `${distanceHours} h fa`

  return formatShortDateTime(value)
}

function getChatPresenceLabel({ isOnline, isTyping, lastSeenAt, onlineLabel = 'Online', typingLabel = 'Sta scrivendo...' }) {
  if (isTyping) return typingLabel
  if (isOnline) return onlineLabel
  if (lastSeenAt) return `Ultimo accesso ${formatRelativeChatTime(lastSeenAt)}`
  return 'Offline'
}

function shouldIgnoreReactionGesture(target) {
  return Boolean(target?.closest?.('a, button, input, label, select, textarea'))
}

function useChatMessageActions({ onReply }) {
  const [openActionMessageId, setOpenActionMessageId] = useState('')
  const [swipeState, setSwipeState] = useState({ messageId: '', offset: 0 })
  const holdTimerRef = useRef(null)
  const swipeRef = useRef(null)

  function clearMessageHold() {
    if (holdTimerRef.current && typeof window !== 'undefined') {
      window.clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }

  function openMessageActions(messageId) {
    clearMessageHold()
    setOpenActionMessageId(messageId)
  }

  function closeMessageActions() {
    clearMessageHold()
    setOpenActionMessageId('')
  }

  function startMessageHold(message, event) {
    if (shouldIgnoreReactionGesture(event.target)) return

    clearMessageHold()
    holdTimerRef.current = window.setTimeout(() => openMessageActions(message.id), 520)
  }

  function resetSwipe() {
    swipeRef.current = null
    setSwipeState({ messageId: '', offset: 0 })
  }

  function getMessageActionProps(message) {
    return {
      onContextMenu: (event) => {
        if (shouldIgnoreReactionGesture(event.target)) return
        event.preventDefault()
        openMessageActions(message.id)
      },
      onPointerCancel: () => {
        clearMessageHold()
        resetSwipe()
      },
      onPointerDown: (event) => {
        if (event.button && event.button !== 0) return
        if (shouldIgnoreReactionGesture(event.target)) return

        swipeRef.current = {
          id: message.id,
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          swiped: false,
        }
        event.currentTarget.setPointerCapture?.(event.pointerId)
        startMessageHold(message, event)
      },
      onPointerLeave: clearMessageHold,
      onPointerMove: (event) => {
        const swipe = swipeRef.current
        if (!swipe || swipe.id !== message.id) return

        const deltaX = event.clientX - swipe.startX
        const deltaY = event.clientY - swipe.startY

        if (Math.abs(deltaY) > 18 && Math.abs(deltaY) > Math.abs(deltaX)) {
          clearMessageHold()
          setSwipeState({ messageId: '', offset: 0 })
          return
        }

        if (deltaX <= 8 || Math.abs(deltaY) > 36) return

        clearMessageHold()
        event.preventDefault()
        const offset = Math.min(76, deltaX)
        setSwipeState({ messageId: message.id, offset })

        if (!swipe.swiped && deltaX > 58) {
          swipe.swiped = true
          closeMessageActions()
          onReply?.(message)
          navigator.vibrate?.(12)
        }
      },
      onPointerUp: (event) => {
        clearMessageHold()
        event.currentTarget.releasePointerCapture?.(event.pointerId)
        resetSwipe()
      },
    }
  }

  useEffect(() => {
    return () => {
      if (holdTimerRef.current && typeof window !== 'undefined') {
        window.clearTimeout(holdTimerRef.current)
      }
    }
  }, [])

  return {
    closeMessageActions,
    getMessageActionProps,
    openActionMessageId,
    openMessageActions,
    swipeState,
  }
}

function useChatTypingSignal({ actorRole, onTyping, threadId }) {
  const isTypingRef = useRef(false)
  const stopTimerRef = useRef(0)

  const sendTyping = useCallback(
    (isTyping) => {
      if (!threadId) return
      if (isTypingRef.current === isTyping) return
      isTypingRef.current = isTyping
      onTyping?.({ actorRole, isTyping, threadId })
    },
    [actorRole, onTyping, threadId],
  )

  const signalTyping = useCallback(
    (value) => {
      if (typeof window === 'undefined') return

      const hasText = Boolean(String(value ?? '').trim())
      if (!hasText) {
        window.clearTimeout(stopTimerRef.current)
        sendTyping(false)
        return
      }

      sendTyping(true)
      window.clearTimeout(stopTimerRef.current)
      stopTimerRef.current = window.setTimeout(() => sendTyping(false), 1400)
    },
    [sendTyping],
  )

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.clearTimeout(stopTimerRef.current)
      if (isTypingRef.current) onTyping?.({ actorRole, isTyping: false, threadId })
      isTypingRef.current = false
    }
  }, [actorRole, onTyping, threadId])

  return signalTyping
}

function getInitialActiveView() {
  if (typeof window === 'undefined') return 'dashboard'

  const viewFromUrl = new URLSearchParams(window.location.search).get('view')
  if (viewFromUrl === 'documents' || viewFromUrl === 'drivers' || viewFromUrl === 'fleet') return 'records'

  return deepLinkViews.has(viewFromUrl) ? viewFromUrl : 'dashboard'
}

function getInitialRecordsTab() {
  if (typeof window === 'undefined') return 'drivers'

  const viewFromUrl = new URLSearchParams(window.location.search).get('view')
  if (viewFromUrl === 'documents') return 'documents'
  return viewFromUrl === 'fleet' ? 'fleet' : 'drivers'
}

function getFleetTypeLabel(value, t) {
  const fallback = fleetTypeOptions.find((option) => option.value === value)?.label ?? value
  return t ? translatedValue(t, fleetTypeTranslationKeys, value, fallback) : fallback
}

function getWorkforceDepartmentLabel(value = '') {
  const labels = {
    drivers: 'Autisti',
    management: 'Direzione',
    office: 'Ufficio',
    warehouse: 'Magazzino',
  }

  return labels[value] ?? 'Persone'
}

function getWorkforceRoleLabel(value = '') {
  const labels = {
    driver: 'Autista',
    forklift_operator: 'Carrellista',
    manager: 'Responsabile',
    office: 'Impiegato ufficio',
    warehouse_worker: 'Magazziniere',
  }

  return labels[value] ?? 'Persona'
}

function getWorkforceAssetLabel(value = '') {
  const labels = {
    forklift: 'Muletto',
    other: 'Altro',
    pallet_truck: 'Transpallet',
    warehouse_equipment: 'Attrezzatura',
  }

  return labels[value] ?? 'Attrezzatura'
}

function getFaultSeverityLabel(value, t) {
  const fallback = faultSeverityOptions.find((option) => option.value === value)?.label ?? value
  return t ? translatedValue(t, faultSeverityTranslationKeys, value, fallback) : fallback
}

function getFaultStatusLabel(value, t) {
  const fallback = faultStatusOptions.find((option) => option.value === value)?.label ?? value
  return t ? translatedValue(t, faultStatusTranslationKeys, value, fallback) : fallback
}

function isFaultArchived(report) {
  return report.status === 'closed'
}

function isFaultUnread(report) {
  return !isFaultArchived(report)
}

function getDisplayCompanyName(name) {
  const trimmedName = name?.trim()

  if (!trimmedName || placeholderCompanyNames.has(trimmedName) || trimmedName.includes('@')) {
    return demoCompanyName
  }

  return trimmedName
}

function getBillingPlanLabel(plan) {
  return billingPlanLabels[plan] ?? plan ?? 'Starter'
}

function getBillingStatusLabel(status) {
  return billingStatusLabels[status] ?? status ?? 'Attivo'
}

function isCompanyLicenseActive(profile) {
  if (!profile?.billingStatus) return true
  if (profile.billingStatus !== 'active') return false
  if (!profile.billingCurrentPeriodEnd) return true

  const periodEnd = new Date(profile.billingCurrentPeriodEnd).getTime()
  if (Number.isNaN(periodEnd)) return true

  return periodEnd > Date.now()
}

function formatInvoiceAmount(invoice) {
  const currency = (invoice.currency || 'eur').toUpperCase()

  return new Intl.NumberFormat('it-IT', {
    currency,
    style: 'currency',
  }).format((invoice.amountCents ?? 0) / 100)
}

function getInvoiceStatusLabel(status) {
  const labels = {
    cancelled: 'Annullata',
    draft: 'Bozza',
    open: 'Da pagare',
    paid: 'Pagata',
    uncollectible: 'Non incassata',
  }

  return labels[status] ?? status ?? 'Bozza'
}

function normalizePlate(value) {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}

function normalizeDriverUsername(value) {
  return value.trim().toLowerCase().replace(/\s+/g, '.')
}

function generateTemporaryPassword(length = 12) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const randomValues = new Uint32Array(length)
  crypto.getRandomValues(randomValues)

  return Array.from(randomValues, (value) => alphabet[value % alphabet.length]).join('')
}

function getDriverCreateDefaults() {
  return {
    depot: 'Verona',
    email: '',
    name: '',
    password: generateTemporaryPassword(),
    phone: '',
    role: 'Autista bilico',
    username: '',
    vehicleId: '',
  }
}

function buildDriverAuthEmail(username) {
  const cleanUsername = normalizeDriverUsername(username)
  return cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@${driverAuthDomain}`
}

function formatOptionalDate(date) {
  return date ? formatDate(date) : 'Senza scadenza'
}

function formatShortDateTime(value) {
  if (!value) return ''

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value))
}

function isSameLocalDay(value, date = new Date()) {
  if (!value) return false

  const targetDate = new Date(value)

  return (
    targetDate.getFullYear() === date.getFullYear() &&
    targetDate.getMonth() === date.getMonth() &&
    targetDate.getDate() === date.getDate()
  )
}

function getCheckIssues(check, t) {
  return [
    check.lightsOk ? null : t?.('check.issueLights') ?? 'luci da controllare',
    check.tiresOk ? null : t?.('check.issueTires') ?? 'gomme da controllare',
    check.documentsOnBoard ? null : t?.('check.issueDocuments') ?? 'documenti bordo mancanti',
  ].filter(Boolean)
}

function hasCheckIssues(check) {
  return getCheckIssues(check).length > 0
}

function formatMissingFields(fields, t) {
  if (fields.length === 0) return ''

  return t ? t('form.missingFields', { fields: fields.join(', ') }) : `Mancano: ${fields.join(', ')}.`
}

function getInitials(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return 'CC'

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}

function isPreviewableAssetPath(path) {
  return Boolean(path && !/^(blob:|data:|https?:)/.test(path))
}

function getFileExtension(value = '') {
  const cleanValue = String(value ?? '').split('?')[0].split('#')[0].toLowerCase()
  const extension = cleanValue.slice(cleanValue.lastIndexOf('.') + 1)
  return extension && extension !== cleanValue ? extension : ''
}

function isSupportedImageFile(file) {
  const extension = getFileExtension(file?.name)
  return Boolean(
    file?.type?.startsWith('image/') ||
      ['avif', 'heic', 'heif', 'jpeg', 'jpg', 'png', 'webp'].includes(extension),
  )
}

function isSupportedDocumentFile(file) {
  const fileName = file?.name?.toLowerCase() ?? ''
  return isSupportedImageFile(file) || file?.type === 'application/pdf' || fileName.endsWith('.pdf')
}

function isSupportedAudioFile(file) {
  const extension = getFileExtension(file?.name)
  return Boolean(file?.type?.startsWith('audio/') || ['aac', 'm4a', 'mp3', 'ogg', 'opus', 'wav', 'webm'].includes(extension))
}

function isSupportedVideoFile(file) {
  const extension = getFileExtension(file?.name)
  return Boolean(file?.type?.startsWith('video/') || ['m4v', 'mov', 'mp4', 'webm'].includes(extension))
}

function getChatAttachmentKind(value = '', mimeType = '') {
  const cleanMimeType = String(mimeType ?? '').toLowerCase()
  const cleanValue = String(value ?? '').toLowerCase()
  const extension = getFileExtension(cleanValue)
  const baseName = cleanValue.split('?')[0].split('#')[0].slice(cleanValue.lastIndexOf('/') + 1)

  if (cleanMimeType.startsWith('image/') || ['avif', 'heic', 'heif', 'jpeg', 'jpg', 'png', 'webp'].includes(extension)) {
    return 'image'
  }

  if (baseName.includes('audio-chat-')) {
    return 'audio'
  }

  if (cleanMimeType.startsWith('audio/') || ['aac', 'm4a', 'mp3', 'ogg', 'opus', 'wav'].includes(extension)) {
    return 'audio'
  }

  if (cleanMimeType.startsWith('video/') || ['m4v', 'mov', 'mp4', 'webm'].includes(extension)) {
    return 'video'
  }

  return value ? 'file' : ''
}

function getChatAudioMimeType(value = '') {
  const extension = getFileExtension(value)

  if (['aac', 'm4a', 'mp4'].includes(extension)) return 'audio/mp4'
  if (['ogg', 'opus'].includes(extension)) return 'audio/ogg'
  if (extension === 'wav') return 'audio/wav'
  if (extension === 'webm') return 'audio/webm'
  if (extension === 'mp3') return 'audio/mpeg'

  return 'audio/mp4'
}

function getChatAttachmentLabel(kind, t) {
  if (kind === 'audio') return t('chat.audioAttached')
  if (kind === 'video') return t('chat.videoAttached')
  if (kind === 'image') return t('chat.photoAttached')
  return t('chat.fileAttached')
}

function getChatAttachmentFileName(path = '', fallback = 'camion-chiaro-media') {
  const cleanPath = String(path ?? '').split('?')[0].split('#')[0]
  return decodeURIComponent(cleanPath.slice(cleanPath.lastIndexOf('/') + 1) || fallback)
}

function shouldAutoSaveChatMedia(kind, preference) {
  if (preference === 'all') return ['audio', 'image', 'video'].includes(kind)
  if (preference === 'photos') return ['image', 'video'].includes(kind)
  return false
}

function triggerChatMediaDownload(url, fileName) {
  if (typeof document === 'undefined' || !url) return false

  const link = document.createElement('a')
  link.href = url
  link.download = fileName || 'camion-chiaro-media'
  link.rel = 'noreferrer'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  return true
}

function getSupportedAudioMimeType() {
  if (typeof MediaRecorder === 'undefined') return ''

  return ['audio/mp4', 'audio/aac', 'audio/webm;codecs=opus', 'audio/webm'].find((mimeType) =>
    MediaRecorder.isTypeSupported?.(mimeType),
  ) ?? ''
}

function createRecordedAudioFile(chunks, mimeType) {
  const cleanMimeType = String(mimeType || 'audio/webm').split(';')[0]
  const extension = cleanMimeType.includes('mp4') || cleanMimeType.includes('aac') ? 'm4a' : 'webm'
  const blob = new Blob(chunks, { type: cleanMimeType })
  return new File([blob], `audio-chat-${Date.now()}.${extension}`, { type: cleanMimeType })
}

function formatRecordingTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0)
  const minutes = Math.floor(safeSeconds / 60)
  return `${minutes}:${String(safeSeconds % 60).padStart(2, '0')}`
}

function formatBytes(bytes) {
  const safeBytes = Number(bytes) || 0
  if (safeBytes > 0 && safeBytes < 1024) return `${safeBytes} B`
  if (safeBytes < 1024 * 1024) return `${Math.round(safeBytes / 1024)} KB`
  if (safeBytes < 1024 * 1024 * 1024) return `${(safeBytes / 1024 / 1024).toFixed(1)} MB`
  return `${(safeBytes / 1024 / 1024 / 1024).toFixed(1)} GB`
}

function getStorageLimitBytes(plan) {
  return storagePlanLimitsBytes[plan] ?? storagePlanLimitsBytes.starter
}

function getStorageUsagePercent(summary, plan) {
  const limitBytes = getStorageLimitBytes(plan)
  if (!limitBytes) return 0
  return Math.min(100, Math.round(((summary?.totalBytes ?? 0) / limitBytes) * 100))
}

function fileNameWithExtension(fileName, extension) {
  const cleanName = String(fileName || 'immagine').replace(/\.[^.]+$/, '')
  return `${cleanName}.${extension}`
}

async function loadImageElement(file) {
  const imageUrl = URL.createObjectURL(file)

  try {
    const image = new Image()
    image.decoding = 'async'
    image.src = imageUrl
    await image.decode()
    return image
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

async function compressImageFile(file, { maxSide = imageCompressionMaxSide, quality = imageCompressionQuality } = {}) {
  if (!isSupportedImageFile(file) || file.type === 'image/svg+xml') return file
  if (typeof document === 'undefined') return file

  try {
    const image = await loadImageElement(file)
    const width = image.naturalWidth || image.width
    const height = image.naturalHeight || image.height
    if (!width || !height) return file

    const scale = Math.min(1, maxSide / Math.max(width, height))
    const targetWidth = Math.max(1, Math.round(width * scale))
    const targetHeight = Math.max(1, Math.round(height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const context = canvas.getContext('2d')
    if (!context) return file

    context.drawImage(image, 0, 0, targetWidth, targetHeight)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob || blob.size >= file.size) return file

    return new File([blob], fileNameWithExtension(file.name, 'jpg'), {
      lastModified: Date.now(),
      type: 'image/jpeg',
    })
  } catch {
    return file
  }
}

function loadAcknowledgedCheckIds() {
  try {
    const storedIds = JSON.parse(localStorage.getItem('camionChiaroAcknowledgedChecks') ?? '[]')
    return Array.isArray(storedIds) ? storedIds.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

function loadArchivedFaultOverrideIds() {
  try {
    const storedIds = JSON.parse(localStorage.getItem('camionChiaroArchivedFaults') ?? '[]')
    return Array.isArray(storedIds) ? storedIds.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

function buildAppSessionFromAuthUser(user) {
  const email = user.email ?? ''
  const isDriver = user.user_metadata?.account_type === 'driver' || email.endsWith(`@${driverAuthDomain}`)

  return {
    role: isDriver ? 'driver' : 'company',
    name: user.user_metadata?.company_name ?? user.user_metadata?.full_name ?? email,
    email,
    username: isDriver ? email.replace(`@${driverAuthDomain}`, '') : undefined,
  }
}

function upsertRecordById(records, nextRecord) {
  if (!nextRecord?.id) return records
  if (records.some((record) => record.id === nextRecord.id)) {
    return records.map((record) => (record.id === nextRecord.id ? nextRecord : record))
  }

  return [...records, nextRecord]
}

function preserveChatReadState(currentMessages, nextMessages) {
  const currentById = new Map(currentMessages.map((message) => [message.id, message]))

  return nextMessages.map((message) => {
    const currentMessage = currentById.get(message.id)
    if (!currentMessage) return message

    return {
      ...message,
      readByCompanyAt: message.readByCompanyAt ?? currentMessage.readByCompanyAt,
      readByDriverAt: message.readByDriverAt ?? currentMessage.readByDriverAt,
    }
  })
}

function upsertChatMessageRecord(messages, nextMessage) {
  if (!nextMessage?.id) return messages
  const currentMessage = messages.find((message) => message.id === nextMessage.id)
  const safeNextMessage = currentMessage
    ? {
        ...nextMessage,
        readByCompanyAt: nextMessage.readByCompanyAt ?? currentMessage.readByCompanyAt,
        readByDriverAt: nextMessage.readByDriverAt ?? currentMessage.readByDriverAt,
      }
    : nextMessage

  return upsertRecordById(messages, safeNextMessage)
}

function startChatBottomScroll(scrollToBottom, listElement) {
  if (typeof window === 'undefined') return () => {}

  let isActive = true
  const frameIds = []
  const timeoutIds = []
  const run = () => {
    if (isActive) scrollToBottom()
  }
  const queueFrame = (callback) => {
    const frameId = window.requestAnimationFrame(() => {
      if (isActive) callback()
    })
    frameIds.push(frameId)
  }

  run()
  queueFrame(() => {
    run()
    queueFrame(run)
  })

  ;[80, 180, 360, 700, 1200, 1800].forEach((delay) => {
    timeoutIds.push(window.setTimeout(run, delay))
  })

  const resizeObserver =
    listElement && typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(run)
      : null

  if (resizeObserver) {
    resizeObserver.observe(listElement)
    Array.from(listElement.children).forEach((child) => resizeObserver.observe(child))
  }

  return () => {
    isActive = false
    frameIds.forEach((frameId) => window.cancelAnimationFrame(frameId))
    timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
    resizeObserver?.disconnect()
  }
}

function App() {
  const [session, setSession] = useState(null)
  const [language, setLanguage] = useState(getInitialLanguage)
  const [items, setItems] = useState(complianceItems)
  const [documentRecords, setDocumentRecords] = useState(driverDocuments)
  const [driverRecords, setDriverRecords] = useState(drivers)
  const [personRecords, setPersonRecords] = useState([])
  const [assetRecords, setAssetRecords] = useState([])
  const [vehicleRecords, setVehicleRecords] = useState(vehicles)
  const [vehicleCheckRecords, setVehicleCheckRecords] = useState([])
  const [faultReportRecords, setFaultReportRecords] = useState([])
  const [chatThreadRecords, setChatThreadRecords] = useState([])
  const [chatMessageRecords, setChatMessageRecords] = useState([])
  const [chatLiveState, setChatLiveState] = useState(emptyChatLiveState)
  const [documentEventRecords, setDocumentEventRecords] = useState([])
  const [companyInvoiceRecords, setCompanyInvoiceRecords] = useState([])
  const [companyStorageSummary, setCompanyStorageSummary] = useState(emptyCompanyStorageSummary)
  const [activeCompanyId, setActiveCompanyId] = useState('')
  const [companyProfile, setCompanyProfile] = useState({
    billingActivatedAt: '',
    billingCustomerId: '',
    billingCurrentPeriodEnd: '',
    billingEmail: '',
    billingPlan: 'starter',
    billingProvider: 'manual',
    billingStatus: 'active',
    billingSubscriptionId: '',
    headquarters: company.location,
    id: '',
    logoPath: company.logoPath ?? '',
    name: company.name,
    vatNumber: company.vat,
  })
  const [assetPreviewUrls, setAssetPreviewUrls] = useState({})
  const [installPromptEvent, setInstallPromptEvent] = useState(null)
  const [isStandaloneMode, setIsStandaloneMode] = useState(isStandaloneApp)
  const [phoneNotificationEnabled, setPhoneNotificationEnabled] = useState(false)
  const [phoneNotificationStatus, setPhoneNotificationStatus] = useState('')
  const [activeView, setActiveView] = useState(getInitialActiveView)
  const [recordsTab, setRecordsTab] = useState(getInitialRecordsTab)
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedDeadline, setSelectedDeadline] = useState(null)
  const [operationsFilter, setOperationsFilter] = useState('inbox')
  const [query, setQuery] = useState('')
  const [driversSyncStatus, setDriversSyncStatus] = useState('')
  const [documentsSyncStatus, setDocumentsSyncStatus] = useState('')
  const [fleetSyncStatus, setFleetSyncStatus] = useState('')
  const [operationsSyncStatus, setOperationsSyncStatus] = useState('')
  const [companySettingsStatus, setCompanySettingsStatus] = useState('')
  const [billingCheckoutStatus, setBillingCheckoutStatus] = useState('')
  const [isBillingCheckoutLoading, setIsBillingCheckoutLoading] = useState(false)
  const [, setChatSyncStatus] = useState('')
  const [driverDocumentUploadStatus, setDriverDocumentUploadStatus] = useState('')
  const [driverSessionLoading, setDriverSessionLoading] = useState(false)
  const [uploadingDriverDocumentId, setUploadingDriverDocumentId] = useState('')
  const [driverUploadSent, setDriverUploadSent] = useState(false)
  const [morningCheckSent, setMorningCheckSent] = useState(false)
  const [faultReported, setFaultReported] = useState(false)
  const [acknowledgedCheckIds, setAcknowledgedCheckIds] = useState(loadAcknowledgedCheckIds)
  const [archivedFaultOverrideIds, setArchivedFaultOverrideIds] = useState(loadArchivedFaultOverrideIds)
  const chatTypingSenderRef = useRef(() => {})

  const t = useCallback((key, values) => translate(language, key, values), [language])
  const i18nValue = useMemo(
    () => ({
      language,
      onLanguageChange: setLanguage,
      t,
    }),
    [language, t],
  )
  const decoratedItems = useMemo(
    () => decorateComplianceWithWorkforce(items, driverRecords, vehicleRecords, personRecords, assetRecords),
    [assetRecords, driverRecords, items, personRecords, vehicleRecords],
  )
  const summary = useMemo(() => getSummary(decoratedItems), [decoratedItems])
  const hasCompanyDataConnection = Boolean(isSupabaseConfigured && activeCompanyId)
  const visibleFaultReportRecords = useMemo(
    () =>
      faultReportRecords.map((report) =>
        archivedFaultOverrideIds.includes(report.id) ? { ...report, status: 'closed' } : report,
      ),
    [archivedFaultOverrideIds, faultReportRecords],
  )
  const assetPaths = useMemo(
    () =>
      [
        companyProfile.logoPath,
        ...driverRecords.map((driver) => driver.profileImagePath),
        ...faultReportRecords.map((report) => report.photoPath),
        ...chatMessageRecords.map((message) => message.attachmentPath),
      ]
        .filter(isPreviewableAssetPath),
    [chatMessageRecords, companyProfile.logoPath, driverRecords, faultReportRecords],
  )

  useEffect(() => {
    localStorage.setItem(languageStorageKey, language)
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    const billingResult = url.searchParams.get('billing')

    if (!billingResult) return

    window.setTimeout(() => {
      if (billingResult === 'success') {
        setBillingCheckoutStatus('Pagamento ricevuto. Sto aggiornando lo stato azienda...')
        setCompanySettingsStatus('Pagamento ricevuto. Stato abbonamento in aggiornamento.')
      }

      if (billingResult === 'cancelled') {
        setBillingCheckoutStatus('Pagamento annullato. Puoi riprovare quando vuoi.')
      }

      if (billingResult === 'portal') {
        setCompanySettingsStatus('Portale fatturazione chiuso.')
      }
    }, 0)

    url.searchParams.delete('billing')
    url.searchParams.delete('session_id')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, [])

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault()
      setInstallPromptEvent(event)
    }

    function handleInstalled() {
      setIsStandaloneMode(true)
      setInstallPromptEvent(null)
      setPhoneNotificationStatus('Camion Chiaro installata sul telefono.')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    getExistingPushSubscription()
      .then((subscription) => setPhoneNotificationEnabled(Boolean(subscription)))
      .catch(() => {})

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || assetPaths.length === 0) return

    let isMounted = true
    const missingPaths = assetPaths.filter((path) => !assetPreviewUrls[path])

    if (missingPaths.length === 0) return

    async function loadAssetUrls() {
      const entries = await Promise.all(
        missingPaths.map(async (path) => {
          const result = await createCompanyAssetSignedUrl(path)
          return [path, result.data?.signedUrl ?? '']
        }),
      )

      if (!isMounted) return

      setAssetPreviewUrls((currentUrls) => ({
        ...currentUrls,
        ...Object.fromEntries(entries.filter(([, url]) => Boolean(url))),
      }))
    }

    loadAssetUrls()

    return () => {
      isMounted = false
    }
  }, [assetPaths, assetPreviewUrls])

  function handleAuthenticated(nextSession) {
    setActiveCompanyId('')
    setAssetPreviewUrls({})
    setCompanyInvoiceRecords([])
    setCompanyStorageSummary(emptyCompanyStorageSummary)

    if (nextSession.role === 'driver') {
      if (isSupabaseConfigured) resetDriverSessionData()
      setDriverSessionLoading(isSupabaseConfigured)
    } else {
      setDriverSessionLoading(false)
    }

    setSession(nextSession)
  }

  function resetDriverSessionData() {
    setItems([])
    setDocumentRecords([])
    setDriverRecords([])
    setPersonRecords([])
    setAssetRecords([])
    setVehicleRecords([])
    setVehicleCheckRecords([])
    setFaultReportRecords([])
    setChatThreadRecords([])
    setChatMessageRecords([])
    setChatLiveState(emptyChatLiveState)
    setDocumentEventRecords([])
    setCompanyInvoiceRecords([])
    setCompanyStorageSummary(emptyCompanyStorageSummary)
    setDriverUploadSent(false)
    setMorningCheckSent(false)
    setFaultReported(false)
    setDriverDocumentUploadStatus('')
    setUploadingDriverDocumentId('')
    setChatSyncStatus('')
  }

  function getAssetPreviewUrl(path) {
    if (!path) return ''
    if (!isPreviewableAssetPath(path)) return path

    return assetPreviewUrls[path] ?? ''
  }

  async function refreshAssetPreviewUrl(path) {
    if (!path || !isSupabaseConfigured || !isPreviewableAssetPath(path)) return ''

    const result = await createCompanyAssetSignedUrl(path)
    const signedUrl = result.data?.signedUrl ?? ''

    if (signedUrl) {
      setAssetPreviewUrls((currentUrls) => ({
        ...currentUrls,
        [path]: signedUrl,
      }))
      return signedUrl
    }

    setAssetPreviewUrls((currentUrls) => {
      const nextUrls = { ...currentUrls }
      delete nextUrls[path]
      return nextUrls
    })

    return ''
  }

  async function refreshStorageSummary(companyId = activeCompanyId) {
    if (!isSupabaseConfigured || !companyId) {
      setCompanyStorageSummary(emptyCompanyStorageSummary)
      return emptyCompanyStorageSummary
    }

    const result = await fetchCompanyStorageSummary(companyId)

    if (result.data) {
      setCompanyStorageSummary(result.data)
      return result.data
    }

    return companyStorageSummary
  }

  async function ensureStorageBudget(file, setStatus) {
    if (!file || !hasCompanyDataConnection) return true

    const latestSummary = await refreshStorageSummary(activeCompanyId)
    const limitBytes = getStorageLimitBytes(companyProfile.billingPlan)
    const nextTotalBytes = (latestSummary?.totalBytes ?? 0) + file.size

    if (nextTotalBytes <= limitBytes) return true

    setStatus(
      `Spazio del piano ${getBillingPlanLabel(companyProfile.billingPlan)} esaurito: ${formatBytes(
        latestSummary?.totalBytes ?? 0,
      )} usati su ${formatBytes(limitBytes)}. Elimina file vecchi o passa a un piano superiore.`,
    )
    return false
  }

  function validateImageFile(file, setStatus, { maxSize = maxProfileImageFileSize, maxSizeLabel = '5 MB' } = {}) {
    if (!file) return false

    if (!isSupportedImageFile(file)) {
      setStatus('Carica un file immagine: JPG, PNG, WEBP o HEIC.')
      return false
    }

    if (file.size > maxSize) {
      setStatus(`Immagine troppo grande. Usa una foto sotto ${maxSizeLabel}.`)
      return false
    }

    return true
  }

  async function prepareImageUploadFile(file, setStatus, options = {}) {
    if (!file) return null

    if (!isSupportedImageFile(file)) {
      setStatus('Carica un file immagine: JPG, PNG, WEBP o HEIC.')
      return null
    }

    setStatus('Ottimizzo immagine...')
    const uploadFile = await compressImageFile(file)

    if (!validateImageFile(uploadFile, setStatus, options)) return null
    if (!(await ensureStorageBudget(uploadFile, setStatus))) return null

    return uploadFile
  }

  async function prepareChatAttachmentUploadFile(file, setStatus) {
    if (!file) return null

    const attachmentKind = getChatAttachmentKind(file.name, file.type)
    const hasSupportedFileShape = isSupportedImageFile(file) || isSupportedAudioFile(file) || isSupportedVideoFile(file)

    if (!hasSupportedFileShape || !attachmentKind || !['audio', 'image', 'video'].includes(attachmentKind)) {
      setStatus('Puoi allegare foto, video o audio nella chat.')
      return null
    }

    if (attachmentKind === 'image') {
      return prepareImageUploadFile(file, setStatus, {
        maxSize: maxChatImageFileSize,
        maxSizeLabel: '8 MB',
      })
    }

    const maxSize = attachmentKind === 'audio' ? maxChatAudioFileSize : maxChatVideoFileSize
    const maxSizeLabel = attachmentKind === 'audio' ? '16 MB' : '64 MB'

    if (file.size > maxSize) {
      setStatus(`File ${attachmentKind === 'audio' ? 'audio' : 'video'} troppo grande. Usa un file sotto ${maxSizeLabel}.`)
      return null
    }

    if (!(await ensureStorageBudget(file, setStatus))) return null

    return file
  }

  async function prepareDriverDocumentUploadFile(file) {
    if (!file) return null

    if (!isSupportedDocumentFile(file)) {
      setDriverDocumentUploadStatus('Carica una foto o un PDF.')
      return null
    }

    setDriverDocumentUploadStatus(isSupportedImageFile(file) ? 'Ottimizzo documento...' : 'Controllo documento...')
    const uploadFile = isSupportedImageFile(file) ? await compressImageFile(file) : file

    if (uploadFile.size > maxDriverDocumentFileSize) {
      setDriverDocumentUploadStatus('File troppo grande. Usa una foto o un PDF sotto 10 MB.')
      return null
    }

    if (!(await ensureStorageBudget(uploadFile, setDriverDocumentUploadStatus))) return null

    return uploadFile
  }

  async function installPhoneApp() {
    if (installPromptEvent?.prompt) {
      await installPromptEvent.prompt()
      const choiceResult = await installPromptEvent.userChoice?.catch(() => null)
      setInstallPromptEvent(null)

      if (choiceResult?.outcome === 'accepted') {
        setIsStandaloneMode(true)
        setPhoneNotificationStatus('Camion Chiaro installata sul telefono.')
        return true
      }
    }

    setPhoneNotificationStatus(getDeviceInstallHint())
    return false
  }

  async function enablePhoneNotifications() {
    if (!session) {
      setPhoneNotificationStatus('Accedi prima di abilitare le notifiche.')
      return false
    }

    if (isSupabaseConfigured && session.role === 'company' && !activeCompanyId) {
      setPhoneNotificationStatus('Aspetta il caricamento azienda, poi riprova.')
      return false
    }

    const support = getPushSupportStatus()

    if (!support.supported) {
      setPhoneNotificationStatus(support.reason)
      return false
    }

    setPhoneNotificationStatus('Richiesta autorizzazione notifiche...')
    const subscriptionResult = await subscribeCurrentBrowserToPush()

    if (subscriptionResult.error || !subscriptionResult.subscription) {
      setPhoneNotificationStatus(subscriptionResult.error?.message ?? 'Notifiche non abilitate.')
      return false
    }

    const saveResult = await savePushSubscription(
      subscriptionResult.subscription,
      session.role === 'driver' ? activeCompanyId || null : activeCompanyId,
    )

    if (saveResult.error) {
      setPhoneNotificationStatus(`Supabase: ${saveResult.error.message}`)
      return false
    }

    if (saveResult.data?.company_id && !activeCompanyId) {
      setActiveCompanyId(saveResult.data.company_id)
    }

    setPhoneNotificationEnabled(true)
    setPhoneNotificationStatus('Notifiche telefono abilitate.')
    return true
  }

  async function notifyPhone(payload) {
    if (!hasCompanyDataConnection || !payload?.targetRole) {
      return {
        data: null,
        error: { message: 'Notifiche telefono disponibili solo con Supabase collegato.' },
      }
    }

    const result = await sendPushNotification({
      companyId: activeCompanyId,
      ...payload,
    })

    if (result.error) return result

    if (result.data?.sent === 0) {
      return {
        data: result.data,
        error: {
          message: result.data.reason ?? 'Nessun telefono ha ricevuto la notifica.',
        },
      }
    }

    return result
  }

  async function recordDocumentEvent(document, eventType, details = {}) {
    if (!document?.id) return false

    if (!hasCompanyDataConnection) {
      const localEvent = {
        actorRole: session?.role ?? 'system',
        createdAt: new Date().toISOString(),
        documentId: document.id,
        documentNumber: document.documentNumber ?? '',
        documentType: document.type,
        driverId: document.driverId,
        eventType,
        filePath: details.filePath ?? '',
        id: `doc-event-${Date.now()}`,
        notes: details.notes ?? '',
        previousFilePath: details.previousFilePath ?? '',
      }

      setDocumentEventRecords((currentEvents) => [localEvent, ...currentEvents].slice(0, 80))
      return true
    }

    const result = await logSupabaseDriverDocumentEvent(document.id, eventType, details)

    if (result.data) {
      setDocumentEventRecords((currentEvents) => [result.data, ...currentEvents].slice(0, 80))
      return true
    }

    return false
  }

  async function uploadCompanyLogo(file) {
    const uploadFile = await prepareImageUploadFile(file, setCompanySettingsStatus, {
      maxSize: maxProfileImageFileSize,
      maxSizeLabel: '5 MB',
    })
    if (!uploadFile) return false

    if (isSupabaseConfigured && session?.role === 'company' && !activeCompanyId) {
      setCompanySettingsStatus('Aspetta il caricamento azienda, poi riprova.')
      return false
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      setCompanySettingsStatus('Caricamento logo azienda...')
      const result = await uploadSupabaseCompanyLogoFile(uploadFile, activeCompanyId, companyProfile.logoPath)

      if (result.error) {
        setCompanySettingsStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }

      if (result.data) {
        setCompanyProfile(result.data)
        if (result.data.logoPath) {
          const signedUrlResult = await createCompanyAssetSignedUrl(result.data.logoPath)
          if (signedUrlResult.data?.signedUrl) {
            setAssetPreviewUrls((currentUrls) => ({
              ...currentUrls,
              [result.data.logoPath]: signedUrlResult.data.signedUrl,
            }))
          }
        }
      }

      void refreshStorageSummary(activeCompanyId)
      setCompanySettingsStatus('Logo azienda aggiornato.')
      return true
    }

    const previewUrl = URL.createObjectURL(uploadFile)
    setCompanyProfile((currentProfile) => ({ ...currentProfile, logoPath: previewUrl }))
    setCompanySettingsStatus('Logo azienda aggiornato in modalità locale.')
    return true
  }

  async function uploadDriverProfileImage(driverId, file) {
    const setStatus = session?.role === 'driver' ? setDriverDocumentUploadStatus : setDriversSyncStatus
    const uploadFile = await prepareImageUploadFile(file, setStatus, {
      maxSize: maxProfileImageFileSize,
      maxSizeLabel: '5 MB',
    })
    if (!uploadFile) return false

    if (isSupabaseConfigured && ['company', 'driver'].includes(session?.role) && !activeCompanyId) {
      setStatus('Aspetta il caricamento azienda, poi riprova.')
      return false
    }

    if (hasCompanyDataConnection && ['company', 'driver'].includes(session?.role)) {
      setStatus('Caricamento foto profilo...')
      const previousDriverImagePath =
        driverRecords.find((driver) => driver.id === driverId)?.profileImagePath ?? ''
      const result = await uploadSupabaseDriverProfileImageFile(
        driverId,
        uploadFile,
        activeCompanyId,
        previousDriverImagePath,
      )

      if (result.error) {
        setStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }

      if (result.data) {
        setDriverRecords((currentDrivers) =>
          currentDrivers.map((driver) => (driver.id === driverId ? { ...driver, ...result.data } : driver)),
        )
        if (result.data.profileImagePath) {
          const signedUrlResult = await createCompanyAssetSignedUrl(result.data.profileImagePath)
          if (signedUrlResult.data?.signedUrl) {
            setAssetPreviewUrls((currentUrls) => ({
              ...currentUrls,
              [result.data.profileImagePath]: signedUrlResult.data.signedUrl,
            }))
          }
        }
      }

      void refreshStorageSummary(activeCompanyId)
      setStatus('Foto profilo aggiornata.')
      return true
    }

    const previewUrl = URL.createObjectURL(uploadFile)
    setDriverRecords((currentDrivers) =>
      currentDrivers.map((driver) => (driver.id === driverId ? { ...driver, profileImagePath: previewUrl } : driver)),
    )
    setStatus('Foto profilo aggiornata in modalità locale.')
    return true
  }

  async function removeDriverProfileImage(driverId) {
    const setStatus = session?.role === 'driver' ? setDriverDocumentUploadStatus : setDriversSyncStatus
    const previousDriverImagePath =
      driverRecords.find((driver) => driver.id === driverId)?.profileImagePath ?? ''

    if (hasCompanyDataConnection && ['company', 'driver'].includes(session?.role)) {
      setStatus('Rimozione foto profilo...')
      const result = await clearSupabaseDriverProfileImageFile(driverId)

      if (result.error) {
        setStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }

      if (result.data) {
        setDriverRecords((currentDrivers) =>
          currentDrivers.map((driver) => (driver.id === driverId ? { ...driver, ...result.data } : driver)),
        )
      }

      await markCompanyAssetStorageFileDeleted(previousDriverImagePath)
      void refreshStorageSummary(activeCompanyId)
      setStatus('Foto profilo rimossa.')
      return true
    }

    setDriverRecords((currentDrivers) =>
      currentDrivers.map((driver) => (driver.id === driverId ? { ...driver, profileImagePath: '' } : driver)),
    )
    setStatus('Foto profilo rimossa in modalità locale.')
    return true
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let isMounted = true

    async function restoreSession() {
      const result = await getCurrentAuthSession()
      const authUser = result.data?.session?.user

      if (isMounted && authUser) {
        const nextSession = buildAppSessionFromAuthUser(authUser)

        if (nextSession.role === 'driver') {
          if (isSupabaseConfigured) resetDriverSessionData()
          setDriverSessionLoading(isSupabaseConfigured)
        } else {
          setDriverSessionLoading(false)
        }

        setSession((currentSession) => currentSession ?? nextSession)
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!session || session.role !== 'company') return

    const viewFromUrl = new URLSearchParams(window.location.search).get('view')

    if (deepLinkViews.has(viewFromUrl)) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [session])

  useEffect(() => {
    if (!session || session.role !== 'company' || !isSupabaseConfigured) return

    let isMounted = true

    async function loadCompanyData() {
      const companyName = session.name?.trim() && !session.name.includes('@') ? session.name.trim() : 'Nuova azienda'
      setDriversSyncStatus('Caricamento dati Supabase...')
      setDocumentsSyncStatus('Caricamento documenti Supabase...')
      setOperationsSyncStatus('Caricamento check e guasti...')
      setFleetSyncStatus('Caricamento flotta Supabase...')
      setChatSyncStatus('Caricamento chat...')
      const companyResult = await ensureCompanyForCurrentUser(companyName)

      if (!isMounted) return

      if (companyResult.error || !companyResult.data?.id) {
        setDriversSyncStatus(`Azienda non collegata. Supabase: ${companyResult.error?.message ?? 'profilo mancante'}`)
        setDocumentsSyncStatus('Documenti non caricati.')
        setFleetSyncStatus('Flotta non caricata.')
        setOperationsSyncStatus('Check e guasti non caricati.')
        setChatSyncStatus('Chat non caricata.')
        return
      }

      const companyId = companyResult.data.id
      setActiveCompanyId(companyId)
      setCompanyProfile(companyResult.data)
      const [
        driversResult,
        peopleResult,
        assetsResult,
        vehiclesResult,
        complianceResult,
        documentsResult,
        documentEventsResult,
        companyInvoicesResult,
        checksResult,
        faultsResult,
        chatThreadsResult,
        chatMessagesResult,
        storageSummaryResult,
      ] = await Promise.all([
        fetchDrivers(companyId),
        fetchCompanyPeople(companyId),
        fetchCompanyAssets(companyId),
        fetchVehicles(companyId),
        fetchComplianceItems(companyId),
        fetchDriverDocuments(companyId),
        fetchDriverDocumentEvents(companyId),
        fetchCompanyInvoices(companyId),
        fetchVehicleChecks(companyId),
        fetchFaultReports(companyId),
        fetchChatThreads(companyId),
        fetchChatMessages(companyId),
        fetchCompanyStorageSummary(companyId),
      ])

      if (!isMounted) return

      if (driversResult.error || peopleResult.error || assetsResult.error || vehiclesResult.error || complianceResult.error || documentsResult.error) {
        setDriversSyncStatus('Supabase non ha risposto correttamente. Sto mostrando i dati locali.')
        setDocumentsSyncStatus('Supabase non ha risposto correttamente. Sto mostrando i documenti locali.')
        setFleetSyncStatus('Supabase non ha risposto correttamente. Sto mostrando i dati locali.')
        setOperationsSyncStatus('Check e guasti non caricati.')
        return
      }

      if (driversResult.data) setDriverRecords(driversResult.data)
      if (peopleResult.data) setPersonRecords(peopleResult.data)
      if (assetsResult.data) setAssetRecords(assetsResult.data)
      if (vehiclesResult.data) setVehicleRecords(vehiclesResult.data)
      if (complianceResult.data) setItems(complianceResult.data)
      if (documentsResult.data) setDocumentRecords(documentsResult.data)
      if (documentEventsResult.data) setDocumentEventRecords(documentEventsResult.data)
      if (companyInvoicesResult.data) setCompanyInvoiceRecords(companyInvoicesResult.data)
      if (checksResult.data) setVehicleCheckRecords(checksResult.data)
      if (faultsResult.data) setFaultReportRecords(faultsResult.data)
      if (chatThreadsResult.data) setChatThreadRecords(chatThreadsResult.data)
      if (chatMessagesResult.data) {
        setChatMessageRecords((currentMessages) => preserveChatReadState(currentMessages, chatMessagesResult.data))
      }
      if (storageSummaryResult.data) setCompanyStorageSummary(storageSummaryResult.data)
      setDriversSyncStatus('Dati Supabase caricati.')
      setDocumentsSyncStatus('Documenti Supabase caricati.')
      setFleetSyncStatus('Dati Supabase caricati.')
      setOperationsSyncStatus(
        checksResult.error || faultsResult.error ? 'Check e guasti non caricati.' : 'Check e guasti caricati.',
      )
      setChatSyncStatus(
        chatThreadsResult.error || chatMessagesResult.error
          ? 'Chat non attiva. Esegui SQL parte 14 e poi riprova.'
          : 'Chat caricata.',
      )
    }

    loadCompanyData()

    return () => {
      isMounted = false
    }
  }, [session])

  useEffect(() => {
    if (!session || session.role !== 'driver' || !isSupabaseConfigured) return

    let isMounted = true

    async function loadDriverData() {
      setDriverSessionLoading(true)
      setOperationsSyncStatus('Caricamento area autista...')
      setChatSyncStatus('Caricamento chat...')
      const driverSessionResult = await fetchDriverSessionData()

      if (!isMounted) return

      if (driverSessionResult.data) {
        if (driverSessionResult.data.companyId) setActiveCompanyId(driverSessionResult.data.companyId)
        if (driverSessionResult.data.companyProfile) setCompanyProfile(driverSessionResult.data.companyProfile)
        setDriverRecords(driverSessionResult.data.drivers ?? [])
        setVehicleRecords(driverSessionResult.data.vehicles ?? [])
        setItems(driverSessionResult.data.complianceItems ?? [])
        setDocumentRecords(driverSessionResult.data.documents ?? [])
        setVehicleCheckRecords(driverSessionResult.data.vehicleChecks ?? [])
        setFaultReportRecords(driverSessionResult.data.faultReports ?? [])
        const companyId = driverSessionResult.data.companyId
        if (companyId) {
          const [chatThreadsResult, chatMessagesResult, storageSummaryResult] = await Promise.all([
            fetchChatThreads(companyId),
            fetchChatMessages(companyId),
            fetchCompanyStorageSummary(companyId),
          ])

          if (!isMounted) return

          if (chatThreadsResult.data) setChatThreadRecords(chatThreadsResult.data)
          if (chatMessagesResult.data) {
            setChatMessageRecords((currentMessages) => preserveChatReadState(currentMessages, chatMessagesResult.data))
          }
          if (storageSummaryResult.data) setCompanyStorageSummary(storageSummaryResult.data)
          setChatSyncStatus(
            chatThreadsResult.error || chatMessagesResult.error
              ? 'Chat non attiva. L azienda deve eseguire SQL parte 14.'
              : 'Chat caricata.',
          )
        }
        setOperationsSyncStatus(
          (driverSessionResult.data.vehicles ?? []).some((vehicle) => vehicle.fleetType !== 'semirimorchio')
            ? 'Area autista caricata.'
            : 'Nessun mezzo disponibile. L azienda deve aggiungere almeno un furgone, motrice o trattore in Flotta.',
        )
        setDriverSessionLoading(false)
        return
      }

      const [driversResult, vehiclesResult, complianceResult, documentsResult, checksResult, faultsResult] = await Promise.all([
        fetchDrivers(),
        fetchVehicles(),
        fetchComplianceItems(),
        fetchDriverDocuments(),
        fetchVehicleChecks(),
        fetchFaultReports(),
      ])

      if (!isMounted) return

      if (driversResult.data) setDriverRecords(driversResult.data)
      if (vehiclesResult.data) setVehicleRecords(vehiclesResult.data)
      if (complianceResult.data) setItems(complianceResult.data)
      if (documentsResult.data) setDocumentRecords(documentsResult.data)
      if (checksResult.data) setVehicleCheckRecords(checksResult.data)
      if (faultsResult.data) setFaultReportRecords(faultsResult.data)
      setChatSyncStatus('Chat locale disponibile dopo il primo messaggio.')
      setOperationsSyncStatus(
        vehiclesResult.data?.some((vehicle) => vehicle.fleetType !== 'semirimorchio')
          ? 'Area autista caricata.'
          : driverSessionResult.error?.message ?? 'Nessun mezzo disponibile in area autista.',
      )
      setDriverSessionLoading(false)
    }

    loadDriverData()

    return () => {
      isMounted = false
    }
  }, [session])

  useEffect(() => {
    if (!activeCompanyId || !isSupabaseConfigured) return

    let isMounted = true
    let unsubscribeChat = () => {}
    let unsubscribeOperations = () => {}
    let chatRefreshTimer = 0
    let documentsRefreshTimer = 0
    let storageRefreshTimer = 0

    async function refreshChatRecords() {
      const [threadsResult, messagesResult] = await Promise.all([
        fetchChatThreads(activeCompanyId),
        fetchChatMessages(activeCompanyId),
      ])

      if (!isMounted) return

      if (threadsResult.data) setChatThreadRecords(threadsResult.data)
      if (messagesResult.data) {
        setChatMessageRecords((currentMessages) => preserveChatReadState(currentMessages, messagesResult.data))
      }
    }

    async function refreshDriverDocuments() {
      const [documentsResult, documentEventsResult] = await Promise.all([
        fetchDriverDocuments(activeCompanyId),
        fetchDriverDocumentEvents(activeCompanyId),
      ])

      if (!isMounted) return

      if (documentsResult.data) setDocumentRecords(documentsResult.data)
      if (documentEventsResult.data) setDocumentEventRecords(documentEventsResult.data)
    }

    async function refreshCompanyStorageRecords() {
      const storageResult = await fetchCompanyStorageSummary(activeCompanyId)

      if (!isMounted) return
      if (storageResult.data) setCompanyStorageSummary(storageResult.data)
    }

    subscribeToChatMessages(activeCompanyId, (message, payload) => {
      if (!isMounted) return

      setChatMessageRecords((currentMessages) => upsertChatMessageRecord(currentMessages, message))
      if (payload?.eventType === 'INSERT') {
        if (session?.role === 'company' && message.senderRole === 'driver') {
          setChatSyncStatus('Nuovo messaggio autista.')
        }

        if (session?.role === 'driver' && message.senderRole === 'company') {
          setChatSyncStatus('Nuovo messaggio azienda.')
        }
      }

      setChatThreadRecords((currentThreads) => {
        if (!currentThreads.some((thread) => thread.id === message.threadId)) {
          fetchChatThreads(activeCompanyId).then((result) => {
            if (isMounted && result.data) setChatThreadRecords(result.data)
          })
          return currentThreads
        }

        return currentThreads.map((thread) =>
          thread.id === message.threadId
            ? { ...thread, lastMessageAt: message.createdAt, updatedAt: message.createdAt }
            : thread,
        )
      })
    }).then((cleanup) => {
      unsubscribeChat = cleanup
    })

    subscribeToOperationalUpdates(activeCompanyId, {
      onFaultReport: (report) => {
        if (!isMounted) return

        setFaultReportRecords((currentReports) => upsertRecordById(currentReports, report))
        if (session?.role === 'company') {
          setOperationsSyncStatus('Nuovo guasto ricevuto dall app autista.')
        }
      },
      onFaultReportUpdate: (report) => {
        if (!isMounted) return

        setFaultReportRecords((currentReports) => upsertRecordById(currentReports, report))
      },
      onVehicleCheck: (check) => {
        if (!isMounted) return

        setVehicleCheckRecords((currentChecks) => upsertRecordById(currentChecks, check))
        if (session?.role === 'company') {
          setOperationsSyncStatus(
            hasCheckIssues(check)
              ? 'Nuovo check critico ricevuto dall app autista.'
              : 'Nuovo check mattutino ricevuto dall app autista.',
          )
        }
      },
    }).then((cleanup) => {
      unsubscribeOperations = cleanup
    })

    void refreshChatRecords()
    void refreshDriverDocuments()
    void refreshCompanyStorageRecords()
    chatRefreshTimer = window.setInterval(refreshChatRecords, 4000)
    documentsRefreshTimer = window.setInterval(refreshDriverDocuments, 8000)
    storageRefreshTimer = window.setInterval(refreshCompanyStorageRecords, 15000)

    return () => {
      isMounted = false
      window.clearInterval(chatRefreshTimer)
      window.clearInterval(documentsRefreshTimer)
      window.clearInterval(storageRefreshTimer)
      unsubscribeChat()
      unsubscribeOperations()
    }
  }, [activeCompanyId, session?.role])

  useEffect(() => {
    localStorage.setItem('camionChiaroAcknowledgedChecks', JSON.stringify(acknowledgedCheckIds))
  }, [acknowledgedCheckIds])

  useEffect(() => {
    localStorage.setItem('camionChiaroArchivedFaults', JSON.stringify(archivedFaultOverrideIds))
  }, [archivedFaultOverrideIds])

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return decoratedItems.filter((item) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'urgent' && ['expired', 'critical'].includes(item.urgency.key)) ||
        (activeFilter === 'month' && item.urgency.days <= 30) ||
        (activeFilter === 'driver' && item.scope === 'driver') ||
        (activeFilter === 'vehicle' && item.scope === 'vehicle') ||
        (activeFilter === 'medical' && item.type.toLowerCase().includes('medica'))

      if (!matchesFilter) return false
      if (!needle) return true

      return [item.type, item.assignee, item.detail, item.documentNumber, item.owner]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle))
    })
  }, [activeFilter, decoratedItems, query])

  async function handleSignOut() {
    await signOut()
    setSession(null)
    setQuery('')
    setActiveView('dashboard')
    setActiveFilter('all')
    setOperationsFilter('inbox')
    setOperationsSyncStatus('')
    setCompanySettingsStatus('')
    setBillingCheckoutStatus('')
    setIsBillingCheckoutLoading(false)
    setActiveCompanyId('')
    setAssetPreviewUrls({})
    setDriverSessionLoading(false)
    setItems(complianceItems)
    setDocumentRecords(driverDocuments)
    setDriverRecords(drivers)
    setPersonRecords([])
    setAssetRecords([])
    setVehicleRecords(vehicles)
    setVehicleCheckRecords([])
    setFaultReportRecords([])
    setChatThreadRecords([])
    setChatMessageRecords([])
    setChatLiveState(emptyChatLiveState)
    setDocumentEventRecords([])
    setCompanyInvoiceRecords([])
    setCompanyStorageSummary(emptyCompanyStorageSummary)
    setChatSyncStatus('')
    setCompanyProfile({
      billingActivatedAt: '',
      billingCustomerId: '',
      billingCurrentPeriodEnd: '',
      billingEmail: '',
      billingPlan: 'starter',
      billingProvider: 'manual',
      billingStatus: 'active',
      billingSubscriptionId: '',
      headquarters: company.location,
      id: '',
      logoPath: company.logoPath ?? '',
      name: company.name,
      vatNumber: company.vat,
    })
  }

  async function updateCompanyProfile(updates) {
    const cleanUpdates = {
      headquarters: updates.headquarters.trim(),
      name: updates.name.trim(),
      vatNumber: updates.vatNumber.trim(),
    }

    if (!cleanUpdates.name) {
      setCompanySettingsStatus('Inserisci la ragione sociale.')
      return false
    }

    setCompanyProfile((currentProfile) => ({ ...currentProfile, ...cleanUpdates }))
    setCompanySettingsStatus('Salvataggio impostazioni...')

    if (hasCompanyDataConnection && session?.role === 'company') {
      const result = await updateSupabaseCompanyProfile(cleanUpdates, activeCompanyId)

      if (result.error) {
        setCompanySettingsStatus(`Dati aggiornati localmente. Supabase: ${result.error.message}`)
        return false
      }

      if (result.data) setCompanyProfile(result.data)
      setCompanySettingsStatus('Impostazioni azienda salvate.')
      return true
    }

    setCompanySettingsStatus('Impostazioni azienda salvate in modalità locale.')
    return true
  }

  function addComplianceItem(formItem) {
    setItems((currentItems) => [formItem, ...currentItems])
  }

  function markRenewing(id) {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, status: 'renewing' } : item)),
    )
  }

  function sendReminder(id) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, lastReminderAt: new Date().toISOString() } : item,
      ),
    )
  }

  function closeItem(id) {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, status: 'done' } : item)),
    )
  }

  async function addDriverRecord(driver) {
    const temporaryPassword = driver.password?.trim() ?? ''
    const driverWithoutPassword = { ...driver }
    delete driverWithoutPassword.password
    const cleanDriver = {
      ...driverWithoutPassword,
      authEmail: buildDriverAuthEmail(driver.username),
      username: normalizeDriverUsername(driver.username),
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      setDriversSyncStatus('Creo account autista e salvo anagrafica...')
      const result = temporaryPassword
        ? await createSupabaseDriverAccount(cleanDriver, temporaryPassword, activeCompanyId)
        : await createSupabaseDriver(cleanDriver, activeCompanyId)

      if (result.error) {
        setDriversSyncStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }

      setDriverRecords((currentDrivers) => [result.data, ...currentDrivers])
      setDriversSyncStatus(
        temporaryPassword
          ? `Autista creato. Username: ${cleanDriver.username}. Password temporanea: ${temporaryPassword}`
          : 'Autista salvato su Supabase.',
      )
      return true
    }

    setDriverRecords((currentDrivers) => [cleanDriver, ...currentDrivers])
    setDriversSyncStatus('Autista aggiunto in modalità locale.')
    return true
  }

  async function updateDriverRecord(driverId, updates) {
    if (hasCompanyDataConnection && session?.role === 'company') {
      setDriversSyncStatus('Aggiornamento autista su Supabase...')
      const result = await updateSupabaseDriver(driverId, updates)

      if (result.error) {
        setDriversSyncStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }

      setDriverRecords((currentDrivers) =>
        currentDrivers.map((driver) => (driver.id === driverId ? { ...driver, ...result.data, vehicleId: updates.vehicleId ?? driver.vehicleId } : driver)),
      )
      setDriversSyncStatus('Autista aggiornato.')
      return true
    }

    setDriverRecords((currentDrivers) =>
      currentDrivers.map((driver) => (driver.id === driverId ? { ...driver, ...updates } : driver)),
    )
    setDriversSyncStatus('Autista aggiornato in modalità locale.')
    return true
  }

  async function archiveDriverRecord(driverId) {
    if (hasCompanyDataConnection && session?.role === 'company') {
      setDriversSyncStatus('Archiviazione autista su Supabase...')
      const result = await archiveSupabaseDriver(driverId)

      if (result.error) {
        setDriversSyncStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }
    }

    setDriverRecords((currentDrivers) =>
      currentDrivers.map((driver) =>
        driver.id === driverId ? { ...driver, status: 'Archiviato', vehicleId: '' } : driver,
      ),
    )
    setDriversSyncStatus(hasCompanyDataConnection ? 'Autista archiviato.' : 'Autista archiviato in modalità locale.')
    return true
  }

  async function addVehicleRecord(vehicle) {
    const cleanVehicle = {
      ...vehicle,
      km: Number(vehicle.km) || 0,
      plate: normalizePlate(vehicle.plate),
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      setFleetSyncStatus('Salvataggio mezzo su Supabase...')
      const result = await createSupabaseVehicle(cleanVehicle, activeCompanyId)

      if (result.error) {
        setFleetSyncStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }

      setVehicleRecords((currentVehicles) => [result.data, ...currentVehicles])
      setFleetSyncStatus('Mezzo salvato su Supabase.')
      return true
    }

    setVehicleRecords((currentVehicles) => [cleanVehicle, ...currentVehicles])
    setFleetSyncStatus('Mezzo aggiunto in modalità locale.')
    return true
  }

  async function updateVehicleRecord(vehicleId, updates) {
    const cleanUpdates = {
      ...updates,
      km: Number(updates.km) || 0,
      plate: normalizePlate(updates.plate),
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      setFleetSyncStatus('Aggiornamento mezzo su Supabase...')
      const result = await updateSupabaseVehicle(vehicleId, cleanUpdates)

      if (result.error) {
        setFleetSyncStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }

      setVehicleRecords((currentVehicles) =>
        currentVehicles.map((vehicle) => (vehicle.id === vehicleId ? result.data : vehicle)),
      )
      setFleetSyncStatus('Mezzo aggiornato.')
      return true
    }

    setVehicleRecords((currentVehicles) =>
      currentVehicles.map((vehicle) => (vehicle.id === vehicleId ? { ...vehicle, ...cleanUpdates } : vehicle)),
    )
    setFleetSyncStatus('Mezzo aggiornato in modalità locale.')
    return true
  }

  async function archiveVehicleRecord(vehicleId) {
    if (hasCompanyDataConnection && session?.role === 'company') {
      setFleetSyncStatus('Archiviazione mezzo su Supabase...')
      const result = await archiveSupabaseVehicle(vehicleId)

      if (result.error) {
        setFleetSyncStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }
    }

    setVehicleRecords((currentVehicles) =>
      currentVehicles.map((vehicle) =>
        vehicle.id === vehicleId ? { ...vehicle, status: 'Archiviato' } : vehicle,
      ),
    )
    setDriverRecords((currentDrivers) =>
      currentDrivers.map((driver) => (driver.vehicleId === vehicleId ? { ...driver, vehicleId: '' } : driver)),
    )
    setFleetSyncStatus(hasCompanyDataConnection ? 'Mezzo archiviato.' : 'Mezzo archiviato in modalità locale.')
    return true
  }

  async function addDriverDocumentRecord(document) {
    const cleanDocument = {
      ...document,
      documentNumber: document.documentNumber.trim(),
      filePath: document.filePath.trim(),
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      setDocumentsSyncStatus('Salvataggio documento su Supabase...')
      const result = await createSupabaseDriverDocument(cleanDocument, activeCompanyId)

      if (result.error) {
        setDocumentsSyncStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }

      setDocumentRecords((currentDocuments) => [result.data, ...currentDocuments])
      setDocumentsSyncStatus('Documento salvato su Supabase.')
      void recordDocumentEvent(result.data, 'created')
      void notifyPhone({
        body: `${result.data.type} disponibile in app.`,
        driverId: result.data.driverId,
        tag: `document-created-${result.data.id}`,
        targetRole: 'driver',
        title: companyName,
        url: '/?view=documents',
      })
      return result.data
    }

    if (hasCompanyDataConnection && session?.role === 'driver') {
      setDocumentsSyncStatus('Creazione documento autista su Supabase...')
      const result = await createSupabaseOwnDriverDocument(cleanDocument)

      if (result.error) {
        setDocumentsSyncStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }

      setDocumentRecords((currentDocuments) => [result.data, ...currentDocuments])
      setDocumentsSyncStatus('Documento autista creato.')
      void recordDocumentEvent(result.data, 'created')
      return result.data
    }

    setDocumentRecords((currentDocuments) => [cleanDocument, ...currentDocuments])
    setDocumentsSyncStatus('Documento aggiunto in modalità locale.')
    void recordDocumentEvent(cleanDocument, 'created')
    return cleanDocument
  }

  async function updateDriverDocumentRecord(documentId, updates) {
    const cleanUpdates = {
      ...updates,
      documentNumber: updates.documentNumber?.trim() ?? '',
      filePath: updates.filePath?.trim() ?? '',
    }

    if (hasCompanyDataConnection && ['company', 'driver'].includes(session?.role)) {
      setDocumentsSyncStatus('Aggiornamento documento su Supabase...')
      const result = await updateSupabaseDriverDocument(documentId, cleanUpdates)

      if (result.error) {
        setDocumentsSyncStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }

      setDocumentRecords((currentDocuments) =>
        currentDocuments.map((document) => (document.id === documentId ? result.data : document)),
      )
      setDocumentsSyncStatus('Documento aggiornato.')
      return true
    }

    setDocumentRecords((currentDocuments) =>
      currentDocuments.map((document) => (document.id === documentId ? { ...document, ...cleanUpdates } : document)),
    )
    setDocumentsSyncStatus('Documento aggiornato in modalità locale.')
    return true
  }

  async function removeDriverDocumentFile(document) {
    const nextDocument = {
      ...document,
      filePath: '',
      status: 'Mancante',
    }

    const removed = await updateDriverDocumentRecord(document.id, nextDocument)

    if (removed) {
      void recordDocumentEvent(document, 'file_removed', { previousFilePath: document.filePath })
      if (hasCompanyDataConnection) {
        await markDriverDocumentStorageFileDeleted(document.filePath)
        void refreshStorageSummary(activeCompanyId)
      }
      setDriverDocumentUploadStatus('File documento eliminato. La scheda resta disponibile.')
    }

    return removed
  }

  async function removeDriverDocumentRecord(documentId) {
    const document = documentRecords.find((currentDocument) => currentDocument.id === documentId)

    if (hasCompanyDataConnection && session?.role === 'company') {
      if (document) await recordDocumentEvent(document, 'deleted')
      setDocumentsSyncStatus('Rimozione documento da Supabase...')
      const result = await deleteSupabaseDriverDocument(documentId)

      if (result.error) {
        setDocumentsSyncStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }

      if (document?.filePath) {
        await markDriverDocumentStorageFileDeleted(document.filePath)
        void refreshStorageSummary(activeCompanyId)
      }
    }

    if (!hasCompanyDataConnection && document) void recordDocumentEvent(document, 'deleted')
    setDocumentRecords((currentDocuments) => currentDocuments.filter((document) => document.id !== documentId))
    setDocumentsSyncStatus(hasCompanyDataConnection ? 'Documento rimosso.' : 'Documento rimosso in modalità locale.')
    return true
  }

  async function uploadDriverDocumentFile(document, file) {
    if (!file) return false

    const uploadFile = await prepareDriverDocumentUploadFile(file)
    if (!uploadFile) return false

    setUploadingDriverDocumentId(document.id)
    setDriverDocumentUploadStatus('Caricamento documento...')

    if (hasCompanyDataConnection && ['company', 'driver'].includes(session?.role)) {
      const result = await uploadSupabaseDriverDocumentFile(document, uploadFile, activeCompanyId)
      setUploadingDriverDocumentId('')

      if (result.error) {
        setDriverDocumentUploadStatus(`Errore upload: ${result.error.message}`)
        return false
      }

      if (result.data) {
        setDocumentRecords((currentDocuments) =>
          currentDocuments.map((currentDocument) =>
            currentDocument.id === document.id ? result.data : currentDocument,
          ),
        )
        void recordDocumentEvent(result.data, 'file_uploaded', {
          filePath: result.data.filePath,
          previousFilePath: document.filePath,
        })
        if (session?.role === 'company') {
          void notifyPhone({
            body: `${result.data.type} aggiornato dall azienda.`,
            driverId: result.data.driverId,
            tag: `document-file-${result.data.id}`,
            targetRole: 'driver',
            title: companyName,
            url: '/?view=documents',
          })
        }
      }
      void refreshStorageSummary(activeCompanyId)
      setDriverUploadSent(true)
      setDriverDocumentUploadStatus('Documento caricato. Ora puoi aprirlo dall app.')
      return true
    }

    setDocumentRecords((currentDocuments) =>
      currentDocuments.map((currentDocument) =>
        currentDocument.id === document.id
          ? { ...currentDocument, filePath: uploadFile.name, status: 'Caricato' }
          : currentDocument,
      ),
    )
    setUploadingDriverDocumentId('')
    setDriverUploadSent(true)
    setDriverDocumentUploadStatus('Documento selezionato in modalità locale.')
    void recordDocumentEvent({ ...document, filePath: uploadFile.name, status: 'Caricato' }, 'file_uploaded', {
      filePath: uploadFile.name,
      previousFilePath: document.filePath,
    })
    return true
  }

  async function openDriverDocumentFile(document) {
    if (!document.filePath) {
      setDriverDocumentUploadStatus('Prima carica una foto o un PDF per questo documento.')
      return false
    }

    if (document.filePath.startsWith('http')) {
      window.open(document.filePath, '_blank', 'noopener,noreferrer')
      return true
    }

    if (!isSupabaseConfigured) {
      setDriverDocumentUploadStatus('File presente solo in demo locale. Con Supabase Storage si aprira qui.')
      return false
    }

    setDriverDocumentUploadStatus('Apro documento...')
    const result = await createDriverDocumentSignedUrl(document.filePath)

    if (result.error || !result.data?.signedUrl) {
      setDriverDocumentUploadStatus(`Errore apertura: ${result.error?.message ?? 'link non disponibile'}`)
      return false
    }

    window.open(result.data.signedUrl, '_blank', 'noopener,noreferrer')
    setDriverDocumentUploadStatus('Documento aperto in una nuova scheda.')
    return true
  }

  async function openCompanyInvoiceFile(invoice) {
    if (!invoice?.pdfPath) {
      setCompanySettingsStatus('PDF fattura non ancora caricato.')
      return false
    }

    if (invoice.pdfPath.startsWith('http')) {
      window.open(invoice.pdfPath, '_blank', 'noopener,noreferrer')
      return true
    }

    if (!isSupabaseConfigured) {
      setCompanySettingsStatus('PDF disponibile quando Supabase Storage e collegato.')
      return false
    }

    setCompanySettingsStatus('Apro fattura...')
    const result = await createCompanyInvoiceSignedUrl(invoice.pdfPath)

    if (result.error || !result.data?.signedUrl) {
      setCompanySettingsStatus(`Errore apertura fattura: ${result.error?.message ?? 'link non disponibile'}`)
      return false
    }

    window.open(result.data.signedUrl, '_blank', 'noopener,noreferrer')
    setCompanySettingsStatus('Fattura aperta in una nuova scheda.')
    return true
  }

  async function startBillingCheckout({ billingProfile, plan }) {
    if (!activeCompanyId) {
      setBillingCheckoutStatus('Azienda non ancora collegata. Aggiorna la pagina e riprova.')
      return false
    }

    setIsBillingCheckoutLoading(true)
    setBillingCheckoutStatus('Preparo il pagamento sicuro...')
    const result = await createBillingCheckoutSession({
      billingProfile,
      companyId: activeCompanyId,
      plan,
    })
    setIsBillingCheckoutLoading(false)

    if (result.error || !result.data?.url) {
      setBillingCheckoutStatus(result.error?.message ?? 'Checkout non disponibile.')
      return false
    }

    window.location.assign(result.data.url)
    return true
  }

  async function openBillingPortal() {
    if (!activeCompanyId) {
      setCompanySettingsStatus('Azienda non ancora collegata.')
      return false
    }

    setCompanySettingsStatus('Apro portale fatturazione...')
    const result = await createBillingPortalSession(activeCompanyId)

    if (result.error || !result.data?.url) {
      setCompanySettingsStatus(result.error?.message ?? 'Portale fatturazione non disponibile.')
      return false
    }

    window.location.assign(result.data.url)
    return true
  }

  function getDriverDisplayName(driverId) {
    return driverRecords.find((driver) => driver.id === driverId)?.name ?? 'Autista'
  }

  function getVehicleDisplayName(vehicleId) {
    const vehicle = vehicleRecords.find((vehicleRecord) => vehicleRecord.id === vehicleId)
    if (!vehicle) return 'mezzo'

    return [vehicle.plate, vehicle.model].filter(Boolean).join(' - ') || 'mezzo'
  }

  function getCriticalCheckIssues(check) {
    return [
      check.lightsOk === false ? 'luci' : null,
      check.tiresOk === false ? 'pneumatici' : null,
      check.documentsOnBoard === false ? 'documenti a bordo' : null,
    ].filter(Boolean)
  }

  async function submitMorningCheck(check) {
    const localCheck = {
      ...check,
      createdAt: new Date().toISOString(),
      id: `chk-${Date.now()}`,
    }

    setOperationsSyncStatus('Invio check mattutino...')

    if (hasCompanyDataConnection && session?.role === 'driver') {
      const result = await createSupabaseVehicleCheck(check, activeCompanyId)

      if (result.error) {
        setOperationsSyncStatus(`Errore check: ${result.error.message}`)
        return false
      }

      setVehicleCheckRecords((currentChecks) => [result.data, ...currentChecks])
      setMorningCheckSent(true)
      const criticalIssues = getCriticalCheckIssues(check)

      if (criticalIssues.length > 0) {
        const pushResult = await notifyPhone({
          body: `Check critico: ${criticalIssues.join(', ')} su ${getVehicleDisplayName(check.tractorId)}.`,
          tag: `critical-check-${result.data.id}`,
          targetRole: 'company',
          title: getDriverDisplayName(check.driverId),
          url: '/?view=notifications',
        })

        setOperationsSyncStatus(
          pushResult.error
            ? `Check critico inviato. Notifica titolare non inviata: ${pushResult.error.message}`
            : 'Check critico inviato. Notifica titolare inviata.',
        )
        return true
      }

      setOperationsSyncStatus('Check mattutino inviato all azienda.')
      return true
    }

    setVehicleCheckRecords((currentChecks) => [localCheck, ...currentChecks])
    setMorningCheckSent(true)
    setOperationsSyncStatus(
      session?.role === 'company'
        ? 'Anteprima azienda: check simulato. Dall accesso autista viene salvato.'
        : 'Check registrato in modalità locale.',
    )
    return true
  }

  async function submitFaultReport(report) {
    const { photoFile, ...reportData } = report
    let uploadPhotoFile = photoFile ?? null

    if (photoFile) {
      uploadPhotoFile = await prepareImageUploadFile(photoFile, setOperationsSyncStatus, {
        maxSize: maxOperationalImageFileSize,
        maxSizeLabel: '8 MB',
      })
      if (!uploadPhotoFile) return false
    }

    const localReport = {
      ...reportData,
      createdAt: new Date().toISOString(),
      id: `fault-${Date.now()}`,
      photoPath: uploadPhotoFile ? URL.createObjectURL(uploadPhotoFile) : reportData.photoPath ?? '',
      status: 'open',
      updatedAt: new Date().toISOString(),
    }

    setOperationsSyncStatus('Invio segnalazione guasto...')

    if (hasCompanyDataConnection && session?.role === 'driver') {
      const result = await createSupabaseFaultReport(reportData, activeCompanyId, uploadPhotoFile)

      if (result.error) {
        setOperationsSyncStatus(`Errore guasto: ${result.error.message}`)
        return false
      }

      setFaultReportRecords((currentReports) => [result.data, ...currentReports])
      void refreshStorageSummary(activeCompanyId)
      setFaultReported(true)
      const pushResult = await notifyPhone({
        body: `${result.data.title} su ${getVehicleDisplayName(reportData.vehicleId)}.`,
        tag: `fault-report-${result.data.id}`,
        targetRole: 'company',
        title: getDriverDisplayName(reportData.driverId),
        url: '/?view=notifications',
      })

      setOperationsSyncStatus(
        pushResult.error
          ? `Guasto segnalato. Notifica titolare non inviata: ${pushResult.error.message}`
          : 'Guasto segnalato. Notifica titolare inviata.',
      )
      return true
    }

    setFaultReportRecords((currentReports) => [localReport, ...currentReports])
    setFaultReported(true)
    setOperationsSyncStatus(
      session?.role === 'company'
        ? 'Anteprima azienda: guasto simulato. Dall accesso autista viene salvato.'
        : 'Guasto registrato in modalità locale.',
    )
    return true
  }

  async function sendChatMessage({ attachmentFile = null, body = '', driverId, replyToMessage = null, senderRole, threadId }) {
    const cleanBody = String(body ?? '').trim()
    let uploadAttachmentFile = attachmentFile

    if (!driverId) {
      setChatSyncStatus('Seleziona un autista prima di inviare.')
      return false
    }

    if (!cleanBody && !attachmentFile) {
      setChatSyncStatus('Scrivi un messaggio o allega un file.')
      return false
    }

    if (attachmentFile) {
      uploadAttachmentFile = await prepareChatAttachmentUploadFile(attachmentFile, setChatSyncStatus)
      if (!uploadAttachmentFile) return false
    }

    const selectedDriver = driverRecords.find((driver) => driver.id === driverId)
    const messageCompanyId = activeCompanyId || selectedDriver?.companyId || ''
    const existingThread = chatThreadRecords.find(
      (thread) => thread.id === threadId || (thread.driverId === driverId && thread.contextType === 'general'),
    )

    setChatSyncStatus('Invio messaggio...')

    if (isSupabaseConfigured && ['company', 'driver'].includes(session?.role) && !messageCompanyId) {
      setChatSyncStatus('Chat non inviata: azienda non caricata. Riapri l app e riprova.')
      return false
    }

    if (isSupabaseConfigured && messageCompanyId && ['company', 'driver'].includes(session?.role)) {
      let targetThread = existingThread

      if (!targetThread) {
        const threadResult = await createSupabaseChatThread(
          {
            contextType: 'general',
            driverId,
            title: selectedDriver?.name ? `Chat ${selectedDriver.name}` : 'Chat autista',
          },
          messageCompanyId,
        )

        if (threadResult.error || !threadResult.data) {
          setChatSyncStatus(`Errore chat: ${threadResult.error?.message ?? 'conversazione non creata'}`)
          return false
        }

        targetThread = threadResult.data
        setChatThreadRecords((currentThreads) => upsertRecordById(currentThreads, targetThread))
      }

      const messageResult = await createSupabaseChatMessage(
        {
          attachmentPath: '',
          body: composeChatMessageBody(cleanBody, replyToMessage),
          senderRole,
          threadId: targetThread.id,
        },
        messageCompanyId,
        uploadAttachmentFile,
      )

      if (messageResult.error || !messageResult.data) {
        setChatSyncStatus(`Errore messaggio: ${messageResult.error?.message ?? 'messaggio non salvato'}`)
        return false
      }

      setChatMessageRecords((currentMessages) => upsertChatMessageRecord(currentMessages, messageResult.data))
      void refreshStorageSummary(messageCompanyId)
      setChatThreadRecords((currentThreads) =>
        upsertRecordById(currentThreads, {
          ...targetThread,
          lastMessageAt: messageResult.data.createdAt,
          updatedAt: messageResult.data.createdAt,
        }),
      )
      setChatSyncStatus('Messaggio inviato.')
      const attachmentKind = uploadAttachmentFile ? getChatAttachmentKind(uploadAttachmentFile.name, uploadAttachmentFile.type) : ''
      const chatNotificationBody = cleanBody || (uploadAttachmentFile ? getChatAttachmentLabel(attachmentKind, t) : 'Risposta in chat.')
      if (senderRole === 'company') {
        const pushResult = await notifyPhone({
          body: chatNotificationBody,
          driverId,
          notificationType: 'chat',
          tag: `chat-${targetThread.id}`,
          targetRole: 'driver',
          threadId: targetThread.id,
          title: companyName,
          url: '/?view=chat',
        })

        if (pushResult.error) {
          setChatSyncStatus(`Messaggio inviato. Notifica telefono non inviata: ${pushResult.error.message}`)
        } else {
          setChatSyncStatus('Messaggio inviato. Notifica telefono inviata.')
        }
      } else if (senderRole === 'driver') {
        const pushResult = await notifyPhone({
          body: chatNotificationBody,
          notificationType: 'chat',
          tag: `chat-company-${targetThread.id}`,
          targetRole: 'company',
          threadId: targetThread.id,
          title: getDriverDisplayName(driverId),
          url: '/?view=chat',
        })

        if (pushResult.error) {
          setChatSyncStatus(`Messaggio inviato. Notifica titolare non inviata: ${pushResult.error.message}`)
        } else {
          setChatSyncStatus('Messaggio inviato. Notifica titolare inviata.')
        }
      }
      return true
    }

    const now = new Date().toISOString()
    const localThread =
      existingThread ??
      {
        companyId: activeCompanyId || companyProfile.id || 'local-company',
        contextType: 'general',
        createdAt: now,
        driverId,
        faultReportId: null,
        id: `chat-thread-${driverId}-${Date.now()}`,
        lastMessageAt: now,
        status: 'open',
        title: selectedDriver?.name ? `Chat ${selectedDriver.name}` : 'Chat autista',
        updatedAt: now,
        vehicleCheckId: null,
      }
    const localMessage = {
      attachmentPath: uploadAttachmentFile ? URL.createObjectURL(uploadAttachmentFile) : '',
      body: composeChatMessageBody(cleanBody, replyToMessage),
      companyId: localThread.companyId,
      createdAt: now,
      id: `chat-message-${Date.now()}`,
      readByCompanyAt: null,
      readByDriverAt: null,
      reactions: {},
      senderRole,
      senderUserId: '',
      threadId: localThread.id,
    }

    setChatThreadRecords((currentThreads) =>
      upsertRecordById(currentThreads, { ...localThread, lastMessageAt: now, updatedAt: now }),
    )
    setChatMessageRecords((currentMessages) => [...currentMessages, localMessage])
    setChatSyncStatus('Messaggio aggiunto in modalità locale.')
    return true
  }

  async function markChatThreadRead(threadId, readerRole) {
    if (!threadId || !['company', 'driver'].includes(readerRole)) return false

    const timestampField = readerRole === 'company' ? 'readByCompanyAt' : 'readByDriverAt'
    const senderRole = readerRole === 'company' ? 'driver' : 'company'
    const readAt = new Date().toISOString()

    setChatMessageRecords((currentMessages) =>
      currentMessages.map((message) =>
        message.threadId === threadId && message.senderRole === senderRole && !message[timestampField]
          ? { ...message, [timestampField]: readAt }
          : message,
      ),
    )

    if (hasCompanyDataConnection && ['company', 'driver'].includes(session?.role)) {
      const result = await markSupabaseChatMessagesRead(threadId, readerRole)

      if (result.error) {
        setChatSyncStatus(`Lettura messaggi aggiornata localmente. Supabase: ${result.error.message}`)
        return true
      }

      if (result.data) {
        setChatMessageRecords((currentMessages) =>
          result.data.reduce((messages, message) => upsertChatMessageRecord(messages, message), currentMessages),
        )
      }
    }

    return true
  }

  async function updateChatMessageReaction(message, actorRole, reaction) {
    if (!message?.id || !['company', 'driver'].includes(actorRole)) return false

    const nextReactions = { ...(message.reactions ?? {}) }

    if (nextReactions[actorRole] === reaction || !reaction) {
      delete nextReactions[actorRole]
    } else {
      nextReactions[actorRole] = reaction
    }

    setChatMessageRecords((currentMessages) =>
      currentMessages.map((currentMessage) =>
        currentMessage.id === message.id ? { ...currentMessage, reactions: nextReactions } : currentMessage,
      ),
    )

    if (hasCompanyDataConnection && ['company', 'driver'].includes(session?.role)) {
      const savedReaction = nextReactions[actorRole] ?? ''
      const result = await updateSupabaseChatMessageReaction(
        { ...message, reactions: message.reactions ?? {} },
        actorRole,
        savedReaction,
      )

      if (result.error) {
        setChatSyncStatus(`Reazione salvata localmente. Supabase: ${result.error.message}`)
        return true
      }

      if (result.data) {
      setChatMessageRecords((currentMessages) => upsertChatMessageRecord(currentMessages, result.data))
      }

      if (savedReaction && actorRole !== message.senderRole) {
        const reactionThread = chatThreadRecords.find((thread) => thread.id === message.threadId)
        const reactionLabel = getChatReactionLabel(savedReaction)

        if (actorRole === 'company' && reactionThread?.driverId) {
          const pushResult = await notifyPhone({
            body: `Ha reagito con ${reactionLabel} al tuo messaggio.`,
            driverId: reactionThread.driverId,
            notificationType: 'chat',
            tag: `reaction-driver-${message.id}-${actorRole}`,
            targetRole: 'driver',
            threadId: reactionThread.id,
            title: companyName,
            url: '/?view=chat',
          })

          setChatSyncStatus(
            pushResult.error
              ? `Reazione salvata. Notifica telefono non inviata: ${pushResult.error.message}`
              : 'Reazione salvata. Notifica telefono inviata.',
          )
        } else if (actorRole === 'driver') {
          const pushResult = await notifyPhone({
            body: `Ha reagito con ${reactionLabel} al messaggio.`,
            notificationType: 'chat',
            tag: `reaction-company-${message.id}-${actorRole}`,
            targetRole: 'company',
            threadId: reactionThread?.id ?? '',
            title: getDriverDisplayName(reactionThread?.driverId),
            url: '/?view=chat',
          })

          setChatSyncStatus(
            pushResult.error
              ? `Reazione salvata. Notifica titolare non inviata: ${pushResult.error.message}`
              : 'Reazione salvata. Notifica titolare inviata.',
          )
        }
      }
    }

    return true
  }

  async function updateFaultReportStatus(reportId, status) {
    setOperationsSyncStatus(status === 'closed' ? 'Archiviazione guasto...' : 'Segno il guasto da leggere...')
    setFaultReportRecords((currentReports) =>
      currentReports.map((report) => (report.id === reportId ? { ...report, status } : report)),
    )

    if (status === 'closed') {
      setArchivedFaultOverrideIds((currentIds) => (currentIds.includes(reportId) ? currentIds : [...currentIds, reportId]))
    } else {
      setArchivedFaultOverrideIds((currentIds) => currentIds.filter((id) => id !== reportId))
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      const result = await updateSupabaseFaultReportStatus(reportId, status)

      if (result.error) {
        setOperationsSyncStatus(`Guasto spostato localmente. Supabase: ${result.error.message}`)
        return true
      }

      setFaultReportRecords((currentReports) =>
        currentReports.map((report) => (report.id === reportId ? result.data : report)),
      )
      setOperationsSyncStatus(status === 'closed' ? 'Guasto archiviato.' : 'Guasto rimesso da leggere.')
      return true
    }
    setOperationsSyncStatus(status === 'closed' ? 'Guasto archiviato in modalità locale.' : 'Guasto rimesso da leggere.')
    return true
  }

  function acknowledgeCheck(checkId) {
    setAcknowledgedCheckIds((currentIds) => (currentIds.includes(checkId) ? currentIds : [...currentIds, checkId]))
  }

  function markCheckUnread(checkId) {
    setAcknowledgedCheckIds((currentIds) => currentIds.filter((id) => id !== checkId))
  }

  const sendChatTyping = useCallback((typingState) => {
    chatTypingSenderRef.current?.(typingState)
  }, [])
  const chatPresenceDriverId = session?.role === 'driver' ? driverRecords[0]?.id ?? '' : ''
  const chatPresenceDriverName = session?.role === 'driver' ? driverRecords[0]?.name ?? '' : ''

  useEffect(() => {
    if (!session || !activeCompanyId || !isSupabaseConfigured) return

    const actorRole = session.role
    const actorId = actorRole === 'driver' ? chatPresenceDriverId : activeCompanyId
    const actorName =
      actorRole === 'driver'
        ? chatPresenceDriverName
        : getDisplayCompanyName(companyProfile.name || session.name || company.name || 'Azienda')

    if (!actorId || !['company', 'driver'].includes(actorRole)) return

    let isMounted = true
    let cleanupPresence = () => {}
    chatTypingSenderRef.current = () => {}

    subscribeToChatPresence(
      activeCompanyId,
      {
        actorId,
        actorName,
        actorRole,
      },
      {
        onPresenceChange: (presences) => {
          if (!isMounted) return

          setChatLiveState((currentState) => {
            const lastSeenByActor = { ...currentState.lastSeenByActor }
            const onlineByActor = {}

            presences.forEach((presence) => {
              const actorKey = getChatActorKey(presence.actorRole, presence.actorId)
              if (!actorKey) return

              onlineByActor[actorKey] = presence
              lastSeenByActor[actorKey] = presence.lastSeenAt ?? presence.onlineAt ?? new Date().toISOString()
            })

            return {
              ...currentState,
              lastSeenByActor,
              onlineByActor,
            }
          })
        },
        onTyping: (typingPayload) => {
          if (!isMounted) return

          setChatLiveState((currentState) => {
            const typingKey = getThreadTypingKey(
              typingPayload.threadId,
              typingPayload.actorRole,
              typingPayload.actorId,
            )
            const actorKey = getChatActorKey(typingPayload.actorRole, typingPayload.actorId)
            if (!typingKey) return currentState

            const typingByThread = { ...currentState.typingByThread }
            const lastSeenByActor = { ...currentState.lastSeenByActor }

            if (typingPayload.isTyping) {
              typingByThread[typingKey] = {
                ...typingPayload,
                expiresAt: Date.now() + chatTypingExpiryMs,
              }
            } else {
              delete typingByThread[typingKey]
            }

            if (actorKey) {
              lastSeenByActor[actorKey] = typingPayload.sentAt ?? new Date().toISOString()
            }

            return {
              ...currentState,
              lastSeenByActor,
              typingByThread,
            }
          })
        },
      },
    ).then((presenceChannel) => {
      if (!isMounted) {
        presenceChannel.cleanup()
        return
      }

      cleanupPresence = presenceChannel.cleanup
      chatTypingSenderRef.current = presenceChannel.sendTyping
    })

    return () => {
      isMounted = false
      chatTypingSenderRef.current = () => {}
      cleanupPresence()
    }
  }, [activeCompanyId, chatPresenceDriverId, chatPresenceDriverName, companyProfile.name, session])

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setChatLiveState(removeExpiredTypingEntries)
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [])

  const unreadCheckCount = vehicleCheckRecords.filter((check) => !acknowledgedCheckIds.includes(check.id)).length
  const openFaultCount = visibleFaultReportRecords.filter(isFaultUnread).length
  const criticalCheckCount = vehicleCheckRecords.filter((check) => !acknowledgedCheckIds.includes(check.id) && hasCheckIssues(check)).length
  const notificationCount = unreadCheckCount + openFaultCount
  const companyUnreadChatCount = chatMessageRecords.filter(
    (message) => message.senderRole === 'driver' && !message.readByCompanyAt,
  ).length
  const companyLicenseActive = isCompanyLicenseActive(companyProfile)

  if (!session) {
    return (
      <I18nContext.Provider value={i18nValue}>
        <AuthScreen
          language={language}
          onAuthenticated={handleAuthenticated}
          onLanguageChange={setLanguage}
          t={t}
        />
      </I18nContext.Provider>
    )
  }

  if (session.role === 'driver') {
    if (!driverSessionLoading && !companyLicenseActive) {
      return (
        <I18nContext.Provider value={i18nValue}>
          <DriverLicenseBlockedScreen companyName={getDisplayCompanyName(companyProfile.name || company.name)} onSignOut={handleSignOut} />
        </I18nContext.Provider>
      )
    }

    return (
      <I18nContext.Provider value={i18nValue}>
        <DriverAppView
          assetPreviewUrl={getAssetPreviewUrl}
          chatLiveState={chatLiveState}
          chatMessages={chatMessageRecords}
          chatThreads={chatThreadRecords}
          companyLogoUrl={getAssetPreviewUrl(companyProfile.logoPath)}
          companyName={getDisplayCompanyName(companyProfile.name || session.name || company.name || 'Azienda')}
          documentUploadStatus={driverDocumentUploadStatus}
          items={decoratedItems}
          documentRecords={documentRecords}
          driverRecords={driverRecords}
          faultReportRecords={visibleFaultReportRecords}
          vehicleRecords={vehicleRecords}
          onDriverDocumentCreate={addDriverDocumentRecord}
          onDriverDocumentUpload={uploadDriverDocumentFile}
          onDriverDocumentFileRemove={removeDriverDocumentFile}
          onDriverProfileImageUpload={uploadDriverProfileImage}
          onDriverProfileImageRemove={removeDriverProfileImage}
          onFaultReport={submitFaultReport}
          onMarkChatRead={markChatThreadRead}
          onReactToMessage={updateChatMessageReaction}
          onSendChatMessage={sendChatMessage}
          onTyping={sendChatTyping}
          onMorningCheck={submitMorningCheck}
          onOpenDriverDocument={openDriverDocumentFile}
          onRefreshAssetPreviewUrl={refreshAssetPreviewUrl}
          onSignOut={handleSignOut}
          onUpload={() => setDriverUploadSent(true)}
          operationsStatus={operationsSyncStatus}
          faultReported={faultReported}
          isLoading={driverSessionLoading}
          language={language}
          morningCheckSent={morningCheckSent}
          uploadSent={driverUploadSent}
          uploadingDocumentId={uploadingDriverDocumentId}
          vehicleCheckRecords={vehicleCheckRecords}
          installPromptAvailable={Boolean(installPromptEvent)}
          isStandaloneMode={isStandaloneMode}
          notificationEnabled={phoneNotificationEnabled}
          notificationStatus={phoneNotificationStatus}
          onEnablePhoneNotifications={enablePhoneNotifications}
          onInstallPhoneApp={installPhoneApp}
          onLanguageChange={setLanguage}
          t={t}
        />
      </I18nContext.Provider>
    )
  }

  const companyName = getDisplayCompanyName(companyProfile.name || session.name || company.name || 'Azienda')
  const activeDriverCount = driverRecords.filter((driver) => driver.status !== 'Archiviato').length
  const activeVehicleCount = vehicleRecords.filter((vehicle) => vehicle.status !== 'Archiviato').length
  const showCompanyInstallAction = isAppleMobileDevice() || Boolean(installPromptEvent) || isStandaloneMode

  if (!companyLicenseActive) {
    return (
        <I18nContext.Provider value={i18nValue}>
        <CompanyLicenseGate
          checkoutStatus={billingCheckoutStatus}
          companyEmail={session.email}
          companyName={companyName}
          companyProfile={companyProfile}
          isCheckoutLoading={isBillingCheckoutLoading}
          onSignOut={handleSignOut}
          onStartCheckout={startBillingCheckout}
        />
      </I18nContext.Provider>
    )
  }

  function openNewDeadlinePanel() {
    setActiveView('dashboard')
    window.setTimeout(() => {
      document.getElementById('new-deadline-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  function openDashboardHome() {
    setActiveView('dashboard')
    window.setTimeout(() => {
      window.scrollTo({ behavior: 'smooth', top: 0 })
    }, 0)
  }

  function openNotifications(filter = 'inbox') {
    setOperationsFilter(filter)
    setActiveView('notifications')
  }

  function openRecords(tab = recordsTab) {
    setRecordsTab(tab)
    setActiveView('records')
  }

  function openComplianceFilter(filter) {
    setActiveFilter(filter)
    setActiveView('dashboard')
    window.setTimeout(() => {
      document.getElementById('compliance-board-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  function navigateCompanyView(viewId) {
    if (viewId === 'notifications') {
      openNotifications('inbox')
      return
    }

    if (viewId === 'records') {
      openRecords()
      return
    }

    if (viewId === 'documents' || viewId === 'drivers' || viewId === 'fleet') {
      openRecords(viewId)
      return
    }

    setActiveView(viewId)
  }

  return (
    <I18nContext.Provider value={i18nValue}>
      <div className="app-shell">
      <Sidebar
        activeView={activeView}
        chatNotificationCount={companyUnreadChatCount}
        notificationCount={notificationCount}
        onHome={openDashboardHome}
        onNavigate={navigateCompanyView}
        onSignOut={handleSignOut}
        session={session}
        t={t}
      />
      <main className="workspace">
        <Topbar
          acknowledgedCheckIds={acknowledgedCheckIds}
          assetPreviewUrl={getAssetPreviewUrl}
          driverRecords={driverRecords}
          faultReportRecords={visibleFaultReportRecords}
          notificationCount={notificationCount}
          onAcknowledgeCheck={acknowledgeCheck}
          onMarkCheckUnread={markCheckUnread}
          onOpenNotifications={() => openNotifications('inbox')}
          onUpdateFaultStatus={updateFaultReportStatus}
          query={query}
          setQuery={setQuery}
          t={t}
          vehicleCheckRecords={vehicleCheckRecords}
          vehicleRecords={vehicleRecords}
        />
        {activeView === 'records' ? (
          <RecordsWorkspace
            assetPreviewUrl={getAssetPreviewUrl}
            activeTab={recordsTab}
            assetRecords={assetRecords}
            documentEvents={documentEventRecords}
            documentRecords={documentRecords}
            driverRecords={driverRecords}
            documentsSyncStatus={documentsSyncStatus}
            onAddDriver={addDriverRecord}
            onAddDocument={addDriverDocumentRecord}
            onArchiveDriver={archiveDriverRecord}
            onBackHome={openDashboardHome}
            onDriverDocumentUpload={uploadDriverDocumentFile}
            onDriverProfileImageUpload={uploadDriverProfileImage}
            onOpenDriverDocument={openDriverDocumentFile}
            onRemoveDocument={removeDriverDocumentRecord}
            onRemoveDocumentFile={removeDriverDocumentFile}
            onAddVehicle={addVehicleRecord}
            onArchiveVehicle={archiveVehicleRecord}
            onTabChange={setRecordsTab}
            onUpdateDocument={updateDriverDocumentRecord}
            onUpdateDriver={updateDriverRecord}
            onUpdateVehicle={updateVehicleRecord}
            driversSyncStatus={driversSyncStatus}
            fleetSyncStatus={fleetSyncStatus}
            itemRecords={items}
            personRecords={personRecords}
            t={t}
            vehicleRecords={vehicleRecords}
          />
        ) : activeView === 'notifications' ? (
          <OperationsWorkspace
            acknowledgedCheckIds={acknowledgedCheckIds}
            assetPreviewUrl={getAssetPreviewUrl}
            driverRecords={driverRecords}
            faultReportRecords={visibleFaultReportRecords}
            onAcknowledgeCheck={acknowledgeCheck}
            onFilterChange={setOperationsFilter}
            onMarkCheckUnread={markCheckUnread}
            onUpdateFaultStatus={updateFaultReportStatus}
            selectedFilter={operationsFilter}
            syncStatus={operationsSyncStatus}
            vehicleCheckRecords={vehicleCheckRecords}
            vehicleRecords={vehicleRecords}
          />
        ) : activeView === 'chat' ? (
          <ChatWorkspace
            assetPreviewUrl={getAssetPreviewUrl}
            chatLiveState={chatLiveState}
            chatMessages={chatMessageRecords}
            chatThreads={chatThreadRecords}
            driverRecords={driverRecords}
            onMarkRead={markChatThreadRead}
            onReactToMessage={updateChatMessageReaction}
            onRefreshAssetPreviewUrl={refreshAssetPreviewUrl}
            onSendMessage={sendChatMessage}
            onTyping={sendChatTyping}
          />
        ) : activeView === 'support' ? (
          <SupportWorkspace t={t} />
        ) : activeView === 'settings' ? (
          <SettingsWorkspace
            key={`${companyProfile.name}-${companyProfile.vatNumber}-${companyProfile.headquarters}`}
            companyEmail={session.email}
            companyInvoices={companyInvoiceRecords}
            companyProfile={{ ...companyProfile, name: companyName }}
            companyStorageSummary={companyStorageSummary}
            companyLogoUrl={getAssetPreviewUrl(companyProfile.logoPath)}
            installPromptAvailable={Boolean(installPromptEvent)}
            isStandaloneMode={isStandaloneMode}
            language={language}
            notificationEnabled={phoneNotificationEnabled}
            notificationStatus={phoneNotificationStatus}
            onCompanyLogoUpload={uploadCompanyLogo}
            onEnablePhoneNotifications={enablePhoneNotifications}
            onInstallPhoneApp={installPhoneApp}
            onLanguageChange={setLanguage}
            onOpenBillingPortal={openBillingPortal}
            onOpenCompanyInvoice={openCompanyInvoiceFile}
            onUpdateCompanyProfile={updateCompanyProfile}
            showInstallAction={showCompanyInstallAction}
            syncStatus={companySettingsStatus}
            t={t}
          />
        ) : (
          <>
            <section className="overview-grid" aria-label="Panoramica scadenze">
              <HeroPanel
                activeDriverCount={activeDriverCount}
                activeVehicleCount={activeVehicleCount}
                companyName={companyName}
                companyLogoUrl={getAssetPreviewUrl(companyProfile.logoPath)}
                criticalCheckCount={criticalCheckCount}
                notificationCount={notificationCount}
                onOpenCriticalChecks={() => openNotifications('critical_checks')}
                onOpenDeadlineWindow={() => openComplianceFilter('month')}
                onOpenFaults={() => openNotifications('faults')}
                onNewDeadline={openNewDeadlinePanel}
                onOpenNotifications={() => openNotifications('inbox')}
                openFaultCount={openFaultCount}
                summary={summary}
                t={t}
              />
              <OnboardingPanel
                activeDriverCount={activeDriverCount}
                activeVehicleCount={activeVehicleCount}
                companyProfile={companyProfile}
                complianceItemCount={items.length + documentRecords.length}
                notificationEnabled={phoneNotificationEnabled}
                onAddDeadline={openNewDeadlinePanel}
                onOpenDocuments={() => openRecords('documents')}
                onOpenDrivers={() => openRecords('drivers')}
                onOpenFleet={() => openRecords('fleet')}
                onOpenSettings={() => setActiveView('settings')}
                t={t}
              />
            </section>
            <section className="content-grid content-grid-full">
              <div className="main-column">
                <ComplianceBoard
                  activeFilter={activeFilter}
                  filteredItems={filteredItems}
                  onClose={closeItem}
                  onFilter={setActiveFilter}
                  onOpenDetail={setSelectedDeadline}
                  onReminder={sendReminder}
                  onRenew={markRenewing}
                />
                <DeadlineDetailModal
                  item={selectedDeadline}
                  onClose={() => setSelectedDeadline(null)}
                  onMarkDone={(itemId) => {
                    closeItem(itemId)
                    setSelectedDeadline(null)
                  }}
                  onRenew={(itemId) => {
                    markRenewing(itemId)
                    setSelectedDeadline(null)
                  }}
                />
                <FleetAndForms
                  driverRecords={driverRecords}
                  onAdd={addComplianceItem}
                  onBackHome={openDashboardHome}
                  vehicleRecords={vehicleRecords}
                />
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="mobile-logout-footer" aria-label="Uscita area azienda">
        <button className="logout-button" onClick={handleSignOut} type="button">
          <LogOut size={17} />
          {t('session.signOut')}
        </button>
      </footer>
      </div>
    </I18nContext.Provider>
  )
}

function CompanyLicenseGate({
  checkoutStatus,
  companyEmail,
  companyName,
  companyProfile,
  isCheckoutLoading,
  onSignOut,
  onStartCheckout,
}) {
  const initialPlan = billingCheckoutPlans.some((plan) => plan.id === companyProfile.billingPlan)
    ? companyProfile.billingPlan
    : 'pro'
  const [selectedPlan, setSelectedPlan] = useState(initialPlan)
  const [billingForm, setBillingForm] = useState({
    addressLine1: companyProfile.headquarters ?? '',
    addressLine2: '',
    billingEmail: companyProfile.billingEmail || companyEmail || '',
    city: '',
    contactName: '',
    country: 'IT',
    pec: '',
    phone: '',
    postalCode: '',
    province: '',
    sdiCode: '',
    taxCode: '',
    vatNumber: companyProfile.vatNumber ?? '',
    legalName: companyName,
  })
  const [validationMessage, setValidationMessage] = useState('')
  const selectedPlanDetails = billingCheckoutPlans.find((plan) => plan.id === selectedPlan) ?? billingCheckoutPlans[1]

  function updateBillingField(field, value) {
    setBillingForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  async function handleCheckoutSubmit(event) {
    event.preventDefault()
    const requiredFields = [
      ['legalName', 'ragione sociale'],
      ['billingEmail', 'email fatturazione'],
      ['addressLine1', 'indirizzo sede legale'],
      ['postalCode', 'CAP'],
      ['city', 'citta'],
      ['country', 'nazione'],
    ]
    const missingField = requiredFields.find(([field]) => !billingForm[field]?.trim())

    if (missingField) {
      setValidationMessage(`Compila ${missingField[1]}.`)
      return
    }

    setValidationMessage('')
    await onStartCheckout?.({
      billingProfile: billingForm,
      plan: selectedPlan,
    })
  }

  return (
    <main className="license-gate">
      <section className="license-gate-panel license-checkout-panel">
        <div className="license-gate-heading">
          <div className="brand-mark">CC</div>
          <div>
            <p className="overline">Camion Chiaro</p>
            <h1>{companyName}</h1>
          </div>
          <span className={`billing-status-pill is-${companyProfile.billingStatus || 'pending'}`}>
            {getBillingStatusLabel(companyProfile.billingStatus)}
          </span>
        </div>
        <p>
          Account creato. Scegli il piano, completa i dati fiscali e paga la prima mensilita: appena Stripe conferma,
          la dashboard si sblocca automaticamente.
        </p>

        <form className="license-checkout-form" onSubmit={handleCheckoutSubmit}>
          <div className="billing-plan-grid" role="radiogroup" aria-label="Scegli piano Camion Chiaro">
            {billingCheckoutPlans.map((plan) => (
              <button
                aria-checked={selectedPlan === plan.id}
                className={[
                  'billing-plan-card',
                  selectedPlan === plan.id ? 'is-selected' : '',
                  plan.isRecommended ? 'is-recommended' : '',
                ].filter(Boolean).join(' ')}
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                role="radio"
                type="button"
              >
                <span>
                  <strong>{plan.title}</strong>
                  {plan.isRecommended && <em>Consigliato</em>}
                </span>
                <b>{plan.price}</b>
                <small>{plan.bestFor}</small>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <div className="billing-form-grid">
            <label className="wide-field">
              Ragione sociale
              <input
                required
                value={billingForm.legalName}
                onChange={(event) => updateBillingField('legalName', event.target.value)}
              />
            </label>
            <label>
              Partita IVA
              <input value={billingForm.vatNumber} onChange={(event) => updateBillingField('vatNumber', event.target.value)} />
            </label>
            <label>
              Codice fiscale
              <input value={billingForm.taxCode} onChange={(event) => updateBillingField('taxCode', event.target.value)} />
            </label>
            <label className="wide-field">
              Indirizzo sede legale
              <input
                required
                value={billingForm.addressLine1}
                onChange={(event) => updateBillingField('addressLine1', event.target.value)}
              />
            </label>
            <label>
              CAP
              <input required value={billingForm.postalCode} onChange={(event) => updateBillingField('postalCode', event.target.value)} />
            </label>
            <label>
              Citta
              <input required value={billingForm.city} onChange={(event) => updateBillingField('city', event.target.value)} />
            </label>
            <label>
              Provincia
              <input value={billingForm.province} onChange={(event) => updateBillingField('province', event.target.value)} />
            </label>
            <label>
              Nazione
              <input
                maxLength={2}
                required
                value={billingForm.country}
                onChange={(event) => updateBillingField('country', event.target.value.toUpperCase())}
              />
            </label>
            <label>
              PEC
              <input value={billingForm.pec} onChange={(event) => updateBillingField('pec', event.target.value)} />
            </label>
            <label>
              Codice SDI
              <input value={billingForm.sdiCode} onChange={(event) => updateBillingField('sdiCode', event.target.value)} />
            </label>
            <label>
              Email fatturazione
              <input
                required
                type="email"
                value={billingForm.billingEmail}
                onChange={(event) => updateBillingField('billingEmail', event.target.value)}
              />
            </label>
            <label>
              Telefono referente
              <input value={billingForm.phone} onChange={(event) => updateBillingField('phone', event.target.value)} />
            </label>
            <label className="wide-field">
              Referente amministrativo
              <input value={billingForm.contactName} onChange={(event) => updateBillingField('contactName', event.target.value)} />
            </label>
          </div>

          {validationMessage && <FormValidationAlert message={validationMessage} />}
          {checkoutStatus && <p className="sync-status-line">{checkoutStatus}</p>}

          <div className="license-gate-actions">
            <button className="primary-button" disabled={isCheckoutLoading} type="submit">
              <BadgeCheck size={17} />
              {isCheckoutLoading ? 'Apro pagamento...' : `Paga ${selectedPlanDetails.title} con Stripe`}
            </button>
            <button className="secondary-button" onClick={() => window.location.reload()} type="button">
              <RadioTower size={17} />
              Aggiorna stato
            </button>
            <button className="secondary-button" onClick={onSignOut} type="button">
              <LogOut size={17} />
              Esci
            </button>
          </div>
        </form>

        <div className="license-gate-details">
          <DetailLine label="Piano selezionato" value={selectedPlanDetails.title} />
          <DetailLine label="Pagamento" value="Carta o metodi abilitati da Stripe" />
          <DetailLine label="Fatture" value="Salvate nello storico azienda" />
        </div>
      </section>
    </main>
  )
}

function DriverLicenseBlockedScreen({ companyName, onSignOut }) {
  return (
    <main className="license-gate is-driver">
      <section className="license-gate-panel">
        <div className="brand-mark">CC</div>
        <p className="overline">{companyName}</p>
        <h1>Area autista non disponibile</h1>
        <p>
          L azienda deve completare l attivazione della licenza Camion Chiaro. Appena viene riattivata,
          chat, documenti, check e guasti tornano disponibili.
        </p>
        <div className="license-gate-actions">
          <button className="primary-button" onClick={() => window.location.reload()} type="button">
            <RadioTower size={17} />
            Riprova
          </button>
          <button className="secondary-button" onClick={onSignOut} type="button">
            <LogOut size={17} />
            Esci
          </button>
        </div>
      </section>
    </main>
  )
}

function AuthScreen({ language, onAuthenticated, onLanguageChange, t }) {
  const [mode, setMode] = useState('company')
  const [companyMode, setCompanyMode] = useState('signin')
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    email: '',
    password: '',
  })
  const [driverForm, setDriverForm] = useState({
    username: '',
    password: '',
  })
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCompanySubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus('')

    const cleanCompanyForm = {
      ...companyForm,
      companyName: companyForm.companyName.trim(),
      email: companyForm.email.trim(),
    }

    if (!cleanCompanyForm.email || !cleanCompanyForm.password) {
      setIsSubmitting(false)
      setStatus(t('auth.emailPasswordMissing'))
      return
    }

    if (companyMode === 'signup' && !cleanCompanyForm.companyName) {
      setIsSubmitting(false)
      setStatus(t('auth.companyNameMissing'))
      return
    }

    const result =
      companyMode === 'signup'
        ? await signUpCompany(cleanCompanyForm)
        : await signInCompany(cleanCompanyForm)

    setIsSubmitting(false)

    if (result.error) {
      setStatus(result.error.message)
      return
    }

    if (companyMode === 'signup' && isSupabaseConfigured && !result.data?.session) {
      setStatus(t('auth.registrationSent'))
      return
    }

    const registeredName =
      result.data?.user?.user_metadata?.company_name ??
      result.data?.user?.user_metadata?.full_name ??
      (companyMode === 'signup' ? cleanCompanyForm.companyName : result.demo ? demoCompanyName : 'Azienda')

    onAuthenticated({
      role: 'company',
      name: getDisplayCompanyName(registeredName),
      email: result.data?.user?.email ?? cleanCompanyForm.email,
      demo: result.demo,
    })
  }

  function switchCompanyMode() {
    const nextMode = companyMode === 'signup' ? 'signin' : 'signup'
    setCompanyMode(nextMode)
    setStatus('')

    if (nextMode === 'signup') {
      setCompanyForm((currentForm) => ({
        ...currentForm,
        companyName: '',
        email: currentForm.email,
        password: currentForm.password,
      }))
      return
    }

    setCompanyForm((currentForm) => ({
      ...currentForm,
      companyName: '',
    }))
  }

  async function handleDriverSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus('')

    const cleanDriverForm = {
      password: driverForm.password,
      username: driverForm.username.trim(),
    }

    if (!cleanDriverForm.username || !cleanDriverForm.password) {
      setIsSubmitting(false)
      setStatus(t('auth.driverMissing'))
      return
    }

    const result = await signInDriver(cleanDriverForm)

    setIsSubmitting(false)

    if (result.error) {
      setStatus(result.error.message)
      return
    }

    onAuthenticated({
      role: 'driver',
      name: drivers[0].name,
      username: cleanDriverForm.username,
      demo: result.demo,
    })
  }

  function openAccess(nextMode = 'company', nextCompanyMode = 'signup') {
    setMode(nextMode)
    if (nextMode === 'company') {
      setCompanyMode(nextCompanyMode)
    }
    setStatus('')
    window.setTimeout(() => {
      document.getElementById('accesso')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  return (
    <main className="public-site">
      <header className="public-header">
        <button className="brand brand-button public-brand" onClick={() => openAccess('company', 'signin')} type="button">
          <div className="brand-mark">
            <CamionChiaroMark />
          </div>
          <div>
            <strong>Camion Chiaro</strong>
            <span>{t('brand.tagline')}</span>
          </div>
        </button>
        <nav className="public-nav" aria-label="Navigazione sito">
          <a href="#prodotto">Prodotto</a>
          <a href="#prezzi">Prezzi</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="public-header-actions">
          <LanguageSelector language={language} onLanguageChange={onLanguageChange} t={t} />
          <button className="secondary-button compact-button" onClick={() => openAccess('company', 'signin')} type="button">
            <KeyRound size={16} />
            {t('auth.signinButton')}
          </button>
        </div>
      </header>

      <section className="public-hero" id="prodotto">
        <div className="public-hero-copy">
          <p className="overline">Gestionale flotta e autisti</p>
          <h1>Camion Chiaro</h1>
          <p>
            Scadenze, documenti, check mattutini, guasti, chat e notifiche in una sola app per aziende di logistica e trasporto.
          </p>
          <div className="public-hero-actions">
            <button className="primary-button" onClick={() => openAccess('company', 'signup')} type="button">
              <BadgeCheck size={18} />
              Acquista e attiva azienda
            </button>
            <button className="secondary-button" onClick={() => openAccess('driver', 'signin')} type="button">
              <Smartphone size={18} />
              Accesso autista
            </button>
          </div>
          <div className="public-proof-grid">
            <span><ShieldCheck size={17} /> Scadenze sotto controllo</span>
            <span><Wrench size={17} /> Guasti tracciati</span>
            <span><FileText size={17} /> Documenti sempre disponibili</span>
          </div>
        </div>

        <section className="auth-card public-access-card" id="accesso" aria-label="Accesso Camion Chiaro">
        <div className="auth-tabs">
          <button className={mode === 'company' ? 'is-active' : ''} onClick={() => setMode('company')} type="button">
            <Building2 size={17} />
            {t('auth.companyTab')}
          </button>
          <button className={mode === 'driver' ? 'is-active' : ''} onClick={() => setMode('driver')} type="button">
            <UserRound size={17} />
            {t('auth.driverTab')}
          </button>
        </div>

        {mode === 'company' ? (
          <form className="auth-form" onSubmit={handleCompanySubmit}>
            <div>
              <p className="overline">{companyMode === 'signup' ? t('auth.companySignupOverline') : t('auth.companySigninOverline')}</p>
              <h2>{companyMode === 'signup' ? t('auth.companySignupTitle') : t('auth.companySigninTitle')}</h2>
            </div>
            {companyMode === 'signup' && (
              <label>
                {t('auth.companyNameLabel')}
                <span>
                  <Building2 size={17} />
                  <input
                    autoComplete="organization"
                    placeholder={t('auth.companyNamePlaceholder')}
                    required
                    value={companyForm.companyName}
                    onChange={(event) => setCompanyForm({ ...companyForm, companyName: event.target.value })}
                  />
                </span>
              </label>
            )}
            <label>
              {t('auth.companyEmailLabel')}
              <span>
                <Mail size={17} />
                <input
                  autoComplete="email"
                  name="email"
                  placeholder={t('auth.companyEmailPlaceholder')}
                  required
                  value={companyForm.email}
                  onChange={(event) => setCompanyForm({ ...companyForm, email: event.target.value })}
                  type="email"
                />
              </span>
            </label>
            <label>
              {t('auth.passwordLabel')}
              <span>
                <LockKeyhole size={17} />
                <input
                  autoComplete={companyMode === 'signup' ? 'new-password' : 'current-password'}
                  name="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                  value={companyForm.password}
                  onChange={(event) => setCompanyForm({ ...companyForm, password: event.target.value })}
                  type="password"
                />
              </span>
            </label>
            <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">
              <KeyRound size={17} />
              {companyMode === 'signup' ? t('auth.signupButton') : t('auth.signinButton')}
            </button>
            <button
              className="link-button"
              onClick={switchCompanyMode}
              type="button"
            >
              {companyMode === 'signup' ? t('auth.companyToggleSignin') : t('auth.companyToggleSignup')}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleDriverSubmit}>
            <div>
              <p className="overline">{t('auth.driverOverline')}</p>
              <h2>{t('auth.driverTitle')}</h2>
            </div>
            <label>
              {t('auth.driverUsernameLabel')}
              <span>
                <UserRound size={17} />
                <input
                  autoCapitalize="none"
                  autoComplete="username"
                  autoCorrect="off"
                  name="username"
                  placeholder={t('auth.driverUsernamePlaceholder')}
                  required
                  spellCheck={false}
                  value={driverForm.username}
                  onChange={(event) => setDriverForm({ ...driverForm, username: event.target.value })}
                />
              </span>
            </label>
            <label>
              {t('auth.passwordLabel')}
              <span>
                <LockKeyhole size={17} />
                <input
                  autoComplete="current-password"
                  name="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                  value={driverForm.password}
                  onChange={(event) => setDriverForm({ ...driverForm, password: event.target.value })}
                  type="password"
                />
              </span>
            </label>
            <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">
              <Smartphone size={17} />
              {t('auth.driverButton')}
            </button>
          </form>
        )}

        {status && <p className="auth-status">{status}</p>}
        {!isSupabaseConfigured && (
          <p className="auth-demo-note">
            {t('auth.demoNote')}
          </p>
        )}
        </section>
      </section>

      <section className="public-product-preview" aria-label="Anteprima Camion Chiaro">
        <div className="public-dashboard-mock">
          <div className="public-mock-topbar">
            <div>
              <span>Dashboard azienda</span>
              <strong>Spedifast SRL</strong>
            </div>
            <Bell size={19} />
          </div>
          <div className="public-mock-kpis">
            <div>
              <strong>3</strong>
              <span>Scadenze 30 giorni</span>
            </div>
            <div className="is-warning">
              <strong>1</strong>
              <span>Check critico</span>
            </div>
            <div className="is-danger">
              <strong>2</strong>
              <span>Guasti aperti</span>
            </div>
          </div>
          <div className="public-mock-list">
            <div>
              <CalendarClock size={18} />
              <span>Revisione trattore AB123CD</span>
              <strong>12 giorni</strong>
            </div>
            <div>
              <Wrench size={18} />
              <span>Spia avaria motrice EF456GH</span>
              <strong>Da aprire</strong>
            </div>
            <div>
              <FileText size={18} />
              <span>Patente Mario Rossi</span>
              <strong>45 giorni</strong>
            </div>
          </div>
        </div>
        <div className="public-phone-mock">
          <div className="public-phone-speaker" />
          <strong>Area autista</strong>
          <span>Check mattutino</span>
          <div className="public-phone-checks">
            <p><CheckCircle2 size={16} /> Luci</p>
            <p><CheckCircle2 size={16} /> Pneumatici</p>
            <p><AlertTriangle size={16} /> Foto guasto caricata</p>
          </div>
          <button className="primary-button" type="button">
            <Send size={16} />
            Invia report
          </button>
        </div>
      </section>

      <section className="public-section">
        <div className="public-section-heading">
          <p className="overline">Perche serve</p>
          <h2>Il problema non e guidare. E ricordarsi tutto.</h2>
          <p>
            Patenti, revisioni, assicurazioni, visite mediche, documenti autista, guasti e messaggi finiscono spesso in posti diversi.
            Camion Chiaro li porta in un unico flusso leggibile.
          </p>
        </div>
        <div className="public-feature-grid">
          <article>
            <CalendarClock size={22} />
            <h3>Scadenze automatiche</h3>
            <p>Promemoria per mezzi, autisti e azienda prima che diventino un problema.</p>
          </article>
          <article>
            <ClipboardCheck size={22} />
            <h3>Check e guasti</h3>
            <p>L autista invia check mattutini e segnalazioni con foto, semirimorchio agganciato e storico.</p>
          </article>
          <article>
            <Mail size={22} />
            <h3>Chat e notifiche</h3>
            <p>Messaggi live, spunte di lettura, reaction e notifiche telefono per azienda e autisti.</p>
          </article>
          <article>
            <FileText size={22} />
            <h3>Documenti sempre pronti</h3>
            <p>L autista conserva i documenti nell app e puo mostrarli quando servono.</p>
          </article>
        </div>
      </section>

      <section className="public-section public-workflow">
        <div className="public-section-heading">
          <p className="overline">Come lavora</p>
          <h2>Una giornata normale, con meno telefonate.</h2>
        </div>
        <div className="public-steps">
          <div><strong>1</strong><span>L azienda inserisce autisti, mezzi, semirimorchi e scadenze.</span></div>
          <div><strong>2</strong><span>L autista entra con il suo nome utente e fa check o segnala guasti.</span></div>
          <div><strong>3</strong><span>La dashboard mostra solo cio che richiede attenzione.</span></div>
          <div><strong>4</strong><span>Ogni segnalazione resta archiviata e ricercabile.</span></div>
        </div>
      </section>

      <section className="public-section" id="prezzi">
        <div className="public-section-heading">
          <p className="overline">Piani</p>
          <h2>Prezzi semplici per aziende vere.</h2>
          <p>Il pagamento online arrivera nella fase commerciale; la pagina e gia pronta per portare il cliente all attivazione.</p>
        </div>
        <div className="public-price-grid">
          <article>
            <span>Starter</span>
            <strong>39 euro/mese</strong>
            <p>Per piccole flotte che vogliono mettere ordine subito.</p>
            <ul>
              <li>Fino a 5 autisti</li>
              <li>Scadenze e documenti</li>
              <li>Check e guasti</li>
            </ul>
            <button className="secondary-button" onClick={() => openAccess('company', 'signup')} type="button">Attiva Starter</button>
          </article>
          <article className="is-featured">
            <span>Pro</span>
            <strong>89 euro/mese</strong>
            <p>Il piano giusto per la maggior parte delle aziende.</p>
            <ul>
              <li>Fino a 25 autisti</li>
              <li>Chat e notifiche telefono</li>
              <li>Archivio operativo completo</li>
            </ul>
            <button className="primary-button" onClick={() => openAccess('company', 'signup')} type="button">Attiva Pro</button>
          </article>
          <article>
            <span>Business</span>
            <strong>189 euro/mese</strong>
            <p>Per flotte piu grandi, sedi multiple e processi piu strutturati.</p>
            <ul>
              <li>Autisti e mezzi estesi</li>
              <li>Supporto prioritario</li>
              <li>Preparazione integrazioni</li>
            </ul>
            <button className="secondary-button" onClick={() => openAccess('company', 'signup')} type="button">Attiva Business</button>
          </article>
        </div>
      </section>

      <section className="public-section public-faq" id="faq">
        <div className="public-section-heading">
          <p className="overline">FAQ</p>
          <h2>Domande veloci prima di iniziare.</h2>
        </div>
        <div className="public-faq-list">
          <article>
            <h3>L autista deve scaricare un app dallo store?</h3>
            <p>No: usa la web app dal telefono e puo aggiungerla alla schermata Home. Funziona su iPhone e Android.</p>
          </article>
          <article>
            <h3>Arrivano notifiche sul telefono?</h3>
            <p>Si, dopo l attivazione sul dispositivo. Chat, guasti e check critici possono avvisare anche con app chiusa.</p>
          </article>
          <article>
            <h3>Posso usarlo dall ufficio e dal telefono?</h3>
            <p>Si. L azienda lavora da PC, ma il titolare puo entrare anche da telefono e vedere notifiche e chat.</p>
          </article>
        </div>
      </section>
    </main>
  )
}

function Sidebar({ activeView, chatNotificationCount = 0, notificationCount, onHome, onNavigate, onSignOut, session, t }) {
  const navItems = [
    { id: 'dashboard', label: t('nav.deadlines'), icon: CalendarClock },
    { id: 'records', label: t('nav.records'), icon: Users },
    { id: 'notifications', label: t('nav.notifications'), icon: Bell },
    { id: 'chat', label: t('nav.chat'), icon: Mail },
    { id: 'support', label: t('nav.support'), icon: BookOpen },
    { id: 'settings', label: t('nav.settings'), icon: SettingsIcon },
  ]

  return (
    <aside className="sidebar" aria-label="Navigazione principale">
      <button className="brand brand-button" onClick={onHome} type="button">
        <div className="brand-mark">
          <CamionChiaroMark />
        </div>
        <div>
          <strong>Camion Chiaro</strong>
          <span>{t('session.companyArea')}</span>
        </div>
      </button>

      <nav className="nav-list">
        {navItems.map((item) => (
          <button
            className={activeView === item.id ? 'nav-item is-active' : 'nav-item'}
            key={item.label}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <item.icon size={18} strokeWidth={2.1} />
            <span>{item.label}</span>
            {item.id === 'notifications' && notificationCount > 0 && <strong className="nav-badge">{notificationCount}</strong>}
            {item.id === 'chat' && chatNotificationCount > 0 && <strong className="nav-badge">{chatNotificationCount}</strong>}
          </button>
        ))}
      </nav>

      <div className="sync-card">
        <RadioTower size={19} />
        <div>
          <strong>{isSupabaseConfigured ? t('sync.connected') : t('sync.demo')}</strong>
          <span>{session.email ?? t('sync.addKeys')}</span>
        </div>
      </div>

      <button className="logout-button" onClick={onSignOut} type="button">
        <LogOut size={17} />
        {t('session.signOut')}
      </button>
    </aside>
  )
}

function Topbar({
  acknowledgedCheckIds,
  assetPreviewUrl,
  driverRecords,
  faultReportRecords,
  notificationCount,
  onAcknowledgeCheck,
  onMarkCheckUnread,
  onOpenNotifications,
  onUpdateFaultStatus,
  query,
  setQuery,
  t,
  vehicleCheckRecords,
  vehicleRecords,
}) {
  return (
    <header className="topbar">
      <div>
        <p className="overline">{t('session.companyArea')}</p>
        <h1>{t('session.dashboardTitle')}</h1>
      </div>
      <div className="topbar-actions">
        <label className="search-box">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">{t('topbar.searchSr')}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('topbar.searchPlaceholder')}
          />
        </label>
        <TopbarNotifications
          acknowledgedCheckIds={acknowledgedCheckIds}
          assetPreviewUrl={assetPreviewUrl}
          driverRecords={driverRecords}
          faultReportRecords={faultReportRecords}
          notificationCount={notificationCount}
          onAcknowledgeCheck={onAcknowledgeCheck}
          onMarkCheckUnread={onMarkCheckUnread}
          onOpenNotifications={onOpenNotifications}
          onUpdateFaultStatus={onUpdateFaultStatus}
          vehicleCheckRecords={vehicleCheckRecords}
          vehicleRecords={vehicleRecords}
        />
      </div>
    </header>
  )
}

function TopbarNotifications({
  acknowledgedCheckIds,
  assetPreviewUrl = () => '',
  driverRecords,
  faultReportRecords,
  notificationCount,
  onAcknowledgeCheck,
  onMarkCheckUnread,
  onOpenNotifications,
  onUpdateFaultStatus,
  vehicleCheckRecords,
  vehicleRecords,
}) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [modalOperationKey, setModalOperationKey] = useState('')
  const allOperations = useMemo(
    () =>
      [
        ...faultReportRecords.map((report) => ({
          createdAt: report.createdAt,
          data: report,
          id: report.id,
          kind: 'fault',
        })),
        ...vehicleCheckRecords.map((check) => ({
          createdAt: check.createdAt,
          data: check,
          id: check.id,
          kind: 'check',
        })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [faultReportRecords, vehicleCheckRecords],
  )
  const notifications = allOperations.map((operation) => {
    if (operation.kind === 'fault') {
      const report = operation.data
      const driver = driverRecords.find((entry) => entry.id === report.driverId)
      const vehicle = vehicleRecords.find((entry) => entry.id === report.vehicleId)
      const trailer = vehicleRecords.find((entry) => entry.id === report.semitrailerId)
      const isRead = isFaultArchived(report)
      const isCritical = ['high', 'stop_vehicle'].includes(report.severity) && !isRead

      return {
        detail: `${driver?.name ?? t('common.driver')} · ${vehicle?.plate ?? t('common.vehicleMissing')}${trailer ? ` · ${trailer.plate}` : ''}`,
        isCritical,
        isRead,
        key: `${operation.kind}-${operation.id}`,
        operation,
        status: isRead ? t('common.archived') : isCritical ? t('operations.critical') : t('operations.inbox'),
        time: formatShortDateTime(report.createdAt),
        title: report.title,
        type: t('operations.fault'),
      }
    }

    const check = operation.data
    const driver = driverRecords.find((entry) => entry.id === check.driverId)
    const vehicle = vehicleRecords.find((entry) => entry.id === check.tractorId)
    const isRead = acknowledgedCheckIds.includes(check.id)
    const isCritical = hasCheckIssues(check) && !isRead

    return {
      detail: `${driver?.name ?? t('common.driver')} · ${vehicle?.plate ?? t('common.vehicleMissing')}`,
      isCritical,
      isRead,
      key: `${operation.kind}-${operation.id}`,
      operation,
      status: isRead ? t('common.archived') : isCritical ? t('operations.critical') : t('operations.inbox'),
      time: formatShortDateTime(check.createdAt),
      title: t('driverApp.morningCheck'),
      type: t('operations.check'),
    }
  })
  const unreadNotifications = notifications.filter((notification) => !notification.isRead)
  const readNotifications = notifications.filter((notification) => notification.isRead)
  const visibleNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'read') return notification.isRead
    return true
  })
  const modalOperation = allOperations.find((operation) => `${operation.kind}-${operation.id}` === modalOperationKey)

  function openNotification(operation) {
    setModalOperationKey(`${operation.kind}-${operation.id}`)
    setIsOpen(false)
  }

  function openFullNotifications() {
    setIsOpen(false)
    onOpenNotifications?.()
  }

  function toggleNotification(notification) {
    const { operation } = notification

    if (operation.kind === 'fault') {
      onUpdateFaultStatus?.(operation.id, notification.isRead ? 'open' : 'closed')
      return
    }

    if (notification.isRead) {
      onMarkCheckUnread?.(operation.id)
      return
    }

    onAcknowledgeCheck?.(operation.id)
  }

  return (
    <div className="topbar-notifications">
      <button
        aria-expanded={isOpen}
        aria-label={t('notifications.bellAria', { count: notificationCount })}
        className={notificationCount > 0 ? 'icon-button notification-bell-button has-alerts' : 'icon-button notification-bell-button'}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        <Bell size={19} />
        {notificationCount > 0 && <span className="topbar-notification-badge">{notificationCount}</span>}
      </button>

      {isOpen && (
        <div className="notifications-popover" role="dialog" aria-label={t('notifications.companyAria')}>
          <div className="notifications-popover-header">
            <div>
              <p className="overline">{t('operations.bell')}</p>
              <strong>{t('nav.notifications')}</strong>
            </div>
            <button className="small-button" onClick={openFullNotifications} type="button">
              {t('notifications.fullView')}
            </button>
          </div>
          <div className="notification-filter-tabs" role="tablist" aria-label={t('notifications.filterAria')}>
            <button className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')} type="button">
              {t('filter.all')} ({notifications.length})
            </button>
            <button className={filter === 'unread' ? 'is-active' : ''} onClick={() => setFilter('unread')} type="button">
              {t('operations.inbox')} ({unreadNotifications.length})
            </button>
            <button className={filter === 'read' ? 'is-active' : ''} onClick={() => setFilter('read')} type="button">
              {t('common.archived')} ({readNotifications.length})
            </button>
          </div>
          <div className="notifications-popover-list">
            {visibleNotifications.map((notification) => (
              <article
                className={[
                  'notification-popover-row',
                  notification.isRead ? 'is-read' : '',
                  notification.isCritical ? 'is-critical' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={notification.key}
              >
                <span className="notification-row-type">{notification.type}</span>
                <div className="notification-row-main">
                  <div>
                    <strong>{notification.title}</strong>
                    <span className={notification.isCritical ? 'status-pill tone-danger' : 'status-pill tone-info'}>
                      {notification.status}
                    </span>
                  </div>
                  <small>{notification.detail} · {notification.time}</small>
                </div>
                <div className="notification-row-actions">
                  <button className="small-button" onClick={() => openNotification(notification.operation)} type="button">
                    {t('common.open')}
                  </button>
                  <button
                    className={notification.isRead ? 'small-button' : 'small-button danger-action'}
                    onClick={() => toggleNotification(notification)}
                    type="button"
                  >
                    {notification.isRead ? t('operations.markUnread') : t('operations.archive')}
                  </button>
                </div>
              </article>
            ))}
            {visibleNotifications.length === 0 && (
              <p className="notifications-empty">{t('notifications.empty')}</p>
            )}
          </div>
        </div>
      )}

      <OperationDetailModal
        acknowledgedCheckIds={acknowledgedCheckIds}
        assetPreviewUrl={assetPreviewUrl}
        driverRecords={driverRecords}
        operation={modalOperation}
        onAcknowledgeCheck={onAcknowledgeCheck}
        onClose={() => setModalOperationKey('')}
        onMarkCheckUnread={onMarkCheckUnread}
        onUpdateFaultStatus={onUpdateFaultStatus}
        vehicleRecords={vehicleRecords}
      />
    </div>
  )
}

function CamionChiaroMark() {
  return (
    <svg className="camion-logo-mark" viewBox="0 0 72 72" role="img" aria-label="Camion Chiaro">
      <rect width="72" height="72" rx="16" fill="#020617" />
      <path
        d="M10 50c13-3 17-16 27-20 9-4 17-1 25-8"
        fill="none"
        stroke="#12c6df"
        strokeLinecap="round"
        strokeWidth="7"
      />
      <rect x="13" y="31" width="33" height="15" rx="4" fill="#12c6df" />
      <path d="M46 34h9l7 8v4H46z" fill="#7dd3fc" />
      <path d="M18 37h20" stroke="#ffffff" strokeLinecap="round" strokeWidth="3" />
      <circle cx="24" cy="50" r="5.5" fill="#ffffff" />
      <circle cx="24" cy="50" r="2.4" fill="#020617" />
      <circle cx="52" cy="50" r="5.5" fill="#ffffff" />
      <circle cx="52" cy="50" r="2.4" fill="#020617" />
      <path d="M54 15l2.1 4.5 4.9 1.6-4.9 1.7L54 28l-2.1-4.2-4.9-1.7 4.9-1.6z" fill="#ffffff" />
    </svg>
  )
}

function LanguageSelector({ language, onLanguageChange, t, variant = 'light' }) {
  return (
    <label className={`language-selector is-${variant}`}>
      <Globe2 size={16} aria-hidden="true" />
      <span>{t('language.short')}</span>
      <select
        aria-label={t('language.label')}
        value={language}
        onChange={(event) => onLanguageChange(event.target.value)}
      >
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.shortLabel} · {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function EntityAvatar({ imageUrl, name, variant = 'default' }) {
  return (
    <span className={`entity-avatar avatar-${variant}`}>
      {imageUrl ? <img alt="" src={imageUrl} /> : <span>{getInitials(name)}</span>}
    </span>
  )
}

function ImageUploadControl({ label, onUpload }) {
  function handleChange(event) {
    const file = event.target.files?.[0]
    onUpload?.(file)
    event.target.value = ''
  }

  return (
    <label className="small-button image-upload-control">
      <Upload size={15} />
      {label}
      <input accept="image/*" className="sr-only" onChange={handleChange} type="file" />
    </label>
  )
}

function CompanyLogoUploader({ companyName, logoUrl, onUpload }) {
  const { t } = useI18n()

  return (
    <div className="company-logo-uploader">
      <EntityAvatar imageUrl={logoUrl} name={companyName} variant="company" />
      <div>
        <strong>{t('companyLogo.title')}</strong>
        <span>{t('companyLogo.body')}</span>
      </div>
      <ImageUploadControl label={logoUrl ? t('companyLogo.change') : t('companyLogo.upload')} onUpload={onUpload} />
    </div>
  )
}

function PhoneSetupPanel({
  compact = false,
  installPromptAvailable,
  isStandaloneMode,
  notificationEnabled,
  notificationStatus,
  onEnableNotifications,
  onInstallApp,
  showInstallAction = true,
}) {
  const { t } = useI18n()
  const pushSupport = getPushSupportStatus()
  const installStatus = isStandaloneMode ? t('phone.installed') : installPromptAvailable ? t('phone.installReady') : t('phone.toAdd')
  const notificationText = notificationEnabled
    ? t('phone.enabled')
    : pushSupport.requiresInstall
      ? t('phone.needInstall')
      : pushSupport.supported
        ? t('phone.toActivate')
        : t('phone.notAvailable')
  const installButtonLabel = isAppleMobileDevice() && !installPromptAvailable ? t('phone.installHow') : t('phone.install')
  const notificationButtonDisabled = !pushSupport.supported && !pushSupport.requiresInstall
  const notificationButtonLabel = notificationEnabled ? t('phone.verify') : t('phone.enable')
  const panelTitle = showInstallAction ? t('phone.panelTitle') : t('phone.notifications')

  function refreshApp() {
    window.location.reload()
  }

  return (
    <article className={compact ? 'phone-setup-panel is-compact' : 'panel phone-setup-panel'}>
      <div className="phone-setup-heading">
        <div>
          <p className="overline">{t('phone.scope')}</p>
          <h2>{panelTitle}</h2>
        </div>
        <Smartphone size={20} />
      </div>
      <div className="phone-setup-grid">
        {showInstallAction && (
          <>
            <div>
              <strong>{installStatus}</strong>
              <span>{isStandaloneMode ? t('phone.openAsApp') : getDeviceInstallHint()}</span>
            </div>
            <button className="small-button" disabled={isStandaloneMode} onClick={onInstallApp} type="button">
              {installButtonLabel}
            </button>
          </>
        )}
        <div>
          <strong>{notificationText}</strong>
          <span>{pushSupport.supported ? t('phone.channels') : pushSupport.reason}</span>
        </div>
        <button className="small-button" disabled={notificationButtonDisabled} onClick={onEnableNotifications} type="button">
          {notificationButtonLabel}
        </button>
        <div>
          <strong>{t('phone.refreshApp')}</strong>
          <span>{t('phone.refreshBody')}</span>
        </div>
        <button className="small-button" onClick={refreshApp} type="button">
          {t('phone.refresh')}
        </button>
      </div>
      {notificationStatus && <p className="sync-status-line">{notificationStatus}</p>}
    </article>
  )
}

function PhotoPreviewModal({ imageUrl, name, onClose }) {
  const { t } = useI18n()

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="photo-preview-modal" role="dialog" aria-modal="true" aria-label={`Foto profilo ${name}`} onClick={(event) => event.stopPropagation()}>
        <div className="panel-header compact">
          <div>
            <p className="overline">{t('drivers.photo')}</p>
            <h2>{name}</h2>
          </div>
          <div className="photo-preview-actions">
            <a className="small-button" download href={imageUrl} rel="noreferrer" target="_blank">
              <Download size={15} />
              {t('documents.openOrSave')}
            </a>
            <button className="small-button" onClick={onClose} type="button">
              {t('common.close')}
            </button>
          </div>
        </div>
        <img alt={`Foto profilo ${name}`} src={imageUrl} />
      </div>
    </div>
  )
}

function SupportWorkspace({ t }) {
  const [activeSectionId, setActiveSectionId] = useState(supportSections[0].id)
  const activeSection = supportSections.find((section) => section.id === activeSectionId) ?? supportSections[0]
  const ActiveIcon = activeSection.icon

  return (
    <section className="support-workspace" aria-label={t('support.title')}>
      <div className="panel support-hero-panel">
        <div>
          <p className="overline">{t('support.overline')}</p>
          <h2>{t('support.title')}</h2>
          <p>{t('support.subtitle')}</p>
        </div>
        <BookOpen size={24} />
      </div>

      <div className="support-tabs" role="tablist" aria-label={t('support.title')}>
        {supportSections.map((section) => (
          <button
            aria-selected={activeSection.id === section.id}
            className={activeSection.id === section.id ? 'support-tab is-active' : 'support-tab'}
            key={section.id}
            onClick={() => setActiveSectionId(section.id)}
            role="tab"
            type="button"
          >
            <section.icon size={17} />
            {t(section.titleKey)}
          </button>
        ))}
      </div>

      <article className="panel support-content-panel">
        <div className="panel-header compact">
          <div>
            <p className="overline">{t('nav.support')}</p>
            <h2>{t(activeSection.titleKey)}</h2>
          </div>
          <ActiveIcon size={20} />
        </div>
        <p className="support-section-description">{activeSection.description}</p>
        <div className="support-card-grid">
          {activeSection.items.map((item) => (
            <section className="support-card" key={item.title}>
              <strong>{item.title}</strong>
              {item.body && <p>{item.body}</p>}
              {item.points && (
                <ul>
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </section>
  )
}

function SettingsWorkspace({
  companyEmail,
  companyInvoices = [],
  companyLogoUrl,
  companyProfile,
  companyStorageSummary = emptyCompanyStorageSummary,
  installPromptAvailable,
  isStandaloneMode,
  language,
  notificationEnabled,
  notificationStatus,
  onCompanyLogoUpload,
  onEnablePhoneNotifications,
  onInstallPhoneApp,
  onLanguageChange,
  onOpenBillingPortal,
  onOpenCompanyInvoice,
  onUpdateCompanyProfile,
  showInstallAction,
  syncStatus,
  t,
}) {
  const [form, setForm] = useState({
    headquarters: companyProfile.headquarters ?? '',
    name: companyProfile.name ?? '',
    vatNumber: companyProfile.vatNumber ?? '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const storageLimitBytes = getStorageLimitBytes(companyProfile.billingPlan)
  const storageUsagePercent = getStorageUsagePercent(companyStorageSummary, companyProfile.billingPlan)
  const storageBreakdown = [
    ['Documenti', companyStorageSummary.documentBytes],
    ['Chat', companyStorageSummary.chatBytes],
    ['Guasti', companyStorageSummary.faultBytes],
    ['Profili e logo', companyStorageSummary.profileBytes],
  ]

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    await onUpdateCompanyProfile(form)
    setIsSaving(false)
  }

  return (
    <section className="settings-workspace" aria-label="Impostazioni azienda">
      <form className="panel settings-panel" onSubmit={handleSubmit}>
        <div className="panel-header compact">
          <div>
            <p className="overline">{t('settings.profileOverline')}</p>
            <h2>{t('nav.settings')}</h2>
          </div>
          <SettingsIcon size={20} />
        </div>
        <CompanyLogoUploader companyName={form.name} logoUrl={companyLogoUrl} onUpload={onCompanyLogoUpload} />
        <div className="form-grid">
          <label className="wide-field">
            {t('settings.legalName')}
            <input
              autoComplete="organization"
              required
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
          </label>
          <label>
            {t('settings.vatNumber')}
            <input value={form.vatNumber} onChange={(event) => updateField('vatNumber', event.target.value)} />
          </label>
          <label>
            {t('settings.headquarters')}
            <input value={form.headquarters} onChange={(event) => updateField('headquarters', event.target.value)} />
          </label>
          <label className="wide-field">
            {t('settings.emailAccess')}
            <input disabled value={companyEmail ?? ''} />
          </label>
        </div>
        <button className="primary-button full-button" disabled={isSaving} type="submit">
          <Save size={17} />
          {isSaving ? t('common.saving') : t('common.saveChanges')}
        </button>
        {syncStatus && <p className="sync-status-line">{syncStatus}</p>}
      </form>
      <div className="settings-side-column">
        <aside className="panel settings-language-panel">
          <div className="panel-header compact">
            <div>
              <p className="overline">{t('nav.settings')}</p>
              <h2>{t('language.label')}</h2>
            </div>
            <Globe2 size={20} />
          </div>
          <div className="settings-language-body">
            <LanguageSelector language={language} onLanguageChange={onLanguageChange} t={t} />
          </div>
        </aside>
        <aside className="panel settings-summary-panel">
          <div className="panel-header compact">
            <div>
              <p className="overline">{t('settings.companyPreview')}</p>
              <h2>{t('settings.companyData')}</h2>
            </div>
            <Building2 size={20} />
          </div>
          <div className="settings-summary-list">
            <DetailLine label="Dashboard" value={form.name} />
            <DetailLine label={t('settings.vatNumber')} value={form.vatNumber || t('common.notInserted')} />
            <DetailLine label={t('settings.headquarters')} value={form.headquarters || t('common.notInserted')} />
            <DetailLine label={t('settings.emailAccess')} value={companyEmail || t('common.notAvailable')} />
          </div>
        </aside>
        <aside className="panel billing-panel">
          <div className="panel-header compact">
            <div>
              <p className="overline">Amministrazione</p>
              <h2>Licenza e fatture</h2>
            </div>
            <ShieldCheck size={20} />
          </div>
          <div className="billing-summary">
            <span className={`billing-status-pill is-${companyProfile.billingStatus || 'active'}`}>
              {getBillingStatusLabel(companyProfile.billingStatus)}
            </span>
            <DetailLine label="Piano" value={getBillingPlanLabel(companyProfile.billingPlan)} />
            <DetailLine label="Email fatturazione" value={companyProfile.billingEmail || companyEmail || t('common.notInserted')} />
            <DetailLine
              label="Rinnovo"
              value={companyProfile.billingCurrentPeriodEnd ? formatDate(companyProfile.billingCurrentPeriodEnd) : 'Manuale'}
            />
            <button
              className="secondary-button full-inline-button"
              disabled={companyProfile.billingProvider !== 'stripe' || !companyProfile.billingCustomerId}
              onClick={onOpenBillingPortal}
              type="button"
            >
              <BadgeCheck size={16} />
              Gestisci pagamento
            </button>
          </div>
          <div className="invoice-list">
            <div className="invoice-list-heading">
              <strong>Storico fatture</strong>
              <span>{companyInvoices.length}</span>
            </div>
            {companyInvoices.length > 0 ? (
              companyInvoices.map((invoice) => (
                <button
                  className="invoice-row"
                  disabled={!invoice.pdfPath}
                  key={invoice.id}
                  onClick={() => onOpenCompanyInvoice?.(invoice)}
                  type="button"
                >
                  <span>
                    <strong>{invoice.invoiceNumber}</strong>
                    <small>{invoice.issuedAt ? formatDate(invoice.issuedAt) : 'Data non inserita'}</small>
                  </span>
                  <span>
                    <strong>{formatInvoiceAmount(invoice)}</strong>
                    <small>{getInvoiceStatusLabel(invoice.status)}</small>
                  </span>
                </button>
              ))
            ) : (
              <p className="invoice-empty">Le fatture emesse compariranno qui con il PDF scaricabile.</p>
            )}
          </div>
        </aside>
        <aside className="panel storage-panel">
          <div className="panel-header compact">
            <div>
              <p className="overline">Archivio digitale</p>
              <h2>Spazio file</h2>
            </div>
            <FileText size={20} />
          </div>
          <div className="storage-summary">
            <div className="storage-usage-heading">
              <span>
                <strong>{formatBytes(companyStorageSummary.totalBytes)}</strong>
                <small>usati su {formatBytes(storageLimitBytes)}</small>
              </span>
              <b>{storageUsagePercent}%</b>
            </div>
            <div className="storage-meter" aria-label={`Spazio usato ${storageUsagePercent}%`}>
              <span style={{ width: `${storageUsagePercent}%` }} />
            </div>
            <div className="storage-breakdown">
              {storageBreakdown.map(([label, bytes]) => (
                <div className="storage-breakdown-row" key={label}>
                  <span>{label}</span>
                  <strong>{formatBytes(bytes)}</strong>
                </div>
              ))}
            </div>
            <p className="storage-note">
              {companyStorageSummary.fileCount} file registrati. Le immagini vengono ottimizzate prima del caricamento.
            </p>
          </div>
        </aside>
        <div className="settings-phone-setup">
          <PhoneSetupPanel
            installPromptAvailable={installPromptAvailable}
            isStandaloneMode={isStandaloneMode}
            notificationEnabled={notificationEnabled}
            notificationStatus={notificationStatus}
            onEnableNotifications={onEnablePhoneNotifications}
            onInstallApp={onInstallPhoneApp}
            showInstallAction={showInstallAction}
          />
        </div>
      </div>
    </section>
  )
}

function DailyMotivation({ role, t }) {
  return (
    <div className={`daily-motivation is-${role}`}>
      <ShieldCheck size={16} />
      <span>{t('daily.overline')}</span>
      <strong>{getDailyMotivation(role, t)}</strong>
    </div>
  )
}

function OnboardingPanel({
  activeDriverCount,
  activeVehicleCount,
  companyProfile,
  complianceItemCount,
  notificationEnabled,
  onAddDeadline,
  onOpenDocuments,
  onOpenDrivers,
  onOpenFleet,
  onOpenSettings,
  t,
}) {
  const companyProfileReady = Boolean(
    companyProfile.name &&
    !placeholderCompanyNames.has(companyProfile.name) &&
    companyProfile.logoPath,
  )
  const steps = [
    {
      action: onOpenSettings,
      body: t('onboarding.companyBody'),
      done: companyProfileReady,
      icon: Building2,
      title: t('onboarding.companyTitle'),
    },
    {
      action: onOpenDrivers,
      body: t('onboarding.driversBody'),
      done: activeDriverCount > 0,
      icon: Users,
      title: t('onboarding.driversTitle'),
    },
    {
      action: onOpenFleet,
      body: t('onboarding.fleetBody'),
      done: activeVehicleCount > 0,
      icon: Truck,
      title: t('onboarding.fleetTitle'),
    },
    {
      action: complianceItemCount > 0 ? onOpenDocuments : onAddDeadline,
      body: t('onboarding.deadlinesBody'),
      done: complianceItemCount > 0,
      icon: CalendarClock,
      title: t('onboarding.deadlinesTitle'),
    },
    {
      action: onOpenSettings,
      body: t('onboarding.notificationsBody'),
      done: notificationEnabled,
      icon: Bell,
      title: t('onboarding.notificationsTitle'),
    },
  ]
  const completedCount = steps.filter((step) => step.done).length
  const progressValue = Math.round((completedCount / steps.length) * 100)

  if (completedCount === steps.length) return null

  return (
    <article className="panel setup-panel" aria-label={t('onboarding.title')}>
      <div className="panel-header compact">
        <div>
          <p className="overline">{t('onboarding.overline')}</p>
          <h2>{t('onboarding.title')}</h2>
        </div>
        <span className="setup-summary">{t('onboarding.completed', { count: completedCount, total: steps.length })}</span>
      </div>
      <p className="setup-intro">{t('onboarding.body')}</p>
      <div className="setup-progress" aria-label={t('onboarding.progress')}>
        <span style={{ width: `${progressValue}%` }} />
      </div>
      <div className="setup-list">
        {steps.map((step, index) => (
          <button
            className={step.done ? 'setup-row is-done' : 'setup-row'}
            key={step.title}
            onClick={step.action}
            type="button"
          >
            <span className="setup-index">{step.done ? <Check size={15} /> : index + 1}</span>
            <step.icon size={20} />
            <span>
              <strong>{step.title}</strong>
              <small>{step.body}</small>
            </span>
            <b>{step.done ? t('onboarding.done') : t('common.open')}</b>
          </button>
        ))}
      </div>
    </article>
  )
}

function HeroPanel({
  activeDriverCount,
  activeVehicleCount,
  companyName,
  companyLogoUrl,
  criticalCheckCount,
  notificationCount,
  onOpenCriticalChecks,
  onOpenDeadlineWindow,
  onOpenFaults,
  onNewDeadline,
  onOpenNotifications,
  openFaultCount,
  summary,
  t,
}) {
  const priorityCards = [
    {
      detail: t('hero.priorityCriticalDetail'),
      icon: AlertTriangle,
      isActive: criticalCheckCount > 0,
      label: t('hero.priorityCriticalLabel'),
      onClick: onOpenCriticalChecks,
      tone: 'danger',
      value: criticalCheckCount,
    },
    {
      detail: t('hero.priorityFaultDetail'),
      icon: Wrench,
      isActive: openFaultCount > 0,
      label: t('hero.priorityFaultLabel'),
      onClick: onOpenFaults,
      tone: 'warning',
      value: openFaultCount,
    },
    {
      detail: t('hero.priorityDeadlineDetail', { count: summary.critical }),
      icon: CalendarClock,
      isActive: summary.next30 > 0,
      label: t('hero.priorityDeadlineLabel'),
      onClick: onOpenDeadlineWindow,
      tone: 'info',
      value: summary.next30,
    },
  ]

  return (
    <section className="hero-panel" aria-label={t('hero.aria')}>
      <div className="hero-copy">
        <div className="company-title-row">
          <EntityAvatar imageUrl={companyLogoUrl} name={companyName} variant="company" />
          <h2>{companyName}</h2>
        </div>
        <p>{t('hero.description')}</p>
        <DailyMotivation role="company" t={t} />
        <div className="hero-facts" aria-label="Dimensione azienda">
          <div>
            <strong>{activeDriverCount}</strong>
            <span>{t('hero.factDrivers')}</span>
          </div>
          <div>
            <strong>{activeVehicleCount}</strong>
            <span>{t('hero.factVehicles')}</span>
          </div>
          <div>
            <strong>{notificationCount}</strong>
            <span>{t('hero.factNotifications')}</span>
          </div>
        </div>
        <div className="hero-actions">
          <button className="primary-button" onClick={onNewDeadline} type="button">
            <Plus size={17} />
            {t('hero.newDeadline')}
          </button>
          <button className="ghost-button" onClick={onOpenNotifications} type="button">
            <Bell size={17} />
            {t('hero.openBell')}
          </button>
        </div>
      </div>
      <div className="priority-grid" aria-label={t('hero.priorityAria')}>
        {priorityCards.map((card) => (
          <button
            aria-label={`Apri ${card.label.toLowerCase()}: ${card.value}`}
            className={`priority-card tone-${card.tone}${card.isActive ? ' is-active' : ''}`}
            key={card.label}
            onClick={card.onClick}
            type="button"
          >
            <div>
              <span className="priority-icon">
                <card.icon size={20} />
              </span>
              <span>{card.label}</span>
            </div>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </button>
        ))}
      </div>
    </section>
  )
}

function RecordsWorkspace({
  activeTab,
  assetPreviewUrl,
  assetRecords = [],
  documentEvents,
  documentRecords,
  driverRecords,
  documentsSyncStatus,
  driversSyncStatus,
  fleetSyncStatus,
  onAddDriver,
  onAddDocument,
  onAddVehicle,
  onArchiveDriver,
  onArchiveVehicle,
  onBackHome,
  onDriverDocumentUpload,
  onDriverProfileImageUpload,
  onOpenDriverDocument,
  onRemoveDocument,
  onRemoveDocumentFile,
  onTabChange,
  onUpdateDocument,
  onUpdateDriver,
  onUpdateVehicle,
  itemRecords = [],
  personRecords = [],
  t,
  vehicleRecords,
}) {
  const activeDrivers = driverRecords.filter((driver) => driver.status !== 'Archiviato')
  const activeVehicles = vehicleRecords.filter((vehicle) => vehicle.status !== 'Archiviato')
  const activePeople = personRecords.filter((person) => !['archived', 'Archiviato'].includes(person.status))
  const activeAssets = assetRecords.filter((asset) => !['archived', 'Archiviato'].includes(asset.status))
  const staffPeople = activePeople.filter((person) => person.department !== 'drivers')
  const tabs = [
    {
      count: staffPeople.length + activeAssets.length,
      icon: Building2,
      id: 'people',
      label: 'Persone',
      text: 'Ufficio, magazzino, muletti e reparti',
    },
    {
      count: activeDrivers.length,
      icon: Users,
      id: 'drivers',
      label: t('records.driversLabel'),
      text: t('records.driversText'),
    },
    {
      count: activeVehicles.length,
      icon: Truck,
      id: 'fleet',
      label: t('records.fleetLabel'),
      text: t('records.fleetText'),
    },
    {
      count: documentRecords.length,
      icon: FileText,
      id: 'documents',
      label: t('records.documentsLabel'),
      text: t('records.documentsText'),
    },
  ]

  return (
    <section className="records-workspace" aria-label={t('records.aria')}>
      <div className="panel records-switch-panel">
        <div className="panel-header compact">
          <div>
            <p className="overline">{t('records.overline')}</p>
            <h2>{t('records.title')}</h2>
          </div>
          <Users size={20} />
        </div>
        <div className="records-tabs" role="tablist" aria-label={t('records.tablist')}>
          {tabs.map((tab) => (
            <button
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? 'records-tab is-active' : 'records-tab'}
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              type="button"
            >
              <tab.icon size={18} />
              <span>
                <strong>{tab.label}</strong>
                <small>{tab.text}</small>
              </span>
              <b>{tab.count}</b>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'people' ? (
        <PeopleWorkspace
          assetRecords={assetRecords}
          itemRecords={itemRecords}
          personRecords={personRecords}
        />
      ) : activeTab === 'documents' ? (
        <DocumentsWorkspace
          documentEvents={documentEvents}
          documentRecords={documentRecords}
          driverRecords={driverRecords}
          onAddDocument={onAddDocument}
          onDriverDocumentUpload={onDriverDocumentUpload}
          onOpenDriverDocument={onOpenDriverDocument}
          onRemoveDocument={onRemoveDocument}
          onRemoveDocumentFile={onRemoveDocumentFile}
          onUpdateDocument={onUpdateDocument}
          syncStatus={documentsSyncStatus}
        />
      ) : activeTab === 'fleet' ? (
        <FleetWorkspace
          driverRecords={driverRecords}
          onAddVehicle={onAddVehicle}
          onArchiveVehicle={onArchiveVehicle}
          onBackHome={onBackHome}
          onUpdateVehicle={onUpdateVehicle}
          syncStatus={fleetSyncStatus}
          vehicleRecords={vehicleRecords}
        />
      ) : (
        <DriversWorkspace
          assetPreviewUrl={assetPreviewUrl}
          driverRecords={driverRecords}
          onAddDriver={onAddDriver}
          onArchiveDriver={onArchiveDriver}
          onBackHome={onBackHome}
          onDriverProfileImageUpload={onDriverProfileImageUpload}
          onUpdateDriver={onUpdateDriver}
          syncStatus={driversSyncStatus}
          vehicleRecords={vehicleRecords}
        />
      )}
    </section>
  )
}

function getUpcomingWorkforceDeadlines(itemRecords, matcher) {
  return itemRecords
    .filter((item) => item.dueDate && !['archived', 'done'].includes(item.status) && matcher(item))
    .slice()
    .sort((first, second) => new Date(first.dueDate) - new Date(second.dueDate))
    .slice(0, 3)
}

function PeopleWorkspace({ assetRecords = [], itemRecords = [], personRecords = [] }) {
  const officePeople = personRecords.filter((person) => person.department === 'office')
  const warehousePeople = personRecords.filter((person) => person.department === 'warehouse')
  const warehouseAssets = assetRecords.filter((asset) => !['archived', 'Archiviato'].includes(asset.status))
  const activeStaffCount = officePeople.length + warehousePeople.length
  const upcomingStaffDeadlines = itemRecords.filter((item) => (
    item.dueDate
      && !['archived', 'done'].includes(item.status)
      && ['person', 'asset'].includes(item.scope)
      && daysUntil(item.dueDate) <= 30
  ))

  return (
    <section className="people-workspace" aria-label="Persone azienda">
      <div className="people-main">
        <div className="panel people-panel">
          <div className="panel-header">
            <div>
              <p className="overline">Anagrafiche</p>
              <h2>Persone e reparti</h2>
            </div>
            <div className="drivers-count">
              <strong>{activeStaffCount}</strong>
              <span>persone</span>
            </div>
          </div>
          <div className="people-summary-grid">
            <div>
              <strong>{officePeople.length}</strong>
              <span>Ufficio</span>
            </div>
            <div>
              <strong>{warehousePeople.length}</strong>
              <span>Magazzino</span>
            </div>
            <div>
              <strong>{warehouseAssets.length}</strong>
              <span>Attrezzature</span>
            </div>
            <div>
              <strong>{upcomingStaffDeadlines.length}</strong>
              <span>Scadenze 30 gg</span>
            </div>
          </div>
          <div className="people-section-list">
            <PeopleDepartmentBlock
              emptyText="Nessuna persona ufficio caricata."
              icon={Building2}
              itemRecords={itemRecords}
              people={officePeople}
              title="Ufficio"
            />
            <PeopleDepartmentBlock
              emptyText="Nessun magazziniere caricato."
              icon={Users}
              itemRecords={itemRecords}
              people={warehousePeople}
              title="Magazzino"
            />
          </div>
        </div>
      </div>
      <WarehouseAssetsPanel assetRecords={warehouseAssets} itemRecords={itemRecords} />
    </section>
  )
}

function PeopleDepartmentBlock({ emptyText, icon: Icon, itemRecords, people, title }) {
  return (
    <section className="people-section">
      <div className="people-section-title">
        <Icon size={17} />
        <strong>{title}</strong>
      </div>
      {people.map((person) => {
        const deadlines = getUpcomingWorkforceDeadlines(itemRecords, (item) => item.personId === person.id)

        return (
          <article className="people-row" key={person.id}>
            <div>
              <strong>{person.name}</strong>
              <span>{person.jobTitle || getWorkforceRoleLabel(person.personType)} · {getWorkforceDepartmentLabel(person.department)}</span>
              <small>{[person.phone, person.email, person.depot].filter(Boolean).join(' · ') || 'Contatto non indicato'}</small>
            </div>
            <WorkforceDeadlineMiniList deadlines={deadlines} />
          </article>
        )
      })}
      {people.length === 0 && <p className="archive-note">{emptyText}</p>}
    </section>
  )
}

function WarehouseAssetsPanel({ assetRecords, itemRecords }) {
  return (
    <aside className="panel people-assets-panel">
      <div className="panel-header compact">
        <div>
          <p className="overline">Magazzino</p>
          <h2>Muletti e attrezzature</h2>
        </div>
        <Wrench size={20} />
      </div>
      <div className="people-assets-list">
        {assetRecords.map((asset) => {
          const deadlines = getUpcomingWorkforceDeadlines(itemRecords, (item) => item.assetId === asset.id)

          return (
            <article className="people-asset-row" key={asset.id}>
              <div>
                <strong>{asset.code}</strong>
                <span>{getWorkforceAssetLabel(asset.assetType)} · {asset.model || 'modello non indicato'}</span>
                <small>{[asset.serialNumber && `Matricola ${asset.serialNumber}`, asset.location].filter(Boolean).join(' · ') || 'Posizione non indicata'}</small>
              </div>
              <WorkforceDeadlineMiniList deadlines={deadlines} />
            </article>
          )
        })}
        {assetRecords.length === 0 && <p className="archive-note">Nessun muletto o attrezzatura caricata.</p>}
      </div>
    </aside>
  )
}

function WorkforceDeadlineMiniList({ deadlines }) {
  if (!deadlines.length) {
    return <span className="people-deadline-empty">Nessuna scadenza vicina</span>
  }

  return (
    <div className="people-deadline-list">
      {deadlines.map((deadline) => {
        const days = daysUntil(deadline.dueDate)
        const tone = days < 0 || days <= 7 ? 'danger' : days <= 30 ? 'warning' : 'info'

        return (
          <span className={`people-deadline-pill tone-${tone}`} key={deadline.id}>
            {deadline.type} · {formatDate(deadline.dueDate)}
          </span>
        )
      })}
    </div>
  )
}

function DriversWorkspace({
  assetPreviewUrl,
  driverRecords,
  onAddDriver,
  onArchiveDriver,
  onBackHome,
  onDriverProfileImageUpload,
  onUpdateDriver,
  syncStatus,
  vehicleRecords,
}) {
  const { t } = useI18n()
  const [editingId, setEditingId] = useState(null)
  const [draftById, setDraftById] = useState({})
  const [photoPreviewDriver, setPhotoPreviewDriver] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const activeDrivers = driverRecords.filter((driver) => driver.status !== 'Archiviato')
  const archivedDrivers = driverRecords.filter((driver) => driver.status === 'Archiviato')

  function startEditing(driver) {
    setEditingId(driver.id)
    setDraftById((currentDrafts) => ({
      ...currentDrafts,
      [driver.id]: {
        depot: driver.depot,
        email: driver.email,
        name: driver.name,
        phone: driver.phone,
        role: driver.role,
        status: driver.status,
        vehicleId: driver.vehicleId,
      },
    }))
  }

  function updateDraft(driverId, field, value) {
    setDraftById((currentDrafts) => ({
      ...currentDrafts,
      [driverId]: {
        ...currentDrafts[driverId],
        [field]: value,
      },
    }))
  }

  async function saveDraft(driverId) {
    setSavingId(driverId)
    const saved = await onUpdateDriver(driverId, draftById[driverId])
    setSavingId(null)

    if (saved) {
      setEditingId(null)
    }
  }

  async function archiveDriver(driverId) {
    setSavingId(driverId)
    await onArchiveDriver(driverId)
    setSavingId(null)
  }

  return (
    <section className="drivers-workspace" aria-label={t('records.driversLabel')}>
      <div className="drivers-main">
        <div className="panel drivers-panel">
          <div className="panel-header">
            <div>
              <p className="overline">{t('records.title')}</p>
              <h2>{t('records.driversLabel')}</h2>
            </div>
            <div className="drivers-count">
              <strong>{activeDrivers.length}</strong>
              <span>{t('common.activePlural')}</span>
            </div>
          </div>
          <div className="drivers-table">
            <div className="drivers-table-head">
              <span>{t('common.driver')}</span>
              <span>{t('drivers.username')}</span>
              <span>{t('common.vehicle')}</span>
              <span>{t('common.status')}</span>
              <span>{t('common.actions')}</span>
            </div>
            {activeDrivers.map((driver) => (
              <DriverManagementRow
                assetPreviewUrl={assetPreviewUrl}
                draft={draftById[driver.id]}
                driver={driver}
                editing={editingId === driver.id}
                key={driver.id}
                onArchive={() => archiveDriver(driver.id)}
                onCancel={() => setEditingId(null)}
                onEdit={() => startEditing(driver)}
                onPhotoUpload={(file) => onDriverProfileImageUpload(driver.id, file)}
                onPreviewPhoto={() => setPhotoPreviewDriver(driver)}
                onSave={() => saveDraft(driver.id)}
                onUpdateDraft={(field, value) => updateDraft(driver.id, field, value)}
                saving={savingId === driver.id}
                vehicleRecords={vehicleRecords}
              />
            ))}
          </div>
          {syncStatus && <p className="sync-status-line">{syncStatus}</p>}
          {archivedDrivers.length > 0 && (
            <p className="archive-note">{t('drivers.archivedHidden', { count: archivedDrivers.length })}</p>
          )}
        </div>
      </div>
      <DriverCreatePanel onAddDriver={onAddDriver} onBackHome={onBackHome} vehicleRecords={vehicleRecords} />
      {photoPreviewDriver && (
        <PhotoPreviewModal
          imageUrl={assetPreviewUrl(photoPreviewDriver.profileImagePath)}
          name={photoPreviewDriver.name}
          onClose={() => setPhotoPreviewDriver(null)}
        />
      )}
    </section>
  )
}

function DriverManagementRow({
  assetPreviewUrl,
  draft,
  driver,
  editing,
  onArchive,
  onCancel,
  onEdit,
  onPhotoUpload,
  onPreviewPhoto,
  onSave,
  onUpdateDraft,
  saving,
  vehicleRecords,
}) {
  const { t } = useI18n()
  const assignedVehicle = vehicleRecords.find((vehicle) => vehicle.id === driver.vehicleId)
  const username = driver.username ?? normalizeDriverUsername(driver.name)
  const driverPhotoUrl = assetPreviewUrl(driver.profileImagePath)

  if (editing) {
    return (
      <article className="driver-row is-editing">
        <div className="driver-person">
          <input value={draft.name} onChange={(event) => onUpdateDraft('name', event.target.value)} />
          <input value={draft.phone} onChange={(event) => onUpdateDraft('phone', event.target.value)} />
        </div>
        <div>
          <strong>{username}</strong>
          <span>{buildDriverAuthEmail(username)}</span>
        </div>
        <select value={draft.vehicleId} onChange={(event) => onUpdateDraft('vehicleId', event.target.value)}>
          <option value="">{t('drivers.noVehicle')}</option>
          {vehicleRecords
            .filter((vehicle) => vehicle.fleetType !== 'semirimorchio')
            .map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} · {vehicle.type}
              </option>
            ))}
        </select>
        <select value={draft.status} onChange={(event) => onUpdateDraft('status', event.target.value)}>
          <option value="Disponibile">{t('drivers.statusAvailable')}</option>
          <option value="In servizio">{t('drivers.statusService')}</option>
          <option value="In viaggio">{t('drivers.statusTravelling')}</option>
          <option value="Sospeso">{t('drivers.statusPaused')}</option>
        </select>
        <div className="row-actions">
          <button className="small-button" disabled={saving} onClick={onSave} type="button">
            <Save size={15} />
            {saving ? t('common.savingShort') : t('common.saveShort')}
          </button>
          <button className="small-button" disabled={saving} onClick={onCancel} type="button">
            {t('common.cancel')}
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="driver-row">
      <div className="driver-person">
        <button
          aria-label={driverPhotoUrl ? `Ingrandisci foto di ${driver.name}` : `Foto non caricata per ${driver.name}`}
          className="avatar-preview-button"
          disabled={!driverPhotoUrl}
          onClick={onPreviewPhoto}
          type="button"
        >
          <EntityAvatar imageUrl={driverPhotoUrl} name={driver.name} />
        </button>
        <div>
          <strong>{driver.name}</strong>
          <span>{driver.phone}</span>
        </div>
        <ImageUploadControl label={t('common.photo')} onUpload={onPhotoUpload} />
      </div>
      <div>
        <strong>{username}</strong>
        <span>{driver.authEmail ?? buildDriverAuthEmail(username)}</span>
      </div>
      <div>
        <strong>{assignedVehicle?.plate ?? t('drivers.assignedNone')}</strong>
        <span>{assignedVehicle ? `${assignedVehicle.model} · ${assignedVehicle.type}` : t('drivers.assignVehicle')}</span>
      </div>
      <span className="status-pill tone-info">{getDriverStatusLabel(driver.status, t)}</span>
      <div className="row-actions">
        <button className="small-button" disabled={saving} onClick={onEdit} type="button">
          <Pencil size={15} />
          {t('common.edit')}
        </button>
        <button className="small-button danger-action" disabled={saving} onClick={onArchive} type="button">
          {saving ? t('common.archiving') : t('common.archive')}
        </button>
      </div>
    </article>
  )
}

function DriverCreatePanel({ onAddDriver, onBackHome, vehicleRecords }) {
  const { t } = useI18n()
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState(getDriverCreateDefaults)
  const [showValidation, setShowValidation] = useState(false)

  const authEmail = form.username ? buildDriverAuthEmail(form.username) : ''
  const missingRequiredFields = [
    form.name.trim() ? null : t('drivers.name').toLowerCase(),
    form.username.trim() ? null : t('drivers.username').toLowerCase(),
    form.phone.trim() ? null : t('drivers.phone').toLowerCase(),
    form.password.trim() ? null : t('drivers.password').toLowerCase(),
    form.password.trim() && form.password.trim().length < 8 ? 'password min 8' : null,
  ].filter(Boolean)
  const canSubmit = missingRequiredFields.length === 0

  function updateField(field, value) {
    setForm((currentForm) => {
      if (field === 'name' && !currentForm.username) {
        return {
          ...currentForm,
          name: value,
          username: normalizeDriverUsername(value),
        }
      }

      return { ...currentForm, [field]: value }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setShowValidation(true)
    if (!canSubmit) return

    setIsSaving(true)
    const added = await onAddDriver({
      id: `drv-${Date.now()}`,
      authEmail,
      depot: form.depot,
      email: form.email || authEmail,
      name: form.name,
      password: form.password,
      phone: form.phone,
      role: form.role,
      status: 'Disponibile',
      username: normalizeDriverUsername(form.username),
      vehicleId: form.vehicleId,
    })
    setIsSaving(false)

    if (!added) return

    setShowValidation(false)
    setForm(getDriverCreateDefaults())
  }

  return (
    <form className="panel driver-create-panel" noValidate onSubmit={handleSubmit}>
      <div className="panel-header compact">
        <div>
          <p className="overline">{t('drivers.createAccessOverline')}</p>
          <h2>{t('drivers.createTitle')}</h2>
        </div>
        <div className="panel-header-actions">
          <button className="small-button" onClick={onBackHome} type="button">
            <ArrowLeft size={15} />
            {t('common.back')}
          </button>
          <UserPlus size={20} />
        </div>
      </div>
      <div className="form-grid single-column">
        <label>
          {t('drivers.name')}
          <input required value={form.name} onChange={(event) => updateField('name', event.target.value)} />
        </label>
        <label>
          {t('drivers.username')}
          <input required value={form.username} onChange={(event) => updateField('username', event.target.value)} />
        </label>
        <label>
          {t('drivers.password')}
          <span className="password-field-row">
            <input
              minLength={8}
              required
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
            />
            <button className="small-button" onClick={() => updateField('password', generateTemporaryPassword())} type="button">
              {t('drivers.generatePassword')}
            </button>
          </span>
        </label>
        <label>
          {t('drivers.phone')}
          <input required value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
        </label>
        <label>
          {t('drivers.role')}
          <input value={form.role} onChange={(event) => updateField('role', event.target.value)} />
        </label>
        <label>
          {t('drivers.depot')}
          <input value={form.depot} onChange={(event) => updateField('depot', event.target.value)} />
        </label>
        <label>
          {t('drivers.vehicleAssigned')}
          <select value={form.vehicleId} onChange={(event) => updateField('vehicleId', event.target.value)}>
            <option value="">{t('drivers.noVehicle')}</option>
            {vehicleRecords
              .filter((vehicle) => vehicle.fleetType !== 'semirimorchio')
              .map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} · {vehicle.type}
                </option>
              ))}
          </select>
        </label>
      </div>
      <div className="auth-email-box">
        <strong>{t('drivers.supabaseEmail')}</strong>
        <span>{authEmail || t('drivers.usernameHelp')}</span>
      </div>
      {showValidation && !canSubmit && <FormValidationAlert message={formatMissingFields(missingRequiredFields, t)} />}
      <button className="primary-button full-button" disabled={isSaving} type="submit">
        <UserPlus size={17} />
        {isSaving ? t('drivers.creatingAccount') : t('drivers.createAccount')}
      </button>
    </form>
  )
}

function FleetWorkspace({ driverRecords, onAddVehicle, onArchiveVehicle, onBackHome, onUpdateVehicle, syncStatus, vehicleRecords }) {
  const { t } = useI18n()
  const [editingId, setEditingId] = useState(null)
  const [draftById, setDraftById] = useState({})
  const [savingId, setSavingId] = useState(null)
  const activeVehicles = vehicleRecords.filter((vehicle) => vehicle.status !== 'Archiviato')
  const archivedVehicles = vehicleRecords.filter((vehicle) => vehicle.status === 'Archiviato')
  const fleetGroups = fleetTypeOptions.map((option) => ({
    ...option,
    count: activeVehicles.filter((vehicle) => vehicle.fleetType === option.value).length,
    label: getFleetTypeLabel(option.value, t),
  }))

  function startEditing(vehicle) {
    setEditingId(vehicle.id)
    setDraftById((currentDrafts) => ({
      ...currentDrafts,
      [vehicle.id]: {
        fleetType: vehicle.fleetType,
        km: vehicle.km,
        model: vehicle.model,
        plate: vehicle.plate,
        status: vehicle.status,
        type: vehicle.type,
      },
    }))
  }

  function updateDraft(vehicleId, field, value) {
    setDraftById((currentDrafts) => ({
      ...currentDrafts,
      [vehicleId]: {
        ...currentDrafts[vehicleId],
        [field]: value,
      },
    }))
  }

  async function saveDraft(vehicleId) {
    setSavingId(vehicleId)
    const saved = await onUpdateVehicle(vehicleId, draftById[vehicleId])
    setSavingId(null)

    if (saved) {
      setEditingId(null)
    }
  }

  async function archiveVehicle(vehicleId) {
    setSavingId(vehicleId)
    await onArchiveVehicle(vehicleId)
    setSavingId(null)
  }

  return (
    <section className="fleet-workspace" aria-label={t('fleet.title')}>
      <div className="fleet-main">
        <div className="panel fleet-management-panel">
          <div className="panel-header">
            <div>
              <p className="overline">{t('records.fleetLabel')}</p>
              <h2>{t('fleet.title')}</h2>
            </div>
            <div className="drivers-count">
              <strong>{activeVehicles.length}</strong>
              <span>{t('fleet.vehicleActive')}</span>
            </div>
          </div>
          <div className="fleet-summary-grid">
            {fleetGroups.map((group) => (
              <div key={group.value}>
                <strong>{group.count}</strong>
                <span>{group.label}</span>
              </div>
            ))}
          </div>
          <div className="fleet-management-list">
            {activeVehicles.map((vehicle) => (
              <VehicleManagementRow
                assignedDriver={driverRecords.find((driver) => driver.vehicleId === vehicle.id)}
                draft={draftById[vehicle.id]}
                editing={editingId === vehicle.id}
                key={vehicle.id}
                onArchive={() => archiveVehicle(vehicle.id)}
                onCancel={() => setEditingId(null)}
                onEdit={() => startEditing(vehicle)}
                onSave={() => saveDraft(vehicle.id)}
                onUpdateDraft={(field, value) => updateDraft(vehicle.id, field, value)}
                saving={savingId === vehicle.id}
                vehicle={vehicle}
              />
            ))}
          </div>
          {syncStatus && <p className="sync-status-line">{syncStatus}</p>}
          {archivedVehicles.length > 0 && (
            <p className="archive-note">{t('fleet.archivedHidden', { count: archivedVehicles.length })}</p>
          )}
        </div>
      </div>
      <VehicleCreatePanel onAddVehicle={onAddVehicle} onBackHome={onBackHome} />
    </section>
  )
}

function VehicleManagementRow({
  assignedDriver,
  draft,
  editing,
  onArchive,
  onCancel,
  onEdit,
  onSave,
  onUpdateDraft,
  saving,
  vehicle,
}) {
  const { t } = useI18n()

  if (editing) {
    return (
      <article className="fleet-management-row is-editing">
        <div className="fleet-field-grid">
          <label>
            {t('fleet.plate')}
            <input value={draft.plate} onChange={(event) => onUpdateDraft('plate', event.target.value)} />
          </label>
          <label>
            {t('fleet.category')}
            <select value={draft.fleetType} onChange={(event) => onUpdateDraft('fleetType', event.target.value)}>
              {fleetTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {getFleetTypeLabel(option.value, t)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('fleet.model')}
            <input value={draft.model} onChange={(event) => onUpdateDraft('model', event.target.value)} />
          </label>
          <label>
            {t('fleet.setup')}
            <input value={draft.type} onChange={(event) => onUpdateDraft('type', event.target.value)} />
          </label>
          <label>
            Km
            <input min="0" type="number" value={draft.km} onChange={(event) => onUpdateDraft('km', event.target.value)} />
          </label>
          <label>
            {t('common.status')}
            <select value={draft.status} onChange={(event) => onUpdateDraft('status', event.target.value)}>
              {vehicleStatusOptions.map((status) => (
                <option key={status} value={status}>{getVehicleStatusLabel(status, t)}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="row-actions">
          <button className="small-button" disabled={saving} onClick={onSave} type="button">
            <Save size={15} />
            {saving ? t('common.savingShort') : t('common.saveShort')}
          </button>
          <button className="small-button" disabled={saving} onClick={onCancel} type="button">
            {t('common.cancel')}
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="fleet-management-row">
      <div className="fleet-plate-block">
        <strong>{vehicle.plate}</strong>
        <span>{getFleetTypeLabel(vehicle.fleetType, t)}</span>
      </div>
      <div>
        <strong>{vehicle.model || t('fleet.modelMissing')}</strong>
        <span>{vehicle.type || t('fleet.setupMissing')}</span>
      </div>
      <div>
        <strong>{vehicle.km.toLocaleString('it-IT')} km</strong>
        <span>{assignedDriver?.name ?? t('drivers.assignedNone')}</span>
      </div>
      <span className="status-pill tone-info">{getVehicleStatusLabel(vehicle.status, t)}</span>
      <div className="row-actions">
        <button className="small-button" disabled={saving} onClick={onEdit} type="button">
          <Pencil size={15} />
          {t('common.edit')}
        </button>
        <button className="small-button danger-action" disabled={saving} onClick={onArchive} type="button">
          {saving ? t('common.archiving') : t('common.archive')}
        </button>
      </div>
    </article>
  )
}

function VehicleCreatePanel({ onAddVehicle, onBackHome }) {
  const { t } = useI18n()
  const [isSaving, setIsSaving] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [form, setForm] = useState({
    fleetType: 'trattore',
    km: 0,
    model: '',
    plate: '',
    status: 'Operativo',
    type: 'Trattore stradale',
  })
  const missingRequiredFields = [
    form.plate.trim() ? null : t('fleet.plate').toLowerCase(),
  ].filter(Boolean)
  const canSubmit = missingRequiredFields.length === 0

  function updateField(field, value) {
    setForm((currentForm) => {
      if (field === 'fleetType') {
        const defaultType = {
          furgone: 'Furgone',
          motrice: 'Motrice',
          trattore: 'Trattore stradale',
          semirimorchio: 'Semirimorchio',
        }[value]

        return { ...currentForm, fleetType: value, type: defaultType }
      }

      return { ...currentForm, [field]: value }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setShowValidation(true)
    if (!canSubmit) return

    setIsSaving(true)
    const added = await onAddVehicle({
      id: `veh-${Date.now()}`,
      fleetType: form.fleetType,
      km: Number(form.km) || 0,
      model: form.model,
      plate: form.plate,
      status: form.status,
      type: form.type,
    })
    setIsSaving(false)

    if (!added) return

    setShowValidation(false)
    setForm({
      fleetType: 'trattore',
      km: 0,
      model: '',
      plate: '',
      status: 'Operativo',
      type: 'Trattore stradale',
    })
  }

  return (
    <form className="panel vehicle-create-panel" noValidate onSubmit={handleSubmit}>
      <div className="panel-header compact">
        <div>
          <p className="overline">{t('fleet.newVehicle')}</p>
          <h2>{t('fleet.addToFleet')}</h2>
        </div>
        <div className="panel-header-actions">
          <button className="small-button" onClick={onBackHome} type="button">
            <ArrowLeft size={15} />
            {t('common.back')}
          </button>
          <Truck size={20} />
        </div>
      </div>
      <div className="form-grid single-column">
        <label>
          {t('fleet.plate')}
          <input required value={form.plate} onChange={(event) => updateField('plate', event.target.value)} />
        </label>
        <label>
          {t('fleet.category')}
          <select value={form.fleetType} onChange={(event) => updateField('fleetType', event.target.value)}>
            {fleetTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {getFleetTypeLabel(option.value, t)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('fleet.model')}
          <input value={form.model} onChange={(event) => updateField('model', event.target.value)} />
        </label>
        <label>
          {t('fleet.setup')}
          <input value={form.type} onChange={(event) => updateField('type', event.target.value)} />
        </label>
        <label>
          Km
          <input min="0" type="number" value={form.km} onChange={(event) => updateField('km', event.target.value)} />
        </label>
        <label>
          {t('common.status')}
          <select value={form.status} onChange={(event) => updateField('status', event.target.value)}>
            {vehicleStatusOptions.map((status) => (
              <option key={status} value={status}>{getVehicleStatusLabel(status, t)}</option>
            ))}
          </select>
        </label>
      </div>
      {showValidation && !canSubmit && <FormValidationAlert message={formatMissingFields(missingRequiredFields, t)} />}
      <button className="primary-button full-button" disabled={isSaving} type="submit">
        <Plus size={17} />
        {isSaving ? t('common.saving') : t('fleet.newVehicle')}
      </button>
    </form>
  )
}

function DocumentsWorkspace({
  documentEvents = [],
  documentRecords,
  driverRecords,
  onAddDocument,
  onDriverDocumentUpload,
  onOpenDriverDocument,
  onRemoveDocument,
  onRemoveDocumentFile,
  onUpdateDocument,
  syncStatus,
}) {
  const { t } = useI18n()
  const [editingId, setEditingId] = useState(null)
  const [draftById, setDraftById] = useState({})
  const [savingId, setSavingId] = useState(null)
  const visibleDocuments = documentRecords.filter((document) => document.visibleToDriver)
  const expiringDocuments = documentRecords.filter((document) => {
    if (!document.expiresAt) return false
    const days = daysUntil(document.expiresAt)
    return days >= 0 && days <= 30
  })

  function startEditing(document) {
    setEditingId(document.id)
    setDraftById((currentDrafts) => ({
      ...currentDrafts,
      [document.id]: {
        documentNumber: document.documentNumber,
        driverId: document.driverId,
        expiresAt: document.expiresAt ?? '',
        filePath: document.filePath ?? '',
        status: document.status,
        type: document.type,
        visibleToDriver: document.visibleToDriver,
      },
    }))
  }

  function updateDraft(documentId, field, value) {
    setDraftById((currentDrafts) => ({
      ...currentDrafts,
      [documentId]: {
        ...currentDrafts[documentId],
        [field]: value,
      },
    }))
  }

  async function saveDraft(documentId) {
    setSavingId(documentId)
    const saved = await onUpdateDocument(documentId, draftById[documentId])
    setSavingId(null)

    if (saved) {
      setEditingId(null)
    }
  }

  async function removeDocument(documentId) {
    setSavingId(documentId)
    await onRemoveDocument(documentId)
    setSavingId(null)
  }

  return (
    <section className="documents-workspace" aria-label={t('records.documentsLabel')}>
      <div className="documents-main">
        <div className="panel documents-management-panel">
          <div className="panel-header">
            <div>
              <p className="overline">{t('records.overline')}</p>
              <h2>{t('records.documentsLabel')}</h2>
            </div>
            <div className="drivers-count">
              <strong>{documentRecords.length}</strong>
              <span>{t('records.documentsLabel').toLowerCase()}</span>
            </div>
          </div>
          <div className="documents-summary-grid">
            <div>
              <strong>{visibleDocuments.length}</strong>
              <span>{t('documents.visibleApp')}</span>
            </div>
            <div>
              <strong>{expiringDocuments.length}</strong>
              <span>{t('documents.within30')}</span>
            </div>
            <div>
              <strong>{documentRecords.filter((document) => document.filePath).length}</strong>
              <span>{t('documents.withFile')}</span>
            </div>
          </div>
          <div className="document-management-list">
            {documentRecords.map((document) => (
              <DocumentManagementRow
                document={document}
                draft={draftById[document.id]}
                driver={driverRecords.find((driver) => driver.id === document.driverId)}
                driverRecords={driverRecords}
                editing={editingId === document.id}
                key={document.id}
                onCancel={() => setEditingId(null)}
                onDocumentFileRemove={() => onRemoveDocumentFile?.(document)}
                onDocumentUpload={(file) => onDriverDocumentUpload?.(document, file)}
                onEdit={() => startEditing(document)}
                onOpenDocument={() => onOpenDriverDocument?.(document)}
                onRemove={() => removeDocument(document.id)}
                onSave={() => saveDraft(document.id)}
                onUpdateDraft={(field, value) => updateDraft(document.id, field, value)}
                saving={savingId === document.id}
              />
            ))}
          </div>
          {documentRecords.length === 0 && <p className="archive-note">{t('documents.noDocuments')}</p>}
          {syncStatus && <p className="sync-status-line">{syncStatus}</p>}
        </div>
        <DocumentHistoryPanel documentEvents={documentEvents} driverRecords={driverRecords} />
      </div>
      <DocumentCreatePanel
        driverRecords={driverRecords}
        onAddDocument={onAddDocument}
        onDriverDocumentUpload={onDriverDocumentUpload}
      />
    </section>
  )
}

const documentEventLabels = {
  created: 'Creato',
  deleted: 'Eliminato',
  file_removed: 'File rimosso',
  file_uploaded: 'File caricato',
  updated: 'Aggiornato',
}

function DocumentHistoryPanel({ documentEvents = [], driverRecords = [] }) {
  const { t } = useI18n()

  return (
    <section className="panel document-history-panel" aria-label={t('documents.historyTitle')}>
      <div className="panel-header compact">
        <div>
          <p className="overline">{t('documents.historyOverline')}</p>
          <h2>{t('documents.historyMovements')}</h2>
        </div>
        <Clock3 size={20} />
      </div>
      <div className="document-history-list">
        {documentEvents.map((event) => {
          const driver = driverRecords.find((driverRecord) => driverRecord.id === event.driverId)

          return (
            <article className="document-history-row" key={event.id}>
              <span className="status-pill tone-info">{documentEventLabels[event.eventType] ?? event.eventType}</span>
              <div>
                <strong>{getDocumentTypeLabel(event.documentType, t)}</strong>
                <small>
                  {driver?.name ?? t('common.driverMissing')} · {event.actorRole === 'driver' ? t('common.driver') : t('common.company')}
                </small>
              </div>
              <small>{formatShortDateTime(event.createdAt)}</small>
            </article>
          )
        })}
        {documentEvents.length === 0 && <p className="archive-note">{t('documents.historyEmpty')}</p>}
      </div>
    </section>
  )
}

function DocumentManagementRow({
  document,
  draft,
  driver,
  driverRecords,
  editing,
  onCancel,
  onDocumentFileRemove,
  onDocumentUpload,
  onEdit,
  onOpenDocument,
  onRemove,
  onSave,
  onUpdateDraft,
  saving,
}) {
  const { t } = useI18n()

  function handleDocumentFile(event) {
    const file = event.target.files?.[0]
    onDocumentUpload?.(file)
    event.target.value = ''
  }

  if (editing) {
    return (
      <article className="document-management-row is-editing">
        <div className="document-field-grid">
          <label>
            {t('common.driver')}
            <select value={draft.driverId} onChange={(event) => onUpdateDraft('driverId', event.target.value)}>
              {driverRecords.map((driverRecord) => (
                <option key={driverRecord.id} value={driverRecord.id}>
                  {driverRecord.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('documents.document')}
            <select value={draft.type} onChange={(event) => onUpdateDraft('type', event.target.value)}>
              {documentTypes.map((type) => (
                <option key={type} value={type}>{getDocumentTypeLabel(type, t)}</option>
              ))}
            </select>
          </label>
          <label>
            {t('documents.number')}
            <input value={draft.documentNumber} onChange={(event) => onUpdateDraft('documentNumber', event.target.value)} />
          </label>
          <label>
            {t('documents.expiry')}
            <input
              value={draft.expiresAt}
              onChange={(event) => onUpdateDraft('expiresAt', event.target.value)}
              onInput={(event) => onUpdateDraft('expiresAt', event.target.value)}
              type="date"
            />
          </label>
          <label>
            {t('common.status')}
            <select value={draft.status} onChange={(event) => onUpdateDraft('status', event.target.value)}>
              {driverDocumentStatusOptions.map((status) => (
                <option key={status} value={status}>{getDocumentStatusLabel(status, t)}</option>
              ))}
            </select>
          </label>
          <label>
            {t('documents.fileOrLink')}
            <input value={draft.filePath} onChange={(event) => onUpdateDraft('filePath', event.target.value)} />
          </label>
          <label className="checkbox-field">
            <input
              checked={draft.visibleToDriver}
              onChange={(event) => onUpdateDraft('visibleToDriver', event.target.checked)}
              type="checkbox"
            />
            {t('documents.visibleDriver')}
          </label>
        </div>
        <div className="row-actions">
          <button className="small-button" disabled={saving} onClick={onSave} type="button">
            <Save size={15} />
            {saving ? t('common.savingShort') : t('common.saveShort')}
          </button>
          <button className="small-button" disabled={saving} onClick={onCancel} type="button">
            {t('common.cancel')}
          </button>
          <label className="small-button document-upload-inline">
            {t('documents.uploadFile')}
            <input accept="image/*,.pdf,application/pdf" onChange={handleDocumentFile} type="file" />
          </label>
        </div>
      </article>
    )
  }

  return (
    <article className="document-management-row">
      <div>
        <strong>{getDocumentTypeLabel(document.type, t)}</strong>
        <span>{driver?.name ?? t('documents.noDriver')}</span>
      </div>
      <div>
        <strong>{document.documentNumber || t('common.notInserted')}</strong>
        <span>{document.filePath ? t('documents.filePresent') : t('documents.fileMissing')}</span>
      </div>
      <div>
        <strong>{formatOptionalDate(document.expiresAt)}</strong>
        <span>{document.visibleToDriver ? t('documents.visibleInApp') : t('documents.onlyCompany')}</span>
      </div>
      <span className="status-pill tone-info">{getDocumentStatusLabel(document.status, t)}</span>
      <div className="row-actions">
        <button className="small-button" disabled={!document.filePath || saving} onClick={onOpenDocument} type="button">
          {t('common.open')}
        </button>
        <label className="small-button document-upload-inline">
          {document.filePath ? t('common.change') : t('common.upload')}
          <input accept="image/*,.pdf,application/pdf" onChange={handleDocumentFile} type="file" />
        </label>
        {document.filePath && (
          <button className="small-button danger-action" disabled={saving} onClick={onDocumentFileRemove} type="button">
            {t('documents.removeFile')}
          </button>
        )}
        <button className="small-button" disabled={saving} onClick={onEdit} type="button">
          <Pencil size={15} />
          {t('common.edit')}
        </button>
        <button className="small-button danger-action" disabled={saving} onClick={onRemove} type="button">
          {saving ? t('common.removing') : t('common.remove')}
        </button>
      </div>
    </article>
  )
}

function DocumentCreatePanel({ driverRecords, onAddDocument, onDriverDocumentUpload }) {
  const { t } = useI18n()
  const [isSaving, setIsSaving] = useState(false)
  const [documentFile, setDocumentFile] = useState(null)
  const [form, setForm] = useState({
    documentNumber: '',
    driverId: driverRecords[0]?.id ?? '',
    expiresAt: '',
    filePath: '',
    status: 'Caricato',
    type: 'Patente C+E',
    visibleToDriver: true,
  })
  const selectedDriverId = driverRecords.some((driver) => driver.id === form.driverId)
    ? form.driverId
    : driverRecords[0]?.id ?? ''

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function handleDocumentFile(event) {
    const file = event.target.files?.[0] ?? null
    setDocumentFile(file)
    event.target.value = ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selectedDriverId || !form.type) return

    setIsSaving(true)
    const addedDocument = await onAddDocument({
      id: `doc-${Date.now()}`,
      documentNumber: form.documentNumber,
      driverId: selectedDriverId,
      expiresAt: form.expiresAt,
      filePath: documentFile ? '' : form.filePath,
      status: documentFile ? 'Mancante' : form.status,
      type: form.type,
      visibleToDriver: form.visibleToDriver,
    })

    if (!addedDocument) {
      setIsSaving(false)
      return
    }

    if (documentFile) {
      const uploaded = await onDriverDocumentUpload?.(addedDocument, documentFile)

      if (!uploaded) {
        setIsSaving(false)
        return
      }
    }

    setIsSaving(false)

    setForm({
      documentNumber: '',
      driverId: driverRecords[0]?.id ?? '',
      expiresAt: '',
      filePath: '',
      status: 'Caricato',
      type: 'Patente C+E',
      visibleToDriver: true,
    })
    setDocumentFile(null)
  }

  return (
    <form className="panel document-create-panel" onSubmit={handleSubmit}>
      <div className="panel-header compact">
        <div>
          <p className="overline">{t('documents.createOverline')}</p>
          <h2>{t('common.addDocument')}</h2>
        </div>
        <FileText size={20} />
      </div>
      <div className="form-grid single-column">
        <label>
          {t('common.driver')}
          <select value={selectedDriverId} onChange={(event) => updateField('driverId', event.target.value)}>
            {driverRecords.length === 0 && <option value="">{t('common.driverMissing')}</option>}
            {driverRecords.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('documents.document')}
          <select value={form.type} onChange={(event) => updateField('type', event.target.value)}>
            {documentTypes.map((type) => (
              <option key={type} value={type}>{getDocumentTypeLabel(type, t)}</option>
            ))}
          </select>
        </label>
        <label>
          {t('documents.number')}
          <input value={form.documentNumber} onChange={(event) => updateField('documentNumber', event.target.value)} />
        </label>
        <label>
          {t('documents.expiry')}
          <input
            value={form.expiresAt}
            onChange={(event) => updateField('expiresAt', event.target.value)}
            onInput={(event) => updateField('expiresAt', event.target.value)}
            type="date"
          />
        </label>
        <label>
          {t('common.status')}
          <select value={form.status} onChange={(event) => updateField('status', event.target.value)}>
            {driverDocumentStatusOptions.map((status) => (
              <option key={status} value={status}>{getDocumentStatusLabel(status, t)}</option>
            ))}
          </select>
        </label>
        <label>
          {t('documents.fileOrLink')}
          <input
            value={form.filePath}
            onChange={(event) => updateField('filePath', event.target.value)}
            placeholder="https://..."
          />
        </label>
        <div className="document-create-upload">
          <span>{documentFile ? documentFile.name : t('common.noFileSelected')}</span>
          <div className="document-create-upload-actions">
            <label className="document-action-button">
              {t('documents.uploadFile')}
              <input accept="image/*,.pdf,application/pdf" onChange={handleDocumentFile} type="file" />
            </label>
            {documentFile && (
              <button className="small-button" onClick={() => setDocumentFile(null)} type="button">
                {t('common.remove')}
              </button>
            )}
          </div>
        </div>
        <label className="checkbox-field">
          <input
            checked={form.visibleToDriver}
            onChange={(event) => updateField('visibleToDriver', event.target.checked)}
            type="checkbox"
          />
          {t('documents.visibleDriver')}
        </label>
      </div>
      <button className="primary-button full-button" disabled={isSaving || !selectedDriverId} type="submit">
        <Plus size={17} />
        {isSaving ? t('common.saving') : t('common.addDocument')}
      </button>
    </form>
  )
}

function OperationsWorkspace({
  acknowledgedCheckIds,
  assetPreviewUrl,
  driverRecords,
  faultReportRecords,
  onAcknowledgeCheck,
  onFilterChange,
  onMarkCheckUnread,
  onUpdateFaultStatus,
  selectedFilter = 'inbox',
  syncStatus,
  vehicleCheckRecords,
  vehicleRecords,
}) {
  const { t } = useI18n()
  const filter = selectedFilter
  const [selectedOperationKey, setSelectedOperationKey] = useState('')
  const [modalOperationKey, setModalOperationKey] = useState('')
  const isCriticalFault = (report) => ['high', 'stop_vehicle'].includes(report.severity) && !isFaultArchived(report)
  const newFaults = faultReportRecords.filter(isFaultUnread)
  const archivedFaults = faultReportRecords.filter(isFaultArchived)
  const unreadChecks = vehicleCheckRecords.filter((check) => !acknowledgedCheckIds.includes(check.id))
  const archivedChecks = vehicleCheckRecords.filter((check) => acknowledgedCheckIds.includes(check.id))
  const criticalChecks = unreadChecks.filter(hasCheckIssues)
  const criticalFaults = faultReportRecords.filter(isCriticalFault)
  const allOperations = [
    ...faultReportRecords.map((report) => ({
      createdAt: report.createdAt,
      data: report,
      id: report.id,
      kind: 'fault',
    })),
    ...vehicleCheckRecords.map((check) => ({
      createdAt: check.createdAt,
      data: check,
      id: check.id,
      kind: 'check',
    })),
  ]
  const operations = allOperations
    .filter((operation) => {
      if (filter === 'inbox') {
        return (
          (operation.kind === 'fault' && isFaultUnread(operation.data)) ||
          (operation.kind === 'check' && !acknowledgedCheckIds.includes(operation.id))
        )
      }
      if (filter === 'critical') {
        return (
          (operation.kind === 'fault' && isCriticalFault(operation.data)) ||
          (operation.kind === 'check' && !acknowledgedCheckIds.includes(operation.id) && hasCheckIssues(operation.data))
        )
      }
      if (filter === 'critical_checks') {
        return operation.kind === 'check' && !acknowledgedCheckIds.includes(operation.id) && hasCheckIssues(operation.data)
      }
      if (filter === 'archive') {
        return (
          (operation.kind === 'fault' && isFaultArchived(operation.data)) ||
          (operation.kind === 'check' && acknowledgedCheckIds.includes(operation.id))
        )
      }
      if (filter === 'faults') return operation.kind === 'fault' && isFaultUnread(operation.data)
      if (filter === 'checks') return operation.kind === 'check' && !acknowledgedCheckIds.includes(operation.id)
      return false
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const selectedOperation = operations.find((operation) => `${operation.kind}-${operation.id}` === selectedOperationKey)
  const modalOperation = allOperations.find((operation) => `${operation.kind}-${operation.id}` === modalOperationKey)
  const fallbackSelection = operations[0]
  const detailOperation = selectedOperation ?? fallbackSelection

  async function openOperation(operation) {
    setSelectedOperationKey(`${operation.kind}-${operation.id}`)
    setModalOperationKey(`${operation.kind}-${operation.id}`)
  }

  function changeFilter(nextFilter) {
    onFilterChange?.(nextFilter)
    setSelectedOperationKey('')
  }

  return (
    <section className="operations-workspace" aria-label={t('operations.title')}>
      <div className="panel operations-panel">
        <div className="panel-header">
          <div>
            <p className="overline">{t('operations.bell')}</p>
            <h2>{t('operations.title')}</h2>
          </div>
          <Bell size={22} />
        </div>
        <div className="operations-summary-grid">
          <div>
            <strong>{newFaults.length + unreadChecks.length}</strong>
            <span>{t('operations.inbox').toLowerCase()}</span>
          </div>
          <div>
            <strong>{criticalFaults.length + criticalChecks.length}</strong>
            <span>{t('operations.criticalCount')}</span>
          </div>
          <div>
            <strong>{newFaults.length}</strong>
            <span>{t('operations.activeFaults')}</span>
          </div>
          <div>
            <strong>{archivedFaults.length + archivedChecks.length}</strong>
            <span>{t('operations.archivedCount')}</span>
          </div>
        </div>
        <div className="filter-tabs operations-filters" role="tablist" aria-label={t('notifications.filterAria')}>
          <button className={filter === 'inbox' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('inbox')} type="button">
            {t('operations.inbox')} ({newFaults.length + unreadChecks.length})
          </button>
          <button className={filter === 'critical' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('critical')} type="button">
            {t('operations.critical')} ({criticalFaults.length + criticalChecks.length})
          </button>
          <button className={filter === 'critical_checks' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('critical_checks')} type="button">
            {t('operations.checkCritical')} ({criticalChecks.length})
          </button>
          <button className={filter === 'checks' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('checks')} type="button">
            {t('operations.check')} ({unreadChecks.length})
          </button>
          <button className={filter === 'faults' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('faults')} type="button">
            {t('operations.faults')} ({newFaults.length})
          </button>
          <button className={filter === 'archive' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('archive')} type="button">
            {t('operations.archived')} ({archivedFaults.length + archivedChecks.length})
          </button>
        </div>
        <div className="operations-list">
          {operations.map((operation) =>
            operation.kind === 'fault' ? (
              <FaultOperationRow
                driver={driverRecords.find((driver) => driver.id === operation.data.driverId)}
                key={`fault-${operation.id}`}
                onOpen={() => openOperation(operation)}
                onUpdateStatus={onUpdateFaultStatus}
                report={operation.data}
                selected={detailOperation?.kind === 'fault' && detailOperation.id === operation.id}
                trailer={vehicleRecords.find((vehicle) => vehicle.id === operation.data.semitrailerId)}
                vehicle={vehicleRecords.find((vehicle) => vehicle.id === operation.data.vehicleId)}
              />
            ) : (
              <CheckOperationRow
                check={operation.data}
                driver={driverRecords.find((driver) => driver.id === operation.data.driverId)}
                key={`check-${operation.id}`}
                onMarkRead={() => onAcknowledgeCheck(operation.id)}
                onMarkUnread={() => onMarkCheckUnread(operation.id)}
                onOpen={() => openOperation(operation)}
                read={acknowledgedCheckIds.includes(operation.id)}
                selected={detailOperation?.kind === 'check' && detailOperation.id === operation.id}
                trailer={vehicleRecords.find((vehicle) => vehicle.id === operation.data.semitrailerId)}
                vehicle={vehicleRecords.find((vehicle) => vehicle.id === operation.data.tractorId)}
              />
            ),
          )}
          {operations.length === 0 && <p className="archive-note">{t('operations.empty')}</p>}
        </div>
        {syncStatus && <p className="sync-status-line">{syncStatus}</p>}
      </div>
      <OperationDetailPanel
        acknowledgedCheckIds={acknowledgedCheckIds}
        assetPreviewUrl={assetPreviewUrl}
        driverRecords={driverRecords}
        operation={detailOperation}
        onAcknowledgeCheck={onAcknowledgeCheck}
        onMarkCheckUnread={onMarkCheckUnread}
        onUpdateFaultStatus={onUpdateFaultStatus}
        vehicleRecords={vehicleRecords}
      />
      <OperationDetailModal
        acknowledgedCheckIds={acknowledgedCheckIds}
        assetPreviewUrl={assetPreviewUrl}
        driverRecords={driverRecords}
        operation={modalOperation}
        onAcknowledgeCheck={onAcknowledgeCheck}
        onClose={() => setModalOperationKey('')}
        onMarkCheckUnread={onMarkCheckUnread}
        onUpdateFaultStatus={onUpdateFaultStatus}
        vehicleRecords={vehicleRecords}
      />
    </section>
  )
}

function getMessageStatus(message, senderRole) {
  const readAt = senderRole === 'company' ? message.readByDriverAt : message.readByCompanyAt

  if (readAt) return 'read'
  if (String(message.id).startsWith('chat-message-')) return 'sent'

  return 'delivered'
}

function MessageStatus({ status }) {
  const { t } = useI18n()
  const isRead = status === 'read'
  const label = status === 'read' ? t('messageStatus.read') : status === 'delivered' ? t('messageStatus.delivered') : t('messageStatus.sent')

  return (
    <span className={isRead ? 'message-status is-read' : 'message-status'} title={label}>
      {status === 'sent' ? <Check size={14} /> : <CheckCheck size={15} />}
      {label}
    </span>
  )
}

function ChatSoundButton({ enabled, onToggle, t }) {
  return (
    <button
      aria-label={enabled ? t('chat.soundOn') : t('chat.soundOff')}
      className={enabled ? 'icon-button chat-sound-button is-enabled' : 'icon-button chat-sound-button'}
      onClick={onToggle}
      title={enabled ? t('chat.soundOn') : t('chat.soundOff')}
      type="button"
    >
      {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  )
}

function ChatReplyPreview({ onCancel, reply, t }) {
  if (!reply) return null

  return (
    <div className="chat-reply-compose">
      <Reply size={16} />
      <span>
        <strong>{t('chat.replyTo', { name: reply.sender })}</strong>
        <small>{reply.text}</small>
      </span>
      <button aria-label={t('chat.cancelReply')} onClick={onCancel} type="button">
        <X size={15} />
      </button>
    </div>
  )
}

function ChatQuotedMessage({ onOpen, reply, t }) {
  if (!reply) return null

  return (
    <button className="chat-message-reply" onClick={() => onOpen?.(reply.id)} type="button">
      <strong>{reply.sender || t('chat.replyPreview')}</strong>
      <span>{reply.text}</span>
    </button>
  )
}

function ChatAvatarButton({ imageUrl, name, onOpen }) {
  const buttonDisabled = !imageUrl

  return (
    <button
      aria-label={`Apri foto profilo ${name}`}
      className="chat-avatar-button"
      disabled={buttonDisabled}
      onClick={() => onOpen?.(imageUrl, name)}
      type="button"
    >
      <EntityAvatar imageUrl={imageUrl} name={name} />
    </button>
  )
}

function ChatAttachment({ attachmentPath, compact = false, onLoad, onMediaError, t, url }) {
  if (!attachmentPath || !url) return null

  const attachmentKind = getChatAttachmentKind(attachmentPath)
  const fileName = getChatAttachmentFileName(attachmentPath)
  const className = compact ? 'chat-attachment is-compact' : 'chat-attachment'
  const label = getChatAttachmentLabel(attachmentKind, t)

  return (
    <div className={className}>
      {attachmentKind === 'image' ? (
        <a href={url} rel="noreferrer" target="_blank">
          <img alt={label} onError={onMediaError} onLoad={onLoad} src={url} />
        </a>
      ) : attachmentKind === 'video' ? (
        <video controls onError={onMediaError} onLoadedMetadata={onLoad} playsInline preload="metadata" src={url} />
      ) : attachmentKind === 'audio' ? (
        <div className="chat-audio-attachment">
          <Mic size={16} />
          <audio controls onError={onMediaError} onLoadedMetadata={onLoad} preload="metadata">
            <source src={url} type={getChatAudioMimeType(attachmentPath)} />
          </audio>
          <button
            aria-label={t('chat.downloadMedia')}
            className="chat-audio-download-button"
            onClick={() => triggerChatMediaDownload(url, fileName)}
            type="button"
          >
            <Download size={14} />
          </button>
        </div>
      ) : (
        <a className="chat-file-attachment" href={url} rel="noreferrer" target="_blank">
          <Paperclip size={16} />
          <span>{fileName}</span>
        </a>
      )}
      {!compact && attachmentKind !== 'audio' && (
        <button
          className="chat-download-button"
          onClick={() => triggerChatMediaDownload(url, fileName)}
          type="button"
        >
          <Download size={14} />
          {t('chat.downloadMedia')}
        </button>
      )}
    </div>
  )
}

function ChatAttachmentDraft({ file, onRemove, t }) {
  const previewUrl = useMemo(() => {
    if (!file || typeof URL === 'undefined') return ''
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  if (!file) return null

  const attachmentKind = getChatAttachmentKind(file.name, file.type)
  const label = getChatAttachmentLabel(attachmentKind, t)

  return (
    <div className={`chat-attachment-draft is-${attachmentKind || 'file'}`}>
      <div>
        {attachmentKind === 'image' && previewUrl ? (
          <img alt={label} src={previewUrl} />
        ) : attachmentKind === 'video' && previewUrl ? (
          <video controls playsInline preload="metadata" src={previewUrl} />
        ) : attachmentKind === 'audio' && previewUrl ? (
          <span className="chat-audio-attachment">
            <Mic size={16} />
            <audio controls preload="metadata" src={previewUrl} />
          </span>
        ) : (
          <span className="chat-file-attachment">
            <Paperclip size={16} />
            <span>{file.name}</span>
          </span>
        )}
        <span>
          <strong>{label}</strong>
          <small>{file.name}</small>
        </span>
      </div>
      <button aria-label={t('common.remove')} onClick={onRemove} type="button">
        <X size={15} />
      </button>
    </div>
  )
}

function ChatAttachmentMenu({ disabled = false, onFile, t }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined

    function handleOutsidePointer(event) {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false)
    }

    document.addEventListener('pointerdown', handleOutsidePointer)
    return () => document.removeEventListener('pointerdown', handleOutsidePointer)
  }, [isOpen])

  function handleFileChange(event) {
    onFile?.(event)
    setIsOpen(false)
  }

  return (
    <span className="chat-attachment-menu-wrap" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-label={t('chat.attach')}
        className="icon-button chat-compose-icon-button"
        disabled={disabled}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        title={t('chat.attach')}
        type="button"
      >
        <Plus size={18} />
      </button>
      {isOpen && (
        <span className="chat-attachment-menu">
          <label className="chat-attachment-option">
            <Camera size={16} />
            <span>{t('chat.photo')}</span>
            <input accept="image/*,video/*" capture="environment" disabled={disabled} onChange={handleFileChange} type="file" />
          </label>
          <label className="chat-attachment-option">
            <ImageIcon size={16} />
            <span>{t('chat.photoVideo')}</span>
            <input accept={chatGalleryMediaAccept} disabled={disabled} onChange={handleFileChange} type="file" />
          </label>
          <label className="chat-attachment-option">
            <Paperclip size={16} />
            <span>{t('chat.attach')}</span>
            <input accept={chatMediaAccept} disabled={disabled} onChange={handleFileChange} type="file" />
          </label>
        </span>
      )}
    </span>
  )
}

function ChatQuickCameraButton({ disabled = false, onFile, t }) {
  function handleFileChange(event) {
    onFile?.(event)
    event.target.value = ''
  }

  return (
    <label
      aria-label={t('chat.photo')}
      className={disabled ? 'icon-button chat-compose-icon-button chat-quick-camera is-disabled' : 'icon-button chat-compose-icon-button chat-quick-camera'}
      title={t('chat.photo')}
    >
      <Camera size={18} />
      <input accept="image/*,video/*" capture="environment" disabled={disabled} onChange={handleFileChange} type="file" />
    </label>
  )
}

function ChatAudioRecorder({ disabled = false, onRecord, onRecordingChange, t }) {
  const cancelThreshold = -56
  const [isRecording, setIsRecording] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [recordingStatus, setRecordingStatus] = useState('')
  const cancelOnReleaseRef = useRef(false)
  const chunksRef = useRef([])
  const holdModeRef = useRef(false)
  const holdStartTimerRef = useRef(0)
  const mediaRecorderRef = useRef(null)
  const pendingStopRef = useRef('')
  const pointerStartXRef = useRef(0)
  const suppressNextClickRef = useRef(false)
  const streamRef = useRef(null)
  const timerRef = useRef(0)

  const cleanupRecorder = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = 0
    }

    streamRef.current?.getTracks?.().forEach((track) => track.stop())
    streamRef.current = null
    mediaRecorderRef.current = null
  }, [])

  const resetGestureState = useCallback(() => {
    cancelOnReleaseRef.current = false
    holdModeRef.current = false
    setDragOffset(0)
    setIsCancelling(false)
  }, [])

  useEffect(() => {
    return () => {
      if (holdStartTimerRef.current) window.clearTimeout(holdStartTimerRef.current)
      cleanupRecorder()
    }
  }, [cleanupRecorder])

  useEffect(() => {
    onRecordingChange?.(isRecording)
    return () => {
      if (isRecording) onRecordingChange?.(false)
    }
  }, [isRecording, onRecordingChange])

  async function startRecording() {
    if (disabled || isRecording) return
    pendingStopRef.current = ''
    cancelOnReleaseRef.current = false

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setRecordingStatus(t('chat.unsupportedRecorder'))
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getSupportedAudioMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)

      chunksRef.current = []
      streamRef.current = stream
      mediaRecorderRef.current = recorder
      setElapsedSeconds(0)
      setRecordingStatus('')

      recorder.addEventListener('dataavailable', (event) => {
        if (event.data?.size) chunksRef.current.push(event.data)
      })

      recorder.addEventListener('stop', () => {
        const shouldCancelRecording = cancelOnReleaseRef.current
        const chunks = chunksRef.current
        chunksRef.current = []
        cleanupRecorder()
        setIsRecording(false)
        resetGestureState()

        if (!shouldCancelRecording && chunks.length > 0) {
          onRecord?.(createRecordedAudioFile(chunks, recorder.mimeType || mimeType))
        }
      })

      recorder.start()
      setIsRecording(true)
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((currentSeconds) => currentSeconds + 1)
      }, 1000)

      if (pendingStopRef.current) {
        cancelOnReleaseRef.current = pendingStopRef.current === 'cancel'
        pendingStopRef.current = ''
        recorder.stop()
      }
    } catch {
      cleanupRecorder()
      setIsRecording(false)
      resetGestureState()
      setRecordingStatus(t('chat.recordingFailed'))
    }
  }

  function stopRecording(shouldCancel = false) {
    cancelOnReleaseRef.current = Boolean(shouldCancel)

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      return
    }

    pendingStopRef.current = shouldCancel ? 'cancel' : 'send'
  }

  function handlePointerDown(event) {
    if (disabled || isRecording) return

    event.preventDefault()
    holdModeRef.current = false
    cancelOnReleaseRef.current = false
    pointerStartXRef.current = event.clientX
    setDragOffset(0)
    setIsCancelling(false)
    setRecordingStatus('')
    suppressNextClickRef.current = true
    if (holdStartTimerRef.current) window.clearTimeout(holdStartTimerRef.current)
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    } catch {
      // Some mobile browsers can reject pointer capture during native gesture negotiation.
    }
    holdStartTimerRef.current = window.setTimeout(() => {
      holdStartTimerRef.current = 0
      holdModeRef.current = true
      void startRecording()
    }, 130)
  }

  function handlePointerMove(event) {
    if (!holdModeRef.current && !isRecording) return

    event.preventDefault()
    const nextOffset = Math.max(-104, Math.min(0, event.clientX - pointerStartXRef.current))
    const shouldCancel = nextOffset <= cancelThreshold

    cancelOnReleaseRef.current = shouldCancel
    setDragOffset(nextOffset)
    setIsCancelling(shouldCancel)
  }

  function handlePointerUp(event, forceCancel = false) {
    event.preventDefault()
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    } catch {
      // Pointer capture may already be released after a touch cancellation.
    }

    if (holdStartTimerRef.current) {
      window.clearTimeout(holdStartTimerRef.current)
      holdStartTimerRef.current = 0
      resetGestureState()
      window.setTimeout(() => {
        suppressNextClickRef.current = false
      }, 80)
      return
    }

    if (holdModeRef.current) {
      const shouldCancel = forceCancel || cancelOnReleaseRef.current
      holdModeRef.current = false
      stopRecording(shouldCancel)
      window.setTimeout(() => {
        suppressNextClickRef.current = false
      }, 80)
    }
  }

  function handleClick(event) {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false
      return
    }

    if (isRecording) {
      stopRecording(false)
      return
    }

    event.currentTarget.blur()
    void startRecording()
  }

  const recorderClassName = [
    'chat-audio-recorder',
    isRecording ? 'is-active' : '',
    isCancelling ? 'is-cancelling' : '',
  ].filter(Boolean).join(' ')

  return (
    <span className={recorderClassName} style={{ '--record-drag': `${dragOffset}px` }}>
      {isRecording && (
        <span className="chat-recording-capsule" aria-live="polite">
          <span className="chat-recording-dot" aria-hidden="true" />
          <strong>{formatRecordingTime(elapsedSeconds)}</strong>
          <small>{isCancelling ? t('chat.releaseToCancel') : t('chat.slideToCancel')}</small>
        </span>
      )}
      <button
        aria-label={isRecording ? t('chat.stopRecording') : t('chat.recordAudio')}
        className={isRecording ? 'icon-button chat-compose-icon-button is-recording' : 'icon-button chat-compose-icon-button'}
        disabled={disabled}
        onClick={handleClick}
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
        onPointerCancel={(event) => handlePointerUp(event, true)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        title={isRecording ? t('chat.stopRecording') : t('chat.recordAudio')}
        type="button"
      >
        {isRecording ? <Square size={16} /> : <Mic size={18} />}
      </button>
      {recordingStatus && <small>{recordingStatus}</small>}
    </span>
  )
}

function DriverMediaSettings({ onPreferenceChange, preference, t }) {
  return (
    <article className="driver-media-settings">
      <div>
        <strong>{t('chat.mediaSaveTitle')}</strong>
        <span>{t('chat.autoSaveHint')}</span>
      </div>
      <select value={preference} onChange={(event) => onPreferenceChange?.(event.target.value)}>
        {driverMediaSaveOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    </article>
  )
}

function ChatReactionBar({ message, onOpen }) {
  const { t } = useI18n()
  const reactions = message.reactions ?? {}
  const visibleReactions = Object.entries(reactions).filter(([, reaction]) => reaction)

  return (
    <div className="chat-reaction-row">
      <button
        aria-label={t('chat.actions')}
        className="chat-reaction-open-button"
        onClick={onOpen}
        title={t('chat.actions')}
        type="button"
      >
        <SmilePlus size={15} />
      </button>
      {visibleReactions.length > 0 && (
        <div className="chat-reaction-summary" aria-label={t('reaction.summary')}>
          {visibleReactions.map(([role, reaction]) => (
            <span key={role} title={role === 'company' ? t('reaction.company') : t('reaction.driver')}>
              {getChatReactionEmoji(reaction)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ChatMessageActionMenu({ actorRole, message, onClose, onCopy, onReact, onReply, t }) {
  const currentReaction = message.reactions?.[actorRole] ?? ''

  function handleReactionClick(reaction) {
    onReact?.(message, actorRole, currentReaction === reaction.value ? '' : reaction.value)
    onClose?.()
  }

  return (
    <div
      className="chat-message-action-menu"
      aria-label={t('chat.actions')}
      onPointerDown={(event) => event.stopPropagation()}
      role="menu"
    >
      <div className="chat-reaction-picker" aria-label={t('reaction.choose')}>
        {chatReactionOptions.map((reaction) => (
          <button
            aria-label={t(`reaction.${reaction.value}`)}
            className={currentReaction === reaction.value ? 'chat-reaction-button is-active' : 'chat-reaction-button'}
            key={reaction.value}
            onClick={() => handleReactionClick(reaction)}
            title={t(`reaction.${reaction.value}`)}
            type="button"
          >
            {reaction.emoji}
          </button>
        ))}
      </div>
      <div className="chat-message-action-list">
        <button onClick={() => onReply?.(message)} type="button">
          <Reply size={15} />
          {t('chat.reply')}
        </button>
        <button onClick={() => onCopy?.(message)} type="button">
          <Copy size={15} />
          {t('chat.copy')}
        </button>
      </div>
    </div>
  )
}

function ChatWorkspace({
  assetPreviewUrl = () => '',
  chatLiveState = emptyChatLiveState,
  chatMessages = [],
  chatThreads = [],
  driverRecords = [],
  onMarkRead,
  onReactToMessage,
  onRefreshAssetPreviewUrl,
  onSendMessage,
  onTyping,
}) {
  const { t } = useI18n()
  const availableDrivers = useMemo(
    () => driverRecords.filter((driver) => driver.status !== 'Archiviato'),
    [driverRecords],
  )
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [attachmentFile, setAttachmentFile] = useState(null)
  const [isCompanyRecordingAudio, setIsCompanyRecordingAudio] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isCompanyChatOpen, setIsCompanyChatOpen] = useState(false)
  const [replyToMessage, setReplyToMessage] = useState(null)
  const [copiedMessageId, setCopiedMessageId] = useState('')
  const [highlightedMessageId, setHighlightedMessageId] = useState('')
  const [chatPhotoPreview, setChatPhotoPreview] = useState(null)
  const messagesListRef = useRef(null)
  const composeTextareaRef = useRef(null)
  const seenChatMessageIdsRef = useRef(new Set())
  const activeSoundThreadRef = useRef('')
  const chatSound = useChatSoundPreference()
  const messageActions = useChatMessageActions({ onReply: startReplyToMessage })
  const scrollCompanyChatToBottom = useCallback(() => {
    const listElement = messagesListRef.current
    if (listElement) listElement.scrollTop = listElement.scrollHeight
  }, [])
  const messagesByThread = useMemo(() => {
    const groupedMessages = new Map()

    chatMessages.forEach((message) => {
      const messages = groupedMessages.get(message.threadId) ?? []
      messages.push(message)
      groupedMessages.set(message.threadId, messages)
    })

    return groupedMessages
  }, [chatMessages])
  const activeDrivers = useMemo(
    () =>
      [...availableDrivers].sort((firstDriver, secondDriver) => {
        const firstThread = chatThreads.find(
          (thread) => thread.driverId === firstDriver.id && thread.contextType === 'general',
        )
        const secondThread = chatThreads.find(
          (thread) => thread.driverId === secondDriver.id && thread.contextType === 'general',
        )
        const firstMessages = firstThread ? messagesByThread.get(firstThread.id) ?? [] : []
        const secondMessages = secondThread ? messagesByThread.get(secondThread.id) ?? [] : []
        const firstLastMessage = firstMessages[firstMessages.length - 1]
        const secondLastMessage = secondMessages[secondMessages.length - 1]
        const firstTime = new Date(
          firstLastMessage?.createdAt ?? firstThread?.lastMessageAt ?? firstThread?.updatedAt ?? firstThread?.createdAt ?? 0,
        ).getTime()
        const secondTime = new Date(
          secondLastMessage?.createdAt ?? secondThread?.lastMessageAt ?? secondThread?.updatedAt ?? secondThread?.createdAt ?? 0,
        ).getTime()

        if (firstTime !== secondTime) return secondTime - firstTime
        return firstDriver.name.localeCompare(secondDriver.name)
      }),
    [availableDrivers, chatThreads, messagesByThread],
  )
  const selectedDriver =
    activeDrivers.find((driver) => driver.id === selectedDriverId) ??
    activeDrivers[0] ??
    null
  const selectedThread = selectedDriver
    ? chatThreads.find((thread) => thread.driverId === selectedDriver.id && thread.contextType === 'general')
    : null
  const visibleMessages = useMemo(
    () =>
      selectedThread
        ? [...(messagesByThread.get(selectedThread.id) ?? [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        : [],
    [messagesByThread, selectedThread],
  )
  const lastVisibleMessageId = visibleMessages[visibleMessages.length - 1]?.id ?? ''
  const selectedDriverIsOnline = isChatActorOnline(chatLiveState, 'driver', selectedDriver?.id)
  const selectedDriverIsTyping = Boolean(
    selectedThread?.id && getTypingActors(chatLiveState, selectedThread.id, 'driver').length > 0,
  )
  const selectedDriverPresenceLabel = selectedDriver
    ? getChatPresenceLabel({
        isOnline: selectedDriverIsOnline,
        isTyping: selectedDriverIsTyping,
        lastSeenAt: getChatActorLastSeenAt(chatLiveState, 'driver', selectedDriver.id),
        typingLabel: `${selectedDriver.name} sta scrivendo...`,
      })
    : t('chat.createdOnFirstMessage')
  const hasUnreadDriverMessages = visibleMessages.some(
    (message) => message.senderRole === 'driver' && !message.readByCompanyAt,
  )
  const signalCompanyTyping = useChatTypingSignal({
    actorRole: 'company',
    onTyping,
    threadId: selectedThread?.id,
  })
  const hasCompanyComposerPayload = Boolean(messageBody.trim() || attachmentFile)

  useLayoutEffect(() => {
    if (!selectedThread?.id) return
    return startChatBottomScroll(scrollCompanyChatToBottom, messagesListRef.current)
  }, [isCompanyChatOpen, lastVisibleMessageId, scrollCompanyChatToBottom, selectedThread?.id, visibleMessages.length])

  useEffect(() => {
    updateActiveChatForPush(isCompanyChatOpen ? selectedThread?.id ?? '' : '')
    return () => updateActiveChatForPush('')
  }, [isCompanyChatOpen, selectedThread?.id])

  useEffect(() => {
    if (selectedDriverIsTyping) scrollCompanyChatToBottom()
  }, [scrollCompanyChatToBottom, selectedDriverIsTyping])

  useEffect(() => {
    if (selectedThread?.id && hasUnreadDriverMessages) {
      onMarkRead?.(selectedThread.id, 'company')
    }
  }, [hasUnreadDriverMessages, onMarkRead, selectedThread?.id])

  function getDriverThread(driverId) {
    return chatThreads.find((thread) => thread.driverId === driverId && thread.contextType === 'general')
  }

  function getLastDriverMessage(driverId) {
    const thread = getDriverThread(driverId)
    if (!thread) return null

    const messages = messagesByThread.get(thread.id) ?? []
    return messages[messages.length - 1] ?? null
  }

  function handleAttachmentChange(event) {
    const file = event.target.files?.[0] ?? null
    setAttachmentFile(file)
    event.target.value = ''
  }

  function selectDriverChat(driverId) {
    setSelectedDriverId(driverId)
    setIsCompanyChatOpen(true)
    setReplyToMessage(null)
    messageActions.closeMessageActions()
  }

  function getCompanyMessageSenderLabel(message) {
    return message.senderRole === 'company' ? t('chat.company') : selectedDriver?.name ?? t('chat.driver')
  }

  function startReplyToMessage(message) {
    setReplyToMessage(createChatReplyReference(message, getCompanyMessageSenderLabel(message)))
    messageActions.closeMessageActions()
    window.setTimeout(() => composeTextareaRef.current?.focus(), 80)
  }

  async function handleCopyMessage(message) {
    const copied = await copyChatText(message)
    messageActions.closeMessageActions()

    if (!copied) return

    setCopiedMessageId(message.id)
    window.setTimeout(() => setCopiedMessageId(''), 1400)
  }

  function openReplyTarget(messageId) {
    if (!messageId || !messagesListRef.current) return

    const targetElement = messagesListRef.current.querySelector(`[data-chat-message-id="${messageId}"]`)
    if (!targetElement) return

    targetElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
    setHighlightedMessageId(messageId)
    window.setTimeout(() => setHighlightedMessageId(''), 1400)
  }

  function openChatAvatarPreview(imageUrl, name) {
    if (imageUrl) setChatPhotoPreview({ imageUrl, name })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selectedDriver || isSending || (!messageBody.trim() && !attachmentFile)) return

    const sentBody = messageBody
    const sentAttachmentFile = attachmentFile
    const sentReplyToMessage = replyToMessage

    setMessageBody('')
    setAttachmentFile(null)
    setReplyToMessage(null)
    signalCompanyTyping('')
    setIsSending(true)
    const sent = await onSendMessage?.({
      attachmentFile: sentAttachmentFile,
      body: sentBody,
      driverId: selectedDriver.id,
      senderRole: 'company',
      threadId: selectedThread?.id,
      replyToMessage: sentReplyToMessage,
    })
    setIsSending(false)

    if (sent) {
      chatSound.playSound('outgoing')
    } else {
      setMessageBody(sentBody)
      setAttachmentFile(sentAttachmentFile)
      setReplyToMessage(sentReplyToMessage)
    }
  }

  function handleComposeKeyDown(event) {
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.nativeEvent.isComposing
    ) {
      return
    }

    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }

  useEffect(() => {
    if (!selectedThread?.id) return

    const seenMessages = seenChatMessageIdsRef.current

    if (activeSoundThreadRef.current !== selectedThread.id) {
      activeSoundThreadRef.current = selectedThread.id
      visibleMessages.forEach((message) => seenMessages.add(message.id))
      return
    }

    const newMessages = visibleMessages.filter((message) => !seenMessages.has(message.id))

    if (isCompanyChatOpen && newMessages.some((message) => message.senderRole === 'driver')) {
      chatSound.playSound('incoming')
    }

    newMessages.forEach((message) => seenMessages.add(message.id))
  }, [chatSound, isCompanyChatOpen, lastVisibleMessageId, selectedThread?.id, visibleMessages])

  return (
    <section
      className={isCompanyChatOpen ? 'chat-workspace is-thread-open' : 'chat-workspace'}
      aria-label={t('chat.companyAria')}
    >
      <div className="panel chat-list-panel">
        <div className="panel-header">
          <div>
            <p className="overline">{t('chat.messages')}</p>
            <h2>{t('chat.companyTitle')}</h2>
          </div>
          <Mail size={22} />
        </div>
        <div className="chat-driver-list">
          {activeDrivers.map((driver) => {
            const lastMessage = getLastDriverMessage(driver.id)
            const isSelected = selectedDriver?.id === driver.id
            const driverThread = getDriverThread(driver.id)
            const driverIsOnline = isChatActorOnline(chatLiveState, 'driver', driver.id)
            const driverIsTyping = Boolean(
              driverThread?.id && getTypingActors(chatLiveState, driverThread.id, 'driver').length > 0,
            )
            const unreadMessageCount = driverThread
              ? (messagesByThread.get(driverThread.id) ?? []).filter(
                  (message) => message.senderRole === 'driver' && !message.readByCompanyAt,
                ).length
              : 0

            return (
              <button
                className={isSelected ? 'chat-driver-row is-selected' : 'chat-driver-row'}
                key={driver.id}
                onClick={() => selectDriverChat(driver.id)}
                type="button"
              >
                <EntityAvatar imageUrl={assetPreviewUrl(driver.profileImagePath)} name={driver.name} />
                <span>
                  <strong>{driver.name}</strong>
                  <small>
                    {driverIsTyping
                      ? t('chat.typing')
                      : lastMessage
                      ? `${lastMessage.senderRole === 'driver' ? t('chat.driver') : t('chat.company')}: ${
                          getChatMessageText(lastMessage, t('chat.photoAttached'))
                        }`
                      : t('chat.noMessages')}
                  </small>
                </span>
                <span className="chat-row-meta">
                  {driverIsOnline && <span className="chat-online-badge">{t('chat.online')}</span>}
                  {unreadMessageCount > 0 && <strong className="chat-unread-badge">{unreadMessageCount}</strong>}
                  {lastMessage && <em>{formatShortDateTime(lastMessage.createdAt)}</em>}
                </span>
              </button>
            )
          })}
          {activeDrivers.length === 0 && (
            <div className="empty-state-row">
              <Users size={20} />
              <div>
                <strong>{t('chat.noDrivers')}</strong>
                <span>{t('chat.noDriversHint')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="panel chat-thread-panel">
        <div className="panel-header">
          <button
            aria-label={t('common.back')}
            className="icon-button company-chat-back-button"
            onClick={() => setIsCompanyChatOpen(false)}
            type="button"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="overline">{t('chat.conversation')}</p>
            <h2>{selectedDriver?.name ?? t('chat.selectDriver')}</h2>
            <span className={selectedDriverIsTyping ? 'chat-presence-text is-typing' : 'chat-presence-text'}>
              {selectedDriverPresenceLabel}
            </span>
          </div>
          <div className="chat-thread-header-actions">
            <ChatSoundButton enabled={chatSound.isEnabled} onToggle={chatSound.toggleSound} t={t} />
            {selectedDriver && (
              <ChatAvatarButton
                imageUrl={assetPreviewUrl(selectedDriver.profileImagePath)}
                name={selectedDriver.name}
                onOpen={openChatAvatarPreview}
              />
            )}
          </div>
        </div>
        {chatPhotoPreview && (
          <PhotoPreviewModal
            imageUrl={chatPhotoPreview.imageUrl}
            name={chatPhotoPreview.name}
            onClose={() => setChatPhotoPreview(null)}
          />
        )}
        <div className="chat-message-list" ref={messagesListRef}>
          {selectedDriver && visibleMessages.length === 0 && (
            <div className="chat-empty-state">
              <Mail size={24} />
              <strong>{t('chat.noMessagesYet')}</strong>
              <span>{t('chat.firstMessageHint')}</span>
            </div>
          )}
          {!selectedDriver && (
            <div className="chat-empty-state">
              <Users size={24} />
              <strong>{t('chat.selectDriver')}</strong>
              <span>{t('chat.createdOnFirstMessage')}</span>
            </div>
          )}
          {visibleMessages.map((message) => {
            const attachmentUrl = assetPreviewUrl(message.attachmentPath) || message.attachmentPath
            const isActionMenuOpen = messageActions.openActionMessageId === message.id
            const messageDisplay = getChatMessageDisplay(message)
            const swipeOffset = messageActions.swipeState.messageId === message.id ? messageActions.swipeState.offset : 0
            const messageClassName = [
              message.senderRole === 'company' ? 'chat-message is-company' : 'chat-message is-driver',
              hasChatReactions(message) ? 'has-reaction' : '',
              isActionMenuOpen ? 'has-action-menu' : '',
              swipeOffset ? 'is-swiping' : '',
              highlightedMessageId === message.id ? 'is-reply-highlighted' : '',
            ].filter(Boolean).join(' ')

            return (
              <article
                className={messageClassName}
                data-chat-message-id={message.id}
                key={message.id}
                style={swipeOffset ? { '--swipe-offset': `${swipeOffset}px` } : undefined}
                {...messageActions.getMessageActionProps(message)}
              >
                <div className="chat-message-meta">
                  <span>{getCompanyMessageSenderLabel(message)}</span>
                  <small>{formatShortDateTime(message.createdAt)}</small>
                </div>
                <ChatQuotedMessage onOpen={openReplyTarget} reply={messageDisplay.reply} t={t} />
                {messageDisplay.text && <p>{messageDisplay.text}</p>}
                <ChatAttachment
                  attachmentPath={message.attachmentPath}
                  onMediaError={() => onRefreshAssetPreviewUrl?.(message.attachmentPath)}
                  onLoad={scrollCompanyChatToBottom}
                  t={t}
                  url={attachmentUrl}
                />
                {message.attachmentPath && !attachmentUrl && <small>{t('chat.photoLoading')}</small>}
                {message.senderRole === 'company' && (
                  <MessageStatus status={getMessageStatus(message, 'company')} />
                )}
                <ChatReactionBar
                  message={message}
                  onOpen={() => messageActions.openMessageActions(message.id)}
                />
                {isActionMenuOpen && (
                  <ChatMessageActionMenu
                    actorRole="company"
                    message={message}
                    onClose={messageActions.closeMessageActions}
                    onCopy={handleCopyMessage}
                    onReact={onReactToMessage}
                    onReply={startReplyToMessage}
                    t={t}
                  />
                )}
                {copiedMessageId === message.id && <span className="chat-copy-toast">{t('chat.copied')}</span>}
              </article>
            )
          })}
          {selectedDriverIsTyping && (
            <div className="chat-typing-indicator">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <strong>{selectedDriver?.name ?? t('chat.driver')} sta scrivendo...</strong>
            </div>
          )}
          <span className="chat-scroll-anchor" />
        </div>
        <form className="chat-compose" onSubmit={handleSubmit}>
          <ChatReplyPreview onCancel={() => setReplyToMessage(null)} reply={replyToMessage} t={t} />
          <ChatAttachmentDraft file={attachmentFile} onRemove={() => setAttachmentFile(null)} t={t} />
          <div className={isCompanyRecordingAudio ? 'chat-compose-bar is-recording-audio' : 'chat-compose-bar'}>
            {!isCompanyRecordingAudio && (
              <ChatAttachmentMenu disabled={!selectedDriver} onFile={handleAttachmentChange} t={t} />
            )}
            {!isCompanyRecordingAudio && (
              <textarea
                ref={composeTextareaRef}
                className="chat-compose-input"
                disabled={!selectedDriver}
                onKeyDown={handleComposeKeyDown}
                onChange={(event) => {
                  setMessageBody(event.target.value)
                  signalCompanyTyping(event.target.value)
                }}
                placeholder={selectedDriver ? t('chat.writePlaceholder') : t('chat.selectDriver')}
                rows={1}
                value={messageBody}
              />
            )}
            <span className="chat-compose-tail">
              {!hasCompanyComposerPayload && !isCompanyRecordingAudio && (
                <ChatQuickCameraButton disabled={!selectedDriver || isSending} onFile={handleAttachmentChange} t={t} />
              )}
              {hasCompanyComposerPayload ? (
                <button
                  aria-label={isSending ? t('chat.sending') : t('chat.send')}
                  className="chat-send-button"
                  disabled={!selectedDriver || isSending}
                  type="submit"
                >
                  <Send size={18} />
                  <span className="sr-only">{isSending ? t('chat.sending') : t('chat.send')}</span>
                </button>
              ) : (
                <ChatAudioRecorder
                  disabled={!selectedDriver || isSending}
                  onRecord={setAttachmentFile}
                  onRecordingChange={setIsCompanyRecordingAudio}
                  t={t}
                />
              )}
            </span>
          </div>
        </form>
      </div>
    </section>
  )
}

function FaultOperationRow({ driver, onOpen, onUpdateStatus, report, selected, trailer, vehicle }) {
  const { t } = useI18n()
  const isClosed = isFaultArchived(report)
  const rowClassName = ['operation-row', selected ? 'is-selected' : '', isClosed ? 'is-muted' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <article className={rowClassName}>
      <div className="operation-icon tone-danger">
        <Wrench size={20} />
      </div>
      <div className="operation-main">
        <div className="operation-title">
          <strong>{report.title}</strong>
          <span className="status-pill tone-warning">{getFaultStatusLabel(report.status, t)}</span>
        </div>
        <p>{driver?.name ?? t('common.driver')} · {vehicle?.plate ?? t('common.vehicleMissing')}</p>
        <small>
          {getFaultSeverityLabel(report.severity, t)} · {formatShortDateTime(report.createdAt)}
          {trailer ? ` · ${t('common.trailer')} ${trailer.plate}` : ''}
          {report.photoPath ? ` · ${t('chat.photoAttached').toLowerCase()}` : ''}
        </small>
        {report.description && <em>{report.description}</em>}
      </div>
      <div className="operation-actions">
        <button className="small-button" onClick={onOpen} type="button">
          {t('operations.open')}
        </button>
        {isClosed ? (
          <button className="small-button" onClick={() => onUpdateStatus(report.id, 'open')} type="button">
            {t('operations.markUnread')}
          </button>
        ) : (
          <button className="small-button danger-action" onClick={() => onUpdateStatus(report.id, 'closed')} type="button">
            {t('operations.archive')}
          </button>
        )}
      </div>
    </article>
  )
}

function CheckOperationRow({ check, driver, onMarkRead, onMarkUnread, onOpen, read, selected, trailer, vehicle }) {
  const { t } = useI18n()
  const issueText = getCheckIssues(check, t)
  const isCritical = issueText.length > 0
  const rowClassName = ['operation-row', selected ? 'is-selected' : '', read ? 'is-muted' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <article className={rowClassName}>
      <div className={isCritical ? 'operation-icon tone-danger' : 'operation-icon tone-success'}>
        <ClipboardCheck size={20} />
      </div>
      <div className="operation-main">
        <div className="operation-title">
          <strong>{t('driverApp.morningCheck')}</strong>
          <span className={isCritical ? 'status-pill tone-danger' : 'status-pill tone-success'}>
            {read ? t('common.archived') : isCritical ? t('operations.critical') : t('operations.inbox')}
          </span>
        </div>
        <p>{driver?.name ?? t('common.driver')} · {vehicle?.plate ?? t('common.vehicleMissing')}</p>
        <small>
          {formatShortDateTime(check.createdAt)}
          {check.odometerKm ? ` · ${check.odometerKm.toLocaleString('it-IT')} km` : ''}
          {trailer ? ` · ${t('common.trailer')} ${trailer.plate}` : ''}
        </small>
        {(issueText.length > 0 || check.notes) && <em>{[...issueText, check.notes].filter(Boolean).join(' · ')}</em>}
      </div>
      <div className="operation-actions">
        <button className="small-button" onClick={onOpen} type="button">
          {t('operations.open')}
        </button>
        {read ? (
          <button className="small-button" onClick={onMarkUnread} type="button">
            {t('operations.markUnread')}
          </button>
        ) : (
          <button aria-label={t('operations.archive')} className="small-button danger-action" onClick={onMarkRead} type="button">
            {t('operations.archive')}
          </button>
        )}
      </div>
    </article>
  )
}

function OperationDetailPanel({
  acknowledgedCheckIds,
  assetPreviewUrl = () => '',
  driverRecords,
  operation,
  onAcknowledgeCheck,
  onMarkCheckUnread,
  onUpdateFaultStatus,
  vehicleRecords,
}) {
  return (
    <OperationDetailShell
      acknowledgedCheckIds={acknowledgedCheckIds}
      assetPreviewUrl={assetPreviewUrl}
      driverRecords={driverRecords}
      operation={operation}
      onAcknowledgeCheck={onAcknowledgeCheck}
      onMarkCheckUnread={onMarkCheckUnread}
      onUpdateFaultStatus={onUpdateFaultStatus}
      vehicleRecords={vehicleRecords}
    />
  )
}

function OperationDetailModal({
  acknowledgedCheckIds,
  assetPreviewUrl = () => '',
  driverRecords,
  operation,
  onAcknowledgeCheck,
  onClose,
  onMarkCheckUnread,
  onUpdateFaultStatus,
  vehicleRecords,
}) {
  if (!operation) return null

  return (
    <div className="operation-modal-backdrop" onClick={onClose} role="presentation">
      <OperationDetailShell
        acknowledgedCheckIds={acknowledgedCheckIds}
        assetPreviewUrl={assetPreviewUrl}
        driverRecords={driverRecords}
        operation={operation}
        onAcknowledgeCheck={onAcknowledgeCheck}
        onClose={onClose}
        onMarkCheckUnread={onMarkCheckUnread}
        onUpdateFaultStatus={onUpdateFaultStatus}
        surface="modal"
        vehicleRecords={vehicleRecords}
      />
    </div>
  )
}

function OperationDetailShell({
  acknowledgedCheckIds,
  assetPreviewUrl = () => '',
  driverRecords,
  operation,
  onAcknowledgeCheck,
  onClose,
  onMarkCheckUnread,
  onUpdateFaultStatus,
  surface = 'side',
  vehicleRecords,
}) {
  const { t } = useI18n()
  const Shell = surface === 'modal' ? 'section' : 'aside'
  const shellClassName = surface === 'modal' ? 'panel operation-detail-panel operation-modal' : 'panel operation-detail-panel'
  const shellProps =
    surface === 'modal'
      ? {
          'aria-label': t('operations.detail'),
          'aria-modal': 'true',
          onClick: (event) => event.stopPropagation(),
          role: 'dialog',
        }
      : {}

  if (!operation) {
    return (
      <Shell className={shellClassName} {...shellProps}>
        <div className="panel-header compact">
          <div>
            <p className="overline">{t('operations.detail')}</p>
            <h2>{t('operations.detailEmptyTitle')}</h2>
          </div>
          <Bell size={20} />
        </div>
        <p className="operation-detail-empty">{t('operations.detailEmptyText')}</p>
      </Shell>
    )
  }

  if (operation.kind === 'fault') {
    const report = operation.data
    const driver = driverRecords.find((entry) => entry.id === report.driverId)
    const vehicle = vehicleRecords.find((entry) => entry.id === report.vehicleId)
    const trailer = vehicleRecords.find((entry) => entry.id === report.semitrailerId)
    const isClosed = isFaultArchived(report)
    const faultPhotoUrl = assetPreviewUrl(report.photoPath)

    return (
      <Shell className={shellClassName} {...shellProps}>
        <div className="panel-header compact">
          <div>
            <p className="overline">{t('operations.fault')}</p>
            <h2>{report.title}</h2>
          </div>
          <div className="operation-detail-header-actions">
            <Wrench size={20} />
            {surface === 'modal' && (
              <button aria-label={t('common.close')} className="icon-button operation-modal-close" onClick={onClose} type="button">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <div className="operation-detail-body">
          <DetailLine label={t('common.status')} value={getFaultStatusLabel(report.status, t)} />
          <DetailLine label={t('fault.severity')} value={getFaultSeverityLabel(report.severity, t)} />
          <DetailLine label={t('common.driver')} value={driver?.name ?? t('common.driverMissing')} />
          <DetailLine label={t('common.vehicle')} value={vehicle ? `${vehicle.plate} · ${vehicle.model}` : t('common.vehicleMissing')} />
          {trailer && <DetailLine label={t('common.trailer')} value={`${trailer.plate} · ${trailer.model}`} />}
          <DetailLine label={t('operations.created')} value={formatShortDateTime(report.createdAt)} />
          <DetailLine label={t('operations.updated')} value={formatShortDateTime(report.updatedAt)} />
          {report.description && (
            <div className="detail-note">
              <strong>{t('fault.description')}</strong>
              <p>{report.description}</p>
            </div>
          )}
          {faultPhotoUrl && (
            <div className="fault-photo-preview">
              <strong>{t('fault.photo')}</strong>
              <a href={faultPhotoUrl} rel="noreferrer" target="_blank">
                <img alt={`Foto guasto ${report.title}`} src={faultPhotoUrl} />
              </a>
            </div>
          )}
        </div>
        <div className="operation-detail-actions">
          {isClosed ? (
            <button className="small-button" onClick={() => onUpdateFaultStatus(report.id, 'open')} type="button">
              {t('operations.markUnread')}
            </button>
          ) : (
            <button className="small-button danger-action" onClick={() => onUpdateFaultStatus(report.id, 'closed')} type="button">
              {t('operations.archive')}
            </button>
          )}
        </div>
      </Shell>
    )
  }

  const check = operation.data
  const driver = driverRecords.find((entry) => entry.id === check.driverId)
  const vehicle = vehicleRecords.find((entry) => entry.id === check.tractorId)
  const trailer = vehicleRecords.find((entry) => entry.id === check.semitrailerId)
  const issueText = getCheckIssues(check, t)
  const isRead = acknowledgedCheckIds.includes(check.id)

  return (
    <Shell className={shellClassName} {...shellProps}>
      <div className="panel-header compact">
        <div>
          <p className="overline">{t('operations.check')}</p>
          <h2>{t('driverApp.morningCheck')}</h2>
        </div>
        <div className="operation-detail-header-actions">
          <ClipboardCheck size={20} />
          {surface === 'modal' && (
            <button aria-label={t('common.close')} className="icon-button operation-modal-close" onClick={onClose} type="button">
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      <div className="operation-detail-body">
        <DetailLine label={t('common.status')} value={isRead ? t('common.archived') : issueText.length > 0 ? t('operations.checkCriticalOpen') : t('operations.inbox')} />
        <DetailLine label={t('common.driver')} value={driver?.name ?? t('common.driverMissing')} />
        <DetailLine label={t('common.vehicle')} value={vehicle ? `${vehicle.plate} · ${vehicle.model}` : t('common.vehicleMissing')} />
        {trailer && <DetailLine label={t('common.trailer')} value={`${trailer.plate} · ${trailer.model}`} />}
        <DetailLine label={t('common.time')} value={formatShortDateTime(check.createdAt)} />
        {check.odometerKm && <DetailLine label="Km" value={`${check.odometerKm.toLocaleString('it-IT')} km`} />}
        <DetailLine label={t('operations.lights')} value={check.lightsOk ? 'Ok' : t('vehicleStatus.watch')} />
        <DetailLine label={t('operations.tires')} value={check.tiresOk ? 'Ok' : t('vehicleStatus.watch')} />
        <DetailLine label={t('operations.documentsOnBoard')} value={check.documentsOnBoard ? t('operations.present') : t('operations.missing')} />
        {issueText.length > 0 && (
          <div className="detail-note is-critical">
            <strong>{t('operations.checkIssues')}</strong>
            <p>{issueText.join(' · ')}</p>
          </div>
        )}
        {check.notes && (
          <div className="detail-note">
            <strong>{t('common.notes')}</strong>
            <p>{check.notes}</p>
          </div>
        )}
      </div>
      <div className="operation-detail-actions">
        {isRead ? (
          <button className="small-button" onClick={() => onMarkCheckUnread?.(check.id)} type="button">
            {t('operations.markUnread')}
          </button>
        ) : (
          <button className="small-button danger-action" onClick={() => onAcknowledgeCheck?.(check.id)} type="button">
            {t('operations.archive')}
          </button>
        )}
      </div>
    </Shell>
  )
}

function DetailLine({ label, value }) {
  return (
    <div className="detail-line">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  )
}

function FormValidationAlert({ message }) {
  if (!message) return null

  return (
    <div className="form-alert" role="alert">
      <AlertTriangle size={17} />
      <span>{message}</span>
    </div>
  )
}

function ComplianceBoard({ activeFilter, filteredItems, onClose, onFilter, onOpenDetail, onReminder, onRenew }) {
  const { t } = useI18n()

  return (
    <section className="panel compliance-panel" id="compliance-board-panel">
      <div className="panel-header">
        <div>
          <p className="overline">{t('deadline.agenda')}</p>
          <h2>{t('deadline.boardTitle')}</h2>
        </div>
        <button className="icon-button" type="button" aria-label={t('deadline.advancedFilters')}>
          <Filter size={18} />
        </button>
      </div>

      <div className="filter-tabs" role="tablist" aria-label={t('deadline.filterAria')}>
        {filters.map((filter) => (
          <button
            className={activeFilter === filter.id ? 'filter-tab is-active' : 'filter-tab'}
            key={filter.id}
            onClick={() => onFilter(filter.id)}
            type="button"
          >
            {getFilterLabel(filter, t)}
          </button>
        ))}
      </div>

      <div className="deadline-list">
        {filteredItems.map((item) => (
          <DeadlineRow
            item={item}
            key={item.id}
            onClose={() => onClose(item.id)}
            onOpen={() => onOpenDetail?.(item)}
            onReminder={() => onReminder(item.id)}
            onRenew={() => onRenew(item.id)}
          />
        ))}
        {filteredItems.length === 0 && (
          <div className="empty-state-row">
            <CalendarClock size={20} />
            <div>
              <strong>{t('deadline.emptyTitle')}</strong>
              <span>{t('deadline.emptyText')}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function DeadlineRow({ item, onClose, onOpen, onReminder, onRenew }) {
  const { t } = useI18n()
  const isDone = item.status === 'done'
  const isRenewing = item.status === 'renewing'

  return (
    <article className={isDone ? 'deadline-row is-done' : 'deadline-row'}>
      <div className={`deadline-icon tone-${item.urgency.tone}`}>
        {item.type.toLowerCase().includes('medica') ? <Stethoscope size={20} /> : <ClipboardCheck size={20} />}
      </div>
      <div className="deadline-main">
        <div className="deadline-title">
          <strong>{item.type}</strong>
          <span className={`status-pill tone-${item.urgency.tone}`}>{getUrgencyLabel(item.urgency, t)}</span>
        </div>
        <p>{item.assignee}</p>
        <small>{item.detail}</small>
      </div>
      <div className="deadline-meta">
        <strong>{formatDate(item.dueDate)}</strong>
        <span>
          {item.urgency.days < 0
            ? t('deadline.daysAgo', { count: Math.abs(item.urgency.days) })
            : t('deadline.days', { count: item.urgency.days })}
        </span>
      </div>
      <div className="deadline-actions">
        <button className="small-button" onClick={onOpen} type="button">
          <ExternalLink size={15} />
          Apri
        </button>
        <button className="small-button" onClick={onReminder} type="button">
          <Send size={15} />
          {t('deadline.inApp')}
        </button>
        <button className="small-button" onClick={isRenewing ? onClose : onRenew} type="button">
          {isRenewing ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
          {isRenewing ? t('deadline.close') : t('deadline.renew')}
        </button>
      </div>
    </article>
  )
}

function DeadlineDetailModal({ item, onClose, onMarkDone, onRenew }) {
  const { t } = useI18n()

  if (!item) return null

  const isDone = item.status === 'done'
  const subjectType = item.subjectKind ?? (item.scope === 'driver' ? 'Persona' : item.scope === 'vehicle' ? 'Mezzo' : 'Azienda')
  const daysLabel =
    item.urgency.days < 0
      ? t('deadline.daysAgo', { count: Math.abs(item.urgency.days) })
      : item.urgency.days === 0
        ? 'Oggi'
        : t('deadline.days', { count: item.urgency.days })

  return (
    <div className="operation-modal-backdrop" onClick={onClose} role="presentation">
      <section
        aria-label="Dettaglio scadenza"
        aria-modal="true"
        className="panel operation-detail-panel operation-modal deadline-detail-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="panel-header compact">
          <div>
            <p className="overline">Scadenza</p>
            <h2>{item.type}</h2>
          </div>
          <button aria-label={t('common.close')} className="icon-button operation-modal-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="operation-detail-body">
          <DetailLine label="Ambito" value={subjectType} />
          <DetailLine label={t('deadline.subject')} value={item.assignee} />
          <DetailLine label="Dettaglio" value={item.detail} />
          <DetailLine label={t('deadline.dueDate')} value={formatDate(item.dueDate)} />
          <DetailLine label={t('common.status')} value={`${getUrgencyLabel(item.urgency, t)} · ${daysLabel}`} />
          <DetailLine label="Numero documento" value={item.documentNumber} />
          <DetailLine label={t('deadline.owner')} value={item.owner} />
          <DetailLine label="File" value={item.filePath ? 'Allegato presente' : 'Nessun allegato'} />
        </div>

        <div className="operation-detail-actions">
          {isDone ? (
            <button className="small-button" onClick={() => onRenew?.(item.id)} type="button">
              <Clock3 size={15} />
              {t('deadline.renew')}
            </button>
          ) : (
            <>
              <button className="small-button" onClick={() => onRenew?.(item.id)} type="button">
                <Clock3 size={15} />
                {t('deadline.renew')}
              </button>
              <button className="small-button danger-action" onClick={() => onMarkDone?.(item.id)} type="button">
                <CheckCircle2 size={15} />
                {t('deadline.close')}
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function FleetAndForms({ driverRecords, onAdd, onBackHome, vehicleRecords }) {
  const { t } = useI18n()

  return (
    <section className="lower-grid" aria-label={t('fleet.managementAria')}>
      <FleetStatus driverRecords={driverRecords} vehicleRecords={vehicleRecords} />
      <AddDeadlineForm driverRecords={driverRecords} onAdd={onAdd} onBackHome={onBackHome} vehicleRecords={vehicleRecords} />
    </section>
  )
}

function FleetStatus({ driverRecords, vehicleRecords }) {
  const { t } = useI18n()
  const activeVehicleRecords = vehicleRecords.filter((vehicle) => vehicle.status !== 'Archiviato')
  const fleetGroups = [
    { label: t('fleetType.furgonePlural'), value: activeVehicleRecords.filter((vehicle) => vehicle.fleetType === 'furgone').length },
    { label: t('fleetType.motricePlural'), value: activeVehicleRecords.filter((vehicle) => vehicle.fleetType === 'motrice').length },
    { label: t('fleetType.trattorePlural'), value: activeVehicleRecords.filter((vehicle) => vehicle.fleetType === 'trattore').length },
    { label: t('fleetType.semirimorchioPlural'), value: activeVehicleRecords.filter((vehicle) => vehicle.fleetType === 'semirimorchio').length },
  ]

  return (
    <article className="panel fleet-panel">
      <div className="panel-header compact">
        <div>
          <p className="overline">{t('fleet.title')}</p>
          <h2>{t('fleet.assignedVehicles')}</h2>
        </div>
        <Gauge size={20} />
      </div>
      <div className="fleet-type-grid">
        {fleetGroups.map((group) => (
          <div key={group.label}>
            <strong>{group.value}</strong>
            <span>{group.label}</span>
          </div>
        ))}
      </div>
      <div className="vehicle-list">
        {activeVehicleRecords.map((vehicle) => {
          const assignedDriver = driverRecords.find((driver) => driver.vehicleId === vehicle.id)
          return (
            <div className="vehicle-row" key={vehicle.id}>
              <div>
                <strong>{vehicle.plate}</strong>
                <span>
                  {vehicle.model} · {vehicle.type}
                </span>
              </div>
              <div>
                <small>{assignedDriver?.name ?? t('drivers.assignedNone')}</small>
                <small>{vehicle.km.toLocaleString('it-IT')} km</small>
              </div>
            </div>
          )
        })}
        {activeVehicleRecords.length === 0 && (
          <div className="empty-state-row">
            <Truck size={20} />
            <div>
              <strong>{t('fleet.noFleetTitle')}</strong>
              <span>{t('fleet.empty')}</span>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

function AddDeadlineForm({ driverRecords, onAdd, onBackHome, vehicleRecords }) {
  const { t } = useI18n()
  const [showValidation, setShowValidation] = useState(false)
  const [form, setForm] = useState({
    type: 'Visita medica',
    scope: 'driver',
    assigneeId: driverRecords[0]?.id ?? '',
    dueDate: '2026-07-18',
    owner: 'Ufficio personale',
  })

  const assignees = form.scope === 'driver' ? driverRecords : vehicleRecords
  const hasAssigneeChoices = assignees.length > 0
  const missingRequiredFields = [
    hasAssigneeChoices ? null : form.scope === 'driver' ? t('deadline.atLeastOneDriver') : t('deadline.atLeastOneVehicle'),
    form.assigneeId ? null : form.scope === 'driver' ? t('common.driver') : t('common.vehicle'),
    form.dueDate ? null : t('deadline.dueDate'),
  ].filter(Boolean)
  const canSubmit = missingRequiredFields.length === 0

  function updateField(field, value) {
    setForm((currentForm) => {
      if (field === 'scope') {
        const nextAssignee = value === 'driver' ? driverRecords[0]?.id ?? '' : vehicleRecords[0]?.id ?? ''
        return { ...currentForm, scope: value, assigneeId: nextAssignee }
      }

      return { ...currentForm, [field]: value }
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    setShowValidation(true)
    if (!canSubmit) return

    onAdd({
      id: `cmp-${Date.now()}`,
      type: form.type,
      scope: form.scope,
      driverId: form.scope === 'driver' ? form.assigneeId : null,
      vehicleId: form.scope === 'vehicle' ? form.assigneeId : null,
      dueDate: form.dueDate,
      reminderDays: [60, 30, 15, 7],
      owner: form.owner,
      status: 'open',
      documentNumber: `NEW-${Date.now().toString().slice(-5)}`,
      lastReminderAt: null,
    })
    setShowValidation(false)
  }

  return (
    <form className="panel add-panel" id="new-deadline-panel" noValidate onSubmit={handleSubmit}>
      <div className="panel-header compact">
        <div>
          <p className="overline">{t('deadline.quickInsert')}</p>
          <h2>{t('deadline.add')}</h2>
        </div>
        <div className="panel-header-actions">
          <button className="small-button" onClick={onBackHome} type="button">
            <ArrowLeft size={15} />
            {t('common.back')}
          </button>
          <Plus size={20} />
        </div>
      </div>
      <div className="form-grid">
        <label>
          {t('deadline.type')}
          <select value={form.type} onChange={(event) => updateField('type', event.target.value)}>
            {documentTypes.map((type) => (
              <option key={type} value={type}>{getDocumentTypeLabel(type, t)}</option>
            ))}
          </select>
        </label>
        <label>
          {t('deadline.scope')}
          <select value={form.scope} onChange={(event) => updateField('scope', event.target.value)}>
            <option value="driver">{t('deadline.driverScope')}</option>
            <option value="vehicle">{t('deadline.vehicleScope')}</option>
          </select>
        </label>
        <label>
          {t('deadline.subject')}
          <select disabled={assignees.length === 0} value={form.assigneeId} onChange={(event) => updateField('assigneeId', event.target.value)}>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {'name' in assignee ? assignee.name : assignee.plate}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('deadline.dueDate')}
          <input value={form.dueDate} onChange={(event) => updateField('dueDate', event.target.value)} type="date" />
        </label>
        <label className="wide-field">
          {t('deadline.owner')}
          <input value={form.owner} onChange={(event) => updateField('owner', event.target.value)} />
        </label>
      </div>
      {!hasAssigneeChoices && <p className="form-hint">{t('deadline.addFirstHint')}</p>}
      {showValidation && !canSubmit && <FormValidationAlert message={formatMissingFields(missingRequiredFields, t)} />}
      <button className="primary-button full-button" type="submit">
        <Plus size={17} />
        {t('common.add')}
      </button>
    </form>
  )
}

function DriverAppView({
  assetPreviewUrl,
  chatLiveState = emptyChatLiveState,
  chatMessages,
  chatThreads,
  companyLogoUrl,
  companyName,
  documentUploadStatus,
  documentRecords,
  driverRecords,
  faultReportRecords,
  faultReported,
  installPromptAvailable,
  isLoading,
  isStandaloneMode,
  items,
  language,
  morningCheckSent,
  notificationEnabled,
  notificationStatus,
  onDriverDocumentCreate,
  onDriverDocumentFileRemove,
  onDriverDocumentUpload,
  onDriverProfileImageRemove,
  onDriverProfileImageUpload,
  onFaultReport,
  onEnablePhoneNotifications,
  onInstallPhoneApp,
  onLanguageChange,
  onMarkChatRead,
  onMorningCheck,
  onOpenDriverDocument,
  onReactToMessage,
  onRefreshAssetPreviewUrl,
  onSendChatMessage,
  onTyping,
  onSignOut,
  onUpload,
  operationsStatus,
  t,
  uploadSent,
  uploadingDocumentId,
  vehicleCheckRecords,
  vehicleRecords,
}) {
  return (
    <main className="driver-page">
      <header className="driver-page-header">
        <div className="brand driver-company-brand">
          <EntityAvatar imageUrl={companyLogoUrl} name={companyName} variant="company" />
          <div>
            <strong>{companyName}</strong>
            <span>{t('driver.area')}</span>
          </div>
        </div>
        <button className="logout-button" onClick={onSignOut} type="button">
            <LogOut size={17} />
          {t('session.signOut')}
        </button>
      </header>
      <div className="driver-page-content">
        {isLoading ? (
          <DriverLoadingPhone companyLogoUrl={companyLogoUrl} companyName={companyName} t={t} />
        ) : driverRecords.length > 0 ? (
          <DriverMobile
            assetPreviewUrl={assetPreviewUrl}
            chatLiveState={chatLiveState}
            chatMessages={chatMessages}
            chatThreads={chatThreads}
            companyLogoUrl={companyLogoUrl}
            companyName={companyName}
            documentUploadStatus={documentUploadStatus}
            documentRecords={documentRecords}
            driverRecords={driverRecords}
            faultReportRecords={faultReportRecords}
            faultReported={faultReported}
            installPromptAvailable={installPromptAvailable}
            isStandaloneMode={isStandaloneMode}
            items={items}
            language={language}
            morningCheckSent={morningCheckSent}
            notificationEnabled={notificationEnabled}
            notificationStatus={notificationStatus}
            onDriverDocumentCreate={onDriverDocumentCreate}
            onDriverDocumentFileRemove={onDriverDocumentFileRemove}
            onDriverDocumentUpload={onDriverDocumentUpload}
            onDriverProfileImageRemove={onDriverProfileImageRemove}
            onDriverProfileImageUpload={onDriverProfileImageUpload}
            onEnablePhoneNotifications={onEnablePhoneNotifications}
            onFaultReport={onFaultReport}
            onInstallPhoneApp={onInstallPhoneApp}
            onLanguageChange={onLanguageChange}
            onMarkChatRead={onMarkChatRead}
            onReactToMessage={onReactToMessage}
            onRefreshAssetPreviewUrl={onRefreshAssetPreviewUrl}
            onSendChatMessage={onSendChatMessage}
            onTyping={onTyping}
            onMorningCheck={onMorningCheck}
            onOpenDriverDocument={onOpenDriverDocument}
            operationsStatus={operationsStatus}
            t={t}
            uploadSent={uploadSent}
            onUpload={onUpload}
            uploadingDocumentId={uploadingDocumentId}
            vehicleCheckRecords={vehicleCheckRecords}
            vehicleRecords={vehicleRecords}
          />
        ) : (
          <DriverEmptyPhone companyLogoUrl={companyLogoUrl} companyName={companyName} message={operationsStatus} t={t} />
        )}
        <div className="driver-info-column">
          <section className="panel driver-note-panel">
            <p className="overline">{t('driver.noteOverline')}</p>
            <h1>{t('driver.noteTitle')}</h1>
            <p>{t('driver.noteBody')}</p>
          </section>
        </div>
      </div>
      <footer className="driver-logout-footer">
        <button className="logout-button" onClick={onSignOut} type="button">
          <LogOut size={17} />
          {t('session.signOut')}
        </button>
      </footer>
    </main>
  )
}

function DriverLoadingPhone({ companyLogoUrl, companyName, t }) {
  return (
    <section className="phone-frame" aria-label="Caricamento app autista">
      <div className="phone-top">
        <span>09:41</span>
        <span>App</span>
      </div>
      <div className="phone-body">
        <div className="driver-company-strip">
          <EntityAvatar imageUrl={companyLogoUrl} name={companyName} variant="company" />
          <div>
            <span>{t('auth.companyTab')}</span>
            <strong>{companyName}</strong>
          </div>
        </div>
        <div className="driver-loading-state">
          <RadioTower size={24} />
          <strong>{t('driver.loadingTitle')}</strong>
          <span>{t('driver.loadingDetail')}</span>
        </div>
      </div>
    </section>
  )
}

function DriverEmptyPhone({ companyLogoUrl, companyName, message, t }) {
  return (
    <section className="phone-frame" aria-label="Area autista non disponibile">
      <div className="phone-top">
        <span>09:41</span>
        <span>App</span>
      </div>
      <div className="phone-body">
        <div className="driver-company-strip">
          <EntityAvatar imageUrl={companyLogoUrl} name={companyName} variant="company" />
          <div>
            <span>{t('auth.companyTab')}</span>
            <strong>{companyName}</strong>
          </div>
        </div>
        <div className="driver-loading-state">
          <AlertTriangle size={24} />
          <strong>{t('driver.emptyTitle')}</strong>
          <span>{message || t('driver.emptyMessage')}</span>
        </div>
      </div>
    </section>
  )
}

function DriverMobile({
  assetPreviewUrl = () => '',
  chatLiveState = emptyChatLiveState,
  chatMessages = [],
  chatThreads = [],
  companyLogoUrl = '',
  companyName = 'Azienda',
  documentUploadStatus,
  documentRecords = driverDocuments,
  driverRecords = [],
  faultReportRecords = [],
  faultReported,
  installPromptAvailable = false,
  isStandaloneMode = false,
  items = [],
  morningCheckSent,
  notificationEnabled = false,
  notificationStatus = '',
  onDriverDocumentCreate,
  onDriverDocumentFileRemove,
  onDriverDocumentUpload,
  onDriverProfileImageRemove,
  onDriverProfileImageUpload,
  onEnablePhoneNotifications,
  onFaultReport,
  onInstallPhoneApp,
  onMarkChatRead,
  onMorningCheck,
  onOpenDriverDocument,
  onReactToMessage,
  onRefreshAssetPreviewUrl,
  onSendChatMessage,
  onTyping,
  onUpload,
  operationsStatus,
  showDriverSelector = false,
  uploadSent,
  uploadingDocumentId,
  vehicleCheckRecords = [],
  vehicleRecords = vehicles,
}) {
  const { t } = useI18n()
  const [mediaSavePreference, setMediaSavePreference] = useDriverMediaSavePreference()
  const [selectedPreviewDriverId, setSelectedPreviewDriverId] = useState('')
  const previewDriver =
    driverRecords.find((entry) => entry.id === selectedPreviewDriverId) ??
    driverRecords[0]
  const driver = showDriverSelector ? previewDriver : driverRecords[0]
  const activeVehicles = vehicleRecords.filter((entry) => entry.status !== 'Archiviato')
  const driveableVehicles = activeVehicles.filter((entry) => entry.fleetType !== 'semirimorchio')
  const assignedVehicle = driveableVehicles.find((entry) => entry.id === driver.vehicleId)
  const semitrailers = activeVehicles.filter((entry) => entry.fleetType === 'semirimorchio')
  const [selectedVehicleId, setSelectedVehicleId] = useState((driver.vehicleId || driveableVehicles[0]?.id) ?? '')
  const [attachedTrailerId, setAttachedTrailerId] = useState(semitrailers[0]?.id ?? '')
  const [checkForm, setCheckForm] = useState({
    documentsOnBoard: true,
    lightsOk: true,
    notes: '',
    odometerKm: '',
    tiresOk: true,
  })
  const [faultForm, setFaultForm] = useState({
    description: '',
    photoFile: null,
    severity: 'medium',
    title: '',
  })
  const [isDriverChatOpen, setIsDriverChatOpen] = useState(false)
  const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false)
  const [isFaultFormOpen, setIsFaultFormOpen] = useState(false)
  const [documentForm, setDocumentForm] = useState({
    documentNumber: '',
    expiresAt: '',
    file: null,
    type: 'Patente C+E',
  })
  const [showDocumentValidation, setShowDocumentValidation] = useState(false)
  const [sendingOperation, setSendingOperation] = useState('')
  const selectedVehicle = driveableVehicles.find((entry) => entry.id === selectedVehicleId) ?? assignedVehicle ?? driveableVehicles[0] ?? null
  const attachedTrailer = semitrailers.find((entry) => entry.id === attachedTrailerId) ?? null
  const driverItems = items.filter(
    (item) => item.driverId === driver.id || (selectedVehicle && item.vehicleId === selectedVehicle.id),
  )
  const nextItem = driverItems[0]
  const docs = documentRecords.filter((document) => document.driverId === driver.id && document.visibleToDriver)
  const driverChecks = vehicleCheckRecords
    .filter((check) => check.driverId === driver.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const lastCheck = driverChecks[0]
  const hasSentMorningCheck = morningCheckSent || isSameLocalDay(lastCheck?.createdAt)
  const openFaults = faultReportRecords.filter(
    (report) => report.driverId === driver.id && report.status !== 'closed',
  )
  const driverChatThread = chatThreads.find((thread) => thread.driverId === driver.id && thread.contextType === 'general')
  const driverChatMessages = useMemo(
    () =>
      driverChatThread
        ? chatMessages
            .filter((message) => message.threadId === driverChatThread.id)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        : [],
    [chatMessages, driverChatThread],
  )
  const unreadCompanyMessageCount = driverChatMessages.filter(
    (message) => message.senderRole === 'company' && !message.readByDriverAt,
  ).length
  const hasUnreadCompanyMessages = unreadCompanyMessageCount > 0
  const companyPresenceId = driverChatThread?.companyId ?? driver.companyId ?? ''
  const companyIsTyping = Boolean(
    driverChatThread?.id && getTypingActors(chatLiveState, driverChatThread.id, 'company').length > 0,
  )
  const companyIsOnline = isChatActorOnline(chatLiveState, 'company', companyPresenceId)
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false)
  const vehicleLabel = selectedVehicle
    ? `${selectedVehicle.plate} · ${getFleetTypeLabel(selectedVehicle.fleetType, t)}`
    : t('common.vehicleMissing')
  const driverImageUrl = assetPreviewUrl(driver.profileImagePath)

  useEffect(() => {
    if (!isDriverChatOpen) return

    window.requestAnimationFrame(() => {
      document.querySelector('.phone-frame')?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
  }, [isDriverChatOpen])

  useEffect(() => {
    if (isDriverChatOpen && driverChatThread?.id && hasUnreadCompanyMessages) {
      void onMarkChatRead?.(driverChatThread.id, 'driver')
    }
  }, [driverChatThread?.id, hasUnreadCompanyMessages, isDriverChatOpen, onMarkChatRead])

  function openDriverChat() {
    setIsDriverChatOpen(true)
    if (driverChatThread?.id) {
      void onMarkChatRead?.(driverChatThread.id, 'driver')
    }
  }

  function handleDocumentFile(document, event) {
    const file = event.target.files?.[0]
    onDriverDocumentUpload?.(document, file)
    event.target.value = ''
  }

  function handleNewDocumentFile(event) {
    const file = event.target.files?.[0] ?? null
    setDocumentForm((currentForm) => ({ ...currentForm, file }))
    setShowDocumentValidation(false)
    event.target.value = ''
  }

  function updateDocumentField(field, value) {
    setDocumentForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function updateCheckField(field, value) {
    setCheckForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function updateFaultField(field, value) {
    setFaultForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function handleFaultPhotoFile(event) {
    const file = event.target.files?.[0] ?? null
    setFaultForm((currentForm) => ({ ...currentForm, photoFile: file }))
    event.target.value = ''
  }

  async function handleCheckSubmit(event) {
    event.preventDefault()
    if (!selectedVehicle) return

    setSendingOperation('check')
    const sent = await onMorningCheck?.({
      documentsOnBoard: checkForm.documentsOnBoard,
      driverId: driver.id,
      lightsOk: checkForm.lightsOk,
      notes: checkForm.notes,
      odometerKm: checkForm.odometerKm,
      semitrailerId: attachedTrailer?.id ?? null,
      tiresOk: checkForm.tiresOk,
      tractorId: selectedVehicle.id,
    })
    setSendingOperation('')

    if (sent) {
      setCheckForm((currentForm) => ({ ...currentForm, notes: '' }))
    }
  }

  async function handleFaultSubmit(event) {
    event.preventDefault()
    if (!selectedVehicle || !faultForm.title.trim()) return

    setSendingOperation('fault')
    const sent = await onFaultReport?.({
      description: faultForm.description,
      driverId: driver.id,
      photoFile: faultForm.photoFile,
      semitrailerId: attachedTrailer?.id ?? null,
      severity: faultForm.severity,
      title: faultForm.title,
      vehicleId: selectedVehicle.id,
    })
    setSendingOperation('')

    if (sent) {
      setFaultForm({ description: '', photoFile: null, severity: 'medium', title: '' })
      setIsFaultFormOpen(false)
    }
  }

  async function handleDocumentCreate(event) {
    event.preventDefault()

    if (!documentForm.type || !documentForm.file) {
      setShowDocumentValidation(true)
      return
    }

    setSendingOperation('document')
    const createdDocument = await onDriverDocumentCreate?.({
      id: `doc-${Date.now()}`,
      documentNumber: documentForm.documentNumber,
      driverId: driver.id,
      expiresAt: documentForm.expiresAt,
      filePath: '',
      status: 'Mancante',
      type: documentForm.type,
      visibleToDriver: true,
    })

    const uploaded = createdDocument
      ? await onDriverDocumentUpload?.(createdDocument, documentForm.file)
      : false
    setSendingOperation('')

    if (createdDocument && uploaded) {
      setDocumentForm({
        documentNumber: '',
        expiresAt: '',
        file: null,
        type: 'Patente C+E',
      })
      setShowDocumentValidation(false)
      setIsDocumentFormOpen(false)
    }
  }

  return (
    <section className="phone-frame" aria-label="App autista">
      <div className="phone-top">
        <span>09:41</span>
        <span>{selectedVehicle?.plate ?? 'App'}</span>
      </div>
      <div className="phone-body">
        <div className="driver-company-strip">
          <EntityAvatar imageUrl={companyLogoUrl} name={companyName} variant="company" />
          <div>
            <span>{t('common.company')}</span>
            <strong>{companyName}</strong>
          </div>
        </div>
        {showDriverSelector && (
          <label className="driver-preview-selector">
            {t('driverApp.previewDriver')}
            <select
              value={driver.id}
              onChange={(event) => {
                setSelectedPreviewDriverId(event.target.value)
                setIsDriverChatOpen(false)
                setIsFaultFormOpen(false)
              }}
            >
              {driverRecords.length === 0 && <option value={driver.id}>{driver.name}</option>}
              {driverRecords.map((driverRecord) => (
                <option key={driverRecord.id} value={driverRecord.id}>
                  {driverRecord.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="driver-card">
          <button
            aria-label={driverImageUrl ? `Ingrandisci la tua foto profilo` : 'Foto profilo non caricata'}
            className="avatar-preview-button"
            disabled={!driverImageUrl}
            onClick={() => setPhotoPreviewOpen(true)}
            type="button"
          >
            <EntityAvatar imageUrl={driverImageUrl} name={driver.name} />
          </button>
          <div>
            <p>{t('driverApp.greeting')}</p>
            <strong>{driver.name}</strong>
            <DailyMotivation role="driver" t={t} />
            <div className="driver-photo-actions">
              <ImageUploadControl label={driverImageUrl ? t('common.change') : t('companyLogo.upload')} onUpload={(file) => onDriverProfileImageUpload?.(driver.id, file)} />
              {driverImageUrl && (
                <button className="small-button" onClick={() => onDriverProfileImageRemove?.(driver.id)} type="button">
                  {t('common.delete')}
                </button>
              )}
            </div>
          </div>
          <Smartphone size={24} />
        </div>
        {unreadCompanyMessageCount > 0 && !isDriverChatOpen && (
          <button className="driver-notification-strip" onClick={openDriverChat} type="button">
            <Bell size={16} />
            <span>{t('driverApp.messageUnread', { count: unreadCompanyMessageCount })}</span>
          </button>
        )}
        {photoPreviewOpen && driverImageUrl && (
          <PhotoPreviewModal imageUrl={driverImageUrl} name={driver.name} onClose={() => setPhotoPreviewOpen(false)} />
        )}
        <PhoneSetupPanel
          compact
          installPromptAvailable={installPromptAvailable}
          isStandaloneMode={isStandaloneMode}
          notificationEnabled={notificationEnabled}
          notificationStatus={notificationStatus}
          onEnableNotifications={onEnablePhoneNotifications}
          onInstallApp={onInstallPhoneApp}
          showInstallAction={false}
        />
        <DriverMediaSettings
          onPreferenceChange={setMediaSavePreference}
          preference={mediaSavePreference}
          t={t}
        />
        {nextItem && (
          <article className="next-card">
            <span className={`status-pill tone-${nextItem.urgency.tone}`}>{nextItem.urgency.label}</span>
            <h3>{nextItem.type}</h3>
            <p>{formatDate(nextItem.dueDate)}</p>
            <button className="upload-button" onClick={onUpload} type="button">
              <Upload size={16} />
              {uploadSent ? t('driverApp.documentUploaded') : t('driverApp.uploadDocument')}
            </button>
          </article>
        )}
        {!hasSentMorningCheck && (
        <article className="check-card">
          <div>
            <strong>{t('driverApp.morningCheck')}</strong>
            <span>{vehicleLabel}</span>
          </div>
          <form className="check-form" onSubmit={handleCheckSubmit}>
            <label>
              {t('driverApp.usedVehicle')}
              <select value={selectedVehicle?.id ?? ''} onChange={(event) => setSelectedVehicleId(event.target.value)}>
                {driveableVehicles.length === 0 && <option value="">{t('drivers.noVehicle')}</option>}
                {driveableVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} · {getFleetTypeLabel(vehicle.fleetType, t)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('driverApp.attachedTrailer')}
              <select value={attachedTrailer?.id ?? ''} onChange={(event) => setAttachedTrailerId(event.target.value)}>
                <option value="">{t('driverApp.none')}</option>
                {semitrailers.map((trailer) => (
                  <option key={trailer.id} value={trailer.id}>
                    {trailer.plate} · {trailer.model}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('driverApp.currentKm')}
              <input
                min="0"
                onChange={(event) => updateCheckField('odometerKm', event.target.value)}
                placeholder={selectedVehicle?.km ? String(selectedVehicle.km) : '0'}
                type="number"
                value={checkForm.odometerKm}
              />
            </label>
            <div className="inline-checks" aria-label={t('driverApp.quickChecks')}>
              <label className="check-toggle">
                <input
                  checked={checkForm.lightsOk}
                  onChange={(event) => updateCheckField('lightsOk', event.target.checked)}
                  type="checkbox"
                />
                {t('driverApp.lightsOk')}
              </label>
              <label className="check-toggle">
                <input
                  checked={checkForm.tiresOk}
                  onChange={(event) => updateCheckField('tiresOk', event.target.checked)}
                  type="checkbox"
                />
                {t('driverApp.tiresOk')}
              </label>
              <label className="check-toggle">
                <input
                  checked={checkForm.documentsOnBoard}
                  onChange={(event) => updateCheckField('documentsOnBoard', event.target.checked)}
                  type="checkbox"
                />
                {t('driverApp.documentsBoard')}
              </label>
            </div>
            <label>
              {t('driverApp.notesCheck')}
              <textarea
                onChange={(event) => updateCheckField('notes', event.target.value)}
                placeholder={t('driverApp.notesPlaceholder')}
                value={checkForm.notes}
              />
            </label>
            <button className="upload-button" disabled={!selectedVehicle || sendingOperation === 'check'} type="submit">
              <BadgeCheck size={16} />
              {sendingOperation === 'check' ? t('chat.sending') : morningCheckSent ? t('driverApp.checkSent') : t('driverApp.sendCheck')}
            </button>
          </form>
          {!selectedVehicle && (
            <small className="operation-status">
              {t('driverApp.noVehicle')}
            </small>
          )}
          {lastCheck && <small>{t('driverApp.lastCheck', { time: formatShortDateTime(lastCheck.createdAt) })}</small>}
        </article>
        )}
        <article className="check-card driver-chat-card">
          <div>
            <strong>{t('driverApp.companyMessages')}</strong>
            <span>
              {companyIsTyping
                ? 'Azienda sta scrivendo...'
                : unreadCompanyMessageCount > 0
                ? t('driverApp.messageUnread', { count: unreadCompanyMessageCount })
                : driverChatMessages.length > 0
                  ? t('driverApp.messages', { count: driverChatMessages.length })
                  : companyIsOnline
                    ? t('chat.online')
                    : t('chat.noMessages')}
            </span>
          </div>
          {unreadCompanyMessageCount > 0 && (
            <div className="driver-chat-alert">
              <Bell size={15} />
              <span>{t('driverApp.messageUnread', { count: unreadCompanyMessageCount })}</span>
            </div>
          )}
          <div className="driver-chat-list">
            {driverChatMessages.slice(-2).map((message) => {
              const attachmentUrl = assetPreviewUrl(message.attachmentPath) || message.attachmentPath
              const messageDisplay = getChatMessageDisplay(message)

              return (
                <div
                  className={message.senderRole === 'driver' ? 'driver-chat-bubble is-driver' : 'driver-chat-bubble is-company'}
                  key={message.id}
                >
                  <small>{message.senderRole === 'driver' ? t('chat.you') : t('chat.company')} · {formatShortDateTime(message.createdAt)}</small>
                  <ChatQuotedMessage reply={messageDisplay.reply} t={t} />
                  {messageDisplay.text && <p>{messageDisplay.text}</p>}
                  <ChatAttachment
                    attachmentPath={message.attachmentPath}
                    compact
                    onMediaError={() => onRefreshAssetPreviewUrl?.(message.attachmentPath)}
                    t={t}
                    url={attachmentUrl}
                  />
                  {message.senderRole === 'driver' && (
                    <MessageStatus status={getMessageStatus(message, 'driver')} />
                  )}
                </div>
              )
            })}
            {driverChatMessages.length === 0 && <small>{t('chat.emptyDriverHint')}</small>}
          </div>
          <button className="upload-button" onClick={openDriverChat} type="button">
            <Mail size={16} />
            {unreadCompanyMessageCount > 0
              ? t('chat.openWithCount', { count: unreadCompanyMessageCount })
              : t('chat.open')}
          </button>
        </article>
        <article className={isFaultFormOpen ? 'check-card fault-card is-open' : 'check-card fault-card'}>
          <div className="fault-card-header">
            <div>
              <strong>{t('fault.report')}</strong>
              <span>
                {vehicleLabel}
                {attachedTrailer ? ` · ${t('driverApp.attachedTrailer').toLowerCase()} ${attachedTrailer.plate}` : ''}
              </span>
            </div>
            <button className="fault-button" onClick={() => setIsFaultFormOpen((isOpen) => !isOpen)} type="button">
              <Wrench size={16} />
              {isFaultFormOpen ? t('common.close') : t('fault.reportShort')}
            </button>
          </div>
          {isFaultFormOpen && (
            <form className="check-form" onSubmit={handleFaultSubmit}>
              <label>
                {t('fault.severity')}
                <select value={faultForm.severity} onChange={(event) => updateFaultField('severity', event.target.value)}>
                  {faultSeverityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {getFaultSeverityLabel(option.value, t)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t('fault.title')}
                <input
                  onChange={(event) => updateFaultField('title', event.target.value)}
                  placeholder={t('fault.titlePlaceholder')}
                  value={faultForm.title}
                />
              </label>
              <label>
                {t('fault.details')}
                <textarea
                  onChange={(event) => updateFaultField('description', event.target.value)}
                  placeholder={t('fault.detailsPlaceholder')}
                  value={faultForm.description}
                />
              </label>
              <div className="fault-photo-actions">
                <label className="document-action-button">
                  {t('fault.photoTake')}
                  <input accept="image/*" capture="environment" onChange={handleFaultPhotoFile} type="file" />
                </label>
                <label className="document-action-button">
                  {t('chat.gallery')}
                  <input accept="image/*" onChange={handleFaultPhotoFile} type="file" />
                </label>
                {faultForm.photoFile && (
                  <button className="small-button" onClick={() => updateFaultField('photoFile', null)} type="button">
                    {t('fault.photoRemove')}
                  </button>
                )}
              </div>
              {faultForm.photoFile && <small>{t('chat.photoReady', { name: faultForm.photoFile.name })}</small>}
              <button
                className="fault-button"
                disabled={!selectedVehicle || !faultForm.title.trim() || sendingOperation === 'fault'}
                type="submit"
              >
                <Wrench size={16} />
                {sendingOperation === 'fault' ? t('chat.sending') : faultReported ? t('driverApp.faultReported') : t('fault.send')}
              </button>
            </form>
          )}
          {openFaults.length > 0 && <small>{t('fault.openFaults', { count: openFaults.length })}</small>}
          {operationsStatus && <small className="operation-status">{operationsStatus}</small>}
        </article>
        {isDriverChatOpen && (
          <DriverChatScreen
            assetPreviewUrl={assetPreviewUrl}
            chatLiveState={chatLiveState}
            chatMessages={driverChatMessages}
            companyLogoUrl={companyLogoUrl}
            companyName={companyName}
            companyPresenceId={companyPresenceId}
            companyIsTyping={companyIsTyping}
            driver={driver}
            mediaSavePreference={mediaSavePreference}
            onClose={() => setIsDriverChatOpen(false)}
            onReactToMessage={onReactToMessage}
            onRefreshAssetPreviewUrl={onRefreshAssetPreviewUrl}
            onSendChatMessage={onSendChatMessage}
            onTyping={onTyping}
            thread={driverChatThread}
          />
        )}
        <div className="documents-card">
          <div className="documents-card-header">
            <strong>{t('documents.driverPoliceTitle')}</strong>
            <button
              className="document-action-button"
              onClick={() => {
                setIsDocumentFormOpen((isOpen) => !isOpen)
                setShowDocumentValidation(false)
              }}
              type="button"
            >
              <Plus size={14} />
              {isDocumentFormOpen ? t('common.close') : t('common.add')}
            </button>
          </div>
          {isDocumentFormOpen && (
            <form className="check-form driver-document-create-form" onSubmit={handleDocumentCreate}>
              <label>
                {t('documents.document')}
                <select value={documentForm.type} onChange={(event) => updateDocumentField('type', event.target.value)}>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>{getDocumentTypeLabel(type, t)}</option>
                  ))}
                </select>
              </label>
              <label>
                {t('documents.number')}
                <input
                  onChange={(event) => updateDocumentField('documentNumber', event.target.value)}
                  placeholder={t('documents.numberPlaceholder')}
                  value={documentForm.documentNumber}
                />
              </label>
              <label>
                {t('documents.expiry')}
                <input
                  onChange={(event) => updateDocumentField('expiresAt', event.target.value)}
                  onInput={(event) => updateDocumentField('expiresAt', event.target.value)}
                  type="date"
                  value={documentForm.expiresAt}
                />
              </label>
              <div className="fault-photo-actions">
                <label className="document-action-button">
                  {t('documents.uploadCamera')}
                  <input accept="image/*" capture="environment" onChange={handleNewDocumentFile} type="file" />
                </label>
                <label className="document-action-button">
                  {t('documents.uploadFile')}
                  <input accept="image/*,.pdf,application/pdf" onChange={handleNewDocumentFile} type="file" />
                </label>
                {documentForm.file && (
                  <button className="small-button" onClick={() => updateDocumentField('file', null)} type="button">
                    {t('common.remove')}
                  </button>
                )}
              </div>
              {documentForm.file && <small>{t('documents.fileReady', { name: documentForm.file.name })}</small>}
              {showDocumentValidation && (
                <small className="operation-status">{t('documents.chooseFileFirst')}</small>
              )}
              <button className="upload-button" disabled={sendingOperation === 'document'} type="submit">
                <Upload size={16} />
                {sendingOperation === 'document' ? t('common.loading') : t('documents.save')}
              </button>
            </form>
          )}
          {docs.map((document) => (
            <div className="document-row" key={document.id}>
              <FileText size={15} />
              <span>{getDocumentTypeLabel(document.type, t)}</span>
              <small>{formatOptionalDate(document.expiresAt)}</small>
              <div className="document-row-actions">
                <button
                  className="document-action-button"
                  disabled={!document.filePath}
                  onClick={() => onOpenDriverDocument?.(document)}
                  type="button"
                >
                  {t('common.open')}
                </button>
                <label className="document-action-button">
                  {document.filePath ? t('common.change') : t('common.photo')}
                  <input
                    accept="image/*"
                    capture="environment"
                    onChange={(event) => handleDocumentFile(document, event)}
                    type="file"
                  />
                </label>
                <label className="document-action-button">
                  {document.filePath ? t('common.change') : t('documents.uploadFile')}
                  <input
                    accept="image/*,.pdf,application/pdf"
                    onChange={(event) => handleDocumentFile(document, event)}
                    type="file"
                  />
                </label>
                {document.filePath && (
                  <button className="document-action-button danger-document-action" onClick={() => onDriverDocumentFileRemove?.(document)} type="button">
                    {t('common.delete')}
                  </button>
                )}
              </div>
              {uploadingDocumentId === document.id && <small>{t('documents.uploading')}</small>}
            </div>
          ))}
          {docs.length === 0 && <small>{t('documents.noVisible')}</small>}
          {documentUploadStatus && <small className="document-upload-status">{documentUploadStatus}</small>}
        </div>
        <div className="phone-list">
          {driverItems.slice(0, 3).map((item) => (
            <div className="phone-row" key={item.id}>
              <FileText size={16} />
              <span>{item.type}</span>
              <ChevronRight size={15} />
            </div>
          ))}
        </div>
      </div>
      <div className="phone-nav">
        <CalendarClock size={17} />
        <Truck size={17} />
        <UserRound size={17} />
      </div>
    </section>
  )
}

function DriverChatScreen({
  assetPreviewUrl = () => '',
  chatLiveState = emptyChatLiveState,
  chatMessages = [],
  companyLogoUrl = '',
  companyName = 'Azienda',
  companyIsTyping = false,
  companyPresenceId = '',
  driver,
  mediaSavePreference = 'never',
  onClose,
  onReactToMessage,
  onRefreshAssetPreviewUrl,
  onSendChatMessage,
  onTyping,
  thread,
}) {
  const { t } = useI18n()
  const [chatForm, setChatForm] = useState({
    attachmentFile: null,
    body: '',
  })
  const [isDriverRecordingAudio, setIsDriverRecordingAudio] = useState(false)
  const [isMediaPanelOpen, setIsMediaPanelOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [replyToMessage, setReplyToMessage] = useState(null)
  const [copiedMessageId, setCopiedMessageId] = useState('')
  const [highlightedMessageId, setHighlightedMessageId] = useState('')
  const [chatPhotoPreview, setChatPhotoPreview] = useState(null)
  const messagesListRef = useRef(null)
  const composeTextareaRef = useRef(null)
  const seenChatMessageIdsRef = useRef(new Set())
  const hasLoadedInitialMessagesRef = useRef(false)
  const savedAttachmentPathsRef = useRef(new Set())
  const lastMessageId = chatMessages[chatMessages.length - 1]?.id ?? ''
  const chatSound = useChatSoundPreference()
  const messageActions = useChatMessageActions({ onReply: startReplyToMessage })
  const scrollDriverChatToBottom = useCallback(() => {
    const listElement = messagesListRef.current
    if (listElement) listElement.scrollTop = listElement.scrollHeight
  }, [])
  const companyIsOnline = isChatActorOnline(chatLiveState, 'company', companyPresenceId)
  const companyPresenceLabel = getChatPresenceLabel({
    isOnline: companyIsOnline,
    isTyping: companyIsTyping,
    lastSeenAt: getChatActorLastSeenAt(chatLiveState, 'company', companyPresenceId),
    typingLabel: 'Azienda sta scrivendo...',
  })
  const companyPresenceClassName = [
    'chat-presence-text',
    companyIsOnline ? 'is-online' : '',
    companyIsTyping ? 'is-typing' : '',
  ].filter(Boolean).join(' ')
  const signalDriverTyping = useChatTypingSignal({
    actorRole: 'driver',
    onTyping,
    threadId: thread?.id,
  })
  const hasDriverComposerPayload = Boolean(chatForm.body.trim() || chatForm.attachmentFile)
  const mediaMessages = useMemo(
    () => chatMessages.filter((message) => ['image', 'video'].includes(getChatAttachmentKind(message.attachmentPath))),
    [chatMessages],
  )

  function getDriverMessageSenderLabel(message) {
    return message.senderRole === 'driver' ? t('chat.you') : t('chat.company')
  }

  function startReplyToMessage(message) {
    setReplyToMessage(createChatReplyReference(message, getDriverMessageSenderLabel(message)))
    messageActions.closeMessageActions()
    window.setTimeout(() => composeTextareaRef.current?.focus(), 80)
  }

  async function handleCopyMessage(message) {
    const copied = await copyChatText(message)
    messageActions.closeMessageActions()

    if (!copied) return

    setCopiedMessageId(message.id)
    window.setTimeout(() => setCopiedMessageId(''), 1400)
  }

  function openReplyTarget(messageId) {
    if (!messageId || !messagesListRef.current) return

    const targetElement = messagesListRef.current.querySelector(`[data-chat-message-id="${messageId}"]`)
    if (!targetElement) return

    targetElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
    setHighlightedMessageId(messageId)
    window.setTimeout(() => setHighlightedMessageId(''), 1400)
  }

  function openChatAvatarPreview(imageUrl, name) {
    if (imageUrl) setChatPhotoPreview({ imageUrl, name })
  }

  useLayoutEffect(() => {
    return startChatBottomScroll(scrollDriverChatToBottom, messagesListRef.current)
  }, [chatMessages.length, lastMessageId, scrollDriverChatToBottom])

  useEffect(() => {
    updateActiveChatForPush(thread?.id ?? '')
    return () => updateActiveChatForPush('')
  }, [thread?.id])

  useEffect(() => {
    if (companyIsTyping) scrollDriverChatToBottom()
  }, [companyIsTyping, scrollDriverChatToBottom])

  function handleAttachmentFile(event) {
    const file = event.target.files?.[0] ?? null
    setChatForm((currentForm) => ({ ...currentForm, attachmentFile: file }))
    event.target.value = ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!driver || (!chatForm.body.trim() && !chatForm.attachmentFile)) return

    const sentChatForm = chatForm
    const sentReplyToMessage = replyToMessage

    setChatForm({ attachmentFile: null, body: '' })
    setReplyToMessage(null)
    signalDriverTyping('')
    setIsSending(true)
    const sent = await onSendChatMessage?.({
      attachmentFile: sentChatForm.attachmentFile,
      body: sentChatForm.body,
      driverId: driver.id,
      replyToMessage: sentReplyToMessage,
      senderRole: 'driver',
      threadId: thread?.id,
    })
    setIsSending(false)

    if (sent) {
      chatSound.playSound('outgoing')
    } else {
      setChatForm(sentChatForm)
      setReplyToMessage(sentReplyToMessage)
    }
  }

  useEffect(() => {
    const seenMessages = seenChatMessageIdsRef.current

    if (!hasLoadedInitialMessagesRef.current) {
      chatMessages.forEach((message) => seenMessages.add(message.id))
      hasLoadedInitialMessagesRef.current = true
      return
    }

    const newMessages = chatMessages.filter((message) => !seenMessages.has(message.id))

    if (newMessages.some((message) => message.senderRole === 'company')) {
      chatSound.playSound('incoming')
    }

    newMessages.forEach((message) => seenMessages.add(message.id))
  }, [chatMessages, chatSound, lastMessageId])

  useEffect(() => {
    if (mediaSavePreference === 'never') return

    chatMessages.forEach((message) => {
      if (message.senderRole !== 'company' || !message.attachmentPath) return
      if (savedAttachmentPathsRef.current.has(message.attachmentPath)) return

      const attachmentKind = getChatAttachmentKind(message.attachmentPath)
      if (!shouldAutoSaveChatMedia(attachmentKind, mediaSavePreference)) return

      const attachmentUrl = assetPreviewUrl(message.attachmentPath) || message.attachmentPath
      if (!attachmentUrl) return

      const downloaded = triggerChatMediaDownload(attachmentUrl, getChatAttachmentFileName(message.attachmentPath))
      if (downloaded) savedAttachmentPathsRef.current.add(message.attachmentPath)
    })
  }, [assetPreviewUrl, chatMessages, mediaSavePreference])

  return (
    <div className="driver-chat-screen" role="dialog" aria-label={t('chat.company')}>
      <div className="driver-chat-screen-header">
        <button aria-label={t('common.back')} className="icon-button" onClick={onClose} type="button">
          <ArrowLeft size={18} />
        </button>
        <ChatAvatarButton imageUrl={companyLogoUrl} name={companyName} onOpen={openChatAvatarPreview} />
        <div>
          <strong>{t('chat.company')}</strong>
          <span className={companyPresenceClassName}>{companyPresenceLabel}</span>
        </div>
        <button
          aria-label="Apri foto e media"
          className="driver-chat-media-button"
          onClick={() => setIsMediaPanelOpen(true)}
          type="button"
        >
          <ImageIcon size={17} />
          {mediaMessages.length > 0 && <span>{mediaMessages.length}</span>}
        </button>
        <ChatSoundButton enabled={chatSound.isEnabled} onToggle={chatSound.toggleSound} t={t} />
      </div>
      {isMediaPanelOpen && (
        <div className="driver-chat-media-panel" role="dialog" aria-label="Foto e media">
          <div className="driver-chat-media-header">
            <button aria-label={t('common.back')} className="icon-button" onClick={() => setIsMediaPanelOpen(false)} type="button">
              <ArrowLeft size={18} />
            </button>
            <div>
              <strong>Foto e media</strong>
              <span>{mediaMessages.length} condivisi in questa chat</span>
            </div>
          </div>
          <div className="driver-chat-media-grid">
            {mediaMessages.map((message) => {
              const attachmentUrl = assetPreviewUrl(message.attachmentPath) || message.attachmentPath
              const kind = getChatAttachmentKind(message.attachmentPath)

              return (
                <button
                  className="driver-chat-media-item"
                  key={`${message.id}-${message.attachmentPath}`}
                  onClick={() => {
                    if (kind === 'image') {
                      setChatPhotoPreview({
                        imageUrl: attachmentUrl,
                        name: getChatAttachmentFileName(message.attachmentPath, 'Foto'),
                      })
                    } else {
                      window.open(attachmentUrl, '_blank', 'noopener,noreferrer')
                    }
                  }}
                  type="button"
                >
                  <span className="driver-chat-media-thumb">
                    {kind === 'image' ? (
                      <img alt="" src={attachmentUrl} />
                    ) : (
                      <span className="driver-chat-media-video">
                        <ImageIcon size={24} />
                      </span>
                    )}
                  </span>
                  <strong>{kind === 'image' ? 'Foto' : 'Video'}</strong>
                  <small>{formatShortDateTime(message.createdAt)}</small>
                </button>
              )
            })}
            {mediaMessages.length === 0 && (
              <div className="driver-chat-media-empty">
                <ImageIcon size={24} />
                <strong>Nessuna foto o video</strong>
                <span>Quando scambi media in chat li troverai qui.</span>
              </div>
            )}
          </div>
        </div>
      )}
      {chatPhotoPreview && (
        <PhotoPreviewModal
          imageUrl={chatPhotoPreview.imageUrl}
          name={chatPhotoPreview.name}
          onClose={() => setChatPhotoPreview(null)}
        />
      )}

      <div className="driver-chat-screen-list" ref={messagesListRef}>
        {chatMessages.map((message) => {
          const attachmentUrl = assetPreviewUrl(message.attachmentPath) || message.attachmentPath
          const isActionMenuOpen = messageActions.openActionMessageId === message.id
          const messageDisplay = getChatMessageDisplay(message)
          const swipeOffset = messageActions.swipeState.messageId === message.id ? messageActions.swipeState.offset : 0
          const messageClassName = [
            message.senderRole === 'driver' ? 'driver-chat-screen-message is-driver' : 'driver-chat-screen-message is-company',
            hasChatReactions(message) ? 'has-reaction' : '',
            isActionMenuOpen ? 'has-action-menu' : '',
            swipeOffset ? 'is-swiping' : '',
            highlightedMessageId === message.id ? 'is-reply-highlighted' : '',
          ].filter(Boolean).join(' ')

          return (
            <article
              className={messageClassName}
              data-chat-message-id={message.id}
              key={message.id}
              style={swipeOffset ? { '--swipe-offset': `${swipeOffset}px` } : undefined}
              {...messageActions.getMessageActionProps(message)}
            >
              <ChatQuotedMessage onOpen={openReplyTarget} reply={messageDisplay.reply} t={t} />
              {messageDisplay.text && <p>{messageDisplay.text}</p>}
              <ChatAttachment
                attachmentPath={message.attachmentPath}
                onMediaError={() => onRefreshAssetPreviewUrl?.(message.attachmentPath)}
                onLoad={scrollDriverChatToBottom}
                t={t}
                url={attachmentUrl}
              />
              <small>
                {formatShortDateTime(message.createdAt)}
                {message.senderRole === 'driver' && (
                  <MessageStatus status={getMessageStatus(message, 'driver')} />
                )}
              </small>
              <ChatReactionBar
                message={message}
                onOpen={() => messageActions.openMessageActions(message.id)}
              />
              {isActionMenuOpen && (
                <ChatMessageActionMenu
                  actorRole="driver"
                  message={message}
                  onClose={messageActions.closeMessageActions}
                  onCopy={handleCopyMessage}
                  onReact={onReactToMessage}
                  onReply={startReplyToMessage}
                  t={t}
                />
              )}
              {copiedMessageId === message.id && <span className="chat-copy-toast">{t('chat.copied')}</span>}
            </article>
          )
        })}
        {chatMessages.length === 0 && (
          <div className="driver-chat-screen-empty">
            <Mail size={24} />
            <strong>{t('chat.noMessages')}</strong>
            <span>{t('chat.emptyDriverHint')}</span>
          </div>
        )}
        {companyIsTyping && (
          <div className="chat-typing-indicator is-driver-view">
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <strong>Azienda sta scrivendo...</strong>
          </div>
        )}
        <span className="chat-scroll-anchor" />
      </div>

      <form className="driver-chat-screen-compose" onSubmit={handleSubmit}>
        <ChatReplyPreview onCancel={() => setReplyToMessage(null)} reply={replyToMessage} t={t} />
        <ChatAttachmentDraft
          file={chatForm.attachmentFile}
          onRemove={() => setChatForm((currentForm) => ({ ...currentForm, attachmentFile: null }))}
          t={t}
        />
        <div className={isDriverRecordingAudio ? 'chat-compose-bar driver-chat-screen-actions is-recording-audio' : 'chat-compose-bar driver-chat-screen-actions'}>
          {!isDriverRecordingAudio && <ChatAttachmentMenu onFile={handleAttachmentFile} t={t} />}
          {!isDriverRecordingAudio && (
            <textarea
              ref={composeTextareaRef}
              className="chat-compose-input"
              onChange={(event) => {
                setChatForm((currentForm) => ({ ...currentForm, body: event.target.value }))
                signalDriverTyping(event.target.value)
              }}
              placeholder={t('chat.messagePlaceholder')}
              rows={1}
              value={chatForm.body}
            />
          )}
          <span className="chat-compose-tail">
            {!hasDriverComposerPayload && !isDriverRecordingAudio && (
              <ChatQuickCameraButton disabled={isSending} onFile={handleAttachmentFile} t={t} />
            )}
            {hasDriverComposerPayload ? (
              <button
                aria-label={isSending ? t('chat.sending') : t('chat.send')}
                className="chat-send-button"
                disabled={isSending}
                type="submit"
              >
                <Send size={18} />
                <span className="sr-only">{isSending ? t('chat.sending') : t('chat.send')}</span>
              </button>
            ) : (
              <ChatAudioRecorder
                disabled={isSending}
                onRecord={(file) => setChatForm((currentForm) => ({ ...currentForm, attachmentFile: file }))}
                onRecordingChange={setIsDriverRecordingAudio}
                t={t}
              />
            )}
          </span>
        </div>
      </form>
    </div>
  )
}

export default App
