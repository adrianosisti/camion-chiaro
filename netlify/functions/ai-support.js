const jsonHeaders = {
  'Content-Type': 'application/json',
}

function jsonResponse(statusCode, body) {
  return {
    body: JSON.stringify(body),
    headers: jsonHeaders,
    statusCode,
  }
}

function cleanText(value, maxLength = 1200) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function normalizeHistory(history = []) {
  if (!Array.isArray(history)) return []

  return history
    .filter((message) => ['assistant', 'user'].includes(message?.role))
    .map((message) => ({
      content: cleanText(message.content, 900),
      role: message.role,
    }))
    .filter((message) => message.content)
    .slice(-8)
    .map((message) => ({
      content: [{ text: message.content, type: 'input_text' }],
      role: message.role,
      type: 'message',
    }))
}

function isAiSupportEnabled() {
  return process.env.OPENAI_SUPPORT_ENABLED === 'true'
}

const camionChiaroKnowledgeBase = `
Vygo e un software per aziende di logistica e trasporto.
Ruoli principali: azienda/titolare, autista, ufficio, magazzino.
Dashboard azienda: deve far vedere subito chat non lette, guasti aperti, check critici, scadenze, costi e comandi principali.
Anagrafiche: contiene persone, autisti, ufficio, magazzino, flotta, strumenti, documenti e scadenze.
Flotta: furgoni, motrici, trattori e semirimorchi. L autista sceglie il mezzo preso in giornata; se aggancia un semirimorchio puo indicarlo nel check o nella segnalazione.
Scadenze: patente, CQC, ADR, visite mediche, documenti persona, assicurazione, revisione, bollo, tachigrafo, libretti mezzo e documenti azienda.
Rinnovo scadenza: aprire il dettaglio, caricare nuovo file o foto, inserire nuova data con calendario, salvare. La criticita deve sparire e restare nello storico.
Sollecito: se una persona deve aggiornare un documento, l azienda puo inviare sollecito; la persona riceve notifica e messaggio guidato.
App autista: home, check mattutino, segnala guasto, chat, documenti da mostrare alla polizia, impostazioni.
Documenti autista: l autista puo caricare foto o file, aggiornarli, mostrarli dal telefono e rinnovare la scadenza.
Check mattutino: se tutto e ok va nello storico; se manca qualcosa diventa criticita azienda. L azienda lo apre, vede dettaglio e puo segnare risolto.
Guasti: autista o personale segnala con mezzo, descrizione, gravita, foto. L azienda apre dettaglio, lavora, archivia e puo inserire costo riparazione.
Centro costi: registra costi di guasti, manutenzioni, assicurazioni, revisioni e interventi su mezzi, strumenti e muletti; filtra per periodo, targa, asset e categoria.
Report e CSV: sezione dedicata per esportare o stampare dati filtrati. Permette dettaglio costi, solo multe/sanzioni e classifica multe autisti. I filtri principali sono periodo, targa/mezzo, autista, attrezzatura, azienda generale e tipologia.
Sanzioni: si inseriscono da Nuova sanzione o Centro costi scegliendo categoria Sanzione. Devono avere importo, data, autista responsabile e, quando disponibile, targa collegata. Se in classifica compare Non assegnate, significa che una multa non ha autista: usare Assegna per aprire la modifica e collegarlo.
Chat: dirette e gruppi/reparti. I messaggi mostrano nome, ruolo e foto di chi scrive. L azienda vede solo chat in cui e partecipante. Sono previsti audio, foto, video, reazioni, risposte e conferme lettura.
Notifiche: si attivano dalle impostazioni sul dispositivo. Devono avvisare per messaggi, guasti, check critici, scadenze e solleciti.
Magazzino: puo avere check muletti/strumenti, documenti e visite mediche. Ufficio puo usare chat, documenti e scadenze persona.
Piani commerciali: Start 5 300 euro/mese + IVA; Fleet 10 450 euro/mese + IVA; Fleet 20 650 euro/mese + IVA; Fleet 30 850 euro/mese + IVA; Fleet 50 1200 euro/mese + IVA; Enterprise su preventivo. Chat aziendale completa +100 euro/mese + IVA. Centro costi Premium +150 euro/mese + IVA. Report direzionali avanzati +250 euro/mese + IVA. Start-up kit 1500 euro una tantum + IVA. Storage extra 20GB +49 euro/mese, 50GB +99 euro/mese, 100GB +179 euro/mese.
Progetti premium futuri: report mensile automatico via email, indice salute flotta, budget costi per targa, alert recidive guasti, classifica multe/autisti, osservatorio strada e normative, QR mezzo, check magazzino, profilo formazione autista, esportazioni PDF/CSV avanzate.
Regola supporto: dare sempre passi pratici. Se serve assistenza umana, raccogliere azienda, utente, sezione, cosa stava facendo, messaggio errore, dispositivo e priorita.
`.trim()

