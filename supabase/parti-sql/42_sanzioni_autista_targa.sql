-- CENTRO COSTI - PARTE 42
-- Le sanzioni devono poter essere collegate sia all'autista sia alla targa.
-- Manteniamo invece il controllo per evitare di collegare insieme mezzo e attrezzatura.

alter table public.cost_entries
drop constraint if exists cost_entries_single_target_check;

alter table public.cost_entries
add constraint cost_entries_single_target_check
check (num_nonnulls(vehicle_id, asset_id) <= 1);

create index if not exists cost_entries_company_vehicle_driver_idx
on public.cost_entries (company_id, vehicle_id, driver_id, spent_at desc)
where vehicle_id is not null and driver_id is not null;
