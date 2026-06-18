create policy "Users can read own profile"
on public.user_profiles
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can update own profile"
on public.user_profiles
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Members can read their companies"
on public.companies
for select
to authenticated
using ((select public.is_company_member(id)));

create policy "Operators can update their companies"
on public.companies
for update
to authenticated
using ((select public.is_company_operator(id)))
with check ((select public.is_company_operator(id)));

create policy "Members can read company membership"
on public.company_members
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_company_member(company_id)));

create policy "Operators can manage company membership"
on public.company_members
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Members and matched drivers can read drivers"
on public.drivers
for select
to authenticated
using ((select public.is_company_member(company_id)) or user_id = (select auth.uid()));

create policy "Operators can manage drivers"
on public.drivers
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Members and assigned drivers can read vehicles"
on public.vehicles
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or exists (
    select 1
    from public.drivers d
    where d.company_id = vehicles.company_id
      and d.user_id = (select auth.uid())
  )
);

create policy "Operators can manage vehicles"
on public.vehicles
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Members and assigned drivers can read driver documents"
on public.driver_documents
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (
    visible_to_driver
    and (select public.is_driver_user(driver_id))
  )
);

create policy "Operators can manage driver documents"
on public.driver_documents
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Members and assigned drivers can read compliance items"
on public.compliance_items
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (
    driver_id is not null
    and (select public.is_driver_user(driver_id))
  )
);

create policy "Operators can manage compliance items"
on public.compliance_items
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));
