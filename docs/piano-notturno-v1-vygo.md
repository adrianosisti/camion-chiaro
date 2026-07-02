# Vygo - Piano notturno V1

Documento operativo per non perdere il filo tra sviluppo, vendita e test reale.

## Obiettivo

Portare Vygo da "prodotto in costruzione" a "prima versione vendibile e testabile da una vera azienda".

Priorita assoluta:

1. pulizia totale dei testi visibili al cliente;
2. piani coerenti: Vygo completo per tutti, limiti solo su flotta/account/storage;
3. stabilita chat, notifiche, documenti, guasti, scadenze e report;
4. materiali commerciali chiari;
5. ambiente pilota pulito.

## Cosa e stato deciso

- Nome: Vygo.
- Dominio: `vy-go.com`.
- Piani: Start 5, Fleet 10, Fleet 20, Fleet 30, Fleet 50, Enterprise.
- Tutte le funzioni operative principali sono incluse in ogni piano.
- Si paga in base a dimensione azienda: mezzi, strumenti, account e spazio file.
- Extra V1: storage e start-up kit.
- Chiamate vocali live: preparate, ma non promesse finche non sono davvero da livello WhatsApp.
- AI generativa: sospesa per ora; assistente guidato senza costi variabili.

## Dieci idee ad alto valore

### 1. Indice salute flotta

Ogni mezzo riceve un punteggio 0-100 basato su scadenze, guasti, check critici, costi e documenti mancanti.

Perche vende: il titolare capisce subito quali mezzi stanno diventando un problema.

### 2. Fascicolo mezzo stampabile

Una pagina A4 per targa con dati mezzo, scadenze, documenti, ultimi guasti, costi e note.

Perche vende: utile in ufficio, officina, controlli e trattative interne.

### 3. Budget per targa

L azienda imposta un budget mensile/annuale per mezzo. Vygo avvisa se una targa supera la soglia.

Perche vende: trasforma i costi in controllo, non solo archivio.

### 4. Classifica autisti per sanzioni

Report multe per autista, periodo, importo e targa.

Perche vende: aiuta a correggere comportamenti e capire dove si perdono soldi.

### 5. Foto prima/dopo riparazione

Guasto aperto con foto dell autista, chiusura con foto riparazione, costo e fornitore.

Perche vende: elimina discussioni e ricostruisce la storia del danno.

### 6. Officine e fornitori

Anagrafica officine, gommisti, assicurazioni e fornitori con totale speso.

Perche vende: l azienda vede a chi sta dando piu soldi e su quali mezzi.

### 7. Sollecito intelligente

Da una scadenza, l azienda preme "Sollecita" e Vygo invia push + messaggio in chat con testo gia pronto.

Perche vende: riduce telefonate e rincorse.

### 8. Import Excel guidato

Caricamento iniziale di autisti, mezzi e scadenze da file Excel.

Perche vende: abbassa la fatica del primo avvio.

### 9. Circolari aziendali

Messaggio ufficiale a tutti o a reparto, con lista di chi ha letto e chi no.

Perche vende: sostituisce comunicazioni disperse in chat generiche.

### 10. Report mensile del titolare

Email/PDF automatico con costi, multe, scadenze, guasti, check e criticita.

Perche vende: e il report che giustifica il canone alto. Da fare quando email professionale e PDF automatici sono pronti.

## Prima azienda pilota

Creare una azienda pulita con:

- 1 titolare;
- 1 impiegato traffico;
- 2 autisti;
- 1 magazziniere;
- 5 mezzi;
- 1 muletto;
- 15 scadenze reali;
- 5 documenti caricati;
- 10 chat;
- 2 guasti;
- 2 check ok;
- 1 check critico;
- 3 spese;
- 2 sanzioni.

La prova deve durare almeno 7 giorni.

## Criteri per dire "V1 vendibile"

- Il cliente non vede parole tecniche come SQL, Supabase, Netlify o demo.
- Ogni bottone principale apre qualcosa di utile.
- Ogni lista lunga scorre correttamente su web e app.
- Le notifiche chat indicano sempre dove leggere.
- Foto, video e audio funzionano tra azienda, autisti e persone.
- Le scadenze si rinnovano caricando nuovo documento e nuova data.
- I limiti piano bloccano con un messaggio chiaro.
- Report e CSV esportano dati coerenti coi filtri.
- Privacy e termini si leggono e si accettano.
- Admin vede clienti, ricavi stimati, costi e margine.

## Prossima mossa consigliata

Prima di aggiungere altre funzioni grandi:

1. collegare Stripe in test;
2. configurare email dominio;
3. fare ambiente pilota senza dati demo;
4. provare due telefoni e un PC per una settimana;
5. correggere solo bug bloccanti.

Poi si puo preparare il primo vero giro commerciale.
