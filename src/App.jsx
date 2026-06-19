import { useEffect, useMemo, useState } from 'react'
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left.mjs'
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle.mjs'
import Bell from 'lucide-react/dist/esm/icons/bell.mjs'
import BadgeCheck from 'lucide-react/dist/esm/icons/badge-check.mjs'
import Building2 from 'lucide-react/dist/esm/icons/building-2.mjs'
import CalendarClock from 'lucide-react/dist/esm/icons/calendar-clock.mjs'
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2.mjs'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right.mjs'
import ClipboardCheck from 'lucide-react/dist/esm/icons/clipboard-check.mjs'
import Clock3 from 'lucide-react/dist/esm/icons/clock-3.mjs'
import Download from 'lucide-react/dist/esm/icons/download.mjs'
import FileText from 'lucide-react/dist/esm/icons/file-text.mjs'
import Filter from 'lucide-react/dist/esm/icons/filter.mjs'
import Gauge from 'lucide-react/dist/esm/icons/gauge.mjs'
import KeyRound from 'lucide-react/dist/esm/icons/key-round.mjs'
import LockKeyhole from 'lucide-react/dist/esm/icons/lock-keyhole.mjs'
import LogOut from 'lucide-react/dist/esm/icons/log-out.mjs'
import Mail from 'lucide-react/dist/esm/icons/mail.mjs'
import Pencil from 'lucide-react/dist/esm/icons/pencil.mjs'
import Plus from 'lucide-react/dist/esm/icons/plus.mjs'
import RadioTower from 'lucide-react/dist/esm/icons/radio-tower.mjs'
import Route from 'lucide-react/dist/esm/icons/route.mjs'
import Save from 'lucide-react/dist/esm/icons/save.mjs'
import Search from 'lucide-react/dist/esm/icons/search.mjs'
import Send from 'lucide-react/dist/esm/icons/send.mjs'
import SettingsIcon from 'lucide-react/dist/esm/icons/settings.mjs'
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.mjs'
import Smartphone from 'lucide-react/dist/esm/icons/smartphone.mjs'
import Stethoscope from 'lucide-react/dist/esm/icons/stethoscope.mjs'
import Truck from 'lucide-react/dist/esm/icons/truck.mjs'
import Upload from 'lucide-react/dist/esm/icons/upload.mjs'
import UserPlus from 'lucide-react/dist/esm/icons/user-plus.mjs'
import UserRound from 'lucide-react/dist/esm/icons/user-round.mjs'
import Users from 'lucide-react/dist/esm/icons/users.mjs'
import Wrench from 'lucide-react/dist/esm/icons/wrench.mjs'
import { company, complianceItems, driverDocuments, drivers, vehicles } from './data/sampleData'
import { daysUntil, decorateCompliance, formatDate, getSummary } from './lib/expiry'
import {
  archiveDriverRecord as archiveSupabaseDriver,
  archiveVehicleRecord as archiveSupabaseVehicle,
  clearDriverProfileImageFile as clearSupabaseDriverProfileImageFile,
  createCompanyAssetSignedUrl,
  createDriverDocumentSignedUrl,
  createDriverAccount as createSupabaseDriverAccount,
  createFaultReportRecord as createSupabaseFaultReport,
  createDriverRecord as createSupabaseDriver,
  createDriverDocumentRecord as createSupabaseDriverDocument,
  createVehicleRecord as createSupabaseVehicle,
  createVehicleCheckRecord as createSupabaseVehicleCheck,
  deleteDriverDocumentRecord as deleteSupabaseDriverDocument,
  ensureCompanyForCurrentUser,
  fetchComplianceItems,
  fetchDriverDocuments,
  fetchDriverSessionData,
  fetchDrivers,
  fetchFaultReports,
  fetchVehicleChecks,
  fetchVehicles,
  getCurrentAuthSession,
  isSupabaseConfigured,
  signInDriver,
  signInCompany,
  signOut,
  signUpCompany,
  uploadCompanyLogoFile as uploadSupabaseCompanyLogoFile,
  uploadDriverDocumentFile as uploadSupabaseDriverDocumentFile,
  uploadDriverProfileImageFile as uploadSupabaseDriverProfileImageFile,
  updateDriverDocumentRecord as updateSupabaseDriverDocument,
  updateDriverRecord as updateSupabaseDriver,
  updateCompanyProfile as updateSupabaseCompanyProfile,
  updateFaultReportStatus as updateSupabaseFaultReportStatus,
  updateVehicleRecord as updateSupabaseVehicle,
} from './lib/supabase'
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
const maxProfileImageFileSize = 5 * 1024 * 1024

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
const faultSeverityOptions = [
  { value: 'low', label: 'Bassa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'stop_vehicle', label: 'Fermo mezzo' },
]
const faultStatusOptions = [
  { value: 'open', label: 'Aperto' },
  { value: 'seen', label: 'Visto' },
  { value: 'in_progress', label: 'In lavorazione' },
  { value: 'closed', label: 'Chiuso' },
]

function getFleetTypeLabel(value) {
  return fleetTypeOptions.find((option) => option.value === value)?.label ?? value
}

function getFaultSeverityLabel(value) {
  return faultSeverityOptions.find((option) => option.value === value)?.label ?? value
}

function getFaultStatusLabel(value) {
  return faultStatusOptions.find((option) => option.value === value)?.label ?? value
}

function getDisplayCompanyName(name) {
  const trimmedName = name?.trim()

  if (!trimmedName || placeholderCompanyNames.has(trimmedName) || trimmedName.includes('@')) {
    return demoCompanyName
  }

  return trimmedName
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

function getCheckIssues(check) {
  return [
    check.lightsOk ? null : 'luci da controllare',
    check.tiresOk ? null : 'gomme da controllare',
    check.documentsOnBoard ? null : 'documenti bordo mancanti',
  ].filter(Boolean)
}

function hasCheckIssues(check) {
  return getCheckIssues(check).length > 0
}

function formatMissingFields(fields) {
  if (fields.length === 0) return ''

  return `Mancano: ${fields.join(', ')}.`
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

function isSupportedImageFile(file) {
  return Boolean(file?.type?.startsWith('image/'))
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

function App() {
  const [session, setSession] = useState(null)
  const [items, setItems] = useState(complianceItems)
  const [documentRecords, setDocumentRecords] = useState(driverDocuments)
  const [driverRecords, setDriverRecords] = useState(drivers)
  const [vehicleRecords, setVehicleRecords] = useState(vehicles)
  const [vehicleCheckRecords, setVehicleCheckRecords] = useState([])
  const [faultReportRecords, setFaultReportRecords] = useState([])
  const [activeCompanyId, setActiveCompanyId] = useState('')
  const [companyProfile, setCompanyProfile] = useState({
    headquarters: company.location,
    id: '',
    logoPath: company.logoPath ?? '',
    name: company.name,
    vatNumber: company.vat,
  })
  const [assetPreviewUrls, setAssetPreviewUrls] = useState({})
  const [activeView, setActiveView] = useState('dashboard')
  const [activeFilter, setActiveFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [driversSyncStatus, setDriversSyncStatus] = useState('')
  const [documentsSyncStatus, setDocumentsSyncStatus] = useState('')
  const [fleetSyncStatus, setFleetSyncStatus] = useState('')
  const [operationsSyncStatus, setOperationsSyncStatus] = useState('')
  const [companySettingsStatus, setCompanySettingsStatus] = useState('')
  const [driverDocumentUploadStatus, setDriverDocumentUploadStatus] = useState('')
  const [uploadingDriverDocumentId, setUploadingDriverDocumentId] = useState('')
  const [driverUploadSent, setDriverUploadSent] = useState(false)
  const [morningCheckSent, setMorningCheckSent] = useState(false)
  const [faultReported, setFaultReported] = useState(false)
  const [acknowledgedCheckIds, setAcknowledgedCheckIds] = useState(loadAcknowledgedCheckIds)
  const [archivedFaultOverrideIds, setArchivedFaultOverrideIds] = useState(loadArchivedFaultOverrideIds)

  const decoratedItems = useMemo(() => decorateCompliance(items, driverRecords, vehicleRecords), [driverRecords, items, vehicleRecords])
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
      ]
        .filter(isPreviewableAssetPath),
    [companyProfile.logoPath, driverRecords, faultReportRecords],
  )

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

    if (nextSession.role === 'driver') {
      resetDriverSessionData()
    }

    setSession(nextSession)
  }

  function resetDriverSessionData() {
    setItems([])
    setDocumentRecords([])
    setDriverRecords([])
    setVehicleRecords([])
    setVehicleCheckRecords([])
    setFaultReportRecords([])
    setDriverUploadSent(false)
    setMorningCheckSent(false)
    setFaultReported(false)
    setDriverDocumentUploadStatus('')
    setUploadingDriverDocumentId('')
  }

  function getAssetPreviewUrl(path) {
    if (!path) return ''
    if (!isPreviewableAssetPath(path)) return path

    return assetPreviewUrls[path] ?? ''
  }

  function validateImageFile(file, setStatus) {
    if (!file) return false

    if (!isSupportedImageFile(file)) {
      setStatus('Carica un file immagine: JPG, PNG, WEBP o HEIC.')
      return false
    }

    if (file.size > maxProfileImageFileSize) {
      setStatus('Immagine troppo grande. Usa una foto sotto 5 MB.')
      return false
    }

    return true
  }

  async function uploadCompanyLogo(file) {
    if (!validateImageFile(file, setCompanySettingsStatus)) return false

    if (isSupabaseConfigured && session?.role === 'company' && !activeCompanyId) {
      setCompanySettingsStatus('Aspetta il caricamento azienda, poi riprova.')
      return false
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
      setCompanySettingsStatus('Caricamento logo azienda...')
      const result = await uploadSupabaseCompanyLogoFile(file, activeCompanyId)

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

      setCompanySettingsStatus('Logo azienda aggiornato.')
      return true
    }

    const previewUrl = URL.createObjectURL(file)
    setCompanyProfile((currentProfile) => ({ ...currentProfile, logoPath: previewUrl }))
    setCompanySettingsStatus('Logo azienda aggiornato in modalità locale.')
    return true
  }

  async function uploadDriverProfileImage(driverId, file) {
    const setStatus = session?.role === 'driver' ? setDriverDocumentUploadStatus : setDriversSyncStatus
    if (!validateImageFile(file, setStatus)) return false

    if (isSupabaseConfigured && ['company', 'driver'].includes(session?.role) && !activeCompanyId) {
      setStatus('Aspetta il caricamento azienda, poi riprova.')
      return false
    }

    if (hasCompanyDataConnection && ['company', 'driver'].includes(session?.role)) {
      setStatus('Caricamento foto profilo...')
      const result = await uploadSupabaseDriverProfileImageFile(driverId, file, activeCompanyId)

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

      setStatus('Foto profilo aggiornata.')
      return true
    }

    const previewUrl = URL.createObjectURL(file)
    setDriverRecords((currentDrivers) =>
      currentDrivers.map((driver) => (driver.id === driverId ? { ...driver, profileImagePath: previewUrl } : driver)),
    )
    setStatus('Foto profilo aggiornata in modalità locale.')
    return true
  }

  async function removeDriverProfileImage(driverId) {
    const setStatus = session?.role === 'driver' ? setDriverDocumentUploadStatus : setDriversSyncStatus

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
        setSession((currentSession) => currentSession ?? buildAppSessionFromAuthUser(authUser))
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!session || session.role !== 'company' || !isSupabaseConfigured) return

    let isMounted = true

    async function loadCompanyData() {
      const companyName = session.name?.trim() && !session.name.includes('@') ? session.name.trim() : 'Nuova azienda'
      setDriversSyncStatus('Caricamento dati Supabase...')
      setDocumentsSyncStatus('Caricamento documenti Supabase...')
      setOperationsSyncStatus('Caricamento check e guasti...')
      setFleetSyncStatus('Caricamento flotta Supabase...')
      const companyResult = await ensureCompanyForCurrentUser(companyName)

      if (!isMounted) return

      if (companyResult.error || !companyResult.data?.id) {
        setDriversSyncStatus(`Azienda non collegata. Supabase: ${companyResult.error?.message ?? 'profilo mancante'}`)
        setDocumentsSyncStatus('Documenti non caricati.')
        setFleetSyncStatus('Flotta non caricata.')
        setOperationsSyncStatus('Check e guasti non caricati.')
        return
      }

      const companyId = companyResult.data.id
      setActiveCompanyId(companyId)
      setCompanyProfile(companyResult.data)
      const [driversResult, vehiclesResult, complianceResult, documentsResult, checksResult, faultsResult] = await Promise.all([
        fetchDrivers(companyId),
        fetchVehicles(companyId),
        fetchComplianceItems(companyId),
        fetchDriverDocuments(companyId),
        fetchVehicleChecks(companyId),
        fetchFaultReports(companyId),
      ])

      if (!isMounted) return

      if (driversResult.error || vehiclesResult.error || complianceResult.error || documentsResult.error) {
        setDriversSyncStatus('Supabase non ha risposto correttamente. Sto mostrando i dati locali.')
        setDocumentsSyncStatus('Supabase non ha risposto correttamente. Sto mostrando i documenti locali.')
        setFleetSyncStatus('Supabase non ha risposto correttamente. Sto mostrando i dati locali.')
        setOperationsSyncStatus('Check e guasti non caricati.')
        return
      }

      if (driversResult.data) setDriverRecords(driversResult.data)
      if (vehiclesResult.data) setVehicleRecords(vehiclesResult.data)
      if (complianceResult.data) setItems(complianceResult.data)
      if (documentsResult.data) setDocumentRecords(documentsResult.data)
      if (checksResult.data) setVehicleCheckRecords(checksResult.data)
      if (faultsResult.data) setFaultReportRecords(faultsResult.data)
      setDriversSyncStatus('Dati Supabase caricati.')
      setDocumentsSyncStatus('Documenti Supabase caricati.')
      setFleetSyncStatus('Dati Supabase caricati.')
      setOperationsSyncStatus(
        checksResult.error || faultsResult.error ? 'Check e guasti non caricati.' : 'Check e guasti caricati.',
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
      setOperationsSyncStatus('Caricamento area autista...')
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
        setOperationsSyncStatus(
          (driverSessionResult.data.vehicles ?? []).some((vehicle) => vehicle.fleetType !== 'semirimorchio')
            ? 'Area autista caricata.'
            : 'Nessun mezzo disponibile. L azienda deve aggiungere almeno un furgone, motrice o trattore in Flotta.',
        )
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
      setOperationsSyncStatus(
        vehiclesResult.data?.some((vehicle) => vehicle.fleetType !== 'semirimorchio')
          ? 'Area autista caricata.'
          : driverSessionResult.error?.message ?? 'Nessun mezzo disponibile in area autista.',
      )
    }

    loadDriverData()

    return () => {
      isMounted = false
    }
  }, [session])

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
    setOperationsSyncStatus('')
    setCompanySettingsStatus('')
    setActiveCompanyId('')
    setAssetPreviewUrls({})
    setItems(complianceItems)
    setDocumentRecords(driverDocuments)
    setDriverRecords(drivers)
    setVehicleRecords(vehicles)
    setVehicleCheckRecords([])
    setFaultReportRecords([])
    setCompanyProfile({
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
      return true
    }

    setDocumentRecords((currentDocuments) => [cleanDocument, ...currentDocuments])
    setDocumentsSyncStatus('Documento aggiunto in modalità locale.')
    return true
  }

  async function updateDriverDocumentRecord(documentId, updates) {
    const cleanUpdates = {
      ...updates,
      documentNumber: updates.documentNumber?.trim() ?? '',
      filePath: updates.filePath?.trim() ?? '',
    }

    if (hasCompanyDataConnection && session?.role === 'company') {
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

  async function removeDriverDocumentRecord(documentId) {
    if (hasCompanyDataConnection && session?.role === 'company') {
      setDocumentsSyncStatus('Rimozione documento da Supabase...')
      const result = await deleteSupabaseDriverDocument(documentId)

      if (result.error) {
        setDocumentsSyncStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }
    }

    setDocumentRecords((currentDocuments) => currentDocuments.filter((document) => document.id !== documentId))
    setDocumentsSyncStatus(hasCompanyDataConnection ? 'Documento rimosso.' : 'Documento rimosso in modalità locale.')
    return true
  }

  async function uploadDriverDocumentFile(document, file) {
    if (!file) return false

    if (file.size > maxDriverDocumentFileSize) {
      setDriverDocumentUploadStatus('File troppo grande. Usa una foto o un PDF sotto 10 MB.')
      return false
    }

    setUploadingDriverDocumentId(document.id)
    setDriverDocumentUploadStatus('Caricamento documento...')

    if (hasCompanyDataConnection && ['company', 'driver'].includes(session?.role)) {
      const result = await uploadSupabaseDriverDocumentFile(document, file, activeCompanyId)
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
      }
      setDriverUploadSent(true)
      setDriverDocumentUploadStatus('Documento caricato. Ora puoi aprirlo dall app.')
      return true
    }

    setDocumentRecords((currentDocuments) =>
      currentDocuments.map((currentDocument) =>
        currentDocument.id === document.id
          ? { ...currentDocument, filePath: file.name, status: 'Caricato' }
          : currentDocument,
      ),
    )
    setUploadingDriverDocumentId('')
    setDriverUploadSent(true)
    setDriverDocumentUploadStatus('Documento selezionato in modalità locale.')
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

    if (photoFile && !validateImageFile(photoFile, setOperationsSyncStatus)) return false

    const localReport = {
      ...reportData,
      createdAt: new Date().toISOString(),
      id: `fault-${Date.now()}`,
      photoPath: photoFile ? URL.createObjectURL(photoFile) : reportData.photoPath ?? '',
      status: 'open',
      updatedAt: new Date().toISOString(),
    }

    setOperationsSyncStatus('Invio segnalazione guasto...')

    if (hasCompanyDataConnection && session?.role === 'driver') {
      const result = await createSupabaseFaultReport(reportData, activeCompanyId, photoFile)

      if (result.error) {
        setOperationsSyncStatus(`Errore guasto: ${result.error.message}`)
        return false
      }

      setFaultReportRecords((currentReports) => [result.data, ...currentReports])
      setFaultReported(true)
      setOperationsSyncStatus('Guasto segnalato all azienda.')
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

  async function updateFaultReportStatus(reportId, status) {
    setOperationsSyncStatus('Aggiornamento guasto...')
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
      setOperationsSyncStatus('Guasto aggiornato.')
      return true
    }
    setOperationsSyncStatus('Guasto aggiornato in modalità locale.')
    return true
  }

  function acknowledgeCheck(checkId) {
    setAcknowledgedCheckIds((currentIds) => (currentIds.includes(checkId) ? currentIds : [...currentIds, checkId]))
  }

  const unreadCheckCount = vehicleCheckRecords.filter((check) => !acknowledgedCheckIds.includes(check.id)).length
  const openFaultCount = visibleFaultReportRecords.filter((report) => report.status === 'open').length
  const criticalCheckCount = vehicleCheckRecords.filter((check) => !acknowledgedCheckIds.includes(check.id) && hasCheckIssues(check)).length
  const notificationCount = unreadCheckCount + openFaultCount

  if (!session) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />
  }

  if (session.role === 'driver') {
    return (
      <DriverAppView
        assetPreviewUrl={getAssetPreviewUrl}
        companyLogoUrl={getAssetPreviewUrl(companyProfile.logoPath)}
        companyName={getDisplayCompanyName(companyProfile.name || session.name || company.name || 'Azienda')}
        documentUploadStatus={driverDocumentUploadStatus}
        items={decoratedItems}
        documentRecords={documentRecords}
        driverRecords={driverRecords}
        faultReportRecords={visibleFaultReportRecords}
        vehicleRecords={vehicleRecords}
        onDriverDocumentUpload={uploadDriverDocumentFile}
        onDriverProfileImageUpload={uploadDriverProfileImage}
        onDriverProfileImageRemove={removeDriverProfileImage}
        onFaultReport={submitFaultReport}
        onMorningCheck={submitMorningCheck}
        onOpenDriverDocument={openDriverDocumentFile}
        onSignOut={handleSignOut}
        onUpload={() => setDriverUploadSent(true)}
        operationsStatus={operationsSyncStatus}
        faultReported={faultReported}
        morningCheckSent={morningCheckSent}
        uploadSent={driverUploadSent}
        uploadingDocumentId={uploadingDriverDocumentId}
        vehicleCheckRecords={vehicleCheckRecords}
      />
    )
  }

  const companyName = getDisplayCompanyName(companyProfile.name || session.name || company.name || 'Azienda')
  const activeDriverCount = driverRecords.filter((driver) => driver.status !== 'Archiviato').length
  const activeVehicleCount = vehicleRecords.filter((vehicle) => vehicle.status !== 'Archiviato').length
  const isEmptyCompanyDashboard = activeDriverCount === 0 && activeVehicleCount === 0 && decoratedItems.length === 0

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

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        notificationCount={notificationCount}
        onHome={openDashboardHome}
        onNavigate={setActiveView}
        onSignOut={handleSignOut}
        session={session}
      />
      <main className="workspace">
        <Topbar query={query} setQuery={setQuery} />
        {activeView === 'drivers' ? (
          <DriversWorkspace
            assetPreviewUrl={getAssetPreviewUrl}
            driverRecords={driverRecords}
            onAddDriver={addDriverRecord}
            onArchiveDriver={archiveDriverRecord}
            onBackHome={openDashboardHome}
            onDriverProfileImageUpload={uploadDriverProfileImage}
            onUpdateDriver={updateDriverRecord}
            syncStatus={driversSyncStatus}
            vehicleRecords={vehicleRecords}
          />
        ) : activeView === 'documents' ? (
          <DocumentsWorkspace
            documentRecords={documentRecords}
            driverRecords={driverRecords}
            onAddDocument={addDriverDocumentRecord}
            onRemoveDocument={removeDriverDocumentRecord}
            onUpdateDocument={updateDriverDocumentRecord}
            syncStatus={documentsSyncStatus}
          />
        ) : activeView === 'fleet' ? (
          <FleetWorkspace
            driverRecords={driverRecords}
            onAddVehicle={addVehicleRecord}
            onArchiveVehicle={archiveVehicleRecord}
            onBackHome={openDashboardHome}
            onUpdateVehicle={updateVehicleRecord}
            syncStatus={fleetSyncStatus}
            vehicleRecords={vehicleRecords}
          />
        ) : activeView === 'notifications' ? (
          <OperationsWorkspace
            acknowledgedCheckIds={acknowledgedCheckIds}
            assetPreviewUrl={getAssetPreviewUrl}
            driverRecords={driverRecords}
            faultReportRecords={visibleFaultReportRecords}
            onAcknowledgeCheck={acknowledgeCheck}
            onUpdateFaultStatus={updateFaultReportStatus}
            syncStatus={operationsSyncStatus}
            vehicleCheckRecords={vehicleCheckRecords}
            vehicleRecords={vehicleRecords}
          />
        ) : activeView === 'settings' ? (
          <SettingsWorkspace
            key={`${companyProfile.name}-${companyProfile.vatNumber}-${companyProfile.headquarters}`}
            companyEmail={session.email}
            companyProfile={{ ...companyProfile, name: companyName }}
            companyLogoUrl={getAssetPreviewUrl(companyProfile.logoPath)}
            onCompanyLogoUpload={uploadCompanyLogo}
            onUpdateCompanyProfile={updateCompanyProfile}
            syncStatus={companySettingsStatus}
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
                onNewDeadline={openNewDeadlinePanel}
                onOpenNotifications={() => setActiveView('notifications')}
                openFaultCount={openFaultCount}
                summary={summary}
              />
            </section>
            {isEmptyCompanyDashboard && (
              <CompanyOnboardingPanel
                onNewDeadline={openNewDeadlinePanel}
                onOpenDrivers={() => setActiveView('drivers')}
                onOpenFleet={() => setActiveView('fleet')}
              />
            )}
            <section className="content-grid">
              <div className="main-column">
                <ComplianceBoard
                  activeFilter={activeFilter}
                  filteredItems={filteredItems}
                  onClose={closeItem}
                  onFilter={setActiveFilter}
                  onReminder={sendReminder}
                  onRenew={markRenewing}
                />
                <FleetAndForms
                  driverRecords={driverRecords}
                  onAdd={addComplianceItem}
                  onBackHome={openDashboardHome}
                  vehicleRecords={vehicleRecords}
                />
              </div>
              <aside className="side-column dashboard-side" aria-label="Notifiche azienda">
                <NotificationPanel
                  acknowledgedCheckIds={acknowledgedCheckIds}
                  driverRecords={driverRecords}
                  faultReportRecords={visibleFaultReportRecords}
                  onOpenNotifications={() => setActiveView('notifications')}
                  vehicleCheckRecords={vehicleCheckRecords}
                  vehicleRecords={vehicleRecords}
                />
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function AuthScreen({ onAuthenticated }) {
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
      setStatus('Inserisci email aziendale e password.')
      return
    }

    if (companyMode === 'signup' && !cleanCompanyForm.companyName) {
      setIsSubmitting(false)
      setStatus('Inserisci il nome del trasportatore o la ragione sociale.')
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
      setStatus('Registrazione inviata. Controlla la mail per confermare l account.')
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
      setStatus('Inserisci nome utente autista e password.')
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

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <div className="brand auth-brand">
          <div className="brand-mark">
            <Route size={24} strokeWidth={2.4} />
          </div>
          <div>
            <strong>Camion Chiaro</strong>
            <span>Scadenze e notifiche flotta</span>
          </div>
        </div>
        <h1>Login azienda e autista, tutto nello stesso posto.</h1>
        <p>
          L azienda controlla patenti, revisioni, assicurazioni e visite mediche. L autista entra con il
          nome utente creato dall azienda, riceve notifiche in app, carica documenti e segnala guasti.
        </p>
        <div className="auth-proof-grid">
          <div>
            <ShieldCheck size={18} />
            RLS Supabase
          </div>
          <div>
            <Smartphone size={18} />
            Area autista
          </div>
          <div>
            <Wrench size={18} />
            Check e guasti
          </div>
        </div>
      </section>

      <section className="auth-card" aria-label="Accesso Camion Chiaro">
        <div className="auth-tabs">
          <button className={mode === 'company' ? 'is-active' : ''} onClick={() => setMode('company')} type="button">
            <Building2 size={17} />
            Azienda
          </button>
          <button className={mode === 'driver' ? 'is-active' : ''} onClick={() => setMode('driver')} type="button">
            <UserRound size={17} />
            Autista
          </button>
        </div>

        {mode === 'company' ? (
          <form className="auth-form" onSubmit={handleCompanySubmit}>
            <div>
              <p className="overline">{companyMode === 'signup' ? 'Registrazione azienda' : 'Accesso azienda'}</p>
              <h2>{companyMode === 'signup' ? 'Crea account azienda' : 'Entra nel pannello'}</h2>
            </div>
            {companyMode === 'signup' && (
              <label>
                Nome trasportatore / Ragione sociale
                <span>
                  <Building2 size={17} />
                  <input
                    autoComplete="organization"
                    placeholder="Es. Spedifast SRL"
                    required
                    value={companyForm.companyName}
                    onChange={(event) => setCompanyForm({ ...companyForm, companyName: event.target.value })}
                  />
                </span>
              </label>
            )}
            <label>
              Email aziendale
              <span>
                <Mail size={17} />
                <input
                  autoComplete="email"
                  name="email"
                  placeholder="azienda@esempio.it"
                  required
                  value={companyForm.email}
                  onChange={(event) => setCompanyForm({ ...companyForm, email: event.target.value })}
                  type="email"
                />
              </span>
            </label>
            <label>
              Password
              <span>
                <LockKeyhole size={17} />
                <input
                  autoComplete={companyMode === 'signup' ? 'new-password' : 'current-password'}
                  name="password"
                  placeholder="Password"
                  required
                  value={companyForm.password}
                  onChange={(event) => setCompanyForm({ ...companyForm, password: event.target.value })}
                  type="password"
                />
              </span>
            </label>
            <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">
              <KeyRound size={17} />
              {companyMode === 'signup' ? 'Registrati' : 'Accedi'}
            </button>
            <button
              className="link-button"
              onClick={switchCompanyMode}
              type="button"
            >
              {companyMode === 'signup' ? 'Ho già un account azienda' : 'Devo creare l account azienda'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleDriverSubmit}>
            <div>
              <p className="overline">Accesso autista</p>
              <h2>Entra con nome utente</h2>
            </div>
            <label>
              Nome utente autista
              <span>
                <UserRound size={17} />
                <input
                  autoCapitalize="none"
                  autoComplete="username"
                  autoCorrect="off"
                  name="username"
                  placeholder="Es. mario.rossi"
                  required
                  spellCheck={false}
                  value={driverForm.username}
                  onChange={(event) => setDriverForm({ ...driverForm, username: event.target.value })}
                />
              </span>
            </label>
            <label>
              Password
              <span>
                <LockKeyhole size={17} />
                <input
                  autoComplete="current-password"
                  name="password"
                  placeholder="Password"
                  required
                  value={driverForm.password}
                  onChange={(event) => setDriverForm({ ...driverForm, password: event.target.value })}
                  type="password"
                />
              </span>
            </label>
            <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">
              <Smartphone size={17} />
              Entra come autista
            </button>
          </form>
        )}

        {status && <p className="auth-status">{status}</p>}
        {!isSupabaseConfigured && (
          <p className="auth-demo-note">
            Modalità demo: quando aggiungi le chiavi Supabase in `.env`, questi form useranno login reali.
          </p>
        )}
      </section>
    </main>
  )
}

function Sidebar({ activeView, notificationCount, onHome, onNavigate, onSignOut, session }) {
  const navItems = [
    { id: 'dashboard', label: 'Scadenze', icon: CalendarClock },
    { id: 'drivers', label: 'Autisti', icon: Users },
    { id: 'fleet', label: 'Flotta', icon: Truck },
    { id: 'documents', label: 'Documenti', icon: FileText },
    { id: 'notifications', label: 'Notifiche', icon: Bell },
    { id: 'settings', label: 'Impostazioni', icon: SettingsIcon },
  ]

  return (
    <aside className="sidebar" aria-label="Navigazione principale">
      <button className="brand brand-button" onClick={onHome} type="button">
        <div className="brand-mark">
          <Route size={22} strokeWidth={2.4} />
        </div>
        <div>
          <strong>Camion Chiaro</strong>
          <span>Area azienda</span>
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
            {item.id === 'notifications' && notificationCount > 0 && (
              <strong className="nav-badge">{notificationCount}</strong>
            )}
          </button>
        ))}
      </nav>

      <div className="sync-card">
        <RadioTower size={19} />
        <div>
          <strong>{isSupabaseConfigured ? 'Supabase collegato' : 'Demo locale'}</strong>
          <span>{session.email ?? 'Aggiungi le chiavi .env'}</span>
        </div>
      </div>

      <button className="logout-button" onClick={onSignOut} type="button">
        <LogOut size={17} />
        Esci
      </button>
    </aside>
  )
}

function Topbar({ query, setQuery }) {
  return (
    <header className="topbar">
      <div>
        <p className="overline">Area azienda</p>
        <h1>Dashboard azienda</h1>
      </div>
      <label className="search-box">
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Cerca scadenze</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca patente, targa, autista..."
        />
      </label>
    </header>
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
  return (
    <div className="company-logo-uploader">
      <EntityAvatar imageUrl={logoUrl} name={companyName} variant="company" />
      <div>
        <strong>Logo azienda</strong>
        <span>Appare accanto al nome nella dashboard.</span>
      </div>
      <ImageUploadControl label={logoUrl ? 'Cambia logo' : 'Carica logo'} onUpload={onUpload} />
    </div>
  )
}

function PhotoPreviewModal({ imageUrl, name, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="photo-preview-modal" role="dialog" aria-modal="true" aria-label={`Foto profilo ${name}`} onClick={(event) => event.stopPropagation()}>
        <div className="panel-header compact">
          <div>
            <p className="overline">Foto autista</p>
            <h2>{name}</h2>
          </div>
          <div className="photo-preview-actions">
            <a className="small-button" download href={imageUrl} rel="noreferrer" target="_blank">
              <Download size={15} />
              Apri/salva
            </a>
            <button className="small-button" onClick={onClose} type="button">
              Chiudi
            </button>
          </div>
        </div>
        <img alt={`Foto profilo ${name}`} src={imageUrl} />
      </div>
    </div>
  )
}

function SettingsWorkspace({ companyEmail, companyLogoUrl, companyProfile, onCompanyLogoUpload, onUpdateCompanyProfile, syncStatus }) {
  const [form, setForm] = useState({
    headquarters: companyProfile.headquarters ?? '',
    name: companyProfile.name ?? '',
    vatNumber: companyProfile.vatNumber ?? '',
  })
  const [isSaving, setIsSaving] = useState(false)

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
            <p className="overline">Profilo trasportatore</p>
            <h2>Impostazioni azienda</h2>
          </div>
          <SettingsIcon size={20} />
        </div>
        <CompanyLogoUploader companyName={form.name} logoUrl={companyLogoUrl} onUpload={onCompanyLogoUpload} />
        <div className="form-grid">
          <label className="wide-field">
            Ragione sociale
            <input
              autoComplete="organization"
              required
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
          </label>
          <label>
            Partita IVA
            <input value={form.vatNumber} onChange={(event) => updateField('vatNumber', event.target.value)} />
          </label>
          <label>
            Sede
            <input value={form.headquarters} onChange={(event) => updateField('headquarters', event.target.value)} />
          </label>
          <label className="wide-field">
            Email accesso
            <input disabled value={companyEmail ?? ''} />
          </label>
        </div>
        <button className="primary-button full-button" disabled={isSaving} type="submit">
          <Save size={17} />
          {isSaving ? 'Salvataggio...' : 'Salva modifiche'}
        </button>
        {syncStatus && <p className="sync-status-line">{syncStatus}</p>}
      </form>
      <aside className="panel settings-summary-panel">
        <div className="panel-header compact">
          <div>
            <p className="overline">Anteprima</p>
            <h2>Dati azienda</h2>
          </div>
          <Building2 size={20} />
        </div>
        <div className="settings-summary-list">
          <DetailLine label="Dashboard" value={form.name} />
          <DetailLine label="Partita IVA" value={form.vatNumber || 'Non inserita'} />
          <DetailLine label="Sede" value={form.headquarters || 'Non inserita'} />
          <DetailLine label="Email accesso" value={companyEmail || 'Non disponibile'} />
        </div>
      </aside>
    </section>
  )
}

function HeroPanel({
  activeDriverCount,
  activeVehicleCount,
  companyName,
  companyLogoUrl,
  criticalCheckCount,
  notificationCount,
  onNewDeadline,
  onOpenNotifications,
  openFaultCount,
  summary,
}) {
  const priorityCards = [
    {
      detail: 'check con anomalie da aprire',
      icon: AlertTriangle,
      isActive: criticalCheckCount > 0,
      label: 'Check critici',
      tone: 'danger',
      value: criticalCheckCount,
    },
    {
      detail: 'segnalazioni ancora aperte',
      icon: Wrench,
      isActive: openFaultCount > 0,
      label: 'Guasti aperti',
      tone: 'warning',
      value: openFaultCount,
    },
    {
      detail: `${summary.critical} critiche o scadute`,
      icon: CalendarClock,
      isActive: summary.critical > 0,
      label: 'Scadenze 30 giorni',
      tone: 'info',
      value: summary.next30,
    },
  ]

  return (
    <section className="hero-panel" aria-label="Controllo scadenze">
      <div className="hero-copy">
        <div className="company-title-row">
          <EntityAvatar imageUrl={companyLogoUrl} name={companyName} variant="company" />
          <h2>{companyName}</h2>
        </div>
        <p>
          Una schermata pulita per vedere subito scadenze, check mattutini e guasti da gestire.
        </p>
        <div className="hero-facts" aria-label="Dimensione azienda">
          <div>
            <strong>{activeDriverCount}</strong>
            <span>autisti attivi</span>
          </div>
          <div>
            <strong>{activeVehicleCount}</strong>
            <span>mezzi in flotta</span>
          </div>
          <div>
            <strong>{notificationCount}</strong>
            <span>notifiche aperte</span>
          </div>
        </div>
        <div className="hero-actions">
          <button className="primary-button" onClick={onNewDeadline} type="button">
            <Plus size={17} />
            Nuova scadenza
          </button>
          <button className="ghost-button" onClick={onOpenNotifications} type="button">
            <Bell size={17} />
            Apri campanella
          </button>
        </div>
      </div>
      <div className="priority-grid" aria-label="Priorita di oggi">
        {priorityCards.map((card) => (
          <article className={`priority-card tone-${card.tone}${card.isActive ? ' is-active' : ''}`} key={card.label}>
            <div>
              <span className="priority-icon">
                <card.icon size={20} />
              </span>
              <span>{card.label}</span>
            </div>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </article>
        ))}
      </div>
    </section>
  )
}

function CompanyOnboardingPanel({ onNewDeadline, onOpenDrivers, onOpenFleet }) {
  const steps = [
    {
      action: onOpenDrivers,
      button: 'Aggiungi autista',
      detail: 'Nome utente e accesso app',
      icon: UserPlus,
      label: 'Primo autista',
    },
    {
      action: onOpenFleet,
      button: 'Aggiungi mezzo',
      detail: 'Furgone, motrice, trattore o semirimorchio',
      icon: Truck,
      label: 'Primo mezzo',
    },
    {
      action: onNewDeadline,
      button: 'Prima scadenza',
      detail: 'Patente, revisione, assicurazione o visita',
      icon: CalendarClock,
      label: 'Prima scadenza',
    },
  ]

  return (
    <section className="panel setup-panel" aria-label="Primi passi azienda">
      <div className="panel-header compact">
        <div>
          <p className="overline">Azienda nuova</p>
          <h2>Primi passi</h2>
        </div>
        <BadgeCheck size={20} />
      </div>
      <div className="setup-list">
        {steps.map((step, index) => (
          <button className="setup-row" key={step.label} onClick={step.action} type="button">
            <span className="setup-index">{index + 1}</span>
            <step.icon size={19} />
            <span>
              <strong>{step.label}</strong>
              <small>{step.detail}</small>
            </span>
            <b>{step.button}</b>
          </button>
        ))}
      </div>
    </section>
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
    <section className="drivers-workspace" aria-label="Gestione autisti">
      <div className="drivers-main">
        <div className="panel drivers-panel">
          <div className="panel-header">
            <div>
              <p className="overline">Anagrafica</p>
              <h2>Autisti</h2>
            </div>
            <div className="drivers-count">
              <strong>{activeDrivers.length}</strong>
              <span>attivi</span>
            </div>
          </div>
          <div className="drivers-table">
            <div className="drivers-table-head">
              <span>Autista</span>
              <span>Username</span>
              <span>Mezzo</span>
              <span>Stato</span>
              <span>Azioni</span>
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
            <p className="archive-note">{archivedDrivers.length} autisti archiviati nascosti dall elenco operativo.</p>
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
          <option value="">Nessun mezzo</option>
          {vehicleRecords
            .filter((vehicle) => vehicle.fleetType !== 'semirimorchio')
            .map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} · {vehicle.type}
              </option>
            ))}
        </select>
        <select value={draft.status} onChange={(event) => onUpdateDraft('status', event.target.value)}>
          <option>Disponibile</option>
          <option>In servizio</option>
          <option>In viaggio</option>
          <option>Sospeso</option>
        </select>
        <div className="row-actions">
          <button className="small-button" disabled={saving} onClick={onSave} type="button">
            <Save size={15} />
            {saving ? 'Salvo...' : 'Salva'}
          </button>
          <button className="small-button" disabled={saving} onClick={onCancel} type="button">
            Annulla
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
        <ImageUploadControl label="Foto" onUpload={onPhotoUpload} />
      </div>
      <div>
        <strong>{username}</strong>
        <span>{driver.authEmail ?? buildDriverAuthEmail(username)}</span>
      </div>
      <div>
        <strong>{assignedVehicle?.plate ?? 'Non assegnato'}</strong>
        <span>{assignedVehicle ? `${assignedVehicle.model} · ${assignedVehicle.type}` : 'Da assegnare'}</span>
      </div>
      <span className="status-pill tone-info">{driver.status}</span>
      <div className="row-actions">
        <button className="small-button" disabled={saving} onClick={onEdit} type="button">
          <Pencil size={15} />
          Modifica
        </button>
        <button className="small-button danger-action" disabled={saving} onClick={onArchive} type="button">
          {saving ? 'Archivio...' : 'Archivia'}
        </button>
      </div>
    </article>
  )
}

