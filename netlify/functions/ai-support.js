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
Sei Assistente Camion Chiaro, supporto operativo per aziende di logistica.
Rispondi nella stessa lingua dell utente, con tono semplice, pratico e rassicurante.
Aiuta l utente a usare Camion Chiaro passo per passo: dashboard, scadenze, documenti, guasti, check mattutini, chat, notifiche, anagrafiche, flotta, costi e app mobile.
Non dire mai di poter modificare direttamente i dati se non hai uno strumento per farlo. Guida l utente su dove cliccare.
Se la domanda riguarda norme, lavoro, privacy, fiscalita o sicurezza, dai indicazioni operative generali e consiglia verifica con consulente o assistenza Camion Chiaro.
Se non sei sicuro, fai una sola domanda chiara oppure indirizza al centro supporto Camion Chiaro.
Rispondi con massimo 6 punti brevi, senza linguaggio tecnico.

Contesto attuale:
${contextLines}
`.trim()
}

function buildGuidedAnswer(message) {
  const text = message.toLowerCase()

  if (/(scad|patent|document|visita|assicur|revision|rinnov)/i.test(text)) {
    return [
      'Certo. Per gestire una scadenza apri Scadenze dalla dashboard.',
      '1. Clicca sulla scadenza interessata.',
      '2. Scegli rinnova se hai il nuovo documento o la nuova data.',
      '3. Carica il file o la foto, inserisci la nuova scadenza e salva.',
      '4. Se deve pensarci l autista o un dipendente, usa sollecito: ricevera una notifica e un messaggio guidato.',
      'Quando il rinnovo e salvato, la criticita sparisce dalla home e resta nello storico.',
    ].join('\n')
  }

  if (/(guast|ripar|costo|manutenz|dann|officina)/i.test(text)) {
    return [
      'Per un guasto entra nel Registro operativo o in Guasti aperti.',
      '1. Apri la segnalazione per vedere mezzo, foto, note e autore.',
      '2. Se la riparazione e conclusa, inserisci il costo e archivia con costo.',
      '3. Il costo finisce nel centro costi e potrai filtrarlo per targa, periodo o tipo mezzo.',
      '4. Se manca qualcosa, lascia il guasto aperto o scrivi in chat alla persona che lo ha segnalato.',
    ].join('\n')
  }

  if (/(chat|messagg|notific|campan|grupp|repart)/i.test(text)) {
    return [
      'Per chat e notifiche controlla questi passaggi.',
      '1. Apri Chat dalla barra laterale o dall icona in basso su app.',
      '2. Le chat singole e i gruppi mostrano il numero rosso solo quando ci sono messaggi da leggere.',
      '3. Se non arrivano notifiche, vai in Impostazioni e premi attiva notifiche sul telefono interessato.',
      '4. Nei gruppi ogni messaggio deve mostrare chi ha scritto, con ruolo e foto profilo quando disponibile.',
    ].join('\n')
  }

  if (/(autist|persona|magazz|ufficio|account|login|access)/i.test(text)) {
    return [
      'Per creare o gestire utenti vai in Anagrafiche.',
      '1. Scegli persone, autisti, ufficio o magazzino.',
      '2. Apri aggiungi e compila i campi obbligatori.',
      '3. Salva: Camion Chiaro crea le credenziali da consegnare alla persona.',
      '4. Se devi cambiare dati o foto, apri la scheda della persona e usa modifica.',
    ].join('\n')
  }

  if (/(app|install|iphone|android|telefono|scaric)/i.test(text)) {
    return [
      'Per usare Camion Chiaro da telefono installa l app o apri la web app.',
      'Su iPhone, se stai testando la build interna, apri il link Expo/EAS e installa la versione autorizzata sul dispositivo.',
      'Su Android puoi installare l APK di test dal link EAS oppure la versione store quando sara pubblicata.',
      'Dopo il primo accesso apri Impostazioni e attiva notifiche, microfono e fotocamera quando richiesto.',
    ].join('\n')
  }

  return [
    'Dimmi pure cosa stai cercando di fare: ti guido passo passo dentro Camion Chiaro.',
    'Posso aiutarti con scadenze, documenti, guasti, check, chat, notifiche, anagrafiche, flotta e costi.',
    'Se vuoi essere velocissimo, scrivi una frase tipo: "devo rinnovare una patente", "non arriva una notifica" oppure "voglio chiudere un guasto con costo".',
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
  if (!apiKey) {
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
