# Vygo

Vygo e il centro operativo per aziende di trasporto e logistica: dashboard web per l azienda, app iOS/Android per persone operative, documenti, scadenze, check, guasti, chat, notifiche, centro costi e report.

Dominio pubblico: `https://www.vy-go.com`

## Superfici prodotto

- Dashboard web azienda: anagrafiche, flotta, scadenze, registro operativo, chat, report, costi, admin e impostazioni.
- App mobile Vygo: accesso azienda, autisti, ufficio e magazzino, chat, notifiche, documenti, check e guasti.
- Backend Netlify: funzioni per creazione utenti, notifiche push, Stripe, admin, password e sessioni.
- Supabase: database, Auth, Storage, Realtime, policy RLS e funzioni SQL.

## Stato attuale

Funzioni gia presenti:

- registrazione azienda e login;
- accettazione termini/privacy;
- creazione persone: autisti, ufficio, magazzino;
- flotta con furgoni, motrici, trattori, semirimorchi, strumenti e muletti;
- documenti persone e mezzi con scadenze;
- check operativi e segnalazione guasti;
- chat singole e gruppi con foto, video, audio, reazioni, letture e notifiche;
- notifiche push web/native;
- centro costi, sanzioni, manutenzioni e report;
- piani, limiti, Stripe preparato e pannello admin;
- app iOS/Android con EAS Update.

Congelato per la V1:

- chiamate vocali live. Il codice e preparato, ma la funzione resta nascosta finche non decidiamo provider, costi e qualita.

## Sviluppo locale dashboard web

```bash
npm install
npm run dev
```

Apri `http://127.0.0.1:5173/`.

## Sviluppo app mobile

```bash
cd driver-app
npm install
npm run start
```

Per build interne:

```bash
npm run build:ios:preview
npm run build:android:preview
```

Per aggiornamenti rapidi sulle build gia installate:

```bash
npx eas-cli update --branch preview --message "Descrizione aggiornamento"
```

## Variabili ambiente

Usa `.env.example` come traccia per Netlify e `.env` locale. Le chiavi `VITE_*` sono pubbliche per il frontend. Le chiavi private, come `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `WEB_PUSH_PRIVATE_KEY` e `STRIPE_WEBHOOK_SECRET`, vanno solo in Netlify/EAS quando richieste e mai nel codice frontend.

Per l app mobile usa `driver-app/.env.example` e replica le variabili pubbliche anche nell ambiente EAS `preview`/`production`.

## Supabase

Gli script SQL incrementali stanno in `supabase/parti-sql/`. Per un database nuovo si applicano in ordine, evitando i file demo se si prepara un ambiente cliente reale.

File demo e test:

- `34*` e `35*`: popolamento demo;
- `08_reset_test_check_guasti.sql`: solo test;
- file con nomi di fix specifici vanno usati solo quando servono su un ambiente gia esistente.

Prima di dare accesso a un cliente reale, creare un progetto Supabase pulito o ripulire i dati demo.

## Deploy

Netlify usa:

```text
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

Il dominio `vy-go.com` punta a Netlify tramite DNS.

## Documentazione utile

- Checklist vendibile: `docs/checklist-v1-vendibile-vygo.md`
- Prezzi: `docs/scheda-prezzi-vygo.md`
- FAQ: `docs/faq-vygo.md`
- Manuale rapido: `docs/manuale-utente-vygo.md`
- Piano lancio: `docs/piano-lancio-operativo-vygo.md`
- Brand kit: `docs/brand-kit-vygo.md`

## Prima del lancio pubblico

Da chiudere prima di vendere senza supervisione:

- Stripe live con webhook verificato;
- email dominio e SMTP/transactional email;
- privacy, termini, cookie e DPA revisionati da consulente;
- bundle id/scheme finali dell app coerenti con Vygo;
- ambiente Supabase pulito per clienti reali;
- backup, retention file e limiti storage;
- QA completa su web, iPhone e Android con almeno una azienda pilota.
