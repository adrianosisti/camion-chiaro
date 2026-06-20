-- NOTIFICHE APP NATIVE IPHONE / ANDROID
-- Esegui questo file una sola volta in Supabase SQL Editor.

create table if not exists public.native_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete cascade,
  account_role text not null check (account_role in ('company', 'driver')),
  expo_push_token text not null unique,
  platform text,
  device_name text,
  disabled_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists native_push_tokens_user_active_idx
on public.native_push_tokens (user_id, disabled_at);

create index if not exists native_push_tokens_company_active_idx
on public.native_push_tokens (company_id, account_role, disabled_at);

create index if not exists native_push_tokens_driver_active_idx
on public.native_push_tokens (driver_id, disabled_at)
where driver_id is not null;

drop trigger if exists touch_native_push_tokens_updated_at on public.native_push_tokens;
create trigger touch_native_push_tokens_updated_at
before update on public.native_push_tokens
for each row execute function public.touch_updated_at();

alter table public.native_push_tokens enable row level security;

drop policy if exists "Users can read own native push tokens" on public.native_push_tokens;
create policy "Users can read own native push tokens"
on public.native_push_tokens
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can delete own native push tokens" on public.native_push_tokens;
create policy "Users can delete own native push tokens"
on public.native_push_tokens
for delete
to authenticated
using (user_id = (select auth.uid()));

create or replace function public.upsert_native_push_token(
  token_value text,
  token_platform text default null,
  token_device_name text default null,
  token_target_company_id uuid default null
)
returns public.native_push_tokens
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_company_id uuid;
  current_driver_id uuid;
  current_account_role text;
  saved_token public.native_push_tokens;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if token_value is null or length(trim(token_value)) = 0 then
    raise exception 'Token required';
  end if;

  select d.company_id, d.id, 'driver'::text
  into current_company_id, current_driver_id, current_account_role
  from public.drivers d
  where d.user_id = current_user_id
    and d.status <> 'archived'
    and (token_target_company_id is null or d.company_id = token_target_company_id)
  order by d.created_at desc
  limit 1;

  if current_company_id is null then
    select cm.company_id, null::uuid, 'company'::text
    into current_company_id, current_driver_id, current_account_role
    from public.company_members cm
    where cm.user_id = current_user_id
      and cm.role in ('owner', 'admin', 'operator')
      and (token_target_company_id is null or cm.company_id = token_target_company_id)
    order by cm.created_at desc
    limit 1;
  end if;

  if current_company_id is null then
    raise exception 'Company not found for current user';
  end if;

  insert into public.native_push_tokens (
    user_id,
    company_id,
    driver_id,
    account_role,
    expo_push_token,
    platform,
    device_name,
    disabled_at,
    last_seen_at
  )
  values (
    current_user_id,
    current_company_id,
    current_driver_id,
    current_account_role,
    trim(token_value),
    nullif(trim(coalesce(token_platform, '')), ''),
    nullif(trim(coalesce(token_device_name, '')), ''),
    null,
    now()
  )
  on conflict (expo_push_token) do update
  set
    user_id = excluded.user_id,
    company_id = excluded.company_id,
    driver_id = excluded.driver_id,
    account_role = excluded.account_role,
    platform = excluded.platform,
    device_name = excluded.device_name,
    disabled_at = null,
    last_seen_at = now(),
    updated_at = now()
  returning * into saved_token;

  return saved_token;
end;
$$;

create or replace function public.delete_native_push_token(
  token_value text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.native_push_tokens
  set disabled_at = now(), updated_at = now()
  where expo_push_token = trim(token_value)
    and user_id = (select auth.uid());

  return found;
end;
$$;

grant execute on function public.upsert_native_push_token(text, text, text, uuid) to authenticated;
grant execute on function public.delete_native_push_token(text) to authenticated;

select 'Notifiche app native pronte.' as risultato;
