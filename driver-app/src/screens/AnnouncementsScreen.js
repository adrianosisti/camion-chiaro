import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Panel } from '../components/Panel'
import { PrimaryButton } from '../components/PrimaryButton'
import { colors, layout } from '../theme'

function formatDateTime(value) {
  if (!value) return 'Data non disponibile'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data non disponibile'

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function getAudienceLabel(value = 'all') {
  if (value === 'drivers') return 'Autisti'
  if (value === 'office') return 'Ufficio'
  if (value === 'warehouse') return 'Magazzino'
  if (value === 'management') return 'Direzione'
  return 'Tutta l azienda'
}

function isAnnouncementDone(announcement = {}) {
  return announcement.requiresAck ? Boolean(announcement.acknowledgedAt) : Boolean(announcement.readAt)
}

export function AnnouncementsScreen({
  announcements = [],
  isSaving = false,
  onAcknowledge,
  onRefresh,
}) {
  const openAnnouncements = announcements.filter((announcement) => !isAnnouncementDone(announcement))
  const completedAnnouncements = announcements.filter(isAnnouncementDone)

  async function handleAcknowledge(announcement) {
    const saved = await onAcknowledge?.(announcement, announcement.requiresAck)
    if (saved) {
      Alert.alert(
        announcement.requiresAck ? 'Presa visione confermata' : 'Comunicazione segnata come letta',
        'La conferma e stata registrata.',
      )
    }
  }

  const renderAnnouncement = (announcement) => {
    const done = isAnnouncementDone(announcement)

    return (
      <View key={announcement.id} style={[styles.card, done && styles.cardDone]}>
        <View style={styles.cardHead}>
          <View style={styles.cardIcon}>
            <Ionicons color={done ? colors.success : colors.cyanDark} name={done ? 'checkmark-done-outline' : 'megaphone-outline'} size={22} />
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle}>{announcement.title}</Text>
            <Text style={styles.cardMeta}>
              {getAudienceLabel(announcement.audienceType)} · {formatDateTime(announcement.publishedAt || announcement.createdAt)}
            </Text>
          </View>
        </View>
        <Text style={styles.cardBody}>{announcement.body}</Text>
        <View style={styles.statusRow}>
          <Text style={[styles.statusPill, done ? styles.statusPillDone : styles.statusPillOpen]}>
            {done ? (announcement.requiresAck ? 'Confermata' : 'Letta') : (announcement.requiresAck ? 'Da confermare' : 'Da leggere')}
          </Text>
          {announcement.acknowledgedAt ? <Text style={styles.statusDate}>{formatDateTime(announcement.acknowledgedAt)}</Text> : null}
        </View>
        {!done ? (
          <PrimaryButton
            disabled={isSaving}
            onPress={() => handleAcknowledge(announcement)}
            title={announcement.requiresAck ? 'Confermo presa visione' : 'Segna come letta'}
          />
        ) : null}
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons color={colors.ink} name="megaphone-outline" size={26} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Comunicazioni aziendali</Text>
          <Text style={styles.heroText}>Avvisi, circolari e messaggi importanti inviati dall azienda.</Text>
        </View>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{openAnnouncements.length}</Text>
          <Text style={styles.metricLabel}>Da leggere</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{completedAnnouncements.length}</Text>
          <Text style={styles.metricLabel}>Confermate</Text>
        </View>
      </View>

      <Panel
        kicker="Da gestire"
        right={
          <Pressable onPress={onRefresh} style={styles.refreshButton}>
            <Ionicons color={colors.ink} name="refresh-outline" size={18} />
          </Pressable>
        }
        title={openAnnouncements.length ? 'Richiedono attenzione' : 'Tutto confermato'}
      >
        {openAnnouncements.length ? openAnnouncements.map(renderAnnouncement) : (
          <Text style={styles.emptyText}>Non ci sono comunicazioni in attesa.</Text>
        )}
      </Panel>

      <Panel kicker="Storico" title="Gia viste">
        {completedAnnouncements.length ? completedAnnouncements.slice(0, 20).map(renderAnnouncement) : (
          <Text style={styles.emptyText}>Nessuna comunicazione confermata.</Text>
        )}
      </Panel>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  cardBody: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  cardDone: {
    backgroundColor: '#f8fafc',
  },
  cardHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  cardIcon: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  cardTitleWrap: {
    flex: 1,
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
    padding: 16,
  },
  heroCopy: {
    flex: 1,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  heroText: {
    color: '#cffafe',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: 4,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 21,
    fontWeight: '900',
  },
  metricCard: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  metricValue: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '900',
  },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  statusDate: {
    color: colors.muted,
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },
  statusPill: {
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillDone: {
    backgroundColor: '#dcfce7',
    color: colors.success,
  },
  statusPillOpen: {
    backgroundColor: '#fef3c7',
    color: colors.warning,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
})
