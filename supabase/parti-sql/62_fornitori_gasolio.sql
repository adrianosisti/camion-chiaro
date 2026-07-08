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

alter table public.fuel_movements
add column if not exists supplier_id uuid references public.fuel_suppliers(id) on delete set null;

create index if not exists fuel_suppliers_company_status_idx
on public.fuel_suppliers (company_id, status, name);

create index if not exists fuel_movements_supplier_time_idx
on public.fuel_movements (company_id, supplier_id, occurred_at desc)
where supplier_id is not null;

alter table public.fuel_suppliers enable row level security;

grant select, insert, update, delete on public.fuel_suppliers to authenticated;

drop trigger if exists fuel_suppliers_set_updated_at on public.fuel_suppliers;
create trigger fuel_suppliers_set_updated_at
before update on public.fuel_suppliers
for each row execute function public.set_updated_at();

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
      and cm.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.company_people cp
    where cp.company_id = fuel_suppliers.company_id
      and cp.user_id = auth.uid()
      and cp.status <> 'archived'
  )
  or exists (
    select 1
    from public.drivers d
    where d.company_id = fuel_suppliers.company_id
      and d.user_id = auth.uid()
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
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin', 'operator')
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = fuel_suppliers.company_id
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin', 'operator')
  )
);
