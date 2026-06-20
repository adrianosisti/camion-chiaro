create extension if not exists pgcrypto;

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  account_type text not null check (account_type in ('company', 'driver')),
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vat_number text,
  headquarters text,
  logo_path text,
  billing_plan text not null default 'starter' check (billing_plan in ('starter', 'pro', 'business', 'enterprise')),
  billing_status text not null default 'pending' check (billing_status in ('pending', 'active', 'past_due', 'suspended', 'cancelled')),
  billing_email text,
  billing_provider text not null default 'manual' check (billing_provider in ('manual', 'stripe')),
  billing_customer_id text,
  billing_subscription_id text,
  billing_current_period_end timestamptz,
  billing_activated_at timestamptz,
  billing_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'operator' check (role in ('owner', 'admin', 'operator')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table public.company_invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_number text not null,
  issued_at date not null default current_date,
  due_at date,
  paid_at timestamptz,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'eur',
  status text not null default 'draft' check (status in ('draft', 'open', 'paid', 'uncollectible', 'cancelled')),
  pdf_path text,
  billing_provider text not null default 'manual' check (billing_provider in ('manual', 'stripe')),
  external_invoice_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, invoice_number)
);

create table public.company_billing_profiles (
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

create table public.company_storage_files (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  bucket_id text not null,
  file_path text not null,
  category text not null check (category in ('chat', 'document', 'fault', 'logo', 'profile', 'invoice', 'other')),
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  driver_id uuid references public.drivers(id) on delete set null,
  document_id uuid references public.driver_documents(id) on delete set null,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (bucket_id, file_path)
);

create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  username text not null,
  auth_email text,
  full_name text not null,
  email text,
  phone text not null,
  role text,
  depot text,
  status text not null default 'active' check (status in ('active', 'available', 'travelling', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, phone),
  unique (company_id, username),
  unique (auth_email)
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  plate text not null,
  model text,
  type text,
  fleet_type text not null default 'trattore' check (fleet_type in ('furgone', 'motrice', 'trattore', 'semirimorchio')),
  km integer not null default 0 check (km >= 0),
  status text not null default 'active' check (status in ('active', 'maintenance', 'watch', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, plate)
);

create table public.driver_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  type text not null,
  document_number text,
  expires_at date,
  file_path text,
  status text not null default 'uploaded' check (status in ('missing', 'uploaded', 'verified', 'expired')),
  visible_to_driver boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.driver_document_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete set null,
  document_id uuid references public.driver_documents(id) on delete set null,
  document_type text not null,
  document_number text,
  event_type text not null check (event_type in ('created', 'updated', 'file_uploaded', 'file_removed', 'deleted')),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text not null check (actor_role in ('company', 'driver', 'system')),
  file_path text,
  previous_file_path text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.compliance_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  scope text not null check (scope in ('driver', 'vehicle', 'company')),
  type text not null,
  document_number text,
  due_date date not null,
  reminder_days integer[] not null default array[60, 30, 15, 7],
  owner text,
  status text not null default 'open' check (status in ('open', 'renewing', 'done', 'archived')),
  last_reminder_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint compliance_scope_target check (
    (scope = 'driver' and driver_id is not null and vehicle_id is null)
    or (scope = 'vehicle' and vehicle_id is not null and driver_id is null)
    or (scope = 'company' and driver_id is null and vehicle_id is null)
  )
);

create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete cascade,
  in_app_enabled boolean not null default true,
  reminder_days integer[] not null default array[60, 30, 15, 7],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, driver_id)
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete cascade,
  account_role text not null check (account_role in ('company', 'driver')),
  endpoint text not null,
  endpoint_hash text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  disabled_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete cascade,
  compliance_item_id uuid references public.compliance_items(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.vehicle_checks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  tractor_id uuid not null references public.vehicles(id) on delete restrict,
  semitrailer_id uuid references public.vehicles(id) on delete restrict,
  odometer_km integer check (odometer_km is null or odometer_km >= 0),
  lights_ok boolean not null default true,
  tires_ok boolean not null default true,
  documents_on_board boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create table public.fault_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  semitrailer_id uuid references public.vehicles(id) on delete restrict,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'stop_vehicle')),
  title text not null,
  description text,
  photo_path text,
  status text not null default 'open' check (status in ('open', 'seen', 'in_progress', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  compliance_item_id uuid references public.compliance_items(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete cascade,
  channel text not null check (channel in ('email', 'push', 'in_app')),
  recipient text not null,
  sent_at timestamptz not null default now(),
  status text not null default 'sent' check (status in ('queued', 'sent', 'failed')),
  payload jsonb not null default '{}'::jsonb
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  insert into public.user_profiles (user_id, account_type, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'account_type', 'company'),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'company_name'),
    new.phone
  )
  on conflict (user_id) do nothing;

  update public.drivers
  set user_id = new.id
  where user_id is null
    and (
      (new.phone is not null and phone = new.phone)
      or (new.email is not null and auth_email = new.email)
    );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create trigger touch_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.touch_updated_at();

create trigger touch_companies_updated_at
before update on public.companies
for each row execute function public.touch_updated_at();

create trigger touch_drivers_updated_at
before update on public.drivers
for each row execute function public.touch_updated_at();

create trigger touch_vehicles_updated_at
before update on public.vehicles
for each row execute function public.touch_updated_at();

create trigger touch_driver_documents_updated_at
before update on public.driver_documents
for each row execute function public.touch_updated_at();

create trigger touch_compliance_items_updated_at
before update on public.compliance_items
for each row execute function public.touch_updated_at();

create trigger touch_notification_preferences_updated_at
before update on public.notification_preferences
for each row execute function public.touch_updated_at();

create trigger touch_push_subscriptions_updated_at
before update on public.push_subscriptions
for each row execute function public.touch_updated_at();

create trigger touch_fault_reports_updated_at
before update on public.fault_reports
for each row execute function public.touch_updated_at();

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

create or replace function public.can_access_company_storage(target_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    (select public.is_company_member(target_company_id))
    or exists (
      select 1
      from public.drivers d
      where d.company_id = target_company_id
        and d.user_id = (select auth.uid())
    );
$$;

create or replace function public.register_company_storage_file(
  target_company_id uuid,
  storage_bucket text,
  storage_path text,
  storage_category text,
  file_size_bytes bigint,
  target_driver_id uuid default null,
  target_document_id uuid default null
)
returns public.company_storage_files
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_file public.company_storage_files;
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated';
  end if;

  if not (select public.can_access_company_storage(target_company_id)) then
    raise exception 'Company not allowed';
  end if;

  if storage_category not in ('chat', 'document', 'fault', 'logo', 'profile', 'invoice', 'other') then
    raise exception 'Storage category not allowed';
  end if;

  insert into public.company_storage_files (
    company_id,
    bucket_id,
    file_path,
    category,
    size_bytes,
    driver_id,
    document_id,
    uploaded_by
  )
  values (
    target_company_id,
    trim(storage_bucket),
    trim(storage_path),
    storage_category,
    greatest(coalesce(file_size_bytes, 0), 0),
    target_driver_id,
    target_document_id,
    (select auth.uid())
  )
  on conflict (bucket_id, file_path) do update
    set size_bytes = excluded.size_bytes,
        category = excluded.category,
        driver_id = excluded.driver_id,
        document_id = excluded.document_id,
        uploaded_by = excluded.uploaded_by,
        deleted_at = null
  returning * into inserted_file;

  return inserted_file;
end;
$$;

create or replace function public.get_company_storage_summary(target_company_id uuid)
returns table (
  total_bytes bigint,
  chat_bytes bigint,
  document_bytes bigint,
  fault_bytes bigint,
  profile_bytes bigint,
  file_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    coalesce(sum(size_bytes), 0)::bigint as total_bytes,
    coalesce(sum(size_bytes) filter (where category = 'chat'), 0)::bigint as chat_bytes,
    coalesce(sum(size_bytes) filter (where category = 'document'), 0)::bigint as document_bytes,
    coalesce(sum(size_bytes) filter (where category = 'fault'), 0)::bigint as fault_bytes,
    coalesce(sum(size_bytes) filter (where category in ('profile', 'logo')), 0)::bigint as profile_bytes,
    count(*)::bigint as file_count
  from public.company_storage_files
  where company_id = target_company_id
    and deleted_at is null
    and (select public.can_access_company_storage(target_company_id));
$$;

create or replace function public.mark_company_storage_file_deleted(
  storage_bucket text,
  storage_path text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer := 0;
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated';
  end if;

  update public.company_storage_files sf
  set deleted_at = now()
  where sf.bucket_id = trim(storage_bucket)
    and sf.file_path = trim(storage_path)
    and sf.deleted_at is null
    and (select public.can_access_company_storage(sf.company_id));

  get diagnostics affected_count = row_count;
  return affected_count > 0;
end;
$$;

grant execute on function public.register_company_storage_file(uuid, text, text, text, bigint, uuid, uuid) to authenticated;
grant execute on function public.get_company_storage_summary(uuid) to authenticated;
grant execute on function public.mark_company_storage_file_deleted(text, text) to authenticated;

create or replace function public.create_company_for_current_user(
  company_name text,
  vat_number text default null,
  headquarters text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
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

create or replace function public.ensure_company_for_current_user(
  input_company_name text,
  input_vat_number text default null,
  input_headquarters text default null
)
returns table (
  id uuid,
  name text,
  vat_number text,
  headquarters text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_company_name text;
  target_company_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated';
  end if;

  select cm.company_id
  into target_company_id
  from public.company_members cm
  where cm.user_id = (select auth.uid())
  order by cm.created_at asc
  limit 1;

  if target_company_id is null then
    clean_company_name := nullif(trim(input_company_name), '');

    if clean_company_name is null then
      select nullif(trim(up.full_name), '')
      into clean_company_name
      from public.user_profiles up
      where up.user_id = (select auth.uid());
    end if;

    clean_company_name := coalesce(clean_company_name, 'Nuova azienda');

    insert into public.companies (name, vat_number, headquarters)
    values (clean_company_name, nullif(trim(input_vat_number), ''), nullif(trim(input_headquarters), ''))
    returning companies.id into target_company_id;

    insert into public.company_members (company_id, user_id, role)
    values (target_company_id, (select auth.uid()), 'owner');

    insert into public.user_profiles (user_id, account_type, full_name)
    values ((select auth.uid()), 'company', clean_company_name)
    on conflict (user_id) do update
      set account_type = 'company',
          full_name = excluded.full_name,
          updated_at = now();
  end if;

  return query
  select c.id, c.name, c.vat_number, c.headquarters
  from public.companies c
  where c.id = target_company_id;
end;
$$;

grant execute on function public.ensure_company_for_current_user(text, text, text) to authenticated;

create index user_profiles_account_type_idx on public.user_profiles (account_type);
create index companies_billing_status_idx on public.companies (billing_status, billing_current_period_end);
create index company_members_user_id_idx on public.company_members (user_id);
create index company_invoices_company_issued_idx on public.company_invoices (company_id, issued_at desc);
create index company_billing_profiles_email_idx on public.company_billing_profiles (billing_email);
create index company_storage_files_company_active_idx
on public.company_storage_files (company_id, category)
where deleted_at is null;
create index drivers_company_status_idx on public.drivers (company_id, status);
create index drivers_user_id_idx on public.drivers (user_id) where user_id is not null;
create index drivers_username_idx on public.drivers (username);
create index drivers_phone_idx on public.drivers (phone);
create index vehicles_company_status_idx on public.vehicles (company_id, status);
create index vehicles_company_type_idx on public.vehicles (company_id, fleet_type, status);
create index driver_documents_driver_idx on public.driver_documents (driver_id, expires_at);
create index driver_document_events_company_created_idx
  on public.driver_document_events (company_id, created_at desc);
create index driver_document_events_driver_created_idx
  on public.driver_document_events (driver_id, created_at desc)
  where driver_id is not null;
create index driver_document_events_document_created_idx
  on public.driver_document_events (document_id, created_at desc)
  where document_id is not null;
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
create index push_subscriptions_user_active_idx on public.push_subscriptions (user_id, disabled_at);
create index push_subscriptions_company_active_idx on public.push_subscriptions (company_id, account_role, disabled_at);
create index push_subscriptions_driver_active_idx
  on public.push_subscriptions (driver_id, disabled_at)
  where driver_id is not null;
create index in_app_notifications_driver_created_idx on public.in_app_notifications (driver_id, created_at desc);
create index vehicle_checks_driver_created_idx on public.vehicle_checks (driver_id, created_at desc);
create index fault_reports_company_status_idx on public.fault_reports (company_id, status, created_at desc);
create index reminder_logs_company_item_idx on public.reminder_logs (company_id, compliance_item_id, sent_at desc);

alter table public.user_profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.company_invoices enable row level security;
alter table public.company_billing_profiles enable row level security;
alter table public.company_storage_files enable row level security;
alter table public.drivers enable row level security;
alter table public.vehicles enable row level security;
alter table public.driver_documents enable row level security;
alter table public.driver_document_events enable row level security;
alter table public.compliance_items enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.in_app_notifications enable row level security;
alter table public.vehicle_checks enable row level security;
alter table public.fault_reports enable row level security;
alter table public.reminder_logs enable row level security;

create policy "Users can read own profile"
on public.user_profiles
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can update own profile"
on public.user_profiles
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Members can read their companies"
on public.companies
for select
to authenticated
using ((select public.is_company_member(id)));

create policy "Operators can update their companies"
on public.companies
for update
to authenticated
using ((select public.is_company_operator(id)))
with check ((select public.is_company_operator(id)));

create policy "Members can read company invoices"
on public.company_invoices
for select
to authenticated
using ((select public.is_company_member(company_id)));

create policy "Members can read company billing profile"
on public.company_billing_profiles
for select
to authenticated
using ((select public.is_company_member(company_id)));

create policy "Operators can manage company billing profile"
on public.company_billing_profiles
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Members can read company storage files"
on public.company_storage_files
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or exists (
    select 1
    from public.drivers d
    where d.company_id = company_storage_files.company_id
      and d.user_id = (select auth.uid())
  )
);

create policy "Members can read company membership"
on public.company_members
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_company_member(company_id)));

create policy "Operators can manage company membership"
on public.company_members
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Members and matched drivers can read drivers"
on public.drivers
for select
to authenticated
using ((select public.is_company_member(company_id)) or user_id = (select auth.uid()));

create policy "Operators can manage drivers"
on public.drivers
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Members and assigned drivers can read vehicles"
on public.vehicles
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or exists (
    select 1
    from public.drivers d
    where d.company_id = vehicles.company_id
      and d.user_id = (select auth.uid())
  )
);

create policy "Operators can manage vehicles"
on public.vehicles
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Members and assigned drivers can read driver documents"
on public.driver_documents
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (
    visible_to_driver
    and (select public.is_driver_user(driver_id))
  )
);

create policy "Operators can manage driver documents"
on public.driver_documents
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Members and drivers can read document events"
on public.driver_document_events
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (
    driver_id is not null
    and (select public.is_driver_user(driver_id))
  )
);

