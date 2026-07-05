import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

export const config = {
  schedule: '0 8 * * *',
}

const jsonHeaders = {
  'Content-Type': 'application/json',
}

const defaultLanguage = 'it'
const cacheFreshHours = 4
const newsRetentionDays = 30
const cleanupRetentionDays = 45
const maxItemsPerSource = 8
const maxItemsToReturn = 64
const maxArticlePreviewsPerSource = 2
const sourceTimeoutMs = 7500
const articlePreviewTimeoutMs = 2800
const newsSources = [
  {
    id: 'mit-news',
    name: 'Ministero Infrastrutture e Trasporti',
    url: 'https://www.mit.gov.it/comunicazione/news/rss.xml',
    priority: 95,
  },
  {
    id: 'trasporto-europa',
    name: 'Trasporto Europa',
    url: 'https://www.trasportoeuropa.it/feed/',
    priority: 88,
  },
  {
    id: 'uomini-e-trasporti',
    name: 'Uomini e Trasporti',
    url: 'https://www.uominietrasporti.it/feed/',
    priority: 82,
  },
  {
    id: 'trasporto-italia',
    name: 'Trasporto Italia',
    url: 'https://www.trasportoitalia.com/feed/',
    priority: 76,
  },
  {
    id: 'logistica-efficiente',
    name: 'Logistica Efficiente',
    url: 'https://www.logisticaefficiente.it/feed/',
    priority: 74,
  },
  {
    id: 'trasporto-merci',
    name: 'TrasportoMerci',
    url: 'https://www.trasportomerci.it/feed/',
    priority: 72,
  },
  {
    id: 'supply-chain-italy',
    name: 'Supply Chain Italy',
    url: 'https://www.supplychainitaly.it/feed/',
    priority: 70,
  },
  {
    id: 'camionisti-web',
    name: 'Camionisti Web',
    url: 'https://www.camionistiweb.com/feed/',
    priority: 72,
  },
  {
    id: 'conftrasporto',
    name: 'Conftrasporto',
    url: 'https://www.conftrasporto.it/feed/',
    priority: 78,
  },
]

const transportRestrictionResources = [
  {
    actionLabel: 'Apri fonte MIT',
    area: 'Italia',
    cadence: 'Annuale',
    sourceName: 'Ministero Infrastrutture e Trasporti',
    status: 'Fonte ufficiale da consultare per calendario, decreto e PDF dell’anno in corso.',
    title: 'Calendario divieti circolazione mezzi pesanti',
    url: 'https://www.mit.gov.it/comunicazione/news',
    year: '2026',
  },
  {
    actionLabel: 'Apri CCISS',
    area: 'Italia',
    cadence: 'Tempo reale',
    sourceName: 'CCISS Viaggiare Informati',
    status: 'Canale operativo per viabilità, traffico, blocchi e aggiornamenti sulle tratte.',
    title: 'Viabilità e blocchi traffico pesante',
    url: 'https://www.cciss.it/',
    year: 'Live',
  },
  {
    actionLabel: 'Apri Albo',
    area: 'Italia',
    cadence: 'Continuo',
    sourceName: 'Albo Autotrasporto',
    status: 'Comunicazioni istituzionali per imprese di autotrasporto, contributi e regole operative.',
    title: 'Comunicazioni autotrasporto merci',
    url: 'https://www.alboautotrasporto.it/web/portale-albo',
    year: 'Archivio',
  },
]

