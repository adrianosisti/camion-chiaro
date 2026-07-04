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

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getMinutesFromTime(value = '') {
  const [hours = '0', minutes = '0'] = String(value).split(':')
  return Number(hours) * 60 + Number(minutes)
}

function getRestrictionInsight(schedule = [], now = new Date()) {
  if (!Array.isArray(schedule) || !schedule.length) return null

  const todayKey = getLocalDateKey(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const orderedSchedule = [...schedule].sort((first, second) => String(first.date).localeCompare(String(second.date)))
  const todayRestriction = orderedSchedule.find((item) => item.date === todayKey)

  if (todayRestriction) {
    const startMinutes = getMinutesFromTime(todayRestriction.start)
    const endMinutes = getMinutesFromTime(todayRestriction.end)
    if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
      return {
        body: 'Blocchi attivi adesso: controlla partenze, rientri e tratte prima di muovere mezzi pesanti.',
        label: `${todayRestriction.start} - ${todayRestriction.end}`,
        title: 'Blocco attivo ora',
        tone: 'danger',
      }
    }

    if (nowMinutes < startMinutes) {
      return {
        body: 'C’e un fermo nella giornata di oggi: pianifica partenze e consegne prima dell’orario di stop.',
        label: `${todayRestriction.start} - ${todayRestriction.end}`,
        title: 'Blocco previsto oggi',
        tone: 'warning',
      }
    }
  }

  const nextRestriction = orderedSchedule.find((item) => item.date > todayKey)
  if (!nextRestriction) {
    return {
      body: 'Non risultano altri fermi nel calendario caricato. Verifica sempre aggiornamenti ufficiali MIT.',
      label: 'Calendario completato',
      title: 'Nessun prossimo fermo',
      tone: 'ok',
    }
  }

  return {
    body: 'Prossima finestra da controllare per pianificazione partenze, rientri e comunicazioni agli autisti.',
    label: `${formatDate(nextRestriction.date)} · ${nextRestriction.start} - ${nextRestriction.end}`,
    title: 'Prossimo fermo',
    tone: 'info',
  }
}

function buildItalianHeavyVehicleRestrictionSchedule2026() {
  const dayLabels = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato']
  const monthLabels = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
  const rows = new Map()
  const addRow = (dateKey, start, end) => {
    const date = new Date(`${dateKey}T12:00:00`)
    rows.set(dateKey, {
      date: dateKey,
      day: dayLabels[date.getDay()],
      month: monthLabels[date.getMonth()],
      start,
      end,
    })
  }

  for (let date = new Date('2026-01-01T12:00:00'); date.getFullYear() === 2026; date.setDate(date.getDate() + 1)) {
    if (date.getDay() === 0) {
      const month = date.getMonth() + 1
      addRow(getLocalDateKey(date), month >= 6 && month <= 9 ? '07:00' : '09:00', '22:00')
    }
  }

  [
    ['2026-01-01', '09:00', '22:00'],
    ['2026-01-06', '09:00', '22:00'],
    ['2026-04-03', '14:00', '22:00'],
    ['2026-04-04', '09:00', '16:00'],
    ['2026-04-06', '09:00', '22:00'],
    ['2026-04-07', '09:00', '14:00'],
    ['2026-04-25', '09:00', '22:00'],
    ['2026-05-01', '09:00', '22:00'],
    ['2026-06-02', '07:00', '22:00'],
    ['2026-07-04', '08:00', '16:00'],
    ['2026-07-11', '08:00', '16:00'],
    ['2026-07-18', '08:00', '16:00'],
    ['2026-07-24', '16:00', '22:00'],
    ['2026-07-25', '08:00', '16:00'],
    ['2026-07-31', '16:00', '22:00'],
    ['2026-08-01', '08:00', '22:00'],
    ['2026-08-07', '16:00', '22:00'],
    ['2026-08-08', '08:00', '22:00'],
    ['2026-08-15', '07:00', '22:00'],
    ['2026-08-22', '08:00', '16:00'],
    ['2026-08-29', '08:00', '16:00'],
    ['2026-12-08', '09:00', '22:00'],
    ['2026-12-25', '09:00', '22:00'],
    ['2026-12-26', '09:00', '22:00'],
  ].forEach(([date, start, end]) => addRow(date, start, end))

  return [...rows.values()].sort((first, second) => first.date.localeCompare(second.date))
}

