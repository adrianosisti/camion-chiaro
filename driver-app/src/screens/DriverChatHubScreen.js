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

function ChatRow({ badge = 0, icon, imageUrl, onPress, subtitle, title }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.avatar}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
        ) : (
          icon ? <Ionicons color={colors.ink} name={icon} size={22} /> : <Text style={styles.avatarText}>{getInitials(title)}</Text>
        )}
      </View>
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={styles.rowTitle}>{title}</Text>
        <Text numberOfLines={1} style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      {badge > 0 ? <Text style={styles.badge}>{badge}</Text> : <Text style={styles.openText}>Apri</Text>}
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
  teamMessages = [],
  teamThreads = [],
  unreadCompanyMessages = 0,
}) {
  const currentUserRole = 'me'
  const normalizedTeamMessages = teamMessages.map((message) => ({
    ...message,
    senderRole: message.senderPersonId && message.senderPersonId === currentPerson?.id ? 'me' : 'team',
  }))

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
          subtitle={getAudienceLabel(selectedTeamThread.audienceType)}
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
        onPress={onOpenCompanyChat}
        subtitle={chatThread?.lastMessageAt ? formatLastMessageDate(chatThread.lastMessageAt) : 'Canale principale'}
        title={companyName}
      />

      {teamThreads.length ? (
        <View style={styles.groupBlock}>
          <Text style={styles.groupTitle}>Gruppi e reparti</Text>
          {teamThreads.map((thread) => (
            <ChatRow
              icon={getGroupIcon(thread.audienceType)}
              key={thread.id}
              onPress={() => onOpenTeamChat?.(thread)}
              subtitle={`${getAudienceLabel(thread.audienceType)} · ${formatLastMessageDate(thread.lastMessageAt)}`}
              title={thread.title}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Nessun gruppo disponibile. L azienda deve aggiornare le anagrafiche.</Text>
      )}
    </ScrollView>
  )
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
