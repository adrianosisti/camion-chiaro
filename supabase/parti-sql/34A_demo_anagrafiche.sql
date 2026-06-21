-- DEMO CAMION CHIARO - 34A
-- Anagrafiche base per azienda@camionchiaro.it: autisti, ufficio, magazzino, flotta e muletti.

do $$
declare
  target_email text := 'azienda@camionchiaro.it';
  fallback_company_id uuid := 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976';
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

  if not exists (select 1 from public.companies where id = target_company_id) then
    raise exception 'Azienda demo non trovata. Email: %, fallback ID: %', target_email, fallback_company_id;
  end if;

  if to_regclass('public.asset_checks') is not null then
    delete from public.asset_checks where company_id = target_company_id and notes like '[DEMO]%';
  end if;

  delete from public.vehicle_checks where company_id = target_company_id and notes like '[DEMO]%';
  delete from public.fault_reports
  where company_id = target_company_id and (title like '[DEMO]%' or description like '[DEMO]%');
  delete from public.compliance_items
  where company_id = target_company_id and (document_number like 'DEMO-%' or notes like '[DEMO]%');
  delete from public.driver_documents where company_id = target_company_id and document_number like 'DEMO-%';

  if to_regclass('public.vehicle_documents') is not null then
    delete from public.vehicle_documents where company_id = target_company_id and document_number like 'DEMO-%';
  end if;

  insert into public.drivers (company_id, username, auth_email, full_name, email, phone, role, depot, status)
  values
    (target_company_id, 'demo.marco', null, 'Marco Bianchi', 'marco.bianchi.demo@camionchiaro.local', '+393331110001', 'Autista linea nord', 'Deposito Firenze', 'active'),
    (target_company_id, 'demo.elena', null, 'Elena Stufetta', 'elena.stufetta.demo@camionchiaro.local', '+393331110002', 'Autista distribuzione', 'Deposito Prato', 'active'),
    (target_company_id, 'demo.luca', null, 'Luca Ferri', 'luca.ferri.demo@camionchiaro.local', '+393331110003', 'Autista tratte estere', 'Deposito Bologna', 'available')
  on conflict (company_id, username) do update
  set
    auth_email = excluded.auth_email,
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    role = excluded.role,
    depot = excluded.depot,
    status = excluded.status,
    updated_at = now();

  insert into public.company_people (
    company_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status
  )
  values
    (target_company_id, 'demo.paola', 'demo.paola@camionchiaro.local', 'Paola Conti', 'paola.conti.demo@camionchiaro.local', '+393331110101', 'office', 'office', 'Ufficio traffico', 'Sede centrale', 'active'),
    (target_company_id, 'demo.gianni', 'demo.gianni@camionchiaro.local', 'Gianni Russo', 'gianni.russo.demo@camionchiaro.local', '+393331110102', 'warehouse', 'forklift_operator', 'Magazziniere carrellista', 'Magazzino Firenze', 'active'),
    (target_company_id, 'demo.sara', 'demo.sara@camionchiaro.local', 'Sara Neri', 'sara.neri.demo@camionchiaro.local', '+393331110103', 'office', 'office', 'Amministrazione', 'Sede centrale', 'active')
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
    updated_at = now();

  insert into public.vehicles (company_id, plate, model, type, fleet_type, km, status)
  values
    (target_company_id, 'DEMOF01', 'Iveco Daily 35C16', 'Furgone frigo', 'furgone', 84200, 'active'),
    (target_company_id, 'DEMOM01', 'MAN TGM 18.290', 'Motrice telonata', 'motrice', 318450, 'watch'),
    (target_company_id, 'DEMOT01', 'Volvo FH 500', 'Trattore stradale', 'trattore', 612880, 'active'),
    (target_company_id, 'DEMOS01', 'Schmitz Cargobull', 'Semirimorchio centinato', 'semirimorchio', 0, 'active')
  on conflict (company_id, plate) do update
  set
    model = excluded.model,
    type = excluded.type,
    fleet_type = excluded.fleet_type,
    km = excluded.km,
    status = excluded.status,
    updated_at = now();

  insert into public.company_assets (company_id, asset_type, code, model, serial_number, location, status)
  values
    (target_company_id, 'forklift', 'DEMO-MULETTO-01', 'Toyota Traigo 48', 'DEMO-SN-0001', 'Magazzino Firenze', 'active'),
    (target_company_id, 'pallet_truck', 'DEMO-TRANSPALLET-01', 'Still EXU 16', 'DEMO-SN-0002', 'Magazzino Prato', 'watch')
  on conflict (company_id, code) do update
  set
    asset_type = excluded.asset_type,
    model = excluded.model,
    serial_number = excluded.serial_number,
    location = excluded.location,
    status = excluded.status,
    updated_at = now();
end $$;

