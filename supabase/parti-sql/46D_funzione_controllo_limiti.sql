-- 46D - Funzione controllo limiti piano

create or replace function public.assert_company_plan_limit(target_company_id uuid, resource text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  company_row public.companies%rowtype;
  current_count integer := 0;
  limit_value integer;
  limit_key text;
  limits jsonb;
  resource_label text;
begin
  select *
  into company_row
  from public.companies
  where id = target_company_id;

  if company_row.id is null then
    raise exception 'Company not found';
  end if;

  if company_row.billing_provider = 'manual' and company_row.billing_status = 'active' then
    return;
  end if;

  limits := public.get_company_plan_limits(target_company_id);

  if resource = 'users' then
    limit_key := 'maxUsers';
    resource_label := 'account utenti';

    select count(*)
    into current_count
    from (
      select cm.user_id
      from public.company_members cm
      where cm.company_id = target_company_id
      union all
      select d.user_id
      from public.drivers d
      where d.company_id = target_company_id
        and d.status <> 'archived'
      union all
      select p.user_id
      from public.company_people p
      where p.company_id = target_company_id
        and p.status <> 'archived'
        and p.department <> 'drivers'
    ) counted_users;
  elsif resource = 'vehicles' then
    limit_key := 'maxVehicles';
    resource_label := 'mezzi';

    select count(*)
    into current_count
    from public.vehicles v
    where v.company_id = target_company_id
      and v.status <> 'archived';
  elsif resource = 'assets' then
    limit_key := 'maxAssets';
    resource_label := 'strumenti o muletti';

    select count(*)
    into current_count
    from public.company_assets a
    where a.company_id = target_company_id
      and a.status <> 'archived';
  else
    raise exception 'Unknown plan resource: %', resource;
  end if;

  limit_value := nullif(limits ->> limit_key, '')::integer;

  if limit_value is not null and current_count >= limit_value then
    raise exception 'Piano Vygo: limite % raggiunto (%). Aggiorna piano per continuare.', resource_label, limit_value;
  end if;
end;
$$;

