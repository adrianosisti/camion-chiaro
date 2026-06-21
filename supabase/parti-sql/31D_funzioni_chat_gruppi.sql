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
