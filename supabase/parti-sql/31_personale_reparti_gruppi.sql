-- PERSONALE, REPARTI, MULETTI, DOCUMENTI MEZZO E CHAT GRUPPI - PARTE 31
-- Esegui questo file dopo 30_native_push_tokens.sql.
-- Prepara Movigo per autisti, carrellisti/magazzino, ufficio e gruppi aziendali.

do $$
begin
  alter table public.user_profiles drop constraint if exists user_profiles_account_type_check;
  alter table public.user_profiles
    add constraint user_profiles_account_type_check
    check (account_type in ('company', 'driver', 'warehouse', 'office', 'staff'));
end;
$$;

create table if not exists public.company_people (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  linked_driver_id uuid references public.drivers(id) on delete set null,
  username text,
  auth_email text,
  full_name text not null,
  email text,
  phone text,
  department text not null default 'drivers'
    check (department in ('drivers', 'warehouse', 'office', 'management')),
  person_type text not null default 'driver'
    check (person_type in ('driver', 'forklift_operator', 'warehouse_worker', 'office', 'manager')),
  job_title text,
  depot text,
  status text not null default 'active'
    check (status in ('active', 'available', 'travelling', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists company_people_company_linked_driver_uidx
on public.company_people (company_id, linked_driver_id)
where linked_driver_id is not null;

create unique index if not exists company_people_company_username_uidx
on public.company_people (company_id, username)
where username is not null;

create index if not exists company_people_company_department_idx
on public.company_people (company_id, department, status);

create index if not exists company_people_user_id_idx
on public.company_people (user_id)
where user_id is not null;

create table if not exists public.company_assets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  asset_type text not null default 'forklift'
    check (asset_type in ('forklift', 'pallet_truck', 'warehouse_equipment', 'other')),
  code text not null,
  model text,
  serial_number text,
  location text,
  status text not null default 'active'
    check (status in ('active', 'maintenance', 'watch', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, code)
);

create index if not exists company_assets_company_type_idx
on public.company_assets (company_id, asset_type, status);

create table if not exists public.asset_checks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  asset_id uuid not null references public.company_assets(id) on delete restrict,
  person_id uuid references public.company_people(id) on delete set null,
  battery_charge_ok boolean not null default true,
  water_level_ok boolean not null default true,
  forks_ok boolean not null default true,
  tires_ok boolean not null default true,
  brakes_ok boolean not null default true,
  horn_ok boolean not null default true,
  lights_ok boolean not null default true,
  leaks_ok boolean not null default true,
  damage_ok boolean not null default true,
  safety_devices_ok boolean not null default true,
  notes text,
  status text not null default 'open' check (status in ('open', 'resolved', 'archived')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists asset_checks_company_created_idx
on public.asset_checks (company_id, created_at desc);

create index if not exists asset_checks_asset_created_idx
on public.asset_checks (asset_id, created_at desc);

create table if not exists public.vehicle_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  type text not null,
  document_number text,
  expires_at date,
  file_bucket text not null default 'company-assets',
  file_path text,
  status text not null default 'uploaded'
    check (status in ('missing', 'uploaded', 'verified', 'expired', 'archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vehicle_documents_company_vehicle_idx
on public.vehicle_documents (company_id, vehicle_id, status);

create index if not exists vehicle_documents_expires_idx
on public.vehicle_documents (company_id, expires_at)
where expires_at is not null and status <> 'archived';

alter table public.compliance_items
  add column if not exists person_id uuid references public.company_people(id) on delete cascade;

alter table public.compliance_items
  add column if not exists asset_id uuid references public.company_assets(id) on delete cascade;

alter table public.compliance_items drop constraint if exists compliance_scope_target;
alter table public.compliance_items drop constraint if exists compliance_items_scope_check;

alter table public.compliance_items
  add constraint compliance_items_scope_check
  check (scope in ('driver', 'vehicle', 'company', 'person', 'asset'));

alter table public.compliance_items
  add constraint compliance_scope_target
  check (
    (scope = 'driver' and driver_id is not null and vehicle_id is null and person_id is null and asset_id is null)
    or (scope = 'vehicle' and vehicle_id is not null and driver_id is null and person_id is null and asset_id is null)
    or (scope = 'company' and driver_id is null and vehicle_id is null and person_id is null and asset_id is null)
    or (scope = 'person' and person_id is not null and driver_id is null and vehicle_id is null and asset_id is null)
    or (scope = 'asset' and asset_id is not null and driver_id is null and vehicle_id is null and person_id is null)
  );

create index if not exists compliance_items_person_idx
on public.compliance_items (company_id, person_id, due_date)
where person_id is not null;

create index if not exists compliance_items_asset_idx
on public.compliance_items (company_id, asset_id, due_date)
where asset_id is not null;

create table if not exists public.team_chat_threads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  thread_type text not null default 'group' check (thread_type in ('direct', 'group')),
  audience_type text not null default 'custom'
    check (audience_type in ('direct', 'drivers', 'warehouse', 'office', 'all', 'custom')),
  title text not null,
  created_by_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'archived')),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists team_chat_threads_default_audience_uidx
on public.team_chat_threads (company_id, audience_type)
where thread_type = 'group' and audience_type in ('drivers', 'warehouse', 'office', 'all');

create index if not exists team_chat_threads_company_last_idx
on public.team_chat_threads (company_id, coalesce(last_message_at, created_at) desc);

create table if not exists public.team_chat_participants (
  thread_id uuid not null references public.team_chat_threads(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  person_id uuid not null references public.company_people(id) on delete cascade,
  can_write boolean not null default true,
  added_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (thread_id, person_id)
);

create index if not exists team_chat_participants_person_idx
on public.team_chat_participants (person_id, left_at);

create table if not exists public.team_chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.team_chat_threads(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  sender_user_id uuid references auth.users(id) on delete set null,
  sender_person_id uuid references public.company_people(id) on delete set null,
  sender_role text not null default 'company'
    check (sender_role in ('company', 'driver', 'warehouse', 'office', 'system')),
  body text,
  attachment_path text,
  created_at timestamptz not null default now(),
  constraint team_chat_message_has_content check (
    nullif(trim(coalesce(body, '')), '') is not null
    or nullif(trim(coalesce(attachment_path, '')), '') is not null
  )
);

create index if not exists team_chat_messages_thread_created_idx
on public.team_chat_messages (thread_id, created_at asc);

create index if not exists team_chat_messages_company_created_idx
on public.team_chat_messages (company_id, created_at desc);

create table if not exists public.team_chat_message_reads (
  message_id uuid not null references public.team_chat_messages(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  person_id uuid not null references public.company_people(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (message_id, person_id)
);

create index if not exists team_chat_message_reads_person_idx
on public.team_chat_message_reads (person_id, read_at desc);

create or replace function public.get_current_company_person(target_company_id uuid)
returns uuid
language sql
security definer
set search_path = public
as $$
  select p.id
  from public.company_people p
  where p.company_id = target_company_id
    and p.user_id = (select auth.uid())
    and p.status <> 'archived'
  order by p.created_at desc
  limit 1;
$$;

create or replace function public.is_company_person(target_person_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_people p
    where p.id = target_person_id
      and p.user_id = (select auth.uid())
      and p.status <> 'archived'
  );
$$;

create or replace function public.can_access_workforce_company(target_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    (select public.is_company_member(target_company_id))
    or exists (
      select 1
      from public.company_people p
      where p.company_id = target_company_id
        and p.user_id = (select auth.uid())
        and p.status <> 'archived'
    );
$$;

create or replace function public.can_access_team_thread(target_thread_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_chat_threads t
    where t.id = target_thread_id
      and (
        (select public.is_company_member(t.company_id))
        or exists (
          select 1
          from public.team_chat_participants tp
          join public.company_people p on p.id = tp.person_id
          where tp.thread_id = t.id
            and tp.left_at is null
            and p.user_id = (select auth.uid())
            and p.status <> 'archived'
        )
      )
  );
$$;

create or replace function public.sync_driver_to_company_person()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.company_people
  set
    user_id = new.user_id,
    username = new.username,
    auth_email = new.auth_email,
    full_name = new.full_name,
    email = new.email,
    phone = new.phone,
    department = 'drivers',
    person_type = 'driver',
    job_title = coalesce(nullif(new.role, ''), 'Autista'),
    depot = new.depot,
    status = new.status,
    updated_at = now()
  where linked_driver_id = new.id;

  if not found then
    insert into public.company_people (
      company_id,
      user_id,
      linked_driver_id,
      username,
      auth_email,
      full_name,
      email,
      phone,
      department,
      person_type,
      job_title,
      depot,
      status
    )
    values (
      new.company_id,
      new.user_id,
      new.id,
      new.username,
      new.auth_email,
      new.full_name,
      new.email,
      new.phone,
      'drivers',
      'driver',
      coalesce(nullif(new.role, ''), 'Autista'),
      new.depot,
      new.status
    );
  end if;

  return new;
end;
$$;

drop trigger if exists drivers_sync_company_people on public.drivers;
create trigger drivers_sync_company_people
after insert or update on public.drivers
for each row execute function public.sync_driver_to_company_person();

insert into public.company_people (
  company_id,
  user_id,
  linked_driver_id,
  username,
  auth_email,
  full_name,
  email,
  phone,
  department,
  person_type,
  job_title,
  depot,
  status
)
select
  d.company_id,
  d.user_id,
  d.id,
  d.username,
  d.auth_email,
  d.full_name,
  d.email,
  d.phone,
  'drivers',
  'driver',
  coalesce(nullif(d.role, ''), 'Autista'),
  d.depot,
  d.status
from public.drivers d
where not exists (
  select 1
  from public.company_people p
  where p.linked_driver_id = d.id
);

create or replace function public.refresh_team_thread_participants(target_thread_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_thread public.team_chat_threads;
begin
  select *
  into target_thread
  from public.team_chat_threads
  where id = target_thread_id;

  if target_thread.id is null or target_thread.audience_type not in ('drivers', 'warehouse', 'office', 'all') then
    return;
  end if;

  update public.team_chat_participants
  set left_at = now()
  where thread_id = target_thread.id;

  insert into public.team_chat_participants (thread_id, company_id, person_id, can_write, left_at)
  select
    target_thread.id,
    target_thread.company_id,
    p.id,
    true,
    null
  from public.company_people p
  where p.company_id = target_thread.company_id
    and p.status <> 'archived'
    and (
      target_thread.audience_type = 'all'
      or (target_thread.audience_type = 'drivers' and p.department = 'drivers')
      or (target_thread.audience_type = 'warehouse' and p.department = 'warehouse')
      or (target_thread.audience_type = 'office' and p.department = 'office')
    )
  on conflict (thread_id, person_id) do update
  set left_at = null,
      can_write = excluded.can_write;
end;
$$;

create or replace function public.ensure_default_team_threads(target_company_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_thread_id uuid;
begin
  if not (select public.is_company_operator(target_company_id)) then
    raise exception 'Company not allowed';
  end if;

  insert into public.team_chat_threads (company_id, thread_type, audience_type, title, created_by_user_id)
  values (target_company_id, 'group', 'drivers', 'Tutti gli autisti', (select auth.uid()))
  on conflict (company_id, audience_type) where thread_type = 'group' and audience_type in ('drivers', 'warehouse', 'office', 'all')
  do update set title = excluded.title, updated_at = now()
  returning id into saved_thread_id;
  perform public.refresh_team_thread_participants(saved_thread_id);

  insert into public.team_chat_threads (company_id, thread_type, audience_type, title, created_by_user_id)
  values (target_company_id, 'group', 'warehouse', 'Magazzino', (select auth.uid()))
  on conflict (company_id, audience_type) where thread_type = 'group' and audience_type in ('drivers', 'warehouse', 'office', 'all')
  do update set title = excluded.title, updated_at = now()
  returning id into saved_thread_id;
  perform public.refresh_team_thread_participants(saved_thread_id);

  insert into public.team_chat_threads (company_id, thread_type, audience_type, title, created_by_user_id)
  values (target_company_id, 'group', 'office', 'Ufficio', (select auth.uid()))
  on conflict (company_id, audience_type) where thread_type = 'group' and audience_type in ('drivers', 'warehouse', 'office', 'all')
  do update set title = excluded.title, updated_at = now()
  returning id into saved_thread_id;
  perform public.refresh_team_thread_participants(saved_thread_id);

  insert into public.team_chat_threads (company_id, thread_type, audience_type, title, created_by_user_id)
  values (target_company_id, 'group', 'all', 'Tutta l azienda', (select auth.uid()))
  on conflict (company_id, audience_type) where thread_type = 'group' and audience_type in ('drivers', 'warehouse', 'office', 'all')
  do update set title = excluded.title, updated_at = now()
  returning id into saved_thread_id;
  perform public.refresh_team_thread_participants(saved_thread_id);
end;
$$;

create or replace function public.refresh_default_team_threads_for_person()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  thread_row record;
begin
  for thread_row in
    select id
    from public.team_chat_threads
    where company_id = new.company_id
      and thread_type = 'group'
      and audience_type in ('drivers', 'warehouse', 'office', 'all')
  loop
    perform public.refresh_team_thread_participants(thread_row.id);
  end loop;

  return new;
end;
$$;

drop trigger if exists company_people_refresh_default_team_threads on public.company_people;
create trigger company_people_refresh_default_team_threads
after insert or update on public.company_people
for each row execute function public.refresh_default_team_threads_for_person();

create or replace function public.touch_team_chat_thread_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.team_chat_threads
  set last_message_at = new.created_at,
      updated_at = now()
  where id = new.thread_id;

  return new;
end;
$$;

drop trigger if exists team_chat_messages_touch_thread on public.team_chat_messages;
create trigger team_chat_messages_touch_thread
after insert on public.team_chat_messages
for each row execute function public.touch_team_chat_thread_last_message();

create or replace function public.mark_team_message_read(target_message_id uuid)
returns public.team_chat_message_reads
language plpgsql
security definer
set search_path = public
as $$
declare
  target_message public.team_chat_messages;
  current_person_id uuid;
  saved_read public.team_chat_message_reads;
begin
  select *
  into target_message
  from public.team_chat_messages
  where id = target_message_id;

  if target_message.id is null then
    raise exception 'Message not found';
  end if;

  current_person_id := public.get_current_company_person(target_message.company_id);

  if current_person_id is null then
    raise exception 'Person not found for current user';
  end if;

  if not exists (
    select 1
    from public.team_chat_participants tp
    where tp.thread_id = target_message.thread_id
      and tp.person_id = current_person_id
      and tp.left_at is null
  ) then
    raise exception 'Thread not allowed';
  end if;

  insert into public.team_chat_message_reads (message_id, company_id, person_id, read_at)
  values (target_message.id, target_message.company_id, current_person_id, now())
  on conflict (message_id, person_id) do update
  set read_at = excluded.read_at
  returning * into saved_read;

  return saved_read;
end;
$$;

create or replace function public.get_team_message_read_receipts(target_message_id uuid)
returns table (
  person_id uuid,
  full_name text,
  department text,
  person_type text,
  read_at timestamptz,
  has_read boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_message public.team_chat_messages;
begin
  select *
  into target_message
  from public.team_chat_messages
  where id = target_message_id;

  if target_message.id is null then
    raise exception 'Message not found';
  end if;

  if not (
    (select public.is_company_member(target_message.company_id))
    or (select public.can_access_team_thread(target_message.thread_id))
  ) then
    raise exception 'Thread not allowed';
  end if;

  return query
  select
    p.id as person_id,
    p.full_name,
    p.department,
    p.person_type,
    r.read_at,
    (r.read_at is not null) as has_read
  from public.team_chat_participants tp
  join public.company_people p on p.id = tp.person_id
  left join public.team_chat_message_reads r
    on r.message_id = target_message.id
   and r.person_id = p.id
  where tp.thread_id = target_message.thread_id
    and tp.left_at is null
  order by (r.read_at is not null) desc, r.read_at asc nulls last, p.full_name asc;
end;
$$;

grant execute on function public.get_current_company_person(uuid) to authenticated;
grant execute on function public.is_company_person(uuid) to authenticated;
grant execute on function public.can_access_workforce_company(uuid) to authenticated;
grant execute on function public.can_access_team_thread(uuid) to authenticated;
grant execute on function public.ensure_default_team_threads(uuid) to authenticated;
grant execute on function public.refresh_team_thread_participants(uuid) to authenticated;
grant execute on function public.mark_team_message_read(uuid) to authenticated;
grant execute on function public.get_team_message_read_receipts(uuid) to authenticated;

alter table public.company_people enable row level security;
alter table public.company_assets enable row level security;
alter table public.asset_checks enable row level security;
alter table public.vehicle_documents enable row level security;
alter table public.team_chat_threads enable row level security;
alter table public.team_chat_participants enable row level security;
alter table public.team_chat_messages enable row level security;
alter table public.team_chat_message_reads enable row level security;

drop policy if exists "Members and own people can read company people" on public.company_people;
create policy "Members and own people can read company people"
on public.company_people
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or user_id = (select auth.uid())
);

drop policy if exists "Operators can manage company people" on public.company_people;
create policy "Operators can manage company people"
on public.company_people
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

drop policy if exists "Workforce can read company assets" on public.company_assets;
create policy "Workforce can read company assets"
on public.company_assets
for select
to authenticated
using ((select public.can_access_workforce_company(company_id)));

drop policy if exists "Operators can manage company assets" on public.company_assets;
create policy "Operators can manage company assets"
on public.company_assets
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

drop policy if exists "Workforce can read asset checks" on public.asset_checks;
create policy "Workforce can read asset checks"
on public.asset_checks
for select
to authenticated
using ((select public.can_access_workforce_company(company_id)));

drop policy if exists "Operators and assigned people can create asset checks" on public.asset_checks;
create policy "Operators and assigned people can create asset checks"
on public.asset_checks
for insert
to authenticated
with check (
  (select public.is_company_operator(company_id))
  or (
    person_id is not null
    and (select public.is_company_person(person_id))
  )
);

drop policy if exists "Operators can update asset checks" on public.asset_checks;
create policy "Operators can update asset checks"
on public.asset_checks
for update
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

drop policy if exists "Members can read vehicle documents" on public.vehicle_documents;
create policy "Members can read vehicle documents"
on public.vehicle_documents
for select
to authenticated
using ((select public.is_company_member(company_id)));

drop policy if exists "Operators can manage vehicle documents" on public.vehicle_documents;
create policy "Operators can manage vehicle documents"
on public.vehicle_documents
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

drop policy if exists "Workforce can read team chat threads" on public.team_chat_threads;
create policy "Workforce can read team chat threads"
on public.team_chat_threads
for select
to authenticated
using ((select public.can_access_team_thread(id)));

drop policy if exists "Operators can manage team chat threads" on public.team_chat_threads;
create policy "Operators can manage team chat threads"
on public.team_chat_threads
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

drop policy if exists "Workforce can read team participants" on public.team_chat_participants;
create policy "Workforce can read team participants"
on public.team_chat_participants
for select
to authenticated
using ((select public.can_access_team_thread(thread_id)));

drop policy if exists "Operators can manage team participants" on public.team_chat_participants;
create policy "Operators can manage team participants"
on public.team_chat_participants
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

drop policy if exists "Workforce can read team messages" on public.team_chat_messages;
create policy "Workforce can read team messages"
on public.team_chat_messages
for select
to authenticated
using ((select public.can_access_team_thread(thread_id)));

drop policy if exists "Workforce can create team messages" on public.team_chat_messages;
create policy "Workforce can create team messages"
on public.team_chat_messages
for insert
to authenticated
with check (
  (select public.is_company_operator(company_id))
  or (
    sender_person_id is not null
    and (select public.is_company_person(sender_person_id))
    and exists (
      select 1
      from public.team_chat_participants tp
      where tp.thread_id = team_chat_messages.thread_id
        and tp.person_id = team_chat_messages.sender_person_id
        and tp.can_write
        and tp.left_at is null
    )
  )
);

drop policy if exists "Workforce can read team message reads" on public.team_chat_message_reads;
create policy "Workforce can read team message reads"
on public.team_chat_message_reads
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or person_id = (select public.get_current_company_person(company_id))
);

drop policy if exists "People can mark own team message reads" on public.team_chat_message_reads;
create policy "People can mark own team message reads"
on public.team_chat_message_reads
for insert
to authenticated
with check (person_id = (select public.get_current_company_person(company_id)));

do $$
begin
  alter publication supabase_realtime add table public.team_chat_threads;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.team_chat_participants;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.team_chat_messages;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.team_chat_message_reads;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
