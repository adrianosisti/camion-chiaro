import fs from 'node:fs/promises'
import path from 'node:path'
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool'

const projectRoot = process.env.VYGO_PROJECT_ROOT || '/Users/adriano/Documents/app trasporti'
const outputDir = path.join(projectRoot, 'docs/pilota')
const previewDir = '/private/tmp/vygo-pilot-kit-preview'
await fs.mkdir(outputDir, { recursive: true })
await fs.mkdir(previewDir, { recursive: true })

const workbook = Workbook.create()
const palette = {
  brand: '#12C6DF',
  cyanSoft: '#DDF8FC',
  dark: '#102132',
  dark2: '#163047',
  green: '#10B981',
  ink: '#0F172A',
  line: '#CFE6EE',
  muted: '#64748B',
  required: '#F97316',
  warning: '#FFF7ED',
  white: '#FFFFFF',
}

function colName(index) {
  let dividend = index + 1
  let columnName = ''
  while (dividend > 0) {
    const modulo = (dividend - 1) % 26
    columnName = String.fromCharCode(65 + modulo) + columnName
    dividend = Math.floor((dividend - modulo) / 26)
  }
  return columnName
}

function setColumnWidths(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRange(`${colName(index)}1`).format.columnWidth = width
  })
}

function styleTitle(sheet, title, subtitle = '') {
  sheet.showGridLines = false
  sheet.getRange('A1:H1').merge()
  sheet.getRange('A1').values = [[title]]
  sheet.getRange('A1').format = {
    fill: palette.dark,
    font: { bold: true, color: palette.white, size: 18 },
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
  }
  sheet.getRange('A1').format.rowHeight = 34

  if (subtitle) {
    sheet.getRange('A2:H2').merge()
    sheet.getRange('A2').values = [[subtitle]]
    sheet.getRange('A2').format = {
      fill: palette.cyanSoft,
      font: { bold: true, color: palette.dark },
      horizontalAlignment: 'center',
      verticalAlignment: 'center',
      wrapText: true,
    }
    sheet.getRange('A2').format.rowHeight = 30
  }
}

function styleHeader(range) {
  range.format = {
    fill: palette.dark2,
    font: { bold: true, color: palette.white },
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
    wrapText: true,
  }
}

function addTable(sheet, startRow, headers, rows, widths, options = {}) {
  const headerRange = sheet.getRangeByIndexes(startRow, 0, 1, headers.length)
  headerRange.values = [headers]
  styleHeader(headerRange)

  ;(options.requiredColumns ?? []).forEach((columnIndex) => {
    sheet.getRangeByIndexes(startRow, columnIndex, 1, 1).format = {
      fill: palette.required,
      font: { bold: true, color: palette.white },
      horizontalAlignment: 'center',
      verticalAlignment: 'center',
      wrapText: true,
    }
  })

  sheet.getRangeByIndexes(startRow + 1, 0, rows.length, headers.length).values = rows
  const lastColumn = colName(headers.length - 1)
  const firstRow = startRow + 1
  const lastRow = startRow + Math.max(rows.length + 1, options.reserveRows ?? 12)
  const tableRange = sheet.getRange(`A${firstRow}:${lastColumn}${lastRow}`)
  tableRange.format = {
    borders: { preset: 'inside', style: 'thin', color: palette.line },
    verticalAlignment: 'top',
    wrapText: true,
  }
  setColumnWidths(sheet, widths)
  sheet.freezePanes.freezeRows(startRow + 1)

  ;(options.textColumns ?? []).forEach((column) => {
    sheet.getRange(`${column}${firstRow + 1}:${column}${lastRow}`).format.numberFormat = '@'
  })

  ;(options.dateColumns ?? []).forEach((column) => {
    sheet.getRange(`${column}${firstRow + 1}:${column}${lastRow}`).format.numberFormat = '@'
  })

  Object.entries(options.validations ?? {}).forEach(([column, values]) => {
    try {
      sheet.getRange(`${column}${firstRow + 1}:${column}${lastRow}`).dataValidation = { rule: { type: 'list', values } }
    } catch {
      // The template remains usable even if a spreadsheet viewer strips validations.
    }
  })

  try {
    const table = sheet.tables.add(`A${firstRow}:${lastColumn}${lastRow}`, true, options.tableName)
    table.showFilterButton = true
    table.style = 'TableStyleMedium2'
  } catch {
    // The visual sheet remains usable even without a formal table object.
  }
}

