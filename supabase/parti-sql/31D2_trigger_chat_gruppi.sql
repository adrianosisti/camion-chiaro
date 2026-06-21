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
