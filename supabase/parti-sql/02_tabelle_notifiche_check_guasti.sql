create table public.in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete cascade,
  compliance_item_id uuid references public.compliance_items(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.vehicle_checks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  tractor_id uuid not null references public.vehicles(id) on delete restrict,
  semitrailer_id uuid references public.vehicles(id) on delete restrict,
  odometer_km integer check (odometer_km is null or odometer_km >= 0),
  lights_ok boolean not null default true,
  tires_ok boolean not null default true,
  documents_on_board boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create table public.fault_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  semitrailer_id uuid references public.vehicles(id) on delete restrict,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'stop_vehicle')),
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'seen', 'in_progress', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  compliance_item_id uuid references public.compliance_items(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete cascade,
  channel text not null check (channel in ('email', 'push', 'in_app')),
  recipient text not null,
  sent_at timestamptz not null default now(),
  status text not null default 'sent' check (status in ('queued', 'sent', 'failed')),
  payload jsonb not null default '{}'::jsonb
);
