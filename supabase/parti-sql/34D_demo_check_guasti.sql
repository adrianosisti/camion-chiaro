-- DEMO CAMION CHIARO - 34D
-- Check, guasti e controlli magazzino. Esegui dopo 34A.

do $$
declare
  target_email text := 'azienda@camionchiaro.it';
  fallback_company_id uuid := 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976';
  target_company_id uuid;
  marco_id uuid;
  elena_id uuid;
  gianni_id uuid;
  motrice_id uuid;
  trattore_id uuid;
  semi_id uuid;
  muletto_id uuid;
  transpallet_id uuid;
begin
  select cm.company_id into target_company_id
  from public.company_members cm
  join auth.users u on u.id = cm.user_id
  where lower(coalesce(u.email, '')) = lower(target_email)
  order by cm.created_at desc
  limit 1;

  target_company_id := coalesce(target_company_id, fallback_company_id);

  select id into marco_id from public.drivers where company_id = target_company_id and username = 'demo.marco';
  select id into elena_id from public.drivers where company_id = target_company_id and username = 'demo.elena';
  select id into gianni_id from public.company_people where company_id = target_company_id and username = 'demo.gianni';
  select id into motrice_id from public.vehicles where company_id = target_company_id and plate = 'DEMOM01';
  select id into trattore_id from public.vehicles where company_id = target_company_id and plate = 'DEMOT01';
  select id into semi_id from public.vehicles where company_id = target_company_id and plate = 'DEMOS01';
  select id into muletto_id from public.company_assets where company_id = target_company_id and code = 'DEMO-MULETTO-01';
  select id into transpallet_id from public.company_assets where company_id = target_company_id and code = 'DEMO-TRANSPALLET-01';

  delete from public.vehicle_checks where company_id = target_company_id and notes like '[DEMO]%';
  delete from public.fault_reports
  where company_id = target_company_id and (title like '[DEMO]%' or description like '[DEMO]%');

  if to_regclass('public.asset_checks') is not null then
    delete from public.asset_checks where company_id = target_company_id and notes like '[DEMO]%';
  end if;

  insert into public.vehicle_checks (
    company_id, driver_id, tractor_id, semitrailer_id, odometer_km,
    lights_ok, tires_ok, documents_on_board, notes, status, created_at
  )
  values
    (target_company_id, marco_id, trattore_id, semi_id, 612901, true, true, true, '[DEMO] Check mattutino regolare, partenza ore 07:45.', 'resolved', now() - interval '1 day'),
    (target_company_id, elena_id, motrice_id, null, 318487, false, true, false, '[DEMO] Luce posteriore sinistra non funzionante e documenti bordo mancanti.', 'open', now() - interval '2 hours');

  insert into public.fault_reports (
    company_id, driver_id, vehicle_id, semitrailer_id, severity, title,
    description, photo_path, status, created_at, updated_at
  )
  values
    (target_company_id, elena_id, motrice_id, null, 'high', '[DEMO] Spia ABS accesa', '[DEMO] Spia ABS accesa dopo avviamento. Mezzo da controllare prima della partenza.', null, 'open', now() - interval '50 minutes', now() - interval '50 minutes'),
    (target_company_id, marco_id, trattore_id, semi_id, 'medium', '[DEMO] Rumore anomalo dal semirimorchio', '[DEMO] Rumore metallico in manovra, richiesta verifica officina.', null, 'in_progress', now() - interval '4 hours', now() - interval '3 hours');

  if to_regclass('public.asset_checks') is not null then
    insert into public.asset_checks (
      company_id, asset_id, person_id, battery_charge_ok, water_level_ok, forks_ok,
      tires_ok, brakes_ok, horn_ok, lights_ok, leaks_ok, damage_ok,
      safety_devices_ok, notes, status, created_at
    )
    values
      (target_company_id, muletto_id, gianni_id, false, true, true, true, true, true, true, true, true, true, '[DEMO] Batteria sotto soglia, mettere in carica prima del turno pomeriggio.', 'open', now() - interval '90 minutes'),
      (target_company_id, transpallet_id, gianni_id, true, true, true, true, true, true, true, true, true, true, '[DEMO] Controllo transpallet regolare.', 'resolved', now() - interval '1 day');
  end if;

  begin
    perform public.ensure_default_team_threads(target_company_id);
  exception
    when undefined_function or undefined_table then
      null;
    when others then
      null;
  end;
end $$;
