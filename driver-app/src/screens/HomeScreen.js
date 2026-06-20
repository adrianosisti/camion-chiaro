import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
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
  driverProfileUrl,
  driverName,
  isRefreshing,
  logoUrl,
  onRefresh,
  onUpdateProfilePhoto,
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
  const criticalChecks = checks.filter((check) => !check.lightsOk || !check.tiresOk || !check.documentsOnBoard)

  async function updateProfilePhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.72,
    })

    if (result.canceled || !result.assets?.[0]) return

    const asset = result.assets[0]
    const uploaded = await onUpdateProfilePhoto?.({
      name: asset.fileName || `profilo-${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
      uri: asset.uri,
    })

    if (uploaded) Alert.alert('Foto aggiornata', 'La foto profilo e stata salvata.')
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.identityBlock}>
            <Pressable onPress={updateProfilePhoto} style={styles.profileImageWrap}>
              {driverProfileUrl ? <Image source={{ uri: driverProfileUrl }} style={styles.profileImage} /> : <Text style={styles.profileInitial}>IO</Text>}
            </Pressable>
            <View style={styles.heroCopy}>
              <Text style={styles.heroGreeting}>Ciao {driverName}</Text>
              <View style={styles.companyRow}>
                <View style={styles.companyLogo}>
                  {logoUrl ? <Image source={{ uri: logoUrl }} style={styles.companyLogoImage} /> : <Text style={styles.companyLogoText}>CC</Text>}
                </View>
                <Text numberOfLines={1} style={styles.companyText}>{companyName}</Text>
              </View>
            </View>
          </View>
          <Pressable onPress={onRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshText}>{isRefreshing ? '...' : 'Aggiorna'}</Text>
          </Pressable>
        </View>
        <View style={styles.metricRow}>
          <MetricPill label="Messaggi" tone={unreadCompanyMessages ? 'warning' : 'info'} value={unreadCompanyMessages} />
          <MetricPill label="Guasti aperti" tone={openFaults.length ? 'danger' : 'success'} value={openFaults.length} />
          <MetricPill label="Check critici" tone={criticalChecks.length ? 'danger' : 'success'} value={criticalChecks.length} />
        </View>
      </View>

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
    color: '#cffafe',
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
  },
  companyLogo: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    height: 28,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 28,
  },
  companyLogoImage: {
    height: '100%',
    width: '100%',
  },
  companyLogoText: {
    color: colors.ink,
    fontSize: 9,
    fontWeight: '900',
  },
  companyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
  },
  hero: {
    backgroundColor: colors.ink,
    borderColor: '#123047',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  heroCopy: {
    flex: 1,
  },
  heroGreeting: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  heroTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  identityBlock: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    paddingRight: 10,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  profileImage: {
    height: '100%',
    width: '100%',
  },
  profileImageWrap: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderColor: '#a7f3ff',
    borderRadius: 18,
    borderWidth: 2,
    height: 58,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 58,
  },
  profileInitial: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  refreshButton: {
    backgroundColor: colors.cyan,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  refreshText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
})
