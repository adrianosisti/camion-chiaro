import fs from 'node:fs/promises'
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool'

const outputDir = '/Users/adriano/Documents/app trasporti/public/templates'
const previewDir = '/private/tmp/vygo-import-template-preview'
await fs.mkdir(outputDir, { recursive: true })
await fs.mkdir(previewDir, { recursive: true })

const workbook = Workbook.create()
const palette = {
  brand: '#12C6DF',
  dark: '#102132',
  ink: '#0F172A',
  line: '#D6EAF2',
  required: '#F97316',
  warning: '#FFF7ED',
}

function styleHeader(range) {
  range.format = {
    fill: palette.dark,
    font: { bold: true, color: '#FFFFFF' },
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
    wrapText: true,
  }
}

function setColumnWidths(sheet, widths) {
  widths.forEach((width, index) => {
    const column = String.fromCharCode(65 + index)
    sheet.getRange(`${column}1`).format.columnWidth = width
  })
}

function addTable(sheet, headers, rows, widths, options = {}) {
  sheet.showGridLines = false
  sheet.getRangeByIndexes(0, 0, 1, headers.length).values = [headers]
  ;(options.textColumns ?? []).forEach((column) => {
    sheet.getRange(`${column}2:${column}40`).format.numberFormat = '@'
  })
  sheet.getRangeByIndexes(1, 0, rows.length, headers.length).values = rows
  styleHeader(sheet.getRangeByIndexes(0, 0, 1, headers.length))
  ;(options.requiredColumns ?? []).forEach((columnIndex) => {
    sheet.getRangeByIndexes(0, columnIndex, 1, 1).format = {
      fill: palette.required,
      font: { bold: true, color: '#FFFFFF' },
      horizontalAlignment: 'center',
      verticalAlignment: 'center',
      wrapText: true,
    }
  })
  const tableRange = sheet.getRange(`A1:${String.fromCharCode(64 + headers.length)}${rows.length + 1}`)
  tableRange.format = {
    borders: { preset: 'inside', style: 'thin', color: palette.line },
    verticalAlignment: 'top',
    wrapText: true,
  }
  setColumnWidths(sheet, widths)
  sheet.freezePanes.freezeRows(1)

  try {
    const table = sheet.tables.add(`A1:${String.fromCharCode(64 + headers.length)}${Math.max(rows.length + 8, 12)}`, true, options.tableName)
    table.showFilterButton = true
    table.style = 'TableStyleMedium2'
  } catch {
    // The workbook remains fully usable even if the table object is not available in this renderer.
  }

  Object.entries(options.validations ?? {}).forEach(([column, values]) => {
    try {
      sheet.getRange(`${column}2:${column}40`).dataValidation = { rule: { type: 'list', values } }
    } catch {
      // Validation menus are helpful but not required for import.
    }
  })
}

