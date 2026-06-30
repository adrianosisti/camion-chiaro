-- DEMO CAMION CHIARO - 34E
-- Messaggi demo in chat autisti, gruppi reparto e dirette ufficio/magazzino.
-- Esegui dopo 34A. Puo essere rilanciato: ripulisce solo le chat demo.

do $$
declare
  target_email text := 'azienda@camionchiaro.it';
  fallback_company_id uuid := 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976';
  target_company_id uuid;
  owner_user_id uuid;

  marco_id uuid;
  elena_id uuid;
  luca_id uuid;
  paola_id uuid;
  gianni_id uuid;
  sara_id uuid;

  marco_thread_id uuid;
  elena_thread_id uuid;
  luca_thread_id uuid;
  drivers_thread_id uuid;
  warehouse_thread_id uuid;
  office_thread_id uuid;
  all_thread_id uuid;
  paola_direct_thread_id uuid;
  gianni_direct_thread_id uuid;
  paola_gianni_thread_id uuid;
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

  select id into marco_id from public.drivers where company_id = target_company_id and username = 'demo.marco';
  select id into elena_id from public.drivers where company_id = target_company_id and username = 'demo.elena';
  select id into luca_id from public.drivers where company_id = target_company_id and username = 'demo.luca';
  select id into paola_id from public.company_people where company_id = target_company_id and username = 'demo.paola';
  select id into gianni_id from public.company_people where company_id = target_company_id and username = 'demo.gianni';
  select id into sara_id from public.company_people where company_id = target_company_id and username = 'demo.sara';

  insert into public.chat_threads (company_id, driver_id, context_type, title, status)
  values
    (target_company_id, marco_id, 'general', 'Chat demo Marco', 'open'),
    (target_company_id, elena_id, 'general', 'Chat demo Elena', 'open'),
    (target_company_id, luca_id, 'general', 'Chat demo Luca', 'open')
  on conflict (company_id, driver_id, context_type) where context_type = 'general' and driver_id is not null
  do update set title = excluded.title, status = 'open', updated_at = now();

  select id into marco_thread_id from public.chat_threads where company_id = target_company_id and driver_id = marco_id and context_type = 'general';
  select id into elena_thread_id from public.chat_threads where company_id = target_company_id and driver_id = elena_id and context_type = 'general';
  select id into luca_thread_id from public.chat_threads where company_id = target_company_id and driver_id = luca_id and context_type = 'general';

  delete from public.chat_messages
  where thread_id in (marco_thread_id, elena_thread_id, luca_thread_id);

  insert into public.chat_messages (thread_id, company_id, sender_user_id, sender_role, body, read_by_company_at, read_by_driver_at, created_at)
  values
    (marco_thread_id, target_company_id, owner_user_id, 'company', 'Marco, carico confermato per Bologna. Mandami conferma partenza.', now() - interval '2 hours 50 minutes', now() - interval '2 hours 46 minutes', now() - interval '3 hours'),
    (marco_thread_id, target_company_id, owner_user_id, 'driver', 'Partito ora, agganciato DEMOS01. Check tutto regolare.', now() - interval '2 hours 40 minutes', now() - interval '2 hours 40 minutes', now() - interval '2 hours 42 minutes'),
    (marco_thread_id, target_company_id, owner_user_id, 'company', 'Perfetto, grazie. Aggiornami appena scarichi.', now() - interval '2 hours 35 minutes', null, now() - interval '2 hours 36 minutes'),
    (elena_thread_id, target_company_id, owner_user_id, 'driver', 'Ho spia ABS accesa sulla motrice DEMOM01. Ho mandato guasto con priorita alta.', null, now() - interval '48 minutes', now() - interval '50 minutes'),
    (elena_thread_id, target_company_id, owner_user_id, 'company', 'Ricevuto Elena, non partire. Stiamo chiamando officina.', now() - interval '42 minutes', now() - interval '41 minutes', now() - interval '43 minutes'),
    (luca_thread_id, target_company_id, owner_user_id, 'company', 'Luca, domani tratta estera: controlla ADR e CQC in app prima di uscire.', now() - interval '1 day', null, now() - interval '1 day 20 minutes'),
    (luca_thread_id, target_company_id, owner_user_id, 'driver', 'Visto, documento ADR caricato. Porto anche copia cartacea.', now() - interval '1 day', now() - interval '1 day', now() - interval '1 day 10 minutes');

  insert into public.team_chat_threads (company_id, thread_type, audience_type, title, created_by_user_id, status)
  values
    (target_company_id, 'group', 'drivers', 'Tutti gli autisti', owner_user_id, 'open'),
    (target_company_id, 'group', 'warehouse', 'Magazzino', owner_user_id, 'open'),
    (target_company_id, 'group', 'office', 'Ufficio', owner_user_id, 'open'),
    (target_company_id, 'group', 'all', 'Tutta l azienda', owner_user_id, 'open')
  on conflict (company_id, audience_type) where thread_type = 'group' and audience_type in ('drivers', 'warehouse', 'office', 'all')
  do update set title = excluded.title, status = 'open', updated_at = now();

  select id into drivers_thread_id from public.team_chat_threads where company_id = target_company_id and thread_type = 'group' and audience_type = 'drivers';
  select id into warehouse_thread_id from public.team_chat_threads where company_id = target_company_id and thread_type = 'group' and audience_type = 'warehouse';
  select id into office_thread_id from public.team_chat_threads where company_id = target_company_id and thread_type = 'group' and audience_type = 'office';
  select id into all_thread_id from public.team_chat_threads where company_id = target_company_id and thread_type = 'group' and audience_type = 'all';

  perform public.refresh_team_thread_participants(drivers_thread_id);
  perform public.refresh_team_thread_participants(warehouse_thread_id);
  perform public.refresh_team_thread_participants(office_thread_id);
  perform public.refresh_team_thread_participants(all_thread_id);

  insert into public.team_chat_threads (company_id, thread_type, audience_type, direct_key, title, created_by_user_id, status)
  values
    (target_company_id, 'direct', 'direct', 'company:' || paola_id::text, 'Paola Conti', owner_user_id, 'open'),
    (target_company_id, 'direct', 'direct', 'company:' || gianni_id::text, 'Gianni Russo', owner_user_id, 'open')
  on conflict (company_id, direct_key) where thread_type = 'direct' and direct_key is not null
  do update set title = excluded.title, status = 'open', updated_at = now();

  insert into public.team_chat_threads (company_id, thread_type, audience_type, direct_key, title, created_by_user_id, status)
  values (
    target_company_id,
    'direct',
    'direct',
    case when paola_id < gianni_id then 'person:' || paola_id::text || ':' || gianni_id::text else 'person:' || gianni_id::text || ':' || paola_id::text end,
    'Paola Conti / Gianni Russo',
    owner_user_id,
    'open'
  )
  on conflict (company_id, direct_key) where thread_type = 'direct' and direct_key is not null
  do update set title = excluded.title, status = 'open', updated_at = now();

  select id into paola_direct_thread_id from public.team_chat_threads where company_id = target_company_id and direct_key = 'company:' || paola_id::text;
  select id into gianni_direct_thread_id from public.team_chat_threads where company_id = target_company_id and direct_key = 'company:' || gianni_id::text;
  select id into paola_gianni_thread_id from public.team_chat_threads where company_id = target_company_id and title = 'Paola Conti / Gianni Russo';

  insert into public.team_chat_participants (thread_id, company_id, person_id, can_write, left_at)
  values
    (paola_direct_thread_id, target_company_id, paola_id, true, null),
    (gianni_direct_thread_id, target_company_id, gianni_id, true, null),
    (paola_gianni_thread_id, target_company_id, paola_id, true, null),
    (paola_gianni_thread_id, target_company_id, gianni_id, true, null)
  on conflict (thread_id, person_id) do update set can_write = true, left_at = null;

  delete from public.team_chat_messages
  where thread_id in (drivers_thread_id, warehouse_thread_id, office_thread_id, all_thread_id, paola_direct_thread_id, gianni_direct_thread_id, paola_gianni_thread_id);

  insert into public.team_chat_messages (thread_id, company_id, sender_user_id, sender_person_id, sender_role, body, created_at)
  values
    (drivers_thread_id, target_company_id, owner_user_id, null, 'company', 'Buongiorno a tutti, ricordate check mattutino prima della partenza.', now() - interval '4 hours'),
    (drivers_thread_id, target_company_id, owner_user_id, paola_id, 'office', 'Traffico A1 intenso verso Bologna, anticipate aggiornamenti in chat.', now() - interval '3 hours 45 minutes'),
    (warehouse_thread_id, target_company_id, owner_user_id, gianni_id, 'warehouse', 'Muletto DEMO-MULETTO-01 messo in carica, batteria bassa segnalata.', now() - interval '90 minutes'),
    (warehouse_thread_id, target_company_id, owner_user_id, null, 'company', 'Ok Gianni, tienilo fermo fino a carica completa.', now() - interval '80 minutes'),
    (office_thread_id, target_company_id, owner_user_id, paola_id, 'office', 'Ho inserito le scadenze urgenti: patente Elena e revisione motrice.', now() - interval '2 hours'),
    (office_thread_id, target_company_id, owner_user_id, null, 'company', 'Perfetto, oggi le lavoriamo dal registro operativo.', now() - interval '1 hour 50 minutes'),
    (all_thread_id, target_company_id, owner_user_id, null, 'company', 'Demo Movigo: chat gruppi, dirette, scadenze e anomalie pronte da provare.', now() - interval '30 minutes'),
    (paola_direct_thread_id, target_company_id, owner_user_id, null, 'company', 'Paola, verifica assicurazione DEMOF01 entro oggi.', now() - interval '70 minutes'),
    (paola_direct_thread_id, target_company_id, owner_user_id, paola_id, 'office', 'Ricevuto, preparo rinnovo e allego documento appena pronto.', now() - interval '66 minutes'),
    (gianni_direct_thread_id, target_company_id, owner_user_id, gianni_id, 'warehouse', 'Serve autorizzazione per fermare transpallet DEMO-TRANSPALLET-01 domani mattina.', now() - interval '55 minutes'),
    (gianni_direct_thread_id, target_company_id, owner_user_id, null, 'company', 'Autorizzato, segnalo al reparto.', now() - interval '52 minutes'),
    (paola_gianni_thread_id, target_company_id, owner_user_id, paola_id, 'office', 'Gianni, quando arriva Marco prepara ribalta 2 per scarico.', now() - interval '25 minutes'),
    (paola_gianni_thread_id, target_company_id, owner_user_id, gianni_id, 'warehouse', 'Ok, avviso magazzino e tengo libero accesso.', now() - interval '22 minutes');
end $$;
