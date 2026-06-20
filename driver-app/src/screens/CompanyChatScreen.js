import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { ChatScreen } from './ChatScreen'
import { colors, layout } from '../theme'

function getInitials(value = 'A') {
  return String(value)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'A'
}

function DriverAvatar({ name, uri }) {
  return (
    <View style={styles.avatar}>
      {uri ? <Image source={{ uri }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{getInitials(name)}</Text>}
    </View>
  )
}

export function CompanyChatScreen({
  companyLogoUrl,
  companyName,
  driverPhotoUrls = {},
  drivers = [],
  isLoading = false,
  messages = [],
  onBackToDrivers,
  onReactToMessage,
  onRefresh,
  onSelectDriver,
  onSend,
  selectedDriver,
  soundEnabled = true,
  unreadByDriverId = {},
}) {
  if (selectedDriver) {
    const driverPhotoUrl = driverPhotoUrls[selectedDriver.id] ?? ''

    return (
      <View style={styles.chatWrap}>
        <View style={styles.selectedBar}>
          <Pressable onPress={onBackToDrivers} style={styles.backButton}>
            <Text style={styles.backText}>Autisti</Text>
          </Pressable>
          <Text numberOfLines={1} style={styles.selectedTitle}>{selectedDriver.name}</Text>
        </View>
        <ChatScreen
          companyLogoUrl={companyLogoUrl}
          companyName={selectedDriver.name}
          currentUserRole="company"
          driverProfileUrl={driverPhotoUrl}
          messages={messages}
          offlineLabel="chat autista"
          onReactToMessage={onReactToMessage}
          onRefresh={onRefresh}
          onSend={onSend}
          ownAvatarUrl={companyLogoUrl}
          participantAvatarUrl={driverPhotoUrl}
          participantName={selectedDriver.name}
          soundEnabled={soundEnabled}
        />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Chat autisti</Text>
        <Text style={styles.heroText}>Apri una conversazione per scrivere, vedere media e rispondere ai messaggi.</Text>
      </View>

      {drivers.map((driver) => (
        <DriverChatRow
          driver={driver}
          key={driver.id}
          onPress={() => onSelectDriver?.(driver)}
          photoUrl={driverPhotoUrls[driver.id]}
          unreadCount={unreadByDriverId[driver.id] ?? 0}
        />
      ))}

      {!drivers.length ? (
        <Text style={styles.emptyText}>{isLoading ? 'Carico autisti...' : 'Nessun autista presente.'}</Text>
      ) : null}
    </ScrollView>
  )
}

function DriverChatRow({ driver, onPress, photoUrl, unreadCount = 0 }) {
  return (
    <Pressable onPress={onPress} style={styles.driverRow}>
      <DriverAvatar name={driver.name} uri={photoUrl} />
      <View style={styles.driverCopy}>
        <Text style={styles.driverName}>{driver.name}</Text>
        <Text style={styles.driverMeta}>{driver.role || 'Autista'} · {driver.phone || driver.username}</Text>
      </View>
      {unreadCount > 0 ? <Text style={styles.unreadBadge}>{unreadCount}</Text> : <Text style={styles.openText}>Apri</Text>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 16,
    height: 46,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 46,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  backButton: {
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  chatWrap: {
    flex: 1,
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
  },
  driverCopy: {
    flex: 1,
  },
  driverMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  driverName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  driverRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: 20,
    marginBottom: 12,
    padding: 16,
  },
  heroText: {
    color: '#cffafe',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 5,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  openText: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
  },
  unreadBadge: {
    backgroundColor: colors.cyan,
    borderRadius: 999,
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    minWidth: 24,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 4,
    textAlign: 'center',
  },
  selectedBar: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 8,
  },
  selectedTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
  },
})
