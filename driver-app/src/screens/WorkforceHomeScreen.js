import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { MetricPill } from '../components/MetricPill'
import { Panel } from '../components/Panel'
import { PrimaryButton } from '../components/PrimaryButton'
import { colors, layout } from '../theme'

function getDepartmentLabel(value = '') {
  if (value === 'warehouse') return 'Magazzino'
  if (value === 'office') return 'Ufficio'
  if (value === 'drivers') return 'Autisti'
  return 'Reparto'
}

function getDeadlineDays(value) {
  if (!value) return 9999
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(value) - today) / 86400000)
}

export function WorkforceHomeScreen({
  companyName,
  context,
  onOpenChat,
  onOpenSettings,
  unreadChatMessages = 0,
}) {
  const person = context?.currentPerson
  const deadlines = (context?.complianceItems ?? []).filter((item) => item.dueDate)
  const criticalDeadlines = deadlines.filter((item) => getDeadlineDays(item.dueDate) <= 30)
  const groups = context?.teamChatThreads ?? []

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons color={colors.ink} name={person?.department === 'warehouse' ? 'cube-outline' : 'briefcase-outline'} size={28} />
        </View>
        <Text style={styles.heroTitle}>Ciao {person?.name || 'collega'}</Text>
        <Text style={styles.heroMeta}>{companyName} · {getDepartmentLabel(person?.department)} · {person?.jobTitle || 'Operatore'}</Text>
        <View style={styles.metricRow}>
          <MetricPill label="Messaggi" onPress={onOpenChat} tone={unreadChatMessages ? 'warning' : 'info'} value={unreadChatMessages} />
          <MetricPill label="Gruppi" tone="info" value={groups.length} />
          <MetricPill label="Scadenze" tone={criticalDeadlines.length ? 'warning' : 'success'} value={criticalDeadlines.length} />
        </View>
      </View>

      <Panel kicker="Chat" title="Azienda, reparti e persone">
        <Text style={styles.bodyText}>
          {unreadChatMessages
            ? `${unreadChatMessages} messaggi aspettano lettura.`
            : 'Scrivi all azienda, al tuo reparto o a una persona specifica della squadra.'}
        </Text>
        <PrimaryButton onPress={onOpenChat} title="Apri chat" />
      </Panel>

      <Panel kicker="Profilo" title="Impostazioni e notifiche">
        <Text style={styles.bodyText}>
          Da qui puoi attivare le notifiche, cambiare lingua e uscire dall account.
        </Text>
        <PrimaryButton tone="light" onPress={onOpenSettings} title="Impostazioni" />
      </Panel>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  bodyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 12,
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
  },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: 22,
    marginBottom: 14,
    padding: 18,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    marginBottom: 14,
    width: 54,
  },
  heroMeta: {
    color: '#cffafe',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 5,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
})
