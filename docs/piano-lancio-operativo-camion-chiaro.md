# Camion Chiaro - Piano lancio operativo

Questo documento serve come bussola interna: cosa vendiamo, a chi, cosa va completato prima del lancio e quali idee tenere per fare diventare Camion Chiaro un prodotto indispensabile per aziende di trasporto e logistica.

## Posizionamento

Camion Chiaro non deve sembrare una semplice agenda scadenze. Deve essere il pannello operativo leggero dell azienda di trasporto:

- scadenze documentali sempre sotto controllo;
- autisti collegati in app con chat, documenti e notifiche;
- check mattutini e guasti tracciati;
- archivio documentale pronto in caso di controllo;
- flotta ordinata tra furgoni, motrici, trattori e semirimorchi.

Messaggio commerciale principale:

"La tua azienda vede subito cosa manca, cosa scade e cosa succede sui mezzi, mentre gli autisti hanno tutto sul telefono."

## Clienti ideali

1. Piccole aziende con 3-10 autisti
   - Hanno ancora molti documenti su WhatsApp, carta, foto sparse.
   - Comprano se capiscono che evita multe e dimenticanze.
   - Piano consigliato: Starter o Pro.

2. Aziende medie con 10-40 autisti
   - Hanno piu persone in ufficio e piu confusione tra mezzi, scadenze e guasti.
   - Comprano se vedono chat, notifiche, archivio e storico.
   - Piano consigliato: Pro o Business.

3. Flotte strutturate con responsabile operativo
   - Vogliono storico, ruoli, report, fatture, dati e controllo.
   - Comprano se c e affidabilita e supporto.
   - Piano consigliato: Business o Enterprise.

## Piani consigliati

Starter - 49 euro/mese
- fino a 5 autisti;
- fino a 5 mezzi;
- 2 GB file;
- scadenze, documenti, notifiche base.

Pro - 99 euro/mese
- fino a 20 autisti;
- fino a 25 mezzi;
- 10 GB file;
- chat, check mattutini, guasti, notifiche push.

Business - 199 euro/mese
- fino a 60 autisti;
- fino a 80 mezzi;
- 50 GB file;
- storico avanzato, priorita supporto, report.

Enterprise - prezzo su misura
- limiti personalizzati;
- 200 GB file di partenza;
- onboarding, import dati, supporto dedicato.

Regola semplice: il prezzo deve salire con autisti, mezzi, spazio documentale e livello di supporto.

## Costi e margine da controllare

Costi principali:

- Supabase: database, auth, realtime, storage.
- Netlify: hosting, funzioni e deploy.
- Stripe: commissione su pagamento.
- Email SMTP: conferme account, recupero password, comunicazioni.
- Dominio, eventuali servizi futuri, assistenza clienti.

Policy file:

- comprimere immagini prima del caricamento;
- non permettere video all inizio;
- 10 MB massimo per documento;
- 8 MB massimo per foto guasto/chat dopo ottimizzazione;
- mostrare spazio usato in Impostazioni;
- avvisare quando il cliente si avvicina al limite;
- tenere piani con limiti chiari per evitare costi fuori controllo.

## Funzioni must-have prima del lancio

Gia presenti o quasi presenti:

- login azienda e autista;
- registrazione azienda;
- anagrafiche autisti;
- flotta con furgoni, motrici, trattori, semirimorchi;
- check mattutino con semirimorchio opzionale;
- segnalazione guasti con foto;
- chat azienda-autista;
- notifiche push;
- documenti autista visibili dal telefono;
- logo azienda e foto profilo;
- lingue principali;
- blocco licenza e preparazione Stripe;
- storico fatture;
- pannello spazio file.

Da completare prima di vendere seriamente:

- Stripe in produzione con webhook verificato;
- email professionali con SMTP e dominio;
- testi email personalizzati Camion Chiaro;
- pagina pubblica con piani chiari;
- termini, privacy, cookie e trattamento dati;
- procedura backup;
- import iniziale da Excel per autisti, mezzi e scadenze;
- controllo mobile Android/iPhone su piu schermi.

## Funzioni premium future

1. Importazione Excel guidata
   - Il cliente carica un file con autisti, mezzi e scadenze.
   - Noi riduciamo la fatica di onboarding.

2. Scadenze intelligenti
   - Suggerire documenti mancanti per autista o mezzo.
   - Evidenziare chi non ha patente, CQC, visita medica o carta tachigrafica.

3. Report mensile azienda
   - Numero guasti, check critici, scadenze risolte, documenti mancanti.
   - Utile per far percepire valore ogni mese.

4. News trasporto
   - Normative, blocchi traffico, scioperi, emergenze stradali.
   - Da fare solo se resta ordinata e non distrae dalla dashboard.

5. Ruoli aziendali
   - Titolare, amministrazione, officina, ufficio traffico.
   - Ogni ruolo vede solo quello che serve.

6. Checklist personalizzate
   - Ogni azienda crea il proprio check: frigo, sponda, adr, cisterna, documenti viaggio.

7. Tracciamento posizione
   - Da fare solo con app nativa o PWA molto solida.
   - Serve consenso chiaro, privacy e affidabilita alta.
   - Meglio rimandare finche non si puo fare bene.

## Come venderla

Promessa breve:

"In 10 minuti sai chi ha documenti mancanti, quale mezzo ha problemi e quali scadenze rischiano di farti perdere soldi."

Demo commerciale:

1. Mostrare dashboard azienda.
2. Aprire scadenze critiche.
3. Entrare in app autista.
4. Fare check mattutino con anomalia.
5. Mostrare notifica in azienda.
6. Segnalare guasto con foto.
7. Aprire chat e documento autista.
8. Chiudere con piani e attivazione.

Obiezioni prevedibili:

- "Uso gia WhatsApp": WhatsApp non archivia scadenze, non organizza guasti, non crea storico.
- "Costa troppo": una multa o una scadenza dimenticata costa piu di mesi di abbonamento.
- "Gli autisti non lo useranno": entrano con nome utente, fanno due tocchi, vedono documenti e chat.
- "Non ho tempo di caricare tutto": offrire import Excel o servizio onboarding.

## Priorita prossime

1. Finire Stripe e attivazione automatica piano.
2. Preparare SMTP e email brandizzate.
3. Migliorare import Excel.
4. Rifinire mobile Android.
5. Aggiungere alert spazio quasi pieno.
6. Preparare pagina prezzi pubblica.
7. Preparare privacy e condizioni.
8. Fare checklist test prima del primo cliente.

## Regola prodotto

Ogni nuova funzione deve rispondere a una di queste domande:

- evita una multa?
- fa risparmiare tempo all ufficio?
- aiuta l autista a lavorare meglio?
- crea storico utile per l azienda?
- aumenta il motivo per cui il cliente paga ogni mese?

Se la risposta e no, la funzione resta fuori.