const transportRestrictionSchedule2026 = [
  { date: '2026-01-01', day: 'Giovedi', month: 'Gennaio', start: '09:00', end: '22:00' },
  { date: '2026-01-04', day: 'Domenica', month: 'Gennaio', start: '09:00', end: '22:00' },
  { date: '2026-01-06', day: 'Martedi', month: 'Gennaio', start: '09:00', end: '22:00' },
  { date: '2026-01-11', day: 'Domenica', month: 'Gennaio', start: '09:00', end: '22:00' },
  { date: '2026-01-18', day: 'Domenica', month: 'Gennaio', start: '09:00', end: '22:00' },
  { date: '2026-01-25', day: 'Domenica', month: 'Gennaio', start: '09:00', end: '22:00' },
  { date: '2026-02-01', day: 'Domenica', month: 'Febbraio', start: '09:00', end: '22:00' },
  { date: '2026-02-08', day: 'Domenica', month: 'Febbraio', start: '09:00', end: '22:00' },
  { date: '2026-02-15', day: 'Domenica', month: 'Febbraio', start: '09:00', end: '22:00' },
  { date: '2026-02-22', day: 'Domenica', month: 'Febbraio', start: '09:00', end: '22:00' },
  { date: '2026-03-01', day: 'Domenica', month: 'Marzo', start: '09:00', end: '22:00' },
  { date: '2026-03-08', day: 'Domenica', month: 'Marzo', start: '09:00', end: '22:00' },
  { date: '2026-03-15', day: 'Domenica', month: 'Marzo', start: '09:00', end: '22:00' },
  { date: '2026-03-22', day: 'Domenica', month: 'Marzo', start: '09:00', end: '22:00' },
  { date: '2026-03-29', day: 'Domenica', month: 'Marzo', start: '09:00', end: '22:00' },
  { date: '2026-04-03', day: 'Venerdi', month: 'Aprile', start: '14:00', end: '22:00' },
  { date: '2026-04-04', day: 'Sabato', month: 'Aprile', start: '09:00', end: '16:00' },
  { date: '2026-04-05', day: 'Domenica', month: 'Aprile', start: '09:00', end: '22:00' },
  { date: '2026-04-06', day: 'Lunedi', month: 'Aprile', start: '09:00', end: '22:00' },
  { date: '2026-04-07', day: 'Martedi', month: 'Aprile', start: '09:00', end: '14:00' },
  { date: '2026-04-12', day: 'Domenica', month: 'Aprile', start: '09:00', end: '22:00' },
  { date: '2026-04-19', day: 'Domenica', month: 'Aprile', start: '09:00', end: '22:00' },
  { date: '2026-04-25', day: 'Sabato', month: 'Aprile', start: '09:00', end: '22:00' },
  { date: '2026-04-26', day: 'Domenica', month: 'Aprile', start: '09:00', end: '22:00' },
  { date: '2026-05-01', day: 'Venerdi', month: 'Maggio', start: '09:00', end: '22:00' },
  { date: '2026-05-03', day: 'Domenica', month: 'Maggio', start: '09:00', end: '22:00' },
  { date: '2026-05-10', day: 'Domenica', month: 'Maggio', start: '09:00', end: '22:00' },
  { date: '2026-05-17', day: 'Domenica', month: 'Maggio', start: '09:00', end: '22:00' },
  { date: '2026-05-24', day: 'Domenica', month: 'Maggio', start: '09:00', end: '22:00' },
  { date: '2026-05-31', day: 'Domenica', month: 'Maggio', start: '09:00', end: '22:00' },
  { date: '2026-06-02', day: 'Martedi', month: 'Giugno', start: '07:00', end: '22:00' },
  { date: '2026-06-07', day: 'Domenica', month: 'Giugno', start: '07:00', end: '22:00' },
  { date: '2026-06-14', day: 'Domenica', month: 'Giugno', start: '07:00', end: '22:00' },
  { date: '2026-06-21', day: 'Domenica', month: 'Giugno', start: '07:00', end: '22:00' },
  { date: '2026-06-28', day: 'Domenica', month: 'Giugno', start: '07:00', end: '22:00' },
  { date: '2026-07-04', day: 'Sabato', month: 'Luglio', start: '08:00', end: '16:00' },
  { date: '2026-07-05', day: 'Domenica', month: 'Luglio', start: '07:00', end: '22:00' },
  { date: '2026-07-11', day: 'Sabato', month: 'Luglio', start: '08:00', end: '16:00' },
  { date: '2026-07-12', day: 'Domenica', month: 'Luglio', start: '07:00', end: '22:00' },
  { date: '2026-07-18', day: 'Sabato', month: 'Luglio', start: '08:00', end: '16:00' },
  { date: '2026-07-19', day: 'Domenica', month: 'Luglio', start: '07:00', end: '22:00' },
  { date: '2026-07-24', day: 'Venerdi', month: 'Luglio', start: '16:00', end: '22:00' },
  { date: '2026-07-25', day: 'Sabato', month: 'Luglio', start: '08:00', end: '16:00' },
  { date: '2026-07-26', day: 'Domenica', month: 'Luglio', start: '07:00', end: '22:00' },
  { date: '2026-07-31', day: 'Venerdi', month: 'Luglio', start: '16:00', end: '22:00' },
  { date: '2026-08-01', day: 'Sabato', month: 'Agosto', start: '08:00', end: '22:00' },
  { date: '2026-08-02', day: 'Domenica', month: 'Agosto', start: '07:00', end: '22:00' },
  { date: '2026-08-07', day: 'Venerdi', month: 'Agosto', start: '16:00', end: '22:00' },
  { date: '2026-08-08', day: 'Sabato', month: 'Agosto', start: '08:00', end: '22:00' },
  { date: '2026-08-09', day: 'Domenica', month: 'Agosto', start: '07:00', end: '22:00' },
  { date: '2026-08-15', day: 'Sabato', month: 'Agosto', start: '07:00', end: '22:00' },
  { date: '2026-08-16', day: 'Domenica', month: 'Agosto', start: '07:00', end: '22:00' },
  { date: '2026-08-22', day: 'Sabato', month: 'Agosto', start: '08:00', end: '16:00' },
  { date: '2026-08-23', day: 'Domenica', month: 'Agosto', start: '07:00', end: '22:00' },
  { date: '2026-08-29', day: 'Sabato', month: 'Agosto', start: '08:00', end: '16:00' },
  { date: '2026-08-30', day: 'Domenica', month: 'Agosto', start: '07:00', end: '22:00' },
  { date: '2026-09-06', day: 'Domenica', month: 'Settembre', start: '07:00', end: '22:00' },
  { date: '2026-09-13', day: 'Domenica', month: 'Settembre', start: '07:00', end: '22:00' },
  { date: '2026-09-20', day: 'Domenica', month: 'Settembre', start: '07:00', end: '22:00' },
  { date: '2026-09-27', day: 'Domenica', month: 'Settembre', start: '07:00', end: '22:00' },
  { date: '2026-10-04', day: 'Domenica', month: 'Ottobre', start: '09:00', end: '22:00' },
  { date: '2026-10-11', day: 'Domenica', month: 'Ottobre', start: '09:00', end: '22:00' },
  { date: '2026-10-18', day: 'Domenica', month: 'Ottobre', start: '09:00', end: '22:00' },
  { date: '2026-10-25', day: 'Domenica', month: 'Ottobre', start: '09:00', end: '22:00' },
  { date: '2026-11-01', day: 'Domenica', month: 'Novembre', start: '09:00', end: '22:00' },
  { date: '2026-11-08', day: 'Domenica', month: 'Novembre', start: '09:00', end: '22:00' },
  { date: '2026-11-15', day: 'Domenica', month: 'Novembre', start: '09:00', end: '22:00' },
  { date: '2026-11-22', day: 'Domenica', month: 'Novembre', start: '09:00', end: '22:00' },
  { date: '2026-11-29', day: 'Domenica', month: 'Novembre', start: '09:00', end: '22:00' },
  { date: '2026-12-06', day: 'Domenica', month: 'Dicembre', start: '09:00', end: '22:00' },
  { date: '2026-12-08', day: 'Martedi', month: 'Dicembre', start: '09:00', end: '22:00' },
  { date: '2026-12-13', day: 'Domenica', month: 'Dicembre', start: '09:00', end: '22:00' },
  { date: '2026-12-20', day: 'Domenica', month: 'Dicembre', start: '09:00', end: '22:00' },
  { date: '2026-12-25', day: 'Venerdi', month: 'Dicembre', start: '09:00', end: '22:00' },
  { date: '2026-12-26', day: 'Sabato', month: 'Dicembre', start: '09:00', end: '22:00' },
  { date: '2026-12-27', day: 'Domenica', month: 'Dicembre', start: '09:00', end: '22:00' },
]

