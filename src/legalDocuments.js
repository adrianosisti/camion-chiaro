export const legalDocumentVersions = {
  contract: 'vygo-contratto-saas-b2b-2026-07-13',
  dpa: 'vygo-dpa-2026-07-03',
  marketing: 'vygo-marketing-2026-07-03',
  commercialOrder: 'vygo-ordine-commerciale-2026-07-13',
  privacy: 'vygo-privacy-2026-07-03',
  staffTerms: 'vygo-staff-terms-2026-07-03',
  terms: 'vygo-terms-2026-07-03',
}

const commonWarningIt =
  'Bozza operativa per fase pilota. Prima del rilascio commerciale va rivista da consulente legale/privacy, anche in base alla societa che eroghera Vygo, ai fornitori scelti e ai paesi serviti.'

export const legalDocumentsByLanguage = {
  it: {
    contract: {
      intro: `${commonWarningIt} Questo contratto descrive il rapporto SaaS tra Vygo e l azienda cliente. L ordine definitivo viene completato con piano, dati fiscali e pagamento nella fase di attivazione.`,
      sections: [
        { title: 'Parti e servizio', body: 'Vygo fornisce una piattaforma software per aziende di trasporto e logistica. L azienda cliente usa dashboard web, app mobile, documenti, scadenze, chat, check, guasti, report, centro costi, radar news, moduli aggiuntivi e funzioni disponibili secondo piano e configurazione.' },
        { title: 'Attivazione online', body: 'La registrazione crea l account azienda. Dopo il primo accesso l azienda sceglie il piano, compila i dati fiscali, conferma Termini, Privacy, nomina privacy e ordine commerciale. Vygo salva una busta contrattuale online con data, utente, azienda, piano, dati fiscali e versioni dei documenti accettati.' },
        { title: 'Piani, limiti e pagamenti', body: 'I piani possono variare per mezzi, attrezzature, utenti, spazio file e moduli. Il pagamento avviene tramite fornitore esterno, come Stripe, quando configurato. Mancato pagamento, pagamento fallito o piano scaduto possono limitare o sospendere le funzioni non coperte.' },
        { title: 'Durata e rinnovo', body: 'Il rapporto puo essere mensile o secondo durata indicata nell ordine commerciale. Eventuali contratti pluriennali, penali, disdette o condizioni speciali dovranno essere indicati nell ordine o in accordi separati firmati dalle parti.' },
        { title: 'Responsabilita dell azienda', body: 'L azienda deve inserire dati corretti, gestire utenti e permessi, informare il personale, verificare documenti e scadenze, controllare report e usare Vygo come supporto operativo, non come sostituto di consulenti, obblighi di legge o controlli professionali.' },
        { title: 'Dati, privacy e sicurezza', body: 'I dati vengono trattati secondo Informativa Privacy e nomina a responsabile del trattamento. Vygo applica misure ragionevoli di sicurezza, separazione per azienda, gestione ruoli, protezione file e log tecnici, ma nessun sistema informatico e privo di rischio.' },
        { title: 'Fase pilota e funzioni sperimentali', body: 'Durante pilota o test gratuiti alcune funzioni possono essere incomplete, modificate, nascoste o rimosse. La fase pilota serve a verificare valore, flussi, stabilita e configurazione con una azienda reale.' },
        { title: 'Prova e archivio', body: 'Le accettazioni online, gli eventi di attivazione, lo stato pagamento e le versioni dei documenti sono conservati in archivio Vygo per prova del rapporto, assistenza, amministrazione e tutela delle parti.' },
        { title: 'Recesso, sospensione ed export', body: 'Alla fine del rapporto l azienda puo chiedere esportazione ragionevole dei dati disponibili. Vygo puo sospendere accessi in caso di violazioni, rischi sicurezza, uso illecito, mancato pagamento o abuso del servizio.' },
        { title: 'Revisione legale', body: 'Questo testo e una base operativa. Prima del rilascio commerciale e della vendita continuativa dovra essere verificato da consulente legale/privacy e adattato alla societa che eroghera Vygo.' },
      ],
      title: 'Contratto SaaS e ordine online Vygo',
      version: legalDocumentVersions.contract,
    },
    dpa: {
      intro: `${commonWarningIt} Questa nomina disciplina il ruolo di Vygo come responsabile del trattamento per i dati gestiti per conto dell azienda cliente.`,
      sections: [
        { title: 'Ruoli privacy', body: 'L azienda cliente resta titolare del trattamento dei dati del proprio personale, dei propri mezzi e dei contenuti inseriti in Vygo. Vygo opera come fornitore tecnico e tratta tali dati per conto dell azienda, secondo le istruzioni ricevute e nei limiti necessari a erogare app, dashboard, chat, documenti, notifiche, scadenze, check, guasti, centro costi, report e assistenza.' },
        { title: 'Oggetto e durata', body: 'La nomina resta valida per tutta la durata del rapporto di servizio, inclusa la fase pilota gratuita o manualmente attivata. Se il rapporto termina, Vygo conserva, esporta o cancella i dati secondo le istruzioni dell azienda, le esigenze tecniche di sicurezza e gli obblighi di legge applicabili.' },
        { title: 'Categorie di dati e interessati', body: 'Possono essere trattati dati identificativi e di contatto di titolari, impiegati, autisti, magazzinieri e collaboratori; documenti professionali; scadenze; dati relativi a mezzi, attrezzature, check, guasti, costi e sanzioni; messaggi, allegati, foto, video, audio, metadati di chiamata e log tecnici.' },
        { title: 'Istruzioni dell azienda', body: 'Vygo tratta i dati solo per configurare e mantenere il servizio, fornire supporto, sicurezza, backup, notifiche e funzioni richieste dall azienda. L azienda e responsabile di indicare quali utenti abilitare, quali dati caricare e quali autorizzazioni interne applicare.' },
        { title: 'Riservatezza e sicurezza', body: 'Vygo limita l accesso ai dati a soggetti autorizzati, usa autenticazione, separazione dei dati per azienda, permessi applicativi, regole database, protezione dei file, log tecnici e misure ragionevoli di continuita operativa. Le password operative create dall azienda sono gestite per semplificare l accesso del personale e devono essere comunicate con attenzione.' },
        { title: 'Sub-responsabili e fornitori', body: 'Vygo puo usare fornitori tecnici per hosting, database, storage, notifiche push, email, pagamenti, monitoraggio, assistenza, comunicazioni live o altri moduli attivati. Tali fornitori trattano dati solo per finalita tecniche collegate al servizio. L elenco operativo andra mantenuto aggiornato prima del lancio commerciale.' },
        { title: 'Assistenza al titolare', body: 'Nei limiti tecnici del servizio, Vygo aiuta l azienda a gestire richieste di accesso, rettifica, esportazione, cancellazione, limitazione, incidenti di sicurezza, audit ragionevoli e valutazioni richieste dalla normativa.' },
        { title: 'Violazioni di dati', body: 'Se Vygo viene a conoscenza di un incidente che possa compromettere dati personali trattati per conto dell azienda, informa l azienda senza ingiustificato ritardo e fornisce le informazioni ragionevolmente disponibili per valutare gli adempimenti privacy.' },
        { title: 'Export, cancellazione e restituzione', body: 'Su richiesta, l azienda potra ottenere esportazioni ragionevoli dei dati disponibili. La cancellazione definitiva puo richiedere tempi tecnici per backup, log, sicurezza, obblighi fiscali o prova del rapporto contrattuale.' },
        { title: 'Responsabilita dell azienda', body: 'L azienda deve informare correttamente il proprio personale, definire regole interne su chat, documenti, controlli, scadenze e dispositivi, verificare la liceita dei dati caricati e non usare Vygo per sorveglianza occulta o finalita estranee al lavoro.' },
      ],
      title: 'Nomina a responsabile del trattamento',
      version: legalDocumentVersions.dpa,
    },
    privacy: {
      intro: `${commonWarningIt} L informativa spiega in modo chiaro quali dati possono essere trattati da Vygo durante uso web e app.`,
      sections: [
        { title: 'Chi tratta i dati', body: 'Per i dati inseriti dall azienda e dal personale, l azienda cliente agisce normalmente come titolare del trattamento. Vygo agisce come fornitore e responsabile del trattamento. Per dati di account, sicurezza, amministrazione del servizio, assistenza, marketing diretto Vygo e gestione commerciale, Vygo puo agire come titolare autonomo.' },
        { title: 'Dati trattati', body: 'Vygo puo trattare dati aziendali, profili utente, username, password operative impostate dall azienda, telefono, ruolo, sede, foto profilo, documenti, scadenze, check, guasti, foto, video, audio, allegati, chat, notifiche, costi, sanzioni, report, log tecnici, dispositivo, lingua, token push e dati necessari all assistenza.' },
        { title: 'Finalita', body: 'I dati servono a fornire dashboard e app, gestire scadenze e documenti, inviare notifiche, consentire chat e allegati, registrare check e guasti, costruire report e centro costi, proteggere il servizio, risolvere problemi tecnici, dare assistenza e migliorare il prodotto.' },
        { title: 'Base giuridica', body: 'Le basi possono includere esecuzione del contratto o di misure precontrattuali, legittimo interesse alla sicurezza e continuita del servizio, obblighi di legge, consenso per comunicazioni marketing facoltative e, per il personale, le basi individuate dall azienda datrice o committente.' },
        { title: 'Visibilita dei dati', body: 'I dati sono visibili agli utenti autorizzati della stessa azienda secondo ruolo e funzioni. L azienda puo accedere a chat e contenuti aziendali nei limiti dichiarati e delle proprie policy interne. Vygo non vende dati personali.' },
        { title: 'Chat, documenti e media', body: 'Chat, foto, video, audio e documenti sono strumenti di lavoro. Gli allegati devono essere pertinenti. Le chiamate vocali, se attivate in futuro, non vengono registrate automaticamente da Vygo; possono restare metadati come partecipanti, orari, durata, stato e riferimento alla chat.' },
        { title: 'Notifiche e dispositivi', body: 'Per inviare notifiche l app puo salvare token del dispositivo, ruolo account e preferenze. L utente puo gestire i permessi dal telefono. Se l utente cambia account sullo stesso dispositivo, Vygo prova ad aggiornare o rimuovere le sottoscrizioni collegate.' },
        { title: 'Conservazione', body: 'I dati restano per il tempo necessario al servizio, alla sicurezza, alla gestione contrattuale, agli obblighi amministrativi e allo storico operativo richiesto dall azienda. L azienda puo chiedere export o cancellazione secondo contratto e limiti tecnici.' },
        { title: 'Diritti', body: 'Gli interessati possono chiedere accesso, rettifica, cancellazione, limitazione, opposizione, portabilita ove applicabile e revoca dei consensi. Le richieste relative ai dati aziendali possono essere gestite tramite l azienda cliente; Vygo collabora nei limiti tecnici.' },
        { title: 'Fornitori e trasferimenti', body: 'Vygo puo usare fornitori per cloud, database, storage, email, notifiche, pagamenti, assistenza, monitoraggio e servizi futuri. Se dati sono trattati fuori dallo Spazio Economico Europeo, saranno valutate garanzie adeguate prima del rilascio commerciale.' },
        { title: 'Sicurezza e incidenti', body: 'Vygo usa misure tecniche e organizzative ragionevoli per proteggere dati e accessi. Nessun sistema e immune da rischio. In caso di incidente rilevante, Vygo attiva verifiche e comunicazioni secondo legge e ruolo privacy.' },
        { title: 'Aggiornamenti', body: 'Questa informativa puo cambiare quando Vygo introduce nuove funzioni, fornitori, paesi o modelli commerciali. Le nuove versioni possono richiedere una nuova accettazione in app.' },
      ],
      title: 'Informativa Privacy Vygo',
      version: legalDocumentVersions.privacy,
    },
    staffTerms: {
      intro: `${commonWarningIt} Queste regole valgono per autisti, ufficio, magazzino e personale che usa Vygo per conto dell azienda.`,
      sections: [
        { title: 'Account personale', body: 'Username e password sono personali. Non vanno condivisi con colleghi, terzi o persone non autorizzate. In caso di perdita del telefono, sospetto accesso non autorizzato o cambio ruolo, l utente deve avvisare subito l azienda.' },
        { title: 'Uso lavorativo', body: 'Vygo va usato per attivita aziendali: chat, documenti, scadenze, check, guasti, foto, video, audio, notifiche, report e comunicazioni operative. Non deve essere usato per contenuti personali, offensivi, illeciti o non pertinenti.' },
        { title: 'Chat e gruppi', body: 'I messaggi devono essere professionali, chiari e rispettosi. Le chat aziendali possono essere consultabili dall azienda secondo ruoli, gruppi e policy interne. Non usare Vygo per comunicazioni urgenti di emergenza medica o sicurezza stradale.' },
        { title: 'Documenti e allegati', body: 'I documenti caricati devono essere leggibili, aggiornati e pertinenti. L utente non deve caricare documenti falsi, dati di terzi non autorizzati o contenuti estranei al lavoro.' },
        { title: 'Check, guasti e segnalazioni', body: 'Check mattutini, anomalie, guasti e note operative devono essere veritieri. Foto e descrizioni aiutano l azienda a intervenire e a mantenere storico operativo.' },
        { title: 'Notifiche e permessi telefono', body: 'Le notifiche servono a ricevere avvisi di lavoro. L utente puo gestire i permessi del dispositivo, ma disattivarli puo ridurre la tempestivita delle comunicazioni aziendali.' },
        { title: 'Chiamate vocali', body: 'Se attivate in futuro, le chiamate vocali Vygo saranno strumenti di lavoro live. Vygo non registra automaticamente l audio, ma puo salvare storico tecnico della chiamata.' },
        { title: 'Responsabilita personale', body: 'Ogni utente deve usare Vygo con diligenza, rispettare le istruzioni aziendali, non aggirare permessi o limiti, non esportare dati non autorizzati e non danneggiare servizio o dispositivi.' },
        { title: 'Fine rapporto o cambio mansione', body: 'Se l utente lascia l azienda o cambia ruolo, l azienda puo modificare, sospendere o archiviare l accesso. Alcuni dati possono restare nello storico aziendale.' },
      ],
      title: 'Regole uso app personale',
      version: legalDocumentVersions.staffTerms,
    },
    terms: {
      intro: `${commonWarningIt} Questi termini regolano uso di Vygo da parte delle aziende di trasporto e logistica, inclusa fase pilota gratuita o attivata manualmente.`,
      sections: [
        { title: 'Oggetto del servizio', body: 'Vygo e una piattaforma SaaS per aziende di trasporto e logistica. Include dashboard web, app mobile, gestione persone e mezzi, documenti, scadenze, check, guasti, chat, allegati, notifiche, centro costi, report, import/export e funzioni future secondo disponibilita tecnica.' },
        { title: 'Fase pilota', body: 'Durante una prova pilota l azienda puo usare Vygo senza pagamento o con attivazione manuale. La pilota serve a testare funzioni, stabilita e flussi reali. Non costituisce promessa di disponibilita definitiva, livelli di servizio commerciali o obbligo di mantenere funzioni sperimentali.' },
        { title: 'Piani e limiti', body: 'Nel lancio commerciale i piani potranno variare per numero di mezzi, attrezzature, account utenti e spazio file. Le funzioni principali possono essere incluse in tutti i piani, mentre extra storage, moduli avanzati o servizi speciali potranno essere venduti separatamente.' },
        { title: 'Account e autorizzazioni', body: 'L azienda e responsabile di creare utenti, assegnare ruoli, gestire password, revocare accessi e verificare che solo persone autorizzate usino Vygo. Ogni utente deve usare credenziali corrette e dispositivo sicuro.' },
        { title: 'Dati inseriti dall azienda', body: 'L azienda garantisce che dati, documenti, foto, video, audio, chat, costi, sanzioni e informazioni caricate siano lecite, corrette, pertinenti e comunicabili a Vygo e agli utenti autorizzati.' },
        { title: 'Disponibilita e manutenzione', body: 'Vygo si impegna a mantenere il servizio operativo con mezzi ragionevoli. Possono verificarsi interruzioni, manutenzioni, aggiornamenti, errori, limiti di rete, problemi dei dispositivi o dei fornitori cloud, notifiche, store, database e servizi terzi.' },
        { title: 'Report e centro costi', body: 'Report, scadenze, radar, centro costi e statistiche sono strumenti di supporto operativo. Non sostituiscono consulenza fiscale, contabile, legale, sicurezza sul lavoro, manutenzione obbligatoria o verifiche professionali dell azienda.' },
        { title: 'Chat, allegati e chiamate', body: 'La chat e gli allegati sono strumenti aziendali. L azienda deve definire regole interne e informare il personale. Le chiamate vocali live, se attivate, richiedono permessi dispositivo e fornitori tecnici; non sono pensate per emergenze.' },
        { title: 'Pagamenti futuri', body: 'Quando saranno attivati pagamenti online, abbonamenti, upgrade, extra storage, fatture e carte potranno essere gestiti tramite fornitore di pagamento. Mancato pagamento o piano scaduto potra limitare o sospendere funzioni non incluse.' },
        { title: 'Proprieta intellettuale', body: 'Vygo, marchio, interfaccia, codice, loghi, documentazione, flussi e contenuti software restano di proprieta del fornitore Vygo o dei relativi aventi diritto. L azienda conserva la titolarita dei propri dati aziendali.' },
        { title: 'Sospensione e cessazione', body: 'Vygo puo sospendere accessi in caso di abuso, rischio sicurezza, violazione dei termini, uso illecito o mancato pagamento quando commerciale. Alla cessazione, l azienda puo chiedere export o cancellazione secondo procedure e limiti tecnici.' },
        { title: 'Limitazioni', body: 'Vygo non garantisce eliminazione di ogni errore umano, multa, scadenza dimenticata, guasto o problema operativo. Il valore del servizio dipende dalla correttezza dei dati inseriti, dall uso degli utenti e dalle verifiche aziendali.' },
      ],
      title: 'Termini e Condizioni SaaS',
      version: legalDocumentVersions.terms,
    },
  },
}

