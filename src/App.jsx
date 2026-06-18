import { useMemo, useState } from 'react'
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
import Plus from 'lucide-react/dist/esm/icons/plus.mjs'
import RadioTower from 'lucide-react/dist/esm/icons/radio-tower.mjs'
import Route from 'lucide-react/dist/esm/icons/route.mjs'
import Search from 'lucide-react/dist/esm/icons/search.mjs'
import Send from 'lucide-react/dist/esm/icons/send.mjs'
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.mjs'
import Smartphone from 'lucide-react/dist/esm/icons/smartphone.mjs'
import Stethoscope from 'lucide-react/dist/esm/icons/stethoscope.mjs'
import Truck from 'lucide-react/dist/esm/icons/truck.mjs'
import Upload from 'lucide-react/dist/esm/icons/upload.mjs'
import UserRound from 'lucide-react/dist/esm/icons/user-round.mjs'
import Users from 'lucide-react/dist/esm/icons/users.mjs'
import Wrench from 'lucide-react/dist/esm/icons/wrench.mjs'
import { company, complianceItems, driverDocuments, drivers, vehicles } from './data/sampleData'
import { decorateCompliance, formatDate, getSummary } from './lib/expiry'
import {
  isSupabaseConfigured,
  signInDriver,
  signInCompany,
  signOut,
  signUpCompany,
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

function App() {
  const [session, setSession] = useState(null)
  const [items, setItems] = useState(complianceItems)
  const [activeFilter, setActiveFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [driverUploadSent, setDriverUploadSent] = useState(false)
  const [morningCheckSent, setMorningCheckSent] = useState(false)
  const [faultReported, setFaultReported] = useState(false)

  const decoratedItems = useMemo(() => decorateCompliance(items, drivers, vehicles), [items])
  const summary = useMemo(() => getSummary(decoratedItems), [decoratedItems])

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

  if (!session) {
    return <AuthScreen onAuthenticated={setSession} />
  }

  if (session.role === 'driver') {
    return (
      <DriverAppView
        items={decoratedItems}
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
      <Sidebar onSignOut={handleSignOut} session={session} />
      <main className="workspace">
        <Topbar query={query} setQuery={setQuery} />
        <section className="overview-grid" aria-label="Panoramica scadenze">
          <HeroPanel summary={summary} />
          <Metrics summary={summary} />
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
            <FleetAndForms onAdd={addComplianceItem} />
          </div>
          <aside className="side-column" aria-label="Strumenti operativi">
            <DriverMobile
              items={decoratedItems}
              onFaultReport={() => setFaultReported(true)}
              onMorningCheck={() => setMorningCheckSent(true)}
              onUpload={() => setDriverUploadSent(true)}
              faultReported={faultReported}
              morningCheckSent={morningCheckSent}
              uploadSent={driverUploadSent}
            />
            <NotificationPanel faultReported={faultReported} morningCheckSent={morningCheckSent} />
          </aside>
        </section>
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

function Sidebar({ onSignOut, session }) {
  const navItems = [
    { label: 'Scadenze', icon: CalendarClock, active: true },
    { label: 'Autisti', icon: Users },
    { label: 'Flotta', icon: Truck },
    { label: 'Documenti', icon: FileText },
    { label: 'Notifiche', icon: Bell },
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
          <button className={item.active ? 'nav-item is-active' : 'nav-item'} key={item.label} type="button">
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

function Metrics({ summary }) {
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
      value: drivers.length,
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

function FleetAndForms({ onAdd }) {
  return (
    <section className="lower-grid" aria-label="Gestione flotta e inserimento">
      <FleetStatus />
      <AddDeadlineForm onAdd={onAdd} />
    </section>
  )
}

function FleetStatus() {
  const fleetGroups = [
    { label: 'Furgoni', value: vehicles.filter((vehicle) => vehicle.fleetType === 'furgone').length },
    { label: 'Motrici', value: vehicles.filter((vehicle) => vehicle.fleetType === 'motrice').length },
    { label: 'Trattori', value: vehicles.filter((vehicle) => vehicle.fleetType === 'trattore').length },
    { label: 'Semirimorchi', value: vehicles.filter((vehicle) => vehicle.fleetType === 'semirimorchio').length },
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
        {vehicles.map((vehicle) => {
          const assignedDriver = drivers.find((driver) => driver.vehicleId === vehicle.id)
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

function AddDeadlineForm({ onAdd }) {
  const [form, setForm] = useState({
    type: 'Visita medica',
    scope: 'driver',
    assigneeId: drivers[0].id,
    dueDate: '2026-07-18',
    owner: 'Ufficio personale',
  })

  const assignees = form.scope === 'driver' ? drivers : vehicles

  function updateField(field, value) {
    setForm((currentForm) => {
      if (field === 'scope') {
        const nextAssignee = value === 'driver' ? drivers[0].id : vehicles[0].id
        return { ...currentForm, scope: value, assigneeId: nextAssignee }
      }

      return { ...currentForm, [field]: value }
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
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
  faultReported,
  items,
  morningCheckSent,
  onFaultReport,
  onMorningCheck,
  onSignOut,
  onUpload,
  uploadSent,
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
          faultReported={faultReported}
          items={items}
          morningCheckSent={morningCheckSent}
          onFaultReport={onFaultReport}
          onMorningCheck={onMorningCheck}
          uploadSent={uploadSent}
          onUpload={onUpload}
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

function DriverMobile({ faultReported, items, morningCheckSent, onFaultReport, onMorningCheck, onUpload, uploadSent }) {
  const driver = drivers[0]
  const vehicle = vehicles.find((entry) => entry.id === driver.vehicleId)
  const semitrailers = vehicles.filter((entry) => entry.fleetType === 'semirimorchio')
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
