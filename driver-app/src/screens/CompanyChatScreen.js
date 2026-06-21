import { useMemo, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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
  chatThreads = [],
  companyLogoUrl,
  companyName,
  currentUserRole = 'company',
  driverPhotoUrls = {},
  drivers = [],
  isLoading = false,
  messages = [],
  onBackToDrivers,
  onReactToMessage,
  onRefresh,
  onSelectDriver,
  onSelectTeamThread,
  onSend,
  onSendTeamMessage,
  onTyping,
  selectedTeamThread,
  selectedDriver,
  selectedDriverOnline = false,
  selectedDriverTyping = false,
  soundEnabled = true,
  teamMessages = [],
  teamThreads = [],
  unreadByDriverId = {},
}) {
  const [isStartingNewChat, setIsStartingNewChat] = useState(false)
  const threadByDriverId = useMemo(
    () => new Map(chatThreads.map((thread) => [thread.driverId, thread])),
    [chatThreads],
  )
  const conversationDrivers = useMemo(
    () => drivers
      .filter((driver) => {
        const thread = threadByDriverId.get(driver.id)
        return Boolean(thread?.lastMessageAt || unreadByDriverId[driver.id])
      })
      .sort((firstDriver, secondDriver) => {
        const firstThread = threadByDriverId.get(firstDriver.id)
        const secondThread = threadByDriverId.get(secondDriver.id)
        return new Date(secondThread?.lastMessageAt || 0) - new Date(firstThread?.lastMessageAt || 0)
      }),
    [drivers, threadByDriverId, unreadByDriverId],
  )
  const visibleDrivers = isStartingNewChat ? drivers : conversationDrivers

  if (selectedTeamThread) {
    return (
      <View style={styles.chatWrap}>
        <View style={styles.selectedBar}>
          <Pressable
            onPress={() => {
              setIsStartingNewChat(false)
              onBackToDrivers?.()
            }}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Chat</Text>
          </Pressable>
          <View style={styles.selectedTitleWrap}>
            <Text numberOfLines={1} style={styles.selectedTitle}>{selectedTeamThread.title}</Text>
            <Text numberOfLines={1} style={styles.selectedSubtitle}>{getAudienceLabel(selectedTeamThread.audienceType)}</Text>
          </View>
        </View>
        <ChatScreen
          companyLogoUrl={companyLogoUrl}
          companyName={selectedTeamThread.title}
          companyOnline
          currentUserRole={currentUserRole}
          messages={teamMessages}
          offlineLabel="gruppo"
          onRefresh={onRefresh}
          onSend={onSendTeamMessage}
          onTyping={onTyping}
          ownAvatarUrl={companyLogoUrl}
          participantAvatarUrl={companyLogoUrl}
          participantName={selectedTeamThread.title}
          soundEnabled={soundEnabled}
        />
      </View>
    )
  }

  if (selectedDriver) {
    const driverPhotoUrl = driverPhotoUrls[selectedDriver.id] ?? ''

    return (
      <View style={styles.chatWrap}>
        <View style={styles.selectedBar}>
          <Pressable
            onPress={() => {
              setIsStartingNewChat(false)
              onBackToDrivers?.()
            }}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Chat</Text>
          </Pressable>
          <Text numberOfLines={1} style={styles.selectedTitle}>{selectedDriver.name}</Text>
        </View>
        <ChatScreen
          companyLogoUrl={companyLogoUrl}
          companyName={selectedDriver.name}
          companyOnline={selectedDriverOnline}
          companyTyping={selectedDriverTyping}
          currentUserRole="company"
          driverProfileUrl={driverPhotoUrl}
          messages={messages}
          offlineLabel="chat autista"
          onReactToMessage={onReactToMessage}
          onRefresh={onRefresh}
          onSend={onSend}
          onTyping={onTyping}
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
        <Text style={styles.heroTitle}>Chat azienda</Text>
        <Text style={styles.heroText}>
          {isStartingNewChat
            ? 'Scegli un autista dall anagrafica e avvia la conversazione.'
            : 'Conversazioni attive, reparti e gruppi aziendali.'}
        </Text>
        <View style={styles.heroActions}>
          <Pressable
            onPress={() => setIsStartingNewChat((currentValue) => !currentValue)}
            style={[styles.newChatButton, isStartingNewChat && styles.newChatButtonActive]}
          >
            <Ionicons color={isStartingNewChat ? colors.white : colors.ink} name={isStartingNewChat ? 'chatbubbles-outline' : 'add-circle-outline'} size={18} />
            <Text style={[styles.newChatText, isStartingNewChat && styles.newChatTextActive]}>
              {isStartingNewChat ? 'Conversazioni' : 'Nuova chat'}
            </Text>
          </Pressable>
        </View>
      </View>

      {teamThreads.length ? (
        <View style={styles.groupBlock}>
          <Text style={styles.groupBlockTitle}>Gruppi e reparti</Text>
          {teamThreads.map((thread) => (
            <TeamChatRow
              key={thread.id}
              onPress={() => {
                setIsStartingNewChat(false)
                onSelectTeamThread?.(thread)
              }}
              thread={thread}
            />
          ))}
        </View>
      ) : null}

      {visibleDrivers.map((driver) => (
        <DriverChatRow
          driver={driver}
          key={driver.id}
          lastMessageAt={threadByDriverId.get(driver.id)?.lastMessageAt}
          onPress={() => {
            setIsStartingNewChat(false)
            onSelectDriver?.(driver)
          }}
          photoUrl={driverPhotoUrls[driver.id]}
          unreadCount={unreadByDriverId[driver.id] ?? 0}
        />
      ))}

      {!visibleDrivers.length ? (
        <Text style={styles.emptyText}>
          {isLoading
            ? 'Carico chat...'
            : isStartingNewChat
              ? 'Nessun autista in anagrafica.'
              : 'Nessuna conversazione presente. Premi Nuova chat per scrivere a un autista.'}
        </Text>
      ) : null}
    </ScrollView>
  )
}

function getAudienceLabel(value = '') {
  const labels = {
    all: 'Tutta l azienda',
    custom: 'Gruppo personalizzato',
    direct: 'Chat diretta',
    drivers: 'Autisti',
    office: 'Ufficio',
    warehouse: 'Magazzino',
  }

  return labels[value] ?? 'Gruppo'
}

function formatLastMessageDate(value) {
  if (!value) return 'Nessun messaggio'
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value))
}