const guideRows = [
  ['Regola generale', 'Non cambiare mai i titoli delle colonne. Vygo li usa per capire cosa importare.', 'Compila le righe sotto ai titoli e cancella solo le righe esempio.', 'Non rinominare fogli o colonne.'],
  ['Date', 'Usa sempre AAAA-MM-GG quando puoi.', '2027-05-31, 2026-12-15', 'Evita testi come "fine mese" o "tra un anno".'],
  ['Username', 'Scrivi nomi semplici, minuscoli, senza spazi.', 'mario.rossi, paola.ufficio, magazzino1', 'Evita accenti, apostrofi, spazi e caratteri strani.'],
  ['Password', 'Minimo 8 caratteri. Deve essere quella che poi comunichi alla persona.', 'Vygo2026!, Spedi2026', 'Non lasciare vuota la password per utenti che devono entrare in app.'],
  ['Telefono', 'Meglio con prefisso internazionale.', '+39 333 111 1111', 'Evita numeri senza prefisso se l azienda lavora anche fuori Italia.'],
  ['Mezzi - Categoria mezzo', 'Usa una di queste parole: furgone, motrice, trattore, semirimorchio.', 'trattore per il trattore stradale; semirimorchio per il rimorchio agganciato.', 'Non scrivere l allestimento nella categoria mezzo.'],
  ['Mezzi - Allestimento', 'Qui puoi descrivere il mezzo liberamente.', 'centinato, cassonato, frigo, isotermico, telonato, pianale, ribaltabile, cisterna, portacontainer, sponda idraulica', 'Non usare l allestimento al posto della categoria mezzo.'],
  ['Attrezzature', 'Usa una di queste parole: muletto, transpallet, attrezzatura, altro.', 'muletto per carrello elevatore; transpallet per transpallet elettrico/manuale.', 'Forche, batterie e caricabatterie possono stare in modello/note se non sono mezzi autonomi.'],
  ['Persone - Reparto', 'Usa ufficio o magazzino.', 'ufficio per traffico/amministrazione; magazzino per carrellisti e operatori magazzino.', 'Non usare "autisti" nel foglio Persone: gli autisti hanno il loro foglio.'],
  ['Persone - Ruolo', 'Usa ruoli chiari e coerenti.', 'Impiegato ufficio, Manager, Magazziniere, Carrellista', 'La mansione dettagliata va nella colonna Mansione.'],
  ['Documenti autisti', 'Scrivi il tipo documento come vuoi vederlo in Vygo.', 'Patente B, Patente C, Patente C+E, CQC merci, Carta tachigrafica, Visita medica, ADR base, ADR cisterna', 'Non mettere documenti del muletto qui: quelli vanno in Scadenze con ambito attrezzatura.'],
  ['Scadenze - Ambito', 'Usa autista, persona, mezzo, attrezzatura o azienda.', 'mezzo + AB123CD per revisione; persona + luca.neri per visita medica; attrezzatura + MUL-01 per verifica muletto.', 'Se ambito e target non combaciano, Vygo segnala errore in anteprima.'],
  ['Scadenze - Target', 'Per autista/persona usa username. Per mezzo usa targa. Per attrezzatura usa codice.', 'mario.rossi, AB123CD, MUL-01', 'Per scadenza azienda il target puo restare vuoto.'],
  ['Visibile in app', 'Scrivi si se l utente deve vedere il documento o la scadenza nella sua app. Scrivi no se resta solo aziendale.', 'si, no', 'Non usare forse, ok, x o altri valori.'],
]

