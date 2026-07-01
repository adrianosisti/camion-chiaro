-- 46B - Policy RLS registro privacy

drop policy if exists "Users can read legal acceptances" on public.legal_acceptances;
create policy "Users can read legal acceptances"
on public.legal_acceptances
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select public.is_company_member(company_id))
);

drop policy if exists "Users can insert own legal acceptances" on public.legal_acceptances;
create policy "Users can insert own legal acceptances"
on public.legal_acceptances
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (
    (select public.is_company_member(company_id))
    or exists (
      select 1
      from public.drivers d
      where d.company_id = legal_acceptances.company_id
        and d.user_id = (select auth.uid())
        and d.status <> 'archived'
    )
    or exists (
      select 1
      from public.company_people p
      where p.company_id = legal_acceptances.company_id
        and p.user_id = (select auth.uid())
        and p.status <> 'archived'
    )
  )
);

drop policy if exists "Users can update own legal acceptances" on public.legal_acceptances;
create policy "Users can update own legal acceptances"
on public.legal_acceptances
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

