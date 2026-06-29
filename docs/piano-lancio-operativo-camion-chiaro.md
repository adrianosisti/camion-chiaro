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

1. Piccole aziende con 3-10 utenti operativi
   - Hanno ancora molti documenti su WhatsApp, carta, foto sparse.
   - Comprano se capiscono che evita multe e dimenticanze.
   - Piano consigliato: Start 5 o Fleet 10.

2. Aziende medie con 10-40 autisti
   - Hanno piu persone in ufficio e piu confusione tra mezzi, scadenze e guasti.
   - Comprano se vedono chat, notifiche, archivio e storico.
   - Piano consigliato: Fleet 10 o Fleet 20.

3. Flotte strutturate con responsabile operativo
   - Vogliono storico, ruoli, report, fatture, dati e controllo.
   - Comprano se c e affidabilita e supporto.
   - Piano consigliato: Fleet 30, Fleet 50 o Enterprise.

## Piani consigliati

Start 5 - 300 euro/mese
- fino a 5 mezzi;
- fino a 3 strumenti o muletti;
- fino a 10 account utenti;
- 10 GB file inclusi.

Fleet 10 - 450 euro/mese
- fino a 10 mezzi;
- fino a 5 strumenti o muletti;
- fino a 20 account utenti;
- 20 GB file inclusi.

Fleet 20 - 650 euro/mese
- fino a 20 mezzi;
- fino a 10 strumenti o muletti;
- fino a 40 account utenti;
- 30 GB file inclusi.

Fleet 30 - 850 euro/mese
- fino a 30 mezzi;
- fino a 15 strumenti o muletti;
- fino a 60 account utenti;
- 50 GB file inclusi.

Fleet 50 - 1.200 euro/mese
- fino a 50 mezzi;
- fino a 25 strumenti o muletti;
- fino a 100 account utenti;
- 75 GB file inclusi.

Enterprise - prezzo su misura
- limiti personalizzati;
- storage personalizzato;
- onboarding, import dati, supporto dedicato.

Extra consigliati:
- chat aziendale completa: +100 euro/mese;
- start-up kit: 1.500 euro una tantum;
- storage 20 GB: +49 euro/mese;
- storage 50 GB: +99 euro/mese;
- storage 100 GB: +179 euro/mese.

Regola semplice: il prezzo deve salire con mezzi, strumenti, account utenti, spazio documentale, chat e livello di supporto.

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
- comprimere foto chat e guasti prima dell upload;
- far pagare storage extra prima che diventi costo nascosto;
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
- pannello spazio file;
- report costi guasti e riparazioni.

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

3. Report economico operativo
   - Costi guasti, manutenzioni, revisioni, assicurazioni, muletti e strumenti.
   - Filtri per periodo, targa, strumento, reparto e causale.
   - Utile per mostrare quali mezzi o strumenti consumano piu soldi.

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
