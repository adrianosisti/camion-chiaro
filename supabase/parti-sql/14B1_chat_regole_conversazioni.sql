-- CHAT INTERNA - PARTE 14B1
-- Regole conversazioni. Esegui dopo 14A.

alter table public.chat_threads enable row level security;

drop policy if exists "Members and drivers can read chat threads" on public.chat_threads;
create policy "Members and drivers can read chat threads"
on public.chat_threads
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (
    driver_id is not null
    and (select public.is_driver_user(driver_id))
  )
);

drop policy if exists "Members and drivers can create chat threads" on public.chat_threads;
create policy "Members and drivers can create chat threads"
on public.chat_threads
for insert
to authenticated
with check (
  (
    driver_id is null
    or (select public.is_driver_in_company(driver_id, company_id))
  )
  and (
    (select public.is_company_operator(company_id))
    or (
      driver_id is not null
      and (select public.is_driver_user(driver_id))
    )
  )
);

drop policy if exists "Operators can update chat threads" on public.chat_threads;
create policy "Operators can update chat threads"
on public.chat_threads
for update
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));
