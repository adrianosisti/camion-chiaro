-- CRM INTERNO ADMIN - CAMION CHIARO
-- Salva note, priorita e follow-up dei clienti visibili solo dal pannello admin.

create table if not exists public.admin_company_controls (
  company_id uuid primary key references public.companies(id) on delete cascade,
  sales_stage text not null default 'active',
  priority text not null default 'normal',
  owner_name text,
  next_follow_up date,
  notes text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_company_controls
add column if not exists sales_stage text not null default 'active';

alter table public.admin_company_controls
add column if not exists priority text not null default 'normal';

alter table public.admin_company_controls
add column if not exists owner_name text;

alter table public.admin_company_controls
add column if not exists next_follow_up date;

alter table public.admin_company_controls
add column if not exists notes text;

alter table public.admin_company_controls
add column if not exists updated_by uuid references auth.users(id) on delete set null;

alter table public.admin_company_controls
add column if not exists created_at timestamptz not null default now();

alter table public.admin_company_controls
add column if not exists updated_at timestamptz not null default now();

alter table public.admin_company_controls
drop constraint if exists admin_company_controls_sales_stage_check;

alter table public.admin_company_controls
add constraint admin_company_controls_sales_stage_check
check (sales_stage in ('lead', 'trial', 'onboarding', 'active', 'risk', 'upsell', 'lost'));

alter table public.admin_company_controls
drop constraint if exists admin_company_controls_priority_check;

alter table public.admin_company_controls
add constraint admin_company_controls_priority_check
check (priority in ('low', 'normal', 'high', 'urgent'));

create index if not exists admin_company_controls_priority_idx
on public.admin_company_controls (priority, next_follow_up);

alter table public.admin_company_controls enable row level security;

comment on table public.admin_company_controls is
'Note e stato commerciale interno Movigo. Nessuna policy client: accesso solo via service role Netlify admin.';
