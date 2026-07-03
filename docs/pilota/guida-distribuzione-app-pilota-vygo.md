# Vygo - Guida distribuzione app per azienda pilota

Versione: 2026-07-03

Questa guida serve per distribuire Vygo a una azienda pilota prima della pubblicazione completa sugli store.

## Scelta consigliata

Per una pilota seria usare:

- iPhone: TestFlight;
- Android: Google Play Internal Testing o Closed Testing;
- web dashboard: dominio `https://vy-go.com`.

Evitare QR manuali per decine di persone, perché diventano difficili da gestire e aggiornare.

## iPhone - TestFlight

Serve:

- Apple Developer attivo;
- app caricata su App Store Connect;
- gruppo tester esterni o interni;
- email dei tester;
- descrizione beta chiara.

Procedura:

1. Caricare build iOS su App Store Connect.
2. Aprire sezione TestFlight.
3. Creare gruppo `Pilota - Nome Azienda`.
4. Inserire email tester.
5. Scrivere cosa devono provare.
6. Attendere eventuale review beta Apple per tester esterni.
7. Inviare invito TestFlight.
8. Il tester installa TestFlight da App Store.
9. Il tester apre invito e installa Vygo.

Messaggio breve da inviare agli utenti:

> Stiamo provando Vygo, la nuova app aziendale per chat, documenti, scadenze, check e guasti. Riceverai un invito TestFlight. Installa TestFlight, poi installa Vygo e accedi con username e password forniti dall'azienda.

## Android - Google Play testing

Serve:

- account Google Play Console;
- app caricata come test interno o chiuso;
- email Google dei tester.

Procedura:

1. Creare test interno o chiuso.
2. Aggiungere email tester.
3. Caricare build Android.
4. Pubblicare test.
5. Inviare link di opt-in.
6. Il tester accetta invito.
7. Il tester installa Vygo dal Play Store.

Messaggio breve da inviare agli utenti:

> Stiamo provando Vygo, la nuova app aziendale per chat, documenti, scadenze, check e guasti. Riceverai un link Google Play di test. Aprilo con il tuo account Google, accetta il test e installa Vygo.

## Web azienda

Il titolare e l'ufficio possono usare:

- PC: `https://vy-go.com`
- telefono: app Vygo oppure browser, se serve.

Per il pilota e meglio che almeno il referente aziendale usi principalmente il PC.

## Primo accesso utenti

Ogni persona riceve:

- username;
- password;
- ruolo;
- istruzioni su cosa provare.

Esempio messaggio:

> Ciao, per accedere a Vygo usa:
> Username: ____________________
> Password: ____________________
> Dopo il primo accesso accetta i documenti richiesti, attiva le notifiche e prova chat/documenti. Se qualcosa non funziona, avvisa il referente aziendale.

## Controlli subito dopo installazione

Per ogni telefono verificare:

- login riuscito;
- nome azienda corretto;
- ruolo corretto;
- notifiche abilitate;
- chat visibile;
- invio messaggio;
- ricezione messaggio;
- upload foto;
- upload documento;
- logout e rientro.

## Problemi comuni

### L'utente non vede l'app

Controllare:

- email inserita nel gruppo tester;
- invito accettato;
- account Apple/Google corretto;
- versione telefono compatibile;
- build ancora disponibile.

### Login non riuscito

Controllare:

- username corretto;
- password corretta;
- azienda non archiviata;
- utente non archiviato;
- piano azienda attivo manualmente.

### Notifiche non arrivano

Controllare:

- autorizzazione notifiche nel telefono;
- utente loggato con account corretto;
- telefono registrato nelle impostazioni app;
- app aggiornata;
- risparmio batteria Android non troppo aggressivo.

## Regola d'oro

Non aprire la pilota a tutta l'azienda finché il primo gruppo ristretto non ha superato almeno 3 giorni di uso reale senza blocchi gravi.
