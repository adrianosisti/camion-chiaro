import { useEffect, useRef, useState } from 'react'
import { Alert, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme'

const supportEmail = 'assistenza@camionchiaro.it'

const assistantTopics = [
  {
    answer: 'Apri Scadenze, scegli il documento o il mezzo, poi usa rinnova o sollecita. Se carichi il nuovo file e la nuova data, la criticita viene chiusa e resta lo storico.',
    id: 'deadlines',
    label: 'Scadenze',
    keywords: ['scadenza', 'scadenze', 'patente', 'visita', 'assicurazione', 'revisione', 'documento'],
  },
  {
    answer: 'Per un guasto apri Registro o Guasti, entra nel dettaglio, aggiungi eventuale costo riparazione e poi archivia quando e risolto. Lo ritrovi nello storico costi e nei report per targa o periodo.',
    id: 'faults',
    label: 'Guasti',
    keywords: ['guasto', 'riparazione', 'costo', 'officina', 'danno'],
  },
  {
    answer: 'In Documenti puoi caricare foto o PDF. Gli autisti vedono i documenti personali da mostrare su strada; l azienda puo rinnovarli e tenerli ordinati.',
    id: 'documents',
    label: 'Documenti',
    keywords: ['file', 'pdf', 'foto', 'documenti', 'caricare', 'carico'],
  },
  {
    answer: 'In Chat trovi conversazioni singole e gruppi. I messaggi non letti accendono il badge, le reaction restano agganciate al fumetto e le foto si aprono a schermo intero.',
    id: 'chat',
    label: 'Chat',
    keywords: ['chat', 'messaggio', 'messaggi', 'gruppo', 'notifica', 'notifiche'],
  },
  {
    answer: 'Il Centro costi raccoglie importi di guasti, riparazioni, manutenzioni e sanzioni. Dal web azienda apri Report per stampare o scaricare CSV filtrati per periodo, targa, autista o attrezzatura.',
    id: 'costs',
    label: 'Costi',
    keywords: ['costi', 'spese', 'report', 'csv', 'excel', 'mese', 'anno'],
  },
  {
    answer: 'Per una sanzione apri Nuova sanzione o Centro costi, scegli categoria Sanzione, inserisci importo, data, autista responsabile e targa collegata. Se in classifica appare Non assegnate, usa Assegna e collega l autista.',
    id: 'fines',
    label: 'Sanzioni',
    keywords: ['multa', 'multe', 'sanzione', 'sanzioni', 'non assegnate', 'assegna'],
  },
  {
    answer: 'Le notifiche si attivano da Menu o Impostazioni del telefono. Se non arrivano, verifica permessi iOS/Android, telefono registrato e ruolo corretto. Per testare, chiudi l app e fatti mandare un messaggio.',
    id: 'mobile',
    label: 'App/notifiche',
    keywords: ['app', 'telefono', 'notifica', 'notifiche', 'push', 'iphone', 'android', 'permessi'],
  },
  {
    answer: 'Per ufficio e magazzino l azienda crea persone da Anagrafiche. Ogni persona puo avere chat, gruppi, documenti, scadenze e, per magazzino, controlli su muletti o strumenti.',
    id: 'workforce',
    label: 'Reparti',
    keywords: ['ufficio', 'magazzino', 'magazziniere', 'persona', 'reparto', 'dipendente'],
  },
  {
    answer: 'Le funzioni premium piu forti sono report mensile automatico, indice salute flotta, budget per targa, classifica multe, alert guasti ricorrenti, osservatorio trasporti e profilo formazione autista.',
    id: 'future',
    label: 'Idee premium',
    keywords: ['idea', 'idee', 'premium', 'futuro', 'valore', 'report mensile', 'salute flotta'],
  },
  {
    answer: 'Da Menu puoi cambiare lingua, attivare notifiche telefono, controllare suoni chat e uscire dall account.',
    id: 'settings',
    label: 'Menu app',
    keywords: ['menu', 'lingua', 'impostazioni', 'uscire', 'notifiche telefono'],
  },
]

function createInitialMessages(accountType) {
  return [
    {
      id: 'welcome',
      role: 'assistant',
      text: accountType === 'company'
        ? 'Ciao, sono l assistente Camion Chiaro. Dimmi cosa devi fare nel pannello azienda e ti guido passo passo.'
        : 'Ciao, sono l assistente Camion Chiaro. Dimmi cosa non trovi nell app e ti aiuto subito.',
    },
  ]
}

function getAssistantReply(message = '', accountType = 'company') {
  const normalized = message.toLowerCase()
  const topic = assistantTopics.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)))

  if (topic) return topic.answer

  if (accountType !== 'company' && (normalized.includes('check') || normalized.includes('mezzo'))) {
    return 'Vai in Home, scegli il mezzo del turno, poi entra in Check. Se segnali un guasto o un check critico, l azienda lo vede nel Registro operativo.'
  }

  return 'Ti posso guidare su scadenze, guasti, documenti, chat, costi e notifiche. Scrivimi cosa vuoi fare oppure tocca uno dei pulsanti rapidi qui sotto.'
}

