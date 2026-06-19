-- NOTIFICHE PUSH TELEFONO - PARTE 17A
-- Crea tabella, indici e regole base per salvare i telefoni.

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
