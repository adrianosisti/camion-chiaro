import { useEffect, useMemo, useState } from 'react'
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle.mjs'
import Bell from 'lucide-react/dist/esm/icons/bell.mjs'
import BadgeCheck from 'lucide-react/dist/esm/icons/badge-check.mjs'
import Building2 from 'lucide-react/dist/esm/icons/building-2.mjs'
import CalendarClock from 'lucide-react/dist/esm/icons/calendar-clock.mjs'
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2.mjs'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right.mjs'
import ClipboardCheck from 'lucide-react/dist/esm/icons/clipboard-check.mjs'
import Clock3 from 'lucide-react/dist/esm/icons/clock-3.mjs'
import FileText from 'lucide-react/dist/esm/icons/file-text.mjs'
import Filter from 'lucide-react/dist/esm/icons/filter.mjs'
import Gauge from 'lucide-react/dist/esm/icons/gauge.mjs'
import KeyRound from 'lucide-react/dist/esm/icons/key-round.mjs'
import LockKeyhole from 'lucide-react/dist/esm/icons/lock-keyhole.mjs'
import LogOut from 'lucide-react/dist/esm/icons/log-out.mjs'
import Mail from 'lucide-react/dist/esm/icons/mail.mjs'
import MapPin from 'lucide-react/dist/esm/icons/map-pin.mjs'
import Pencil from 'lucide-react/dist/esm/icons/pencil.mjs'
import Plus from 'lucide-react/dist/esm/icons/plus.mjs'
import RadioTower from 'lucide-react/dist/esm/icons/radio-tower.mjs'
import Route from 'lucide-react/dist/esm/icons/route.mjs'
import Save from 'lucide-react/dist/esm/icons/save.mjs'
import Search from 'lucide-react/dist/esm/icons/search.mjs'
import Send from 'lucide-react/dist/esm/icons/send.mjs'
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
  createDriverDocumentSignedUrl,
  createDriverRecord as createSupabaseDriver,
  createDriverDocumentRecord as createSupabaseDriverDocument,
  createVehicleRecord as createSupabaseVehicle,
  deleteDriverDocumentRecord as deleteSupabaseDriverDocument,
  fetchComplianceItems,
  fetchDriverDocuments,
  fetchDrivers,
  fetchVehicles,
  getCurrentAuthSession,
  isCompanyDataConfigured,
  isSupabaseConfigured,
  signInDriver,
  signInCompany,
  signOut,
  signUpCompany,
  uploadDriverDocumentFile as uploadSupabaseDriverDocumentFile,
  updateDriverDocumentRecord as updateSupabaseDriverDocument,
  updateDriverRecord as updateSupabaseDriver,
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

const driverAuthDomain = import.meta.env.VITE_DRIVER_AUTH_DOMAIN ?? 'drivers.camionchiaro.app'
const fleetTypeOptions = [
  { value: 'furgone', label: 'Furgone' },
  { value: 'motrice', label: 'Motrice' },
  { value: 'trattore', label: 'Trattore' },
  { value: 'semirimorchio', label: 'Semirimorchio' },
]

const vehicleStatusOptions = ['Operativo', 'Da controllare', 'In manutenzione']

function getFleetTypeLabel(value) {
  return fleetTypeOptions.find((option) => option.value === value)?.label ?? value
}

function normalizePlate(value) {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}

function normalizeDriverUsername(value) {
  return value.trim().toLowerCase().replace(/\s+/g, '.')
}

