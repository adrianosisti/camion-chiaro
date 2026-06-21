-- DATI DEMO CAMION CHIARO - PARTE 34
-- Esegui dopo i file 31/32 se vuoi riempire l'azienda di prova con persone,
-- mezzi, documenti, scadenze, check, guasti e muletti.
-- Puoi rilanciarlo: aggiorna gli stessi dati demo senza duplicarli.

do $$
declare
  target_email text := 'azienda@camionchiaro.it';
  fallback_company_id uuid := 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976';
  target_company_id uuid;

  marco_driver_id uuid;
  elena_driver_id uuid;
  luca_driver_id uuid;

  paola_person_id uuid;
  gianni_person_id uuid;
  sara_person_id uuid;

  furgone_id uuid;
  motrice_id uuid;
  trattore_id uuid;
  semirimorchio_id uuid;
  forklift_id uuid;
  pallet_truck_id uuid;
begin
  select cm.company_id
  into target_company_id
  from public.company_members cm
  join auth.users u on u.id = cm.user_id
  where lower(coalesce(u.email, '')) = lower(target_email)
  order by cm.created_at desc
  limit 1;

  target_company_id := coalesce(target_company_id, fallback_company_id);

  if not exists (select 1 from public.companies where id = target_company_id) then
    raise exception 'Azienda demo non trovata. Email cercata: %, fallback ID: %', target_email, fallback_company_id;
  end if;

  raise notice 'Dati demo caricati nell azienda %', target_company_id;

  if to_regclass('public.driver_document_events') is not null then
    delete from public.driver_document_events
    where company_id = target_company_id
      and document_number like 'DEMO-%';
  end if;

  if to_regclass('public.vehicle_documents') is not null then
    delete from public.vehicle_documents
    where company_id = target_company_id
      and document_number like 'DEMO-%';
  end if;

  delete from public.driver_documents
  where company_id = target_company_id
    and document_number like 'DEMO-%';

  delete from public.compliance_items
  where company_id = target_company_id
    and (
      document_number like 'DEMO-%'
      or notes like '[DEMO]%'
    );

  delete from public.vehicle_checks
  where company_id = target_company_id
    and notes like '[DEMO]%';

  delete from public.fault_reports
  where company_id = target_company_id
    and (
      title like '[DEMO]%'
      or description like '[DEMO]%'
    );

  if to_regclass('public.asset_checks') is not null then
    delete from public.asset_checks
    where company_id = target_company_id
      and notes like '[DEMO]%';
  end if;

  insert into public.drivers (
    company_id,
    username,
    auth_email,
    full_name,
    email,
    phone,
    role,
    depot,
    status
  )
  values
    (
      target_company_id,
      'demo.marco',
      null,
      'Marco Bianchi',
      'marco.bianchi.demo@camionchiaro.local',
      '+393331110001',
      'Autista linea nord',
      'Deposito Firenze',
      'active'
    )
  on conflict (company_id, username) do update
  set
    auth_email = excluded.auth_email,
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    role = excluded.role,
    depot = excluded.depot,
    status = excluded.status,
    updated_at = now()
  returning id into marco_driver_id;

  insert into public.drivers (
    company_id,
    username,
    auth_email,
    full_name,
    email,
    phone,
    role,
    depot,
    status
  )
  values
    (
      target_company_id,
      'demo.elena',
      null,
      'Elena Stufetta',
      'elena.stufetta.demo@camionchiaro.local',
      '+393331110002',
      'Autista distribuzione',
      'Deposito Prato',
      'active'
    )
  on conflict (company_id, username) do update
  set
    auth_email = excluded.auth_email,
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    role = excluded.role,
    depot = excluded.depot,
    status = excluded.status,
    updated_at = now()
  returning id into elena_driver_id;

  insert into public.drivers (
    company_id,
    username,
    auth_email,
    full_name,
    email,
    phone,
    role,
    depot,
    status
  )
  values
    (
      target_company_id,
      'demo.luca',
      null,
      'Luca Ferri',
      'luca.ferri.demo@camionchiaro.local',
      '+393331110003',
      'Autista tratte estere',
      'Deposito Bologna',
      'available'
    )
  on conflict (company_id, username) do update
  set
    auth_email = excluded.auth_email,
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    role = excluded.role,
    depot = excluded.depot,
    status = excluded.status,
    updated_at = now()
  returning id into luca_driver_id;

  insert into public.company_people (
    company_id,
    username,
    auth_email,
    full_name,
    email,
    phone,
    department,
    person_type,
    job_title,
    depot,
    status
  )
  values
    (
      target_company_id,
      'demo.paola',
      'demo.paola@camionchiaro.local',
      'Paola Conti',
      'paola.conti.demo@camionchiaro.local',
      '+393331110101',
      'office',
      'office',
      'Ufficio traffico',
      'Sede centrale',
      'active'
    )
  on conflict (company_id, username) where username is not null do update
  set
    auth_email = excluded.auth_email,
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    department = excluded.department,
    person_type = excluded.person_type,
    job_title = excluded.job_title,
    depot = excluded.depot,
    status = excluded.status,
    updated_at = now()
  returning id into paola_person_id;

  insert into public.company_people (
    company_id,
    username,
    auth_email,
    full_name,
    email,
    phone,
    department,
    person_type,
    job_title,
    depot,
    status
  )
  values
    (
      target_company_id,
      'demo.gianni',
      'demo.gianni@camionchiaro.local',
      'Gianni Russo',
      'gianni.russo.demo@camionchiaro.local',
      '+393331110102',
      'warehouse',
      'forklift_operator',
      'Magazziniere carrellista',
      'Magazzino Firenze',
      'active'
    )
  on conflict (company_id, username) where username is not null do update
  set
    auth_email = excluded.auth_email,
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    department = excluded.department,
    person_type = excluded.person_type,
    job_title = excluded.job_title,
    depot = excluded.depot,
    status = excluded.status,
    updated_at = now()
  returning id into gianni_person_id;

  insert into public.company_people (
    company_id,
    username,
    auth_email,
    full_name,
    email,
    phone,
    department,
    person_type,
    job_title,
    depot,
    status
  )
  values
    (
      target_company_id,
      'demo.sara',
      'demo.sara@camionchiaro.local',
      'Sara Neri',
      'sara.neri.demo@camionchiaro.local',
      '+393331110103',
      'office',
      'office',
      'Amministrazione',
      'Sede centrale',
      'active'
    )
  on conflict (company_id, username) where username is not null do update
  set
    auth_email = excluded.auth_email,
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    department = excluded.department,
    person_type = excluded.person_type,
    job_title = excluded.job_title,
    depot = excluded.depot,
    status = excluded.status,
    updated_at = now()
  returning id into sara_person_id;

  insert into public.vehicles (company_id, plate, model, type, fleet_type, km, status)
  values
    (target_company_id, 'DEMOF01', 'Iveco Daily 35C16', 'Furgone frigo', 'furgone', 84200, 'active')
  on conflict (company_id, plate) do update
  set
    model = excluded.model,
    type = excluded.type,
    fleet_type = excluded.fleet_type,
    km = excluded.km,
    status = excluded.status,
    updated_at = now()
  returning id into furgone_id;

  insert into public.vehicles (company_id, plate, model, type, fleet_type, km, status)
  values
    (target_company_id, 'DEMOM01', 'MAN TGM 18.290', 'Motrice telonata', 'motrice', 318450, 'watch')
  on conflict (company_id, plate) do update
  set
    model = excluded.model,
    type = excluded.type,
    fleet_type = excluded.fleet_type,
    km = excluded.km,
    status = excluded.status,
    updated_at = now()
  returning id into motrice_id;

  insert into public.vehicles (company_id, plate, model, type, fleet_type, km, status)
  values
    (target_company_id, 'DEMOT01', 'Volvo FH 500', 'Trattore stradale', 'trattore', 612880, 'active')
  on conflict (company_id, plate) do update
  set
    model = excluded.model,
    type = excluded.type,
    fleet_type = excluded.fleet_type,
    km = excluded.km,
    status = excluded.status,
    updated_at = now()
  returning id into trattore_id;

  insert into public.vehicles (company_id, plate, model, type, fleet_type, km, status)
  values
    (target_company_id, 'DEMOS01', 'Schmitz Cargobull', 'Semirimorchio centinato', 'semirimorchio', 0, 'active')
  on conflict (company_id, plate) do update
  set
    model = excluded.model,
    type = excluded.type,
    fleet_type = excluded.fleet_type,
    km = excluded.km,
    status = excluded.status,
    updated_at = now()
  returning id into semirimorchio_id;

  insert into public.company_assets (company_id, asset_type, code, model, serial_number, location, status)
  values
    (target_company_id, 'forklift', 'DEMO-MULETTO-01', 'Toyota Traigo 48', 'DEMO-SN-0001', 'Magazzino Firenze', 'active')
  on conflict (company_id, code) do update
  set
    asset_type = excluded.asset_type,
    model = excluded.model,
    serial_number = excluded.serial_number,
    location = excluded.location,
    status = excluded.status,
    updated_at = now()
  returning id into forklift_id;

  insert into public.company_assets (company_id, asset_type, code, model, serial_number, location, status)
  values
    (target_company_id, 'pallet_truck', 'DEMO-TRANSPALLET-01', 'Still EXU 16', 'DEMO-SN-0002', 'Magazzino Prato', 'watch')
  on conflict (company_id, code) do update
  set
    asset_type = excluded.asset_type,
    model = excluded.model,
    serial_number = excluded.serial_number,
    location = excluded.location,
    status = excluded.status,
    updated_at = now()
  returning id into pallet_truck_id;

  insert into public.driver_documents (
    company_id,
    driver_id,
    type,
    document_number,
    expires_at,
    file_path,
    status,
    visible_to_driver
  )
  values
    (target_company_id, marco_driver_id, 'Patente C+E', 'DEMO-MARCO-PATENTE', current_date + 18, null, 'uploaded', true),
    (target_company_id, marco_driver_id, 'CQC merci', 'DEMO-MARCO-CQC', current_date + 42, null, 'uploaded', true),
    (target_company_id, marco_driver_id, 'Carta tachigrafica', 'DEMO-MARCO-TACHO', current_date + 95, null, 'verified', true),
    (target_company_id, elena_driver_id, 'Patente C', 'DEMO-ELENA-PATENTE', current_date - 8, null, 'expired', true),
    (target_company_id, elena_driver_id, 'Visita medica', 'DEMO-ELENA-MEDICA', current_date + 6, null, 'uploaded', true),
    (target_company_id, luca_driver_id, 'ADR base', 'DEMO-LUCA-ADR', current_date + 24, null, 'uploaded', true),
    (target_company_id, luca_driver_id, 'CQC merci', 'DEMO-LUCA-CQC', current_date + 160, null, 'verified', true);

  insert into public.vehicle_documents (
    company_id,
    vehicle_id,
    type,
    document_number,
    expires_at,
    file_bucket,
    file_path,
    status,
    notes
  )
  values
    (target_company_id, furgone_id, 'Assicurazione RCA', 'DEMO-FURGONE-RCA', current_date + 12, 'company-assets', null, 'uploaded', '[DEMO] Documento mezzo pronto da caricare.'),
    (target_company_id, furgone_id, 'Libretto', 'DEMO-FURGONE-LIBRETTO', current_date + 720, 'company-assets', null, 'verified', '[DEMO] Libretto mezzo.'),
    (target_company_id, motrice_id, 'Revisione mezzo', 'DEMO-MOTRICE-REVISIONE', current_date - 3, 'company-assets', null, 'expired', '[DEMO] Revisione scaduta.'),
    (target_company_id, trattore_id, 'Assicurazione RCA', 'DEMO-TRATTORE-RCA', current_date + 28, 'company-assets', null, 'uploaded', '[DEMO] Scadenza vicina.'),
    (target_company_id, semirimorchio_id, 'Revisione semirimorchio', 'DEMO-SEMI-REVISIONE', current_date + 54, 'company-assets', null, 'uploaded', '[DEMO] Revisione semirimorchio.');

  insert into public.compliance_items (
    company_id,
    driver_id,
    vehicle_id,
    person_id,
    asset_id,
    scope,
    type,
    document_number,
    due_date,
    reminder_days,
    owner,
    status,
    notes,
    file_bucket,
    file_path
  )
  values
    (target_company_id, marco_driver_id, null, null, null, 'driver', 'Patente C+E', 'DEMO-SCAD-MARCO-PATENTE', current_date + 18, array[60, 30, 15, 7], 'Ufficio traffico', 'open', '[DEMO] Patente Marco in scadenza.', 'company-assets', null),
    (target_company_id, marco_driver_id, null, null, null, 'driver', 'CQC merci', 'DEMO-SCAD-MARCO-CQC', current_date + 42, array[60, 30, 15, 7], 'Ufficio traffico', 'open', '[DEMO] CQC Marco da pianificare.', 'company-assets', null),
    (target_company_id, elena_driver_id, null, null, null, 'driver', 'Patente C', 'DEMO-SCAD-ELENA-PATENTE', current_date - 8, array[60, 30, 15, 7], 'Ufficio traffico', 'open', '[DEMO] Documento scaduto: blocco operativo da gestire.', 'company-assets', null),
    (target_company_id, elena_driver_id, null, null, null, 'driver', 'Visita medica', 'DEMO-SCAD-ELENA-MEDICA', current_date + 6, array[60, 30, 15, 7], 'Ufficio traffico', 'open', '[DEMO] Visita medica urgente.', 'company-assets', null),
    (target_company_id, luca_driver_id, null, null, null, 'driver', 'ADR base', 'DEMO-SCAD-LUCA-ADR', current_date + 24, array[60, 30, 15, 7], 'Responsabile sicurezza', 'open', '[DEMO] Formazione ADR da rinnovare.', 'company-assets', null),
    (target_company_id, null, furgone_id, null, null, 'vehicle', 'Assicurazione RCA DEMOF01', 'DEMO-SCAD-FURGONE-RCA', current_date + 12, array[60, 30, 15, 7], 'Amministrazione', 'open', '[DEMO] Assicurazione furgone in scadenza.', 'company-assets', null),
    (target_company_id, null, motrice_id, null, null, 'vehicle', 'Revisione DEMOM01', 'DEMO-SCAD-MOTRICE-REV', current_date - 3, array[60, 30, 15, 7], 'Officina', 'open', '[DEMO] Revisione motrice scaduta.', 'company-assets', null),
    (target_company_id, null, trattore_id, null, null, 'vehicle', 'Assicurazione DEMOT01', 'DEMO-SCAD-TRATTORE-RCA', current_date + 28, array[60, 30, 15, 7], 'Amministrazione', 'open', '[DEMO] Assicurazione trattore tra 28 giorni.', 'company-assets', null),
    (target_company_id, null, semirimorchio_id, null, null, 'vehicle', 'Revisione DEMOS01', 'DEMO-SCAD-SEMI-REV', current_date + 54, array[60, 30, 15, 7], 'Officina', 'open', '[DEMO] Revisione semirimorchio programmabile.', 'company-assets', null),
    (target_company_id, null, null, gianni_person_id, null, 'person', 'Patentino carrello elevatore', 'DEMO-SCAD-GIANNI-PATENTINO', current_date + 31, array[60, 30, 15, 7], 'Responsabile magazzino', 'open', '[DEMO] Patentino carrello da rinnovare.', 'company-assets', null),
    (target_company_id, null, null, gianni_person_id, null, 'person', 'Visita medica magazzino', 'DEMO-SCAD-GIANNI-MEDICA', current_date + 9, array[60, 30, 15, 7], 'Responsabile sicurezza', 'open', '[DEMO] Visita medica carrellista urgente.', 'company-assets', null),
    (target_company_id, null, null, sara_person_id, null, 'person', 'Visita medica ufficio', 'DEMO-SCAD-SARA-MEDICA', current_date + 84, array[60, 30, 15, 7], 'Amministrazione', 'open', '[DEMO] Scadenza personale ufficio.', 'company-assets', null),
    (target_company_id, null, null, null, forklift_id, 'asset', 'Manutenzione muletto DEMO-MULETTO-01', 'DEMO-SCAD-MULETTO-MAN', current_date + 16, array[60, 30, 15, 7], 'Magazzino', 'open', '[DEMO] Manutenzione muletto in scadenza.', 'company-assets', null),
    (target_company_id, null, null, null, pallet_truck_id, 'asset', 'Controllo transpallet DEMO-TRANSPALLET-01', 'DEMO-SCAD-TRANSPALLET', current_date + 22, array[60, 30, 15, 7], 'Magazzino', 'open', '[DEMO] Controllo attrezzatura magazzino.', 'company-assets', null),
    (target_company_id, null, null, null, null, 'company', 'DURC aziendale', 'DEMO-SCAD-DURC', current_date + 37, array[60, 30, 15, 7], 'Amministrazione', 'open', '[DEMO] Documento aziendale da monitorare.', 'company-assets', null);

  insert into public.vehicle_checks (
    company_id,
    driver_id,
    tractor_id,
    semitrailer_id,
    odometer_km,
    lights_ok,
    tires_ok,
    documents_on_board,
    notes,
    status,
    created_at
  )
  values
    (
      target_company_id,
      marco_driver_id,
      trattore_id,
      semirimorchio_id,
      612901,
      true,
      true,
      true,
      '[DEMO] Check mattutino regolare, partenza ore 07:45.',
      'resolved',
      now() - interval '1 day'
    ),
    (
      target_company_id,
      elena_driver_id,
      motrice_id,
      null,
      318487,
      false,
      true,
      false,
      '[DEMO] Luce posteriore sinistra non funzionante e documenti bordo mancanti.',
      'open',
      now() - interval '2 hours'
    );

  insert into public.fault_reports (
    company_id,
    driver_id,
    vehicle_id,
    semitrailer_id,
    severity,
    title,
    description,
    photo_path,
    status,
    created_at,
    updated_at
  )
  values
    (
      target_company_id,
      elena_driver_id,
      motrice_id,
      null,
      'high',
      '[DEMO] Spia ABS accesa',
      '[DEMO] Spia ABS accesa dopo avviamento. Mezzo da controllare prima della partenza.',
      null,
      'open',
      now() - interval '50 minutes',
      now() - interval '50 minutes'
    ),
    (
      target_company_id,
      marco_driver_id,
      trattore_id,
      semirimorchio_id,
      'medium',
      '[DEMO] Rumore anomalo dal semirimorchio',
      '[DEMO] Rumore metallico in manovra, richiesta verifica officina.',
      null,
      'in_progress',
      now() - interval '4 hours',
      now() - interval '3 hours'
    );

  if to_regclass('public.asset_checks') is not null then
    insert into public.asset_checks (
      company_id,
      asset_id,
      person_id,
      battery_charge_ok,
      water_level_ok,
      forks_ok,
      tires_ok,
      brakes_ok,
      horn_ok,
      lights_ok,
      leaks_ok,
      damage_ok,
      safety_devices_ok,
      notes,
      status,
      created_at
    )
    values
      (
        target_company_id,
        forklift_id,
        gianni_person_id,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        '[DEMO] Batteria sotto soglia, mettere in carica prima del turno pomeriggio.',
        'open',
        now() - interval '90 minutes'
      ),
      (
        target_company_id,
        pallet_truck_id,
        gianni_person_id,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        '[DEMO] Controllo transpallet regolare.',
        'resolved',
        now() - interval '1 day'
      );
  end if;

  begin
    perform public.ensure_default_team_threads(target_company_id);
  exception
    when undefined_function or undefined_table then
      null;
  end;
end $$;
