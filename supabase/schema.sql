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
set search_path = public
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