function DriverCreatePanel({ onAddDriver, onBackHome, vehicleRecords }) {
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState(getDriverCreateDefaults)
  const [showValidation, setShowValidation] = useState(false)

  const authEmail = form.username ? buildDriverAuthEmail(form.username) : ''
  const missingRequiredFields = [
    form.name.trim() ? null : 'nome e cognome',
    form.username.trim() ? null : 'username app',
    form.phone.trim() ? null : 'telefono',
    form.password.trim() ? null : 'password temporanea',
    form.password.trim() && form.password.trim().length < 8 ? 'password di almeno 8 caratteri' : null,
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
          <p className="overline">Nuovo accesso</p>
          <h2>Crea autista</h2>
        </div>
        <div className="panel-header-actions">
          <button className="small-button" onClick={onBackHome} type="button">
            <ArrowLeft size={15} />
            Indietro
          </button>
          <UserPlus size={20} />
        </div>
      </div>
      <div className="form-grid single-column">
        <label>
          Nome e cognome
          <input required value={form.name} onChange={(event) => updateField('name', event.target.value)} />
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
          Telefono
          <input required value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
        </label>
        <label>
          Ruolo
          <input value={form.role} onChange={(event) => updateField('role', event.target.value)} />
        </label>
        <label>
          Deposito
          <input value={form.depot} onChange={(event) => updateField('depot', event.target.value)} />
        </label>
        <label>
          Mezzo assegnato
          <select value={form.vehicleId} onChange={(event) => updateField('vehicleId', event.target.value)}>
            <option value="">Nessun mezzo</option>
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
        <strong>Email tecnica Supabase</strong>
        <span>{authEmail || 'Compila username per generarla'}</span>
      </div>
      {showValidation && !canSubmit && <FormValidationAlert message={formatMissingFields(missingRequiredFields)} />}
      <button className="primary-button full-button" disabled={isSaving} type="submit">
        <UserPlus size={17} />
        {isSaving ? 'Creazione account...' : 'Crea account autista'}
      </button>
    </form>
  )
}

