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

function getNewsTitleCategory(title = '', fallbackCategory = 'Logistica') {
  const cleanTitle = String(title).toLowerCase()
  if (/(sciopero|fermo|protesta|agitazione|presidio)/i.test(cleanTitle)) return 'Scioperi'
  if (/(autostrada|divieto|blocco|valico|brennero|traforo|traffico|meteo|neve)/i.test(cleanTitle)) return 'Viabilita'
  if (/(gasolio|carburante|pedaggio|costi|tariffe|accise|rimborso)/i.test(cleanTitle)) return 'Costi'
  if (/(norma|decreto|ministero|tachigrafo|cqc|patente|adr|cabotaggio|regolamento)/i.test(cleanTitle)) return 'Norme'
  if (/(iveco|camion|veicol|truck|flotta|assistenza|ricambi|manutenzione|servizi|concessionario|autotrasporto)/i.test(cleanTitle)) return 'Mercato'
  if (/(logistica|spedizioni|magazzino|porto|interporto|terminal|pallet|hub|deposito|supply chain|intermodale)/i.test(cleanTitle)) return 'Logistica'
  return fallbackCategory || 'Logistica'
}

function hasBlockedNewsText(value = '') {
  const cleanValue = String(value).toLowerCase()
  return [
    'per accedere a questo contenuto',
    'effettua login',
    'effettua il login',
    'devi essere autenticato',
    'contenuto riservato',
    'accesso riservato',
    'abbonati per continuare',
    'subscribe to continue',
    'sign in to continue',
    'log in to continue',
  ].some((pattern) => cleanValue.includes(pattern))
}

function isGenericNewsSummary(value = '') {
  const cleanValue = String(value).toLowerCase()
  return [
    'possibile impatto su documenti',
    'aggiornamento di settore',
    'impatto possibile su carburante',
    'possibile impatto su partenze',
    'possibile impatto su tratte',
    'tema utile per chi gestisce',
    'tema utile per ufficio traffico',
  ].some((pattern) => cleanValue.includes(pattern))
}

function buildLocalNewsSummary(category = 'Logistica', title = '') {
  const cleanTitle = String(title).toLowerCase()
  if (/(iveco|ecosistema di servizi|servizi collegati|oltre il camion)/i.test(cleanTitle)) {
    return 'Notizia di mercato sui veicoli industriali: il valore non passa solo dal camion, ma dai servizi collegati alla flotta, come assistenza, manutenzione, ricambi, dati operativi e continuita dei mezzi. Per un trasportatore significa guardare anche a tempi di fermo, supporto post vendita e organizzazione della manutenzione.'
  }
  if (/(camion|veicol|truck|servizi|flotta|concessionar|assistenza|ricambi|manutenzion)/i.test(cleanTitle)) {
    return 'Tema utile per chi gestisce mezzi e flotta: riguarda servizi, assistenza, manutenzione, valore operativo o organizzazione dei veicoli. Conviene valutarlo rispetto a costi, disponibilita dei mezzi e fermi tecnici.'
  }
  if (/(pallet|hub|magazzin|deposit|supply chain|intermodal|terminal|porto|spedizion)/i.test(cleanTitle)) {
    return 'Tema utile per ufficio traffico e magazzino: puo incidere su flussi, consegne, ritiri, tempi e organizzazione della logistica. Va letto pensando a tratte, pianificazione, carichi e comunicazioni interne.'
  }

  const summaries = {
    Costi: 'Impatto possibile su carburante, pedaggi o spese operative: valuta tratte, margini e centro costi.',
    Logistica: 'Aggiornamento di settore: utile per capire mercato, flotta, magazzino e organizzazione operativa.',
    Mercato: 'Aggiornamento di settore: utile per capire mercato, flotta, magazzino e organizzazione operativa.',
    Norme: 'Possibile impatto su documenti, scadenze o regole operative: verifica se riguarda autisti, mezzi o viaggi.',
    Scioperi: 'Possibile impatto su partenze, consegne o ritiri: controlla tratte, clienti coinvolti e comunicazioni interne.',
    Viabilita: 'Possibile impatto su tratte e tempi di consegna: avvisa ufficio traffico e autisti se la zona e coinvolta.',
  }

  return summaries[category] ?? summaries.Logistica
}

