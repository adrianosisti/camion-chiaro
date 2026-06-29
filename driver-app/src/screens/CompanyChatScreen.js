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

function normalizeIdentity(value = '') {
  return String(value).trim().toLowerCase()
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
  unreadTeamByThreadId = {},
}) {
  const [isStartingNewChat, setIsStartingNewChat] = useState(false)
  const [chatListMode, setChatListMode] = useState('all')
  const safeChatThreads = Array.isArray(chatThreads) ? chatThreads : []
  const safeDrivers = Array.isArray(drivers) ? drivers : []
  const safePeople = Array.isArray(people) ? people : []
  const safeTeamThreads = Array.isArray(teamThreads) ? teamThreads : []
  const threadByDriverId = useMemo(
    () => new Map(safeChatThreads.map((thread) => [thread.driverId, thread])),
    [safeChatThreads],
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
  const driverByPersonId = useMemo(
    () => buildDriverByPersonId(safePeople, safeDrivers),
    [safePeople, safeDrivers],
  )
  const normalizedTeamMessages = useMemo(
    () => (Array.isArray(teamMessages) ? teamMessages : []).map((message) => {
      const hasPersonSender = Boolean(message.senderPersonId)

      return {
        ...message,
        senderAvatarUrl: getTeamMessageSenderAvatarUrl(message, personById, driverPhotoUrls, driverByPersonId),
        senderName: getTeamMessageSenderName(message, personById, companyName),
        senderRole: hasPersonSender ? 'team' : message.senderRole,
      }
    }),
    [companyName, driverByPersonId, driverPhotoUrls, personById, teamMessages],
  )
  const companyVisibleTeamThreads = safeTeamThreads.filter((thread) => isCompanyVisibleThread(thread))
  const directTeamThreads = companyVisibleTeamThreads.filter((thread) => isDirectThread(thread))
  const companyDirectTeamThreads = directTeamThreads
    .filter((thread) => isCompanyDirectThread(thread))
    .sort((firstThread, secondThread) => getSafeTimestamp(secondThread.lastMessageAt) - getSafeTimestamp(firstThread.lastMessageAt))
  const groupTeamThreads = companyVisibleTeamThreads
    .filter((thread) => isCompanyGroupThread(thread))
    .sort((firstThread, secondThread) => getSafeTimestamp(secondThread.lastMessageAt) - getSafeTimestamp(firstThread.lastMessageAt))
  const directChatRows = useMemo(
    () => [
      ...visibleDrivers.map((driver) => {
        const thread = threadByDriverId.get(driver.id)

        return {
          driver,
          id: `driver-${driver.id}`,
          lastMessageAt: thread?.lastMessageAt ?? '',
          timestamp: getSafeTimestamp(thread?.lastMessageAt),
          type: 'driver',
          unreadCount: unreadByDriverId[driver.id] ?? 0,
        }
      }),
      ...companyDirectTeamThreads.map((thread) => ({
        id: `team-${thread.id}`,
        lastMessageAt: thread.lastMessageAt ?? '',
        thread,
        timestamp: getSafeTimestamp(thread.lastMessageAt),
        type: 'team',
        unreadCount: unreadTeamByThreadId[thread.id] ?? 0,
      })),
    ].sort((firstRow, secondRow) => {
      const dateDiff = secondRow.timestamp - firstRow.timestamp
      if (dateDiff) return dateDiff

      return getDirectRowTitle(firstRow).localeCompare(getDirectRowTitle(secondRow), 'it')
    }),
    [companyDirectTeamThreads, threadByDriverId, unreadByDriverId, unreadTeamByThreadId, visibleDrivers],
  )
  const directConversationCount = conversationDrivers.length + companyDirectTeamThreads.length
  const groupConversationCount = groupTeamThreads.length
  const directUnreadCount = directChatRows.reduce((total, row) => total + Number(row.unreadCount ?? 0), 0)
  const groupUnreadCount = groupTeamThreads.reduce((total, thread) => total + Number(unreadTeamByThreadId[thread.id] ?? 0), 0)
  const teamChatRows = groupTeamThreads.map((thread) => ({
    id: `team-${thread.id}`,
    lastMessageAt: thread.lastMessageAt ?? '',
    thread,
    timestamp: getSafeTimestamp(thread.lastMessageAt),
    type: 'team',
    unreadCount: unreadTeamByThreadId[thread.id] ?? 0,
  }))
  const allChatRows = [...directChatRows, ...teamChatRows].sort((firstRow, secondRow) => {
    const dateDiff = secondRow.timestamp - firstRow.timestamp
    if (dateDiff) return dateDiff

    return getDirectRowTitle(firstRow).localeCompare(getDirectRowTitle(secondRow), 'it')
  })
  const visibleChatRows = allChatRows.filter((row) => {
    if (chatListMode === 'direct') return row.type === 'driver' || isDirectThread(row.thread)
    if (chatListMode === 'groups') return row.type === 'team' && !isDirectThread(row.thread)
    if (chatListMode === 'unread') return Number(row.unreadCount ?? 0) > 0
    return true
  })
  const totalUnreadCount = directUnreadCount + groupUnreadCount
  const hasVisibleRows = visibleChatRows.length || (chatListMode === 'direct' && isStartingNewChat && staffPeople.length)

  if (selectedTeamThread && isCompanyVisibleThread(selectedTeamThread)) {
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
          messages={normalizedTeamMessages}
          offlineLabel="gruppo"
          onIncomingShareConsumed={onIncomingShareConsumed}
          onRefresh={onRefresh}
          onSend={onSendTeamMessage}
          onTyping={onTyping}
          ownAvatarUrl={companyLogoUrl}
          participantAvatarUrl={companyLogoUrl}
          participantIcon={getGroupIcon(selectedTeamThread.audienceType)}
          participantName={selectedTeamThread.title}
          showSenderNames={!isDirectThread(selectedTeamThread)}
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
        <Text style={styles.heroText}>Una inbox unica: ultime conversazioni in alto, non letti evidenti, gruppi separabili con un tocco.</Text>
      </View>

      <View style={styles.inboxSummary}>
        <View style={styles.inboxSummaryCopy}>
          <Text style={styles.inboxKicker}>Inbox azienda</Text>
          <Text style={styles.inboxTitle}>
            {allChatRows.length} chat · {totalUnreadCount ? `${totalUnreadCount} da leggere` : 'tutto letto'}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            setChatListMode('direct')
            setIsStartingNewChat((currentValue) => !currentValue)
          }}
          style={[styles.newChatButton, isStartingNewChat && styles.newChatButtonActive]}
        >
          <Ionicons color={isStartingNewChat ? colors.white : colors.ink} name={isStartingNewChat ? 'chatbubbles-outline' : 'add-circle-outline'} size={18} />
          <Text style={[styles.newChatText, isStartingNewChat && styles.newChatTextActive]}>
            {isStartingNewChat ? 'Lista' : 'Nuova'}
          </Text>
        </Pressable>
      </View>

      <ChatFilterBar
        counts={{
          all: allChatRows.length,
          direct: directConversationCount,
          groups: groupConversationCount,
          unread: totalUnreadCount,
        }}
        mode={chatListMode}
        onChange={(nextMode) => {
          setChatListMode(nextMode)
          setIsStartingNewChat(false)
        }}
      />

      {chatListMode === 'direct' && isStartingNewChat && staffPeople.length ? (
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
              photoUrl={getPersonAvatarUrl(person, driverPhotoUrls, driverByPersonId)}
            />
          ))}
        </View>
      ) : null}

      {visibleChatRows.length ? (
        <View style={styles.groupBlock}>
          <Text style={styles.groupBlockTitle}>Conversazioni</Text>
          {visibleChatRows.map((row) => (
            row.type === 'driver' ? (
              <DriverChatRow
                driver={row.driver}
                key={row.id}
                lastMessageAt={row.lastMessageAt}
                onPress={() => {
                  setIsStartingNewChat(false)
                  onSelectDriver?.(row.driver)
                }}
                photoUrl={driverPhotoUrls[row.driver.id]}
                unreadCount={row.unreadCount}
              />
            ) : (
              <TeamChatRow
                key={row.id}
                onPress={() => {
                  setIsStartingNewChat(false)
                  onSelectTeamThread?.(row.thread)
                }}
                peopleById={personById}
                driverByPersonId={driverByPersonId}
                driverPhotoUrls={driverPhotoUrls}
                thread={row.thread}
                unreadCount={row.unreadCount}
              />
            )
          ))}
        </View>
      ) : null}

      {!hasVisibleRows ? (
        <Text style={styles.emptyText}>
          {isLoading
            ? 'Carico chat...'
            : isStartingNewChat
              ? 'Nessuna persona disponibile per una nuova chat.'
              : chatListMode === 'unread'
                ? 'Nessun messaggio da leggere.'
              : chatListMode === 'groups'
                ? 'Nessun gruppo aziendale disponibile.'
                : 'Nessuna conversazione presente. Premi Nuova singola.'}
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

function getDirectRowTitle(row = {}) {
  return row.driver?.name ?? row.thread?.title ?? ''
}

function DriverChatRow({ driver, lastMessageAt, onPress, photoUrl, unreadCount = 0 }) {
  const roleLabel = driver.role || 'Autista'

  return (
    <Pressable onPress={onPress} style={styles.driverRow}>
      <DriverAvatar name={driver.name} uri={photoUrl} />
      <View style={styles.driverCopy}>
        <Text style={styles.driverName}>{driver.name}</Text>
        <Text style={styles.driverMeta}>{roleLabel}</Text>
      </View>
      <View style={styles.rowActions}>
        <Text style={styles.rowTime}>{formatLastMessageDate(lastMessageAt)}</Text>
        {unreadCount > 0 ? <Text style={styles.unreadBadge}>{unreadCount}</Text> : <Ionicons color={colors.muted} name="chevron-forward" size={16} />}
      </View>
    </Pressable>
  )
}

function TeamChatRow({ driverByPersonId = new Map(), driverPhotoUrls = {}, onPress, peopleById, thread, unreadCount = 0 }) {
  const kind = getThreadKind(thread)
  const isDirect = kind === 'direct'
  const targetPerson = getCompanyDirectPerson(thread, peopleById)
  const subtitle = targetPerson
    ? `${targetPerson.jobTitle || 'Operatore'} · ${getPersonDepartmentLabel(targetPerson.department)}`
    : `${getThreadKindLabel(thread)} · ${getAudienceLabel(thread.audienceType)}`

  return (
    <Pressable onPress={onPress} style={[styles.driverRow, isDirect && styles.directRow]}>
      {targetPerson ? (
        <DriverAvatar name={targetPerson.name} uri={getPersonAvatarUrl(targetPerson, driverPhotoUrls, driverByPersonId)} />
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
        <Text style={styles.rowTime}>{formatLastMessageDate(thread.lastMessageAt)}</Text>
        {unreadCount > 0 ? <Text style={styles.unreadBadge}>{unreadCount}</Text> : <Ionicons color={colors.muted} name="chevron-forward" size={16} />}
      </View>
    </Pressable>
  )
}

function getPersonDepartmentLabel(value = '') {
  if (value === 'drivers') return 'Autista'
  if (value === 'warehouse') return 'Magazzino'
  if (value === 'office') return 'Ufficio'
  return 'Persona'
}

function getPersonRoleLabel(person = {}) {
  return person.jobTitle || getPersonDepartmentLabel(person.department)
}

function getTeamMessageSenderName(message = {}, peopleById = new Map(), companyName = '') {
  if (message.senderPersonId && peopleById.has(message.senderPersonId)) {
    const person = peopleById.get(message.senderPersonId)
    return `${person.name} · ${getPersonRoleLabel(person)}`
  }
  if (message.senderPersonId) {
    if (message.senderName) return message.senderName
    if (message.senderRole === 'driver') return 'Autista'
    if (message.senderRole === 'warehouse') return 'Magazzino'
    if (message.senderRole === 'office') return 'Ufficio'
    return 'Persona'
  }
  if (message.senderRole === 'company') return companyName || 'Azienda'
  if (message.senderName) return message.senderName
  if (message.senderRole === 'driver') return 'Autista'
  if (message.senderRole === 'warehouse') return 'Magazzino'
  if (message.senderRole === 'office') return 'Ufficio'
  return 'Persona'
}

function getTeamMessageSenderAvatarUrl(message = {}, peopleById = new Map(), driverPhotoUrls = {}, driverByPersonId = new Map()) {
  if (!message.senderPersonId || !peopleById.has(message.senderPersonId)) return ''
  const person = peopleById.get(message.senderPersonId)
  return getPersonAvatarUrl(person, driverPhotoUrls, driverByPersonId)
}

function PersonChatRow({ onPress, person, photoUrl = '' }) {
  return (
    <Pressable onPress={onPress} style={[styles.driverRow, styles.directRow]}>
      <DriverAvatar name={person.name} uri={photoUrl} />
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

function buildDriverByPersonId(people = [], drivers = []) {
  return new Map(
    people
      .map((person) => {
        const linkedDriver = person.linkedDriverId
          ? drivers.find((driver) => driver.id === person.linkedDriverId)
          : null
        const matchedDriver = linkedDriver || drivers.find((driver) => (
          normalizeIdentity(driver.username) && normalizeIdentity(driver.username) === normalizeIdentity(person.username)
        ) || (
          normalizeIdentity(driver.phone) && normalizeIdentity(driver.phone) === normalizeIdentity(person.phone)
        ) || (
          normalizeIdentity(driver.email) && normalizeIdentity(driver.email) === normalizeIdentity(person.email)
        ) || (
          normalizeIdentity(driver.name) && normalizeIdentity(driver.name) === normalizeIdentity(person.name)
        ))

        return matchedDriver ? [person.id, matchedDriver] : null
      })
      .filter(Boolean),
  )
}

function getPersonAvatarUrl(person = {}, driverPhotoUrls = {}, driverByPersonId = new Map()) {
  const linkedDriverId = person.linkedDriverId || driverByPersonId.get(person.id)?.id
  return linkedDriverId ? driverPhotoUrls[linkedDriverId] ?? '' : ''
}

function ChatFilterBar({ counts = {}, mode, onChange }) {
  const items = [
    {
      count: counts.all ?? 0,
      id: 'all',
      label: 'Tutte',
    },
    {
      count: counts.direct ?? 0,
      id: 'direct',
      label: 'Singole',
    },
    {
      count: counts.groups ?? 0,
      id: 'groups',
      label: 'Gruppi',
    },
    {
      count: counts.unread ?? 0,
      id: 'unread',
      label: 'Da leggere',
    },
  ]

  return (
    <ScrollView
      contentContainerStyle={styles.filterBarContent}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterBar}
    >
      {items.map((item) => {
        const isActive = mode === item.id

        return (
          <Pressable
            key={item.id}
            onPress={() => onChange?.(item.id)}
            style={[styles.filterChip, isActive && styles.filterChipActive, item.id === 'unread' && counts.unread > 0 && styles.filterChipUnread]}
          >
            <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{item.label}</Text>
            <Text style={[styles.filterChipCount, isActive && styles.filterChipCountActive]}>{item.count}</Text>
          </Pressable>
        )
      })}
    </ScrollView>
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

function isCompanyGroupThread(thread = {}) {
  return !isDirectThread(thread) && ['drivers', 'warehouse', 'office', 'all'].includes(thread.audienceType)
}

function isCompanyVisibleThread(thread = {}) {
  return isCompanyDirectThread(thread) || isCompanyGroupThread(thread)
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
  filterBar: {
    marginBottom: 12,
  },
  filterBarContent: {
    gap: 8,
    paddingRight: 6,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: '#cfe8f3',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    minHeight: 38,
    paddingHorizontal: 12,
  },
  filterChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  filterChipCount: {
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
    minWidth: 22,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 3,
    textAlign: 'center',
  },
  filterChipCountActive: {
    backgroundColor: colors.cyan,
    color: colors.ink,
  },
  filterChipText: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
  },
  filterChipTextActive: {
    color: colors.white,
  },
  filterChipUnread: {
    borderColor: colors.danger,
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
  inboxKicker: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  inboxSummary: {
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
  inboxSummaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  inboxTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
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
  modeUnreadCount: {
    backgroundColor: colors.danger,
    borderRadius: 999,
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
    minWidth: 32,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 6,
    textAlign: 'center',
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
  rowTime: {
    color: colors.muted,
    fontSize: 10,
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
