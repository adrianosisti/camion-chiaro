alter table public.vehicle_checks
add column if not exists status text not null default 'open';

alter table public.vehicle_checks
add column if not exists resolved_at timestamptz;

alter table public.vehicle_checks
add column if not exists resolved_by uuid references auth.users(id) on delete set null;

update public.vehicle_checks
set status = 'open'
where status is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'vehicle_checks_status_check'
      and conrelid = 'public.vehicle_checks'::regclass
  ) then
    alter table public.vehicle_checks
    add constraint vehicle_checks_status_check
    check (status in ('open', 'resolved', 'archived'));
  end if;
end $$;

create index if not exists vehicle_checks_company_status_created_idx
on public.vehicle_checks (company_id, status, created_at desc);