function getDisplayNewsItem(item = {}) {
  const category = getNewsTitleCategory(item.title, item.category || 'Logistica')
  const summary = String(item.summary ?? '')
  const shouldReplaceSummary = hasBlockedNewsText(summary)
    || !summary.trim()
    || (category !== item.category && isGenericNewsSummary(summary))

  return {
    ...item,
    category,
    summary: shouldReplaceSummary ? buildLocalNewsSummary(category, item.title) : summary,
  }
}

function splitNewsText(value = '') {
  const cleanValue = String(value || '').replace(/\s+/g, ' ').trim()
  if (!cleanValue) return []
  const sentences = cleanValue.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [cleanValue]
  const paragraphs = []

  sentences.forEach((sentence) => {
    const cleanSentence = sentence.trim()
    if (!cleanSentence) return

    const lastIndex = Math.max(0, paragraphs.length - 1)
    if (!paragraphs.length || `${paragraphs[lastIndex]} ${cleanSentence}`.length > 260) {
      paragraphs.push(cleanSentence)
      return
    }

    paragraphs[lastIndex] = `${paragraphs[lastIndex]} ${cleanSentence}`
  })

  return paragraphs
}

function getNewsAdvice(category = '') {
  const normalized = String(category).toLowerCase()
  if (normalized.includes('norm')) {
    return [
      'Controlla se cambia una procedura, una scadenza o un documento.',
      'Avvisa ufficio traffico o direzione se riguarda viaggi o mezzi.',
      'Crea un promemoria operativo se serve un controllo successivo.',
    ]
  }
  if (normalized.includes('viabil') || normalized.includes('scioper')) {
    return [
      'Verifica tratte, partenze e rientri previsti.',
      'Avvisa gli autisti coinvolti prima di muovere i mezzi.',
      'Apri la fonte se servono aggiornamenti in tempo reale.',
    ]
  }
  if (normalized.includes('cost')) {
    return [
      'Valuta impatto su gasolio, pedaggi, manutenzioni o margini.',
      'Aggiorna il centro costi se il dato diventa rilevante.',
      'Confronta la notizia con i report mensili della flotta.',
    ]
  }
  return [
    'Valuta impatto su magazzino, flotta, clienti o reparto.',
    'Condividi la notizia nella chat interessata se cambia il lavoro.',
    'Apri la fonte solo se servono dettagli ufficiali o allegati.',
  ]
}