const categoryRules = [
  {
    category: 'Viabilità',
    keywords: ['autostrada', 'divieto', 'blocco', 'valico', 'brennero', 'traforo', 'viabilita', 'viabilità', 'meteo', 'neve'],
  },
  {
    category: 'Scioperi',
    keywords: ['sciopero', 'fermo', 'protesta', 'agitazione', 'presidio'],
  },
  {
    category: 'Costi',
    keywords: ['gasolio', 'carburante', 'pedaggio', 'costi', 'tariffe', 'accise', 'rimborso'],
  },
  {
    category: 'Norme',
    keywords: ['norma', 'decreto', 'ministero', 'mit', 'tachigrafo', 'cqc', 'patente', 'adr', 'cabotaggio', 'ue', 'regolamento', 'documenti', 'scadenze', 'revisione', 'revisioni', 'assicurazione', 'assicurazioni'],
  },
  {
    category: 'Mercato',
    keywords: ['iveco', 'camion', 'veicolo', 'veicoli', 'truck', 'flotta', 'assistenza', 'ricambi', 'manutenzione', 'servizi', 'concessionario', 'autotrasporto'],
  },
  {
    category: 'Logistica',
    keywords: ['logistica', 'spedizioni', 'magazzino', 'porto', 'interporto', 'terminal', 'pallet', 'hub', 'deposito', 'supply chain', 'intermodale'],
  },
]

function jsonResponse(statusCode, body) {
  return {
    body: JSON.stringify(body),
    headers: jsonHeaders,
    statusCode,
  }
}

function getSupabaseServiceClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) return null

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function getConfiguredSources() {
  const configured = String(process.env.TRANSPORT_NEWS_SOURCES ?? '').trim()
  if (!configured) return newsSources

  try {
    const parsed = JSON.parse(configured)
    if (Array.isArray(parsed) && parsed.length) {
      return parsed
        .map((source, index) => ({
          id: String(source.id ?? `source-${index}`),
          name: String(source.name ?? source.id ?? `Fonte ${index + 1}`),
          priority: Number(source.priority ?? 70),
          url: String(source.url ?? ''),
        }))
        .filter((source) => source.url.startsWith('http'))
    }
  } catch {
    return newsSources
  }

  return newsSources
}

function cleanLanguage(value) {
  const cleanValue = String(value ?? defaultLanguage).trim().toLowerCase()
  return cleanValue || defaultLanguage
}

function stripCdata(value = '') {
  return String(value).replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '')
}

function decodeXml(value = '') {
  return stripCdata(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function stripHtml(value = '') {
  return decodeXml(value)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractTag(xmlChunk, tagName) {
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i')
  return decodeXml(xmlChunk.match(pattern)?.[1] ?? '').trim()
}

function extractAtomLink(xmlChunk) {
  return decodeXml(xmlChunk.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1] ?? '').trim()
}

function normalizeUrl(url = '') {
  return String(url).trim().replace(/\?.*utm_[^#]+/i, '')
}

function parseDate(value = '') {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

function matchesKeyword(text, keyword) {
  const cleanKeyword = String(keyword).toLowerCase()
  if (cleanKeyword.length <= 3) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(cleanKeyword)}([^a-z0-9]|$)`, 'i').test(text)
  }

  return text.includes(cleanKeyword)
}

function getCategory(text = '') {
  const cleanText = text.toLowerCase()
  const match = categoryRules.find((rule) => rule.keywords.some((keyword) => matchesKeyword(cleanText, keyword)))
  return match?.category ?? 'Logistica'
}

function getTitleDrivenCategory(title = '', fallbackText = '') {
  const titleCategory = getCategory(title)
  if (titleCategory !== 'Logistica') return titleCategory
  return getCategory(`${title} ${fallbackText}`)
}

function scoreNews({ category, publishedAt, sourcePriority, text }) {
  const lowerText = text.toLowerCase()
  const urgentWords = ['urgente', 'divieto', 'blocco', 'sciopero', 'fermo', 'decreto', 'tachigrafo', 'brennero', 'gasolio']
  const urgency = urgentWords.reduce((total, word) => total + (lowerText.includes(word) ? 8 : 0), 0)
  const categoryBonus = ['Norme', 'Viabilità', 'Scioperi'].includes(category) ? 14 : category === 'Costi' ? 9 : 3
  const ageHours = publishedAt ? Math.max(0, (Date.now() - new Date(publishedAt).getTime()) / 3600000) : 72
  const freshness = ageHours <= 24 ? 18 : ageHours <= 72 ? 10 : 2

  return Math.min(100, Math.round(sourcePriority * 0.45 + urgency + categoryBonus + freshness))
}

function truncateText(value = '', maxLength = 1100) {
  const cleanValue = String(value).replace(/\s+/g, ' ').trim()
  if (cleanValue.length <= maxLength) return cleanValue
  return `${cleanValue.slice(0, maxLength).replace(/\s+\S*$/, '')}...`
}

function isBlockedArticleText(value = '') {
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

function isGenericOperationalSummary(value = '') {
  const cleanValue = String(value).toLowerCase()
  return [
    'possibile impatto',
    'aggiornamento di settore',
    'tema utile',
    'lettura vygo',
    'scheda operativa',
    'per leggere l\'articolo completo',
    'usa la fonte originale',
    'notizia di mercato',
    'canale istituzionale da controllare',
    'area da tenere sotto controllo',
    'canale da consultare',
    'canale operativo',
    'riferimento pubblico',
    'riferimento utile',
    'fonte verticale di settore',
    'fonte di settore',
    'raccolta di notizie',
  ].some((pattern) => cleanValue.includes(pattern))
}

function hasReadableNewsSummary(value = '', { allowShort = false } = {}) {
  const cleanValue = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (!cleanValue) return false
  if (isBlockedArticleText(cleanValue) || isGenericOperationalSummary(cleanValue)) return false
  if (cleanValue.length < (allowShort ? 45 : 90)) return false
  return /[a-zàèéìòù]/i.test(cleanValue)
}

function isReadableNewsItem(item = {}) {
  if (item?.isFallback || String(item?.source_id ?? '').includes('fallback')) return false
  if (!item?.title || !String(item.url ?? '').startsWith('http')) return false
  return hasReadableNewsSummary(item.summary, { allowShort: Boolean(item.isFallback) })
}

function buildReadableSummary(description = '') {
  const excerpt = isBlockedArticleText(description) ? '' : truncateText(description, 1100)
  return excerpt
}

function extractMetaContent(html = '', key = '') {
  const escapedKey = escapeRegExp(key)
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escapedKey}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapedKey}["'][^>]*>`, 'i'),
  ]

  for (const pattern of patterns) {
    const match = String(html).match(pattern)
    if (match?.[1]) return stripHtml(match[1])
  }

  return ''
}

function extractArticleDescription(html = '') {
  const description = truncateText(
    extractMetaContent(html, 'og:description')
      || extractMetaContent(html, 'twitter:description')
      || extractMetaContent(html, 'description')
      || '',
    1100,
  )

  return isBlockedArticleText(description) ? '' : description
}

async function fetchArticleDescription(url = '') {
  if (!String(url).startsWith('http')) return ''

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), articlePreviewTimeoutMs)

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.7',
        'User-Agent': 'VygoTransportRadar/1.0 (+https://vy-go.com)',
      },
      signal: controller.signal,
    })

    if (!response.ok) return ''
    return extractArticleDescription(await response.text())
  } catch {
    return ''
  } finally {
    clearTimeout(timeout)
  }
}