const optionRows = [
  ['Mezzi', 'Categoria mezzo', 'furgone', 'van', 'Furgoni e veicoli leggeri'],
  ['Mezzi', 'Categoria mezzo', 'motrice', '', 'Motrice rigida'],
  ['Mezzi', 'Categoria mezzo', 'trattore', 'bilico', 'Trattore stradale che aggancia semirimorchio'],
  ['Mezzi', 'Categoria mezzo', 'semirimorchio', 'semi', 'Semirimorchio agganciabile'],
  ['Mezzi', 'Allestimento', 'centinato', '', 'Descrizione libera del mezzo'],
  ['Mezzi', 'Allestimento', 'cassonato', '', 'Descrizione libera del mezzo'],
  ['Mezzi', 'Allestimento', 'frigo / isotermico', '', 'Descrizione libera del mezzo'],
  ['Mezzi', 'Allestimento', 'telonato / pianale / ribaltabile', '', 'Descrizione libera del mezzo'],
  ['Attrezzature', 'Tipo attrezzatura', 'muletto', 'forklift', 'Carrello elevatore'],
  ['Attrezzature', 'Tipo attrezzatura', 'transpallet', 'pallet', 'Transpallet manuale o elettrico'],
  ['Attrezzature', 'Tipo attrezzatura', 'attrezzatura', '', 'Altra attrezzatura di magazzino'],
  ['Attrezzature', 'Tipo attrezzatura', 'altro', '', 'Quando non rientra nelle voci precedenti'],
  ['Persone', 'Reparto', 'ufficio', '', 'Traffico, amministrazione, direzione, operativo'],
  ['Persone', 'Reparto', 'magazzino', '', 'Magazzino e carrellisti'],
  ['Persone', 'Ruolo', 'Impiegato ufficio', 'impiegato, office', 'Ufficio traffico/amministrazione'],
  ['Persone', 'Ruolo', 'Manager', 'responsabile', 'Responsabile o titolare operativo'],
  ['Persone', 'Ruolo', 'Magazziniere', 'warehouse', 'Operatore magazzino'],
  ['Persone', 'Ruolo', 'Carrellista', 'forklift', 'Operatore muletto/carrello'],
  ['Documenti autisti', 'Documento', 'Patente B', '', 'Documento autista'],
  ['Documenti autisti', 'Documento', 'Patente C', '', 'Documento autista'],
  ['Documenti autisti', 'Documento', 'Patente C+E', '', 'Documento autista'],
  ['Documenti autisti', 'Documento', 'CQC merci', 'CQC', 'Documento autista'],
  ['Documenti autisti', 'Documento', 'Carta tachigrafica', '', 'Documento autista'],
  ['Documenti autisti', 'Documento', 'Visita medica', '', 'Scadenza sanitaria'],
  ['Documenti autisti', 'Documento', 'ADR base / ADR cisterna', '', 'Abilitazione merci pericolose'],
  ['Scadenze', 'Ambito scadenza', 'autista', 'driver', 'Usa username autista come target'],
  ['Scadenze', 'Ambito scadenza', 'persona', 'dipendente', 'Usa username persona come target'],
  ['Scadenze', 'Ambito scadenza', 'mezzo', 'targa, flotta', 'Usa targa come target'],
  ['Scadenze', 'Ambito scadenza', 'attrezzatura', 'muletto', 'Usa codice attrezzatura come target'],
  ['Scadenze', 'Ambito scadenza', 'azienda', 'company', 'Target vuoto'],
  ['Scadenze', 'Tipo scadenza mezzo', 'Revisione mezzo', '', 'Scadenza flotta'],
  ['Scadenze', 'Tipo scadenza mezzo', 'Assicurazione', '', 'Scadenza flotta'],
  ['Scadenze', 'Tipo scadenza mezzo', 'Bollo', '', 'Scadenza flotta'],
  ['Scadenze', 'Tipo scadenza mezzo', 'Manutenzione programmata', '', 'Scadenza flotta'],
  ['Scadenze', 'Tipo scadenza attrezzatura', 'Verifica sicurezza muletto', '', 'Scadenza magazzino'],
  ['Scadenze', 'Tipo scadenza attrezzatura', 'Manutenzione muletto', '', 'Scadenza magazzino'],
  ['Scadenze', 'Tipo scadenza persona', 'Visita medica', '', 'Scadenza persona'],
  ['Valori comuni', 'Visibile in app', 'si', '', 'L utente lo vede nella sua app'],
  ['Valori comuni', 'Visibile in app', 'no', '', 'Resta solo nella dashboard azienda'],
]