const supportPlaybooks = [
  {
    id: 'renew_deadline',
    keywords: ['scad', 'patent', 'cqc', 'adr', 'visita', 'medica', 'assicur', 'revision', 'rinnov', 'document'],
    title: 'rinnovo scadenze e documenti',
    response: [
      'Per rinnovare una scadenza in Vygo fai cosi:',
      '1. Apri Scadenze dalla dashboard o entra nella scheda della persona/mezzo da Anagrafiche.',
      '2. Clicca la scadenza: patente, visita, assicurazione, revisione o altro documento.',
      '3. Premi rinnova, carica il nuovo file o una foto leggibile, poi inserisci la nuova data con il calendario.',
      '4. Salva: la criticita sparisce dalla home e resta nello storico documentale.',
      '5. Se deve farlo l autista o un dipendente, usa sollecito: ricevera notifica e messaggio gia guidato.',
    ],
  },
  {
    id: 'driver_documents',
    keywords: ['polizia', 'mostrare', 'documenti autista', 'documento autista', 'caricare documento', 'fotocamera', 'galleria'],
    title: 'documenti autista da mostrare',
    response: [
      'Per i documenti da mostrare alla polizia:',
      '1. L autista apre Documenti nella sua app.',
      '2. Se manca un documento, usa aggiungi o cambia e carica foto/file da fotocamera o galleria.',
      '3. Inserisce numero documento e data di scadenza, poi salva.',
      '4. Quando preme mostra, il documento deve aprirsi grande sul telefono.',
      '5. L azienda puo vedere, aggiornare o sostituire lo stesso documento dalla scheda autista.',
    ],
  },
  {
    id: 'faults_costs',
    keywords: ['guast', 'ripar', 'costo', 'manutenz', 'dann', 'officina', 'spesa', 'fattura', 'muletto'],
    title: 'guasti, manutenzioni e costi',
    response: [
      'Per gestire un guasto con costo:',
      '1. Apri Guasti aperti o Registro operativo.',
      '2. Entra nel dettaglio per vedere chi ha segnalato, mezzo/strumento, foto, gravita e note.',
      '3. Se il lavoro e finito, inserisci importo, valuta, data intervento e una nota breve.',
      '4. Usa archivia con costo: il guasto sparisce dai lavori aperti e resta nello storico.',
      '5. Dal Centro costi filtri per targa, muletto, periodo o categoria e vedi quanto hai speso.',
    ],
  },
  {
    id: 'reports_exports',
    keywords: ['report', 'csv', 'excel', 'stampa', 'stampare', 'esporta', 'esportare', 'scarica', 'classifica', 'aprile', 'maggio', 'periodo'],
    title: 'report, CSV e stampa',
    response: [
      'Per generare un report preciso:',
      '1. Apri Report dalla dashboard o dal menu laterale.',
      '2. Scegli il tipo: dettaglio costi, solo multe/sanzioni oppure classifica multe autisti.',
      '3. Imposta il filtro: tutti, targa/mezzo, autista, attrezzatura o azienda generale.',
      '4. Scegli periodo: oggi, mese, anno, sempre oppure periodo personalizzato dal/al.',
      '5. Controlla l elenco a video: il CSV e la stampa devono contenere gli stessi dati filtrati.',
      '6. Usa Scarica CSV per Excel o Stampa/PDF per un report leggibile da consegnare.',
    ],
  },
  {
    id: 'fines_assignment',
    keywords: ['non assegnate', 'assegna', 'assegnare', 'responsabile', 'sanzione senza autista', 'multa senza autista'],
    title: 'multe non assegnate',
    response: [
      'Se nella classifica multe vedi Non assegnate:',
      '1. Vuol dire che una o piu sanzioni hanno importo e data, ma non hanno autista collegato.',
      '2. Premi Assegna accanto alla voce Non assegnate.',
      '3. Si apre la modifica della sanzione: scegli Autista responsabile e, se serve, Mezzo/targa collegata.',
      '4. Salva. La multa uscira da Non assegnate e rientrera nella classifica dell autista.',
      '5. Se il salvataggio non passa, verifica di aver eseguito lo SQL 42 sulle sanzioni autista+targa.',
    ],
  },
  {
    id: 'morning_check',
    keywords: ['check', 'mattut', 'controllo', 'anomalia', 'trattore', 'semirimorchio', 'mezzo preso'],
    title: 'check mattutino e anomalie',
    response: [
      'Per il check mattutino:',
      '1. L autista sceglie il mezzo che sta prendendo oggi.',
      '2. Se aggancia un semirimorchio, lo indica nel campo opzionale.',
      '3. Compila i controlli e invia.',
      '4. Se e tutto ok, l azienda lo trova nello storico operativo.',
      '5. Se c e un anomalia, la dashboard azienda la conta come criticita e apre il dettaglio con mezzo, autista e problema.',
    ],
  },
  {
    id: 'chat_notifications',
    keywords: ['chat', 'messagg', 'notific', 'campan', 'grupp', 'repart', 'spunte', 'letto', 'audio', 'foto', 'video'],
    title: 'chat, gruppi e notifiche',
    response: [
      'Per chat e notifiche:',
      '1. Apri Chat: trovi chat singole e gruppi/reparti separati.',
      '2. Le chat con messaggi non letti mostrano un numeretto rosso sulla lista e sull icona in basso.',
      '3. Dentro un gruppo ogni fumetto deve mostrare nome, ruolo e foto della persona che scrive.',
      '4. Se non arrivano notifiche, apri Impostazioni sul telefono e premi attiva notifiche.',
      '5. Per foto, audio, video o reazioni usa i comandi dentro la chat; le spunte indicano consegna e lettura.',
    ],
  },
  {
    id: 'push_troubleshooting',
    keywords: ['push', 'notifica telefono', 'notifiche non arrivano', 'non arriva', 'permesso', 'abilita notifiche'],
    title: 'notifiche telefono',
    response: [
      'Se le notifiche telefono non arrivano:',
      '1. Apri Impostazioni nell app Vygo sul telefono interessato.',
      '2. Premi Attiva notifiche o Verifica notifiche.',
      '3. Controlla che i permessi iOS/Android siano attivi per Vygo.',
      '4. Se e una chat, prova da app chiusa: con chat aperta alcune notifiche possono restare solo dentro l app.',
      '5. Se dice nessun telefono registrato, esci e rientra dall app sul telefono giusto, poi riattiva notifiche.',
    ],
  },
  {
    id: 'records_people',
    keywords: ['autist', 'persona', 'magazz', 'ufficio', 'account', 'login', 'credenzial', 'utente', 'dipendent'],
    title: 'anagrafiche persone e account',
    response: [
      'Per creare o modificare persone:',
      '1. Apri Anagrafiche.',
      '2. Scegli il tipo corretto: autista, ufficio o magazzino.',
      '3. Premi aggiungi, compila nome, telefono, ruolo/reparto e dati obbligatori.',
      '4. Salva e consegna le credenziali generate alla persona.',
      '5. Dalla scheda puoi cambiare foto, documenti, scadenze, stato e dati di contatto.',
    ],
  },
  {
    id: 'fleet_assets',
    keywords: ['flotta', 'mezzo', 'mezzi', 'furgone', 'motrice', 'trattore', 'semirimorchio', 'targa', 'libretto', 'tachigrafo'],
    title: 'flotta, mezzi e documenti mezzo',
    response: [
      'Per gestire la flotta:',
      '1. Vai in Anagrafiche e apri Flotta.',
      '2. Aggiungi furgone, motrice, trattore o semirimorchio con targa, modello e km.',
      '3. Nella scheda mezzo carica libretto, assicurazione, revisione e altre scadenze.',
      '4. Ogni scadenza entra nella dashboard e puo generare promemoria.',
      '5. Guasti e costi collegati a quella targa restano consultabili nello storico e nel Centro costi.',
    ],
  },
  {
    id: 'app_install',
    keywords: ['app', 'install', 'iphone', 'android', 'telefono', 'scaric', 'store', 'notifiche telefono'],
    title: 'app telefono e permessi',
    response: [
      'Per usare Vygo da telefono:',
      '1. Installa l app iOS o Android quando disponibile, oppure la build interna se siete in test.',
      '2. Accedi con il ruolo corretto: azienda, autista, ufficio o magazzino.',
      '3. Alla prima apertura abilita notifiche, fotocamera e microfono quando servono.',
      '4. Se una notifica non arriva, controlla Impostazioni app e permessi del telefono.',
      '5. L azienda puo usare anche il desktop web per lavorare piu comodamente in ufficio.',
    ],
  },
  {
    id: 'billing',
    keywords: ['prezz', 'piano', 'abbon', 'costa', 'pag', 'stripe', 'fattur', 'storage', 'gb', 'commercial'],
    title: 'piani, prezzi e fatturazione',
    response: [
      'I piani Vygo sono pensati per dimensione azienda:',
      '1. Start 5: 300 euro/mese, fino a 5 mezzi, 3 strumenti/muletti, 10 account e 10 GB.',
      '2. Fleet 10: 450 euro/mese, fino a 10 mezzi, 5 strumenti/muletti, 20 account e 20 GB.',
      '3. Fleet 20: 650 euro/mese, Fleet 30: 850 euro/mese, Fleet 50: 1200 euro/mese.',
      '4. Chat aziendale completa: +100 euro/mese. Centro costi Premium: +150 euro/mese. Report direzionali avanzati: +250 euro/mese.',
      '5. Start-up kit: 1500 euro una tantum. Storage extra: 20GB +49 euro/mese, 50GB +99 euro/mese, 100GB +179 euro/mese.',
    ],
  },
  {
    id: 'privacy_legal',
    keywords: ['privacy', 'contratto', 'termini', 'gdpr', 'legale', 'dipendenti', 'chat controllata', 'consenso'],
    title: 'privacy e condizioni',
    response: [
      'Per privacy e uso chat/documenti:',
      '1. Prima del rilascio servono Termini d uso e Privacy Policy approvati dal cliente.',
      '2. Ogni utente deve accettare condizioni chiare su chat, documenti, notifiche e trattamento dati aziendali.',
      '3. L azienda deve informare il personale su quali dati vengono gestiti e per quale finalita operativa.',
      '4. Vygo deve evitare promesse legali automatiche: per GDPR, lavoro e conservazione dati va validato con consulente.',
      '5. In caso di dubbio apri ticket assistenza e indica paese, ruolo utenti e tipo di dato trattato.',
    ],
  },
  {
    id: 'future_value',
    keywords: ['idea', 'idee', 'premium', 'valore', 'futuro', 'sviluppo', 'must', 'straordin', 'migliorare', 'funzione nuova'],
    title: 'idee premium e valore prodotto',
    response: [
      'Le funzioni piu forti per far percepire Vygo come indispensabile sono:',
      '1. Report mensile automatico: spese, multe, guasti, scadenze chiuse e pratiche aperte via email al titolare.',
      '2. Indice salute flotta: ogni mezzo ha un punteggio basato su guasti, costi, scadenze, fermi e check critici.',
      '3. Budget per targa: se un mezzo supera la soglia mensile di costi, parte un alert.',
      '4. Osservatorio trasporti: blocchi, divieti, meteo pesante, normative e valichi in una sezione operativa.',
      '5. Profilo formazione autista: non per punire, ma per capire chi ha bisogno di supporto su documenti, check o multe.',
    ],
  },
]

