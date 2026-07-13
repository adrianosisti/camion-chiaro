-- VYGO - CONTRATTI ONLINE, ARCHIVIO ATTIVAZIONE E STRIPE
-- Esegui dopo 24_dati_fatturazione_stripe.sql e 46_licenze_privacy_limiti.sql.
-- Scopo: salvare la busta contrattuale online prima del checkout e collegarla al pagamento.

create extension if not exists pgcrypto;

create table if not exists public.company_contract_envelopes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  billing_profile_company_id uuid references public.company_billing_profiles(company_id) on delete set null,
  plan text not null,
  status text not null default 'draft'
    check (status in ('draft', 'accepted', 'checkout_started', 'checkout_completed', 'payment_active', 'payment_failed', 'cancelled', 'signed_external')),
  signing_mode text not null default 'clickwrap'
    check (signing_mode in ('clickwrap', 'provider')),
  legal_name text not null,
  vat_number text,
  tax_code text,
  billing_email text not null,
  phone text,
  contact_name text,
  address_line1 text not null,
  address_line2 text,
  postal_code text not null,
  city text not null,
  province text,
  country text not null default 'IT',
  pec text,
  sdi_code text,
  document_versions jsonb not null default '{}'::jsonb,
  acceptance_snapshot jsonb not null default '{}'::jsonb,
  stripe_checkout_session_id text,
  stripe_customer_id text,
  stripe_subscription_id text,
  signed_pdf_path text,
  archive_path text,
  accepted_at timestamptz,
  checkout_started_at timestamptz,
  checkout_completed_at timestamptz,
  activated_at timestamptz,
  cancelled_at timestamptz,
  accepted_ip_hint text,
  accepted_user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_contract_events (
  id uuid primary key default gen_random_uuid(),
  envelope_id uuid not null references public.company_contract_envelopes(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.company_contract_envelopes enable row level security;
alter table public.company_contract_events enable row level security;

drop policy if exists "Members can read company contract envelopes" on public.company_contract_envelopes;
create policy "Members can read company contract envelopes"
on public.company_contract_envelopes
for select
to authenticated
using ((select public.is_company_member(company_id)));

drop policy if exists "Operators can create company contract envelopes" on public.company_contract_envelopes;
create policy "Operators can create company contract envelopes"
on public.company_contract_envelopes
for insert
to authenticated
with check ((select public.is_company_operator(company_id)));

drop policy if exists "Operators can update company contract envelopes" on public.company_contract_envelopes;
create policy "Operators can update company contract envelopes"
on public.company_contract_envelopes
for update
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

drop policy if exists "Members can read company contract events" on public.company_contract_events;
create policy "Members can read company contract events"
on public.company_contract_events
for select
to authenticated
using ((select public.is_company_member(company_id)));

drop policy if exists "Operators can create company contract events" on public.company_contract_events;
create policy "Operators can create company contract events"
on public.company_contract_events
for insert
to authenticated
with check ((select public.is_company_operator(company_id)));

create index if not exists company_contract_envelopes_company_idx
on public.company_contract_envelopes (company_id, created_at desc);

create index if not exists company_contract_envelopes_billing_profile_idx
on public.company_contract_envelopes (billing_profile_company_id);

create index if not exists company_contract_envelopes_status_idx
on public.company_contract_envelopes (status, created_at desc);

create index if not exists company_contract_envelopes_checkout_idx
on public.company_contract_envelopes (stripe_checkout_session_id)
where stripe_checkout_session_id is not null;

create index if not exists company_contract_envelopes_subscription_idx
on public.company_contract_envelopes (stripe_subscription_id)
where stripe_subscription_id is not null;

create index if not exists company_contract_events_envelope_idx
on public.company_contract_events (envelope_id, created_at desc);

create index if not exists company_contract_events_company_idx
on public.company_contract_events (company_id, created_at desc);

select '67 contratti online pronto: buste contrattuali e storico eventi attivi.' as risultato;
