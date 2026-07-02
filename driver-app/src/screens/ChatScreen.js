import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as FileSystem from 'expo-file-system/legacy'
import * as Haptics from 'expo-haptics'
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library'
import { VideoView, useVideoPlayer } from 'expo-video'
import { Ionicons } from '@expo/vector-icons'
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio'
import { createCompanyAssetSignedUrl } from '../services/driverApi'
import { colors, layout } from '../theme'

const chatReceiveSound = require('../../assets/sounds/chat-receive.wav')
const chatSendSound = require('../../assets/sounds/chat-send.wav')
const chatReplyPrefix = '[[cc-reply:'
const chatReplySuffix = ']]'

const reactionOptions = [
  { emoji: '👍', value: 'ok' },
  { emoji: '❤️', value: 'heart' },
  { emoji: '🙏', value: 'thanks' },
  { emoji: '👀', value: 'seen' },
  { emoji: '✅', value: 'done' },
  { emoji: '⚠️', value: 'warning' },
]

const audioWaveHeights = [9, 16, 22, 13, 27, 19, 11, 24, 15, 29, 20, 12, 25, 18]
const oneMegabyte = 1024 * 1024
const maxChatAttachments = 5
const maxChatAttachmentSizeByKind = {
  audio: 8 * oneMegabyte,
  file: 10 * oneMegabyte,
  image: 5 * oneMegabyte,
  video: 25 * oneMegabyte,
}

function getMessageText(message) {
  return String(message.body ?? '').trim()
}

function triggerChatHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
}