function buildDriverAuthEmail(username) {
  const cleanUsername = normalizeDriverUsername(username)
  return cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@${driverAuthDomain}`
}

function formatOptionalDate(date) {
  return date ? formatDate(date) : 'Senza scadenza'
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
  const [activeView, setActiveView] = useState('dashboard')
  const [activeFilter, setActiveFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [driversSyncStatus, setDriversSyncStatus] = useState('')
  const [documentsSyncStatus, setDocumentsSyncStatus] = useState('')
  const [fleetSyncStatus, setFleetSyncStatus] = useState('')
  const [driverDocumentUploadStatus, setDriverDocumentUploadStatus] = useState('')
  const [uploadingDriverDocumentId, setUploadingDriverDocumentId] = useState('')
  const [driverUploadSent, setDriverUploadSent] = useState(false)
  const [morningCheckSent, setMorningCheckSent] = useState(false)
  const [faultReported, setFaultReported] = useState(false)

  const decoratedItems = useMemo(() => decorateCompliance(items, driverRecords, vehicleRecords), [driverRecords, items, vehicleRecords])
  const summary = useMemo(() => getSummary(decoratedItems), [decoratedItems])

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
    if (!session || session.role !== 'company' || !isCompanyDataConfigured) return

    let isMounted = true

    async function loadCompanyData() {
      setDriversSyncStatus('Caricamento dati Supabase...')
      setDocumentsSyncStatus('Caricamento documenti Supabase...')
      const [driversResult, vehiclesResult, complianceResult, documentsResult] = await Promise.all([
        fetchDrivers(),
        fetchVehicles(),
        fetchComplianceItems(),
        fetchDriverDocuments(),
      ])

      if (!isMounted) return

      if (driversResult.error || vehiclesResult.error || complianceResult.error || documentsResult.error) {
        setDriversSyncStatus('Supabase non ha risposto correttamente. Sto mostrando i dati locali.')
        setDocumentsSyncStatus('Supabase non ha risposto correttamente. Sto mostrando i documenti locali.')
        setFleetSyncStatus('Supabase non ha risposto correttamente. Sto mostrando i dati locali.')
        return
      }

      if (driversResult.data) setDriverRecords(driversResult.data)
      if (vehiclesResult.data) setVehicleRecords(vehiclesResult.data)
      if (complianceResult.data) setItems(complianceResult.data)
      if (documentsResult.data) setDocumentRecords(documentsResult.data)
      setDriversSyncStatus('Dati Supabase caricati.')
      setDocumentsSyncStatus('Documenti Supabase caricati.')
      setFleetSyncStatus('Dati Supabase caricati.')
    }

    loadCompanyData()

    return () => {
      isMounted = false
    }
  }, [session])

  useEffect(() => {
    if (!session || session.role !== 'driver' || !isCompanyDataConfigured) return

    let isMounted = true

    async function loadDriverData() {
      const [driversResult, vehiclesResult, complianceResult, documentsResult] = await Promise.all([
        fetchDrivers(),
        fetchVehicles(),
        fetchComplianceItems(),
        fetchDriverDocuments(),
      ])

      if (!isMounted) return

      if (driversResult.data) setDriverRecords(driversResult.data)
      if (vehiclesResult.data) setVehicleRecords(vehiclesResult.data)
      if (complianceResult.data) setItems(complianceResult.data)
      if (documentsResult.data) setDocumentRecords(documentsResult.data)
    }

    loadDriverData()

    return () => {
      isMounted = false
    }
  }, [session])

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
    const cleanDriver = {
      ...driver,
      authEmail: buildDriverAuthEmail(driver.username),
      username: normalizeDriverUsername(driver.username),
    }

    if (isCompanyDataConfigured && session?.role === 'company') {
      setDriversSyncStatus('Salvataggio autista su Supabase...')
      const result = await createSupabaseDriver(cleanDriver)

      if (result.error) {
        setDriversSyncStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }

      setDriverRecords((currentDrivers) => [result.data, ...currentDrivers])
      setDriversSyncStatus('Autista salvato su Supabase.')
      return true
    }

    setDriverRecords((currentDrivers) => [cleanDriver, ...currentDrivers])
    setDriversSyncStatus('Autista aggiunto in modalità locale.')
    return true
  }

  async function updateDriverRecord(driverId, updates) {
    if (isCompanyDataConfigured && session?.role === 'company') {
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
    if (isCompanyDataConfigured && session?.role === 'company') {
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
    setDriversSyncStatus(isCompanyDataConfigured ? 'Autista archiviato.' : 'Autista archiviato in modalità locale.')
    return true
  }

  async function addVehicleRecord(vehicle) {
    const cleanVehicle = {
      ...vehicle,
      km: Number(vehicle.km) || 0,
      plate: normalizePlate(vehicle.plate),
    }

    if (isCompanyDataConfigured && session?.role === 'company') {
      setFleetSyncStatus('Salvataggio mezzo su Supabase...')
      const result = await createSupabaseVehicle(cleanVehicle)

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

    if (isCompanyDataConfigured && session?.role === 'company') {
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
    if (isCompanyDataConfigured && session?.role === 'company') {
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
    setFleetSyncStatus(isCompanyDataConfigured ? 'Mezzo archiviato.' : 'Mezzo archiviato in modalità locale.')
    return true
  }

  async function addDriverDocumentRecord(document) {
    const cleanDocument = {
      ...document,
      documentNumber: document.documentNumber.trim(),
      filePath: document.filePath.trim(),
    }

    if (isCompanyDataConfigured && session?.role === 'company') {
      setDocumentsSyncStatus('Salvataggio documento su Supabase...')
      const result = await createSupabaseDriverDocument(cleanDocument)

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

    if (isCompanyDataConfigured && session?.role === 'company') {
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
    if (isCompanyDataConfigured && session?.role === 'company') {
      setDocumentsSyncStatus('Rimozione documento da Supabase...')
      const result = await deleteSupabaseDriverDocument(documentId)

      if (result.error) {
        setDocumentsSyncStatus(`Errore Supabase: ${result.error.message}`)
        return false
      }
    }

    setDocumentRecords((currentDocuments) => currentDocuments.filter((document) => document.id !== documentId))
    setDocumentsSyncStatus(isCompanyDataConfigured ? 'Documento rimosso.' : 'Documento rimosso in modalità locale.')
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

    if (isCompanyDataConfigured && ['company', 'driver'].includes(session?.role)) {
      const result = await uploadSupabaseDriverDocumentFile(document, file)
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

  if (!session) {
    return <AuthScreen onAuthenticated={setSession} />
  }

  if (session.role === 'driver') {
    return (
      <DriverAppView
        documentUploadStatus={driverDocumentUploadStatus}
        items={decoratedItems}
        documentRecords={documentRecords}
        driverRecords={driverRecords}
        vehicleRecords={vehicleRecords}
        onSignOut={handleSignOut}
        onUpload={() => setDriverUploadSent(true)}
        onMorningCheck={() => setMorningCheckSent(true)}
        onFaultReport={() => setFaultReported(true)}
        onOpenDriverDocument={openDriverDocumentFile}
        onDriverDocumentUpload={uploadDriverDocumentFile}
        faultReported={faultReported}
        morningCheckSent={morningCheckSent}
        uploadSent={driverUploadSent}
        uploadingDocumentId={uploadingDriverDocumentId}
      />
    )
  }

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onNavigate={setActiveView} onSignOut={handleSignOut} session={session} />
      <main className="workspace">
        <Topbar query={query} setQuery={setQuery} />
        {activeView === 'drivers' ? (
          <DriversWorkspace
            driverRecords={driverRecords}
            onAddDriver={addDriverRecord}
            onArchiveDriver={archiveDriverRecord}
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
            onUpdateVehicle={updateVehicleRecord}
            syncStatus={fleetSyncStatus}
            vehicleRecords={vehicleRecords}
          />
        ) : (
          <>
            <section className="overview-grid" aria-label="Panoramica scadenze">
              <HeroPanel summary={summary} />
              <Metrics
                driverCount={driverRecords.filter((driver) => driver.status !== 'Archiviato').length}
                summary={summary}
                vehicleCount={vehicleRecords.filter((vehicle) => vehicle.status !== 'Archiviato').length}
              />
            </section>
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
                <FleetAndForms driverRecords={driverRecords} onAdd={addComplianceItem} vehicleRecords={vehicleRecords} />
              </div>
              <aside className="side-column" aria-label="Strumenti operativi">
                <DriverMobile
                  documentRecords={documentRecords}
                  documentUploadStatus={driverDocumentUploadStatus}
                  driverRecords={driverRecords}
                  faultReported={faultReported}
                  items={decoratedItems}
                  morningCheckSent={morningCheckSent}
                  onFaultReport={() => setFaultReported(true)}
                  onOpenDriverDocument={openDriverDocumentFile}
                  onDriverDocumentUpload={uploadDriverDocumentFile}
                  onMorningCheck={() => setMorningCheckSent(true)}
                  onUpload={() => setDriverUploadSent(true)}
                  uploadSent={driverUploadSent}
                  uploadingDocumentId={uploadingDriverDocumentId}
                  vehicleRecords={vehicleRecords}
                />
                <NotificationPanel faultReported={faultReported} morningCheckSent={morningCheckSent} />
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
    companyName: 'Camion Chiaro Demo',
    email: 'azienda@camionchiaro.it',
    password: 'password-demo',
  })
  const [driverForm, setDriverForm] = useState({
    username: 'marco.bianchi',
    password: 'password-demo',
  })
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCompanySubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus('')

    const result =
      companyMode === 'signup'
        ? await signUpCompany(companyForm)
        : await signInCompany(companyForm)

    setIsSubmitting(false)

    if (result.error) {
      setStatus(result.error.message)
      return
    }

    if (companyMode === 'signup' && isSupabaseConfigured) {
      setStatus('Registrazione inviata. Controlla la mail per confermare l account.')
      return
    }

    onAuthenticated({
      role: 'company',
      name: companyForm.companyName || 'Azienda',
      email: companyForm.email,
      demo: result.demo,
    })
  }

  async function handleDriverSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus('')

    const result = await signInDriver(driverForm)

    setIsSubmitting(false)

    if (result.error) {
      setStatus(result.error.message)
      return
    }

    onAuthenticated({
      role: 'driver',
      name: drivers[0].name,
      username: driverForm.username,
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
              <p className="overline">Accesso azienda</p>
              <h2>{companyMode === 'signup' ? 'Crea account azienda' : 'Entra nel pannello'}</h2>
            </div>
            <label>
              Nome azienda
              <span>
                <Building2 size={17} />
                <input
                  value={companyForm.companyName}
                  onChange={(event) => setCompanyForm({ ...companyForm, companyName: event.target.value })}
                />
              </span>
            </label>
            <label>
              Email aziendale
              <span>
                <Mail size={17} />
                <input
                  autoComplete="email"
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
              onClick={() => setCompanyMode(companyMode === 'signup' ? 'signin' : 'signup')}
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
                  autoComplete="username"
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

function Sidebar({ activeView, onNavigate, onSignOut, session }) {
  const navItems = [
    { id: 'dashboard', label: 'Scadenze', icon: CalendarClock },
    { id: 'drivers', label: 'Autisti', icon: Users },
    { id: 'fleet', label: 'Flotta', icon: Truck },
    { id: 'documents', label: 'Documenti', icon: FileText },
    { id: 'notifications', label: 'Notifiche', icon: Bell },
  ]

  return (
    <aside className="sidebar" aria-label="Navigazione principale">
      <div className="brand">
        <div className="brand-mark">
          <Route size={22} strokeWidth={2.4} />
        </div>
        <div>
          <strong>Camion Chiaro</strong>
          <span>Area azienda</span>
        </div>
      </div>

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
        <p className="overline">{company.location}</p>
        <h1>Camion Chiaro</h1>
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

function HeroPanel({ summary }) {
  return (
    <section className="hero-panel" aria-label="Controllo scadenze">
      <div className="hero-copy">
        <div className="hero-title-row">
          <ShieldCheck size={30} />
          <h2>Scadenze chiare, notifiche puntuali</h2>
        </div>
        <p>
          Login azienda, accesso autista con nome utente, notifiche in app, check mattutino, guasti,
          documenti digitali, patenti, revisioni, assicurazioni, visite mediche, CQC e carte tachigrafiche.
        </p>
        <div className="hero-actions">
          <button className="primary-button" type="button">
            <Plus size={17} />
            Nuova scadenza
          </button>
          <button className="ghost-button" type="button">
            <Bell size={17} />
            Regole notifiche
          </button>
        </div>
      </div>
      <div className="route-visual" aria-hidden="true">
        <div className="route-line"></div>
        <div className="route-node node-a">
          <Truck size={21} />
        </div>
        <div className="route-node node-b">
          <Smartphone size={20} />
        </div>
        <div className="route-node node-c">
          <BadgeCheck size={21} />
        </div>
        <div className="route-status">
          <span>{summary.next30}</span>
          <small>entro 30 giorni</small>
        </div>
      </div>
    </section>
  )
}

function Metrics({ driverCount, summary, vehicleCount }) {
  const metrics = [
    {
      label: 'Critiche',
      value: summary.critical,
      detail: 'da gestire ora',
      icon: AlertTriangle,
      tone: 'danger',
    },
    {
      label: 'Entro 30 giorni',
      value: summary.next30,
      detail: 'notifiche automatiche',
      icon: Clock3,
      tone: 'warning',
    },
    {
      label: 'Autisti',
      value: driverCount,
      detail: `${summary.driverDocs} documenti`,
      icon: UserRound,
      tone: 'info',
    },
    {
      label: 'Mezzi',
      value: vehicleCount,
      detail: `${summary.vehicleDocs} pratiche`,
      icon: Truck,
      tone: 'success',
    },
  ]

  return (
    <div className="metric-grid">
      {metrics.map((metric) => (
        <article className={`metric-card tone-${metric.tone}`} key={metric.label}>
          <metric.icon size={20} />
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.detail}</small>
        </article>
      ))}
    </div>
  )
}

function DriversWorkspace({ driverRecords, onAddDriver, onArchiveDriver, onUpdateDriver, syncStatus, vehicleRecords }) {
  const [editingId, setEditingId] = useState(null)
  const [draftById, setDraftById] = useState({})
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
                draft={draftById[driver.id]}
                driver={driver}
                editing={editingId === driver.id}
                key={driver.id}
                onArchive={() => archiveDriver(driver.id)}
                onCancel={() => setEditingId(null)}
                onEdit={() => startEditing(driver)}
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
      <DriverCreatePanel onAddDriver={onAddDriver} vehicleRecords={vehicleRecords} />
    </section>
  )
}

function DriverManagementRow({
  draft,
  driver,
  editing,
  onArchive,
  onCancel,
  onEdit,
  onSave,
  onUpdateDraft,
  saving,
  vehicleRecords,
}) {
  const assignedVehicle = vehicleRecords.find((vehicle) => vehicle.id === driver.vehicleId)
  const username = driver.username ?? normalizeDriverUsername(driver.name)

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
        <strong>{driver.name}</strong>
        <span>{driver.phone}</span>
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

function DriverCreatePanel({ onAddDriver, vehicleRecords }) {
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    depot: 'Verona',
    email: '',
    name: '',
    password: 'password-temporanea',
    phone: '',
    role: 'Autista bilico',
    username: '',
    vehicleId: '',
  })

  const authEmail = form.username ? buildDriverAuthEmail(form.username) : ''

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
    if (!form.name.trim() || !form.username.trim() || !form.phone.trim()) return

    setIsSaving(true)
    const added = await onAddDriver({
      id: `drv-${Date.now()}`,
      authEmail,
      depot: form.depot,
      email: form.email || authEmail,
      name: form.name,
      phone: form.phone,
      role: form.role,
      status: 'Disponibile',
      username: normalizeDriverUsername(form.username),
      vehicleId: form.vehicleId,
    })
    setIsSaving(false)

    if (!added) return

    setForm({
      depot: 'Verona',
      email: '',
      name: '',
      password: 'password-temporanea',
      phone: '',
      role: 'Autista bilico',
      username: '',
      vehicleId: '',
    })
  }

  return (
    <form className="panel driver-create-panel" onSubmit={handleSubmit}>
      <div className="panel-header compact">
        <div>
          <p className="overline">Nuovo accesso</p>
          <h2>Crea autista</h2>
        </div>
        <UserPlus size={20} />
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
          <input value={form.password} onChange={(event) => updateField('password', event.target.value)} />
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
      <button className="primary-button full-button" disabled={isSaving} type="submit">
        <UserPlus size={17} />
        {isSaving ? 'Salvataggio...' : 'Aggiungi autista'}
      </button>
    </form>
  )
}

function FleetWorkspace({ driverRecords, onAddVehicle, onArchiveVehicle, onUpdateVehicle, syncStatus, vehicleRecords }) {
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
      <VehicleCreatePanel onAddVehicle={onAddVehicle} />
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

function VehicleCreatePanel({ onAddVehicle }) {
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    fleetType: 'trattore',
    km: 0,
    model: '',
    plate: '',
    status: 'Operativo',
    type: 'Trattore stradale',
  })

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
    if (!form.plate.trim()) return

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
    <form className="panel vehicle-create-panel" onSubmit={handleSubmit}>
      <div className="panel-header compact">
        <div>
          <p className="overline">Nuovo mezzo</p>
          <h2>Aggiungi alla flotta</h2>
        </div>
        <Truck size={20} />
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

function FleetAndForms({ driverRecords, onAdd, vehicleRecords }) {
  return (
    <section className="lower-grid" aria-label="Gestione flotta e inserimento">
      <FleetStatus driverRecords={driverRecords} vehicleRecords={vehicleRecords} />
      <AddDeadlineForm driverRecords={driverRecords} onAdd={onAdd} vehicleRecords={vehicleRecords} />
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
      </div>
    </article>
  )
}

function AddDeadlineForm({ driverRecords, onAdd, vehicleRecords }) {
  const [form, setForm] = useState({
    type: 'Visita medica',
    scope: 'driver',
    assigneeId: driverRecords[0]?.id ?? '',
    dueDate: '2026-07-18',
    owner: 'Ufficio personale',
  })

  const assignees = form.scope === 'driver' ? driverRecords : vehicleRecords

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
    if (!form.assigneeId) return

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
  }

  return (
    <form className="panel add-panel" onSubmit={handleSubmit}>
      <div className="panel-header compact">
        <div>
          <p className="overline">Inserimento rapido</p>
          <h2>Nuova scadenza</h2>
        </div>
        <Plus size={20} />
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
          <select value={form.assigneeId} onChange={(event) => updateField('assigneeId', event.target.value)}>
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
      <button className="primary-button full-button" type="submit">
        <Plus size={17} />
        Aggiungi
      </button>
    </form>
  )
}

function DriverAppView({
  documentUploadStatus,
  documentRecords,
  driverRecords,
  faultReported,
  items,
  morningCheckSent,
  onDriverDocumentUpload,
  onFaultReport,
  onMorningCheck,
  onOpenDriverDocument,
  onSignOut,
  onUpload,
  uploadSent,
  uploadingDocumentId,
  vehicleRecords,
}) {
  return (
    <main className="driver-page">
      <header className="driver-page-header">
        <div className="brand">
          <div className="brand-mark">
            <Route size={22} />
          </div>
          <div>
            <strong>Camion Chiaro</strong>
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
          documentUploadStatus={documentUploadStatus}
          documentRecords={documentRecords}
          driverRecords={driverRecords}
          faultReported={faultReported}
          items={items}
          morningCheckSent={morningCheckSent}
          onDriverDocumentUpload={onDriverDocumentUpload}
          onFaultReport={onFaultReport}
          onMorningCheck={onMorningCheck}
          onOpenDriverDocument={onOpenDriverDocument}
          uploadSent={uploadSent}
          onUpload={onUpload}
          uploadingDocumentId={uploadingDocumentId}
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
  documentUploadStatus,
  documentRecords = driverDocuments,
  driverRecords = drivers,
  faultReported,
  items,
  morningCheckSent,
  onDriverDocumentUpload,
  onFaultReport,
  onMorningCheck,
  onOpenDriverDocument,
  onUpload,
  uploadSent,
  uploadingDocumentId,
  vehicleRecords = vehicles,
}) {
  const driver = driverRecords[0] ?? drivers[0]
  const vehicle = vehicleRecords.find((entry) => entry.id === driver.vehicleId)
  const semitrailers = vehicleRecords.filter((entry) => entry.fleetType === 'semirimorchio')
  const [attachedTrailerId, setAttachedTrailerId] = useState(semitrailers[0]?.id ?? '')
  const driverItems = items.filter(
    (item) => item.driverId === driver.id || (vehicle && item.vehicleId === vehicle.id),
  )
  const nextItem = driverItems[0]
  const docs = documentRecords.filter((document) => document.driverId === driver.id && document.visibleToDriver)

  function handleDocumentFile(document, event) {
    const file = event.target.files?.[0]
    onDriverDocumentUpload?.(document, file)
    event.target.value = ''
  }

  return (
    <section className="phone-frame" aria-label="App autista">
      <div className="phone-top">
        <span>09:41</span>
        <span>{vehicle?.plate}</span>
      </div>
      <div className="phone-body">
        <div className="driver-card">
          <div>
            <p>Buongiorno</p>
            <strong>{driver.name}</strong>
          </div>
          <Smartphone size={24} />
        </div>
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
            <span>{vehicle?.plate} · trattore</span>
          </div>
          <label>
            Semirimorchio agganciato
            <select value={attachedTrailerId} onChange={(event) => setAttachedTrailerId(event.target.value)}>
              <option value="">Nessuno</option>
              {semitrailers.map((trailer) => (
                <option key={trailer.id} value={trailer.id}>
                  {trailer.plate} · {trailer.model}
                </option>
              ))}
            </select>
          </label>
          <div className="check-actions">
            <button className="upload-button" onClick={onMorningCheck} type="button">
              <BadgeCheck size={16} />
              {morningCheckSent ? 'Check inviato' : 'Invia check'}
            </button>
            <button className="fault-button" onClick={onFaultReport} type="button">
              <Wrench size={16} />
              {faultReported ? 'Guasto segnalato' : 'Segnala guasto'}
            </button>
          </div>
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

function NotificationPanel({ faultReported, morningCheckSent }) {
  const rules = [
    { label: '60 giorni', detail: 'email responsabile' },
    { label: '30 giorni', detail: 'notifica in app autista' },
    { label: 'Check mattino', detail: morningCheckSent ? 'ricevuto dall autista' : 'in attesa' },
    { label: 'Guasti', detail: faultReported ? 'segnalazione aperta' : 'nessuna segnalazione' },
  ]

  return (
    <section className="panel notification-panel">
      <div className="panel-header compact">
        <div>
          <p className="overline">Automazioni</p>
          <h2>Regole notifiche</h2>
        </div>
        <Bell size={20} />
      </div>
      <div className="rule-list">
        {rules.map((rule) => (
          <div className="rule-row" key={rule.label}>
            <div className="rule-dot"></div>
            <div>
              <strong>{rule.label}</strong>
              <span>{rule.detail}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="map-strip" aria-hidden="true">
        <MapPin size={18} />
        <span>Verona</span>
        <div></div>
        <span>Padova</span>
      </div>
    </section>
  )
}

export default App