function summaryNeedsArticlePreview(item = {}) {
  const summary = String(item.summary ?? '').trim()
  if (!String(item.url ?? '').startsWith('http')) return false
  if (item.isFallback) return false
  if (item._skipArticlePreview) return false
  if (isBlockedArticleText(summary) || isGenericOperationalSummary(summary)) return false
  if (summary.length < 220) return true
  return false
}

function normalizeNewsItem(item = {}, language = defaultLanguage) {
  const summary = String(item.summary ?? '')
  const category = getTitleDrivenCategory(item.title, isBlockedArticleText(summary) ? '' : summary)
  const shouldClearSummary = isBlockedArticleText(summary) || isGenericOperationalSummary(summary)

  return {
    ...item,
    _skipArticlePreview: shouldClearSummary,
    category,
    language: item.language || language,
    summary: shouldClearSummary ? '' : summary,
    tags: Array.from(new Set([...(Array.isArray(item.tags) ? item.tags : []), category.toLowerCase()])),
  }
}

async function enrichNewsItemsWithArticleMetadata(items = [], language = defaultLanguage, maxItems = maxArticlePreviewsPerSource) {
  const normalizedItems = items.map((item) => normalizeNewsItem(item, language))
  const previewIds = new Set(
    normalizedItems
      .filter((item) => summaryNeedsArticlePreview(item))
      .slice(0, maxItems)
      .map((item) => item.id || item.url),
  )

  return Promise.all(normalizedItems.map(async (item) => {
    if (!previewIds.has(item.id || item.url)) return item

    const articleDescription = await fetchArticleDescription(item.url)
    if (!articleDescription) return item

    const category = getTitleDrivenCategory(item.title, articleDescription)
    return {
      ...item,
      category,
      importance: scoreNews({
        category,
        publishedAt: item.published_at,
        sourcePriority: Number(item.importance ?? 70),
        text: `${item.title} ${articleDescription}`,
      }),
      language: item.language || language,
      summary: buildReadableSummary(articleDescription),
      tags: Array.from(new Set([...(Array.isArray(item.tags) ? item.tags : []), category.toLowerCase(), 'article-preview'])),
    }
  }))
}

function getPersistableNewsItems(items = []) {
  return items
    .filter(isReadableNewsItem)
    .filter((item) => item && !item.isFallback && !item.isDigest)
    .map((item) => {
      const cleanItem = { ...item }
      delete cleanItem.isFallback
      delete cleanItem._skipArticlePreview
      delete cleanItem.isDigest
      delete cleanItem.sources
      return cleanItem
    })
}

function getNewsId(sourceId, url, title) {
  return createHash('sha1')
    .update(`${sourceId}|${normalizeUrl(url)}|${title}`)
    .digest('hex')
}

