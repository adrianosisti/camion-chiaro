-- 46C - Funzioni limiti piano

create or replace function public.get_plan_limits(input_plan text)
returns jsonb
language sql
stable
as $$
  select case coalesce(input_plan, 'starter')
    when 'fleet10' then jsonb_build_object(
      'maxVehicles', 10,
      'maxAssets', 5,
      'maxUsers', 20,
      'storageGb', 20,
      'chat', true,
      'costCenter', false,
      'reports', false,
      'departments', true
    )
    when 'pro' then jsonb_build_object(
      'maxVehicles', 10,
      'maxAssets', 5,
      'maxUsers', 20,
      'storageGb', 20,
      'chat', true,
      'costCenter', false,
      'reports', false,
      'departments', true
    )
    when 'fleet20' then jsonb_build_object(
      'maxVehicles', 20,
      'maxAssets', 10,
      'maxUsers', 40,
      'storageGb', 30,
      'chat', true,
      'costCenter', true,
      'reports', true,
      'departments', true
    )
    when 'business' then jsonb_build_object(
      'maxVehicles', 20,
      'maxAssets', 10,
      'maxUsers', 40,
      'storageGb', 30,
      'chat', true,
      'costCenter', true,
      'reports', true,
      'departments', true
    )
    when 'fleet30' then jsonb_build_object(
      'maxVehicles', 30,
      'maxAssets', 15,
      'maxUsers', 60,
      'storageGb', 50,
      'chat', true,
      'costCenter', true,
      'reports', true,
      'departments', true
    )
    when 'fleet50' then jsonb_build_object(
      'maxVehicles', 50,
      'maxAssets', 25,
      'maxUsers', 100,
      'storageGb', 75,
      'chat', true,
      'costCenter', true,
      'reports', true,
      'departments', true
    )
    when 'enterprise' then jsonb_build_object(
      'maxVehicles', null,
      'maxAssets', null,
      'maxUsers', null,
      'storageGb', 100,
      'chat', true,
      'costCenter', true,
      'reports', true,
      'departments', true
    )
    else jsonb_build_object(
      'maxVehicles', 5,
      'maxAssets', 3,
      'maxUsers', 10,
      'storageGb', 10,
      'chat', false,
      'costCenter', false,
      'reports', false,
      'departments', false
    )
  end;
$$;

create or replace function public.get_company_plan_limits(target_company_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  company_row public.companies%rowtype;
  limits jsonb;
  extra_storage integer;
begin
  select *
  into company_row
  from public.companies
  where id = target_company_id;

  if company_row.id is null then
    raise exception 'Company not found';
  end if;

  limits := public.get_plan_limits(company_row.billing_plan);
  extra_storage := coalesce(company_row.billing_storage_extra_gb, 0);

  limits := jsonb_set(limits, '{storageGb}', to_jsonb(((limits ->> 'storageGb')::integer + extra_storage)));

  if coalesce(company_row.billing_addon_chat, false) then
    limits := jsonb_set(limits, '{chat}', 'true'::jsonb);
  end if;

  if coalesce(company_row.billing_addon_cost_center, false) then
    limits := jsonb_set(limits, '{costCenter}', 'true'::jsonb);
  end if;

  if coalesce(company_row.billing_addon_reports, false) then
    limits := jsonb_set(limits, '{reports}', 'true'::jsonb);
  end if;

  return limits;
end;
$$;

