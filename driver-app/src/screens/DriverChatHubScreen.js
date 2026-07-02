import { useMemo, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ChatScreen } from './ChatScreen'
import { colors, layout } from '../theme'

function padDatePart(value) {
  return String(value).padStart(2, '0')
}

function formatLastMessageDate(value) {
  if (!value) return 'Nessun messaggio'
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return 'Nessun messaggio'
  return `${padDatePart(date.getDate())}/${padDatePart(date.getMonth() + 1)} ${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`
}

function normalizeIdentity(value = '') {
  return String(value).trim().toLowerCase()
}

function getAudienceLabel(value = '') {
  const labels = {
    all: 'Tutta l azienda',
    custom: 'Gruppo personalizzato',
    drivers: 'Autisti',
    office: 'Ufficio',
    warehouse: 'Magazzino',
  }

  return labels[value] ?? 'Gruppo'
}

function getGroupIcon(value = '') {
  if (value === 'drivers') return 'bus-outline'
  if (value === 'warehouse') return 'cube-outline'
  if (value === 'office') return 'briefcase-outline'
  if (value === 'all') return 'megaphone-outline'
  return 'people-outline'
}

function getInitials(value = 'A') {
  return String(value)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'A'
}

function ChatRow({ badge = 0, icon, imageUrl, kindLabel = '', onPress, subtitle, title, tone = 'normal' }) {
  const isDirect = tone === 'direct'
  const hasUnread = Number(badge ?? 0) > 0

  return (
    <Pressable onPress={onPress} style={[styles.row, isDirect && styles.directRow, hasUnread && styles.unreadRow]}>
      <View style={[styles.avatar, isDirect && styles.directAvatar]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
        ) : (
          icon ? <Ionicons color={isDirect ? colors.white : colors.ink} name={icon} size={22} /> : <Text style={[styles.avatarText, isDirect && styles.directAvatarText]}>{getInitials(title)}</Text>
        )}
      </View>
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={[styles.rowTitle, hasUnread && styles.unreadTitle]}>{title}</Text>
        <Text numberOfLines={1} style={[styles.rowSubtitle, hasUnread && styles.unreadSubtitle]}>{subtitle}</Text>
      </View>
      <View style={styles.rowActions}>
        {kindLabel ? (
          <Text style={[styles.kindBadge, isDirect ? styles.kindBadgeDirect : styles.kindBadgeGroup]}>
            {kindLabel}
          </Text>
        ) : null}
        {hasUnread ? <Text style={styles.badge}>{badge}</Text> : <Text style={styles.openText}>Apri</Text>}
      </View>
    </Pressable>
  )
}

function HeaderBar({ onBack, subtitle, title }) {
  return (
    <View style={styles.selectedBar}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Ionicons color={colors.ink} name="arrow-back" size={17} />
        <Text style={styles.backText}>Indietro</Text>
      </Pressable>
      <View style={styles.selectedTitleWrap}>
        <Text numberOfLines={1} style={styles.selectedTitle}>{title}</Text>
        <Text numberOfLines={1} style={styles.selectedSubtitle}>{subtitle}</Text>
      </View>
    </View>
  )
}

