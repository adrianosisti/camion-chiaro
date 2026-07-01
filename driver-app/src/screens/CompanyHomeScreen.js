import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { getLocale, t } from '../i18n/native'
import { getDaysUntilDate, isComplianceActionRequired, sortByDueDate } from '../services/deadlineRules'
import { createCompanyAssetSignedUrl } from '../services/driverApi'
import { colors, layout } from '../theme'

function formatDateTime(value, language = 'it') {
  if (!value) return ''
  return new Intl.DateTimeFormat(getLocale(language), {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value))
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

function formatMoneyInput(cents = 0) {
  if (!cents) return ''
  return String((Number(cents) / 100).toFixed(2)).replace('.', ',')
}

function parseMoneyToCents(value = '') {
  const normalized = String(value).replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  const amount = Number.parseFloat(normalized)

  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : 0
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

function getRepairCostDate(fault = {}) {
  return fault.repairRecordedAt || fault.updatedAt || fault.createdAt
}

function getCostEntryDate(entry = {}) {
  return entry.spentAt || entry.updatedAt || entry.createdAt
}

function getRepairPeriodStart(period) {
  const now = new Date()
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  if (period === 'year') return new Date(now.getFullYear(), 0, 1)
  return null
}

function getRepairCostSummary(faults = [], costEntries = []) {
  const costRows = [
    ...faults
      .filter((fault) => Number(fault.repairCostCents ?? 0) > 0)
      .map((fault) => ({
        amountCents: Number(fault.repairCostCents ?? 0),
        date: getRepairCostDate(fault),
      })),
    ...costEntries
      .filter((entry) => Number(entry.amountCents ?? 0) > 0)
      .map((entry) => ({
        amountCents: Number(entry.amountCents ?? 0),
        date: getCostEntryDate(entry),
      })),
  ].sort((first, second) => new Date(second.date) - new Date(first.date))
  const monthStart = getRepairPeriodStart('month')
  const yearStart = getRepairPeriodStart('year')
  const sumRows = (items) => items.reduce((total, row) => total + Number(row.amountCents ?? 0), 0)

  return {
    count: costRows.length,
    latest: costRows[0] ?? null,
    monthCents: sumRows(costRows.filter((row) => new Date(row.date) >= monthStart)),
    yearCents: sumRows(costRows.filter((row) => new Date(row.date) >= yearStart)),
  }
}

function getDriverName(drivers, driverId) {
  return drivers.find((driver) => driver.id === driverId)?.name ?? 'Autista'
}

function getVehiclePlate(vehicles, vehicleId) {
  return vehicles.find((vehicle) => vehicle.id === vehicleId)?.plate ?? 'Mezzo'
}

function getVehicleFleetLabel(value = '') {
  const labels = {
    furgone: 'Furgone',
    motrice: 'Motrice',
    semirimorchio: 'Semirimorchio',
    trattore: 'Trattore',
  }

  return labels[value] ?? 'Mezzo'
}

function getVehicleName(vehicles, vehicleId) {
  const vehicle = vehicles.find((currentVehicle) => currentVehicle.id === vehicleId)
  if (!vehicle) return 'Mezzo non indicato'
  return [vehicle.plate, vehicle.model].filter(Boolean).join(' - ')
}

function getCheckIssues(check) {
  return [
    check.lightsOk ? null : 'Luci da controllare',
    check.tiresOk ? null : 'Pneumatici da controllare',
    check.documentsOnBoard ? null : 'Documenti non presenti a bordo',
  ].filter(Boolean)
}

function formatSeverity(value) {
  if (value === 'high') return 'Alta'
  if (value === 'low') return 'Bassa'
  return 'Media'
}

function isCheckResolved(check) {
  return ['resolved', 'archived', 'done', 'closed'].includes(check?.status)
}

function isCheckCritical(check) {
  return !isCheckResolved(check) && (!check.lightsOk || !check.tiresOk || !check.documentsOnBoard)
}

function formatDate(value, language = 'it') {
  if (!value) return ''
  return new Intl.DateTimeFormat(getLocale(language), { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

function getDeadlineDays(value) {
  return getDaysUntilDate(value)
}

function getDeadlineTone(item) {
  const days = getDeadlineDays(item.dueDate)
  if (days < 0) return 'danger'
  if (days <= 30) return 'warning'
  return 'info'
}

function getDeadlineMeta(item, drivers, vehicles, people = [], assets = [], language) {
  const subject = getDeadlineSubject(item, drivers, vehicles, people, assets)
  const days = getDeadlineDays(item.dueDate)
  const when = days < 0 ? `${Math.abs(days)} gg fa` : days === 0 ? 'oggi' : `tra ${days} gg`

  return `${subject} · ${formatDate(item.dueDate, language)} · ${when}`
}

function getDeadlineSubject(item, drivers, vehicles, people = [], assets = []) {
  if (item.scope === 'driver') {
    const driver = drivers.find((currentDriver) => currentDriver.id === item.driverId)
    return `Persona · ${driver?.name ?? 'Autista'}`
  }

  if (item.scope === 'vehicle') {
    const vehicle = vehicles.find((currentVehicle) => currentVehicle.id === item.vehicleId)
    return `${getVehicleFleetLabel(vehicle?.fleetType)} · ${vehicle?.plate ?? 'Mezzo'}`
  }

  if (item.scope === 'person') {
    const person = people.find((currentPerson) => currentPerson.id === item.personId)
    const label = person?.department === 'warehouse' ? 'Magazzino' : person?.department === 'office' ? 'Ufficio' : 'Persona'
    return `${label} · ${person?.name ?? 'Persona aziendale'}`
  }

  if (item.scope === 'asset') {
    const asset = assets.find((currentAsset) => currentAsset.id === item.assetId)
    return `Attrezzatura · ${asset?.code ?? 'Attrezzatura'}`
  }
  return 'Azienda'
}

function getDeadlineDetail(item, drivers, vehicles, people = [], assets = []) {
  if (item.scope === 'driver') {
    const driver = drivers.find((currentDriver) => currentDriver.id === item.driverId)
    return driver?.role ?? 'Autista'
  }

  if (item.scope === 'vehicle') {
    const vehicle = vehicles.find((currentVehicle) => currentVehicle.id === item.vehicleId)
    return [vehicle?.model, vehicle?.type].filter(Boolean).join(' · ') || 'Dettaglio mezzo non indicato'
  }

  if (item.scope === 'person') {
    const person = people.find((currentPerson) => currentPerson.id === item.personId)
    return [person?.jobTitle, person?.phone].filter(Boolean).join(' · ') || item.owner || 'Persona aziendale'
  }

  if (item.scope === 'asset') {
    const asset = assets.find((currentAsset) => currentAsset.id === item.assetId)
    return [asset?.model, asset?.serialNumber, asset?.location].filter(Boolean).join(' · ') || item.owner || 'Attrezzatura aziendale'
  }
  return item.owner || 'Documento aziendale'
}

const dailyPhrases = [
  'Una flotta chiara fa lavorare meglio tutti.',
  'Le scadenze viste in tempo costano sempre meno.',
  'Ogni segnalazione letta presto protegge viaggio e cliente.',
  'Controllo semplice, decisioni piu rapide.',
  'Meno carta, piu strada sotto controllo.',
]

function getDailyPhrase() {
  const dayKey = Math.floor(Date.now() / 86400000)
  return dailyPhrases[dayKey % dailyPhrases.length]
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  )
}

function HomeCommandButton({ icon = 'grid-outline', label, onPress, tone = 'info', value }) {
  return (
    <Pressable onPress={onPress} style={[styles.homeCommandButton, styles[`${tone}CommandButton`]]}>
      <View style={[styles.homeCommandIcon, styles[`${tone}CommandIcon`]]}>
        <Ionicons color={tone === 'danger' ? colors.danger : tone === 'warning' ? '#92400e' : tone === 'cost' ? '#065f46' : colors.cyanDark} name={icon} size={20} />
      </View>
      <View style={styles.homeCommandCopy}>
        <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.homeCommandLabel}>{label}</Text>
      </View>
      {value !== '' && value !== null && value !== undefined ? (
        <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.homeCommandValue}>{value}</Text>
      ) : null}
    </Pressable>
  )
}

function CompanyMetricMini({ label, onPress, tone = 'info', value }) {
  return (
    <Pressable onPress={onPress} style={[styles.metricMini, styles[`${tone}MetricMini`]]}>
      <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.metricMiniValue}>{value}</Text>
      <Text numberOfLines={1} style={styles.metricMiniLabel}>{label}</Text>
    </Pressable>
  )
}

function DeadlineDetailPanel({ assets = [], detail, drivers, language = 'it', onClose, onOpenArchive, people = [], vehicles }) {
  if (!detail) return null

  const days = getDeadlineDays(detail.dueDate)
  const status = days < 0 ? `Scaduta da ${Math.abs(days)} giorni` : days === 0 ? 'Scade oggi' : `Scade tra ${days} giorni`

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible>
      <View style={styles.detailScreen}>
        <View style={styles.detailHeader}>
          <Pressable onPress={onClose} style={styles.detailCloseButton}>
            <Text style={styles.detailCloseText}>‹</Text>
          </Pressable>
          <View style={styles.listCopy}>
            <Text style={styles.detailKicker}>Scadenza</Text>
            <Text numberOfLines={1} style={styles.detailHeaderTitle}>{detail.type}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.detailContent}>
          <Text style={styles.detailTitle}>{detail.type}</Text>
          <DetailRow label="Soggetto" value={getDeadlineSubject(detail, drivers, vehicles, people, assets)} />
          <DetailRow label="Dettaglio" value={getDeadlineDetail(detail, drivers, vehicles, people, assets)} />
          <DetailRow label="Data scadenza" value={formatDate(detail.dueDate, language)} />
          <DetailRow label="Stato" value={status} />
          <DetailRow label="Numero documento" value={detail.documentNumber} />
          <DetailRow label="Responsabile" value={detail.owner} />
          <DetailRow label="Ambito" value={detail.scope === 'driver' ? 'Persona/autista' : detail.scope === 'vehicle' ? 'Mezzo' : detail.scope === 'company' ? 'Azienda' : detail.scope} />
          {detail.filePath ? <DetailRow label="Allegato" value="Presente" /> : null}

          <Pressable onPress={onOpenArchive} style={styles.resolveButton}>
            <Text style={styles.resolveButtonText}>Gestisci rinnovo</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  )
}

