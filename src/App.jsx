import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left.mjs'
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle.mjs'
import Banknote from 'lucide-react/dist/esm/icons/banknote.mjs'
import Bell from 'lucide-react/dist/esm/icons/bell.mjs'
import BadgeCheck from 'lucide-react/dist/esm/icons/badge-check.mjs'
import BookOpen from 'lucide-react/dist/esm/icons/book-open.mjs'
import Bot from 'lucide-react/dist/esm/icons/bot.mjs'
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
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard.mjs'
import LockKeyhole from 'lucide-react/dist/esm/icons/lock-keyhole.mjs'
import LogOut from 'lucide-react/dist/esm/icons/log-out.mjs'
import Mail from 'lucide-react/dist/esm/icons/mail.mjs'
import Mic from 'lucide-react/dist/esm/icons/mic.mjs'
import Paperclip from 'lucide-react/dist/esm/icons/paperclip.mjs'
import Pencil from 'lucide-react/dist/esm/icons/pencil.mjs'
import PhoneCall from 'lucide-react/dist/esm/icons/phone-call.mjs'
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
import camionChiaroIconUrl from '../driver-app/assets/brand/icon.png'
import { company, complianceItems, driverDocuments, drivers, vehicles } from './data/sampleData'
import { daysUntil, decorateComplianceWithWorkforce, formatDate, getSummary } from './lib/expiry'
import {
  archiveDriverRecord as archiveSupabaseDriver,
  archiveVehicleRecord as archiveSupabaseVehicle,
  clearDriverProfileImageFile as clearSupabaseDriverProfileImageFile,
  createCompanyAssetSignedUrl,
  createBillingCheckoutSession,
  createBillingPortalSession,
  createCompanyPerson as createSupabaseCompanyPerson,
  createCompanyInvoiceSignedUrl,
  createComplianceItemRecord as createSupabaseComplianceItem,
  createCostEntryRecord as createSupabaseCostEntry,
  fetchCompanyAssets,
  createChatMessageRecord as createSupabaseChatMessage,
  createTeamChatMessageRecord as createSupabaseTeamChatMessage,
  createChatThreadRecord as createSupabaseChatThread,
  createVoiceCallSessionRecord as createSupabaseVoiceCallSession,
  createDriverDocumentSignedUrl,
  ensureDirectTeamThread,
  createDriverAccount as createSupabaseDriverAccount,
  createFaultReportRecord as createSupabaseFaultReport,
  createDriverRecord as createSupabaseDriver,
  createDriverDocumentRecord as createSupabaseDriverDocument,
  createOwnDriverDocumentRecord as createSupabaseOwnDriverDocument,
  createVehicleRecord as createSupabaseVehicle,
  createVehicleCheckRecord as createSupabaseVehicleCheck,
  deleteCostEntryRecord as deleteSupabaseCostEntry,
  deleteDriverDocumentRecord as deleteSupabaseDriverDocument,
  fetchDriverDocumentEvents,
  ensureCompanyForCurrentUser,
  ensureDefaultTeamThreads,
  fetchChatMessages,
  fetchChatThreads,
  fetchTeamChatMessages,
  fetchTeamChatThreads,
  fetchComplianceItems,
  fetchCompanyCostEntries,
  fetchCompanyInvoices,
  fetchCompanyPeople,
  fetchCompanyStorageSummary,
  fetchLegalAcceptanceStatus,
  fetchAdminOverview,
  updateAdminCompanyControl,
  fetchDriverDocuments,
  fetchDriverSessionData,
  fetchDrivers,
  fetchFaultReports,
  fetchVehicleChecks,
  fetchVehicles,
  getCurrentAuthSession,
  hasPasswordRecoveryUrlParams,
  isSupabaseConfigured,
  logDriverDocumentEvent as logSupabaseDriverDocumentEvent,
  markCompanyAssetStorageFileDeleted,
  markDriverDocumentStorageFileDeleted,
  savePushSubscription,
  sendPushNotification,
  sendPasswordRecoveryEmail,
  recordLegalAcceptances,
  markChatMessagesRead as markSupabaseChatMessagesRead,
  markTeamThreadRead as markSupabaseTeamThreadRead,
  resetCompanyAccessPassword as resetSupabaseCompanyAccessPassword,
  renewCompanyComplianceItem as renewSupabaseCompanyComplianceItem,
  signInDriver,
  signInCompany,
  signOut,
  signUpCompany,
  subscribeToChatMessages,
  subscribeToChatPresence,
  subscribeToOperationalUpdates,
  subscribeToTeamChatMessages,
  uploadCompanyLogoFile as uploadSupabaseCompanyLogoFile,
  uploadDriverDocumentFile as uploadSupabaseDriverDocumentFile,
  uploadDriverProfileImageFile as uploadSupabaseDriverProfileImageFile,
  updateDriverDocumentRecord as updateSupabaseDriverDocument,
  updateComplianceItemRecord as updateSupabaseComplianceItem,
  updateDriverRecord as updateSupabaseDriver,
  updateChatMessageReaction as updateSupabaseChatMessageReaction,
  updateCompanyProfile as updateSupabaseCompanyProfile,
  updateCostEntryRecord as updateSupabaseCostEntry,
  updateFaultReportStatus as updateSupabaseFaultReportStatus,
  updatePasswordFromRecovery,
  updateVehicleCheckStatus as updateSupabaseVehicleCheckStatus,
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
  business: 30 * 1024 * 1024 * 1024,
  enterprise: 100 * 1024 * 1024 * 1024,
  fleet10: 20 * 1024 * 1024 * 1024,
  fleet20: 30 * 1024 * 1024 * 1024,
  fleet30: 50 * 1024 * 1024 * 1024,
  fleet50: 75 * 1024 * 1024 * 1024,
  pro: 20 * 1024 * 1024 * 1024,
  starter: 10 * 1024 * 1024 * 1024,
}
const emptyCompanyStorageSummary = {
  chatBytes: 0,
  documentBytes: 0,
  faultBytes: 0,
  fileCount: 0,
  profileBytes: 0,
  totalBytes: 0,
}

const driverAuthDomain = import.meta.env.VITE_DRIVER_AUTH_DOMAIN ?? 'drivers.vy-go.com'
const adminEmails = new Set(
  String(import.meta.env.VITE_ADMIN_EMAILS ?? 'sisti.adriano@icloud.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
)
const demoCompanyName = 'Azienda Demo SRL'
const supportEmail = 'support@vy-go.com'
const placeholderCompanyNames = new Set(['Vygo', 'Vygo Demo'])
const fleetTypeOptions = [
  { value: 'furgone', label: 'Furgone' },
  { value: 'motrice', label: 'Motrice' },
  { value: 'trattore', label: 'Trattore' },
  { value: 'semirimorchio', label: 'Semirimorchio' },
]

const workforceDepartmentOptions = [
  { value: 'office', label: 'Ufficio' },
  { value: 'warehouse', label: 'Magazzino' },
]

const workforcePersonTypeOptions = {
  office: [
    { value: 'office', label: 'Impiegato ufficio' },
    { value: 'manager', label: 'Responsabile ufficio' },
  ],
  warehouse: [
    { value: 'warehouse_worker', label: 'Magazziniere' },
    { value: 'forklift_operator', label: 'Carrellista' },
    { value: 'manager', label: 'Responsabile magazzino' },
  ],
}

const vehicleStatusOptions = ['Operativo', 'Da controllare', 'In manutenzione']
const billingPlanLabels = {
  business: 'Fleet 20',
  enterprise: 'Enterprise',
  fleet10: 'Fleet 10',
  fleet20: 'Fleet 20',
  fleet30: 'Fleet 30',
  fleet50: 'Fleet 50',
  pro: 'Fleet 10',
  starter: 'Start 5',
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
    bestFor: 'Per piccole flotte che vogliono Vygo completo senza rinunciare a reparti, chat, report e costi.',
    features: ['Tutte le funzioni Vygo', 'Fino a 5 mezzi', 'Fino a 3 strumenti o muletti', 'Fino a 10 account', '10 GB file inclusi'],
    id: 'starter',
    price: '300 euro/mese + IVA',
    title: 'Start 5',
  },
  {
    bestFor: 'Il pacchetto consigliato per chi cresce: stesso Vygo completo, piu capienza operativa.',
    features: ['Tutte le funzioni Vygo', 'Fino a 10 mezzi', 'Fino a 5 strumenti o muletti', 'Fino a 20 account', '20 GB file inclusi'],
    id: 'fleet10',
    isRecommended: true,
    price: '450 euro/mese + IVA',
    title: 'Fleet 10',
  },
  {
    bestFor: 'Stesse funzioni complete, piu spazio operativo per flotte e personale piu ampi.',
    features: ['Tutte le funzioni Vygo', 'Fino a 20 mezzi', 'Fino a 10 strumenti o muletti', 'Fino a 40 account', '30 GB file inclusi'],
    id: 'fleet20',
    price: '699 euro/mese + IVA',
    title: 'Fleet 20',
  },
  {
    bestFor: 'Per aziende con piu sedi, magazzino e gestione manutenzioni frequente.',
    features: ['Tutte le funzioni Vygo', 'Fino a 30 mezzi', 'Fino a 15 strumenti o muletti', 'Fino a 60 account', '50 GB file inclusi'],
    id: 'fleet30',
    price: '899 euro/mese + IVA',
    title: 'Fleet 30',
  },
  {
    bestFor: 'Per flotte grandi con piu utenti e alto volume documentale.',
    features: ['Tutte le funzioni Vygo', 'Fino a 50 mezzi', 'Fino a 25 strumenti o muletti', 'Fino a 100 account', '75 GB file inclusi'],
    id: 'fleet50',
    price: '1.199 euro/mese + IVA',
    title: 'Fleet 50',
  },
]
const vygoBaseMonthlyCostItems = [
  { cents: 18000, category: 'Societa', label: 'Commercialista stimato' },
  { cents: 3000, category: 'Cloud', label: 'Supabase' },
  { cents: 2000, category: 'Cloud', label: 'Netlify Pro' },
  { cents: 2400, category: 'Sviluppo', label: 'Codex / ChatGPT' },
  { cents: 700, category: 'Operativo', label: 'Email dominio' },
  { cents: 2500, category: 'Societa', label: 'Banca, PEC, dominio' },
  { cents: 400, category: 'Operativo', label: 'Dominio vy-go.com' },
  { cents: 825, category: 'Store', label: 'Apple Developer' },
  { cents: 200, category: 'Store', label: 'Google Play' },
  { cents: 7500, category: 'Riserva', label: 'Buffer cloud e imprevisti' },
]
const vygoBaseMonthlyCostCents = vygoBaseMonthlyCostItems.reduce((total, item) => total + item.cents, 0)
const vygoSupportCostPerCompanyCents = 1200
const vygoFleet10MonthlyPriceCents = 45000
const vygoEstimatedTaxReserveRate = 0.35
const vygoEconomyScenarios = [1, 2, 5, 10]
const vygoFirstSalesTarget = 10
const billingPlanCapabilities = {
  business: {
    chat: true,
    costCenter: true,
    departments: true,
    maxAssets: 10,
    maxUsers: 40,
    maxVehicles: 20,
    reports: true,
    storageGb: 30,
    voiceCalls: true,
  },
  enterprise: {
    chat: true,
    costCenter: true,
    departments: true,
    maxAssets: Infinity,
    maxUsers: Infinity,
    maxVehicles: Infinity,
    reports: true,
    storageGb: 100,
    voiceCalls: true,
  },
  fleet10: {
    chat: true,
    costCenter: true,
    departments: true,
    maxAssets: 5,
    maxUsers: 20,
    maxVehicles: 10,
    reports: true,
    storageGb: 20,
    voiceCalls: true,
  },
  fleet20: {
    chat: true,
    costCenter: true,
    departments: true,
    maxAssets: 10,
    maxUsers: 40,
    maxVehicles: 20,
    reports: true,
    storageGb: 30,
    voiceCalls: true,
  },
  fleet30: {
    chat: true,
    costCenter: true,
    departments: true,
    maxAssets: 15,
    maxUsers: 60,
    maxVehicles: 30,
    reports: true,
    storageGb: 50,
    voiceCalls: true,
  },
  fleet50: {
    chat: true,
    costCenter: true,
    departments: true,
    maxAssets: 25,
    maxUsers: 100,
    maxVehicles: 50,
    reports: true,
    storageGb: 75,
    voiceCalls: true,
  },
  pro: {
    chat: true,
    costCenter: true,
    departments: true,
    maxAssets: 5,
    maxUsers: 20,
    maxVehicles: 10,
    reports: true,
    storageGb: 20,
    voiceCalls: true,
  },
  starter: {
    chat: true,
    costCenter: true,
    departments: true,
    maxAssets: 3,
    maxUsers: 10,
    maxVehicles: 5,
    reports: true,
    storageGb: 10,
    voiceCalls: true,
  },
}
const planResourceLabels = {
  assets: 'strumenti o muletti',
  users: 'account utenti, incluso accesso azienda',
  vehicles: 'mezzi',
}
const planFeatureLabels = {
  chat: 'chat aziendale',
  costCenter: 'centro costi',
  departments: 'reparti e gruppi',
  reports: 'report avanzati',
  voiceCalls: 'chiamate vocali live',
}
const planResourceLimitFields = {
  assets: 'maxAssets',
  users: 'maxUsers',
  vehicles: 'maxVehicles',
}
const legalDocumentLibrary = {
  dpa: {
    intro: 'Bozza di nomina a responsabile del trattamento. Prima del rilascio commerciale va revisionata da consulente privacy.',
    sections: [
      {
        body: 'L azienda cliente resta titolare dei dati inseriti in Vygo. Vygo opera come fornitore tecnico e tratta i dati solo per rendere disponibili app, dashboard, notifiche, documenti, chat, report e assistenza.',
        title: 'Ruoli privacy',
      },
      {
        body: 'Vygo puo trattare dati di utenti aziendali, autisti, personale, mezzi, documenti, chat, file, foto, video, audio, chiamate vocali, scadenze, guasti, check, costi, log operativi e dati necessari alla sicurezza del servizio.',
        title: 'Dati trattati',
      },
      {
        body: 'Il trattamento avviene per conto dell azienda cliente, secondo le istruzioni ricevute, per erogare il servizio, mantenere sicurezza, continuita operativa, backup, supporto tecnico e tracciabilita.',
        title: 'Finalita',
      },
      {
        body: 'Vygo adotta misure tecniche e organizzative proporzionate: autenticazione, permessi per azienda, regole database, archiviazione file, log, backup e separazione dei dati tra aziende.',
        title: 'Sicurezza',
      },
      {
        body: 'Alla cessazione del rapporto l azienda potra richiedere esportazione o cancellazione dei dati secondo tempi e modalita definiti nel contratto e nelle procedure operative.',
        title: 'Fine servizio',
      },
    ],
    title: 'Nomina responsabile trattamento',
    version: 'vygo-dpa-2026-07-02',
  },
  privacy: {
    intro: 'Bozza informativa privacy Vygo. Serve per rendere chiaro cosa viene trattato dentro app e dashboard.',
    sections: [
      {
        body: 'Vygo tratta i dati necessari a gestire aziende logistiche, utenti, autisti, personale, mezzi, documenti, scadenze, guasti, chat, notifiche, chiamate vocali, costi, report e assistenza.',
        title: 'Quali dati trattiamo',
      },
      {
        body: 'I dati vengono usati per far funzionare il servizio, mostrare documenti e avvisi, inviare notifiche, gestire comunicazioni aziendali, creare report, garantire sicurezza e fornire supporto.',
        title: 'Perche li usiamo',
      },
      {
        body: 'I dati aziendali sono visibili agli utenti autorizzati dalla rispettiva azienda. Vygo non vende dati personali. Alcuni fornitori tecnici possono trattare dati solo per hosting, database, pagamenti, notifiche o assistenza.',
        title: 'Chi puo vederli',
      },
      {
        body: 'I dati sono conservati per il tempo necessario al servizio, agli obblighi amministrativi e alla sicurezza. L azienda puo richiedere esportazione, correzione o cancellazione secondo le regole contrattuali.',
        title: 'Conservazione',
      },
      {
        body: 'Gli utenti possono chiedere informazioni sui dati, rettifica, limitazione, cancellazione ove applicabile e altre tutele previste dalla normativa privacy. Le richieste passeranno tramite azienda o supporto Vygo.',
        title: 'Diritti',
      },
      {
        body: 'Chat, foto, audio, video e documenti sono strumenti di lavoro aziendale. Le chiamate vocali, quando attive, usano il microfono solo durante la conversazione: Vygo non registra automaticamente l audio e conserva solo metadati operativi come partecipanti, orari, durata e stato chiamata. Ogni azienda deve informare correttamente il proprio personale sulle modalita d uso e sulle regole interne.',
        title: 'Chat e documenti',
      },
    ],
    title: 'Informativa Privacy Vygo',
    version: 'vygo-privacy-2026-07-02',
  },
  staffTerms: {
    intro: 'Regole base per autisti, magazzino, ufficio e personale che usa l app Vygo.',
    sections: [
      {
        body: 'L account e personale. Username e password non vanno condivisi. Se il dispositivo viene perso o l accesso sembra compromesso, bisogna avvisare subito l azienda.',
        title: 'Account personale',
      },
      {
        body: 'L app va usata per finalita lavorative: chat aziendale, check, guasti, documenti, notifiche, scadenze, foto, video, audio e informazioni operative.',
        title: 'Uso corretto',
      },
      {
        body: 'Documenti, foto e allegati caricati devono essere pertinenti, leggibili e collegati al lavoro. Non caricare contenuti inutili, offensivi, non autorizzati o estranei all attivita aziendale.',
        title: 'Documenti e allegati',
      },
      {
        body: 'Le segnalazioni di guasto, check e anomalie devono essere veritiere e complete. Foto e note aiutano l azienda a intervenire meglio e a creare storico operativo.',
        title: 'Check e guasti',
      },
      {
        body: 'Le notifiche servono a ricevere messaggi e avvisi operativi. L utente puo gestire le impostazioni del telefono, ma alcune informazioni possono restare disponibili in app.',
        title: 'Notifiche',
      },
      {
        body: 'Le chiamate vocali live, quando disponibili nel piano aziendale, sono strumenti di lavoro. Non vanno usate per emergenze sanitarie o sicurezza stradale, non vengono registrate automaticamente e possono lasciare storico tecnico di chiamata per tutela operativa.',
        title: 'Chiamate vocali',
      },
    ],
    title: 'Regole uso app personale',
    version: 'vygo-staff-terms-2026-07-02',
  },
  terms: {
    intro: 'Bozza Termini e Condizioni SaaS Vygo. Da validare legalmente prima del lancio commerciale.',
    sections: [
      {
        body: 'Vygo e un servizio software per aziende di trasporto e logistica. Include dashboard aziendale, app personale, scadenze, documenti, check, guasti, chat, notifiche, chiamate vocali quando tecnicamente attivate, centro costi e report secondo il piano acquistato.',
        title: 'Oggetto del servizio',
      },
      {
        body: 'Ogni piano include le funzioni principali Vygo. I limiti commerciali riguardano soprattutto mezzi, strumenti, account utenti e storage. Se un limite viene raggiunto, l azienda potra aggiornare piano o acquistare extra storage.',
        title: 'Piani e limiti',
      },
      {
        body: 'L azienda e responsabile della correttezza dei dati inseriti, della gestione degli utenti, delle autorizzazioni interne, della qualita dei documenti caricati e dell uso conforme alle proprie regole aziendali.',
        title: 'Responsabilita azienda',
      },
      {
        body: 'Vygo si impegna a mantenere il servizio disponibile e sicuro secondo mezzi ragionevoli. Possono esserci manutenzioni, aggiornamenti, interruzioni tecniche o limiti dovuti a fornitori esterni. Le chiamate vocali richiedono permessi dispositivo e un fornitore tecnico di comunicazione.',
        title: 'Disponibilita',
      },
      {
        body: 'Gli abbonamenti vengono gestiti tramite il sistema di pagamento configurato. Mancato pagamento, pagamento fallito o piano scaduto possono limitare o sospendere il servizio fino alla regolarizzazione.',
        title: 'Pagamenti',
      },
      {
        body: 'Alla fine del rapporto, l azienda potra richiedere esportazione dei dati disponibili o cancellazione secondo le procedure concordate. Alcuni dati possono restare conservati per obblighi fiscali, sicurezza o prova contrattuale.',
        title: 'Cessazione',
      },
    ],
    title: 'Termini e Condizioni SaaS',
    version: 'vygo-terms-2026-07-02',
  },
}
const adminBillingPlanOptions = [
  ...billingCheckoutPlans.map((plan) => ({ label: plan.title, value: plan.id })),
  { label: 'Enterprise', value: 'enterprise' },
]
const adminBillingStatusOptions = Object.entries(billingStatusLabels).map(([value, label]) => ({ label, value }))
const adminSalesStageOptions = [
  { label: 'Contatto nuovo', value: 'lead' },
  { label: 'In prova', value: 'trial' },
  { label: 'Onboarding', value: 'onboarding' },
  { label: 'Cliente attivo', value: 'active' },
  { label: 'A rischio', value: 'risk' },
  { label: 'Upsell possibile', value: 'upsell' },
  { label: 'Perso', value: 'lost' },
]
const adminPriorityOptions = [
  { label: 'Bassa', value: 'low' },
  { label: 'Normale', value: 'normal' },
  { label: 'Alta', value: 'high' },
  { label: 'Urgente', value: 'urgent' },
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
const deepLinkViews = new Set(['admin', 'chat', 'deadlines', 'documents', 'drivers', 'fleet', 'notifications', 'records', 'reports', 'settings', 'support'])
const languageStorageKey = 'camionChiaroLanguage'
const chatSoundStorageKey = 'camionChiaroChatSoundEnabled'
const driverMediaSaveStorageKey = 'camionChiaroDriverMediaSavePreference'
const voiceCallsLaunchReady = false
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
const currencyByLanguage = {
  de: 'EUR',
  en: 'EUR',
  es: 'EUR',
  fr: 'EUR',
  it: 'EUR',
  pl: 'PLN',
  ro: 'RON',
}

function getDefaultCurrency(language = defaultLanguage) {
  return currencyByLanguage[language] ?? 'EUR'
}

const translations = {
  it: {
    'auth.companyEmailLabel': 'Email aziendale',
    'auth.companyEmailPlaceholder': 'azienda@esempio.it',
    'auth.companyNameLabel': 'Nome trasportatore / Ragione sociale',
    'auth.companyNameMissing': 'Inserisci il nome del trasportatore o la ragione sociale.',
    'auth.companyNamePlaceholder': 'Es. La tua azienda SRL',
    'auth.companySigninOverline': 'Accesso azienda',
    'auth.companySigninTitle': 'Entra nel pannello',
    'auth.companySignupOverline': 'Registrazione azienda',
    'auth.companySignupTitle': 'Crea account azienda',
    'auth.companyTab': 'Azienda',
    'auth.companyToggleSignin': 'Ho gia un account azienda',
    'auth.companyToggleSignup': 'Devo creare l account azienda',
    'auth.demoNote': 'Accedi con le credenziali aziendali o registra una nuova azienda per attivare Vygo.',
    'auth.driverButton': 'Entra come autista',
    'auth.driverMissing': 'Inserisci nome utente autista e password.',
    'auth.driverOverline': 'Accesso autista',
    'auth.driverTab': 'Autista',
    'auth.driverTitle': 'Entra con nome utente',
    'auth.driverUsernameLabel': 'Nome utente autista',
    'auth.driverUsernamePlaceholder': 'Es. mario.rossi',
    'auth.emailPasswordMissing': 'Inserisci email aziendale e password.',
    'auth.heroText': 'Il sistema operativo per aziende di trasporto: persone, mezzi, documenti, chat, scadenze e costi in un unico posto, senza rincorrere WhatsApp, Excel e telefonate.',
    'auth.heroTitle': 'Login azienda e autista, tutto nello stesso posto.',
    'auth.passwordLabel': 'Password',
    'auth.passwordPlaceholder': 'Password',
    'auth.buyCompany': 'Acquista e attiva azienda',
    'auth.staffAccess': 'Accesso personale',
    'auth.proofDeadlines': 'Scadenze sotto controllo',
    'auth.proofDocuments': 'Documenti sempre disponibili',
    'auth.proofCosts': 'Costi mezzi piu chiari',
    'auth.proofDriver': 'Area autista',
    'auth.proofOperations': 'Attivita tracciate',
    'auth.proofSecurity': 'Dati separati per azienda',
    'auth.registrationSent': 'Registrazione inviata. Controlla la mail per confermare l account.',
    'auth.signinButton': 'Accedi',
    'auth.signupButton': 'Registrati',
    'brand.tagline': 'Move. Manage. Succeed.',
    'driver.area': 'Area autista',
    'driver.emptyMessage': 'Riprova tra qualche secondo o accedi di nuovo.',
    'driver.emptyTitle': 'Area autista non disponibile',
    'driver.loadingDetail': 'Sto recuperando i dati del profilo.',
    'driver.loadingTitle': 'Caricamento area autista',
    'driver.noteBody': 'Qui vedrai avvisi personali, documenti caricati, check mattutini e segnalazioni guasto collegati al tuo profilo.',
    'driver.noteOverline': 'Notifiche',
    'driver.noteTitle': 'Qui arrivano gli avvisi in app',
    'homeCommand.aria': 'Comandi rapidi azienda',
    'homeCommand.chatDetail': 'Singole, gruppi e reparti',
    'homeCommand.chatLabel': 'Chat',
    'homeCommand.costsDetail': 'Guasti, riparazioni e report',
    'homeCommand.costsLabel': 'Centro costi',
    'homeCommand.deadlinesDetail': 'Rinnovi, documenti e solleciti',
    'homeCommand.deadlinesLabel': 'Scadenze',
    'homeCommand.fleetDetail': 'Mezzi, targhe e semirimorchi',
    'homeCommand.fleetLabel': 'Flotta',
    'homeCommand.open': 'Apri',
    'homeCommand.operationsDetail': 'Check, guasti e attivita da lavorare',
    'homeCommand.operationsLabel': 'Registro operativo',
    'homeCommand.peopleDetail': 'Ufficio, magazzino e reparti',
    'homeCommand.peopleLabel': 'Persone',
    'homeCommand.quickAddDetail': 'Nuovo dato aziendale',
    'homeCommand.quickAddLabel': 'Aggiungi',
    'homeCommand.settingsDetail': 'Logo, lingua, notifiche e fatture',
    'homeCommand.settingsLabel': 'Impostazioni',
    'homeCommand.subtitle': 'Le aree operative principali sempre a portata di mano.',
    'homeCommand.title': 'Comandi azienda',
    'homeInsight.deadlineCleanDetail': 'Apri scadenze per pianificare i prossimi rinnovi.',
    'homeInsight.deadlineCleanValue': 'Nessuna urgente',
    'homeInsight.deadlineLabel': 'Prossima scadenza',
    'homeInsight.eventCleanDetail': 'Check e guasti appariranno qui appena arrivano.',
    'homeInsight.eventCleanValue': 'Nessun evento',
    'homeInsight.eventLabel': 'Ultimo evento',
    'homeInsight.fleetDetail': '{drivers} autisti · {people} persone',
    'homeInsight.fleetLabel': 'Squadra e flotta',
    'homeInsight.operationsCleanDetail': 'La giornata operativa e sotto controllo.',
    'homeInsight.operationsCleanValue': 'Nessuna urgenza',
    'homeInsight.operationsDetail': 'Registro operativo da aprire.',
    'homeInsight.operationsLabel': 'Priorita ora',
    'homeInsight.operationsValue': '{count} da aprire',
    'homeInsight.subtitle': 'Priorita, scadenze e attivita aggiornate per decidere subito dove intervenire.',
    'homeInsight.title': 'Quadro operativo',
    'homeStatus.files': 'Spazio file',
    'homeStatus.lastCheck': 'Ultimo controllo',
    'homeStatus.notifications': 'Notifiche',
    'homeStatus.optional': 'Opzionali',
    'homeStatus.now': 'Adesso',
    'homeStatus.ready': 'Attive',
    'homeStatus.storageDetail': '{files} file',
    'homeStatus.sync': 'Sistema',
    'homeStatus.syncDemo': 'Modalita offline',
    'homeStatus.syncReady': 'Collegato',
    'homeStatus.waiting': 'Da attivare',
    'homeFlow.archive': 'Archivio',
    'homeFlow.archiveDetail': 'storico ordinato',
    'homeFlow.checks': 'Check',
    'homeFlow.checksDetail': 'arrivano in tempo reale',
    'homeFlow.deadlines': 'Scadenze',
    'homeFlow.deadlinesDetail': 'rinnovi tracciati',
    'homeFlow.faults': 'Guasti',
    'homeFlow.faultsDetail': 'gestione e costi',
    'homeFlow.title': 'Flusso operativo',
    'homeAssistant.answer.chat': 'Apri la chat aziendale per scrivere ad autisti, gruppi e reparti. Se serve, usa anche il centro supporto per guide e FAQ.',
    'homeAssistant.answer.deadlines': 'Apri Scadenze, filtra quelle da lavorare e rinnova con nuovo documento, nuova data o sollecito alla persona.',
    'homeAssistant.answer.documents': 'Da Anagrafiche e Documenti puoi caricare file, foto e scadenze. L autista vede solo cio che rendi visibile.',
    'homeAssistant.answer.faults': 'Apri Guasti, guarda foto e dettagli, poi registra stato, costo riparazione e storico per targa o periodo.',
    'homeAssistant.answer.mobileApp': 'Da telefono entra con il ruolo corretto, poi apri Impostazioni per notifiche, lingua, suoni e permessi. Se una notifica non arriva, verifica che quel telefono sia registrato.',
    'homeAssistant.answer.reports': 'Apri Report, scegli dettaglio costi, multe o classifica autisti, poi filtra per periodo, targa, autista o attrezzatura. Il CSV e la stampa devono seguire gli stessi filtri mostrati a video.',
    'homeAssistant.body': 'Guida rapida su scadenze, guasti, documenti e chat. Se non basta, apre il centro supporto Vygo.',
    'homeAssistant.chat': 'Chat',
    'homeAssistant.deadlines': 'Scadenze',
    'homeAssistant.documents': 'Documenti',
    'homeAssistant.faults': 'Guasti',
    'homeAssistant.openChat': 'Apri chat',
    'homeAssistant.openGuide': 'Apri guida',
    'homeAssistant.question': 'Come posso aiutarti oggi?',
    'homeAssistant.mobileApp': 'App',
    'homeAssistant.reports': 'Report',
    'homeAssistant.status': 'Guida rapida',
    'homeAssistant.title': 'Assistente Vygo',
    'hero.aria': 'Controllo scadenze',
    'hero.description': 'Priorita operative, scadenze, check e guasti sempre visibili appena entri.',
    'hero.factDrivers': 'autisti attivi',
    'hero.factNotifications': 'notifiche aperte',
    'hero.factVehicles': 'mezzi in flotta',
    'hero.newDeadline': 'Nuova scadenza',
    'hero.openBell': 'Apri notifiche',
    'hero.priorityAria': 'Priorita di oggi',
    'hero.priorityCostDetail': '{count} interventi registrati questo mese',
    'hero.priorityCostLabel': 'Costi mese',
    'hero.priorityCriticalDetail': 'check con anomalie da aprire',
    'hero.priorityCriticalLabel': 'Check critici',
    'hero.priorityDeadlineDetail': '{count} da controllare',
    'hero.priorityDeadlineLabel': 'Scadenze 30 giorni',
    'hero.priorityFaultDetail': 'segnalazioni ancora aperte',
    'hero.priorityFaultLabel': 'Guasti aperti',
    'hero.radarAction': 'Prossima azione',
    'hero.radarAllGood': 'Giornata sotto controllo',
    'hero.radarCost': 'Costi mese',
    'hero.radarCostDetail': '{count} voci costo registrate',
    'hero.radarFleetHealth': 'Salute flotta',
    'hero.radarFleetHealthDetail': '{count} mezzi sotto soglia',
    'hero.radarIndex': 'Controllo azienda',
    'hero.radarOpen': 'Pratiche aperte',
    'hero.radarOpenDetail': 'guasti, check e scadenze da lavorare',
    'hero.radarOpenCosts': 'Apri costi',
    'hero.radarOpenDeadlines': 'Apri scadenze',
    'hero.radarOpenFaults': 'Apri guasti',
    'hero.radarOpenNotifications': 'Apri notifiche',
    'hero.radarPerfect': 'Nessuna urgenza reale: continua cosi.',
    'hero.radarSubtitle': 'Situazione operativa aggiornata in tempo reale.',
    'hero.radarTitle': 'Radar direzione',
    'language.label': 'Lingua',
    'language.short': 'Lingua',
    'nav.chat': 'Chat',
    'nav.dashboard': 'Dashboard',
    'nav.deadlines': 'Scadenze',
    'nav.notifications': 'Notifiche',
    'nav.records': 'Anagrafiche',
    'nav.reports': 'Report',
    'nav.settings': 'Impostazioni',
    'nav.support': 'Guida',
    'onboarding.body': 'Completa questi passaggi per rendere Vygo operativo senza confusione.',
    'onboarding.companyBody': 'Nome azienda, sede e logo visibili nella dashboard.',
    'onboarding.companyTitle': 'Completa profilo azienda',
    'onboarding.completed': '{count}/{total} completati',
    'onboarding.deadlinesBody': 'Inserisci almeno una patente, visita, revisione o assicurazione da ricordare.',
    'onboarding.deadlinesTitle': 'Aggiungi una scadenza',
    'onboarding.done': 'Fatto',
    'onboarding.driversBody': 'Crea autisti, ufficio o magazzino con i dati corretti.',
    'onboarding.driversTitle': 'Aggiungi persone',
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
    'support.subtitle': 'FAQ, manuale e assistenza guidata per usare Vygo senza confusione.',
    'support.title': 'Guida e materiali',
    'support.videos': 'Video',
    'support.vision': 'Visione prodotto',
    'sync.addKeys': 'Configurazione in corso',
    'sync.connected': 'Server connesso',
    'sync.demo': 'Modalita offline',
    'topbar.searchPlaceholder': 'Cerca patente, targa, autista...',
    'topbar.searchSr': 'Cerca scadenze',
  },
  en: {
    'auth.companyEmailLabel': 'Company email',
    'auth.companyEmailPlaceholder': 'company@example.com',
    'auth.companyNameLabel': 'Carrier name / Legal name',
    'auth.companyNameMissing': 'Enter the carrier name or legal company name.',
    'auth.companyNamePlaceholder': 'Example: Your company Ltd',
    'auth.companySigninOverline': 'Company access',
    'auth.companySigninTitle': 'Enter the dashboard',
    'auth.companySignupOverline': 'Company registration',
    'auth.companySignupTitle': 'Create company account',
    'auth.companyTab': 'Company',
    'auth.companyToggleSignin': 'I already have a company account',
    'auth.companyToggleSignup': 'I need to create a company account',
    'auth.demoNote': 'Sign in with your company credentials or register a new company to activate Vygo.',
    'auth.driverButton': 'Enter as driver',
    'auth.driverMissing': 'Enter driver username and password.',
    'auth.driverOverline': 'Driver access',
    'auth.driverTab': 'Driver',
    'auth.driverTitle': 'Enter with username',
    'auth.driverUsernameLabel': 'Driver username',
    'auth.driverUsernamePlaceholder': 'Example: mario.rossi',
    'auth.emailPasswordMissing': 'Enter company email and password.',
    'auth.heroText': 'The operating system for transport companies: people, vehicles, documents, chat, deadlines and costs in one place, without chasing WhatsApp, spreadsheets and phone calls.',
    'auth.heroTitle': 'Company and driver login, all in one place.',
    'auth.passwordLabel': 'Password',
    'auth.passwordPlaceholder': 'Password',
    'auth.buyCompany': 'Buy and activate company',
    'auth.staffAccess': 'Staff access',
    'auth.proofDeadlines': 'Deadlines under control',
    'auth.proofDocuments': 'Documents always available',
    'auth.proofCosts': 'Clearer vehicle costs',
    'auth.proofDriver': 'Driver area',
    'auth.proofOperations': 'Tracked operations',
    'auth.proofSecurity': 'Company data separated',
    'auth.registrationSent': 'Registration sent. Check your email to confirm the account.',
    'auth.signinButton': 'Sign in',
    'auth.signupButton': 'Register',
    'brand.tagline': 'Move. Manage. Succeed.',
    'driver.area': 'Driver area',
    'driver.emptyMessage': 'Try again in a few seconds or sign in again.',
    'driver.emptyTitle': 'Driver area unavailable',
    'driver.loadingDetail': 'Retrieving profile data.',
    'driver.loadingTitle': 'Loading driver area',
    'driver.noteBody': 'Here you will see personal alerts, uploaded documents, morning checks and fault reports linked to your profile.',
    'driver.noteOverline': 'Notifications',
    'driver.noteTitle': 'In-app alerts arrive here',
    'homeCommand.aria': 'Company quick commands',
    'homeCommand.chatDetail': 'Direct chats, groups and departments',
    'homeCommand.chatLabel': 'Chat',
    'homeCommand.costsDetail': 'Faults, repairs and reports',
    'homeCommand.costsLabel': 'Cost center',
    'homeCommand.deadlinesDetail': 'Renewals, documents and reminders',
    'homeCommand.deadlinesLabel': 'Deadlines',
    'homeCommand.fleetDetail': 'Vehicles, plates and trailers',
    'homeCommand.fleetLabel': 'Fleet',
    'homeCommand.open': 'Open',
    'homeCommand.operationsDetail': 'Checks, faults and work to handle',
    'homeCommand.operationsLabel': 'Operations log',
    'homeCommand.peopleDetail': 'Office, warehouse and departments',
    'homeCommand.peopleLabel': 'People',
    'homeCommand.quickAddDetail': 'New company record',
    'homeCommand.quickAddLabel': 'Add',
    'homeCommand.settingsDetail': 'Logo, language, notifications and invoices',
    'homeCommand.settingsLabel': 'Settings',
    'homeCommand.subtitle': 'The main operating areas always within reach.',
    'homeCommand.title': 'Company commands',
    'homeInsight.deadlineCleanDetail': 'Open deadlines to plan the next renewals.',
    'homeInsight.deadlineCleanValue': 'Nothing urgent',
    'homeInsight.deadlineLabel': 'Next deadline',
    'homeInsight.eventCleanDetail': 'Checks and faults will appear here as soon as they arrive.',
    'homeInsight.eventCleanValue': 'No events',
    'homeInsight.eventLabel': 'Latest event',
    'homeInsight.fleetDetail': '{drivers} drivers · {people} people',
    'homeInsight.fleetLabel': 'Team and fleet',
    'homeInsight.operationsCleanDetail': 'The operating day is under control.',
    'homeInsight.operationsCleanValue': 'No urgency',
    'homeInsight.operationsDetail': 'Operations log to open.',
    'homeInsight.operationsLabel': 'Priority now',
    'homeInsight.operationsValue': '{count} to open',
    'homeInsight.subtitle': 'Updated priorities, deadlines and activity so you can decide where to act first.',
    'homeInsight.title': 'Operations snapshot',
    'homeStatus.files': 'File space',
    'homeStatus.lastCheck': 'Last check',
    'homeStatus.notifications': 'Notifications',
    'homeStatus.optional': 'Optional',
    'homeStatus.now': 'Now',
    'homeStatus.ready': 'Active',
    'homeStatus.storageDetail': '{files} files',
    'homeStatus.sync': 'System',
    'homeStatus.syncDemo': 'Offline mode',
    'homeStatus.syncReady': 'Connected',
    'homeStatus.waiting': 'To enable',
    'homeFlow.archive': 'Archive',
    'homeFlow.archiveDetail': 'ordered history',
    'homeFlow.checks': 'Checks',
    'homeFlow.checksDetail': 'real-time arrivals',
    'homeFlow.deadlines': 'Deadlines',
    'homeFlow.deadlinesDetail': 'tracked renewals',
    'homeFlow.faults': 'Faults',
    'homeFlow.faultsDetail': 'handling and costs',
    'homeFlow.title': 'Operating flow',
    'homeAssistant.answer.chat': 'Open company chat to message drivers, groups and departments. Use the support center for guides and FAQs when needed.',
    'homeAssistant.answer.deadlines': 'Open Deadlines, filter items to work on, then renew with a new document, new date or reminder.',
    'homeAssistant.answer.documents': 'From Records and Documents you can upload files, photos and expiry dates. Drivers only see what you make visible.',
    'homeAssistant.answer.faults': 'Open Faults, review photos and details, then record status, repair cost and history by plate or period.',
    'homeAssistant.answer.mobileApp': 'On mobile, sign in with the correct role, then open Settings for notifications, language, sounds and permissions. If a notification does not arrive, verify that phone is registered.',
    'homeAssistant.answer.reports': 'Open Reports, choose cost detail, fines or driver fine ranking, then filter by period, plate, driver or equipment. CSV and print must follow the same data shown on screen.',
    'homeAssistant.body': 'Quick guidance for deadlines, faults, documents and chat. If that is not enough, open Vygo support.',
    'homeAssistant.chat': 'Chat',
    'homeAssistant.deadlines': 'Deadlines',
    'homeAssistant.documents': 'Documents',
    'homeAssistant.faults': 'Faults',
    'homeAssistant.openChat': 'Open chat',
    'homeAssistant.openGuide': 'Open guide',
    'homeAssistant.question': 'How can I help today?',
    'homeAssistant.mobileApp': 'App',
    'homeAssistant.reports': 'Reports',
    'homeAssistant.status': 'Live assistant',
    'homeAssistant.title': 'Vygo Assistant',
    'hero.aria': 'Deadline control',
    'hero.description': 'A clean screen to see deadlines, morning checks and faults to manage right away.',
    'hero.factDrivers': 'active drivers',
    'hero.factNotifications': 'open notifications',
    'hero.factVehicles': 'fleet vehicles',
    'hero.newDeadline': 'New deadline',
    'hero.openBell': 'Open notifications',
    'hero.priorityAria': 'Today priorities',
    'hero.priorityCostDetail': '{count} repairs logged this month',
    'hero.priorityCostLabel': 'Month costs',
    'hero.priorityCriticalDetail': 'checks with issues to open',
    'hero.priorityCriticalLabel': 'Critical checks',
    'hero.priorityDeadlineDetail': '{count} to check',
    'hero.priorityDeadlineLabel': '30-day deadlines',
    'hero.priorityFaultDetail': 'reports still open',
    'hero.priorityFaultLabel': 'Open faults',
    'hero.radarAction': 'Next action',
    'hero.radarAllGood': 'Day under control',
    'hero.radarCost': 'Month costs',
    'hero.radarCostDetail': '{count} cost entries logged',
    'hero.radarFleetHealth': 'Fleet health',
    'hero.radarFleetHealthDetail': '{count} vehicles below threshold',
    'hero.radarIndex': 'Company control',
    'hero.radarOpen': 'Open work',
    'hero.radarOpenCosts': 'Open costs',
    'hero.radarOpenDeadlines': 'Open deadlines',
    'hero.radarOpenDetail': 'faults, checks and deadlines to handle',
    'hero.radarOpenFaults': 'Open faults',
    'hero.radarOpenNotifications': 'Open notifications',
    'hero.radarPerfect': 'No real urgency: keep going.',
    'hero.radarSubtitle': 'Live operating situation updated in real time.',
    'hero.radarTitle': 'Management radar',
    'language.label': 'Language',
    'language.short': 'Language',
    'nav.chat': 'Chat',
    'nav.dashboard': 'Dashboard',
    'nav.deadlines': 'Deadlines',
    'nav.notifications': 'Notifications',
    'nav.records': 'Records',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.support': 'Guide',
    'onboarding.body': 'Complete these steps to make Vygo operational without confusion.',
    'onboarding.companyBody': 'Company name, headquarters and logo visible in the dashboard.',
    'onboarding.companyTitle': 'Complete company profile',
    'onboarding.completed': '{count}/{total} completed',
    'onboarding.deadlinesBody': 'Add at least one licence, medical check, inspection or insurance deadline.',
    'onboarding.deadlinesTitle': 'Add a deadline',
    'onboarding.done': 'Done',
    'onboarding.driversBody': 'Create drivers, office or warehouse people with the right details.',
    'onboarding.driversTitle': 'Add people',
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
    'support.subtitle': 'FAQ, manual and guided help to use Vygo without confusion.',
    'support.title': 'Guide and materials',
    'support.videos': 'Videos',
    'support.vision': 'Product vision',
    'sync.addKeys': 'Configuration in progress',
    'sync.connected': 'Server online',
    'sync.demo': 'Offline mode',
    'topbar.searchPlaceholder': 'Search licence, plate, driver...',
    'topbar.searchSr': 'Search deadlines',
  },
  es: {
    'auth.companyEmailLabel': 'Email de empresa',
    'auth.companyEmailPlaceholder': 'empresa@ejemplo.com',
    'auth.companyNameLabel': 'Nombre del transportista / Razon social',
    'auth.companyNameMissing': 'Introduce el nombre del transportista o la razon social.',
    'auth.companyNamePlaceholder': 'Ej. Tu empresa SL',
    'auth.companySigninOverline': 'Acceso empresa',
    'auth.companySigninTitle': 'Entrar al panel',
    'auth.companySignupOverline': 'Registro empresa',
    'auth.companySignupTitle': 'Crear cuenta de empresa',
    'auth.companyTab': 'Empresa',
    'auth.companyToggleSignin': 'Ya tengo una cuenta de empresa',
    'auth.companyToggleSignup': 'Necesito crear una cuenta de empresa',
    'auth.demoNote': 'Inicia sesion con las credenciales de empresa o registra una nueva empresa para activar Vygo.',
    'auth.driverButton': 'Entrar como conductor',
    'auth.driverMissing': 'Introduce usuario de conductor y contraseña.',
    'auth.driverOverline': 'Acceso conductor',
    'auth.driverTab': 'Conductor',
    'auth.driverTitle': 'Entrar con usuario',
    'auth.driverUsernameLabel': 'Usuario conductor',
    'auth.driverUsernamePlaceholder': 'Ej. mario.rossi',
    'auth.emailPasswordMissing': 'Introduce email de empresa y contraseña.',
    'auth.heroText': 'El sistema operativo para empresas de transporte: personas, vehiculos, documentos, chat, vencimientos y costes en un solo lugar.',
    'auth.heroTitle': 'Login de empresa y conductor, todo en el mismo sitio.',
    'auth.passwordLabel': 'Contraseña',
    'auth.passwordPlaceholder': 'Contraseña',
    'auth.buyCompany': 'Comprar y activar empresa',
    'auth.staffAccess': 'Acceso personal',
    'auth.proofDeadlines': 'Vencimientos controlados',
    'auth.proofDocuments': 'Documentos siempre disponibles',
    'auth.proofCosts': 'Costes de vehiculos mas claros',
    'auth.proofDriver': 'Area conductor',
    'auth.proofOperations': 'Operaciones trazadas',
    'auth.proofSecurity': 'Datos separados por empresa',
    'auth.registrationSent': 'Registro enviado. Revisa el email para confirmar la cuenta.',
    'auth.signinButton': 'Acceder',
    'auth.signupButton': 'Registrarse',
    'brand.tagline': 'Move. Manage. Succeed.',
    'driver.area': 'Area conductor',
    'driver.emptyMessage': 'Prueba de nuevo en unos segundos o inicia sesion otra vez.',
    'driver.emptyTitle': 'Area conductor no disponible',
    'driver.loadingDetail': 'Recuperando datos del perfil.',
    'driver.loadingTitle': 'Cargando area conductor',
    'driver.noteBody': 'Aqui veras avisos personales, documentos cargados, checks matinales y averias vinculados a tu perfil.',
    'driver.noteOverline': 'Notificaciones',
    'driver.noteTitle': 'Aqui llegan los avisos en app',
    'homeCommand.aria': 'Comandos rapidos empresa',
    'homeCommand.chatDetail': 'Chats directos, grupos y departamentos',
    'homeCommand.chatLabel': 'Chat',
    'homeCommand.costsDetail': 'Averias, reparaciones e informes',
    'homeCommand.costsLabel': 'Centro costes',
    'homeCommand.deadlinesDetail': 'Renovaciones, documentos y avisos',
    'homeCommand.deadlinesLabel': 'Vencimientos',
    'homeCommand.fleetDetail': 'Vehiculos, matriculas y semirremolques',
    'homeCommand.fleetLabel': 'Flota',
    'homeCommand.open': 'Abrir',
    'homeCommand.operationsDetail': 'Checks, averias y tareas pendientes',
    'homeCommand.operationsLabel': 'Registro operativo',
    'homeCommand.peopleDetail': 'Oficina, almacen y departamentos',
    'homeCommand.peopleLabel': 'Personas',
    'homeCommand.quickAddDetail': 'Nuevo dato de empresa',
    'homeCommand.quickAddLabel': 'Añadir',
    'homeCommand.settingsDetail': 'Logo, idioma, avisos y facturas',
    'homeCommand.settingsLabel': 'Ajustes',
    'homeCommand.subtitle': 'Las principales areas operativas siempre a mano.',
    'homeCommand.title': 'Comandos empresa',
    'hero.aria': 'Control de vencimientos',
    'hero.description': 'Una pantalla limpia para ver vencimientos, checks matinales y averias pendientes.',
    'hero.factDrivers': 'conductores activos',
    'hero.factNotifications': 'notificaciones abiertas',
    'hero.factVehicles': 'vehiculos en flota',
    'hero.newDeadline': 'Nuevo vencimiento',
    'hero.openBell': 'Abrir avisos',
    'hero.priorityAria': 'Prioridades de hoy',
    'hero.priorityCostDetail': '{count} reparaciones registradas este mes',
    'hero.priorityCostLabel': 'Costes mes',
    'hero.priorityCriticalDetail': 'checks con incidencias por abrir',
    'hero.priorityCriticalLabel': 'Checks criticos',
    'hero.priorityDeadlineDetail': '{count} criticos o vencidos',
    'hero.priorityDeadlineLabel': 'Vencimientos 30 dias',
    'hero.priorityFaultDetail': 'avisos aun abiertos',
    'hero.priorityFaultLabel': 'Averias abiertas',
    'language.label': 'Idioma',
    'language.short': 'Idioma',
    'nav.chat': 'Chat',
    'nav.dashboard': 'Panel',
    'nav.deadlines': 'Vencimientos',
    'nav.notifications': 'Avisos',
    'nav.records': 'Ficheros',
    'nav.reports': 'Informes',
    'nav.settings': 'Ajustes',
    'nav.support': 'Guia',
    'onboarding.body': 'Completa estos pasos para poner Vygo operativo sin confusion.',
    'onboarding.companyBody': 'Nombre empresa, sede y logo visibles en el panel.',
    'onboarding.companyTitle': 'Completar perfil empresa',
    'onboarding.completed': '{count}/{total} completados',
    'onboarding.deadlinesBody': 'Añade al menos un permiso, revision medica, inspeccion o seguro.',
    'onboarding.deadlinesTitle': 'Añadir vencimiento',
    'onboarding.done': 'Hecho',
    'onboarding.driversBody': 'Crea conductores, oficina o almacen con los datos correctos.',
    'onboarding.driversTitle': 'Añadir personas',
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
    'support.subtitle': 'FAQ, manual y ayuda guiada para usar Vygo sin confusion.',
    'support.title': 'Guia y materiales',
    'support.videos': 'Videos',
    'support.vision': 'Vision producto',
    'sync.addKeys': 'Configuracion en curso',
    'sync.connected': 'Servidor conectado',
    'sync.demo': 'Modo sin conexion',
    'topbar.searchPlaceholder': 'Buscar permiso, matricula, conductor...',
    'topbar.searchSr': 'Buscar vencimientos',
  },
  fr: {
    'auth.companyEmailLabel': 'Email entreprise',
    'auth.companyEmailPlaceholder': 'entreprise@exemple.fr',
    'auth.companyNameLabel': 'Nom transporteur / Raison sociale',
    'auth.companyNameMissing': 'Saisis le nom du transporteur ou la raison sociale.',
    'auth.companyNamePlaceholder': 'Ex. Votre entreprise SARL',
    'auth.companySigninOverline': 'Acces entreprise',
    'auth.companySigninTitle': 'Entrer dans le tableau',
    'auth.companySignupOverline': 'Inscription entreprise',
    'auth.companySignupTitle': 'Creer un compte entreprise',
    'auth.companyTab': 'Entreprise',
    'auth.companyToggleSignin': 'J ai deja un compte entreprise',
    'auth.companyToggleSignup': 'Je dois creer un compte entreprise',
    'auth.demoNote': 'Connectez-vous avec vos identifiants entreprise ou inscrivez une nouvelle entreprise pour activer Vygo.',
    'auth.driverButton': 'Entrer comme chauffeur',
    'auth.driverMissing': 'Saisis le nom utilisateur chauffeur et le mot de passe.',
    'auth.driverOverline': 'Acces chauffeur',
    'auth.driverTab': 'Chauffeur',
    'auth.driverTitle': 'Entrer avec nom utilisateur',
    'auth.driverUsernameLabel': 'Utilisateur chauffeur',
    'auth.driverUsernamePlaceholder': 'Ex. mario.rossi',
    'auth.emailPasswordMissing': 'Saisis email entreprise et mot de passe.',
    'auth.heroText': 'Le systeme operationnel des entreprises de transport: personnes, vehicules, documents, chat, echeances et couts dans un seul espace.',
    'auth.heroTitle': 'Connexion entreprise et chauffeur, tout au meme endroit.',
    'auth.passwordLabel': 'Mot de passe',
    'auth.passwordPlaceholder': 'Mot de passe',
    'auth.buyCompany': 'Acheter et activer entreprise',
    'auth.staffAccess': 'Acces personnel',
    'auth.proofDeadlines': 'Echeances sous controle',
    'auth.proofDocuments': 'Documents toujours disponibles',
    'auth.proofCosts': 'Couts vehicules plus clairs',
    'auth.proofDriver': 'Espace chauffeur',
    'auth.proofOperations': 'Operations tracees',
    'auth.proofSecurity': 'Donnees separees par entreprise',
    'auth.registrationSent': 'Inscription envoyee. Controle ton email pour confirmer le compte.',
    'auth.signinButton': 'Se connecter',
    'auth.signupButton': 'S inscrire',
    'brand.tagline': 'Move. Manage. Succeed.',
    'driver.area': 'Espace chauffeur',
    'driver.emptyMessage': 'Reessaie dans quelques secondes ou reconnecte-toi.',
    'driver.emptyTitle': 'Espace chauffeur indisponible',
    'driver.loadingDetail': 'Recuperation des donnees du profil.',
    'driver.loadingTitle': 'Chargement espace chauffeur',
    'driver.noteBody': 'Vous verrez ici vos alertes personnelles, documents charges, checks du matin et signalements de panne lies a votre profil.',
    'driver.noteOverline': 'Notifications',
    'driver.noteTitle': 'Les alertes app arrivent ici',
    'homeCommand.aria': 'Commandes rapides entreprise',
    'homeCommand.chatDetail': 'Chats directs, groupes et services',
    'homeCommand.chatLabel': 'Chat',
    'homeCommand.costsDetail': 'Pannes, reparations et rapports',
    'homeCommand.costsLabel': 'Centre couts',
    'homeCommand.deadlinesDetail': 'Renouvellements, documents et relances',
    'homeCommand.deadlinesLabel': 'Echeances',
    'homeCommand.fleetDetail': 'Vehicules, plaques et semi-remorques',
    'homeCommand.fleetLabel': 'Flotte',
    'homeCommand.open': 'Ouvrir',
    'homeCommand.operationsDetail': 'Checks, pannes et actions a traiter',
    'homeCommand.operationsLabel': 'Registre operationnel',
    'homeCommand.peopleDetail': 'Bureau, entrepot et services',
    'homeCommand.peopleLabel': 'Personnes',
    'homeCommand.quickAddDetail': 'Nouvelle donnee entreprise',
    'homeCommand.quickAddLabel': 'Ajouter',
    'homeCommand.settingsDetail': 'Logo, langue, alertes et factures',
    'homeCommand.settingsLabel': 'Reglages',
    'homeCommand.subtitle': 'Les principales zones operationnelles toujours a portee de main.',
    'homeCommand.title': 'Commandes entreprise',
    'hero.aria': 'Controle des echeances',
    'hero.description': 'Un ecran clair pour voir tout de suite echeances, checks du matin et pannes a gerer.',
    'hero.factDrivers': 'chauffeurs actifs',
    'hero.factNotifications': 'notifications ouvertes',
    'hero.factVehicles': 'vehicules en flotte',
    'hero.newDeadline': 'Nouvelle echeance',
    'hero.openBell': 'Ouvrir alertes',
    'hero.priorityAria': 'Priorites du jour',
    'hero.priorityCostDetail': '{count} reparations enregistrees ce mois',
    'hero.priorityCostLabel': 'Couts mois',
    'hero.priorityCriticalDetail': 'checks avec anomalies a ouvrir',
    'hero.priorityCriticalLabel': 'Checks critiques',
    'hero.priorityDeadlineDetail': '{count} critiques ou expirees',
    'hero.priorityDeadlineLabel': 'Echeances 30 jours',
    'hero.priorityFaultDetail': 'signalements encore ouverts',
    'hero.priorityFaultLabel': 'Pannes ouvertes',
    'language.label': 'Langue',
    'language.short': 'Langue',
    'nav.chat': 'Chat',
    'nav.dashboard': 'Tableau',
    'nav.deadlines': 'Echeances',
    'nav.notifications': 'Alertes',
    'nav.records': 'Fiches',
    'nav.reports': 'Rapports',
    'nav.settings': 'Reglages',
    'nav.support': 'Guide',
    'onboarding.body': 'Complete ces etapes pour rendre Vygo operationnel sans confusion.',
    'onboarding.companyBody': 'Nom entreprise, siege et logo visibles dans le tableau.',
    'onboarding.companyTitle': 'Completer profil entreprise',
    'onboarding.completed': '{count}/{total} termines',
    'onboarding.deadlinesBody': 'Ajoute au moins un permis, visite medicale, controle ou assurance.',
    'onboarding.deadlinesTitle': 'Ajouter echeance',
    'onboarding.done': 'Fait',
    'onboarding.driversBody': 'Cree chauffeurs, bureau ou entrepot avec les bonnes donnees.',
    'onboarding.driversTitle': 'Ajouter personnes',
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
    'support.subtitle': 'FAQ, manuel et assistance guidee pour utiliser Vygo sans confusion.',
    'support.title': 'Guide et materiels',
    'support.videos': 'Videos',
    'support.vision': 'Vision produit',
    'sync.addKeys': 'Configuration en cours',
    'sync.connected': 'Serveur connecte',
    'sync.demo': 'Mode hors ligne',
    'topbar.searchPlaceholder': 'Chercher permis, plaque, chauffeur...',
    'topbar.searchSr': 'Chercher echeances',
  },
  de: {
    'auth.companyEmailLabel': 'Firmen-E-Mail',
    'auth.companyEmailPlaceholder': 'firma@beispiel.de',
    'auth.companyNameLabel': 'Transportunternehmen / Firmenname',
    'auth.companyNameMissing': 'Firmennamen oder rechtlichen Namen eingeben.',
    'auth.companyNamePlaceholder': 'z. B. Ihre Firma GmbH',
    'auth.companySigninOverline': 'Firmenzugang',
    'auth.companySigninTitle': 'Dashboard offnen',
    'auth.companySignupOverline': 'Firma registrieren',
    'auth.companySignupTitle': 'Firmenkonto erstellen',
    'auth.companyTab': 'Firma',
    'auth.companyToggleSignin': 'Ich habe bereits ein Firmenkonto',
    'auth.companyToggleSignup': 'Ich muss ein Firmenkonto erstellen',
    'auth.demoNote': 'Melden Sie sich mit den Firmendaten an oder registrieren Sie ein neues Unternehmen, um Vygo zu aktivieren.',
    'auth.driverButton': 'Als Fahrer offnen',
    'auth.driverMissing': 'Fahrer-Benutzername und Passwort eingeben.',
    'auth.driverOverline': 'Fahrerzugang',
    'auth.driverTab': 'Fahrer',
    'auth.driverTitle': 'Mit Benutzername offnen',
    'auth.driverUsernameLabel': 'Fahrer-Benutzername',
    'auth.driverUsernamePlaceholder': 'z. B. mario.rossi',
    'auth.emailPasswordMissing': 'Firmen-E-Mail und Passwort eingeben.',
    'auth.heroText': 'Das Betriebssystem fur Transportunternehmen: Personen, Fahrzeuge, Dokumente, Chat, Fristen und Kosten an einem Ort.',
    'auth.heroTitle': 'Login fur Firma und Fahrer, alles an einem Ort.',
    'auth.passwordLabel': 'Passwort',
    'auth.passwordPlaceholder': 'Passwort',
    'auth.buyCompany': 'Firma kaufen und aktivieren',
    'auth.staffAccess': 'Personalzugang',
    'auth.proofDeadlines': 'Fristen unter Kontrolle',
    'auth.proofDocuments': 'Dokumente immer verfugbar',
    'auth.proofCosts': 'Klarere Fahrzeugkosten',
    'auth.proofDriver': 'Fahrerbereich',
    'auth.proofOperations': 'Vorgange verfolgt',
    'auth.proofSecurity': 'Firmendaten getrennt',
    'auth.registrationSent': 'Registrierung gesendet. E-Mail bestatigen, um das Konto zu aktivieren.',
    'auth.signinButton': 'Einloggen',
    'auth.signupButton': 'Registrieren',
    'brand.tagline': 'Move. Manage. Succeed.',
    'driver.area': 'Fahrerbereich',
    'driver.emptyMessage': 'In einigen Sekunden erneut versuchen oder neu anmelden.',
    'driver.emptyTitle': 'Fahrerbereich nicht verfugbar',
    'driver.loadingDetail': 'Profildaten werden geladen.',
    'driver.loadingTitle': 'Fahrerbereich wird geladen',
    'driver.noteBody': 'Hier sehen Sie personliche Hinweise, hochgeladene Dokumente, Morgenchecks und Schadenmeldungen zu Ihrem Profil.',
    'driver.noteOverline': 'Benachrichtigungen',
    'driver.noteTitle': 'App-Hinweise kommen hier an',
    'homeCommand.aria': 'Schnellbefehle Firma',
    'homeCommand.chatDetail': 'Direktchats, Gruppen und Abteilungen',
    'homeCommand.chatLabel': 'Chat',
    'homeCommand.costsDetail': 'Schaden, Reparaturen und Berichte',
    'homeCommand.costsLabel': 'Kostenstelle',
    'homeCommand.deadlinesDetail': 'Verlangerungen, Dokumente und Erinnerungen',
    'homeCommand.deadlinesLabel': 'Fristen',
    'homeCommand.fleetDetail': 'Fahrzeuge, Kennzeichen und Auflieger',
    'homeCommand.fleetLabel': 'Flotte',
    'homeCommand.open': 'Offnen',
    'homeCommand.operationsDetail': 'Checks, Schaden und offene Aufgaben',
    'homeCommand.operationsLabel': 'Betriebsregister',
    'homeCommand.peopleDetail': 'Buro, Lager und Abteilungen',
    'homeCommand.peopleLabel': 'Personen',
    'homeCommand.quickAddDetail': 'Neue Firmendaten',
    'homeCommand.quickAddLabel': 'Hinzufugen',
    'homeCommand.settingsDetail': 'Logo, Sprache, Hinweise und Rechnungen',
    'homeCommand.settingsLabel': 'Einstellungen',
    'homeCommand.subtitle': 'Die wichtigsten Arbeitsbereiche immer griffbereit.',
    'homeCommand.title': 'Firmenbefehle',
    'hero.aria': 'Fristenkontrolle',
    'hero.description': 'Eine klare Ansicht fur Fristen, Morgenchecks und offene Schaden.',
    'hero.factDrivers': 'aktive Fahrer',
    'hero.factNotifications': 'offene Hinweise',
    'hero.factVehicles': 'Fahrzeuge',
    'hero.newDeadline': 'Neue Frist',
    'hero.openBell': 'Hinweise offnen',
    'hero.priorityAria': 'Prioritaten heute',
    'hero.priorityCostDetail': '{count} Reparaturen diesen Monat',
    'hero.priorityCostLabel': 'Monatskosten',
    'hero.priorityCriticalDetail': 'Checks mit Problemen offnen',
    'hero.priorityCriticalLabel': 'Kritische Checks',
    'hero.priorityDeadlineDetail': '{count} kritisch oder abgelaufen',
    'hero.priorityDeadlineLabel': 'Fristen 30 Tage',
    'hero.priorityFaultDetail': 'Meldungen noch offen',
    'hero.priorityFaultLabel': 'Offene Schaden',
    'language.label': 'Sprache',
    'language.short': 'Sprache',
    'nav.chat': 'Chat',
    'nav.dashboard': 'Dashboard',
    'nav.deadlines': 'Fristen',
    'nav.notifications': 'Hinweise',
    'nav.records': 'Stammdaten',
    'nav.reports': 'Berichte',
    'nav.settings': 'Einstellungen',
    'nav.support': 'Hilfe',
    'onboarding.body': 'Schliesse diese Schritte ab, damit Vygo sauber einsatzbereit ist.',
    'onboarding.companyBody': 'Firmenname, Sitz und Logo sichtbar im Dashboard.',
    'onboarding.companyTitle': 'Firmenprofil vervollstandigen',
    'onboarding.completed': '{count}/{total} erledigt',
    'onboarding.deadlinesBody': 'Mindestens eine Lizenz, Untersuchung, Prufung oder Versicherung eintragen.',
    'onboarding.deadlinesTitle': 'Frist hinzufugen',
    'onboarding.done': 'Erledigt',
    'onboarding.driversBody': 'Fahrer, Buro oder Lager mit korrekten Daten erstellen.',
    'onboarding.driversTitle': 'Personen hinzufugen',
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
    'support.subtitle': 'FAQ, Handbuch und gefuhrte Hilfe, damit Vygo klar nutzbar bleibt.',
    'support.title': 'Hilfe und Materialien',
    'support.videos': 'Videos',
    'support.vision': 'Produktvision',
    'sync.addKeys': 'Konfiguration lauft',
    'sync.connected': 'Server verbunden',
    'sync.demo': 'Offline-Modus',
    'topbar.searchPlaceholder': 'Fuhrerschein, Kennzeichen, Fahrer suchen...',
    'topbar.searchSr': 'Fristen suchen',
  },
}

const publicLandingCopy = {
  it: {
    nav: { product: 'Prodotto', pricing: 'Prezzi', faq: 'FAQ' },
    problem: {
      overline: 'Perche nasce Vygo',
      title: 'Il caos operativo costa piu del canone.',
      body: 'Molte aziende di trasporto lavorano ancora tra WhatsApp, Excel, telefonate, email e cartelle sparse. Il risultato e tempo perso, documenti dimenticati, scadenze scoperte e poca visibilita sui costi.',
      cards: [
        { title: 'Messaggi dispersi', body: 'Le decisioni restano nelle chat personali e diventano difficili da ritrovare.' },
        { title: 'Scadenze fragili', body: 'Patenti, revisioni, assicurazioni e visite mediche si ricordano spesso troppo tardi.' },
        { title: 'Documenti sparsi', body: 'Autisti, mezzi e ufficio non hanno sempre lo stesso archivio aggiornato.' },
        { title: 'Costi invisibili', body: 'Guasti, multe e manutenzioni si vedono davvero solo quando ormai hanno pesato sul bilancio.' },
      ],
    },
    value: {
      overline: 'Vygo',
      title: 'Un sistema operativo per tutta l azienda di trasporto.',
      body: 'Vygo unisce dashboard, app mobile, chat, documenti, check, guasti, scadenze e centro costi. Ogni reparto lavora nello stesso ambiente, con storico e notifiche.',
      cards: [
        { title: 'Scadenze e documenti', body: 'Patenti, CQC, visite mediche, libretti, revisioni, assicurazioni e file sempre collegati al soggetto giusto.' },
        { title: 'Chat aziendale', body: 'Conversazioni singole e gruppi per autisti, ufficio, magazzino e direzione, separate dal caos personale.' },
        { title: 'Check e guasti', body: 'L autista segnala, l azienda vede, lavora, archivia e mantiene uno storico consultabile.' },
        { title: 'Centro costi e report', body: 'Spese, multe, manutenzioni e riparazioni filtrabili per periodo, targa, persona o attrezzatura.' },
      ],
    },
    setup: {
      overline: 'Avviamento',
      title: 'Non compri solo un accesso: parti ordinato.',
      body: 'Con lo start-up kit configuriamo azienda, persone, mezzi, prime scadenze e formazione iniziale. L obiettivo e far usare Vygo davvero, non lasciarlo vuoto dopo il login.',
      steps: [
        { title: '1. Mappatura', body: 'Inseriamo struttura azienda, reparti, mezzi, strumenti e persone.' },
        { title: '2. Documenti', body: 'Carichiamo le prime scadenze e impostiamo notifiche operative.' },
        { title: '3. Prima settimana', body: 'Accompagniamo azienda e utenti fino al primo uso reale.' },
      ],
    },
    pricing: {
      overline: 'Piani',
      title: 'Prezzi pensati per il valore reale che portiamo.',
      body: 'Il piano cresce con mezzi, strumenti e account. Il canone non compra solo una app: compra ordine operativo, notifiche, storico, documenti, report, supporto e meno tempo perso ogni settimana.',
      plans: [
        { cta: 'Attiva Start 5', description: 'Vygo completo per piccole flotte: nessuna funzione tagliata, solo limiti piu piccoli su mezzi, account e spazio file.', featured: false, items: ['Fino a 5 mezzi', 'Fino a 3 strumenti o muletti', 'Fino a 10 account utenti', 'Tutte le funzioni Vygo incluse', '10 GB file inclusi'], name: 'Start 5', price: '300 euro/mese + IVA' },
        { cta: 'Attiva Fleet 10', description: 'Stesso Vygo completo, piu capacita operativa per aziende che crescono con mezzi, persone e documenti.', featured: true, items: ['Tutte le funzioni Vygo', 'Fino a 10 mezzi', 'Fino a 5 strumenti o muletti', 'Fino a 20 account utenti', '20 GB inclusi'], name: 'Fleet 10', price: '450 euro/mese + IVA' },
        { cta: 'Richiedi attivazione', description: 'Stesse funzioni complete, piu mezzi, piu account e piu spazio per aziende strutturate.', featured: false, items: ['Tutte le funzioni Vygo', '20, 30 o 50 mezzi', 'Strumenti e muletti inclusi', 'Account proporzionati alla flotta', 'Storage da 30 GB in su'], name: 'Fleet 20+', price: 'da 699 euro/mese + IVA' },
      ],
      extras: [
        { title: 'Funzioni incluse', body: 'Tutti i piani hanno chat, gruppi, guasti, check, documenti, scadenze, centro costi e report.' },
        { title: 'Avviamento', body: 'Start-up kit una tantum per configurazione, anagrafiche iniziali, scadenze e formazione.' },
        { title: 'Storage extra', body: '20 GB 49 euro/mese + IVA, 50 GB 99 euro/mese + IVA, 100 GB 179 euro/mese + IVA.' },
        { title: 'Nessun modulo nascosto', body: 'Il prezzo cresce con dimensione flotta, persone e spazio, non con funzioni tagliate.' },
      ],
    },
    faq: {
      overline: 'FAQ',
      title: 'Domande veloci prima di mettere ordine.',
      items: [
        { title: 'Cosa cambia davvero rispetto a oggi?', body: 'Invece di cercare informazioni tra WhatsApp, fogli, telefono e cartelle, apri Vygo e vedi cosa scade, cosa manca, chi deve agire e quali mezzi hanno problemi.' },
        { title: 'L autista deve scaricare un app?', body: 'Si. Vygo e previsto come app iOS/Android per autisti, magazzino e azienda. L azienda puo lavorare anche da browser desktop.' },
        { title: 'Arrivano notifiche sul telefono?', body: 'Si, dopo l attivazione sul dispositivo. Chat, guasti e check critici possono avvisare anche con app chiusa.' },
        { title: 'Posso usarlo dall ufficio e dal telefono?', body: 'Si. L ufficio lavora da PC, mentre titolare, autisti e personale possono usare l app su telefono.' },
        { title: 'I costi vengono tracciati?', body: 'Si. Puoi registrare guasti, manutenzioni, multe e spese libere, poi filtrare per periodo, mezzo, persona o attrezzatura.' },
        { title: 'Perche non basta WhatsApp?', body: 'WhatsApp serve per parlare, non per gestire. Vygo collega messaggi, documenti, guasti, scadenze, notifiche e storico operativo.' },
      ],
    },
  },
  en: {
    nav: { product: 'Product', pricing: 'Pricing', faq: 'FAQ' },
    problem: {
      overline: 'Why Vygo',
      title: 'Operational chaos costs more than the subscription.',
      body: 'Many transport companies still run work through WhatsApp, spreadsheets, calls, emails and scattered folders. That means wasted time, missing documents, forgotten deadlines and poor cost visibility.',
      cards: [
        { title: 'Scattered messages', body: 'Decisions stay inside personal chats and become hard to find later.' },
        { title: 'Fragile deadlines', body: 'Licences, inspections, insurance and medical checks are often remembered too late.' },
        { title: 'Fragmented documents', body: 'Drivers, vehicles and office teams do not always share the same updated archive.' },
        { title: 'Hidden costs', body: 'Faults, fines and maintenance become visible only after they hit the accounts.' },
      ],
    },
    value: {
      overline: 'Vygo',
      title: 'An operating system for the whole transport company.',
      body: 'Vygo brings together dashboard, mobile app, chat, documents, checks, faults, deadlines and cost center. Every team works in one shared environment with history and alerts.',
      cards: [
        { title: 'Deadlines and documents', body: 'Licences, medical checks, vehicle documents, inspections, insurance and files connected to the right record.' },
        { title: 'Company chat', body: 'Direct and group chats for drivers, office, warehouse and management, away from personal noise.' },
        { title: 'Checks and faults', body: 'The worker reports, the company sees, handles, archives and keeps a searchable history.' },
        { title: 'Costs and reports', body: 'Expenses, fines, maintenance and repairs filtered by period, plate, person or equipment.' },
      ],
    },
    setup: {
      overline: 'Onboarding',
      title: 'You do not just buy access: you start organized.',
      body: 'With the start-up kit we configure company, people, vehicles, first deadlines and initial training. The goal is real adoption, not an empty login.',
      steps: [
        { title: '1. Mapping', body: 'We enter company structure, departments, vehicles, equipment and people.' },
        { title: '2. Documents', body: 'We load first deadlines and set operational alerts.' },
        { title: '3. First week', body: 'We support company and users until the first real workflows run.' },
      ],
    },
    pricing: {
      overline: 'Plans',
      title: 'Pricing built around the real value delivered.',
      body: 'The plan grows with vehicles, equipment and accounts. The subscription buys operational order, alerts, history, documents, reports, support and fewer wasted hours.',
      plans: [
        { cta: 'Activate Start 5', description: 'Full Vygo for small fleets: all functions included, smaller limits on vehicles, users and storage.', featured: false, items: ['Up to 5 vehicles', 'Up to 3 tools or forklifts', 'Up to 10 user accounts', 'All Vygo functions included', '10 GB files included'], name: 'Start 5', price: '300 euro/month + VAT' },
        { cta: 'Activate Fleet 10', description: 'Full Vygo with more operating capacity for growing companies.', featured: true, items: ['All Vygo functions', 'Up to 10 vehicles', 'Up to 5 tools or forklifts', 'Up to 20 user accounts', '20 GB included'], name: 'Fleet 10', price: '450 euro/month + VAT' },
        { cta: 'Request activation', description: 'Full functions, more vehicles, more accounts and more storage for structured companies.', featured: false, items: ['All Vygo functions', '20, 30 or 50 vehicles', 'Tools and forklifts included', 'Accounts sized to fleet', 'Storage from 30 GB'], name: 'Fleet 20+', price: 'from 699 euro/month + VAT' },
      ],
      extras: [
        { title: 'Functions included', body: 'Every plan includes chat, groups, faults, checks, documents, deadlines, cost center and reports.' },
        { title: 'Start-up kit', body: 'One-time setup for company records, first deadlines and training.' },
        { title: 'Extra storage', body: '20 GB 49 euro/month + VAT, 50 GB 99 euro/month + VAT, 100 GB 179 euro/month + VAT.' },
        { title: 'No hidden modules', body: 'Price grows with company size and storage, not by cutting core features.' },
      ],
    },
    faq: {
      overline: 'FAQ',
      title: 'Quick questions before putting order in place.',
      items: [
        { title: 'What really changes?', body: 'Instead of searching across WhatsApp, sheets, calls and folders, you open Vygo and see deadlines, missing items, actions and vehicle issues.' },
        { title: 'Do workers install an app?', body: 'Yes. Vygo is built as an iOS/Android app for drivers, warehouse and company. The office can also work from desktop browser.' },
        { title: 'Do phone notifications work?', body: 'Yes, after enabling them on the device. Chat, faults and critical checks can alert even when the app is closed.' },
        { title: 'Can I use it from office and phone?', body: 'Yes. Office works from PC, owners and staff can use the phone app.' },
        { title: 'Are costs tracked?', body: 'Yes. Faults, maintenance, fines and free expenses can be tracked and filtered by period, vehicle, person or equipment.' },
        { title: 'Why not just WhatsApp?', body: 'WhatsApp is for talking, not for managing. Vygo connects messages, documents, faults, deadlines, alerts and operational history.' },
      ],
    },
  },
  es: {
    nav: { product: 'Producto', pricing: 'Precios', faq: 'FAQ' },
    problem: {
      overline: 'Por que Vygo',
      title: 'El caos operativo cuesta mas que la suscripcion.',
      body: 'Muchas empresas de transporte trabajan entre WhatsApp, Excel, llamadas, emails y carpetas sueltas. Eso provoca tiempo perdido, documentos olvidados, vencimientos y poca visibilidad de costes.',
      cards: [
        { title: 'Mensajes dispersos', body: 'Las decisiones quedan en chats personales y luego son dificiles de encontrar.' },
        { title: 'Vencimientos fragiles', body: 'Permisos, revisiones, seguros y visitas medicas se recuerdan demasiado tarde.' },
        { title: 'Documentos sueltos', body: 'Conductores, vehiculos y oficina no siempre comparten el mismo archivo actualizado.' },
        { title: 'Costes ocultos', body: 'Averias, multas y mantenimiento se ven tarde, cuando ya pesan en la cuenta.' },
      ],
    },
    value: {
      overline: 'Vygo',
      title: 'Un sistema operativo para toda la empresa de transporte.',
      body: 'Vygo une panel, app movil, chat, documentos, checks, averias, vencimientos y centro de costes en un solo entorno.',
      cards: [
        { title: 'Vencimientos y documentos', body: 'Permisos, visitas medicas, documentos de vehiculo, revisiones, seguros y archivos conectados al registro correcto.' },
        { title: 'Chat empresarial', body: 'Chats individuales y grupos para conductores, oficina, almacen y direccion.' },
        { title: 'Checks y averias', body: 'El usuario informa, la empresa ve, gestiona, archiva y conserva el historico.' },
        { title: 'Costes e informes', body: 'Gastos, multas, mantenimiento y reparaciones filtrables por periodo, matricula, persona o equipo.' },
      ],
    },
    setup: {
      overline: 'Puesta en marcha',
      title: 'No compras solo acceso: empiezas ordenado.',
      body: 'Con el start-up kit configuramos empresa, personas, vehiculos, primeros vencimientos y formacion inicial.',
      steps: [
        { title: '1. Mapeo', body: 'Cargamos estructura, departamentos, vehiculos, equipos y personas.' },
        { title: '2. Documentos', body: 'Cargamos primeros vencimientos y avisos operativos.' },
        { title: '3. Primera semana', body: 'Acompanamos al equipo hasta el primer uso real.' },
      ],
    },
    pricing: {
      overline: 'Planes',
      title: 'Precios pensados para el valor real que aportamos.',
      body: 'El plan crece con vehiculos, herramientas y usuarios. La suscripcion compra orden operativo, avisos, historico, documentos, informes y soporte.',
      plans: [
        { cta: 'Activar Start 5', description: 'Vygo completo para flotas pequenas, con limites mas pequenos.', featured: false, items: ['Hasta 5 vehiculos', 'Hasta 3 herramientas o carretillas', 'Hasta 10 usuarios', 'Todas las funciones incluidas', '10 GB incluidos'], name: 'Start 5', price: '300 euro/mes + IVA' },
        { cta: 'Activar Fleet 10', description: 'Vygo completo con mas capacidad para empresas en crecimiento.', featured: true, items: ['Todas las funciones', 'Hasta 10 vehiculos', 'Hasta 5 herramientas o carretillas', 'Hasta 20 usuarios', '20 GB incluidos'], name: 'Fleet 10', price: '450 euro/mes + IVA' },
        { cta: 'Solicitar activacion', description: 'Funciones completas, mas vehiculos, mas usuarios y mas espacio.', featured: false, items: ['Todas las funciones', '20, 30 o 50 vehiculos', 'Herramientas incluidas', 'Usuarios segun flota', 'Desde 30 GB'], name: 'Fleet 20+', price: 'desde 699 euro/mes + IVA' },
      ],
      extras: [
        { title: 'Funciones incluidas', body: 'Todos los planes incluyen chat, grupos, averias, checks, documentos, vencimientos, costes e informes.' },
        { title: 'Start-up kit', body: 'Configuracion inicial, datos, vencimientos y formacion.' },
        { title: 'Storage extra', body: '20 GB 49 euro/mes + IVA, 50 GB 99 euro/mes + IVA, 100 GB 179 euro/mes + IVA.' },
        { title: 'Sin modulos ocultos', body: 'El precio crece con tamano y espacio, no recortando funciones.' },
      ],
    },
    faq: {
      overline: 'FAQ',
      title: 'Preguntas rapidas antes de ordenar la empresa.',
      items: [
        { title: 'Que cambia realmente?', body: 'Abres Vygo y ves vencimientos, faltas, tareas y problemas de vehiculos sin buscar entre chats y carpetas.' },
        { title: 'Los usuarios instalan una app?', body: 'Si. Vygo esta previsto como app iOS/Android y tambien panel web para oficina.' },
        { title: 'Llegan avisos al telefono?', body: 'Si, tras activar notificaciones en el dispositivo.' },
        { title: 'Puedo usarlo en PC y telefono?', body: 'Si, oficina desde PC y personal desde app.' },
        { title: 'Se controlan los costes?', body: 'Si, averias, mantenimiento, multas y gastos libres se filtran por periodo, vehiculo, persona o equipo.' },
        { title: 'Por que no basta WhatsApp?', body: 'WhatsApp habla. Vygo gestiona y deja historico operativo.' },
      ],
    },
  },
  fr: {
    nav: { product: 'Produit', pricing: 'Prix', faq: 'FAQ' },
    problem: {
      overline: 'Pourquoi Vygo',
      title: 'Le chaos operationnel coute plus que l abonnement.',
      body: 'Beaucoup de transporteurs travaillent encore entre WhatsApp, Excel, appels, emails et dossiers disperses. Cela cree pertes de temps, documents oublies, echeances ratees et couts peu visibles.',
      cards: [
        { title: 'Messages disperses', body: 'Les decisions restent dans les chats personnels et deviennent difficiles a retrouver.' },
        { title: 'Echeances fragiles', body: 'Permis, controles, assurances et visites medicales sont souvent vus trop tard.' },
        { title: 'Documents eparpilles', body: 'Chauffeurs, vehicules et bureau n ont pas toujours la meme archive a jour.' },
        { title: 'Couts invisibles', body: 'Pannes, amendes et entretiens apparaissent quand ils ont deja pese.' },
      ],
    },
    value: {
      overline: 'Vygo',
      title: 'Un systeme operationnel pour toute l entreprise de transport.',
      body: 'Vygo relie tableau de bord, app mobile, chat, documents, checks, pannes, echeances et centre de couts.',
      cards: [
        { title: 'Echeances et documents', body: 'Permis, visites, documents vehicule, controles, assurances et fichiers lies au bon dossier.' },
        { title: 'Chat entreprise', body: 'Chats directs et groupes pour chauffeurs, bureau, entrepot et direction.' },
        { title: 'Checks et pannes', body: 'Le terrain signale, l entreprise traite, archive et conserve l historique.' },
        { title: 'Couts et rapports', body: 'Depenses, amendes, entretiens et reparations filtrables par periode, plaque, personne ou equipement.' },
      ],
    },
    setup: {
      overline: 'Demarrage',
      title: 'Vous n achetez pas seulement un acces: vous demarrez organise.',
      body: 'Avec le start-up kit, nous configurons entreprise, personnes, vehicules, premieres echeances et formation.',
      steps: [
        { title: '1. Cartographie', body: 'Structure, services, vehicules, equipements et personnes.' },
        { title: '2. Documents', body: 'Premieres echeances et alertes operationnelles.' },
        { title: '3. Premiere semaine', body: 'Accompagnement jusqu aux premiers usages reels.' },
      ],
    },
    pricing: {
      overline: 'Plans',
      title: 'Des prix alignes sur la valeur operationnelle.',
      body: 'Le plan grandit avec vehicules, outils et comptes. L abonnement apporte ordre, alertes, historique, documents, rapports et support.',
      plans: [
        { cta: 'Activer Start 5', description: 'Vygo complet pour petites flottes, avec limites plus petites.', featured: false, items: ['Jusqu a 5 vehicules', 'Jusqu a 3 outils ou chariots', 'Jusqu a 10 comptes', 'Toutes les fonctions incluses', '10 GB inclus'], name: 'Start 5', price: '300 euro/mois + TVA' },
        { cta: 'Activer Fleet 10', description: 'Vygo complet avec plus de capacite operationnelle.', featured: true, items: ['Toutes les fonctions', 'Jusqu a 10 vehicules', 'Jusqu a 5 outils ou chariots', 'Jusqu a 20 comptes', '20 GB inclus'], name: 'Fleet 10', price: '450 euro/mois + TVA' },
        { cta: 'Demander activation', description: 'Fonctions completes, plus de vehicules, comptes et stockage.', featured: false, items: ['Toutes les fonctions', '20, 30 ou 50 vehicules', 'Outils inclus', 'Comptes selon flotte', 'Stockage des 30 GB'], name: 'Fleet 20+', price: 'des 699 euro/mois + TVA' },
      ],
      extras: [
        { title: 'Fonctions incluses', body: 'Tous les plans incluent chat, groupes, pannes, checks, documents, echeances, couts et rapports.' },
        { title: 'Start-up kit', body: 'Configuration initiale, dossiers, echeances et formation.' },
        { title: 'Stockage extra', body: '20 GB 49 euro/mois + TVA, 50 GB 99 euro/mois + TVA, 100 GB 179 euro/mois + TVA.' },
        { title: 'Pas de modules caches', body: 'Le prix augmente avec taille et stockage, pas en retirant les fonctions.' },
      ],
    },
    faq: {
      overline: 'FAQ',
      title: 'Questions rapides avant de mettre de l ordre.',
      items: [
        { title: 'Qu est-ce qui change vraiment?', body: 'Vous voyez echeances, manques, actions et problemes vehicules sans chercher entre chats et dossiers.' },
        { title: 'Les utilisateurs installent une app?', body: 'Oui. Vygo est prevu comme app iOS/Android avec tableau web pour le bureau.' },
        { title: 'Les notifications arrivent?', body: 'Oui, apres activation sur le telephone.' },
        { title: 'PC et telephone?', body: 'Oui. Le bureau travaille sur PC, les equipes sur app.' },
        { title: 'Les couts sont suivis?', body: 'Oui, pannes, entretiens, amendes et depenses libres par periode, vehicule, personne ou equipement.' },
        { title: 'Pourquoi pas WhatsApp?', body: 'WhatsApp sert a parler. Vygo sert a gerer et garder l historique.' },
      ],
    },
  },
  de: {
    nav: { product: 'Produkt', pricing: 'Preise', faq: 'FAQ' },
    problem: {
      overline: 'Warum Vygo',
      title: 'Operatives Chaos kostet mehr als das Abo.',
      body: 'Viele Transportunternehmen arbeiten mit WhatsApp, Excel, Telefonaten, E-Mails und verstreuten Ordnern. Das kostet Zeit, Dokumente gehen unter, Fristen werden verpasst und Kosten bleiben unklar.',
      cards: [
        { title: 'Verstreute Nachrichten', body: 'Entscheidungen bleiben in privaten Chats und sind spater schwer zu finden.' },
        { title: 'Fragile Fristen', body: 'Lizenzen, Prufungen, Versicherungen und Untersuchungen werden oft zu spat gesehen.' },
        { title: 'Getrennte Dokumente', body: 'Fahrer, Fahrzeuge und Buro haben nicht immer dasselbe aktuelle Archiv.' },
        { title: 'Unsichtbare Kosten', body: 'Schaden, Strafen und Wartung werden oft erst sichtbar, wenn sie schon teuer waren.' },
      ],
    },
    value: {
      overline: 'Vygo',
      title: 'Ein Betriebssystem fur das ganze Transportunternehmen.',
      body: 'Vygo verbindet Dashboard, App, Chat, Dokumente, Checks, Schaden, Fristen und Kostenstelle in einem Arbeitsbereich.',
      cards: [
        { title: 'Fristen und Dokumente', body: 'Lizenzen, Untersuchungen, Fahrzeugdokumente, Prufungen, Versicherungen und Dateien am richtigen Datensatz.' },
        { title: 'Firmenchat', body: 'Direkte Chats und Gruppen fur Fahrer, Buro, Lager und Leitung.' },
        { title: 'Checks und Schaden', body: 'Meldung, Bearbeitung, Archiv und durchsuchbare Historie.' },
        { title: 'Kosten und Berichte', body: 'Ausgaben, Strafen, Wartung und Reparaturen nach Zeitraum, Kennzeichen, Person oder Gerat.' },
      ],
    },
    setup: {
      overline: 'Start',
      title: 'Nicht nur Zugang kaufen: organisiert starten.',
      body: 'Mit dem Start-up Kit richten wir Firma, Personen, Fahrzeuge, erste Fristen und Schulung ein.',
      steps: [
        { title: '1. Struktur', body: 'Firma, Abteilungen, Fahrzeuge, Gerate und Personen.' },
        { title: '2. Dokumente', body: 'Erste Fristen und operative Hinweise.' },
        { title: '3. Erste Woche', body: 'Begleitung bis zu echten Arbeitsablaufen.' },
      ],
    },
    pricing: {
      overline: 'Plane',
      title: 'Preise nach realem operativem Wert.',
      body: 'Der Plan wachst mit Fahrzeugen, Werkzeugen und Konten. Das Abo bringt Ordnung, Hinweise, Historie, Dokumente, Berichte und Support.',
      plans: [
        { cta: 'Start 5 aktivieren', description: 'Vollstandiges Vygo fur kleine Flotten mit kleineren Limits.', featured: false, items: ['Bis 5 Fahrzeuge', 'Bis 3 Gerate oder Stapler', 'Bis 10 Nutzerkonten', 'Alle Funktionen enthalten', '10 GB enthalten'], name: 'Start 5', price: '300 Euro/Monat + MwSt.' },
        { cta: 'Fleet 10 aktivieren', description: 'Vollstandiges Vygo mit mehr operativer Kapazitat.', featured: true, items: ['Alle Funktionen', 'Bis 10 Fahrzeuge', 'Bis 5 Gerate oder Stapler', 'Bis 20 Nutzerkonten', '20 GB enthalten'], name: 'Fleet 10', price: '450 Euro/Monat + MwSt.' },
        { cta: 'Aktivierung anfragen', description: 'Alle Funktionen, mehr Fahrzeuge, Konten und Speicher.', featured: false, items: ['Alle Funktionen', '20, 30 oder 50 Fahrzeuge', 'Gerate enthalten', 'Konten passend zur Flotte', 'Speicher ab 30 GB'], name: 'Fleet 20+', price: 'ab 699 Euro/Monat + MwSt.' },
      ],
      extras: [
        { title: 'Funktionen enthalten', body: 'Alle Plane enthalten Chat, Gruppen, Schaden, Checks, Dokumente, Fristen, Kosten und Berichte.' },
        { title: 'Start-up Kit', body: 'Einrichtung, Stammdaten, Fristen und Schulung.' },
        { title: 'Extra Speicher', body: '20 GB 49 Euro/Monat + MwSt., 50 GB 99 Euro/Monat + MwSt., 100 GB 179 Euro/Monat + MwSt.' },
        { title: 'Keine versteckten Module', body: 'Der Preis wachst mit Grosse und Speicher, nicht durch fehlende Kernfunktionen.' },
      ],
    },
    faq: {
      overline: 'FAQ',
      title: 'Kurze Fragen, bevor Ordnung entsteht.',
      items: [
        { title: 'Was andert sich wirklich?', body: 'Sie sehen Fristen, fehlende Punkte, Aufgaben und Fahrzeugprobleme ohne Suche in Chats und Ordnern.' },
        { title: 'Installieren Nutzer eine App?', body: 'Ja. Vygo ist als iOS/Android App mit Web-Dashboard fur das Buro gedacht.' },
        { title: 'Gibt es Telefonhinweise?', body: 'Ja, nach Aktivierung auf dem Gerat.' },
        { title: 'PC und Telefon?', body: 'Ja. Buro am PC, Teams per App.' },
        { title: 'Werden Kosten verfolgt?', body: 'Ja, Schaden, Wartung, Strafen und freie Ausgaben nach Zeitraum, Fahrzeug, Person oder Gerat.' },
        { title: 'Warum nicht WhatsApp?', body: 'WhatsApp spricht. Vygo verwaltet und behalt die Historie.' },
      ],
    },
  },
  ro: {
    nav: { product: 'Produs', pricing: 'Preturi', faq: 'FAQ' },
    problem: {
      overline: 'De ce Vygo',
      title: 'Haosul operational costa mai mult decat abonamentul.',
      body: 'Multe companii de transport lucreaza inca prin WhatsApp, Excel, apeluri, email si dosare separate. Se pierd timp, documente, termene si controlul costurilor.',
      cards: [
        { title: 'Mesaje imprastiate', body: 'Deciziile raman in chat-uri personale si se gasesc greu.' },
        { title: 'Termene fragile', body: 'Permise, revizii, asigurari si vizite medicale sunt vazute prea tarziu.' },
        { title: 'Documente separate', body: 'Soferii, vehiculele si biroul nu au mereu aceeasi arhiva actualizata.' },
        { title: 'Costuri ascunse', body: 'Defectiunile, amenzile si mentenanta apar cand deja au costat.' },
      ],
    },
    value: {
      overline: 'Vygo',
      title: 'Un sistem operational pentru toata compania de transport.',
      body: 'Vygo uneste dashboard, aplicatie mobila, chat, documente, verificari, defectiuni, termene si costuri.',
      cards: [
        { title: 'Termene si documente', body: 'Permise, vizite, documente vehicul, revizii, asigurari si fisiere legate corect.' },
        { title: 'Chat companie', body: 'Chat direct si grupuri pentru soferi, birou, depozit si conducere.' },
        { title: 'Verificari si defectiuni', body: 'Utilizatorul raporteaza, compania gestioneaza si pastreaza istoricul.' },
        { title: 'Costuri si rapoarte', body: 'Cheltuieli, amenzi, mentenanta si reparatii filtrate pe perioada, vehicul, persoana sau echipament.' },
      ],
    },
    setup: {
      overline: 'Pornire',
      title: 'Nu cumperi doar acces: pornesti organizat.',
      body: 'Cu start-up kit configuram compania, persoanele, vehiculele, primele termene si instruirea.',
      steps: [
        { title: '1. Structura', body: 'Companie, departamente, vehicule, echipamente si persoane.' },
        { title: '2. Documente', body: 'Primele termene si notificari operationale.' },
        { title: '3. Prima saptamana', body: 'Sprijin pana la folosirea reala.' },
      ],
    },
    pricing: {
      overline: 'Planuri',
      title: 'Preturi construite pe valoarea reala.',
      body: 'Planul creste cu vehicule, echipamente si conturi. Abonamentul cumpara ordine, notificari, istoric, documente, rapoarte si suport.',
      plans: [
        { cta: 'Activeaza Start 5', description: 'Vygo complet pentru flote mici, cu limite mai mici.', featured: false, items: ['Pana la 5 vehicule', 'Pana la 3 echipamente', 'Pana la 10 conturi', 'Toate functiile incluse', '10 GB inclusi'], name: 'Start 5', price: '300 euro/luna + TVA' },
        { cta: 'Activeaza Fleet 10', description: 'Vygo complet cu mai multa capacitate operationala.', featured: true, items: ['Toate functiile', 'Pana la 10 vehicule', 'Pana la 5 echipamente', 'Pana la 20 conturi', '20 GB inclusi'], name: 'Fleet 10', price: '450 euro/luna + TVA' },
        { cta: 'Cere activarea', description: 'Functii complete, mai multe vehicule, conturi si spatiu.', featured: false, items: ['Toate functiile', '20, 30 sau 50 vehicule', 'Echipamente incluse', 'Conturi dupa flota', 'De la 30 GB'], name: 'Fleet 20+', price: 'de la 699 euro/luna + TVA' },
      ],
      extras: [
        { title: 'Functii incluse', body: 'Toate planurile includ chat, grupuri, defectiuni, verificari, documente, termene, costuri si rapoarte.' },
        { title: 'Start-up kit', body: 'Configurare initiala, date, termene si instruire.' },
        { title: 'Stocare extra', body: '20 GB 49 euro/luna + TVA, 50 GB 99 euro/luna + TVA, 100 GB 179 euro/luna + TVA.' },
        { title: 'Fara module ascunse', body: 'Pretul creste cu marimea si spatiul, nu prin taierea functiilor.' },
      ],
    },
    faq: {
      overline: 'FAQ',
      title: 'Intrebari rapide inainte de organizare.',
      items: [
        { title: 'Ce se schimba concret?', body: 'Vezi termene, lipsuri, actiuni si probleme fara cautari in chat-uri si dosare.' },
        { title: 'Utilizatorii instaleaza aplicatia?', body: 'Da. Vygo este aplicatie iOS/Android si dashboard web pentru birou.' },
        { title: 'Exista notificari pe telefon?', body: 'Da, dupa activarea pe dispozitiv.' },
        { title: 'Merge pe PC si telefon?', body: 'Da. Biroul pe PC, echipa in aplicatie.' },
        { title: 'Costurile sunt urmarite?', body: 'Da, defectiuni, mentenanta, amenzi si cheltuieli pe perioada, vehicul, persoana sau echipament.' },
        { title: 'De ce nu WhatsApp?', body: 'WhatsApp vorbeste. Vygo gestioneaza si pastreaza istoricul.' },
      ],
    },
  },
  pl: {
    nav: { product: 'Produkt', pricing: 'Cennik', faq: 'FAQ' },
    problem: {
      overline: 'Dlaczego Vygo',
      title: 'Chaos operacyjny kosztuje wiecej niz abonament.',
      body: 'Wiele firm transportowych nadal pracuje przez WhatsApp, Excel, telefony, e-maile i rozproszone foldery. To oznacza strate czasu, zgubione dokumenty, terminy i slaba kontrole kosztow.',
      cards: [
        { title: 'Rozproszone wiadomosci', body: 'Decyzje zostaja w prywatnych chatach i trudno je pozniej znalezc.' },
        { title: 'Ryzykowne terminy', body: 'Prawa jazdy, przeglady, ubezpieczenia i badania czesto wracaja za pozno.' },
        { title: 'Rozproszone dokumenty', body: 'Kierowcy, pojazdy i biuro nie zawsze maja jedno aktualne archiwum.' },
        { title: 'Ukryte koszty', body: 'Awarie, mandaty i serwis sa widoczne dopiero, gdy juz obciazyly wynik.' },
      ],
    },
    value: {
      overline: 'Vygo',
      title: 'System operacyjny dla calej firmy transportowej.',
      body: 'Vygo laczy dashboard, aplikacje mobilna, chat, dokumenty, kontrole, awarie, terminy i centrum kosztow.',
      cards: [
        { title: 'Terminy i dokumenty', body: 'Licencje, badania, dokumenty pojazdu, przeglady, ubezpieczenia i pliki przy wlasciwym rekordzie.' },
        { title: 'Chat firmowy', body: 'Chaty prywatne i grupowe dla kierowcow, biura, magazynu i zarzadu.' },
        { title: 'Kontrole i awarie', body: 'Uzytkownik zglasza, firma obsluguje, archiwizuje i zachowuje historie.' },
        { title: 'Koszty i raporty', body: 'Wydatki, mandaty, serwis i naprawy filtrowane po okresie, pojezdzie, osobie lub sprzecie.' },
      ],
    },
    setup: {
      overline: 'Start',
      title: 'Nie kupujesz tylko dostepu: startujesz z porzadkiem.',
      body: 'W start-up kit konfigurujemy firme, osoby, pojazdy, pierwsze terminy i szkolenie.',
      steps: [
        { title: '1. Mapa firmy', body: 'Struktura, dzialy, pojazdy, sprzet i osoby.' },
        { title: '2. Dokumenty', body: 'Pierwsze terminy i powiadomienia operacyjne.' },
        { title: '3. Pierwszy tydzien', body: 'Wsparcie do pierwszego realnego uzycia.' },
      ],
    },
    pricing: {
      overline: 'Plany',
      title: 'Ceny oparte na realnej wartosci operacyjnej.',
      body: 'Plan rosnie z liczba pojazdow, sprzetu i kont. Abonament daje porzadek, powiadomienia, historie, dokumenty, raporty i wsparcie.',
      plans: [
        { cta: 'Aktywuj Start 5', description: 'Pelne Vygo dla mniejszych flot z mniejszymi limitami.', featured: false, items: ['Do 5 pojazdow', 'Do 3 narzedzi lub wozkow', 'Do 10 kont', 'Wszystkie funkcje', '10 GB w cenie'], name: 'Start 5', price: '300 euro/miesiac + VAT' },
        { cta: 'Aktywuj Fleet 10', description: 'Pelne Vygo z wieksza pojemnoscia operacyjna.', featured: true, items: ['Wszystkie funkcje', 'Do 10 pojazdow', 'Do 5 narzedzi lub wozkow', 'Do 20 kont', '20 GB w cenie'], name: 'Fleet 10', price: '450 euro/miesiac + VAT' },
        { cta: 'Popros o aktywacje', description: 'Pelne funkcje, wiecej pojazdow, kont i miejsca.', featured: false, items: ['Wszystkie funkcje', '20, 30 lub 50 pojazdow', 'Sprzet w cenie', 'Konta wedlug floty', 'Od 30 GB'], name: 'Fleet 20+', price: 'od 699 euro/miesiac + VAT' },
      ],
      extras: [
        { title: 'Funkcje w cenie', body: 'Kazdy plan ma chat, grupy, awarie, kontrole, dokumenty, terminy, koszty i raporty.' },
        { title: 'Start-up kit', body: 'Konfiguracja, dane, terminy i szkolenie.' },
        { title: 'Dodatkowe miejsce', body: '20 GB 49 euro/miesiac + VAT, 50 GB 99 euro/miesiac + VAT, 100 GB 179 euro/miesiac + VAT.' },
        { title: 'Brak ukrytych modulow', body: 'Cena rosnie z wielkoscia i miejscem, nie przez wycinanie funkcji.' },
      ],
    },
    faq: {
      overline: 'FAQ',
      title: 'Szybkie pytania przed uporzadkowaniem firmy.',
      items: [
        { title: 'Co naprawde sie zmienia?', body: 'Widzisz terminy, braki, zadania i problemy pojazdow bez szukania w chatach i folderach.' },
        { title: 'Czy uzytkownicy instaluja appke?', body: 'Tak. Vygo to aplikacja iOS/Android oraz dashboard web dla biura.' },
        { title: 'Sa powiadomienia na telefon?', body: 'Tak, po wlaczeniu ich na urzadzeniu.' },
        { title: 'PC i telefon?', body: 'Tak. Biuro na PC, zespol w aplikacji.' },
        { title: 'Czy koszty sa sledzone?', body: 'Tak, awarie, serwis, mandaty i wydatki wedlug okresu, pojazdu, osoby lub sprzetu.' },
        { title: 'Dlaczego nie WhatsApp?', body: 'WhatsApp sluzy do rozmowy. Vygo zarzadza i przechowuje historie.' },
      ],
    },
  },
}

const publicProblemIcons = [AlertTriangle, Clock3, FileText, Banknote]
const publicValueIcons = [CalendarClock, Mail, ClipboardCheck, Gauge]
const publicSetupIcons = [BadgeCheck, Users, Smartphone]
const passwordRecoveryCopy = {
  de: {
    back: 'Zur Anmeldung',
    body: 'Geben Sie ein neues Passwort fur Ihr Vygo-Konto ein. Danach offnet sich das Dashboard.',
    confirm: 'Passwort bestatigen',
    forgot: 'Passwort vergessen?',
    invalid: 'Die Passwörter stimmen nicht uberein.',
    password: 'Neues Passwort',
    sent: 'E-Mail gesendet. Offnen Sie den Link und legen Sie das neue Passwort fest.',
    submit: 'Passwort speichern',
    title: 'Neues Passwort festlegen',
  },
  en: {
    back: 'Back to sign in',
    body: 'Enter a new password for your Vygo account. After saving, the dashboard will open.',
    confirm: 'Confirm password',
    forgot: 'Forgot password?',
    invalid: 'The passwords do not match.',
    password: 'New password',
    sent: 'Email sent. Open the link and set the new password.',
    submit: 'Save password',
    title: 'Set a new password',
  },
  es: {
    back: 'Volver al acceso',
    body: 'Introduce una nueva contraseña para tu cuenta Vygo. Despues de guardar, se abrira el panel.',
    confirm: 'Confirmar contraseña',
    forgot: 'Olvidaste la contraseña?',
    invalid: 'Las contraseñas no coinciden.',
    password: 'Nueva contraseña',
    sent: 'Email enviado. Abre el enlace y crea la nueva contraseña.',
    submit: 'Guardar contraseña',
    title: 'Crear nueva contraseña',
  },
  fr: {
    back: 'Retour connexion',
    body: 'Saisissez un nouveau mot de passe pour votre compte Vygo. Apres validation, le tableau s ouvrira.',
    confirm: 'Confirmer mot de passe',
    forgot: 'Mot de passe oublie ?',
    invalid: 'Les mots de passe ne correspondent pas.',
    password: 'Nouveau mot de passe',
    sent: 'Email envoye. Ouvrez le lien et choisissez le nouveau mot de passe.',
    submit: 'Enregistrer mot de passe',
    title: 'Choisir un nouveau mot de passe',
  },
  it: {
    back: 'Torna al login',
    body: 'Inserisci una nuova password per il tuo account Vygo. Dopo il salvataggio si aprira la dashboard.',
    confirm: 'Conferma password',
    forgot: 'Password dimenticata?',
    invalid: 'Le password non coincidono.',
    password: 'Nuova password',
    sent: 'Email inviata. Apri il link e imposta la nuova password.',
    submit: 'Salva nuova password',
    title: 'Imposta nuova password',
  },
  pl: {
    back: 'Wroc do logowania',
    body: 'Wpisz nowe haslo do konta Vygo. Po zapisaniu otworzy sie dashboard.',
    confirm: 'Potwierdz haslo',
    forgot: 'Nie pamietasz hasla?',
    invalid: 'Hasla nie sa takie same.',
    password: 'Nowe haslo',
    sent: 'Email wyslany. Otworz link i ustaw nowe haslo.',
    submit: 'Zapisz haslo',
    title: 'Ustaw nowe haslo',
  },
  ro: {
    back: 'Inapoi la login',
    body: 'Introdu o parola noua pentru contul Vygo. Dupa salvare se va deschide dashboard-ul.',
    confirm: 'Confirma parola',
    forgot: 'Ai uitat parola?',
    invalid: 'Parolele nu coincid.',
    password: 'Parola noua',
    sent: 'Email trimis. Deschide linkul si seteaza parola noua.',
    submit: 'Salveaza parola',
    title: 'Seteaza parola noua',
  },
}

const workflowTranslations = {
  it: {
    'chat.companyTitle': 'Chat azienda',
    'chat.companyAria': 'Chat azienda autisti',
    'chat.conversation': 'Conversazione',
    'chat.gallery': 'Galleria',
    'chat.messages': 'Messaggi',
    'chat.noDrivers': 'Nessun autista',
    'chat.noDriversHint': 'Aggiungi un autista prima di aprire una chat.',
    'chat.noMessages': 'Nessun messaggio',
    'chat.noMessagesYet': 'Nessun messaggio ancora',
    'chat.newChat': 'Nuova chat',
    'chat.noConversations': 'Nessuna conversazione',
    'chat.noConversationsHint': 'Premi Nuova chat per scrivere a un gruppo, reparto o autista.',
    'chat.noDriverMatches': 'Nessun autista trovato.',
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
    'chat.searchDriver': 'Cerca gruppi, reparti o autisti...',
    'chat.showConversations': 'Conversazioni',
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
    'chat.companyTitle': 'Company chat',
    'chat.companyAria': 'Company driver chat',
    'chat.conversation': 'Conversation',
    'chat.gallery': 'Gallery',
    'chat.messages': 'Messages',
    'chat.noDrivers': 'No drivers',
    'chat.noDriversHint': 'Add a driver before opening a chat.',
    'chat.noMessages': 'No messages',
    'chat.noMessagesYet': 'No messages yet',
    'chat.newChat': 'New chat',
    'chat.noConversations': 'No conversations',
    'chat.noConversationsHint': 'Press New chat to message a group, department or driver.',
    'chat.noDriverMatches': 'No driver found.',
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
    'chat.searchDriver': 'Search groups, departments or drivers...',
    'chat.showConversations': 'Conversations',
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
    'chat.companyTitle': 'Chat empresa',
    'chat.companyAria': 'Chat empresa conductores',
    'chat.conversation': 'Conversacion',
    'chat.gallery': 'Galeria',
    'chat.messages': 'Mensajes',
    'chat.noDrivers': 'Ningun conductor',
    'chat.noDriversHint': 'Añade un conductor antes de abrir una chat.',
    'chat.noMessages': 'Ningun mensaje',
    'chat.noMessagesYet': 'Ningun mensaje aun',
    'chat.newChat': 'Nuevo chat',
    'chat.noConversations': 'Sin conversaciones',
    'chat.noConversationsHint': 'Pulsa Nuevo chat para escribir a un grupo, departamento o conductor.',
    'chat.noDriverMatches': 'Ningun conductor encontrado.',
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
    'chat.searchDriver': 'Buscar grupos, departamentos o conductores...',
    'chat.showConversations': 'Conversaciones',
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
    'chat.companyTitle': 'Chat entreprise',
    'chat.companyAria': 'Chat entreprise chauffeurs',
    'chat.conversation': 'Conversation',
    'chat.gallery': 'Galerie',
    'chat.messages': 'Messages',
    'chat.noDrivers': 'Aucun chauffeur',
    'chat.noDriversHint': 'Ajoute un chauffeur avant d ouvrir une chat.',
    'chat.noMessages': 'Aucun message',
    'chat.noMessagesYet': 'Aucun message encore',
    'chat.newChat': 'Nouveau chat',
    'chat.noConversations': 'Aucune conversation',
    'chat.noConversationsHint': 'Appuie sur Nouveau chat pour ecrire a un groupe, service ou chauffeur.',
    'chat.noDriverMatches': 'Aucun chauffeur trouve.',
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
    'chat.searchDriver': 'Chercher groupes, services ou chauffeurs...',
    'chat.showConversations': 'Conversations',
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
    'chat.companyTitle': 'Firmenchat',
    'chat.companyAria': 'Firmenchat mit Fahrern',
    'chat.conversation': 'Unterhaltung',
    'chat.gallery': 'Galerie',
    'chat.messages': 'Nachrichten',
    'chat.noDrivers': 'Keine Fahrer',
    'chat.noDriversHint': 'Fahrer hinzufugen, bevor ein Chat geoffnet wird.',
    'chat.noMessages': 'Keine Nachrichten',
    'chat.noMessagesYet': 'Noch keine Nachrichten',
    'chat.newChat': 'Neuer Chat',
    'chat.noConversations': 'Keine Gesprache',
    'chat.noConversationsHint': 'Tippe auf Neuer Chat, um einer Gruppe, Abteilung oder einem Fahrer zu schreiben.',
    'chat.noDriverMatches': 'Kein Fahrer gefunden.',
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
    'chat.searchDriver': 'Gruppen, Abteilungen oder Fahrer suchen...',
    'chat.showConversations': 'Gesprache',
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
    'drivers.supabaseEmail': 'Email accesso app',
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
    'drivers.supabaseEmail': 'App login email',
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
    'drivers.supabaseEmail': 'Email acceso app',
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
    'drivers.supabaseEmail': 'Email acces app',
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
    'drivers.supabaseEmail': 'App-Zugangs-E-Mail',
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
    'auth.buyCompany': 'Cumpara si activeaza compania',
    'auth.companyTab': 'Firma',
    'auth.driverTab': 'Sofer',
    'auth.heroText': 'Sistemul operational pentru companii de transport: persoane, vehicule, documente, chat, termene si costuri intr-un singur loc.',
    'auth.proofCosts': 'Costuri vehicule mai clare',
    'auth.proofDeadlines': 'Scadente sub control',
    'auth.proofDocuments': 'Documente mereu disponibile',
    'auth.proofOperations': 'Activitati urmarite',
    'auth.staffAccess': 'Acces personal',
    'brand.tagline': 'Move. Manage. Succeed.',
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
    'nav.dashboard': 'Dashboard',
    'nav.deadlines': 'Scadente',
    'nav.notifications': 'Notificari',
    'nav.records': 'Date',
    'nav.reports': 'Rapoarte',
    'nav.settings': 'Setari',
    'nav.support': 'Ghid',
    'onboarding.body': 'Completeaza acesti pasi pentru a porni Vygo fara confuzie.',
    'onboarding.companyTitle': 'Completeaza profilul firmei',
    'onboarding.completed': '{count}/{total} completate',
    'onboarding.deadlinesTitle': 'Adauga o scadenta',
    'onboarding.done': 'Gata',
    'onboarding.driversTitle': 'Adauga persoane',
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
    'support.subtitle': 'FAQ, manual si asistenta ghidata pentru a folosi Vygo fara confuzie.',
    'support.title': 'Ghid si materiale',
    'support.videos': 'Video',
    'support.vision': 'Viziune produs',
  },
  pl: {
    'auth.buyCompany': 'Kup i aktywuj firme',
    'auth.companyTab': 'Firma',
    'auth.driverTab': 'Kierowca',
    'auth.heroText': 'System operacyjny dla firm transportowych: ludzie, pojazdy, dokumenty, chat, terminy i koszty w jednym miejscu.',
    'auth.proofCosts': 'Jasniejsze koszty pojazdow',
    'auth.proofDeadlines': 'Terminy pod kontrola',
    'auth.proofDocuments': 'Dokumenty zawsze dostepne',
    'auth.proofOperations': 'Dzialania sledzone',
    'auth.staffAccess': 'Dostep personelu',
    'brand.tagline': 'Move. Manage. Succeed.',
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
    'nav.dashboard': 'Dashboard',
    'nav.deadlines': 'Terminy',
    'nav.notifications': 'Powiadomienia',
    'nav.records': 'Kartoteki',
    'nav.reports': 'Raporty',
    'nav.settings': 'Ustawienia',
    'nav.support': 'Pomoc',
    'onboarding.body': 'Wykonaj te kroki, aby Vygo bylo gotowe do pracy.',
    'onboarding.companyTitle': 'Uzupelnij profil firmy',
    'onboarding.completed': '{count}/{total} gotowe',
    'onboarding.deadlinesTitle': 'Dodaj termin',
    'onboarding.done': 'Gotowe',
    'onboarding.driversTitle': 'Dodaj osoby',
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
    'support.subtitle': 'FAQ, instrukcja i pomoc krok po kroku, aby korzystac z Vygo bez zamieszania.',
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

const homeDashboardTranslations = {
  it: {
    'homeFlow.archive': 'Archivio',
    'homeFlow.archiveDetail': 'storico ordinato',
    'homeFlow.checks': 'Check',
    'homeFlow.checksDetail': 'arrivano in tempo reale',
    'homeFlow.deadlines': 'Scadenze',
    'homeFlow.deadlinesDetail': 'rinnovi tracciati',
    'homeFlow.faults': 'Guasti',
    'homeFlow.faultsDetail': 'gestione e costi',
    'homeFlow.title': 'Flusso operativo',
    'homeAssistant.answer.chat': 'Apri la chat aziendale per scrivere ad autisti, gruppi e reparti. Se serve, usa anche il centro supporto per guide e FAQ.',
    'homeAssistant.answer.deadlines': 'Apri Scadenze, filtra quelle da lavorare e rinnova con nuovo documento, nuova data o sollecito alla persona.',
    'homeAssistant.answer.documents': 'Da Anagrafiche e Documenti puoi caricare file, foto e scadenze. L autista vede solo cio che rendi visibile.',
    'homeAssistant.answer.faults': 'Apri Guasti, guarda foto e dettagli, poi registra stato, costo riparazione e storico per targa o periodo.',
    'homeAssistant.body': 'Guida rapida su scadenze, guasti, documenti e chat. Se non basta, apre il centro supporto Vygo.',
    'homeAssistant.chat': 'Chat',
    'homeAssistant.deadlines': 'Scadenze',
    'homeAssistant.documents': 'Documenti',
    'homeAssistant.errorMessage': 'Non riesco a rispondere adesso. Scrivi cosa stavi facendo oppure apri la guida: ti porto comunque al punto giusto.',
    'homeAssistant.faults': 'Guasti',
    'homeAssistant.guidedMode': 'Risposta guidata',
    'homeAssistant.homeSubtitle': 'Assistente Vygo',
    'homeAssistant.homeTitle': 'Serve aiuto?',
    'homeAssistant.initialMessage': 'Ciao, sono l assistente Vygo. Dimmi cosa non riesci a fare e ti guido passo passo.',
    'homeAssistant.notHelpful': 'Non e stato utile?',
    'homeAssistant.openAssistant': 'Chiedi aiuto',
    'homeAssistant.openChat': 'Apri chat',
    'homeAssistant.openGuide': 'Apri guida',
    'homeAssistant.openTicket': 'Apri ticket email',
    'homeAssistant.placeholder': 'Scrivi qui il problema o cosa vuoi fare...',
    'homeAssistant.question': 'Come posso aiutarti oggi?',
    'homeAssistant.quickTitle': 'Puoi scrivere liberamente oppure scegliere un argomento:',
    'homeAssistant.quickHelp': 'Aiutami con',
    'homeAssistant.send': 'Invia',
    'homeAssistant.status': 'Guida rapida',
    'homeAssistant.ticketBody': 'Se la risposta non ti ha aiutato, scrivi all assistenza Vygo. Prepariamo una email con azienda e ultima domanda, cosi il supporto capisce subito il caso.',
    'homeAssistant.ticketMessage': 'Mi dispiace, allora apriamo un ticket. Usa il pulsante qui sotto: prepara una email a {email} con azienda, ultima domanda e spazio per descrivere cosa non funziona.',
    'homeAssistant.ticketTitle': 'Apri una richiesta assistenza',
    'homeAssistant.title': 'Assistente Vygo',
    'homeAssistant.typing': 'Sto preparando la risposta...',
    'support.assistant': 'Assistente guidato',
  },
  en: {
    'homeFlow.archive': 'Archive',
    'homeFlow.archiveDetail': 'ordered history',
    'homeFlow.checks': 'Checks',
    'homeFlow.checksDetail': 'real-time arrivals',
    'homeFlow.deadlines': 'Deadlines',
    'homeFlow.deadlinesDetail': 'tracked renewals',
    'homeFlow.faults': 'Faults',
    'homeFlow.faultsDetail': 'handling and costs',
    'homeFlow.title': 'Operating flow',
    'homeAssistant.answer.chat': 'Open company chat to message drivers, groups and departments. Use the support center for guides and FAQs when needed.',
    'homeAssistant.answer.deadlines': 'Open Deadlines, filter items to work on, then renew with a new document, new date or reminder.',
    'homeAssistant.answer.documents': 'From Records and Documents you can upload files, photos and expiry dates. Drivers only see what you make visible.',
    'homeAssistant.answer.faults': 'Open Faults, review photos and details, then record status, repair cost and history by plate or period.',
    'homeAssistant.body': 'Quick guidance for deadlines, faults, documents and chat. If that is not enough, open Vygo support.',
    'homeAssistant.chat': 'Chat',
    'homeAssistant.deadlines': 'Deadlines',
    'homeAssistant.documents': 'Documents',
    'homeAssistant.errorMessage': 'I cannot answer right now. Tell me what you were doing or open the guide and I will still point you to the right place.',
    'homeAssistant.faults': 'Faults',
    'homeAssistant.guidedMode': 'Guided answer',
    'homeAssistant.homeSubtitle': 'Vygo Assistant',
    'homeAssistant.homeTitle': 'Need help?',
    'homeAssistant.initialMessage': 'Hi, I am the Vygo assistant. Tell me what you cannot do and I will guide you step by step.',
    'homeAssistant.notHelpful': 'Was this not useful?',
    'homeAssistant.openAssistant': 'Get help',
    'homeAssistant.openChat': 'Open chat',
    'homeAssistant.openGuide': 'Open guide',
    'homeAssistant.openTicket': 'Open email ticket',
    'homeAssistant.placeholder': 'Write the problem or what you want to do...',
    'homeAssistant.question': 'How can I help today?',
    'homeAssistant.quickTitle': 'You can write freely or choose a topic:',
    'homeAssistant.quickHelp': 'Help me with',
    'homeAssistant.send': 'Send',
    'homeAssistant.status': 'Guided support',
    'homeAssistant.ticketBody': 'If the answer did not help, contact Vygo support. We prepare an email with company and last question so support understands the case quickly.',
    'homeAssistant.ticketMessage': 'Sorry, let us open a ticket. Use the button below: it prepares an email to {email} with company, last question and space to describe what is not working.',
    'homeAssistant.ticketTitle': 'Open a support request',
    'homeAssistant.title': 'Vygo Assistant',
    'homeAssistant.typing': 'Preparing the answer...',
    'support.assistant': 'Guided assistant',
  },
  es: {
    'homeFlow.archive': 'Archivo',
    'homeFlow.archiveDetail': 'historico ordenado',
    'homeFlow.checks': 'Checks',
    'homeFlow.checksDetail': 'llegan en tiempo real',
    'homeFlow.deadlines': 'Vencimientos',
    'homeFlow.deadlinesDetail': 'renovaciones trazadas',
    'homeFlow.faults': 'Averias',
    'homeFlow.faultsDetail': 'gestion y costes',
    'homeFlow.title': 'Flujo operativo',
    'homeAssistant.answer.chat': 'Abre el chat de empresa para escribir a conductores, grupos y departamentos. Si hace falta, usa el centro de ayuda.',
    'homeAssistant.answer.deadlines': 'Abre Vencimientos, filtra lo pendiente y renueva con nuevo documento, nueva fecha o recordatorio.',
    'homeAssistant.answer.documents': 'Desde Ficheros y Documentos puedes subir archivos, fotos y fechas. El conductor ve solo lo que haces visible.',
    'homeAssistant.answer.faults': 'Abre Averias, revisa fotos y detalles, luego registra estado, coste de reparacion e historico por matricula o periodo.',
    'homeAssistant.body': 'Guia rapida sobre vencimientos, averias, documentos y chat. Si no basta, abre el soporte Vygo.',
    'homeAssistant.chat': 'Chat',
    'homeAssistant.deadlines': 'Vencimientos',
    'homeAssistant.documents': 'Documentos',
    'homeAssistant.errorMessage': 'No puedo responder ahora. Escribe lo que estabas haciendo o abre la guia: te llevo al punto correcto.',
    'homeAssistant.faults': 'Averias',
    'homeAssistant.guidedMode': 'Respuesta guiada',
    'homeAssistant.homeSubtitle': 'Asistente Vygo',
    'homeAssistant.homeTitle': 'Necesitas ayuda?',
    'homeAssistant.initialMessage': 'Hola, soy el asistente Vygo. Dime que no puedes hacer y te guio paso a paso.',
    'homeAssistant.notHelpful': 'No ha sido util?',
    'homeAssistant.openAssistant': 'Pedir ayuda',
    'homeAssistant.openChat': 'Abrir chat',
    'homeAssistant.openGuide': 'Abrir guia',
    'homeAssistant.openTicket': 'Abrir ticket email',
    'homeAssistant.placeholder': 'Escribe el problema o lo que quieres hacer...',
    'homeAssistant.question': 'Como puedo ayudarte hoy?',
    'homeAssistant.quickTitle': 'Puedes escribir libremente o elegir un tema:',
    'homeAssistant.quickHelp': 'Ayudame con',
    'homeAssistant.send': 'Enviar',
    'homeAssistant.status': 'Soporte guiado',
    'homeAssistant.ticketBody': 'Si la respuesta no te ha ayudado, escribe al soporte Vygo. Preparamos un email con empresa y ultima pregunta para entender rapido el caso.',
    'homeAssistant.ticketMessage': 'Lo siento, abramos un ticket. Usa el boton de abajo: prepara un email a {email} con empresa, ultima pregunta y espacio para describir el problema.',
    'homeAssistant.ticketTitle': 'Abrir solicitud de ayuda',
    'homeAssistant.title': 'Asistente Vygo',
    'homeAssistant.typing': 'Preparando la respuesta...',
    'support.assistant': 'Asistente guiado',
  },
  fr: {
    'homeFlow.archive': 'Archive',
    'homeFlow.archiveDetail': 'historique ordonne',
    'homeFlow.checks': 'Checks',
    'homeFlow.checksDetail': 'arrivent en temps reel',
    'homeFlow.deadlines': 'Echeances',
    'homeFlow.deadlinesDetail': 'renouvellements traces',
    'homeFlow.faults': 'Pannes',
    'homeFlow.faultsDetail': 'gestion et couts',
    'homeFlow.title': 'Flux operationnel',
    'homeAssistant.answer.chat': 'Ouvre le chat entreprise pour ecrire aux chauffeurs, groupes et services. Si besoin, utilise le centre support.',
    'homeAssistant.answer.deadlines': 'Ouvre Echeances, filtre ce qui est a traiter puis renouvelle avec document, date ou rappel.',
    'homeAssistant.answer.documents': 'Depuis Fichiers et Documents tu peux charger fichiers, photos et dates. Le chauffeur voit seulement ce qui est visible.',
    'homeAssistant.answer.faults': 'Ouvre Pannes, regarde photos et details, puis note statut, cout de reparation et historique par plaque ou periode.',
    'homeAssistant.body': 'Guide rapide pour echeances, pannes, documents et chat. Si cela ne suffit pas, ouvre le support Vygo.',
    'homeAssistant.chat': 'Chat',
    'homeAssistant.deadlines': 'Echeances',
    'homeAssistant.documents': 'Documents',
    'homeAssistant.errorMessage': 'Je ne peux pas repondre maintenant. Ecris ce que tu faisais ou ouvre le guide: je te dirige quand meme.',
    'homeAssistant.faults': 'Pannes',
    'homeAssistant.guidedMode': 'Reponse guidee',
    'homeAssistant.homeSubtitle': 'Assistant Vygo',
    'homeAssistant.homeTitle': 'Besoin d aide?',
    'homeAssistant.initialMessage': 'Bonjour, je suis l assistant Vygo. Dis-moi ce que tu veux faire et je te guide pas a pas.',
    'homeAssistant.notHelpful': 'Ce n etait pas utile?',
    'homeAssistant.openAssistant': 'Demander aide',
    'homeAssistant.openChat': 'Ouvrir chat',
    'homeAssistant.openGuide': 'Ouvrir guide',
    'homeAssistant.openTicket': 'Ouvrir ticket email',
    'homeAssistant.placeholder': 'Ecris le probleme ou ce que tu veux faire...',
    'homeAssistant.question': 'Comment puis-je aider aujourd hui?',
    'homeAssistant.quickTitle': 'Tu peux ecrire librement ou choisir un sujet:',
    'homeAssistant.quickHelp': 'Aide-moi avec',
    'homeAssistant.send': 'Envoyer',
    'homeAssistant.status': 'Support guide',
    'homeAssistant.ticketBody': 'Si la reponse ne t a pas aide, ecris au support Vygo. Nous preparons un email avec entreprise et derniere question pour comprendre vite le cas.',
    'homeAssistant.ticketMessage': 'Desole, ouvrons un ticket. Utilise le bouton ci-dessous: il prepare un email a {email} avec entreprise, derniere question et espace pour decrire le probleme.',
    'homeAssistant.ticketTitle': 'Ouvrir une demande support',
    'homeAssistant.title': 'Assistant Vygo',
    'homeAssistant.typing': 'Preparation de la reponse...',
    'support.assistant': 'Assistant guide',
  },
  de: {
    'homeFlow.archive': 'Archiv',
    'homeFlow.archiveDetail': 'geordnetes Protokoll',
    'homeFlow.checks': 'Checks',
    'homeFlow.checksDetail': 'in Echtzeit',
    'homeFlow.deadlines': 'Fristen',
    'homeFlow.deadlinesDetail': 'Erneuerungen verfolgt',
    'homeFlow.faults': 'Schaden',
    'homeFlow.faultsDetail': 'Bearbeitung und Kosten',
    'homeFlow.title': 'Arbeitsfluss',
    'homeAssistant.answer.chat': 'Offne den Firmenchat fur Fahrer, Gruppen und Abteilungen. Bei Bedarf hilft das Support-Center weiter.',
    'homeAssistant.answer.deadlines': 'Offne Fristen, filtere offene Punkte und erneuere mit neuem Dokument, Datum oder Erinnerung.',
    'homeAssistant.answer.documents': 'In Daten und Dokumente kannst du Dateien, Fotos und Ablaufdaten hochladen. Fahrer sehen nur freigegebene Inhalte.',
    'homeAssistant.answer.faults': 'Offne Schaden, prufe Fotos und Details, erfasse Status, Reparaturkosten und Verlauf nach Kennzeichen oder Zeitraum.',
    'homeAssistant.body': 'Schnelle Hilfe zu Fristen, Schaden, Dokumenten und Chat. Wenn das nicht reicht, offne den Vygo Support.',
    'homeAssistant.chat': 'Chat',
    'homeAssistant.deadlines': 'Fristen',
    'homeAssistant.documents': 'Dokumente',
    'homeAssistant.errorMessage': 'Ich kann gerade nicht antworten. Schreibe, was du tun wolltest, oder offne die Hilfe: ich leite dich trotzdem weiter.',
    'homeAssistant.faults': 'Schaden',
    'homeAssistant.guidedMode': 'Gefuhrte Antwort',
    'homeAssistant.homeSubtitle': 'Vygo Assistent',
    'homeAssistant.homeTitle': 'Brauchst du Hilfe?',
    'homeAssistant.initialMessage': 'Hallo, ich bin der Vygo Assistent. Sag mir, was nicht klappt, und ich fuhre dich Schritt fur Schritt.',
    'homeAssistant.notHelpful': 'War das nicht hilfreich?',
    'homeAssistant.openAssistant': 'Hilfe holen',
    'homeAssistant.openChat': 'Chat offnen',
    'homeAssistant.openGuide': 'Hilfe offnen',
    'homeAssistant.openTicket': 'E-Mail-Ticket offnen',
    'homeAssistant.placeholder': 'Schreibe das Problem oder was du tun mochtest...',
    'homeAssistant.question': 'Wie kann ich heute helfen?',
    'homeAssistant.quickTitle': 'Du kannst frei schreiben oder ein Thema wahlen:',
    'homeAssistant.quickHelp': 'Hilf mir mit',
    'homeAssistant.send': 'Senden',
    'homeAssistant.status': 'Gefuhrter Support',
    'homeAssistant.ticketBody': 'Wenn die Antwort nicht geholfen hat, schreibe dem Vygo Support. Wir bereiten eine E-Mail mit Firma und letzter Frage vor.',
    'homeAssistant.ticketMessage': 'Tut mir leid, offnen wir ein Ticket. Der Button unten erstellt eine E-Mail an {email} mit Firma, letzter Frage und Platz fur die Problembeschreibung.',
    'homeAssistant.ticketTitle': 'Supportanfrage offnen',
    'homeAssistant.title': 'Vygo Assistent',
    'homeAssistant.typing': 'Antwort wird vorbereitet...',
    'support.assistant': 'Gefuhrter Assistent',
  },
  ro: {
    'homeFlow.archive': 'Arhiva',
    'homeFlow.archiveDetail': 'istoric ordonat',
    'homeFlow.checks': 'Check',
    'homeFlow.checksDetail': 'in timp real',
    'homeFlow.deadlines': 'Scadente',
    'homeFlow.deadlinesDetail': 'reinnoiri urmarite',
    'homeFlow.faults': 'Defectiuni',
    'homeFlow.faultsDetail': 'gestionare si costuri',
    'homeFlow.title': 'Flux operational',
    'homeAssistant.answer.chat': 'Deschide chatul firmei pentru soferi, grupuri si departamente. Daca este nevoie, foloseste centrul de suport.',
    'homeAssistant.answer.deadlines': 'Deschide Scadente, filtreaza ce este de lucrat si reinnoieste cu document, data noua sau reminder.',
    'homeAssistant.answer.documents': 'Din Date si Documente poti incarca fisiere, poze si date de expirare. Soferul vede doar ce este vizibil.',
    'homeAssistant.answer.faults': 'Deschide Defectiuni, verifica poze si detalii, apoi noteaza status, cost reparatie si istoric pe numar sau perioada.',
    'homeAssistant.body': 'Ghid rapid pentru scadente, defectiuni, documente si chat. Daca nu ajunge, deschide suportul Vygo.',
    'homeAssistant.chat': 'Chat',
    'homeAssistant.deadlines': 'Scadente',
    'homeAssistant.documents': 'Documente',
    'homeAssistant.errorMessage': 'Nu pot raspunde acum. Scrie ce incercai sa faci sau deschide ghidul: te duc oricum la locul potrivit.',
    'homeAssistant.faults': 'Defectiuni',
    'homeAssistant.guidedMode': 'Raspuns ghidat',
    'homeAssistant.homeSubtitle': 'Asistent Vygo',
    'homeAssistant.homeTitle': 'Ai nevoie de ajutor?',
    'homeAssistant.initialMessage': 'Buna, sunt asistentul Vygo. Spune-mi ce nu poti face si te ghidez pas cu pas.',
    'homeAssistant.notHelpful': 'Nu a fost util?',
    'homeAssistant.openAssistant': 'Cere ajutor',
    'homeAssistant.openChat': 'Deschide chat',
    'homeAssistant.openGuide': 'Deschide ghid',
    'homeAssistant.openTicket': 'Deschide ticket email',
    'homeAssistant.placeholder': 'Scrie problema sau ce vrei sa faci...',
    'homeAssistant.question': 'Cum te pot ajuta azi?',
    'homeAssistant.quickTitle': 'Poti scrie liber sau alege un subiect:',
    'homeAssistant.quickHelp': 'Ajuta-ma cu',
    'homeAssistant.send': 'Trimite',
    'homeAssistant.status': 'Suport ghidat',
    'homeAssistant.ticketBody': 'Daca raspunsul nu te-a ajutat, scrie suportului Vygo. Pregatim un email cu firma si ultima intrebare pentru a intelege cazul rapid.',
    'homeAssistant.ticketMessage': 'Imi pare rau, deschidem un ticket. Foloseste butonul de mai jos: pregateste un email catre {email} cu firma, ultima intrebare si spatiu pentru problema.',
    'homeAssistant.ticketTitle': 'Deschide cerere suport',
    'homeAssistant.title': 'Asistent Vygo',
    'homeAssistant.typing': 'Pregatesc raspunsul...',
    'support.assistant': 'Asistent ghidat',
  },
  pl: {
    'homeFlow.archive': 'Archiwum',
    'homeFlow.archiveDetail': 'uporzadkowana historia',
    'homeFlow.checks': 'Checki',
    'homeFlow.checksDetail': 'w czasie rzeczywistym',
    'homeFlow.deadlines': 'Terminy',
    'homeFlow.deadlinesDetail': 'odnowienia pod kontrola',
    'homeFlow.faults': 'Usterki',
    'homeFlow.faultsDetail': 'obsluga i koszty',
    'homeFlow.title': 'Przeplyw pracy',
    'homeAssistant.answer.chat': 'Otworz chat firmy, aby pisac do kierowcow, grup i dzialow. W razie potrzeby uzyj centrum pomocy.',
    'homeAssistant.answer.deadlines': 'Otworz Terminy, filtruj sprawy do obslugi i odnawiaj dokumentem, nowa data albo przypomnieniem.',
    'homeAssistant.answer.documents': 'W Kartotekach i Dokumentach mozesz dodawac pliki, zdjecia i daty. Kierowca widzi tylko udostepnione rzeczy.',
    'homeAssistant.answer.faults': 'Otworz Usterki, sprawdz zdjecia i szczegoly, potem wpisz status, koszt naprawy i historie wedlug tablicy lub okresu.',
    'homeAssistant.body': 'Szybka pomoc dla terminow, usterek, dokumentow i chatu. Jesli to za malo, otworz wsparcie Vygo.',
    'homeAssistant.chat': 'Chat',
    'homeAssistant.deadlines': 'Terminy',
    'homeAssistant.documents': 'Dokumenty',
    'homeAssistant.errorMessage': 'Nie moge teraz odpowiedziec. Napisz, co robiles, albo otworz pomoc: nadal wskaze wlasciwe miejsce.',
    'homeAssistant.faults': 'Usterki',
    'homeAssistant.guidedMode': 'Odpowiedz prowadzona',
    'homeAssistant.homeSubtitle': 'Asystent Vygo',
    'homeAssistant.homeTitle': 'Potrzebujesz pomocy?',
    'homeAssistant.initialMessage': 'Czesc, jestem asystentem Vygo. Napisz, czego nie mozesz zrobic, a poprowadze cie krok po kroku.',
    'homeAssistant.notHelpful': 'To nie pomoglo?',
    'homeAssistant.openAssistant': 'Popros o pomoc',
    'homeAssistant.openChat': 'Otworz chat',
    'homeAssistant.openGuide': 'Otworz pomoc',
    'homeAssistant.openTicket': 'Otworz ticket email',
    'homeAssistant.placeholder': 'Napisz problem albo co chcesz zrobic...',
    'homeAssistant.question': 'Jak moge dzis pomoc?',
    'homeAssistant.quickTitle': 'Mozesz napisac samodzielnie albo wybrac temat:',
    'homeAssistant.quickHelp': 'Pomoz mi z',
    'homeAssistant.send': 'Wyslij',
    'homeAssistant.status': 'Wsparcie prowadzone',
    'homeAssistant.ticketBody': 'Jesli odpowiedz nie pomogla, napisz do wsparcia Vygo. Przygotujemy email z firma i ostatnim pytaniem, aby szybciej zrozumiec sprawe.',
    'homeAssistant.ticketMessage': 'Przykro mi, otworzmy ticket. Uzyj przycisku ponizej: przygotuje email do {email} z firma, ostatnim pytaniem i miejscem na opis problemu.',
    'homeAssistant.ticketTitle': 'Otworz zgloszenie pomocy',
    'homeAssistant.title': 'Asystent Vygo',
    'homeAssistant.typing': 'Przygotowuje odpowiedz...',
    'support.assistant': 'Asystent prowadzony',
  },
}

Object.entries(homeDashboardTranslations).forEach(([translationLanguage, translationEntries]) => {
  translations[translationLanguage] = {
    ...translations[translationLanguage],
    ...translationEntries,
  }
})

const supportSections = [
  {
    description: 'Primo livello di assistenza: guida l utente dentro Vygo e prepara il passaggio a supporto umano quando serve.',
    icon: Bot,
    id: 'assistant',
    titleKey: 'support.assistant',
    items: [
      {
        body: 'In home risponde subito alle domande piu frequenti su scadenze, guasti, documenti e chat, portando l utente nella sezione corretta.',
        title: 'Cosa fa ora',
      },
      {
        body: 'Per ora lavora con procedure guidate Vygo, senza costi AI. In futuro potremo riattivare AI vera solo se conviene e con limiti di utilizzo.',
        title: 'Evoluzione futura',
      },
      {
        body: 'Se non risolve, deve proporre contatto assistenza, raccogliere domanda, azienda, utente, schermata e priorita, cosi il caso arriva gia ordinato.',
        title: 'Passaggio a supporto',
      },
      {
        body: 'Non deve modificare scadenze, documenti o guasti senza conferma esplicita. Deve guidare, spiegare e aprire la sezione giusta.',
        title: 'Regola di sicurezza',
      },
    ],
  },
  {
    description: 'Risposte pensate per far capire subito il valore: meno caos, meno telefonate, piu controllo.',
    icon: BadgeCheck,
    id: 'faq',
    titleKey: 'support.faq',
    items: [
      {
        body: 'Vygo porta in un unico posto autisti, mezzi, scadenze, documenti, check, guasti, chat, notifiche e costi. L azienda apre la dashboard e vede subito cosa richiede attenzione.',
        title: 'A cosa serve Vygo?',
      },
      {
        body: 'Documenti sparsi, foto su WhatsApp, telefonate continue e scadenze da ricordare diventano pratiche ordinate, notifiche e storico consultabile. Il lavoro resta lo stesso, ma finalmente e piu leggibile.',
        title: 'Cosa cambia nella vita dell azienda?',
      },
      {
        body: 'L ufficio entra dal browser desktop. Autisti, titolare e personale possono usare l app iOS/Android con notifiche, chat, documenti, check e guasti.',
        title: 'Devo installare un programma?',
      },
      {
        body: 'No. L azienda crea username e password. L autista vede solo la sua area: documenti, chat, check, guasti e notifiche.',
        title: 'L autista vede tutti i dati aziendali?',
      },
      {
        body: 'Si. L autista puo aprire i documenti visibili nella sezione Documenti, cosi se serve li ha subito sul telefono.',
        title: 'Si possono mostrare documenti alla polizia?',
      },
      {
        body: 'Si. Se l autista segnala luci, gomme o documenti non ok, l azienda riceve una notifica critica.',
        title: 'Il check mattutino avvisa l azienda?',
      },
      {
        body: 'Si. Le notifiche arrivano sui telefoni registrati nell app, anche per chat, guasti, check e solleciti documentali.',
        title: 'Le notifiche arrivano anche con app chiusa?',
      },
      {
        body: 'Si. Guasti e riparazioni possono avere importi e note. Il Centro costi mostra mese, anno, targa e storico interventi: utile per capire quali mezzi stanno consumando piu soldi.',
        title: 'Posso controllare quanto spendo sui mezzi?',
      },
      {
        body: 'Si. Le sanzioni possono essere registrate con importo, data, autista responsabile e targa collegata. Nei Report puoi vedere totale multe, classifica autisti e CSV filtrati per periodo o mezzo.',
        title: 'Posso controllare multe e sanzioni?',
      },
      {
        body: 'Il prezzo parte da 300 euro/mese + IVA perche Vygo non e una semplice agenda: include app, notifiche, documenti, storico, chat, costi, report, supporto operativo e una struttura pensata per ridurre il disordine quotidiano.',
        title: 'Perche vale il canone mensile?',
      },
      {
        body: 'Non vendiamo pezzi di programma: anche Start 5 ha Vygo completo. Il prezzo cresce per mezzi, persone, strumenti e storage, cosi una piccola flotta non deve comprare un piano piu grande solo per avere reparti, chat o report.',
        title: 'Perche tutti i piani sono completi?',
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
        points: ['Entra come azienda.', 'Completa ragione sociale, sede e logo.', 'Scegli la lingua preferita.', 'Attiva notifiche sull app del titolare se usera il telefono.'],
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
        points: ['L autista invia guasto con foto.', 'L azienda apre il dettaglio.', 'Inserisce costo e note riparazione se disponibili.', 'Quando gestito, archivia e mantiene storico e report economico.'],
        title: '6. Guasti e storico',
      },
      {
        points: ['Apri Report dalla dashboard o dal menu.', 'Scegli dettaglio costi, multe/sanzioni o classifica multe autisti.', 'Filtra per periodo, targa, autista, attrezzatura o categoria.', 'Scarica CSV per Excel oppure stampa/PDF per consegnare il riepilogo.'],
        title: '7. Report, CSV e multe',
      },
    ],
  },
  {
    description: 'Traccia pronta per far percepire il valore: controllo, tempo recuperato e meno rischi operativi.',
    icon: FileText,
    id: 'launch',
    titleKey: 'support.launch',
    items: [
      {
        body: 'Vygo: la flotta sotto controllo, ogni giorno. Una sola dashboard per vedere cosa manca, cosa scade, cosa e urgente e dove stai spendendo soldi.',
        title: 'Titolo',
      },
      {
        body: 'Patenti, CQC, revisioni, assicurazioni, documenti dispersi, guasti comunicati male, foto in chat e autisti che chiamano per tutto.',
        title: 'Il problema',
      },
      {
        body: 'Il disordine costa: tempo, urgenze, fermo mezzo, clienti da richiamare, documenti cercati all ultimo minuto e decisioni prese senza dati.',
        title: 'Il costo del caos',
      },
      {
        body: 'Dashboard azienda, app autista, notifiche, documenti da mostrare, chat, check, guasti, storico operativo e Centro costi.',
        title: 'La soluzione',
      },
      {
        body: 'Meno dimenticanze, meno telefonate, piu controllo, piu prove, piu ordine e una visione chiara dei costi per mezzo.',
        title: 'Benefici',
      },
      {
        body: 'Acquisto abbonamento, attivazione rapida e start-up kit per mettere in ordine anagrafiche, mezzi, documenti e prime scadenze.',
        title: 'Chiusura',
      },
    ],
  },
  {
    description: 'Idee video brevi per far vedere il problema, il sollievo e il valore economico.',
    icon: Smartphone,
    id: 'videos',
    titleKey: 'support.videos',
    items: [
      {
        body: 'Titolare con fogli e telefono. Poi dashboard ordinata. Messaggio: una scadenza dimenticata puo fermare un mezzo, Vygo la fa emergere prima.',
        title: 'La scadenza che ti ferma',
      },
      {
        body: 'Autista vede una spia, scatta foto, segnala guasto. L azienda riceve tutto in dashboard, lo archivia e aggiunge il costo.',
        title: 'Il guasto non e una foto persa',
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
        body: 'Titolare guarda fatture officina. Poi Centro costi: mese, anno, targa e interventi. Messaggio: sai finalmente dove vanno i soldi.',
        title: 'Dove vanno i soldi?',
      },
      {
        body: '60 secondi: problema, dashboard, app autista, guasto con foto, documento, chat, Centro costi, invito ad acquistare.',
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
        body: 'Ogni mese il titolare riceve un riepilogo automatico: spese per targa, multe per autista, guasti ricorrenti, scadenze chiuse e pratiche ancora da lavorare.',
        title: 'Report mensile automatico',
      },
      {
        body: 'Classifica dei mezzi che costano di piu: guasti, manutenzioni, assicurazioni, revisioni, gomme e sanzioni in un unico storico economico.',
        title: 'Classifica mezzi costosi',
      },
      {
        body: 'Per ogni autista: multe, check critici, documenti rinnovati in ritardo, guasti segnalati e chat operative. Non per punire, ma per capire dove serve formazione.',
        title: 'Profilo operativo autista',
      },
      {
        body: 'Magazzino con check muletti, batterie, acqua, forche, DPI, visite mediche e scadenze patentini. La stessa logica dei camion applicata agli strumenti di piazzale.',
        title: 'Modulo magazzino avanzato',
      },
      {
        body: 'Quando un costo supera una soglia o una targa accumula troppi interventi, il sistema suggerisce controllo, fermo programmato o valutazione sostituzione mezzo.',
        title: 'Alert economici intelligenti',
      },
      {
        body: 'Ogni targa riceve un punteggio: documenti ok, guasti recenti, costi mensili, check critici e storico interventi. Il titolare capisce subito quali mezzi meritano attenzione.',
        title: 'Indice salute flotta',
      },
      {
        body: 'Per ogni mezzo o attrezzatura si imposta una soglia mensile. Se manutenzioni, multe o guasti la superano, Vygo evidenzia il problema prima che diventi invisibile nei conti.',
        title: 'Budget per targa',
      },
      {
        body: 'Quando lo stesso guasto torna piu volte su una targa o su un tipo di mezzo, il sistema lo segnala come recidiva e propone un controllo mirato.',
        title: 'Alert recidiva guasti',
      },
      {
        body: 'Una vista per capire chi ha piu documenti rinnovati in ritardo, multe o check critici. Serve a programmare formazione e ridurre errori operativi.',
        title: 'Formazione mirata',
      },
      {
        body: 'Un riepilogo operativo che incrocia tratte, scadenze, guasti e costi. L obiettivo e aiutare il titolare a decidere prima, non a rincorrere problemi dopo.',
        title: 'Cruscotto decisionale',
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

function isComplianceClosed(item) {
  return ['done', 'archived'].includes(item?.status)
}

function isComplianceActionRequired(item) {
  if (!item || isComplianceClosed(item)) return false

  const days = typeof item.urgency?.days === 'number' ? item.urgency.days : daysUntil(item.dueDate)
  return days <= 30
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
    type: 'vygo-active-chat',
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

function isAdminEmail(email = '') {
  return adminEmails.has(String(email ?? '').trim().toLowerCase())
}

function getBillingPlanLabel(plan) {
  return billingPlanLabels[plan] ?? plan ?? 'Start 5'
}

function getBillingStatusLabel(status) {
  if (status === 'internal') return 'Interno admin'
  return billingStatusLabels[status] ?? status ?? 'Attivo'
}

function getBillingPlanCapabilities(plan) {
  return billingPlanCapabilities[plan] ?? billingPlanCapabilities.starter
}

function getCompanyPlanCapabilities(profile = {}) {
  const baseCapabilities = getBillingPlanCapabilities(profile?.billingPlan)
  const storageExtraGb = Math.max(0, Number(profile?.billingStorageExtraGb ?? 0) || 0)

  return {
    ...baseCapabilities,
    chat: Boolean(baseCapabilities.chat || profile?.billingAddonChat),
    costCenter: Boolean(baseCapabilities.costCenter || profile?.billingAddonCostCenter),
    reports: Boolean(baseCapabilities.reports || profile?.billingAddonReports),
    storageGb: (baseCapabilities.storageGb ?? 0) + storageExtraGb,
  }
}

function getOptionLabel(options, value, fallback = '') {
  return options.find((option) => option.value === value)?.label ?? fallback
}

function isCompanyLicenseActive(profile) {
  if (!profile?.billingStatus) return true
  if (profile.billingStatus !== 'active') return false
  if (!profile.billingCurrentPeriodEnd) return true

  const periodEnd = new Date(profile.billingCurrentPeriodEnd).getTime()
  if (Number.isNaN(periodEnd)) return true

  return periodEnd > Date.now()
}

function hasPlanFeature(profile, feature) {
  return Boolean(getCompanyPlanCapabilities(profile)[feature])
}

function formatPlanLimit(limit) {
  return Number.isFinite(limit) ? String(limit) : 'illimitati'
}

function formatInvoiceAmount(invoice) {
  const currency = (invoice.currency || 'eur').toUpperCase()

  return new Intl.NumberFormat('it-IT', {
    currency,
    style: 'currency',
  }).format((invoice.amountCents ?? 0) / 100)
}

function isArchivedStatus(status) {
  return ['archived', 'Archiviato', 'closed'].includes(status)
}

function formatMoneyCents(cents = 0, currency = 'EUR') {
  return new Intl.NumberFormat('it-IT', {
    currency: currency || 'EUR',
    style: 'currency',
  }).format((Number(cents) || 0) / 100)
}

function formatCompactMoneyCents(cents = 0, currency = 'EUR') {
  return new Intl.NumberFormat('it-IT', {
    currency: currency || 'EUR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: 'currency',
  }).format((Number(cents) || 0) / 100)
}

function parseMoneyToCents(value = '') {
  const normalized = String(value)
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const amount = Number.parseFloat(normalized)

  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : 0
}

function formatMoneyInput(cents = 0) {
  if (!cents) return ''
  return String((Number(cents) / 100).toFixed(2)).replace('.', ',')
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

function getPersonCreateDefaults() {
  return {
    department: 'office',
    depot: '',
    email: '',
    forkliftLicenseDueDate: '',
    jobTitle: 'Impiegato ufficio',
    medicalDueDate: '',
    name: '',
    password: generateTemporaryPassword(),
    personType: 'office',
    phone: '',
    safetyTrainingDueDate: '',
    username: '',
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

function isVehicleCheckArchived(check, acknowledgedCheckIds = []) {
  return ['resolved', 'archived', 'done', 'closed'].includes(check?.status) || acknowledgedCheckIds.includes(check?.id)
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

function normalizeDocumentKey(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function getDriverDocumentStatusFromExpiry(expiresAt, filePath = '') {
  if (expiresAt && daysUntil(expiresAt) < 0) return 'Scaduto'
  return filePath ? 'Caricato' : 'Mancante'
}

function findDriverDocumentForCompliance(documentRecords = [], item = {}, payload = {}) {
  if (!item.driverId) return null

  const wantedType = normalizeDocumentKey(payload.type || item.type)
  const wantedNumber = normalizeDocumentKey(payload.documentNumber || item.documentNumber)

  return documentRecords.find((document) => {
    if (document.driverId !== item.driverId) return false

    const typeMatches = wantedType && normalizeDocumentKey(document.type) === wantedType
    const numberMatches = wantedNumber && normalizeDocumentKey(document.documentNumber) === wantedNumber

    return typeMatches || numberMatches
  }) ?? null
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

function getChatAttachmentLabel(kind, t) {
  if (kind === 'audio') return t('chat.audioAttached')
  if (kind === 'video') return t('chat.videoAttached')
  if (kind === 'image') return t('chat.photoAttached')
  return t('chat.fileAttached')
}

function getChatAttachmentFileName(path = '', fallback = 'vygo-media') {
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
  link.download = fileName || 'vygo-media'
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

function getStorageLimitBytes(plan, extraStorageGb = 0) {
  const baseLimitBytes = storagePlanLimitsBytes[plan] ?? storagePlanLimitsBytes.starter
  const extraLimitBytes = Math.max(0, Number(extraStorageGb ?? 0) || 0) * 1024 * 1024 * 1024

  return baseLimitBytes + extraLimitBytes
}

function getCompanyStorageLimitBytes(profile = {}) {
  return getStorageLimitBytes(profile?.billingPlan, profile?.billingStorageExtraGb)
}

function getStorageUsagePercent(summary, profile) {
  const limitBytes = getCompanyStorageLimitBytes(profile)
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
  const [teamChatThreadRecords, setTeamChatThreadRecords] = useState([])
  const [teamChatMessageRecords, setTeamChatMessageRecords] = useState([])
  const [chatLiveState, setChatLiveState] = useState(emptyChatLiveState)
  const [documentEventRecords, setDocumentEventRecords] = useState([])
  const [costEntryRecords, setCostEntryRecords] = useState([])
  const [companyInvoiceRecords, setCompanyInvoiceRecords] = useState([])
  const [companyStorageSummary, setCompanyStorageSummary] = useState(emptyCompanyStorageSummary)
  const [adminOverview, setAdminOverview] = useState(null)
  const [adminOverviewStatus, setAdminOverviewStatus] = useState('')
  const [isAdminOverviewLoading, setIsAdminOverviewLoading] = useState(false)
  const [isPasswordRecoveryMode, setIsPasswordRecoveryMode] = useState(hasPasswordRecoveryUrlParams)
  const [activeCompanyId, setActiveCompanyId] = useState('')
	  const [companyProfile, setCompanyProfile] = useState({
	    billingActivatedAt: '',
	    billingAddonChat: false,
	    billingAddonCostCenter: false,
	    billingAddonReports: false,
	    billingCustomerId: '',
	    billingCurrentPeriodEnd: '',
	    billingEmail: '',
	    billingPlan: 'starter',
	    billingProvider: 'manual',
	    billingStatus: 'active',
	    billingStorageExtraGb: 0,
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
  const [costReportStartAddingKey, setCostReportStartAddingKey] = useState(0)
  const [costReportResetKey, setCostReportResetKey] = useState(0)
  const [recordsTab, setRecordsTab] = useState(getInitialRecordsTab)
  const [activeFilter, setActiveFilter] = useState('all')
  const [complianceShowAll, setComplianceShowAll] = useState(false)
  const [selectedDeadline, setSelectedDeadline] = useState(null)
  const [operationsFilter, setOperationsFilter] = useState('inbox')
  const [query, setQuery] = useState('')
  const [driversSyncStatus, setDriversSyncStatus] = useState('')
  const [documentsSyncStatus, setDocumentsSyncStatus] = useState('')
  const [fleetSyncStatus, setFleetSyncStatus] = useState('')
  const [peopleSyncStatus, setPeopleSyncStatus] = useState('')
  const [operationsSyncStatus, setOperationsSyncStatus] = useState('')
  const [companySettingsStatus, setCompanySettingsStatus] = useState('')
  const [billingCheckoutStatus, setBillingCheckoutStatus] = useState('')
  const [isBillingCheckoutLoading, setIsBillingCheckoutLoading] = useState(false)
  const [legalAcceptanceStatus, setLegalAcceptanceStatus] = useState({
    accepted: true,
    isSaving: false,
    loading: false,
    message: '',
    missingDocuments: [],
    requiredDocuments: [],
  })
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
  const actionableComplianceItems = useMemo(
    () => decoratedItems.filter(isComplianceActionRequired),
    [decoratedItems],
  )
  const summary = useMemo(() => getSummary(actionableComplianceItems), [actionableComplianceItems])
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
        ...costEntryRecords.map((entry) => entry.filePath),
        ...chatMessageRecords.map((message) => message.attachmentPath),
        ...teamChatMessageRecords.map((message) => message.attachmentPath),
      ]
        .filter(isPreviewableAssetPath),
    [chatMessageRecords, companyProfile.logoPath, costEntryRecords, driverRecords, faultReportRecords, teamChatMessageRecords],
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

  const refreshPhoneNotificationState = useCallback(async ({ autoRegisterIfAllowed = false } = {}) => {
    const support = getPushSupportStatus()

    if (!support.supported) {
      setPhoneNotificationEnabled(false)
      if (support.reason) setPhoneNotificationStatus(support.reason)
      return false
    }

    try {
      const existingSubscription = await getExistingPushSubscription()

      if (existingSubscription) {
        setPhoneNotificationEnabled(true)
        setPhoneNotificationStatus('Notifiche gia attive su questo dispositivo.')

        if (session && activeCompanyId) {
          await savePushSubscription(
            existingSubscription.toJSON(),
            session.role === 'driver' ? activeCompanyId || null : activeCompanyId,
          )
        }

        return true
      }

      if (
        autoRegisterIfAllowed
        && typeof window !== 'undefined'
        && window.Notification?.permission === 'granted'
        && session
        && activeCompanyId
      ) {
        const subscriptionResult = await subscribeCurrentBrowserToPush()

        if (subscriptionResult.subscription) {
          const saveResult = await savePushSubscription(
            subscriptionResult.subscription,
            session.role === 'driver' ? activeCompanyId || null : activeCompanyId,
          )

          if (!saveResult.error) {
            setPhoneNotificationEnabled(true)
            setPhoneNotificationStatus('Notifiche telefono abilitate.')
            return true
          }
        }
      }
    } catch {
      setPhoneNotificationEnabled(false)
      return false
    }

    setPhoneNotificationEnabled(false)
    return false
  }, [activeCompanyId, session])

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault()
      setInstallPromptEvent(event)
    }

    function handleInstalled() {
      setIsStandaloneMode(true)
      setInstallPromptEvent(null)
      setPhoneNotificationStatus('Vygo installata sul telefono.')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    const notificationTimerId = window.setTimeout(() => {
      void refreshPhoneNotificationState()
    }, 0)

    return () => {
      window.clearTimeout(notificationTimerId)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [refreshPhoneNotificationState])

  useEffect(() => {
    if (!session) return
    if (isSupabaseConfigured && !activeCompanyId) return

    let isMounted = true

    window.setTimeout(() => {
      if (!isMounted) return
      void refreshPhoneNotificationState({ autoRegisterIfAllowed: true })
    }, 0)

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void refreshPhoneNotificationState({ autoRegisterIfAllowed: true })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [activeCompanyId, refreshPhoneNotificationState, session])

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
    setCostEntryRecords([])
    setCompanyInvoiceRecords([])
    setCompanyStorageSummary(emptyCompanyStorageSummary)
    setLegalAcceptanceStatus({
      accepted: true,
      isSaving: false,
      loading: false,
      message: '',
      missingDocuments: [],
      requiredDocuments: [],
    })

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
    setCostEntryRecords([])
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

  function isCurrentPlanUnlimited() {
    return session?.role === 'company' && isAdminEmail(session.email)
  }

  function getCurrentPlanResourceUsage(resource) {
    if (resource === 'assets') {
      return assetRecords.filter((asset) => !isArchivedStatus(asset.status)).length
    }

    if (resource === 'users') {
      const activeDrivers = driverRecords.filter((driver) => !isArchivedStatus(driver.status)).length
      const activePeople = personRecords.filter((person) => !isArchivedStatus(person.status)).length
      return activeDrivers + activePeople + 1
    }

    if (resource === 'vehicles') {
      return vehicleRecords.filter((vehicle) => !isArchivedStatus(vehicle.status)).length
    }

    return 0
  }

  function canUsePlanResource(resource, nextAmount = 1) {
    if (isCurrentPlanUnlimited()) return true

    const capabilities = getCompanyPlanCapabilities(companyProfile)
    const limit = capabilities[planResourceLimitFields[resource]]

    if (!Number.isFinite(limit)) return true
    return getCurrentPlanResourceUsage(resource) + nextAmount <= limit
  }

  function getPlanLimitMessage(resource) {
    const capabilities = getCompanyPlanCapabilities(companyProfile)
    const limit = capabilities[planResourceLimitFields[resource]]
    const planName = getBillingPlanLabel(companyProfile.billingPlan)
    const usage = getCurrentPlanResourceUsage(resource)
    const context = resource === 'users'
      ? 'Il conteggio include azienda, autisti, ufficio e magazzino.'
      : 'Archivia elementi non piu attivi oppure aggiorna piano.'
    return `${planName}: limite ${planResourceLabels[resource]} raggiunto (${usage}/${formatPlanLimit(limit)}). ${context} Aggiorna piano per continuare.`
  }

  function showPlanResourceLimit(resource, setStatus) {
    const message = getPlanLimitMessage(resource)
    setStatus(message)
    window.alert(message)
    return false
  }

  function canUseCurrentPlanFeature(feature) {
    return (session?.role === 'company' && isAdminEmail(session.email)) || hasPlanFeature(companyProfile, feature)
  }

  function getPlanFeatureLimitMessage(feature) {
    const featureName = planFeatureLabels[feature] ?? 'questa funzione'
    return `${featureName} e inclusa nei piani attivi. Se risulta bloccata, controlla attivazione azienda, pagamento o configurazione piano.`
  }

  function showPlanFeatureLimit(feature, setStatus = setCompanySettingsStatus) {
    const message = getPlanFeatureLimitMessage(feature)
    setStatus(message)
    window.alert(message)
    return false
  }

  async function ensureStorageBudget(file, setStatus) {
    if (!file || !hasCompanyDataConnection) return true

    const latestSummary = await refreshStorageSummary(activeCompanyId)
    const limitBytes = getCompanyStorageLimitBytes(companyProfile)
    const nextTotalBytes = (latestSummary?.totalBytes ?? 0) + file.size

    if (nextTotalBytes <= limitBytes) return true

    setStatus(
      `Spazio del piano ${getBillingPlanLabel(companyProfile.billingPlan)} esaurito: ${formatBytes(
        latestSummary?.totalBytes ?? 0,
      )} usati su ${formatBytes(limitBytes)}. Elimina file vecchi, acquista storage extra o passa a un pacchetto piu capiente.`,
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
        setPhoneNotificationStatus('Vygo installata sul telefono.')
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
      setPhoneNotificationStatus('Notifiche non attivate. Riprova tra poco o contatta assistenza.')
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
        error: { message: 'Servizio notifiche non disponibile in questo momento.' },
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
        setCompanySettingsStatus(`Logo non aggiornato: ${result.error.message}`)
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
    setCompanySettingsStatus('Logo azienda aggiornato su questo dispositivo.')
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
        setStatus(`Foto profilo non aggiornata: ${result.error.message}`)
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
    setStatus('Foto profilo aggiornata su questo dispositivo.')
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
        setStatus(`Foto profilo non rimossa: ${result.error.message}`)
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
    setStatus('Foto profilo rimossa su questo dispositivo.')
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
      setDriversSyncStatus('Caricamento dati...')
      setDocumentsSyncStatus('Caricamento documenti...')
      setOperationsSyncStatus('Caricamento check e guasti...')
      setFleetSyncStatus('Caricamento flotta...')
      setChatSyncStatus('Caricamento chat...')
      const companyResult = await ensureCompanyForCurrentUser(companyName)

      if (!isMounted) return

      if (companyResult.error || !companyResult.data?.id) {
        setDriversSyncStatus('Azienda non collegata. Aggiorna la pagina o contatta assistenza.')
        setDocumentsSyncStatus('Documenti non caricati.')
        setFleetSyncStatus('Flotta non caricata.')
        setOperationsSyncStatus('Check e guasti non caricati.')
        setChatSyncStatus('Chat non caricata.')
        return
      }

      const companyId = companyResult.data.id
      setActiveCompanyId(companyId)
      setCompanyProfile(companyResult.data)
      await ensureDefaultTeamThreads(companyId)
      const [
        driversResult,
        peopleResult,
        assetsResult,
        vehiclesResult,
        complianceResult,
        documentsResult,
        documentEventsResult,
        companyInvoicesResult,
        costEntriesResult,
        checksResult,
        faultsResult,
        chatThreadsResult,
        chatMessagesResult,
        teamChatThreadsResult,
        teamChatMessagesResult,
        storageSummaryResult,
      ] = await Promise.all([
        fetchDrivers(companyId),
        fetchCompanyPeople(companyId),
        fetchCompanyAssets(companyId),
        fetchVehicles(companyId, { includeArchived: true }),
        fetchComplianceItems(companyId),
        fetchDriverDocuments(companyId),
        fetchDriverDocumentEvents(companyId),
        fetchCompanyInvoices(companyId),
        fetchCompanyCostEntries(companyId),
        fetchVehicleChecks(companyId),
        fetchFaultReports(companyId),
        fetchChatThreads(companyId),
        fetchChatMessages(companyId),
        fetchTeamChatThreads(companyId),
        fetchTeamChatMessages(companyId),
        fetchCompanyStorageSummary(companyId),
      ])

      if (!isMounted) return

      if (driversResult.error || peopleResult.error || assetsResult.error || vehiclesResult.error || complianceResult.error || documentsResult.error) {
        setDriversSyncStatus('Servizio dati non disponibile. Sto mostrando gli ultimi dati caricati.')
        setDocumentsSyncStatus('Documenti non aggiornati. Riprova tra poco.')
        setFleetSyncStatus('Flotta non aggiornata. Riprova tra poco.')
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
      if (costEntriesResult.data) setCostEntryRecords(costEntriesResult.data)
      if (checksResult.data) setVehicleCheckRecords(checksResult.data)
      if (faultsResult.data) setFaultReportRecords(faultsResult.data)
      if (chatThreadsResult.data) setChatThreadRecords(chatThreadsResult.data)
      if (chatMessagesResult.data) {
        setChatMessageRecords((currentMessages) => preserveChatReadState(currentMessages, chatMessagesResult.data))
      }
      if (teamChatThreadsResult.data) setTeamChatThreadRecords(teamChatThreadsResult.data)
      if (teamChatMessagesResult.data) setTeamChatMessageRecords(teamChatMessagesResult.data)
      if (storageSummaryResult.data) setCompanyStorageSummary(storageSummaryResult.data)
      setDriversSyncStatus('Dati caricati.')
      setDocumentsSyncStatus('Documenti caricati.')
      setFleetSyncStatus('Dati caricati.')
      setOperationsSyncStatus(
        checksResult.error || faultsResult.error ? 'Check e guasti non caricati.' : 'Check e guasti caricati.',
      )
      setChatSyncStatus(
        chatThreadsResult.error || chatMessagesResult.error
          ? 'Chat non ancora disponibile. Contatta assistenza se il problema continua.'
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
              ? 'Chat non ancora disponibile. Contatta assistenza se il problema continua.'
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
      setChatSyncStatus('Chat disponibile dopo il primo messaggio.')
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
    let unsubscribeTeamChat = () => {}
    let unsubscribeOperations = () => {}
    let chatRefreshTimer = 0
    let chatRefreshDebounceTimer = 0
    let documentsRefreshTimer = 0
    let storageRefreshTimer = 0

    async function refreshChatRecords() {
      const [threadsResult, messagesResult, teamThreadsResult, teamMessagesResult] = await Promise.all([
        fetchChatThreads(activeCompanyId),
        fetchChatMessages(activeCompanyId),
        fetchTeamChatThreads(activeCompanyId),
        fetchTeamChatMessages(activeCompanyId),
      ])

      if (!isMounted) return

      if (threadsResult.data) setChatThreadRecords(threadsResult.data)
      if (messagesResult.data) {
        setChatMessageRecords((currentMessages) => preserveChatReadState(currentMessages, messagesResult.data))
      }
      if (teamThreadsResult.data) setTeamChatThreadRecords(teamThreadsResult.data)
      if (teamMessagesResult.data) setTeamChatMessageRecords(teamMessagesResult.data)
    }

    function scheduleChatRecordsRefresh(delay = 250) {
      if (chatRefreshDebounceTimer) window.clearTimeout(chatRefreshDebounceTimer)
      chatRefreshDebounceTimer = window.setTimeout(() => {
        chatRefreshDebounceTimer = 0
        void refreshChatRecords()
      }, delay)
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
          scheduleChatRecordsRefresh(80)
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

    subscribeToTeamChatMessages(activeCompanyId, (message, payload) => {
      if (!isMounted) return

      if (!message?.id) {
        scheduleChatRecordsRefresh()
        return
      }

      setTeamChatMessageRecords((currentMessages) => upsertChatMessageRecord(currentMessages, message))
      if (payload?.eventType === 'INSERT') {
        setChatSyncStatus('Nuovo messaggio gruppo/reparto.')
        scheduleChatRecordsRefresh(150)
      }

      setTeamChatThreadRecords((currentThreads) => {
        if (!currentThreads.some((thread) => thread.id === message.threadId)) {
          scheduleChatRecordsRefresh(80)
          return currentThreads
        }

        return currentThreads.map((thread) =>
          thread.id === message.threadId
            ? { ...thread, lastMessageAt: message.createdAt, updatedAt: message.createdAt }
            : thread,
        )
      })
    }).then((cleanup) => {
      unsubscribeTeamChat = cleanup
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
      window.clearTimeout(chatRefreshDebounceTimer)
      window.clearInterval(documentsRefreshTimer)
      window.clearInterval(storageRefreshTimer)
      unsubscribeChat()
      unsubscribeTeamChat()
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
    const visibleBaseItems = complianceShowAll
      ? decoratedItems
      : actionableComplianceItems

    return visibleBaseItems.filter((item) => {
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
  }, [actionableComplianceItems, activeFilter, complianceShowAll, decoratedItems, query])
  const complianceWorkItemCount = actionableComplianceItems.length

  async function handleSignOut() {
    await signOut()
    setSession(null)
    setQuery('')
    setActiveView('dashboard')
    setActiveFilter('all')
    setComplianceShowAll(false)
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
    setCostEntryRecords([])
    setChatThreadRecords([])
    setChatMessageRecords([])
    setChatLiveState(emptyChatLiveState)
    setDocumentEventRecords([])
    setCompanyInvoiceRecords([])
    setCompanyStorageSummary(emptyCompanyStorageSummary)
    setAdminOverview(null)
    setAdminOverviewStatus('')
    setIsAdminOverviewLoading(false)
    setChatSyncStatus('')
    setLegalAcceptanceStatus({
      accepted: true,
      isSaving: false,
      loading: false,
      message: '',
      missingDocuments: [],
      requiredDocuments: [],
    })
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
        setCompanySettingsStatus('Dati aggiornati su questo dispositivo. Salvataggio online da verificare.')
        return false
      }

      if (result.data) setCompanyProfile(result.data)
      setCompanySettingsStatus('Impostazioni azienda salvate.')
      return true
    }

    setCompanySettingsStatus('Impostazioni azienda salvate su questo dispositivo.')
    return true
  }

  function addComplianceItem(formItem) {
    setItems((currentItems) => [formItem, ...currentItems])
  }

  async function sendReminder(id) {
    const targetItem = decoratedItems.find((item) => item.id === id) ?? items.find((item) => item.id === id)
    const reminderAt = new Date().toISOString()

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, lastReminderAt: reminderAt } : item,
      ),
    )

    if (!targetItem) return false

    if (hasCompanyDataConnection && session?.role === 'company') {
      const result = await updateSupabaseComplianceItem(id, { lastReminderAt: reminderAt }, activeCompanyId)

      if (result.error) {
        setDocumentsSyncStatus('Sollecito registrato, sincronizzazione online da verificare.')
      } else if (result.data) {
        setItems((currentItems) => currentItems.map((item) => (item.id === id ? result.data : item)))
      }
    }

    const reminderBody = `Sollecito Vygo: aggiorna ${targetItem.type || 'documento'} entro la scadenza ${formatOptionalDate(targetItem.dueDate)}. Se hai gia provveduto, carica il nuovo documento o avvisa l azienda.`

    if (targetItem.driverId) {
      const sent = await sendChatMessage({
        body: reminderBody,
        driverId: targetItem.driverId,
        senderRole: 'company',
      })
      setDocumentsSyncStatus(sent ? 'Sollecito inviato all autista in chat/app.' : 'Sollecito segnato, ma chat non inviata.')
      return sent
    }

    if (targetItem.personId && hasCompanyDataConnection) {
      const threadResult = await ensureDirectTeamThread(activeCompanyId, targetItem.personId)

      if (threadResult.error || !threadResult.data?.id) {
        setDocumentsSyncStatus(`Sollecito segnato. Chat personale: ${threadResult.error?.message ?? 'non disponibile'}`)
        return false
      }

      setTeamChatThreadRecords((currentThreads) => upsertRecordById(currentThreads, threadResult.data))
      const sent = await sendTeamChatMessage({
        body: reminderBody,
        senderRole: 'company',
        threadId: threadResult.data.id,
      })

      if (sent) {
        await notifyPhone({
          body: reminderBody,
          notificationType: 'deadline_reminder',
          tag: `deadline-${targetItem.id}`,
          targetRole: 'team',
          threadId: threadResult.data.id,
          title: companyName,
          url: '/?view=chat',
        })
      }

      setDocumentsSyncStatus(sent ? 'Sollecito inviato alla persona in chat/app.' : 'Sollecito segnato, ma chat personale non inviata.')
      return sent
    }

    setDocumentsSyncStatus('Sollecito registrato. Questa scadenza non e collegata a una persona con app.')
    return true
  }

  async function closeItem(id) {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, status: 'done' } : item)),
    )

    if (hasCompanyDataConnection && session?.role === 'company') {
      const result = await updateSupabaseComplianceItem(id, { status: 'done' }, activeCompanyId)

      if (result.error) {
        setDocumentsSyncStatus('Pratica chiusa su questo dispositivo. Sincronizzazione online da verificare.')
        return false
      }

      if (result.data) {
        setItems((currentItems) => currentItems.map((item) => (item.id === id ? result.data : item)))
      }
    }

    setDocumentsSyncStatus('Pratica archiviata.')
    return true
  }

  async function renewComplianceItem(item, payload, file = null) {
    if (!item?.id) return false

    let uploadFile = file

    if (uploadFile) {
      uploadFile = await prepareDriverDocumentUploadFile(uploadFile)
      if (!uploadFile) return false
    }

    setDocumentsSyncStatus('Salvataggio rinnovo...')

    if (hasCompanyDataConnection && session?.role === 'company') {
      const result = await renewSupabaseCompanyComplianceItem({
        companyId: activeCompanyId,
        file: uploadFile,
        item,
        updates: payload,
      })

      if (result.error) {
        setDocumentsSyncStatus(`Rinnovo non salvato: ${result.error.message}`)
        return false
      }

      if (result.data) {
        setItems((currentItems) => currentItems.map((currentItem) => (currentItem.id === item.id ? result.data : currentItem)))
      }

      const documentsResult = await fetchDriverDocuments(activeCompanyId)
      if (documentsResult.data) setDocumentRecords(documentsResult.data)
      void refreshStorageSummary(activeCompanyId)
      setDocumentsSyncStatus('Rinnovo salvato. La criticita e stata aggiornata.')
      return true
    }

    const nextFilePath = uploadFile ? URL.createObjectURL(uploadFile) : item.filePath
    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              documentNumber: payload.documentNumber,
              dueDate: payload.dueDate,
              filePath: nextFilePath,
              owner: payload.owner,
              status: 'open',
              type: payload.type,
            }
          : currentItem,
      ),
    )

    if (item.driverId) {
      const matchingDocument = findDriverDocumentForCompliance(documentRecords, item, payload)
      const nextDocument = {
        documentNumber: payload.documentNumber,
        driverId: item.driverId,
        expiresAt: payload.dueDate,
        filePath: nextFilePath,
        id: matchingDocument?.id ?? `doc-${Date.now()}`,
        status: getDriverDocumentStatusFromExpiry(payload.dueDate, nextFilePath),
        type: payload.type,
        visibleToDriver: true,
      }

      setDocumentRecords((currentDocuments) =>
        matchingDocument
          ? currentDocuments.map((document) => (document.id === matchingDocument.id ? { ...document, ...nextDocument } : document))
          : [nextDocument, ...currentDocuments],
      )
    }

    setDocumentsSyncStatus('Rinnovo salvato su questo dispositivo.')
    return true
  }

  async function openComplianceItemFile(item) {
    if (!item) return false

    if (item.filePath) {
      if (/^(blob:|data:|https?:)/.test(item.filePath)) {
        window.open(item.filePath, '_blank', 'noopener,noreferrer')
        return true
      }

      setDocumentsSyncStatus('Apro allegato scadenza...')
      const result = await createCompanyAssetSignedUrl(item.filePath)

      if (result.data?.signedUrl) {
        window.open(result.data.signedUrl, '_blank', 'noopener,noreferrer')
        setDocumentsSyncStatus('Allegato aperto in una nuova scheda.')
        return true
      }

      setDocumentsSyncStatus(`Allegato non disponibile: ${result.error?.message ?? 'link non creato'}`)
      return false
    }

    const linkedDocument = findDriverDocumentForCompliance(documentRecords, item)
    if (linkedDocument?.filePath) return openDriverDocumentFile(linkedDocument)

    setDocumentsSyncStatus('Questa pratica non ha ancora un allegato.')
    return false
  }

  async function addDriverRecord(driver) {
    if (!canUsePlanResource('users')) {
      return showPlanResourceLimit('users', setDriversSyncStatus)
    }

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
        const errorMessage = `Autista non salvato: ${result.error.message}`
        setDriversSyncStatus(errorMessage)
        if (String(result.error.message ?? '').includes('Piano Vygo')) window.alert(result.error.message)
        return false
      }

      setDriverRecords((currentDrivers) => [result.data, ...currentDrivers])
      setDriversSyncStatus(
        temporaryPassword
          ? `Autista creato. Username: ${cleanDriver.username}. Password temporanea: ${temporaryPassword}`
          : 'Autista salvato.',
      )
      return true
    }

    setDriverRecords((currentDrivers) => [cleanDriver, ...currentDrivers])
    setDriversSyncStatus('Autista aggiunto su questo dispositivo.')
    return true
  }

  async function addPersonRecord(person) {
    if (!canUseCurrentPlanFeature('departments')) {
      setPeopleSyncStatus(getPlanFeatureLimitMessage('departments'))
      return false
    }

    if (!canUsePlanResource('users')) {
      return showPlanResourceLimit('users', setPeopleSyncStatus)
    }

    const temporaryPassword = person.password?.trim() ?? ''
    const initialDeadlines = person.initialDeadlines ?? []
    const personWithoutPassword = { ...person }
    delete personWithoutPassword.password
    delete personWithoutPassword.initialDeadlines

    const cleanUsername = normalizeDriverUsername(person.username)
    const cleanPerson = {
      ...personWithoutPassword,
      authEmail: buildDriverAuthEmail(cleanUsername),
      email: person.email || buildDriverAuthEmail(cleanUsername),
      jobTitle: person.jobTitle || getWorkforceRoleLabel(person.personType),
      status: 'active',
      username: cleanUsername,
    }

    async function saveInitialDeadlines(savedPerson) {
      const validDeadlines = initialDeadlines.filter((deadline) => deadline?.dueDate && deadline?.type)

      if (!savedPerson?.id || validDeadlines.length === 0) return 0

      let savedDeadlineCount = 0

      for (const deadline of validDeadlines) {
        if (hasCompanyDataConnection && session?.role === 'company') {
          const result = await createSupabaseComplianceItem(
            {
              assigneeId: savedPerson.id,
              dueDate: deadline.dueDate,
              owner: savedPerson.name,
              scope: 'person',
              type: deadline.type,
            },
            activeCompanyId,
          )

          if (result.error) {
            setPeopleSyncStatus(`Persona creata. Scadenza non salvata: ${result.error.message}`)
            continue
          }

          if (result.data) {
            setItems((currentItems) => upsertRecordById(currentItems, result.data))
            savedDeadlineCount += 1
          }
        } else {
          setItems((currentItems) => [
            {
              assigneeId: savedPerson.id,
              documentNumber: '',
              dueDate: deadline.dueDate,
              id: `person-deadline-${Date.now()}-${savedDeadlineCount}`,
              owner: savedPerson.name,
              personId: savedPerson.id,
              reminderDays: [60, 30, 15, 7],
              scope: 'person',
              status: 'open',
              type: deadline.type,
            },
            ...currentItems,
          ])
          savedDeadlineCount += 1
        }
      }

      return savedDeadlineCount
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      setPeopleSyncStatus('Creo account persona e salvo anagrafica...')
      const result = await createSupabaseCompanyPerson({ ...cleanPerson, password: temporaryPassword }, activeCompanyId)

      if (result.error) {
        const errorMessage = `Persona non salvata: ${result.error.message}`
        setPeopleSyncStatus(errorMessage)
        if (String(result.error.message ?? '').includes('Piano Vygo')) window.alert(result.error.message)
        return false
      }

      const savedPerson = result.data
      if (!savedPerson?.id) {
        setPeopleSyncStatus('Persona non salvata: risposta server incompleta.')
        return false
      }

      setPersonRecords((currentPeople) => [savedPerson, ...currentPeople])
      const savedDeadlineCount = await saveInitialDeadlines(savedPerson)
      setPeopleSyncStatus(
        `Persona creata. Username: ${cleanPerson.username}. Password temporanea: ${temporaryPassword}${savedDeadlineCount ? `. Scadenze create: ${savedDeadlineCount}.` : ''}`,
      )
      return savedPerson
    }

    const localPerson = {
      ...cleanPerson,
      companyId: activeCompanyId,
      id: person.id ?? `person-${Date.now()}`,
    }

    setPersonRecords((currentPeople) => [localPerson, ...currentPeople])
    const savedDeadlineCount = await saveInitialDeadlines(localPerson)
    setPeopleSyncStatus(`Persona aggiunta su questo dispositivo${savedDeadlineCount ? ` con ${savedDeadlineCount} scadenze.` : '.'}`)
    return localPerson
  }

  async function updateDriverRecord(driverId, updates) {
    if (hasCompanyDataConnection && session?.role === 'company') {
      setDriversSyncStatus('Aggiornamento autista...')
      const result = await updateSupabaseDriver(driverId, updates)

      if (result.error) {
        setDriversSyncStatus('Autista non aggiornato. Riprova tra poco.')
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
    setDriversSyncStatus('Autista aggiornato su questo dispositivo.')
    return true
  }

  async function resetAccessPassword(targetType, targetId, displayName = 'utente') {
    const chosenPassword = window.prompt(
      `Nuova password temporanea per ${displayName}\n\nScrivila qui se vuoi sceglierla tu. Deve avere almeno 8 caratteri.\nLascia vuoto e premi OK se vuoi farla generare a Vygo.`,
      '',
    )

    if (chosenPassword === null) return false

    const cleanPassword = chosenPassword.trim()

    if (cleanPassword && cleanPassword.length < 8) {
      window.alert('La password deve avere almeno 8 caratteri.')
      return false
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      const isDriver = targetType === 'driver'
      const setStatus = isDriver ? setDriversSyncStatus : setPeopleSyncStatus

      setStatus(`Reimposto password per ${displayName}...`)
      const result = await resetSupabaseCompanyAccessPassword({ password: cleanPassword, targetId, targetType }, activeCompanyId)

      if (result.error) {
        setStatus(`Errore reset password: ${result.error.message}`)
        return false
      }

      const authEmail = result.data?.authEmail ?? ''
      const loginEmails = Array.isArray(result.data?.loginEmails) ? result.data.loginEmails : []
      const password = result.data?.password ?? ''
      const username = result.data?.username ?? ''

      setStatus(`Password reimpostata per ${displayName}.`)
      window.alert(
        `Password temporanea pronta per ${displayName}\n\nUsername: ${username || displayName}\nEmail tecnica principale: ${authEmail}\nPassword: ${password}\n\nSe con lo username non entra, prova una di queste email tecniche:\n${loginEmails.join('\n') || authEmail}\n\nComunicala alla persona e falla cambiare al prossimo accesso.`,
      )
      return true
    }

    window.alert('Il reset password funziona solo dal sito pubblicato e con azienda loggata.')
    return false
  }

  async function archiveDriverRecord(driverId) {
    if (hasCompanyDataConnection && session?.role === 'company') {
      setDriversSyncStatus('Archiviazione autista...')
      const result = await archiveSupabaseDriver(driverId)

      if (result.error) {
        setDriversSyncStatus('Autista non archiviato. Riprova tra poco.')
        return false
      }
    }

    setDriverRecords((currentDrivers) =>
      currentDrivers.map((driver) =>
        driver.id === driverId ? { ...driver, status: 'Archiviato', vehicleId: '' } : driver,
      ),
    )
    setDriversSyncStatus(hasCompanyDataConnection ? 'Autista archiviato.' : 'Autista archiviato su questo dispositivo.')
    return true
  }

  async function addVehicleRecord(vehicle) {
    if (!canUsePlanResource('vehicles')) {
      return showPlanResourceLimit('vehicles', setFleetSyncStatus)
    }

    const cleanVehicle = {
      ...vehicle,
      km: Number(vehicle.km) || 0,
      plate: normalizePlate(vehicle.plate),
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      setFleetSyncStatus('Salvataggio mezzo...')
      const result = await createSupabaseVehicle(cleanVehicle, activeCompanyId)

      if (result.error) {
        const errorMessage = `Mezzo non salvato: ${result.error.message}`
        setFleetSyncStatus(errorMessage)
        if (String(result.error.message ?? '').includes('Piano Vygo')) window.alert(result.error.message)
        return false
      }

      setVehicleRecords((currentVehicles) => [result.data, ...currentVehicles])
      setFleetSyncStatus('Mezzo salvato.')
      return true
    }

    setVehicleRecords((currentVehicles) => [cleanVehicle, ...currentVehicles])
    setFleetSyncStatus('Mezzo aggiunto su questo dispositivo.')
    return true
  }

  async function addCostEntryRecord(entry, receiptFile = null) {
    if (!canUseCurrentPlanFeature('costCenter')) {
      setOperationsSyncStatus('Centro costi non disponibile con lo stato attuale dell azienda. Controlla attivazione o pagamento per registrare spese, multe e manutenzioni.')
      return false
    }

    const cleanEntry = {
      ...entry,
      amountCents: Number(entry.amountCents ?? 0),
      currency: entry.currency || getDefaultCurrency(language),
      spentAt: entry.spentAt || new Date().toISOString().slice(0, 10),
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      setOperationsSyncStatus('Salvataggio spesa nel Centro costi...')
      const result = await createSupabaseCostEntry(cleanEntry, activeCompanyId, receiptFile)

      if (result.error) {
        setOperationsSyncStatus(`Errore Centro costi: ${result.error.message}`)
        return false
      }

      setCostEntryRecords((currentEntries) => [result.data, ...currentEntries])
      void refreshStorageSummary(activeCompanyId)
      setOperationsSyncStatus('Spesa salvata nel Centro costi.')
      return result.data
    }

    const localEntry = {
      ...cleanEntry,
      createdAt: new Date().toISOString(),
      filePath: receiptFile ? URL.createObjectURL(receiptFile) : '',
      id: `cost-${Date.now()}`,
      sourceType: 'manual',
      updatedAt: new Date().toISOString(),
    }

    setCostEntryRecords((currentEntries) => [localEntry, ...currentEntries])
    setOperationsSyncStatus('Spesa aggiunta su questo dispositivo.')
    return localEntry
  }

  async function editCostEntryRecord(entryId, updates, receiptFile = null, previousEntry = null) {
    if (!canUseCurrentPlanFeature('costCenter')) {
      setOperationsSyncStatus('Centro costi non disponibile con lo stato attuale dell azienda. Controlla attivazione o pagamento per modificare spese, multe e manutenzioni.')
      return false
    }

    const cleanEntry = {
      ...updates,
      amountCents: Number(updates.amountCents ?? 0),
      currency: updates.currency || getDefaultCurrency(language),
      spentAt: updates.spentAt || new Date().toISOString().slice(0, 10),
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      setOperationsSyncStatus('Aggiornamento spesa nel Centro costi...')
      const result = await updateSupabaseCostEntry(
        entryId,
        cleanEntry,
        activeCompanyId,
        receiptFile,
        previousEntry?.filePath ?? '',
      )

      if (result.error) {
        setOperationsSyncStatus(`Errore Centro costi: ${result.error.message}`)
        return false
      }

      setCostEntryRecords((currentEntries) => currentEntries.map((entry) => (entry.id === entryId ? result.data : entry)))
      void refreshStorageSummary(activeCompanyId)
      setOperationsSyncStatus('Spesa aggiornata nel Centro costi.')
      return result.data
    }

    const localEntry = {
      ...previousEntry,
      ...cleanEntry,
      filePath: receiptFile ? URL.createObjectURL(receiptFile) : previousEntry?.filePath ?? '',
      id: entryId,
      sourceType: previousEntry?.sourceType ?? 'manual',
      updatedAt: new Date().toISOString(),
    }

    setCostEntryRecords((currentEntries) => currentEntries.map((entry) => (entry.id === entryId ? localEntry : entry)))
    setOperationsSyncStatus('Spesa aggiornata su questo dispositivo.')
    return localEntry
  }

  async function removeCostEntryRecord(entry) {
    if (!entry?.id) return false

    if (hasCompanyDataConnection && session?.role === 'company') {
      setOperationsSyncStatus('Eliminazione spesa dal Centro costi...')
      const result = await deleteSupabaseCostEntry(entry)

      if (result.error) {
        setOperationsSyncStatus(`Errore Centro costi: ${result.error.message}`)
        return false
      }

      setCostEntryRecords((currentEntries) => currentEntries.filter((currentEntry) => currentEntry.id !== entry.id))
      void refreshStorageSummary(activeCompanyId)
      setOperationsSyncStatus('Spesa eliminata dal Centro costi.')
      return true
    }

    setCostEntryRecords((currentEntries) => currentEntries.filter((currentEntry) => currentEntry.id !== entry.id))
    setOperationsSyncStatus('Spesa eliminata su questo dispositivo.')
    return true
  }

  async function updateVehicleRecord(vehicleId, updates) {
    const cleanUpdates = {
      ...updates,
      km: Number(updates.km) || 0,
      plate: normalizePlate(updates.plate),
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      setFleetSyncStatus('Aggiornamento mezzo...')
      const result = await updateSupabaseVehicle(vehicleId, cleanUpdates)

      if (result.error) {
        setFleetSyncStatus('Mezzo non aggiornato. Riprova tra poco.')
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
    setFleetSyncStatus('Mezzo aggiornato su questo dispositivo.')
    return true
  }

  async function archiveVehicleRecord(vehicleId) {
    if (hasCompanyDataConnection && session?.role === 'company') {
      setFleetSyncStatus('Archiviazione mezzo...')
      const result = await archiveSupabaseVehicle(vehicleId)

      if (result.error) {
        setFleetSyncStatus('Mezzo non archiviato. Riprova tra poco.')
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
    setFleetSyncStatus(hasCompanyDataConnection ? 'Mezzo archiviato.' : 'Mezzo archiviato su questo dispositivo.')
    return true
  }

  async function addDriverDocumentRecord(document) {
    const cleanDocument = {
      ...document,
      documentNumber: document.documentNumber.trim(),
      filePath: document.filePath.trim(),
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      setDocumentsSyncStatus('Salvataggio documento...')
      const result = await createSupabaseDriverDocument(cleanDocument, activeCompanyId)

      if (result.error) {
        setDocumentsSyncStatus('Documento non salvato. Riprova tra poco.')
        return false
      }

      setDocumentRecords((currentDocuments) => [result.data, ...currentDocuments])
      setDocumentsSyncStatus('Documento salvato.')
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
      setDocumentsSyncStatus('Creazione documento autista...')
      const result = await createSupabaseOwnDriverDocument(cleanDocument)

      if (result.error) {
        setDocumentsSyncStatus('Documento autista non creato. Riprova tra poco.')
        return false
      }

      setDocumentRecords((currentDocuments) => [result.data, ...currentDocuments])
      setDocumentsSyncStatus('Documento autista creato.')
      void recordDocumentEvent(result.data, 'created')
      return result.data
    }

    setDocumentRecords((currentDocuments) => [cleanDocument, ...currentDocuments])
    setDocumentsSyncStatus('Documento aggiunto su questo dispositivo.')
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
      setDocumentsSyncStatus('Aggiornamento documento...')
      const result = await updateSupabaseDriverDocument(documentId, cleanUpdates)

      if (result.error) {
        setDocumentsSyncStatus('Documento non aggiornato. Riprova tra poco.')
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
    setDocumentsSyncStatus('Documento aggiornato su questo dispositivo.')
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
      setDocumentsSyncStatus('Rimozione documento...')
      const result = await deleteSupabaseDriverDocument(documentId)

      if (result.error) {
        setDocumentsSyncStatus(`Documento non rimosso: ${result.error.message}`)
        return false
      }

      if (document?.filePath) {
        await markDriverDocumentStorageFileDeleted(document.filePath)
        void refreshStorageSummary(activeCompanyId)
      }
    }

    if (!hasCompanyDataConnection && document) void recordDocumentEvent(document, 'deleted')
    setDocumentRecords((currentDocuments) => currentDocuments.filter((document) => document.id !== documentId))
    setDocumentsSyncStatus(hasCompanyDataConnection ? 'Documento rimosso.' : 'Documento rimosso su questo dispositivo.')
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
    setDriverDocumentUploadStatus('Documento selezionato su questo dispositivo.')
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
      setDriverDocumentUploadStatus('File disponibile solo su questo dispositivo.')
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
      setCompanySettingsStatus('PDF non ancora disponibile online.')
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

    if (companyProfile.billingProvider !== 'stripe' || !companyProfile.billingCustomerId) {
      const message = 'Portale pagamento non ancora attivo per questa azienda. Contatta l assistenza Vygo per aggiornare piano, carte e fatture.'
      setCompanySettingsStatus(message)
      window.alert(message)
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

  function openBillingSettings() {
    setCompanySettingsStatus('Da qui puoi vedere il piano e richiedere modifiche di abbonamento.')
    setActiveView('settings')
    window.setTimeout(() => {
      document.querySelector('.billing-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 0)
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
        : 'Check registrato su questo dispositivo.',
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
        : 'Guasto registrato su questo dispositivo.',
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
    setChatSyncStatus('Messaggio aggiunto su questo dispositivo.')
    return true
  }

  async function sendTeamChatMessage({ attachmentFile = null, body = '', replyToMessage = null, senderRole = 'company', threadId }) {
    const cleanBody = String(body ?? '').trim()
    let uploadAttachmentFile = attachmentFile

    if (!threadId) {
      setChatSyncStatus('Seleziona un gruppo o reparto prima di inviare.')
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

    if (!isSupabaseConfigured || !activeCompanyId) {
      setChatSyncStatus('Chat gruppo non inviata: azienda non caricata. Riapri e riprova.')
      return false
    }

    setChatSyncStatus('Invio messaggio gruppo...')
    const messageResult = await createSupabaseTeamChatMessage(
      {
        attachmentPath: '',
        body: composeChatMessageBody(cleanBody, replyToMessage),
        senderRole,
        threadId,
      },
      activeCompanyId,
      uploadAttachmentFile,
    )

    if (messageResult.error || !messageResult.data) {
      setChatSyncStatus(`Errore messaggio gruppo: ${messageResult.error?.message ?? 'messaggio non salvato'}`)
      return false
    }

    setTeamChatMessageRecords((currentMessages) => upsertChatMessageRecord(currentMessages, messageResult.data))
    setTeamChatThreadRecords((currentThreads) =>
      currentThreads.map((thread) =>
        thread.id === threadId
          ? { ...thread, lastMessageAt: messageResult.data.createdAt, updatedAt: messageResult.data.createdAt }
          : thread,
      ),
    )
    void refreshStorageSummary(activeCompanyId)
    setChatSyncStatus('Messaggio gruppo inviato.')
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
        setChatSyncStatus('Lettura aggiornata su questo dispositivo. Sincronizzazione online da verificare.')
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

  async function markTeamChatThreadRead(threadId) {
    if (!threadId) return false

    const readAt = new Date().toISOString()

    setTeamChatMessageRecords((currentMessages) =>
      currentMessages.map((message) =>
        message.threadId === threadId && (message.senderRole !== 'company' || message.senderPersonId) && !message.readByCompanyAt
          ? { ...message, readByCompanyAt: readAt }
          : message,
      ),
    )

    if (hasCompanyDataConnection && session?.role === 'company') {
      const result = await markSupabaseTeamThreadRead(threadId)

      if (result.error) {
        setChatSyncStatus('Lettura gruppo aggiornata su questo dispositivo. Sincronizzazione online da verificare.')
        return true
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
        setChatSyncStatus('Reazione salvata su questo dispositivo. Sincronizzazione online da verificare.')
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

  async function updateFaultReportStatus(reportId, status, repair = {}) {
    const hasRepairUpdate = Object.prototype.hasOwnProperty.call(repair, 'repairCostCents') ||
      Object.prototype.hasOwnProperty.call(repair, 'repairNotes') ||
      Boolean(repair.repairCleared)
    const localRepairPatch = hasRepairUpdate
      ? {
          repairCostCents: Number(repair.repairCostCents ?? 0),
          repairCostCurrency: repair.repairCostCurrency || getDefaultCurrency(language),
          repairNotes: repair.repairNotes ?? '',
          repairRecordedAt: repair.repairCleared ? '' : new Date().toISOString(),
        }
      : {}

    setOperationsSyncStatus(
      hasRepairUpdate
        ? 'Salvataggio costo guasto...'
        : status === 'closed'
          ? 'Archiviazione guasto...'
          : 'Segno il guasto da leggere...',
    )
    setFaultReportRecords((currentReports) =>
      currentReports.map((report) => (report.id === reportId ? { ...report, ...localRepairPatch, status } : report)),
    )

    if (status === 'closed') {
      setArchivedFaultOverrideIds((currentIds) => (currentIds.includes(reportId) ? currentIds : [...currentIds, reportId]))
    } else {
      setArchivedFaultOverrideIds((currentIds) => currentIds.filter((id) => id !== reportId))
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      const result = await updateSupabaseFaultReportStatus(reportId, status, repair)

      if (result.error) {
        setOperationsSyncStatus('Guasto aggiornato su questo dispositivo. Sincronizzazione online da verificare.')
        return true
      }

      setFaultReportRecords((currentReports) =>
        currentReports.map((report) => (
          report.id === reportId
            ? { ...report, ...localRepairPatch, ...(result.data ?? {}), status }
            : report
        )),
      )
      setOperationsSyncStatus(
        hasRepairUpdate
          ? 'Costo riparazione salvato.'
          : status === 'closed'
            ? 'Guasto archiviato.'
            : 'Guasto rimesso da leggere.',
      )
      return true
    }
    setOperationsSyncStatus(
      hasRepairUpdate
        ? 'Costo riparazione salvato su questo dispositivo.'
        : status === 'closed'
          ? 'Guasto archiviato su questo dispositivo.'
          : 'Guasto rimesso da leggere.',
    )
    return true
  }

  async function acknowledgeCheck(checkId) {
    const currentCheck = vehicleCheckRecords.find((check) => check.id === checkId)
    setAcknowledgedCheckIds((currentIds) => (currentIds.includes(checkId) ? currentIds : [...currentIds, checkId]))

    if (hasCompanyDataConnection && session?.role === 'company' && currentCheck?.status !== 'resolved') {
      const result = await updateSupabaseVehicleCheckStatus(checkId, 'resolved')

      if (result.error) {
        setOperationsSyncStatus('Check archiviato su questo dispositivo. Sincronizzazione online da verificare.')
        return false
      }

      if (result.data) {
        setVehicleCheckRecords((currentChecks) =>
          currentChecks.map((check) => (check.id === checkId ? { ...check, ...result.data, status: 'resolved' } : check)),
        )
      }
    }

    setOperationsSyncStatus('Check archiviato.')
    return true
  }

  async function markCheckUnread(checkId) {
    setAcknowledgedCheckIds((currentIds) => currentIds.filter((id) => id !== checkId))

    if (hasCompanyDataConnection && session?.role === 'company') {
      const result = await updateSupabaseVehicleCheckStatus(checkId, 'open')

      if (result.error) {
        setOperationsSyncStatus('Check rimesso da leggere su questo dispositivo. Sincronizzazione online da verificare.')
        return false
      }

      if (result.data) {
        setVehicleCheckRecords((currentChecks) =>
          currentChecks.map((check) => (check.id === checkId ? { ...check, ...result.data, status: 'open' } : check)),
        )
      }
    }

    setOperationsSyncStatus('Check rimesso da leggere.')
    return true
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

  useEffect(() => {
    if (!session || !activeCompanyId || !isSupabaseConfigured || (session.role === 'company' && isAdminEmail(session.email))) {
      return
    }

    let isMounted = true
    const accountRole = session.role === 'company' ? 'company' : 'staff'

    window.setTimeout(() => {
      if (!isMounted) return
      setLegalAcceptanceStatus((currentStatus) => ({
        ...currentStatus,
        loading: true,
        message: '',
      }))
    }, 0)

    fetchLegalAcceptanceStatus({ accountRole, companyId: activeCompanyId }).then((result) => {
      if (!isMounted) return

      if (result.error) {
        setLegalAcceptanceStatus({
          accepted: true,
          isSaving: false,
          loading: false,
          message: result.error.message,
          missingDocuments: [],
          requiredDocuments: [],
        })
        return
      }

      setLegalAcceptanceStatus({
        accepted: Boolean(result.data?.accepted),
        isSaving: false,
        loading: false,
        message: result.data?.missingTable ? 'Registro privacy non ancora attivo. Contatta assistenza Vygo.' : '',
        missingDocuments: result.data?.missingDocuments ?? [],
        requiredDocuments: result.data?.requiredDocuments ?? [],
      })
    })

    return () => {
      isMounted = false
    }
  }, [activeCompanyId, session])

  async function acceptLegalDocuments(marketingAccepted = false) {
    if (!session || !activeCompanyId) return false

    const accountRole = session.role === 'company' ? 'company' : 'staff'
    setLegalAcceptanceStatus((currentStatus) => ({
      ...currentStatus,
      isSaving: true,
      message: 'Salvataggio accettazioni...',
    }))

    const result = await recordLegalAcceptances({
      accountRole,
      companyId: activeCompanyId,
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
      missingDocuments: [],
      requiredDocuments: [],
    })
    return true
  }

  const unreadCheckCount = vehicleCheckRecords.filter((check) => !isVehicleCheckArchived(check, acknowledgedCheckIds)).length
  const openFaultCount = visibleFaultReportRecords.filter(isFaultUnread).length
  const criticalCheckCount = vehicleCheckRecords.filter((check) => !isVehicleCheckArchived(check, acknowledgedCheckIds) && hasCheckIssues(check)).length
  const faultCostSummary = getFaultCostSummary(visibleFaultReportRecords, costEntryRecords)
  const homeFleetHealthRows = getFleetHealthRows({
    complianceItems: decoratedItems,
    costRows: buildCostReportRows(visibleFaultReportRecords, costEntryRecords),
    faultReportRecords: visibleFaultReportRecords,
    vehicleCheckRecords,
    vehicleRecords,
  })
  const averageFleetHealthScore = homeFleetHealthRows.length
    ? Math.round(homeFleetHealthRows.reduce((total, row) => total + row.score, 0) / homeFleetHealthRows.length)
    : 100
  const criticalFleetHealthCount = homeFleetHealthRows.filter((row) => row.score < 62).length
  const defaultCurrency = getDefaultCurrency(language)
  const notificationCount = unreadCheckCount + openFaultCount
  const companyVisibleTeamThreadIds = new Set(
    teamChatThreadRecords
      .filter(isCompanyVisibleTeamThread)
      .map((thread) => thread.id),
  )
  const companyUnreadDirectChatCount = chatMessageRecords.filter(
    (message) => message.senderRole === 'driver' && !message.readByCompanyAt,
  ).length
  const companyUnreadTeamChatCount = teamChatMessageRecords.filter(
    (message) => companyVisibleTeamThreadIds.has(message.threadId) && isUnreadTeamMessageForCompany(message),
  ).length
  const companyUnreadChatCount = companyUnreadDirectChatCount + companyUnreadTeamChatCount
  const isAdminSession = Boolean(session?.role === 'company' && isAdminEmail(session.email))
  const companyLicenseActive = isAdminSession || isCompanyLicenseActive(companyProfile)
  const planFeatureAccess = {
    chat: isAdminSession || hasPlanFeature(companyProfile, 'chat'),
    costCenter: isAdminSession || hasPlanFeature(companyProfile, 'costCenter'),
    departments: isAdminSession || hasPlanFeature(companyProfile, 'departments'),
    reports: isAdminSession || hasPlanFeature(companyProfile, 'reports'),
    voiceCalls: isAdminSession || hasPlanFeature(companyProfile, 'voiceCalls'),
  }

  const refreshAdminOverview = useCallback(async () => {
    if (!isAdminSession) {
      setAdminOverview(null)
      setAdminOverviewStatus('Account non autorizzato al Pannello Admin.')
      return
    }

    setIsAdminOverviewLoading(true)
    setAdminOverviewStatus('Caricamento pannello admin...')
    const result = await fetchAdminOverview()
    setIsAdminOverviewLoading(false)

    if (result.error) {
      setAdminOverview(null)
      setAdminOverviewStatus(result.error.message)
      return
    }

    setAdminOverview(result.data?.overview ?? null)
    setAdminOverviewStatus(
      result.data?.issues?.length
        ? `Pannello caricato. Tabelle opzionali mancanti: ${result.data.issues.length}.`
        : `Pannello aggiornato alle ${formatShortDateTime(result.data?.generatedAt)}.`,
    )
  }, [isAdminSession])

  const handleUpdateAdminCompany = useCallback(async (companyId, updates) => {
    if (!isAdminSession) {
      return { error: { message: 'Account non autorizzato al Pannello Admin.' } }
    }

    setIsAdminOverviewLoading(true)
    setAdminOverviewStatus('Salvataggio gestione cliente...')
    const result = await updateAdminCompanyControl(companyId, updates)

    if (result.error) {
      setIsAdminOverviewLoading(false)
      setAdminOverviewStatus(result.error.message)
      return result
    }

    await refreshAdminOverview()
    setAdminOverviewStatus('Gestione cliente salvata.')
    return result
  }, [isAdminSession, refreshAdminOverview])

  function handlePasswordRecoveryComplete(authUser) {
    setIsPasswordRecoveryMode(false)
    if (authUser) {
      handleAuthenticated(buildAppSessionFromAuthUser(authUser))
    }
  }

  useEffect(() => {
    if (activeView !== 'admin') return
    const timerId = window.setTimeout(() => {
      void refreshAdminOverview()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [activeView, refreshAdminOverview])

  if (isPasswordRecoveryMode) {
    return (
      <I18nContext.Provider value={i18nValue}>
        <AuthScreen
          isPasswordRecoveryMode
          language={language}
          onAuthenticated={handleAuthenticated}
          onLanguageChange={setLanguage}
          onPasswordRecoveryComplete={handlePasswordRecoveryComplete}
          t={t}
        />
      </I18nContext.Provider>
    )
  }

  if (!session) {
    return (
      <I18nContext.Provider value={i18nValue}>
        <AuthScreen
          language={language}
          onAuthenticated={handleAuthenticated}
          onLanguageChange={setLanguage}
          onPasswordRecoveryComplete={handlePasswordRecoveryComplete}
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

    if (!driverSessionLoading && activeCompanyId && (!legalAcceptanceStatus.accepted || legalAcceptanceStatus.loading)) {
      return (
        <I18nContext.Provider value={i18nValue}>
          <LegalAcceptanceGate
            accountRole="staff"
            companyName={getDisplayCompanyName(companyProfile.name || company.name)}
            isLoading={legalAcceptanceStatus.loading}
            isSaving={legalAcceptanceStatus.isSaving}
            message={legalAcceptanceStatus.message}
            onAccept={acceptLegalDocuments}
            onSignOut={handleSignOut}
          />
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
          onStartVoiceCall={voiceCallsLaunchReady ? showVoiceCallNotice : undefined}
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
  const activePeopleCount = personRecords.filter((person) => (
    !['archived', 'Archiviato'].includes(person.status)
      && !['driver', 'drivers'].includes(person.department)
  )).length
  const showCompanyInstallAction = isAppleMobileDevice() || Boolean(installPromptEvent) || isStandaloneMode

  if (activeCompanyId && activeView !== 'admin' && (!legalAcceptanceStatus.accepted || legalAcceptanceStatus.loading)) {
    return (
      <I18nContext.Provider value={i18nValue}>
        <LegalAcceptanceGate
          accountRole="company"
          companyName={companyName}
          isLoading={legalAcceptanceStatus.loading}
          isSaving={legalAcceptanceStatus.isSaving}
          message={legalAcceptanceStatus.message}
          onAccept={acceptLegalDocuments}
          onSignOut={handleSignOut}
        />
      </I18nContext.Provider>
    )
  }

  if (!companyLicenseActive && activeView !== 'admin') {
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

  function openDashboardHome() {
    setActiveView('dashboard')
    window.setTimeout(() => {
      window.scrollTo({ behavior: 'smooth', top: 0 })
    }, 0)
  }

  function openNotifications(filter = 'inbox') {
    setCostReportResetKey(Date.now())
    setOperationsFilter(filter)
    setActiveView('notifications')
  }

  function openCostReport(options = {}) {
    if (!canUseCurrentPlanFeature('costCenter')) {
      showPlanFeatureLimit('costCenter', setOperationsSyncStatus)
      return
    }

    const shouldStartAdding = options?.add === true

    if (shouldStartAdding) {
      setCostReportStartAddingKey(`${options.category || 'cost'}:${Date.now()}`)
    } else {
      setCostReportResetKey(Date.now())
    }

    setActiveView('reports')
    window.setTimeout(() => {
      document.getElementById('fault-cost-report')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 0)
  }

  function openReports() {
    if (!canUseCurrentPlanFeature('reports')) {
      showPlanFeatureLimit('reports', setOperationsSyncStatus)
      return
    }

    setCostReportResetKey(Date.now())
    setActiveView('reports')
    window.setTimeout(() => {
      window.scrollTo({ behavior: 'smooth', top: 0 })
    }, 0)
  }

  function openRecords(tab = recordsTab) {
    if ((tab === 'people' || tab === 'warehouse') && !canUseCurrentPlanFeature('departments')) {
      showPlanFeatureLimit('departments', setPeopleSyncStatus)
      return
    }

    setCostReportResetKey(Date.now())
    setRecordsTab(tab)
    setActiveView('records')
  }

  function openCompanyChat() {
    if (!canUseCurrentPlanFeature('chat')) {
      showPlanFeatureLimit('chat', setChatSyncStatus)
      return
    }

    setActiveView('chat')
  }

  function buildVoiceCallMessage({ callerName = 'Vygo', targetName = 'questo contatto' } = {}) {
    return `[Chiamata vocale] ${callerName} ha richiesto una chiamata con ${targetName}. Audio live in preparazione: confermate qui in chat se potete parlare.`
  }

  async function ensureVoiceCallDriverThread({ driverId, threadId }) {
    if (!driverId) return { data: null, error: { message: 'Destinatario chiamata mancante.' } }

    const selectedDriver = driverRecords.find((driverRecord) => driverRecord.id === driverId)
    const messageCompanyId = activeCompanyId || selectedDriver?.companyId || companyProfile.id || ''
    const existingThread = chatThreadRecords.find(
      (thread) => thread.id === threadId || (thread.driverId === driverId && thread.contextType === 'general'),
    )

    if (existingThread) return { data: existingThread, error: null }

    if (!isSupabaseConfigured || !messageCompanyId) {
      return { data: null, error: { message: 'Azienda non caricata. Riapri l app e riprova.' } }
    }

    const threadResult = await createSupabaseChatThread(
      {
        contextType: 'general',
        driverId,
        title: selectedDriver?.name ? `Chat ${selectedDriver.name}` : 'Chat autista',
      },
      messageCompanyId,
    )

    if (threadResult.data) {
      setChatThreadRecords((currentThreads) => upsertRecordById(currentThreads, threadResult.data))
    }

    return threadResult
  }

  async function showVoiceCallNotice(callRequest = {}) {
    const request = typeof callRequest === 'string' ? { targetName: callRequest } : callRequest
    const targetName = request.targetName || 'questo contatto'

    if (!canUseCurrentPlanFeature('voiceCalls')) {
      showPlanFeatureLimit('voiceCalls', setChatSyncStatus)
      return false
    }

    if (!isSupabaseConfigured || !activeCompanyId) {
      window.alert('Chiamate vocali Vygo: azienda non caricata. Riapri l app e riprova.')
      return false
    }

    setChatSyncStatus('Registro richiesta chiamata...')

    const callerRole = request.callerRole || (session?.role === 'company' ? 'company' : 'driver')
    const callerDriverId = request.callerDriverId || (callerRole === 'driver' ? request.driverId : '')
    const callerName = callerRole === 'company'
      ? companyName
      : callerDriverId
        ? getDriverDisplayName(callerDriverId)
        : 'Persona'
    const callMessage = buildVoiceCallMessage({ callerName, targetName })

    if (request.teamThreadId) {
      const callResult = await createSupabaseVoiceCallSession(
        {
          callerDriverId,
          callerPersonId: request.callerPersonId || '',
          callerRole,
          notes: `Richiesta chiamata verso ${targetName}`,
          status: 'ringing',
          teamThreadId: request.teamThreadId,
        },
        activeCompanyId,
      )

      if (callResult.error) {
        setChatSyncStatus(`Chiamata non registrata: ${callResult.error.message}`)
        window.alert(`Chiamata non registrata: ${callResult.error.message}`)
        return false
      }

      const sent = await sendTeamChatMessage({
        body: callMessage,
        senderRole: callerRole === 'company' ? 'company' : 'driver',
        threadId: request.teamThreadId,
      })

      setChatSyncStatus(sent ? 'Richiesta chiamata inviata nel gruppo.' : 'Chiamata registrata, ma messaggio gruppo non inviato.')
      return sent
    }

    const targetDriverId = request.driverId || request.receiverDriverId || callerDriverId
    const threadResult = await ensureVoiceCallDriverThread({ driverId: targetDriverId, threadId: request.threadId })

    if (threadResult.error || !threadResult.data?.id) {
      setChatSyncStatus(`Chiamata non avviata: ${threadResult.error?.message ?? 'chat non disponibile'}`)
      window.alert(`Chiamata non avviata: ${threadResult.error?.message ?? 'chat non disponibile'}`)
      return false
    }

    const callResult = await createSupabaseVoiceCallSession(
      {
        callerDriverId,
        callerRole,
        notes: `Richiesta chiamata verso ${targetName}`,
        receiverDriverId: callerRole === 'company' ? targetDriverId : '',
        status: 'ringing',
        threadId: threadResult.data.id,
      },
      activeCompanyId,
    )

    if (callResult.error) {
      setChatSyncStatus(`Chiamata non registrata: ${callResult.error.message}`)
      window.alert(`Chiamata non registrata: ${callResult.error.message}`)
      return false
    }

    const sent = await sendChatMessage({
      body: callMessage,
      driverId: targetDriverId,
      senderRole: callerRole === 'company' ? 'company' : 'driver',
      threadId: threadResult.data.id,
    })

    setChatSyncStatus(sent ? 'Richiesta chiamata inviata in chat.' : 'Chiamata registrata, ma messaggio chat non inviato.')
    return sent
  }

  function openComplianceFilter(filter) {
    setCostReportResetKey(Date.now())
    setActiveFilter(filter)
    setActiveView('deadlines')
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

    if (viewId === 'chat') {
      openCompanyChat()
      return
    }

    if (viewId === 'documents' || viewId === 'drivers' || viewId === 'fleet') {
      openRecords(viewId)
      return
    }

    setActiveView(viewId)
  }

  const homeCommandActions = [
    {
      detail: t('homeCommand.operationsDetail'),
      icon: Bell,
      label: t('homeCommand.operationsLabel'),
      onClick: () => openNotifications('inbox'),
      tone: notificationCount > 0 ? 'warning' : 'info',
      value: notificationCount,
    },
    {
      detail: t('homeCommand.deadlinesDetail'),
      icon: CalendarClock,
      label: t('homeCommand.deadlinesLabel'),
      onClick: () => openComplianceFilter('month'),
      tone: summary.next30 > 0 ? 'warning' : 'info',
      value: summary.next30,
    },
    {
      detail: t('homeCommand.costsDetail'),
      icon: Banknote,
      label: t('homeCommand.costsLabel'),
      onClick: openCostReport,
      tone: faultCostSummary.monthCents > 0 ? 'cost' : 'info',
      value: formatCompactMoneyCents(faultCostSummary.monthCents, defaultCurrency),
    },
    {
      detail: 'Stampa, CSV e analisi filtrate per periodo, targa, autista e multe',
      icon: FileText,
      label: t('nav.reports'),
      onClick: openReports,
      tone: 'cost',
      value: faultCostSummary.count,
    },
    {
      detail: 'Aggiungi subito manutenzioni, gomme, assicurazioni o costi generali',
      icon: Plus,
      label: 'Nuova spesa',
      onClick: () => openCostReport({ add: true }),
      tone: 'cost',
      value: '',
    },
    {
      detail: 'Registra multa con importo, data, autista responsabile e targa collegata',
      icon: AlertTriangle,
      label: 'Nuova sanzione',
      onClick: () => openCostReport({ add: true, category: 'fine' }),
      tone: 'warning',
      value: '',
    },
    {
      detail: t('homeCommand.peopleDetail'),
      icon: Users,
      label: t('homeCommand.peopleLabel'),
      onClick: () => openRecords('people'),
      tone: 'info',
      value: activePeopleCount,
    },
    {
      detail: t('homeCommand.fleetDetail'),
      icon: Truck,
      label: t('homeCommand.fleetLabel'),
      onClick: () => openRecords('fleet'),
      tone: 'info',
      value: activeVehicleCount,
    },
    {
      detail: t('homeCommand.chatDetail'),
      icon: Mail,
      label: t('homeCommand.chatLabel'),
      onClick: openCompanyChat,
      tone: companyUnreadChatCount > 0 ? 'warning' : 'info',
      value: companyUnreadChatCount,
    },
    {
      detail: t('homeCommand.quickAddDetail'),
      icon: Plus,
      label: t('homeCommand.quickAddLabel'),
      onClick: () => openRecords('people'),
      tone: 'info',
      value: '',
    },
    {
      detail: t('homeCommand.settingsDetail'),
      icon: SettingsIcon,
      label: t('homeCommand.settingsLabel'),
      onClick: () => setActiveView('settings'),
      tone: 'info',
      value: '',
    },
  ]
  const pushSupportStatus = getPushSupportStatus()
  const homeNotificationStatus = phoneNotificationEnabled
    ? { tone: 'success', value: t('homeStatus.ready') }
    : {
        tone: pushSupportStatus.supported ? 'info' : 'warning',
        value: pushSupportStatus.supported ? t('homeStatus.optional') : 'In app',
      }
  const homeStatusItems = [
    {
      icon: RadioTower,
      label: t('homeStatus.sync'),
      tone: isSupabaseConfigured ? 'success' : 'warning',
      value: isSupabaseConfigured ? t('homeStatus.syncReady') : t('homeStatus.syncDemo'),
    },
    {
      icon: Bell,
      label: t('homeStatus.notifications'),
      tone: homeNotificationStatus.tone,
      value: homeNotificationStatus.value,
    },
    {
      icon: Upload,
      label: t('homeStatus.files'),
      tone: companyStorageSummary.totalBytes > 0 ? 'info' : 'success',
      value: `${formatBytes(companyStorageSummary.totalBytes)} · ${t('homeStatus.storageDetail', { files: companyStorageSummary.fileCount })}`,
    },
    {
      icon: Clock3,
      label: t('homeStatus.lastCheck'),
      tone: 'info',
      value: t('homeStatus.now'),
    },
  ]
  const homeAssistantTopics = [
    {
      answer: t('homeAssistant.answer.deadlines'),
      id: 'deadlines',
      label: t('homeAssistant.deadlines'),
    },
    {
      answer: t('homeAssistant.answer.faults'),
      id: 'faults',
      label: t('homeAssistant.faults'),
    },
    {
      answer: t('homeAssistant.answer.documents'),
      id: 'documents',
      label: t('homeAssistant.documents'),
    },
    {
      answer: t('homeAssistant.answer.chat'),
      id: 'chat',
      label: t('homeAssistant.chat'),
    },
    {
      answer: t('homeAssistant.answer.reports'),
      id: 'reports',
      label: t('homeAssistant.reports'),
    },
    {
      answer: t('homeAssistant.answer.mobileApp'),
      id: 'mobileApp',
      label: t('homeAssistant.mobileApp'),
    },
  ]

  return (
    <I18nContext.Provider value={i18nValue}>
      <div className="app-shell">
      <Sidebar
        activeView={activeView}
        chatNotificationCount={companyUnreadChatCount}
        isAdminSession={isAdminSession}
        notificationCount={notificationCount}
        onHome={openDashboardHome}
        onNavigate={navigateCompanyView}
        onSignOut={handleSignOut}
        session={session}
        t={t}
      />
      <main
        className={[
          'workspace',
          `workspace-${activeView}`,
          activeView === 'dashboard' ? 'is-dashboard-home' : '',
          activeView === 'admin' ? 'is-admin-workspace' : '',
        ].filter(Boolean).join(' ')}
      >
        {activeView !== 'admin' ? (
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
        ) : null}
        {activeView === 'admin' ? (
          <AdminWorkspace
            isAdminSession={isAdminSession}
            isLoading={isAdminOverviewLoading}
            onRefresh={refreshAdminOverview}
            onUpdateCompany={handleUpdateAdminCompany}
            overview={adminOverview}
            sessionEmail={session.email}
            statusMessage={adminOverviewStatus}
          />
        ) : activeView === 'records' ? (
          <RecordsWorkspace
            acknowledgedCheckIds={acknowledgedCheckIds}
            assetPreviewUrl={getAssetPreviewUrl}
            activeTab={recordsTab}
            assetRecords={assetRecords}
            documentEvents={documentEventRecords}
            documentRecords={documentRecords}
            driverRecords={driverRecords}
            documentsSyncStatus={documentsSyncStatus}
            faultReportRecords={visibleFaultReportRecords}
            onAddDriver={addDriverRecord}
            onAddDeadline={addComplianceItem}
            onAddDocument={addDriverDocumentRecord}
            onAddPerson={addPersonRecord}
            onArchiveDriver={archiveDriverRecord}
            onBackHome={openDashboardHome}
            onDriverDocumentUpload={uploadDriverDocumentFile}
            onDriverProfileImageUpload={uploadDriverProfileImage}
            onOpenDriverDocument={openDriverDocumentFile}
            onRemoveDocument={removeDriverDocumentRecord}
            onRemoveDocumentFile={removeDriverDocumentFile}
            onResetAccessPassword={resetAccessPassword}
            onAddVehicle={addVehicleRecord}
            onArchiveVehicle={archiveVehicleRecord}
            onTabChange={setRecordsTab}
            onUpdateDocument={updateDriverDocumentRecord}
            onUpdateDriver={updateDriverRecord}
            onUpdateVehicle={updateVehicleRecord}
            driversSyncStatus={driversSyncStatus}
            fleetSyncStatus={fleetSyncStatus}
            itemRecords={items}
            peopleSyncStatus={peopleSyncStatus}
            personRecords={personRecords}
            t={t}
            vehicleCheckRecords={vehicleCheckRecords}
            vehicleRecords={vehicleRecords}
          />
        ) : activeView === 'notifications' ? (
          <OperationsWorkspace
            acknowledgedCheckIds={acknowledgedCheckIds}
            assetPreviewUrl={getAssetPreviewUrl}
            driverRecords={driverRecords}
            faultReportRecords={visibleFaultReportRecords}
            itemRecords={items}
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
          planFeatureAccess.chat ? (
            <ChatWorkspace
              assetPreviewUrl={getAssetPreviewUrl}
              chatLiveState={chatLiveState}
              chatMessages={chatMessageRecords}
              chatThreads={chatThreadRecords}
              driverRecords={driverRecords}
              onMarkRead={markChatThreadRead}
              onMarkTeamRead={markTeamChatThreadRead}
              onReactToMessage={updateChatMessageReaction}
              onRefreshAssetPreviewUrl={refreshAssetPreviewUrl}
              onSendMessage={sendChatMessage}
              onSendTeamMessage={sendTeamChatMessage}
              onStartVoiceCall={voiceCallsLaunchReady ? showVoiceCallNotice : undefined}
              onTyping={sendChatTyping}
              personRecords={personRecords}
              teamChatMessages={teamChatMessageRecords}
              teamChatThreads={teamChatThreadRecords}
            />
          ) : (
            <FeatureUpgradeGate
              description="La chat completa e inclusa nei piani attivi. Se la vedi bloccata, controlla lo stato pagamento o l attivazione azienda."
              featureName="Chat aziendale"
              icon={Mail}
              onUpgrade={openBillingSettings}
            />
          )
        ) : activeView === 'reports' ? (
          planFeatureAccess.costCenter || planFeatureAccess.reports ? (
            <ReportsWorkspace
              acknowledgedCheckIds={acknowledgedCheckIds}
              assetRecords={assetRecords}
              companyName={getDisplayCompanyName(companyProfile.name || companyName || company.name)}
              complianceItems={decoratedItems}
              costEntryRecords={costEntryRecords}
              driverRecords={driverRecords}
              faultReportRecords={visibleFaultReportRecords}
              onCreateCostEntry={addCostEntryRecord}
              onDeleteCostEntry={removeCostEntryRecord}
              onUpdateCostEntry={editCostEntryRecord}
              onUpdateFaultStatus={updateFaultReportStatus}
              resetCostFormKey={costReportResetKey}
              startAddingCostKey={costReportStartAddingKey}
              vehicleCheckRecords={vehicleCheckRecords}
              vehicleRecords={vehicleRecords}
            />
          ) : (
            <FeatureUpgradeGate
              description="Centro costi, multe, manutenzioni, CSV, stampa e report filtrati sono inclusi nei piani attivi. Se li vedi bloccati, controlla lo stato pagamento o l attivazione azienda."
              featureName="Centro costi e report"
              icon={Banknote}
              onUpgrade={openBillingSettings}
            />
          )
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
        ) : activeView === 'deadlines' ? (
          <section className="content-grid content-grid-full">
            <div className="main-column">
              <ComplianceBoard
                activeFilter={activeFilter}
                allItemCount={decoratedItems.length}
                complianceShowAll={complianceShowAll}
                filteredItems={filteredItems}
                onToggleShowAll={() => setComplianceShowAll((currentValue) => !currentValue)}
                onClose={closeItem}
                onFilter={setActiveFilter}
                onOpenDetail={setSelectedDeadline}
                onReminder={sendReminder}
                onRenew={setSelectedDeadline}
                workItemCount={complianceWorkItemCount}
              />
              <DeadlineDetailModal
                item={selectedDeadline}
                onClose={() => setSelectedDeadline(null)}
                onMarkDone={async (itemId) => {
                  const closed = await closeItem(itemId)
                  if (closed !== false) setSelectedDeadline(null)
                }}
                onOpenFile={openComplianceItemFile}
                onReminder={sendReminder}
                onRenew={async (item, payload, file) => {
                  const renewed = await renewComplianceItem(item, payload, file)
                  if (renewed) setSelectedDeadline(null)
                  return renewed
                }}
                statusMessage={documentsSyncStatus || driverDocumentUploadStatus}
              />
            </div>
          </section>
        ) : (
          <>
            <section className="overview-grid" aria-label="Panoramica scadenze">
              <HeroPanel
                activeDriverCount={activeDriverCount}
                activeVehicleCount={activeVehicleCount}
                companyName={companyName}
                companyLogoUrl={getAssetPreviewUrl(companyProfile.logoPath)}
                costMonthCents={faultCostSummary.monthCents}
                costMonthValue={formatCompactMoneyCents(faultCostSummary.monthCents, defaultCurrency)}
                costRepairCount={faultCostSummary.count}
                criticalCheckCount={criticalCheckCount}
                fleetHealthCriticalCount={criticalFleetHealthCount}
                fleetHealthScore={averageFleetHealthScore}
                notificationCount={notificationCount}
                onOpenCostReport={openCostReport}
                onOpenCriticalChecks={() => openNotifications('critical_checks')}
                onOpenDeadlineWindow={() => openComplianceFilter('month')}
                onOpenFleetHealth={openReports}
                onOpenFaults={() => openNotifications('faults')}
                onOpenNotifications={() => openNotifications('inbox')}
                openFaultCount={openFaultCount}
                summary={summary}
                t={t}
              />
              <HomeCommandPanel actions={homeCommandActions} t={t} />
              <HomeAssistantStrip
                companyName={companyName}
                contextSummary={{
                  activeDriverCount,
                  activeVehicleCount,
                  criticalCheckCount,
                  deadlineCount: summary.next30,
                  notificationCount,
                  openFaultCount,
                  unreadChatCount: companyUnreadChatCount,
                }}
                language={language}
                onOpenSupport={() => setActiveView('support')}
                topics={homeAssistantTopics}
                t={t}
              />
              <HomeStatusBar items={homeStatusItems} />
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

function LegalReadButton({ documentId, label = 'Leggi', onOpen }) {
  return (
    <button
      className="inline-legal-button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onOpen?.(documentId)
      }}
      type="button"
    >
      {label}
    </button>
  )
}

function LegalDocumentModal({ documentId, onClose }) {
  const document = documentId ? legalDocumentLibrary[documentId] : null

  if (!document) return null

  return (
    <div className="legal-document-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-label={document.title}
        aria-modal="true"
        className="legal-document-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="legal-document-header">
          <div>
            <p className="overline">Documento consultabile</p>
            <h2>{document.title}</h2>
            <span>Versione {document.version}</span>
          </div>
          <button aria-label="Chiudi documento" className="icon-button" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>
        <div className="legal-document-body">
          <p className="legal-document-intro">{document.intro}</p>
          {document.sections.map((section) => (
            <article className="legal-document-section" key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </article>
          ))}
          <p className="legal-document-warning">
            Questa e una bozza operativa interna al prodotto. Prima della vendita a clienti reali deve essere verificata e
            adattata da un consulente privacy/legale.
          </p>
        </div>
        <footer className="legal-document-footer">
          <button className="primary-button compact-button" onClick={onClose} type="button">
            <Check size={16} />
            Ho letto
          </button>
        </footer>
      </section>
    </div>
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
    : 'fleet10'
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
  const [billingLegalAccepted, setBillingLegalAccepted] = useState(false)
  const [openLegalDocument, setOpenLegalDocument] = useState('')
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

    if (!billingLegalAccepted) {
      setValidationMessage('Conferma condizioni commerciali, Privacy e gestione fatturazione prima di procedere al pagamento.')
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
          <div className="brand-mark">
            <VygoMark />
          </div>
          <div>
            <img className="license-wordmark" src="/brand/vygo-logo-horizontal.png" alt="Vygo" />
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
          <div className="billing-plan-grid" role="radiogroup" aria-label="Scegli piano Vygo">
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

          <label className="legal-check legal-check-strong">
            <input
              checked={billingLegalAccepted}
              onChange={(event) => setBillingLegalAccepted(event.target.checked)}
              type="checkbox"
            />
            <span>
              Confermo dati fiscali, piano scelto, condizioni commerciali, Privacy e gestione fatturazione tramite Stripe.
              <span className="legal-link-row">
                <LegalReadButton documentId="terms" onOpen={setOpenLegalDocument} />
                <LegalReadButton documentId="privacy" onOpen={setOpenLegalDocument} />
                <LegalReadButton documentId="dpa" label="Nomina" onOpen={setOpenLegalDocument} />
              </span>
            </span>
          </label>

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
      <LegalDocumentModal documentId={openLegalDocument} onClose={() => setOpenLegalDocument('')} />
    </main>
  )
}

function LegalAcceptanceGate({
  accountRole = 'company',
  companyName,
  isLoading = false,
  isSaving = false,
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
  const [openLegalDocument, setOpenLegalDocument] = useState('')
  const requiredAccepted = isCompany
    ? accepted.terms && accepted.privacy && accepted.dpa
    : accepted.staffTerms && accepted.privacy

  function updateAccepted(field, value) {
    setAccepted((currentAccepted) => ({ ...currentAccepted, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!requiredAccepted || isLoading || isSaving) return
    await onAccept?.(accepted.marketing)
  }

  return (
    <main className="license-gate legal-gate">
      <section className="license-gate-panel legal-gate-panel">
        <div className="license-gate-heading">
          <div className="brand-mark">
            <VygoMark />
          </div>
          <div>
            <p className="overline">{isCompany ? 'Attivazione legale azienda' : 'Primo accesso personale'}</p>
            <h1>{companyName}</h1>
          </div>
          <ShieldCheck size={24} />
        </div>

        <p>
          Prima di continuare dobbiamo registrare le accettazioni richieste per usare app, dashboard, chat, documenti,
          notifiche e archivio aziendale.
        </p>

        {isLoading ? (
          <p className="sync-status-line">Controllo accettazioni...</p>
        ) : (
          <form className="legal-acceptance-form" onSubmit={handleSubmit}>
            {isCompany ? (
              <>
                <label className="legal-check">
                  <input checked={accepted.terms} onChange={(event) => updateAccepted('terms', event.target.checked)} type="checkbox" />
                  <span>
                    Accetto Termini e Condizioni SaaS Vygo per uso aziendale, abbonamenti, limiti piano e supporto.
                    <span className="legal-link-row">
                      <LegalReadButton documentId="terms" onOpen={setOpenLegalDocument} />
                    </span>
                  </span>
                </label>
                <label className="legal-check">
                  <input checked={accepted.privacy} onChange={(event) => updateAccepted('privacy', event.target.checked)} type="checkbox" />
                  <span>
                    Ho letto l Informativa Privacy Vygo per dati aziendali, utenti, chat, documenti, notifiche e file.
                    <span className="legal-link-row">
                      <LegalReadButton documentId="privacy" onOpen={setOpenLegalDocument} />
                    </span>
                  </span>
                </label>
                <label className="legal-check">
                  <input checked={accepted.dpa} onChange={(event) => updateAccepted('dpa', event.target.checked)} type="checkbox" />
                  <span>
                    Confermo la nomina Vygo a responsabile del trattamento per i dati gestiti per conto dell azienda.
                    <span className="legal-link-row">
                      <LegalReadButton documentId="dpa" label="Leggi nomina" onOpen={setOpenLegalDocument} />
                    </span>
                  </span>
                </label>
                <label className="legal-check">
                  <input checked={accepted.marketing} onChange={(event) => updateAccepted('marketing', event.target.checked)} type="checkbox" />
                  <span>Voglio ricevere comunicazioni commerciali e aggiornamenti prodotto. Facoltativo.</span>
                </label>
              </>
            ) : (
              <>
                <label className="legal-check">
                  <input checked={accepted.privacy} onChange={(event) => updateAccepted('privacy', event.target.checked)} type="checkbox" />
                  <span>
                    Ho letto l informativa privacy sull uso di app, profilo, documenti, notifiche e messaggi aziendali.
                    <span className="legal-link-row">
                      <LegalReadButton documentId="privacy" onOpen={setOpenLegalDocument} />
                    </span>
                  </span>
                </label>
                <label className="legal-check">
                  <input checked={accepted.staffTerms} onChange={(event) => updateAccepted('staffTerms', event.target.checked)} type="checkbox" />
                  <span>
                    Accetto le regole d uso di Vygo per chat, documenti, check, guasti, allegati e notifiche aziendali.
                    <span className="legal-link-row">
                      <LegalReadButton documentId="staffTerms" onOpen={setOpenLegalDocument} />
                    </span>
                  </span>
                </label>
              </>
            )}

            <p className="legal-mini-copy">
              Salviamo utente, azienda, data, versione documento e dispositivo. Il consenso marketing e separato e puo essere
              gestito in seguito.
            </p>

            {message ? <p className="sync-status-line">{message}</p> : null}

            <div className="license-gate-actions">
              <button className="primary-button" disabled={!requiredAccepted || isSaving} type="submit">
                <ShieldCheck size={17} />
                {isSaving ? 'Salvataggio...' : 'Accetta e continua'}
              </button>
              <button className="secondary-button" onClick={onSignOut} type="button">
                <LogOut size={17} />
                Esci
              </button>
            </div>
          </form>
        )}
      </section>
      <LegalDocumentModal documentId={openLegalDocument} onClose={() => setOpenLegalDocument('')} />
    </main>
  )
}

function FeatureUpgradeGate({
  description,
  featureName,
  icon: Icon = BadgeCheck,
  onUpgrade,
}) {
  return (
    <section className="feature-upgrade-gate">
      <div className="feature-upgrade-card">
        <span className="feature-upgrade-icon">
          <Icon size={26} />
        </span>
        <p className="overline">Funzione da verificare</p>
        <h2>{featureName}</h2>
        <p>{description}</p>
        <div className="feature-limit-grid">
          {billingCheckoutPlans.map((plan) => (
            <article key={plan.id}>
              <strong>{plan.title}</strong>
              <span>{plan.price}</span>
              <small>{plan.bestFor}</small>
            </article>
          ))}
        </div>
        <button className="primary-button" onClick={onUpgrade} type="button">
          <BadgeCheck size={17} />
          Vai a piano e fatturazione
        </button>
      </div>
    </section>
  )
}

function DriverLicenseBlockedScreen({ companyName, onSignOut }) {
  return (
    <main className="license-gate is-driver">
      <section className="license-gate-panel">
        <div className="brand-mark">
          <VygoMark />
        </div>
        <p className="overline">{companyName}</p>
        <h1>Area autista non disponibile</h1>
        <p>
          L azienda deve completare l attivazione della licenza Vygo. Appena viene riattivata,
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

function AuthScreen({ isPasswordRecoveryMode = false, language, onAuthenticated, onLanguageChange, onPasswordRecoveryComplete, t }) {
  const [mode, setMode] = useState('company')
  const [companyMode, setCompanyMode] = useState('signin')
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    email: '',
    marketingAccepted: false,
    password: '',
    privacyAccepted: false,
    termsAccepted: false,
  })
  const [driverForm, setDriverForm] = useState({
    username: '',
    password: '',
  })
  const [recoveryForm, setRecoveryForm] = useState({
    confirmPassword: '',
    password: '',
  })
  const [openLegalDocument, setOpenLegalDocument] = useState('')
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function sendCompanyRecoveryEmail() {
    const cleanEmail = companyForm.email.trim()

    if (!cleanEmail) {
      setStatus('Inserisci prima la email aziendale.')
      return
    }

    setIsSubmitting(true)
    setStatus('Invio email di recupero...')
    const result = await sendPasswordRecoveryEmail(cleanEmail)
    setIsSubmitting(false)

    if (result.error) {
      setStatus(result.error.message)
      return
    }

    setStatus((passwordRecoveryCopy[language] ?? passwordRecoveryCopy.it).sent)
  }

  async function handlePasswordRecoverySubmit(event) {
    event.preventDefault()
    const recoveryCopy = passwordRecoveryCopy[language] ?? passwordRecoveryCopy.it
    const cleanPassword = recoveryForm.password.trim()

    if (cleanPassword.length < 8) {
      setStatus('La nuova password deve avere almeno 8 caratteri.')
      return
    }

    if (cleanPassword !== recoveryForm.confirmPassword.trim()) {
      setStatus(recoveryCopy.invalid)
      return
    }

    setIsSubmitting(true)
    setStatus('Salvataggio nuova password...')
    const result = await updatePasswordFromRecovery(cleanPassword)
    setIsSubmitting(false)

    if (result.error) {
      setStatus(result.error.message)
      return
    }

    setStatus('Password aggiornata.')
    onPasswordRecoveryComplete?.(result.data?.user)
  }

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

    if (companyMode === 'signup' && (!cleanCompanyForm.privacyAccepted || !cleanCompanyForm.termsAccepted)) {
      setIsSubmitting(false)
      setStatus('Per creare l account azienda devi accettare Termini e Privacy. Il marketing resta facoltativo.')
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
        marketingAccepted: false,
        password: currentForm.password,
        privacyAccepted: false,
        termsAccepted: false,
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

  const publicCopy = publicLandingCopy[language] ?? publicLandingCopy.it
  const recoveryCopy = passwordRecoveryCopy[language] ?? passwordRecoveryCopy.it

  return (
    <main className="public-site">
      <header className="public-header">
        <button className="brand brand-button public-brand is-wordmark" onClick={() => openAccess('company', 'signin')} type="button">
          <img className="brand-wordmark" src="/brand/vygo-logo-horizontal.png" alt="Vygo - Move. Manage. Succeed." />
        </button>
        <nav className="public-nav" aria-label="Navigazione sito">
          <a href="#prodotto">{publicCopy.nav.product}</a>
          <a href="#prezzi">{publicCopy.nav.pricing}</a>
          <a href="#faq">{publicCopy.nav.faq}</a>
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
          <h1 className="public-hero-logo-title">
            <img src="/brand/vygo-logo-horizontal.png" alt="Vygo - Move. Manage. Succeed." />
            <span>Vygo</span>
          </h1>
          <p>{t('auth.heroText')}</p>
          <div className="public-hero-actions">
            <button className="primary-button" onClick={() => openAccess('company', 'signup')} type="button">
              <BadgeCheck size={18} />
              {t('auth.buyCompany')}
            </button>
            <button className="secondary-button" onClick={() => openAccess('driver', 'signin')} type="button">
              <Smartphone size={18} />
              {t('auth.staffAccess')}
            </button>
          </div>
          <div className="public-proof-grid">
            <span><ShieldCheck size={17} /> {t('auth.proofDeadlines')}</span>
            <span><Wrench size={17} /> {t('auth.proofOperations')}</span>
            <span><FileText size={17} /> {t('auth.proofDocuments')}</span>
            <span><Banknote size={17} /> {t('auth.proofCosts')}</span>
          </div>
        </div>

        <section className="auth-card public-access-card" id="accesso" aria-label="Accesso Vygo">
        {isPasswordRecoveryMode ? (
          <form className="auth-form password-recovery-form" onSubmit={handlePasswordRecoverySubmit}>
            <div>
              <img className="auth-wordmark" src="/brand/vygo-logo-horizontal.png" alt="Vygo" />
              <h2>{recoveryCopy.title}</h2>
              <p className="auth-helper-text">{recoveryCopy.body}</p>
            </div>
            <label>
              {recoveryCopy.password}
              <span>
                <LockKeyhole size={17} />
                <input
                  autoComplete="new-password"
                  minLength={8}
                  name="new-password"
                  required
                  value={recoveryForm.password}
                  onChange={(event) => setRecoveryForm({ ...recoveryForm, password: event.target.value })}
                  type="password"
                />
              </span>
            </label>
            <label>
              {recoveryCopy.confirm}
              <span>
                <LockKeyhole size={17} />
                <input
                  autoComplete="new-password"
                  minLength={8}
                  name="confirm-password"
                  required
                  value={recoveryForm.confirmPassword}
                  onChange={(event) => setRecoveryForm({ ...recoveryForm, confirmPassword: event.target.value })}
                  type="password"
                />
              </span>
            </label>
            <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">
              <Save size={17} />
              {recoveryCopy.submit}
            </button>
            <button className="link-button" onClick={() => window.location.assign('/')} type="button">
              {recoveryCopy.back}
            </button>
          </form>
        ) : (
          <>
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
                {companyMode === 'signup' && (
                  <div className="legal-checkbox-stack">
                    <label className="legal-check">
                      <input
                        checked={companyForm.termsAccepted}
                        onChange={(event) => setCompanyForm({ ...companyForm, termsAccepted: event.target.checked })}
                        required
                        type="checkbox"
                      />
                      <span>
                        Accetto Termini e Condizioni SaaS Vygo.
                        <span className="legal-link-row">
                          <LegalReadButton documentId="terms" onOpen={setOpenLegalDocument} />
                        </span>
                      </span>
                    </label>
                    <label className="legal-check">
                      <input
                        checked={companyForm.privacyAccepted}
                        onChange={(event) => setCompanyForm({ ...companyForm, privacyAccepted: event.target.checked })}
                        required
                        type="checkbox"
                      />
                      <span>
                        Ho letto l Informativa Privacy.
                        <span className="legal-link-row">
                          <LegalReadButton documentId="privacy" onOpen={setOpenLegalDocument} />
                        </span>
                      </span>
                    </label>
                    <label className="legal-check">
                      <input
                        checked={companyForm.marketingAccepted}
                        onChange={(event) => setCompanyForm({ ...companyForm, marketingAccepted: event.target.checked })}
                        type="checkbox"
                      />
                      <span>Voglio ricevere comunicazioni commerciali. Facoltativo.</span>
                    </label>
                  </div>
                )}
                <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">
                  <KeyRound size={17} />
                  {companyMode === 'signup' ? t('auth.signupButton') : t('auth.signinButton')}
                </button>
                {companyMode === 'signin' && (
                  <button
                    className="link-button"
                    disabled={isSubmitting}
                    onClick={sendCompanyRecoveryEmail}
                    type="button"
                  >
                    {recoveryCopy.forgot}
                  </button>
                )}
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
          </>
        )}

        {status && <p className="auth-status">{status}</p>}
        {!isSupabaseConfigured && (
          <p className="auth-demo-note">
            {t('auth.demoNote')}
          </p>
        )}
        </section>
      </section>

      <section className="public-section public-problem-section">
        <div className="public-section-heading">
          <p className="overline">{publicCopy.problem.overline}</p>
          <h2>{publicCopy.problem.title}</h2>
          <p>{publicCopy.problem.body}</p>
        </div>
        <div className="public-feature-grid">
          {publicCopy.problem.cards.map((card, index) => {
            const Icon = publicProblemIcons[index] ?? AlertTriangle
            return (
              <article key={card.title}>
                <Icon size={21} />
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="public-section public-value-section">
        <div className="public-section-heading">
          <p className="overline">{publicCopy.value.overline}</p>
          <h2>{publicCopy.value.title}</h2>
          <p>{publicCopy.value.body}</p>
        </div>
        <div className="public-feature-grid">
          {publicCopy.value.cards.map((card, index) => {
            const Icon = publicValueIcons[index] ?? ShieldCheck
            return (
              <article key={card.title}>
                <Icon size={21} />
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="public-section public-workflow">
        <div className="public-section-heading">
          <p className="overline">{publicCopy.setup.overline}</p>
          <h2>{publicCopy.setup.title}</h2>
          <p>{publicCopy.setup.body}</p>
        </div>
        <div className="public-steps">
          {publicCopy.setup.steps.map((step, index) => {
            const Icon = publicSetupIcons[index] ?? CheckCircle2
            return (
              <div key={step.title}>
                <Icon size={20} />
                <strong>{step.title}</strong>
                <span>{step.body}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="public-section" id="prezzi">
        <div className="public-section-heading">
          <p className="overline">{publicCopy.pricing.overline}</p>
          <h2>{publicCopy.pricing.title}</h2>
          <p>{publicCopy.pricing.body}</p>
        </div>
        <div className="public-price-grid">
          {publicCopy.pricing.plans.map((plan) => (
            <article className={plan.featured ? 'is-featured' : ''} key={plan.name}>
              <span>{plan.name}</span>
              <strong>{plan.price}</strong>
              <p>{plan.description}</p>
              <ul>
                {plan.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <button className={plan.featured ? 'primary-button' : 'secondary-button'} onClick={() => openAccess('company', 'signup')} type="button">{plan.cta}</button>
            </article>
          ))}
        </div>
        <div className="public-extra-pricing">
          {publicCopy.pricing.extras.map((item) => (
            <div key={item.title}><strong>{item.title}</strong><span>{item.body}</span></div>
          ))}
        </div>
      </section>

      <section className="public-section public-faq" id="faq">
        <div className="public-section-heading">
          <p className="overline">{publicCopy.faq.overline}</p>
          <h2>{publicCopy.faq.title}</h2>
        </div>
        <div className="public-faq-list">
          {publicCopy.faq.items.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>
      <LegalDocumentModal documentId={openLegalDocument} onClose={() => setOpenLegalDocument('')} />
    </main>
  )
}

function Sidebar({ activeView, chatNotificationCount = 0, isAdminSession = false, notificationCount, onHome, onNavigate, onSignOut, session, t }) {
  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'records', label: t('nav.records'), icon: Users },
    { id: 'notifications', label: t('nav.notifications'), icon: Bell },
    { id: 'chat', label: t('nav.chat'), icon: Mail },
    { id: 'reports', label: t('nav.reports'), icon: FileText },
    { id: 'support', label: t('nav.support'), icon: BookOpen },
    { id: 'settings', label: t('nav.settings'), icon: SettingsIcon },
    ...(isAdminSession ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck }] : []),
  ]

  return (
    <aside className="sidebar" aria-label="Navigazione principale">
      <button className="brand brand-button" onClick={onHome} type="button">
        <div className="brand-mark sidebar-brand-mark">
          <VygoMark />
        </div>
        <div className="sidebar-brand-copy">
          <img className="sidebar-brand-wordmark" src="/brand/vygo-logo-horizontal.png" alt="Vygo" />
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
      <div className="topbar-heading">
        <span className="topbar-brand-badge" aria-hidden="true">
          <span className="topbar-brand-icon">
            <VygoMark />
          </span>
          <img className="topbar-brand-full" src="/brand/vygo-logo-horizontal.png" alt="" />
        </span>
        <div className="topbar-heading-copy">
          <p className="overline">{t('session.companyArea')}</p>
          <h1>{t('session.dashboardTitle')}</h1>
        </div>
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
  const [filter, setFilter] = useState('unread')
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
    const isRead = isVehicleCheckArchived(check, acknowledgedCheckIds)
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
  const criticalNotifications = unreadNotifications.filter((notification) => notification.isCritical)
  const visibleNotifications = notifications.filter((notification) => {
    if (filter === 'critical') return notification.isCritical && !notification.isRead
    return !notification.isRead
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
            <button className={filter === 'unread' ? 'is-active' : ''} onClick={() => setFilter('unread')} type="button">
              {t('operations.inbox')} ({unreadNotifications.length})
            </button>
            <button className={filter === 'critical' ? 'is-active' : ''} onClick={() => setFilter('critical')} type="button">
              {t('operations.critical')} ({criticalNotifications.length})
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

function VygoMark() {
  return (
    <img className="camion-logo-mark" src={camionChiaroIconUrl} alt="Vygo" />
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

function AdminWorkspace({
  isAdminSession,
  isLoading,
  onRefresh,
  onUpdateCompany,
  overview,
  sessionEmail,
  statusMessage,
}) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [adminCopyStatus, setAdminCopyStatus] = useState('')
  const [adminSaveStatus, setAdminSaveStatus] = useState('')
  const [adminForm, setAdminForm] = useState({
    adminNextFollowUp: '',
    adminNotes: '',
    adminOwnerName: '',
    adminPriority: 'normal',
    adminSalesStage: 'active',
    billingPlan: 'starter',
    billingStatus: 'pending',
  })
  const companies = useMemo(() => overview?.companies ?? [], [overview?.companies])
  const summary = overview?.summary ?? {
    activeCompanies: 0,
    alertCount: 0,
    companyCount: 0,
    costMonthCents: 0,
    driverCount: 0,
    fleetCount: 0,
    invoiceMonthCents: 0,
    lifetimeRevenueCents: 0,
    mrrCents: 0,
    storageBytes: 0,
  }
  const healthLabels = {
    attention: 'Da seguire',
    billing: 'Pagamento',
    internal: 'Admin',
    ok: 'Regolare',
    storage: 'Spazio alto',
  }
  const healthDescriptions = {
    attention: 'Ha criticita operative aperte.',
    billing: 'Pagamento o piano da verificare.',
    internal: 'Account interno Vygo: non entra nei clienti paganti.',
    ok: 'Nessuna criticita prioritaria.',
    storage: 'Spazio utilizzato vicino al limite.',
  }
  const filteredCompanies = useMemo(() => companies.filter((company) => {
    const matchesFilter = filter === 'all' || company.health === filter
    const cleanSearch = searchTerm.trim().toLowerCase()
    const matchesSearch = !cleanSearch || [
      company.name,
      company.billingEmail,
      company.vatNumber,
      company.headquarters,
    ].some((value) => String(value ?? '').toLowerCase().includes(cleanSearch))

    return matchesFilter && matchesSearch
  }), [companies, filter, searchTerm])
  const filterButtons = useMemo(() => [
    { id: 'all', label: 'Tutte', value: companies.length },
    { id: 'attention', label: 'Da seguire', value: companies.filter((company) => company.health === 'attention').length },
    { id: 'billing', label: 'Pagamenti', value: companies.filter((company) => company.health === 'billing').length },
    { id: 'internal', label: 'Interni', value: companies.filter((company) => company.health === 'internal').length },
    { id: 'storage', label: 'Spazio alto', value: companies.filter((company) => company.health === 'storage').length },
    { id: 'ok', label: 'Regolari', value: companies.filter((company) => company.health === 'ok').length },
  ], [companies])
  const attentionCompanyCount = companies.filter((company) => company.health !== 'ok').length
  const storageLimitTotalBytes = companies.reduce((total, company) => total + Number(company.storageLimitBytes ?? 0), 0)
  const storageUsagePercent = storageLimitTotalBytes
    ? Math.min(100, Math.round((Number(summary.storageBytes ?? 0) / storageLimitTotalBytes) * 100))
    : 0
  const activePayingCompanyCount = companies.filter((company) => (
    !company.isInternalAdminCompany
    && company.billingStatus === 'active'
    && Number(company.monthlyPlanCents ?? 0) > 0
  )).length
  const estimatedStripeCostCents = Math.round(Number(summary.mrrCents ?? 0) * 0.018) + activePayingCompanyCount * 25
  const estimatedSupportCostCents = activePayingCompanyCount * vygoSupportCostPerCompanyCents
  const estimatedMonthlyCostCents = vygoBaseMonthlyCostCents + estimatedStripeCostCents + estimatedSupportCostCents
  const estimatedMonthlyMarginCents = Number(summary.mrrCents ?? 0) - estimatedMonthlyCostCents
  const estimatedTaxReserveCents = Math.max(0, Math.round(estimatedMonthlyMarginCents * vygoEstimatedTaxReserveRate))
  const estimatedNetAfterTaxCents = estimatedMonthlyMarginCents - estimatedTaxReserveCents
  const firstSalesTargetGap = Math.max(0, vygoFirstSalesTarget - activePayingCompanyCount)
  const firstSalesTargetMrrCents = vygoFirstSalesTarget * vygoFleet10MonthlyPriceCents
  const breakEvenFleet10Clients = Math.max(
    1,
    Math.ceil(vygoBaseMonthlyCostCents / Math.max(1, vygoFleet10MonthlyPriceCents - vygoSupportCostPerCompanyCents - Math.round(vygoFleet10MonthlyPriceCents * 0.018) - 25)),
  )
  const economyScenarios = vygoEconomyScenarios.map((clientCount) => {
    const revenueCents = clientCount * vygoFleet10MonthlyPriceCents
    const costsCents =
      vygoBaseMonthlyCostCents
      + Math.round(revenueCents * 0.018)
      + clientCount * 25
      + clientCount * vygoSupportCostPerCompanyCents
    const marginCents = revenueCents - costsCents
    const taxReserveCents = Math.max(0, Math.round(marginCents * vygoEstimatedTaxReserveRate))
    return {
      clientCount,
      costsCents,
      marginCents,
      netAfterTaxCents: marginCents - taxReserveCents,
      revenueCents,
      taxReserveCents,
    }
  })
  const selectedCompany =
    filteredCompanies.find((company) => company.id === selectedCompanyId) ??
    companies.find((company) => company.id === selectedCompanyId) ??
    filteredCompanies[0] ??
    companies[0] ??
    null

  useEffect(() => {
    let timerId = 0

    if (!filteredCompanies.length) {
      timerId = window.setTimeout(() => setSelectedCompanyId(''), 0)
      return () => window.clearTimeout(timerId)
    }

    if (!filteredCompanies.some((company) => company.id === selectedCompanyId)) {
      timerId = window.setTimeout(() => setSelectedCompanyId(filteredCompanies[0].id), 0)
    }

    return () => window.clearTimeout(timerId)
  }, [filteredCompanies, selectedCompanyId])

  useEffect(() => {
    if (!selectedCompany) return

    const timerId = window.setTimeout(() => {
      setAdminForm({
        adminNextFollowUp: selectedCompany.adminNextFollowUp ?? '',
        adminNotes: selectedCompany.adminNotes ?? '',
        adminOwnerName: selectedCompany.adminOwnerName ?? '',
        adminPriority: selectedCompany.adminPriority ?? 'normal',
        adminSalesStage: selectedCompany.adminSalesStage ?? 'active',
        billingPlan: selectedCompany.billingPlan ?? 'starter',
      billingStatus: selectedCompany.isInternalAdminCompany ? 'active' : selectedCompany.billingStatus ?? 'pending',
      })
      setAdminSaveStatus('')
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [selectedCompany])

  async function copyAdminValue(value, label) {
    if (!value) return

    await navigator.clipboard?.writeText(value)
    setAdminCopyStatus(`${label} copiato.`)
    window.setTimeout(() => setAdminCopyStatus(''), 1600)
  }

  function getAdminRecommendation(company) {
    if (!company) return 'Seleziona un cliente per vedere la prossima azione consigliata.'
    if (company.isInternalAdminCompany) return 'Account interno: non richiede pagamento. Usalo per amministrare Vygo.'
    if (company.adminPriority === 'urgent') return 'Priorita urgente: contatta il cliente e aggiorna note e prossimo follow-up.'
    if (company.adminSalesStage === 'risk') return 'Cliente a rischio: verifica motivazione, pagamento, uso reale e blocchi operativi.'
    if (company.health === 'billing') return 'Verifica pagamento, piano e periodo: questo cliente non deve restare bloccato per errore.'
    if (company.health === 'attention') return 'Apri un contatto operativo: ci sono guasti, check, scadenze o documenti da far sistemare.'
    if (company.health === 'storage') return 'Proponi upgrade spazio o pulizia allegati prima che arrivi al limite.'
    return 'Cliente regolare: controlla ultimo utilizzo e valuta storage extra, avviamento guidato o supporto dedicato.'
  }

  function updateAdminForm(field, value) {
    setAdminForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSaveAdminCompany(event) {
    event.preventDefault()
    if (!selectedCompany || !onUpdateCompany) return

    setAdminSaveStatus('Salvataggio in corso...')
    const { billingPlan, billingStatus, ...crmOnlyForm } = adminForm
    const result = await onUpdateCompany(
      selectedCompany.id,
      selectedCompany.isInternalAdminCompany ? crmOnlyForm : { billingPlan, billingStatus, ...crmOnlyForm },
    )

    if (result?.error) {
      setAdminSaveStatus(result.error.message)
      return
    }

    setAdminSaveStatus('Cliente aggiornato.')
  }

  if (!isAdminSession) {
    return (
      <section className="admin-workspace">
        <div className="panel admin-locked-panel">
          <ShieldCheck size={28} />
          <div>
            <p className="overline">Vygo Admin</p>
            <h2>Pannello riservato</h2>
            <p>Questo accesso e riservato alle email admin. Account attuale: {sessionEmail || 'non disponibile'}.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-workspace" aria-label="Pannello admin Vygo">
      <div className="panel admin-hero-panel">
        <div>
          <h2>Controllo clienti</h2>
          <span>Ricavi, aziende attive, utilizzo e criticita operative in una sola schermata.</span>
        </div>
        <button className="primary-button compact-button" disabled={isLoading} onClick={onRefresh} type="button">
          <RadioTower size={16} />
          {isLoading ? 'Aggiorno...' : 'Aggiorna'}
        </button>
      </div>

      <div className="admin-kpi-grid">
        <article className="is-money">
          <Banknote size={20} />
          <strong>{formatMoneyCents(summary.mrrCents, 'EUR')}</strong>
          <span>Guadagno mensile stimato</span>
        </article>
        <article className="is-money">
          <BadgeCheck size={20} />
          <strong>{formatMoneyCents(summary.lifetimeRevenueCents, 'EUR')}</strong>
          <span>Incassato da sempre</span>
        </article>
        <article>
          <Building2 size={20} />
          <strong>{summary.companyCount}</strong>
          <span>Aziende</span>
        </article>
        <article className={firstSalesTargetGap ? 'is-target' : 'is-money'}>
          <RadioTower size={20} />
          <strong>{firstSalesTargetGap ? `${firstSalesTargetGap} mancanti` : 'Raggiunto'}</strong>
          <span>Obiettivo 10 clienti · {formatMoneyCents(firstSalesTargetMrrCents, 'EUR')} MRR</span>
        </article>
        <article className={attentionCompanyCount ? 'is-warning' : ''}>
          <AlertTriangle size={20} />
          <strong>{attentionCompanyCount}</strong>
          <span>Da seguire</span>
        </article>
        <article>
          <Upload size={20} />
          <strong>{storageUsagePercent}%</strong>
          <span>{formatBytes(summary.storageBytes)} usati</span>
        </article>
      </div>

      <p className="admin-status-line">
        {statusMessage || 'Pannello aggiornato.'} · Fatture incassate questo mese: {formatMoneyCents(summary.invoiceMonthCents, 'EUR')} · Aziende attive: {summary.activeCompanies}
      </p>

      <section className="admin-economy-panel" aria-label="Andamento economico Vygo">
        <div className="admin-economy-head">
          <div>
            <p className="overline">Vygo azienda</p>
            <h3>Andamento economico</h3>
          </div>
          <span>{estimatedMonthlyMarginCents >= 0 ? 'Sopra pareggio stimato' : 'Sotto pareggio stimato'}</span>
        </div>
        <div className="admin-economy-metrics">
          <article>
            <span>MRR attuale</span>
            <strong>{formatMoneyCents(summary.mrrCents, 'EUR')}</strong>
          </article>
          <article>
            <span>Costi stimati mese</span>
            <strong>{formatMoneyCents(estimatedMonthlyCostCents, 'EUR')}</strong>
          </article>
          <article className={estimatedMonthlyMarginCents >= 0 ? 'is-positive' : 'is-negative'}>
            <span>Margine stimato</span>
            <strong>{formatMoneyCents(estimatedMonthlyMarginCents, 'EUR')}</strong>
          </article>
          <article>
            <span>Riserva tasse 35%</span>
            <strong>{formatMoneyCents(estimatedTaxReserveCents, 'EUR')}</strong>
          </article>
          <article className={estimatedNetAfterTaxCents >= 0 ? 'is-positive' : 'is-negative'}>
            <span>Netto prudente</span>
            <strong>{formatMoneyCents(estimatedNetAfterTaxCents, 'EUR')}</strong>
          </article>
          <article>
            <span>Pareggio Fleet 10</span>
            <strong>{breakEvenFleet10Clients} clienti</strong>
          </article>
        </div>
        <div className="admin-economy-grid">
          <div className="admin-cost-list">
            <strong>Costi fissi inseriti</strong>
            {vygoBaseMonthlyCostItems.map((item) => (
              <span key={`${item.category}-${item.label}`}>
                <small>{item.category}</small>
                <b>{item.label}</b>
                <em>{formatMoneyCents(item.cents, 'EUR')}</em>
              </span>
            ))}
          </div>
          <div className="admin-scenario-list">
            <strong>Scenari Fleet 10</strong>
            {economyScenarios.map((scenario) => (
              <span key={scenario.clientCount}>
                <b>{scenario.clientCount} clienti</b>
                <small>{formatMoneyCents(scenario.revenueCents, 'EUR')} MRR</small>
                <em>{formatMoneyCents(scenario.netAfterTaxCents, 'EUR')} netto stimato</em>
              </span>
            ))}
          </div>
        </div>
        <p className="admin-economy-note">
          Stima interna: IVA esclusa dai ricavi, tasse calcolate come riserva prudente sul margine positivo. Il commercialista dovra confermare regime, IRES, IRAP, eventuali compensi e dividendi.
        </p>
      </section>

      <div className="admin-layout">
        <section className="admin-client-panel" aria-label="Clienti Vygo">
          <div className="admin-toolbar">
            <label className="admin-search">
              <Search size={16} />
              <input
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Cerca azienda, email, partita IVA..."
                value={searchTerm}
              />
            </label>
            <div className="admin-filter-row">
              {filterButtons.map((button) => (
                <button
                  className={filter === button.id ? 'is-active' : ''}
                  key={button.id}
                  onClick={() => setFilter(button.id)}
                  type="button"
                >
                  <span>{button.label}</span>
                  <strong>{button.value}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-client-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Stato</th>
                  <th>Piano</th>
                  <th>Canone</th>
                  <th>Flotta</th>
                  <th>Alert</th>
                  <th>Spazio</th>
                  <th>Ultima attività</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr
                    className={company.id === selectedCompany?.id ? 'is-selected' : ''}
                    key={company.id}
                    onClick={() => setSelectedCompanyId(company.id)}
                  >
                    <td>
                      <strong>{company.name}</strong>
                      <span>{company.billingEmail || company.vatNumber || 'Dati fiscali mancanti'}</span>
                      <small>
                        {getOptionLabel(adminSalesStageOptions, company.adminSalesStage, 'Cliente attivo')} · {getOptionLabel(adminPriorityOptions, company.adminPriority, 'Normale')}
                      </small>
                    </td>
                    <td>
                      <b className={`admin-health-dot is-${company.health}`}>{healthLabels[company.health] ?? company.health}</b>
                    </td>
                    <td>
                      <strong>{getBillingPlanLabel(company.billingPlan)}</strong>
                      <span>{getBillingStatusLabel(company.billingStatus)}</span>
                    </td>
                    <td>{formatMoneyCents(company.monthlyPlanCents, 'EUR')}</td>
                    <td>
                      <strong>{company.fleetCount}</strong>
                      <span>{company.driverCount + company.peopleCount} utenti</span>
                    </td>
                    <td>{company.alertCount}</td>
                    <td>
                      <strong>{company.storageUsagePercent}%</strong>
                      <span>{formatBytes(company.storageBytes)}</span>
                    </td>
                    <td>{company.lastActivityAt ? formatShortDateTime(company.lastActivityAt) : formatDate(company.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredCompanies.length ? (
              <div className="admin-empty-panel">
                <ShieldCheck size={24} />
                <strong>Nessuna azienda trovata</strong>
                <span>Modifica filtri o ricerca per vedere altri clienti.</span>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="admin-detail-panel" aria-label="Dettaglio cliente selezionato">
          {selectedCompany ? (
            <>
              <div className="admin-detail-head">
                <span className={`admin-health-dot is-${selectedCompany.health}`}>
                  {healthLabels[selectedCompany.health] ?? selectedCompany.health}
                </span>
                <h3>{selectedCompany.name}</h3>
                <p>{healthDescriptions[selectedCompany.health] ?? 'Cliente da verificare.'}</p>
              </div>

              <div className="admin-detail-grid">
                <div>
                  <span>Piano</span>
                  <strong>{getBillingPlanLabel(selectedCompany.billingPlan)}</strong>
                </div>
                <div>
                  <span>Pagamento</span>
                  <strong>{getBillingStatusLabel(selectedCompany.billingStatus)}</strong>
                </div>
                <div>
                  <span>Canone mensile</span>
                  <strong>{formatMoneyCents(selectedCompany.monthlyPlanCents, 'EUR')}</strong>
                </div>
                <div>
                  <span>Incassato storico</span>
                  <strong>{formatMoneyCents(selectedCompany.lifetimeRevenueCents, 'EUR')}</strong>
                </div>
                <div>
                  <span>Incasso mese</span>
                  <strong>{formatMoneyCents(selectedCompany.invoiceMonthCents, 'EUR')}</strong>
                </div>
                <div>
                  <span>Spazio</span>
                  <strong>{selectedCompany.storageUsagePercent}%</strong>
                </div>
              </div>

              <form className="admin-crm-form" onSubmit={handleSaveAdminCompany}>
                <div className="admin-crm-heading">
                  <strong>Gestione cliente</strong>
                  <span>{selectedCompany.adminUpdatedAt ? `Aggiornato ${formatShortDateTime(selectedCompany.adminUpdatedAt)}` : 'Note interne Vygo'}</span>
                </div>

                <div className="admin-crm-grid">
                  <label>
                    <span>Piano</span>
                    <select
                      disabled={selectedCompany.isInternalAdminCompany}
                      value={adminForm.billingPlan}
                      onChange={(event) => updateAdminForm('billingPlan', event.target.value)}
                    >
                      {adminBillingPlanOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Pagamento</span>
                    <select
                      disabled={selectedCompany.isInternalAdminCompany}
                      value={adminForm.billingStatus}
                      onChange={(event) => updateAdminForm('billingStatus', event.target.value)}
                    >
                      {adminBillingStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Fase</span>
                    <select value={adminForm.adminSalesStage} onChange={(event) => updateAdminForm('adminSalesStage', event.target.value)}>
                      {adminSalesStageOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Priorita</span>
                    <select value={adminForm.adminPriority} onChange={(event) => updateAdminForm('adminPriority', event.target.value)}>
                      {adminPriorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Referente interno</span>
                    <input
                      onChange={(event) => updateAdminForm('adminOwnerName', event.target.value)}
                      placeholder="Es. Adriano"
                      value={adminForm.adminOwnerName}
                    />
                  </label>
                  <label>
                    <span>Prossimo contatto</span>
                    <input
                      onChange={(event) => updateAdminForm('adminNextFollowUp', event.target.value)}
                      type="date"
                      value={adminForm.adminNextFollowUp}
                    />
                  </label>
                </div>

                {selectedCompany.isInternalAdminCompany ? (
                  <p className="admin-internal-note">Account interno Vygo: non viene conteggiato nei clienti paganti e non richiede abbonamento.</p>
                ) : null}

                <label className="admin-note-field">
                  <span>Note interne</span>
                  <textarea
                    onChange={(event) => updateAdminForm('adminNotes', event.target.value)}
                    placeholder="Telefonata, richiesta, promessa commerciale, cosa fare dopo..."
                    value={adminForm.adminNotes}
                  />
                </label>

                <div className="admin-crm-actions">
                  <button className="primary-button compact-button" disabled={isLoading} type="submit">
                    <Save size={15} />
                    Salva gestione
                  </button>
                  {adminSaveStatus ? <span>{adminSaveStatus}</span> : null}
                </div>
              </form>

              <div className="admin-detail-alerts">
                <strong>Situazione operativa</strong>
                <span>Guasti aperti: {selectedCompany.openFaultCount}</span>
                <span>Check critici: {selectedCompany.urgentCheckCount}</span>
                <span>Scadenze: {selectedCompany.urgentDeadlineCount}</span>
                <span>Documenti scaduti: {selectedCompany.documentExpiredCount}</span>
                <span>Chat non lette: {selectedCompany.unreadChatCount}</span>
              </div>

              <div className="admin-next-action">
                <strong>Prossima azione</strong>
                <p>{getAdminRecommendation(selectedCompany)}</p>
              </div>

              <div className="admin-action-row">
                <button className="secondary-button compact-button" onClick={() => copyAdminValue(selectedCompany.id, 'ID cliente')} type="button">
                  <Copy size={15} />
                  Copia ID
                </button>
                <button className="secondary-button compact-button" onClick={() => copyAdminValue(selectedCompany.billingEmail || selectedCompany.name, 'Riferimento cliente')} type="button">
                  <Mail size={15} />
                  Copia email
                </button>
                <button className="primary-button compact-button" disabled={isLoading} onClick={onRefresh} type="button">
                  <RadioTower size={15} />
                  Aggiorna
                </button>
              </div>
              {adminCopyStatus ? <p className="admin-copy-status">{adminCopyStatus}</p> : null}
            </>
          ) : (
            <div className="admin-empty-panel">
              <ShieldCheck size={24} />
              <strong>Seleziona un cliente</strong>
              <span>Qui vedrai dettagli e prossima azione.</span>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

function ReportsWorkspace({
  acknowledgedCheckIds = [],
  assetRecords = [],
  companyName = 'Azienda',
  complianceItems = [],
  costEntryRecords = [],
  driverRecords = [],
  faultReportRecords = [],
  onCreateCostEntry,
  onDeleteCostEntry,
  onUpdateCostEntry,
  onUpdateFaultStatus,
  resetCostFormKey = 0,
  startAddingCostKey = 0,
  vehicleCheckRecords = [],
  vehicleRecords = [],
}) {
  const { language } = useI18n()
  const defaultCurrency = getDefaultCurrency(language)
  const reportRows = buildCostReportRows(faultReportRecords, costEntryRecords)
  const monthStart = getFaultCostPeriodStart('month')
  const monthRows = reportRows.filter((row) => new Date(row.date) >= monthStart)
  const fineRows = reportRows.filter((row) => row.category === 'fine')
  const vehicleRows = reportRows.filter((row) => row.vehicleId)
  const driverRows = reportRows.filter((row) => row.driverId)
  const monthTotalCents = monthRows.reduce((total, row) => total + Number(row.amountCents ?? 0), 0)
  const fleetHealthRows = getFleetHealthRows({
    complianceItems,
    costRows: reportRows,
    faultReportRecords,
    vehicleCheckRecords,
    vehicleRecords,
  })
  const averageFleetHealthScore = fleetHealthRows.length
    ? Math.round(fleetHealthRows.reduce((total, row) => total + row.score, 0) / fleetHealthRows.length)
    : 100
  const criticalFleetHealthRows = fleetHealthRows.filter((row) => row.score < 62)

  return (
    <section className="reports-workspace" aria-label="Report aziendali">
      <div className="panel reports-hero-panel">
        <div className="reports-hero-copy">
          <h2>Stampa solo quello che ti serve</h2>
          <span>Costi, multe, manutenzioni e spese per targa, autista, attrezzatura o periodo. Prima scegli la domanda, poi scarichi CSV o stampi il report.</span>
        </div>
        <span className="reports-hero-icon" aria-hidden="true">
          <FileText size={28} />
        </span>
      </div>
      <div className="reports-kpi-grid">
        <article>
          <strong>{formatMoneyCents(monthTotalCents, defaultCurrency)}</strong>
          <span>spese del mese</span>
        </article>
        <article>
          <strong>{fineRows.length}</strong>
          <span>multe registrate</span>
        </article>
        <article>
          <strong>{vehicleRows.length}</strong>
          <span>voci collegate a targhe</span>
        </article>
        <article>
          <strong>{driverRows.length}</strong>
          <span>voci collegate ad autisti</span>
        </article>
      </div>
      <section className="fleet-health-panel" aria-label="Indice salute flotta">
        <div className="fleet-health-head">
          <div>
            <span>Controllo direzionale</span>
            <h3>Indice salute flotta</h3>
            <p>Un punteggio rapido che combina guasti, check critici, scadenze e costi del mese.</p>
          </div>
          <strong className={`fleet-health-main-score tone-${averageFleetHealthScore >= 82 ? 'success' : averageFleetHealthScore >= 62 ? 'warning' : 'danger'}`}>
            {averageFleetHealthScore}
          </strong>
        </div>
        {fleetHealthRows.length > 0 ? (
          <div className="fleet-health-grid">
            {fleetHealthRows.slice(0, 6).map((row) => (
              <article className={`fleet-health-card tone-${row.tone}`} key={row.vehicle.id}>
                <div>
                  <strong>{row.vehicle.plate || 'Targa non inserita'}</strong>
                  <span>{[getFleetTypeLabel(row.vehicle.fleetType), row.vehicle.model].filter(Boolean).join(' · ') || 'Mezzo'}</span>
                </div>
                <b>{row.score}</b>
                <p>{row.issues.length ? row.issues.join(' · ') : 'Nessuna criticita rilevante'}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="archive-note">Aggiungi mezzi, scadenze, check e costi per generare l indice salute flotta.</p>
        )}
        <div className="fleet-health-foot">
          <span>{criticalFleetHealthRows.length} mezzi sotto soglia attenzione</span>
          <span>{fleetHealthRows.length ? `${fleetHealthRows.length} mezzi analizzati` : 'Nessun mezzo analizzato'}</span>
        </div>
      </section>
      <FaultCostReport
        acknowledgedCheckIds={acknowledgedCheckIds}
        assetRecords={assetRecords}
        companyName={companyName}
        complianceItems={complianceItems}
        costEntryRecords={costEntryRecords}
        driverRecords={driverRecords}
        faultReportRecords={faultReportRecords}
        onCreateCostEntry={onCreateCostEntry}
        onDeleteCostEntry={onDeleteCostEntry}
        onUpdateCostEntry={onUpdateCostEntry}
        onUpdateFaultStatus={onUpdateFaultStatus}
        reportMode="reports"
        resetCostFormKey={resetCostFormKey}
        startAddingCostKey={startAddingCostKey}
        vehicleCheckRecords={vehicleCheckRecords}
        vehicleRecords={vehicleRecords}
      />
    </section>
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
  const storageLimitBytes = getCompanyStorageLimitBytes(companyProfile)
  const storageUsagePercent = getStorageUsagePercent(companyStorageSummary, companyProfile)
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
              onClick={onOpenBillingPortal}
              type="button"
            >
              <BadgeCheck size={16} />
              {companyProfile.billingProvider === 'stripe' && companyProfile.billingCustomerId ? 'Gestisci pagamento' : 'Richiedi upgrade'}
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

function HeroPanel({
  activeDriverCount,
  activeVehicleCount,
  companyName,
  companyLogoUrl,
  costMonthCents = 0,
  costMonthValue = '0 €',
  costRepairCount = 0,
  criticalCheckCount,
  fleetHealthCriticalCount = 0,
  fleetHealthScore = 100,
  notificationCount,
  onOpenCostReport,
  onOpenCriticalChecks,
  onOpenDeadlineWindow,
  onOpenFleetHealth,
  onOpenFaults,
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
    {
      detail: t('hero.priorityCostDetail', { count: costRepairCount }),
      icon: Banknote,
      isActive: costMonthCents > 0,
      isMoney: true,
      label: t('hero.priorityCostLabel'),
      onClick: onOpenCostReport,
      tone: 'cost',
      value: costMonthValue,
    },
  ]
  const criticalDeadlineCount = Number(summary?.critical ?? 0)
  const next30DeadlineCount = Number(summary?.next30 ?? 0)
  const openWorkCount = criticalCheckCount + openFaultCount + criticalDeadlineCount
  const costPenalty = Math.min(18, Math.floor(Number(costMonthCents || 0) / 150000))
  const operationalControlScore = Math.max(
    0,
    100
      - criticalCheckCount * 16
      - openFaultCount * 13
      - criticalDeadlineCount * 14
      - Math.min(next30DeadlineCount, 8) * 3
      - costPenalty,
  )
  const controlScore = Math.max(0, Math.min(operationalControlScore, Number(fleetHealthScore ?? 100)))
  const radarTone = controlScore >= 82 ? 'success' : controlScore >= 62 ? 'warning' : 'danger'
  const fleetHealthTone = fleetHealthScore >= 82 ? 'success' : fleetHealthScore >= 62 ? 'warning' : 'danger'
  const fleetHealthPercentLabel = `${fleetHealthScore}%`
  const radarAction = (() => {
    if (criticalCheckCount > 0) {
      return {
        icon: AlertTriangle,
        label: t('hero.priorityCriticalLabel'),
        onClick: onOpenCriticalChecks,
        value: `${criticalCheckCount}`,
      }
    }
    if (openFaultCount > 0) {
      return {
        icon: Wrench,
        label: t('hero.radarOpenFaults'),
        onClick: onOpenFaults,
        value: `${openFaultCount}`,
      }
    }
    if (next30DeadlineCount > 0) {
      return {
        icon: CalendarClock,
        label: t('hero.radarOpenDeadlines'),
        onClick: onOpenDeadlineWindow,
        value: `${next30DeadlineCount}`,
      }
    }
    if (fleetHealthCriticalCount > 0) {
      return {
        icon: Gauge,
        label: t('hero.radarFleetHealth'),
        onClick: onOpenFleetHealth || onOpenCostReport,
        value: fleetHealthPercentLabel,
      }
    }
    if (costMonthCents > 0) {
      return {
        icon: Banknote,
        label: t('hero.radarOpenCosts'),
        onClick: onOpenCostReport,
        value: costMonthValue,
      }
    }

    return {
      icon: ShieldCheck,
      label: t('hero.radarAllGood'),
      onClick: onOpenNotifications,
      value: 'OK',
    }
  })()

  return (
    <section className="hero-panel" aria-label={t('hero.aria')}>
      <div className="hero-copy">
        <div className="company-title-row">
          <EntityAvatar imageUrl={companyLogoUrl} name={companyName} variant="company" />
          <h2>{companyName}</h2>
        </div>
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
        <div className={`executive-radar tone-${radarTone}`} aria-label={t('hero.radarTitle')}>
          <div className="executive-radar-head">
            <span>
              <Gauge size={16} />
              {t('hero.radarTitle')}
            </span>
            <strong>{t('hero.radarSubtitle')}</strong>
          </div>
          <div className="executive-radar-grid">
            <article>
              <small>{t('hero.radarIndex')}</small>
              <b>{controlScore}%</b>
            </article>
            <article>
              <small>{t('hero.radarOpen')}</small>
              <b>{openWorkCount}</b>
              <em>{t('hero.radarOpenDetail')}</em>
            </article>
            <article>
              <small>{t('hero.radarCost')}</small>
              <b>{costMonthValue}</b>
              <em>{t('hero.radarCostDetail', { count: costRepairCount })}</em>
            </article>
            <article className={`tone-${fleetHealthTone}`}>
              <small>{t('hero.radarFleetHealth')}</small>
              <b>{fleetHealthPercentLabel}</b>
              <em>{t('hero.radarFleetHealthDetail', { count: fleetHealthCriticalCount })}</em>
            </article>
          </div>
          <button className="executive-radar-action" onClick={radarAction.onClick} type="button">
            <span>
              <radarAction.icon size={16} />
              {t('hero.radarAction')}
            </span>
            <strong>{radarAction.label}</strong>
            <b>{radarAction.value}</b>
          </button>
        </div>
        <div className="hero-actions">
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
            className={`priority-card tone-${card.tone}${card.isActive ? ' is-active' : ''}${card.isMoney ? ' is-money' : ''}`}
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

function HomeCommandPanel({ actions = [], t }) {
  return (
    <section className="home-command-panel" aria-label={t('homeCommand.aria')}>
      <div className="home-command-header">
        <div>
          <h2>{t('homeCommand.title')}</h2>
        </div>
      </div>
      <div className="home-command-grid">
        {actions.map((action) => (
          <button
            aria-label={`${t('homeCommand.open')} ${action.label}`}
            className={`home-command-button tone-${action.tone ?? 'info'}`}
            key={action.label}
            onClick={action.onClick}
            type="button"
          >
            <span className="home-command-icon">
              <action.icon size={20} />
            </span>
            <span className="home-command-copy">
              <strong>{action.label}</strong>
              <small>{action.detail}</small>
            </span>
            {action.value !== '' && action.value !== null && action.value !== undefined && (
              <b className="home-command-value">{action.value}</b>
            )}
            <ChevronRight className="home-command-arrow" size={18} />
          </button>
        ))}
      </div>
    </section>
  )
}

function HomeStatusBar({ items = [] }) {
  return (
    <section className="home-status-bar" aria-label="Stato operativo">
      {items.map((item) => (
        <div className={`home-status-item tone-${item.tone ?? 'info'}`} key={item.label}>
          <span>
            <item.icon size={15} />
          </span>
          <small>{item.label}</small>
          <strong>{item.value}</strong>
        </div>
      ))}
    </section>
  )
}

function HomeAssistantStrip({
  companyName = 'Azienda',
  contextSummary = {},
  language = defaultLanguage,
  onOpenSupport,
  topics = [],
  t,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isTicketVisible, setIsTicketVisible] = useState(false)
  const [messages, setMessages] = useState(() => [
    {
      content: t('homeAssistant.initialMessage'),
      id: 'assistant-welcome',
      role: 'assistant',
    },
  ])
  const messageListRef = useRef(null)

  useEffect(() => {
    if (!isOpen || !messageListRef.current) return
    messageListRef.current.scrollTo({
      behavior: 'smooth',
      top: messageListRef.current.scrollHeight,
    })
  }, [isOpen, isSending, isTicketVisible, messages.length])

  async function sendAssistantMessage(rawMessage) {
    const cleanMessage = rawMessage.trim()
    if (!cleanMessage || isSending) return
    const baseMessageId = `${messages.length}-${cleanMessage.length}`

    const userMessage = {
      content: cleanMessage,
      id: `user-${baseMessageId}`,
      role: 'user',
    }
    const history = messages.slice(-10)

    setMessages((currentMessages) => [...currentMessages, userMessage])
    setInputValue('')
    setIsOpen(true)
    setIsSending(true)

    try {
      const response = await fetch('/.netlify/functions/ai-support', {
        body: JSON.stringify({
          companyContext: contextSummary,
          companyName,
          history,
          language,
          message: cleanMessage,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || t('homeAssistant.errorMessage'))
      }
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          content: payload.reply || t('homeAssistant.errorMessage'),
          id: `assistant-${baseMessageId}-${String(payload.reply || '').length}`,
          mode: payload.mode || 'guided',
          role: 'assistant',
        },
      ])
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          content: t('homeAssistant.errorMessage'),
          id: `assistant-error-${baseMessageId}`,
          role: 'assistant',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendAssistantMessage(inputValue)
  }

  function handleTopicClick(topic) {
    sendAssistantMessage(`${t('homeAssistant.quickHelp')} ${topic.label}`)
  }

  function handleTicketRequest() {
    setIsOpen(true)
    setIsTicketVisible(true)
    setMessages((currentMessages) => {
      if (currentMessages.some((message) => message.id === 'assistant-ticket')) return currentMessages

      return [
        ...currentMessages,
        {
          content: t('homeAssistant.ticketMessage', { email: supportEmail }),
          id: 'assistant-ticket',
          role: 'assistant',
        },
      ]
    })
  }

  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content ?? ''
  const ticketSubject = encodeURIComponent(`Ticket Vygo - ${companyName}`)
  const ticketBody = encodeURIComponent([
    `Azienda: ${companyName}`,
    'Sezione: Assistente guidato',
    `Ultima domanda: ${lastUserMessage || 'Non indicata'}`,
    '',
    'Descrizione problema:',
    '',
    'Dispositivo usato: PC / iPhone / Android',
    'Ruolo: azienda / autista / ufficio / magazzino',
    'Priorita: bassa / media / urgente',
  ].join('\n'))
  const ticketMailto = `mailto:${supportEmail}?subject=${ticketSubject}&body=${ticketBody}`

  return (
    <section className="home-assistant-strip" aria-label={t('homeAssistant.title')}>
      <div className="home-assistant-title">
        <span className="home-assistant-icon">
          <Bot size={18} />
        </span>
        <span>
          <strong>{t('homeAssistant.homeTitle')}</strong>
          <small>{t('homeAssistant.homeSubtitle')}</small>
        </span>
      </div>
      <div className="home-assistant-actions">
        <button className="primary-button compact-button" onClick={() => setIsOpen(true)} type="button">
          <Send size={15} />
          {t('homeAssistant.openAssistant')}
        </button>
      </div>
      {isOpen && (
        <div className="assistant-chat-backdrop" onClick={() => setIsOpen(false)}>
          <section
            aria-label={t('homeAssistant.title')}
            className="assistant-chat-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="assistant-chat-header">
              <span className="assistant-chat-avatar">
                <Bot size={20} />
              </span>
              <span>
                <strong>{t('homeAssistant.title')}</strong>
                <small>{companyName}</small>
              </span>
              <button
                aria-label={t('common.close')}
                className="icon-button"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </header>
            <div className="assistant-chat-body" ref={messageListRef}>
              {messages.map((message) => (
                <article className={`assistant-chat-message is-${message.role}`} key={message.id}>
                  <p>{message.content}</p>
                  {message.mode === 'guided' && <small>{t('homeAssistant.guidedMode')}</small>}
                </article>
              ))}
              {isSending && (
                <article className="assistant-chat-message is-assistant is-loading" aria-live="polite">
                  <p>{t('homeAssistant.typing')}</p>
                </article>
              )}
              <article className="assistant-chat-message is-assistant assistant-chat-choice-message">
                <p>{t('homeAssistant.quickTitle')}</p>
                <div className="assistant-chat-quick">
                  {topics.map((topic) => (
                    <button key={topic.id} onClick={() => handleTopicClick(topic)} type="button">
                      {topic.label}
                    </button>
                  ))}
                  <button className="assistant-ticket-button" onClick={handleTicketRequest} type="button">
                    <Mail size={14} />
                    {t('homeAssistant.notHelpful')}
                  </button>
                </div>
              </article>
              {isTicketVisible && (
                <article className="assistant-chat-message is-assistant assistant-chat-ticket">
                  <strong>{t('homeAssistant.ticketTitle')}</strong>
                  <p>{t('homeAssistant.ticketBody')}</p>
                  <div className="assistant-chat-ticket-actions">
                    <a className="primary-button compact-button" href={ticketMailto}>
                      <Mail size={15} />
                      {t('homeAssistant.openTicket')}
                    </a>
                    <button className="secondary-button compact-button" onClick={onOpenSupport} type="button">
                      <BookOpen size={15} />
                      {t('homeAssistant.openGuide')}
                    </button>
                  </div>
                </article>
              )}
            </div>
            <div className="assistant-chat-footer">
              <form className="assistant-chat-input" onSubmit={handleSubmit}>
                <textarea
                  aria-label={t('homeAssistant.placeholder')}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      sendAssistantMessage(inputValue)
                    }
                  }}
                  placeholder={t('homeAssistant.placeholder')}
                  rows={1}
                  value={inputValue}
                />
                <button className="primary-button compact-button" disabled={isSending || !inputValue.trim()} type="submit">
                  <Send size={16} />
                  {t('homeAssistant.send')}
                </button>
              </form>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

function RecordsWorkspace({
  activeTab,
  acknowledgedCheckIds = [],
  assetPreviewUrl,
  assetRecords = [],
  documentEvents,
  documentRecords,
  driverRecords,
  documentsSyncStatus,
  driversSyncStatus,
  fleetSyncStatus,
  faultReportRecords = [],
  onAddDriver,
  onAddDeadline,
  onAddDocument,
  onAddPerson,
  onAddVehicle,
  onArchiveDriver,
  onArchiveVehicle,
  onBackHome,
  onDriverDocumentUpload,
  onDriverProfileImageUpload,
  onOpenDriverDocument,
  onRemoveDocument,
  onRemoveDocumentFile,
  onResetAccessPassword,
  onTabChange,
  onUpdateDocument,
  onUpdateDriver,
  onUpdateVehicle,
  itemRecords = [],
  peopleSyncStatus,
  personRecords = [],
  t,
  vehicleCheckRecords = [],
  vehicleRecords,
}) {
  const activeDrivers = driverRecords.filter((driver) => driver.status !== 'Archiviato')
  const activeVehicles = vehicleRecords.filter((vehicle) => vehicle.status !== 'Archiviato')
  const activePeople = personRecords.filter((person) => !['archived', 'Archiviato'].includes(person.status))
  const staffPeople = activePeople.filter((person) => person.department !== 'drivers')
  const archivedDrivers = driverRecords.filter((driver) => driver.status === 'Archiviato')
  const archivedVehicles = vehicleRecords.filter((vehicle) => vehicle.status === 'Archiviato')
  const archivedFaults = faultReportRecords.filter(isFaultArchived)
  const archivedChecks = vehicleCheckRecords.filter((check) => isVehicleCheckArchived(check, acknowledgedCheckIds))
  const tabs = [
    {
      count: staffPeople.length,
      icon: Building2,
      id: 'people',
      label: 'Persone',
      text: 'Ufficio, magazzino e reparti',
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
    {
      count: archivedDrivers.length + archivedVehicles.length + archivedFaults.length + archivedChecks.length,
      icon: Clock3,
      id: 'archive',
      label: t('operations.archived'),
      text: 'Storico consultabile di persone, mezzi, check e guasti',
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
          onAddPerson={onAddPerson}
          onResetAccessPassword={onResetAccessPassword}
          personRecords={personRecords}
          syncStatus={peopleSyncStatus}
        />
      ) : activeTab === 'archive' ? (
        <ArchiveWorkspace
          acknowledgedCheckIds={acknowledgedCheckIds}
          documentEvents={documentEvents}
          documentRecords={documentRecords}
          driverRecords={driverRecords}
          faultReportRecords={faultReportRecords}
          vehicleCheckRecords={vehicleCheckRecords}
          vehicleRecords={vehicleRecords}
        />
      ) : activeTab === 'documents' ? (
        <DocumentsWorkspace
          documentEvents={documentEvents}
          documentRecords={documentRecords}
          driverRecords={driverRecords}
          onAddDeadline={onAddDeadline}
          onAddDocument={onAddDocument}
          onBackHome={onBackHome}
          onDriverDocumentUpload={onDriverDocumentUpload}
          onOpenDriverDocument={onOpenDriverDocument}
          onRemoveDocument={onRemoveDocument}
          onRemoveDocumentFile={onRemoveDocumentFile}
          onUpdateDocument={onUpdateDocument}
          syncStatus={documentsSyncStatus}
          vehicleRecords={vehicleRecords}
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
          onResetAccessPassword={onResetAccessPassword}
          onUpdateDriver={onUpdateDriver}
          syncStatus={driversSyncStatus}
          vehicleRecords={vehicleRecords}
        />
      )}
    </section>
  )
}

function ArchiveWorkspace({
  acknowledgedCheckIds = [],
  documentEvents = [],
  documentRecords = [],
  driverRecords = [],
  faultReportRecords = [],
  vehicleCheckRecords = [],
  vehicleRecords = [],
}) {
  const { t } = useI18n()
  const [selectedArchiveKey, setSelectedArchiveKey] = useState('')
  const archivedDrivers = driverRecords.filter((driver) => driver.status === 'Archiviato')
  const archivedVehicles = vehicleRecords.filter((vehicle) => vehicle.status === 'Archiviato')
  const archivedFaults = faultReportRecords.filter(isFaultArchived)
  const archivedChecks = vehicleCheckRecords.filter((check) => isVehicleCheckArchived(check, acknowledgedCheckIds))
  const archivedOperations = [
    ...archivedFaults.map((report) => ({
      createdAt: report.updatedAt || report.createdAt,
      data: report,
      id: report.id,
      kind: 'fault',
    })),
    ...archivedChecks.map((check) => ({
      createdAt: check.resolvedAt || check.createdAt,
      data: check,
      id: check.id,
      kind: 'check',
    })),
  ].sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
  const selectedArchiveOperation =
    archivedOperations.find((operation) => `${operation.kind}-${operation.id}` === selectedArchiveKey) ??
    archivedOperations[0] ??
    null
  const recentDocumentEvents = documentEvents.slice(0, 8)

  return (
    <section className="archive-workspace" aria-label="Archivio azienda">
      <div className="archive-main">
        <div className="panel archive-panel">
          <div className="panel-header">
            <div>
              <p className="overline">{t('records.overline')}</p>
              <h2>{t('operations.archived')}</h2>
            </div>
            <Clock3 size={22} />
          </div>
          <div className="archive-summary-grid">
            <div>
              <strong>{archivedDrivers.length}</strong>
              <span>Autisti</span>
            </div>
            <div>
              <strong>{archivedVehicles.length}</strong>
              <span>Mezzi</span>
            </div>
            <div>
              <strong>{archivedFaults.length}</strong>
              <span>Guasti chiusi</span>
            </div>
            <div>
              <strong>{archivedChecks.length}</strong>
              <span>Check visti</span>
            </div>
          </div>

          <div className="archive-section-grid">
            <ArchiveListSection title="Autisti archiviati" emptyText="Nessun autista archiviato.">
              {archivedDrivers.map((driver) => (
                <article className="archive-list-row" key={driver.id}>
                  <div>
                    <strong>{driver.name}</strong>
                    <span>{[driver.phone, driver.role, driver.depot].filter(Boolean).join(' · ') || 'Dati non indicati'}</span>
                  </div>
                  <span className="status-pill tone-info">{t('common.archived')}</span>
                </article>
              ))}
            </ArchiveListSection>

            <ArchiveListSection title="Mezzi archiviati" emptyText="Nessun mezzo archiviato.">
              {archivedVehicles.map((vehicle) => (
                <article className="archive-list-row" key={vehicle.id}>
                  <div>
                    <strong>{vehicle.plate}</strong>
                    <span>{[getFleetTypeLabel(vehicle.fleetType, t), vehicle.model, vehicle.type].filter(Boolean).join(' · ') || 'Mezzo'}</span>
                  </div>
                  <span className="status-pill tone-info">{t('common.archived')}</span>
                </article>
              ))}
            </ArchiveListSection>
          </div>

          <ArchiveListSection title="Guasti e check archiviati" emptyText="Nessun guasto o check archiviato.">
            {archivedOperations.map((operation) => {
              const isFault = operation.kind === 'fault'
              const driver = driverRecords.find((entry) => entry.id === operation.data.driverId)
              const vehicle = vehicleRecords.find((entry) =>
                entry.id === (isFault ? operation.data.vehicleId : operation.data.tractorId),
              )
              const title = isFault ? operation.data.title : t('driverApp.morningCheck')
              const detail = [
                driver?.name ?? t('common.driverMissing'),
                vehicle?.plate ?? t('common.vehicleMissing'),
                formatShortDateTime(operation.createdAt),
              ].join(' · ')

              return (
                <button
                  className={selectedArchiveOperation?.id === operation.id && selectedArchiveOperation?.kind === operation.kind ? 'archive-operation-row is-active' : 'archive-operation-row'}
                  key={`${operation.kind}-${operation.id}`}
                  onClick={() => setSelectedArchiveKey(`${operation.kind}-${operation.id}`)}
                  type="button"
                >
                  <span className={isFault ? 'operation-icon tone-danger' : 'operation-icon tone-info'}>
                    {isFault ? <Wrench size={17} /> : <ClipboardCheck size={17} />}
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{detail}</small>
                  </span>
                  <ChevronRight size={16} />
                </button>
              )
            })}
          </ArchiveListSection>

          <ArchiveListSection title="Movimenti documenti" emptyText="Nessun movimento documento registrato.">
            {recentDocumentEvents.map((event) => {
              const driver = driverRecords.find((driverRecord) => driverRecord.id === event.driverId)

              return (
                <article className="archive-list-row" key={event.id}>
                  <div>
                    <strong>{getDocumentTypeLabel(event.documentType, t)}</strong>
                    <span>
                      {driver?.name ?? t('common.driverMissing')} · {documentEventLabels[event.eventType] ?? event.eventType}
                    </span>
                  </div>
                  <small>{formatShortDateTime(event.createdAt)}</small>
                </article>
              )
            })}
          </ArchiveListSection>
        </div>
      </div>
      <ArchiveDetailPanel
        acknowledgedCheckIds={acknowledgedCheckIds}
        documentRecords={documentRecords}
        driverRecords={driverRecords}
        operation={selectedArchiveOperation}
        vehicleRecords={vehicleRecords}
      />
    </section>
  )
}

function ArchiveListSection({ children, emptyText, title }) {
  const hasContent = Boolean(Array.isArray(children) ? children.length : children)

  return (
    <section className="archive-list-section">
      <div className="archive-list-title">
        <strong>{title}</strong>
      </div>
      <div className="archive-list">
        {hasContent ? children : <p className="archive-note">{emptyText}</p>}
      </div>
    </section>
  )
}

function ArchiveDetailPanel({
  acknowledgedCheckIds = [],
  documentRecords = [],
  driverRecords = [],
  operation,
  vehicleRecords = [],
}) {
  const { t } = useI18n()

  if (!operation) {
    return (
      <aside className="panel archive-detail-panel">
        <div className="panel-header compact">
          <div>
            <p className="overline">{t('operations.detail')}</p>
            <h2>Archivio</h2>
          </div>
          <Clock3 size={20} />
        </div>
        <p className="operation-detail-empty">Seleziona un elemento archiviato per rivederne i dettagli.</p>
      </aside>
    )
  }

  if (operation.kind === 'fault') {
    const report = operation.data
    const driver = driverRecords.find((entry) => entry.id === report.driverId)
    const vehicle = vehicleRecords.find((entry) => entry.id === report.vehicleId)
    const trailer = vehicleRecords.find((entry) => entry.id === report.semitrailerId)

    return (
      <aside className="panel archive-detail-panel">
        <div className="panel-header compact">
          <div>
            <p className="overline">{t('operations.fault')}</p>
            <h2>{report.title}</h2>
          </div>
          <Wrench size={20} />
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
        </div>
      </aside>
    )
  }

  const check = operation.data
  const driver = driverRecords.find((entry) => entry.id === check.driverId)
  const vehicle = vehicleRecords.find((entry) => entry.id === check.tractorId)
  const trailer = vehicleRecords.find((entry) => entry.id === check.semitrailerId)
  const issueText = getCheckIssues(check, t)
  const relatedDocuments = documentRecords.filter((document) => document.driverId === check.driverId).slice(0, 4)

  return (
    <aside className="panel archive-detail-panel">
      <div className="panel-header compact">
        <div>
          <p className="overline">{t('operations.check')}</p>
          <h2>{t('driverApp.morningCheck')}</h2>
        </div>
        <ClipboardCheck size={20} />
      </div>
      <div className="operation-detail-body">
        <DetailLine
          label={t('common.status')}
          value={isVehicleCheckArchived(check, acknowledgedCheckIds) ? t('common.archived') : t('operations.inbox')}
        />
        <DetailLine label={t('common.driver')} value={driver?.name ?? t('common.driverMissing')} />
        <DetailLine label={t('common.vehicle')} value={vehicle ? `${vehicle.plate} · ${vehicle.model}` : t('common.vehicleMissing')} />
        {trailer && <DetailLine label={t('common.trailer')} value={`${trailer.plate} · ${trailer.model}`} />}
        <DetailLine label={t('common.time')} value={formatShortDateTime(check.createdAt)} />
        {check.resolvedAt && <DetailLine label="Risolto il" value={formatShortDateTime(check.resolvedAt)} />}
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
        {relatedDocuments.length > 0 && (
          <div className="detail-note">
            <strong>Documenti autista</strong>
            <p>{relatedDocuments.map((document) => getDocumentTypeLabel(document.type, t)).join(' · ')}</p>
          </div>
        )}
      </div>
    </aside>
  )
}

function getUpcomingWorkforceDeadlines(itemRecords, matcher) {
  return itemRecords
    .filter((item) => item.dueDate && !['archived', 'done'].includes(item.status) && matcher(item))
    .slice()
    .sort((first, second) => new Date(first.dueDate) - new Date(second.dueDate))
    .slice(0, 3)
}

function PeopleWorkspace({ assetRecords = [], itemRecords = [], onAddPerson, onResetAccessPassword, personRecords = [], syncStatus }) {
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
              onResetAccessPassword={onResetAccessPassword}
              people={officePeople}
              title="Ufficio"
            />
            <PeopleDepartmentBlock
              emptyText="Nessun magazziniere caricato."
              icon={Users}
              itemRecords={itemRecords}
              onResetAccessPassword={onResetAccessPassword}
              people={warehousePeople}
              title="Magazzino"
            />
          </div>
        </div>
      </div>
      <PersonCreatePanel onAddPerson={onAddPerson} syncStatus={syncStatus} />
    </section>
  )
}

function PersonCreatePanel({ onAddPerson, syncStatus }) {
  const { t } = useI18n()
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState(getPersonCreateDefaults)
  const [showValidation, setShowValidation] = useState(false)
  const authEmail = form.username ? buildDriverAuthEmail(form.username) : ''
  const currentPersonTypes = workforcePersonTypeOptions[form.department] ?? workforcePersonTypeOptions.office
  const missingRequiredFields = [
    form.name.trim() ? null : 'nome e cognome',
    form.department ? null : 'reparto',
    form.personType ? null : 'ruolo',
    form.username.trim() ? null : 'username app',
    form.password.trim() ? null : 'password temporanea',
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

      if (field === 'department') {
        const nextPersonType = value === 'warehouse' ? 'warehouse_worker' : 'office'

        return {
          ...currentForm,
          department: value,
          jobTitle: getWorkforceRoleLabel(nextPersonType),
          personType: nextPersonType,
        }
      }

      if (field === 'personType') {
        return {
          ...currentForm,
          jobTitle: currentForm.jobTitle ? currentForm.jobTitle : getWorkforceRoleLabel(value),
          personType: value,
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
    const added = await onAddPerson?.({
      id: `person-${Date.now()}`,
      department: form.department,
      depot: form.depot,
      email: form.email,
      initialDeadlines: [
        { dueDate: form.medicalDueDate, type: 'Visita medica' },
        { dueDate: form.safetyTrainingDueDate, type: 'Formazione sicurezza' },
        form.personType === 'forklift_operator'
          ? { dueDate: form.forkliftLicenseDueDate, type: 'Patentino carrello' }
          : null,
      ].filter((deadline) => deadline?.dueDate),
      jobTitle: form.jobTitle || getWorkforceRoleLabel(form.personType),
      name: form.name,
      password: form.password,
      personType: form.personType,
      phone: form.phone,
      status: 'active',
      username: normalizeDriverUsername(form.username),
    })
    setIsSaving(false)

    if (!added) return

    setShowValidation(false)
    setForm(getPersonCreateDefaults())
  }

  return (
    <form className="panel driver-create-panel person-create-panel" noValidate onSubmit={handleSubmit}>
      <div className="panel-header compact">
        <div>
          <p className="overline">Nuova anagrafica</p>
          <h2>Aggiungi persona</h2>
        </div>
        <UserPlus size={20} />
      </div>
      <div className="form-grid single-column">
        <label>
          Nome e cognome
          <input required value={form.name} onChange={(event) => updateField('name', event.target.value)} />
        </label>
        <label>
          Reparto
          <select value={form.department} onChange={(event) => updateField('department', event.target.value)}>
            {workforceDepartmentOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          Ruolo
          <select value={form.personType} onChange={(event) => updateField('personType', event.target.value)}>
            {currentPersonTypes.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          Mansione libera
          <input value={form.jobTitle} onChange={(event) => updateField('jobTitle', event.target.value)} />
        </label>
        <label>
          Telefono
          <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
        </label>
        <label>
          Username app
          <input required value={form.username} onChange={(event) => updateField('username', event.target.value)} />
        </label>
        <label>
          Password temporanea
          <span className="password-field-row">
            <input
              minLength={8}
              required
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
            />
            <button className="small-button" onClick={() => updateField('password', generateTemporaryPassword())} type="button">
              Genera
            </button>
          </span>
        </label>
        <label>
          Sede o reparto
          <input value={form.depot} onChange={(event) => updateField('depot', event.target.value)} />
        </label>
        <label>
          Visita medica
          <input value={form.medicalDueDate} onChange={(event) => updateField('medicalDueDate', event.target.value)} type="date" />
        </label>
        <label>
          Formazione sicurezza
          <input value={form.safetyTrainingDueDate} onChange={(event) => updateField('safetyTrainingDueDate', event.target.value)} type="date" />
        </label>
        {form.personType === 'forklift_operator' && (
          <label>
            Patentino carrello
            <input value={form.forkliftLicenseDueDate} onChange={(event) => updateField('forkliftLicenseDueDate', event.target.value)} type="date" />
          </label>
        )}
      </div>
      <div className="auth-email-box">
        <strong>Email tecnica accesso app</strong>
        <span>{authEmail || 'Si genera dallo username.'}</span>
      </div>
      {showValidation && !canSubmit && <FormValidationAlert message={formatMissingFields(missingRequiredFields, t)} />}
      {syncStatus && <p className="sync-status-line">{syncStatus}</p>}
      <button className="primary-button full-button" disabled={isSaving} type="submit">
        <UserPlus size={17} />
        {isSaving ? 'Creazione...' : 'Aggiungi persona'}
      </button>
    </form>
  )
}

function PeopleDepartmentBlock({ emptyText, icon: Icon, itemRecords, onResetAccessPassword, people, title }) {
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
            <button className="small-button" onClick={() => onResetAccessPassword?.('person', person.id, person.name)} type="button">
              Reimposta password
            </button>
            <WorkforceDeadlineMiniList deadlines={deadlines} />
          </article>
        )
      })}
      {people.length === 0 && <p className="archive-note">{emptyText}</p>}
    </section>
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
  onResetAccessPassword,
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
                onResetPassword={() => onResetAccessPassword?.('driver', driver.id, driver.name)}
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
      <DriverCreatePanel onAddDriver={onAddDriver} onBackHome={onBackHome} syncStatus={syncStatus} vehicleRecords={vehicleRecords} />
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
  onResetPassword,
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
        <button className="small-button" disabled={saving} onClick={onResetPassword} type="button">
          Reimposta password
        </button>
        <button className="small-button danger-action" disabled={saving} onClick={onArchive} type="button">
          {saving ? t('common.archiving') : t('common.archive')}
        </button>
      </div>
    </article>
  )
}

function DriverCreatePanel({ onAddDriver, onBackHome, syncStatus, vehicleRecords }) {
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
      {syncStatus && <p className="sync-status-line in-create-panel">{syncStatus}</p>}
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
      <VehicleCreatePanel onAddVehicle={onAddVehicle} onBackHome={onBackHome} syncStatus={syncStatus} />
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

function VehicleCreatePanel({ onAddVehicle, onBackHome, syncStatus }) {
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
      {syncStatus && <p className="sync-status-line in-create-panel">{syncStatus}</p>}
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
  onAddDeadline,
  onAddDocument,
  onBackHome,
  onDriverDocumentUpload,
  onOpenDriverDocument,
  onRemoveDocument,
  onRemoveDocumentFile,
  onUpdateDocument,
  syncStatus,
  vehicleRecords = [],
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
      <div className="documents-side-column">
        <DocumentCreatePanel
          driverRecords={driverRecords}
          onAddDocument={onAddDocument}
          onDriverDocumentUpload={onDriverDocumentUpload}
        />
        <AddDeadlineForm
          driverRecords={driverRecords}
          onAdd={onAddDeadline}
          onBackHome={onBackHome}
          vehicleRecords={vehicleRecords}
        />
      </div>
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

function getFaultCostDate(report) {
  return report.repairRecordedAt || report.updatedAt || report.createdAt
}

const costCategoryOptions = [
  { id: 'maintenance', label: 'Manutenzione' },
  { id: 'repair', label: 'Riparazione' },
  { id: 'tires', label: 'Gomme' },
  { id: 'insurance', label: 'Assicurazione' },
  { id: 'revision', label: 'Revisione' },
  { id: 'tax', label: 'Bollo / tasse' },
  { id: 'fuel', label: 'Carburante' },
  { id: 'cleaning', label: 'Lavaggio' },
  { id: 'toll', label: 'Pedaggi' },
  { id: 'fine', label: 'Sanzione' },
  { id: 'other', label: 'Altro' },
]

function getCostCategoryLabel(value = 'maintenance') {
  return costCategoryOptions.find((option) => option.id === value)?.label ?? 'Spesa'
}

function buildCostRanking(rows = [], getGroup) {
  return Array.from(rows.reduce((ranking, row) => {
    const group = getGroup(row)
    if (!group?.key) return ranking

    const current = ranking.get(group.key) ?? {
      count: 0,
      key: group.key,
      name: group.name,
      totalCents: 0,
    }

    ranking.set(group.key, {
      ...current,
      count: current.count + 1,
      totalCents: current.totalCents + Number(row.amountCents ?? 0),
    })

    return ranking
  }, new Map()).values()).sort((first, second) => second.totalCents - first.totalCents)
}

function getDateInputToday() {
  return new Date().toISOString().slice(0, 10)
}

function getFaultCostPeriodStart(period) {
  const now = new Date()

  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  if (period === 'year') return new Date(now.getFullYear(), 0, 1)

  return null
}

function getCurrentMonthRange(referenceDate = new Date()) {
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1)
  const label = new Intl.DateTimeFormat('it-IT', {
    month: 'long',
    year: 'numeric',
  }).format(referenceDate)

  return { end, label, start }
}

function getMonthArchiveKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getMonthRangeFromKey(monthKey) {
  const [year, month] = String(monthKey ?? '').split('-').map((part) => Number(part))
  if (!year || !month) return getCurrentMonthRange()

  return getCurrentMonthRange(new Date(year, month - 1, 1))
}

function isDateInRange(value, startDate, endDate) {
  if (!value) return false

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false

  return date >= startDate && date < endDate
}

function getCostEntryDate(entry = {}) {
  return entry.spentAt || entry.updatedAt || entry.createdAt
}

function buildCostReportRows(faultReportRecords = [], costEntryRecords = []) {
  const faultRows = faultReportRecords
    .filter((report) => Number(report.repairCostCents ?? 0) > 0)
    .map((report) => ({
      amountCents: Number(report.repairCostCents ?? 0),
      assetId: '',
      category: 'repair',
      currency: report.repairCostCurrency || 'EUR',
      date: getFaultCostDate(report),
      description: report.description ?? '',
      driverId: report.driverId ?? '',
      id: `fault-${report.id}`,
      kind: 'fault',
      source: report,
      title: report.title,
      vehicleId: report.vehicleId,
    }))
  const entryRows = costEntryRecords
    .filter((entry) => Number(entry.amountCents ?? 0) > 0)
    .map((entry) => ({
      amountCents: Number(entry.amountCents ?? 0),
      assetId: entry.assetId ?? '',
      category: entry.category ?? 'maintenance',
      currency: entry.currency || 'EUR',
      date: getCostEntryDate(entry),
      description: entry.notes ?? '',
      driverId: entry.driverId ?? '',
      id: `entry-${entry.id}`,
      kind: 'entry',
      source: entry,
      title: entry.title,
      vehicleId: entry.vehicleId ?? '',
    }))

  return [...faultRows, ...entryRows].sort((first, second) => new Date(second.date) - new Date(first.date))
}

function getDaysUntil(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return Infinity

  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  return Math.ceil((startOfDate - startOfToday) / 86400000)
}

function getFaultCostSummary(faultReportRecords = [], costEntryRecords = []) {
  const costRows = buildCostReportRows(faultReportRecords, costEntryRecords)
  const monthStart = getFaultCostPeriodStart('month')
  const yearStart = getFaultCostPeriodStart('year')
  const sumRows = (rows) => rows.reduce((total, row) => total + Number(row.amountCents ?? 0), 0)
  const monthRows = costRows.filter((row) => new Date(row.date) >= monthStart)
  const yearRows = costRows.filter((row) => new Date(row.date) >= yearStart)

  return {
    allCents: sumRows(costRows),
    count: costRows.length,
    latest: costRows[0] ?? null,
    monthCents: sumRows(monthRows),
    yearCents: sumRows(yearRows),
  }
}

function getFleetHealthRows({
  complianceItems = [],
  costRows = [],
  faultReportRecords = [],
  vehicleCheckRecords = [],
  vehicleRecords = [],
} = {}) {
  const now = new Date()
  const monthStart = getFaultCostPeriodStart('month')
  const activeVehicles = vehicleRecords.filter((vehicle) => !['Archiviato', 'archived'].includes(vehicle.status))

  return activeVehicles.map((vehicle) => {
    const vehicleId = vehicle.id
    const openFaults = faultReportRecords.filter((report) => report.vehicleId === vehicleId && isFaultUnread(report)).length
    const criticalChecks = vehicleCheckRecords.filter((check) => (
      check.tractorId === vehicleId
        && !isVehicleCheckArchived(check)
        && hasCheckIssues(check)
    )).length
    const overdueDeadlines = complianceItems.filter((item) => (
      item.vehicleId === vehicleId
        && item.status !== 'done'
        && item.dueDate
        && new Date(item.dueDate) < now
    )).length
    const upcomingDeadlines = complianceItems.filter((item) => (
      item.vehicleId === vehicleId
        && item.status !== 'done'
        && item.dueDate
        && new Date(item.dueDate) >= now
        && getDaysUntil(item.dueDate) <= 30
    )).length
    const monthCostCents = costRows
      .filter((row) => row.vehicleId === vehicleId && new Date(row.date) >= monthStart)
      .reduce((total, row) => total + Number(row.amountCents ?? 0), 0)

    const costPenalty = Math.min(20, Math.floor(monthCostCents / 25000))
    const score = Math.max(
      0,
      100
        - openFaults * 14
        - criticalChecks * 18
        - overdueDeadlines * 16
        - upcomingDeadlines * 6
        - costPenalty,
    )
    const tone = score >= 82 ? 'success' : score >= 62 ? 'warning' : 'danger'
    const issues = [
      openFaults ? `${openFaults} guasti aperti` : '',
      criticalChecks ? `${criticalChecks} check critici` : '',
      overdueDeadlines ? `${overdueDeadlines} scadenze scadute` : '',
      upcomingDeadlines ? `${upcomingDeadlines} entro 30 giorni` : '',
      monthCostCents ? `${formatMoneyCents(monthCostCents, costRows.find((row) => row.vehicleId === vehicleId)?.currency || 'EUR')} mese` : '',
    ].filter(Boolean)

    return {
      criticalChecks,
      issues,
      monthCostCents,
      openFaults,
      score,
      tone,
      upcomingDeadlines,
      vehicle,
    }
  }).sort((first, second) => first.score - second.score || second.monthCostCents - first.monthCostCents)
}

function FaultCostReport({
  assetRecords = [],
  companyName = 'Azienda',
  complianceItems = [],
  costEntryRecords = [],
  driverRecords = [],
  faultReportRecords = [],
  onCreateCostEntry,
  onDeleteCostEntry,
  onUpdateCostEntry,
  onUpdateFaultStatus,
  reportMode = 'costs',
  resetCostFormKey = 0,
  startAddingCostKey = 0,
  vehicleCheckRecords = [],
  vehicleRecords = [],
}) {
  const { language } = useI18n()
  const isReportWorkspace = reportMode === 'reports'
  const [period, setPeriod] = useState('month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [targetFilter, setTargetFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [reportType, setReportType] = useState('detail')
  const [isAddingCost, setIsAddingCost] = useState(false)
  const [isSavingCost, setIsSavingCost] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [selectedArchiveMonthKey, setSelectedArchiveMonthKey] = useState(() => getMonthArchiveKey())
  const [reportSection, setReportSection] = useState('overview')
  const [costForm, setCostForm] = useState({
    amount: '',
    assetId: '',
    category: 'maintenance',
    driverId: '',
    file: null,
    id: '',
    notes: '',
    odometerKm: '',
    spentAt: getDateInputToday(),
    supplier: '',
    targetType: 'vehicle',
    title: '',
    vehicleId: vehicleRecords[0]?.id ?? '',
  })
  const [faultCostForm, setFaultCostForm] = useState({
    amount: '',
    id: '',
    notes: '',
  })
  const costEditorRef = useRef(null)
  const defaultCurrency = getDefaultCurrency(language)
  const driverById = useMemo(() => new Map(driverRecords.map((driver) => [driver.id, driver])), [driverRecords])
  const vehicleById = useMemo(() => new Map(vehicleRecords.map((vehicle) => [vehicle.id, vehicle])), [vehicleRecords])
  const assetById = useMemo(() => new Map(assetRecords.map((asset) => [asset.id, asset])), [assetRecords])
  const costRows = buildCostReportRows(faultReportRecords, costEntryRecords)
  const reportTypeLabels = {
    detail: 'Dettaglio costi',
    fines: 'Multe e sanzioni',
    fine_ranking: 'Classifica multe autisti',
  }
  const reportPeriodLabel = (() => {
    if (period === 'today') return 'Oggi'
    if (period === 'month') return 'Questo mese'
    if (period === 'year') return 'Quest anno'
    if (period === 'custom') {
      const startLabel = customStartDate ? formatDate(customStartDate) : 'inizio'
      const endLabel = customEndDate ? formatDate(customEndDate) : 'fine'
      return `${startLabel} - ${endLabel}`
    }

    return 'Sempre'
  })()
  const matchesTargetFilter = (row) => {
    if (targetFilter === 'all') return true
    if (targetFilter === 'company') return !row.vehicleId && !row.assetId && !row.driverId

    const [targetType, targetId] = targetFilter.split(':')
    if (targetType === 'vehicle') return row.vehicleId === targetId
    if (targetType === 'driver') return row.driverId === targetId
    if (targetType === 'asset') return row.assetId === targetId

    return true
  }
  const matchesPeriodFilter = (row) => {
    const costDate = new Date(row.date)
    if (Number.isNaN(costDate.getTime())) return false

    if (period === 'custom') {
      if (customStartDate) {
        const startDate = new Date(`${customStartDate}T00:00:00`)
        if (!Number.isNaN(startDate.getTime()) && costDate < startDate) return false
      }
      if (customEndDate) {
        const endDate = new Date(`${customEndDate}T23:59:59`)
        if (!Number.isNaN(endDate.getTime()) && costDate > endDate) return false
      }
      return true
    }

    const periodStart = getFaultCostPeriodStart(period)
    return !periodStart || costDate >= periodStart
  }
  const periodTargetCosts = costRows
    .filter(matchesTargetFilter)
    .filter(matchesPeriodFilter)
    .sort((first, second) => new Date(second.date) - new Date(first.date))
  const filteredCosts = periodTargetCosts
    .filter((row) => {
      const effectiveCategoryFilter = ['fines', 'fine_ranking'].includes(reportType) ? 'fine' : categoryFilter
      return effectiveCategoryFilter === 'all' || row.category === effectiveCategoryFilter
    })
  const fineRows = periodTargetCosts.filter((row) => row.category === 'fine')
  const reportRows = reportType === 'fines'
    ? filteredCosts
    : reportType === 'fine_ranking'
      ? []
      : filteredCosts
  const summaryRows = ['fines', 'fine_ranking'].includes(reportType) ? fineRows : filteredCosts
  const totalCents = summaryRows.reduce((total, row) => total + Number(row.amountCents ?? 0), 0)
  const averageCents = summaryRows.length ? Math.round(totalCents / summaryRows.length) : 0
  const fineTotalCents = fineRows.reduce((total, row) => total + Number(row.amountCents ?? 0), 0)
  const fineRanking = Array.from(fineRows.reduce((ranking, row) => {
    const key = row.driverId || 'unassigned'
    const current = ranking.get(key) ?? {
      assignableEntry: null,
      count: 0,
      driverId: row.driverId,
      name: row.driverId ? driverById.get(row.driverId)?.name ?? 'Autista' : 'Non assegnate',
      totalCents: 0,
    }
    ranking.set(key, {
      ...current,
      assignableEntry: current.assignableEntry || (!row.driverId && row.kind === 'entry' ? row.source : null),
      count: current.count + 1,
      totalCents: current.totalCents + Number(row.amountCents ?? 0),
    })
    return ranking
  }, new Map()).values()).sort((first, second) => second.totalCents - first.totalCents)
  const unassignedFineRows = fineRows.filter((row) => !row.driverId)
  const unassignedFineTotalCents = unassignedFineRows.reduce((total, row) => total + Number(row.amountCents ?? 0), 0)
  const unlinkedCostRows = periodTargetCosts.filter((row) => !row.vehicleId && !row.assetId && !row.driverId)
  const targetCostRanking = buildCostRanking(periodTargetCosts, (row) => ({
    key: row.vehicleId
      ? `vehicle:${row.vehicleId}`
      : row.assetId
        ? `asset:${row.assetId}`
        : row.driverId
          ? `driver:${row.driverId}`
          : 'company',
    name: getCostTargetLabel(row),
  }))
  const categoryCostRanking = buildCostRanking(periodTargetCosts, (row) => ({
    key: row.category || 'maintenance',
    name: getCostCategoryLabel(row.category),
  }))
  const vehicleCostRanking = buildCostRanking(periodTargetCosts.filter((row) => row.vehicleId), (row) => ({
    key: `vehicle:${row.vehicleId}`,
    name: getCostTargetLabel(row),
  }))
  const driverCostRanking = buildCostRanking(periodTargetCosts.filter((row) => row.driverId), (row) => ({
    key: `driver:${row.driverId}`,
    name: getCostTargetLabel(row),
  }))
  const topTargetCost = targetCostRanking[0] ?? null
  const topCategoryCost = categoryCostRanking[0] ?? null
  const topVehicleCost = vehicleCostRanking[0] ?? null
  const topDriverCost = driverCostRanking[0] ?? null
  const getCostSeverityTone = (amountCents) => {
    if (!amountCents) return 'neutral'
    if (amountCents >= 500000) return 'danger'
    if (amountCents >= 150000) return 'warning'
    return 'info'
  }
  const monthlyRange = getMonthRangeFromKey(selectedArchiveMonthKey)
  const monthlyCostRows = costRows.filter((row) => isDateInRange(row.date, monthlyRange.start, monthlyRange.end))
  const monthlyFaultRows = faultReportRecords.filter((report) => isDateInRange(report.createdAt || report.updatedAt, monthlyRange.start, monthlyRange.end))
  const monthlyOpenFaultRows = faultReportRecords.filter((report) => !isFaultArchived(report))
  const monthlyCheckRows = vehicleCheckRecords.filter((check) => isDateInRange(check.createdAt || check.updatedAt, monthlyRange.start, monthlyRange.end))
  const monthlyCriticalCheckRows = monthlyCheckRows.filter(hasCheckIssues)
  const monthlyOkCheckRows = monthlyCheckRows.filter((check) => !hasCheckIssues(check))
  const monthlyDeadlineRows = complianceItems.filter((item) => !isComplianceClosed(item) && isDateInRange(item.dueDate, monthlyRange.start, monthlyRange.end))
  const actionableDeadlineRows = complianceItems.filter(isComplianceActionRequired)
  const monthlyFineRows = monthlyCostRows.filter((row) => row.category === 'fine')
  const monthlyUnassignedFineRows = monthlyFineRows.filter((row) => !row.driverId)
  const monthlyUnlinkedCostRows = monthlyCostRows.filter((row) => !row.vehicleId && !row.assetId && !row.driverId)
  const monthlyTotalCents = monthlyCostRows.reduce((total, row) => total + Number(row.amountCents ?? 0), 0)
  const monthlyFineTotalCents = monthlyFineRows.reduce((total, row) => total + Number(row.amountCents ?? 0), 0)
  const monthlyTopTargetCost = buildCostRanking(monthlyCostRows, (row) => ({
    key: row.vehicleId
      ? `vehicle:${row.vehicleId}`
      : row.assetId
        ? `asset:${row.assetId}`
        : row.driverId
          ? `driver:${row.driverId}`
          : 'company',
    name: getCostTargetLabel(row),
  }))[0] ?? null
  const monthlyTopCategoryCost = buildCostRanking(monthlyCostRows, (row) => ({
    key: row.category || 'maintenance',
    name: getCostCategoryLabel(row.category),
  }))[0] ?? null
  const monthlyActionRows = [
    actionableDeadlineRows.length
      ? {
          tone: 'danger',
          title: 'Scadenze da lavorare',
          value: `${actionableDeadlineRows.length} pratiche`,
          body: 'Rinnovi e documenti entro 30 giorni o già scaduti.',
        }
      : null,
    monthlyOpenFaultRows.length
      ? {
          tone: 'danger',
          title: 'Guasti ancora aperti',
          value: `${monthlyOpenFaultRows.length} segnalazioni`,
          body: 'Da chiudere o completare con costo riparazione.',
        }
      : null,
    monthlyCriticalCheckRows.length
      ? {
          tone: 'warning',
          title: 'Check con anomalie',
          value: `${monthlyCriticalCheckRows.length} check`,
          body: 'Controlla luci, gomme o documenti segnalati dagli autisti.',
        }
      : null,
    monthlyUnassignedFineRows.length
      ? {
          tone: 'warning',
          title: 'Multe non assegnate',
          value: `${monthlyUnassignedFineRows.length} multe`,
          body: 'Assegna autista e targa per avere classifiche precise.',
        }
      : null,
    monthlyUnlinkedCostRows.length
      ? {
          tone: 'warning',
          title: 'Spese scollegate',
          value: `${monthlyUnlinkedCostRows.length} voci`,
          body: 'Collega le spese a targa, autista o attrezzatura.',
        }
      : null,
    monthlyCostRows.length
      ? {
          tone: 'info',
          title: 'Controllo costi mese',
          value: formatMoneyCents(monthlyTotalCents, defaultCurrency),
          body: monthlyTopTargetCost
            ? `Voce più pesante: ${monthlyTopTargetCost.name}.`
            : 'Nessun centro di costo dominante.',
    }
      : null,
  ].filter(Boolean).slice(0, 5)
  const monthlyArchiveRows = Array.from(new Set([
    getMonthArchiveKey(),
    ...costRows.map((row) => getMonthArchiveKey(row.date)),
    ...faultReportRecords.map((report) => getMonthArchiveKey(report.createdAt || report.updatedAt)),
    ...vehicleCheckRecords.map((check) => getMonthArchiveKey(check.createdAt || check.updatedAt)),
    ...complianceItems.map((item) => getMonthArchiveKey(item.dueDate)),
  ].filter(Boolean)))
    .sort((first, second) => second.localeCompare(first))
    .slice(0, 18)
    .map((monthKey) => {
      const range = getMonthRangeFromKey(monthKey)
      const archiveCostRows = costRows.filter((row) => isDateInRange(row.date, range.start, range.end))
      const archiveCheckRows = vehicleCheckRecords.filter((check) => isDateInRange(check.createdAt || check.updatedAt, range.start, range.end))
      const archiveCriticalChecks = archiveCheckRows.filter(hasCheckIssues)
      const archiveDeadlineRows = complianceItems.filter((item) => !isComplianceClosed(item) && isDateInRange(item.dueDate, range.start, range.end))
      const archiveFaultRows = faultReportRecords.filter((report) => isDateInRange(report.createdAt || report.updatedAt, range.start, range.end))

      return {
        checkCount: archiveCheckRows.length,
        costCount: archiveCostRows.length,
        criticalCheckCount: archiveCriticalChecks.length,
        deadlineCount: archiveDeadlineRows.length,
        faultCount: archiveFaultRows.length,
        key: monthKey,
        label: range.label,
        totalCents: archiveCostRows.reduce((total, row) => total + Number(row.amountCents ?? 0), 0),
      }
    })
  const selectedTargetLabel = (() => {
    if (targetFilter === 'all') return 'Tutti i costi'
    if (targetFilter === 'company') return 'Azienda generale'

    const [targetType, targetId] = targetFilter.split(':')
    if (targetType === 'vehicle') {
      const vehicle = vehicleById.get(targetId)
      return vehicle ? `${vehicle.plate} · ${getFleetTypeLabel(vehicle.fleetType)}` : 'Mezzo'
    }
    if (targetType === 'driver') {
      return driverById.get(targetId)?.name ?? 'Autista'
    }
    if (targetType === 'asset') {
      const asset = assetById.get(targetId)
      return asset ? `${asset.code} · ${asset.model || 'Attrezzatura'}` : 'Attrezzatura'
    }

    return 'Tutti i costi'
  })()
  const selectedCategoryLabel = ['fines', 'fine_ranking'].includes(reportType)
    ? getCostCategoryLabel('fine')
    : categoryFilter === 'all' ? 'Tutte le tipologie' : getCostCategoryLabel(categoryFilter)
  const reportTitle = reportTypeLabels[reportType] ?? 'Report aziendale'
  const reportSubtitle = reportType === 'fine_ranking'
    ? 'Classifica ordinata per totale multe nel periodo selezionato.'
    : reportType === 'fines'
      ? 'Elenco delle sanzioni con importo, targa e autista responsabile.'
      : 'Dettaglio economico di guasti, manutenzioni, sanzioni e spese libere.'
  const activeFilterBadges = [
    { label: 'Report', value: reportTitle },
    { label: 'Periodo', value: reportPeriodLabel },
    { label: 'Soggetto', value: selectedTargetLabel },
    { label: 'Tipologia', value: selectedCategoryLabel },
  ]
  const exportPreviewCount = reportType === 'fine_ranking'
    ? fineRanking.length
    : reportType === 'fines'
      ? fineRows.length
      : reportRows.length
  const exportPreviewRows = reportType === 'fine_ranking'
    ? fineRanking.slice(0, 4).map((row, index) => ({
        amount: formatMoneyCents(row.totalCents, defaultCurrency),
        meta: `${row.count} multe · media ${formatMoneyCents(Math.round(row.totalCents / Math.max(row.count, 1)), defaultCurrency)}`,
        title: `#${index + 1} · ${row.name}`,
      }))
    : (reportType === 'fines' ? fineRows : reportRows).slice(0, 4).map((row) => ({
        amount: formatMoneyCents(row.amountCents, row.currency || defaultCurrency),
        meta: `${getCostTargetLabel(row)} · ${getCostCategoryLabel(row.category)} · ${formatShortDateTime(row.date)}`,
        title: row.title,
      }))
  const reportPresetCards = [
    {
      description: 'Importi, targhe e responsabili nel periodo scelto.',
      label: 'Multe e sanzioni',
      metric: formatMoneyCents(fineTotalCents, defaultCurrency),
      onClick: () => {
        setReportType('fines')
        setCategoryFilter('fine')
        setTargetFilter('all')
      },
      status: `${fineRows.length} registrate`,
      tone: unassignedFineRows.length ? 'danger' : fineRows.length ? 'warning' : 'neutral',
    },
    {
      description: 'Chi ha generato piu sanzioni e quanto sono costate.',
      label: 'Classifica autisti',
      metric: fineRanking[0]?.name ?? 'Nessun dato',
      onClick: () => {
        setReportType('fine_ranking')
        setCategoryFilter('fine')
        setTargetFilter('all')
      },
      status: fineRanking[0] ? formatMoneyCents(fineRanking[0].totalCents, defaultCurrency) : '0 euro',
      tone: fineRanking.length ? 'info' : 'neutral',
    },
    {
      description: 'Manutenzioni, guasti e spese su una targa precisa.',
      label: 'Costi per targa',
      metric: topVehicleCost?.name ?? 'Nessun mezzo',
      onClick: () => {
        setReportType('detail')
        setCategoryFilter('all')
        setTargetFilter(topVehicleCost?.key ?? (vehicleRecords[0]?.id ? `vehicle:${vehicleRecords[0].id}` : 'all'))
      },
      status: topVehicleCost ? formatMoneyCents(topVehicleCost.totalCents, defaultCurrency) : '0 euro',
      tone: getCostSeverityTone(topVehicleCost?.totalCents ?? 0),
    },
    {
      description: 'Patenti, multe o costi collegati a una persona.',
      label: 'Costi per autista',
      metric: topDriverCost?.name ?? 'Nessun autista',
      onClick: () => {
        setReportType('detail')
        setCategoryFilter('all')
        setTargetFilter(topDriverCost?.key ?? (driverRecords[0]?.id ? `driver:${driverRecords[0].id}` : 'all'))
      },
      status: topDriverCost ? formatMoneyCents(topDriverCost.totalCents, defaultCurrency) : '0 euro',
      tone: getCostSeverityTone(topDriverCost?.totalCents ?? 0),
    },
  ]

  function buildReportFileSlug() {
    const periodSlug = period === 'custom'
      ? `${customStartDate || 'inizio'}-${customEndDate || 'fine'}`
      : period
    return [
      reportType,
      targetFilter,
      categoryFilter,
      periodSlug,
    ]
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function openExportModal() {
    setIsExportModalOpen(true)
  }

  function updateCostForm(field, value) {
    setCostForm((currentForm) => {
      if (field === 'targetType') {
        if (currentForm.category === 'fine') {
          return {
            ...currentForm,
            targetType: value,
          }
        }

        return {
          ...currentForm,
          assetId: '',
          driverId: '',
          targetType: value,
          vehicleId: value === 'vehicle' ? vehicleRecords[0]?.id ?? '' : '',
        }
      }

      return { ...currentForm, [field]: value }
    })
  }

  function getEmptyCostForm() {
    return {
      amount: '',
      assetId: '',
      category: 'maintenance',
      driverId: '',
      file: null,
      id: '',
      notes: '',
      odometerKm: '',
      spentAt: getDateInputToday(),
      supplier: '',
      targetType: 'vehicle',
      title: '',
      vehicleId: vehicleRecords[0]?.id ?? '',
    }
  }

  function getFineCostFormPreset() {
    return {
      ...getEmptyCostForm(),
      category: 'fine',
      driverId: driverRecords[0]?.id ?? '',
      supplier: 'Sanzione',
      targetType: 'driver',
      title: 'Sanzione',
      vehicleId: vehicleRecords[0]?.id ?? '',
    }
  }

  function openNewCostForm(type = 'cost') {
    if (isReportWorkspace) setReportSection('actions')
    setCostForm(type === 'fine' ? getFineCostFormPreset() : getEmptyCostForm())
    setFaultCostForm({ amount: '', id: '', notes: '' })
    if (type === 'fine') {
      setReportType('fines')
      setCategoryFilter('fine')
    } else if (['fines', 'fine_ranking'].includes(reportType)) {
      setReportType('detail')
      setCategoryFilter('all')
    }
    setIsAddingCost(true)
    window.requestAnimationFrame(() => {
      costEditorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  useEffect(() => {
    if (!startAddingCostKey) return undefined

    const startType = String(startAddingCostKey).startsWith('fine:') ? 'fine' : 'cost'
    const timeoutId = window.setTimeout(() => openNewCostForm(startType), 0)
    return () => window.clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAddingCostKey])

  useEffect(() => {
    if (!resetCostFormKey) return undefined

    const timeoutId = window.setTimeout(() => {
      resetCostForm()
      cancelFaultCostEdit()
    }, 0)
    return () => window.clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetCostFormKey])

  useEffect(() => {
    if (!isExportModalOpen) return undefined

    function handleExportModalKeyDown(event) {
      if (event.key === 'Escape') setIsExportModalOpen(false)
    }

    window.addEventListener('keydown', handleExportModalKeyDown)
    return () => window.removeEventListener('keydown', handleExportModalKeyDown)
  }, [isExportModalOpen])

  function resetCostForm() {
    setCostForm(getEmptyCostForm())
    setIsAddingCost(false)
  }

  async function handleSubmitCostEntry(event) {
    event.preventDefault()
    const amountCents = parseMoneyToCents(costForm.amount)

    if (!amountCents || !costForm.title.trim() || !costForm.spentAt) return

    const isFineEntry = costForm.category === 'fine'
    const payload = {
      amountCents,
      assetId: !isFineEntry && costForm.targetType === 'asset' ? costForm.assetId : '',
      category: costForm.category,
      currency: defaultCurrency,
      driverId: isFineEntry ? costForm.driverId : costForm.targetType === 'driver' ? costForm.driverId : '',
      notes: costForm.notes,
      odometerKm: costForm.odometerKm,
      spentAt: costForm.spentAt,
      supplier: costForm.supplier,
      title: costForm.title,
      vehicleId: isFineEntry ? costForm.vehicleId : costForm.targetType === 'vehicle' ? costForm.vehicleId : '',
    }
    const previousEntry = costEntryRecords.find((entry) => entry.id === costForm.id)

    setIsSavingCost(true)
    const saved = costForm.id
      ? await onUpdateCostEntry?.(costForm.id, payload, costForm.file, previousEntry)
      : await onCreateCostEntry?.(payload, costForm.file)
    setIsSavingCost(false)

    if (!saved) return

    resetCostForm()
  }

  function startEditingCostEntry(entry = {}) {
    if (isReportWorkspace) setReportSection('actions')
    setCostForm({
      amount: entry.amountCents ? String((Number(entry.amountCents) / 100).toFixed(2)).replace('.', ',') : '',
      assetId: entry.assetId ?? '',
      category: entry.category ?? 'maintenance',
      driverId: entry.driverId ?? '',
      file: null,
      id: entry.id ?? '',
      notes: entry.notes ?? '',
      odometerKm: entry.odometerKm ? String(entry.odometerKm) : '',
      spentAt: entry.spentAt ?? getDateInputToday(),
      supplier: entry.supplier ?? '',
      targetType: entry.driverId ? 'driver' : entry.assetId ? 'asset' : entry.vehicleId ? 'vehicle' : 'company',
      title: entry.title ?? '',
      vehicleId: entry.vehicleId ?? '',
    })
    setFaultCostForm({ amount: '', id: '', notes: '' })
    setIsAddingCost(true)
    window.requestAnimationFrame(() => {
      costEditorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  async function deleteCostEntry(entry = {}) {
    const confirmed = window.confirm(`Eliminare la spesa "${entry.title}" dal Centro costi?`)
    if (!confirmed) return

    const deleted = await onDeleteCostEntry?.(entry)
    if (deleted && costForm.id === entry.id) resetCostForm()
  }

  function startEditingFaultCost(report = {}) {
    if (isReportWorkspace) setReportSection('actions')
    setFaultCostForm({
      amount: report.repairCostCents ? String((Number(report.repairCostCents) / 100).toFixed(2)).replace('.', ',') : '',
      id: report.id ?? '',
      notes: report.repairNotes ?? '',
    })
    setIsAddingCost(false)
    window.requestAnimationFrame(() => {
      costEditorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  function cancelFaultCostEdit() {
    setFaultCostForm({ amount: '', id: '', notes: '' })
  }

  async function submitFaultCostEdit(event) {
    event.preventDefault()
    const report = faultReportRecords.find((entry) => entry.id === faultCostForm.id)
    if (!report) return

    const amountCents = parseMoneyToCents(faultCostForm.amount)
    await onUpdateFaultStatus?.(report.id, report.status, {
      repairCostCents: amountCents,
      repairCostCurrency: report.repairCostCurrency || defaultCurrency,
      repairNotes: faultCostForm.notes,
    })
    cancelFaultCostEdit()
  }

  async function deleteFaultCost(report = {}) {
    const confirmed = window.confirm(`Eliminare il costo registrato sul guasto "${report.title}"?`)
    if (!confirmed) return

    await onUpdateFaultStatus?.(report.id, report.status, {
      repairCleared: true,
      repairCostCents: 0,
      repairCostCurrency: report.repairCostCurrency || defaultCurrency,
      repairNotes: '',
    })

    if (faultCostForm.id === report.id) cancelFaultCostEdit()
  }

  function getCostTargetLabel(row) {
    const vehicle = row.vehicleId ? vehicleById.get(row.vehicleId) : null
    const asset = row.assetId ? assetById.get(row.assetId) : null
    const driver = row.driverId ? driverById.get(row.driverId) : null
    const labels = [
      vehicle ? `${vehicle.plate} · ${getFleetTypeLabel(vehicle.fleetType)}` : row.vehicleId ? 'Mezzo' : '',
      asset ? `${asset.code} · ${asset.model || 'Attrezzatura'}` : row.assetId ? 'Attrezzatura' : '',
      driver ? driver.name : row.driverId ? 'Autista' : '',
    ].filter(Boolean)

    return labels.length ? labels.join(' · ') : 'Azienda'
  }

  function getCostVehicleLabel(row) {
    if (!row.vehicleId) return ''
    const vehicle = vehicleById.get(row.vehicleId)
    return vehicle ? `${vehicle.plate} · ${getFleetTypeLabel(vehicle.fleetType)}` : 'Mezzo'
  }

  function getCostDriverLabel(row) {
    if (!row.driverId) return ''
    return driverById.get(row.driverId)?.name ?? 'Autista'
  }

  function getCostAssetLabel(row) {
    if (!row.assetId) return ''
    const asset = assetById.get(row.assetId)
    return asset ? `${asset.code} · ${asset.model || 'Attrezzatura'}` : 'Attrezzatura'
  }

  function getComplianceReportTargetLabel(item = {}) {
    const driverId = item.driverId || item.driver_id
    const vehicleId = item.vehicleId || item.vehicle_id
    const assetId = item.assetId || item.asset_id
    const personName = item.personName || item.person_name || item.owner || ''

    if (driverId) return driverById.get(driverId)?.name ?? 'Autista'
    if (vehicleId) {
      const vehicle = vehicleById.get(vehicleId)
      return vehicle ? `${vehicle.plate} · ${getFleetTypeLabel(vehicle.fleetType)}` : 'Mezzo'
    }
    if (assetId) {
      const asset = assetById.get(assetId)
      return asset ? `${asset.code} · ${asset.model || 'Attrezzatura'}` : 'Attrezzatura'
    }
    if (personName) return personName

    return item.scope === 'company' ? companyName : 'Azienda'
  }

  function downloadCostCsv() {
    const formatCsvDate = (value) => {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return String(value)
      return new Intl.DateTimeFormat('it-IT').format(date)
    }
    const rowsForExport = reportType === 'fines' ? fineRows : reportRows
    const csvMetadataRows = [
      ['Report', reportTitle],
      ['Periodo', reportPeriodLabel],
      ['Soggetto', selectedTargetLabel],
      ['Tipologia', selectedCategoryLabel],
      ['Totale periodo', (Number(totalCents ?? 0) / 100).toFixed(2), defaultCurrency],
      ['Voci filtrate', summaryRows.length],
      ['Multe non assegnate', unassignedFineRows.length, (Number(unassignedFineTotalCents ?? 0) / 100).toFixed(2), defaultCurrency],
      ['Soggetto piu costoso', topTargetCost?.name ?? 'Nessun dato', topTargetCost ? (Number(topTargetCost.totalCents ?? 0) / 100).toFixed(2) : '', defaultCurrency],
      ['Categoria piu costosa', topCategoryCost?.name ?? 'Nessun dato', topCategoryCost ? (Number(topCategoryCost.totalCents ?? 0) / 100).toFixed(2) : '', defaultCurrency],
      ['Spese senza collegamento', unlinkedCostRows.length],
      [],
    ]
    const csvRows = reportType === 'fine_ranking'
      ? [
          ...csvMetadataRows,
          ['Posizione', 'Autista', 'Numero multe', 'Totale', 'Media'],
          ...fineRanking.map((row, index) => [
            index + 1,
            row.name,
            row.count,
            (Number(row.totalCents ?? 0) / 100).toFixed(2),
            (Number(row.totalCents ?? 0) / Math.max(row.count, 1) / 100).toFixed(2),
          ]),
        ]
      : [
          ...csvMetadataRows,
          ['Data', 'Titolo', 'Categoria', 'Targa o mezzo', 'Autista', 'Attrezzatura', 'Soggetto completo', 'Importo', 'Valuta', 'Tipo', 'Fornitore', 'Km', 'Note'],
          ...rowsForExport.map((row) => {
            const source = row.source ?? {}
            return [
              formatCsvDate(row.date),
              row.title,
              getCostCategoryLabel(row.category),
              getCostVehicleLabel(row),
              getCostDriverLabel(row),
              getCostAssetLabel(row),
              getCostTargetLabel(row),
              (Number(row.amountCents ?? 0) / 100).toFixed(2),
              row.currency || defaultCurrency,
              row.kind === 'fault' ? 'Guasto' : 'Spesa libera',
              source.supplier ?? '',
              source.odometerKm ?? '',
              row.description ?? '',
            ]
          }),
        ]
    const csv = csvRows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(';'))
      .join('\n')
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vygo-${buildReportFileSlug()}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function downloadMonthlyPremiumCsv() {
    const csvRows = [
      ['Report mensile Premium', companyName],
      ['Mese', monthlyRange.label],
      ['Totale costi mese', (Number(monthlyTotalCents ?? 0) / 100).toFixed(2), defaultCurrency],
      ['Voci costo', monthlyCostRows.length],
      ['Multe mese', monthlyFineRows.length, (Number(monthlyFineTotalCents ?? 0) / 100).toFixed(2), defaultCurrency],
      ['Guasti aperti', monthlyOpenFaultRows.length],
      ['Check mese', monthlyCheckRows.length],
      ['Check ok', monthlyOkCheckRows.length],
      ['Check critici', monthlyCriticalCheckRows.length],
      ['Scadenze da lavorare', actionableDeadlineRows.length],
      ['Soggetto piu costoso', monthlyTopTargetCost?.name ?? 'Nessun dato', monthlyTopTargetCost ? (Number(monthlyTopTargetCost.totalCents ?? 0) / 100).toFixed(2) : '', defaultCurrency],
      ['Categoria piu pesante', monthlyTopCategoryCost?.name ?? 'Nessun dato', monthlyTopCategoryCost ? (Number(monthlyTopCategoryCost.totalCents ?? 0) / 100).toFixed(2) : '', defaultCurrency],
      [],
      ['Sezione', 'Data', 'Titolo', 'Soggetto', 'Importo', 'Valuta', 'Stato / Note'],
      ...monthlyCostRows.map((row) => [
        'Costi',
        formatDate(row.date),
        row.title,
        getCostTargetLabel(row),
        (Number(row.amountCents ?? 0) / 100).toFixed(2),
        row.currency || defaultCurrency,
        `${getCostCategoryLabel(row.category)} · ${row.description || ''}`,
      ]),
      ...monthlyFaultRows.map((report) => [
        'Guasti ricevuti',
        formatDate(report.createdAt || report.updatedAt),
        report.title,
        getCostTargetLabel(report),
        '',
        '',
        `${getFaultSeverityLabel(report.severity)} · ${getFaultStatusLabel(report.status)} · ${report.description || ''}`,
      ]),
      ...monthlyCheckRows.map((check) => [
        hasCheckIssues(check) ? 'Check critici' : 'Check ok',
        formatDate(check.createdAt || check.updatedAt),
        'Check mattutino',
        getCostTargetLabel(check),
        '',
        '',
        hasCheckIssues(check) ? getCheckIssues(check).join(', ') : 'Tutto ok',
      ]),
      ...actionableDeadlineRows.map((item) => [
        'Scadenze da lavorare',
        formatDate(item.dueDate),
        item.type || 'Scadenza',
        getComplianceReportTargetLabel(item),
        '',
        '',
        `Stato: ${item.status || 'open'}`,
      ]),
    ]
    const csv = csvRows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(';'))
      .join('\n')
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vygo-report-mensile-${monthlyRange.label.replace(/\s+/g, '-').toLowerCase()}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function printCostReport() {
    const escapeHtml = (value) => String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
    const rowsHtml = reportType === 'fine_ranking'
      ? fineRanking.map((row, index) => `
          <tr>
            <td>#${index + 1}</td>
            <td>${escapeHtml(row.name)}</td>
            <td>${row.count}</td>
            <td>${escapeHtml(formatMoneyCents(row.totalCents, defaultCurrency))}</td>
            <td>${escapeHtml(formatMoneyCents(Math.round(row.totalCents / Math.max(row.count, 1)), defaultCurrency))}</td>
          </tr>
        `).join('')
      : reportRows.map((row) => `
          <tr>
            <td>${escapeHtml(formatShortDateTime(row.date))}</td>
            <td>${escapeHtml(row.title)}</td>
            <td>${escapeHtml(getCostCategoryLabel(row.category))}</td>
            <td>${escapeHtml(getCostTargetLabel(row))}</td>
            <td>${escapeHtml(formatMoneyCents(row.amountCents, row.currency || defaultCurrency))}</td>
          </tr>
        `).join('')
    const headerHtml = reportType === 'fine_ranking'
      ? '<tr><th>Pos.</th><th>Autista</th><th>Multe</th><th>Totale</th><th>Media</th></tr>'
      : '<tr><th>Data</th><th>Titolo</th><th>Tipologia</th><th>Soggetto</th><th>Importo</th></tr>'
    const insightHtml = `
      <section class="insights">
        <div><span>Soggetto piu costoso</span><strong>${escapeHtml(topTargetCost?.name ?? 'Nessun dato')}</strong><small>${escapeHtml(topTargetCost ? formatMoneyCents(topTargetCost.totalCents, defaultCurrency) : formatMoneyCents(0, defaultCurrency))}</small></div>
        <div><span>Categoria piu costosa</span><strong>${escapeHtml(topCategoryCost?.name ?? 'Nessun dato')}</strong><small>${escapeHtml(topCategoryCost ? formatMoneyCents(topCategoryCost.totalCents, defaultCurrency) : formatMoneyCents(0, defaultCurrency))}</small></div>
        <div><span>Multe non assegnate</span><strong>${unassignedFineRows.length}</strong><small>${escapeHtml(formatMoneyCents(unassignedFineTotalCents, defaultCurrency))}</small></div>
        <div><span>Spese senza collegamento</span><strong>${unlinkedCostRows.length}</strong><small>Da assegnare a targa, autista o attrezzatura</small></div>
      </section>
    `
    const printWindow = window.open('', '_blank', 'noopener,noreferrer')

    if (!printWindow) {
      window.print()
      return
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(reportTitle)}</title>
          <style>
            body { color: #111827; font-family: Arial, sans-serif; margin: 28px; }
            h1 { font-size: 24px; margin: 0 0 6px; }
            p { color: #4b5563; margin: 0 0 18px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 18px; }
            .summary div { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; }
            .summary strong { display: block; font-size: 18px; }
            .summary span { color: #6b7280; font-size: 12px; }
            .insights { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 18px; }
            .insights div { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; }
            .insights span, .insights small { color: #64748b; display: block; font-size: 11px; }
            .insights strong { color: #0f172a; display: block; font-size: 14px; margin: 4px 0; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border-bottom: 1px solid #e5e7eb; font-size: 12px; padding: 9px; text-align: left; }
            th { background: #ecfeff; color: #0f172a; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(reportTitle)}</h1>
          <p>${escapeHtml(reportSubtitle)}<br>${escapeHtml(selectedTargetLabel)} · ${escapeHtml(reportPeriodLabel)} · ${escapeHtml(selectedCategoryLabel)}</p>
          <section class="summary">
            <div><strong>${escapeHtml(formatMoneyCents(totalCents, defaultCurrency))}</strong><span>Totale periodo</span></div>
            <div><strong>${summaryRows.length}</strong><span>Voci costo</span></div>
            <div><strong>${escapeHtml(formatMoneyCents(fineTotalCents, defaultCurrency))}</strong><span>Totale sanzioni</span></div>
            <div><strong>${unassignedFineRows.length}</strong><span>Multe non assegnate</span></div>
          </section>
          ${insightHtml}
          <table>
            <thead>${headerHtml}</thead>
            <tbody>${rowsHtml || '<tr><td colspan="5">Nessun dato per questi filtri.</td></tr>'}</tbody>
          </table>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  function printMonthlyPremiumReport() {
    const escapeHtml = (value) => String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
    const actionHtml = monthlyActionRows.map((action) => `
      <li>
        <strong>${escapeHtml(action.title)}</strong>
        <span>${escapeHtml(action.value)} · ${escapeHtml(action.body)}</span>
      </li>
    `).join('')
    const costRowsHtml = monthlyCostRows.slice(0, 24).map((row) => `
      <tr>
        <td>${escapeHtml(formatShortDateTime(row.date))}</td>
        <td>${escapeHtml(row.title)}</td>
        <td>${escapeHtml(getCostTargetLabel(row))}</td>
        <td>${escapeHtml(getCostCategoryLabel(row.category))}</td>
        <td>${escapeHtml(formatMoneyCents(row.amountCents, row.currency || defaultCurrency))}</td>
      </tr>
    `).join('')
    const deadlineRowsHtml = actionableDeadlineRows.slice(0, 18).map((item) => `
      <tr>
        <td>${escapeHtml(formatDate(item.dueDate))}</td>
        <td>${escapeHtml(item.type || 'Scadenza')}</td>
        <td>${escapeHtml(getComplianceReportTargetLabel(item))}</td>
        <td>${escapeHtml(item.status || 'open')}</td>
      </tr>
    `).join('')
    const printWindow = window.open('', '_blank', 'noopener,noreferrer')

    if (!printWindow) {
      window.print()
      return
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Report mensile Premium ${escapeHtml(monthlyRange.label)}</title>
          <style>
            body { color: #111827; font-family: Arial, sans-serif; margin: 28px; }
            h1 { font-size: 25px; margin: 0 0 4px; }
            h2 { font-size: 16px; margin: 22px 0 8px; }
            p { color: #4b5563; margin: 0 0 18px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 18px 0; }
            .summary div { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; }
            .summary strong { display: block; font-size: 17px; }
            .summary span { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            .actions { border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 16px; background: #f0fdff; }
            .actions li { margin: 8px 0; }
            .actions span { color: #475569; display: block; font-size: 12px; margin-top: 2px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border-bottom: 1px solid #e5e7eb; font-size: 12px; padding: 9px; text-align: left; }
            th { background: #ecfeff; color: #0f172a; }
          </style>
        </head>
        <body>
          <h1>Report mensile Premium</h1>
          <p>${escapeHtml(companyName)} · ${escapeHtml(monthlyRange.label)} · generato da Vygo</p>
          <section class="summary">
            <div><strong>${escapeHtml(formatMoneyCents(monthlyTotalCents, defaultCurrency))}</strong><span>Costi mese</span></div>
            <div><strong>${monthlyCostRows.length}</strong><span>Voci costo</span></div>
            <div><strong>${monthlyOpenFaultRows.length}</strong><span>Guasti aperti</span></div>
            <div><strong>${actionableDeadlineRows.length}</strong><span>Scadenze da lavorare</span></div>
            <div><strong>${monthlyCriticalCheckRows.length}</strong><span>Check critici</span></div>
            <div><strong>${monthlyFineRows.length}</strong><span>Multe mese</span></div>
            <div><strong>${escapeHtml(monthlyTopTargetCost?.name ?? 'Nessun dato')}</strong><span>Soggetto più costoso</span></div>
            <div><strong>${escapeHtml(monthlyTopCategoryCost?.name ?? 'Nessun dato')}</strong><span>Categoria più pesante</span></div>
          </section>
          <h2>Azioni consigliate</h2>
          <ul class="actions">${actionHtml || '<li><strong>Nessuna urgenza</strong><span>Il mese non presenta criticità operative aperte.</span></li>'}</ul>
          <h2>Costi del mese</h2>
          <table>
            <thead><tr><th>Data</th><th>Titolo</th><th>Soggetto</th><th>Categoria</th><th>Importo</th></tr></thead>
            <tbody>${costRowsHtml || '<tr><td colspan="5">Nessun costo registrato nel mese.</td></tr>'}</tbody>
          </table>
          <h2>Scadenze da lavorare</h2>
          <table>
            <thead><tr><th>Scadenza</th><th>Tipo</th><th>Soggetto</th><th>Stato</th></tr></thead>
            <tbody>${deadlineRowsHtml || '<tr><td colspan="4">Nessuna scadenza urgente.</td></tr>'}</tbody>
          </table>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const isFineCostForm = costForm.category === 'fine'
  const reportSections = [
    { id: 'overview', icon: Gauge, label: 'Panoramica' },
    { id: 'actions', icon: Plus, label: 'Inserisci' },
    { id: 'monthly', icon: CalendarClock, label: 'Mensile' },
    { id: 'details', icon: FileText, label: 'Dettaglio' },
  ]
  const showReportOverview = !isReportWorkspace || reportSection === 'overview'
  const showReportActions = !isReportWorkspace || reportSection === 'actions'
  const showReportMonthly = isReportWorkspace && reportSection === 'monthly'
  const showReportDetails = !isReportWorkspace || reportSection === 'details'

  return (
    <section className={`fault-cost-report ${isReportWorkspace ? 'is-report-workspace' : ''}`} id="fault-cost-report">
      <div className="fault-cost-report-header">
        <div>
          <p className="overline">{isReportWorkspace ? 'Report aziendali' : 'Centro costi'}</p>
          <h3>{isReportWorkspace ? reportTitle : selectedTargetLabel}</h3>
          {isReportWorkspace ? (
            <span>{reportSubtitle}</span>
          ) : null}
        </div>
        <div className="fault-cost-report-actions">
          {isReportWorkspace ? (
            <button className="primary-button compact-button" onClick={openExportModal} type="button">
              <Download size={16} />
              Esporta report
            </button>
          ) : (
            <button className="primary-button compact-button" onClick={() => (isAddingCost ? resetCostForm() : openNewCostForm())} type="button">
              <Plus size={16} />
              {isAddingCost ? 'Chiudi' : 'Aggiungi spesa libera'}
            </button>
          )}
        </div>
      </div>
      {isReportWorkspace ? (
        <div className="report-section-tabs" role="tablist" aria-label="Sezioni report">
          {reportSections.map((section) => (
            <button
              aria-selected={reportSection === section.id}
              className={reportSection === section.id ? 'is-active' : ''}
              key={section.id}
              onClick={() => setReportSection(section.id)}
              role="tab"
              type="button"
            >
              <section.icon size={16} />
              {section.label}
            </button>
          ))}
        </div>
      ) : null}
      {isReportWorkspace && (showReportOverview || showReportDetails) ? (
        <div className="report-active-summary" aria-label="Filtri report applicati">
          {activeFilterBadges.map((badge) => (
            <span key={badge.label}>
              <small>{badge.label}</small>
              <strong>{badge.value}</strong>
            </span>
          ))}
          {unassignedFineRows.length > 0 ? (
            <button className="report-warning-chip" onClick={() => {
              setReportType('fine_ranking')
              setCategoryFilter('fine')
            }} type="button">
              <AlertTriangle size={15} />
              {unassignedFineRows.length} multe non assegnate · {formatMoneyCents(unassignedFineTotalCents, defaultCurrency)}
            </button>
          ) : null}
        </div>
      ) : null}
      {isReportWorkspace && isExportModalOpen ? (
        <div className="report-export-backdrop" onClick={() => setIsExportModalOpen(false)}>
          <section
            aria-label="Esporta report"
            aria-modal="true"
            className="report-export-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="report-export-header">
              <div>
                <p className="overline">Esporta report</p>
                <h3>Prepara CSV o stampa/PDF</h3>
                <span>Scegli i filtri qui sotto: il file generato seguira esattamente questa selezione.</span>
              </div>
              <button aria-label="Chiudi esportazione report" className="icon-button" onClick={() => setIsExportModalOpen(false)} type="button">
                <X size={18} />
              </button>
            </header>

            <div className="report-export-layout">
              <div className="report-export-filters" aria-label="Filtri esportazione report">
                <label>
                  Tipo report
                  <select
                    value={reportType}
                    onChange={(event) => {
                      const nextReportType = event.target.value
                      setReportType(nextReportType)
                      if (['fines', 'fine_ranking'].includes(nextReportType)) setCategoryFilter('fine')
                    }}
                  >
                    <option value="detail">Dettaglio costi</option>
                    <option value="fines">Solo multe / sanzioni</option>
                    <option value="fine_ranking">Classifica multe autisti</option>
                  </select>
                </label>
                <label>
                  Soggetto
                  <select value={targetFilter} onChange={(event) => setTargetFilter(event.target.value)}>
                    <option value="all">Tutti i costi</option>
                    <option value="company">Azienda generale</option>
                    {vehicleRecords.map((vehicle) => (
                      <option key={vehicle.id} value={`vehicle:${vehicle.id}`}>
                        Mezzo · {vehicle.plate} · {getFleetTypeLabel(vehicle.fleetType)}
                      </option>
                    ))}
                    {driverRecords.map((driver) => (
                      <option key={driver.id} value={`driver:${driver.id}`}>
                        Autista · {driver.name}
                      </option>
                    ))}
                    {assetRecords.map((asset) => (
                      <option key={asset.id} value={`asset:${asset.id}`}>
                        Attrezzatura · {asset.code} · {asset.model || 'Muletto'}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Tipologia costo
                  <select
                    disabled={['fines', 'fine_ranking'].includes(reportType)}
                    value={['fines', 'fine_ranking'].includes(reportType) ? 'fine' : categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                  >
                    <option value="all">Tutte le tipologie</option>
                    {costCategoryOptions.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Periodo
                  <select value={period} onChange={(event) => setPeriod(event.target.value)}>
                    <option value="today">Oggi</option>
                    <option value="month">Questo mese</option>
                    <option value="year">Anno in corso</option>
                    <option value="custom">Periodo personalizzato</option>
                    <option value="all">Sempre</option>
                  </select>
                </label>
                {period === 'custom' ? (
                  <div className="report-export-date-grid">
                    <label>
                      Dal
                      <input type="date" value={customStartDate} onChange={(event) => setCustomStartDate(event.target.value)} />
                    </label>
                    <label>
                      Al
                      <input type="date" value={customEndDate} onChange={(event) => setCustomEndDate(event.target.value)} />
                    </label>
                  </div>
                ) : null}
              </div>

              <aside className="report-export-preview" aria-label="Anteprima esportazione">
                <div className="report-export-preview-title">
                  <span>Anteprima report</span>
                  <strong>{reportTitle}</strong>
                  <small>{reportSubtitle}</small>
                </div>
                <div className="report-export-kpis">
                  <article>
                    <span>Totale</span>
                    <strong>{formatMoneyCents(totalCents, defaultCurrency)}</strong>
                  </article>
                  <article>
                    <span>Righe</span>
                    <strong>{exportPreviewCount}</strong>
                  </article>
                  <article className={unassignedFineRows.length ? 'is-warning' : ''}>
                    <span>Non assegnate</span>
                    <strong>{unassignedFineRows.length}</strong>
                  </article>
                </div>
                <div className="report-export-badges">
                  {activeFilterBadges.map((badge) => (
                    <span key={`export-${badge.label}`}>
                      <small>{badge.label}</small>
                      <b>{badge.value}</b>
                    </span>
                  ))}
                </div>
                <div className="report-export-rows">
                  {exportPreviewRows.length ? exportPreviewRows.map((row) => (
                    <article key={`${row.title}-${row.meta}`}>
                      <span>
                        <strong>{row.title}</strong>
                        <small>{row.meta}</small>
                      </span>
                      <b>{row.amount}</b>
                    </article>
                  )) : (
                    <p>Nessun dato con questi filtri. Cambia periodo, soggetto o tipologia prima di esportare.</p>
                  )}
                </div>
              </aside>
            </div>

            <footer className="report-export-footer">
              <button className="secondary-button compact-button" onClick={() => setIsExportModalOpen(false)} type="button">
                Annulla
              </button>
              <button
                className="secondary-button compact-button"
                onClick={() => {
                  downloadCostCsv()
                  setIsExportModalOpen(false)
                }}
                type="button"
              >
                <Download size={16} />
                Scarica CSV
              </button>
              <button
                className="primary-button compact-button"
                onClick={() => {
                  printCostReport()
                  setIsExportModalOpen(false)
                }}
                type="button"
              >
                <FileText size={16} />
                Stampa / PDF
              </button>
            </footer>
          </section>
        </div>
      ) : null}
      {isReportWorkspace && showReportOverview ? (
        <div className="report-shortcuts-panel" aria-label="Scorciatoie report">
          <div className="report-shortcuts-head">
            <strong>Scorciatoie operative</strong>
            <span>Aprono subito la vista utile. Per creare CSV o PDF usa Esporta report.</span>
          </div>
          <div className="report-question-grid">
            {reportPresetCards.map((card) => (
              <button className={`report-question-card tone-${card.tone || 'neutral'}`} key={card.label} onClick={card.onClick} type="button">
                <small>{card.status}</small>
                <strong>{card.label}</strong>
                <em>{card.metric}</em>
                <span>{card.description}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {isReportWorkspace && showReportActions ? (
        <div className="report-action-board" aria-label="Azioni report e inserimento costi">
          <div>
            <p className="overline">Inserimento dati</p>
            <strong>Aggiungi costi e sanzioni</strong>
            <span>Qui registri manualmente manutenzioni, multe, assicurazioni, gomme, revisioni o spese generali. I report sotto si aggiornano con gli stessi filtri.</span>
          </div>
          <div className="report-action-grid">
            <button
              className={`report-action-button ${isAddingCost && !isFineCostForm ? 'is-active' : ''}`}
              onClick={() => openNewCostForm('cost')}
              type="button"
            >
              <Plus size={18} />
              <strong>Nuova spesa</strong>
              <span>Manutenzione, gomme, assicurazione, revisione, muletto o costo libero.</span>
            </button>
            <button
              className={`report-action-button is-warning ${isAddingCost && isFineCostForm ? 'is-active' : ''}`}
              onClick={() => openNewCostForm('fine')}
              type="button"
            >
              <AlertTriangle size={18} />
              <strong>Nuova sanzione</strong>
              <span>Multe con importo, targa e autista responsabile.</span>
            </button>
            <button className="report-action-button is-primary" onClick={openExportModal} type="button">
              <Download size={18} />
              <strong>Esporta report</strong>
              <span>Scegli filtri, controlla anteprima e poi scarica CSV o stampa/PDF.</span>
            </button>
          </div>
        </div>
      ) : null}
      {isAddingCost && (!isReportWorkspace || showReportActions) ? (
        <form className={`fault-cost-entry-form ${isFineCostForm ? 'is-fine-entry' : ''}`} onSubmit={handleSubmitCostEntry} ref={costEditorRef}>
          <div className="fault-cost-entry-title fault-cost-entry-wide">
            <strong>
              {isFineCostForm
                ? costForm.id ? 'Modifica sanzione' : 'Nuova sanzione'
                : costForm.id ? 'Modifica spesa libera' : 'Nuova spesa libera'}
            </strong>
            <span>
              {isFineCostForm
                ? 'Registra importo, data, autista responsabile e targa collegata. Se manca l autista finisce in Non assegnate.'
                : 'Registra manutenzioni, gomme, assicurazioni, revisioni, muletti o costi aziendali anche senza guasto.'}
            </span>
          </div>
          <label>
            {isFineCostForm ? 'Titolo / verbale' : 'Titolo spesa'}
            <input required value={costForm.title} onChange={(event) => updateCostForm('title', event.target.value)} placeholder={isFineCostForm ? 'Verbale, sanzione ZTL, eccesso velocita...' : 'Tagliando, gomme, fattura officina...'} />
          </label>
          <label>
            Importo + IVA
            <input inputMode="decimal" required value={costForm.amount} onChange={(event) => updateCostForm('amount', event.target.value)} placeholder="2000,00" />
          </label>
          <label>
            Categoria
            <select value={costForm.category} onChange={(event) => updateCostForm('category', event.target.value)}>
              {costCategoryOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            Data
            <input required type="date" value={costForm.spentAt} onChange={(event) => updateCostForm('spentAt', event.target.value)} />
          </label>
          {isFineCostForm ? (
            <>
              <label>
                Autista responsabile
                <select value={costForm.driverId} onChange={(event) => updateCostForm('driverId', event.target.value)}>
                  <option value="">Senza autista</option>
                  {driverRecords.map((driver) => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Mezzo / targa collegata
                <select value={costForm.vehicleId} onChange={(event) => updateCostForm('vehicleId', event.target.value)}>
                  <option value="">Senza targa</option>
                  {vehicleRecords.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.plate} · {getFleetTypeLabel(vehicle.fleetType)}</option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <>
              <label>
                Collegata a
                <select value={costForm.targetType} onChange={(event) => updateCostForm('targetType', event.target.value)}>
                  <option value="vehicle">Mezzo / targa</option>
                  <option value="asset">Attrezzatura / muletto</option>
                  <option value="driver">Autista</option>
                  <option value="company">Azienda generale</option>
                </select>
              </label>
              {costForm.targetType === 'vehicle' ? (
                <label>
                  Mezzo
                  <select value={costForm.vehicleId} onChange={(event) => updateCostForm('vehicleId', event.target.value)}>
                    <option value="">Senza targa</option>
                    {vehicleRecords.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>{vehicle.plate} · {getFleetTypeLabel(vehicle.fleetType)}</option>
                    ))}
                  </select>
                </label>
              ) : null}
              {costForm.targetType === 'asset' ? (
                <label>
                  Attrezzatura
                  <select value={costForm.assetId} onChange={(event) => updateCostForm('assetId', event.target.value)}>
                    <option value="">Senza attrezzatura</option>
                    {assetRecords.map((asset) => (
                      <option key={asset.id} value={asset.id}>{asset.code} · {asset.model || 'Attrezzatura'}</option>
                    ))}
                  </select>
                </label>
              ) : null}
              {costForm.targetType === 'driver' ? (
                <label>
                  Autista
                  <select value={costForm.driverId} onChange={(event) => updateCostForm('driverId', event.target.value)}>
                    <option value="">Senza autista</option>
                    {driverRecords.map((driver) => (
                      <option key={driver.id} value={driver.id}>{driver.name}</option>
                    ))}
                  </select>
                </label>
              ) : null}
            </>
          )}
          <label>
            Fornitore
            <input value={costForm.supplier} onChange={(event) => updateCostForm('supplier', event.target.value)} placeholder="Officina, gommista, assicurazione..." />
          </label>
          <label>
            Km mezzo
            <input inputMode="numeric" value={costForm.odometerKm} onChange={(event) => updateCostForm('odometerKm', event.target.value)} placeholder="Opzionale" />
          </label>
          <label className="fault-cost-entry-wide">
            Note
            <textarea value={costForm.notes} onChange={(event) => updateCostForm('notes', event.target.value)} placeholder="Dettagli intervento, numero fattura, promemoria..." />
          </label>
          <label className="fault-cost-entry-wide fault-cost-file-label">
            Allegato fattura/foto
            <input accept="image/*,.pdf" type="file" onChange={(event) => updateCostForm('file', event.target.files?.[0] ?? null)} />
          </label>
          <button className="primary-button fault-cost-entry-wide" disabled={isSavingCost} type="submit">
            {isSavingCost ? 'Salvo...' : costForm.id ? 'Aggiorna spesa' : 'Salva spesa'}
          </button>
          <button className="secondary-button fault-cost-entry-wide" onClick={resetCostForm} type="button">
            {costForm.id ? 'Annulla modifica' : 'Chiudi inserimento'}
          </button>
        </form>
      ) : null}
      {faultCostForm.id && (!isReportWorkspace || showReportActions) ? (
        <form className="fault-cost-entry-form" onSubmit={submitFaultCostEdit} ref={costEditorRef}>
          <div className="fault-cost-entry-title fault-cost-entry-wide">
            <strong>Modifica costo guasto</strong>
            <span>Cambia o azzera il costo riparazione registrato su un guasto già archiviato o aperto.</span>
          </div>
          <label>
            Importo speso
            <input inputMode="decimal" value={faultCostForm.amount} onChange={(event) => setFaultCostForm((currentForm) => ({ ...currentForm, amount: event.target.value }))} placeholder="450,00" />
          </label>
          <label>
            Note officina/intervento
            <input value={faultCostForm.notes} onChange={(event) => setFaultCostForm((currentForm) => ({ ...currentForm, notes: event.target.value }))} placeholder="Dettaglio intervento" />
          </label>
          <button className="primary-button" type="submit">
            Aggiorna costo guasto
          </button>
          <button className="secondary-button" onClick={cancelFaultCostEdit} type="button">
            Annulla modifica
          </button>
        </form>
      ) : null}
      {showReportMonthly ? (
        <section className="monthly-premium-report" aria-label="Report mensile">
          <div className="monthly-report-head">
            <div>
              <p className="overline">Report mensile</p>
              <h3>Report automatico {monthlyRange.label}</h3>
              <span>Riepilogo pronto per titolare: costi, multe, guasti, check, scadenze e priorita operative.</span>
            </div>
            <div className="monthly-report-buttons">
              <button className="secondary-button compact-button" onClick={downloadMonthlyPremiumCsv} type="button">
                <Download size={16} />
                CSV mese
              </button>
              <button className="primary-button compact-button" onClick={printMonthlyPremiumReport} type="button">
                <FileText size={16} />
                Stampa mese
              </button>
            </div>
          </div>
          <div className="monthly-archive-panel">
            <div className="monthly-archive-heading">
              <strong>Archivio report mensili</strong>
              <span>Ogni mese si compone automaticamente dai dati storici. Scegli il mese e poi stampa o esporta.</span>
            </div>
            <div className="monthly-archive-strip" aria-label="Archivio mesi disponibili">
              {monthlyArchiveRows.map((row) => (
                <button
                  className={row.key === selectedArchiveMonthKey ? 'is-active' : ''}
                  key={row.key}
                  onClick={() => setSelectedArchiveMonthKey(row.key)}
                  type="button"
                >
                  <strong>{row.label}</strong>
                  <span>{formatMoneyCents(row.totalCents, defaultCurrency)}</span>
                  <small>
                    {row.costCount} costi · {row.faultCount} guasti · {row.criticalCheckCount} check critici · {row.deadlineCount} scadenze
                  </small>
                </button>
              ))}
            </div>
          </div>
          <div className="monthly-report-grid">
            <article className="is-accent">
              <span>Costi mese</span>
              <strong>{formatMoneyCents(monthlyTotalCents, defaultCurrency)}</strong>
              <small>{monthlyCostRows.length} voci registrate</small>
            </article>
            <article className={monthlyOpenFaultRows.length ? 'is-danger' : ''}>
              <span>Guasti aperti</span>
              <strong>{monthlyOpenFaultRows.length}</strong>
              <small>{monthlyFaultRows.length} ricevuti nel mese</small>
            </article>
            <article className={monthlyCriticalCheckRows.length ? 'is-warning' : ''}>
              <span>Check critici</span>
              <strong>{monthlyCriticalCheckRows.length}</strong>
              <small>{monthlyOkCheckRows.length} check ok</small>
            </article>
            <article className={actionableDeadlineRows.length ? 'is-danger' : ''}>
              <span>Scadenze da lavorare</span>
              <strong>{actionableDeadlineRows.length}</strong>
              <small>{monthlyDeadlineRows.length} con data nel mese</small>
            </article>
            <article>
              <span>Soggetto più costoso</span>
              <strong>{monthlyTopTargetCost?.name ?? 'Nessun dato'}</strong>
              <small>{monthlyTopTargetCost ? formatMoneyCents(monthlyTopTargetCost.totalCents, defaultCurrency) : formatMoneyCents(0, defaultCurrency)}</small>
            </article>
            <article>
              <span>Categoria più pesante</span>
              <strong>{monthlyTopCategoryCost?.name ?? 'Nessun dato'}</strong>
              <small>{monthlyTopCategoryCost ? formatMoneyCents(monthlyTopCategoryCost.totalCents, defaultCurrency) : formatMoneyCents(0, defaultCurrency)}</small>
            </article>
          </div>
          <div className="monthly-report-actions-list">
            <strong>Azioni consigliate</strong>
            {monthlyActionRows.length ? monthlyActionRows.map((action) => (
              <article className={`tone-${action.tone}`} key={action.title}>
                <span>{action.title}</span>
                <b>{action.value}</b>
                <small>{action.body}</small>
              </article>
            )) : (
              <p>Nessuna urgenza aperta: il mese e pulito e pronto da archiviare.</p>
            )}
          </div>
        </section>
      ) : null}
      {(isReportWorkspace ? showReportDetails : (showReportOverview || showReportDetails)) ? (
      <div className="fault-cost-controls">
        <label>
          {isReportWorkspace ? 'Vista dettaglio' : 'Vista costi'}
          <select
            value={reportType}
            onChange={(event) => {
              const nextReportType = event.target.value
              setReportType(nextReportType)
              if (['fines', 'fine_ranking'].includes(nextReportType)) setCategoryFilter('fine')
            }}
          >
            <option value="detail">Dettaglio costi</option>
            <option value="fines">Solo multe / sanzioni</option>
            <option value="fine_ranking">Classifica multe autisti</option>
          </select>
        </label>
        <label>
          Per chi o cosa
          <select value={targetFilter} onChange={(event) => setTargetFilter(event.target.value)}>
            <option value="all">Tutti i costi</option>
            <option value="company">Azienda generale</option>
            {vehicleRecords.map((vehicle) => (
              <option key={vehicle.id} value={`vehicle:${vehicle.id}`}>
                Mezzo · {vehicle.plate} · {getFleetTypeLabel(vehicle.fleetType)}
              </option>
            ))}
            {driverRecords.map((driver) => (
              <option key={driver.id} value={`driver:${driver.id}`}>
                Autista · {driver.name}
              </option>
            ))}
            {assetRecords.map((asset) => (
              <option key={asset.id} value={`asset:${asset.id}`}>
                Attrezzatura · {asset.code} · {asset.model || 'Muletto'}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipologia
          <select
            disabled={['fines', 'fine_ranking'].includes(reportType)}
            value={['fines', 'fine_ranking'].includes(reportType) ? 'fine' : categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">Tutte le tipologie</option>
            {costCategoryOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          Periodo
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="today">Oggi</option>
            <option value="month">Questo mese</option>
            <option value="year">Anno in corso</option>
            <option value="custom">Periodo personalizzato</option>
            <option value="all">Sempre</option>
          </select>
        </label>
        {period === 'custom' ? (
          <>
            <label>
              Dal
              <input type="date" value={customStartDate} onChange={(event) => setCustomStartDate(event.target.value)} />
            </label>
            <label>
              Al
              <input type="date" value={customEndDate} onChange={(event) => setCustomEndDate(event.target.value)} />
            </label>
          </>
        ) : null}
      </div>
      ) : null}
      {(showReportOverview || showReportDetails) ? (
      <div className="fault-cost-summary">
        <div>
          <strong>{formatMoneyCents(totalCents, defaultCurrency)}</strong>
          <span>Totale periodo</span>
        </div>
        <div>
          <strong>{summaryRows.length}</strong>
          <span>Voci costo</span>
        </div>
        <div>
          <strong>{formatMoneyCents(averageCents, defaultCurrency)}</strong>
          <span>Media</span>
        </div>
        <div className={unassignedFineRows.length ? 'is-danger' : 'is-ok'}>
          <strong>{unassignedFineRows.length}</strong>
          <span>Multe non assegnate</span>
        </div>
      </div>
      ) : null}
      {(showReportOverview || showReportDetails) ? (
      <div className="cost-insight-grid" aria-label="Analisi avanzata centro costi">
        <article className={`tone-${getCostSeverityTone(topTargetCost?.totalCents ?? 0)}`}>
          <span>Soggetto più costoso</span>
          <strong>{topTargetCost?.name ?? 'Nessun dato'}</strong>
          <small>{topTargetCost ? formatMoneyCents(topTargetCost.totalCents, defaultCurrency) : formatMoneyCents(0, defaultCurrency)}</small>
        </article>
        <article className={`tone-${getCostSeverityTone(topCategoryCost?.totalCents ?? 0)}`}>
          <span>Categoria più pesante</span>
          <strong>{topCategoryCost?.name ?? 'Nessun dato'}</strong>
          <small>{topCategoryCost ? formatMoneyCents(topCategoryCost.totalCents, defaultCurrency) : formatMoneyCents(0, defaultCurrency)}</small>
        </article>
        <article className={unassignedFineRows.length ? 'tone-danger' : 'tone-neutral'}>
          <span>Multe da assegnare</span>
          <strong>{unassignedFineRows.length}</strong>
          <small>{formatMoneyCents(unassignedFineTotalCents, defaultCurrency)}</small>
        </article>
        <article className={unlinkedCostRows.length ? 'tone-warning' : 'tone-neutral'}>
          <span>Spese senza collegamento</span>
          <strong>{unlinkedCostRows.length}</strong>
          <small>Da collegare a targa, autista o attrezzatura</small>
        </article>
      </div>
      ) : null}
      {(showReportOverview || showReportDetails) ? (
      <div className="fault-fines-panel">
        <div className="fault-fines-head">
          <div>
            <strong>Sanzioni e multe</strong>
            <span>Totale pagato nel periodo e classifica autisti.</span>
          </div>
          <b>{formatMoneyCents(fineTotalCents, defaultCurrency)}</b>
        </div>
        <div className="fault-fines-grid">
          <div>
            <strong>{fineRows.length}</strong>
            <span>multe registrate</span>
          </div>
          <div>
            <strong>{fineRows.length ? formatMoneyCents(Math.round(fineTotalCents / fineRows.length), defaultCurrency) : formatMoneyCents(0, defaultCurrency)}</strong>
            <span>media multa</span>
          </div>
          <div>
            <strong>{fineRanking[0]?.name ?? 'Nessuno'}</strong>
            <span>piu alto totale</span>
          </div>
        </div>
        {fineRanking.length > 0 ? (
          <div className="fault-fines-ranking">
            {fineRanking.slice(0, 6).map((row, index) => (
              <article key={row.driverId || 'unassigned'}>
                <span>#{index + 1}</span>
                <strong>{row.name}</strong>
                <small>{row.count} multe</small>
                <b>{formatMoneyCents(row.totalCents, defaultCurrency)}</b>
                {!row.driverId && row.assignableEntry && onUpdateCostEntry ? (
                  <button className="text-button fault-assign-button" onClick={() => startEditingCostEntry(row.assignableEntry)} type="button">
                    Assegna
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="archive-note">Nessuna sanzione registrata con questi filtri.</p>
        )}
      </div>
      ) : null}
      {showReportDetails ? (
      <div className="fault-cost-list">
        {reportType === 'fine_ranking' ? fineRanking.map((row, index) => (
          <article className="fault-cost-row" key={row.driverId || 'unassigned'}>
            <div>
              <strong>#{index + 1} · {row.name}</strong>
              <span>{row.count} multe · media {formatMoneyCents(Math.round(row.totalCents / Math.max(row.count, 1)), defaultCurrency)}</span>
            </div>
            <div className="fault-cost-row-side">
              <b>{formatMoneyCents(row.totalCents, defaultCurrency)}</b>
              {!row.driverId && row.assignableEntry && onUpdateCostEntry ? (
                <button className="text-button fault-assign-button" onClick={() => startEditingCostEntry(row.assignableEntry)} type="button">
                  Assegna
                </button>
              ) : null}
            </div>
          </article>
        )) : reportRows.map((row) => (
          <article className="fault-cost-row" key={row.id}>
            <div>
              <strong>{row.title}</strong>
              <span>
                {getCostTargetLabel(row)} · {getCostCategoryLabel(row.category)} · {formatShortDateTime(row.date)}
              </span>
            </div>
            <div className="fault-cost-row-side">
              <b>{formatMoneyCents(row.amountCents, row.currency || defaultCurrency)}</b>
              {row.kind === 'entry' ? (
                <span className="fault-cost-row-actions">
                  <button className="text-button" onClick={() => startEditingCostEntry(row.source)} type="button">
                    <Pencil size={14} />
                    Modifica
                  </button>
                  <button className="text-button danger-link" onClick={() => deleteCostEntry(row.source)} type="button">
                    <X size={14} />
                    Elimina
                  </button>
                </span>
              ) : null}
              {row.kind !== 'entry' ? (
                <span className="fault-cost-row-actions">
                  <button className="text-button" onClick={() => startEditingFaultCost(row.source)} type="button">
                    <Pencil size={14} />
                    Modifica costo
                  </button>
                  <button className="text-button danger-link" onClick={() => deleteFaultCost(row.source)} type="button">
                    <X size={14} />
                    Elimina costo
                  </button>
                </span>
              ) : null}
            </div>
          </article>
        ))}
        {reportType === 'fine_ranking' && !fineRanking.length ? <p className="archive-note">Nessuna multa da classificare con questi filtri.</p> : null}
        {reportType !== 'fine_ranking' && !reportRows.length ? <p className="archive-note">Nessun costo registrato per questo filtro.</p> : null}
      </div>
      ) : null}
    </section>
  )
}

function OperationsWorkspace({
  acknowledgedCheckIds,
  assetPreviewUrl,
  driverRecords,
  faultReportRecords,
  itemRecords = [],
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
  const unreadChecks = vehicleCheckRecords.filter((check) => !isVehicleCheckArchived(check, acknowledgedCheckIds))
  const archivedChecks = vehicleCheckRecords.filter((check) => isVehicleCheckArchived(check, acknowledgedCheckIds))
  const criticalChecks = unreadChecks.filter(hasCheckIssues)
  const criticalFaults = faultReportRecords.filter(isCriticalFault)
  const actionableDeadlines = itemRecords.filter(isComplianceActionRequired)
  const criticalDeadlines = actionableDeadlines.filter((item) => daysUntil(item.dueDate) <= 7)
  const allOperations = [
    ...faultReportRecords.map((report) => ({
      createdAt: report.createdAt,
      data: report,
      id: report.id,
      kind: 'fault',
    })),
    ...actionableDeadlines.map((item) => ({
      createdAt: item.dueDate,
      data: item,
      id: item.id,
      kind: 'deadline',
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
          (operation.kind === 'deadline' && isComplianceActionRequired(operation.data)) ||
          (operation.kind === 'check' && !isVehicleCheckArchived(operation.data, acknowledgedCheckIds))
        )
      }
      if (filter === 'critical') {
        return (
          (operation.kind === 'fault' && isCriticalFault(operation.data)) ||
          (operation.kind === 'deadline' && daysUntil(operation.data.dueDate) <= 7) ||
          (operation.kind === 'check' && !isVehicleCheckArchived(operation.data, acknowledgedCheckIds) && hasCheckIssues(operation.data))
        )
      }
      if (filter === 'critical_checks') {
        return operation.kind === 'check' && !isVehicleCheckArchived(operation.data, acknowledgedCheckIds) && hasCheckIssues(operation.data)
      }
      if (filter === 'archive') {
        return (
          (operation.kind === 'fault' && isFaultArchived(operation.data)) ||
          (operation.kind === 'check' && isVehicleCheckArchived(operation.data, acknowledgedCheckIds))
        )
      }
      if (filter === 'deadlines') return operation.kind === 'deadline'
      if (filter === 'faults') return operation.kind === 'fault' && isFaultUnread(operation.data)
      if (filter === 'checks') return operation.kind === 'check' && !isVehicleCheckArchived(operation.data, acknowledgedCheckIds)
      return false
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const selectedOperation = operations.find((operation) => `${operation.kind}-${operation.id}` === selectedOperationKey)
  const modalOperation = allOperations.find((operation) => `${operation.kind}-${operation.id}` === modalOperationKey)
  const fallbackSelection = operations[0]
  const detailOperation = selectedOperation ?? fallbackSelection
  const priorityOperation =
    [
      ...criticalFaults.map((report) => ({ createdAt: report.createdAt, data: report, id: report.id, kind: 'fault' })),
      ...criticalDeadlines.map((item) => ({ createdAt: item.dueDate, data: item, id: item.id, kind: 'deadline' })),
      ...criticalChecks.map((check) => ({ createdAt: check.createdAt, data: check, id: check.id, kind: 'check' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] ??
    operations[0] ??
    null
  const priorityDriver = priorityOperation
    ? driverRecords.find((driver) => driver.id === priorityOperation.data.driverId)
    : null
  const priorityVehicle = priorityOperation
    ? vehicleRecords.find((vehicle) => vehicle.id === (priorityOperation.kind === 'fault' ? priorityOperation.data.vehicleId : priorityOperation.data.tractorId))
    : null
  const priorityTitle = priorityOperation
    ? priorityOperation.kind === 'fault'
      ? priorityOperation.data.title
      : priorityOperation.kind === 'deadline'
        ? priorityOperation.data.type || 'Scadenza'
        : t('driverApp.morningCheck')
    : 'Nessuna notifica da lavorare'
  const priorityDetail = priorityOperation
    ? [
        priorityOperation.kind === 'fault' ? t('operations.fault') : priorityOperation.kind === 'deadline' ? 'Scadenza' : t('operations.check'),
        priorityOperation.kind === 'deadline' ? priorityOperation.data.assignee || priorityOperation.data.owner || 'Azienda' : priorityDriver?.name ?? t('common.driverMissing'),
        priorityOperation.kind === 'deadline' ? priorityOperation.data.detail || formatDate(priorityOperation.data.dueDate) : priorityVehicle?.plate ?? t('common.vehicleMissing'),
        formatShortDateTime(priorityOperation.createdAt),
      ].join(' · ')
    : 'Quando arrivano check, guasti o scadenze importanti li trovi qui.'

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
            <strong>{newFaults.length + unreadChecks.length + actionableDeadlines.length}</strong>
            <span>{t('operations.inbox').toLowerCase()}</span>
          </div>
          <div>
            <strong>{criticalFaults.length + criticalChecks.length + criticalDeadlines.length}</strong>
            <span>{t('operations.criticalCount')}</span>
          </div>
          <div>
            <strong>{newFaults.length}</strong>
            <span>{t('operations.activeFaults')}</span>
          </div>
          <div>
            <strong>{actionableDeadlines.length}</strong>
            <span>scadenze da lavorare</span>
          </div>
        </div>
        <div className="operations-command-strip">
          <button
            className="operations-priority-card"
            disabled={!priorityOperation}
            onClick={() => priorityOperation && openOperation(priorityOperation)}
            type="button"
          >
            <span className={priorityOperation?.kind === 'fault' || priorityOperation?.kind === 'deadline' ? 'operation-icon tone-danger' : 'operation-icon tone-info'}>
              {priorityOperation?.kind === 'fault' ? <Wrench size={19} /> : priorityOperation?.kind === 'deadline' ? <CalendarClock size={19} /> : <Bell size={19} />}
            </span>
            <span>
              <small>Priorità adesso</small>
              <strong>{priorityTitle}</strong>
              <em>{priorityDetail}</em>
            </span>
            {priorityOperation ? <ChevronRight size={17} /> : null}
          </button>
          <div className="operations-quick-actions">
            <button className={filter === 'critical' ? 'is-active' : ''} onClick={() => changeFilter('critical')} type="button">
              <AlertTriangle size={15} />
              Critiche
            </button>
            <button className={filter === 'faults' ? 'is-active' : ''} onClick={() => changeFilter('faults')} type="button">
              <Wrench size={15} />
              Guasti
            </button>
            <button className={filter === 'checks' ? 'is-active' : ''} onClick={() => changeFilter('checks')} type="button">
              <ClipboardCheck size={15} />
              Check
            </button>
            <button className={filter === 'deadlines' ? 'is-active' : ''} onClick={() => changeFilter('deadlines')} type="button">
              <CalendarClock size={15} />
              Scadenze
            </button>
            <button className={filter === 'archive' ? 'is-active' : ''} onClick={() => changeFilter('archive')} type="button">
              <Clock3 size={15} />
              Archivio
            </button>
          </div>
        </div>
        <div className="filter-tabs operations-filters" role="tablist" aria-label={t('notifications.filterAria')}>
          <button className={filter === 'inbox' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('inbox')} type="button">
            {t('operations.inbox')} ({newFaults.length + unreadChecks.length + actionableDeadlines.length})
          </button>
          <button className={filter === 'critical' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('critical')} type="button">
            {t('operations.critical')} ({criticalFaults.length + criticalChecks.length + criticalDeadlines.length})
          </button>
          <button className={filter === 'critical_checks' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('critical_checks')} type="button">
            {t('operations.checkCritical')} ({criticalChecks.length})
          </button>
          <button className={filter === 'checks' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('checks')} type="button">
            {t('operations.check')} ({unreadChecks.length})
          </button>
          <button className={filter === 'deadlines' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('deadlines')} type="button">
            Scadenze ({actionableDeadlines.length})
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
            ) : operation.kind === 'deadline' ? (
              <DeadlineOperationRow
                item={operation.data}
                key={`deadline-${operation.id}`}
                onOpen={() => openOperation(operation)}
                selected={detailOperation?.kind === 'deadline' && detailOperation.id === operation.id}
              />
            ) : (
              <CheckOperationRow
                check={operation.data}
                driver={driverRecords.find((driver) => driver.id === operation.data.driverId)}
                key={`check-${operation.id}`}
                onMarkRead={() => onAcknowledgeCheck(operation.id)}
                onMarkUnread={() => onMarkCheckUnread(operation.id)}
                onOpen={() => openOperation(operation)}
                read={isVehicleCheckArchived(operation.data, acknowledgedCheckIds)}
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

function ChatVoiceCallButton({ callPayload = {}, disabled = false, onCall, targetName = 'contatto' }) {
  if (!onCall) return null

  return (
    <button
      aria-label={`Chiama ${targetName}`}
      className={disabled ? 'icon-button chat-voice-call-button is-disabled' : 'icon-button chat-voice-call-button'}
      disabled={disabled}
      onClick={() => onCall?.({ ...callPayload, targetName })}
      title={`Chiama ${targetName}`}
      type="button"
    >
      <PhoneCall size={18} />
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
        <video controls key={url} onError={onMediaError} onLoadedMetadata={onLoad} playsInline preload="metadata" src={url} />
      ) : attachmentKind === 'audio' ? (
        <div className="chat-audio-attachment">
          <Mic size={16} />
          <audio controls key={url} onError={onMediaError} onLoadedMetadata={onLoad} preload="metadata" src={url} />
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

function getTeamAudienceLabel(value = '') {
  const labels = {
    all: 'Tutta l azienda',
    custom: 'Gruppo personalizzato',
    direct: 'Chat diretta',
    drivers: 'Autisti',
    office: 'Ufficio',
    warehouse: 'Magazzino',
  }

  return labels[value] ?? 'Gruppo'
}

function getTeamThreadKindLabel(thread = {}) {
  if (isTeamDirectThread(thread)) return 'Diretta'
  if (['drivers', 'office', 'warehouse'].includes(thread.audienceType)) return 'Reparto'
  return 'Gruppo'
}

function isTeamDirectThread(thread = {}) {
  return thread.threadType === 'direct' || thread.audienceType === 'direct'
}

function isCompanyDirectTeamThread(thread = {}) {
  return isTeamDirectThread(thread) && String(thread.directKey ?? '').startsWith('company:')
}

function isCompanyGroupTeamThread(thread = {}) {
  return !isTeamDirectThread(thread) && ['drivers', 'warehouse', 'office', 'all'].includes(thread.audienceType)
}

function isCompanyVisibleTeamThread(thread = {}) {
  return isCompanyDirectTeamThread(thread) || isCompanyGroupTeamThread(thread)
}

function isUnreadTeamMessageForCompany(message = {}) {
  return (message.senderRole !== 'company' || Boolean(message.senderPersonId)) && !message.readByCompanyAt
}

function getTeamThreadIcon(thread = {}) {
  if (isTeamDirectThread(thread)) return <UserRound size={18} />
  if (thread.audienceType === 'drivers') return <Truck size={18} />
  if (thread.audienceType === 'office') return <Building2 size={18} />
  if (thread.audienceType === 'warehouse') return <ShieldCheck size={18} />
  return <Users size={18} />
}

function getTeamThreadRowClassName(baseClassName, thread = {}, isSelected = false) {
  const audienceType = String(thread.audienceType || 'custom').replace(/[^a-z0-9-]/gi, '-').toLowerCase()
  const classNames = [baseClassName, 'is-team-chat', `is-team-chat-${audienceType}`]

  if (isSelected) classNames.push('is-selected')

  return classNames.join(' ')
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
  onMarkTeamRead,
  onReactToMessage,
  onRefreshAssetPreviewUrl,
  onSendMessage,
  onSendTeamMessage,
  onStartVoiceCall,
  onTyping,
  personRecords = [],
  teamChatMessages = [],
  teamChatThreads = [],
}) {
  const { t } = useI18n()
  const availableDrivers = useMemo(
    () => driverRecords.filter((driver) => driver.status !== 'Archiviato'),
    [driverRecords],
  )
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [selectedTeamThreadId, setSelectedTeamThreadId] = useState('')
  const [isStartingNewChat, setIsStartingNewChat] = useState(false)
  const [newChatQuery, setNewChatQuery] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [attachmentFile, setAttachmentFile] = useState(null)
  const [isCompanyRecordingAudio, setIsCompanyRecordingAudio] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isCompanyChatOpen, setIsCompanyChatOpen] = useState(false)
  const [chatListMode, setChatListMode] = useState('all')
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
  const teamMessagesByThread = useMemo(() => {
    const groupedMessages = new Map()

    teamChatMessages.forEach((message) => {
      const messages = groupedMessages.get(message.threadId) ?? []
      messages.push(message)
      groupedMessages.set(message.threadId, messages)
    })

    return groupedMessages
  }, [teamChatMessages])
  const visibleTeamThreads = useMemo(
    () =>
      [...teamChatThreads]
        .filter((thread) => thread.status !== 'archived')
        .sort((firstThread, secondThread) => {
          const firstMessages = teamMessagesByThread.get(firstThread.id) ?? []
          const secondMessages = teamMessagesByThread.get(secondThread.id) ?? []
          const firstLastMessage = firstMessages[firstMessages.length - 1]
          const secondLastMessage = secondMessages[secondMessages.length - 1]
          const firstTime = new Date(firstLastMessage?.createdAt ?? firstThread.lastMessageAt ?? firstThread.createdAt ?? 0).getTime()
          const secondTime = new Date(secondLastMessage?.createdAt ?? secondThread.lastMessageAt ?? secondThread.createdAt ?? 0).getTime()

          if (firstTime !== secondTime) return secondTime - firstTime
          return firstThread.title.localeCompare(secondThread.title)
        }),
    [teamChatThreads, teamMessagesByThread],
  )
  const allDirectTeamThreads = useMemo(
    () => visibleTeamThreads.filter((thread) => isTeamDirectThread(thread)),
    [visibleTeamThreads],
  )
  const directTeamThreads = useMemo(
    () => allDirectTeamThreads.filter((thread) => isCompanyDirectTeamThread(thread)),
    [allDirectTeamThreads],
  )
  const groupTeamThreads = useMemo(
    () => visibleTeamThreads.filter((thread) => isCompanyGroupTeamThread(thread)),
    [visibleTeamThreads],
  )
  const conversationDrivers = useMemo(
    () =>
      availableDrivers
        .filter((driver) => {
          const thread = chatThreads.find(
            (chatThread) => chatThread.driverId === driver.id && chatThread.contextType === 'general',
          )
          const messages = thread ? messagesByThread.get(thread.id) ?? [] : []
          return messages.length > 0
        })
        .sort((firstDriver, secondDriver) => {
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
            firstLastMessage?.createdAt ??
              firstThread?.lastMessageAt ??
              firstThread?.updatedAt ??
              firstThread?.createdAt ??
              0,
          ).getTime()
          const secondTime = new Date(
            secondLastMessage?.createdAt ??
              secondThread?.lastMessageAt ??
              secondThread?.updatedAt ??
              secondThread?.createdAt ??
              0,
          ).getTime()

          if (firstTime !== secondTime) return secondTime - firstTime
          return firstDriver.name.localeCompare(secondDriver.name)
        }),
    [availableDrivers, chatThreads, messagesByThread],
  )
  const newChatDrivers = useMemo(() => {
    const query = newChatQuery.trim().toLowerCase()
    if (!query) return availableDrivers

    return availableDrivers.filter((driver) => (
      [driver.name, driver.role, driver.phone, driver.depot, driver.username]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    ))
  }, [availableDrivers, newChatQuery])
  const teamThreadById = useMemo(
    () => new Map([...directTeamThreads, ...groupTeamThreads].map((thread) => [thread.id, thread])),
    [directTeamThreads, groupTeamThreads],
  )
  const unreadDirectTeamConversationCount = directTeamThreads.reduce((total, thread) => total + getTeamUnreadMessageCount(thread.id), 0)
  const unreadGroupConversationCount = groupTeamThreads.reduce((total, thread) => total + getTeamUnreadMessageCount(thread.id), 0)
  const unreadDirectConversationCount = conversationDrivers.reduce((total, driver) => total + getDriverUnreadMessageCount(driver.id), 0) + unreadDirectTeamConversationCount
  const totalUnreadConversationCount = unreadDirectConversationCount + unreadGroupConversationCount
  const inboxFilters = [
    {
      unreadCount: totalUnreadConversationCount,
      id: 'all',
      label: 'Tutte',
    },
    {
      unreadCount: unreadDirectConversationCount,
      id: 'direct',
      label: 'Singole',
    },
    {
      unreadCount: unreadGroupConversationCount,
      id: 'groups',
      label: 'Gruppi',
    },
    {
      unreadCount: totalUnreadConversationCount,
      id: 'unread',
      label: 'Da leggere',
    },
  ]
  const showDirectRows = chatListMode === 'all' || chatListMode === 'direct' || chatListMode === 'unread'
  const showGroupRows = chatListMode === 'all' || chatListMode === 'groups' || chatListMode === 'unread'
  const visibleConversationDrivers = chatListMode === 'unread'
    ? conversationDrivers.filter((driver) => getDriverUnreadMessageCount(driver.id) > 0)
    : conversationDrivers
  const visibleDirectTeamThreads = chatListMode === 'unread'
    ? directTeamThreads.filter((thread) => getTeamUnreadMessageCount(thread.id) > 0)
    : directTeamThreads
  const visibleGroupTeamThreads = chatListMode === 'unread'
    ? groupTeamThreads.filter((thread) => getTeamUnreadMessageCount(thread.id) > 0)
    : groupTeamThreads
  const selectedTeamThread = [...directTeamThreads, ...groupTeamThreads].find((thread) => thread.id === selectedTeamThreadId) ?? null
  const selectedDriver = selectedTeamThread
    ? null
    : availableDrivers.find((driver) => driver.id === selectedDriverId) ??
      conversationDrivers[0] ??
      null
  const selectedThread = selectedDriver
    ? chatThreads.find((thread) => thread.driverId === selectedDriver.id && thread.contextType === 'general')
    : selectedTeamThread
  const visibleMessages = useMemo(
    () =>
      selectedTeamThread
        ? [...(teamMessagesByThread.get(selectedTeamThread.id) ?? [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        : selectedThread
        ? [...(messagesByThread.get(selectedThread.id) ?? [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        : [],
    [messagesByThread, selectedTeamThread, selectedThread, teamMessagesByThread],
  )
  const lastVisibleMessageId = visibleMessages[visibleMessages.length - 1]?.id ?? ''
  const selectedDriverIsOnline = isChatActorOnline(chatLiveState, 'driver', selectedDriver?.id)
  const selectedDriverIsTyping = Boolean(
    selectedDriver && selectedThread?.id && getTypingActors(chatLiveState, selectedThread.id, 'driver').length > 0,
  )
  const selectedDriverPresenceLabel = selectedDriver
    ? getChatPresenceLabel({
        isOnline: selectedDriverIsOnline,
        isTyping: selectedDriverIsTyping,
        lastSeenAt: getChatActorLastSeenAt(chatLiveState, 'driver', selectedDriver.id),
        typingLabel: `${selectedDriver.name} sta scrivendo...`,
      })
    : selectedTeamThread
    ? `${getTeamThreadKindLabel(selectedTeamThread)} · ${getTeamAudienceLabel(selectedTeamThread.audienceType)}`
    : t('chat.createdOnFirstMessage')
  const hasUnreadDriverMessages = visibleMessages.some(
    (message) => selectedDriver && message.senderRole === 'driver' && !message.readByCompanyAt,
  )
  const hasUnreadTeamMessages = visibleMessages.some(
    (message) => selectedTeamThread && isUnreadTeamMessageForCompany(message),
  )
  const signalCompanyTyping = useChatTypingSignal({
    actorRole: 'company',
    onTyping,
    threadId: selectedDriver ? selectedThread?.id : '',
  })
  const hasCompanyComposerPayload = Boolean(messageBody.trim() || attachmentFile)
  const hasSelectedChatTarget = Boolean(selectedDriver || selectedTeamThread)
  const selectedChatTitle = selectedTeamThread?.title ?? selectedDriver?.name ?? t('chat.selectDriver')
  const selectedChatAvatarUrl = selectedDriver ? assetPreviewUrl(selectedDriver.profileImagePath) : ''
  const selectedVoiceCallPayload = selectedTeamThread
    ? { callerRole: 'company', teamThreadId: selectedTeamThread.id }
    : selectedDriver
      ? {
          callerRole: 'company',
          driverId: selectedDriver.id,
          receiverDriverId: selectedDriver.id,
          threadId: selectedThread?.id,
        }
      : {}

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
    if (isCompanyChatOpen && selectedThread?.id && hasUnreadDriverMessages) {
      onMarkRead?.(selectedThread.id, 'company')
    }
  }, [hasUnreadDriverMessages, isCompanyChatOpen, onMarkRead, selectedThread?.id])

  useEffect(() => {
    if (isCompanyChatOpen && selectedTeamThread?.id && hasUnreadTeamMessages) {
      onMarkTeamRead?.(selectedTeamThread.id)
    }
  }, [hasUnreadTeamMessages, isCompanyChatOpen, onMarkTeamRead, selectedTeamThread?.id])

  function getDriverThread(driverId) {
    return chatThreads.find((thread) => thread.driverId === driverId && thread.contextType === 'general')
  }

  function getLastDriverMessage(driverId) {
    const thread = getDriverThread(driverId)
    if (!thread) return null

    const messages = messagesByThread.get(thread.id) ?? []
    return messages[messages.length - 1] ?? null
  }

  function getLastTeamMessage(threadId) {
    const messages = teamMessagesByThread.get(threadId) ?? []
    return messages[messages.length - 1] ?? null
  }

  function getDriverUnreadMessageCount(driverId) {
    const driverThread = getDriverThread(driverId)
    return driverThread
      ? (messagesByThread.get(driverThread.id) ?? []).filter(
          (message) => message.senderRole === 'driver' && !message.readByCompanyAt,
        ).length
      : 0
  }

  function getTeamUnreadMessageCount(threadId) {
    return (teamMessagesByThread.get(threadId) ?? []).filter(isUnreadTeamMessageForCompany).length
  }

  function handleAttachmentChange(event) {
    const file = event.target.files?.[0] ?? null
    setAttachmentFile(file)
    event.target.value = ''
  }

  function selectDriverChat(driverId) {
    setSelectedDriverId(driverId)
    setSelectedTeamThreadId('')
    setChatListMode('direct')
    setIsStartingNewChat(false)
    setNewChatQuery('')
    setIsCompanyChatOpen(true)
    setReplyToMessage(null)
    messageActions.closeMessageActions()
  }

  function selectTeamChat(threadId) {
    const thread = teamThreadById.get(threadId)
    setSelectedTeamThreadId(threadId)
    setSelectedDriverId('')
    setChatListMode(isTeamDirectThread(thread) ? 'direct' : 'groups')
    setIsStartingNewChat(false)
    setNewChatQuery('')
    setIsCompanyChatOpen(true)
    setReplyToMessage(null)
    messageActions.closeMessageActions()
    onMarkTeamRead?.(threadId)
  }

  function getCompanyMessageSenderLabel(message) {
    if (message.senderPersonId) return getTeamMessageSenderLabel(message)
    if (message.senderRole === 'company') return t('chat.company')
    if (selectedTeamThread) return getTeamMessageSenderLabel(message)
    if (message.senderRole === 'driver') return selectedDriver?.name ?? t('chat.driver')
    return getTeamMessageSenderLabel(message)
  }

  function getTeamMessageSenderLabel(message) {
    if (message.senderRole === 'company') return t('chat.company')
    const senderPerson = personRecords.find((person) => person.id === message.senderPersonId)
    if (senderPerson?.name) return senderPerson.name
    if (message.senderRole === 'office') return 'Ufficio'
    if (message.senderRole === 'warehouse') return 'Magazzino'
    if (message.senderRole === 'driver') return 'Autista'
    return 'Persona'
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
    if ((!selectedDriver && !selectedTeamThread) || isSending || (!messageBody.trim() && !attachmentFile)) return

    const sentBody = messageBody
    const sentAttachmentFile = attachmentFile
    const sentReplyToMessage = replyToMessage

    setMessageBody('')
    setAttachmentFile(null)
    setReplyToMessage(null)
    signalCompanyTyping('')
    setIsSending(true)
    const sent = selectedTeamThread
      ? await onSendTeamMessage?.({
          attachmentFile: sentAttachmentFile,
          body: sentBody,
          senderRole: 'company',
          threadId: selectedTeamThread.id,
          replyToMessage: sentReplyToMessage,
        })
      : await onSendMessage?.({
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

    if (isCompanyChatOpen && newMessages.some((message) => (selectedTeamThread ? message.senderRole !== 'company' : message.senderRole === 'driver'))) {
      chatSound.playSound('incoming')
    }

    newMessages.forEach((message) => seenMessages.add(message.id))
  }, [chatSound, isCompanyChatOpen, lastVisibleMessageId, selectedTeamThread, selectedThread?.id, visibleMessages])

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
          <button
            className={isStartingNewChat ? 'secondary-button compact-button is-active' : 'secondary-button compact-button'}
            onClick={() => {
              setChatListMode('direct')
              setIsStartingNewChat((currentValue) => !currentValue)
            }}
            type="button"
          >
            {isStartingNewChat ? <Mail size={17} /> : <Plus size={17} />}
            {isStartingNewChat ? t('chat.showConversations') : 'Nuova chat'}
          </button>
        </div>
        <div className="chat-inbox-toolbar" role="tablist" aria-label="Filtro chat">
          {inboxFilters.map((filter) => {
            const isActive = chatListMode === filter.id

            return (
              <button
                aria-selected={isActive}
                className={isActive ? 'chat-filter-chip is-active' : 'chat-filter-chip'}
                key={filter.id}
                onClick={() => {
                  setChatListMode(filter.id)
                  setIsStartingNewChat(false)
                }}
                role="tab"
                type="button"
              >
                <span>{filter.label}</span>
                {filter.unreadCount > 0 && <em>{filter.unreadCount}</em>}
              </button>
            )
          })}
        </div>
        {isStartingNewChat && (
          <div className="new-chat-panel">
            <label className="new-chat-search">
              <Search size={16} />
              <input
                autoFocus
                onChange={(event) => setNewChatQuery(event.target.value)}
                placeholder={t('chat.searchDriver')}
                value={newChatQuery}
              />
            </label>
            <div className="new-chat-list">
              {(chatListMode === 'groups' ? groupTeamThreads : directTeamThreads).map((thread) => (
                <button
                  className={getTeamThreadRowClassName('new-chat-driver', thread)}
                  key={thread.id}
                  onClick={() => selectTeamChat(thread.id)}
                  type="button"
                >
                  <span className="team-chat-row-icon">
                    {getTeamThreadIcon(thread)}
                  </span>
                  <span>
                    <strong>{thread.title}</strong>
                    <small>{getTeamThreadKindLabel(thread)} · {getTeamAudienceLabel(thread.audienceType)}</small>
                  </span>
                  <ChevronRight size={17} />
                </button>
              ))}
              {chatListMode !== 'groups' && newChatDrivers.map((driver) => (
                <button className="new-chat-driver" key={driver.id} onClick={() => selectDriverChat(driver.id)} type="button">
                  <EntityAvatar imageUrl={assetPreviewUrl(driver.profileImagePath)} name={driver.name} />
                  <span>
                    <strong>{driver.name}</strong>
                    <small>{driver.role || t('common.driver')} · {driver.phone || t('common.notInserted')}</small>
                  </span>
                  <ChevronRight size={17} />
                </button>
              ))}
              {chatListMode !== 'groups' && newChatDrivers.length === 0 && <p className="new-chat-empty">{t('chat.noDriverMatches')}</p>}
              {chatListMode === 'groups' && groupTeamThreads.length === 0 && <p className="new-chat-empty">Nessun gruppo disponibile.</p>}
            </div>
          </div>
        )}
        <div className="chat-driver-list">
          {showDirectRows && visibleConversationDrivers.length > 0 && (
            <div className="chat-list-section-label">Chat singole con autisti</div>
          )}
          {showDirectRows && visibleConversationDrivers.map((driver) => {
            const lastMessage = getLastDriverMessage(driver.id)
            const isSelected = selectedDriver?.id === driver.id
            const driverThread = getDriverThread(driver.id)
            const driverIsOnline = isChatActorOnline(chatLiveState, 'driver', driver.id)
            const driverIsTyping = Boolean(
              driverThread?.id && getTypingActors(chatLiveState, driverThread.id, 'driver').length > 0,
            )
            const unreadMessageCount = getDriverUnreadMessageCount(driver.id)

            return (
              <button
                className={[
                  'chat-driver-row',
                  isSelected ? 'is-selected' : '',
                  unreadMessageCount > 0 ? 'is-unread' : '',
                ].filter(Boolean).join(' ')}
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
          {showDirectRows && visibleDirectTeamThreads.length > 0 && (
            <div className="chat-list-section-label">Chat singole con ufficio e magazzino</div>
          )}
          {showDirectRows && visibleDirectTeamThreads.map((thread) => {
            const lastMessage = getLastTeamMessage(thread.id)
            const isSelected = selectedTeamThread?.id === thread.id
            const unreadMessageCount = getTeamUnreadMessageCount(thread.id)

            return (
              <button
                className={[
                  getTeamThreadRowClassName('chat-driver-row', thread, isSelected),
                  unreadMessageCount > 0 ? 'is-unread' : '',
                ].filter(Boolean).join(' ')}
                key={thread.id}
                onClick={() => selectTeamChat(thread.id)}
                type="button"
              >
                <span className="team-chat-row-icon">
                  {getTeamThreadIcon(thread)}
                </span>
                <span>
                  <strong>{thread.title}</strong>
                  <small>
                    {lastMessage
                      ? `${getCompanyMessageSenderLabel(lastMessage)}: ${getChatMessageText(lastMessage, t('chat.photoAttached'))}`
                      : `${getTeamThreadKindLabel(thread)} · ${getTeamAudienceLabel(thread.audienceType)}`}
                  </small>
                </span>
                <span className="chat-row-meta">
                  <strong className="chat-kind-badge">{getTeamThreadKindLabel(thread)}</strong>
                  {unreadMessageCount > 0 && <strong className="chat-unread-badge">{unreadMessageCount}</strong>}
                  {lastMessage && <em>{formatShortDateTime(lastMessage.createdAt)}</em>}
                </span>
              </button>
            )
          })}
          {showGroupRows && visibleGroupTeamThreads.length > 0 && (
            <div className="chat-list-section-label">Gruppi aziendali</div>
          )}
          {showGroupRows && visibleGroupTeamThreads.map((thread) => {
            const lastMessage = getLastTeamMessage(thread.id)
            const isSelected = selectedTeamThread?.id === thread.id
            const unreadMessageCount = getTeamUnreadMessageCount(thread.id)

            return (
              <button
                className={[
                  getTeamThreadRowClassName('chat-driver-row', thread, isSelected),
                  unreadMessageCount > 0 ? 'is-unread' : '',
                ].filter(Boolean).join(' ')}
                key={thread.id}
                onClick={() => selectTeamChat(thread.id)}
                type="button"
              >
                <span className="team-chat-row-icon">
                  {getTeamThreadIcon(thread)}
                </span>
                <span>
                  <strong>{thread.title}</strong>
                  <small>
                    {lastMessage
                      ? `${getCompanyMessageSenderLabel(lastMessage)}: ${getChatMessageText(lastMessage, t('chat.photoAttached'))}`
                      : `${getTeamThreadKindLabel(thread)} · ${getTeamAudienceLabel(thread.audienceType)}`}
                  </small>
                </span>
                <span className="chat-row-meta">
                  <strong className="chat-kind-badge">{getTeamThreadKindLabel(thread)}</strong>
                  {unreadMessageCount > 0 && <strong className="chat-unread-badge">{unreadMessageCount}</strong>}
                  {lastMessage && <em>{formatShortDateTime(lastMessage.createdAt)}</em>}
                </span>
              </button>
            )
          })}
          {chatListMode === 'unread' && visibleConversationDrivers.length === 0 && (
            <div className="empty-state-row">
              <Users size={20} />
              <div>
                <strong>Tutto letto</strong>
                <span>Non ci sono messaggi singoli da gestire in questo momento.</span>
              </div>
            </div>
          )}
          {chatListMode !== 'unread' && showDirectRows && conversationDrivers.length === 0 && directTeamThreads.length === 0 && (
            <div className="empty-state-row">
              <Users size={20} />
              <div>
                <strong>{availableDrivers.length === 0 ? t('chat.noDrivers') : t('chat.noConversations')}</strong>
                <span>{availableDrivers.length === 0 ? t('chat.noDriversHint') : t('chat.noConversationsHint')}</span>
              </div>
            </div>
          )}
          {showGroupRows && groupTeamThreads.length === 0 && (
            <div className="empty-state-row">
              <Users size={20} />
              <div>
                <strong>Nessun gruppo</strong>
                <span>Crea persone e reparti per vedere le chat di gruppo.</span>
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
            <h2>{selectedChatTitle}</h2>
            <span className={selectedDriverIsTyping ? 'chat-presence-text is-typing' : 'chat-presence-text'}>
              {selectedDriverPresenceLabel}
            </span>
          </div>
          <div className="chat-thread-header-actions">
            <ChatVoiceCallButton
              callPayload={selectedVoiceCallPayload}
              disabled={!hasSelectedChatTarget}
              onCall={onStartVoiceCall}
              targetName={selectedChatTitle}
            />
            <ChatSoundButton enabled={chatSound.isEnabled} onToggle={chatSound.toggleSound} t={t} />
            {selectedDriver && (
              <ChatAvatarButton
                imageUrl={selectedChatAvatarUrl}
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
          {hasSelectedChatTarget && visibleMessages.length === 0 && (
            <div className="chat-empty-state">
              <Mail size={24} />
              <strong>{t('chat.noMessagesYet')}</strong>
              <span>{selectedTeamThread ? 'Scrivi il primo messaggio nel gruppo.' : t('chat.firstMessageHint')}</span>
            </div>
          )}
          {!hasSelectedChatTarget && (
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
                {...(selectedTeamThread ? {} : messageActions.getMessageActionProps(message))}
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
                {!selectedTeamThread && message.senderRole === 'company' && (
                  <MessageStatus status={getMessageStatus(message, 'company')} />
                )}
                {!selectedTeamThread && (
                  <ChatReactionBar
                    message={message}
                    onOpen={() => messageActions.openMessageActions(message.id)}
                  />
                )}
                {!selectedTeamThread && isActionMenuOpen && (
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
              <ChatAttachmentMenu disabled={!hasSelectedChatTarget} onFile={handleAttachmentChange} t={t} />
            )}
            {!isCompanyRecordingAudio && (
              <textarea
                ref={composeTextareaRef}
                className="chat-compose-input"
                disabled={!hasSelectedChatTarget}
                onKeyDown={handleComposeKeyDown}
                onChange={(event) => {
                  setMessageBody(event.target.value)
                  signalCompanyTyping(event.target.value)
                }}
                placeholder={hasSelectedChatTarget ? t('chat.writePlaceholder') : t('chat.selectDriver')}
                rows={1}
                value={messageBody}
              />
            )}
            <span className="chat-compose-tail">
              {!hasCompanyComposerPayload && !isCompanyRecordingAudio && (
                <ChatQuickCameraButton disabled={!hasSelectedChatTarget || isSending} onFile={handleAttachmentChange} t={t} />
              )}
              {hasCompanyComposerPayload ? (
                <button
                  aria-label={isSending ? t('chat.sending') : t('chat.send')}
                  className="chat-send-button"
                  disabled={!hasSelectedChatTarget || isSending}
                  type="submit"
                >
                  <Send size={18} />
                  <span className="sr-only">{isSending ? t('chat.sending') : t('chat.send')}</span>
                </button>
              ) : (
                <ChatAudioRecorder
                  disabled={!hasSelectedChatTarget || isSending}
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
  const { language, t } = useI18n()
  const repairCurrency = report.repairCostCurrency || getDefaultCurrency(language)
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
          {report.repairCostCents ? ` · ${formatMoneyCents(report.repairCostCents, repairCurrency)}` : ''}
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

function DeadlineOperationRow({ item, onOpen, selected }) {
  const { t } = useI18n()
  const days = typeof item.urgency?.days === 'number' ? item.urgency.days : daysUntil(item.dueDate)
  const urgency = item.urgency ?? {
    days,
    key: days < 0 ? 'expired' : days <= 7 ? 'critical' : 'soon',
    label: days < 0 ? 'Scaduta' : days <= 7 ? 'Critica' : 'In scadenza',
    tone: days <= 7 ? 'danger' : 'warning',
  }
  const rowClassName = ['operation-row', selected ? 'is-selected' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <article className={rowClassName}>
      <div className={`operation-icon tone-${urgency.tone}`}>
        <CalendarClock size={20} />
      </div>
      <div className="operation-main">
        <div className="operation-title">
          <strong>{item.type || 'Scadenza documentale'}</strong>
          <span className={`status-pill tone-${urgency.tone}`}>{getUrgencyLabel(urgency, t)}</span>
        </div>
        <p>{item.assignee || item.owner || 'Azienda'} · {formatDate(item.dueDate)}</p>
        <small>
          {item.detail || item.scope || 'Pratica documentale'}
          {item.documentNumber ? ` · ${item.documentNumber}` : ''}
        </small>
        {item.notes ? <em>{item.notes}</em> : null}
      </div>
      <div className="operation-actions">
        <button className="small-button" onClick={onOpen} type="button">
          {t('operations.open')}
        </button>
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
  const { language, t } = useI18n()
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
  const currentFault = operation?.kind === 'fault' ? operation.data : null
  const [repairAmount, setRepairAmount] = useState('')
  const [repairNotes, setRepairNotes] = useState('')
  const [isSavingRepair, setIsSavingRepair] = useState(false)

  useEffect(() => {
    if (!currentFault?.id) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset the edit form when a different fault is opened.
    setRepairAmount(formatMoneyInput(currentFault.repairCostCents))
    setRepairNotes(currentFault.repairNotes ?? '')
    setIsSavingRepair(false)
  }, [currentFault?.id, currentFault?.repairCostCents, currentFault?.repairNotes])

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

  if (operation.kind === 'deadline') {
    const item = operation.data
    const days = typeof item.urgency?.days === 'number' ? item.urgency.days : daysUntil(item.dueDate)
    const urgency = item.urgency ?? {
      days,
      key: days < 0 ? 'expired' : days <= 7 ? 'critical' : 'soon',
      label: days < 0 ? 'Scaduta' : days <= 7 ? 'Critica' : 'In scadenza',
      tone: days <= 7 ? 'danger' : 'warning',
    }
    const daysLabel =
      days < 0
        ? t('deadline.daysAgo', { count: Math.abs(days) })
        : days === 0
          ? 'Oggi'
          : t('deadline.days', { count: days })
    const subjectType = item.subjectKind ?? (item.scope === 'driver' ? 'Autista' : item.scope === 'vehicle' ? 'Mezzo' : item.scope === 'person' ? 'Persona' : 'Azienda')

    return (
      <Shell className={shellClassName} {...shellProps}>
        <div className="panel-header compact">
          <div>
            <p className="overline">Scadenza</p>
            <h2>{item.type || 'Scadenza documentale'}</h2>
          </div>
          <div className="operation-detail-header-actions">
            <CalendarClock size={20} />
            {surface === 'modal' && (
              <button aria-label={t('common.close')} className="icon-button operation-modal-close" onClick={onClose} type="button">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <div className="operation-detail-body">
          <DetailLine label={t('common.status')} value={`${getUrgencyLabel(urgency, t)} · ${daysLabel}`} />
          <DetailLine label="Ambito" value={subjectType} />
          <DetailLine label={t('deadline.subject')} value={item.assignee || item.owner || 'Azienda'} />
          <DetailLine label="Dettaglio" value={item.detail} />
          <DetailLine label={t('deadline.dueDate')} value={formatDate(item.dueDate)} />
          <DetailLine label="Numero documento" value={item.documentNumber} />
          <DetailLine label={t('deadline.owner')} value={item.owner} />
          {item.notes ? (
            <div className="detail-note">
              <strong>{t('common.notes')}</strong>
              <p>{item.notes}</p>
            </div>
          ) : null}
          <div className={urgency.tone === 'danger' ? 'detail-note is-critical' : 'detail-note'}>
            <strong>Da lavorare</strong>
            <p>Apri Scadenze o Anagrafiche per rinnovare il documento, caricare il file aggiornato o chiudere la pratica.</p>
          </div>
        </div>
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
    const repairCostCents = parseMoneyToCents(repairAmount)
    const repairCurrency = report.repairCostCurrency || getDefaultCurrency(language)

    async function saveRepair(nextStatus = report.status) {
      setIsSavingRepair(true)
      await onUpdateFaultStatus?.(report.id, nextStatus, {
        repairCostCents,
        repairCostCurrency: repairCurrency,
        repairNotes,
      })
      setIsSavingRepair(false)
    }

    async function deleteRepairCost() {
      const confirmed = window.confirm(`Eliminare il costo riparazione dal guasto "${report.title}"?`)
      if (!confirmed) return

      setIsSavingRepair(true)
      await onUpdateFaultStatus?.(report.id, report.status, {
        repairCleared: true,
        repairCostCents: 0,
        repairCostCurrency: repairCurrency,
        repairNotes: '',
      })
      setRepairAmount('')
      setRepairNotes('')
      setIsSavingRepair(false)
    }

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
          <DetailLine label="Costo riparazione" value={report.repairCostCents ? formatMoneyCents(report.repairCostCents, repairCurrency) : 'Non inserito'} />
          {report.repairRecordedAt ? <DetailLine label="Costo registrato" value={formatShortDateTime(report.repairRecordedAt)} /> : null}
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
          <div className="fault-cost-panel">
            <div>
              <strong>Costo riparazione</strong>
              <span>Importo opzionale, utile per report per targa, giorno, mese e anno.</span>
            </div>
            <div className="fault-cost-grid">
              <label>
                Importo speso
                <input
                  inputMode="decimal"
                  onChange={(event) => setRepairAmount(event.target.value)}
                  placeholder="Es. 450,00"
                  value={repairAmount}
                />
              </label>
              <label>
                Note officina/intervento
                <input
                  onChange={(event) => setRepairNotes(event.target.value)}
                  placeholder="Es. sostituita valvola EGR"
                  value={repairNotes}
                />
              </label>
            </div>
            <small>{repairCostCents ? `Totale inserito: ${formatMoneyCents(repairCostCents, repairCurrency)}` : 'Lascia 0 se il costo non e ancora noto.'}</small>
          </div>
        </div>
        <div className="operation-detail-actions">
          <button className="small-button" disabled={isSavingRepair} onClick={() => saveRepair(report.status)} type="button">
            <Save size={15} />
            {isSavingRepair ? 'Salvo...' : 'Salva costo'}
          </button>
          {report.repairCostCents ? (
            <button className="small-button danger-action" disabled={isSavingRepair} onClick={deleteRepairCost} type="button">
              <X size={15} />
              Elimina costo
            </button>
          ) : null}
          {isClosed ? (
            <button className="small-button" onClick={() => onUpdateFaultStatus(report.id, 'open')} type="button">
              {t('operations.markUnread')}
            </button>
          ) : (
            <button className="small-button danger-action" disabled={isSavingRepair} onClick={() => saveRepair('closed')} type="button">
              {repairCostCents ? 'Archivia con costo' : t('operations.archive')}
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
  const isRead = isVehicleCheckArchived(check, acknowledgedCheckIds)

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

function ComplianceBoard({
  activeFilter,
  allItemCount = 0,
  complianceShowAll = false,
  filteredItems,
  onClose,
  onFilter,
  onOpenDetail,
  onReminder,
  onRenew,
  onToggleShowAll,
  workItemCount = 0,
}) {
  const { t } = useI18n()

  return (
    <section className="panel compliance-panel" id="compliance-board-panel">
      <div className="panel-header">
        <div>
          <p className="overline">{t('deadline.agenda')}</p>
          <h2>{t('deadline.boardTitle')}</h2>
          <span className="panel-header-subtitle">
            {complianceShowAll
              ? `${allItemCount} pratiche totali · ${workItemCount} da lavorare`
              : `${workItemCount} da lavorare`}
          </span>
        </div>
        <button className="small-button compliance-toggle-button" type="button" onClick={onToggleShowAll}>
          <Filter size={18} />
          {complianceShowAll ? 'Solo da lavorare' : 'Mostra tutto'}
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
            onRenew={() => onRenew?.(item)}
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
        <button className="small-button" onClick={onRenew} type="button">
          <Clock3 size={15} />
          {t('deadline.renew')}
        </button>
        {!isDone && (
          <button className="small-button danger-action" onClick={onClose} type="button">
            <CheckCircle2 size={15} />
            {t('deadline.close')}
          </button>
        )}
      </div>
    </article>
  )
}

function DeadlineDetailModal({ item, onClose, onMarkDone, onOpenFile, onReminder, onRenew, statusMessage }) {
  const { t } = useI18n()
  const [form, setForm] = useState({
    documentNumber: '',
    dueDate: '',
    owner: '',
    type: '',
  })
  const [file, setFile] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingReminder, setIsSendingReminder] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  useEffect(() => {
    if (!item) return

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset the renewal form when a different deadline is opened.
    setForm({
      documentNumber: item.documentNumber ?? '',
      dueDate: item.dueDate ?? '',
      owner: item.owner ?? '',
      type: item.type ?? '',
    })
    setFile(null)
    setShowValidation(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Keep edits intact while the same deadline is open.
  }, [item?.id])

  if (!item) return null

  const isDone = item.status === 'done'
  const isLinkedToPerson = Boolean(item.driverId || item.personId)
  const subjectType = item.subjectKind ?? (item.scope === 'driver' ? 'Persona' : item.scope === 'vehicle' ? 'Mezzo' : 'Azienda')
  const daysLabel =
    item.urgency.days < 0
      ? t('deadline.daysAgo', { count: Math.abs(item.urgency.days) })
      : item.urgency.days === 0
        ? 'Oggi'
        : t('deadline.days', { count: item.urgency.days })
  const cleanType = form.type.trim()
  const cleanDueDate = form.dueDate.trim()
  const canRenew = Boolean(cleanType && cleanDueDate)
  const hasCurrentFile = Boolean(item.filePath)
  const lastReminderLabel = item.lastReminderAt ? formatShortDateTime(item.lastReminderAt) : 'Mai inviato'

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  async function handleRenew(event) {
    event.preventDefault()
    setShowValidation(true)

    if (!canRenew) return

    setIsSaving(true)
    const renewed = await onRenew?.(item, {
      documentNumber: form.documentNumber.trim(),
      dueDate: cleanDueDate,
      owner: form.owner.trim(),
      type: cleanType,
    }, file)
    setIsSaving(false)

    if (renewed) {
      setShowValidation(false)
    }
  }

  async function handleReminder() {
    if (!onReminder) return

    setIsSendingReminder(true)
    await onReminder(item.id)
    setIsSendingReminder(false)
  }

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
          <DetailLine label="Ultimo sollecito" value={lastReminderLabel} />
          <div className="deadline-current-document">
            <div className="deadline-current-document-copy">
              <strong>Documento attuale</strong>
              <span>
                {hasCurrentFile
                  ? 'Apri il file presente prima di sostituirlo o rinnovare la scadenza.'
                  : 'Nessun file collegato a questa pratica. Carica il nuovo documento nel rinnovo.'}
              </span>
            </div>
            <button className="small-button" disabled={!hasCurrentFile} onClick={() => onOpenFile?.(item)} type="button">
              <ExternalLink size={15} />
              {hasCurrentFile ? 'Apri documento' : 'Nessun documento'}
            </button>
          </div>
        </div>

        <form className="deadline-renew-form" noValidate onSubmit={handleRenew}>
          <div className="deadline-renew-copy">
            <strong>Rinnovo e sollecito</strong>
            <span>
              Aggiorna data e documento per chiudere la criticita, oppure sollecita la persona se deve caricarlo dall app.
            </span>
          </div>
          <div className="deadline-renew-steps" aria-label="Passaggi rinnovo">
            <span>1. Controlla documento</span>
            <span>2. Carica rinnovo</span>
            <span>3. Salva nuova scadenza</span>
          </div>
          <div className="form-grid deadline-renew-grid">
            <label>
              Tipo scadenza
              <input list="deadline-renew-document-types" onChange={(event) => updateField('type', event.target.value)} value={form.type} />
              <datalist id="deadline-renew-document-types">
                {documentTypes.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </label>
            <label>
              Nuova data scadenza
              <input onChange={(event) => updateField('dueDate', event.target.value)} type="date" value={form.dueDate} />
            </label>
            <label>
              Numero documento
              <input onChange={(event) => updateField('documentNumber', event.target.value)} placeholder="Opzionale" value={form.documentNumber} />
            </label>
            <label>
              Responsabile
              <input onChange={(event) => updateField('owner', event.target.value)} placeholder="Opzionale" value={form.owner} />
            </label>
          </div>
          <div className="deadline-file-row">
            <label className="small-button document-upload-inline deadline-file-picker">
              <Upload size={15} />
              {file ? file.name : 'Carica nuovo file'}
              <input
                accept="application/pdf,image/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                type="file"
              />
            </label>
            {file && (
              <button className="small-button" onClick={() => setFile(null)} type="button">
                <X size={15} />
                Rimuovi file
              </button>
            )}
          </div>
          {showValidation && !canRenew && <FormValidationAlert message="Inserisci tipo scadenza e nuova data." />}
          {statusMessage && <small className="document-upload-status deadline-status-message">{statusMessage}</small>}
          <div className="operation-detail-actions">
            <button className="primary-button" disabled={isSaving || !canRenew} type="submit">
              <Save size={17} />
              {isSaving ? 'Salvataggio...' : 'Salva rinnovo e aggiorna'}
            </button>
            {isLinkedToPerson && (
              <button className="small-button" disabled={isSendingReminder} onClick={handleReminder} type="button">
                <Send size={15} />
                {isSendingReminder ? 'Invio...' : 'Sollecita su app'}
              </button>
            )}
            {!isDone && (
              <button className="small-button danger-action" disabled={isSaving} onClick={() => onMarkDone?.(item.id)} type="button">
                <CheckCircle2 size={15} />
                Segna gestita senza rinnovo
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
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
  onStartVoiceCall,
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
            onStartVoiceCall={onStartVoiceCall}
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
  onStartVoiceCall,
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
            onStartVoiceCall={onStartVoiceCall}
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
  onStartVoiceCall,
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
        <ChatVoiceCallButton
          callPayload={{
            callerDriverId: driver?.id,
            callerRole: 'driver',
            driverId: driver?.id,
            threadId: thread?.id,
          }}
          onCall={onStartVoiceCall}
          targetName={companyName}
        />
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
