import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { MetricPill } from '../components/MetricPill'
import { Panel } from '../components/Panel'
import { colors, layout } from '../theme'

function formatDate(value) {
  if (!value) return 'Senza scadenza'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

export function HomeScreen({
  companyName,
  context,
  driverName,
  isRefreshing,
  onRefresh,
  unreadCompanyMessages = 0,
}) {
  const documents = context?.documents ?? []
  const checks = context?.vehicleChecks ?? []
  const faults = context?.faultReports ?? []
  const vehicles = context?.vehicles ?? []
  const nextDocument = documents
    .filter((document) => document.expiresAt)
    .sort((first, second) => new Date(first.expiresAt) - new Date(second.expiresAt))[0]
  const openFaults = faults.filter((fault) => fault.status !== 'closed')
  const driveableVehicle = vehicles.find((vehicle) => vehicle.fleetType !== 'semirimorchio')

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Panel
        kicker="Turno di oggi"
        right={
          <Pressable onPress={onRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshText}>{isRefreshing ? '...' : 'Aggiorna'}</Text>
          </Pressable>
        }
        title={`Ciao ${driverName}`}
      >
        <Text style={styles.companyText}>{companyName}</Text>
        <View style={styles.metricRow}>
          <MetricPill label="Messaggi" tone={unreadCompanyMessages ? 'warning' : 'info'} value={unreadCompanyMessages} />
          <MetricPill label="Guasti aperti" tone={openFaults.length ? 'danger' : 'success'} value={openFaults.length} />
          <MetricPill label="Check" tone="info" value={checks.length} />
        </View>
      </Panel>

      <Panel kicker="Mezzo" title={driveableVehicle?.plate || 'Nessun mezzo assegnato'}>
        <Text style={styles.bodyText}>
          {driveableVehicle
            ? `${driveableVehicle.model || 'Mezzo flotta'} - ${driveableVehicle.fleetType || 'veicolo'}`
            : 'Quando l azienda aggiunge la flotta, qui vedi il mezzo da selezionare per il check.'}
        </Text>
      </Panel>

      <Panel kicker="Documento prossimo" title={nextDocument?.type || 'Tutto sotto controllo'}>
        <Text style={styles.bodyText}>
          {nextDocument
            ? `Scadenza ${formatDate(nextDocument.expiresAt)}`
            : 'Non risultano documenti in scadenza visibili.'}
        </Text>
      </Panel>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  bodyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  companyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 14,
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  refreshText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
})