const readme = workbook.worksheets.add('LEGGIMI')
readme.showGridLines = false
readme.getRange('A1:H1').merge()
readme.getRange('A1').values = [['Vygo - Modello import anagrafiche']]
readme.getRange('A1').format = {
  fill: palette.dark,
  font: { bold: true, color: '#FFFFFF', size: 18 },
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
}
readme.getRange('A1').format.rowHeight = 34
readme.getRange('A3:H11').values = [
  ['Come si usa', '', '', '', '', '', '', ''],
  ['1', 'Compila solo i fogli che ti servono: Autisti, Persone, Mezzi, Attrezzature, Documenti autisti, Scadenze.', '', '', '', '', '', ''],
  ['2', 'I titoli con * e colore arancio sono obbligatori. Gli altri campi sono facoltativi o servono solo se vuoi gia caricare documenti/scadenze.', '', '', '', '', '', ''],
  ['3', 'Non cambiare i titoli della prima riga: Vygo li usa per capire cosa importare.', '', '', '', '', '', ''],
  ['4', 'Le date possono essere scritte come 2027-05-31 oppure 31/05/2027.', '', '', '', '', '', ''],
  ['5', 'Carica il file in Vygo da Anagrafiche > Import Excel. Vedrai subito righe pronte e righe da correggere.', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['Esempi accettati', 'Reparto: ufficio, magazzino', 'Mezzo: furgone, motrice, trattore, semirimorchio', 'Attrezzatura: muletto, transpallet, attrezzatura, altro', 'Ambito scadenza: autista, persona, mezzo, attrezzatura, azienda', 'Visibile in app: si/no', '', ''],
  ['Consiglio', 'Prima importa Autisti/Persone/Mezzi/Attrezzature. Poi importa documenti e scadenze collegate a username, targa o codice.', '', '', '', '', '', ''],
]
readme.getRange('A3:H3').merge()
readme.getRange('A3').format = { fill: palette.brand, font: { bold: true, color: palette.dark, size: 13 } }
readme.getRange('A4:H11').format = {
  fill: '#FFFFFF',
  borders: { preset: 'inside', style: 'thin', color: palette.line },
  wrapText: true,
  verticalAlignment: 'top',
}
setColumnWidths(readme, [10, 42, 34, 34, 36, 24, 14, 14])
readme.getRange('A4:A9').format = { font: { bold: true, color: palette.dark }, horizontalAlignment: 'center' }
readme.getRange('A11:H11').format = { fill: palette.warning, font: { bold: true, color: palette.ink }, wrapText: true }

addTable(
  workbook.worksheets.add('Guida compilazione'),
  ['Area / campo', 'Come scriverlo', 'Esempi corretti', 'Da evitare'],
  guideRows,
  [26, 48, 58, 46],
  { tableName: 'VygoGuidaCompilazione' },
)

addTable(
  workbook.worksheets.add('Opzioni'),
  ['Foglio', 'Campo', 'Scrivi così', 'Altri esempi accettati', 'Quando usarlo'],
  optionRows,
  [22, 28, 28, 28, 52],
  { tableName: 'VygoOpzioniImport' },
)

addTable(
  workbook.worksheets.add('Autisti'),
  ['Nome e cognome *', 'Username *', 'Password *', 'Telefono *', 'Ruolo', 'Deposito / sede', 'Documento iniziale', 'Scadenza documento', 'Numero documento', 'Visibile in app', 'Note'],
  [
    ['Mario Rossi', 'mario.rossi', 'Vygo2026!', '+39 333 111 1111', 'Autista bilico', 'Verona', 'Patente C+E', '2027-05-31', 'PCE12345', 'si', 'Riga esempio: puoi cancellarla'],
    ['Anna Verdi', 'anna.verdi', 'Vygo2026!', '+39 333 222 2222', 'Autista furgone', 'Milano', 'CQC', '2027-11-30', 'CQC9988', 'si', ''],
  ],
  [24, 18, 16, 18, 20, 18, 22, 18, 20, 16, 32],
  { requiredColumns: [0, 1, 2, 3], tableName: 'VygoAutisti', textColumns: ['B', 'C', 'D', 'I'], validations: { J: ['si', 'no'] } },
)

addTable(
  workbook.worksheets.add('Persone'),
  ['Nome e cognome *', 'Username *', 'Password *', 'Telefono', 'Email', 'Reparto', 'Ruolo', 'Mansione', 'Deposito / sede', 'Note'],
  [
    ['Paola Bianchi', 'paola.bianchi', 'Vygo2026!', '+39 333 444 4444', 'paola.bianchi@azienda.it', 'ufficio', 'Impiegato ufficio', 'Ufficio traffico', 'Sede centrale', 'Riga esempio: puoi cancellarla'],
    ['Luca Neri', 'luca.neri', 'Vygo2026!', '+39 333 555 5555', 'luca.neri@azienda.it', 'magazzino', 'Carrellista', 'Capo turno magazzino', 'Magazzino A', ''],
  ],
  [24, 18, 16, 18, 28, 16, 20, 24, 18, 32],
  { requiredColumns: [0, 1, 2], tableName: 'VygoPersone', textColumns: ['B', 'C', 'D'], validations: { F: ['ufficio', 'magazzino'], G: ['Impiegato ufficio', 'Manager', 'Magazziniere', 'Carrellista'] } },
)

addTable(
  workbook.worksheets.add('Mezzi'),
  ['Targa *', 'Categoria mezzo', 'Modello', 'Allestimento', 'KM', 'Deposito / sede', 'Note'],
  [
    ['AB123CD', 'trattore', 'Volvo FH', 'Trattore stradale', 340000, 'Verona', 'Riga esempio: puoi cancellarla'],
    ['SR456EF', 'semirimorchio', 'Krone', 'Centinato', 0, 'Verona', ''],
    ['FG789HI', 'furgone', 'Iveco Daily', 'Furgone cassonato', 82000, 'Milano', ''],
  ],
  [16, 22, 24, 24, 12, 18, 34],
  { requiredColumns: [0], tableName: 'VygoMezzi', textColumns: ['A'], validations: { B: ['furgone', 'motrice', 'trattore', 'semirimorchio'] } },
)
workbook.worksheets.getItem('Mezzi').getRange('E2:E40').format.numberFormat = '#,##0'

addTable(
  workbook.worksheets.add('Attrezzature'),
  ['Codice *', 'Tipo attrezzatura', 'Modello', 'Matricola', 'Deposito / sede', 'Note'],
  [
    ['MUL-01', 'muletto', 'Toyota 8FB', 'MAT-987', 'Magazzino A', 'Riga esempio: puoi cancellarla'],
    ['TP-02', 'transpallet', 'BT Levio', 'TP-445', 'Magazzino A', ''],
  ],
  [16, 22, 24, 18, 20, 34],
  { requiredColumns: [0], tableName: 'VygoAttrezzature', textColumns: ['A', 'D'], validations: { B: ['muletto', 'transpallet', 'attrezzatura', 'altro'] } },
)

addTable(
  workbook.worksheets.add('Documenti autisti'),
  ['Username autista *', 'Documento *', 'Scadenza documento *', 'Numero documento', 'Visibile in app', 'Responsabile', 'Note'],
  [
    ['mario.rossi', 'CQC', '2027-11-30', 'CQC9988', 'si', 'Ufficio personale', 'Riga esempio: puoi cancellarla'],
    ['anna.verdi', 'Visita medica', '2027-04-20', 'VM-ANNA', 'si', 'Ufficio personale', ''],
  ],
  [20, 24, 20, 20, 16, 24, 34],
  { requiredColumns: [0, 1, 2], tableName: 'VygoDocumentiAutisti', textColumns: ['A', 'D'], validations: { E: ['si', 'no'] } },
)

addTable(
  workbook.worksheets.add('Scadenze'),
  ['Ambito scadenza *', 'Username o targa o codice *', 'Tipo scadenza *', 'Data scadenza *', 'Numero documento', 'Responsabile', 'Visibile in app', 'Note'],
  [
    ['mezzo', 'AB123CD', 'Revisione mezzo', '2026-12-15', 'REV-AB123CD', 'Ufficio flotta', 'no', 'Riga esempio: puoi cancellarla'],
    ['attrezzatura', 'MUL-01', 'Verifica sicurezza muletto', '2026-10-10', 'CHK-MUL01', 'Responsabile magazzino', 'no', ''],
    ['persona', 'luca.neri', 'Visita medica', '2027-02-01', 'VM-LUCA', 'Ufficio personale', 'si', ''],
    ['azienda', '', 'Polizza sede', '2027-01-31', 'POL-SEDE', 'Amministrazione', 'no', ''],
  ],
  [20, 28, 28, 18, 22, 24, 16, 36],
  { requiredColumns: [0, 1, 2, 3], tableName: 'VygoScadenze', textColumns: ['B', 'E'], validations: { A: ['autista', 'persona', 'mezzo', 'attrezzatura', 'azienda'], G: ['si', 'no'] } },
)

workbook.worksheets.getItem('Autisti').getRange('I2:I40').format.numberFormat = 'yyyy-mm-dd'
workbook.worksheets.getItem('Autisti').getRange('B2:D40').format.numberFormat = '@'
workbook.worksheets.getItem('Autisti').getRange('J2:J40').format.numberFormat = '@'
workbook.worksheets.getItem('Documenti autisti').getRange('C2:C40').format.numberFormat = 'yyyy-mm-dd'
workbook.worksheets.getItem('Documenti autisti').getRange('A2:A40').format.numberFormat = '@'
workbook.worksheets.getItem('Documenti autisti').getRange('D2:D40').format.numberFormat = '@'
workbook.worksheets.getItem('Scadenze').getRange('D2:D40').format.numberFormat = 'yyyy-mm-dd'
workbook.worksheets.getItem('Persone').getRange('B2:D40').format.numberFormat = '@'
workbook.worksheets.getItem('Mezzi').getRange('A2:A40').format.numberFormat = '@'
workbook.worksheets.getItem('Attrezzature').getRange('A2:D40').format.numberFormat = '@'
workbook.worksheets.getItem('Scadenze').getRange('B2:B40').format.numberFormat = '@'
workbook.worksheets.getItem('Scadenze').getRange('E2:E40').format.numberFormat = '@'

const csv = [
  ['tipo_riga', 'ambito_scadenza', 'nome', 'username', 'password', 'telefono', 'email_contatto_persona', 'reparto', 'ruolo', 'mansione', 'deposito_sede', 'targa_o_codice', 'categoria_mezzo', 'tipo_attrezzatura', 'modello', 'allestimento', 'km', 'tipo_scadenza', 'data_scadenza', 'numero_documento', 'responsabile', 'visibile_app', 'note'],
  ['autista', '', 'Mario Rossi', 'mario.rossi', 'Vygo2026!', '+39 333 111 1111', '', 'autisti', 'Autista bilico', '', 'Verona', '', '', '', '', '', '', 'Patente C+E', '2027-05-31', 'PCE12345', 'Ufficio personale', 'si', 'Esempio autista'],
  ['mezzo', '', '', '', '', '', '', '', '', '', 'Verona', 'AB123CD', 'trattore', '', 'Volvo FH', 'Trattore stradale', '340000', '', '', '', '', '', 'Esempio mezzo'],
  ['scadenza', 'mezzo', '', '', '', '', '', '', '', '', '', 'AB123CD', '', '', '', '', '', 'Revisione mezzo', '2026-12-15', 'REV-AB123CD', 'Ufficio flotta', 'no', 'Esempio scadenza'],
]

function csvEscape(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

await fs.writeFile(`${outputDir}/vygo-import-anagrafiche.csv`, `${csv.map((row) => row.map(csvEscape).join(',')).join('\n')}\n`, 'utf8')

for (const sheetName of ['LEGGIMI', 'Guida compilazione', 'Opzioni', 'Autisti', 'Persone', 'Mezzi', 'Attrezzature', 'Documenti autisti', 'Scadenze']) {
  const preview = await workbook.render({ sheetName, autoCrop: 'all', scale: 1, format: 'png' })
  await fs.writeFile(`${previewDir}/${sheetName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`, new Uint8Array(await preview.arrayBuffer()))
}

const output = await SpreadsheetFile.exportXlsx(workbook)
await output.save(`${outputDir}/vygo-import-anagrafiche.xlsx`)

console.log(`Creato ${outputDir}/vygo-import-anagrafiche.xlsx`)
