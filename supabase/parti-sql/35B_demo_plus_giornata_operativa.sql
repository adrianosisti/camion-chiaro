-- DEMO PLUS CAMION CHIARO - 35B
-- Giornata operativa: scadenze, check autisti, guasti e controlli muletti.
-- Esegui dopo 35A. Puo essere rilanciato: cancella solo righe DEMOPLUS.

do $$
declare
  target_email text := 'azienda@camionchiaro.it';
  fallback_company_id uuid := 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976';
  demo_pdf text := 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  target_company_id uuid;
begin
  select cm.company_id
  into target_company_id
  from public.company_members cm
  join auth.users u on u.id = cm.user_id
  where lower(coalesce(u.email, '')) = lower(target_email)
  order by cm.created_at desc
  limit 1;

  target_company_id := coalesce(target_company_id, fallback_company_id);

  delete from public.compliance_items
  where company_id = target_company_id and (document_number like 'DEMOPLUS-%' or notes like '[DEMOPLUS]%');
  delete from public.vehicle_checks where company_id = target_company_id and notes like '[DEMOPLUS]%';
  delete from public.fault_reports
  where company_id = target_company_id and (title like '[DEMOPLUS]%' or description like '[DEMOPLUS]%');

  if to_regclass('public.asset_checks') is not null then
    delete from public.asset_checks where company_id = target_company_id and notes like '[DEMOPLUS]%';
  end if;

  insert into public.compliance_items (
    company_id, driver_id, vehicle_id, person_id, asset_id, scope, type, document_number,
    due_date, reminder_days, owner, status, notes, file_bucket, file_path
  )
  select target_company_id, d.id, null, null, null, 'driver', item.type, item.document_number,
         item.due_date, array[60, 30, 15, 7], item.owner, 'open', item.notes, 'company-assets', demo_pdf
  from public.drivers d
  join (
    values
      ('demo.ahmed', 'CQC merci', 'DEMOPLUS-SCAD-AHMED-CQC', current_date + 22, 'Ufficio traffico', '[DEMOPLUS] CQC Ahmed da rinnovare prima del turno notturno.'),
      ('demo.ahmed', 'Visita medica', 'DEMOPLUS-SCAD-AHMED-MEDICA', current_date + 11, 'Responsabile sicurezza', '[DEMOPLUS] Visita medica Ahmed quasi in scadenza.'),
      ('demo.ionut', 'Carta tachigrafica', 'DEMOPLUS-SCAD-IONUT-TACHO', current_date + 5, 'Ufficio traffico', '[DEMOPLUS] Carta tachigrafica urgente.'),
      ('demo.tomasz', 'ADR base', 'DEMOPLUS-SCAD-TOMASZ-ADR', current_date + 14, 'Responsabile sicurezza', '[DEMOPLUS] ADR Tomasz per tratte estere.'),
      ('demo.sofia', 'Visita medica', 'DEMOPLUS-SCAD-SOFIA-MEDICA', current_date - 2, 'Amministrazione', '[DEMOPLUS] Visita medica Sofia scaduta.')
  ) as item(username, type, document_number, due_date, owner, notes)
    on item.username = d.username
  where d.company_id = target_company_id;

  insert into public.compliance_items (
    company_id, driver_id, vehicle_id, person_id, asset_id, scope, type, document_number,
    due_date, reminder_days, owner, status, notes, file_bucket, file_path
  )
  select target_company_id, null, v.id, null, null, 'vehicle', item.type, item.document_number,
         item.due_date, array[60, 30, 15, 7], item.owner, 'open', item.notes, 'company-assets', demo_pdf
  from public.vehicles v
  join (
    values
      ('DEMOF02', 'Assicurazione RCA DEMOF02', 'DEMOPLUS-SCAD-F02-RCA', current_date + 34, 'Amministrazione', '[DEMOPLUS] Furgone espresso: polizza in rinnovo.'),
      ('DEMOM02', 'Revisione DEMOM02', 'DEMOPLUS-SCAD-M02-REVISIONE', current_date + 2, 'Officina', '[DEMOPLUS] Motrice in manutenzione: revisione da chiudere.'),
      ('DEMOT03', 'Revisione DEMOT03', 'DEMOPLUS-SCAD-T03-REVISIONE', current_date - 1, 'Officina', '[DEMOPLUS] Trattore internazionale con revisione scaduta.'),
      ('DEMOS03', 'ATP semirimorchio frigo', 'DEMOPLUS-SCAD-S03-ATP', current_date + 9, 'Responsabile frigo', '[DEMOPLUS] ATP frigo in scadenza.')
  ) as item(plate, type, document_number, due_date, owner, notes)
    on item.plate = v.plate
  where v.company_id = target_company_id;

  insert into public.compliance_items (
    company_id, driver_id, vehicle_id, person_id, asset_id, scope, type, document_number,
    due_date, reminder_days, owner, status, notes, file_bucket, file_path
  )
  select target_company_id, null, null, p.id, null, 'person', item.type, item.document_number,
         item.due_date, array[60, 30, 15, 7], item.owner, 'open', item.notes, 'company-assets', demo_pdf
  from public.company_people p
  join (
    values
      ('demo.olena', 'Patentino carrello elevatore', 'DEMOPLUS-SCAD-OLENA-PATENTINO', current_date + 17, 'Responsabile magazzino', '[DEMOPLUS] Patentino carrello Olena in scadenza.'),
      ('demo.nicola', 'Visita medica magazzino', 'DEMOPLUS-SCAD-NICOLA-MEDICA', current_date + 4, 'Responsabile sicurezza', '[DEMOPLUS] Visita medica Nicola urgente.'),
      ('demo.valentina', 'Visita medica ufficio', 'DEMOPLUS-SCAD-VALENTINA-MEDICA', current_date + 75, 'Amministrazione', '[DEMOPLUS] Scadenza personale ufficio.')
  ) as item(username, type, document_number, due_date, owner, notes)
    on item.username = p.username
  where p.company_id = target_company_id;

  insert into public.compliance_items (
    company_id, driver_id, vehicle_id, person_id, asset_id, scope, type, document_number,
    due_date, reminder_days, owner, status, notes, file_bucket, file_path
  )
  select target_company_id, null, null, null, a.id, 'asset', item.type, item.document_number,
         item.due_date, array[60, 30, 15, 7], item.owner, 'open', item.notes, 'company-assets', demo_pdf
  from public.company_assets a
  join (
    values
      ('DEMO-MULETTO-02', 'Manutenzione muletto', 'DEMOPLUS-SCAD-MULETTO02-MAN', current_date + 8, 'Magazzino', '[DEMOPLUS] Manutenzione muletto Prato.'),
      ('DEMO-MULETTO-03', 'Controllo batteria muletto', 'DEMOPLUS-SCAD-MULETTO03-BATT', current_date + 1, 'Magazzino', '[DEMOPLUS] Batteria da controllare entro domani.'),
      ('DEMO-CARICABATTERIE-01', 'Verifica locale batterie', 'DEMOPLUS-SCAD-CARICABATT', current_date + 12, 'Responsabile sicurezza', '[DEMOPLUS] Controllo locale batterie.')
  ) as item(code, type, document_number, due_date, owner, notes)
    on item.code = a.code
  where a.company_id = target_company_id;

  insert into public.vehicle_checks (
    company_id, driver_id, tractor_id, semitrailer_id, odometer_km,
    lights_ok, tires_ok, documents_on_board, notes, status, created_at
  )
  select target_company_id, d.id, v.id, s.id, item.km, item.lights_ok, item.tires_ok, item.documents_ok,
         item.notes, item.status, item.created_at
  from (
    values
      ('demo.marco', 'DEMOT01', 'DEMOS01', 612934, true, true, true, '[DEMOPLUS] 06:42 check regolare. Partenza Firenze-Bologna.', 'resolved', now() - interval '9 hours 10 minutes'),
      ('demo.elena', 'DEMOM01', null, 318522, false, true, false, '[DEMOPLUS] 07:05 luce posteriore KO e libretto non trovato in cabina.', 'open', now() - interval '8 hours 50 minutes'),
      ('demo.ahmed', 'DEMOT02', 'DEMOS02', 558341, true, true, true, '[DEMOPLUS] 07:25 check ok, agganciato DEMOS02.', 'resolved', now() - interval '8 hours 30 minutes'),
      ('demo.ionut', 'DEMOT03', 'DEMOS03', 731845, true, false, true, '[DEMOPLUS] 08:10 pressione pneumatico semirimorchio bassa.', 'open', now() - interval '7 hours 45 minutes'),
      ('demo.sofia', 'DEMOF02', null, 129462, true, true, true, '[DEMOPLUS] 09:15 furgone espresso ok, carico farmaceutico.', 'resolved', now() - interval '6 hours 40 minutes'),
      ('demo.tomasz', 'DEMOT02', 'DEMOS01', 558390, true, true, true, '[DEMOPLUS] 13:10 secondo giro, check rapido ok.', 'resolved', now() - interval '2 hours 45 minutes')
  ) as item(username, plate, semiplate, km, lights_ok, tires_ok, documents_ok, notes, status, created_at)
  join public.drivers d on d.company_id = target_company_id and d.username = item.username
  join public.vehicles v on v.company_id = target_company_id and v.plate = item.plate
  left join public.vehicles s on s.company_id = target_company_id and s.plate = item.semiplate;

  insert into public.fault_reports (
    company_id, driver_id, vehicle_id, semitrailer_id, severity, title,
    description, photo_path, status, created_at, updated_at
  )
  select target_company_id, d.id, v.id, s.id, item.severity, item.title, item.description,
         null, item.status, item.created_at, item.updated_at
  from (
    values
      ('demo.elena', 'DEMOM01', null, 'high', '[DEMOPLUS] Luce posteriore sinistra guasta', '[DEMOPLUS] Segnalata durante check 07:05. Mezzo fermo finche officina non sostituisce lampada.', 'open', now() - interval '8 hours 40 minutes', now() - interval '8 hours 10 minutes'),
      ('demo.ionut', 'DEMOT03', 'DEMOS03', 'medium', '[DEMOPLUS] Pressione gomma semirimorchio bassa', '[DEMOPLUS] Controllare pressione prima della partenza tratta lunga.', 'in_progress', now() - interval '7 hours 35 minutes', now() - interval '7 hours'),
      ('demo.ahmed', 'DEMOT02', 'DEMOS02', 'low', '[DEMOPLUS] Sportello gavone duro', '[DEMOPLUS] Si apre con difficolta, da ingrassare a rientro.', 'closed', now() - interval '5 hours 20 minutes', now() - interval '4 hours 55 minutes'),
      ('demo.sofia', 'DEMOF02', null, 'medium', '[DEMOPLUS] Sponda rumorosa', '[DEMOPLUS] Rumore in salita sponda. Utilizzabile ma da verificare in officina.', 'open', now() - interval '80 minutes', now() - interval '80 minutes')
  ) as item(username, plate, semiplate, severity, title, description, status, created_at, updated_at)
  join public.drivers d on d.company_id = target_company_id and d.username = item.username
  join public.vehicles v on v.company_id = target_company_id and v.plate = item.plate
  left join public.vehicles s on s.company_id = target_company_id and s.plate = item.semiplate;

  if to_regclass('public.asset_checks') is not null then
    insert into public.asset_checks (
      company_id, asset_id, person_id, battery_charge_ok, water_level_ok, forks_ok,
      tires_ok, brakes_ok, horn_ok, lights_ok, leaks_ok, damage_ok,
      safety_devices_ok, notes, status, created_at, resolved_at
    )
    select target_company_id, a.id, p.id, item.battery_ok, item.water_ok, item.forks_ok,
           item.tires_ok, item.brakes_ok, item.horn_ok, item.lights_ok, item.leaks_ok,
           item.damage_ok, item.safety_ok, item.notes, item.status, item.created_at, item.resolved_at
    from (
      values
        ('DEMO-MULETTO-01', 'demo.gianni', false, true, true, true, true, true, true, true, true, true, '[DEMOPLUS] 06:30 batteria sotto 25%, messo in carica. Acqua batterie ok.', 'open', now() - interval '9 hours 20 minutes', null),
        ('DEMO-MULETTO-02', 'demo.olena', true, false, true, true, true, true, true, true, true, true, '[DEMOPLUS] 07:00 livello acqua batterie basso, rabbocco richiesto prima del turno.', 'open', now() - interval '8 hours 55 minutes', null),
        ('DEMO-MULETTO-03', 'demo.nicola', true, true, true, true, true, false, true, true, true, true, '[DEMOPLUS] 07:20 clacson non funzionante. Non usare in corsie trafficate.', 'open', now() - interval '8 hours 35 minutes', null),
        ('DEMO-TRANSPALLET-02', 'demo.matteo', true, true, true, true, true, true, true, true, true, true, '[DEMOPLUS] 10:15 transpallet ok, usato per ribalta 4.', 'resolved', now() - interval '5 hours 40 minutes', now() - interval '5 hours 35 minutes'),
        ('DEMO-CARICABATTERIE-01', 'demo.nicola', true, true, true, true, true, true, true, true, false, true, '[DEMOPLUS] 12:05 piccola perdita vicino area carica, segnalata pulizia e sicurezza.', 'open', now() - interval '3 hours 50 minutes', null)
    ) as item(code, username, battery_ok, water_ok, forks_ok, tires_ok, brakes_ok, horn_ok, lights_ok, leaks_ok, damage_ok, safety_ok, notes, status, created_at, resolved_at)
    join public.company_assets a on a.company_id = target_company_id and a.code = item.code
    join public.company_people p on p.company_id = target_company_id and p.username = item.username;
  end if;
end $$;
