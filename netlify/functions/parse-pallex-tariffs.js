import zlib from 'node:zlib'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(body),
  }
}

function decodeXml(value = '') {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function getXmlAttribute(xml = '', name = '') {
  const escapedName = String(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = xml.match(new RegExp(`(?:^|\\s)${escapedName}="([^"]*)"`, 'i'))
  return match ? decodeXml(match[1]) : ''
}

function normalizePath(path = '') {
  const parts = []
  String(path).split('/').forEach((part) => {
    if (!part || part === '.') return
    if (part === '..') {
      parts.pop()
      return
    }
    parts.push(part)
  })
  return parts.join('/')
}

function extractZipEntries(buffer) {
  let eocdOffset = -1
  const searchStart = Math.max(0, buffer.length - 66000)

  for (let offset = buffer.length - 22; offset >= searchStart; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      eocdOffset = offset
      break
    }
  }

  if (eocdOffset < 0) throw new Error('File Excel non leggibile: archivio XLSX non valido.')

  const entryCount = buffer.readUInt16LE(eocdOffset + 10)
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16)
  const entries = new Map()
  let pointer = centralDirectoryOffset

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(pointer) !== 0x02014b50) break

    const method = buffer.readUInt16LE(pointer + 10)
    const compressedSize = buffer.readUInt32LE(pointer + 20)
    const nameLength = buffer.readUInt16LE(pointer + 28)
    const extraLength = buffer.readUInt16LE(pointer + 30)
    const commentLength = buffer.readUInt16LE(pointer + 32)
    const localHeaderOffset = buffer.readUInt32LE(pointer + 42)
    const fileName = buffer.subarray(pointer + 46, pointer + 46 + nameLength).toString('utf8')

    if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) {
      pointer += 46 + nameLength + extraLength + commentLength
      continue
    }

    const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26)
    const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28)
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength
    const compressedData = buffer.subarray(dataStart, dataStart + compressedSize)
    let data

    if (method === 0) {
      data = compressedData
    } else if (method === 8) {
      data = zlib.inflateRawSync(compressedData)
    } else {
      throw new Error(`Compressione XLSX non supportata: metodo ${method}.`)
    }

    entries.set(fileName, data)
    pointer += 46 + nameLength + extraLength + commentLength
  }

  return entries
}

function parseSharedStrings(entries) {
  const xml = entries.get('xl/sharedStrings.xml')?.toString('utf8') ?? ''
  if (!xml) return []

  return Array.from(xml.matchAll(/<si[\s\S]*?<\/si>/g)).map(([si]) => (
    Array.from(si.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g))
      .map((match) => decodeXml(match[1]))
      .join('')
  ))
}

function parseWorkbook(entries) {
  const workbookXml = entries.get('xl/workbook.xml')?.toString('utf8') ?? ''
  const relsXml = entries.get('xl/_rels/workbook.xml.rels')?.toString('utf8') ?? ''
  const rels = {}

  Array.from(relsXml.matchAll(/<Relationship\b([^>]*)\/?>/g)).forEach(([, attrs]) => {
    const id = getXmlAttribute(attrs, 'Id')
    const target = getXmlAttribute(attrs, 'Target')
    if (id && target) rels[id] = normalizePath(target.startsWith('/') ? target.slice(1) : `xl/${target}`)
  })

  return Array.from(workbookXml.matchAll(/<sheet\b([^>]*)\/?>/g)).map(([, attrs]) => {
    const name = getXmlAttribute(attrs, 'name')
    const relId = getXmlAttribute(attrs, 'r:id')
    return {
      name,
      path: rels[relId] ?? '',
    }
  }).filter((sheet) => sheet.name && sheet.path)
}

function columnToIndex(reference = '') {
  const letters = String(reference).match(/[A-Z]+/i)?.[0]?.toUpperCase() ?? ''
  let index = 0

  for (const letter of letters) {
    index = index * 26 + letter.charCodeAt(0) - 64
  }

  return Math.max(0, index - 1)
}

function parseCellValue(cellAttrs = '', cellXml = '', sharedStrings = []) {
  const type = getXmlAttribute(cellAttrs, 't')

  if (type === 'inlineStr') {
    return Array.from(cellXml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)).map((match) => decodeXml(match[1])).join('')
  }

  const valueMatch = cellXml.match(/<v[^>]*>([\s\S]*?)<\/v>/)
  if (!valueMatch) return ''
  const raw = decodeXml(valueMatch[1])

  if (type === 's') return sharedStrings[Number(raw)] ?? ''
  if (type === 'b') return raw === '1'

  const numberValue = Number(raw)
  return Number.isFinite(numberValue) ? numberValue : raw
}

function parseSheet(entries, path, sharedStrings) {
  const xml = entries.get(path)?.toString('utf8') ?? ''
  const rows = []

  Array.from(xml.matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/g)).forEach(([, rowAttrs, rowXml]) => {
    const rowNumber = Number(getXmlAttribute(rowAttrs, 'r')) || rows.length + 1
    const row = rows[rowNumber - 1] ?? []
    let sequentialIndex = 0

    const cellMatches = Array.from(rowXml.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g))
    cellMatches.forEach(([, cellAttrs, cellXml = '']) => {
      const reference = getXmlAttribute(cellAttrs, 'r')
      const columnIndex = reference ? columnToIndex(reference) : sequentialIndex
      row[columnIndex] = parseCellValue(cellAttrs, cellXml, sharedStrings)
      sequentialIndex = columnIndex + 1
    })

    rows[rowNumber - 1] = row
  })

  return rows
}

