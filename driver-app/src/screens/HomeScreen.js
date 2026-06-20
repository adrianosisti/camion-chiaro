import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { MetricPill } from '../components/MetricPill'
import { Panel } from '../components/Panel'
import { colors, layout } from '../theme'

function formatDate(value) {
  if (!value) return 'Senza scadenza'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

const dailyPhrases = [
  'Strada chiara, giornata sotto controllo.',
  'Ogni check fatto bene evita un problema domani.',
  'Precisione oggi, meno fermate domani.',
  'La sicurezza parte prima di accendere il motore.',
  'Un mezzo curato lavora meglio e ti porta piu lontano.',
]

function getDailyPhrase() {
  const dayKey = Math.floor(Date.now() / 86400000)
  return dailyPhrases[dayKey % dailyPhrases.length]
}

function formatVehicleType(value) {
  if (!value) return 'Mezzo'
  return String(value).charAt(0).toUpperCase() + String(value).slice(1)
}

function ActionTile({ icon, label, meta, onPress, tone = 'light' }) {
  return (
    <Pressable onPress={onPress} style={[styles.actionTile, tone === 'dark' && styles.actionTileDark]}>
      <View style={[styles.actionIcon, tone === 'dark' && styles.actionIconDark]}>
        <Ionicons color={tone === 'dark' ? colors.ink : colors.cyanDark} name={icon} size={20} />
      </View>
      <Text numberOfLines={1} style={[styles.actionLabel, tone === 'dark' && styles.actionLabelDark]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.actionMeta, tone === 'dark' && styles.actionMetaDark]}>{meta}</Text>
    </Pressable>
  )
}

