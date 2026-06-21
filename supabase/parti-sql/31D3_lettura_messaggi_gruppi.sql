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