function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function toNumber(value) {
  if (typeof value === 'number') return value
  const parsed = Number(String(value ?? '').replace(',', '.').replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

function buildTariffColumns(rows, headerRowIndex = 1) {
  const palletRow = rows[headerRowIndex] ?? []
  const quantityRow = rows[headerRowIndex + 1] ?? []
  const columns = []
  let currentPallet = ''

  for (let index = 2; index <= 16; index += 1) {
    const pallet = cleanText(palletRow[index])
    if (pallet) currentPallet = pallet
    const quantity = cleanText(quantityRow[index])

    if (currentPallet || quantity) {
      columns.push({
        index,
        key: `${currentPallet}-${quantity || 'base'}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        label: `${currentPallet}${quantity ? ` ${quantity}` : ''}`.trim(),
        pallet: currentPallet,
        quantity,
      })
    }
  }

  return columns
}

function parseHubSheet(name, rows) {
  const services = []
  let currentService = null
  let currentRegion = ''
  let inFixedCosts = false

  rows.forEach((row = [], rowIndex) => {
    const firstCell = cleanText(row[0])
    const secondCell = cleanText(row[1])
    const thirdCell = cleanText(row[2])
    const province = cleanText(row[1]).toUpperCase()

    if (firstCell.toLowerCase() === 'regione' && secondCell.toLowerCase() === 'province') {
      const isNonStop = thirdCell.toLowerCase().includes('non stop')
      const serviceId = isNonStop ? 'nonStop' : 'standard'

      if (currentService?.id === serviceId && !inFixedCosts && !currentService.fixedCosts.length) {
        currentService.columns = buildTariffColumns(rows, rowIndex + 1)
        currentRegion = ''
        return
      }

      currentService = {
        columns: buildTariffColumns(rows, rowIndex + 1),
        etsRows: [],
        fixedCosts: [],
        id: serviceId,
        label: isNonStop ? 'Servizio Non Stop' : 'Servizio Standard',
        rows: [],
      }
      services.push(currentService)
      currentRegion = ''
      inFixedCosts = false
      return
    }

    if (!currentService) return

    if (firstCell.toLowerCase().includes('riepilogo costi')) {
      inFixedCosts = true
      return
    }

    if (inFixedCosts) {
      const amount = toNumber(row[11])
      const unit = cleanText(row[14])
      if (firstCell && amount !== null && unit.toLowerCase().includes('pallet')) {
        currentService.fixedCosts.push({
          amount,
          label: firstCell,
          unit: unit || 'a pallet',
        })
      }
      return
    }

    if (!province) return
    if (firstCell) currentRegion = firstCell

    const values = {}
    currentService.columns.forEach((column) => {
      const amount = toNumber(row[column.index])
      if (amount !== null) values[column.key] = amount
    })

    if (!Object.keys(values).length) return

    const record = {
      province,
      region: currentRegion,
      values,
    }

    if (province === 'ETS') {
      currentService.etsRows.push(record)
    } else {
      currentService.rows.push(record)
    }
  })

  const standardService = services.find((service) => service.id === 'standard') ?? services[0] ?? {
    columns: [],
    etsRows: [],
    fixedCosts: [],
    id: 'standard',
    label: 'Servizio Standard',
    rows: [],
  }

  return {
    columns: standardService.columns,
    etsRows: standardService.etsRows,
    fixedCosts: standardService.fixedCosts,
    name,
    rows: standardService.rows,
    services,
  }
}

function parseConditions(rows) {
  return rows
    .slice(1)
    .map((row = []) => ({
      description: [row[1], row[2], row[3], row[4]].map(cleanText).filter(Boolean).join(' · '),
      title: cleanText(row[0]),
    }))
    .filter((row) => row.title || row.description)
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Metodo non consentito.' })
  }

  try {
    const payload = JSON.parse(event.body || '{}')
    const fileBase64 = String(payload.fileBase64 ?? '').replace(/^data:.*?;base64,/, '')

    if (!fileBase64) return jsonResponse(400, { error: 'File Excel mancante.' })

    const entries = extractZipEntries(Buffer.from(fileBase64, 'base64'))
    const sharedStrings = parseSharedStrings(entries)
    const sheets = parseWorkbook(entries)
    const parsedSheets = new Map(sheets.map((sheet) => [sheet.name, parseSheet(entries, sheet.path, sharedStrings)]))
    const hubs = sheets
      .filter((sheet) => /^Hub\s+/i.test(sheet.name))
      .map((sheet) => parseHubSheet(sheet.name, parsedSheets.get(sheet.name) ?? []))
      .filter((hub) => hub.rows.length)
    const conditions = parseConditions(parsedSheets.get('Condizioni Generali') ?? [])

    return jsonResponse(200, {
      conditions,
      fileName: payload.fileName || '',
      hubs,
      parsedAt: new Date().toISOString(),
    })
  } catch (error) {
    return jsonResponse(400, {
      error: error?.message || 'Impossibile leggere il listino.',
    })
  }
}
