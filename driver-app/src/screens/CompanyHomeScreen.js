import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { MetricPill } from '../components/MetricPill'
import { Panel } from '../components/Panel'
import { colors, layout } from '../theme'

function formatDateTime(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('it-IT', {
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

export function CompanyHomeScreen({
  context,
  isRefreshing = false,
  logoUrl,
  onOpenSettings,
  onRefresh,
}) {
  const company = context?.companyProfile ?? {}
  const drivers = context?.drivers ?? []
  const vehicles = context?.vehicles ?? []
  const checks = context?.vehicleChecks ?? []
  const faults = context?.faultReports ?? []
  const complianceItems = context?.complianceItems ?? []
  const unreadMessages = context?.unreadDriverMessages ?? 0
  const openFaults = faults.filter((fault) => fault.status !== 'closed')
  const criticalChecks = checks.filter((check) => !check.lightsOk || !check.tiresOk || !check.documentsOnBoard)
  const nextDeadlines = complianceItems.filter((item) => item.dueDate).slice(0, 4)

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.companyMark}>
            {logoUrl ? <Image source={{ uri: logoUrl }} style={styles.companyLogoImage} /> : <Text style={styles.companyLogoText}>CC</Text>}
          </View>
          <View style={styles.heroCopy}>
            <Text numberOfLines={1} style={styles.companyName}>{company.name ?? 'Azienda'}</Text>
            <Text style={styles.companyMeta}>Dashboard azienda</Text>
          </View>
          <Pressable onPress={onOpenSettings} style={styles.settingsButton}>
            <Text style={styles.settingsText}>Impostazioni</Text>
          </Pressable>
        </View>
        <View style={styles.metricRow}>
          <MetricPill label="Guasti" tone={openFaults.length ? 'danger' : 'success'} value={openFaults.length} />
          <MetricPill label="Check critici" tone={criticalChecks.length ? 'danger' : 'success'} value={criticalChecks.length} />
          <MetricPill label="Chat" tone={unreadMessages ? 'warning' : 'info'} value={unreadMessages} />
        </View>
      </View>

      <Panel
        kicker="Flotta"
        right={
          <Pressable onPress={onRefresh} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>{isRefreshing ? '...' : 'Aggiorna'}</Text>
          </Pressable>
        }
        title={`${drivers.length} autisti · ${vehicles.length} mezzi`}
      >
        <Text style={styles.helper}>Vista rapida per il titolare quando apre Camion Chiaro da telefono.</Text>
      </Panel>

      <Panel kicker="Guasti aperti" title={openFaults.length ? 'Da gestire' : 'Nessun guasto aperto'}>
        {openFaults.slice(0, 4).map((fault) => (
          <View key={fault.id} style={styles.listRow}>
            <View style={[styles.statusDot, fault.severity === 'high' && styles.statusDotDanger]} />
            <View style={styles.listCopy}>
              <Text style={styles.listTitle}>{fault.title}</Text>
              <Text style={styles.listMeta}>
                {getDriverName(drivers, fault.driverId)} · {getVehiclePlate(vehicles, fault.vehicleId)} · {formatDateTime(fault.createdAt)}
              </Text>
            </View>
          </View>
        ))}
        {!openFaults.length ? <Text style={styles.emptyText}>Tutto pulito al momento.</Text> : null}
      </Panel>

      <Panel kicker="Check mattutini" title={criticalChecks.length ? 'Criticita rilevate' : 'Check ok'}>
        {criticalChecks.slice(0, 4).map((check) => (
          <View key={check.id} style={styles.listRow}>
            <View style={styles.statusDotDanger} />
            <View style={styles.listCopy}>
              <Text style={styles.listTitle}>{getVehiclePlate(vehicles, check.tractorId)}</Text>
              <Text style={styles.listMeta}>
                {getDriverName(drivers, check.driverId)} · {formatDateTime(check.createdAt)}
              </Text>
            </View>
          </View>
        ))}
        {!criticalChecks.length ? <Text style={styles.emptyText}>Nessuna criticita nei check recenti.</Text> : null}
      </Panel>

      <Panel kicker="Scadenze" title="Prossime pratiche">
        {nextDeadlines.map((item) => (
          <View key={item.id} style={styles.deadlineRow}>
            <Text style={styles.deadlineTitle}>{item.type}</Text>
            <Text style={styles.deadlineDate}>{item.dueDate}</Text>
          </View>
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
  deadlineDate: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
  },
  deadlineRow: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
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
})
