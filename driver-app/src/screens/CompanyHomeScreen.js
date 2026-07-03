import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { getLocale, t } from '../i18n/native'
import { getDaysUntilDate, isComplianceActionRequired, sortByDueDate } from '../services/deadlineRules'
import { createCompanyAssetSignedUrl } from '../services/driverApi'
import { colors, layout } from '../theme'

const vygoLogo = require('../../assets/brand/logo-horizontal.png')

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

function getVehicleMonthCost(vehicleId, costEntries = [], faults = []) {
  const monthStart = getRepairPeriodStart('month')
  const safeVehicleId = String(vehicleId ?? '')
  if (!monthStart || !safeVehicleId) return 0

  const manualCost = costEntries
    .filter((entry) => String(entry.vehicleId ?? '') === safeVehicleId && new Date(getCostEntryDate(entry)) >= monthStart)
    .reduce((total, entry) => total + Number(entry.amountCents ?? 0), 0)
  const faultCost = faults
    .filter((fault) => String(fault.vehicleId ?? '') === safeVehicleId && new Date(getRepairCostDate(fault)) >= monthStart)
    .reduce((total, fault) => total + Number(fault.repairCostCents ?? 0), 0)

  return manualCost + faultCost
}

function getFleetHealthRows({ checks = [], complianceItems = [], costEntries = [], faults = [], vehicles = [] } = {}) {
  return vehicles
    .filter((vehicle) => !['archived', 'Archiviato'].includes(vehicle.status))
    .map((vehicle) => {
      const vehicleId = String(vehicle.id ?? '')
      const openFaults = faults.filter((fault) => (
        String(fault.vehicleId ?? '') === vehicleId && !['closed', 'archived'].includes(fault.status)
      ))
      const criticalChecks = checks.filter((check) => (
        String(check.tractorId ?? '') === vehicleId && isCheckCritical(check)
      ))
      const vehicleDeadlines = complianceItems.filter((item) => (
        item.scope === 'vehicle' && String(item.vehicleId ?? '') === vehicleId && isComplianceActionRequired(item)
      ))
      const expiredDeadlines = vehicleDeadlines.filter((item) => getDeadlineDays(item.dueDate) < 0)
      const upcomingDeadlines = vehicleDeadlines.filter((item) => getDeadlineDays(item.dueDate) >= 0 && getDeadlineDays(item.dueDate) <= 30)
      const monthCostCents = getVehicleMonthCost(vehicleId, costEntries, faults)
      const score = Math.max(
        0,
        100
          - (openFaults.length * 18)
          - (criticalChecks.length * 14)
          - (expiredDeadlines.length * 22)
          - (upcomingDeadlines.length * 8)
          - Math.min(18, Math.floor(monthCostCents / 50000)),
      )
      const issues = [
        openFaults.length ? `${openFaults.length} guasti aperti` : '',
        criticalChecks.length ? `${criticalChecks.length} check critici` : '',
        expiredDeadlines.length ? `${expiredDeadlines.length} scadenze scadute` : '',
        upcomingDeadlines.length ? `${upcomingDeadlines.length} entro 30 gg` : '',
      ].filter(Boolean)

      return {
        id: vehicle.id,
        issues,
        monthCostCents,
        plate: vehicle.plate || 'Mezzo',
        score,
        tone: score < 55 ? 'danger' : score < 78 ? 'warning' : 'success',
      }
    })
    .sort((first, second) => first.score - second.score)
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

function getToneColor(tone = 'info') {
  if (tone === 'danger') return colors.danger
  if (tone === 'warning') return '#92400e'
  if (tone === 'success') return colors.success
  if (tone === 'cost') return '#065f46'
  return colors.cyanDark
}

function RadarTile({ icon = 'radio-outline', label, meta, onPress, tone = 'info', value }) {
  return (
    <Pressable onPress={onPress} style={[styles.radarTile, styles[`${tone}DashboardSignalRow`]]}>
      <View style={styles.radarTileTop}>
        <View style={styles.radarTileIcon}>
          <Ionicons color={getToneColor(tone)} name={icon} size={16} />
        </View>
        {value !== '' && value !== null && value !== undefined ? (
          <Text adjustsFontSizeToFit minimumFontScale={0.68} numberOfLines={1} style={styles.radarTileValue}>{value}</Text>
        ) : null}
      </View>
      <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.radarTileLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.radarTileMeta}>{meta}</Text>
    </Pressable>
  )
}