function parseFeed(xml, source, language) {
  const chunks = [
    ...String(xml).matchAll(/<item\b[\s\S]*?<\/item>/gi),
  ].map((match) => match[0])
  const atomChunks = chunks.length ? [] : [
    ...String(xml).matchAll(/<entry\b[\s\S]*?<\/entry>/gi),
  ].map((match) => match[0])

  return [...chunks, ...atomChunks]
    .map((chunk) => {
      const title = stripHtml(extractTag(chunk, 'title'))
      const rssLink = extractTag(chunk, 'link')
      const link = normalizeUrl(rssLink || extractAtomLink(chunk))
      const rawDescription = extractTag(chunk, 'description') || extractTag(chunk, 'summary') || extractTag(chunk, 'content:encoded')
      const description = stripHtml(rawDescription)
      const publishedAt = parseDate(extractTag(chunk, 'pubDate') || extractTag(chunk, 'published') || extractTag(chunk, 'updated'))
      const text = `${title} ${description}`
      const category = getCategory(text)

      if (!title || !link) return null

      return {
        category,
        fetched_at: new Date().toISOString(),
        id: getNewsId(source.id, link, title),
        importance: scoreNews({
          category,
          publishedAt,
          sourcePriority: source.priority ?? 70,
          text,
        }),
        is_active: true,
        language,
        published_at: publishedAt || null,
        source_id: source.id,
        source_name: source.name,
        summary: buildReadableSummary(description),
        tags: [category.toLowerCase(), source.id],
        title,
        url: link,
      }
    })
    .filter(Boolean)
}

async function fetchSource(source, language) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), sourceTimeoutMs)

  try {
    const response = await fetch(source.url, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.7',
        'User-Agent': 'VygoTransportRadar/1.0 (+https://vy-go.com)',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      return { items: [], issue: `${source.name}: risposta ${response.status}` }
    }

    const xml = await response.text()
    const parsedItems = parseFeed(xml, source, language).slice(0, maxItemsPerSource)
    const enrichedItems = await enrichNewsItemsWithArticleMetadata(parsedItems, language)
    return { items: enrichedItems, issue: '' }
  } catch (error) {
    return { items: [], issue: `${source.name}: ${error.name === 'AbortError' ? 'tempo scaduto' : 'fonte non raggiungibile'}` }
  } finally {
    clearTimeout(timeout)
  }
}

async function collectTransportNews(language) {
  const sourceResults = await Promise.all(getConfiguredSources().map((source) => fetchSource(source, language)))
  const issues = sourceResults.map((result) => result.issue).filter(Boolean)
  const items = mergeNewsItems(sourceResults.flatMap((result) => result.items))

  return { issues, items }
}

