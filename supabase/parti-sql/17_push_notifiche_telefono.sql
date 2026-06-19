-- NOTIFICHE PUSH TELEFONO - CAMION CHIARO
-- Registra i telefoni autorizzati a ricevere notifiche push web.

create extension if not exists pgcrypto;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete cascade,
  account_role text not null check (account_role in ('company', 'driver')),
  endpoint text not null,
  endpoint_hash text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  disabled_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_active_idx
on public.push_subscriptions (user_id, disabled_at);

create index if not exists push_subscriptions_company_active_idx
on public.push_subscriptions (company_id, account_role, disabled_at);

create index if not exists push_subscriptions_driver_active_idx
on public.push_subscriptions (driver_id, disabled_at)
where driver_id is not null;

drop trigger if exists touch_push_subscriptions_updated_at on public.push_subscriptions;
create trigger touch_push_subscriptions_updated_at
before update on public.push_subscriptions
for each row execute function public.touch_updated_at();

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users can read own push subscriptions" on public.push_subscriptions;
create policy "Users can read own push subscriptions"
on public.push_subscriptions
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can delete own push subscriptions" on public.push_subscriptions;
create policy "Users can delete own push subscriptions"
on public.push_subscriptions
for delete
to authenticated
using (user_id = (select auth.uid()));

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

  select d.company_id, d.id, 'driver'
  into current_company_id, current_driver_id, current_role
  from public.drivers d
  where d.user_id = current_user_id
    and d.status <> 'archived'
    and (subscription_target_company_id is null or d.company_id = subscription_target_company_id)
  order by d.created_at desc
  limit 1;

  if current_company_id is null then
    select cm.company_id, null::uuid, 'company'
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

create or replace function public.delete_push_subscription(
  subscription_endpoint text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update public.push_subscriptions
  set disabled_at = now(), updated_at = now()
  where endpoint_hash = encode(extensions.digest(trim(subscription_endpoint), 'sha256'), 'hex')
    and user_id = (select auth.uid());

  return found;
end;
$$;

grant execute on function public.upsert_push_subscription(text, text, text, text, uuid) to authenticated;
grant execute on function public.delete_push_subscription(text) to authenticated;
