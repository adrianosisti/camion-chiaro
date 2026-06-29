import { useEffect, useState } from 'react'
import { Alert, Image, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import * as ImagePicker from 'expo-image-picker'
import { DateField } from '../components/DateField'
import { Panel } from '../components/Panel'
import { PrimaryButton } from '../components/PrimaryButton'
import { getLocale, t } from '../i18n/native'
import { createDriverDocumentSignedUrl } from '../services/driverApi'
import { colors, layout } from '../theme'

const documentPresets = [
  'Patente',
  'CQC',
  'ADR',
  'Tessera tachigrafica',
  'Visita medica',
  'Carta identita',
  'Permesso di soggiorno',
]

function formatDocumentDate(value, language) {
  if (!value) return t(language, 'noDeadline')
  return new Intl.DateTimeFormat(getLocale(language), { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

function getDocumentDaysLeft(document) {
  if (!document?.expiresAt) return 9999

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiresAt = new Date(document.expiresAt)
  expiresAt.setHours(0, 0, 0, 0)

  return Math.ceil((expiresAt - today) / 86400000)
}

function getDocumentTone(document) {
  if (!document.expiresAt) return 'ready'

  const daysLeft = getDocumentDaysLeft(document)
  if (daysLeft < 0) return 'expired'
  if (daysLeft <= 30) return 'warning'
  if (!document.filePath) return 'missing'
  return 'ready'
}

function getDocumentStatusLabel(document) {
  const tone = getDocumentTone(document)
  const daysLeft = getDocumentDaysLeft(document)

  if (tone === 'expired') return `Scaduto da ${Math.abs(daysLeft)} gg`
  if (tone === 'warning' && daysLeft === 0) return 'Scade oggi'
  if (tone === 'warning') return `Scade tra ${daysLeft} gg`
  if (tone === 'missing') return 'File da caricare'
  return document.filePath ? 'File disponibile' : 'File da caricare'
}

function getDocumentTypeKey(value = '') {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ')
}

function getDocumentTime(document = {}) {
  const time = document.expiresAt ? new Date(document.expiresAt).getTime() : 0
  return Number.isFinite(time) ? time : 0
}

function getLatestDocumentsByType(documents = []) {
  const byType = new Map()

  documents.forEach((document) => {
    const key = getDocumentTypeKey(document.type || document.id)
    const current = byType.get(key)
    if (!current || getDocumentTime(document) >= getDocumentTime(current)) {
      byType.set(key, document)
    }
  })

  return Array.from(byType.values())
}

function isImageDocument(path = '') {
  return /\.(jpe?g|png|webp|heic|heif)$/i.test(String(path ?? '').split('?')[0])
}

function getFileExtension(path = '') {
  const cleanPath = String(path ?? '').split('?')[0]
  const match = cleanPath.match(/\.([a-z0-9]+)$/i)
  return match?.[1]?.toLowerCase() || 'pdf'
}

function isValidDateValue(value = '') {
  if (!value) return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsedDate = new Date(value)
  return Number.isFinite(parsedDate.getTime())
}

function DocumentPreview({ language, onClose, preview }) {
  if (!preview?.uri) return null

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible>
      <View style={styles.previewBackdrop}>
        <View style={styles.previewShell}>
          <View style={styles.previewHeader}>
            <Text numberOfLines={1} style={styles.previewTitle}>{preview.title}</Text>
            <Pressable onPress={onClose} style={styles.previewClose}>
              <Text style={styles.previewCloseText}>{t(language, 'close')}</Text>
            </Pressable>
          </View>
          <Image resizeMode="contain" source={{ uri: preview.uri }} style={styles.previewImage} />
        </View>
      </View>
    </Modal>
  )
}

function DocumentRow({ autoOpenRenewal = false, document, highlight = false, language = 'it', onAutoOpenHandled, onRenewDocument, onUploadDocument }) {
  const [isBusy, setIsBusy] = useState(false)
  const [preview, setPreview] = useState(null)
  const [renewDocumentNumber, setRenewDocumentNumber] = useState(document.documentNumber ?? '')
  const [renewExpiresAt, setRenewExpiresAt] = useState(document.expiresAt ?? '')
  const [renewFile, setRenewFile] = useState(null)
  const [renewModalVisible, setRenewModalVisible] = useState(false)
  const [renewType, setRenewType] = useState(document.type ?? '')
  const tone = getDocumentTone(document)
  const needsRenewal = document.filePath || ['expired', 'warning'].includes(tone)

  function openRenewModal() {
    setRenewType(document.type ?? '')
    setRenewDocumentNumber(document.documentNumber ?? '')
    setRenewExpiresAt(document.expiresAt ?? '')
    setRenewFile(null)
    setRenewModalVisible(true)
  }

  useEffect(() => {
    if (!autoOpenRenewal) return
    openRenewModal()
    onAutoOpenHandled?.()
  }, [autoOpenRenewal, document.id])

  function closeRenewModal() {
    if (isBusy) return
    setRenewModalVisible(false)
    setRenewFile(null)
  }

  async function showDocument() {
    if (!document.filePath) {
      Alert.alert('File mancante', 'Carica prima il documento.')
      return
    }

    if (/^https?:\/\//i.test(document.filePath)) {
      await Linking.openURL(document.filePath)
      return
    }

    const result = await createDriverDocumentSignedUrl(document.filePath)
    const signedUrl = result.data?.signedUrl

    if (!signedUrl) {
      Alert.alert('Documento non disponibile', result.error?.message ?? 'Riprova tra qualche secondo.')
      return
    }

    if (isImageDocument(document.filePath)) {
      setPreview({ title: document.type, uri: signedUrl })
      return
    }

    try {
      setIsBusy(true)
      const extension = getFileExtension(document.filePath)
      const localUri = `${FileSystem.cacheDirectory}camion-chiaro-doc-${Date.now()}.${extension}`
      const downloaded = await FileSystem.downloadAsync(signedUrl, localUri)
      const openUri = Platform.OS === 'android' && FileSystem.getContentUriAsync
        ? await FileSystem.getContentUriAsync(downloaded.uri)
        : downloaded.uri
      await Linking.openURL(openUri)
    } catch {
      Alert.alert('Documento non aperto', 'Non sono riuscito ad aprire il file. Riprova tra poco.')
    } finally {
      setIsBusy(false)
    }
  }

  async function uploadSelectedFile(file) {
    if (!file?.uri) return

    setIsBusy(true)
    const uploaded = await onUploadDocument?.(document, file)
    setIsBusy(false)

    if (uploaded) Alert.alert('Documento aggiornato', 'Il file e stato salvato.')
  }

  async function pickDocumentFile() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    })

    if (result.canceled || !result.assets?.[0]) return

    const file = result.assets[0]
    await uploadSelectedFile({
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
      uri: file.uri,
    })
  }

  async function takeDocumentPhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Fotocamera bloccata', 'Consenti la fotocamera per fotografare il documento.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      mediaTypes: ['images'],
      quality: 0.78,
    })

    if (result.canceled || !result.assets?.[0]) return

    const asset = result.assets[0]
    await uploadSelectedFile({
      name: asset.fileName || `documento-${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
      uri: asset.uri,
    })
  }

  function pickDocument() {
    Alert.alert('Carica documento', 'Scegli se fotografarlo o caricarlo dai file.', [
      { text: 'Fotocamera', onPress: takeDocumentPhoto },
      { text: 'File/Galleria', onPress: pickDocumentFile },
      { style: 'cancel', text: 'Annulla' },
    ])
  }

  async function pickRenewFile() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    })

    if (result.canceled || !result.assets?.[0]) return

    const file = result.assets[0]
    setRenewFile({
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
      uri: file.uri,
    })
  }

  async function takeRenewPhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Fotocamera bloccata', 'Consenti la fotocamera per fotografare il documento.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      mediaTypes: ['images'],
      quality: 0.78,
    })

    if (result.canceled || !result.assets?.[0]) return

    const asset = result.assets[0]
    setRenewFile({
      name: asset.fileName || `documento-${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
      uri: asset.uri,
    })
  }

  async function saveRenewal() {
    const cleanType = renewType.trim()
    const cleanExpiresAt = renewExpiresAt.trim()
    const cleanNumber = renewDocumentNumber.trim()

    if (!cleanType) {
      Alert.alert('Tipo documento mancante', 'Inserisci il tipo documento.')
      return
    }

    if (!cleanExpiresAt && document.expiresAt) {
      Alert.alert('Scadenza mancante', 'Inserisci la nuova data di scadenza per togliere la criticita.')
      return
    }

    if (!isValidDateValue(cleanExpiresAt)) {
      Alert.alert('Data non valida', 'Inserisci la data nel formato corretto dal calendario.')
      return
    }

    setIsBusy(true)
    const renewed = await onRenewDocument?.(document, {
      documentNumber: cleanNumber,
      expiresAt: cleanExpiresAt || null,
      file: renewFile,
      type: cleanType,
    })
    setIsBusy(false)

    if (renewed) {
      setRenewModalVisible(false)
      setRenewFile(null)
      Alert.alert('Documento rinnovato', 'Scadenza e file sono stati aggiornati. Se la data e futura, la criticita sparisce.')
    }
  }

  return (
    <View style={[styles.documentRow, highlight && styles.documentRowFocused, tone === 'expired' && styles.documentRowExpired, tone === 'warning' && styles.documentRowWarning]}>
      <View style={[styles.documentIcon, styles[`${tone}Icon`]]}>
        <Text style={styles.documentIconText}>DOC</Text>
      </View>
      <View style={styles.documentCopy}>
        <Text style={styles.documentTitle}>{document.type}</Text>
        <Text style={styles.documentMeta}>{formatDocumentDate(document.expiresAt, language)}</Text>
        <Text style={[styles.documentStatus, styles[`${tone}Text`]]}>
          {getDocumentStatusLabel(document)}
        </Text>
      </View>
      <View style={styles.documentActions}>
        <Pressable disabled={isBusy} onPress={showDocument} style={styles.actionButton}>
          <Text style={styles.actionText}>{t(language, 'documentShow')}</Text>
        </Pressable>
        <Pressable disabled={isBusy} onPress={needsRenewal ? openRenewModal : pickDocument} style={[styles.actionButton, styles.actionButtonDark]}>
          <Text style={styles.actionTextDark}>{needsRenewal ? 'Rinnova' : t(language, 'documentUpload')}</Text>
        </Pressable>
      </View>
      <Modal animationType="slide" onRequestClose={closeRenewModal} transparent visible={renewModalVisible}>
        <View style={styles.renewBackdrop}>
          <View style={styles.renewSheet}>
            <View style={styles.renewHeader}>
              <View style={styles.renewHeaderCopy}>
                <Text style={styles.renewKicker}>Rinnovo</Text>
                <Text numberOfLines={1} style={styles.renewTitle}>{document.type}</Text>
              </View>
              <Pressable disabled={isBusy} onPress={closeRenewModal} style={styles.previewClose}>
                <Text style={styles.previewCloseText}>{t(language, 'close')}</Text>
              </Pressable>
            </View>
            <Text style={styles.renewHelp}>
              Inserisci la nuova scadenza e, se vuoi, sostituisci foto o PDF del documento.
            </Text>
            <TextInput
              onChangeText={setRenewType}
              placeholder="Tipo documento"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              value={renewType}
            />
            <TextInput
              onChangeText={setRenewDocumentNumber}
              placeholder="Numero documento opzionale"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              value={renewDocumentNumber}
            />
            <DateField
              label="Nuova scadenza"
              language={language}
              onChange={setRenewExpiresAt}
              placeholder="Nuova scadenza"
              value={renewExpiresAt}
            />
            <View style={styles.renewFileBox}>
              <View style={styles.renewFileCopy}>
                <Text style={styles.renewFileTitle}>File documento</Text>
                <Text numberOfLines={1} style={styles.renewFileMeta}>
                  {renewFile?.name || (document.filePath ? 'File attuale mantenuto' : 'Nessun file selezionato')}
                </Text>
              </View>
              {renewFile ? (
                <Pressable disabled={isBusy} onPress={() => setRenewFile(null)} style={styles.clearFileButton}>
                  <Text style={styles.clearFileText}>Togli</Text>
                </Pressable>
              ) : null}
            </View>
            <View style={styles.renewActions}>
              <Pressable disabled={isBusy} onPress={takeRenewPhoto} style={styles.renewActionButton}>
                <Text style={styles.renewActionText}>Fotocamera</Text>
              </Pressable>
              <Pressable disabled={isBusy} onPress={pickRenewFile} style={styles.renewActionButton}>
                <Text style={styles.renewActionText}>File/Galleria</Text>
              </Pressable>
            </View>
            <PrimaryButton loading={isBusy} onPress={saveRenewal} title="Salva rinnovo" />
          </View>
        </View>
      </Modal>
      <DocumentPreview language={language} onClose={() => setPreview(null)} preview={preview} />
    </View>
  )
}

