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
