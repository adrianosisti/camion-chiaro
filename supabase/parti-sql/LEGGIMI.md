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
