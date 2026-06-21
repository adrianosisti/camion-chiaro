alter table public.team_chat_threads
  add column if not exists direct_key text;

create or replace function public.is_company_visible_team_thread(target_thread_id uuid)
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
        (
          t.thread_type = 'direct'
          and t.audience_type = 'direct'
          and t.direct_key like 'company:%'
        )
        or (
          t.thread_type = 'group'
          and t.audience_type in ('drivers', 'warehouse', 'office', 'all')
        )
      )
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
        (
          (select public.is_company_member(t.company_id))
          and (select public.is_company_visible_team_thread(t.id))
        )
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

drop policy if exists "Workforce can read team chat threads" on public.team_chat_threads;
create policy "Workforce can read team chat threads"
on public.team_chat_threads
for select
to authenticated
using ((select public.can_access_team_thread(id)));

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
  (
    sender_role = 'company'
    and (select public.is_company_operator(company_id))
    and (select public.is_company_visible_team_thread(thread_id))
  )
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
  person_id = (select public.get_current_company_person(company_id))
  or exists (
    select 1
    from public.team_chat_messages m
    where m.id = team_chat_message_reads.message_id
      and (select public.can_access_team_thread(m.thread_id))
  )
);

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

  if not (select public.can_access_team_thread(target_message.thread_id)) then
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

grant execute on function public.is_company_visible_team_thread(uuid) to authenticated;
grant execute on function public.can_access_team_thread(uuid) to authenticated;
grant execute on function public.get_team_message_read_receipts(uuid) to authenticated;
