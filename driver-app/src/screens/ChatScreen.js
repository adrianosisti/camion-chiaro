import { useRef, useState } from 'react'
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { colors, layout } from '../theme'

function getMessageText(message) {
  return String(message.body ?? '').trim() || 'Messaggio'
}

function formatMessageTime(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export function ChatScreen({ companyName, messages = [], onRefresh, onSend }) {
  const [body, setBody] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const listRef = useRef(null)

  async function handleRefresh() {
    setIsRefreshing(true)
    await onRefresh?.()
    setIsRefreshing(false)
  }

  async function handleSend() {
    const cleanBody = body.trim()
    if (!cleanBody || isSending) return

    setBody('')
    setIsSending(true)
    const sent = await onSend?.(cleanBody)
    setIsSending(false)

    if (!sent) setBody(cleanBody)
    setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 80)
  }

  return (
    <View style={styles.screen}>
      <View style={styles.chatHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AZ</Text>
        </View>
        <View>
          <Text style={styles.chatTitle}>{companyName}</Text>
          <Text style={styles.chatSubtitle}>Chat azienda</Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={styles.messageList}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: true })}
        ref={listRef}
        refreshControl={<RefreshControl onRefresh={handleRefresh} refreshing={isRefreshing} tintColor={colors.cyan} />}
        renderItem={({ item }) => {
          const isDriver = item.senderRole === 'driver'
          return (
            <View style={[styles.bubble, isDriver ? styles.driverBubble : styles.companyBubble]}>
              <Text style={styles.bubbleText}>{getMessageText(item)}</Text>
              <Text style={styles.bubbleTime}>{formatMessageTime(item.createdAt)}</Text>
            </View>
          )
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nessun messaggio</Text>
            <Text style={styles.emptyText}>Scrivi all azienda quando serve.</Text>
          </View>
        }
      />

      <View style={styles.composer}>
        <Pressable style={styles.roundButton}>
          <Text style={styles.roundButtonText}>+</Text>
        </Pressable>
        <TextInput
          multiline
          onChangeText={setBody}
          placeholder="Scrivi un messaggio"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={body}
        />
        <Pressable
          disabled={!body.trim() || isSending}
          onPress={handleSend}
          style={[styles.sendButton, (!body.trim() || isSending) && styles.sendButtonMuted]}
        >
          <Text style={styles.sendText}>{body.trim() ? 'Invia' : 'Mic'}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 16,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  avatarText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  bubble: {
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '82%',
    padding: 11,
  },
  bubbleText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  bubbleTime: {
    alignSelf: 'flex-end',
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 6,
  },
  chatHeader: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 11,
    padding: layout.screenPadding,
  },
  chatSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  chatTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  companyBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
  },
  composer: {
    alignItems: 'flex-end',
    backgroundColor: colors.white,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 10,
  },
  driverBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#dff9ff',
    borderColor: colors.cyan,
    borderWidth: 1,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 70,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  input: {
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    maxHeight: 94,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  messageList: {
    padding: layout.screenPadding,
    paddingBottom: 24,
  },
  roundButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  roundButtonText: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  screen: {
    flex: 1,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    minWidth: 54,
    paddingHorizontal: 12,
  },
  sendButtonMuted: {
    backgroundColor: '#dbeafe',
  },
  sendText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
})
