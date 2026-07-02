# Vygo

App nativa Vygo per iPhone e Android. Contiene accesso autista e accesso azienda, usando lo stesso Supabase e lo stesso backend Netlify della dashboard web.

## Cosa contiene

- Login autista con username aziendale.
- Login azienda con email e password.
- Home autista con azienda, mezzo del turno, check e guasti.
- Home azienda con check critici, guasti aperti, scadenze e anagrafiche.
- Chat nativa con messaggi, audio, allegati, reazioni, online e sta scrivendo.
- Documenti autista da mostrare.
- Check mattutino e segnalazione guasto collegabili allo stesso Supabase.
- Aggiornamento realtime di chat, guasti e check.
- Configurazione store iniziale per App Store e Play Store.

## Avvio locale

1. Copia `.env.example` in `.env`.
2. Inserisci le stesse chiavi pubbliche Supabase usate dalla dashboard.
3. Installa le dipendenze:

```bash
npm install
```

4. Avvia Expo:

```bash
npm run start
```

Poi apri su iPhone/Android con Expo Go o con una development build.

## Expo Go o app vera

Expo Go serve solo per sviluppo: funziona finche il Mac e il tunnel Expo restano accesi.

La build vera, invece, si installa sul telefono e funziona anche fuori casa con rete cellulare, perche parla direttamente con Supabase e Netlify.

## Prima build installabile

1. Accedi a Expo dal terminale:

```bash
npx eas-cli login
```

2. Collega il progetto al tuo account Expo:

```bash
npx eas-cli init
```

Questo comando inserira in `app.json` il vero `projectId` Expo.

3. Inserisci su Expo/EAS le stesse variabili pubbliche usate in `.env`:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_DRIVER_AUTH_DOMAIN
EXPO_PUBLIC_API_BASE_URL
```

4. Build Android interna, la piu semplice per provare fuori casa:

```bash
npm run build:android:preview
```

Alla fine Expo dara un link per scaricare l APK sul telefono Android.

5. Build iPhone interna:

```bash
npm run build:ios:preview
```

Per iPhone serve un account Apple Developer. Senza quello si continua a provare con Expo Go oppure si prepara TestFlight quando l account e pronto.

## Identita app

- Nome app: Vygo
- iOS bundle id interno attuale: `it.camionchiaro.app`
- Android package interno attuale: `it.camionchiaro.app`
- Colori principali: celeste, nero, bianco

Prima della pubblicazione store conviene decidere se registrare identificativi definitivi coerenti con Vygo, per esempio `it.vygo.app` o `com.vygo.app`.
