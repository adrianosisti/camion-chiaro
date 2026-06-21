import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ChatScreen } from './ChatScreen'
import { colors, layout } from '../theme'

function formatLastMessageDate(value) {
  if (!value) return 'Nessun messaggio'
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value))
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

  return (
    <Pressable onPress={onPress} style={[styles.row, isDirect && styles.directRow]}>
      <View style={[styles.avatar, isDirect && styles.directAvatar]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
        ) : (
          icon ? <Ionicons color={isDirect ? colors.white : colors.ink} name={icon} size={22} /> : <Text style={[styles.avatarText, isDirect && styles.directAvatarText]}>{getInitials(title)}</Text>
        )}
      </View>
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={styles.rowTitle}>{title}</Text>
        <Text numberOfLines={1} style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.rowActions}>
        {kindLabel ? (
          <Text style={[styles.kindBadge, isDirect ? styles.kindBadgeDirect : styles.kindBadgeGroup]}>
            {kindLabel}
          </Text>
        ) : null}
        {badge > 0 ? <Text style={styles.badge}>{badge}</Text> : <Text style={styles.openText}>Apri</Text>}
      </View>
    </Pressable>
  )
}

function HeaderBar({ onBack, subtitle, title }) {
  return (
    <View style={styles.selectedBar}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>Chat</Text>
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
  driverName,
  driverProfileUrl,
  messages = [],
  onBackToList,
  onOpenCompanyChat,
  onOpenPersonChat,
  onOpenTeamChat,
  onReactToMessage,
  onRefreshCompanyChat,
  onRefreshTeamChat,
  onSendCompanyMessage,
  onSendTeamMessage,
  onTyping,
  selectedMode = 'list',
  selectedTeamThread,
  soundEnabled = true,
  people = [],
  teamMessages = [],
  teamThreads = [],
  unreadCompanyMessages = 0,
}) {
  const currentUserRole = 'me'
  const normalizedTeamMessages = teamMessages.map((message) => ({
    ...message,
    senderRole: message.senderPersonId && message.senderPersonId === currentPerson?.id ? 'me' : 'team',
  }))
  const visiblePeople = people.filter((person) => person.id !== currentPerson?.id && person.status !== 'archived')
  const visibleTeamThreads = teamThreads.filter((thread) => (
    !(isDirectThread(thread) && [currentPerson?.name, companyName].filter(Boolean).includes(thread.title))
  ))

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
          messages={messages}
          onReactToMessage={onReactToMessage}
          onRefresh={onRefreshCompanyChat}
          onSend={onSendCompanyMessage}
          onTyping={onTyping}
          soundEnabled={soundEnabled}
        />
      </View>
    )
  }

  if (selectedMode === 'team' && selectedTeamThread) {
    return (
      <View style={styles.chatWrap}>
        <HeaderBar
          onBack={onBackToList}
          subtitle={`${getThreadKindLabel(selectedTeamThread)} · ${getAudienceLabel(selectedTeamThread.audienceType)}`}
          title={selectedTeamThread.title}
        />
        <ChatScreen
          companyLogoUrl={companyLogoUrl}
          companyName={selectedTeamThread.title}
          companyOnline
          currentUserRole={currentUserRole}
          driverName={driverName}
          driverProfileUrl={driverProfileUrl}
          messages={normalizedTeamMessages}
          offlineLabel="gruppo"
          onRefresh={onRefreshTeamChat}
          onSend={onSendTeamMessage}
          onTyping={onTyping}
          ownAvatarUrl={driverProfileUrl}
          participantAvatarUrl={companyLogoUrl}
          participantName={selectedTeamThread.title}
          soundEnabled={soundEnabled}
        />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Chat</Text>
        <Text style={styles.heroText}>Scrivi all azienda, ai reparti o ai gruppi disponibili.</Text>
      </View>

      <ChatRow
        badge={unreadCompanyMessages}
        imageUrl={companyLogoUrl}
        kindLabel="Diretta"
        onPress={onOpenCompanyChat}
        subtitle={chatThread?.lastMessageAt ? formatLastMessageDate(chatThread.lastMessageAt) : 'Canale principale'}
        title={companyName}
        tone="direct"
      />

      {visibleTeamThreads.length ? (
        <View style={styles.groupBlock}>
          <Text style={styles.groupTitle}>Gruppi, reparti e dirette</Text>
          {visibleTeamThreads.map((thread) => {
            const isDirect = isDirectThread(thread)

            return (
            <ChatRow
              icon={isDirect ? 'person-circle-outline' : getGroupIcon(thread.audienceType)}
              key={thread.id}
              kindLabel={getThreadKindLabel(thread)}
              onPress={() => onOpenTeamChat?.(thread)}
              subtitle={`${getAudienceLabel(thread.audienceType)} · ${formatLastMessageDate(thread.lastMessageAt)}`}
              title={thread.title}
              tone={isDirect ? 'direct' : 'normal'}
            />
            )
          })}
        </View>
      ) : (
        <Text style={styles.emptyText}>Nessun gruppo disponibile. L azienda deve aggiornare le anagrafiche.</Text>
      )}

      {visiblePeople.length ? (
        <View style={styles.groupBlock}>
          <Text style={styles.groupTitle}>Persone</Text>
          {visiblePeople.map((person) => (
            <ChatRow
              icon={person.department === 'warehouse' ? 'cube-outline' : person.department === 'office' ? 'briefcase-outline' : 'person-outline'}
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
    </ScrollView>
  )
}

function isDirectThread(thread = {}) {
  return thread.threadType === 'direct' || thread.audienceType === 'direct'
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