function getMatchedPlaybooks(message) {
  const normalizedMessage = message.toLowerCase()
  return supportPlaybooks.filter((playbook) =>
    playbook.keywords.some((keyword) => normalizedMessage.includes(keyword)),
  )
}

function buildSystemPrompt({ companyContext = {}, companyName = 'Azienda', language = 'it' }) {
  const contextLines = [
    `Azienda: ${cleanText(companyName, 120)}`,
    `Lingua interfaccia: ${cleanText(language, 20)}`,
    `Chat non lette: ${Number(companyContext.unreadChatCount || 0)}`,
    `Guasti aperti: ${Number(companyContext.openFaultCount || 0)}`,
    `Check critici: ${Number(companyContext.criticalCheckCount || 0)}`,
    `Scadenze prossimi 30 giorni: ${Number(companyContext.deadlineCount || 0)}`,
    `Autisti attivi: ${Number(companyContext.activeDriverCount || 0)}`,
    `Mezzi attivi: ${Number(companyContext.activeVehicleCount || 0)}`,
  ].join('\n')

  return `
Sei Assistente Vygo, supporto operativo per aziende di logistica.
Rispondi nella stessa lingua dell utente, con tono semplice, pratico e rassicurante.
Aiuta l utente a usare Vygo passo per passo: dashboard, scadenze, documenti, guasti, check mattutini, chat, notifiche, anagrafiche, flotta, costi e app mobile.
Non dire mai di poter modificare direttamente i dati se non hai uno strumento per farlo. Guida l utente su dove cliccare.
Se la domanda riguarda norme, lavoro, privacy, fiscalita o sicurezza, dai indicazioni operative generali e consiglia verifica con consulente o assistenza Vygo.
Se non sei sicuro, fai una sola domanda chiara oppure indirizza al centro supporto Vygo.
Rispondi con massimo 6 punti brevi, senza linguaggio tecnico.
Ogni risposta deve essere concreta: se l utente chiede come fare una cosa, indica sezione, pulsante/azione, risultato atteso e cosa controllare se non funziona.
Non limitarti a dire "apri la guida". Prima prova a risolvere.
Formato preferito:
- Dove andare: sezione o schermata precisa.
- Cosa fare: 2-4 passaggi.
- Risultato atteso: cosa deve cambiare nella dashboard/app.
- Se non funziona: una verifica pratica.
Se l utente segnala un errore o bug, chiedi solo il dato mancante piu utile: PC/app, ruolo, schermata, messaggio errore o dispositivo.

Manuale operativo Vygo:
${camionChiaroKnowledgeBase}

Contesto attuale:
${contextLines}
`.trim()
}

