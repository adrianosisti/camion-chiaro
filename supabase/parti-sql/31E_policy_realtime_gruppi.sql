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