function DriverChatRow({ driver, lastMessageAt, onPress, photoUrl, unreadCount = 0 }) {
  return (
    <Pressable onPress={onPress} style={styles.driverRow}>
      <DriverAvatar name={driver.name} uri={photoUrl} />
      <View style={styles.driverCopy}>
        <Text style={styles.driverName}>{driver.name}</Text>
        <Text style={styles.driverMeta}>{driver.role || 'Autista'} · {formatLastMessageDate(lastMessageAt)}</Text>
      </View>
      {unreadCount > 0 ? <Text style={styles.unreadBadge}>{unreadCount}</Text> : <Text style={styles.openText}>Apri</Text>}
    </Pressable>
  )
}

function TeamChatRow({ onPress, thread }) {
  return (
    <Pressable onPress={onPress} style={styles.driverRow}>
      <View style={styles.groupAvatar}>
        <Ionicons color={colors.ink} name={getGroupIcon(thread.audienceType)} size={22} />
      </View>
      <View style={styles.driverCopy}>
        <Text style={styles.driverName}>{thread.title}</Text>
        <Text style={styles.driverMeta}>{getAudienceLabel(thread.audienceType)} · {formatLastMessageDate(thread.lastMessageAt)}</Text>
      </View>
      <Text style={styles.openText}>Apri</Text>
    </Pressable>
  )
}

function getGroupIcon(value = '') {
  if (value === 'drivers') return 'bus-outline'
  if (value === 'warehouse') return 'cube-outline'
  if (value === 'office') return 'briefcase-outline'
  if (value === 'all') return 'megaphone-outline'
  return 'people-outline'
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
  groupAvatar: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 16,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  groupBlock: {
    marginBottom: 14,
  },
  groupBlockTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
    marginLeft: 2,
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
  heroActions: {
    alignItems: 'flex-start',
    marginTop: 14,
  },
  newChatButton: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 7,
    minHeight: 38,
    paddingHorizontal: 12,
  },
  newChatButtonActive: {
    backgroundColor: '#123047',
  },
  newChatText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  newChatTextActive: {
    color: colors.white,
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
    fontSize: 15,
    fontWeight: '900',
  },
  selectedSubtitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  selectedTitleWrap: {
    flex: 1,
  },
})