function buildGuidedAnswer(message) {
  const matchedPlaybooks = getMatchedPlaybooks(message)
  if (matchedPlaybooks.length) {
    const [primaryPlaybook] = matchedPlaybooks
    const answer = [...primaryPlaybook.response]
    answer.push('Se mi dici se sei da PC azienda o da app telefono, ti indico il percorso preciso sul tuo schermo.')
    return answer.join('\n')
  }

  return [
    'Ti guido io. Scrivi cosa vuoi fare con una frase pratica, ad esempio:',
    '- "devo rinnovare la patente di un autista"',
    '- "non arriva una notifica chat"',
    '- "voglio archiviare un guasto con costo"',
    '- "devo aggiungere un trattore con assicurazione e revisione"',
    'Appena capisco la sezione, ti do il percorso preciso dentro Vygo.',
  ].join('\n')
}

function extractOutputText(payload) {
  if (payload?.output_text) return cleanText(payload.output_text, 5000)

  const parts = []
  for (const outputItem of payload?.output || []) {
    for (const contentItem of outputItem?.content || []) {
      if (contentItem?.text) parts.push(contentItem.text)
    }
  }

  return cleanText(parts.join('\n'), 5000)
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Metodo non consentito.' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Richiesta non valida.' })
  }

  const message = cleanText(body.message, 1400)
  if (!message) {
    return jsonResponse(400, { error: 'Scrivi una domanda per l assistente.' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!isAiSupportEnabled() || !apiKey) {
    return jsonResponse(200, {
      mode: 'guided',
      reply: buildGuidedAnswer(message),
    })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      body: JSON.stringify({
        input: [
          {
            content: [{ text: buildSystemPrompt(body), type: 'input_text' }],
            role: 'developer',
            type: 'message',
          },
          ...normalizeHistory(body.history),
          {
            content: [{ text: message, type: 'input_text' }],
            role: 'user',
            type: 'message',
          },
        ],
        max_output_tokens: 700,
        model: process.env.OPENAI_SUPPORT_MODEL || 'gpt-5.2-mini',
        store: false,
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      console.error('OpenAI support error', payload)
      return jsonResponse(200, {
        mode: 'guided',
        reply: buildGuidedAnswer(message),
      })
    }

    const reply = extractOutputText(payload)
    return jsonResponse(200, {
      mode: 'ai',
      reply: reply || buildGuidedAnswer(message),
    })
  } catch (error) {
    console.error('AI support function failed', error)
    return jsonResponse(200, {
      mode: 'guided',
      reply: buildGuidedAnswer(message),
    })
  }
}