function OperationsDetailPanel({ detail, drivers, isResolving = false, language = 'it', onClose, onResolve, onSaveFaultRepair, vehicles }) {
  const [photoUrl, setPhotoUrl] = useState('')
  const [repairAmount, setRepairAmount] = useState('')
  const [repairNotes, setRepairNotes] = useState('')
  const [isSavingRepair, setIsSavingRepair] = useState(false)
  const item = detail?.item
  const isFault = detail?.type === 'fault'
  const isCheck = detail?.type === 'check'
  const checkIssues = isCheck ? getCheckIssues(item) : []
  const isArchived = isFault ? ['closed', 'archived'].includes(item?.status) : isCheckResolved(item)
  const resolveLabel = isCheck && checkIssues.length === 0 ? 'Archivia check' : t(language, 'resolved')

  useEffect(() => {
    let isActive = true

    async function loadPhotoUrl() {
      if (!isFault || !item?.photoPath) {
        setPhotoUrl('')
        return
      }

      const result = await createCompanyAssetSignedUrl(item.photoPath)
      if (isActive) setPhotoUrl(result.data?.signedUrl ?? '')
    }

    void loadPhotoUrl()

    return () => {
      isActive = false
    }
  }, [isFault, item?.photoPath])

  useEffect(() => {
    if (!isFault || !item?.id) return
    setRepairAmount(formatMoneyInput(item.repairCostCents))
    setRepairNotes(item.repairNotes ?? '')
    setIsSavingRepair(false)
  }, [isFault, item?.id, item?.repairCostCents, item?.repairNotes])

  if (!detail || !item) return null

  const repairCostCents = parseMoneyToCents(repairAmount)
  const repairCurrency = item.repairCostCurrency || getDefaultCurrency(language)
  const repairPayload = {
    repairCostCents,
    repairCostCurrency: repairCurrency,
    repairNotes,
  }

  async function saveFaultRepair() {
    if (!isFault) return
    setIsSavingRepair(true)
    await onSaveFaultRepair?.(item.id, repairPayload)
    setIsSavingRepair(false)
  }

  function deleteFaultRepair() {
    if (!isFault) return

    Alert.alert(
      'Eliminare costo?',
      'Il guasto resta nello storico, ma il costo riparazione viene azzerato.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          onPress: () => {
            setIsSavingRepair(true)
            void onSaveFaultRepair?.(item.id, {
              repairCleared: true,
              repairCostCents: 0,
              repairCostCurrency: repairCurrency,
              repairNotes: '',
            }).finally(() => {
              setRepairAmount('')
              setRepairNotes('')
              setIsSavingRepair(false)
            })
          },
          style: 'destructive',
          text: 'Elimina costo',
        },
      ],
    )
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible>
      <View style={styles.detailScreen}>
        <View style={styles.detailHeader}>
          <Pressable onPress={onClose} style={styles.detailCloseButton}>
            <Text style={styles.detailCloseText}>‹</Text>
          </Pressable>
          <View style={styles.listCopy}>
            <Text style={styles.detailKicker}>{isFault ? 'Segnalazione autista' : 'Check mattutino'}</Text>
            <Text numberOfLines={1} style={styles.detailHeaderTitle}>
              {isFault ? item.title : checkIssues.length ? 'Criticita rilevate' : 'Check senza anomalie'}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.detailContent}>
          <Text style={styles.detailTitle}>
            {isFault ? item.title : checkIssues.length ? 'Criticita rilevate' : 'Check senza anomalie'}
          </Text>

          <DetailRow label="Autista" value={getDriverName(drivers, item.driverId)} />
          <DetailRow label="Mezzo" value={getVehicleName(vehicles, isFault ? item.vehicleId : item.tractorId)} />
          <DetailRow label="Semirimorchio" value={item.semitrailerId ? getVehicleName(vehicles, item.semitrailerId) : 'Non indicato'} />
          <DetailRow label="Ora" value={formatDateTime(item.createdAt, language)} />
          <DetailRow label="Stato" value={isArchived ? 'Archiviato' : 'Da gestire'} />

          {isCheck ? (
            <>
              <DetailRow label="Km" value={String(item.odometerKm || '-')} />
              <View style={styles.issueBox}>
                <Text style={styles.issueTitle}>{checkIssues.length ? 'Anomalie' : 'Esito'}</Text>
                {checkIssues.length ? checkIssues.map((issue) => (
                  <Text key={issue} style={styles.issueText}>- {issue}</Text>
                )) : <Text style={styles.issueText}>Tutto ok.</Text>}
              </View>
              {item.notes ? <DetailRow label="Note" value={item.notes} /> : null}
            </>
          ) : null}

          {isFault ? (
            <>
              <DetailRow label="Gravita" value={formatSeverity(item.severity)} />
              <DetailRow label="Descrizione" value={item.description || 'Nessuna descrizione'} />
              <DetailRow label="Costo riparazione" value={item.repairCostCents ? formatMoneyCents(item.repairCostCents, repairCurrency) : 'Non inserito'} />
              {item.repairRecordedAt ? <DetailRow label="Costo registrato" value={formatDateTime(item.repairRecordedAt, language)} /> : null}
              {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.detailPhoto} /> : null}
              <View style={styles.repairBox}>
                <Text style={styles.repairTitle}>Costo riparazione</Text>
                <Text style={styles.repairHelp}>Opzionale: puoi salvarlo ora o anche dopo dall archivio guasti.</Text>
                <TextInput
                  inputMode="decimal"
                  keyboardType="decimal-pad"
                  onChangeText={setRepairAmount}
                  placeholder="Importo speso, es. 450,00"
                  placeholderTextColor="#94a3b8"
                  style={styles.repairInput}
                  value={repairAmount}
                />
                <TextInput
                  multiline
                  onChangeText={setRepairNotes}
                  placeholder="Note officina/intervento"
                  placeholderTextColor="#94a3b8"
                  style={[styles.repairInput, styles.repairTextArea]}
                  value={repairNotes}
                />
                <Text style={styles.repairHelp}>
                  {repairCostCents ? `Totale inserito: ${formatMoneyCents(repairCostCents, repairCurrency)}` : 'Lascia vuoto se il costo non e ancora noto.'}
                </Text>
                <Pressable disabled={isSavingRepair} onPress={saveFaultRepair} style={[styles.secondaryResolveButton, isSavingRepair && styles.resolveButtonDisabled]}>
                  <Text style={styles.secondaryResolveButtonText}>{isSavingRepair ? 'Salvo...' : 'Salva costo'}</Text>
                </Pressable>
                {item.repairCostCents ? (
                  <Pressable disabled={isSavingRepair} onPress={deleteFaultRepair} style={[styles.secondaryDangerButton, isSavingRepair && styles.resolveButtonDisabled]}>
                    <Text style={styles.secondaryDangerButtonText}>Elimina costo</Text>
                  </Pressable>
                ) : null}
              </View>
            </>
          ) : null}

          {!isArchived ? (
            <Pressable disabled={isResolving || isSavingRepair} onPress={() => onResolve?.(detail, isFault ? repairPayload : undefined)} style={[styles.resolveButton, (isResolving || isSavingRepair) && styles.resolveButtonDisabled]}>
              <Text style={styles.resolveButtonText}>{isFault && repairCostCents ? 'Archivia con costo' : resolveLabel}</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  )
}

