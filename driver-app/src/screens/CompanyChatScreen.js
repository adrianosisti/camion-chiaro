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

function getSafeTimestamp(value) {
  if (!value) return 0
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

function padDatePart(value) {
  return String(value).padStart(2, '0')
}

function DriverAvatar({ name, uri }) {
  const [imageFailed, setImageFailed] = useState(false)
  const safeUri = typeof uri === 'string' && /^(https?:|file:|content:)/.test(uri) ? uri : ''

  return (
    <View style={styles.avatar}>
      {safeUri && !imageFailed ? (
        <Image onError={() => setImageFailed(true)} source={{ uri: safeUri }} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarText}>{getInitials(name)}</Text>
      )}
    </View>
  )
}

export function CompanyChatScreen({
  auditMessages = [],
  auditTeamMessages = [],
  chatThreads = [],
  companyLogoUrl,
  companyName,
  currentUserRole = 'company',
  driverPhotoUrls = {},
  drivers = [],
  incomingShare,
  isLoading = false,
  messages = [],
  onBackToDrivers,
  onIncomingShareConsumed,
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
  const [chatListMode, setChatListMode] = useState('write')
  const safeAuditTeamMessages = Array.isArray(auditTeamMessages) ? auditTeamMessages : []
  const safeChatThreads = Array.isArray(chatThreads) ? chatThreads : []
  const safeDrivers = Array.isArray(drivers) ? drivers : []
  const safePeople = Array.isArray(people) ? people : []
  const safeTeamThreads = Array.isArray(teamThreads) ? teamThreads : []
  const threadByDriverId = useMemo(
    () => new Map(safeChatThreads.map((thread) => [thread.driverId, thread])),
    [safeChatThreads],
  )
  const teamThreadById = useMemo(
    () => new Map(safeTeamThreads.map((thread) => [thread.id, thread])),
    [safeTeamThreads],
  )
  const conversationDrivers = useMemo(
    () => safeDrivers
      .filter((driver) => {
        const thread = threadByDriverId.get(driver.id)
        return Boolean(thread?.lastMessageAt || unreadByDriverId[driver.id])
      })
      .sort((firstDriver, secondDriver) => {
        const firstThread = threadByDriverId.get(firstDriver.id)
        const secondThread = threadByDriverId.get(secondDriver.id)
        return getSafeTimestamp(secondThread?.lastMessageAt) - getSafeTimestamp(firstThread?.lastMessageAt)
      }),
    [safeDrivers, threadByDriverId, unreadByDriverId],
  )
  const visibleDrivers = isStartingNewChat ? safeDrivers : conversationDrivers
  const staffPeople = safePeople.filter((person) => person.department !== 'drivers')
  const personById = useMemo(
    () => new Map(safePeople.map((person) => [person.id, person])),
    [safePeople],
  )
  const directTeamThreads = safeTeamThreads.filter((thread) => isDirectThread(thread))
  const companyDirectTeamThreads = directTeamThreads
    .filter((thread) => isCompanyDirectThread(thread))
    .sort((firstThread, secondThread) => getSafeTimestamp(secondThread.lastMessageAt) - getSafeTimestamp(firstThread.lastMessageAt))
  const employeePrivateTeamThreads = directTeamThreads.filter((thread) => !isCompanyDirectThread(thread))
  const groupTeamThreads = safeTeamThreads
    .filter((thread) => !isDirectThread(thread))
    .sort((firstThread, secondThread) => getSafeTimestamp(secondThread.lastMessageAt) - getSafeTimestamp(firstThread.lastMessageAt))
  const auditEntries = useMemo(() => {
    const teamEntries = safeAuditTeamMessages
      .filter((message) => message.senderRole !== 'company')
      .map((message) => {
      const thread = teamThreadById.get(message.threadId)
      if (!thread || isCompanyDirectThread(thread)) return null
      const senderPerson = safePeople.find((person) => person.id === message.senderPersonId)

      return {
        channel: thread?.title ?? 'Gruppo',
        createdAt: message.createdAt,
        id: `team-${message.id}`,
        kind: isDirectThread(thread) ? 'Privata' : getThreadKindLabel(thread),
        sender: senderPerson?.name ?? getPersonDepartmentLabel(message.senderRole),
        text: message.body || (message.attachmentPath ? 'Allegato' : 'Messaggio'),
      }
    })

    return teamEntries
      .filter(Boolean)
      .filter((entry) => entry.createdAt)
      .sort((firstEntry, secondEntry) => getSafeTimestamp(secondEntry.createdAt) - getSafeTimestamp(firstEntry.createdAt))
      .slice(0, 120)
  }, [safeAuditTeamMessages, safePeople, teamThreadById])
  const directConversationCount = conversationDrivers.length + companyDirectTeamThreads.length
  const groupConversationCount = groupTeamThreads.length
  const writeConversationCount = directConversationCount + groupConversationCount
  const auditConversationCount = auditEntries.length
  const activeModeTitle = chatListMode === 'audit' ? 'Controllo interno' : 'Scrivi messaggi'
  const hasVisibleRows = chatListMode === 'audit'
    ? auditEntries.length
    : visibleDrivers.length || companyDirectTeamThreads.length || groupTeamThreads.length || (isStartingNewChat && staffPeople.length)

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
            <Ionicons color={colors.ink} name="arrow-back" size={17} />
            <Text style={styles.backText}>Indietro</Text>
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
          incomingShare={incomingShare}
          messages={teamMessages}
          offlineLabel="gruppo"
          onIncomingShareConsumed={onIncomingShareConsumed}
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
            <Ionicons color={colors.ink} name="arrow-back" size={17} />
            <Text style={styles.backText}>Indietro</Text>
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
          incomingShare={incomingShare}
          messages={messages}
          offlineLabel="chat autista"
          onIncomingShareConsumed={onIncomingShareConsumed}
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
        <Text style={styles.heroTitle}>Messaggi azienda</Text>
        <Text style={styles.heroText}>Scrivi nelle chat aziendali oppure controlla, separatamente, le conversazioni interne.</Text>
      </View>

      <ChatModeCards
        counts={{
          audit: auditConversationCount,
          write: writeConversationCount,
        }}
        mode={chatListMode}
        onChange={(nextMode) => {
          setChatListMode(nextMode)
          setIsStartingNewChat(false)
        }}
        showAudit
      />

      <View style={styles.modeLead}>
        <View style={styles.modeLeadCopy}>
          <Text style={styles.modeLeadLabel}>Stai vedendo</Text>
          <Text style={styles.modeLeadTitle}>{activeModeTitle}</Text>
        </View>
        {chatListMode === 'write' ? (
          <Pressable
            onPress={() => {
              setIsStartingNewChat((currentValue) => !currentValue)
            }}
            style={[styles.newChatButton, isStartingNewChat && styles.newChatButtonActive]}
          >
            <Ionicons color={isStartingNewChat ? colors.white : colors.ink} name={isStartingNewChat ? 'chatbubbles-outline' : 'add-circle-outline'} size={18} />
            <Text style={[styles.newChatText, isStartingNewChat && styles.newChatTextActive]}>
              {isStartingNewChat ? 'Mostra chat' : 'Nuova singola'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {chatListMode === 'write' && isStartingNewChat && staffPeople.length ? (
        <View style={styles.groupBlock}>
          <Text style={styles.groupBlockTitle}>Nuova singola con ufficio e magazzino</Text>
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

      {chatListMode === 'write' && (visibleDrivers.length || companyDirectTeamThreads.length) ? (
        <View style={styles.groupBlock}>
          <Text style={styles.groupBlockTitle}>Chat singole dove l azienda scrive</Text>
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
          {companyDirectTeamThreads.map((thread) => (
            <TeamChatRow
              key={thread.id}
              onPress={() => {
                setIsStartingNewChat(false)
                onSelectTeamThread?.(thread)
              }}
              peopleById={personById}
              thread={thread}
            />
          ))}
        </View>
      ) : null}

      {chatListMode === 'write' && groupTeamThreads.length ? (
        <View style={styles.groupBlock}>
          <Text style={styles.groupBlockTitle}>Gruppi dove l azienda può scrivere</Text>
          {groupTeamThreads.map((thread) => (
            <TeamChatRow
              key={thread.id}
              onPress={() => {
                setIsStartingNewChat(false)
                onSelectTeamThread?.(thread)
              }}
              peopleById={personById}
              thread={thread}
            />
          ))}
        </View>
      ) : null}

      {chatListMode === 'audit' ? (
        <View style={styles.groupBlock}>
          <Text style={styles.groupBlockTitle}>Controllo interno solo lettura</Text>
          {auditEntries.map((entry) => (
            <AuditChatRow entry={entry} key={entry.id} />
          ))}
          {employeePrivateTeamThreads.length > 0 ? (
            <Text style={styles.auditHint}>
              Include chat private e gruppi tra dipendenti. L azienda qui legge soltanto.
            </Text>
          ) : null}
        </View>
      ) : null}

      {!hasVisibleRows ? (
        <Text style={styles.emptyText}>
          {isLoading
            ? 'Carico chat...'
            : chatListMode === 'audit'
              ? 'Nessun messaggio interno da controllare.'
            : isStartingNewChat
              ? 'Nessun autista in anagrafica.'
                : 'Nessuna conversazione presente. Premi Nuova singola o usa un gruppo aziendale.'}
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
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return 'Nessun messaggio'
  return `${padDatePart(date.getDate())}/${padDatePart(date.getMonth() + 1)} ${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`
}

function DriverChatRow({ driver, lastMessageAt, onPress, photoUrl, unreadCount = 0 }) {
  const roleLabel = driver.role || 'Autista'

  return (
    <Pressable onPress={onPress} style={styles.driverRow}>
      <DriverAvatar name={driver.name} uri={photoUrl} />
      <View style={styles.driverCopy}>
        <Text style={styles.driverName}>{driver.name}</Text>
        <Text style={styles.driverMeta}>{roleLabel} · {formatLastMessageDate(lastMessageAt)}</Text>
      </View>
      <View style={styles.rowActions}>
        <Text style={[styles.kindBadge, styles.kindBadgeDriver]}>{roleLabel}</Text>
        {unreadCount > 0 ? <Text style={styles.unreadBadge}>{unreadCount}</Text> : <Text style={styles.openText}>Apri</Text>}
      </View>
    </Pressable>
  )
}

function TeamChatRow({ onPress, peopleById, thread }) {
  const kind = getThreadKind(thread)
  const isDirect = kind === 'direct'
  const targetPerson = getCompanyDirectPerson(thread, peopleById)
  const badgeLabel = targetPerson
    ? getPersonDepartmentLabel(targetPerson.department)
    : getThreadKindLabel(thread)
  const subtitle = targetPerson
    ? `${targetPerson.jobTitle || 'Operatore'} · ${formatLastMessageDate(thread.lastMessageAt)}`
    : `${getAudienceLabel(thread.audienceType)} · ${formatLastMessageDate(thread.lastMessageAt)}`

  return (
    <Pressable onPress={onPress} style={[styles.driverRow, isDirect && styles.directRow]}>
      {targetPerson ? (
        <DriverAvatar name={targetPerson.name} />
      ) : (
        <View style={[styles.groupAvatar, isDirect && styles.directAvatar]}>
          <Ionicons color={isDirect ? colors.white : colors.ink} name={isDirect ? 'person-circle-outline' : getGroupIcon(thread.audienceType)} size={22} />
        </View>
      )}
      <View style={styles.driverCopy}>
        <Text style={styles.driverName}>{thread.title}</Text>
        <Text style={styles.driverMeta}>{subtitle}</Text>
      </View>
      <View style={styles.rowActions}>
        <Text style={[styles.kindBadge, isDirect ? styles.kindBadgeDirect : styles.kindBadgeGroup]}>
          {badgeLabel}
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
      <DriverAvatar name={person.name} />
      <View style={styles.driverCopy}>
        <Text style={styles.driverName}>{person.name}</Text>
        <Text style={styles.driverMeta}>{getPersonDepartmentLabel(person.department)} · {person.jobTitle || 'Operatore'}</Text>
      </View>
      <View style={styles.rowActions}>
        <Text style={[styles.kindBadge, styles.kindBadgeDirect]}>{getPersonDepartmentLabel(person.department)}</Text>
        <Text style={styles.openText}>Scrivi</Text>
      </View>
    </Pressable>
  )
}

function ChatModeCards({ counts = {}, mode, onChange, showAudit = false }) {
  const items = [
    {
      count: counts.write ?? 0,
      id: 'write',
      icon: 'chatbubbles-outline',
      label: 'Scrivi messaggi',
      subtitle: 'Singole e gruppi aziendali',
    },
    showAudit ? {
      count: counts.audit ?? 0,
      id: 'audit',
      icon: 'shield-checkmark-outline',
      label: 'Controllo interno',
      subtitle: 'Solo lettura tra dipendenti',
    } : null,
  ].filter(Boolean)

  return (
    <View style={styles.modeCards}>
      {items.map((item) => {
        const isActive = mode === item.id

        return (
          <Pressable
            key={item.id}
            onPress={() => onChange?.(item.id)}
            style={[styles.modeCard, isActive && styles.modeCardActive]}
          >
            <View style={[styles.modeIconShell, isActive && styles.modeIconShellActive]}>
              <Ionicons color={isActive ? colors.ink : colors.white} name={item.icon} size={21} />
            </View>
            <View style={styles.modeCardCopy}>
              <Text numberOfLines={1} style={styles.modeCardTitle}>{item.label}</Text>
              <Text numberOfLines={1} style={styles.modeCardSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={[styles.modeCount, isActive && styles.modeCountActive]}>{item.count}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

function AuditChatRow({ entry }) {
  return (
    <View style={styles.auditRow}>
      <View style={styles.auditHead}>
        <Text numberOfLines={1} style={styles.auditChannel}>{entry.channel}</Text>
        <Text style={styles.auditDate}>{formatLastMessageDate(entry.createdAt)}</Text>
      </View>
      <View style={styles.auditMeta}>
        <Text style={styles.auditKind}>{entry.kind}</Text>
        <Text numberOfLines={1} style={styles.auditSender}>{entry.sender}</Text>
      </View>
      <Text numberOfLines={2} style={styles.auditText}>{entry.text}</Text>
      <Text style={styles.auditReadOnly}>Solo lettura</Text>
    </View>
  )
}

function getThreadKind(thread = {}) {
  if (thread.threadType === 'direct' || thread.audienceType === 'direct') return 'direct'
  if (['drivers', 'office', 'warehouse'].includes(thread.audienceType)) return 'department'
  return 'group'
}

function isDirectThread(thread = {}) {
  return getThreadKind(thread) === 'direct'
}

function isCompanyDirectThread(thread = {}) {
  return isDirectThread(thread) && String(thread.directKey ?? '').startsWith('company:')
}

function getCompanyDirectPerson(thread = {}, peopleById = new Map()) {
  const directKey = String(thread.directKey ?? '')
  if (!directKey.startsWith('company:')) return null
  const personId = directKey.slice('company:'.length)
  return peopleById.get(personId) ?? null
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
  auditChannel: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
  },
  auditDate: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  auditHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  auditKind: {
    backgroundColor: '#cffafe',
    borderRadius: 999,
    color: colors.cyanDark,
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    textTransform: 'uppercase',
  },
  auditMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  auditReadOnly: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    textTransform: 'uppercase',
  },
  auditRow: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    gap: 7,
    marginBottom: 10,
    padding: 12,
  },
  auditSender: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  auditText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
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
  kindBadgeDriver: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  kindBadgeGroup: {
    backgroundColor: '#cffafe',
    color: colors.ink,
  },
  auditHint: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 2,
    textAlign: 'center',
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
  modeCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: '#cfe8f3',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 72,
    padding: 12,
  },
  modeCardActive: {
    backgroundColor: '#ecfeff',
    borderColor: colors.cyan,
    borderWidth: 2,
  },
  modeCardCopy: {
    flex: 1,
    minWidth: 0,
  },
  modeCardSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  modeCardTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  modeCards: {
    gap: 9,
    marginBottom: 12,
  },
  modeCount: {
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    color: colors.cyanDark,
    fontSize: 13,
    fontWeight: '900',
    minWidth: 32,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 6,
    textAlign: 'center',
  },
  modeCountActive: {
    backgroundColor: colors.cyan,
    color: colors.ink,
  },
  modeIconShell: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 16,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  modeIconShellActive: {
    backgroundColor: colors.cyan,
  },
  modeLead: {
    alignItems: 'center',
    backgroundColor: '#f8fdff',
    borderColor: '#d7f2fb',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 12,
  },
  modeLeadCopy: {
    flex: 1,
    minWidth: 0,
  },
  modeLeadLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  modeLeadTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  modeTab: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: '#cfe8f3',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 8,
  },
  modeTabActive: {
    backgroundColor: '#cffafe',
    borderColor: colors.cyan,
  },
  modeTabCount: {
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
    minWidth: 24,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 3,
    textAlign: 'center',
  },
  modeTabCountActive: {
    backgroundColor: colors.cyan,
    color: colors.ink,
  },
  modeTabText: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
  },
  modeTabTextActive: {
    color: colors.ink,
  },
  modeTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
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
