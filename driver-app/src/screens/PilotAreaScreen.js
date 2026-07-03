import { useMemo, useState } from 'react'
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, layout } from '../theme'

const panelGradient = require('../../assets/brand/panel-gradient.png')

const feedbackCategories = [
  { id: 'problem', label: 'Problema' },
  { id: 'idea', label: 'Idea' },
  { id: 'question', label: 'Domanda' },
  { id: 'training', label: 'Formazione' },
  { id: 'praise', label: 'Funziona bene' },
]

const feedbackAreas = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'chat', label: 'Chat' },
  { id: 'records', label: 'Anagrafiche' },
  { id: 'documents', label: 'Documenti' },
  { id: 'operations', label: 'Check e guasti' },
  { id: 'reports', label: 'Report' },
  { id: 'mobile', label: 'App' },
  { id: 'other', label: 'Altro' },
]

function isArchivedStatus(status) {
  return ['archived', 'Archiviato', 'closed'].includes(status)
}

function hasCheckIssues(check) {
  return check?.lightsOk === false || check?.tiresOk === false || check?.documentsOnBoard === false
}

function isFaultOpen(fault) {
  return !['closed', 'archived', 'done', 'resolved'].includes(fault?.status)
}

function isDeadlineOpen(item) {
  return !['closed', 'archived', 'done', 'resolved'].includes(item?.status)
}

function formatShortDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(date)
}

function buildChecklist(context = {}) {
  const activeDrivers = (context.drivers ?? []).filter((driver) => !isArchivedStatus(driver.status))
  const activePeople = (context.people ?? []).filter((person) => !isArchivedStatus(person.status))
  const activeVehicles = (context.vehicles ?? []).filter((vehicle) => !isArchivedStatus(vehicle.status))
  const documents = context.documents ?? []
  const deadlines = context.complianceItems ?? []
  const checks = context.vehicleChecks ?? []
  const faults = context.faultReports ?? []
  const messages = context.teamChatMessages ?? []
  const costs = context.costEntries ?? []

  const items = [
    {
      detail: context.companyProfile?.name || 'Completa nome e dati azienda.',
      done: Boolean(context.companyProfile?.name),
      id: 'profile',
      title: 'Azienda configurata',
    },
    {
      detail: activeDrivers.length + activePeople.length ? `${activeDrivers.length + activePeople.length} persone attive` : 'Crea almeno una persona.',
      done: activeDrivers.length + activePeople.length > 0,
      id: 'people',
      title: 'Persone create',
    },
    {
      detail: activeVehicles.length ? `${activeVehicles.length} mezzi in flotta` : 'Inserisci almeno un mezzo.',
      done: activeVehicles.length > 0,
      id: 'fleet',
      title: 'Flotta inserita',
    },
    {
      detail: documents.length + deadlines.length ? `${documents.length + deadlines.length} documenti o scadenze` : 'Carica documenti e scadenze.',
      done: documents.length + deadlines.length > 0,
      id: 'documents',
      title: 'Documenti e scadenze',
    },
    {
      detail: checks.length ? `${checks.length} check ricevuti` : 'Fai provare un check mattutino.',
      done: checks.length > 0,
      id: 'checks',
      title: 'Check provato',
    },
    {
      detail: faults.length ? `${faults.length} segnalazioni presenti` : 'Fai provare una segnalazione guasto.',
      done: faults.length > 0,
      id: 'faults',
      title: 'Guasti provati',
    },
    {
      detail: messages.length ? `${messages.length} messaggi aziendali` : 'Scambia un messaggio in chat.',
      done: messages.length > 0,
      id: 'chat',
      title: 'Chat usata',
    },
    {
      detail: costs.length ? `${costs.length} costi registrati` : 'Registra una spesa o sanzione.',
      done: costs.length > 0,
      id: 'costs',
      title: 'Centro costi provato',
    },
  ]

  return {
    doneCount: items.filter((item) => item.done).length,
    items,
    openWorkCount:
      deadlines.filter(isDeadlineOpen).length
      + checks.filter(hasCheckIssues).length
      + faults.filter(isFaultOpen).length,
    totalCount: items.length,
  }
}

