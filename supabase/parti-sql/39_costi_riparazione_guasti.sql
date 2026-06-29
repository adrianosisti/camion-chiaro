alter table public.fault_reports
  add column if not exists repair_cost_cents integer not null default 0 check (repair_cost_cents >= 0),
  add column if not exists repair_cost_currency text not null default 'EUR',
  add column if not exists repair_notes text,
  add column if not exists repair_recorded_at timestamptz,
  add column if not exists repair_recorded_by uuid references auth.users(id) on delete set null;

create index if not exists fault_reports_company_vehicle_repair_idx
on public.fault_reports (company_id, vehicle_id, (coalesce(repair_recorded_at, updated_at, created_at)) desc);

create index if not exists fault_reports_company_repair_cost_idx
on public.fault_reports (company_id, repair_cost_cents)
where repair_cost_cents > 0;