export function HomeScreen({
  companyName,
  context,
  driverProfileUrl,
  driverName,
  logoUrl,
  onOpenChat,
  onOpenDocuments,
  onOpenOperations,
  onOpenSettings,
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
  const latestChecks = checks.slice(0, 3)
  const dailyPhrase = getDailyPhrase()

  async function pickProfilePhoto(source) {
    const picker = source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync
    const result = await picker({
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

  async function updateProfilePhoto() {
    Alert.alert('Foto profilo', 'Scegli come aggiornare la foto.', [
      { text: 'Fotocamera', onPress: () => pickProfilePhoto('camera') },
      { text: 'Galleria', onPress: () => pickProfilePhoto('gallery') },
      { style: 'cancel', text: 'Annulla' },
    ])
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
          <Pressable onPress={onOpenSettings} style={styles.settingsButton}>
            <Ionicons color={colors.ink} name="settings-outline" size={19} />
          </Pressable>
        </View>
        <View style={styles.metricRow}>
          <MetricPill label="Messaggi" tone={unreadCompanyMessages ? 'warning' : 'info'} value={unreadCompanyMessages} />
          <MetricPill label="Guasti aperti" tone={openFaults.length ? 'danger' : 'success'} value={openFaults.length} />
          <MetricPill label="Check critici" tone={criticalChecks.length ? 'danger' : 'success'} value={criticalChecks.length} />
        </View>
        <Text style={styles.dailyPhrase}>{dailyPhrase}</Text>
      </View>

      <View style={styles.actionGrid}>
        <ActionTile
          icon="chatbubbles-outline"
          label="Chat"
          meta={unreadCompanyMessages ? `${unreadCompanyMessages} da leggere` : 'Tutto letto'}
          onPress={onOpenChat}
          tone="dark"
        />
        <ActionTile
          icon="document-text-outline"
          label="Documenti"
          meta={`${documents.length} disponibili`}
          onPress={onOpenDocuments}
        />
        <ActionTile
          icon="checkbox-outline"
          label="Check"
          meta={criticalChecks.length ? `${criticalChecks.length} critici` : 'Pronto'}
          onPress={onOpenOperations}
        />
      </View>

      <Panel
        kicker="Chat azienda"
        right={
          <Pressable onPress={onOpenChat} style={styles.panelIconButton}>
            <Ionicons color={colors.ink} name="arrow-forward" size={18} />
          </Pressable>
        }
        title={unreadCompanyMessages ? 'Messaggi da leggere' : 'Tutto letto'}
      >
        <Text style={styles.bodyText}>
          {unreadCompanyMessages
            ? `${unreadCompanyMessages} messaggi azienda aspettano risposta o lettura.`
            : 'Nessun messaggio azienda non letto in questo momento.'}
        </Text>
      </Panel>

      <Panel kicker="Mezzo" title={driveableVehicle?.plate || 'Nessun mezzo assegnato'}>
        <Text style={styles.bodyText}>
          {driveableVehicle
            ? `${driveableVehicle.model || 'Mezzo flotta'} - ${formatVehicleType(driveableVehicle.fleetType || driveableVehicle.type)}`
            : 'Quando l azienda aggiunge la flotta, qui vedi il mezzo da selezionare per il check.'}
        </Text>
      </Panel>

      <Panel
        kicker="Guasti aperti"
        right={
          <Pressable onPress={onOpenOperations} style={styles.panelIconButton}>
            <Ionicons color={colors.ink} name="arrow-forward" size={18} />
          </Pressable>
        }
        title={openFaults.length ? 'Da seguire' : 'Nessun guasto aperto'}
      >
        {openFaults.slice(0, 3).map((fault) => (
          <View key={fault.id} style={styles.listRow}>
            <View style={styles.statusDotDanger} />
            <View style={styles.listCopy}>
              <Text style={styles.listTitle}>{fault.title}</Text>
              <Text style={styles.listMeta}>{fault.status || 'aperto'}</Text>
            </View>
          </View>
        ))}
        {!openFaults.length ? <Text style={styles.bodyText}>Tutto pulito al momento.</Text> : null}
      </Panel>

      <Panel
        kicker="Check recenti"
        right={
          <Pressable onPress={onOpenOperations} style={styles.panelIconButton}>
            <Ionicons color={colors.ink} name="arrow-forward" size={18} />
          </Pressable>
        }
        title={criticalChecks.length ? 'Criticita rilevate' : 'Check sotto controllo'}
      >
        {latestChecks.map((check) => (
          <View key={check.id} style={styles.listRow}>
            <View style={[styles.statusDot, (!check.lightsOk || !check.tiresOk || !check.documentsOnBoard) && styles.statusDotDanger]} />
            <View style={styles.listCopy}>
              <Text style={styles.listTitle}>{check.odometerKm ? `${check.odometerKm} km` : 'Check mattutino'}</Text>
              <Text style={styles.listMeta}>{formatDate(check.createdAt)}</Text>
            </View>
          </View>
        ))}
        {!latestChecks.length ? <Text style={styles.bodyText}>Nessun check registrato oggi.</Text> : null}
      </Panel>

      <Panel
        kicker="Documenti"
        right={
          <Pressable onPress={onOpenDocuments} style={styles.panelIconButton}>
            <Ionicons color={colors.ink} name="arrow-forward" size={18} />
          </Pressable>
        }
        title={nextDocument?.type || 'Tutto sotto controllo'}
      >
        {documents.slice(0, 4).map((document) => (
          <View key={document.id} style={styles.documentRow}>
            <Text style={styles.documentTitle}>{document.type}</Text>
            <Text style={styles.documentDate}>{formatDate(document.expiresAt)}</Text>
          </View>
        ))}
        {!documents.length ? <Text style={styles.bodyText}>Non risultano documenti visibili.</Text> : null}
      </Panel>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionIcon: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 13,
    height: 38,
    justifyContent: 'center',
    marginBottom: 10,
    width: 38,
  },
  actionIconDark: {
    backgroundColor: colors.cyan,
  },
  actionLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  actionLabelDark: {
    color: colors.white,
  },
  actionMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
  actionMetaDark: {
    color: '#cffafe',
  },
  actionTile: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 112,
    padding: 12,
  },
  actionTileDark: {
    backgroundColor: colors.ink,
    borderColor: '#123047',
  },
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
  dailyPhrase: {
    color: '#cffafe',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: 12,
  },
  documentDate: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
  },
  documentRow: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  documentTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
    paddingRight: 10,
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
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
  panelIconButton: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  statusDot: {
    backgroundColor: colors.success,
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