const fallbackRestrictionSchedule2026 = buildItalianHeavyVehicleRestrictionSchedule2026()

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
  const [status, setStatus] = useState('Caricamento news e fermi...')
  const [isLoading, setIsLoading] = useState(false)
  const [meta, setMeta] = useState(null)
  const safeItems = Array.isArray(items) ? items : []
  const isFallbackMode = String(meta?.mode ?? '').includes('fallback') || safeItems.some((item) => item.isFallback)
  const restrictions = Array.isArray(meta?.restrictions) ? meta.restrictions : []
  const apiRestrictionSchedule = Array.isArray(meta?.restrictionSchedule) ? meta.restrictionSchedule : []
  const restrictionSchedule = apiRestrictionSchedule.length ? apiRestrictionSchedule : fallbackRestrictionSchedule2026
  const restrictionInsight = getRestrictionInsight(restrictionSchedule)
  const retentionDays = meta?.retentionDays ?? 30
  const visibleItems = activeSection === 'all'
    ? safeItems
    : activeSection === 'restrictions'
      ? []
      : safeItems.filter((item) => getNewsSectionId(item.category) === activeSection)
  const sectionCounts = newsSections.reduce((counts, section) => {
    if (section.id === 'all') return { ...counts, all: safeItems.length }
    if (section.id === 'restrictions') return { ...counts, restrictions: restrictionSchedule.length || restrictions.length }
    return { ...counts, [section.id]: safeItems.filter((item) => getNewsSectionId(item.category) === section.id).length }
  }, {})
  const upcomingRestrictions = restrictionSchedule
    .filter((restriction) => restriction.date >= getLocalDateKey())
    .slice(0, 4)

  async function loadNews({ force = false } = {}) {
    setIsLoading(true)
    setStatus(force ? 'Aggiornamento in corso...' : 'Caricamento news e fermi...')

    const result = await fetchTransportNews({ language: 'it', refresh: force })
    setIsLoading(false)

    if (result.error) {
      setStatus(result.error.message)
      return
    }

    const nextItems = Array.isArray(result.data?.items) ? result.data.items : []
    setItems(nextItems)
    setMeta(result.data && typeof result.data === 'object' ? result.data : null)
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
            <Text style={styles.statusMeta}>Conservata per circa {retentionDays} giorni.</Text>
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
        <Text style={styles.kicker}>News e fermi</Text>
        <Text style={styles.title}>Bollettino operativo</Text>
        <Text style={styles.subtitle}>
          Norme, fermi ministeriali, logistica e viabilita divise per area. Restano consultabili per circa {retentionDays} giorni.
        </Text>
      </View>

      <View style={styles.statusCard}>
        <Ionicons color={colors.cyanDark} name="radio-outline" size={18} />
        <View style={styles.statusCopy}>
          <Text style={styles.statusText}>
            {isFallbackMode ? 'Modalita sicurezza: fonti operative e fermi disponibili.' : status}
          </Text>
          <Text style={styles.statusMeta}>{meta?.nextAutomaticUpdate ?? 'Aggiornamento automatico ogni giorno intorno alle 10:00 ora italiana.'}</Text>
        </View>
        <Pressable disabled={isLoading} onPress={() => loadNews({ force: true })} style={styles.refreshButton}>
          <Ionicons color={colors.white} name="refresh" size={17} />
        </Pressable>
      </View>

      <View style={styles.sectionTabs}>
        {newsSections.map((section) => (
          <Pressable
            key={section.id}
            onPress={() => {
              setActiveSection(section.id)
              setSelectedItem(null)
            }}
            style={[styles.sectionTab, activeSection === section.id && styles.sectionTabActive]}
          >
            <View style={styles.sectionTabLabel}>
              <Ionicons color={activeSection === section.id ? colors.white : colors.cyanDark} name={section.icon} size={15} />
              <Text style={[styles.sectionTabText, activeSection === section.id && styles.sectionTabTextActive]}>{section.label}</Text>
            </View>
            <Text style={[styles.sectionCount, activeSection === section.id && styles.sectionCountActive]}>{sectionCounts[section.id] ?? 0}</Text>
          </Pressable>
        ))}
      </View>

      {activeSection === 'all' && upcomingRestrictions.length ? (
        <View style={styles.upcomingPanel}>
          <View style={styles.upcomingHead}>
            <View>
              <Text style={styles.panelKicker}>Fermi ministeriali</Text>
              <Text style={styles.upcomingTitle}>Prossimi blocchi</Text>
            </View>
            <Pressable onPress={() => setActiveSection('restrictions')} style={styles.upcomingButton}>
              <Text style={styles.upcomingButtonText}>Tutto</Text>
              <Ionicons color={colors.white} name="chevron-forward" size={15} />
            </Pressable>
          </View>
          {upcomingRestrictions.map((restriction) => (
            <View key={`upcoming-${restriction.date}`} style={styles.upcomingRow}>
              <Text style={styles.upcomingDate}>{formatDate(restriction.date)}</Text>
              <Text style={styles.upcomingTime}>{restriction.day} · {restriction.start} - {restriction.end}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {activeSection === 'restrictions' ? (
        <View style={styles.restrictionsPanel}>
          <Text style={styles.panelKicker}>Fermi ministeriali</Text>
          <Text style={styles.panelTitle}>Calendario divieti mezzi pesanti 2026</Text>
          <Text style={styles.restrictionStatus}>Veicoli sopra 7,5 tonnellate fuori dai centri abitati. Verifica sempre deroghe e tratte speciali nella fonte ufficiale.</Text>
          {restrictionInsight ? (
            <View style={[styles.restrictionInsight, styles[`${restrictionInsight.tone}Insight`]]}>
              <View style={styles.restrictionInsightIcon}>
                <Ionicons color={colors.cyanDark} name="calendar-outline" size={21} />
              </View>
              <View style={styles.restrictionInsightCopy}>
                <Text style={styles.restrictionInsightTitle}>{restrictionInsight.title}</Text>
                <Text style={styles.restrictionInsightLabel}>{restrictionInsight.label}</Text>
                <Text style={styles.restrictionStatus}>{restrictionInsight.body}</Text>
                <View style={styles.restrictionSeeAll}>
                  <Text style={styles.restrictionSeeAllText}>Vedi tutto il calendario</Text>
                  <Ionicons color={colors.white} name="chevron-down" size={15} />
                </View>
              </View>
            </View>
          ) : null}
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
          {restrictionSchedule.length ? (
            <View style={styles.schedulePanel}>
              <Text style={styles.scheduleTitle}>{restrictionSchedule.length} giornate di divieto</Text>
              {restrictionSchedule.map((restriction) => (
                <View key={restriction.date} style={styles.scheduleRow}>
                  <View style={styles.scheduleDate}>
                    <Text style={styles.scheduleDay}>{formatDate(restriction.date)}</Text>
                    <Text style={styles.restrictionArea}>{restriction.day}</Text>
                  </View>
                  <View style={styles.scheduleCopy}>
                    <Text style={styles.restrictionTitle}>{restriction.month}</Text>
                    <Text style={styles.restrictionStatus}>{restriction.start} - {restriction.end}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
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
          <Text style={styles.emptyTitle}>Nessuna news caricata</Text>
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
  upcomingButton: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 4,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  upcomingButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  upcomingDate: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  upcomingHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  upcomingPanel: {
    backgroundColor: colors.ink,
    borderColor: 'rgba(18, 198, 223, 0.32)',
    borderRadius: 16,
    borderWidth: 1,
    gap: 9,
    padding: 14,
  },
  upcomingRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    padding: 10,
  },
  upcomingTime: {
    color: 'rgba(248, 250, 252, 0.78)',
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  upcomingTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  restrictionArea: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  dangerInsight: {
    borderColor: '#fecdd3',
  },
  infoInsight: {
    borderColor: 'rgba(18, 198, 223, 0.35)',
  },
  okInsight: {
    borderColor: '#bbf7d0',
  },
  warningInsight: {
    borderColor: '#fed7aa',
  },
  restrictionCopy: {
    flex: 1,
    gap: 4,
  },
  restrictionInsight: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: 'rgba(18, 198, 223, 0.35)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  restrictionInsightCopy: {
    flex: 1,
    gap: 3,
  },
  restrictionInsightIcon: {
    alignItems: 'center',
    backgroundColor: colors.cyanSoft,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  restrictionInsightLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  restrictionInsightTitle: {
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
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
  restrictionSeeAll: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.ink,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  restrictionSeeAllText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
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
  scheduleCopy: {
    flex: 1,
    gap: 3,
  },
  scheduleDate: {
    backgroundColor: colors.cyanSoft,
    borderRadius: 12,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 104,
  },
  scheduleDay: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  schedulePanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.66)',
    borderColor: 'rgba(18, 198, 223, 0.25)',
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  scheduleRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 9,
  },
  scheduleTitle: {
    color: colors.ink,
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
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionTabActive: {
    backgroundColor: colors.ink,
    borderColor: colors.cyan,
  },
  sectionTabLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sectionTabs: {
    gap: 8,
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
