-- 54 - Demo Area test per Spedifast Srl
-- Esegui questo file dopo il 53_pilot_control.sql.

do $$
declare
  target_company_id uuid;
begin
  select id
  into target_company_id
  from public.companies
  where lower(name) in ('spedifast srl', 'spedifast')
     or id = 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976'::uuid
  order by case when lower(name) in ('spedifast srl', 'spedifast') then 0 else 1 end
  limit 1;

  if target_company_id is null then
    raise notice 'Spedifast Srl non trovata. Nessun dato demo inserito.';
    return;
  end if;

  insert into public.pilot_feedback (
    company_id,
    actor_role,
    category,
    screen,
    message,
    status,
    created_at
  )
  values
    (
      target_company_id,
      'admin',
      'training',
      'area_test',
      'Ciao Spedifast, questa e l Area test Vygo. Qui potete scriverci problemi, dubbi e idee durante la prova reale.',
      'open',
      now() - interval '3 hours'
    ),
    (
      target_company_id,
      'company',
      'question',
      'mobile',
      'Vorremmo capire se gli autisti devono usare prima la chat o il check mattutino.',
      'open',
      now() - interval '2 hours 35 minutes'
    ),
    (
      target_company_id,
      'admin',
      'training',
      'operations',
      'Per il primo giorno fate cosi: create due autisti, assegnate un mezzo, fate inviare un check e poi provate una segnalazione guasto con foto.',
      'open',
      now() - interval '2 hours 10 minutes'
    ),
    (
      target_company_id,
      'company',
      'idea',
      'documents',
      'Sarebbe utile ricordare agli autisti di aggiornare patente e CQC quando scadono.',
      'open',
      now() - interval '1 hour 20 minutes'
    ),
    (
      target_company_id,
      'admin',
      'question',
      'documents',
      'Perfetto, questa funzione e gia prevista: l azienda vede le scadenze e l autista puo caricare il documento rinnovato dall app.',
      'open',
      now() - interval '55 minutes'
    )
  on conflict do nothing;
end;
$$;
