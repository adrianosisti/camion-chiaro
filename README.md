# Vyko

App per aziende di logistica: scadenze autisti e flotta, login azienda, accesso autista con nome utente, notifiche in app, check mattutino dei mezzi, segnalazione guasti e documenti digitali dell'autista.

## Cosa c'e' gia'

- Login demo azienda.
- Login demo autista con nome utente.
- Creazione autista aziendale con username e password temporanea tramite funzione Netlify.
- Flotta divisa in furgoni, motrici, trattori e semirimorchi.
- Targhe visibili per ogni mezzo.
- Check mattutino autista salvato su Supabase, con scelta opzionale del semirimorchio agganciato.
- Segnalazione guasto salvata su Supabase e visibile all'azienda.
- Sezione documenti autista da mostrare in caso di controllo.
- Schema Supabase con RLS per aziende e autisti.
- Configurazione Netlify.

## Prova locale

Apri il terminale nella cartella del progetto e lancia:

```bash
npm install
npm run dev
```

Poi apri:

```text
http://127.0.0.1:5173/
```

In demo puoi usare i valori gia' compilati nei form.

## Supabase da zero

1. Vai su `https://supabase.com`.
2. Crea un account o fai login.
3. Clicca `New project`.
4. Scegli un nome, per esempio `camion-chiaro`.
5. Scegli una password database e conservala.
6. Attendi che il progetto sia pronto.
7. Nel menu a sinistra apri `SQL Editor`.
8. Clicca `New query`.
9. Apri il file `supabase/schema.sql` di questo progetto.
10. Copia tutto il contenuto.
11. Incollalo nel SQL Editor di Supabase.
12. Clicca `Run`.

Se hai gia' creato il database prima dell'upload documenti, non rifare tutto lo schema: apri solo `supabase/parti-sql/07_storage_documenti.sql`, copia tutto, incolla in Supabase SQL Editor e premi `Run`.

## Prendere le chiavi Supabase

1. In Supabase apri `Project Settings`.
2. Apri `API`.
3. Copia `Project URL`.
4. Copia la chiave pubblica `anon` / `publishable`.
5. Nel progetto copia `.env.example` e chiamalo `.env`.
6. Inserisci i valori:

```bash
VITE_SUPABASE_URL=https://tuo-progetto.supabase.co
VITE_SUPABASE_ANON_KEY=la-tua-chiave-pubblica
VITE_SUPABASE_COMPANY_ID=lo-mettere-mo-dopo
VITE_DRIVER_AUTH_DOMAIN=drivers.vyko.app
```

Non mettere mai la chiave `service_role` dentro `.env` del frontend.
La chiave `SUPABASE_SERVICE_ROLE_KEY` serve solo alla funzione Netlify: non deve iniziare con `VITE_`.

## Login autisti con nome utente

Supabase Auth lavora con email/password. Per far vedere all'autista solo un nome utente, useremo una mail tecnica dietro le quinte:

```text
nomeutente@drivers.vyko.app
```

Esempio:

```text
marco.bianchi@drivers.vyko.app
```

Nel prodotto finale l'azienda creera' l'autista da pannello e il sistema generera' questa utenza. Per i primi test si puo' creare manualmente l'utente in Supabase Auth.

## Netlify da zero

1. Vai su `https://www.netlify.com`.
2. Crea un account o fai login.
3. Carica il progetto su GitHub.
4. In Netlify clicca `Add new site`.
5. Scegli `Import an existing project`.
6. Collega GitHub.
7. Seleziona il repository.
8. Imposta:

```text
Build command: npm run build
Publish directory: dist
```

9. Apri `Environment variables`.
10. Aggiungi le stesse variabili del file `.env`:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_COMPANY_ID
VITE_DRIVER_AUTH_DOMAIN
SUPABASE_SERVICE_ROLE_KEY
```

11. Per `SUPABASE_SERVICE_ROLE_KEY`, in Supabase apri `Project Settings > API`, copia la chiave `service_role` e incollala solo in Netlify come variabile ambiente.
12. Clicca `Deploy`.

## Prossimi pezzi da costruire

- Anteprima e download documenti caricati dall'autista.
- Notifiche in-app persistenti lette dalla tabella `in_app_notifications`.
- Stato avanzamento guasti: visto, in lavorazione, chiuso.
