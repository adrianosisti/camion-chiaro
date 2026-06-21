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