function formatAudioTime(value = 0) {
  const safeValue = Math.max(0, Math.floor(Number(value) || 0))
  const minutes = Math.floor(safeValue / 60)
  const seconds = String(safeValue % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

function padDatePart(value) {
  return String(value).padStart(2, '0')
}

function formatMessageTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`
}

function base64Encode(value) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  let output = ''
  let index = 0

  while (index < value.length) {
    const first = value.charCodeAt(index++)
    const second = value.charCodeAt(index++)
    const third = value.charCodeAt(index++)
    const encodedFirst = first >> 2
    const encodedSecond = ((first & 3) << 4) | (second >> 4)
    const encodedThird = Number.isNaN(second) ? 64 : ((second & 15) << 2) | (third >> 6)
    const encodedFourth = Number.isNaN(third) ? 64 : third & 63
    output += alphabet.charAt(encodedFirst) + alphabet.charAt(encodedSecond) + alphabet.charAt(encodedThird) + alphabet.charAt(encodedFourth)
  }

  return output
}

function encodeChatReplyPayload(reply) {
  if (!reply) return ''

  try {
    return base64Encode(encodeURIComponent(JSON.stringify(reply)))
  } catch {
    return ''
  }
}

function composeChatMessageBody(text, reply) {
  const cleanText = String(text ?? '').trim()
  const encodedReply = encodeChatReplyPayload(reply)
  if (!encodedReply) return cleanText

  return `${chatReplyPrefix}${encodedReply}${chatReplySuffix}${cleanText ? `\n${cleanText}` : ''}`
}

function base64Decode(value) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  let output = ''
  let index = 0
  const cleanValue = String(value ?? '').replace(/[^A-Za-z0-9+/=]/g, '')

  while (index < cleanValue.length) {
    const first = alphabet.indexOf(cleanValue.charAt(index++))
    const second = alphabet.indexOf(cleanValue.charAt(index++))
    const third = alphabet.indexOf(cleanValue.charAt(index++))
    const fourth = alphabet.indexOf(cleanValue.charAt(index++))
    const byteOne = (first << 2) | (second >> 4)
    const byteTwo = ((second & 15) << 4) | (third >> 2)
    const byteThree = ((third & 3) << 6) | fourth
    output += String.fromCharCode(byteOne)
    if (third !== 64) output += String.fromCharCode(byteTwo)
    if (fourth !== 64) output += String.fromCharCode(byteThree)
  }

  return output
}

function decodeChatReplyPayload(value) {
  if (!value) return null

  try {
    const parsed = JSON.parse(decodeURIComponent(base64Decode(value)))
    return {
      id: String(parsed.id ?? ''),
      sender: String(parsed.sender ?? ''),
      text: String(parsed.text ?? ''),
    }
  } catch {
    return null
  }
}

function parseChatMessageBody(body = '') {
  const messageBody = String(body ?? '')

  if (!messageBody.startsWith(chatReplyPrefix)) {
    return { reply: null, text: messageBody }
  }

  const suffixIndex = messageBody.indexOf(chatReplySuffix)
  if (suffixIndex < 0) return { reply: null, text: messageBody }

  const encodedReply = messageBody.slice(chatReplyPrefix.length, suffixIndex)
  const reply = decodeChatReplyPayload(encodedReply)
  const text = messageBody.slice(suffixIndex + chatReplySuffix.length).replace(/^\n+/, '')

  return { reply, text }
}

function truncateChatText(value, maxLength = 120) {
  const cleanValue = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (cleanValue.length <= maxLength) return cleanValue
  return `${cleanValue.slice(0, maxLength - 1).trim()}...`
}

function getMessageDisplay(message) {
  return parseChatMessageBody(message?.body ?? '')
}

function getMessagePreviewText(message) {
  const display = getMessageDisplay(message)
  if (display.text) return display.text
  if (isAudioPath(message?.attachmentPath)) return 'Messaggio vocale'
  if (isImagePath(message?.attachmentPath)) return 'Foto allegata'
  return 'Messaggio'
}

function createReplyReference(message, sender) {
  if (!message?.id) return null

  return {
    id: message.id,
    sender,
    text: truncateChatText(getMessagePreviewText(message), 120),
  }
}

function getVisibleSenderName(message = {}, currentUserRole = '', fallbackName = '') {
  if (message.senderRole === currentUserRole) return 'Tu'
  return message.senderName || fallbackName || 'Mittente'
}

function getReactionEmoji(value) {
  const legacyReactionMap = {
    Cuore: '❤️',
    Grazie: '🙏',
    OK: '👍',
    Visto: '👀',
  }

  return reactionOptions.find((reaction) => reaction.value === value)?.emoji ?? legacyReactionMap[value] ?? value
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
  if (/audio-chat-/i.test(path)) return /\.(m4a|aac|mp3|mp4|mpeg|ogg|opus|wav|webm)$/i.test(path)
  return /\.(m4a|aac|mp3|mpeg|ogg|opus|wav)$/i.test(path)
}

function isVideoPath(path = '') {
  return /\.(m4v|mov|mp4|webm)$/i.test(path) && !/audio-chat-/i.test(path)
}

function isPreviewableImageUri(uri = '') {
  return /^(https?:|file:|content:|data:image\/)/i.test(String(uri ?? '').trim())
}

function isPreviewableMediaUri(uri = '') {
  return /^(https?:|file:|content:|data:image\/)/i.test(String(uri ?? '').trim())
}

function getAttachmentKind(path = '') {
  if (isImagePath(path)) return 'image'
  if (isAudioPath(path)) return 'audio'
  if (isVideoPath(path)) return 'video'
  return path ? 'file' : ''
}

function getPendingAttachmentKind(asset = {}) {
  const kind = asset.kind || asset.type
  const mimeType = String(asset.mimeType ?? asset.type ?? '').toLowerCase()
  const fileName = String(asset.fileName ?? asset.name ?? asset.uri ?? '').toLowerCase()

  if (kind === 'video' || mimeType.startsWith('video/') || /\.(mp4|mov|m4v|webm)$/i.test(fileName)) return 'video'
  if (kind === 'audio' || mimeType.startsWith('audio/') || /\.(m4a|aac|mp3|mpeg|ogg|opus|wav)$/i.test(fileName)) return 'audio'
  if (kind === 'image' || mimeType.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif)$/i.test(fileName)) return 'image'
  return 'file'
}

function getPendingAttachmentExtension(kind, mimeType = '') {
  const cleanMimeType = String(mimeType ?? '').toLowerCase()

  if (cleanMimeType === 'image/heic') return 'heic'
  if (cleanMimeType === 'image/heif') return 'heif'
  if (cleanMimeType === 'image/png') return 'png'
  if (cleanMimeType === 'image/webp') return 'webp'
  if (cleanMimeType === 'video/quicktime') return 'mov'
  if (cleanMimeType === 'video/webm') return 'webm'
  if (cleanMimeType === 'audio/aac') return 'aac'
  if (cleanMimeType === 'audio/mpeg') return 'mp3'
  if (cleanMimeType === 'audio/ogg') return 'ogg'
  if (cleanMimeType === 'audio/wav' || cleanMimeType === 'audio/x-wav') return 'wav'

  const defaultExtensionMap = {
    audio: 'm4a',
    file: 'dat',
    image: 'jpg',
    video: 'mp4',
  }

  return defaultExtensionMap[kind] ?? 'dat'
}

function createPendingAttachment(asset, index = 0) {
  const kind = getPendingAttachmentKind(asset)
  const mimeType = asset.mimeType || asset.type || ''
  const extension = getPendingAttachmentExtension(kind, mimeType)
  const timestamp = Date.now()

  return {
    id: `${asset.assetId || asset.uri || timestamp}-${index}`,
    kind,
    name: asset.fileName || `allegato-${timestamp}-${index + 1}.${extension}`,
    size: asset.fileSize || asset.size || 0,
    type: mimeType || (kind === 'video' ? 'video/mp4' : kind === 'audio' ? 'audio/mp4' : kind === 'image' ? 'image/jpeg' : 'application/octet-stream'),
    uri: asset.uri,
  }
}

function formatAttachmentSize(bytes = 0) {
  if (!bytes) return ''
  return `${(bytes / oneMegabyte).toFixed(bytes >= 10 * oneMegabyte ? 0 : 1)} MB`
}

function isAttachmentWithinLimit(attachment) {
  const limit = maxChatAttachmentSizeByKind[attachment.kind] ?? maxChatAttachmentSizeByKind.file
  return !attachment.size || attachment.size <= limit
}

function getAttachmentDefaultText(attachment) {
  if (attachment?.kind === 'audio') return 'Messaggio vocale'
  if (attachment?.kind === 'file') return 'File allegato'
  return attachment?.kind === 'video' ? 'Video allegato' : 'Foto allegata'
}

function getMediaFileExtension(path = '') {
  const cleanPath = String(path ?? '').split('?')[0]
  const match = cleanPath.match(/\.([a-z0-9]+)$/i)
  const extension = match?.[1]?.toLowerCase()

  if (extension && ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'm4v', 'mov', 'mp4', 'webm'].includes(extension)) return extension
  return 'jpg'
}

async function saveMediaToGallery(signedUrl, path = '') {
  if (!signedUrl) return false

  try {
    const permission = await MediaLibrary.requestPermissionsAsync(true, ['photo', 'video'])
    if (!permission.granted) {
      Alert.alert('Permesso necessario', 'Consenti l accesso alla galleria per salvare il file.')
      return false
    }

    const extension = getMediaFileExtension(path)
    const localUri = `${FileSystem.cacheDirectory}vygo-${Date.now()}.${extension}`
    const download = await FileSystem.downloadAsync(signedUrl, localUri)
    await MediaLibrary.saveToLibraryAsync(download.uri)
    Alert.alert('File salvato', 'Il file è stato salvato nella galleria del telefono.')
    return true
  } catch {
    Alert.alert('File non salvato', 'Non sono riuscito a salvare questo file. Riprova tra poco.')
    return false
  }
}

async function saveImageToGallery(signedUrl, path = '') {
  return saveMediaToGallery(signedUrl, path)
}

function Avatar({ icon, initials, isDriver, onPress, uri }) {
  const safeUri = isPreviewableImageUri(uri) ? uri : ''
  const content = (
    <View style={[styles.avatar, isDriver ? styles.driverAvatar : styles.companyAvatar]}>
      {safeUri ? (
        <Image source={{ uri: safeUri }} style={styles.avatarImage} />
      ) : icon ? (
        <Ionicons color={colors.ink} name={icon} size={20} />
      ) : (
        <Text style={styles.avatarText}>{initials}</Text>
      )}
    </View>
  )

  if ((!safeUri && !icon) || !onPress) return content

  return <Pressable onPress={onPress}>{content}</Pressable>
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
  const player = useAudioPlayer(signedUrl || null, { updateInterval: 120 })
  const status = useAudioPlayerStatus(player)
  const duration = Number(status.duration) || 0
  const currentTime = Math.min(Number(status.currentTime) || 0, duration || Number(status.currentTime) || 0)
  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0

  async function playAudio() {
    if (!signedUrl) return

    if (status.playing) {
      player.pause()
      return
    }

    if (duration > 0 && currentTime >= duration - 0.25) {
      await player.seekTo(0)
    }

    player.play()
  }

  return (
    <Pressable onPress={playAudio} style={styles.audioAttachment}>
      <View style={styles.audioIcon}>
        <Ionicons color={colors.white} name={status.playing ? 'pause' : 'play'} size={14} />
      </View>
      <View style={styles.audioWave}>
        {audioWaveHeights.map((height, index) => {
          const isActive = duration > 0 && index / Math.max(1, audioWaveHeights.length - 1) <= progress

          return (
            <View
              key={index}
              style={[
                styles.waveBar,
                isActive && styles.waveBarActive,
                { height },
              ]}
            />
          )
        })}
      </View>
      <View style={styles.audioCopy}>
        <Text style={styles.audioText}>Vocale</Text>
        <Text style={styles.audioTime}>
          {duration > 0 ? `${formatAudioTime(currentTime)} / ${formatAudioTime(duration)}` : '0:00'}
        </Text>
      </View>
    </Pressable>
  )
}

function VideoAttachment({ expanded = false, onOpen, path, signedUrl }) {
  const player = useVideoPlayer(signedUrl || null, (videoPlayer) => {
    videoPlayer.loop = false
  })

  if (!signedUrl) return <View style={styles.imageSkeleton} />

  return (
    <View style={[styles.videoAttachment, expanded && styles.videoAttachmentExpanded]}>
      <VideoView
        allowsFullscreen
        contentFit={expanded ? 'contain' : 'cover'}
        nativeControls
        player={player}
        style={[styles.videoAttachmentPlayer, expanded && styles.videoAttachmentPlayerExpanded]}
      />
      <View style={[styles.videoAttachmentActions, expanded && styles.videoAttachmentActionsExpanded]}>
        {expanded ? null : (
          <Pressable onPress={() => onOpen?.(signedUrl, getAttachmentTitle(path), path)} style={styles.videoActionButton}>
            <Ionicons color={colors.ink} name="expand-outline" size={16} />
            <Text style={styles.videoActionText}>Apri</Text>
          </Pressable>
        )}
        <Pressable onPress={() => saveMediaToGallery(signedUrl, path)} style={styles.videoActionButton}>
          <Ionicons color={colors.ink} name="download-outline" size={16} />
          <Text style={styles.videoActionText}>Salva</Text>
        </Pressable>
      </View>
    </View>
  )
}

function VideoPreviewModal({ onClose, preview }) {
  const { height, width } = useWindowDimensions()
  const signedUrl = String(preview?.uri ?? '').trim()
  const player = useVideoPlayer(signedUrl || null, (videoPlayer) => {
    videoPlayer.loop = false
  })

  useEffect(() => {
    if (!signedUrl) return undefined

    const timer = setTimeout(() => {
      try {
        player.play()
      } catch {
        // Native controls remain available if autoplay is blocked.
      }
    }, 180)

    return () => clearTimeout(timer)
  }, [player, signedUrl])

  if (!preview) return null

  const playerHeight = Math.max(280, height - 174)
  const playerWidth = Math.max(280, width)

  return (
    <Modal animationType="fade" visible={Boolean(preview)} onRequestClose={onClose}>
      <View style={styles.videoModalScreen}>
        <Pressable onPress={onClose} style={styles.videoModalClose}>
          <Ionicons color={colors.white} name="close" size={24} />
        </Pressable>
        <View style={styles.videoModalPlayerShell}>
          {signedUrl ? (
            <VideoView
              allowsFullscreen
              contentFit="contain"
              key={signedUrl}
              nativeControls
              player={player}
              style={[styles.videoModalPlayer, { height: playerHeight, width: playerWidth }]}
            />
          ) : (
            <View style={[styles.videoModalPlayer, styles.videoModalFallback, { height: playerHeight, width: playerWidth }]}>
              <Text style={styles.videoModalFallbackText}>Video non caricato</Text>
            </View>
          )}
        </View>
        <View style={styles.videoModalActions}>
          <Text numberOfLines={1} style={styles.videoModalTitle}>{preview?.name}</Text>
          <Pressable disabled={!signedUrl} onPress={() => saveMediaToGallery(signedUrl, preview?.path)} style={styles.videoModalActionButton}>
            <Ionicons color={colors.ink} name="download-outline" size={16} />
            <Text style={styles.videoModalActionText}>Salva</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

function AttachmentPreview({ onOpenImage, path }) {
  const [signedUrl, setSignedUrl] = useState('')
  const directUrl = isPreviewableMediaUri(path) ? String(path).trim() : ''

  useEffect(() => {
    let isActive = true

    async function loadSignedUrl() {
      if (directUrl) {
        setSignedUrl(directUrl)
        return
      }

      const result = await createCompanyAssetSignedUrl(path)
      if (isActive) setSignedUrl(result.data?.signedUrl ?? '')
    }

    if (path) loadSignedUrl()

    return () => {
      isActive = false
    }
  }, [directUrl, path])

  if (!path) return null

  if (isAudioPath(path)) {
    return <AudioAttachment signedUrl={signedUrl} />
  }

  if (isImagePath(path)) {
    return signedUrl ? (
      <Pressable
        onLongPress={() => saveImageToGallery(signedUrl, path)}
        onPress={() => onOpenImage?.(signedUrl, getAttachmentTitle(path), path)}
      >
        <Image source={{ uri: signedUrl }} style={styles.imageAttachment} />
      </Pressable>
    ) : <View style={styles.imageSkeleton} />
  }

  if (isVideoPath(path)) {
    return <VideoAttachment onOpen={onOpenImage} path={path} signedUrl={signedUrl} />
  }

  return (
    <Pressable disabled={!signedUrl} onPress={() => signedUrl && Linking.openURL(signedUrl)} style={styles.fileAttachment}>
      <Ionicons color={colors.ink} name="document-attach-outline" size={18} />
      <Text style={styles.fileAttachmentText}>Allegato disponibile</Text>
    </Pressable>
  )
}

function getAttachmentTitle(path = '') {
  const kind = getAttachmentKind(path)
  if (kind === 'image') return 'Foto'
  if (kind === 'video') return 'Video'
  if (kind === 'audio') return 'Audio'
  return 'File'
}

function MediaPreviewItem({ message, onOpenImage }) {
  const [signedUrl, setSignedUrl] = useState('')
  const kind = getAttachmentKind(message.attachmentPath)

  useEffect(() => {
    let isActive = true

    async function loadSignedUrl() {
      const result = await createCompanyAssetSignedUrl(message.attachmentPath)
      if (isActive) setSignedUrl(result.data?.signedUrl ?? '')
    }

    if (message.attachmentPath) loadSignedUrl()

    return () => {
      isActive = false
    }
  }, [message.attachmentPath])

  async function openMedia() {
    if (!signedUrl) return
    if (kind === 'image') {
      onOpenImage?.(signedUrl, getAttachmentTitle(message.attachmentPath), message.attachmentPath)
      return
    }
    await Linking.openURL(signedUrl)
  }

  async function handleLongPress() {
    if (kind !== 'image' || !signedUrl) return
    await saveImageToGallery(signedUrl, message.attachmentPath)
  }

  return (
    <Pressable onLongPress={handleLongPress} onPress={openMedia} style={styles.mediaItem}>
      <View style={styles.mediaThumb}>
        {kind === 'image' && signedUrl ? (
          <Image source={{ uri: signedUrl }} style={styles.mediaThumbImage} />
        ) : (
          <View style={styles.mediaVideoPreview}>
            <Ionicons color={colors.white} name={kind === 'video' ? 'play' : 'document-text-outline'} size={24} />
          </View>
        )}
      </View>
      <View style={styles.mediaCopy}>
        <Text style={styles.mediaTitle}>{getAttachmentTitle(message.attachmentPath)}</Text>
        <Text style={styles.mediaMeta}>{formatMessageTime(message.createdAt)}</Text>
      </View>
    </Pressable>
  )
}

function ChatInfoModal({
  companyLogoUrl,
  companyName,
  mediaMessages,
  onClose,
  onOpenImage,
  visible,
}) {
  const safeLogoUrl = isPreviewableImageUri(companyLogoUrl) ? String(companyLogoUrl).trim() : ''

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.infoScreen}>
        <View style={styles.infoHeader}>
          <Pressable onPress={onClose} style={styles.infoCloseButton}>
            <Text style={styles.infoCloseText}>‹</Text>
          </Pressable>
          <Text style={styles.infoHeaderTitle}>Foto e media</Text>
        </View>

        <ScrollView contentContainerStyle={styles.infoContent}>
          <View style={styles.infoProfile}>
            <View style={styles.infoAvatar}>
              {safeLogoUrl ? <Image source={{ uri: safeLogoUrl }} style={styles.infoAvatarImage} /> : <Text style={styles.infoAvatarText}>{getInitials(companyName)}</Text>}
            </View>
            <Text numberOfLines={2} style={styles.infoName}>{companyName}</Text>
            <Text style={styles.infoSubtitle}>Foto e video condivisi in questa chat</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoSectionHeader}>
              <Text style={styles.infoSectionTitle}>Galleria chat</Text>
              <Text style={styles.infoSectionCount}>{mediaMessages.length}</Text>
            </View>

            {mediaMessages.length ? (
              <View style={styles.mediaGrid}>
                {mediaMessages.map((message) => (
                  <MediaPreviewItem key={`${message.id}-${message.attachmentPath}`} message={message} onOpenImage={onOpenImage} />
                ))}
              </View>
            ) : (
              <Text style={styles.infoEmptyText}>Nessuna foto o video condivisi ancora.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

function MessageBubble({
  currentPersonId = '',
  currentUserRole,
  message,
  onAvatarPress,
  onLongPress,
  onOpenImage,
  ownAvatarUrl,
  participantAvatarUrl,
  participantName,
  senderAvatarUrl,
  senderName,
  showSenderNames = false,
}) {
  const isOwn = currentPersonId && message.senderPersonId
    ? message.senderPersonId === currentPersonId
    : message.senderPersonId && currentUserRole === 'company'
      ? false
      : message.senderRole === currentUserRole
  const readAt = currentUserRole === 'driver' ? message.readByCompanyAt : message.readByDriverAt
  const isRead = Boolean(readAt)
  const groupReadCount = Number(message.readCount ?? 0)
  const display = getMessageDisplay(message)
  const messageText = String(display.text ?? '').trim()
  const visibleReactions = Object.entries(message.reactions ?? {}).filter(([, reaction]) => reaction)
  const visibleSenderName = senderName || (isOwn ? 'Tu' : participantName)
  const participantInitials = showSenderNames ? getInitials(visibleSenderName) : getInitials(participantName)
  const participantAvatar = showSenderNames ? senderAvatarUrl || (message.senderRole === 'company' ? participantAvatarUrl : '') : participantAvatarUrl

  return (
    <View style={[styles.messageRow, isOwn && styles.messageRowDriver]}>
      {!isOwn ? <Avatar initials={participantInitials} onPress={() => onAvatarPress?.(participantAvatar, visibleSenderName)} uri={participantAvatar} /> : null}
      <Pressable onLongPress={() => onLongPress?.(message)} style={[styles.bubble, isOwn ? styles.driverBubble : styles.companyBubble]}>
        {showSenderNames ? (
          <Text numberOfLines={1} style={[styles.messageSenderName, isOwn && styles.messageSenderNameOwn]}>
            {visibleSenderName}
          </Text>
        ) : null}
        {display.reply ? (
          <View style={styles.replyQuote}>
            <Text numberOfLines={1} style={styles.replyQuoteSender}>{display.reply.sender || 'Risposta'}</Text>
            <Text numberOfLines={2} style={styles.replyQuoteText}>{display.reply.text}</Text>
          </View>
        ) : null}
        <AttachmentPreview onOpenImage={onOpenImage} path={message.attachmentPath} />
        {messageText ? <Text style={styles.bubbleText}>{messageText}</Text> : null}
        <View style={styles.bubbleMeta}>
          <Text style={styles.bubbleTime}>{formatMessageTime(message.createdAt)}</Text>
          {isOwn && groupReadCount > 0 ? <Text style={styles.readAtText}>Letti {groupReadCount}</Text> : null}
          {isOwn && !groupReadCount && isRead ? <Text style={styles.readAtText}>Letto {formatMessageTime(readAt)}</Text> : null}
          {isOwn ? (
            <View accessibilityLabel={isRead || groupReadCount > 0 ? 'Letto' : 'Consegnato'} style={styles.readReceipt}>
              <Text style={[styles.checkMark, (isRead || groupReadCount > 0) && styles.checkMarkRead]}>✓</Text>
              <Text style={[styles.checkMark, styles.checkMarkSecond, (isRead || groupReadCount > 0) && styles.checkMarkRead]}>✓</Text>
            </View>
          ) : null}
        </View>
        {visibleReactions.length ? (
          <View style={styles.reactionSummary}>
            {visibleReactions.map(([role, reaction]) => (
              <Text key={role} style={styles.reactionSummaryText}>{getReactionEmoji(reaction)}</Text>
            ))}
          </View>
        ) : null}
      </Pressable>
      {isOwn ? <Avatar initials="IO" isDriver onPress={() => onAvatarPress?.(ownAvatarUrl, 'Tu')} uri={ownAvatarUrl} /> : null}
    </View>
  )
}

function PendingAttachmentStrip({ attachments = [], onRemove }) {
  if (!attachments.length) return null

  return (
    <View style={styles.pendingAttachmentWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.pendingAttachmentRow}>
          {attachments.map((attachment, index) => (
            <View key={attachment.id} style={styles.pendingAttachmentItem}>
              {attachment.kind === 'image' ? (
                <Image source={{ uri: attachment.uri }} style={styles.pendingAttachmentImage} />
              ) : (
                <View style={styles.pendingAttachmentVideo}>
                  <Ionicons
                    color={colors.white}
                    name={attachment.kind === 'audio' ? 'mic' : attachment.kind === 'file' ? 'document-text' : 'play'}
                    size={26}
                  />
                </View>
              )}
              <Text style={styles.pendingAttachmentCount}>{index + 1}</Text>
              <Pressable onPress={() => onRemove?.(attachment.id)} style={styles.pendingAttachmentRemove}>
                <Text style={styles.pendingAttachmentRemoveText}>x</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
      <Text style={styles.pendingAttachmentHint}>
        {attachments.length === 1 ? '1 allegato pronto' : `${attachments.length} allegati pronti`}
      </Text>
    </View>
  )
}

export function ChatScreen({
  companyLogoUrl,
  companyName,
  companyOnline = false,
  companyTyping = false,
  currentUserRole = 'driver',
  currentPersonId = '',
  driverProfileUrl,
  incomingShare,
  messages = [],
  offlineLabel = 'chat azienda',
  ownAvatarUrl,
  participantAvatarUrl,
  participantIcon = '',
  participantName,
  reactionKey = '',
  onIncomingShareConsumed,
  onRefresh,
  onReactToMessage,
  onSend,
  onStartVoiceCall,
  onTyping,
  showSenderNames = false,
  soundEnabled = true,
}) {
  const [actionMessage, setActionMessage] = useState(null)
  const [body, setBody] = useState('')
  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [replyToMessage, setReplyToMessage] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [optimisticMessages, setOptimisticMessages] = useState([])
  const [pendingAttachments, setPendingAttachments] = useState([])
  const cancelRecordingRef = useRef(false)
  const isPressingMicRef = useRef(false)
  const isRecordingRef = useRef(false)
  const isSendingRef = useRef(false)
  const listRef = useRef(null)
  const pendingStopRef = useRef('')
  const recordingStartedAtRef = useRef(0)
  const shouldStickToBottomRef = useRef(true)
  const soundHydratedRef = useRef(false)
  const latestRenderedMessageIdRef = useRef('')
  const typingTimerRef = useRef(null)
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const recorderState = useAudioRecorderState(audioRecorder, 250)
  const receiveSoundPlayer = useAudioPlayer(chatReceiveSound, { keepAudioSessionActive: true })
  const sendSoundPlayer = useAudioPlayer(chatSendSound, { keepAudioSessionActive: true })
  const renderedMessages = useMemo(() => [...messages, ...optimisticMessages], [messages, optimisticMessages])
  const listMessages = useMemo(() => [...renderedMessages].reverse(), [renderedMessages])
  const mediaMessages = useMemo(
    () => renderedMessages.filter((message) => ['image', 'video'].includes(getAttachmentKind(message.attachmentPath))),
    [renderedMessages],
  )
  const chatPartnerName = participantName || companyName
  const ownReactionKey = reactionKey || currentUserRole
  const chatPartnerAvatarUrl = participantIcon ? '' : participantAvatarUrl ?? (currentUserRole === 'driver' ? companyLogoUrl : driverProfileUrl)
  const messageParticipantAvatarUrl = participantAvatarUrl ?? (currentUserRole === 'driver' ? companyLogoUrl : driverProfileUrl)
  const chatOwnAvatarUrl = ownAvatarUrl ?? (currentUserRole === 'driver' ? driverProfileUrl : companyLogoUrl)

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

    if (latestMessage.senderRole !== currentUserRole) {
      playChatSound(receiveSoundPlayer)
      triggerChatHaptic()
    }
  }, [currentUserRole, messages, receiveSoundPlayer])

  useEffect(() => {
    const latestMessage = messages[messages.length - 1]
    const latestMessageId = latestMessage?.id ?? ''

    if (!latestMessageId || latestRenderedMessageIdRef.current === latestMessageId) return

    const shouldScroll = shouldStickToBottomRef.current || latestMessage.senderRole === currentUserRole
    latestRenderedMessageIdRef.current = latestMessageId

    if (shouldScroll) {
      setTimeout(() => listRef.current?.scrollToOffset?.({ animated: false, offset: 0 }), 40)
    }
  }, [currentUserRole, messages])

  useEffect(() => {
    isSendingRef.current = isSending
  }, [isSending])

  useEffect(() => {
    isRecordingRef.current = isRecording
  }, [isRecording])

  useEffect(() => {
    if (!incomingShare?.id) return

    const sharedText = String(incomingShare.text ?? '').trim()
    if (sharedText) {
      setBody((currentBody) => (
        currentBody.trim() ? `${currentBody.trim()}\n${sharedText}` : sharedText
      ))
    }

    if (incomingShare.attachments?.length) {
      addPendingAttachments(incomingShare.attachments)
    }

    onIncomingShareConsumed?.()
  }, [incomingShare?.id])

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

  function createOptimisticMessage({ attachment = null, body: messageBody }) {
    return {
      attachmentPath: attachment?.uri ?? '',
      body: messageBody,
      companyId: '',
      createdAt: new Date().toISOString(),
      id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      reactions: {},
      readByCompanyAt: '',
      readByDriverAt: '',
      senderRole: currentUserRole,
      threadId: '',
    }
  }

  function removeOptimisticMessages(messageIds = []) {
    if (!messageIds.length) return
    setOptimisticMessages((currentMessages) => currentMessages.filter((message) => !messageIds.includes(message.id)))
  }

  async function handleSendComposer() {
    const cleanBody = body.trim()
    const attachmentsToSend = pendingAttachments
    if ((!cleanBody && !attachmentsToSend.length) || isSending) return

    const currentReply = replyToMessage
    setBody('')
    setPendingAttachments([])
    setReplyToMessage(null)
    onTyping?.(false)
    setIsSending(true)

    let failedIndex = -1
    const optimisticBatch = attachmentsToSend.length
      ? attachmentsToSend.map((attachment, index) => createOptimisticMessage({
          attachment,
          body: composeChatMessageBody(
            (index === 0 ? cleanBody : '') || getAttachmentDefaultText(attachment),
            index === 0 ? currentReply : null,
          ),
        }))
      : [createOptimisticMessage({ body: composeChatMessageBody(cleanBody, currentReply) })]
    const optimisticIds = optimisticBatch.map((message) => message.id)

    setOptimisticMessages((currentMessages) => [...currentMessages, ...optimisticBatch])
    setTimeout(() => listRef.current?.scrollToOffset?.({ animated: false, offset: 0 }), 20)

    if (attachmentsToSend.length) {
      for (let index = 0; index < attachmentsToSend.length; index += 1) {
        const attachment = attachmentsToSend[index]
        const attachmentText = index === 0 ? cleanBody : ''
        const attachmentReply = index === 0 ? currentReply : null
        const outgoingBody = composeChatMessageBody(attachmentText || getAttachmentDefaultText(attachment), attachmentReply)
        const sent = await onSend?.(outgoingBody, attachment)

        if (!sent) {
          failedIndex = index
          break
        }
      }
    } else {
      const outgoingBody = composeChatMessageBody(cleanBody, currentReply)
      const sent = await onSend?.(outgoingBody)
      if (!sent) failedIndex = 0
    }

    setIsSending(false)
    removeOptimisticMessages(optimisticIds)

    if (failedIndex >= 0) {
      if (attachmentsToSend.length) {
        setPendingAttachments(attachmentsToSend.slice(failedIndex))
      }
      if (!attachmentsToSend.length || failedIndex === 0) {
        setBody(cleanBody)
        setReplyToMessage(currentReply)
      }
      Alert.alert('Messaggio non inviato', 'Riprova tra qualche secondo.')
      return
    }

    playChatSound(sendSoundPlayer)
    triggerChatHaptic()
    setTimeout(() => listRef.current?.scrollToOffset?.({ animated: false, offset: 0 }), 80)
  }

  function addPendingAttachments(assets = []) {
    const selectedAttachments = assets
      .filter((asset) => asset?.uri)
      .map(createPendingAttachment)
    const acceptedAttachments = selectedAttachments.filter(isAttachmentWithinLimit)
    const rejectedAttachments = selectedAttachments.filter((attachment) => !isAttachmentWithinLimit(attachment))

    if (rejectedAttachments.length) {
      const rejectedSummary = rejectedAttachments
        .slice(0, 3)
        .map((attachment) => `${attachment.kind === 'video' ? 'video' : attachment.kind === 'image' ? 'foto' : attachment.kind === 'audio' ? 'audio' : 'file'} ${formatAttachmentSize(attachment.size)}`.trim())
        .join(', ')
      Alert.alert(
        'File troppo pesante',
        `Per tenere Vygo veloce e leggera, invia foto fino a 5 MB, video fino a 25 MB e audio fino a 8 MB.${rejectedSummary ? ` Scartati: ${rejectedSummary}.` : ''}`,
      )
    }

    if (!acceptedAttachments.length) return

    setPendingAttachments((currentAttachments) => (
      [...currentAttachments, ...acceptedAttachments].slice(0, maxChatAttachments)
    ))
  }

  async function pickImageFromLibrary() {
    if (isSending) return

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      allowsMultipleSelection: true,
      mediaTypes: ['images', 'videos'],
      orderedSelection: true,
      preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      quality: 0.35,
      selectionLimit: maxChatAttachments,
    })

    if (result.canceled || !result.assets?.[0]) return

    addPendingAttachments(result.assets)
  }

  async function takePhotoFromCamera() {
    if (isSending) return

    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Fotocamera bloccata', 'Consenti la fotocamera per scattare foto o video dalla chat.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      mediaTypes: ['images', 'videos'],
      quality: 0.35,
      videoMaxDuration: 30,
    })

    if (result.canceled || !result.assets?.[0]) return

    addPendingAttachments(result.assets)
  }

  function handleOpenAttachmentMenu() {
    if (isSending || isRecording) return

    Alert.alert(
      'Allega alla chat',
      'Scegli cosa vuoi inviare.',
      [
        { text: 'Scatta foto/video', onPress: takePhotoFromCamera },
        { text: 'Galleria', onPress: pickImageFromLibrary },
        { text: 'Annulla', style: 'cancel' },
      ],
    )
  }

  function removePendingAttachment(attachmentId) {
    setPendingAttachments((currentAttachments) => (
      currentAttachments.filter((attachment) => attachment.id !== attachmentId)
    ))
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
    const cleanBody = composeChatMessageBody('Messaggio vocale', replyToMessage)
    setReplyToMessage(null)
    const sent = await onSend?.(cleanBody, {
      name: `audio-chat-${Date.now()}.m4a`,
      type: 'audio/mp4',
      uri,
    })
    setIsSending(false)

    if (!sent) setReplyToMessage(replyToMessage)
    if (sent) {
      playChatSound(sendSoundPlayer)
      triggerChatHaptic()
    }
    if (!sent) Alert.alert('Vocale non inviato', 'Riprova tra qualche secondo.')
  }

  const statusText = companyTyping ? 'sta scrivendo...' : companyOnline ? 'online' : offlineLabel
  const canSendText = (Boolean(body.trim()) || pendingAttachments.length > 0) && !isSending
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

  function handleScroll(event) {
    shouldStickToBottomRef.current = event.nativeEvent.contentOffset.y < 90
  }

  function openAvatarPreview(uri, name) {
    if (!isPreviewableImageUri(uri)) return
    setPhotoPreview({ name, uri: String(uri).trim() })
  }

  function openMediaPreview(uri, name, path = '') {
    if (!isPreviewableMediaUri(uri)) return
    setPhotoPreview({ kind: getAttachmentKind(path), name, path, uri: String(uri).trim() })
  }

  async function copyMessage(message) {
    const text = getMessagePreviewText(message)
    if (!text) return
    await Clipboard.setStringAsync(text)
    setActionMessage(null)
    Alert.alert('Copiato', 'Messaggio copiato.')
  }

  function replyToSelectedMessage(message) {
    const sender = getVisibleSenderName(message, currentUserRole, chatPartnerName)
    setReplyToMessage(createReplyReference(message, sender))
    setActionMessage(null)
  }

  async function reactToSelectedMessage(message, reaction) {
    const currentReaction = message.reactions?.[ownReactionKey] ?? ''
    const nextReaction = currentReaction === reaction ? '' : reaction
    setActionMessage(null)
    await onReactToMessage?.(message, currentUserRole, nextReaction)
  }

  function closeActionMenu() {
    setActionMessage(null)
  }

  return (
    <View style={styles.screen}>
      <View style={styles.chatHeader}>
        <Avatar
          icon={participantIcon}
          initials={getInitials(chatPartnerName)}
          onPress={() => openAvatarPreview(chatPartnerAvatarUrl, chatPartnerName)}
          uri={chatPartnerAvatarUrl}
        />
        <View style={styles.headerCopy}>
          <Text numberOfLines={1} style={styles.chatTitle}>{chatPartnerName}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, companyOnline && styles.statusDotOnline]} />
            <Text style={[styles.chatSubtitle, companyTyping && styles.typingText]}>{statusText}</Text>
          </View>
        </View>
        {onStartVoiceCall ? (
          <Pressable
            accessibilityLabel={`Chiama ${chatPartnerName}`}
            onPress={() => onStartVoiceCall(chatPartnerName)}
            style={[styles.mediaHeaderButton, styles.callHeaderButton]}
          >
            <Ionicons color={colors.ink} name="call-outline" size={19} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel="Apri foto e media della chat"
          onPress={() => setIsChatInfoOpen(true)}
          style={styles.mediaHeaderButton}
        >
          <Ionicons color={colors.ink} name="images-outline" size={19} />
          {mediaMessages.length > 0 ? <Text style={styles.mediaHeaderCount}>{mediaMessages.length}</Text> : null}
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={styles.messageList}
        data={listMessages}
        initialNumToRender={24}
        inverted={listMessages.length > 0}
        keyExtractor={(item) => item.id}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        onScroll={handleScroll}
        scrollEventThrottle={80}
        ref={listRef}
        refreshControl={<RefreshControl onRefresh={handleRefresh} refreshing={isRefreshing} tintColor={colors.cyan} />}
        renderItem={({ item }) => (
          <MessageBubble
            currentPersonId={currentPersonId}
            currentUserRole={currentUserRole}
            message={item}
            onAvatarPress={openAvatarPreview}
            onLongPress={setActionMessage}
            onOpenImage={openMediaPreview}
            ownAvatarUrl={chatOwnAvatarUrl}
            participantAvatarUrl={messageParticipantAvatarUrl}
            participantName={chatPartnerName}
            senderAvatarUrl={item.senderAvatarUrl}
            senderName={getVisibleSenderName(item, currentUserRole, chatPartnerName)}
            showSenderNames={showSenderNames}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nessun messaggio</Text>
            <Text style={styles.emptyText}>Scrivi all azienda quando serve.</Text>
          </View>
        }
      />

      <PendingAttachmentStrip attachments={pendingAttachments} onRemove={removePendingAttachment} />

      {replyToMessage ? (
        <View style={styles.replyComposer}>
          <View style={styles.replyComposerCopy}>
            <Text numberOfLines={1} style={styles.replyComposerTitle}>Risposta a {replyToMessage.sender}</Text>
            <Text numberOfLines={1} style={styles.replyComposerText}>{replyToMessage.text}</Text>
          </View>
          <Pressable onPress={() => setReplyToMessage(null)} style={styles.replyComposerClose}>
            <Text style={styles.replyComposerCloseText}>×</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.composer}>
        <Pressable disabled={isSending || isRecording} onPress={handleOpenAttachmentMenu} style={[styles.roundButton, isRecording && styles.hiddenComposerItem]}>
          <Text style={styles.roundButtonText}>+</Text>
        </Pressable>
        <TextInput
          autoCapitalize="sentences"
          autoCorrect
          editable={!isRecording && !isSending}
          multiline
          onChangeText={handleBodyChange}
          placeholder="Scrivi un messaggio"
          placeholderTextColor="#94a3b8"
          spellCheck
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
          <Pressable onPress={handleSendComposer} style={styles.sendButton}>
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

      <Modal animationType="fade" transparent visible={Boolean(actionMessage)} onRequestClose={closeActionMenu}>
        <Pressable onPress={closeActionMenu} style={styles.modalBackdrop}>
          <Pressable onPress={(event) => event?.stopPropagation?.()} style={styles.actionSheet}>
            <Text style={styles.actionTitle}>Messaggio</Text>
            <View style={styles.reactionPicker}>
              {reactionOptions.map((reaction) => (
                <Pressable
                  key={reaction.value}
                  onPress={() => reactToSelectedMessage(actionMessage, reaction.value)}
                  style={styles.reactionButton}
                >
                  <Text style={styles.reactionButtonText}>{reaction.emoji}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => replyToSelectedMessage(actionMessage)} style={styles.actionRow}>
              <Text style={styles.actionRowText}>Rispondi</Text>
            </Pressable>
            <Pressable onPress={() => copyMessage(actionMessage)} style={styles.actionRow}>
              <Text style={styles.actionRowText}>Copia</Text>
            </Pressable>
            <Pressable hitSlop={8} onPress={closeActionMenu} style={styles.actionRow}>
              <Text style={styles.actionRowText}>Chiudi</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {photoPreview?.kind === 'video' ? (
        <VideoPreviewModal onClose={() => setPhotoPreview(null)} preview={photoPreview} />
      ) : (
        <Modal animationType="fade" transparent visible={Boolean(photoPreview)} onRequestClose={() => setPhotoPreview(null)}>
          <Pressable onPress={() => setPhotoPreview(null)} style={styles.photoModalBackdrop}>
            <View style={styles.photoModalCard}>
              {isPreviewableImageUri(photoPreview?.uri) ? (
                <Pressable onLongPress={() => saveImageToGallery(photoPreview.uri, photoPreview.path)} style={styles.photoModalImageWrap}>
                  <Image
                    onError={() => setPhotoPreview(null)}
                    source={{ uri: photoPreview.uri }}
                    style={styles.photoModalImage}
                  />
                </Pressable>
              ) : null}
              <Text style={styles.photoModalTitle}>{photoPreview?.name}</Text>
              <Text style={styles.photoModalHint}>Tieni premuto per salvare</Text>
            </View>
          </Pressable>
        </Modal>
      )}

      <ChatInfoModal
        companyLogoUrl={chatPartnerAvatarUrl}
        companyName={chatPartnerName}
        mediaMessages={mediaMessages}
        onClose={() => setIsChatInfoOpen(false)}
        onOpenImage={openMediaPreview}
        visible={isChatInfoOpen}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  actionRow: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  actionRowText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  actionSheet: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginHorizontal: 18,
    overflow: 'hidden',
    width: '90%',
  },
  actionTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: 16,
    paddingTop: 16,
    textTransform: 'uppercase',
  },
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
  audioCopy: {
    minWidth: 56,
  },
  audioText: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
  },
  audioTime: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
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
  messageSenderName: {
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 5,
  },
  messageSenderNameOwn: {
    color: colors.ink,
    textAlign: 'right',
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
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    padding: 10,
  },
  fileAttachmentText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  infoAvatar: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderColor: colors.cyan,
    borderRadius: 28,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 72,
  },
  infoAvatarImage: {
    height: '100%',
    width: '100%',
  },
  infoAvatarText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  infoCloseButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  infoCloseText: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30,
  },
  infoContent: {
    padding: layout.screenPadding,
    paddingBottom: 34,
  },
  infoEmptyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 18,
    textAlign: 'center',
  },
  infoHeader: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 12,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
  },
  infoHeaderTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  infoName: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
    marginTop: 12,
    textAlign: 'center',
  },
  infoProfile: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  infoScreen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  infoSection: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoSectionCount: {
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    minWidth: 28,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: 'center',
  },
  infoSectionHeader: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  infoSectionTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  infoSubtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  mediaHeaderButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderColor: colors.cyan,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    minHeight: 38,
    minWidth: 46,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  callHeaderButton: {
    backgroundColor: '#ecfeff',
    minWidth: 38,
    paddingHorizontal: 0,
  },
  mediaHeaderCount: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
  },
  mediaCopy: {
    paddingHorizontal: 4,
    paddingTop: 7,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
  },
  mediaItem: {
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    width: '48%',
  },
  mediaMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  mediaThumb: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#07111f',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  mediaThumbImage: {
    height: '100%',
    width: '100%',
  },
  mediaTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  mediaVideoPreview: {
    alignItems: 'center',
    backgroundColor: '#07111f',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
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
  videoActionButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 34,
  },
  videoActionText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  videoAttachment: {
    backgroundColor: '#020617',
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
    width: 236,
  },
  videoAttachmentExpanded: {
    borderRadius: 22,
    flex: 1,
    height: '100%',
    marginBottom: 0,
    width: '100%',
  },
  videoAttachmentActions: {
    backgroundColor: '#e0faff',
    borderTopColor: '#164e63',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  videoAttachmentActionsExpanded: {
    backgroundColor: '#061623',
    borderTopColor: '#123142',
    padding: 10,
  },
  videoAttachmentPlayer: {
    aspectRatio: 16 / 10,
    width: '100%',
  },
  videoAttachmentPlayerExpanded: {
    backgroundColor: '#020617',
    flex: 1,
    width: '100%',
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
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.36)',
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 22,
  },
  photoModalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.82)',
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  photoModalCard: {
    alignItems: 'center',
    width: '100%',
  },
  photoModalImage: {
    height: '100%',
    width: '100%',
  },
  photoModalImageWrap: {
    aspectRatio: 1,
    borderColor: colors.cyan,
    borderRadius: 24,
    borderWidth: 2,
    maxWidth: 320,
    overflow: 'hidden',
    width: '90%',
  },
  videoModalClose: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    top: 18,
    width: 44,
    zIndex: 4,
  },
  videoModalActionButton: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 16,
  },
  videoModalActionText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  videoModalActions: {
    alignItems: 'center',
    backgroundColor: '#020617',
    borderTopColor: '#123142',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 74,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  videoModalFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoModalFallbackText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '900',
  },
  videoModalPlayer: {
    backgroundColor: '#020617',
  },
  videoModalPlayerShell: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 56,
    width: '100%',
  },
  videoModalScreen: {
    backgroundColor: '#020617',
    flex: 1,
  },
  videoModalTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  photoModalHint: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  photoModalTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 14,
  },
  pendingAttachmentCount: {
    backgroundColor: colors.cyan,
    borderRadius: 999,
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
    height: 22,
    left: 6,
    lineHeight: 22,
    overflow: 'hidden',
    position: 'absolute',
    textAlign: 'center',
    top: 6,
    width: 22,
  },
  pendingAttachmentHint: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 7,
  },
  pendingAttachmentImage: {
    height: '100%',
    width: '100%',
  },
  pendingAttachmentItem: {
    backgroundColor: '#07111f',
    borderColor: 'rgba(18, 198, 223, 0.45)',
    borderRadius: 18,
    borderWidth: 1,
    height: 86,
    overflow: 'hidden',
    width: 86,
  },
  pendingAttachmentRemove: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.84)',
    borderRadius: 999,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 6,
    top: 6,
    width: 24,
  },
  pendingAttachmentRemoveText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },
  pendingAttachmentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pendingAttachmentVideo: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  pendingAttachmentWrap: {
    backgroundColor: colors.white,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 10,
  },
  reactionButton: {
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  reactionButtonText: {
    fontSize: 22,
  },
  reactionPicker: {
    flexDirection: 'row',
    gap: 8,
    padding: 14,
  },
  reactionSummary: {
    alignSelf: 'flex-end',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 2,
    marginBottom: -19,
    marginTop: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  reactionSummaryText: {
    fontSize: 13,
  },
  readAtText: {
    color: colors.cyanDark,
    fontSize: 10,
    fontWeight: '900',
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
  replyComposer: {
    alignItems: 'center',
    backgroundColor: '#ecfeff',
    borderLeftColor: colors.cyan,
    borderLeftWidth: 4,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 8,
  },
  replyComposerClose: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  replyComposerCloseText: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  replyComposerCopy: {
    flex: 1,
  },
  replyComposerText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  replyComposerTitle: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  replyQuote: {
    backgroundColor: 'rgba(2, 6, 23, 0.06)',
    borderLeftColor: colors.cyan,
    borderLeftWidth: 3,
    borderRadius: 10,
    marginBottom: 8,
    padding: 8,
  },
  replyQuoteSender: {
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
  },
  replyQuoteText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
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
    backgroundColor: '#94a3b8',
    borderRadius: 999,
    opacity: 0.55,
    width: 3,
  },
  waveBarActive: {
    backgroundColor: colors.cyanDark,
    opacity: 1,
  },
})