export function PilotAreaScreen({ context, isSubmitting = false, onCreateFeedback, statusMessage = '' }) {
  const [category, setCategory] = useState('problem')
  const [screen, setScreen] = useState('dashboard')
  const [message, setMessage] = useState('')
  const checklist = useMemo(() => buildChecklist(context), [context])
  const feedbackRows = useMemo(
    () => [...(context?.pilotFeedback ?? [])].sort((first, second) => new Date(first.createdAt || 0) - new Date(second.createdAt || 0)).slice(-18),
    [context?.pilotFeedback],
  )

  async function handleSend() {
    if (!message.trim() || isSubmitting) return
    const result = await onCreateFeedback?.({ category, message, screen })
    if (!result?.error) setMessage('')
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ImageBackground imageStyle={styles.heroImage} resizeMode="cover" source={panelGradient} style={styles.hero}>
        <View>
          <Text style={styles.overline}>Area test</Text>
          <Text style={styles.title}>Prova reale Vygo</Text>
          <Text style={styles.subtitle}>
            Scrivi a Vygo durante il test, tieni traccia dei passaggi pronti e segnala subito cosa non e chiaro.
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>{checklist.doneCount}/{checklist.totalCount}</Text>
          <Text style={styles.scoreLabel}>pronti</Text>
        </View>
      </ImageBackground>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelKicker}>Avviamento</Text>
          <Text style={styles.panelTitle}>Passaggi prova reale</Text>
        </View>
        {checklist.items.map((item) => (
          <View key={item.id} style={[styles.checkRow, item.done ? styles.checkDone : styles.checkMissing]}>
            <Ionicons color={item.done ? '#10b981' : '#f97316'} name={item.done ? 'checkmark-circle' : 'time-outline'} size={20} />
            <View style={styles.checkCopy}>
              <Text style={styles.checkTitle}>{item.title}</Text>
              <Text style={styles.checkDetail}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelKicker}>Conversazione</Text>
          <Text style={styles.panelTitle}>Vygo e azienda</Text>
        </View>
        {feedbackRows.length ? (
          feedbackRows.map((entry) => {
            const isVygo = entry.actorRole === 'admin'

            return (
              <View key={entry.id} style={[styles.messageBubble, isVygo ? styles.vygoBubble : styles.companyBubble]}>
                <Text style={styles.messageSender}>{isVygo ? 'Vygo' : context?.companyProfile?.name || 'Azienda'}</Text>
                <Text style={styles.messageBody}>{entry.message}</Text>
                <Text style={styles.messageTime}>{formatShortDateTime(entry.createdAt)}</Text>
              </View>
            )
          })
        ) : (
          <Text style={styles.emptyText}>Nessun messaggio ancora. Usa questa area per scrivere problemi, idee e dubbi durante il test.</Text>
        )}
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelKicker}>Feedback</Text>
          <Text style={styles.panelTitle}>Scrivi a Vygo</Text>
        </View>
        <View style={styles.chipGrid}>
          {feedbackCategories.map((item) => (
            <Pressable key={item.id} onPress={() => setCategory(item.id)} style={[styles.chip, category === item.id && styles.chipActive]}>
              <Text style={[styles.chipText, category === item.id && styles.chipTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.chipGrid}>
          {feedbackAreas.map((item) => (
            <Pressable key={item.id} onPress={() => setScreen(item.id)} style={[styles.chip, screen === item.id && styles.chipActive]}>
              <Text style={[styles.chipText, screen === item.id && styles.chipTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          multiline
          onChangeText={setMessage}
          placeholder="Scrivi cosa non va, cosa manca o cosa vuoi migliorare..."
          placeholderTextColor="#64748b"
          style={styles.input}
          value={message}
        />
        <Pressable disabled={!message.trim() || isSubmitting} onPress={handleSend} style={[styles.sendButton, (!message.trim() || isSubmitting) && styles.sendButtonDisabled]}>
          <Ionicons color={colors.ink} name="send" size={18} />
          <Text style={styles.sendText}>{isSubmitting ? 'Invio...' : 'Invia feedback'}</Text>
        </Pressable>
        {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  checkCopy: {
    flex: 1,
  },
  checkDetail: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 2,
  },
  checkDone: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  checkMissing: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  checkRow: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  checkTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  chip: {
    backgroundColor: '#ffffff',
    borderColor: '#bae6fd',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  chipTextActive: {
    color: colors.ink,
  },
  companyBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#ffffff',
    borderColor: '#bae6fd',
  },
  content: {
    backgroundColor: colors.cyan,
    gap: 14,
    padding: layout.screenPadding,
    paddingBottom: 40,
  },
  emptyText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  hero: {
    borderRadius: 22,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: 18,
  },
  heroImage: {
    borderRadius: 22,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#bae6fd',
    borderRadius: 16,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    minHeight: 112,
    padding: 14,
    textAlignVertical: 'top',
  },
  messageBody: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 4,
  },
  messageBubble: {
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: '88%',
    padding: 12,
  },
  messageSender: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '900',
  },
  messageTime: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 7,
    textAlign: 'right',
  },
  overline: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#bae6fd',
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  panelHeader: {
    gap: 2,
  },
  panelKicker: {
    color: '#0891b2',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 78,
    padding: 10,
  },
  scoreLabel: {
    color: '#dff7fb',
    fontSize: 11,
    fontWeight: '900',
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '900',
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  statusText: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '800',
  },
  subtitle: {
    color: '#dff7fb',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 230,
  },
  title: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 3,
  },
  vygoBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecfeff',
    borderColor: '#99f6e4',
  },
})
