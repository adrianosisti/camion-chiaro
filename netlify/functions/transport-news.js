import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

export const config = {
  schedule: '0 8 * * *',
}

const jsonHeaders = {
  'Content-Type': 'application/json',
}

const defaultLanguage = 'it'
const cacheFreshHours = 20
const newsRetentionDays = 30
const cleanupRetentionDays = 45
const maxItemsToReturn = 36
const sourceTimeoutMs = 7500
const newsSources = [
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
  {
    id: 'mit-news',
    name: 'Ministero Infrastrutture e Trasporti',
    url: 'https://www.mit.gov.it/comunicazione/news/rss.xml',
    priority: 95,
  },
]

const fallbackNewsItems = [
  {
    category: 'Norme',
    source_id: 'mit-fallback',
    source_name: 'Ministero Infrastrutture e Trasporti',
    summary: 'Canale istituzionale da controllare per norme, comunicati e aggiornamenti che possono impattare autotrasporto, documenti e viaggi.',
    title: 'Aggiornamenti MIT per trasporto e infrastrutture',
    url: 'https://www.mit.gov.it/comunicazione/news',
  },
  {
    category: 'Norme',
    source_id: 'albo-fallback',
    source_name: 'Albo Autotrasporto',
    summary: 'Canale utile per imprese di autotrasporto: contributi, comunicazioni, regole operative e aggiornamenti istituzionali.',
    title: 'Comunicazioni Albo Autotrasporto',
    url: 'https://www.alboautotrasporto.it/web/portale-albo',
  },
  {
    category: 'Viabilità',
    source_id: 'cciss-fallback',
    source_name: 'CCISS Viaggiare Informati',
    summary: 'Canale operativo per traffico, blocchi, viabilità e criticità sulle principali tratte: utile per ufficio traffico e autisti.',
    title: 'Viabilità e traffico in tempo reale',
    url: 'https://www.cciss.it/',
  },
  {
    category: 'Costi',
    source_id: 'mase-fallback',
    source_name: 'Ministero Ambiente e Sicurezza Energetica',
    summary: 'Riferimento pubblico per carburanti e prezzi energia: utile per controllare impatti su margini, rifornimenti e centro costi.',
    title: 'Prezzi carburanti e aggiornamenti energia',
    url: 'https://carburanti.mise.gov.it/ospzSearch/home',
  },
  {
    category: 'Logistica',
    source_id: 'trasporto-europa-fallback',
    source_name: 'Trasporto Europa',
    summary: 'Fonte verticale di settore su trasporto, logistica, porti, autotrasporto e scenari operativi.',
    title: 'Notizie trasporto e logistica',
    url: 'https://www.trasportoeuropa.it/',
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

const categoryRules = [
  {
    category: 'Norme',
    keywords: ['norma', 'decreto', 'ministero', 'mit', 'tachigrafo', 'cqc', 'patente', 'adr', 'cabotaggio', 'ue', 'regolamento'],
  },
  {
    category: 'Viabilità',
    keywords: ['autostrada', 'divieto', 'blocco', 'valico', 'brennero', 'traforo', 'traffico', 'meteo', 'neve', 'porto', 'interporto'],
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
    category: 'Mercato',
    keywords: ['logistica', 'trasporto', 'autotrasporto', 'flotta', 'spedizioni', 'magazzino'],
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

function getCategory(text = '') {
  const cleanText = text.toLowerCase()
  const match = categoryRules.find((rule) => rule.keywords.some((keyword) => cleanText.includes(keyword)))
  return match?.category ?? 'Logistica'
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

function buildOperationalSummary(category) {
  const summaries = {
    Costi: 'Impatto possibile su carburante, pedaggi o spese operative: valuta tratte, margini e centro costi.',
    Logistica: 'Aggiornamento di settore: utile per capire mercato, flotta, magazzino e organizzazione operativa.',
    Mercato: 'Aggiornamento di settore: utile per capire mercato, flotta, magazzino e organizzazione operativa.',
    Norme: 'Possibile impatto su documenti, scadenze o regole operative: verifica se riguarda autisti, mezzi o viaggi.',
    Scioperi: 'Possibile impatto su partenze, consegne o ritiri: controlla tratte, clienti coinvolti e comunicazioni interne.',
    Viabilità: 'Possibile impatto su tratte e tempi di consegna: avvisa ufficio traffico e autisti se la zona e coinvolta.',
  }

  return summaries[category] ?? summaries.Logistica
}

function truncateText(value = '', maxLength = 320) {
  const cleanValue = String(value).replace(/\s+/g, ' ').trim()
  if (cleanValue.length <= maxLength) return cleanValue
  return `${cleanValue.slice(0, maxLength).replace(/\s+\S*$/, '')}...`
}

function buildReadableSummary(category, description = '') {
  const operationalSummary = buildOperationalSummary(category)
  const excerpt = truncateText(description, 300)
  if (!excerpt) return operationalSummary
  return `${excerpt} ${operationalSummary}`
}

function getNewsId(sourceId, url, title) {
  return createHash('sha1')
    .update(`${sourceId}|${normalizeUrl(url)}|${title}`)
    .digest('hex')
}

function buildFallbackItems(language, issues = []) {
  const now = new Date().toISOString()

  return fallbackNewsItems.map((item, index) => ({
    ...item,
    fetched_at: now,
    id: getNewsId(item.source_id, item.url, item.title),
    importance: 65 - index,
    isFallback: true,
    is_active: true,
    language,
    published_at: now,
    tags: [item.category.toLowerCase(), item.source_id, 'fallback'],
    summary: `${item.summary}${issues.length ? ' Radar automatico in attesa di nuove notizie dai feed.' : ''}`,
  }))
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
        summary: buildReadableSummary(category, description),
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
    return { items: parseFeed(xml, source, language).slice(0, 5), issue: '' }
  } catch (error) {
    return { items: [], issue: `${source.name}: ${error.name === 'AbortError' ? 'tempo scaduto' : 'fonte non raggiungibile'}` }
  } finally {
    clearTimeout(timeout)
  }
}

async function collectTransportNews(language) {
  const sourceResults = await Promise.all(getConfiguredSources().map((source) => fetchSource(source, language)))
  const issues = sourceResults.map((result) => result.issue).filter(Boolean)
  const seenUrls = new Set()
  const items = sourceResults
    .flatMap((result) => result.items)
    .filter((item) => {
      const key = normalizeUrl(item.url)
      if (seenUrls.has(key)) return false
      seenUrls.add(key)
      return true
    })
    .sort((first, second) => {
      if (second.importance !== first.importance) return second.importance - first.importance
      return new Date(second.published_at || second.fetched_at) - new Date(first.published_at || first.fetched_at)
    })

  return { issues, items }
}

async function readCachedNews(serviceClient, language) {
  if (!serviceClient) return { items: [], issue: 'Supabase service role non configurata per cache Radar Trasporti.' }

  const retentionCutoff = new Date(Date.now() - newsRetentionDays * 24 * 3600000).toISOString()

  const { data, error } = await serviceClient
    .from('transport_news_items')
    .select('id, source_id, source_name, title, summary, url, category, language, published_at, fetched_at, importance, tags')
    .eq('language', language)
    .eq('is_active', true)
    .gte('fetched_at', retentionCutoff)
    .order('importance', { ascending: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(80)

  if (error) {
    return { items: [], issue: `Cache news non pronta: ${error.message}` }
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

  return error ? `Pulizia cache news non riuscita: ${error.message}` : ''
}

function mergeNewsItems(...groups) {
  const seen = new Set()

  return groups
    .flat()
    .filter(Boolean)
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

function isCacheFresh(items = []) {
  const latestFetchedAt = items
    .map((item) => new Date(item.fetched_at).getTime())
    .filter(Number.isFinite)
    .sort((first, second) => second - first)[0]

  if (!latestFetchedAt) return false
  return Date.now() - latestFetchedAt <= cacheFreshHours * 3600000
}

async function saveNews(serviceClient, items) {
  if (!serviceClient || !items.length) return ''

  const { error } = await serviceClient
    .from('transport_news_items')
    .upsert(items, { onConflict: 'id' })

  return error ? `Salvataggio cache news non riuscito: ${error.message}` : ''
}

export async function handler(event = {}) {
  const language = cleanLanguage(event.queryStringParameters?.language)
  const forceRefresh = event.queryStringParameters?.refresh === '1' || event.headers?.['x-netlify-event'] === 'schedule'
  const serviceClient = getSupabaseServiceClient()
  const cached = await readCachedNews(serviceClient, language)
  const issues = cached.issue ? [cached.issue] : []

  if (!forceRefresh && isCacheFresh(cached.items)) {
    return jsonResponse(200, {
      generatedAt: new Date().toISOString(),
      items: cached.items.slice(0, maxItemsToReturn),
      mode: 'cache',
      nextAutomaticUpdate: 'Ogni giorno intorno alle 10:00 ora italiana.',
      retentionDays: newsRetentionDays,
      restrictions: transportRestrictionResources,
      issues,
    })
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

    return jsonResponse(200, {
      generatedAt: new Date().toISOString(),
      items: mergedItems.slice(0, maxItemsToReturn),
      mode: forceRefresh ? 'refresh' : 'live',
      nextAutomaticUpdate: 'Ogni giorno intorno alle 10:00 ora italiana.',
      retentionDays: newsRetentionDays,
      restrictions: transportRestrictionResources,
      issues,
    })
  }

  return jsonResponse(200, {
    generatedAt: new Date().toISOString(),
    items: cached.items.length ? cached.items.slice(0, maxItemsToReturn) : buildFallbackItems(language, issues).slice(0, maxItemsToReturn),
    mode: 'cache-fallback',
    nextAutomaticUpdate: 'Ogni giorno intorno alle 10:00 ora italiana.',
    retentionDays: newsRetentionDays,
    restrictions: transportRestrictionResources,
    issues: issues.length ? issues : ['Nessuna fonte ha restituito notizie aggiornate.'],
  })
}
