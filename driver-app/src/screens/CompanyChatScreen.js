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
  onSelectPerson,
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
  people = [],
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
  const staffPeople = people.filter((person) => person.department !== 'drivers')
  const visibleTeamThreads = isStartingNewChat
    ? teamThreads.filter((thread) => thread.threadType === 'group')
    : teamThreads
  const hasVisibleRows = visibleDrivers.length || visibleTeamThreads.length || (isStartingNewChat && staffPeople.length)

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
            <Text numberOfLines={1} style={styles.selectedSubtitle}>
              {getThreadKindLabel(selectedTeamThread)} · {getAudienceLabel(selectedTeamThread.audienceType)}
            </Text>
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

      {visibleTeamThreads.length ? (
        <View style={styles.groupBlock}>
          <Text style={styles.groupBlockTitle}>{isStartingNewChat ? 'Gruppi reparto' : 'Gruppi, reparti e dirette'}</Text>
          {visibleTeamThreads.map((thread) => (
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

      {isStartingNewChat && staffPeople.length ? (
        <View style={styles.groupBlock}>
          <Text style={styles.groupBlockTitle}>Persone ufficio e magazzino</Text>
          {staffPeople.map((person) => (
            <PersonChatRow
              key={person.id}
              onPress={() => {
                setIsStartingNewChat(false)
                onSelectPerson?.(person)
              }}
              person={person}
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

      {!hasVisibleRows ? (
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
  const kind = getThreadKind(thread)
  const isDirect = kind === 'direct'

  return (
    <Pressable onPress={onPress} style={[styles.driverRow, isDirect && styles.directRow]}>
      <View style={[styles.groupAvatar, isDirect && styles.directAvatar]}>
        <Ionicons color={isDirect ? colors.white : colors.ink} name={isDirect ? 'person-circle-outline' : getGroupIcon(thread.audienceType)} size={22} />
      </View>
      <View style={styles.driverCopy}>
        <Text style={styles.driverName}>{thread.title}</Text>
        <Text style={styles.driverMeta}>{getAudienceLabel(thread.audienceType)} · {formatLastMessageDate(thread.lastMessageAt)}</Text>
      </View>
      <View style={styles.rowActions}>
        <Text style={[styles.kindBadge, isDirect ? styles.kindBadgeDirect : styles.kindBadgeGroup]}>
          {getThreadKindLabel(thread)}
        </Text>
        <Text style={styles.openText}>Apri</Text>
      </View>
    </Pressable>
  )
}

function getPersonDepartmentLabel(value = '') {
  if (value === 'warehouse') return 'Magazzino'
  if (value === 'office') return 'Ufficio'
  return 'Persona'
}

function PersonChatRow({ onPress, person }) {
  return (
    <Pressable onPress={onPress} style={[styles.driverRow, styles.directRow]}>
      <View style={[styles.groupAvatar, styles.directAvatar]}>
        <Ionicons color={colors.white} name={person.department === 'warehouse' ? 'cube-outline' : 'briefcase-outline'} size={22} />
      </View>
      <View style={styles.driverCopy}>
        <Text style={styles.driverName}>{person.name}</Text>
        <Text style={styles.driverMeta}>{getPersonDepartmentLabel(person.department)} · {person.jobTitle || 'Operatore'}</Text>
      </View>
      <View style={styles.rowActions}>
        <Text style={[styles.kindBadge, styles.kindBadgeDirect]}>Diretta</Text>
        <Text style={styles.openText}>Scrivi</Text>
      </View>
    </Pressable>
  )
}

function getThreadKind(thread = {}) {
  if (thread.threadType === 'direct' || thread.audienceType === 'direct') return 'direct'
  if (['drivers', 'office', 'warehouse'].includes(thread.audienceType)) return 'department'
  return 'group'
}

function getThreadKindLabel(thread = {}) {
  const kind = getThreadKind(thread)
  if (kind === 'direct') return 'Diretta'
  if (kind === 'department') return 'Reparto'
  return 'Gruppo'
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
  directAvatar: {
    backgroundColor: colors.ink,
  },
  directRow: {
    borderColor: '#9ccfea',
    borderWidth: 1.5,
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
  kindBadge: {
    borderRadius: 999,
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 3,
    textTransform: 'uppercase',
  },
  kindBadgeDirect: {
    backgroundColor: colors.ink,
    color: colors.white,
  },
  kindBadgeGroup: {
    backgroundColor: '#cffafe',
    color: colors.ink,
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
  rowActions: {
    alignItems: 'flex-end',
    gap: 5,
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
