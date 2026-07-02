# Vygo - Checklist V1 vendibile

Questo documento e il semaforo unico per capire cosa manca prima di dare Vygo a una vera azienda pagante.

## Obiettivo V1

Vendere Vygo come centro operativo per aziende di trasporto e logistica:

- azienda controlla scadenze, flotta, persone, guasti, check, costi e report;
- personale usa app mobile per documenti, notifiche, chat, check e guasti;
- il cliente paga un piano basato su mezzi, strumenti, utenti e storage;
- il sistema blocca funzioni/limiti senza affidarsi solo ai pulsanti nascosti.

## Stato prodotto

Pronto per test pilota:

- dashboard web azienda;
- app mobile iOS/Android in distribuzione interna;
- login azienda e personale;
- privacy/termini con accettazione salvata;
- piani e limiti;
- chat dirette/gruppi con allegati;
- notifiche push;
- documenti e scadenze;
- check, guasti e archivio;
- centro costi, sanzioni, manutenzioni e report;
- pannello admin;
- dominio `vy-go.com`.

Da non vendere ancora come promessa:

- chiamate vocali live;
- AI generativa di supporto;
- invio automatico email report;
- tracciamento GPS continuativo;
- import Excel completamente guidato.

## Blocchi prima vendita reale

### Pagamenti

- Creare prodotti e prezzi su Stripe per `fleet5`, `fleet10`, `fleet20`, `fleet30`, `fleet50`, `enterprise`.
- Inserire su Netlify `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e `STRIPE_PRICE_*`.
- Configurare webhook Stripe verso `/.netlify/functions/stripe-webhook`.
- Testare: pagamento riuscito, pagamento fallito, cambio carta, cancellazione, upgrade/downgrade.
- Verificare che un azienda sospesa non possa superare i limiti.

### Email

- Attivare email dominio tipo `info@vy-go.com`.
- Collegare un servizio email transazionale per conferme, recupero password e comunicazioni.
- Personalizzare testi email: registrazione, reset password, sollecito documento, invito utente.

### Legale

- Privacy Policy.
- Termini e Condizioni SaaS.
- Cookie Policy se si usano cookie/tracciamenti.
- DPA/nomina responsabile trattamento per aziende clienti.
- Regole uso chat, documenti, notifiche e allegati.
- Revisione finale con consulente privacy/legale prima del pubblico.

### App Store / Play Store

- Decidere bundle id definitivo Vygo. Oggi la build interna usa ancora identificativi storici `it.camionchiaro.app`.
- Decidere scheme definitivo, idealmente `vygo`.
- Preparare screenshot, descrizione store, privacy nutrition labels Apple e data safety Google.
- TestFlight e Internal Testing Android con almeno 2 dispositivi reali.

### Supabase

- Passare a piano adatto ai test reali appena lo storage/egress free blocca.
- Creare ambiente cliente pulito, senza demo.
- Definire retention allegati e compressione media.
- Abilitare backup e policy di recupero.
- Tenere SQL demo separati dagli SQL produzione.

## QA obbligatoria azienda pilota

Testare con una azienda reale o quasi reale:

- 1 titolare;
- 1 ufficio;
- 2 autisti;
- 1 magazziniere;
- 5 mezzi;
- 1 muletto o strumento;
- almeno 15 documenti/scadenze;
- almeno 10 chat, 3 foto, 2 audio, 1 video;
- 2 check ok, 1 check critico, 2 guasti, 3 costi, 2 sanzioni.

Percorsi da provare:

- registrazione azienda e conferma email;
- accettazione privacy/termini;
- creazione persone e cambio password;
- login app di ogni ruolo;
- chat diretta e gruppo;
- allegati foto/video/audio;
- badge messaggi non letti;
- notifiche push con app aperta, in background e chiusa;
- caricamento documento nuovo;
- rinnovo documento scaduto;
- aggiunta mezzo e scadenza mezzo;
- check mattutino;
- guasto con foto;
- archiviazione guasto con costo;
- modifica/eliminazione spesa;
- report web con filtri e CSV;
- blocco limiti piano;
- logout e cambio account senza notifiche sbagliate.

## Prezzi V1

Tutti i piani devono avere le funzioni operative principali. Cambiano i limiti:

- Fleet 5: fino a 5 mezzi, 3 strumenti, 10 account, 10 GB.
- Fleet 10: fino a 10 mezzi, 5 strumenti, 20 account, 20 GB.
- Fleet 20: fino a 20 mezzi, 10 strumenti, 40 account, 30 GB.
- Fleet 30: fino a 30 mezzi, 15 strumenti, 60 account, 50 GB.
- Fleet 50: fino a 50 mezzi, 25 strumenti, 100 account, 75 GB.
- Enterprise: su misura.

Extra principali:

- storage extra;
- start-up kit;
- supporto/import dati;
- report automatici email/PDF quando il servizio email sara collegato.

## Cosa controllare ogni volta prima di una build

- `npm run build` nella dashboard web.
- Export o build app mobile iOS/Android.
- Login web e app.
- Chat almeno tra azienda/persona e persona/persona.
- Notifiche non lette su home, footer e lista chat.
- Upload allegati principali.
- Registro operativo e scadenze.
- Centro costi e report.

## Decisione consigliata prossima

Prima di aggiungere nuove funzioni, fare una settimana di stabilizzazione:

1. Preparare ambiente demo pulito.
2. Collegare Stripe test in modo completo.
3. Fare QA reale con due telefoni e un PC.
4. Correggere solo bug bloccanti.
5. Preparare materiale vendita e onboarding.

Quando questi cinque punti sono verdi, Vygo puo entrare in test commerciale con una prima azienda selezionata.
