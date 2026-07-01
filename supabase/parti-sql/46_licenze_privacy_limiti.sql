-- VYGO - LICENZE, PRIVACY, ACCETTAZIONI E LIMITI PIANO
-- Esegui dopo i file precedenti di schema, personale/reparti e centro costi.
-- Scopo: salvare accettazioni legali e bloccare lato database i limiti commerciali.

create extension if not exists pgcrypto;

do $$
begin
  alter table public.companies add column if not exists billing_addon_chat boolean not null default false;
  alter table public.companies add column if not exists billing_addon_cost_center boolean not null default false;
  alter table public.companies add column if not exists billing_addon_reports boolean not null default false;
  alter table public.companies add column if not exists billing_storage_extra_gb integer not null default 0;

  alter table public.companies drop constraint if exists companies_billing_plan_check;
  alter table public.companies
    add constraint companies_billing_plan_check
    check (billing_plan in ('starter', 'pro', 'business', 'enterprise', 'fleet10', 'fleet20', 'fleet30', 'fleet50'));

  alter table public.companies drop constraint if exists companies_billing_status_check;
  alter table public.companies
    add constraint companies_billing_status_check
    check (billing_status in ('pending', 'active', 'past_due', 'suspended', 'cancelled'));

  alter table public.companies drop constraint if exists companies_billing_provider_check;
  alter table public.companies
    add constraint companies_billing_provider_check
    check (billing_provider in ('manual', 'stripe'));

  alter table public.companies drop constraint if exists companies_billing_storage_extra_gb_check;
  alter table public.companies
    add constraint companies_billing_storage_extra_gb_check
    check (billing_storage_extra_gb >= 0);
end;
$$;

create table if not exists public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_role text not null default 'staff'
    check (account_role in ('company', 'staff')),
  document_type text not null
    check (document_type in ('terms', 'privacy', 'dpa', 'staffTerms', 'marketing')),
  document_version text not null,
  accepted_at timestamptz not null default now(),
  user_agent text,
  ip_hint text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (company_id, user_id, document_type, document_version)
);

create index if not exists legal_acceptances_company_idx
on public.legal_acceptances (company_id, accepted_at desc);

create index if not exists legal_acceptances_user_doc_idx
on public.legal_acceptances (user_id, document_type, document_version);

alter table public.legal_acceptances enable row level security;

drop policy if exists "Users can read legal acceptances" on public.legal_acceptances;
create policy "Users can read legal acceptances"
on public.legal_acceptances
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select public.is_company_member(company_id))
);

drop policy if exists "Users can insert own legal acceptances" on public.legal_acceptances;
create policy "Users can insert own legal acceptances"
on public.legal_acceptances
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (
    (select public.is_company_member(company_id))
    or exists (
      select 1
      from public.drivers d
      where d.company_id = legal_acceptances.company_id
        and d.user_id = (select auth.uid())
        and d.status <> 'archived'
    )
    or exists (
      select 1
      from public.company_people p
      where p.company_id = legal_acceptances.company_id
        and p.user_id = (select auth.uid())
        and p.status <> 'archived'
    )
  )
);

drop policy if exists "Users can update own legal acceptances" on public.legal_acceptances;
create policy "Users can update own legal acceptances"
on public.legal_acceptances
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

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
