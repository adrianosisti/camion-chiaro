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
