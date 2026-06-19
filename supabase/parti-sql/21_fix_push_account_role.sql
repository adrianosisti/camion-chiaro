-- FIX NOTIFICHE PUSH - ACCOUNT ROLE
-- Corregge il vincolo account_role per registrare telefoni azienda/autista.

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.push_subscriptions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%account_role%'
  loop
    execute format('alter table public.push_subscriptions drop constraint %I', constraint_name);
  end loop;
end;
$$;

update public.push_subscriptions
set account_role = case
  when account_role in ('autista', 'driver') then 'driver'
  when account_role in ('azienda', 'company') then 'company'
  else 'driver'
end;

alter table public.push_subscriptions
add constraint push_subscriptions_account_role_check
check (account_role in ('company', 'driver'));

create or replace function public.upsert_push_subscription(
  subscription_endpoint text,
  subscription_p256dh text,
  subscription_auth text,
  subscription_user_agent text default null,
  subscription_target_company_id uuid default null
)
returns public.push_subscriptions
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_company_id uuid;
  current_driver_id uuid;
  current_role text;
  saved_subscription public.push_subscriptions;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if subscription_endpoint is null or length(trim(subscription_endpoint)) = 0 then
    raise exception 'Endpoint required';
  end if;

  if subscription_p256dh is null or length(trim(subscription_p256dh)) = 0 then
    raise exception 'Push key required';
  end if;

  if subscription_auth is null or length(trim(subscription_auth)) = 0 then
    raise exception 'Push auth required';
  end if;

  select d.company_id, d.id, 'driver'::text
  into current_company_id, current_driver_id, current_role
  from public.drivers d
  where d.user_id = current_user_id
    and d.status <> 'archived'
    and (subscription_target_company_id is null or d.company_id = subscription_target_company_id)
  order by d.created_at desc
  limit 1;

  if current_company_id is null then
    select cm.company_id, null::uuid, 'company'::text
    into current_company_id, current_driver_id, current_role
    from public.company_members cm
    where cm.user_id = current_user_id
      and cm.role in ('owner', 'admin', 'operator')
      and (subscription_target_company_id is null or cm.company_id = subscription_target_company_id)
    order by cm.created_at desc
    limit 1;
  end if;

  if current_company_id is null then
    raise exception 'Company not found for current user';
  end if;

  insert into public.push_subscriptions (
    user_id,
    company_id,
    driver_id,
    account_role,
    endpoint,
    endpoint_hash,
    p256dh,
    auth,
    user_agent,
    disabled_at,
    last_seen_at
  )
  values (
    current_user_id,
    current_company_id,
    current_driver_id,
    current_role,
    trim(subscription_endpoint),
    encode(extensions.digest(trim(subscription_endpoint), 'sha256'), 'hex'),
    trim(subscription_p256dh),
    trim(subscription_auth),
    nullif(trim(coalesce(subscription_user_agent, '')), ''),
    null,
    now()
  )
  on conflict (endpoint_hash) do update
  set
    user_id = excluded.user_id,
    company_id = excluded.company_id,
    driver_id = excluded.driver_id,
    account_role = excluded.account_role,
    endpoint = excluded.endpoint,
    p256dh = excluded.p256dh,
    auth = excluded.auth,
    user_agent = excluded.user_agent,
    disabled_at = null,
    last_seen_at = now(),
    updated_at = now()
  returning * into saved_subscription;

  return saved_subscription;
end;
$$;

grant execute on function public.upsert_push_subscription(text, text, text, text, uuid) to authenticated;
