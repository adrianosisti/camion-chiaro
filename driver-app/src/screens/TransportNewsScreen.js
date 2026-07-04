import { useEffect, useState } from 'react'
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { fetchTransportNews } from '../services/driverApi'
import { colors, layout } from '../theme'

function formatDate(value = '') {
  if (!value) return 'Oggi'

  try {
    return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(value))
  } catch {
    return 'Oggi'
  }
}

function getNewsTone(category = '') {
  const normalized = String(category).toLowerCase()
  if (normalized.includes('norm')) return 'rules'
  if (normalized.includes('viabil')) return 'roads'
  if (normalized.includes('scioper')) return 'strike'
  if (normalized.includes('cost')) return 'costs'
  return 'market'
}

export function TransportNewsScreen({ language = 'it', onBack }) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('Caricamento Radar Trasporti...')
  const [isLoading, setIsLoading] = useState(false)
  const [meta, setMeta] = useState(null)

  async function loadNews({ force = false } = {}) {
    setIsLoading(true)
    setStatus(force ? 'Aggiornamento in corso...' : 'Caricamento Radar Trasporti...')

    const result = await fetchTransportNews({ language: 'it', refresh: force })
    setIsLoading(false)

    if (result.error) {
      setStatus(result.error.message)
      return
    }

    const nextItems = result.data?.items ?? []
    setItems(nextItems)
    setMeta(result.data ?? null)
    setStatus(nextItems.length ? `${nextItems.length} notizie operative caricate.` : 'Nessuna notizia operativa disponibile ora.')
  }

  useEffect(() => {
    void loadNews()
  }, [])

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} tintColor={colors.cyan} onRefresh={() => loadNews({ force: true })} />}
    >
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons color={colors.ink} name="arrow-back" size={18} />
          <Text style={styles.backText}>Menu</Text>
        </Pressable>
        <View style={styles.icon}>
          <Ionicons color={colors.white} name="newspaper-outline" size={24} />
        </View>
        <Text style={styles.kicker}>Radar Trasporti</Text>
        <Text style={styles.title}>Le notizie che contano oggi</Text>
        <Text style={styles.subtitle}>
          Aggiornamento operativo quotidiano: norme, viabilita, scioperi, costi e logistica. Apri sempre la fonte per il dettaglio completo.
        </Text>
      </View>

      <View style={styles.statusCard}>
        <Ionicons color={colors.cyanDark} name="radio-outline" size={18} />
        <View style={styles.statusCopy}>
          <Text style={styles.statusText}>{status}</Text>
          <Text style={styles.statusMeta}>{meta?.nextAutomaticUpdate ?? 'Aggiornamento automatico ogni giorno intorno alle 10:00 ora italiana.'}</Text>
        </View>
        <Pressable disabled={isLoading} onPress={() => loadNews({ force: true })} style={styles.refreshButton}>
          <Ionicons color={colors.white} name="refresh" size={17} />
        </Pressable>
      </View>

      {items.map((item) => {
        const tone = getNewsTone(item.category)

        return (
          <Pressable key={item.id || item.url} onPress={() => item.url && Linking.openURL(item.url)} style={[styles.newsCard, styles[`${tone}Card`]]}>
            <View style={styles.newsHead}>
              <Text style={styles.category}>{item.category || 'Logistica'}</Text>
              <Text style={styles.date}>{formatDate(item.published_at || item.fetched_at)}</Text>
            </View>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.summary}>{item.summary || 'Apri la fonte per leggere il dettaglio completo.'}</Text>
            <View style={styles.sourceRow}>
              <Text style={styles.source}>{item.source_name || 'Fonte'}</Text>
              <View style={styles.sourceAction}>
                <Text style={styles.sourceActionText}>Fonte</Text>
                <Ionicons color={colors.cyanDark} name="open-outline" size={15} />
              </View>
            </View>
          </Pressable>
        )
      })}

      {!items.length && !isLoading ? (
        <View style={styles.emptyCard}>
          <Ionicons color={colors.cyanDark} name="newspaper-outline" size={28} />
          <Text style={styles.emptyTitle}>Radar vuoto</Text>
          <Text style={styles.emptyText}>Tira giu per aggiornare oppure riprova piu tardi. Se resta vuoto, controlliamo fonti e cache Supabase.</Text>
        </View>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
  },
  backText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  category: {
    backgroundColor: 'rgba(18, 198, 223, 0.14)',
    borderRadius: 999,
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5,
    textTransform: 'uppercase',
  },
  content: {
    backgroundColor: colors.cyanSoft,
    gap: 12,
    padding: layout.screenPadding,
    paddingBottom: 34,
  },
  costsCard: {
    borderLeftColor: '#0f766e',
  },
  date: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderColor: 'rgba(18, 198, 223, 0.34)',
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  header: {
    backgroundColor: colors.ink,
    borderRadius: 18,
    gap: 8,
    overflow: 'hidden',
    padding: 16,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  kicker: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  marketCard: {
    borderLeftColor: colors.cyanDark,
  },
  newsCard: {
    backgroundColor: colors.white,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderLeftColor: colors.cyanDark,
    borderLeftWidth: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  newsHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  newsTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
  },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: colors.cyanDark,
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  roadsCard: {
    borderLeftColor: '#f97316',
  },
  rulesCard: {
    borderLeftColor: '#7c3aed',
  },
  source: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
  },
  sourceAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  sourceActionText: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
  },
  sourceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: 'rgba(18, 198, 223, 0.34)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  statusCopy: {
    flex: 1,
    gap: 2,
  },
  statusMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  statusText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  strikeCard: {
    borderLeftColor: '#e11d48',
  },
  subtitle: {
    color: 'rgba(248, 250, 252, 0.84)',
    fontSize: 13,
    lineHeight: 19,
  },
  summary: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
})