export function DriverChatHubScreen({
  chatThread,
  companyLogoUrl,
  companyName,
  companyOnline,
  companyTyping,
  currentPerson,
  drivers = [],
  driverPhotoUrls = {},
  driverName,
  driverProfileUrl,
  incomingShare,
  messages = [],
  onBackToList,
  onIncomingShareConsumed,
  onOpenCompanyChat,
  onOpenPersonChat,
  onOpenTeamChat,
  onReactToMessage,
  onReactToTeamMessage,
  onRefreshCompanyChat,
  onRefreshTeamChat,
  onSendCompanyMessage,
  onSendTeamMessage,
  onStartVoiceCall,
  onTyping,
  onlinePersonIds = [],
  selectedMode = 'list',
  selectedTeamThread,
  soundEnabled = true,
  people = [],
  teamMessages = [],
  teamThreads = [],
  teamTypingByThreadId = {},
  unreadCompanyMessages = 0,
  unreadTeamByThreadId = {},
}) {
  const [chatListMode, setChatListMode] = useState('direct')
  const currentUserRole = 'me'
  const safeDrivers = Array.isArray(drivers) ? drivers : []
  const personById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people])
  const driverByPersonId = useMemo(() => buildDriverByPersonId(people, safeDrivers), [people, safeDrivers])
  const currentPersonByName = useMemo(() => {
    if (currentPerson) return currentPerson
    if (!driverName) return null
    return people.find((person) => normalizeIdentity(person.name) === normalizeIdentity(driverName)) ?? null
  }, [currentPerson, driverName, people])
  const normalizedTeamMessages = useMemo(
    () => teamMessages.map((message) => ({
      ...message,
      senderAvatarUrl: getPersonAvatarUrl(
        message.senderPersonId ? personById.get(message.senderPersonId) : null,
        driverPhotoUrls,
        driverByPersonId,
        message.senderPersonId === currentPersonByName?.id ? driverProfileUrl : '',
      ),
      senderName: getTeamMessageSenderName(message, personById, companyName),
      senderRole: message.senderPersonId && message.senderPersonId === currentPersonByName?.id ? 'me' : 'team',
    })),
    [companyName, currentPersonByName?.id, driverByPersonId, driverPhotoUrls, driverProfileUrl, personById, teamMessages],
  )
  const visiblePeople = people.filter((person) => person.id !== currentPerson?.id && person.status !== 'archived')
  const visibleTeamThreads = teamThreads.filter((thread) => (
    !(isDirectThread(thread) && [currentPersonByName?.name, companyName].filter(Boolean).includes(thread.title))
  ))
  const companyDirectThread = teamThreads.find((thread) => (
    isCompanyDirectThread(thread) && String(thread.directKey ?? '') === `company:${currentPersonByName?.id ?? ''}`
  )) ?? null
  const companyDirectUnreadCount = companyDirectThread ? Number(unreadTeamByThreadId[companyDirectThread.id] ?? 0) : 0
  const companyConversationTimestamp = Math.max(
    getSafeTimestamp(chatThread?.lastMessageAt),
    getSafeTimestamp(companyDirectThread?.lastMessageAt),
  )
  const directTeamThreads = visibleTeamThreads
    .filter((thread) => isDirectThread(thread))
    .sort((firstThread, secondThread) => getSafeTimestamp(secondThread.lastMessageAt) - getSafeTimestamp(firstThread.lastMessageAt))
  const groupTeamThreads = visibleTeamThreads
    .filter((thread) => !isDirectThread(thread))
    .sort((firstThread, secondThread) => getSafeTimestamp(secondThread.lastMessageAt) - getSafeTimestamp(firstThread.lastMessageAt))
  const directConversationRows = [
    companyName
      ? {
          id: 'company',
          thread: companyDirectThread,
          timestamp: companyConversationTimestamp,
          type: 'company',
        }
      : null,
    ...directTeamThreads.map((thread) => ({
      id: thread.id,
      thread,
      timestamp: getSafeTimestamp(thread.lastMessageAt),
      type: 'team',
    })),
  ]
    .filter(Boolean)
    .sort((firstRow, secondRow) => secondRow.timestamp - firstRow.timestamp)
  const hasDirectRows = Boolean(companyName) || directTeamThreads.length || visiblePeople.length
  const hasGroupRows = groupTeamThreads.length > 0
  const directCount = (companyName ? 1 : 0) + directTeamThreads.length
  const groupCount = groupTeamThreads.length
  const directUnreadCount = unreadCompanyMessages + companyDirectUnreadCount + directTeamThreads.reduce((total, thread) => total + Number(unreadTeamByThreadId[thread.id] ?? 0), 0)
  const groupUnreadCount = groupTeamThreads.reduce((total, thread) => total + Number(unreadTeamByThreadId[thread.id] ?? 0), 0)

  if (selectedMode === 'company') {
    return (
      <View style={styles.chatWrap}>
        <HeaderBar onBack={onBackToList} subtitle={companyOnline ? 'online' : 'chat azienda'} title={companyName} />
        <ChatScreen
          companyLogoUrl={companyLogoUrl}
          companyName={companyName}
          companyOnline={companyOnline}
          companyTyping={companyTyping}
          currentUserRole="driver"
          driverName={driverName}
          driverProfileUrl={driverProfileUrl}
          incomingShare={incomingShare}
          messages={messages}
          onIncomingShareConsumed={onIncomingShareConsumed}
          onReactToMessage={onReactToMessage}
          onRefresh={onRefreshCompanyChat}
          onSend={onSendCompanyMessage}
          onStartVoiceCall={onStartVoiceCall ? () => onStartVoiceCall(companyName) : undefined}
          onTyping={onTyping}
          soundEnabled={soundEnabled}
        />
      </View>
    )
  }

  if (selectedMode === 'team' && selectedTeamThread) {
    const isDirectChat = isDirectThread(selectedTeamThread)
    const isCompanyDirectChat = isCompanyDirectThread(selectedTeamThread)
    const directPartner = isCompanyDirectChat ? null : getDirectThreadPartner(selectedTeamThread, currentPersonByName, personById)
    const directPartnerAvatarUrl = isCompanyDirectChat
      ? companyLogoUrl
      : getPersonAvatarUrl(directPartner, driverPhotoUrls, driverByPersonId)
    const directPartnerOnline = isCompanyDirectChat
      ? companyOnline
      : Boolean(directPartner?.id && onlinePersonIds.includes(directPartner.id))
    const typingPayload = teamTypingByThreadId[selectedTeamThread.id]
    const isTeamTyping = Boolean(typingPayload?.isTyping && (!typingPayload.expiresAt || typingPayload.expiresAt > Date.now()))
    const selectedTitle = isCompanyDirectChat
      ? companyName
      : isDirectChat && directPartner ? directPartner.name : selectedTeamThread.title
    const selectedSubtitle = isCompanyDirectChat
      ? 'Chat diretta con azienda'
      : isDirectChat && directPartner
      ? `${getPersonDepartmentLabel(directPartner.department)} · ${directPartner.jobTitle || 'Operatore'}`
      : `${getThreadKindLabel(selectedTeamThread)} · ${getAudienceLabel(selectedTeamThread.audienceType)}`

    return (
      <View style={styles.chatWrap}>
        <HeaderBar
          onBack={onBackToList}
          subtitle={selectedSubtitle}
          title={selectedTitle}
        />
        <ChatScreen
          companyLogoUrl={isDirectChat ? directPartnerAvatarUrl : ''}
          companyName={selectedTitle}
          companyOnline={isDirectChat ? directPartnerOnline : false}
          companyTyping={isCompanyDirectChat ? companyTyping || isTeamTyping : isTeamTyping}
          currentUserRole={currentUserRole}
          currentPersonId={currentPersonByName?.id ?? ''}
          driverName={driverName}
          driverProfileUrl={driverProfileUrl}
          incomingShare={incomingShare}
          messages={normalizedTeamMessages}
          offlineLabel={isDirectChat ? 'non online' : 'gruppo'}
          onIncomingShareConsumed={onIncomingShareConsumed}
          onReactToMessage={onReactToTeamMessage}
          onRefresh={onRefreshTeamChat}
          onSend={onSendTeamMessage}
          onStartVoiceCall={onStartVoiceCall ? () => onStartVoiceCall(selectedTitle) : undefined}
          onTyping={onTyping}
          ownAvatarUrl={driverProfileUrl}
          participantAvatarUrl={isDirectChat ? directPartnerAvatarUrl : companyLogoUrl}
          participantIcon={isDirectChat ? '' : getGroupIcon(selectedTeamThread.audienceType)}
          participantName={selectedTitle}
          reactionKey={currentPersonByName?.id ? `person:${currentPersonByName.id}` : 'me'}
          showSenderNames={!isDirectChat}
          soundEnabled={soundEnabled}
        />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Chat</Text>
        <Text style={styles.heroText}>Chat singole e gruppi aziendali.</Text>
      </View>

      <View style={styles.modeLead}>
        <Text style={styles.modeLeadLabel}>Stai vedendo</Text>
        <Text style={styles.modeLeadTitle}>{chatListMode === 'groups' ? 'Gruppi e reparti' : 'Chat singole'}</Text>
      </View>

      <ChatModeCards
        counts={{ direct: directCount, groups: groupCount }}
        mode={chatListMode}
        onChange={setChatListMode}
        unreadCounts={{ direct: directUnreadCount, groups: groupUnreadCount }}
      />

      {chatListMode === 'direct' ? (
        <>
          {directConversationRows.length ? (
            <View style={styles.groupBlock}>
              <Text style={styles.groupTitle}>Chat singole</Text>
              {directConversationRows.map((row) => (
                row.type === 'company' ? (
                  <ChatRow
                    badge={unreadCompanyMessages + companyDirectUnreadCount}
                    imageUrl={companyLogoUrl}
                    key={row.id}
                    kindLabel="Diretta"
                    onPress={onOpenCompanyChat}
                    subtitle={row.thread?.lastMessageAt || chatThread?.lastMessageAt ? formatLastMessageDate(row.thread?.lastMessageAt ?? chatThread?.lastMessageAt) : 'Canale principale'}
                    title={companyName}
                    tone="direct"
                  />
                ) : (
                  (() => {
                    const display = getDirectThreadDisplay({
                      companyLogoUrl,
                      companyName,
                      currentPerson: currentPersonByName,
                      driverByPersonId,
                      driverPhotoUrls,
                      peopleById: personById,
                      thread: row.thread,
                    })

                    return (
                      <ChatRow
                        icon={display.icon}
                        imageUrl={display.imageUrl}
                        key={row.id}
                        kindLabel={getThreadKindLabel(row.thread)}
                        onPress={() => onOpenTeamChat?.(row.thread)}
                        subtitle={`${display.subtitle} · ${formatLastMessageDate(row.thread.lastMessageAt)}`}
                        title={display.title}
                        tone="direct"
                        badge={unreadTeamByThreadId[row.thread.id] ?? 0}
                      />
                    )
                  })()
                )
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      {chatListMode === 'groups' && groupTeamThreads.length ? (
        <View style={styles.groupBlock}>
          <Text style={styles.groupTitle}>Gruppi e reparti</Text>
          {groupTeamThreads.map((thread) => (
            <ChatRow
              icon={getGroupIcon(thread.audienceType)}
              key={thread.id}
              kindLabel={getThreadKindLabel(thread)}
              onPress={() => onOpenTeamChat?.(thread)}
              subtitle={`${getAudienceLabel(thread.audienceType)} · ${formatLastMessageDate(thread.lastMessageAt)}`}
              title={thread.title}
              tone="normal"
              badge={unreadTeamByThreadId[thread.id] ?? 0}
            />
          ))}
        </View>
      ) : null}

      {chatListMode === 'direct' && visiblePeople.length ? (
        <View style={styles.groupBlock}>
          <Text style={styles.groupTitle}>Nuova chat</Text>
          {visiblePeople.map((person) => (
            <ChatRow
              icon={person.department === 'warehouse' ? 'cube-outline' : person.department === 'office' ? 'briefcase-outline' : 'person-outline'}
              imageUrl={getPersonAvatarUrl(person, driverPhotoUrls, driverByPersonId)}
              key={person.id}
              kindLabel="Diretta"
              onPress={() => onOpenPersonChat?.(person)}
              subtitle={`${getPersonDepartmentLabel(person.department)} · ${person.jobTitle || 'Operatore'}`}
              title={person.name}
              tone="direct"
            />
          ))}
        </View>
      ) : null}

      {chatListMode === 'direct' && !hasDirectRows ? (
        <Text style={styles.emptyText}>Nessuna chat singola disponibile.</Text>
      ) : null}
      {chatListMode === 'groups' && !hasGroupRows ? (
        <Text style={styles.emptyText}>Nessun gruppo disponibile. L azienda deve aggiornare le anagrafiche.</Text>
      ) : null}
    </ScrollView>
  )
}

function ChatModeCards({ counts = {}, mode, onChange, unreadCounts = {} }) {
  const items = [
    {
      count: counts.direct ?? 0,
      id: 'direct',
      icon: 'person-circle-outline',
      label: 'Chat singole',
      subtitle: 'Azienda e persone',
    },
    {
      count: counts.groups ?? 0,
      id: 'groups',
      icon: 'people-outline',
      label: 'Gruppi e reparti',
      subtitle: 'Canali aziendali',
    },
  ]

  return (
    <View style={styles.modeCards}>
      {items.map((item) => {
        const isActive = mode === item.id

        return (
          <Pressable key={item.id} onPress={() => onChange?.(item.id)} style={[styles.modeCard, isActive && styles.modeCardActive]}>
            <View style={[styles.modeIconShell, isActive && styles.modeIconShellActive]}>
              <Ionicons color={isActive ? colors.ink : colors.white} name={item.icon} size={21} />
            </View>
            <View style={styles.modeCardCopy}>
              <Text numberOfLines={1} style={styles.modeCardTitle}>{item.label}</Text>
              <Text numberOfLines={1} style={styles.modeCardSubtitle}>{item.subtitle}</Text>
            </View>
            {unreadCounts[item.id] > 0 ? <Text style={styles.modeUnreadCount}>{unreadCounts[item.id]}</Text> : null}
          </Pressable>
        )
      })}
    </View>
  )
}

function isDirectThread(thread = {}) {
  return thread.threadType === 'direct' || thread.audienceType === 'direct'
}

function getSafeTimestamp(value) {
  if (!value) return 0
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

function getThreadKindLabel(thread = {}) {
  if (isDirectThread(thread)) return 'Diretta'
  if (['drivers', 'office', 'warehouse'].includes(thread.audienceType)) return 'Reparto'
  return 'Gruppo'
}

function getPersonDepartmentLabel(value = '') {
  if (value === 'warehouse') return 'Magazzino'
  if (value === 'office') return 'Ufficio'
  if (value === 'drivers') return 'Autista'
  return 'Persona'
}

function getPersonRoleLabel(person = {}) {
  return person.jobTitle || getPersonDepartmentLabel(person.department)
}

function buildDriverByPersonId(people = [], drivers = []) {
  return new Map(
    people
      .map((person) => {
        const linkedDriver = person?.linkedDriverId
          ? drivers.find((driver) => driver.id === person.linkedDriverId) ?? { id: person.linkedDriverId }
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

function getPersonAvatarUrl(person, driverPhotoUrls = {}, driverByPersonId = new Map(), fallbackUrl = '') {
  if (!person?.id) return fallbackUrl
  const linkedDriverId = person.linkedDriverId || driverByPersonId.get(person.id)?.id
  return linkedDriverId ? driverPhotoUrls[linkedDriverId] ?? fallbackUrl : fallbackUrl
}

function getDirectThreadPartner(thread = {}, currentPerson = null, peopleById = new Map()) {
  if (!isDirectThread(thread)) return null

  const directKey = String(thread.directKey ?? '')
  if (directKey.startsWith('company:')) return null

  if (directKey.startsWith('person:')) {
    const personIds = directKey.slice('person:'.length).split(':').filter(Boolean)
    const partnerId = personIds.find((personId) => personId !== currentPerson?.id) ?? personIds[0]
    return peopleById.get(partnerId) ?? null
  }

  return null
}

function isCompanyDirectThread(thread = {}) {
  return isDirectThread(thread) && String(thread.directKey ?? '').startsWith('company:')
}

function getDirectThreadDisplay({
  companyLogoUrl = '',
  companyName = 'Azienda',
  currentPerson = null,
  driverByPersonId = new Map(),
  driverPhotoUrls = {},
  peopleById = new Map(),
  thread = {},
}) {
  if (isCompanyDirectThread(thread)) {
    return {
      icon: '',
      imageUrl: companyLogoUrl,
      subtitle: 'Azienda',
      title: companyName,
    }
  }

  const partner = getDirectThreadPartner(thread, currentPerson, peopleById)
  if (!partner) {
    return {
      icon: 'person-circle-outline',
      imageUrl: '',
      subtitle: getAudienceLabel(thread.audienceType),
      title: thread.title || 'Chat singola',
    }
  }

  return {
    icon: '',
    imageUrl: getPersonAvatarUrl(partner, driverPhotoUrls, driverByPersonId),
    subtitle: `${getPersonDepartmentLabel(partner.department)} · ${partner.jobTitle || 'Operatore'}`,
    title: partner.name,
  }
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

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
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
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  directAvatar: {
    backgroundColor: colors.ink,
  },
  directAvatarText: {
    color: colors.white,
  },
  directRow: {
    borderColor: '#9ccfea',
    borderWidth: 1.5,
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
  badge: {
    backgroundColor: colors.danger,
    borderRadius: 999,
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
    minWidth: 24,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 4,
    textAlign: 'center',
  },
  chatWrap: {
    flex: 1,
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  groupBlock: {
    marginTop: 8,
  },
  groupTitle: {
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
    backgroundColor: '#f8fdff',
    borderColor: '#d7f2fb',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
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
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 40,
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
  row: {
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
  unreadRow: {
    backgroundColor: '#fff7f7',
    borderColor: colors.danger,
    borderWidth: 2,
  },
  unreadSubtitle: {
    color: colors.ink,
  },
  unreadTitle: {
    color: colors.danger,
  },
  rowActions: {
    alignItems: 'flex-end',
    gap: 5,
  },
  rowCopy: {
    flex: 1,
  },
  rowSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  rowTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
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
  selectedSubtitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  selectedTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  selectedTitleWrap: {
    flex: 1,
  },
})
