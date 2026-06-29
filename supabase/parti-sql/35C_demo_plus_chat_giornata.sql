-- DEMO PLUS CAMION CHIARO - 35C
-- Chat lunghe: autisti, gruppi reparto, tutta azienda e dirette ufficio/magazzino.
-- Esegui dopo 35A. Puo essere rilanciato: cancella solo messaggi DEMOPLUS.

do $$
declare
  target_email text := 'azienda@camionchiaro.it';
  fallback_company_id uuid := 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976';
  target_company_id uuid;
  owner_user_id uuid;
  drivers_thread_id uuid;
  warehouse_thread_id uuid;
  office_thread_id uuid;
  all_thread_id uuid;
  traffic_warehouse_thread_id uuid;
  refresh_thread_id uuid;
begin
  select cm.company_id, cm.user_id
  into target_company_id, owner_user_id
  from public.company_members cm
  join auth.users u on u.id = cm.user_id
  where lower(coalesce(u.email, '')) = lower(target_email)
  order by cm.created_at desc
  limit 1;

  target_company_id := coalesce(target_company_id, fallback_company_id);

  if owner_user_id is null then
    select user_id into owner_user_id
    from public.company_members
    where company_id = target_company_id
    order by created_at desc
    limit 1;
  end if;

  insert into public.team_chat_threads (company_id, thread_type, audience_type, title, created_by_user_id, status)
  values
    (target_company_id, 'group', 'drivers', 'Tutti gli autisti', owner_user_id, 'open'),
    (target_company_id, 'group', 'warehouse', 'Magazzino', owner_user_id, 'open'),
    (target_company_id, 'group', 'office', 'Ufficio', owner_user_id, 'open'),
    (target_company_id, 'group', 'all', 'Tutta l azienda', owner_user_id, 'open')
  on conflict (company_id, audience_type) where thread_type = 'group' and audience_type in ('drivers', 'warehouse', 'office', 'all')
  do update set title = excluded.title, status = 'open', updated_at = now();

  if to_regprocedure('public.refresh_team_thread_participants(uuid)') is not null then
    for refresh_thread_id in
      select id
      from public.team_chat_threads
      where company_id = target_company_id
        and thread_type = 'group'
        and audience_type in ('drivers', 'warehouse', 'office', 'all')
    loop
      perform public.refresh_team_thread_participants(refresh_thread_id);
    end loop;
  end if;

  insert into public.chat_threads (company_id, driver_id, context_type, title, status)
  select target_company_id, d.id, 'general', 'Chat ' || d.full_name, 'open'
  from public.drivers d
  where d.company_id = target_company_id
    and d.username in ('demo.marco', 'demo.elena', 'demo.luca', 'demo.ahmed', 'demo.ionut', 'demo.tomasz', 'demo.sofia')
  on conflict (company_id, driver_id, context_type) where context_type = 'general' and driver_id is not null
  do update set title = excluded.title, status = 'open', updated_at = now();

  delete from public.chat_messages
  where company_id = target_company_id and body like '[DEMOPLUS]%';

  insert into public.chat_messages (thread_id, company_id, sender_user_id, sender_role, body, read_by_company_at, read_by_driver_at, created_at)
  select t.id, target_company_id, owner_user_id, m.sender_role, m.body,
         case when m.sender_role = 'driver' then null else m.created_at + interval '2 minutes' end,
         case when m.sender_role = 'company' then null else m.created_at + interval '2 minutes' end,
         m.created_at
  from (
    values
      ('demo.marco', 'company', '[DEMOPLUS] 06:20 Marco, carico Bologna confermato. Aggancia DEMOS01 e fai check prima uscita.', now() - interval '9 hours 40 minutes'),
      ('demo.marco', 'driver', '[DEMOPLUS] 06:42 Check fatto, tutto regolare. Parto ore 06:50.', now() - interval '9 hours 18 minutes'),
      ('demo.marco', 'company', '[DEMOPLUS] Perfetto. Quando scarichi manda conferma in chat.', now() - interval '9 hours 12 minutes'),
      ('demo.elena', 'driver', '[DEMOPLUS] 07:05 Ho luce posteriore KO e libretto non in cabina. Ho inviato check critico.', now() - interval '8 hours 50 minutes'),
      ('demo.elena', 'company', '[DEMOPLUS] Elena resta ferma. Paola apre intervento officina e Gianni cerca libretto.', now() - interval '8 hours 44 minutes'),
      ('demo.elena', 'driver', '[DEMOPLUS] Ricevuto. Sono in piazzale lato officina.', now() - interval '8 hours 42 minutes'),
      ('demo.ahmed', 'company', '[DEMOPLUS] Ahmed, su DEMOT02 controlla anche pressione semirimorchio prima tratta.', now() - interval '8 hours 35 minutes'),
      ('demo.ahmed', 'driver', '[DEMOPLUS] DEMOT02 e DEMOS02 ok. Partenza 07:35.', now() - interval '8 hours 25 minutes'),
      ('demo.ionut', 'driver', '[DEMOPLUS] Pressione bassa su DEMOS03, ho aperto guasto medio.', now() - interval '7 hours 36 minutes'),
      ('demo.ionut', 'company', '[DEMOPLUS] Ricevuto, passa dal gommista convenzionato prima di caricare.', now() - interval '7 hours 32 minutes'),
      ('demo.sofia', 'company', '[DEMOPLUS] Sofia consegna farmaceutica: tieni temperatura e manda conferma arrivo.', now() - interval '6 hours 55 minutes'),
      ('demo.sofia', 'driver', '[DEMOPLUS] Arrivata al primo punto. Sponda fa rumore ma funziona, apro segnalazione.', now() - interval '80 minutes'),
      ('demo.tomasz', 'company', '[DEMOPLUS] Tomasz, nel pomeriggio prendi DEMOT02 con DEMOS01. ADR in app da verificare.', now() - interval '4 hours'),
      ('demo.tomasz', 'driver', '[DEMOPLUS] Visto. ADR caricato e mostrabile in app.', now() - interval '3 hours 54 minutes')
  ) as m(username, sender_role, body, created_at)
  join public.drivers d on d.company_id = target_company_id and d.username = m.username
  join public.chat_threads t on t.company_id = target_company_id and t.driver_id = d.id and t.context_type = 'general';

  select id into drivers_thread_id from public.team_chat_threads where company_id = target_company_id and thread_type = 'group' and audience_type = 'drivers';
  select id into warehouse_thread_id from public.team_chat_threads where company_id = target_company_id and thread_type = 'group' and audience_type = 'warehouse';
  select id into office_thread_id from public.team_chat_threads where company_id = target_company_id and thread_type = 'group' and audience_type = 'office';
  select id into all_thread_id from public.team_chat_threads where company_id = target_company_id and thread_type = 'group' and audience_type = 'all';

  delete from public.team_chat_messages
  where company_id = target_company_id and body like '[DEMOPLUS]%';

  insert into public.team_chat_messages (thread_id, company_id, sender_user_id, sender_person_id, sender_role, body, created_at)
  select target_thread.thread_id, target_company_id, owner_user_id, p.id, target.sender_role, target.body, target.created_at
  from (
    values
      ('drivers', null, 'company', '[DEMOPLUS] 06:10 Buongiorno, check obbligatorio prima di muovere ogni mezzo. Scrivete qui eventuali ritardi.', now() - interval '9 hours 50 minutes'),
      ('drivers', 'demo.paola', 'office', '[DEMOPLUS] A1 verso Bologna gia intensa. Marco e Ahmed anticipate aggiornamenti arrivo.', now() - interval '9 hours 25 minutes'),
      ('drivers', null, 'company', '[DEMOPLUS] Ionut passa da gommista convenzionato prima del carico. Elena resta ferma fino a luce sistemata.', now() - interval '7 hours 25 minutes'),
      ('drivers', 'demo.roberto', 'office', '[DEMOPLUS] Tomasz prende secondo giro ore 13:00 con DEMOT02. Documenti ADR controllati.', now() - interval '4 hours 15 minutes'),
      ('drivers', null, 'company', '[DEMOPLUS] Fine mattina: confermate su chat singola scarichi completati e anomalie aperte.', now() - interval '3 hours 20 minutes'),

      ('warehouse', 'demo.gianni', 'warehouse', '[DEMOPLUS] 06:30 MULETTO-01 batteria sotto 25%, messo in carica. Acqua batterie ok.', now() - interval '9 hours 20 minutes'),
      ('warehouse', 'demo.olena', 'warehouse', '[DEMOPLUS] 07:00 MULETTO-02 acqua batterie bassa, serve rabbocco prima uso continuo.', now() - interval '8 hours 55 minutes'),
      ('warehouse', null, 'company', '[DEMOPLUS] Ok Olena, segnalo criticita. Usate TRANSPALLET-02 per ribalta 4.', now() - interval '8 hours 50 minutes'),
      ('warehouse', 'demo.matteo', 'warehouse', '[DEMOPLUS] Ribalta 2 libera per Marco. DEMOS01 atteso entro le 10:30.', now() - interval '6 hours'),
      ('warehouse', 'demo.nicola', 'warehouse', '[DEMOPLUS] Locale batterie: piccola perdita zona carica, ho isolato area e aperto controllo.', now() - interval '3 hours 45 minutes'),
      ('warehouse', null, 'company', '[DEMOPLUS] Perfetto, tenete chiusa area finche non passa sicurezza.', now() - interval '3 hours 40 minutes'),

      ('office', 'demo.paola', 'office', '[DEMOPLUS] 07:15 Aperte criticita: luce Elena, tachigrafica Ionut, revisione DEMOT03.', now() - interval '8 hours 45 minutes'),
      ('office', 'demo.sara', 'office', '[DEMOPLUS] Preparo rinnovo RCA DEMOF02 e ATP DEMOS03. Documenti demo caricati in anagrafica.', now() - interval '7 hours 55 minutes'),
      ('office', 'demo.roberto', 'office', '[DEMOPLUS] Ho riassegnato secondo giro a Tomasz. Ahmed resta su tratta nord.', now() - interval '4 hours 10 minutes'),
      ('office', null, 'company', '[DEMOPLUS] Prima di chiudere giornata voglio archivio guasti aggiornato e note su check muletti.', now() - interval '2 hours 30 minutes'),

      ('all', null, 'company', '[DEMOPLUS] 06:00 Avvio giornata azienda demo: 7 autisti, 5 persone ufficio/magazzino, 10 mezzi, 6 attrezzature.', now() - interval '10 hours'),
      ('all', 'demo.paola', 'office', '[DEMOPLUS] Comunicazione: per oggi priorita Bologna, farmaceutico Prato e messa in sicurezza locale batterie.', now() - interval '8 hours 20 minutes'),
      ('all', 'demo.gianni', 'warehouse', '[DEMOPLUS] Magazzino aggiornato: ribalte 2 e 4 operative, muletto 01 in carica.', now() - interval '5 hours 50 minutes'),
      ('all', null, 'company', '[DEMOPLUS] Grazie a tutti. Ogni criticita deve restare tracciata: check, guasto o chat reparto.', now() - interval '90 minutes')
  ) as target(audience_type, username, sender_role, body, created_at)
  left join public.company_people p on p.company_id = target_company_id and p.username = target.username
  join (
    select drivers_thread_id as thread_id, 'drivers'::text as audience_type
    union all select warehouse_thread_id, 'warehouse'
    union all select office_thread_id, 'office'
    union all select all_thread_id, 'all'
  ) target_thread on target_thread.audience_type = target.audience_type;

  insert into public.team_chat_threads (company_id, thread_type, audience_type, direct_key, title, created_by_user_id, status)
  values (
    target_company_id,
    'direct',
    'direct',
    'demoplus:traffico-magazzino',
    'Ufficio traffico / Magazzino',
    owner_user_id,
    'open'
  )
  on conflict (company_id, direct_key) where thread_type = 'direct' and direct_key is not null
  do update set title = excluded.title, status = 'open', updated_at = now()
  returning id into traffic_warehouse_thread_id;

  insert into public.team_chat_participants (thread_id, company_id, person_id, can_write, left_at)
  select traffic_warehouse_thread_id, target_company_id, p.id, true, null
  from public.company_people p
  where p.company_id = target_company_id and p.username in ('demo.paola', 'demo.roberto', 'demo.gianni', 'demo.matteo', 'demo.olena')
  on conflict (thread_id, person_id) do update set can_write = true, left_at = null;

  insert into public.team_chat_messages (thread_id, company_id, sender_user_id, sender_person_id, sender_role, body, created_at)
  select traffic_warehouse_thread_id, target_company_id, owner_user_id, p.id, item.sender_role, item.body, item.created_at
  from (
    values
      ('demo.paola', 'office', '[DEMOPLUS] Gianni, Marco arriva con DEMOS01 verso 10:20. Tenete ribalta 2 libera.', now() - interval '6 hours 15 minutes'),
      ('demo.gianni', 'warehouse', '[DEMOPLUS] Ricevuto, sposto transpallet e libero ribalta 2.', now() - interval '6 hours 12 minutes'),
      ('demo.roberto', 'office', '[DEMOPLUS] Dopo Marco arriva farmaceutico Sofia, priorita scarico veloce.', now() - interval '4 hours 30 minutes'),
      ('demo.matteo', 'warehouse', '[DEMOPLUS] Ok, preparo corsia fredda e controllo pedana.', now() - interval '4 hours 26 minutes'),
      ('demo.olena', 'warehouse', '[DEMOPLUS] MULETTO-02 utilizzabile dopo rabbocco. Segno check risolto appena fatto.', now() - interval '3 hours 10 minutes')
  ) as item(username, sender_role, body, created_at)
  join public.company_people p on p.company_id = target_company_id and p.username = item.username;
end $$;
