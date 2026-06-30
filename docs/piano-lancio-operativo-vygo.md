# Vygo - Piano lancio operativo

Questo documento serve come bussola interna: cosa vendiamo, a chi, cosa va completato prima del lancio e quali idee tenere per fare diventare Vygo un prodotto indispensabile per aziende di trasporto e logistica.

Il punto chiave: non dobbiamo vendere "un software". Dobbiamo vendere una vita aziendale piu ordinata. Il cliente deve sentire che comprando Vygo smette di rincorrere documenti, foto, telefonate, scadenze e responsabilita sparse.

## Posizionamento

Vygo non deve sembrare una semplice agenda scadenze. Deve essere il pannello operativo leggero dell azienda di trasporto:

- scadenze documentali sempre sotto controllo;
- autisti collegati in app con chat, documenti e notifiche;
- check mattutini e guasti tracciati;
- archivio documentale pronto in caso di controllo;
- flotta ordinata tra furgoni, motrici, trattori e semirimorchi.
- costi di guasti e riparazioni finalmente visibili.

Messaggio commerciale principale:

"Apri una sola schermata e capisci subito cosa manca, cosa scade, cosa e urgente e dove stai spendendo soldi."

Messaggi secondari:

- "Basta cercare documenti tra WhatsApp, telefono, ufficio e camion."
- "Ogni guasto diventa una segnalazione chiara, non una foto persa in chat."
- "Ogni autista ha sul telefono quello che gli serve, senza chiamare per tutto."
- "Il titolare vede la flotta anche quando non e in ufficio."
- "Sai cosa richiede attenzione prima che diventi un problema."

## Trasformazione promessa al cliente

Prima di Vygo:
- documenti sparsi;
- scadenze ricordate a memoria;
- telefonate continue;
- foto di guasti in chat;
- nessuno storico ordinato;
- costi mezzi difficili da leggere;
- ufficio che rincorre autisti e documenti.

Dopo Vygo:
- dashboard con priorita chiare;
- app per autisti e personale;
- notifiche quando serve;
- documenti collegati a persone e mezzi;
- guasti archiviati con foto e costo;
- chat operative piu ordinate;
- storico consultabile;
- centro costi per vedere dove vanno i soldi.

## Clienti ideali

1. Piccole aziende con 3-10 utenti operativi
   - Hanno ancora molti documenti su WhatsApp, carta, foto sparse.
   - Comprano se capiscono che evita multe e dimenticanze.
   - Messaggio forte: "Ti metti in ordine senza comprare un gestionale complicato."
   - Piano consigliato: Start 5 o Fleet 10.

2. Aziende medie con 10-40 autisti
   - Hanno piu persone in ufficio e piu confusione tra mezzi, scadenze e guasti.
   - Comprano se vedono chat, notifiche, archivio e storico.
   - Messaggio forte: "Il tuo ufficio smette di rincorrere informazioni."
   - Piano consigliato: Fleet 10 o Fleet 20.

3. Flotte strutturate con responsabile operativo
   - Vogliono storico, ruoli, report, fatture, dati e controllo.
   - Comprano se c e affidabilita e supporto.
   - Messaggio forte: "Trasformi operativita e costi in dati leggibili."
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

La vendita non deve essere impostata come "costa X al mese". Deve essere impostata cosi:

- quanto costa un fermo mezzo?
- quanto costa una scadenza dimenticata?
- quanto tempo perde l ufficio a cercare documenti?
- quante telefonate inutili arrivano ogni settimana?
- quanto spendi in riparazioni senza avere un report chiaro per targa?

Vygo deve sembrare piccolo rispetto al costo del disordine.

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
- testi email personalizzati Vygo;
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

"In 10 minuti sai chi ha documenti mancanti, quale mezzo ha problemi, quali scadenze rischiano di farti perdere soldi e quanto hai speso sui guasti del mese."

Promessa emotiva:

"La mattina apri Vygo e non devi chiedere a tutti cosa manca: lo vedi."

Promessa per il titolare:

"Anche se sei fuori ufficio, sai cosa succede nella tua azienda."

Promessa per l ufficio:

"Meno telefonate, meno fogli, meno documenti persi, piu ordine."

Promessa per l autista:

"Hai documenti, chat, check e segnalazioni nello stesso telefono."

Demo commerciale:

1. Mostrare dashboard azienda.
2. Far vedere in alto: check critici, guasti aperti, scadenze e costi mese.
3. Aprire scadenze critiche.
4. Mostrare rinnovo o sollecito.
5. Entrare in app autista.
6. Fare check mattutino con anomalia.
7. Mostrare notifica in azienda.
8. Segnalare guasto con foto.
9. Inserire costo riparazione.
10. Aprire Centro costi.
11. Aprire chat e documento autista.
12. Chiudere con piani, start-up kit e attivazione.

Obiezioni prevedibili:

- "Uso gia WhatsApp": WhatsApp serve per parlare, non per gestire. Non collega scadenze, documenti, guasti, costi e storico aziendale.
- "Costa troppo": costa di piu lavorare senza vedere cosa manca. Una scadenza dimenticata, un fermo mezzo o ore perse in ufficio possono valere molto piu del canone.
- "Gli autisti non lo useranno": l app deve essere semplice: apri, leggi, fai check, carichi foto, segnali guasto.
- "Non ho tempo di caricare tutto": lo start-up kit esiste proprio per questo. Il cliente compra anche ordine iniziale.
- "Ho gia un gestionale": Vygo non deve sostituirlo per forza. Puo diventare il livello operativo quotidiano per notifiche, documenti, guasti, check e chat.

## Frasi vendita pronte

- "Non ti vendo un altro programma da controllare. Ti vendo un posto unico dove vedere cosa richiede attenzione."
- "Se oggi una scadenza la ricordate solo perche qualcuno se la segna, prima o poi qualcosa scappa."
- "Un guasto mandato su WhatsApp e una foto. Un guasto in Vygo diventa storico, costo e controllo."
- "L autista smette di chiamare per ogni cosa, perche ha documenti e chat nell app."
- "Il valore non e solo ricordare una data: e sapere cosa fare quando quella data si avvicina."
- "Quando l azienda cresce, il disordine cresce piu veloce. Vygo serve a non farselo scappare."

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