export function AssistantModal({
  accountType = 'company',
  actorName = '',
  companyName = 'Azienda',
  onClose,
  visible = false,
}) {
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState(() => createInitialMessages(accountType))
  const listRef = useRef(null)

  useEffect(() => {
    if (!visible) return
    setMessages(createInitialMessages(accountType))
    setInputValue('')
  }, [accountType, visible])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd?.({ animated: true })
    }, 80)

    return () => clearTimeout(timer)
  }, [messages.length, visible])

  function sendMessage(rawMessage) {
    const cleanMessage = String(rawMessage ?? '').trim()
    if (!cleanMessage) return

    const stamp = `${Date.now()}-${cleanMessage.length}`
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: `user-${stamp}`, role: 'user', text: cleanMessage },
      { id: `assistant-${stamp}`, role: 'assistant', text: getAssistantReply(cleanMessage, accountType) },
    ])
    setInputValue('')
  }

  async function openTicket() {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.text ?? 'Non indicata'
    const subject = encodeURIComponent(`Ticket Camion Chiaro - ${companyName}`)
    const body = encodeURIComponent([
      `Azienda: ${companyName}`,
      `Utente: ${actorName || 'Non indicato'}`,
      `Ruolo: ${accountType === 'company' ? 'azienda' : 'personale'}`,
      `Ultima domanda: ${lastUserMessage}`,
      '',
      'Descrivi qui il problema:',
      '',
      'Dispositivo: iPhone / Android',
      'Priorita: bassa / media / urgente',
    ].join('\n'))
    const url = `mailto:${supportEmail}?subject=${subject}&body=${body}`
    const canOpen = await Linking.canOpenURL(url)

    if (!canOpen) {
      Alert.alert('Email non disponibile', `Scrivi a ${supportEmail} indicando azienda, utente e problema.`)
      return
    }

    await Linking.openURL(url)
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons color={colors.ink} name="sparkles-outline" size={21} />
          </View>
          <View style={styles.headerCopy}>
            <Text numberOfLines={1} style={styles.title}>Assistente Camion Chiaro</Text>
            <Text numberOfLines={1} style={styles.subtitle}>{companyName}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons color={colors.ink} name="close" size={22} />
          </Pressable>
        </View>

        <ScrollView ref={listRef} contentContainerStyle={styles.messages}>
          {messages.map((message) => (
            <View key={message.id} style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              <Text style={[styles.bubbleText, message.role === 'user' && styles.userBubbleText]}>{message.text}</Text>
            </View>
          ))}

          <View style={styles.quickBox}>
            <Text style={styles.quickTitle}>Cosa vuoi fare?</Text>
            <View style={styles.quickGrid}>
              {assistantTopics.map((topic) => (
                <Pressable key={topic.id} onPress={() => sendMessage(topic.label)} style={styles.quickButton}>
                  <Text style={styles.quickButtonText}>{topic.label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={openTicket} style={styles.ticketButton}>
              <Ionicons color={colors.white} name="mail-outline" size={17} />
              <Text style={styles.ticketButtonText}>Non mi ha aiutato: apri ticket</Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TextInput
            multiline
            onChangeText={setInputValue}
            placeholder="Scrivi cosa vuoi fare..."
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={inputValue}
          />
          <Pressable onPress={() => sendMessage(inputValue)} style={[styles.sendButton, !inputValue.trim() && styles.sendButtonDisabled]}>
            <Ionicons color={colors.white} name="send" size={18} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 15,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  bubble: {
    borderRadius: 18,
    maxWidth: '88%',
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  bubbleText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  footer: {
    alignItems: 'flex-end',
    backgroundColor: colors.white,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#020617',
    flexDirection: 'row',
    gap: 11,
    paddingBottom: 12,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 54 : 26,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  input: {
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    maxHeight: 96,
    minHeight: 44,
    paddingHorizontal: 13,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  messages: {
    gap: 10,
    padding: 14,
    paddingBottom: 18,
  },
  quickBox: {
    backgroundColor: '#e0faff',
    borderColor: '#a5f3fc',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    marginTop: 4,
    padding: 12,
  },
  quickButton: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  quickButtonText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTitle: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  subtitle: {
    color: '#bae6fd',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  ticketButton: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  ticketButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  title: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.ink,
  },
  userBubbleText: {
    color: colors.white,
  },
})
