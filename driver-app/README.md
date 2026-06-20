# Camion Chiaro Autisti

Prima base dell'app nativa autisti per iPhone e Android.

## Cosa contiene

- Login autista con username aziendale.
- Home autista con azienda, mezzo, check e guasti.
- Chat nativa pronta per messaggi testuali.
- Documenti autista da mostrare.
- Check mattutino e segnalazione guasto collegabili allo stesso Supabase.
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

## Nota importante

Questa app non sostituisce la dashboard azienda: usa lo stesso backend e serve solo agli autisti.
La dashboard azienda resta web su Netlify.
