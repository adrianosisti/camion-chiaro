-- 65_fix_fornitori_gasolio.sql
-- Ripara la tabella fornitori gasolio richiesta da web e app.
-- Esegui questo file nel progetto Supabase corretto di Vygo.

create extension if not exists pgcrypto;

do $$
begin
  if to_regclass('public.companies') is null then
    raise exception 'Progetto Supabase sbagliato: manca public.companies. Apri il progetto Vygo corretto e riesegui questo file.';
  end if;
end $$;

create table if not exists public.fuel_suppliers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  vat_number text,
  contact_name text,
  phone text,
  email text,
  notes text,
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  created_by_user_id uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, name)
);

create index if not exists fuel_suppliers_company_status_idx
on public.fuel_suppliers (company_id, status, name);

alter table public.fuel_suppliers enable row level security;

grant select, insert, update, delete on public.fuel_suppliers to authenticated;

do $$
begin
  if to_regprocedure('public.set_updated_at()') is not null then
    drop trigger if exists fuel_suppliers_set_updated_at on public.fuel_suppliers;
    create trigger fuel_suppliers_set_updated_at
    before update on public.fuel_suppliers
    for each row execute function public.set_updated_at();
  end if;
end $$;

do $$
begin
  if to_regclass('public.fuel_movements') is not null then
    execute 'alter table public.fuel_movements add column if not exists supplier_id uuid';
    execute 'alter table public.fuel_movements drop constraint if exists fuel_movements_supplier_id_fkey';
    execute 'alter table public.fuel_movements add constraint fuel_movements_supplier_id_fkey foreign key (supplier_id) references public.fuel_suppliers(id) on delete set null';
    execute 'create index if not exists fuel_movements_supplier_time_idx on public.fuel_movements (company_id, supplier_id, occurred_at desc) where supplier_id is not null';
  end if;
end $$;

drop policy if exists fuel_suppliers_select_company on public.fuel_suppliers;
create policy fuel_suppliers_select_company
on public.fuel_suppliers
for select
to authenticated
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = fuel_suppliers.company_id
      and cm.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.company_people cp
    where cp.company_id = fuel_suppliers.company_id
      and cp.user_id = (select auth.uid())
      and cp.status <> 'archived'
  )
  or exists (
    select 1
    from public.drivers d
    where d.company_id = fuel_suppliers.company_id
      and d.user_id = (select auth.uid())
      and d.status <> 'archived'
  )
);

drop policy if exists fuel_suppliers_manage_company on public.fuel_suppliers;
create policy fuel_suppliers_manage_company
on public.fuel_suppliers
for all
to authenticated
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = fuel_suppliers.company_id
      and cm.user_id = (select auth.uid())
      and cm.role in ('owner', 'admin', 'operator')
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = fuel_suppliers.company_id
      and cm.user_id = (select auth.uid())
      and cm.role in ('owner', 'admin', 'operator')
  )
);

notify pgrst, 'reload schema';
