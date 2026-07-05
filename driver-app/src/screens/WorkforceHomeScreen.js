import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { MetricPill } from '../components/MetricPill'
import { Panel } from '../components/Panel'
import { PrimaryButton } from '../components/PrimaryButton'
import { colors, layout } from '../theme'

const panelGradient = require('../../assets/brand/panel-gradient.png')

function getDepartmentLabel(value = '') {
  if (value === 'warehouse') return 'Magazzino'
  if (value === 'office') return 'Ufficio'
  if (value === 'drivers') return 'Autisti'
  return 'Reparto'
}

export function WorkforceHomeScreen({
  companyName,
  context,
  onOpenAnnouncements,
  onOpenChat,
  onOpenSettings,
  pendingAnnouncementCount = 0,
  unreadChatMessages = 0,
}) {
  const person = context?.currentPerson
  const groups = context?.teamChatThreads ?? []

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ImageBackground imageStyle={styles.panelGradientImage} resizeMode="cover" source={panelGradient} style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons color={colors.ink} name={person?.department === 'warehouse' ? 'cube-outline' : 'briefcase-outline'} size={28} />
        </View>
        <Text style={styles.heroTitle}>Ciao {person?.name || 'collega'}</Text>
        <Text style={styles.heroMeta}>{companyName} · {getDepartmentLabel(person?.department)} · {person?.jobTitle || 'Operatore'}</Text>
        <View style={styles.metricRow}>
          <MetricPill label="Messaggi" onPress={onOpenChat} tone={unreadChatMessages ? 'warning' : 'info'} value={unreadChatMessages} />
          <MetricPill label="Gruppi" tone="info" value={groups.length} />
          <MetricPill label="Avvisi" onPress={onOpenAnnouncements} tone={pendingAnnouncementCount ? 'warning' : 'success'} value={pendingAnnouncementCount} />
        </View>
      </ImageBackground>

      <Panel kicker="Presa visione" title={pendingAnnouncementCount ? 'Comunicazioni da confermare' : 'Tutto confermato'}>
        <Text style={styles.bodyText}>
          {pendingAnnouncementCount
            ? `${pendingAnnouncementCount} comunicazioni aziendali aspettano conferma.`
            : 'Non ci sono comunicazioni aziendali in attesa.'}
        </Text>
        <PrimaryButton onPress={onOpenAnnouncements} title="Apri comunicazioni" />
      </Panel>

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
    overflow: 'hidden',
    padding: 18,
  },
  panelGradientImage: {
    borderRadius: 22,
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
