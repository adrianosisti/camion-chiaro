-- LETTURE E BADGE GRUPPI CHAT - CAMION CHIARO
-- Aggiunge i non letti per singolo gruppo/reparto e permette di azzerarli quando si apre la chat.

alter table public.team_chat_messages
add column if not exists read_by_company_at timestamptz;

create index if not exists team_chat_messages_company_unread_idx
on public.team_chat_messages (company_id, thread_id, read_by_company_at)
where sender_role <> 'company';

create or replace function public.mark_team_thread_read(target_thread_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  current_person_id uuid;
  marked_count integer := 0;
  target_thread public.team_chat_threads;
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into target_thread
  from public.team_chat_threads
  where id = target_thread_id;

  if target_thread.id is null then
    raise exception 'Thread not found';
  end if;

  if (select public.is_company_member(target_thread.company_id)) then
    update public.team_chat_messages
    set read_by_company_at = now()
    where thread_id = target_thread.id
      and sender_role <> 'company'
      and read_by_company_at is null;

    get diagnostics marked_count = row_count;
    return marked_count;
  end if;

  current_person_id := public.get_current_company_person(target_thread.company_id);

  if current_person_id is null then
    raise exception 'Person not found for current user';
  end if;

  if not exists (
    select 1
    from public.team_chat_participants tp
    where tp.thread_id = target_thread.id
      and tp.person_id = current_person_id
      and tp.left_at is null
  ) then
    raise exception 'Thread not allowed';
  end if;

  insert into public.team_chat_message_reads (message_id, company_id, person_id, read_at)
  select
    m.id,
    m.company_id,
    current_person_id,
    now()
  from public.team_chat_messages m
  where m.thread_id = target_thread.id
    and m.sender_person_id is distinct from current_person_id
    and not exists (
      select 1
      from public.team_chat_message_reads r
      where r.message_id = m.id
        and r.person_id = current_person_id
    )
  on conflict (message_id, person_id) do nothing;

  get diagnostics marked_count = row_count;
  return marked_count;
end;
$$;

create or replace function public.get_team_thread_unread_counts(target_company_id uuid)
returns table (
  thread_id uuid,
  unread_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_person_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated';
  end if;

  if (select public.is_company_member(target_company_id)) then
    return query
    select
      t.id as thread_id,
      count(m.id) as unread_count
    from public.team_chat_threads t
    left join public.team_chat_messages m
      on m.thread_id = t.id
     and m.sender_role <> 'company'
     and m.read_by_company_at is null
    where t.company_id = target_company_id
      and t.status = 'open'
      and (
        (t.thread_type = 'group' and t.audience_type in ('drivers', 'warehouse', 'office', 'all'))
        or (t.thread_type = 'direct' and coalesce(t.direct_key, '') like 'company:%')
      )
    group by t.id;
    return;
  end if;

  current_person_id := public.get_current_company_person(target_company_id);

  if current_person_id is null then
    return;
  end if;

  return query
  select
    t.id as thread_id,
    count(m.id) as unread_count
  from public.team_chat_threads t
  join public.team_chat_participants tp
    on tp.thread_id = t.id
   and tp.person_id = current_person_id
   and tp.left_at is null
  left join public.team_chat_messages m
    on m.thread_id = t.id
   and m.sender_person_id is distinct from current_person_id
   and not exists (
     select 1
     from public.team_chat_message_reads r
     where r.message_id = m.id
       and r.person_id = current_person_id
   )
  where t.company_id = target_company_id
    and t.status = 'open'
  group by t.id;
end;
$$;

grant execute on function public.mark_team_thread_read(uuid) to authenticated;
grant execute on function public.get_team_thread_unread_counts(uuid) to authenticated;
