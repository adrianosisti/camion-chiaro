-- DEMO CAMION CHIARO - 34C
-- Scadenze documentali autisti, mezzi, azienda, ufficio, magazzino e muletti. Esegui dopo 34A.

do $$
declare
  target_email text := 'azienda@camionchiaro.it';
  fallback_company_id uuid := 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976';
  target_company_id uuid;
  marco_id uuid;
  elena_id uuid;
  luca_id uuid;
  gianni_id uuid;
  sara_id uuid;
  furgone_id uuid;
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
  select id into luca_id from public.drivers where company_id = target_company_id and username = 'demo.luca';
  select id into gianni_id from public.company_people where company_id = target_company_id and username = 'demo.gianni';
  select id into sara_id from public.company_people where company_id = target_company_id and username = 'demo.sara';
  select id into furgone_id from public.vehicles where company_id = target_company_id and plate = 'DEMOF01';
  select id into motrice_id from public.vehicles where company_id = target_company_id and plate = 'DEMOM01';
  select id into trattore_id from public.vehicles where company_id = target_company_id and plate = 'DEMOT01';
  select id into semi_id from public.vehicles where company_id = target_company_id and plate = 'DEMOS01';
  select id into muletto_id from public.company_assets where company_id = target_company_id and code = 'DEMO-MULETTO-01';
  select id into transpallet_id from public.company_assets where company_id = target_company_id and code = 'DEMO-TRANSPALLET-01';

  delete from public.compliance_items
  where company_id = target_company_id and (document_number like 'DEMO-%' or notes like '[DEMO]%');

  insert into public.compliance_items (
    company_id, driver_id, vehicle_id, person_id, asset_id, scope, type, document_number,
    due_date, reminder_days, owner, status, notes, file_bucket, file_path
  )
  values
    (target_company_id, marco_id, null, null, null, 'driver', 'Patente C+E', 'DEMO-SCAD-MARCO-PATENTE', current_date + 18, array[60, 30, 15, 7], 'Ufficio traffico', 'open', '[DEMO] Patente Marco in scadenza.', 'company-assets', null),
    (target_company_id, marco_id, null, null, null, 'driver', 'CQC merci', 'DEMO-SCAD-MARCO-CQC', current_date + 42, array[60, 30, 15, 7], 'Ufficio traffico', 'open', '[DEMO] CQC Marco da pianificare.', 'company-assets', null),
    (target_company_id, elena_id, null, null, null, 'driver', 'Patente C', 'DEMO-SCAD-ELENA-PATENTE', current_date - 8, array[60, 30, 15, 7], 'Ufficio traffico', 'open', '[DEMO] Documento scaduto: blocco operativo da gestire.', 'company-assets', null),
    (target_company_id, elena_id, null, null, null, 'driver', 'Visita medica', 'DEMO-SCAD-ELENA-MEDICA', current_date + 6, array[60, 30, 15, 7], 'Ufficio traffico', 'open', '[DEMO] Visita medica urgente.', 'company-assets', null),
    (target_company_id, luca_id, null, null, null, 'driver', 'ADR base', 'DEMO-SCAD-LUCA-ADR', current_date + 24, array[60, 30, 15, 7], 'Responsabile sicurezza', 'open', '[DEMO] Formazione ADR da rinnovare.', 'company-assets', null),
    (target_company_id, null, furgone_id, null, null, 'vehicle', 'Assicurazione RCA DEMOF01', 'DEMO-SCAD-FURGONE-RCA', current_date + 12, array[60, 30, 15, 7], 'Amministrazione', 'open', '[DEMO] Assicurazione furgone in scadenza.', 'company-assets', null),
    (target_company_id, null, motrice_id, null, null, 'vehicle', 'Revisione DEMOM01', 'DEMO-SCAD-MOTRICE-REV', current_date - 3, array[60, 30, 15, 7], 'Officina', 'open', '[DEMO] Revisione motrice scaduta.', 'company-assets', null),
    (target_company_id, null, trattore_id, null, null, 'vehicle', 'Assicurazione DEMOT01', 'DEMO-SCAD-TRATTORE-RCA', current_date + 28, array[60, 30, 15, 7], 'Amministrazione', 'open', '[DEMO] Assicurazione trattore tra 28 giorni.', 'company-assets', null),
    (target_company_id, null, semi_id, null, null, 'vehicle', 'Revisione DEMOS01', 'DEMO-SCAD-SEMI-REV', current_date + 54, array[60, 30, 15, 7], 'Officina', 'open', '[DEMO] Revisione semirimorchio programmabile.', 'company-assets', null),
    (target_company_id, null, null, gianni_id, null, 'person', 'Patentino carrello elevatore', 'DEMO-SCAD-GIANNI-PATENTINO', current_date + 31, array[60, 30, 15, 7], 'Responsabile magazzino', 'open', '[DEMO] Patentino carrello da rinnovare.', 'company-assets', null),
    (target_company_id, null, null, gianni_id, null, 'person', 'Visita medica magazzino', 'DEMO-SCAD-GIANNI-MEDICA', current_date + 9, array[60, 30, 15, 7], 'Responsabile sicurezza', 'open', '[DEMO] Visita medica carrellista urgente.', 'company-assets', null),
    (target_company_id, null, null, sara_id, null, 'person', 'Visita medica ufficio', 'DEMO-SCAD-SARA-MEDICA', current_date + 84, array[60, 30, 15, 7], 'Amministrazione', 'open', '[DEMO] Scadenza personale ufficio.', 'company-assets', null),
    (target_company_id, null, null, null, muletto_id, 'asset', 'Manutenzione muletto DEMO-MULETTO-01', 'DEMO-SCAD-MULETTO-MAN', current_date + 16, array[60, 30, 15, 7], 'Magazzino', 'open', '[DEMO] Manutenzione muletto in scadenza.', 'company-assets', null),
    (target_company_id, null, null, null, transpallet_id, 'asset', 'Controllo transpallet DEMO-TRANSPALLET-01', 'DEMO-SCAD-TRANSPALLET', current_date + 22, array[60, 30, 15, 7], 'Magazzino', 'open', '[DEMO] Controllo attrezzatura magazzino.', 'company-assets', null),
    (target_company_id, null, null, null, null, 'company', 'DURC aziendale', 'DEMO-SCAD-DURC', current_date + 37, array[60, 30, 15, 7], 'Amministrazione', 'open', '[DEMO] Documento aziendale da monitorare.', 'company-assets', null);
end $$;

