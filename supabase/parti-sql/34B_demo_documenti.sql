-- DEMO CAMION CHIARO - 34B
-- Documenti autisti e documenti mezzi. Esegui dopo 34A.

do $$
declare
  target_email text := 'azienda@camionchiaro.it';
  fallback_company_id uuid := 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976';
  target_company_id uuid;
  marco_id uuid;
  elena_id uuid;
  luca_id uuid;
  furgone_id uuid;
  motrice_id uuid;
  trattore_id uuid;
  semi_id uuid;
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
  select id into luca_id from public.drivers where company_id = target_company_id and username = 'demo.luca';
  select id into furgone_id from public.vehicles where company_id = target_company_id and plate = 'DEMOF01';
  select id into motrice_id from public.vehicles where company_id = target_company_id and plate = 'DEMOM01';
  select id into trattore_id from public.vehicles where company_id = target_company_id and plate = 'DEMOT01';
  select id into semi_id from public.vehicles where company_id = target_company_id and plate = 'DEMOS01';

  delete from public.driver_documents where company_id = target_company_id and document_number like 'DEMO-%';

  if to_regclass('public.vehicle_documents') is not null then
    delete from public.vehicle_documents where company_id = target_company_id and document_number like 'DEMO-%';
  end if;

  insert into public.driver_documents (
    company_id, driver_id, type, document_number, expires_at, file_path, status, visible_to_driver
  )
  values
    (target_company_id, marco_id, 'Patente C+E', 'DEMO-MARCO-PATENTE', current_date + 18, null, 'uploaded', true),
    (target_company_id, marco_id, 'CQC merci', 'DEMO-MARCO-CQC', current_date + 42, null, 'uploaded', true),
    (target_company_id, marco_id, 'Carta tachigrafica', 'DEMO-MARCO-TACHO', current_date + 95, null, 'verified', true),
    (target_company_id, elena_id, 'Patente C', 'DEMO-ELENA-PATENTE', current_date - 8, null, 'expired', true),
    (target_company_id, elena_id, 'Visita medica', 'DEMO-ELENA-MEDICA', current_date + 6, null, 'uploaded', true),
    (target_company_id, luca_id, 'ADR base', 'DEMO-LUCA-ADR', current_date + 24, null, 'uploaded', true),
    (target_company_id, luca_id, 'CQC merci', 'DEMO-LUCA-CQC', current_date + 160, null, 'verified', true);

  if to_regclass('public.vehicle_documents') is not null then
    insert into public.vehicle_documents (
      company_id, vehicle_id, type, document_number, expires_at, file_bucket, file_path, status, notes
    )
    values
      (target_company_id, furgone_id, 'Assicurazione RCA', 'DEMO-FURGONE-RCA', current_date + 12, 'company-assets', null, 'uploaded', '[DEMO] Documento mezzo pronto da caricare.'),
      (target_company_id, furgone_id, 'Libretto', 'DEMO-FURGONE-LIBRETTO', current_date + 720, 'company-assets', null, 'verified', '[DEMO] Libretto mezzo.'),
      (target_company_id, motrice_id, 'Revisione mezzo', 'DEMO-MOTRICE-REVISIONE', current_date - 3, 'company-assets', null, 'expired', '[DEMO] Revisione scaduta.'),
      (target_company_id, trattore_id, 'Assicurazione RCA', 'DEMO-TRATTORE-RCA', current_date + 28, 'company-assets', null, 'uploaded', '[DEMO] Scadenza vicina.'),
      (target_company_id, semi_id, 'Revisione semirimorchio', 'DEMO-SEMI-REVISIONE', current_date + 54, 'company-assets', null, 'uploaded', '[DEMO] Revisione semirimorchio.');
  end if;
end $$;

