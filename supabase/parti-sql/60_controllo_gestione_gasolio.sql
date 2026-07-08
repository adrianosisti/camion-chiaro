-- 60 - Controllo gestione, cisterna gasolio e consumi
-- File rieseguibile. Aggiunge la base dati per trasformare Vygo da gestionale operativo
-- a controllo economico: ricavi, costi aziendali, rifornimenti, giacenza cisterna e consumi per targa.

create extension if not exists pgcrypto;

do $$
begin
  if to_regclass('public.company_people') is not null then
    alter table public.company_people drop constraint if exists company_people_person_type_check;
    alter table public.company_people
      add constraint company_people_person_type_check
      check (person_type in ('driver', 'forklift_operator', 'warehouse_worker', 'mechanic', 'office', 'manager'));
  end if;
end $$;

create table if not exists public.fuel_tanks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  location text,
  capacity_liters numeric(12, 2) not null default 0 check (capacity_liters >= 0),
  warning_threshold_liters numeric(12, 2) not null default 0 check (warning_threshold_liters >= 0),
  initial_liters numeric(12, 2) not null default 0 check (initial_liters >= 0),
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  notes text,
  created_by_user_id uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fuel_movements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  tank_id uuid references public.fuel_tanks(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  driver_id uuid references public.drivers(id) on delete set null,
  person_id uuid references public.company_people(id) on delete set null,
  movement_type text not null check (movement_type in ('load', 'dispense', 'adjustment')),
  liters numeric(12, 2) not null check (liters > 0),
  unit_price_cents integer check (unit_price_cents is null or unit_price_cents >= 0),
  total_cost_cents integer check (total_cost_cents is null or total_cost_cents >= 0),
  currency text not null default 'EUR',
  odometer_km integer check (odometer_km is null or odometer_km >= 0),
  supplier text,
  document_number text,
  occurred_at timestamptz not null default now(),
  notes text,
  created_by_user_id uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fuel_movements_dispense_target_check check (
    movement_type <> 'dispense'
    or vehicle_id is not null
  )
);

alter table public.fuel_movements
add column if not exists person_id uuid references public.company_people(id) on delete set null;

create table if not exists public.business_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  entry_type text not null check (entry_type in ('revenue', 'fixed_cost', 'variable_cost')),
  category text not null default 'other',
  title text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'EUR',
  occurred_at date not null default current_date,
  period_month date,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  asset_id uuid references public.company_assets(id) on delete set null,
  driver_id uuid references public.drivers(id) on delete set null,
  counterparty text,
  recurring boolean not null default false,
  notes text,
  created_by_user_id uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fuel_tanks_company_status_idx
on public.fuel_tanks (company_id, status, created_at desc);

create index if not exists fuel_movements_company_time_idx
on public.fuel_movements (company_id, occurred_at desc);

create index if not exists fuel_movements_vehicle_time_idx
on public.fuel_movements (company_id, vehicle_id, occurred_at desc)
where vehicle_id is not null;

create index if not exists fuel_movements_tank_time_idx
on public.fuel_movements (company_id, tank_id, occurred_at desc)
where tank_id is not null;

create index if not exists fuel_movements_person_time_idx
on public.fuel_movements (company_id, person_id, occurred_at desc)
where person_id is not null;

create index if not exists business_entries_company_type_date_idx
on public.business_entries (company_id, entry_type, occurred_at desc);

create index if not exists business_entries_company_vehicle_date_idx
on public.business_entries (company_id, vehicle_id, occurred_at desc)
where vehicle_id is not null;

alter table public.fuel_tanks enable row level security;
alter table public.fuel_movements enable row level security;
alter table public.business_entries enable row level security;

grant select, insert, update, delete on public.fuel_tanks to authenticated;
grant select, insert, update, delete on public.fuel_movements to authenticated;
grant select, insert, update, delete on public.business_entries to authenticated;

drop policy if exists fuel_tanks_select_member on public.fuel_tanks;
create policy fuel_tanks_select_member
on public.fuel_tanks
for select
to authenticated
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = fuel_tanks.company_id
      and cm.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.company_people cp
    where cp.company_id = fuel_tanks.company_id
      and cp.user_id = auth.uid()
      and cp.status <> 'archived'
  )
  or exists (
    select 1
    from public.drivers d
    where d.company_id = fuel_tanks.company_id
      and d.user_id = auth.uid()
      and d.status <> 'archived'
  )
);

