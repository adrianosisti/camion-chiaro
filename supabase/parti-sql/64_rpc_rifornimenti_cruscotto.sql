-- 64_rpc_rifornimenti_cruscotto.sql
-- Lettura sicura dei movimenti gasolio per web e app.
-- Serve come fallback quando la lettura diretta da RLS/cache schema non restituisce i rifornimenti.

alter table public.fuel_movements
add column if not exists supplier_id uuid;

drop function if exists public.get_company_fuel_movements_for_user(uuid);

create or replace function public.get_company_fuel_movements_for_user(target_company_id uuid)
returns table (
  id uuid,
  company_id uuid,
  tank_id uuid,
  vehicle_id uuid,
  driver_id uuid,
  person_id uuid,
  supplier_id uuid,
  movement_type text,
  liters numeric,
  unit_price_cents integer,
  total_cost_cents integer,
  currency text,
  odometer_km integer,
  supplier text,
  document_number text,
  occurred_at timestamptz,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    fm.id,
    fm.company_id,
    fm.tank_id,
    fm.vehicle_id,
    fm.driver_id,
    fm.person_id,
    fm.supplier_id,
    fm.movement_type,
    fm.liters,
    fm.unit_price_cents,
    fm.total_cost_cents,
    fm.currency,
    fm.odometer_km,
    fm.supplier,
    fm.document_number,
    fm.occurred_at,
    fm.notes,
    fm.created_at,
    fm.updated_at
  from public.fuel_movements fm
  where fm.company_id = target_company_id
    and (
      exists (
        select 1
        from public.company_members cm
        where cm.company_id = fm.company_id
          and cm.user_id = auth.uid()
      )
      or exists (
        select 1
        from public.company_people cp
        where cp.company_id = fm.company_id
          and cp.user_id = auth.uid()
          and cp.status <> 'archived'
      )
      or exists (
        select 1
        from public.drivers d
        where d.company_id = fm.company_id
          and d.user_id = auth.uid()
          and d.status <> 'archived'
      )
    )
  order by fm.occurred_at desc
  limit 1000;
$$;

grant execute on function public.get_company_fuel_movements_for_user(uuid) to authenticated;
