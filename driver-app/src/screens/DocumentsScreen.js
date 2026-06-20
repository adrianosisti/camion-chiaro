import { useState } from 'react'
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { Panel } from '../components/Panel'
import { PrimaryButton } from '../components/PrimaryButton'
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

function formatDocumentDate(value) {
  if (!value) return 'Scadenza non indicata'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

function getDocumentTone(document) {
  if (!document.filePath) return 'missing'
  if (!document.expiresAt) return 'ready'

  const daysLeft = Math.ceil((new Date(document.expiresAt) - new Date()) / 86400000)
  if (daysLeft < 0) return 'expired'
  if (daysLeft <= 30) return 'warning'
  return 'ready'
}

function DocumentRow({ document, onUploadDocument }) {
  const [isBusy, setIsBusy] = useState(false)
  const tone = getDocumentTone(document)

  async function showDocument() {
    if (!document.filePath) {
      Alert.alert('File mancante', 'Carica prima il documento.')
      return
    }

    const result = await createDriverDocumentSignedUrl(document.filePath)
    const signedUrl = result.data?.signedUrl

    if (!signedUrl) {
      Alert.alert('Documento non disponibile', result.error?.message ?? 'Riprova tra qualche secondo.')
      return
    }

    await Linking.openURL(signedUrl)
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

  return (
    <View style={styles.documentRow}>
      <View style={[styles.documentIcon, styles[`${tone}Icon`]]}>
        <Text style={styles.documentIconText}>DOC</Text>
      </View>
      <View style={styles.documentCopy}>
        <Text style={styles.documentTitle}>{document.type}</Text>
        <Text style={styles.documentMeta}>{formatDocumentDate(document.expiresAt)}</Text>
        <Text style={[styles.documentStatus, styles[`${tone}Text`]]}>
          {document.filePath ? 'File disponibile' : 'File da caricare'}
        </Text>
      </View>
      <View style={styles.documentActions}>
        <Pressable onPress={showDocument} style={styles.actionButton}>
          <Text style={styles.actionText}>Mostra</Text>
        </Pressable>
        <Pressable disabled={isBusy} onPress={pickDocument} style={[styles.actionButton, styles.actionButtonDark]}>
          <Text style={styles.actionTextDark}>{document.filePath ? 'Cambia' : 'Carica'}</Text>
        </Pressable>
      </View>
    </View>
  )
}

export function DocumentsScreen({ documents = [], onCreateDocument, onUploadDocument }) {
  const [documentNumber, setDocumentNumber] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isCreating, setIsCreating] = useState(false)

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
      Alert.alert('Documento creato', 'Ora puoi caricare il file.')
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Panel kicker="Documenti" title="Da mostrare">
        <Text style={styles.helper}>
          Tieni patente, CQC, visita medica e altri documenti sempre pronti sul telefono.
        </Text>
      </Panel>

      <Panel kicker="Nuovo" title="Aggiungi documento">
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
        <TextInput
          onChangeText={setExpiresAt}
          placeholder="Scadenza opzionale YYYY-MM-DD"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={expiresAt}
        />
        <PrimaryButton loading={isCreating} onPress={createDocument} title="Crea documento" />
      </Panel>

      {documents.map((document) => (
        <DocumentRow document={document} key={document.id} onUploadDocument={onUploadDocument} />
      ))}

      {documents.length === 0 ? (
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
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
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
  warningIcon: {
    backgroundColor: '#fef3c7',
  },
  warningText: {
    color: colors.warning,
  },
})
