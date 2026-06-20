import { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { MetricPill } from '../components/MetricPill'
import { Panel } from '../components/Panel'
import { getLocale, t } from '../i18n/native'
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

function getDriverName(drivers, driverId) {
  return drivers.find((driver) => driver.id === driverId)?.name ?? 'Autista'
}

function getVehiclePlate(vehicles, vehicleId) {
  return vehicles.find((vehicle) => vehicle.id === vehicleId)?.plate ?? 'Mezzo'
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

function formatDate(value, language = 'it') {
  if (!value) return ''
  return new Intl.DateTimeFormat(getLocale(language), { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

function getDeadlineDays(value) {
  if (!value) return 9999
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(value) - today) / 86400000)
}

function getDeadlineTone(item) {
  const days = getDeadlineDays(item.dueDate)
  if (days < 0) return 'danger'
  if (days <= 30) return 'warning'
  return 'info'
}

function getDeadlineMeta(item, drivers, vehicles, language) {
  const subject = item.scope === 'driver'
    ? getDriverName(drivers, item.driverId)
    : item.scope === 'vehicle'
      ? getVehiclePlate(vehicles, item.vehicleId)
      : 'Azienda'
  const days = getDeadlineDays(item.dueDate)
  const when = days < 0 ? `${Math.abs(days)} gg fa` : days === 0 ? 'oggi' : `tra ${days} gg`

  return `${subject} · ${formatDate(item.dueDate, language)} · ${when}`
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

function OperationsDetailPanel({ detail, drivers, isResolving = false, language = 'it', onClose, onResolve, vehicles }) {
  const [photoUrl, setPhotoUrl] = useState('')
  const item = detail?.item
  const isFault = detail?.type === 'fault'
  const isCheck = detail?.type === 'check'
  const checkIssues = isCheck ? getCheckIssues(item) : []

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

  if (!detail || !item) return null

  return (
    <View style={styles.inlineDetail}>
      <View style={styles.inlineDetailHeader}>
        <View style={styles.listCopy}>
          <Text style={styles.detailKicker}>{isFault ? 'Segnalazione autista' : 'Check mattutino'}</Text>
          <Text style={styles.detailTitle}>
            {isFault ? item.title : checkIssues.length ? 'Criticita rilevate' : 'Check senza anomalie'}
          </Text>
        </View>
        <Pressable onPress={onClose} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>{t(language, 'close')}</Text>
        </Pressable>
      </View>

      <DetailRow label="Autista" value={getDriverName(drivers, item.driverId)} />
      <DetailRow label="Mezzo" value={getVehicleName(vehicles, isFault ? item.vehicleId : item.tractorId)} />
      <DetailRow label="Semirimorchio" value={item.semitrailerId ? getVehicleName(vehicles, item.semitrailerId) : 'Non indicato'} />
      <DetailRow label="Ora" value={formatDateTime(item.createdAt, language)} />

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
          <DetailRow label="Stato" value={item.status || 'open'} />
          <DetailRow label="Descrizione" value={item.description || 'Nessuna descrizione'} />
          {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.detailPhoto} /> : null}
        </>
      ) : null}

      <Pressable disabled={isResolving} onPress={() => onResolve?.(detail)} style={[styles.resolveButton, isResolving && styles.resolveButtonDisabled]}>
        <Text style={styles.resolveButtonText}>{t(language, 'resolved')}</Text>
      </Pressable>
    </View>
  )
}

export function CompanyHomeScreen({
  context,
  isRefreshing = false,
  language = 'it',
  logoUrl,
  onOpenManagement,
  onOpenSettings,
  onRefresh,
  onResolveCheck,
  onResolveFault,
  resolvedCheckIds = [],
}) {
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [isResolvingDetail, setIsResolvingDetail] = useState(false)
  const company = context?.companyProfile ?? {}
  const drivers = context?.drivers ?? []
  const vehicles = context?.vehicles ?? []
  const checks = context?.vehicleChecks ?? []
  const faults = context?.faultReports ?? []
  const complianceItems = context?.complianceItems ?? []
  const unreadMessages = context?.unreadDriverMessages ?? 0
  const openFaults = faults.filter((fault) => !['closed', 'archived'].includes(fault.status))
  const criticalChecks = checks.filter((check) => (
    (!check.lightsOk || !check.tiresOk || !check.documentsOnBoard)
      && !resolvedCheckIds.includes(check.id)
  ))
  const activeDeadlines = complianceItems
    .filter((item) => item.dueDate && !['done', 'archived'].includes(item.status))
    .slice()
    .sort((first, second) => new Date(first.dueDate) - new Date(second.dueDate))
  const nextDeadlines = activeDeadlines.slice(0, 5)
  const hasExpiredDeadlines = activeDeadlines.some((item) => getDeadlineDays(item.dueDate) < 0)
  const hasSoonDeadlines = activeDeadlines.some((item) => getDeadlineDays(item.dueDate) <= 30)
  const deadlineTone = hasExpiredDeadlines ? 'danger' : hasSoonDeadlines ? 'warning' : 'info'
  const dailyPhrase = getDailyPhrase()

  async function resolveSelectedDetail(detail = selectedDetail) {
    if (!detail?.item?.id) return

    setIsResolvingDetail(true)
    const resolved = detail.type === 'fault'
      ? await onResolveFault?.(detail.item.id)
      : await onResolveCheck?.(detail.item.id)
    setIsResolvingDetail(false)

    if (resolved !== false) setSelectedDetail(null)
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.companyMark}>
            {logoUrl ? <Image source={{ uri: logoUrl }} style={styles.companyLogoImage} /> : <Text style={styles.companyLogoText}>CC</Text>}
          </View>
          <View style={styles.heroCopy}>
            <Text numberOfLines={1} style={styles.companyName}>{company.name ?? 'Azienda'}</Text>
            <Text style={styles.companyMeta}>{t(language, 'companyDashboard')}</Text>
          </View>
          <Pressable onPress={onOpenSettings} style={styles.settingsButton}>
            <Text style={styles.settingsText}>{t(language, 'companySettings')}</Text>
          </Pressable>
        </View>
        <View style={styles.metricRow}>
          <MetricPill
            label="Guasti"
            onPress={() => openFaults[0] && setSelectedDetail({ item: openFaults[0], type: 'fault' })}
            tone={openFaults.length ? 'danger' : 'success'}
            value={openFaults.length}
          />
          <MetricPill
            label={t(language, 'checkCritical')}
            onPress={() => criticalChecks[0] && setSelectedDetail({ item: criticalChecks[0], type: 'check' })}
            tone={criticalChecks.length ? 'danger' : 'success'}
            value={criticalChecks.length}
          />
        </View>
        <View style={styles.metricRow}>
          <MetricPill label={t(language, 'deadlines')} onPress={() => onOpenManagement?.('deadlines')} tone={deadlineTone} value={activeDeadlines.length} />
          <MetricPill label="Chat" tone={unreadMessages ? 'warning' : 'info'} value={unreadMessages} />
        </View>
        <Text style={styles.dailyPhrase}>{dailyPhrase}</Text>
      </View>

      <Panel
        kicker="Flotta"
        right={
          <Pressable onPress={() => onOpenManagement?.('vehicles')} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>Gestisci</Text>
          </Pressable>
        }
        title={`${drivers.length} autisti · ${vehicles.length} mezzi`}
      >
        <Text style={styles.helper}>
          {isRefreshing ? 'Aggiornamento dati...' : t(language, 'companyFleetHelp')}
        </Text>
      </Panel>

      <Panel kicker="Guasti aperti" title={openFaults.length ? 'Da gestire' : 'Nessun guasto aperto'}>
        {openFaults.slice(0, 4).map((fault) => (
          <Pressable key={fault.id} onPress={() => setSelectedDetail({ item: fault, type: 'fault' })} style={styles.listRow}>
            <View style={[styles.statusDot, fault.severity === 'high' && styles.statusDotDanger]} />
            <View style={styles.listCopy}>
              <Text style={styles.listTitle}>{fault.title}</Text>
              <Text style={styles.listMeta}>
                {getDriverName(drivers, fault.driverId)} · {getVehiclePlate(vehicles, fault.vehicleId)} · {formatDateTime(fault.createdAt, language)}
              </Text>
            </View>
            <Text style={styles.openText}>Apri</Text>
          </Pressable>
        ))}
        {selectedDetail?.type === 'fault' ? (
          <OperationsDetailPanel
            detail={selectedDetail}
            drivers={drivers}
            isResolving={isResolvingDetail}
            language={language}
            onClose={() => setSelectedDetail(null)}
            onResolve={resolveSelectedDetail}
            vehicles={vehicles}
          />
        ) : null}
        {!openFaults.length ? <Text style={styles.emptyText}>Tutto pulito al momento.</Text> : null}
      </Panel>

      <Panel kicker="Check mattutini" title={criticalChecks.length ? 'Criticita rilevate' : 'Check ok'}>
        {criticalChecks.slice(0, 4).map((check) => (
          <Pressable key={check.id} onPress={() => setSelectedDetail({ item: check, type: 'check' })} style={styles.listRow}>
            <View style={styles.statusDotDanger} />
            <View style={styles.listCopy}>
              <Text style={styles.listTitle}>{getVehiclePlate(vehicles, check.tractorId)}</Text>
              <Text style={styles.listMeta}>
                {getDriverName(drivers, check.driverId)} · {formatDateTime(check.createdAt, language)}
              </Text>
            </View>
            <Text style={styles.openText}>Apri</Text>
          </Pressable>
        ))}
        {selectedDetail?.type === 'check' ? (
          <OperationsDetailPanel
            detail={selectedDetail}
            drivers={drivers}
            isResolving={isResolvingDetail}
            language={language}
            onClose={() => setSelectedDetail(null)}
            onResolve={resolveSelectedDetail}
            vehicles={vehicles}
          />
        ) : null}
        {!criticalChecks.length ? <Text style={styles.emptyText}>Nessuna criticita nei check recenti.</Text> : null}
      </Panel>

      <Panel
        kicker="Scadenze"
        right={
          <Pressable onPress={() => onOpenManagement?.('deadlines')} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>Apri</Text>
          </Pressable>
        }
        title={nextDeadlines.length ? 'Prossime pratiche' : 'Nessuna pratica'}
      >
        {nextDeadlines.map((item) => (
          <Pressable key={item.id} onPress={() => onOpenManagement?.('deadlines')} style={styles.deadlineRow}>
            <View style={[styles.deadlineDot, styles[`${getDeadlineTone(item)}Dot`]]} />
            <View style={styles.deadlineCopy}>
              <Text style={styles.deadlineTitle}>{item.type}</Text>
              <Text style={styles.deadlineMeta}>{getDeadlineMeta(item, drivers, vehicles, language)}</Text>
            </View>
            <Text style={[styles.deadlineDate, styles[`${getDeadlineTone(item)}Text`]]}>{formatDate(item.dueDate, language)}</Text>
          </Pressable>
        ))}
        {!nextDeadlines.length ? <Text style={styles.emptyText}>Nessuna scadenza imminente caricata.</Text> : null}
      </Panel>

    </ScrollView>
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
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 54,
  },
  companyMeta: {
    color: '#cffafe',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  companyName: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
  },
  dailyPhrase: {
    color: '#cffafe',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: 12,
  },
  deadlineDate: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
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
    borderRadius: 20,
    marginBottom: 12,
    padding: 14,
  },
  heroCopy: {
    flex: 1,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
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
  metricRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  openText: {
    color: colors.cyanDark,
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
  statusDotDanger: {
    backgroundColor: colors.danger,
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
