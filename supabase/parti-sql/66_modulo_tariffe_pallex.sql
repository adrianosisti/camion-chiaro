alter table public.companies
  add column if not exists billing_addon_pallex_tariffs boolean not null default false;

comment on column public.companies.billing_addon_pallex_tariffs is
  'Abilita manualmente il modulo riservato Tariffe Pallex per aziende concessionarie autorizzate.';
