-- CENTRO COSTI - PARTE 41
-- Permette di collegare una spesa libera, soprattutto le sanzioni/multe,
-- anche a un autista. Serve per report futuri: multe per autista,
-- costo medio per persona, storico sanzioni e controlli interni.

alter table public.cost_entries
add column if not exists driver_id uuid references public.drivers(id) on delete set null;

create index if not exists cost_entries_company_driver_idx
on public.cost_entries (company_id, driver_id, spent_at desc)
where driver_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cost_entries_single_target_check'
      and conrelid = 'public.cost_entries'::regclass
  ) then
    alter table public.cost_entries
    add constraint cost_entries_single_target_check
    check (num_nonnulls(vehicle_id, asset_id, driver_id) <= 1);
  end if;
end $$;
