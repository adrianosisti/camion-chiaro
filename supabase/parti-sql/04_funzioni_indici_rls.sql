create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = target_company_id
      and cm.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_company_operator(target_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = target_company_id
      and cm.user_id = (select auth.uid())
      and cm.role in ('owner', 'admin', 'operator')
  );
$$;

create or replace function public.is_driver_user(target_driver_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.drivers d
    where d.id = target_driver_id
      and d.user_id = (select auth.uid())
  );
$$;

create or replace function public.create_company_for_current_user(
  company_name text,
  vat_number text default null,
  headquarters text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.companies (name, vat_number, headquarters)
  values (company_name, vat_number, headquarters)
  returning id into new_company_id;

  insert into public.company_members (company_id, user_id, role)
  values (new_company_id, (select auth.uid()), 'owner');

  return new_company_id;
end;
$$;

create index user_profiles_account_type_idx on public.user_profiles (account_type);
create index company_members_user_id_idx on public.company_members (user_id);
create index drivers_company_status_idx on public.drivers (company_id, status);
create index drivers_user_id_idx on public.drivers (user_id) where user_id is not null;
create index drivers_username_idx on public.drivers (username);
create index drivers_phone_idx on public.drivers (phone);
create index vehicles_company_status_idx on public.vehicles (company_id, status);
create index vehicles_company_type_idx on public.vehicles (company_id, fleet_type, status);
create index driver_documents_driver_idx on public.driver_documents (driver_id, expires_at);
create index compliance_items_company_due_idx
  on public.compliance_items (company_id, due_date)
  where status in ('open', 'renewing');
create index compliance_items_driver_due_idx
  on public.compliance_items (driver_id, due_date)
  where driver_id is not null and status in ('open', 'renewing');
create index compliance_items_vehicle_due_idx
  on public.compliance_items (vehicle_id, due_date)
  where vehicle_id is not null and status in ('open', 'renewing');
create index notification_preferences_company_idx on public.notification_preferences (company_id);
create index notification_preferences_driver_idx on public.notification_preferences (driver_id) where driver_id is not null;
create index in_app_notifications_driver_created_idx on public.in_app_notifications (driver_id, created_at desc);
create index vehicle_checks_driver_created_idx on public.vehicle_checks (driver_id, created_at desc);
create index fault_reports_company_status_idx on public.fault_reports (company_id, status, created_at desc);
create index reminder_logs_company_item_idx on public.reminder_logs (company_id, compliance_item_id, sent_at desc);

alter table public.user_profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.drivers enable row level security;
alter table public.vehicles enable row level security;
alter table public.driver_documents enable row level security;
alter table public.compliance_items enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.in_app_notifications enable row level security;
alter table public.vehicle_checks enable row level security;
alter table public.fault_reports enable row level security;
alter table public.reminder_logs enable row level security;
