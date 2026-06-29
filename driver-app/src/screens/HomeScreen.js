import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { MetricPill } from '../components/MetricPill'
import { Panel } from '../components/Panel'
import { getLocale, t } from '../i18n/native'
import { colors, layout } from '../theme'

function formatDate(value, language) {
  if (!value) return t(language, 'noDeadline')
  return new Intl.DateTimeFormat(getLocale(language), { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

function getDocumentDaysLeft(document) {
  if (!document?.expiresAt) return 9999

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiresAt = new Date(document.expiresAt)
  expiresAt.setHours(0, 0, 0, 0)

  return Math.ceil((expiresAt - today) / 86400000)
}

function getDocumentCriticalTone(document) {
  const daysLeft = getDocumentDaysLeft(document)
  if (daysLeft < 0) return 'danger'
  if (daysLeft <= 30) return 'warning'
  return 'success'
}

function getDocumentCriticalText(document) {
  const daysLeft = getDocumentDaysLeft(document)
  if (daysLeft < 0) return `Scaduto da ${Math.abs(daysLeft)} gg`
  if (daysLeft === 0) return 'Scade oggi'
  if (daysLeft <= 30) return `Scade tra ${daysLeft} gg`
  return 'Valido'
}

function getDocumentTypeKey(value = '') {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ')
}

function getDocumentTime(document = {}) {
  const time = document.expiresAt ? new Date(document.expiresAt).getTime() : 0
  return Number.isFinite(time) ? time : 0
}

function getLatestDocumentsByType(documents = []) {
  const byType = new Map()

  documents.forEach((document) => {
    const key = getDocumentTypeKey(document.type || document.id)
    const current = byType.get(key)
    if (!current || getDocumentTime(document) >= getDocumentTime(current)) {
      byType.set(key, document)
    }
  })

  return Array.from(byType.values())
}

const dailyPhrases = {
  de: ['Klare Strecke, klarer Tag.', 'Sicherheit beginnt vor dem Start.', 'Ein guter Check spart morgen Zeit.'],
  en: ['Clear road, clear day.', 'Safety starts before the engine.', 'A good check today saves time tomorrow.'],
  es: ['Ruta clara, dia bajo control.', 'La seguridad empieza antes del motor.', 'Un buen check hoy evita problemas manana.'],
  fr: ['Route claire, journee sous controle.', 'La securite commence avant le moteur.', 'Un bon controle aujourd hui evite les soucis demain.'],
  it: [
    'Strada chiara, giornata sotto controllo.',
    'Ogni check fatto bene evita un problema domani.',
    'Precisione oggi, meno fermate domani.',
    'La sicurezza parte prima di accendere il motore.',
    'Un mezzo curato lavora meglio e ti porta piu lontano.',
  ],
  pl: ['Jasna trasa, spokojny dzien.', 'Bezpieczenstwo zaczyna sie przed silnikiem.', 'Dobry przeglad dzis oszczedza czas jutro.'],
  ro: ['Drum clar, zi sub control.', 'Siguranta incepe inainte de motor.', 'Un check bun azi economiseste timp maine.'],
}

function getDailyPhrase(language) {
  const phrases = dailyPhrases[language] ?? dailyPhrases.it
  const dayKey = Math.floor(Date.now() / 86400000)
  return phrases[dayKey % phrases.length]
}

function formatVehicleType(value) {
  if (!value) return 'Mezzo'
  return String(value).charAt(0).toUpperCase() + String(value).slice(1)
}

function isCheckResolved(check) {
  return ['resolved', 'archived', 'done', 'closed'].includes(check?.status)
}

function isCheckCritical(check) {
  return !isCheckResolved(check) && (!check.lightsOk || !check.tiresOk || !check.documentsOnBoard)
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
  language = 'it',
  logoUrl,
  onOpenChat,
  onOpenDocuments,
  onOpenOperations,
  onOpenSettings,
  onSelectDailyVehicle,
  onUpdateProfilePhoto,
  selectedDailyVehicleId = '',
  unreadCompanyMessages = 0,
}) {
  const documents = context?.documents ?? []
  const latestDocuments = getLatestDocumentsByType(documents)
  const checks = context?.vehicleChecks ?? []
  const faults = context?.faultReports ?? []
  const vehicles = context?.vehicles ?? []
  const sortedDocuments = latestDocuments
    .filter((document) => document.expiresAt)
    .slice()
    .sort((first, second) => new Date(first.expiresAt) - new Date(second.expiresAt))
  const nextDocument = sortedDocuments[0]
  const criticalDocuments = sortedDocuments.filter((document) => getDocumentDaysLeft(document) <= 30)
  const expiredDocuments = criticalDocuments.filter((document) => getDocumentDaysLeft(document) < 0)
  const documentAlertTone = expiredDocuments.length ? 'danger' : criticalDocuments.length ? 'warning' : 'success'
  const openFaults = faults.filter((fault) => fault.status !== 'closed')
  const driveableVehicles = vehicles.filter((vehicle) => vehicle.fleetType !== 'semirimorchio')
  const selectedDailyVehicle = driveableVehicles.find((vehicle) => vehicle.id === selectedDailyVehicleId) ?? null
  const criticalChecks = checks.filter(isCheckCritical)
  const latestChecks = checks.slice(0, 3)
  const dailyPhrase = getDailyPhrase(language)

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
          <MetricPill label="Messaggi" onPress={onOpenChat} tone={unreadCompanyMessages ? 'warning' : 'info'} value={unreadCompanyMessages} />
          <MetricPill label="Documenti" onPress={() => onOpenDocuments?.(criticalDocuments[0]?.id ?? '')} tone={documentAlertTone} value={criticalDocuments.length} />
          <MetricPill label={t(language, 'faultsOpen')} tone={openFaults.length ? 'danger' : 'success'} value={openFaults.length} />
        </View>
        <View style={styles.metricRowSecondary}>
          <MetricPill label={t(language, 'checkCritical')} tone={criticalChecks.length ? 'danger' : 'success'} value={criticalChecks.length} />
        </View>
        <Text style={styles.dailyPhrase}>{dailyPhrase}</Text>
      </View>

      {criticalDocuments.length ? (
        <Pressable
          onPress={() => onOpenDocuments?.(criticalDocuments[0]?.id ?? '')}
          style={[styles.documentAlert, expiredDocuments.length && styles.documentAlertDanger]}
        >
          <View style={styles.documentAlertIcon}>
            <Ionicons color={expiredDocuments.length ? colors.danger : colors.warning} name="alert-circle" size={24} />
          </View>
          <View style={styles.documentAlertCopy}>
            <Text style={styles.documentAlertTitle}>
              {expiredDocuments.length ? 'Documenti scaduti' : 'Documenti in scadenza'}
            </Text>
            {criticalDocuments.slice(0, 3).map((document) => (
              <Text key={document.id} numberOfLines={1} style={styles.documentAlertMeta}>
                {document.type} · {getDocumentCriticalText(document)} · {formatDate(document.expiresAt, language)}
              </Text>
            ))}
          </View>
          <Ionicons color={colors.ink} name="chevron-forward" size={18} />
        </Pressable>
      ) : null}

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
          label={t(language, 'documents')}
          meta={`${latestDocuments.length} disponibili`}
          onPress={() => onOpenDocuments?.('')}
        />
        <ActionTile
          icon="checkbox-outline"
          label="Check"
          meta={selectedDailyVehicle ? selectedDailyVehicle.plate : 'Scegli mezzo'}
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

      <Panel kicker="Mezzo del turno" title={selectedDailyVehicle?.plate || 'Scegli il mezzo che prendi'}>
        <Text style={styles.bodyText}>
          {selectedDailyVehicle
            ? `${selectedDailyVehicle.model || 'Mezzo flotta'} - ${formatVehicleType(selectedDailyVehicle.fleetType || selectedDailyVehicle.type)}`
            : 'Ogni giorno seleziona il mezzo che stai usando. Se cambi mezzo durante il turno, puoi cambiarlo qui e i prossimi check o guasti useranno quello nuovo.'}
        </Text>
        {driveableVehicles.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleSelectorScroll}>
            <View style={styles.vehicleSelectorRow}>
              {driveableVehicles.map((vehicle) => {
                const isSelected = selectedDailyVehicle?.id === vehicle.id
                return (
                  <Pressable
                    key={vehicle.id}
                    onPress={() => onSelectDailyVehicle?.(vehicle.id)}
                    style={[styles.vehicleChip, isSelected && styles.vehicleChipActive]}
                  >
                    <Text numberOfLines={1} style={[styles.vehiclePlate, isSelected && styles.vehiclePlateActive]}>
                      {vehicle.plate}
                    </Text>
                    <Text numberOfLines={1} style={[styles.vehicleType, isSelected && styles.vehicleTypeActive]}>
                      {formatVehicleType(vehicle.fleetType || vehicle.type)}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.selectorEmpty}>L azienda deve prima aggiungere furgoni, motrici o trattori.</Text>
        )}
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
            <View style={[styles.statusDot, isCheckCritical(check) && styles.statusDotDanger]} />
            <View style={styles.listCopy}>
              <Text style={styles.listTitle}>{check.odometerKm ? `${check.odometerKm} km` : 'Check mattutino'}</Text>
              <Text style={styles.listMeta}>{formatDate(check.createdAt, language)}</Text>
            </View>
          </View>
        ))}
        {!latestChecks.length ? <Text style={styles.bodyText}>Nessun check registrato oggi.</Text> : null}
      </Panel>

      <Panel
        kicker="Documenti"
        right={
          <Pressable onPress={() => onOpenDocuments?.('')} style={styles.panelIconButton}>
            <Ionicons color={colors.ink} name="arrow-forward" size={18} />
          </Pressable>
        }
        title={nextDocument?.type || 'Tutto sotto controllo'}
      >
        {documents.slice(0, 4).map((document) => (
          <View key={document.id} style={styles.documentRow}>
            <Text style={styles.documentTitle}>{document.type}</Text>
            <Text
              style={[
                styles.documentDate,
                getDocumentCriticalTone(document) === 'danger' && styles.documentDateDanger,
                getDocumentCriticalTone(document) === 'warning' && styles.documentDateWarning,
              ]}
            >
              {formatDate(document.expiresAt, language)}
            </Text>
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
  documentDateDanger: {
    color: colors.danger,
  },
  documentDateWarning: {
    color: colors.warning,
  },
  documentAlert: {
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderColor: colors.warning,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    padding: 12,
  },
  documentAlertCopy: {
    flex: 1,
  },
  documentAlertDanger: {
    backgroundColor: '#fee2e2',
    borderColor: colors.danger,
  },
  documentAlertIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  documentAlertMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  documentAlertTitle: {
    color: colors.ink,
    fontSize: 15,
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
  metricRowSecondary: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    maxWidth: '33%',
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
  selectorEmpty: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: 10,
  },
  vehicleChip: {
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 104,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  vehicleChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.cyan,
  },
  vehiclePlate: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  vehiclePlateActive: {
    color: colors.white,
  },
  vehicleSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 3,
    paddingTop: 10,
  },
  vehicleSelectorScroll: {
    marginTop: 2,
  },
  vehicleType: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  vehicleTypeActive: {
    color: '#a7f3ff',
  },
})
