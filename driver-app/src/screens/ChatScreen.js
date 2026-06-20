import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  FlatList,
  Image,
  PanResponder,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio'
import { createCompanyAssetSignedUrl } from '../services/driverApi'
import { colors, layout } from '../theme'

const chatReceiveSound = require('../../assets/sounds/chat-receive.wav')
const chatSendSound = require('../../assets/sounds/chat-send.wav')

function getMessageText(message) {
  return String(message.body ?? '').trim()
}

function formatMessageTime(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function getInitials(value = 'Azienda') {
  return String(value)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'CC'
}

function isImagePath(path = '') {
  return /\.(jpe?g|png|webp|heic|heif)$/i.test(path)
}

function isAudioPath(path = '') {
  return /\.(m4a|aac|mp3|mp4|mpeg|ogg|opus|wav|webm)$/i.test(path)
}

function Avatar({ initials, isDriver, uri }) {
  return (
    <View style={[styles.avatar, isDriver ? styles.driverAvatar : styles.companyAvatar]}>
      {uri ? <Image source={{ uri }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{initials}</Text>}
    </View>
  )
}

function MicGlyph({ active = false }) {
  return (
    <View style={styles.micGlyph}>
      <View style={[styles.micCapsule, active && styles.micGlyphActive]} />
      <View style={[styles.micStem, active && styles.micGlyphActive]} />
      <View style={[styles.micBase, active && styles.micGlyphActive]} />
    </View>
  )
}

function AudioAttachment({ signedUrl }) {
  const player = useAudioPlayer(signedUrl || null)

  function playAudio() {
    if (!signedUrl) return
    player.seekTo(0)
    player.play()
  }

  return (
    <Pressable onPress={playAudio} style={styles.audioAttachment}>
      <View style={styles.audioIcon}>
        <Text style={styles.audioIconText}>▶</Text>
      </View>
      <View style={styles.audioWave}>
        {[...Array(12)].map((_, index) => (
          <View key={index} style={[styles.waveBar, { height: 8 + ((index * 7) % 18) }]} />
        ))}
      </View>
      <Text style={styles.audioText}>Vocale</Text>
    </Pressable>
  )
}

function AttachmentPreview({ path }) {
  const [signedUrl, setSignedUrl] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadSignedUrl() {
      const result = await createCompanyAssetSignedUrl(path)
      if (isActive) setSignedUrl(result.data?.signedUrl ?? '')
    }

    if (path) loadSignedUrl()

    return () => {
      isActive = false
    }
  }, [path])

  if (!path) return null

  if (isAudioPath(path)) {
    return <AudioAttachment signedUrl={signedUrl} />
  }

  if (isImagePath(path)) {
    return signedUrl ? <Image source={{ uri: signedUrl }} style={styles.imageAttachment} /> : <View style={styles.imageSkeleton} />
  }

  return (
    <View style={styles.fileAttachment}>
      <Text style={styles.fileAttachmentText}>Allegato disponibile</Text>
    </View>
  )
}

function MessageBubble({ companyLogoUrl, driverProfileUrl, message }) {
  const isDriver = message.senderRole === 'driver'
  const isReadByCompany = Boolean(message.readByCompanyAt)
  const messageText = getMessageText(message)

  return (
    <View style={[styles.messageRow, isDriver && styles.messageRowDriver]}>
      {!isDriver ? <Avatar initials="AZ" uri={companyLogoUrl} /> : null}
      <View style={[styles.bubble, isDriver ? styles.driverBubble : styles.companyBubble]}>
        <AttachmentPreview path={message.attachmentPath} />
        {messageText ? <Text style={styles.bubbleText}>{messageText}</Text> : null}
        <View style={styles.bubbleMeta}>
          <Text style={styles.bubbleTime}>{formatMessageTime(message.createdAt)}</Text>
          {isDriver ? (
            <View accessibilityLabel={isReadByCompany ? 'Letto' : 'Consegnato'} style={styles.readReceipt}>
              <Text style={[styles.checkMark, isReadByCompany && styles.checkMarkRead]}>✓</Text>
              <Text style={[styles.checkMark, styles.checkMarkSecond, isReadByCompany && styles.checkMarkRead]}>✓</Text>
            </View>
          ) : null}
        </View>
      </View>
      {isDriver ? <Avatar initials="IO" isDriver uri={driverProfileUrl} /> : null}
    </View>
  )
}

