-- 46E - Trigger limiti piano su utenti, mezzi e strumenti

create or replace function public.enforce_driver_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'archived' then
    return new;
  end if;

  if tg_op = 'UPDATE'
    and old.company_id = new.company_id
    and old.status <> 'archived'
    and new.status <> 'archived' then
    return new;
  end if;

  perform public.assert_company_plan_limit(new.company_id, 'users');
  return new;
end;
$$;

drop trigger if exists drivers_enforce_plan_limit on public.drivers;
create trigger drivers_enforce_plan_limit
before insert or update of company_id, status on public.drivers
for each row execute function public.enforce_driver_plan_limit();

create or replace function public.enforce_person_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'archived' or new.department = 'drivers' then
    return new;
  end if;

  if tg_op = 'UPDATE'
    and old.company_id = new.company_id
    and old.status <> 'archived'
    and new.status <> 'archived'
    and old.department <> 'drivers'
    and new.department <> 'drivers' then
    return new;
  end if;

  perform public.assert_company_plan_limit(new.company_id, 'users');
  return new;
end;
$$;

drop trigger if exists company_people_enforce_plan_limit on public.company_people;
create trigger company_people_enforce_plan_limit
before insert or update of company_id, status, department on public.company_people
for each row execute function public.enforce_person_plan_limit();

create or replace function public.enforce_vehicle_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'archived' then
    return new;
  end if;

  if tg_op = 'UPDATE'
    and old.company_id = new.company_id
    and old.status <> 'archived'
    and new.status <> 'archived' then
    return new;
  end if;

  perform public.assert_company_plan_limit(new.company_id, 'vehicles');
  return new;
end;
$$;

drop trigger if exists vehicles_enforce_plan_limit on public.vehicles;
create trigger vehicles_enforce_plan_limit
before insert or update of company_id, status on public.vehicles
for each row execute function public.enforce_vehicle_plan_limit();

create or replace function public.enforce_asset_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'archived' then
    return new;
  end if;

  if tg_op = 'UPDATE'
    and old.company_id = new.company_id
    and old.status <> 'archived'
    and new.status <> 'archived' then
    return new;
  end if;

  perform public.assert_company_plan_limit(new.company_id, 'assets');
  return new;
end;
$$;

drop trigger if exists company_assets_enforce_plan_limit on public.company_assets;
create trigger company_assets_enforce_plan_limit
before insert or update of company_id, status on public.company_assets
for each row execute function public.enforce_asset_plan_limit();

grant execute on function public.get_plan_limits(text) to authenticated;
grant execute on function public.get_company_plan_limits(uuid) to authenticated;
grant execute on function public.assert_company_plan_limit(uuid, text) to authenticated;
