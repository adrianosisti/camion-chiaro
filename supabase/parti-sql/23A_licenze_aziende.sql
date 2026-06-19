-- LICENZE AZIENDA - CAMION CHIARO
-- Da eseguire una sola volta in Supabase SQL Editor.
--
-- Questo file mantiene attive le aziende gia presenti.
-- Le nuove aziende create dopo questo aggiornamento partiranno in stato pending.

alter table public.companies
add column if not exists billing_plan text not null default 'starter';

alter table public.companies
add column if not exists billing_status text not null default 'active';

alter table public.companies
add column if not exists billing_email text;

alter table public.companies
add column if not exists billing_provider text not null default 'manual';

alter table public.companies
add column if not exists billing_customer_id text;

alter table public.companies
add column if not exists billing_subscription_id text;

alter table public.companies
add column if not exists billing_current_period_end timestamptz;

alter table public.companies
add column if not exists billing_activated_at timestamptz;

alter table public.companies
add column if not exists billing_note text;

alter table public.companies
alter column billing_status set default 'pending';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'companies_billing_plan_check'
  ) then
    alter table public.companies
    add constraint companies_billing_plan_check
    check (billing_plan in ('starter', 'pro', 'business', 'enterprise'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'companies_billing_status_check'
  ) then
    alter table public.companies
    add constraint companies_billing_status_check
    check (billing_status in ('pending', 'active', 'past_due', 'suspended', 'cancelled'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'companies_billing_provider_check'
  ) then
    alter table public.companies
    add constraint companies_billing_provider_check
    check (billing_provider in ('manual', 'stripe'));
  end if;
end $$;

update public.companies
set
  billing_activated_at = coalesce(billing_activated_at, now()),
  billing_note = coalesce(billing_note, 'Attivazione iniziale per aziende gia presenti prima del blocco licenza.'),
  updated_at = now()
where billing_status = 'active'
  and billing_activated_at is null;

create index if not exists companies_billing_status_idx
on public.companies (billing_status, billing_current_period_end);

-- Per attivare manualmente una nuova azienda dopo il pagamento, usa una query come questa:
--
-- update public.companies
-- set
--   billing_status = 'active',
--   billing_plan = 'pro',
--   billing_email = 'cliente@email.it',
--   billing_activated_at = coalesce(billing_activated_at, now()),
--   updated_at = now()
-- where id = 'ID_AZIENDA_DA_ATTIVARE';
