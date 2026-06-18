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
import { decorateCompliance, formatDate, getSummary } from './lib/expiry'
import {
  archiveDriverRecord as archiveSupabaseDriver,
  createDriverRecord as createSupabaseDriver,
  fetchComplianceItems,
  fetchDrivers,
  fetchVehicles,
  getCurrentAuthSession,
  isCompanyDataConfigured,
  isSupabaseConfigured,
  signInDriver,
  signInCompany,
  signOut,
  signUpCompany,
  updateDriverRecord as updateSupabaseDriver,
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

const driverAuthDomain = import.meta.env.VITE_DRIVER_AUTH_DOMAIN ?? 'drivers.camionchiaro.app'

function normalizeDriverUsername(value) {
  return value.trim().toLowerCase().replace(/\s+/g, '.')
}

function buildDriverAuthEmail(username) {
  const cleanUsername = normalizeDriverUsername(username)
  return cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@${driverAuthDomain}`
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
  const [driverRecords, setDriverRecords] = useState(drivers)
  const [vehicleRecords, setVehicleRecords] = useState(vehicles)
  const [activeView, setActiveView] = useState('dashboard')
  const [activeFilter, setActiveFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [driversSyncStatus, setDriversSyncStatus] = useState('')
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
      const [driversResult, vehiclesResult, complianceResult] = await Promise.all([
        fetchDrivers(),
        fetchVehicles(),
        fetchComplianceItems(),
      ])

      if (!isMounted) return

      if (driversResult.error || vehiclesResult.error || complianceResult.error) {
        setDriversSyncStatus('Supabase non ha risposto correttamente. Sto mostrando i dati locali.')
        return
      }

      if (driversResult.data) setDriverRecords(driversResult.data)
      if (vehiclesResult.data) setVehicleRecords(vehiclesResult.data)
      if (complianceResult.data) setItems(complianceResult.data)
      setDriversSyncStatus('Dati Supabase caricati.')
    }

    loadCompanyData()

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

  if (!session) {
    return <AuthScreen onAuthenticated={setSession} />
  }

  if (session.role === 'driver') {
    return (
      <DriverAppView
        items={decoratedItems}
        driverRecords={driverRecords}
        vehicleRecords={vehicleRecords}
        onSignOut={handleSignOut}
        onUpload={() => setDriverUploadSent(true)}
        onMorningCheck={() => setMorningCheckSent(true)}
        onFaultReport={() => setFaultReported(true)}
        faultReported={faultReported}
        morningCheckSent={morningCheckSent}
        uploadSent={driverUploadSent}
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
        ) : (
          <>
            <section className="overview-grid" aria-label="Panoramica scadenze">
              <HeroPanel summary={summary} />
              <Metrics driverCount={driverRecords.length} summary={summary} />
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
                  driverRecords={driverRecords}
                  faultReported={faultReported}
                  items={decoratedItems}
                  morningCheckSent={morningCheckSent}
                  onFaultReport={() => setFaultReported(true)}
                  onMorningCheck={() => setMorningCheckSent(true)}
                  onUpload={() => setDriverUploadSent(true)}
                  uploadSent={driverUploadSent}
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

function Metrics({ driverCount, summary }) {
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
      value: vehicles.length,
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
  const fleetGroups = [
    { label: 'Furgoni', value: vehicleRecords.filter((vehicle) => vehicle.fleetType === 'furgone').length },
    { label: 'Motrici', value: vehicleRecords.filter((vehicle) => vehicle.fleetType === 'motrice').length },
    { label: 'Trattori', value: vehicleRecords.filter((vehicle) => vehicle.fleetType === 'trattore').length },
    { label: 'Semirimorchi', value: vehicleRecords.filter((vehicle) => vehicle.fleetType === 'semirimorchio').length },
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
        {vehicleRecords.map((vehicle) => {
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
  driverRecords,
  faultReported,
  items,
  morningCheckSent,
  onFaultReport,
  onMorningCheck,
  onSignOut,
  onUpload,
  uploadSent,
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
          driverRecords={driverRecords}
          faultReported={faultReported}
          items={items}
          morningCheckSent={morningCheckSent}
          onFaultReport={onFaultReport}
          onMorningCheck={onMorningCheck}
          uploadSent={uploadSent}
          onUpload={onUpload}
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
  driverRecords = drivers,
  faultReported,
  items,
  morningCheckSent,
  onFaultReport,
  onMorningCheck,
  onUpload,
  uploadSent,
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
  const docs = driverDocuments.filter((document) => document.driverId === driver.id)

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
              <span>{document.title}</span>
              <small>{formatDate(document.expiresAt)}</small>
            </div>
          ))}
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