async function readCachedNews(serviceClient, language) {
  if (!serviceClient) return { items: [], issue: 'Archivio news non disponibile in questo momento.' }

  const retentionCutoff = new Date(Date.now() - newsRetentionDays * 24 * 3600000).toISOString()

  const { data, error } = await serviceClient
    .from('transport_news_items')
    .select('id, source_id, source_name, title, summary, url, category, language, published_at, fetched_at, importance, tags')
    .eq('language', language)
    .eq('is_active', true)
    .gte('fetched_at', retentionCutoff)
    .order('importance', { ascending: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(160)

  if (error) {
    return { items: [], issue: 'Archivio news non disponibile in questo momento.' }
  }

  return { items: data ?? [], issue: '' }
}

async function deleteOldNews(serviceClient) {
  if (!serviceClient) return ''

  const cleanupCutoff = new Date(Date.now() - cleanupRetentionDays * 24 * 3600000).toISOString()
  const { error } = await serviceClient
    .from('transport_news_items')
    .delete()
    .lt('fetched_at', cleanupCutoff)

  return error ? 'Archivio news temporaneamente non aggiornato.' : ''
}

function mergeNewsItems(...groups) {
  const seen = new Set()

  return groups
    .flat()
    .filter(Boolean)
    .filter(isReadableNewsItem)
    .filter((item) => {
      const key = item.id || normalizeUrl(item.url)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((first, second) => {
      if ((second.importance ?? 0) !== (first.importance ?? 0)) return (second.importance ?? 0) - (first.importance ?? 0)
      return new Date(second.published_at || second.fetched_at) - new Date(first.published_at || first.fetched_at)
    })
}

function ensureMinimumSectionCoverage(items = []) {
  return mergeNewsItems(items)
}

const digestPlans = [
  {
    category: 'Norme',
    id: 'rules',
    minItems: 1,
    title: 'Radar Vygo: norme, Albo e regole operative',
    intro: 'Il quadro normativo resta uno dei punti piu delicati per chi gestisce autisti, documenti e mezzi.',
    closing: 'Per una direzione trasporti significa tenere allineati ufficio traffico, amministrazione e personale prima che una notizia diventi una scadenza dimenticata.',
  },
  {
    category: 'Viabilità',
    id: 'roads',
    minItems: 1,
    title: 'Radar Vygo: viabilita e tratte da controllare',
    intro: 'La viabilita incide direttamente su partenze, rientri, ritiri e promesse fatte ai clienti.',
    closing: 'Il punto utile e trasformare ogni criticita in una comunicazione rapida verso autisti e ufficio traffico.',
  },
  {
    category: 'Scioperi',
    id: 'strikes',
    minItems: 1,
    title: 'Radar Vygo: scioperi e agitazioni da monitorare',
    intro: 'Scioperi e agitazioni possono cambiare in poche ore il piano consegne, soprattutto su porti, interporti e nodi logistici.',
    closing: 'Conviene controllare le fonti e preparare alternative prima che la criticita arrivi al cliente finale.',
  },
  {
    category: 'Costi',
    id: 'costs',
    minItems: 1,
    title: 'Radar Vygo: costi, carburanti e margini',
    intro: 'Carburanti, pedaggi, manutenzioni e rincari pesano subito sul margine operativo.',
    closing: 'Ogni variazione va letta insieme al centro costi, cosi la direzione capisce dove intervenire e quali tratte controllare.',
  },
  {
    category: 'Logistica',
    id: 'logistics',
    minItems: 1,
    title: 'Radar Vygo: logistica, magazzino e supply chain',
    intro: 'Le notizie di logistica aiutano a capire cosa cambia in magazzini, hub, porti, interporti e processi di consegna.',
    closing: 'Il valore per l’azienda e leggere il segnale prima che diventi ritardo, extra costo o telefonata urgente.',
  },
  {
    category: 'Mercato',
    id: 'market',
    minItems: 1,
    title: 'Radar Vygo: flotte, veicoli e mercato trasporto',
    intro: 'Mercato, veicoli industriali, ricambi e servizi di assistenza raccontano dove sta andando il settore.',
    closing: 'Sono segnali utili per pianificare acquisti, manutenzioni, rinnovi flotta e rapporti con fornitori.',
  },
]

function cleanDigestSnippet(value = '', maxLength = 240) {
  const cleanValue = stripHtml(value)
    .replace(/\s+/g, ' ')
    .replace(/^(leggi|continua|read more)\b.*$/i, '')
    .trim()

  if (!cleanValue || isBlockedArticleText(cleanValue) || isGenericOperationalSummary(cleanValue)) return ''
  if (cleanValue.length <= maxLength) return cleanValue
  return `${cleanValue.slice(0, maxLength).replace(/\s+\S*$/, '')}...`
}

function getDigestPlanForItem(item = {}) {
  const category = String(item.category ?? '')
  const normalizedCategory = category.toLowerCase()
  if (normalizedCategory.includes('norm')) return digestPlans.find((plan) => plan.id === 'rules')
  if (normalizedCategory.includes('viabil')) return digestPlans.find((plan) => plan.id === 'roads')
  if (normalizedCategory.includes('scioper')) return digestPlans.find((plan) => plan.id === 'strikes')
  if (normalizedCategory.includes('cost')) return digestPlans.find((plan) => plan.id === 'costs')
  if (normalizedCategory.includes('mercato')) return digestPlans.find((plan) => plan.id === 'market')
  return digestPlans.find((plan) => plan.id === 'logistics')
}

function buildDigestParagraph(plan, items = []) {
  const sourceNames = Array.from(new Set(items.map((item) => item.source_name).filter(Boolean))).slice(0, 4)
  const headlines = items.slice(0, 4).map((item) => {
    const snippet = cleanDigestSnippet(item.summary)
    const source = item.source_name ? ` (${item.source_name})` : ''
    return snippet
      ? `${item.title}${source}: ${snippet}`
      : `${item.title}${source}.`
  })

  const sourceText = sourceNames.length
    ? `Le fonti monitorate oggi includono ${sourceNames.join(', ')}.`
    : 'Vygo ha raccolto aggiornamenti dalle fonti di settore collegate sotto.'

  return [
    `${plan.intro} ${sourceText}`,
    `Il radar di oggi evidenzia ${headlines.length} segnali principali: ${headlines.join(' ')}`,
    `${plan.closing} Le fonti originali sono disponibili sotto per leggere il dettaglio completo direttamente dal sito che ha pubblicato la notizia.`,
  ].join('\n\n')
}

function buildDailyDigestItems(items = [], language = defaultLanguage) {
  const readableItems = mergeNewsItems(items)
  if (!readableItems.length) return []

  const today = new Date().toISOString()
  const groupedItems = digestPlans.map((plan) => ({
    plan,
    items: readableItems
      .filter((item) => getDigestPlanForItem(item)?.id === plan.id)
      .slice(0, 5),
  }))
    .filter((entry) => entry.items.length >= entry.plan.minItems)

  const digestItems = groupedItems.map(({ plan, items }) => {
    const primaryItem = items[0]
    const sources = items.map((item) => ({
      publishedAt: item.published_at || item.fetched_at || today,
      sourceName: item.source_name || 'Fonte',
      title: item.title,
      url: item.url,
    }))

    return {
      category: plan.category,
      fetched_at: today,
      id: getNewsId(`vygo-daily-${plan.id}`, sources.map((source) => source.url).join('|'), today.slice(0, 10)),
      importance: Math.max(...items.map((item) => Number(item.importance ?? 50)), 70),
      isDigest: true,
      is_active: true,
      language,
      published_at: today,
      source_id: `vygo-daily-${plan.id}`,
      source_name: 'Radar Vygo',
      sources,
      summary: buildDigestParagraph(plan, items),
      tags: [plan.id, 'radar-vygo', 'digest'],
      title: plan.title,
      url: primaryItem?.url || 'https://vy-go.com',
    }
  })

  if (digestItems.length) return digestItems.sort((first, second) => (second.importance ?? 0) - (first.importance ?? 0))

  const topItems = readableItems.slice(0, 5)
  return [{
    category: 'Logistica',
    fetched_at: today,
    id: getNewsId('vygo-daily-general', topItems.map((item) => item.url).join('|'), today.slice(0, 10)),
    importance: 72,
    isDigest: true,
    is_active: true,
    language,
    published_at: today,
    source_id: 'vygo-daily-general',
    source_name: 'Radar Vygo',
    sources: topItems.map((item) => ({
      publishedAt: item.published_at || item.fetched_at || today,
      sourceName: item.source_name || 'Fonte',
      title: item.title,
      url: item.url,
    })),
    summary: buildDigestParagraph(digestPlans.find((plan) => plan.id === 'logistics'), topItems),
    tags: ['radar-vygo', 'digest'],
    title: 'Radar Vygo: cosa sapere oggi nel trasporto',
    url: topItems[0]?.url || 'https://vy-go.com',
  }]
}

function getUpcomingRestriction(schedule = transportRestrictionSchedule2026, now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const todayKey = `${year}-${month}-${day}`

  return [...schedule]
    .sort((first, second) => first.date.localeCompare(second.date))
    .find((restriction) => restriction.date >= todayKey) ?? null
}

function buildRadarFallbackItem({
  category,
  id,
  importance,
  language,
  sources,
  summary,
  title,
}) {
  const now = new Date().toISOString()

  return {
    category,
    fetched_at: now,
    id: getNewsId(`vygo-radar-${id}`, sources.map((source) => source.url).join('|'), now.slice(0, 10)),
    importance,
    isDigest: true,
    is_active: true,
    language,
    published_at: now,
    source_id: `vygo-radar-${id}`,
    source_name: 'Radar Vygo',
    sources,
    summary,
    tags: [id, 'radar-vygo', 'daily-brief'],
    title,
    url: sources[0]?.url || 'https://vy-go.com',
  }
}

function buildOperationalRadarFallbackItems(language = defaultLanguage) {
  const nextRestriction = getUpcomingRestriction()
  const restrictionText = nextRestriction
    ? `Il prossimo blocco nazionale caricato in Vygo e ${nextRestriction.day} ${nextRestriction.date}, dalle ${nextRestriction.start} alle ${nextRestriction.end}.`
    : 'Il calendario caricato non segnala altri blocchi futuri, ma le aziende devono comunque verificare eventuali deroghe e aggiornamenti ufficiali.'

  return [
    buildRadarFallbackItem({
      category: 'Norme',
      id: 'rules-daily',
      importance: 82,
      language,
      sources: [
        { sourceName: 'Ministero Infrastrutture e Trasporti', title: 'Comunicati e news MIT', url: 'https://www.mit.gov.it/comunicazione/news' },
        { sourceName: 'Albo Autotrasporto', title: 'Portale Albo Autotrasporto', url: 'https://www.alboautotrasporto.it/web/portale-albo' },
        { sourceName: 'Polizia di Stato', title: 'Sicurezza stradale e controlli', url: 'https://www.poliziadistato.it/articolo/50' },
      ],
      summary: [
        'Il controllo normativo del giorno parte da documenti, scadenze, abilitazioni e comunicazioni istituzionali. Per una direzione trasporti la priorita e capire se ci sono novita che possono cambiare procedure interne, controlli su strada o responsabilita operative.',
        'Vygo consiglia di verificare patente, CQC, visite mediche, revisioni mezzo, assicurazioni e documenti di bordo quando arrivano comunicazioni da MIT, Albo o organi di controllo. Se una comunicazione riguarda autisti o flotta, va trasformata subito in promemoria operativo.',
        'Le fonti collegate sotto permettono di aprire il dettaglio ufficiale e confrontarlo con anagrafiche, scadenze e documenti gia presenti in Vygo.',
      ].join('\n\n'),
      title: 'Radar Vygo: controllo norme e documenti del giorno',
    }),
    buildRadarFallbackItem({
      category: 'Viabilità',
      id: 'roads-daily',
      importance: 86,
      language,
      sources: [
        { sourceName: 'MIT', title: 'Calendario e comunicazioni su divieti mezzi pesanti', url: 'https://www.mit.gov.it/comunicazione/news' },
        { sourceName: 'CCISS Viaggiare Informati', title: 'Traffico e viabilita in tempo reale', url: 'https://www.cciss.it/' },
      ],
      summary: [
        `${restrictionText} Questo dato va usato per pianificare partenze, rientri, viaggi lunghi e comunicazioni agli autisti.`,
        'Quando ci sono fermi, traffico intenso o finestre di blocco, l’azienda deve decidere prima quali mezzi far partire, quali tratte spostare e quali clienti avvisare. Il valore operativo non e solo sapere il divieto, ma trasformarlo in una scelta chiara prima che il mezzo sia gia in strada.',
        'Le fonti sotto servono per aprire il calendario ufficiale e controllare eventuali aggiornamenti su tratte, deroghe o criticita live.',
      ].join('\n\n'),
      title: 'Radar Vygo: fermi, viabilita e partenze da pianificare',
    }),
    buildRadarFallbackItem({
      category: 'Logistica',
      id: 'logistics-daily',
      importance: 76,
      language,
      sources: [
        { sourceName: 'Logistica Efficiente', title: 'Magazzino, supply chain e processi logistici', url: 'https://www.logisticaefficiente.it/' },
        { sourceName: 'Supply Chain Italy', title: 'Porti, spedizioni e filiere operative', url: 'https://www.supplychainitaly.it/' },
        { sourceName: 'Il Giornale della Logistica', title: 'Innovazione e gestione logistica', url: 'https://www.ilgiornaledellalogistica.it/' },
      ],
      summary: [
        'Il radar logistico guarda a magazzino, ribalte, pallet, hub, porti e flussi di consegna. Anche quando non c’e una singola notizia urgente, questi segnali aiutano a capire dove possono nascere ritardi, extra costi o problemi di comunicazione tra ufficio traffico e personale operativo.',
        'Per le aziende con magazzino o carrellisti, la lettura quotidiana va collegata a check attrezzature, documenti del personale, manutenzioni e comunicazioni interne. Una procedura chiara evita telefonate, fogli sparsi e responsabilita non tracciate.',
        'Le fonti collegate sotto aprono approfondimenti verticali su logistica e supply chain.',
      ].join('\n\n'),
      title: 'Radar Vygo: logistica, magazzino e flussi operativi',
    }),
    buildRadarFallbackItem({
      category: 'Costi',
      id: 'costs-daily',
      importance: 74,
      language,
      sources: [
        { sourceName: 'Osservatorio Prezzi Carburanti', title: 'Prezzi carburanti', url: 'https://carburanti.mise.gov.it/ospzSearch/home' },
        { sourceName: 'MIT', title: 'News e provvedimenti trasporto', url: 'https://www.mit.gov.it/comunicazione/news' },
      ],
      summary: [
        'Il controllo economico giornaliero deve guardare carburanti, pedaggi, manutenzioni, sanzioni e riparazioni. Nel trasporto anche piccoli scostamenti diventano margine perso se non vengono registrati per targa, mezzo, periodo e causale.',
        'Vygo collega questa area al centro costi: ogni spesa inserita correttamente permette report piu chiari su mezzi, autisti, attrezzature e manutenzioni. Il titolare puo cosi vedere dove il costo nasce e se si ripete.',
        'Le fonti sotto aiutano a verificare carburanti e provvedimenti che possono incidere sui costi operativi.',
      ].join('\n\n'),
      title: 'Radar Vygo: costi, carburanti e margini da controllare',
    }),
    buildRadarFallbackItem({
      category: 'Mercato',
      id: 'market-daily',
      importance: 70,
      language,
      sources: [
        { sourceName: 'Uomini e Trasporti', title: 'Autotrasporto, veicoli e flotte', url: 'https://www.uominietrasporti.it/' },
        { sourceName: 'Trasporto Europa', title: 'Trasporto e logistica', url: 'https://www.trasportoeuropa.it/' },
        { sourceName: 'Trasporto Italia', title: 'Mercato autotrasporto e imprese', url: 'https://www.trasportoitalia.com/' },
      ],
      summary: [
        'Il mercato del trasporto cambia attraverso veicoli, servizi, officine, pneumatici, assistenza e tecnologie di gestione. Per un’azienda con flotta, questi segnali servono a decidere quando rinnovare, quando riparare e quando misurare meglio i costi.',
        'La lettura quotidiana non deve restare teoria: se una notizia riguarda mezzi, manutenzione o fornitori, puo diventare una nota interna, una scadenza da controllare o una voce nel centro costi.',
        'Le fonti collegate permettono di aprire approfondimenti sul mercato e confrontarli con la situazione reale della propria flotta.',
      ].join('\n\n'),
      title: 'Radar Vygo: flotte, fornitori e mercato trasporto',
    }),
  ]
}

function isCacheFresh(items = []) {
  const latestFetchedAt = items
    .map((item) => new Date(item.fetched_at).getTime())
    .filter(Number.isFinite)
    .sort((first, second) => second - first)[0]

  if (!latestFetchedAt) return false
  return Date.now() - latestFetchedAt <= cacheFreshHours * 3600000
}

async function saveNews(serviceClient, items) {
  const persistableItems = getPersistableNewsItems(items)
  if (!serviceClient || !persistableItems.length) return ''

  const { error } = await serviceClient
    .from('transport_news_items')
    .upsert(persistableItems, { onConflict: 'id' })

  return error ? 'Archivio news temporaneamente non aggiornato.' : ''
}

export async function handler(event = {}) {
  const language = cleanLanguage(event.queryStringParameters?.language)
  const forceRefresh = event.queryStringParameters?.refresh === '1' || event.headers?.['x-netlify-event'] === 'schedule'
  const serviceClient = getSupabaseServiceClient()
  const cached = await readCachedNews(serviceClient, language)
  const issues = cached.issue ? [cached.issue] : []

  if (!forceRefresh && isCacheFresh(cached.items)) {
    const coveredItems = ensureMinimumSectionCoverage(cached.items, language, issues)
    const enrichedItems = await enrichNewsItemsWithArticleMetadata(coveredItems, language, 10)
    const changedItems = enrichedItems.filter((item, index) => item.summary !== coveredItems[index]?.summary || item.category !== coveredItems[index]?.category)
    const outputItems = buildDailyDigestItems(enrichedItems, language)
    if (changedItems.length) {
      const saveIssue = await saveNews(serviceClient, changedItems)
      if (saveIssue) issues.push(saveIssue)
    }

    if (outputItems.length) {
      return jsonResponse(200, {
        generatedAt: new Date().toISOString(),
        items: outputItems.slice(0, maxItemsToReturn),
        mode: 'cache',
        nextAutomaticUpdate: 'Radar aggiornato automaticamente.',
        retentionDays: newsRetentionDays,
        restrictionSchedule: transportRestrictionSchedule2026,
        restrictions: transportRestrictionResources,
        issues,
      })
    }

    issues.push('Cache news non utilizzabile: Vygo sta cercando fonti aggiornate.')
  }

  const cleanupIssue = await deleteOldNews(serviceClient)
  if (cleanupIssue) issues.push(cleanupIssue)

  const collected = await collectTransportNews(language)
  issues.push(...collected.issues)

  if (collected.items.length) {
    const saveIssue = await saveNews(serviceClient, collected.items)
    if (saveIssue) issues.push(saveIssue)
    const refreshedCache = await readCachedNews(serviceClient, language)
    if (refreshedCache.issue && refreshedCache.issue !== cached.issue) issues.push(refreshedCache.issue)
    const mergedItems = mergeNewsItems(collected.items, refreshedCache.items, cached.items)
    const coveredItems = ensureMinimumSectionCoverage(mergedItems, language, issues)
    const outputItems = buildDailyDigestItems(coveredItems, language)
    const finalOutputItems = outputItems.length ? outputItems : buildOperationalRadarFallbackItems(language)

    return jsonResponse(200, {
      generatedAt: new Date().toISOString(),
      items: finalOutputItems.slice(0, maxItemsToReturn),
      mode: forceRefresh ? 'refresh' : 'live',
      nextAutomaticUpdate: 'Radar aggiornato automaticamente.',
      retentionDays: newsRetentionDays,
      restrictionSchedule: transportRestrictionSchedule2026,
      restrictions: transportRestrictionResources,
      issues,
    })
  }

  const cachedFallbackItems = buildDailyDigestItems(ensureMinimumSectionCoverage(cached.items, language, issues), language)
  const finalFallbackItems = cachedFallbackItems.length ? cachedFallbackItems : buildOperationalRadarFallbackItems(language)

  return jsonResponse(200, {
    generatedAt: new Date().toISOString(),
    items: finalFallbackItems.slice(0, maxItemsToReturn),
    mode: 'cache-fallback',
    nextAutomaticUpdate: 'Radar aggiornato automaticamente.',
    retentionDays: newsRetentionDays,
    restrictionSchedule: transportRestrictionSchedule2026,
    restrictions: transportRestrictionResources,
    issues: issues.length ? issues : ['Nessuna fonte ha restituito notizie aggiornate.'],
  })
}
