-- PERSONALE, REPARTI, MULETTI, DOCUMENTI MEZZO E CHAT GRUPPI - PARTE 31
-- Esegui questo file dopo 30_native_push_tokens.sql.
-- Prepara Vyko per autisti, carrellisti/magazzino, ufficio e gruppi aziendali.

do $$
begin
  alter table public.user_profiles drop constraint if exists user_profiles_account_type_check;
  alter table public.user_profiles
    add constraint user_profiles_account_type_check
    check (account_type in ('company', 'driver', 'warehouse', 'office', 'staff'));
end;
$$;

create table if not exists public.company_people (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  linked_driver_id uuid references public.drivers(id) on delete set null,
  username text,
  auth_email text,
  full_name text not null,
  email text,
  phone text,
  department text not null default 'drivers'
    check (department in ('drivers', 'warehouse', 'office', 'management')),
  person_type text not null default 'driver'
    check (person_type in ('driver', 'forklift_operator', 'warehouse_worker', 'office', 'manager')),
  job_title text,
  depot text,
  status text not null default 'active'
    check (status in ('active', 'available', 'travelling', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists company_people_company_linked_driver_uidx
on public.company_people (company_id, linked_driver_id)
where linked_driver_id is not null;

create unique index if not exists company_people_company_username_uidx
on public.company_people (company_id, username)
where username is not null;

create index if not exists company_people_company_department_idx
on public.company_people (company_id, department, status);

create index if not exists company_people_user_id_idx
on public.company_people (user_id)
where user_id is not null;

create table if not exists public.company_assets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  asset_type text not null default 'forklift'
    check (asset_type in ('forklift', 'pallet_truck', 'warehouse_equipment', 'other')),
  code text not null,
  model text,
  serial_number text,
  location text,
  status text not null default 'active'
    check (status in ('active', 'maintenance', 'watch', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, code)
);

create index if not exists company_assets_company_type_idx
on public.company_assets (company_id, asset_type, status);

create table if not exists public.asset_checks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  asset_id uuid not null references public.company_assets(id) on delete restrict,
  person_id uuid references public.company_people(id) on delete set null,
  battery_charge_ok boolean not null default true,
  water_level_ok boolean not null default true,
  forks_ok boolean not null default true,
  tires_ok boolean not null default true,
  brakes_ok boolean not null default true,
  horn_ok boolean not null default true,
  lights_ok boolean not null default true,
  leaks_ok boolean not null default true,
  damage_ok boolean not null default true,
  safety_devices_ok boolean not null default true,
  notes text,
  status text not null default 'open' check (status in ('open', 'resolved', 'archived')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists asset_checks_company_created_idx
on public.asset_checks (company_id, created_at desc);

create index if not exists asset_checks_asset_created_idx
on public.asset_checks (asset_id, created_at desc);

create table if not exists public.vehicle_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  type text not null,
  document_number text,
  expires_at date,
  file_bucket text not null default 'company-assets',
  file_path text,
  status text not null default 'uploaded'
    check (status in ('missing', 'uploaded', 'verified', 'expired', 'archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vehicle_documents_company_vehicle_idx
on public.vehicle_documents (company_id, vehicle_id, status);

create index if not exists vehicle_documents_expires_idx
on public.vehicle_documents (company_id, expires_at)
where expires_at is not null and status <> 'archived';

alter table public.compliance_items
  add column if not exists person_id uuid references public.company_people(id) on delete cascade;

alter table public.compliance_items
  add column if not exists asset_id uuid references public.company_assets(id) on delete cascade;

alter table public.compliance_items drop constraint if exists compliance_scope_target;
alter table public.compliance_items drop constraint if exists compliance_items_scope_check;

alter table public.compliance_items
  add constraint compliance_items_scope_check
  check (scope in ('driver', 'vehicle', 'company', 'person', 'asset'));

alter table public.compliance_items
  add constraint compliance_scope_target
  check (
    (scope = 'driver' and driver_id is not null and vehicle_id is null and person_id is null and asset_id is null)
    or (scope = 'vehicle' and vehicle_id is not null and driver_id is null and person_id is null and asset_id is null)
    or (scope = 'company' and driver_id is null and vehicle_id is null and person_id is null and asset_id is null)
    or (scope = 'person' and person_id is not null and driver_id is null and vehicle_id is null and asset_id is null)
    or (scope = 'asset' and asset_id is not null and driver_id is null and vehicle_id is null and person_id is null)
  );

create index if not exists compliance_items_person_idx
on public.compliance_items (company_id, person_id, due_date)
where person_id is not null;

create index if not exists compliance_items_asset_idx
on public.compliance_items (company_id, asset_id, due_date)
where asset_id is not null;