create policy "Members and assigned drivers can read compliance items"
on public.compliance_items
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (
    driver_id is not null
    and (select public.is_driver_user(driver_id))
  )
);

create policy "Operators can manage compliance items"
on public.compliance_items
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Members and drivers can read notification preferences"
on public.notification_preferences
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (
    driver_id is not null
    and (select public.is_driver_user(driver_id))
  )
);

create policy "Operators can manage notification preferences"
on public.notification_preferences
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Users can read own push subscriptions"
on public.push_subscriptions
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can delete own push subscriptions"
on public.push_subscriptions
for delete
to authenticated
using (user_id = (select auth.uid()));

create policy "Drivers and members can read in app notifications"
on public.in_app_notifications
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (
    driver_id is not null
    and (select public.is_driver_user(driver_id))
  )
);

create policy "Operators can create in app notifications"
on public.in_app_notifications
for insert
to authenticated
with check ((select public.is_company_operator(company_id)));

create policy "Drivers can mark own notifications read"
on public.in_app_notifications
for update
to authenticated
using (driver_id is not null and (select public.is_driver_user(driver_id)))
with check (driver_id is not null and (select public.is_driver_user(driver_id)));

create policy "Drivers and members can read vehicle checks"
on public.vehicle_checks
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (select public.is_driver_user(driver_id))
);

