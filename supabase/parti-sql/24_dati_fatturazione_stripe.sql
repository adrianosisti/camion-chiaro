-- DATI FATTURAZIONE E STRIPE - CAMION CHIARO
-- Da eseguire una sola volta dopo 23B_fatture_aziende.sql.

create table if not exists public.company_billing_profiles (
  company_id uuid primary key references public.companies(id) on delete cascade,
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.company_billing_profiles enable row level security;

drop policy if exists "Members can read company billing profile" on public.company_billing_profiles;
create policy "Members can read company billing profile"
on public.company_billing_profiles
for select
to authenticated
using ((select public.is_company_member(company_id)));

drop policy if exists "Operators can manage company billing profile" on public.company_billing_profiles;
create policy "Operators can manage company billing profile"
on public.company_billing_profiles
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create index if not exists company_billing_profiles_email_idx
on public.company_billing_profiles (billing_email);
