-- PIANI FLOTTA E COSTI OPERATIVI - CAMION CHIARO
-- Da eseguire dopo 23A_licenze_aziende.sql quando si vogliono usare i nuovi piani commerciali.

alter table public.companies
drop constraint if exists companies_billing_plan_check;

alter table public.companies
add constraint companies_billing_plan_check
check (
  billing_plan in (
    'starter',
    'pro',
    'business',
    'enterprise',
    'fleet10',
    'fleet20',
    'fleet30',
    'fleet50'
  )
);

comment on column public.companies.billing_plan is
'Piani Vygo: starter=Start 5, fleet10, fleet20, fleet30, fleet50, enterprise. pro/business restano accettati per compatibilita storica.';