const translatedMeta = {
  de: {
    contract: ['SaaS-Vertrag und Online-Bestellung', 'Operativer Entwurf. Der endgueltige Auftrag wird mit Tarif, Firmendaten und Zahlung in der Aktivierung gespeichert.'],
    dpa: ['Auftragsverarbeitungsvertrag', 'Operativer Entwurf fuer die Pilotphase. Vygo verarbeitet Unternehmensdaten als technischer Dienstleister nach Weisung des Kunden.'],
    privacy: ['Vygo Datenschutzhinweise', 'Diese Hinweise erklaeren, welche Daten Vygo in Web-Dashboard und App verarbeitet.'],
    staffTerms: ['Nutzungsregeln fuer Personal', 'Regeln fuer Fahrer, Buero, Lager und alle Personen, die Vygo im Auftrag des Unternehmens nutzen.'],
    terms: ['SaaS-Nutzungsbedingungen', 'Bedingungen fuer die Nutzung von Vygo durch Transport- und Logistikunternehmen, einschliesslich Pilotphase.'],
  },
  en: {
    contract: ['SaaS Agreement and Online Order', 'Operational draft. The final order is stored during activation with plan, company details and payment flow.'],
    dpa: ['Data Processing Agreement', 'Operational draft for the pilot phase. Vygo processes customer company data as a technical provider under the customer company instructions.'],
    privacy: ['Vygo Privacy Notice', 'This notice explains which data Vygo may process in the web dashboard and mobile app.'],
    staffTerms: ['Staff App Rules', 'Rules for drivers, office, warehouse and staff using Vygo on behalf of the company.'],
    terms: ['SaaS Terms and Conditions', 'Terms for transport and logistics companies using Vygo, including free or manually enabled pilot use.'],
  },
  es: {
    contract: ['Contrato SaaS y pedido online', 'Borrador operativo. El pedido definitivo se guarda durante la activacion con plan, datos fiscales y pago.'],
    dpa: ['Encargo de tratamiento', 'Borrador operativo para fase piloto. Vygo trata datos de la empresa como proveedor tecnico siguiendo instrucciones del cliente.'],
    privacy: ['Politica de privacidad Vygo', 'Esta informacion explica que datos puede tratar Vygo en el panel web y la app movil.'],
    staffTerms: ['Reglas de uso para personal', 'Reglas para conductores, oficina, almacen y personal que usa Vygo por cuenta de la empresa.'],
    terms: ['Terminos y condiciones SaaS', 'Condiciones de uso de Vygo para empresas de transporte y logistica, incluida la fase piloto.'],
  },
  fr: {
    contract: ['Contrat SaaS et commande en ligne', 'Projet operationnel. La commande definitive est archivee pendant l activation avec plan, donnees entreprise et paiement.'],
    dpa: ['Accord de sous-traitance', 'Projet operationnel pour phase pilote. Vygo traite les donnees de l entreprise comme prestataire technique selon ses instructions.'],
    privacy: ['Notice de confidentialite Vygo', 'Cette notice explique les donnees que Vygo peut traiter dans le tableau de bord web et l application mobile.'],
    staffTerms: ['Regles d utilisation du personnel', 'Regles pour chauffeurs, bureau, entrepot et personnel utilisant Vygo pour l entreprise.'],
    terms: ['Conditions SaaS', 'Conditions d utilisation de Vygo pour entreprises de transport et logistique, y compris phase pilote.'],
  },
  pl: {
    contract: ['Umowa SaaS i zamowienie online', 'Projekt roboczy. Ostateczne zamowienie jest zapisywane podczas aktywacji z planem, danymi firmy i platnoscia.'],
    dpa: ['Umowa powierzenia przetwarzania', 'Projekt roboczy na etap pilotazowy. Vygo przetwarza dane firmy jako dostawca techniczny zgodnie z instrukcjami klienta.'],
    privacy: ['Informacja o prywatnosci Vygo', 'Informacja wyjasnia, jakie dane Vygo moze przetwarzac w panelu web i aplikacji mobilnej.'],
    staffTerms: ['Zasady korzystania dla personelu', 'Zasady dla kierowcow, biura, magazynu i osob uzywajacych Vygo w imieniu firmy.'],
    terms: ['Warunki SaaS', 'Warunki korzystania z Vygo przez firmy transportowe i logistyczne, w tym etap pilotazowy.'],
  },
  ro: {
    contract: ['Contract SaaS si comanda online', 'Proiect operational. Comanda finala este salvata la activare cu planul, datele companiei si plata.'],
    dpa: ['Acord de prelucrare a datelor', 'Proiect operational pentru faza pilot. Vygo prelucreaza datele companiei ca furnizor tehnic, conform instructiunilor clientului.'],
    privacy: ['Informare de confidentialitate Vygo', 'Aceasta informare explica datele pe care Vygo le poate prelucra in dashboard si aplicatia mobila.'],
    staffTerms: ['Reguli de utilizare pentru personal', 'Reguli pentru soferi, birou, depozit si personalul care foloseste Vygo pentru companie.'],
    terms: ['Termeni si conditii SaaS', 'Termeni pentru companiile de transport si logistica ce folosesc Vygo, inclusiv faza pilot.'],
  },
}

