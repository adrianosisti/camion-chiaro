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
