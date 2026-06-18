create extension if not exists pgcrypto;

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  account_type text not null check (account_type in ('company', 'driver')),
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vat_number text,
  headquarters text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'operator' check (role in ('owner', 'admin', 'operator')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  username text not null,
  auth_email text,
  full_name text not null,
  email text,
  phone text not null,
  role text,
  depot text,
  status text not null default 'active' check (status in ('active', 'available', 'travelling', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, phone),
  unique (company_id, username),
  unique (auth_email)
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  plate text not null,
  model text,
  type text,
  fleet_type text not null default 'trattore' check (fleet_type in ('furgone', 'motrice', 'trattore', 'semirimorchio')),
  km integer not null default 0 check (km >= 0),
  status text not null default 'active' check (status in ('active', 'maintenance', 'watch', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, plate)
);

create table public.driver_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  type text not null,
  document_number text,
  expires_at date,
  file_path text,
  status text not null default 'uploaded' check (status in ('missing', 'uploaded', 'verified', 'expired')),
  visible_to_driver boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.compliance_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  scope text not null check (scope in ('driver', 'vehicle', 'company')),
  type text not null,
  document_number text,
  due_date date not null,
  reminder_days integer[] not null default array[60, 30, 15, 7],
  owner text,
  status text not null default 'open' check (status in ('open', 'renewing', 'done', 'archived')),
  last_reminder_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint compliance_scope_target check (
    (scope = 'driver' and driver_id is not null and vehicle_id is null)
    or (scope = 'vehicle' and vehicle_id is not null and driver_id is null)
    or (scope = 'company' and driver_id is null and vehicle_id is null)
  )
);

create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete cascade,
  in_app_enabled boolean not null default true,
  reminder_days integer[] not null default array[60, 30, 15, 7],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, driver_id)
);