drop policy if exists fuel_tanks_manage_operator on public.fuel_tanks;
create policy fuel_tanks_manage_operator
on public.fuel_tanks
for all
to authenticated
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = fuel_tanks.company_id
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin', 'operator')
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = fuel_tanks.company_id
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin', 'operator')
  )
);

drop policy if exists fuel_movements_select_member on public.fuel_movements;
create policy fuel_movements_select_member
on public.fuel_movements
for select
to authenticated
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = fuel_movements.company_id
      and cm.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.company_people cp
    where cp.company_id = fuel_movements.company_id
      and cp.user_id = auth.uid()
      and cp.status <> 'archived'
  )
  or exists (
    select 1
    from public.drivers d
    where d.company_id = fuel_movements.company_id
      and d.user_id = auth.uid()
      and d.status <> 'archived'
  )
);

drop policy if exists fuel_movements_manage_operator on public.fuel_movements;
create policy fuel_movements_manage_operator
on public.fuel_movements
for all
to authenticated
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = fuel_movements.company_id
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin', 'operator')
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = fuel_movements.company_id
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin', 'operator')
  )
);

drop policy if exists fuel_movements_insert_staff on public.fuel_movements;
create policy fuel_movements_insert_staff
on public.fuel_movements
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_people cp
    where cp.company_id = fuel_movements.company_id
      and cp.user_id = auth.uid()
      and cp.status <> 'archived'
  )
  or exists (
    select 1
    from public.drivers d
    where d.company_id = fuel_movements.company_id
      and d.user_id = auth.uid()
      and d.status <> 'archived'
  )
);

drop policy if exists fuel_movements_update_own_staff on public.fuel_movements;
create policy fuel_movements_update_own_staff
on public.fuel_movements
for update
to authenticated
using (
  exists (
    select 1
    from public.company_people cp
    where cp.company_id = fuel_movements.company_id
      and cp.user_id = auth.uid()
      and cp.status <> 'archived'
      and (fuel_movements.created_by_user_id = auth.uid() or fuel_movements.person_id = cp.id)
  )
  or exists (
    select 1
    from public.drivers d
    where d.company_id = fuel_movements.company_id
      and d.user_id = auth.uid()
      and d.status <> 'archived'
      and (fuel_movements.created_by_user_id = auth.uid() or fuel_movements.driver_id = d.id)
  )
)
with check (
  exists (
    select 1
    from public.company_people cp
    where cp.company_id = fuel_movements.company_id
      and cp.user_id = auth.uid()
      and cp.status <> 'archived'
      and (fuel_movements.created_by_user_id = auth.uid() or fuel_movements.person_id = cp.id)
  )
  or exists (
    select 1
    from public.drivers d
    where d.company_id = fuel_movements.company_id
      and d.user_id = auth.uid()
      and d.status <> 'archived'
      and (fuel_movements.created_by_user_id = auth.uid() or fuel_movements.driver_id = d.id)
  )
);

drop policy if exists business_entries_select_member on public.business_entries;
create policy business_entries_select_member
on public.business_entries
for select
to authenticated
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = business_entries.company_id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists business_entries_manage_operator on public.business_entries;
create policy business_entries_manage_operator
on public.business_entries
for all
to authenticated
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = business_entries.company_id
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin', 'operator')
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = business_entries.company_id
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin', 'operator')
  )
);

create or replace view public.fuel_tank_levels
with (security_invoker = true)
as
select
  t.id,
  t.company_id,
  t.name,
  t.location,
  t.capacity_liters,
  t.warning_threshold_liters,
  t.initial_liters,
  t.status,
  (
    t.initial_liters
    + coalesce(sum(m.liters) filter (where m.movement_type = 'load'), 0)
    + coalesce(sum(m.liters) filter (where m.movement_type = 'adjustment'), 0)
    - coalesce(sum(m.liters) filter (where m.movement_type = 'dispense'), 0)
  )::numeric(12, 2) as current_liters,
  max(m.occurred_at) as last_movement_at,
  t.created_at,
  t.updated_at
from public.fuel_tanks t
left join public.fuel_movements m on m.tank_id = t.id
group by t.id;

grant select on public.fuel_tank_levels to authenticated;
