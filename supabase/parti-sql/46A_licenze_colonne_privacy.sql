-- 46A - Colonne licenza + registro accettazioni privacy

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