function DashboardSignalRow({ icon = 'radio-outline', label, meta, onPress, tone = 'info', value }) {
  return (
    <Pressable onPress={onPress} style={[styles.dashboardSignalRow, styles[`${tone}DashboardSignalRow`]]}>
      <View style={styles.dashboardSignalIcon}>
        <Ionicons color={getToneColor(tone)} name={icon} size={18} />
      </View>
      <View style={styles.dashboardSignalCopy}>
        <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.dashboardSignalLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.dashboardSignalMeta}>{meta}</Text>
      </View>
      {value !== '' && value !== null && value !== undefined ? (
        <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.dashboardSignalValue}>{value}</Text>
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
  const expiredDeadlineCount = activeDeadlines.filter((item) => getDeadlineDays(item.dueDate) < 0).length
  const soonDeadlineCount = activeDeadlines.filter((item) => {
    const days = getDeadlineDays(item.dueDate)
    return days >= 0 && days <= 30
  }).length
  const fleetHealthRows = getFleetHealthRows({ checks, complianceItems, costEntries, faults, vehicles })
  const fleetHealthWorst = fleetHealthRows[0] ?? null
  const fleetHealthAverage = fleetHealthRows.length
    ? Math.round(fleetHealthRows.reduce((total, row) => total + row.score, 0) / fleetHealthRows.length)
    : 100
  const fleetHealthTone = fleetHealthAverage < 55 ? 'danger' : fleetHealthAverage < 78 ? 'warning' : 'success'
  const fleetHealthMeta = fleetHealthWorst?.issues?.length
    ? `${fleetHealthWorst.plate}: ${fleetHealthWorst.issues[0]}`
    : `${vehicles.length} mezzi monitorati`
  const costPressure = Math.min(18, Math.floor(Number(repairCostSummary.monthCents || 0) / 150000))
  const operationalScore = Math.max(
    0,
    Math.min(
      100,
      fleetHealthAverage
        - (criticalChecks.length * 16)
        - (openFaults.length * 13)
        - (expiredDeadlineCount * 14)
        - (soonDeadlineCount * 3)
        - costPressure,
    ),
  )
  const operationalTone = operationalScore >= 82 ? 'success' : operationalScore >= 62 ? 'warning' : 'danger'
  const operationalMeta = criticalChecks.length
    ? `${criticalChecks.length} check critici`
    : openFaults.length
      ? `${openFaults.length} guasti aperti`
      : expiredDeadlineCount
        ? `${expiredDeadlineCount} scadenze scadute`
        : soonDeadlineCount
          ? `${soonDeadlineCount} scadenze vicine`
          : 'Situazione sotto controllo'
  const openWorkSection = () => onOpenManagement?.(openFaults.length ? 'faults' : activeChecks.length ? 'checks' : 'deadlines')
  const nextAction = criticalChecks.length
    ? { icon: 'warning-outline', label: 'Apri check critici', onPress: () => onOpenManagement?.('checks'), tone: 'danger' }
    : openFaults.length
      ? { icon: 'construct-outline', label: 'Apri guasti', onPress: () => onOpenManagement?.('faults'), tone: 'warning' }
      : activeDeadlines.length
        ? { icon: 'calendar-outline', label: 'Apri scadenze', onPress: () => onOpenManagement?.('deadlines'), tone: deadlineTone }
        : unreadMessages
          ? { icon: 'chatbubbles-outline', label: 'Apri chat', onPress: onOpenChat, tone: 'warning' }
          : { icon: 'shield-checkmark-outline', label: 'Tutto sotto controllo', onPress: onOpenAssistant, tone: 'success' }

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
        <Text style={styles.heroDashboardTitle}>{t(language, 'companyDashboard')}</Text>
        <View style={styles.vygoBrandStrip}>
          <Image resizeMode="contain" source={vygoLogo} style={styles.vygoBrandLogo} />
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
          <CompanyMetricMini
            label={t(language, 'deadlines')}
            onPress={() => onOpenManagement?.('deadlines')}
            tone={deadlineTone}
            value={activeDeadlines.length}
          />
          <CompanyMetricMini
            label="Chat"
            onPress={onOpenChat}
            tone={unreadMessages ? 'warning' : 'success'}
            value={unreadMessages}
          />
        </View>
        <View style={styles.companyClientStrip}>
          <View style={styles.companyMark}>
            {logoUrl ? <Image source={{ uri: logoUrl }} style={styles.companyLogoImage} /> : <Text style={styles.companyLogoText}>VY</Text>}
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.companyMeta}>Azienda cliente</Text>
            <Text numberOfLines={1} style={styles.companyName}>{company.name ?? 'Azienda'}</Text>
          </View>
        </View>
        {dailyPhrase ? (
          <View style={styles.dailyPhraseCard}>
            <View style={styles.dailyPhraseMark}>
              <Text style={styles.dailyPhraseMarkText}>V</Text>
            </View>
            <View style={styles.dailyPhraseCopy}>
              <Text style={styles.dailyPhraseOverline}>Frase del giorno</Text>
              <Text numberOfLines={2} style={styles.dailyPhraseText}>{dailyPhrase}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.executiveRadarPanel}>
        <View style={styles.executiveRadarHeader}>
          <View>
            <Text style={styles.executiveRadarKicker}>Radar direzione</Text>
            <Text style={styles.executiveRadarTitle}>Priorita di oggi</Text>
          </View>
          <Text style={[styles.executiveRadarScore, styles[`${operationalTone}SignalScore`]]}>{operationalScore}%</Text>
        </View>
        <Pressable onPress={openWorkSection} style={[styles.operationalRadarCard, styles[`${operationalTone}FleetHealthHeroCard`]]}>
          <View style={styles.operationalRadarTop}>
            <Text style={styles.operationalRadarLabel}>Stato operativo</Text>
            <Text style={styles.operationalRadarScore}>{operationalScore}%</Text>
          </View>
          <Text numberOfLines={2} style={styles.operationalRadarMeta}>
            {operationalMeta}. Tocca per aprire la priorita operativa.
          </Text>
        </Pressable>
        <View style={styles.radarTileGrid}>
          <RadarTile
            icon="radio-outline"
            label="Pratiche aperte"
            meta="Guasti, check e scadenze da lavorare"
            onPress={openWorkSection}
            tone={operationsToWork ? 'warning' : 'info'}
            value={operationsToWork}
          />
          <RadarTile
            icon="calendar-outline"
            label="Scadenze"
            meta={`${expiredDeadlineCount} scadute · ${soonDeadlineCount} entro 30 gg`}
            onPress={() => onOpenManagement?.('deadlines')}
            tone={deadlineTone}
            value={activeDeadlines.length}
          />
          <RadarTile
            icon="cash-outline"
            label="Costi mese"
            meta={`${repairCostSummary.count} voci · anno ${formatCompactMoneyCents(repairCostSummary.yearCents, defaultCurrency)}`}
            onPress={() => onOpenManagement?.('costs')}
            tone={repairCostSummary.monthCents ? 'cost' : 'info'}
            value={formatCompactMoneyCents(repairCostSummary.monthCents, defaultCurrency)}
          />
          <RadarTile
            icon="pulse-outline"
            label="Salute flotta"
            meta={fleetHealthMeta}
            onPress={() => onOpenManagement?.('vehicles')}
            tone={fleetHealthTone}
            value={`${fleetHealthAverage}%`}
          />
        </View>
        <Pressable onPress={nextAction.onPress} style={[styles.nextActionStrip, styles[`${nextAction.tone}DashboardSignalRow`]]}>
          <Ionicons color={getToneColor(nextAction.tone)} name={nextAction.icon} size={17} />
          <Text style={styles.nextActionKicker}>Prossima azione</Text>
          <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.nextActionLabel}>{nextAction.label}</Text>
        </Pressable>
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
    fontSize: 12,
    fontWeight: '900',
  },
  companyMark: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 11,
    height: 38,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 38,
  },
  companyMeta: {
    color: '#cffafe',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  companyName: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  companyClientStrip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderColor: 'rgba(125, 211, 252, 0.25)',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    marginTop: 6,
    padding: 7,
  },
  archiveOpenText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    gap: 6,
    padding: 8,
    paddingBottom: 6,
  },
  executiveRadarPanel: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 7,
    minHeight: 0,
    padding: 9,
  },
  executiveRadarHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  executiveRadarKicker: {
    color: colors.cyanDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  executiveRadarTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  executiveRadarScore: {
    borderRadius: 999,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
    minWidth: 56,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
    textAlign: 'center',
  },
  dashboardSignalsPanel: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 7,
    padding: 10,
  },
  dashboardSignalsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  dashboardSignalsKicker: {
    color: colors.cyanDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  dashboardSignalsTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  dashboardSignalsScore: {
    borderRadius: 999,
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
    minWidth: 58,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    textAlign: 'center',
  },
  dangerSignalScore: {
    backgroundColor: '#fee2e2',
  },
  successSignalScore: {
    backgroundColor: '#dcfce7',
  },
  warningSignalScore: {
    backgroundColor: '#fef3c7',
  },
  directionRadarBox: {
    backgroundColor: '#ecfeff',
    borderColor: '#bae6fd',
    borderRadius: 13,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  directionRadarText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  directionRadarTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  dashboardSignalsList: {
    flex: 1,
    gap: 6,
  },
  dashboardSignalRow: {
    alignItems: 'center',
    backgroundColor: '#f8fbff',
    borderColor: '#d8e7ee',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-start',
    minHeight: 48,
    padding: 8,
  },
  warningDashboardSignalRow: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  dangerDashboardSignalRow: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  costDashboardSignalRow: {
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0',
  },
  successDashboardSignalRow: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  infoDashboardSignalRow: {
    backgroundColor: '#f8fbff',
    borderColor: '#d8e7ee',
  },
  nextActionKicker: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  nextActionLabel: {
    color: colors.ink,
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },
  nextActionStrip: {
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    minHeight: 42,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  operationalRadarCard: {
    borderRadius: 14,
    gap: 4,
    minHeight: 74,
    padding: 10,
  },
  operationalRadarLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  operationalRadarMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  operationalRadarScore: {
    color: colors.ink,
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 29,
  },
  operationalRadarTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  radarTile: {
    borderRadius: 13,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    gap: 3,
    minHeight: 68,
    padding: 8,
  },
  radarTileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  radarTileIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 9,
    height: 27,
    justifyContent: 'center',
    width: 27,
  },
  radarTileLabel: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
  },
  radarTileMeta: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '750',
    lineHeight: 12,
  },
  radarTileTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
  },
  radarTileValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    maxWidth: 70,
    minWidth: 24,
    textAlign: 'right',
  },
  dashboardSignalIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  dashboardSignalCopy: {
    flex: 1,
    minWidth: 0,
  },
  dashboardSignalLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  dashboardSignalMeta: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  dashboardSignalValue: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    color: colors.ink,
    fontSize: 10,
    fontWeight: '900',
    maxWidth: 92,
    minWidth: 28,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 3,
    textAlign: 'center',
  },
  fleetHealthCopy: {
    flex: 1,
    minWidth: 0,
  },
  fleetHealthHeroCard: {
    alignItems: 'center',
    borderRadius: 13,
    flexDirection: 'row',
    gap: 9,
    marginTop: 7,
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  dangerFleetHealthHeroCard: {
    backgroundColor: '#fee2e2',
  },
  successFleetHealthHeroCard: {
    backgroundColor: '#dcfce7',
  },
  warningFleetHealthHeroCard: {
    backgroundColor: '#fef3c7',
  },
  fleetHealthIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  fleetHealthKicker: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  fleetHealthMeta: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
  },
  fleetHealthScore: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    minWidth: 38,
    textAlign: 'right',
  },
  fleetHealthTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
  },
  radarGrid: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 7,
  },
  radarHeroCard: {
    borderRadius: 13,
    flex: 1,
    gap: 2,
    minHeight: 74,
    padding: 9,
  },
  radarScore: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
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
  dailyPhraseCard: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(8, 47, 73, 0.62)',
    borderColor: 'rgba(103, 232, 249, 0.26)',
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  dailyPhraseCopy: {
    flex: 1,
    minWidth: 0,
  },
  dailyPhraseMark: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  dailyPhraseMarkText: {
    color: colors.cyanDark,
    fontSize: 13,
    fontWeight: '900',
  },
  dailyPhraseOverline: {
    color: '#67e8f9',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dailyPhraseText: {
    color: '#f8fbff',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
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
    padding: 8,
  },
  heroDashboardTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
    marginBottom: 6,
  },
  vygoBrandLogo: {
    height: 28,
    width: 146,
  },
  vygoBrandStrip: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.white,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
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
    gap: 5,
    justifyContent: 'center',
  },
  metricMini: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
  metricMiniLabel: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '800',
    marginTop: 1,
    textAlign: 'center',
  },
  metricMiniValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
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