export function DocumentsScreen({ focusDocumentId = '', documents = [], language = 'it', onCreateDocument, onRenewDocument, onUploadDocument }) {
  const [documentNumber, setDocumentNumber] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [renewRequestDocumentId, setRenewRequestDocumentId] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const latestDocuments = getLatestDocumentsByType(documents)
  const sortedDocuments = latestDocuments
    .slice()
    .sort((first, second) => getDocumentDaysLeft(first) - getDocumentDaysLeft(second))
  const criticalDocuments = sortedDocuments.filter((document) => ['expired', 'warning'].includes(getDocumentTone(document)))
  const expiredDocuments = criticalDocuments.filter((document) => getDocumentTone(document) === 'expired')

  useEffect(() => {
    if (focusDocumentId) setRenewRequestDocumentId(focusDocumentId)
  }, [focusDocumentId])

  async function createDocument() {
    if (!documentType.trim()) {
      Alert.alert('Nome documento mancante', 'Inserisci il tipo documento, per esempio Patente o CQC.')
      return
    }

    setIsCreating(true)
    const created = await onCreateDocument?.({
      documentNumber: documentNumber.trim(),
      expiresAt: expiresAt.trim() || null,
      type: documentType.trim(),
    })
    setIsCreating(false)

    if (created) {
      setDocumentNumber('')
      setDocumentType('')
      setExpiresAt('')
      Alert.alert(
        created.updatedExisting ? 'Documento aggiornato' : 'Documento creato',
        created.updatedExisting ? 'Ho aggiornato la scadenza del documento esistente.' : 'Ora puoi caricare il file.',
      )
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Panel kicker="Documenti" title="Da mostrare">
        <Text style={styles.helper}>
          Tieni patente, CQC, visita medica e altri documenti sempre pronti sul telefono.
        </Text>
      </Panel>

      {criticalDocuments.length ? (
        <Panel
          kicker="Criticita"
          title={expiredDocuments.length ? `${expiredDocuments.length} documenti scaduti` : `${criticalDocuments.length} in scadenza`}
        >
          {criticalDocuments.slice(0, 4).map((document) => (
            <Pressable key={document.id} onPress={() => setRenewRequestDocumentId(document.id)} style={styles.criticalRow}>
              <View style={[styles.criticalDot, getDocumentTone(document) === 'expired' ? styles.expiredDot : styles.warningDot]} />
              <View style={styles.criticalCopy}>
                <Text style={styles.criticalTitle}>{document.type}</Text>
                <Text style={styles.criticalMeta}>
                  {getDocumentStatusLabel(document)} · {formatDocumentDate(document.expiresAt, language)}
                </Text>
              </View>
              <Text style={styles.criticalOpenText}>Rinnova</Text>
            </Pressable>
          ))}
        </Panel>
      ) : null}

      <Panel kicker="Nuovo" title={t(language, 'newDocument')}>
        <View style={styles.presetGrid}>
          {documentPresets.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => setDocumentType(preset)}
              style={[styles.presetChip, documentType === preset && styles.presetChipActive]}
            >
              <Text style={[styles.presetText, documentType === preset && styles.presetTextActive]}>{preset}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          onChangeText={setDocumentType}
          placeholder="Tipo documento"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={documentType}
        />
        <TextInput
          onChangeText={setDocumentNumber}
          placeholder="Numero documento opzionale"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={documentNumber}
        />
        <DateField
          label="Scadenza opzionale"
          language={language}
          onChange={setExpiresAt}
          placeholder="Scadenza opzionale"
          value={expiresAt}
        />
        <PrimaryButton loading={isCreating} onPress={createDocument} title={t(language, 'createDocument')} />
      </Panel>

      {sortedDocuments.map((document) => (
        <DocumentRow
          autoOpenRenewal={renewRequestDocumentId === document.id}
          document={document}
          highlight={focusDocumentId === document.id || renewRequestDocumentId === document.id}
          key={document.id}
          language={language}
          onAutoOpenHandled={() => setRenewRequestDocumentId('')}
          onRenewDocument={onRenewDocument}
          onUploadDocument={onUploadDocument}
        />
      ))}

      {latestDocuments.length === 0 ? (
        <Text style={styles.emptyText}>Nessun documento visibile al momento.</Text>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    minWidth: 72,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionButtonDark: {
    backgroundColor: colors.ink,
  },
  actionText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
  },
  actionTextDark: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  clearFileButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  clearFileText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '900',
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
  },
  criticalCopy: {
    flex: 1,
  },
  criticalDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  criticalMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  criticalOpenText: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
  },
  criticalRow: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  criticalTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  documentActions: {
    gap: 7,
  },
  documentCopy: {
    flex: 1,
  },
  documentIcon: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 13,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  documentIconText: {
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
  },
  documentMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  documentRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  documentRowFocused: {
    borderColor: colors.cyan,
    borderWidth: 2,
  },
  documentRowExpired: {
    backgroundColor: '#fff7f7',
    borderColor: colors.danger,
  },
  documentRowWarning: {
    backgroundColor: '#fffbeb',
    borderColor: colors.warning,
  },
  documentStatus: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 6,
  },
  documentTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  expiredIcon: {
    backgroundColor: '#fee2e2',
  },
  expiredDot: {
    backgroundColor: colors.danger,
  },
  expiredText: {
    color: colors.danger,
  },
  helper: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    marginBottom: 10,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  previewBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    flex: 1,
    justifyContent: 'center',
    padding: 14,
  },
  previewClose: {
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  previewCloseText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  previewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  previewImage: {
    backgroundColor: '#f8fbff',
    borderRadius: 14,
    height: 520,
    maxHeight: '88%',
    width: '100%',
  },
  previewShell: {
    backgroundColor: colors.white,
    borderRadius: 18,
    maxWidth: 520,
    padding: 12,
    width: '100%',
  },
  previewTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  missingIcon: {
    backgroundColor: '#fef3c7',
  },
  missingText: {
    color: colors.warning,
  },
  presetChip: {
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 11,
  },
  presetChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  presetText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  presetTextActive: {
    color: colors.white,
  },
  readyIcon: {
    backgroundColor: '#dcfce7',
  },
  readyText: {
    color: colors.success,
  },
  renewActionButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  renewActionText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  renewActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  renewBackdrop: {
    backgroundColor: 'rgba(2, 6, 23, 0.62)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  renewFileBox: {
    alignItems: 'center',
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    padding: 12,
  },
  renewFileCopy: {
    flex: 1,
  },
  renewFileMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  renewFileTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  renewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  renewHeaderCopy: {
    flex: 1,
  },
  renewHelp: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 12,
  },
  renewKicker: {
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  renewSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    paddingBottom: 24,
  },
  renewTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  warningIcon: {
    backgroundColor: '#fef3c7',
  },
  warningText: {
    color: colors.warning,
  },
  warningDot: {
    backgroundColor: colors.warning,
  },
})