export function ChatScreen({
  companyLogoUrl,
  companyName,
  companyOnline = false,
  companyTyping = false,
  driverProfileUrl,
  messages = [],
  onRefresh,
  onSend,
  onTyping,
  soundEnabled = true,
}) {
  const [body, setBody] = useState('')
  const [dragOffset, setDragOffset] = useState(0)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const cancelRecordingRef = useRef(false)
  const isPressingMicRef = useRef(false)
  const isRecordingRef = useRef(false)
  const isSendingRef = useRef(false)
  const listRef = useRef(null)
  const pendingStopRef = useRef('')
  const recordingStartedAtRef = useRef(0)
  const soundHydratedRef = useRef(false)
  const typingTimerRef = useRef(null)
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const recorderState = useAudioRecorderState(audioRecorder, 250)
  const receiveSoundPlayer = useAudioPlayer(chatReceiveSound, { keepAudioSessionActive: true })
  const sendSoundPlayer = useAudioPlayer(chatSendSound, { keepAudioSessionActive: true })
  const listMessages = useMemo(() => [...messages].reverse(), [messages])

  useEffect(() => () => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    onTyping?.(false)
  }, [])

  useEffect(() => {
    const latestMessage = messages[messages.length - 1]
    const latestMessageId = latestMessage?.id ?? ''

    if (!latestMessageId) {
      soundHydratedRef.current = false
      return
    }

    if (!soundHydratedRef.current) {
      soundHydratedRef.current = latestMessageId
      return
    }

    if (soundHydratedRef.current === latestMessageId) return

    soundHydratedRef.current = latestMessageId

    if (latestMessage.senderRole === 'company') {
      playChatSound(receiveSoundPlayer)
    }
  }, [messages, receiveSoundPlayer])

  useEffect(() => {
    isSendingRef.current = isSending
  }, [isSending])

  useEffect(() => {
    isRecordingRef.current = isRecording
  }, [isRecording])

  async function handleRefresh() {
    setIsRefreshing(true)
    await onRefresh?.()
    setIsRefreshing(false)
  }

  function handleBodyChange(value) {
    setBody(value)
    const hasText = Boolean(value.trim())
    onTyping?.(hasText)

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    if (hasText) {
      typingTimerRef.current = setTimeout(() => onTyping?.(false), 1500)
    }
  }

  function playChatSound(player) {
    if (!soundEnabled) return

    try {
      player.seekTo(0)
      player.play()
    } catch {
      // Chat sounds are helpful feedback, but they should never block messaging.
    }
  }

  async function handleSendText() {
    const cleanBody = body.trim()
    if (!cleanBody || isSending) return

    setBody('')
    onTyping?.(false)
    setIsSending(true)
    const sent = await onSend?.(cleanBody)
    setIsSending(false)

    if (!sent) setBody(cleanBody)
    if (sent) playChatSound(sendSoundPlayer)
    setTimeout(() => listRef.current?.scrollToOffset?.({ animated: false, offset: 0 }), 80)
  }

  async function handlePickImage() {
    if (isSending) return

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ['images', 'videos'],
      quality: 0.72,
    })

    if (result.canceled || !result.assets?.[0]) return

    const asset = result.assets[0]
    setIsSending(true)
    const sent = await onSend?.(asset.type === 'video' ? 'Video allegato' : 'Foto allegata', {
      name: asset.fileName || `allegato-${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
      type: asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg'),
      uri: asset.uri,
    })
    setIsSending(false)

    if (sent) playChatSound(sendSoundPlayer)
    if (!sent) Alert.alert('Allegato non inviato', 'Riprova tra qualche secondo.')
  }

  function resetMicGesture() {
    setDragOffset(0)
    setIsCancelling(false)
    cancelRecordingRef.current = false
  }

  async function startRecording() {
    if (isRecordingRef.current || isSendingRef.current || body.trim()) return

    pendingStopRef.current = ''

    const permission = await requestRecordingPermissionsAsync()
    if (!permission.granted) {
      isPressingMicRef.current = false
      resetMicGesture()
      Alert.alert('Microfono bloccato', 'Consenti il microfono per inviare messaggi vocali.')
      return
    }

    if (!isPressingMicRef.current) {
      pendingStopRef.current = ''
      resetMicGesture()
      return
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    })
    await audioRecorder.prepareToRecordAsync()

    if (!isPressingMicRef.current) {
      pendingStopRef.current = ''
      resetMicGesture()
      return
    }

    audioRecorder.record()
    recordingStartedAtRef.current = Date.now()
    isRecordingRef.current = true
    setIsRecording(true)

    if (pendingStopRef.current) {
      const shouldCancel = pendingStopRef.current === 'cancel'
      pendingStopRef.current = ''
      setTimeout(() => {
        void stopRecording(shouldCancel)
      }, 0)
    }
  }

  async function stopRecording(shouldCancel = false) {
    cancelRecordingRef.current = Boolean(shouldCancel)

    if (!isRecordingRef.current && !recorderState.isRecording) {
      pendingStopRef.current = shouldCancel ? 'cancel' : 'send'
      return
    }

    const elapsedMs = Date.now() - recordingStartedAtRef.current
    isRecordingRef.current = false
    setIsRecording(false)
    resetMicGesture()

    let uri = ''

    try {
      await audioRecorder.stop()
      uri = audioRecorder.uri
    } catch {
      uri = ''
    }

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    })

    if (shouldCancel || elapsedMs < 650 || !uri) return

    setIsSending(true)
    const sent = await onSend?.('Messaggio vocale', {
      name: `audio-chat-${Date.now()}.m4a`,
      type: 'audio/mp4',
      uri,
    })
    setIsSending(false)

    if (sent) playChatSound(sendSoundPlayer)
    if (!sent) Alert.alert('Vocale non inviato', 'Riprova tra qualche secondo.')
  }

  const statusText = companyTyping ? 'sta scrivendo...' : companyOnline ? 'online' : 'chat azienda'
  const canSendText = Boolean(body.trim()) && !isSending
  const micPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => isPressingMicRef.current,
        onMoveShouldSetPanResponderCapture: () => isPressingMicRef.current,
        onPanResponderGrant: () => {
          if (isSendingRef.current || body.trim()) return

          isPressingMicRef.current = true
          cancelRecordingRef.current = false
          setDragOffset(0)
          setIsCancelling(false)
          void startRecording()
        },
        onPanResponderMove: (_, gestureState) => {
          if (!isPressingMicRef.current) return

          const nextOffset = Math.max(-118, Math.min(0, gestureState.dx))
          const shouldCancel = nextOffset <= -72
          cancelRecordingRef.current = shouldCancel
          setDragOffset(nextOffset)
          setIsCancelling(shouldCancel)
        },
        onPanResponderRelease: () => {
          if (!isPressingMicRef.current) return

          isPressingMicRef.current = false
          void stopRecording(cancelRecordingRef.current)
        },
        onPanResponderTerminate: () => {
          isPressingMicRef.current = false
          void stopRecording(true)
        },
        onStartShouldSetPanResponder: () => !isSendingRef.current && !body.trim(),
        onStartShouldSetPanResponderCapture: () => !isSendingRef.current && !body.trim(),
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      }),
    [body],
  )

  return (
    <View style={styles.screen}>
      <View style={styles.chatHeader}>
        <Avatar initials={getInitials(companyName)} uri={companyLogoUrl} />
        <View style={styles.headerCopy}>
          <Text numberOfLines={1} style={styles.chatTitle}>{companyName}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, companyOnline && styles.statusDotOnline]} />
            <Text style={[styles.chatSubtitle, companyTyping && styles.typingText]}>{statusText}</Text>
          </View>
        </View>
      </View>

      <FlatList
        contentContainerStyle={styles.messageList}
        data={listMessages}
        initialNumToRender={24}
        inverted={listMessages.length > 0}
        keyExtractor={(item) => item.id}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        ref={listRef}
        refreshControl={<RefreshControl onRefresh={handleRefresh} refreshing={isRefreshing} tintColor={colors.cyan} />}
        renderItem={({ item }) => (
          <MessageBubble companyLogoUrl={companyLogoUrl} driverProfileUrl={driverProfileUrl} message={item} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nessun messaggio</Text>
            <Text style={styles.emptyText}>Scrivi all azienda quando serve.</Text>
          </View>
        }
      />

      <View style={styles.composer}>
        <Pressable disabled={isSending || isRecording} onPress={handlePickImage} style={[styles.roundButton, isRecording && styles.hiddenComposerItem]}>
          <Text style={styles.roundButtonText}>+</Text>
        </Pressable>
        <TextInput
          editable={!isRecording && !isSending}
          multiline
          onChangeText={handleBodyChange}
          placeholder="Scrivi un messaggio"
          placeholderTextColor="#94a3b8"
          style={[styles.input, isRecording && styles.hiddenComposerItem]}
          value={body}
        />
        {isRecording ? (
          <View style={styles.recordingInline}>
            <View style={styles.recordingDot} />
            <Text numberOfLines={1} style={styles.recordingText}>
              {isCancelling ? 'Rilascia per eliminare' : 'Scorri a sinistra per eliminare'}
            </Text>
            <Text style={styles.recordingTime}>{Math.round((recorderState.durationMillis ?? 0) / 1000)}s</Text>
          </View>
        ) : null}
        {canSendText ? (
          <Pressable onPress={handleSendText} style={styles.sendButton}>
            <Text style={styles.sendText}>Invia</Text>
          </Pressable>
        ) : (
          <View
            accessibilityLabel="Tieni premuto per registrare un vocale"
            accessibilityRole="button"
            collapsable={false}
            style={[
              styles.micButton,
              isSending && styles.micButtonDisabled,
              isRecording && styles.micButtonActive,
              { transform: [{ translateX: dragOffset }, { scale: isRecording ? 1.08 : 1 }] },
            ]}
            {...micPanResponder.panHandlers}
          >
            <MicGlyph active={isRecording} />
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  audioAttachment: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 198, 223, 0.14)',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 9,
    marginBottom: 8,
    minWidth: 210,
    padding: 10,
  },
  audioIcon: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  audioIconText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  audioText: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
  },
  audioWave: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 3,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 42,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  bubble: {
    borderRadius: 18,
    maxWidth: '78%',
    padding: 11,
  },
  bubbleMeta: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  bubbleText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  bubbleTime: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  chatHeader: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 11,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 12,
  },
  chatSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  chatTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  checkMark: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 12,
  },
  checkMarkRead: {
    color: '#0ea5e9',
  },
  checkMarkSecond: {
    marginLeft: -5,
  },
  readReceipt: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 1,
  },
  companyAvatar: {
    backgroundColor: '#e0faff',
    borderColor: colors.cyan,
    borderWidth: 1,
  },
  companyBubble: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderTopLeftRadius: 6,
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
  driverAvatar: {
    backgroundColor: colors.ink,
  },
  driverBubble: {
    backgroundColor: '#dff9ff',
    borderColor: colors.cyan,
    borderTopRightRadius: 6,
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
  fileAttachment: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginBottom: 8,
    padding: 10,
  },
  fileAttachmentText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  headerCopy: {
    flex: 1,
  },
  hiddenComposerItem: {
    display: 'none',
  },
  imageAttachment: {
    aspectRatio: 1.2,
    borderRadius: 14,
    marginBottom: 8,
    width: 220,
  },
  imageSkeleton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    height: 160,
    marginBottom: 8,
    width: 220,
  },
  input: {
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 22,
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
  messageRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  messageRowDriver: {
    justifyContent: 'flex-end',
  },
  micButton: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    minWidth: 54,
    paddingHorizontal: 12,
  },
  micButtonActive: {
    backgroundColor: colors.danger,
  },
  micButtonDisabled: {
    opacity: 0.45,
  },
  micBase: {
    backgroundColor: colors.white,
    borderRadius: 999,
    height: 3,
    marginTop: 2,
    width: 17,
  },
  micCapsule: {
    backgroundColor: colors.white,
    borderRadius: 999,
    height: 19,
    width: 12,
  },
  micGlyph: {
    alignItems: 'center',
    height: 27,
    justifyContent: 'center',
    width: 22,
  },
  micGlyphActive: {
    color: colors.white,
  },
  micStem: {
    backgroundColor: colors.white,
    borderRadius: 999,
    height: 6,
    marginTop: 1,
    width: 3,
  },
  recordingBar: {
    alignItems: 'center',
    backgroundColor: '#020617',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 10,
  },
  recordingDot: {
    backgroundColor: colors.danger,
    borderRadius: 999,
    height: 9,
    width: 9,
  },
  recordingInline: {
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 22,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 13,
  },
  recordingText: {
    color: colors.white,
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
  },
  recordingTime: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
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
    backgroundColor: colors.cyan,
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    minWidth: 58,
    paddingHorizontal: 12,
  },
  sendText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  statusDot: {
    backgroundColor: '#cbd5e1',
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  statusDotOnline: {
    backgroundColor: colors.success,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  typingText: {
    color: colors.success,
  },
  waveBar: {
    backgroundColor: colors.cyanDark,
    borderRadius: 999,
    opacity: 0.8,
    width: 3,
  },
})