function FleetWorkspace({ driverRecords, onAddVehicle, onArchiveVehicle, onBackHome, onUpdateVehicle, syncStatus, vehicleRecords }) {
  const [editingId, setEditingId] = useState(null)
  const [draftById, setDraftById] = useState({})
  const [savingId, setSavingId] = useState(null)
  const activeVehicles = vehicleRecords.filter((vehicle) => vehicle.status !== 'Archiviato')
  const archivedVehicles = vehicleRecords.filter((vehicle) => vehicle.status === 'Archiviato')
  const fleetGroups = fleetTypeOptions.map((option) => ({
    ...option,
    count: activeVehicles.filter((vehicle) => vehicle.fleetType === option.value).length,
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
    <section className="fleet-workspace" aria-label="Gestione flotta">
      <div className="fleet-main">
        <div className="panel fleet-management-panel">
          <div className="panel-header">
            <div>
              <p className="overline">Parco mezzi</p>
              <h2>Flotta</h2>
            </div>
            <div className="drivers-count">
              <strong>{activeVehicles.length}</strong>
              <span>mezzi attivi</span>
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
            <p className="archive-note">{archivedVehicles.length} mezzi archiviati nascosti dall elenco operativo.</p>
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
  if (editing) {
    return (
      <article className="fleet-management-row is-editing">
        <div className="fleet-field-grid">
          <label>
            Targa
            <input value={draft.plate} onChange={(event) => onUpdateDraft('plate', event.target.value)} />
          </label>
          <label>
            Categoria
            <select value={draft.fleetType} onChange={(event) => onUpdateDraft('fleetType', event.target.value)}>
              {fleetTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Marca e modello
            <input value={draft.model} onChange={(event) => onUpdateDraft('model', event.target.value)} />
          </label>
          <label>
            Allestimento
            <input value={draft.type} onChange={(event) => onUpdateDraft('type', event.target.value)} />
          </label>
          <label>
            Km
            <input min="0" type="number" value={draft.km} onChange={(event) => onUpdateDraft('km', event.target.value)} />
          </label>
          <label>
            Stato
            <select value={draft.status} onChange={(event) => onUpdateDraft('status', event.target.value)}>
              {vehicleStatusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="row-actions">
          <button className="small-button" disabled={saving} onClick={onSave} type="button">
            <Save size={15} />
            {saving ? 'Salvo...' : 'Salva'}
          </button>
          <button className="small-button" disabled={saving} onClick={onCancel} type="button">
            Annulla
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="fleet-management-row">
      <div className="fleet-plate-block">
        <strong>{vehicle.plate}</strong>
        <span>{getFleetTypeLabel(vehicle.fleetType)}</span>
      </div>
      <div>
        <strong>{vehicle.model || 'Modello non inserito'}</strong>
        <span>{vehicle.type || 'Allestimento da completare'}</span>
      </div>
      <div>
        <strong>{vehicle.km.toLocaleString('it-IT')} km</strong>
        <span>{assignedDriver?.name ?? 'Non assegnato'}</span>
      </div>
      <span className="status-pill tone-info">{vehicle.status}</span>
      <div className="row-actions">
        <button className="small-button" disabled={saving} onClick={onEdit} type="button">
          <Pencil size={15} />
          Modifica
        </button>
        <button className="small-button danger-action" disabled={saving} onClick={onArchive} type="button">
          {saving ? 'Archivio...' : 'Archivia'}
        </button>
      </div>
    </article>
  )
}

function VehicleCreatePanel({ onAddVehicle, onBackHome }) {
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
    form.plate.trim() ? null : 'targa',
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
          <p className="overline">Nuovo mezzo</p>
          <h2>Aggiungi alla flotta</h2>
        </div>
        <div className="panel-header-actions">
          <button className="small-button" onClick={onBackHome} type="button">
            <ArrowLeft size={15} />
            Indietro
          </button>
          <Truck size={20} />
        </div>
      </div>
      <div className="form-grid single-column">
        <label>
          Targa
          <input required value={form.plate} onChange={(event) => updateField('plate', event.target.value)} />
        </label>
        <label>
          Categoria
          <select value={form.fleetType} onChange={(event) => updateField('fleetType', event.target.value)}>
            {fleetTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Marca e modello
          <input value={form.model} onChange={(event) => updateField('model', event.target.value)} />
        </label>
        <label>
          Allestimento
          <input value={form.type} onChange={(event) => updateField('type', event.target.value)} />
        </label>
        <label>
          Km
          <input min="0" type="number" value={form.km} onChange={(event) => updateField('km', event.target.value)} />
        </label>
        <label>
          Stato
          <select value={form.status} onChange={(event) => updateField('status', event.target.value)}>
            {vehicleStatusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
      {showValidation && !canSubmit && <FormValidationAlert message={formatMissingFields(missingRequiredFields)} />}
      <button className="primary-button full-button" disabled={isSaving} type="submit">
        <Plus size={17} />
        {isSaving ? 'Salvataggio...' : 'Aggiungi mezzo'}
      </button>
    </form>
  )
}

function DocumentsWorkspace({
  documentRecords,
  driverRecords,
  onAddDocument,
  onRemoveDocument,
  onUpdateDocument,
  syncStatus,
}) {
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
    <section className="documents-workspace" aria-label="Gestione documenti autista">
      <div className="documents-main">
        <div className="panel documents-management-panel">
          <div className="panel-header">
            <div>
              <p className="overline">Archivio autisti</p>
              <h2>Documenti</h2>
            </div>
            <div className="drivers-count">
              <strong>{documentRecords.length}</strong>
              <span>documenti</span>
            </div>
          </div>
          <div className="documents-summary-grid">
            <div>
              <strong>{visibleDocuments.length}</strong>
              <span>visibili in app</span>
            </div>
            <div>
              <strong>{expiringDocuments.length}</strong>
              <span>entro 30 giorni</span>
            </div>
            <div>
              <strong>{documentRecords.filter((document) => document.filePath).length}</strong>
              <span>con file/link</span>
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
                onEdit={() => startEditing(document)}
                onRemove={() => removeDocument(document.id)}
                onSave={() => saveDraft(document.id)}
                onUpdateDraft={(field, value) => updateDraft(document.id, field, value)}
                saving={savingId === document.id}
              />
            ))}
          </div>
          {documentRecords.length === 0 && <p className="archive-note">Nessun documento inserito.</p>}
          {syncStatus && <p className="sync-status-line">{syncStatus}</p>}
        </div>
      </div>
      <DocumentCreatePanel driverRecords={driverRecords} onAddDocument={onAddDocument} />
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
  onEdit,
  onRemove,
  onSave,
  onUpdateDraft,
  saving,
}) {
  if (editing) {
    return (
      <article className="document-management-row is-editing">
        <div className="document-field-grid">
          <label>
            Autista
            <select value={draft.driverId} onChange={(event) => onUpdateDraft('driverId', event.target.value)}>
              {driverRecords.map((driverRecord) => (
                <option key={driverRecord.id} value={driverRecord.id}>
                  {driverRecord.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Documento
            <select value={draft.type} onChange={(event) => onUpdateDraft('type', event.target.value)}>
              {documentTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            Numero
            <input value={draft.documentNumber} onChange={(event) => onUpdateDraft('documentNumber', event.target.value)} />
          </label>
          <label>
            Scadenza
            <input
              value={draft.expiresAt}
              onChange={(event) => onUpdateDraft('expiresAt', event.target.value)}
              onInput={(event) => onUpdateDraft('expiresAt', event.target.value)}
              type="date"
            />
          </label>
          <label>
            Stato
            <select value={draft.status} onChange={(event) => onUpdateDraft('status', event.target.value)}>
              {driverDocumentStatusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            File o link
            <input value={draft.filePath} onChange={(event) => onUpdateDraft('filePath', event.target.value)} />
          </label>
          <label className="checkbox-field">
            <input
              checked={draft.visibleToDriver}
              onChange={(event) => onUpdateDraft('visibleToDriver', event.target.checked)}
              type="checkbox"
            />
            Visibile all autista
          </label>
        </div>
        <div className="row-actions">
          <button className="small-button" disabled={saving} onClick={onSave} type="button">
            <Save size={15} />
            {saving ? 'Salvo...' : 'Salva'}
          </button>
          <button className="small-button" disabled={saving} onClick={onCancel} type="button">
            Annulla
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="document-management-row">
      <div>
        <strong>{document.type}</strong>
        <span>{driver?.name ?? 'Autista non assegnato'}</span>
      </div>
      <div>
        <strong>{document.documentNumber || 'Numero non inserito'}</strong>
        <span>{document.filePath ? 'File/link presente' : 'File da caricare'}</span>
      </div>
      <div>
        <strong>{formatOptionalDate(document.expiresAt)}</strong>
        <span>{document.visibleToDriver ? 'Visibile in app' : 'Solo azienda'}</span>
      </div>
      <span className="status-pill tone-info">{document.status}</span>
      <div className="row-actions">
        <button className="small-button" disabled={saving} onClick={onEdit} type="button">
          <Pencil size={15} />
          Modifica
        </button>
        <button className="small-button danger-action" disabled={saving} onClick={onRemove} type="button">
          {saving ? 'Rimuovo...' : 'Rimuovi'}
        </button>
      </div>
    </article>
  )
}

function DocumentCreatePanel({ driverRecords, onAddDocument }) {
  const [isSaving, setIsSaving] = useState(false)
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

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selectedDriverId || !form.type) return

    setIsSaving(true)
    const added = await onAddDocument({
      id: `doc-${Date.now()}`,
      documentNumber: form.documentNumber,
      driverId: selectedDriverId,
      expiresAt: form.expiresAt,
      filePath: form.filePath,
      status: form.status,
      type: form.type,
      visibleToDriver: form.visibleToDriver,
    })
    setIsSaving(false)

    if (!added) return

    setForm({
      documentNumber: '',
      driverId: driverRecords[0]?.id ?? '',
      expiresAt: '',
      filePath: '',
      status: 'Caricato',
      type: 'Patente C+E',
      visibleToDriver: true,
    })
  }

  return (
    <form className="panel document-create-panel" onSubmit={handleSubmit}>
      <div className="panel-header compact">
        <div>
          <p className="overline">Nuovo documento</p>
          <h2>Aggiungi documento</h2>
        </div>
        <FileText size={20} />
      </div>
      <div className="form-grid single-column">
        <label>
          Autista
          <select value={selectedDriverId} onChange={(event) => updateField('driverId', event.target.value)}>
            {driverRecords.length === 0 && <option value="">Nessun autista disponibile</option>}
            {driverRecords.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Documento
          <select value={form.type} onChange={(event) => updateField('type', event.target.value)}>
            {documentTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          Numero documento
          <input value={form.documentNumber} onChange={(event) => updateField('documentNumber', event.target.value)} />
        </label>
        <label>
          Scadenza
          <input
            value={form.expiresAt}
            onChange={(event) => updateField('expiresAt', event.target.value)}
            onInput={(event) => updateField('expiresAt', event.target.value)}
            type="date"
          />
        </label>
        <label>
          Stato
          <select value={form.status} onChange={(event) => updateField('status', event.target.value)}>
            {driverDocumentStatusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>
          File o link documento
          <input
            value={form.filePath}
            onChange={(event) => updateField('filePath', event.target.value)}
            placeholder="Nome file o link"
          />
        </label>
        <label className="checkbox-field">
          <input
            checked={form.visibleToDriver}
            onChange={(event) => updateField('visibleToDriver', event.target.checked)}
            type="checkbox"
          />
          Visibile all autista
        </label>
      </div>
      <button className="primary-button full-button" disabled={isSaving || !selectedDriverId} type="submit">
        <Plus size={17} />
        {isSaving ? 'Salvataggio...' : 'Aggiungi documento'}
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
  onUpdateFaultStatus,
  syncStatus,
  vehicleCheckRecords,
  vehicleRecords,
}) {
  const [filter, setFilter] = useState('inbox')
  const [selectedOperationKey, setSelectedOperationKey] = useState('')
  const isCriticalFault = (report) => ['high', 'stop_vehicle'].includes(report.severity) && report.status !== 'closed'
  const newFaults = faultReportRecords.filter((report) => report.status === 'open')
  const workFaults = faultReportRecords.filter((report) => ['seen', 'in_progress'].includes(report.status))
  const archivedFaults = faultReportRecords.filter((report) => report.status === 'closed')
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
          (operation.kind === 'fault' && operation.data.status === 'open') ||
          (operation.kind === 'check' && !acknowledgedCheckIds.includes(operation.id))
        )
      }
      if (filter === 'critical') {
        return (
          (operation.kind === 'fault' && isCriticalFault(operation.data)) ||
          (operation.kind === 'check' && !acknowledgedCheckIds.includes(operation.id) && hasCheckIssues(operation.data))
        )
      }
      if (filter === 'work') return operation.kind === 'fault' && ['seen', 'in_progress'].includes(operation.data.status)
      if (filter === 'archive') {
        return (
          (operation.kind === 'fault' && operation.data.status === 'closed') ||
          (operation.kind === 'check' && acknowledgedCheckIds.includes(operation.id))
        )
      }
      if (filter === 'faults') return operation.kind === 'fault' && operation.data.status !== 'closed'
      if (filter === 'checks') return operation.kind === 'check' && !acknowledgedCheckIds.includes(operation.id)
      return false
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const selectedOperation = allOperations.find((operation) => `${operation.kind}-${operation.id}` === selectedOperationKey)
  const fallbackSelection = operations[0]
  const detailOperation = selectedOperation ?? fallbackSelection

  async function openOperation(operation) {
    setSelectedOperationKey(`${operation.kind}-${operation.id}`)

    if (operation.kind === 'fault' && operation.data.status === 'open') {
      await onUpdateFaultStatus(operation.id, 'seen')
    }

    if (operation.kind === 'check') {
      onAcknowledgeCheck(operation.id)
    }
  }

  function changeFilter(nextFilter) {
    setFilter(nextFilter)
    setSelectedOperationKey('')
  }

  return (
    <section className="operations-workspace" aria-label="Notifiche operative">
      <div className="panel operations-panel">
        <div className="panel-header">
          <div>
            <p className="overline">Campanella</p>
            <h2>Notifiche operative</h2>
          </div>
          <Bell size={22} />
        </div>
        <div className="operations-summary-grid">
          <div>
            <strong>{newFaults.length + unreadChecks.length}</strong>
            <span>da aprire</span>
          </div>
          <div>
            <strong>{criticalFaults.length + criticalChecks.length}</strong>
            <span>critiche</span>
          </div>
          <div>
            <strong>{workFaults.length}</strong>
            <span>in lavorazione</span>
          </div>
          <div>
            <strong>{archivedFaults.length + archivedChecks.length}</strong>
            <span>archiviati</span>
          </div>
        </div>
        <div className="filter-tabs operations-filters" role="tablist" aria-label="Filtra notifiche">
          <button className={filter === 'inbox' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('inbox')} type="button">
            Da aprire ({newFaults.length + unreadChecks.length})
          </button>
          <button className={filter === 'critical' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('critical')} type="button">
            Critiche ({criticalFaults.length + criticalChecks.length})
          </button>
          <button className={filter === 'work' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('work')} type="button">
            In lavorazione ({workFaults.length})
          </button>
          <button className={filter === 'checks' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('checks')} type="button">
            Check ({unreadChecks.length})
          </button>
          <button className={filter === 'faults' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('faults')} type="button">
            Guasti ({faultReportRecords.length - archivedFaults.length})
          </button>
          <button className={filter === 'archive' ? 'filter-tab is-active' : 'filter-tab'} onClick={() => changeFilter('archive')} type="button">
            Archivio ({archivedFaults.length + archivedChecks.length})
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
                onOpen={() => openOperation(operation)}
                read={acknowledgedCheckIds.includes(operation.id)}
                selected={detailOperation?.kind === 'check' && detailOperation.id === operation.id}
                trailer={vehicleRecords.find((vehicle) => vehicle.id === operation.data.semitrailerId)}
                vehicle={vehicleRecords.find((vehicle) => vehicle.id === operation.data.tractorId)}
              />
            ),
          )}
          {operations.length === 0 && <p className="archive-note">Nessuna notifica in questa vista.</p>}
        </div>
        {syncStatus && <p className="sync-status-line">{syncStatus}</p>}
      </div>
      <OperationDetailPanel
        acknowledgedCheckIds={acknowledgedCheckIds}
        assetPreviewUrl={assetPreviewUrl}
        driverRecords={driverRecords}
        operation={detailOperation}
        onAcknowledgeCheck={onAcknowledgeCheck}
        onUpdateFaultStatus={onUpdateFaultStatus}
        vehicleRecords={vehicleRecords}
      />
    </section>
  )
}

function FaultOperationRow({ driver, onOpen, onUpdateStatus, report, selected, trailer, vehicle }) {
  const isClosed = report.status === 'closed'
  const isSeen = report.status !== 'open'
  const isWorking = report.status === 'in_progress'
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
          <span className="status-pill tone-warning">{getFaultStatusLabel(report.status)}</span>
        </div>
        <p>{driver?.name ?? 'Autista'} · {vehicle?.plate ?? 'Mezzo non trovato'}</p>
        <small>
          {getFaultSeverityLabel(report.severity)} · {formatShortDateTime(report.createdAt)}
          {trailer ? ` · semirimorchio ${trailer.plate}` : ''}
          {report.photoPath ? ' · foto allegata' : ''}
        </small>
        {report.description && <em>{report.description}</em>}
      </div>
      <div className="operation-actions">
        <button className="small-button" onClick={onOpen} type="button">
          Apri
        </button>
        <button disabled={isSeen} className="small-button" onClick={() => onUpdateStatus(report.id, 'seen')} type="button">
          {isSeen ? 'Gia visto' : 'Visto'}
        </button>
        <button disabled={isClosed || isWorking} className="small-button" onClick={() => onUpdateStatus(report.id, 'in_progress')} type="button">
          {isWorking ? 'In corso' : 'Lavora'}
        </button>
        <button disabled={isClosed} className="small-button danger-action" onClick={() => onUpdateStatus(report.id, 'closed')} type="button">
          {isClosed ? 'Archiviato' : 'Archivia'}
        </button>
      </div>
    </article>
  )
}

function CheckOperationRow({ check, driver, onMarkRead, onOpen, read, selected, trailer, vehicle }) {
  const issueText = getCheckIssues(check)
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
          <strong>Check mattutino</strong>
          <span className={isCritical ? 'status-pill tone-danger' : 'status-pill tone-success'}>
            {read ? 'Letto' : isCritical ? 'Critico' : 'Da aprire'}
          </span>
        </div>
        <p>{driver?.name ?? 'Autista'} · {vehicle?.plate ?? 'Mezzo non trovato'}</p>
        <small>
          {formatShortDateTime(check.createdAt)}
          {check.odometerKm ? ` · ${check.odometerKm.toLocaleString('it-IT')} km` : ''}
          {trailer ? ` · semirimorchio ${trailer.plate}` : ''}
        </small>
        {(issueText.length > 0 || check.notes) && <em>{[...issueText, check.notes].filter(Boolean).join(' · ')}</em>}
      </div>
      <div className="operation-actions">
        <button className="small-button" onClick={onOpen} type="button">
          Apri
        </button>
        <button
          aria-label={read ? 'Check gia visto' : 'Segna check come visto'}
          className="small-button"
          disabled={read}
          onClick={onMarkRead}
          type="button"
        >
          {read ? 'Gia visto' : 'Visto'}
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
  onUpdateFaultStatus,
  vehicleRecords,
}) {
  if (!operation) {
    return (
      <aside className="panel operation-detail-panel">
        <div className="panel-header compact">
          <div>
            <p className="overline">Dettaglio</p>
            <h2>Apri una notifica</h2>
          </div>
          <Bell size={20} />
        </div>
        <p className="operation-detail-empty">Seleziona un guasto o un check per vedere tutti i dettagli.</p>
      </aside>
    )
  }

  if (operation.kind === 'fault') {
    const report = operation.data
    const driver = driverRecords.find((entry) => entry.id === report.driverId)
    const vehicle = vehicleRecords.find((entry) => entry.id === report.vehicleId)
    const trailer = vehicleRecords.find((entry) => entry.id === report.semitrailerId)
    const isClosed = report.status === 'closed'
    const isSeen = report.status !== 'open'
    const isWorking = report.status === 'in_progress'
    const faultPhotoUrl = assetPreviewUrl(report.photoPath)

    return (
      <aside className="panel operation-detail-panel">
        <div className="panel-header compact">
          <div>
            <p className="overline">Guasto</p>
            <h2>{report.title}</h2>
          </div>
          <Wrench size={20} />
        </div>
        <div className="operation-detail-body">
          <DetailLine label="Stato" value={getFaultStatusLabel(report.status)} />
          <DetailLine label="Gravità" value={getFaultSeverityLabel(report.severity)} />
          <DetailLine label="Autista" value={driver?.name ?? 'Autista non trovato'} />
          <DetailLine label="Mezzo" value={vehicle ? `${vehicle.plate} · ${vehicle.model}` : 'Mezzo non trovato'} />
          {trailer && <DetailLine label="Semirimorchio" value={`${trailer.plate} · ${trailer.model}`} />}
          <DetailLine label="Creato" value={formatShortDateTime(report.createdAt)} />
          <DetailLine label="Aggiornato" value={formatShortDateTime(report.updatedAt)} />
          {report.description && (
            <div className="detail-note">
              <strong>Descrizione</strong>
              <p>{report.description}</p>
            </div>
          )}
          {faultPhotoUrl && (
            <div className="fault-photo-preview">
              <strong>Foto guasto</strong>
              <a href={faultPhotoUrl} rel="noreferrer" target="_blank">
                <img alt={`Foto guasto ${report.title}`} src={faultPhotoUrl} />
              </a>
            </div>
          )}
        </div>
        <div className="operation-detail-actions">
          <button disabled={isSeen} className="small-button" onClick={() => onUpdateFaultStatus(report.id, 'seen')} type="button">
            {isSeen ? 'Gia visto' : 'Visto'}
          </button>
          <button disabled={isClosed || isWorking} className="small-button" onClick={() => onUpdateFaultStatus(report.id, 'in_progress')} type="button">
            {isWorking ? 'In corso' : 'In lavorazione'}
          </button>
          <button disabled={isClosed} className="small-button danger-action" onClick={() => onUpdateFaultStatus(report.id, 'closed')} type="button">
            {isClosed ? 'Archiviato' : 'Archivia'}
          </button>
        </div>
      </aside>
    )
  }

  const check = operation.data
  const driver = driverRecords.find((entry) => entry.id === check.driverId)
  const vehicle = vehicleRecords.find((entry) => entry.id === check.tractorId)
  const trailer = vehicleRecords.find((entry) => entry.id === check.semitrailerId)
  const issueText = getCheckIssues(check)
  const isRead = acknowledgedCheckIds.includes(check.id)

  return (
    <aside className="panel operation-detail-panel">
      <div className="panel-header compact">
        <div>
          <p className="overline">Check</p>
          <h2>Check mattutino</h2>
        </div>
        <ClipboardCheck size={20} />
      </div>
      <div className="operation-detail-body">
        <DetailLine label="Stato" value={isRead ? 'Visto e archiviato' : issueText.length > 0 ? 'Critico da aprire' : 'Da aprire'} />
        <DetailLine label="Autista" value={driver?.name ?? 'Autista non trovato'} />
        <DetailLine label="Mezzo" value={vehicle ? `${vehicle.plate} · ${vehicle.model}` : 'Mezzo non trovato'} />
        {trailer && <DetailLine label="Semirimorchio" value={`${trailer.plate} · ${trailer.model}`} />}
        <DetailLine label="Ora" value={formatShortDateTime(check.createdAt)} />
        {check.odometerKm && <DetailLine label="Km" value={`${check.odometerKm.toLocaleString('it-IT')} km`} />}
        <DetailLine label="Luci" value={check.lightsOk ? 'Ok' : 'Da controllare'} />
        <DetailLine label="Gomme" value={check.tiresOk ? 'Ok' : 'Da controllare'} />
        <DetailLine label="Documenti bordo" value={check.documentsOnBoard ? 'Presenti' : 'Mancanti'} />
        {issueText.length > 0 && (
          <div className="detail-note is-critical">
            <strong>Anomalie check</strong>
            <p>{issueText.join(' · ')}</p>
          </div>
        )}
        {check.notes && (
          <div className="detail-note">
            <strong>Note</strong>
            <p>{check.notes}</p>
          </div>
        )}
      </div>
      <div className="operation-detail-actions">
        <button disabled={isRead} className="small-button" onClick={() => onAcknowledgeCheck(check.id)} type="button">
          {isRead ? 'Gia visto' : 'Visto'}
        </button>
      </div>
    </aside>
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

function ComplianceBoard({ activeFilter, filteredItems, onClose, onFilter, onReminder, onRenew }) {
  return (
    <section className="panel compliance-panel">
      <div className="panel-header">
        <div>
          <p className="overline">Agenda operativa</p>
          <h2>Scadenze documentali</h2>
        </div>
        <button className="icon-button" type="button" aria-label="Filtri avanzati">
          <Filter size={18} />
        </button>
      </div>

      <div className="filter-tabs" role="tablist" aria-label="Filtra scadenze">
        {filters.map((filter) => (
          <button
            className={activeFilter === filter.id ? 'filter-tab is-active' : 'filter-tab'}
            key={filter.id}
            onClick={() => onFilter(filter.id)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="deadline-list">
        {filteredItems.map((item) => (
          <DeadlineRow
            item={item}
            key={item.id}
            onClose={() => onClose(item.id)}
            onReminder={() => onReminder(item.id)}
            onRenew={() => onRenew(item.id)}
          />
        ))}
        {filteredItems.length === 0 && (
          <div className="empty-state-row">
            <CalendarClock size={20} />
            <div>
              <strong>Nessuna scadenza inserita</strong>
              <span>Le prossime scadenze compariranno qui.</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function DeadlineRow({ item, onClose, onReminder, onRenew }) {
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
          <span className={`status-pill tone-${item.urgency.tone}`}>{item.urgency.label}</span>
        </div>
        <p>{item.assignee}</p>
        <small>{item.detail}</small>
      </div>
      <div className="deadline-meta">
        <strong>{formatDate(item.dueDate)}</strong>
        <span>
          {item.urgency.days < 0
            ? `${Math.abs(item.urgency.days)} giorni fa`
            : `${item.urgency.days} giorni`}
        </span>
      </div>
      <div className="deadline-actions">
        <button className="small-button" onClick={onReminder} type="button">
          <Send size={15} />
          In app
        </button>
        <button className="small-button" onClick={isRenewing ? onClose : onRenew} type="button">
          {isRenewing ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
          {isRenewing ? 'Chiudi' : 'Rinnovo'}
        </button>
      </div>
    </article>
  )
}

function FleetAndForms({ driverRecords, onAdd, onBackHome, vehicleRecords }) {
  return (
    <section className="lower-grid" aria-label="Gestione flotta e inserimento">
      <FleetStatus driverRecords={driverRecords} vehicleRecords={vehicleRecords} />
      <AddDeadlineForm driverRecords={driverRecords} onAdd={onAdd} onBackHome={onBackHome} vehicleRecords={vehicleRecords} />
    </section>
  )
}

function FleetStatus({ driverRecords, vehicleRecords }) {
  const activeVehicleRecords = vehicleRecords.filter((vehicle) => vehicle.status !== 'Archiviato')
  const fleetGroups = [
    { label: 'Furgoni', value: activeVehicleRecords.filter((vehicle) => vehicle.fleetType === 'furgone').length },
    { label: 'Motrici', value: activeVehicleRecords.filter((vehicle) => vehicle.fleetType === 'motrice').length },
    { label: 'Trattori', value: activeVehicleRecords.filter((vehicle) => vehicle.fleetType === 'trattore').length },
    { label: 'Semirimorchi', value: activeVehicleRecords.filter((vehicle) => vehicle.fleetType === 'semirimorchio').length },
  ]

  return (
    <article className="panel fleet-panel">
      <div className="panel-header compact">
        <div>
          <p className="overline">Flotta</p>
          <h2>Mezzi assegnati</h2>
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
                <small>{assignedDriver?.name ?? 'Non assegnato'}</small>
                <small>{vehicle.km.toLocaleString('it-IT')} km</small>
              </div>
            </div>
          )
        })}
        {activeVehicleRecords.length === 0 && (
          <div className="empty-state-row">
            <Truck size={20} />
            <div>
              <strong>Nessun mezzo in flotta</strong>
              <span>Furgoni, motrici, trattori e semirimorchi compariranno qui.</span>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

function AddDeadlineForm({ driverRecords, onAdd, onBackHome, vehicleRecords }) {
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
    hasAssigneeChoices ? null : form.scope === 'driver' ? 'almeno un autista' : 'almeno un mezzo',
    form.assigneeId ? null : form.scope === 'driver' ? 'autista' : 'mezzo',
    form.dueDate ? null : 'data scadenza',
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
          <p className="overline">Inserimento rapido</p>
          <h2>Nuova scadenza</h2>
        </div>
        <div className="panel-header-actions">
          <button className="small-button" onClick={onBackHome} type="button">
            <ArrowLeft size={15} />
            Indietro
          </button>
          <Plus size={20} />
        </div>
      </div>
      <div className="form-grid">
        <label>
          Tipo
          <select value={form.type} onChange={(event) => updateField('type', event.target.value)}>
            {documentTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          Ambito
          <select value={form.scope} onChange={(event) => updateField('scope', event.target.value)}>
            <option value="driver">Autista</option>
            <option value="vehicle">Mezzo</option>
          </select>
        </label>
        <label>
          Soggetto
          <select disabled={assignees.length === 0} value={form.assigneeId} onChange={(event) => updateField('assigneeId', event.target.value)}>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {'name' in assignee ? assignee.name : assignee.plate}
              </option>
            ))}
          </select>
        </label>
        <label>
          Scadenza
          <input value={form.dueDate} onChange={(event) => updateField('dueDate', event.target.value)} type="date" />
        </label>
        <label className="wide-field">
          Responsabile
          <input value={form.owner} onChange={(event) => updateField('owner', event.target.value)} />
        </label>
      </div>
      {!hasAssigneeChoices && <p className="form-hint">Aggiungi prima almeno un autista o un mezzo.</p>}
      {showValidation && !canSubmit && <FormValidationAlert message={formatMissingFields(missingRequiredFields)} />}
      <button className="primary-button full-button" type="submit">
        <Plus size={17} />
        Aggiungi
      </button>
    </form>
  )
}

function DriverAppView({
  assetPreviewUrl,
  companyLogoUrl,
  companyName,
  documentUploadStatus,
  documentRecords,
  driverRecords,
  faultReportRecords,
  faultReported,
  items,
  morningCheckSent,
  onDriverDocumentUpload,
  onDriverProfileImageRemove,
  onDriverProfileImageUpload,
  onFaultReport,
  onMorningCheck,
  onOpenDriverDocument,
  onSignOut,
  onUpload,
  operationsStatus,
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
            <span>Area autista</span>
          </div>
        </div>
        <button className="logout-button" onClick={onSignOut} type="button">
          <LogOut size={17} />
          Esci
        </button>
      </header>
      <div className="driver-page-content">
        <DriverMobile
          assetPreviewUrl={assetPreviewUrl}
          companyLogoUrl={companyLogoUrl}
          companyName={companyName}
          documentUploadStatus={documentUploadStatus}
          documentRecords={documentRecords}
          driverRecords={driverRecords}
          faultReportRecords={faultReportRecords}
          faultReported={faultReported}
          items={items}
          morningCheckSent={morningCheckSent}
          onDriverDocumentUpload={onDriverDocumentUpload}
          onDriverProfileImageRemove={onDriverProfileImageRemove}
          onDriverProfileImageUpload={onDriverProfileImageUpload}
          onFaultReport={onFaultReport}
          onMorningCheck={onMorningCheck}
          onOpenDriverDocument={onOpenDriverDocument}
          operationsStatus={operationsStatus}
          uploadSent={uploadSent}
          onUpload={onUpload}
          uploadingDocumentId={uploadingDocumentId}
          vehicleCheckRecords={vehicleCheckRecords}
          vehicleRecords={vehicleRecords}
        />
        <section className="panel driver-note-panel">
          <p className="overline">Notifiche</p>
          <h1>Qui arrivano gli avvisi in app</h1>
          <p>
            Quando Supabase sarà collegato, questa vista leggerà solo le scadenze dell autista loggato e
            mostrerà avvisi personali, documenti caricati, check mattutini e segnalazioni guasto.
          </p>
        </section>
      </div>
    </main>
  )
}

function DriverMobile({
  assetPreviewUrl = () => '',
  companyLogoUrl = '',
  companyName = 'Azienda',
  documentUploadStatus,
  documentRecords = driverDocuments,
  driverRecords = drivers,
  faultReportRecords = [],
  faultReported,
  items = [],
  morningCheckSent,
  onDriverDocumentUpload,
  onDriverProfileImageRemove,
  onDriverProfileImageUpload,
  onFaultReport,
  onMorningCheck,
  onOpenDriverDocument,
  onUpload,
  operationsStatus,
  showDriverSelector = false,
  uploadSent,
  uploadingDocumentId,
  vehicleCheckRecords = [],
  vehicleRecords = vehicles,
}) {
  const [selectedPreviewDriverId, setSelectedPreviewDriverId] = useState('')
  const previewDriver =
    driverRecords.find((entry) => entry.id === selectedPreviewDriverId) ??
    driverRecords[0] ??
    drivers[0]
  const driver = showDriverSelector ? previewDriver : driverRecords[0] ?? drivers[0]
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
  const [sendingOperation, setSendingOperation] = useState('')
  const selectedVehicle = driveableVehicles.find((entry) => entry.id === selectedVehicleId) ?? assignedVehicle ?? driveableVehicles[0] ?? null
  const attachedTrailer = semitrailers.find((entry) => entry.id === attachedTrailerId) ?? null
  const driverItems = items.filter(
    (item) => item.driverId === driver.id || (selectedVehicle && item.vehicleId === selectedVehicle.id),
  )
  const nextItem = driverItems[0]
  const docs = documentRecords.filter((document) => document.driverId === driver.id && document.visibleToDriver)
  const lastCheck = vehicleCheckRecords.find((check) => check.driverId === driver.id)
  const openFaults = faultReportRecords.filter(
    (report) => report.driverId === driver.id && report.status !== 'closed',
  )
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false)
  const vehicleLabel = selectedVehicle
    ? `${selectedVehicle.plate} · ${getFleetTypeLabel(selectedVehicle.fleetType)}`
    : 'Nessun mezzo disponibile'
  const driverImageUrl = assetPreviewUrl(driver.profileImagePath)

  function handleDocumentFile(document, event) {
    const file = event.target.files?.[0]
    onDriverDocumentUpload?.(document, file)
    event.target.value = ''
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
            <span>Azienda</span>
            <strong>{companyName}</strong>
          </div>
        </div>
        {showDriverSelector && (
          <label className="driver-preview-selector">
            Autista in anteprima
            <select
              value={driver.id}
              onChange={(event) => setSelectedPreviewDriverId(event.target.value)}
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
            <p>Buongiorno</p>
            <strong>{driver.name}</strong>
            <div className="driver-photo-actions">
              <ImageUploadControl label={driverImageUrl ? 'Cambia' : 'Carica foto'} onUpload={(file) => onDriverProfileImageUpload?.(driver.id, file)} />
              {driverImageUrl && (
                <button className="small-button" onClick={() => onDriverProfileImageRemove?.(driver.id)} type="button">
                  Elimina
                </button>
              )}
            </div>
          </div>
          <Smartphone size={24} />
        </div>
        {photoPreviewOpen && driverImageUrl && (
          <PhotoPreviewModal imageUrl={driverImageUrl} name={driver.name} onClose={() => setPhotoPreviewOpen(false)} />
        )}
        {nextItem && (
          <article className="next-card">
            <span className={`status-pill tone-${nextItem.urgency.tone}`}>{nextItem.urgency.label}</span>
            <h3>{nextItem.type}</h3>
            <p>{formatDate(nextItem.dueDate)}</p>
            <button className="upload-button" onClick={onUpload} type="button">
              <Upload size={16} />
              {uploadSent ? 'Documento caricato' : 'Carica documento'}
            </button>
          </article>
        )}
        <article className="check-card">
          <div>
            <strong>Check mattutino</strong>
            <span>{vehicleLabel}</span>
          </div>
          <form className="check-form" onSubmit={handleCheckSubmit}>
            <label>
              Mezzo usato
              <select value={selectedVehicle?.id ?? ''} onChange={(event) => setSelectedVehicleId(event.target.value)}>
                {driveableVehicles.length === 0 && <option value="">Nessun mezzo</option>}
                {driveableVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} · {getFleetTypeLabel(vehicle.fleetType)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Semirimorchio agganciato
              <select value={attachedTrailer?.id ?? ''} onChange={(event) => setAttachedTrailerId(event.target.value)}>
                <option value="">Nessuno</option>
                {semitrailers.map((trailer) => (
                  <option key={trailer.id} value={trailer.id}>
                    {trailer.plate} · {trailer.model}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Km attuali
              <input
                min="0"
                onChange={(event) => updateCheckField('odometerKm', event.target.value)}
                placeholder={selectedVehicle?.km ? String(selectedVehicle.km) : '0'}
                type="number"
                value={checkForm.odometerKm}
              />
            </label>
            <div className="inline-checks" aria-label="Controlli rapidi">
              <label className="check-toggle">
                <input
                  checked={checkForm.lightsOk}
                  onChange={(event) => updateCheckField('lightsOk', event.target.checked)}
                  type="checkbox"
                />
                Luci ok
              </label>
              <label className="check-toggle">
                <input
                  checked={checkForm.tiresOk}
                  onChange={(event) => updateCheckField('tiresOk', event.target.checked)}
                  type="checkbox"
                />
                Gomme ok
              </label>
              <label className="check-toggle">
                <input
                  checked={checkForm.documentsOnBoard}
                  onChange={(event) => updateCheckField('documentsOnBoard', event.target.checked)}
                  type="checkbox"
                />
                Documenti bordo
              </label>
            </div>
            <label>
              Note check
              <textarea
                onChange={(event) => updateCheckField('notes', event.target.value)}
                placeholder="Es. pressione gomme controllata"
                value={checkForm.notes}
              />
            </label>
            <button className="upload-button" disabled={!selectedVehicle || sendingOperation === 'check'} type="submit">
              <BadgeCheck size={16} />
              {sendingOperation === 'check' ? 'Invio...' : morningCheckSent ? 'Check inviato' : 'Invia check'}
            </button>
          </form>
          {!selectedVehicle && (
            <small className="operation-status">
              Nessun mezzo selezionabile. L azienda deve aggiungere almeno un furgone, motrice o trattore in Flotta.
            </small>
          )}
          {lastCheck && <small>Ultimo check: {formatShortDateTime(lastCheck.createdAt)}</small>}
        </article>
        <article className="check-card">
          <div>
            <strong>Segnala guasto</strong>
            <span>
              {vehicleLabel}
              {attachedTrailer ? ` · agganciato ${attachedTrailer.plate}` : ''}
            </span>
          </div>
          <form className="check-form" onSubmit={handleFaultSubmit}>
            <label>
              Gravità
              <select value={faultForm.severity} onChange={(event) => updateFaultField('severity', event.target.value)}>
                {faultSeverityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Titolo guasto
              <input
                onChange={(event) => updateFaultField('title', event.target.value)}
                placeholder="Es. spia motore accesa"
                value={faultForm.title}
              />
            </label>
            <label>
              Dettagli
              <textarea
                onChange={(event) => updateFaultField('description', event.target.value)}
                placeholder="Descrivi cosa succede"
                value={faultForm.description}
              />
            </label>
            <div className="fault-photo-actions">
              <label className="document-action-button">
                Scatta foto
                <input accept="image/*" capture="environment" onChange={handleFaultPhotoFile} type="file" />
              </label>
              <label className="document-action-button">
                Galleria
                <input accept="image/*" onChange={handleFaultPhotoFile} type="file" />
              </label>
              {faultForm.photoFile && (
                <button className="small-button" onClick={() => updateFaultField('photoFile', null)} type="button">
                  Rimuovi foto
                </button>
              )}
            </div>
            {faultForm.photoFile && <small>Foto pronta: {faultForm.photoFile.name}</small>}
            <button
              className="fault-button"
              disabled={!selectedVehicle || !faultForm.title.trim() || sendingOperation === 'fault'}
              type="submit"
            >
              <Wrench size={16} />
              {sendingOperation === 'fault' ? 'Invio...' : faultReported ? 'Guasto segnalato' : 'Segnala guasto'}
            </button>
          </form>
          {openFaults.length > 0 && <small>{openFaults.length} guasti aperti</small>}
          {operationsStatus && <small className="operation-status">{operationsStatus}</small>}
        </article>
        <div className="documents-card">
          <strong>Documenti da mostrare</strong>
          {docs.map((document) => (
            <div className="document-row" key={document.id}>
              <FileText size={15} />
              <span>{document.type}</span>
              <small>{formatOptionalDate(document.expiresAt)}</small>
              <div className="document-row-actions">
                <button
                  className="document-action-button"
                  disabled={!document.filePath}
                  onClick={() => onOpenDriverDocument?.(document)}
                  type="button"
                >
                  Apri
                </button>
                <label className="document-action-button">
                  Foto
                  <input
                    accept="image/*"
                    capture="environment"
                    onChange={(event) => handleDocumentFile(document, event)}
                    type="file"
                  />
                </label>
                <label className="document-action-button">
                  Galleria/PDF
                  <input
                    accept="image/*,.pdf,application/pdf"
                    onChange={(event) => handleDocumentFile(document, event)}
                    type="file"
                  />
                </label>
              </div>
              {uploadingDocumentId === document.id && <small>Caricamento in corso...</small>}
            </div>
          ))}
          {docs.length === 0 && <small>Nessun documento visibile</small>}
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

function NotificationPanel({
  acknowledgedCheckIds = [],
  driverRecords,
  faultReportRecords,
  onOpenNotifications,
  vehicleCheckRecords,
  vehicleRecords,
}) {
  const latestOperations = [
    ...vehicleCheckRecords
      .filter((check) => !acknowledgedCheckIds.includes(check.id))
      .map((check) => ({
        createdAt: check.createdAt,
        detail: `${vehicleRecords.find((vehicle) => vehicle.id === check.tractorId)?.plate ?? 'Mezzo'} · ${formatShortDateTime(check.createdAt)}`,
        isCritical: hasCheckIssues(check),
        label: driverRecords.find((driver) => driver.id === check.driverId)?.name ?? 'Autista',
        type: 'Check',
      })),
    ...faultReportRecords
      .filter((report) => report.status === 'open')
      .map((report) => ({
        createdAt: report.createdAt,
        detail: `${vehicleRecords.find((vehicle) => vehicle.id === report.vehicleId)?.plate ?? 'Mezzo'} · ${getFaultSeverityLabel(report.severity)}`,
        isCritical: ['high', 'stop_vehicle'].includes(report.severity),
        label: report.title,
        type: 'Guasto',
      })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)

  return (
    <section className="panel notification-panel">
      <div className="panel-header compact">
        <div>
          <p className="overline">Campanella</p>
          <h2>Ultime notifiche</h2>
        </div>
        <Bell size={20} />
      </div>
      <div className="operation-feed">
        {latestOperations.map((operation) => (
          <button
            className={operation.isCritical ? 'operation-feed-row is-critical' : 'operation-feed-row'}
            key={`${operation.type}-${operation.label}-${operation.detail}`}
            onClick={onOpenNotifications}
            type="button"
          >
            <span>{operation.type}</span>
            <div>
              <strong>{operation.label}</strong>
              <small>{operation.detail}</small>
            </div>
          </button>
        ))}
        {latestOperations.length === 0 && <small>Nessuna notifica da aprire. Check visti e guasti chiusi restano in archivio.</small>}
      </div>
    </section>
  )
}

export default App