const translatedSectionTitles = {
  de: ['Rollen und Verantwortlichkeiten', 'Daten und Zwecke', 'Konten und Berechtigungen', 'Arbeitskommunikation', 'Dokumente, Fristen und Berichte', 'Sicherheit und Geraete', 'Aufbewahrung und Export', 'Anbieter und Uebermittlungen', 'Support und Aenderungen', 'Wichtiger Hinweis'],
  en: ['Roles and responsibilities', 'Data and purposes', 'Accounts and permissions', 'Work communications', 'Documents, deadlines and reports', 'Security and devices', 'Retention and export', 'Providers and transfers', 'Support and changes', 'Important notice'],
  es: ['Roles y responsabilidades', 'Datos y finalidades', 'Cuentas y permisos', 'Comunicaciones de trabajo', 'Documentos, vencimientos e informes', 'Seguridad y dispositivos', 'Conservacion y exportacion', 'Proveedores y transferencias', 'Soporte y cambios', 'Aviso importante'],
  fr: ['Roles et responsabilites', 'Donnees et finalites', 'Comptes et autorisations', 'Communications de travail', 'Documents, echeances et rapports', 'Securite et appareils', 'Conservation et export', 'Prestataires et transferts', 'Support et changements', 'Avertissement important'],
  pl: ['Role i odpowiedzialnosc', 'Dane i cele', 'Konta i uprawnienia', 'Komunikacja sluzbowa', 'Dokumenty, terminy i raporty', 'Bezpieczenstwo i urzadzenia', 'Przechowywanie i eksport', 'Dostawcy i transfery', 'Wsparcie i zmiany', 'Wazna uwaga'],
  ro: ['Roluri si responsabilitati', 'Date si scopuri', 'Conturi si permisiuni', 'Comunicari de lucru', 'Documente, termene si rapoarte', 'Securitate si dispozitive', 'Pastrare si export', 'Furnizori si transferuri', 'Suport si modificari', 'Nota importanta'],
}