function addNoteBlock(sheet, range, title, body, fill = palette.warning) {
  range.merge()
  range.values = [[`${title}\n${body}`]]
  range.format = {
    fill,
    font: { bold: false, color: palette.ink },
    borders: { preset: 'outside', style: 'thin', color: palette.line },
    verticalAlignment: 'top',
    wrapText: true,
  }
}

const readme = workbook.worksheets.add('LEGGIMI')
styleTitle(readme, 'Vygo - Kit pilota azienda trasporti', 'Compila i fogli anagrafici, carica il file in Vygo e usa Piano test / Feedback per seguire la prova.')
readme.getRange('A4:H14').values = [
  ['Passo', 'Cosa fare', 'Dettaglio', '', '', '', '', ''],
  ['1', 'Compila Dati azienda', 'Inserisci referente, numero mezzi, utenti previsti e canale supporto pilota.', '', '', '', '', ''],
  ['2', 'Compila Autisti, Persone, Mezzi e Attrezzature', 'I campi arancio con * sono obbligatori. Gli altri possono restare vuoti.', '', '', '', '', ''],
  ['3', 'Compila Documenti autisti e Scadenze', 'Usa username, targa o codice gia presenti negli altri fogli.', '', '', '', '', ''],
  ['4', 'Carica in Vygo', 'Da web: Anagrafiche > Importa da Excel > Scegli file.', '', '', '', '', ''],
  ['5', 'Controlla anteprima', 'Vygo indica righe pronte e righe da correggere prima di importare.', '', '', '', '', ''],
  ['6', 'Parti con gruppo ristretto', 'Prima titolare, ufficio, 2 autisti e 1 magazziniere. Poi si allarga.', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['Regole date', 'Scrivi sempre AAAA-MM-GG, esempio 2027-05-31.', '', '', '', '', '', ''],
  ['Regole password', 'Minimo 8 caratteri. L azienda potra cambiarla e comunicarla alla persona.', '', '', '', '', '', ''],
  ['Regola target scadenze', 'Per autista/persona usa username. Per mezzo usa targa. Per attrezzatura usa codice.', '', '', '', '', '', ''],
]
readme.getRange('A4:H4').format = { fill: palette.brand, font: { bold: true, color: palette.dark }, horizontalAlignment: 'center' }
readme.getRange('A5:H14').format = {
  borders: { preset: 'inside', style: 'thin', color: palette.line },
  wrapText: true,
  verticalAlignment: 'top',
}
readme.getRange('A5:A11').format = { font: { bold: true, color: palette.dark }, horizontalAlignment: 'center' }
readme.getRange('A13:A14').format = { font: { bold: true, color: palette.required } }
setColumnWidths(readme, [12, 28, 58, 12, 12, 12, 12, 12])

const company = workbook.worksheets.add('Dati azienda')
styleTitle(company, 'Dati azienda pilota', 'Foglio informativo: non viene importato automaticamente, ma serve per preparare bene il test.')
company.getRange('A4:D18').values = [
  ['Campo', 'Valore', 'Note', 'Stato'],
  ['Ragione sociale', '', 'Nome azienda pilota', 'Da compilare'],
  ['P.IVA', '', 'Facoltativa per test se non disponibile', 'Da compilare'],
  ['Sede principale', '', 'Citta/sede', 'Da compilare'],
  ['Referente pilota', '', 'Persona che coordina il test', 'Da compilare'],
  ['Email referente', '', 'Per inviti e supporto', 'Da compilare'],
  ['Telefono referente', '', 'Per supporto rapido', 'Da compilare'],
  ['Numero mezzi stimato', '', 'Camion, furgoni, motrici, trattori, semirimorchi', 'Da compilare'],
  ['Numero utenti stimato', '', 'Azienda, ufficio, autisti, magazzino', 'Da compilare'],
  ['Reparti coinvolti', '', 'Esempio: traffico, amministrazione, magazzino', 'Da compilare'],
  ['Periodo pilota', '', 'Esempio: 60 giorni', 'Da compilare'],
  ['Canale supporto', '', 'Email / telefono / WhatsApp temporaneo', 'Da compilare'],
  ['Obiettivo principale', '', 'Esempio: ridurre WhatsApp e scadenze dimenticate', 'Da compilare'],
  ['Decision maker finale', '', 'Chi decide se acquistare', 'Da compilare'],
  ['Note', '', '', ''],
]
styleHeader(company.getRange('A4:D4'))
company.getRange('A5:D18').format = {
  borders: { preset: 'inside', style: 'thin', color: palette.line },
  wrapText: true,
  verticalAlignment: 'top',
}
company.getRange('A5:A18').format = { font: { bold: true, color: palette.dark } }
setColumnWidths(company, [26, 34, 50, 18])

addTable(
  workbook.worksheets.add('Autisti'),
  0,
  ['Nome e cognome *', 'Username *', 'Password *', 'Telefono *', 'Ruolo', 'Deposito / sede', 'Documento iniziale', 'Scadenza documento', 'Numero documento', 'Visibile in app', 'Note'],
  [
    ['Mario Rossi', 'mario.rossi', 'Vygo2026!', '+39 333 111 1111', 'Autista bilico', 'Verona', 'Patente C+E', '2027-05-31', 'PCE12345', 'si', 'Riga esempio: puoi cancellarla'],
    ['Anna Verdi', 'anna.verdi', 'Vygo2026!', '+39 333 222 2222', 'Autista furgone', 'Milano', 'CQC', '2027-11-30', 'CQC9988', 'si', ''],
  ],
  [24, 18, 16, 18, 20, 18, 22, 18, 20, 16, 34],
  {
    dateColumns: ['H'],
    requiredColumns: [0, 1, 2, 3],
    reserveRows: 120,
    tableName: 'PilotaAutisti',
    textColumns: ['B', 'C', 'D', 'I', 'J'],
    validations: { J: ['si', 'no'] },
  },
)

addTable(
  workbook.worksheets.add('Persone'),
  0,
  ['Nome e cognome *', 'Username *', 'Password *', 'Telefono', 'Email', 'Reparto', 'Ruolo', 'Mansione', 'Deposito / sede', 'Note'],
  [
    ['Paola Bianchi', 'paola.bianchi', 'Vygo2026!', '+39 333 444 4444', 'paola.bianchi@azienda.it', 'ufficio', 'Impiegato ufficio', 'Ufficio traffico', 'Sede centrale', 'Riga esempio: puoi cancellarla'],
    ['Luca Neri', 'luca.neri', 'Vygo2026!', '+39 333 555 5555', 'luca.neri@azienda.it', 'magazzino', 'Carrellista', 'Capo turno magazzino', 'Magazzino A', ''],
  ],
  [24, 18, 16, 18, 28, 16, 20, 24, 18, 34],
  {
    requiredColumns: [0, 1, 2],
    reserveRows: 80,
    tableName: 'PilotaPersone',
    textColumns: ['B', 'C', 'D'],
    validations: {
      F: ['ufficio', 'magazzino'],
      G: ['Impiegato ufficio', 'Manager', 'Magazziniere', 'Carrellista'],
    },
  },
)

addTable(
  workbook.worksheets.add('Mezzi'),
  0,
  ['Targa *', 'Categoria mezzo', 'Modello', 'Allestimento', 'KM', 'Deposito / sede', 'Note'],
  [
    ['AB123CD', 'trattore', 'Volvo FH', 'Trattore stradale', 340000, 'Verona', 'Riga esempio: puoi cancellarla'],
    ['SR456EF', 'semirimorchio', 'Krone', 'Centinato', 0, 'Verona', ''],
    ['FG789HI', 'furgone', 'Iveco Daily', 'Furgone cassonato', 82000, 'Milano', ''],
  ],
  [16, 22, 24, 24, 12, 18, 34],
  {
    requiredColumns: [0],
    reserveRows: 160,
    tableName: 'PilotaMezzi',
    textColumns: ['A'],
    validations: { B: ['furgone', 'motrice', 'trattore', 'semirimorchio'] },
  },
)
workbook.worksheets.getItem('Mezzi').getRange('E2:E200').format.numberFormat = '#,##0'

addTable(
  workbook.worksheets.add('Attrezzature'),
  0,
  ['Codice *', 'Tipo attrezzatura', 'Modello', 'Matricola', 'Deposito / sede', 'Note'],
  [
    ['MUL-01', 'muletto', 'Toyota 8FB', 'MAT-987', 'Magazzino A', 'Riga esempio: puoi cancellarla'],
    ['TP-02', 'transpallet', 'BT Levio', 'TP-445', 'Magazzino A', ''],
  ],
  [16, 22, 24, 18, 20, 34],
  {
    requiredColumns: [0],
    reserveRows: 80,
    tableName: 'PilotaAttrezzature',
    textColumns: ['A', 'D'],
    validations: { B: ['muletto', 'transpallet', 'attrezzatura', 'altro'] },
  },
)

addTable(
  workbook.worksheets.add('Documenti autisti'),
  0,
  ['Username autista *', 'Documento *', 'Scadenza documento *', 'Numero documento', 'Visibile in app', 'Responsabile', 'Note'],
  [
    ['mario.rossi', 'CQC', '2027-11-30', 'CQC9988', 'si', 'Ufficio personale', 'Riga esempio: puoi cancellarla'],
    ['anna.verdi', 'Visita medica', '2027-04-20', 'VM-ANNA', 'si', 'Ufficio personale', ''],
  ],
  [20, 24, 20, 20, 16, 24, 34],
  {
    dateColumns: ['C'],
    requiredColumns: [0, 1, 2],
    reserveRows: 180,
    tableName: 'PilotaDocumentiAutisti',
    textColumns: ['A', 'D', 'E'],
    validations: { E: ['si', 'no'] },
  },
)

addTable(
  workbook.worksheets.add('Scadenze'),
  0,
  ['Ambito scadenza *', 'Username o targa o codice *', 'Tipo scadenza *', 'Data scadenza *', 'Numero documento', 'Responsabile', 'Visibile in app', 'Note'],
  [
    ['mezzo', 'AB123CD', 'Revisione mezzo', '2026-12-15', 'REV-AB123CD', 'Ufficio flotta', 'no', 'Riga esempio: puoi cancellarla'],
    ['attrezzatura', 'MUL-01', 'Verifica sicurezza muletto', '2026-10-10', 'CHK-MUL01', 'Responsabile magazzino', 'no', ''],
    ['persona', 'luca.neri', 'Visita medica', '2027-02-01', 'VM-LUCA', 'Ufficio personale', 'si', ''],
    ['azienda', '', 'Polizza sede', '2027-01-31', 'POL-SEDE', 'Amministrazione', 'no', ''],
  ],
  [20, 28, 28, 18, 22, 24, 16, 36],
  {
    dateColumns: ['D'],
    requiredColumns: [0, 1, 2, 3],
    reserveRows: 220,
    tableName: 'PilotaScadenze',
    textColumns: ['B', 'E', 'G'],
    validations: {
      A: ['autista', 'persona', 'mezzo', 'attrezzatura', 'azienda'],
      G: ['si', 'no'],
    },
  },
)

const testPlan = workbook.worksheets.add('Piano test')
styleTitle(testPlan, 'Piano test pilota', 'Compila esito e note durante la prova. Questo foglio non viene importato in Vygo.')
addTable(
  testPlan,
  3,
  ['Area', 'Test', 'Responsabile', 'Data prevista', 'Esito', 'Note'],
  [
    ['Accessi', 'Login azienda da PC', 'Referente azienda', '2026-07-10', 'Da provare', ''],
    ['Accessi', 'Login app autista/personale', 'Referente azienda', '2026-07-10', 'Da provare', ''],
    ['Chat', 'Chat diretta azienda-persona', 'Referente azienda', '2026-07-11', 'Da provare', ''],
    ['Chat', 'Chat gruppo/reparto', 'Referente azienda', '2026-07-11', 'Da provare', ''],
    ['Documenti', 'Caricamento documento da app', 'Autista pilota', '2026-07-12', 'Da provare', ''],
    ['Scadenze', 'Rinnovo documento scaduto', 'Ufficio', '2026-07-12', 'Da provare', ''],
    ['Operativo', 'Check mattutino ok', 'Autista pilota', '2026-07-13', 'Da provare', ''],
    ['Operativo', 'Guasto con foto', 'Autista pilota', '2026-07-13', 'Da provare', ''],
    ['Costi', 'Archivia guasto con costo', 'Ufficio', '2026-07-14', 'Da provare', ''],
    ['Report', 'Export report CSV', 'Titolare', '2026-07-14', 'Da provare', ''],
  ],
  [18, 36, 22, 18, 18, 50],
  {
    dateColumns: ['D'],
    reserveRows: 80,
    tableName: 'PilotaPianoTest',
    validations: { E: ['Da provare', 'OK', 'Attenzione', 'Bloccante', 'Non applicabile'] },
  },
)

const feedback = workbook.worksheets.add('Feedback')
styleTitle(feedback, 'Registro feedback pilota', 'Ogni problema o idea va scritto qui: aiuta a decidere cosa correggere prima della vendita.')
addTable(
  feedback,
  3,
  ['Data', 'Segnalato da', 'Ruolo', 'Area', 'Priorità', 'Descrizione', 'Passi per riprodurre', 'Stato', 'Decisione'],
  [
    ['2026-07-10', 'Paola Bianchi', 'Ufficio', 'Chat', 'Media', 'Esempio: non trovo subito la chat con ultimo messaggio.', 'Aprire app > Chat > Lista chat', 'Aperto', 'Da valutare'],
    ['2026-07-11', 'Mario Rossi', 'Autista', 'Documenti', 'Alta', 'Esempio: documento caricato ma non lo vedo in Mostra.', 'App > Documenti > Mostra', 'Aperto', ''],
  ],
  [16, 22, 16, 18, 14, 42, 42, 16, 34],
  {
    dateColumns: ['A'],
    reserveRows: 160,
    tableName: 'PilotaFeedback',
    validations: {
      E: ['Bloccante', 'Alta', 'Media', 'Bassa', 'Idea futura'],
      H: ['Aperto', 'In lavorazione', 'Risolto', 'Rimandato', 'Scartato'],
    },
  },
)

const summary = workbook.worksheets.add('Riepilogo')
styleTitle(summary, 'Riepilogo kit pilota', 'Controllo veloce dei dati compilati e dello stato test.')
summary.getRange('A4:D13').values = [
  ['Voce', 'Valore', 'Obiettivo minimo', 'Nota'],
  ['Autisti compilati', '', '2', 'Conta le righe del foglio Autisti'],
  ['Persone compilate', '', '2', 'Conta ufficio/magazzino'],
  ['Mezzi compilati', '', '5', 'Conta targhe flotta'],
  ['Attrezzature compilate', '', '1', 'Conta muletti/strumenti'],
  ['Documenti autisti', '', '5', 'Documenti iniziali'],
  ['Scadenze', '', '10', 'Scadenze operative'],
  ['Test OK', '', '8', 'Dal foglio Piano test'],
  ['Feedback aperti', '', '0', 'Dal foglio Feedback'],
  ['Bloccanti aperti', '', '0', 'Devono essere zero prima di allargare'],
]
styleHeader(summary.getRange('A4:D4'))
summary.getRange('B5:B13').formulas = [
  ['=MAX(COUNTA(Autisti!A2:A121)-2,0)'],
  ['=MAX(COUNTA(Persone!A2:A81)-2,0)'],
  ['=MAX(COUNTA(Mezzi!A2:A161)-3,0)'],
  ['=MAX(COUNTA(Attrezzature!A2:A81)-2,0)'],
  ["=MAX(COUNTA('Documenti autisti'!A2:A181)-2,0)"],
  ['=MAX(COUNTA(Scadenze!A2:A221)-4,0)'],
  ["=COUNTIF('Piano test'!E5:E84,\"OK\")"],
  ['=COUNTIF(Feedback!H5:H164,"Aperto")+COUNTIF(Feedback!H5:H164,"In lavorazione")'],
  ['=COUNTIFS(Feedback!E5:E164,"Bloccante",Feedback!H5:H164,"<>Risolto")'],
]
summary.getRange('A5:D13').format = {
  borders: { preset: 'inside', style: 'thin', color: palette.line },
  wrapText: true,
  verticalAlignment: 'top',
}
summary.getRange('B5:C13').format = { horizontalAlignment: 'center', font: { bold: true, color: palette.dark } }
summary.getRange('A5:A13').format = { font: { bold: true, color: palette.dark } }
addNoteBlock(
  summary,
  summary.getRange('A15:D18'),
  'Come leggere il riepilogo',
  'I conteggi non includono le righe esempio. Se lasci esempi o cancelli righe, controlla comunque l anteprima in Vygo prima di importare.',
  palette.cyanSoft,
)
setColumnWidths(summary, [28, 16, 18, 54])

for (const sheetName of ['LEGGIMI', 'Dati azienda', 'Autisti', 'Persone', 'Mezzi', 'Attrezzature', 'Documenti autisti', 'Scadenze', 'Piano test', 'Feedback', 'Riepilogo']) {
  const preview = await workbook.render({ sheetName, autoCrop: 'all', scale: 1, format: 'png' })
  await fs.writeFile(`${previewDir}/${sheetName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`, new Uint8Array(await preview.arrayBuffer()))
}

const output = await SpreadsheetFile.exportXlsx(workbook)
const outputPath = path.join(outputDir, 'vygo-kit-pilota-onboarding.xlsx')
await output.save(outputPath)

console.log(outputPath)