create policy "Drivers can create own vehicle checks"
on public.vehicle_checks
for insert
to authenticated
with check ((select public.is_driver_user(driver_id)));

create policy "Operators can read and manage vehicle checks"
on public.vehicle_checks
for update
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Drivers and members can read fault reports"
on public.fault_reports
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (select public.is_driver_user(driver_id))
);

create policy "Drivers can create own fault reports"
on public.fault_reports
for insert
to authenticated
with check ((select public.is_driver_user(driver_id)));

create policy "Operators can update fault reports"
on public.fault_reports
for update
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Members can read reminder logs"
on public.reminder_logs
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (
    driver_id is not null
    and (select public.is_driver_user(driver_id))
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'driver-documents',
  'driver-documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-invoices',
  'company-invoices',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.set_driver_document_file(
  target_document_id uuid,
  uploaded_file_path text
)
returns public.driver_documents
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_document public.driver_documents;
begin
  if uploaded_file_path is null or length(trim(uploaded_file_path)) = 0 then
    raise exception 'File path required';
  end if;

  update public.driver_documents dd
  set
    file_path = trim(uploaded_file_path),
    status = 'uploaded',
    updated_at = now()
  where dd.id = target_document_id
    and (
      (select public.is_company_operator(dd.company_id))
      or (
        dd.visible_to_driver
        and (select public.is_driver_user(dd.driver_id))
      )
    )
  returning * into updated_document;

  if updated_document.id is null then
    raise exception 'Document not found or not allowed';
  end if;

  return updated_document;
end;
$$;

grant execute on function public.set_driver_document_file(uuid, text) to authenticated;

create or replace function public.create_driver_document_for_current_driver(
  document_type text,
  document_number text default null,
  document_expires_at date default null
)
returns public.driver_documents
language plpgsql
security definer
set search_path = public
as $$
declare
  current_driver public.drivers;
  new_document public.driver_documents;
begin
  if document_type is null or length(trim(document_type)) = 0 then
    raise exception 'Document type required';
  end if;

  select *
  into current_driver
  from public.drivers d
  where d.user_id = (select auth.uid())
    and d.status <> 'archived'
  order by d.created_at desc
  limit 1;

  if current_driver.id is null then
    raise exception 'Driver not found';
  end if;

  insert into public.driver_documents (
    company_id,
    driver_id,
    type,
    document_number,
    expires_at,
    status,
    visible_to_driver
  )
  values (
    current_driver.company_id,
    current_driver.id,
    trim(document_type),
    nullif(trim(coalesce(document_number, '')), ''),
    document_expires_at,
    'missing',
    true
  )
  returning * into new_document;

  return new_document;
end;
$$;

grant execute on function public.create_driver_document_for_current_driver(text, text, date) to authenticated;

create or replace function public.upsert_push_subscription(
  subscription_endpoint text,
  subscription_p256dh text,
  subscription_auth text,
  subscription_user_agent text default null,
  subscription_target_company_id uuid default null
)
returns public.push_subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_company_id uuid;
  current_driver_id uuid;
  current_role text;
  saved_subscription public.push_subscriptions;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if subscription_endpoint is null or length(trim(subscription_endpoint)) = 0 then
    raise exception 'Endpoint required';
  end if;

  if subscription_p256dh is null or length(trim(subscription_p256dh)) = 0 then
    raise exception 'Push key required';
  end if;

  if subscription_auth is null or length(trim(subscription_auth)) = 0 then
    raise exception 'Push auth required';
  end if;

  select d.company_id, d.id, 'driver'::text
  into current_company_id, current_driver_id, current_role
  from public.drivers d
  where d.user_id = current_user_id
    and d.status <> 'archived'
    and (subscription_target_company_id is null or d.company_id = subscription_target_company_id)
  order by d.created_at desc
  limit 1;

  if current_company_id is null then
    select cm.company_id, null::uuid, 'company'::text
    into current_company_id, current_driver_id, current_role
    from public.company_members cm
    where cm.user_id = current_user_id
      and cm.role in ('owner', 'admin', 'operator')
      and (subscription_target_company_id is null or cm.company_id = subscription_target_company_id)
    order by cm.created_at desc
    limit 1;
  end if;

  if current_company_id is null then
    raise exception 'Company not found for current user';
  end if;

  insert into public.push_subscriptions (
    user_id,
    company_id,
    driver_id,
    account_role,
    endpoint,
    endpoint_hash,
    p256dh,
    auth,
    user_agent,
    disabled_at,
    last_seen_at
  )
  values (
    current_user_id,
    current_company_id,
    current_driver_id,
    current_role,
    trim(subscription_endpoint),
    encode(extensions.digest(trim(subscription_endpoint), 'sha256'), 'hex'),
    trim(subscription_p256dh),
    trim(subscription_auth),
    nullif(trim(coalesce(subscription_user_agent, '')), ''),
    null,
    now()
  )
  on conflict (endpoint_hash) do update
  set
    user_id = excluded.user_id,
    company_id = excluded.company_id,
    driver_id = excluded.driver_id,
    account_role = excluded.account_role,
    endpoint = excluded.endpoint,
    p256dh = excluded.p256dh,
    auth = excluded.auth,
    user_agent = excluded.user_agent,
    disabled_at = null,
    last_seen_at = now(),
    updated_at = now()
  returning * into saved_subscription;

  return saved_subscription;
end;
$$;

create or replace function public.delete_push_subscription(
  subscription_endpoint text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.push_subscriptions
  set disabled_at = now(), updated_at = now()
  where endpoint_hash = encode(extensions.digest(trim(subscription_endpoint), 'sha256'), 'hex')
    and user_id = (select auth.uid());

  return found;
end;
$$;

grant execute on function public.upsert_push_subscription(text, text, text, text, uuid) to authenticated;
grant execute on function public.delete_push_subscription(text) to authenticated;

create or replace function public.log_driver_document_event(
  target_document_id uuid,
  event_type text,
  event_file_path text default null,
  event_previous_file_path text default null,
  event_notes text default null
)
returns public.driver_document_events
language plpgsql
security definer
set search_path = public
as $$
declare
  document_row public.driver_documents;
  actor_role text;
  inserted_event public.driver_document_events;
begin
  if event_type not in ('created', 'updated', 'file_uploaded', 'file_removed', 'deleted') then
    raise exception 'Invalid document event type';
  end if;

  select *
  into document_row
  from public.driver_documents
  where id = target_document_id;

  if document_row.id is null then
    raise exception 'Document not found';
  end if;

  if (select public.is_company_operator(document_row.company_id)) then
    actor_role := 'company';
  elsif document_row.visible_to_driver and (select public.is_driver_user(document_row.driver_id)) then
    actor_role := 'driver';
  else
    raise exception 'Document event not allowed';
  end if;

  insert into public.driver_document_events (
    company_id,
    driver_id,
    document_id,
    document_type,
    document_number,
    event_type,
    actor_user_id,
    actor_role,
    file_path,
    previous_file_path,
    notes
  )
  values (
    document_row.company_id,
    document_row.driver_id,
    document_row.id,
    document_row.type,
    document_row.document_number,
    event_type,
    (select auth.uid()),
    actor_role,
    event_file_path,
    event_previous_file_path,
    nullif(trim(coalesce(event_notes, '')), '')
  )
  returning * into inserted_event;

  return inserted_event;
end;
$$;

grant execute on function public.log_driver_document_event(uuid, text, text, text, text) to authenticated;

drop policy if exists "Members and assigned drivers can read driver document files" on storage.objects;
create policy "Members and assigned drivers can read driver document files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'driver-documents'
  and (
    exists (
      select 1
      from public.drivers d
      where d.company_id::text = (storage.foldername(name))[1]
        and (select public.is_company_member(d.company_id))
    )
    or exists (
      select 1
      from public.drivers d
      where d.company_id::text = (storage.foldername(name))[1]
        and d.id::text = (storage.foldername(name))[2]
        and (select public.is_driver_user(d.id))
    )
  )
);

drop policy if exists "Operators can manage driver document files" on storage.objects;
create policy "Operators can manage driver document files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'driver-documents'
  and exists (
    select 1
    from public.drivers d
    where d.company_id::text = (storage.foldername(name))[1]
      and (select public.is_company_operator(d.company_id))
  )
)
with check (
  bucket_id = 'driver-documents'
  and exists (
    select 1
    from public.drivers d
    where d.company_id::text = (storage.foldername(name))[1]
      and (select public.is_company_operator(d.company_id))
  )
);

drop policy if exists "Assigned drivers can upload their document files" on storage.objects;
create policy "Assigned drivers can upload their document files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'driver-documents'
  and exists (
    select 1
    from public.drivers d
    where d.company_id::text = (storage.foldername(name))[1]
      and d.id::text = (storage.foldername(name))[2]
      and (select public.is_driver_user(d.id))
  )
);

drop policy if exists "Members can read company invoice files" on storage.objects;
create policy "Members can read company invoice files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'company-invoices'
  and (select public.is_company_member(((storage.foldername(name))[1])::uuid))
);
