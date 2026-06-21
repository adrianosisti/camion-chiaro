-- DEMO PLUS CAMION CHIARO - 35A1
-- Anagrafiche: autisti, persone ufficio/magazzino, flotta e attrezzature.
-- Esegui prima di 35A2 e 35A3.

with target as (
  select coalesce(
    (
      select cm.company_id
      from public.company_members cm
      join auth.users u on u.id = cm.user_id
      where lower(coalesce(u.email, '')) = lower('azienda@camionchiaro.it')
      order by cm.created_at desc
      limit 1
    ),
    'eaad6dc3-4cab-42e6-9d56-b9a3676ad976'::uuid
  ) as company_id
)
insert into public.drivers (company_id, username, auth_email, full_name, email, phone, role, depot, status)
select target.company_id, src.username, null, src.full_name, src.email, src.phone, src.role, src.depot, src.status
from target
cross join (
  values
    ('demo.ahmed', 'Ahmed Benali', 'ahmed.benali.demo@camionchiaro.local', '+393331110004', 'Autista notturno', 'Deposito Firenze', 'active'),
    ('demo.ionut', 'Ionut Popescu', 'ionut.popescu.demo@camionchiaro.local', '+393331110005', 'Autista bilico', 'Deposito Bologna', 'travelling'),
    ('demo.tomasz', 'Tomasz Kowalski', 'tomasz.kowalski.demo@camionchiaro.local', '+393331110006', 'Autista internazionale', 'Deposito Verona', 'available'),
    ('demo.sofia', 'Sofia Rinaldi', 'sofia.rinaldi.demo@camionchiaro.local', '+393331110007', 'Autista furgone urgente', 'Deposito Prato', 'active')
) as src(username, full_name, email, phone, role, depot, status)
on conflict (company_id, username) do update
set full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    role = excluded.role,
    depot = excluded.depot,
    status = excluded.status,
    updated_at = now();

with target as (
  select coalesce((select cm.company_id from public.company_members cm join auth.users u on u.id = cm.user_id where lower(coalesce(u.email, '')) = lower('azienda@camionchiaro.it') order by cm.created_at desc limit 1), 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976'::uuid) as company_id
)
insert into public.company_people (
  company_id, username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status
)
select target.company_id, src.username, src.auth_email, src.full_name, src.email, src.phone, src.department, src.person_type, src.job_title, src.depot, src.status
from target
cross join (
  values
    ('demo.roberto', 'demo.roberto@camionchiaro.local', 'Roberto Galli', 'roberto.galli.demo@camionchiaro.local', '+393331110104', 'office', 'office', 'Ufficio traffico sera', 'Sede centrale', 'active'),
    ('demo.valentina', 'demo.valentina@camionchiaro.local', 'Valentina Costa', 'valentina.costa.demo@camionchiaro.local', '+393331110105', 'office', 'office', 'Amministrazione fornitori', 'Sede centrale', 'active'),
    ('demo.matteo', 'demo.matteo@camionchiaro.local', 'Matteo Greco', 'matteo.greco.demo@camionchiaro.local', '+393331110106', 'warehouse', 'warehouse_worker', 'Addetto ribalte', 'Magazzino Firenze', 'active'),
    ('demo.olena', 'demo.olena@camionchiaro.local', 'Olena Shevchenko', 'olena.shevchenko.demo@camionchiaro.local', '+393331110107', 'warehouse', 'forklift_operator', 'Carrellista turno mattina', 'Magazzino Prato', 'active'),
    ('demo.nicola', 'demo.nicola@camionchiaro.local', 'Nicola Serra', 'nicola.serra.demo@camionchiaro.local', '+393331110108', 'warehouse', 'forklift_operator', 'Responsabile carica batterie', 'Magazzino Firenze', 'paused')
) as src(username, auth_email, full_name, email, phone, department, person_type, job_title, depot, status)
on conflict (company_id, username) where username is not null do update
set full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    department = excluded.department,
    person_type = excluded.person_type,
    job_title = excluded.job_title,
    depot = excluded.depot,
    status = excluded.status,
    updated_at = now();

with target as (
  select coalesce((select cm.company_id from public.company_members cm join auth.users u on u.id = cm.user_id where lower(coalesce(u.email, '')) = lower('azienda@camionchiaro.it') order by cm.created_at desc limit 1), 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976'::uuid) as company_id
)
insert into public.vehicles (company_id, plate, model, type, fleet_type, km, status)
select target.company_id, src.plate, src.model, src.type, src.fleet_type, src.km, src.status
from target
cross join (
  values
    ('DEMOF02', 'Mercedes Sprinter 316', 'Furgone espresso', 'furgone', 129430, 'active'),
    ('DEMOM02', 'Iveco Eurocargo 180E', 'Motrice sponda', 'motrice', 402210, 'maintenance'),
    ('DEMOT02', 'DAF XF 480', 'Trattore stradale', 'trattore', 558300, 'active'),
    ('DEMOT03', 'Scania S500', 'Trattore internazionale', 'trattore', 731800, 'watch'),
    ('DEMOS02', 'Krone Profi Liner', 'Semirimorchio telonato', 'semirimorchio', 0, 'active'),
    ('DEMOS03', 'Lamberet SR2', 'Semirimorchio frigo', 'semirimorchio', 0, 'maintenance')
) as src(plate, model, type, fleet_type, km, status)
on conflict (company_id, plate) do update
set model = excluded.model,
    type = excluded.type,
    fleet_type = excluded.fleet_type,
    km = excluded.km,
    status = excluded.status,
    updated_at = now();

with target as (
  select coalesce((select cm.company_id from public.company_members cm join auth.users u on u.id = cm.user_id where lower(coalesce(u.email, '')) = lower('azienda@camionchiaro.it') order by cm.created_at desc limit 1), 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976'::uuid) as company_id
)
insert into public.company_assets (company_id, asset_type, code, model, serial_number, location, status)
select target.company_id, src.asset_type, src.code, src.model, src.serial_number, src.location, src.status
from target
cross join (
  values
    ('forklift', 'DEMO-MULETTO-02', 'Still RX 20', 'DEMOPLUS-SN-0102', 'Magazzino Prato', 'active'),
    ('forklift', 'DEMO-MULETTO-03', 'Linde E20', 'DEMOPLUS-SN-0103', 'Magazzino Firenze', 'watch'),
    ('pallet_truck', 'DEMO-TRANSPALLET-02', 'Jungheinrich EJE 116', 'DEMOPLUS-SN-0202', 'Ribalta 4', 'active'),
    ('warehouse_equipment', 'DEMO-CARICABATTERIE-01', 'Area carica 48V', 'DEMOPLUS-SN-0301', 'Locale batterie', 'watch')
) as src(asset_type, code, model, serial_number, location, status)
on conflict (company_id, code) do update
set asset_type = excluded.asset_type,
    model = excluded.model,
    serial_number = excluded.serial_number,
    location = excluded.location,
    status = excluded.status,
    updated_at = now();
