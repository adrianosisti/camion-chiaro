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

const newsSections = [
  { id: 'all', icon: 'newspaper-outline', label: 'Tutto' },
  { id: 'rules', icon: 'scale-outline', label: 'Norme' },
  { id: 'restrictions', icon: 'calendar-outline', label: 'Fermi' },
  { id: 'logistics', icon: 'cube-outline', label: 'Logistica' },
  { id: 'roads', icon: 'trail-sign-outline', label: 'Trasporti' },
]

function getNewsSectionId(category = '') {
  const normalized = String(category).toLowerCase()
  if (normalized.includes('norm')) return 'rules'
  if (normalized.includes('viabil') || normalized.includes('scioper')) return 'roads'
  return 'logistics'
}

export function TransportNewsScreen({ language = 'it', onBack }) {
  const [items, setItems] = useState([])
  const [activeSection, setActiveSection] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [status, setStatus] = useState('Caricamento Radar Trasporti...')
  const [isLoading, setIsLoading] = useState(false)
  const [meta, setMeta] = useState(null)
  const isFallbackMode = String(meta?.mode ?? '').includes('fallback') || items.some((item) => item.isFallback)
  const restrictions = meta?.restrictions ?? []
  const retentionDays = meta?.retentionDays ?? 30
  const visibleItems = activeSection === 'all'
    ? items
    : activeSection === 'restrictions'
      ? []
      : items.filter((item) => getNewsSectionId(item.category) === activeSection)
  const sectionCounts = newsSections.reduce((counts, section) => {
    if (section.id === 'all') return { ...counts, all: items.length }
    if (section.id === 'restrictions') return { ...counts, restrictions: restrictions.length }
    return { ...counts, [section.id]: items.filter((item) => getNewsSectionId(item.category) === section.id).length }
  }, {})

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

  if (selectedItem) {
    const tone = getNewsTone(selectedItem.category)

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.detailCard, styles[`${tone}Card`]]}>
          <Pressable onPress={() => setSelectedItem(null)} style={styles.backButton}>
            <Ionicons color={colors.ink} name="arrow-back" size={18} />
            <Text style={styles.backText}>Indietro</Text>
          </Pressable>
          <View style={styles.newsHead}>
            <Text style={styles.category}>{selectedItem.category || 'Logistica'}</Text>
            <Text style={styles.date}>{formatDate(selectedItem.published_at || selectedItem.fetched_at)}</Text>
          </View>
          <Text style={styles.detailTitle}>{selectedItem.title}</Text>
          <Text style={styles.detailSummary}>{selectedItem.summary || 'Apri la fonte ufficiale per leggere il dettaglio completo della notizia.'}</Text>
          <View style={styles.detailMeta}>
            <Text style={styles.source}>{selectedItem.source_name || 'Fonte'}</Text>
            <Text style={styles.statusMeta}>Conservata nel Radar per circa {retentionDays} giorni.</Text>
          </View>
          <Pressable onPress={() => selectedItem.url && Linking.openURL(selectedItem.url)} style={styles.sourceButton}>
            <Text style={styles.sourceButtonText}>Apri fonte originale</Text>
            <Ionicons color={colors.white} name="open-outline" size={16} />
          </Pressable>
        </View>
      </ScrollView>
    )
  }

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
        <Text style={styles.title}>Le notizie che contano</Text>
        <Text style={styles.subtitle}>
          Norme, fermi ministeriali, logistica e viabilita divise per area. Restano consultabili per circa {retentionDays} giorni.
        </Text>
      </View>

      <View style={styles.statusCard}>
        <Ionicons color={colors.cyanDark} name="radio-outline" size={18} />
        <View style={styles.statusCopy}>
          <Text style={styles.statusText}>
            {isFallbackMode ? 'Radar in modalita sicurezza: fonti operative principali disponibili.' : status}
          </Text>
          <Text style={styles.statusMeta}>{meta?.nextAutomaticUpdate ?? 'Aggiornamento automatico ogni giorno intorno alle 10:00 ora italiana.'}</Text>
        </View>
        <Pressable disabled={isLoading} onPress={() => loadNews({ force: true })} style={styles.refreshButton}>
          <Ionicons color={colors.white} name="refresh" size={17} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionTabs}>
        {newsSections.map((section) => (
          <Pressable
            key={section.id}
            onPress={() => {
              setActiveSection(section.id)
              setSelectedItem(null)
            }}
            style={[styles.sectionTab, activeSection === section.id && styles.sectionTabActive]}
          >
            <Ionicons color={activeSection === section.id ? colors.white : colors.cyanDark} name={section.icon} size={15} />
            <Text style={[styles.sectionTabText, activeSection === section.id && styles.sectionTabTextActive]}>{section.label}</Text>
            <Text style={[styles.sectionCount, activeSection === section.id && styles.sectionCountActive]}>{sectionCounts[section.id] ?? 0}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {activeSection === 'restrictions' ? (
        <View style={styles.restrictionsPanel}>
          <Text style={styles.panelKicker}>Fermi ministeriali</Text>
          <Text style={styles.panelTitle}>Blocchi e fonti ufficiali sempre a portata</Text>
          {restrictions.map((restriction) => (
            <Pressable key={`${restriction.year}-${restriction.title}`} onPress={() => restriction.url && Linking.openURL(restriction.url)} style={styles.restrictionRow}>
              <View style={styles.restrictionYear}>
                <Text style={styles.restrictionYearText}>{restriction.year}</Text>
                <Text style={styles.restrictionArea}>{restriction.area}</Text>
              </View>
              <View style={styles.restrictionCopy}>
                <Text style={styles.restrictionTitle}>{restriction.title}</Text>
                <Text style={styles.restrictionStatus}>{restriction.status}</Text>
                <Text style={styles.restrictionSource}>{restriction.sourceName} · {restriction.cadence}</Text>
              </View>
              <Ionicons color={colors.cyanDark} name="open-outline" size={16} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {activeSection !== 'restrictions' && visibleItems.map((item) => {
        const tone = getNewsTone(item.category)

        return (
          <Pressable key={item.id || item.url} onPress={() => setSelectedItem(item)} style={[styles.newsCard, styles[`${tone}Card`]]}>
            <View style={styles.newsHead}>
              <Text style={styles.category}>{item.category || 'Logistica'}</Text>
              <Text style={styles.date}>{formatDate(item.published_at || item.fetched_at)}</Text>
            </View>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.summary}>{item.summary || 'Apri la fonte per leggere il dettaglio completo.'}</Text>
            <View style={styles.sourceRow}>
              <Text style={styles.source}>{item.source_name || 'Fonte'}</Text>
              <View style={styles.sourceAction}>
                <Text style={styles.sourceActionText}>{item.isFallback ? 'Canale' : 'Fonte'}</Text>
                <Ionicons color={colors.cyanDark} name="open-outline" size={15} />
              </View>
            </View>
          </Pressable>
        )
      })}

      {activeSection !== 'restrictions' && !visibleItems.length && !isLoading ? (
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
  detailCard: {
    backgroundColor: colors.white,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderLeftColor: colors.cyanDark,
    borderLeftWidth: 5,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  detailMeta: {
    backgroundColor: colors.cyanSoft,
    borderRadius: 12,
    gap: 3,
    padding: 12,
  },
  detailSummary: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 23,
  },
  detailTitle: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 29,
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
  panelKicker: {
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  restrictionArea: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  restrictionCopy: {
    flex: 1,
    gap: 4,
  },
  restrictionRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: 'rgba(18, 198, 223, 0.22)',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  restrictionsPanel: {
    backgroundColor: '#eafdff',
    borderColor: 'rgba(18, 198, 223, 0.35)',
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  restrictionSource: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  restrictionStatus: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  restrictionTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  restrictionYear: {
    alignItems: 'center',
    backgroundColor: colors.cyanSoft,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 56,
    width: 64,
  },
  restrictionYearText: {
    color: colors.cyanDark,
    fontSize: 14,
    fontWeight: '900',
  },
  sectionCount: {
    backgroundColor: 'rgba(18, 198, 223, 0.14)',
    borderRadius: 999,
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
    minWidth: 22,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 3,
    textAlign: 'center',
  },
  sectionCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    color: colors.white,
  },
  sectionTab: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: 'rgba(18, 198, 223, 0.28)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 10,
  },
  sectionTabActive: {
    backgroundColor: colors.ink,
    borderColor: colors.cyan,
  },
  sectionTabs: {
    gap: 8,
    paddingRight: 8,
  },
  sectionTabText: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
  },
  sectionTabTextActive: {
    color: colors.white,
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
  sourceButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.cyanDark,
    borderRadius: 13,
    flexDirection: 'row',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 14,
  },
  sourceButtonText: {
    color: colors.white,
    fontSize: 13,
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