export function CompanyHomeScreen({
  context,
  language = 'it',
  logoUrl,
  onOpenAssistant,
  onOpenChat,
  onOpenManagement,
  onResolveCheck,
  onResolveFault,
  onUpdateFaultRepair,
}) {
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [isResolvingDetail, setIsResolvingDetail] = useState(false)
  const company = context?.companyProfile ?? {}
  const drivers = context?.drivers ?? []
  const people = context?.people ?? []
  const peopleCount = people.filter((person) => (
    !['archived', 'Archiviato'].includes(person.status)
      && !['driver', 'drivers'].includes(person.department)
  )).length
  const vehicles = context?.vehicles ?? []
  const checks = context?.vehicleChecks ?? []
  const faults = context?.faultReports ?? []
  const costEntries = context?.costEntries ?? []
  const complianceItems = context?.complianceItems ?? []
  const unreadMessages = Number(context?.unreadDriverMessages ?? 0) + Number(context?.unreadTeamMessages ?? 0)
  const openFaults = faults.filter((fault) => !['closed', 'archived'].includes(fault.status))
  const repairCostSummary = getRepairCostSummary(faults, costEntries)
  const defaultCurrency = getDefaultCurrency(language)
  const activeChecks = checks.filter((check) => !isCheckResolved(check))
  const criticalChecks = checks.filter(isCheckCritical)
  const recentChecks = activeChecks.slice(0, 4)
  const activeDeadlines = sortByDueDate(complianceItems.filter(isComplianceActionRequired))
  const hasExpiredDeadlines = activeDeadlines.some((item) => getDeadlineDays(item.dueDate) < 0)
  const hasSoonDeadlines = activeDeadlines.some((item) => getDeadlineDays(item.dueDate) <= 30)
  const deadlineTone = hasExpiredDeadlines ? 'danger' : hasSoonDeadlines ? 'warning' : 'info'
  const dailyPhrase = getDailyPhrase()
  const operationsToWork = openFaults.length + activeChecks.length

  async function resolveSelectedDetail(detail = selectedDetail, repair = undefined) {
    if (!detail?.item?.id) return

    setIsResolvingDetail(true)
    const resolved = detail.type === 'fault'
      ? await onResolveFault?.(detail.item.id, repair)
      : await onResolveCheck?.(detail.item.id)
    setIsResolvingDetail(false)

    if (resolved !== false) setSelectedDetail(null)
  }

  return (
    <View style={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.companyMark}>
            {logoUrl ? <Image source={{ uri: logoUrl }} style={styles.companyLogoImage} /> : <Text style={styles.companyLogoText}>CC</Text>}
          </View>
          <View style={styles.heroCopy}>
            <Text numberOfLines={1} style={styles.companyName}>{company.name ?? 'Azienda'}</Text>
            <Text style={styles.companyMeta}>{t(language, 'companyDashboard')}</Text>
          </View>
        </View>
        <View style={styles.metricGrid}>
          <CompanyMetricMini
            label="Guasti"
            onPress={() => openFaults[0] && setSelectedDetail({ item: openFaults[0], type: 'fault' })}
            tone={openFaults.length ? 'danger' : 'success'}
            value={openFaults.length}
          />
          <CompanyMetricMini
            label="Check"
            onPress={() => recentChecks[0] && setSelectedDetail({ item: recentChecks[0], type: 'check' })}
            tone={criticalChecks.length ? 'danger' : activeChecks.length ? 'success' : 'info'}
            value={activeChecks.length}
          />
          <CompanyMetricMini label={t(language, 'deadlines')} onPress={() => onOpenManagement?.('deadlines')} tone={deadlineTone} value={activeDeadlines.length} />
          <CompanyMetricMini
            label="Centro costi"
            onPress={() => onOpenManagement?.('costs')}
            tone={repairCostSummary.monthCents ? 'info' : 'success'}
            value={formatCompactMoneyCents(repairCostSummary.monthCents, defaultCurrency)}
          />
        </View>
        {dailyPhrase ? <Text numberOfLines={1} style={styles.dailyPhrase}>{dailyPhrase}</Text> : null}
      </View>

      <View style={styles.homeCommandPanel}>
        <View style={styles.homeCommandHeader}>
          <View>
            <Text style={styles.homeCommandTitle}>Comandi azienda</Text>
          </View>
        </View>
        <View style={styles.homeCommandGrid}>
          <HomeCommandButton
            detail="Check e guasti da lavorare"
            icon="notifications-outline"
            label="Registro"
            onPress={() => onOpenManagement?.(openFaults.length ? 'faults' : 'checks')}
            tone={operationsToWork ? 'warning' : 'info'}
            value={operationsToWork}
          />
          <HomeCommandButton
            detail="Rinnovi, documenti e solleciti"
            icon="calendar-outline"
            label="Scadenze"
            onPress={() => onOpenManagement?.('deadlines')}
            tone={deadlineTone}
            value={activeDeadlines.length}
          />
          <HomeCommandButton
            detail="Spese libere e report"
            icon="cash-outline"
            label="Centro costi"
            onPress={() => onOpenManagement?.('costs')}
            tone={repairCostSummary.monthCents ? 'cost' : 'info'}
            value={formatCompactMoneyCents(repairCostSummary.monthCents, defaultCurrency)}
          />
          <HomeCommandButton
            detail="Inserisci subito fatture, gomme, tagliandi o costi generali"
            icon="add-circle-outline"
            label="Nuova spesa"
            onPress={() => onOpenManagement?.('costs', { addCost: true })}
            tone="cost"
            value=""
          />
          <HomeCommandButton
            detail="Ufficio, magazzino e reparti"
            icon="people-outline"
            label="Persone"
            onPress={() => onOpenManagement?.('people')}
            value={peopleCount}
          />
          <HomeCommandButton
            detail="Profili e credenziali"
            icon="person-circle-outline"
            label="Autisti"
            onPress={() => onOpenManagement?.('drivers')}
            value={drivers.length}
          />
          <HomeCommandButton
            detail="Mezzi, targhe e semirimorchi"
            icon="bus-outline"
            label="Flotta"
            onPress={() => onOpenManagement?.('vehicles')}
            value={vehicles.length}
          />
          <HomeCommandButton
            detail="Singole, gruppi e reparti"
            icon="chatbubbles-outline"
            label="Chat"
            onPress={onOpenChat}
            tone={unreadMessages ? 'warning' : 'info'}
            value={unreadMessages}
          />
          <HomeCommandButton
            detail="Guida e ticket supporto"
            icon="help-buoy-outline"
            label="Aiuto"
            onPress={onOpenAssistant}
            value=""
          />
        </View>
      </View>

      <OperationsDetailPanel
        detail={selectedDetail}
        drivers={drivers}
        isResolving={isResolvingDetail}
        language={language}
        onClose={() => setSelectedDetail(null)}
        onResolve={resolveSelectedDetail}
        onSaveFaultRepair={onUpdateFaultRepair}
        vehicles={vehicles}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  companyLogoImage: {
    height: '100%',
    width: '100%',
  },
  companyLogoText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  companyMark: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 46,
  },
  companyMeta: {
    color: '#cffafe',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  companyName: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
  },
  archiveOpenText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    gap: 8,
    padding: 10,
    paddingBottom: 8,
  },
  homeCommandPanel: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 7,
    padding: 10,
  },
  homeCommandHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  homeCommandTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  homeCommandSubtitle: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
    maxWidth: 170,
    textAlign: 'right',
  },
  homeCommandGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  homeCommandButton: {
    alignItems: 'center',
    backgroundColor: '#f8fbff',
    borderColor: '#d8e7ee',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    flexBasis: '48.8%',
    gap: 6,
    justifyContent: 'flex-start',
    minHeight: 58,
    padding: 8,
  },
  warningCommandButton: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  dangerCommandButton: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  costCommandButton: {
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0',
  },
  homeCommandIcon: {
    alignItems: 'center',
    backgroundColor: '#cffafe',
    borderRadius: 10,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  warningCommandIcon: {
    backgroundColor: '#fef3c7',
  },
  dangerCommandIcon: {
    backgroundColor: '#fee2e2',
  },
  costCommandIcon: {
    backgroundColor: '#d1fae5',
  },
  homeCommandCopy: {
    flex: 1,
    minWidth: 0,
  },
  homeCommandLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  homeCommandDetail: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    marginTop: 2,
  },
  homeCommandValue: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    color: colors.ink,
    fontSize: 10,
    fontWeight: '900',
    maxWidth: 58,
    minWidth: 24,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 3,
    textAlign: 'center',
  },
  costAlertCard: {
    backgroundColor: '#ecfeff',
    borderColor: colors.cyan,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
    padding: 14,
  },
  costAlertCount: {
    backgroundColor: colors.ink,
    borderRadius: 999,
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    minWidth: 40,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 7,
    textAlign: 'center',
  },
  costAlertHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  costAlertKicker: {
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  costAlertMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  costAlertTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  costMetricBox: {
    backgroundColor: colors.white,
    borderRadius: 14,
    flex: 1,
    padding: 12,
  },
  costMetricLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  costMetricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  costMetricValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  dailyPhrase: {
    color: '#cffafe',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
    marginTop: 5,
  },
  deadlineDate: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
  },
  deadlineAlertCard: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderColor: colors.cyan,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    padding: 14,
  },
  deadlineAlertCopy: {
    flex: 1,
    minWidth: 0,
  },
  deadlineAlertCount: {
    backgroundColor: colors.ink,
    borderRadius: 999,
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    minWidth: 42,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: 'center',
  },
  deadlineAlertDanger: {
    backgroundColor: '#fee2e2',
    borderColor: colors.danger,
  },
  deadlineAlertIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  deadlineAlertIconText: {
    color: colors.danger,
    fontSize: 22,
    fontWeight: '900',
  },
  deadlineAlertKicker: {
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  deadlineAlertMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  deadlineAlertTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  deadlineAlertWarning: {
    backgroundColor: '#fef3c7',
    borderColor: colors.warning,
  },
  deadlineCopy: {
    flex: 1,
    paddingRight: 8,
  },
  deadlineDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  deadlineMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  deadlineRow: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  deadlineTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
    paddingRight: 10,
  },
  detailCloseButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  detailCloseText: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30,
  },
  detailContent: {
    padding: layout.screenPadding,
    paddingBottom: 36,
  },
  detailHeader: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 48,
  },
  detailHeaderTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  detailKicker: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  detailPhoto: {
    aspectRatio: 1.35,
    borderRadius: 16,
    marginTop: 14,
    width: '100%',
  },
  detailRow: {
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    gap: 4,
    paddingVertical: 11,
  },
  detailScreen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  detailTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 10,
    marginTop: 5,
  },
  detailValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  repairBox: {
    backgroundColor: '#ecfeff',
    borderColor: '#a5f3fc',
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    marginTop: 14,
    padding: 12,
  },
  repairHelp: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  repairInput: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  repairTextArea: {
    minHeight: 72,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  repairTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  helper: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: 17,
    padding: 9,
  },
  heroCopy: {
    flex: 1,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  issueBox: {
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  issueText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 21,
    marginTop: 4,
  },
  issueTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  inlineDetail: {
    backgroundColor: '#f8fbff',
    borderColor: colors.cyan,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
    padding: 12,
  },
  inlineDetailHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  listCopy: {
    flex: 1,
  },
  listMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  listRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  listTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  metricMini: {
    alignItems: 'center',
    borderRadius: 12,
    flexBasis: '48%',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  metricMiniLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 1,
    textAlign: 'center',
  },
  metricMiniValue: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 17,
    textAlign: 'center',
  },
  dangerMetricMini: {
    backgroundColor: '#fee2e2',
  },
  infoMetricMini: {
    backgroundColor: '#e0f2fe',
  },
  successMetricMini: {
    backgroundColor: '#dcfce7',
  },
  warningMetricMini: {
    backgroundColor: '#fef3c7',
  },
  openText: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
  },
  okOpenText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '900',
  },
  resolveButton: {
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: 999,
    marginTop: 14,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  resolveButtonDisabled: {
    opacity: 0.55,
  },
  resolveButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryResolveButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.cyanDark,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryResolveButtonText: {
    color: colors.cyanDark,
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryDangerButton: {
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryDangerButtonText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '900',
  },
  settingsButton: {
    backgroundColor: colors.cyan,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  settingsText: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '900',
  },
  smallButton: {
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  smallButtonText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
  },
  statusDot: {
    backgroundColor: colors.warning,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  statusDotArchive: {
    backgroundColor: '#94a3b8',
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  statusDotDanger: {
    backgroundColor: colors.danger,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  statusDotDangerMuted: {
    backgroundColor: '#fca5a5',
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  statusDotSuccess: {
    backgroundColor: colors.success,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  dangerDot: {
    backgroundColor: colors.danger,
  },
  dangerText: {
    color: colors.danger,
  },
  infoDot: {
    backgroundColor: colors.cyan,
  },
  infoText: {
    color: colors.cyanDark,
  },
  warningDot: {
    backgroundColor: colors.warning,
  },
  warningText: {
    color: colors.warning,
  },
})
