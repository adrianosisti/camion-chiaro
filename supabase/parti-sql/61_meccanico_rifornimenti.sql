-- 61 - Meccanico e rifornimenti gasolio da app personale
-- Esegui dopo il file 60 se il modulo controllo gestione e' gia stato creato.
-- Rende il ruolo "meccanico / addetto rifornimenti" disponibile in anagrafica
-- e permette al personale collegato all'azienda di registrare movimenti gasolio.

do $$
begin
  if to_regclass('public.company_people') is not null then
    alter table public.company_people drop constraint if exists company_people_person_type_check;
    alter table public.company_people
      add constraint company_people_person_type_check
      check (person_type in ('driver', 'forklift_operator', 'warehouse_worker', 'mechanic', 'office', 'manager'));
  end if;
end $$;

alter table public.fuel_movements
add column if not exists person_id uuid references public.company_people(id) on delete set null;

create index if not exists fuel_movements_person_time_idx
on public.fuel_movements (company_id, person_id, occurred_at desc)
where person_id is not null;

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
