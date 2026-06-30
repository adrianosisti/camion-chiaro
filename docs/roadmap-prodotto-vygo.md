# Roadmap prodotto Vygo

## Obiettivo

Vygo deve diventare il centro operativo leggero per aziende di trasporto: scadenze, persone, mezzi, comunicazioni, controlli giornalieri e prove documentali sempre disponibili.

La regola e semplice: ogni funzione deve togliere un problema reale al titolare, all ufficio traffico, al magazzino o all autista.

## Prima versione vendibile

1. Login azienda e app nativa per autisti.
2. Flotta completa: furgoni, motrici, trattori, semirimorchi.
3. Scadenze documentali per autisti, mezzi, azienda, ufficio, magazzino e attrezzature.
4. Check mattutino autista agganciato al mezzo scelto.
5. Guasti con foto, severita e archivio.
6. Documenti autista da mostrare in strada.
7. Chat azienda-autista con foto, audio, video, reazioni, risposte e notifiche push.
8. Dashboard azienda con contatori cliccabili, archivio, notifiche e storico.
9. Gestione storage per azienda e limiti per piano.
10. Pagamenti Stripe con sblocco automatico azienda.

## Blocco persone, ufficio e magazzino

Priorita alta per differenziarci dai gestionali semplici.

1. Anagrafica persone separata da autisti:
   - ufficio
   - magazzino
   - autisti gia sincronizzati
2. Magazzino:
   - magazziniere
   - carrellista
   - patentino carrello
   - visita medica
   - formazione sicurezza
3. Attrezzature:
   - muletto
   - transpallet
   - altra attrezzatura
   - manutenzione programmata
   - check giornaliero muletto
4. Chat gruppi:
   - tutti gli autisti
   - magazzino
   - ufficio
   - tutta l azienda
   - letti/non letti per ogni persona

## Funzioni che fanno vendere

### Centro scadenze intelligente

Non solo una lista: deve dire cosa e urgente, chi se ne occupa, che documento manca e cosa fare.

Da aggiungere:
1. Vista calendario mensile.
2. Vista "prossimi 7 giorni".
3. Assegnazione responsabile.
4. Stato: da fare, in rinnovo, fatto, archiviato.
5. Allegati sempre visibili.
6. Storico rinnovi per ogni documento.
7. Esportazione PDF o Excel per audit.

### Check operativi

Autista:
1. Check pre-partenza.
2. Check fine giornata.
3. Foto contachilometri.
4. Firma digitale semplice.
5. Conferma semirimorchio agganciato.

Magazzino:
1. Check muletto.
2. Batteria/carica ok.
3. Forche ok.
4. Perdite o danni.
5. Segnalazione fermo attrezzatura.

### Notifiche serie

1. Push immediate per guasti critici.
2. Push per messaggi chat quando app chiusa.
3. Promemoria scadenze.
4. Notifica "check fatto" anche senza anomalie, con possibilita di disattivarla.
5. Notifica critica se check ha anomalie.
6. Centro notifiche con lette/non lette.

## Piani a pagamento

Ipotesi commerciale aggiornata:

1. Start 5 - 300 euro/mese
   - fino a 5 mezzi
   - fino a 3 strumenti o muletti
   - fino a 10 account
   - 10 GB file inclusi

2. Fleet 10 - 450 euro/mese
   - fino a 10 mezzi
   - fino a 5 strumenti o muletti
   - fino a 20 account
   - 20 GB file inclusi

3. Fleet 20+ - da 650 euro/mese
   - 20, 30 o 50 mezzi
   - ufficio, magazzino e reparti
   - report costi, storico e storage maggiore
   - account proporzionati alla flotta

4. Enterprise - prezzo su richiesta
   - multi sede
   - ruoli avanzati
   - storage e onboarding dedicati
   - audit
   - import massivo
   - assistenza prioritaria

## Cose da non fare troppo presto

1. GPS continuo e tracciamento tratte se non e perfetto.
2. Video promozionali AI se sembrano finti.
3. Troppe funzioni fiscali prima che Stripe e fatture siano solide.
4. Integrazioni esterne complesse prima di avere clienti veri.

## Prossimi passi consigliati

1. Pubblicare commit su GitHub e lasciare Netlify aggiornare il web.
2. Mandare EAS update preview per iOS e Android quando cambiano solo schermate JavaScript.
3. Rifare build native quando cambiano permessi, estensioni, notifiche o configurazioni app.
4. Provare da tre telefoni o ruoli:
   - azienda apre dashboard, chat, report e scadenze;
   - autista rinnova documento, fa check e segnala guasto;
   - magazzino apre gruppo reparto, controlla strumento e segnala anomalia.
5. Provare report:
   - inserire una spesa libera;
   - inserire una sanzione con autista e targa;
   - modificare ed eliminare una spesa;
   - filtrare per periodo, targa, autista e categoria;
   - scaricare CSV e stampare report.
6. Prima del rilascio commerciale:
   - Stripe e fatturazione;
   - email brandizzate;
   - privacy/termini validati;
   - backup/export dati;
   - onboarding cliente e start-up kit.