const translatedBodies = {
  de: [
    'Das Kundenunternehmen bleibt fuer die eigenen Mitarbeiter-, Fahrzeug- und Betriebsdaten verantwortlich. Vygo stellt die technische Plattform bereit und verarbeitet Daten nur zur Bereitstellung der vereinbarten Funktionen.',
    'Verarbeitet werden koennen Profile, Kontaktdaten, Rollen, Dokumente, Fristen, Checks, Schaeden, Kosten, Sanktionen, Chat-Nachrichten, Anhaenge, Fotos, Videos, Audio, Push-Token, Geraetedaten und technische Logs.',
    'Das Unternehmen erstellt Konten, vergibt Rollen, setzt Passwoerter, entzieht Zugriffe und informiert Personal ueber interne Regeln. Nutzer muessen ihre Zugangsdaten schuetzen.',
    'Chat, Gruppen, Dateien und kuenftige Live-Anrufe sind Arbeitsmittel. Inhalte muessen beruflich, korrekt und respektvoll sein. Sie ersetzen keine Notfall- oder Sicherheitskommunikation.',
    'Fristen, Dokumente, Radar, Kostenstelle und Berichte sind operative Hilfen. Sie ersetzen keine rechtliche, steuerliche, buchhalterische, arbeitsrechtliche oder sicherheitstechnische Pruefung.',
    'Vygo nutzt angemessene technische und organisatorische Massnahmen: Authentifizierung, Unternehmens-Trennung, Rollen, Datenbankregeln, Dateischutz, Protokolle und Sicherungen. Kein System ist risikofrei.',
    'Daten werden solange gespeichert, wie es fuer Dienst, Sicherheit, Vertrag, Nachweis und gesetzliche Pflichten erforderlich ist. Export oder Loeschung erfolgen nach Verfahren und technischen Grenzen.',
    'Vygo kann technische Anbieter fuer Hosting, Datenbank, Storage, Benachrichtigungen, E-Mail, Zahlungen, Support und Monitoring nutzen. Internationale Transfers werden vor dem kommerziellen Start geprueft.',
    'Dokumente koennen aktualisiert werden, wenn Funktionen, Anbieter, Laender oder Geschaeftsmodell wechseln. Neue Versionen koennen erneute Zustimmung verlangen.',
    'Diese Texte sind ein Pilot-Entwurf und muessen vor dem kommerziellen Start rechtlich geprueft werden.',
  ],
  en: [
    'The customer company remains responsible for its staff, fleet and operational data. Vygo provides the technical platform and processes data only to deliver the agreed features.',
    'Data may include profiles, contacts, roles, documents, deadlines, checks, faults, costs, fines, chat messages, attachments, photos, videos, audio, push tokens, device data and technical logs.',
    'The company creates accounts, assigns roles, sets passwords, revokes access and informs staff about internal rules. Users must protect their credentials.',
    'Chat, groups, files and future live calls are work tools. Content must be professional, accurate and respectful. They do not replace emergency or road-safety channels.',
    'Deadlines, documents, radar, cost center and reports are operational support tools. They do not replace legal, tax, accounting, employment, safety or maintenance checks.',
    'Vygo uses reasonable technical and organisational measures: authentication, company separation, roles, database rules, file protection, logs and backups. No system is risk-free.',
    'Data is kept for as long as needed for the service, security, contract evidence and legal obligations. Export or deletion follows agreed procedures and technical limits.',
    'Vygo may use technical providers for hosting, database, storage, notifications, email, payments, support and monitoring. International transfers will be assessed before commercial launch.',
    'Documents may be updated when features, providers, countries or business model change. New versions may require renewed acceptance.',
    'These texts are pilot drafts and must be reviewed legally before commercial launch.',
  ],
  es: [
    'La empresa cliente sigue siendo responsable de sus datos de personal, flota y operativa. Vygo presta la plataforma tecnica y trata datos solo para entregar las funciones acordadas.',
    'Los datos pueden incluir perfiles, contactos, roles, documentos, vencimientos, checks, averias, costes, multas, chats, adjuntos, fotos, videos, audio, tokens push, dispositivo y logs tecnicos.',
    'La empresa crea cuentas, asigna roles, define contrasenas, revoca accesos e informa al personal sobre reglas internas. Los usuarios deben proteger sus credenciales.',
    'Chat, grupos, archivos y futuras llamadas live son herramientas de trabajo. El contenido debe ser profesional, correcto y respetuoso. No sustituyen canales de emergencia o seguridad vial.',
    'Vencimientos, documentos, radar, centro de costes e informes son apoyo operativo. No sustituyen revision legal, fiscal, contable, laboral, de seguridad o mantenimiento.',
    'Vygo usa medidas razonables: autenticacion, separacion por empresa, roles, reglas de base de datos, proteccion de archivos, logs y copias. Ningun sistema esta libre de riesgo.',
    'Los datos se conservan mientras sean necesarios para servicio, seguridad, contrato y obligaciones legales. Exportacion o borrado siguen procedimientos y limites tecnicos.',
    'Vygo puede usar proveedores tecnicos para hosting, base de datos, almacenamiento, notificaciones, email, pagos, soporte y monitorizacion. Las transferencias internacionales se evaluaran antes del lanzamiento comercial.',
    'Los documentos pueden actualizarse si cambian funciones, proveedores, paises o modelo de negocio. Nuevas versiones pueden requerir nueva aceptacion.',
    'Estos textos son borradores para piloto y deben revisarse legalmente antes del lanzamiento comercial.',
  ],
  fr: [
    'L entreprise cliente reste responsable des donnees de son personnel, de sa flotte et de son exploitation. Vygo fournit la plateforme technique et traite les donnees seulement pour fournir les fonctions convenues.',
    'Les donnees peuvent inclure profils, contacts, roles, documents, echeances, checks, pannes, couts, amendes, chats, pieces jointes, photos, videos, audio, jetons push, appareil et logs techniques.',
    'L entreprise cree les comptes, attribue les roles, definit les mots de passe, retire les acces et informe le personnel des regles internes. Les utilisateurs protegent leurs identifiants.',
    'Chat, groupes, fichiers et futurs appels live sont des outils de travail. Les contenus doivent etre professionnels, exacts et respectueux. Ils ne remplacent pas les canaux d urgence ou de securite routiere.',
    'Echeances, documents, radar, centre de couts et rapports sont des aides operationnelles. Ils ne remplacent pas les controles juridiques, fiscaux, comptables, sociaux, securite ou maintenance.',
    'Vygo applique des mesures raisonnables: authentification, separation par entreprise, roles, regles base de donnees, protection fichiers, logs et sauvegardes. Aucun systeme n est sans risque.',
    'Les donnees sont conservees le temps necessaire au service, a la securite, au contrat et aux obligations legales. Export ou suppression suivent les procedures et limites techniques.',
    'Vygo peut utiliser des prestataires techniques pour cloud, base de donnees, stockage, notifications, email, paiements, support et monitoring. Les transferts internationaux seront evalues avant lancement commercial.',
    'Les documents peuvent changer avec les fonctions, prestataires, pays ou modele commercial. Une nouvelle version peut demander une nouvelle acceptation.',
    'Ces textes sont des projets pour pilote et doivent etre valides juridiquement avant lancement commercial.',
  ],
  pl: [
    'Firma klient pozostaje odpowiedzialna za dane personelu, floty i operacji. Vygo dostarcza platforme techniczna i przetwarza dane tylko w celu udostepnienia uzgodnionych funkcji.',
    'Dane moga obejmowac profile, kontakty, role, dokumenty, terminy, kontrole, awarie, koszty, mandaty, czaty, zalaczniki, zdjecia, wideo, audio, tokeny push, dane urzadzenia i logi.',
    'Firma tworzy konta, nadaje role, ustawia hasla, odbiera dostep i informuje personel o zasadach. Uzytkownicy musza chronic dane logowania.',
    'Czat, grupy, pliki i przyszle polaczenia live sa narzedziami pracy. Tresci musza byc zawodowe, poprawne i uprzejme. Nie zastepuja kanalow alarmowych ani bezpieczenstwa drogowego.',
    'Terminy, dokumenty, radar, centrum kosztow i raporty sa wsparciem operacyjnym. Nie zastepuja kontroli prawnej, podatkowej, ksiegowej, BHP, kadrowej ani serwisowej.',
    'Vygo stosuje rozsadne srodki: uwierzytelnianie, separacje firm, role, reguly bazy danych, ochrone plikow, logi i kopie. Zaden system nie jest wolny od ryzyka.',
    'Dane sa przechowywane tak dlugo, jak wymaga tego usluga, bezpieczenstwo, umowa i obowiazki prawne. Eksport lub usuniecie odbywa sie wedlug procedur i ograniczen technicznych.',
    'Vygo moze korzystac z dostawcow technicznych dla hostingu, bazy, storage, powiadomien, email, platnosci, wsparcia i monitoringu. Transfery poza EOG zostana ocenione przed startem komercyjnym.',
    'Dokumenty moga byc aktualizowane przy zmianie funkcji, dostawcow, krajow lub modelu biznesowego. Nowe wersje moga wymagac ponownej akceptacji.',
    'To sa wersje robocze na pilotaz i wymagaja oceny prawnej przed startem komercyjnym.',
  ],
  ro: [
    'Compania client ramane responsabila pentru datele personalului, flotei si operatiunilor. Vygo furnizeaza platforma tehnica si prelucreaza date doar pentru functiile convenite.',
    'Datele pot include profiluri, contacte, roluri, documente, scadente, verificari, defectiuni, costuri, amenzi, chat, atasamente, fotografii, video, audio, token push, dispozitiv si loguri tehnice.',
    'Compania creeaza conturi, aloca roluri, seteaza parole, retrage accesul si informeaza personalul despre regulile interne. Utilizatorii trebuie sa protejeze datele de acces.',
    'Chatul, grupurile, fisierele si viitoarele apeluri live sunt instrumente de lucru. Continutul trebuie sa fie profesional, corect si respectuos. Nu inlocuiesc canalele de urgenta sau siguranta rutiera.',
    'Scadentele, documentele, radarul, centrul de costuri si rapoartele sunt suport operational. Nu inlocuiesc verificarile juridice, fiscale, contabile, de munca, securitate sau mentenanta.',
    'Vygo foloseste masuri rezonabile: autentificare, separare pe companii, roluri, reguli baza de date, protectie fisiere, loguri si backup. Niciun sistem nu este fara risc.',
    'Datele sunt pastrate cat este necesar pentru serviciu, securitate, contract si obligatii legale. Exportul sau stergerea urmeaza proceduri si limite tehnice.',
    'Vygo poate folosi furnizori tehnici pentru hosting, baza de date, stocare, notificari, email, plati, suport si monitorizare. Transferurile internationale vor fi evaluate inainte de lansarea comerciala.',
    'Documentele pot fi actualizate cand se schimba functii, furnizori, tari sau modelul comercial. Versiunile noi pot cere acceptare noua.',
    'Aceste texte sunt proiecte pentru pilot si trebuie revizuite legal inainte de lansarea comerciala.',
  ],
}

for (const [language, documents] of Object.entries(translatedMeta)) {
  legalDocumentsByLanguage[language] = Object.fromEntries(
    Object.entries(documents).map(([documentId, [title, intro]]) => [
      documentId,
      {
        intro,
        sections: translatedSectionTitles[language].map((sectionTitle, index) => ({
          body: translatedBodies[language][index],
          title: sectionTitle,
        })),
        title,
        version: legalDocumentVersions[documentId],
      },
    ]),
  )
}

export function getLegalDocument(documentId, language = 'it') {
  const cleanLanguage = String(language || 'it').toLowerCase()
  return legalDocumentsByLanguage[cleanLanguage]?.[documentId] ?? legalDocumentsByLanguage.it[documentId] ?? null
}
