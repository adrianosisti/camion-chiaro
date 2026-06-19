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
Eseguilo una sola volta dopo i file precedenti.