export function TransportNewsScreen({ language = 'it', onBack }) {
  const [items, setItems] = useState([])
  const [activeSection, setActiveSection] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [status, setStatus] = useState('Caricamento news e fermi...')
  const [isLoading, setIsLoading] = useState(false)
  const [meta, setMeta] = useState(null)
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false)
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
  const previewRestrictionSchedule = restrictionSchedule
    .filter((restriction) => restriction.date >= getLocalDateKey())
    .slice(0, 12)
  const displayedRestrictionSchedule = isScheduleExpanded
    ? restrictionSchedule
    : (previewRestrictionSchedule.length ? previewRestrictionSchedule : restrictionSchedule.slice(0, 12))

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
    const displayItem = getDisplayNewsItem(selectedItem)
    const tone = getNewsTone(displayItem.category)
    const detailParagraphs = splitNewsText(displayItem.summary || 'Apri la fonte ufficiale per leggere il dettaglio completo della notizia.')
    const adviceItems = getNewsAdvice(displayItem.category)

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.detailHero, styles[`${tone}Card`]]}>
          <Pressable onPress={() => setSelectedItem(null)} style={styles.backButton}>
            <Ionicons color={colors.ink} name="arrow-back" size={18} />
            <Text style={styles.backText}>Indietro</Text>
          </Pressable>
          <View style={styles.newsHead}>
            <Text style={styles.category}>{displayItem.category || 'Logistica'}</Text>
            <Text style={styles.detailDate}>{formatDate(displayItem.published_at || displayItem.fetched_at)}</Text>
          </View>
          <Text style={styles.detailTitle}>{displayItem.title}</Text>
          <Text style={styles.detailSource}>{displayItem.source_name || 'Fonte'} · disponibile per circa {retentionDays} giorni</Text>
        </View>

        <View style={styles.readerCard}>
          <Text style={styles.readerTitle}>Leggi in Vygo</Text>
          <Text style={styles.readerNote}>Scheda operativa sintetica: per leggere l'articolo completo puoi aprire la fonte originale.</Text>
          {detailParagraphs.map((paragraph, index) => (
            <Text key={`${displayItem.id || displayItem.url}-paragraph-${index}`} style={styles.detailSummary}>{paragraph}</Text>
          ))}
        </View>

        <View style={styles.adviceCard}>
          <Text style={styles.readerTitle}>Cosa fare adesso</Text>
          {adviceItems.map((advice) => (
            <View key={advice} style={styles.adviceRow}>
              <Ionicons color={colors.cyanDark} name="checkmark-circle" size={18} />
              <Text style={styles.adviceText}>{advice}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={() => displayItem.url && Linking.openURL(displayItem.url)} style={styles.sourceButton}>
          <Text style={styles.sourceButtonText}>Apri fonte originale</Text>
          <Ionicons color={colors.white} name="open-outline" size={16} />
        </Pressable>
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
            {isFallbackMode ? 'Informazioni disponibili e calendario fermi aggiornato.' : status}
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
              setIsScheduleExpanded(false)
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
            <Pressable
              onPress={() => {
                setActiveSection('restrictions')
                setIsScheduleExpanded(true)
              }}
              style={styles.upcomingButton}
            >
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
                <Pressable
                  onPress={() => setIsScheduleExpanded((value) => !value)}
                  style={styles.restrictionSeeAll}
                >
                  <Text style={styles.restrictionSeeAllText}>{isScheduleExpanded ? 'Mostra meno' : 'Vedi tutto il calendario'}</Text>
                  <Ionicons color={colors.white} name={isScheduleExpanded ? 'chevron-up' : 'chevron-down'} size={15} />
                </Pressable>
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
          {displayedRestrictionSchedule.length ? (
            <View style={styles.schedulePanel}>
              <Text style={styles.scheduleTitle}>
                {isScheduleExpanded ? `${restrictionSchedule.length} giornate di divieto` : 'Prossimi fermi'}
              </Text>
              {displayedRestrictionSchedule.map((restriction) => (
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
        const displayItem = getDisplayNewsItem(item)
        const tone = getNewsTone(displayItem.category)

        return (
          <Pressable key={displayItem.id || displayItem.url} onPress={() => setSelectedItem(displayItem)} style={[styles.newsCard, styles[`${tone}Card`]]}>
            <View style={styles.newsHead}>
              <Text style={styles.category}>{displayItem.category || 'Logistica'}</Text>
              <Text style={styles.date}>{formatDate(displayItem.published_at || displayItem.fetched_at)}</Text>
            </View>
            <Text style={styles.newsTitle}>{displayItem.title}</Text>
            <Text numberOfLines={4} style={styles.summary}>{displayItem.summary || 'Apri la fonte per leggere il dettaglio completo.'}</Text>
            <View style={styles.sourceRow}>
              <Text style={styles.source}>{displayItem.source_name || 'Fonte'}</Text>
              <View style={styles.sourceAction}>
                <Text style={styles.sourceActionText}>{displayItem.isFallback ? 'Canale' : 'Fonte'}</Text>
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
          <Text style={styles.emptyText}>Tira giu per aggiornare oppure riprova piu tardi. Vygo mantiene comunque visibili fermi e canali principali.</Text>
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
  detailHero: {
    backgroundColor: colors.ink,
    borderColor: 'rgba(18, 198, 223, 0.35)',
    borderLeftColor: colors.cyan,
    borderLeftWidth: 5,
    borderRadius: 18,
    borderWidth: 1,
    gap: 13,
    overflow: 'hidden',
    padding: 16,
  },
  detailDate: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 12,
    fontWeight: '900',
  },
  detailMeta: {
    backgroundColor: colors.cyanSoft,
    borderRadius: 12,
    gap: 3,
    padding: 12,
  },
  detailSource: {
    color: 'rgba(255, 255, 255, 0.76)',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  detailSummary: {
    color: '#243244',
    fontSize: 15,
    lineHeight: 24,
  },
  detailTitle: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
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
  adviceCard: {
    backgroundColor: '#f8fdff',
    borderColor: 'rgba(18, 198, 223, 0.24)',
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  adviceRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  adviceText: {
    color: '#334155',
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 19,
  },
  readerCard: {
    backgroundColor: colors.white,
    borderColor: 'rgba(18, 198, 223, 0.18)',
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 15,
  },
  readerTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  readerNote: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
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
