-- CENTRO COSTI LIBERO - PARTE 40
-- Aggiunge spese manuali non legate per forza a un guasto:
-- manutenzioni, gomme, assicurazioni, revisioni, officina, muletti e altri strumenti.

create table if not exists public.cost_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  asset_id uuid references public.company_assets(id) on delete set null,
  driver_id uuid references public.drivers(id) on delete set null,
  source_type text not null default 'manual'
    check (source_type in ('manual', 'fault', 'deadline', 'maintenance')),
  category text not null default 'maintenance'
    check (category in ('maintenance', 'repair', 'tires', 'insurance', 'revision', 'tax', 'fuel', 'cleaning', 'toll', 'fine', 'other')),
  title text not null,
  supplier text,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'EUR',
  spent_at date not null default current_date,
  odometer_km integer check (odometer_km is null or odometer_km >= 0),
  notes text,
  file_bucket text not null default 'company-assets',
  file_path text,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cost_entries_single_target_check check (num_nonnulls(vehicle_id, asset_id, driver_id) <= 1)
);

create index if not exists cost_entries_company_spent_idx
on public.cost_entries (company_id, spent_at desc);

create index if not exists cost_entries_company_vehicle_idx
on public.cost_entries (company_id, vehicle_id, spent_at desc)
where vehicle_id is not null;

create index if not exists cost_entries_company_asset_idx
on public.cost_entries (company_id, asset_id, spent_at desc)
where asset_id is not null;

create index if not exists cost_entries_company_driver_idx
on public.cost_entries (company_id, driver_id, spent_at desc)
where driver_id is not null;

alter table public.cost_entries enable row level security;

drop policy if exists cost_entries_select_member on public.cost_entries;
create policy cost_entries_select_member
on public.cost_entries
for select
to authenticated
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = cost_entries.company_id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists cost_entries_insert_member on public.cost_entries;
create policy cost_entries_insert_member
on public.cost_entries
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = cost_entries.company_id
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin', 'operator')
  )
);

drop policy if exists cost_entries_update_member on public.cost_entries;
create policy cost_entries_update_member
on public.cost_entries
for update
to authenticated
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = cost_entries.company_id
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin', 'operator')
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = cost_entries.company_id
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin', 'operator')
  )
);

drop policy if exists cost_entries_delete_member on public.cost_entries;
create policy cost_entries_delete_member
on public.cost_entries
for delete
to authenticated
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = cost_entries.company_id
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin', 'operator')
  )
);
