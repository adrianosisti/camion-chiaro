# Come usare questi blocchi in Supabase

Se Supabase non ti fa incollare `supabase/schema.sql` tutto insieme, usa questi file in ordine.

1. Apri `01_tabelle_base.sql`, copia tutto, incolla in Supabase SQL Editor, premi Run.
2. Apri `02_tabelle_notifiche_check_guasti.sql`, copia tutto, incolla in una nuova query o cancella la precedente, premi Run.
3. Apri `03_funzioni_trigger.sql`, copia tutto, incolla, premi Run.
4. Apri `04_funzioni_indici_rls.sql`, copia tutto, incolla, premi Run.
5. Apri `05_policy_base.sql`, copia tutto, incolla, premi Run.
6. Apri `06_policy_notifiche_check_guasti.sql`, copia tutto, incolla, premi Run.
7. Apri `07_storage_documenti.sql`, copia tutto, incolla, premi Run.

Non saltare blocchi e non cambiare ordine.

Se un blocco va a buon fine, Supabase mostra `Success. No rows returned` o un messaggio simile.

## Reset dei test

Il file `08_reset_test_check_guasti.sql` non fa parte dell'installazione iniziale.
Usalo solo se vuoi cancellare i guasti e i check mattutini di prova e ripartire pulito.
Non cancella autisti, flotta, documenti, scadenze o impostazioni azienda.

## Impostazioni azienda

Il file `09_policy_impostazioni_azienda.sql` abilita il salvataggio della schermata Impostazioni azienda.
Eseguilo una sola volta in Supabase SQL Editor se vuoi modificare ragione sociale, partita IVA e sede dall'app.

## Registrazione aziende

Il file `10_registrazione_azienda_multi_cliente.sql` abilita la registrazione completa di nuove aziende.
Eseguilo una sola volta in Supabase SQL Editor: ogni nuovo account azienda verra collegato alla sua azienda e vedra solo i propri dati.

## Foto, guasti e chat

I file `11_foto_logo_azienda_autisti.sql`, `12_rimuovi_foto_autista.sql` e `13_foto_guasti.sql` abilitano logo azienda, foto profilo autista, rimozione foto e foto dei guasti.

Il file `14_chat_interna.sql` abilita la chat interna tra azienda e autisti, con foto allegate e storico messaggi.
Se Supabase da errore copiando il file intero, usa i due file separati:

1. `14A_chat_tabelle.sql`
2. `14B_chat_policy.sql`

Esegui prima `14A`, aspetta `Success`, poi esegui `14B`.

Se anche `14B_chat_policy.sql` risulta troppo lungo da copiare, usa questi file ancora piu piccoli:

1. `14B1_chat_regole_conversazioni.sql`
2. `14B2_chat_regole_messaggi.sql`
3. `14B3_chat_storage_foto.sql`
4. `14B4_chat_tempo_reale.sql`

Eseguili uno alla volta, sempre dopo `14A_chat_tabelle.sql`.

## Aggiornamento live check e guasti

Il file `15_realtime_check_guasti.sql` abilita l aggiornamento automatico di check mattutini e guasti nella dashboard azienda, senza ricaricare la pagina.
Eseguilo una sola volta dopo i file della chat.

## Documenti creati dall autista

Il file `16_documenti_autista.sql` permette all autista di aggiungere un nuovo documento dalla sua app e caricare subito foto o PDF.
Eseguilo una sola volta dopo `15_realtime_check_guasti.sql`.

## Notifiche telefono e storico documenti

Il file `17_push_notifiche_telefono.sql` registra i telefoni che autorizzano le notifiche push.
Eseguilo una sola volta dopo `16_documenti_autista.sql`.

Se Supabase non ti fa incollare il file `17` intero, usa questi tre file separati:

1. `17A_push_tabella_policy.sql`
2. `17B_push_funzione_salva.sql`
3. `17C_push_funzione_cancella.sql`

Eseguili uno alla volta, sempre in questo ordine.

Il file `18_storico_documenti.sql` abilita lo storico dei documenti autista.
Eseguilo una sola volta dopo `17_push_notifiche_telefono.sql`.

Se Supabase non ti fa incollare il file `18` intero, usa questi due file separati:

1. `18A_storico_documenti_tabella_policy.sql`
2. `18B_storico_documenti_funzione.sql`

Eseguili uno alla volta, sempre in questo ordine.

## Reazioni chat

Il file `19_chat_reazioni.sql` abilita le reazioni rapide ai messaggi della chat.
Eseguilo una sola volta dopo `18_storico_documenti.sql`.

## Fix notifiche push

Se premendo `Verifica notifiche` compare l errore `function digest(text, unknown) does not exist`, esegui una sola volta il file `20_fix_push_digest.sql`.

Se compare l errore `push_subscriptions_account_role_check`, esegui una sola volta il file `21_fix_push_account_role.sql`.

Se l errore continua anche dopo il file 21, esegui una sola volta il file `22_fix_push_account_role_definitivo.sql`.

## Licenze e fatture azienda

Il file `23A_licenze_aziende.sql` aggiunge lo stato licenza alle aziende.
Le aziende gia presenti restano attive; le nuove registrazioni azienda partiranno in attesa di attivazione.

Il file `23B_fatture_aziende.sql` aggiunge lo storico fatture e il bucket privato per i PDF fattura.
Eseguilo dopo `23A_licenze_aziende.sql`.

Il file `24_dati_fatturazione_stripe.sql` aggiunge la scheda dati fatturazione azienda usata prima del pagamento Stripe.
Eseguilo dopo `23B_fatture_aziende.sql`.
