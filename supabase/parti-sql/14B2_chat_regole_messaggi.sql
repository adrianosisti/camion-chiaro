-- CHAT INTERNA - PARTE 14B2
-- Regole messaggi. Esegui dopo 14B1.

alter table public.chat_messages enable row level security;

drop policy if exists "Members and drivers can read chat messages" on public.chat_messages;
create policy "Members and drivers can read chat messages"
on public.chat_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.chat_threads t
    where t.id = chat_messages.thread_id
      and t.company_id = chat_messages.company_id
      and (
        (select public.is_company_member(t.company_id))
        or (
          t.driver_id is not null
          and (select public.is_driver_user(t.driver_id))
        )
      )
  )
);

drop policy if exists "Members and drivers can create chat messages" on public.chat_messages;
create policy "Members and drivers can create chat messages"
on public.chat_messages
for insert
to authenticated
with check (
  sender_user_id = (select auth.uid())
  and exists (
    select 1
    from public.chat_threads t
    where t.id = chat_messages.thread_id
      and t.company_id = chat_messages.company_id
      and (
        (
          chat_messages.sender_role = 'company'
          and (select public.is_company_operator(t.company_id))
        )
        or (
          chat_messages.sender_role = 'driver'
          and t.driver_id is not null
          and (select public.is_driver_user(t.driver_id))
        )
      )
  )
);

drop policy if exists "Members and drivers can update own chat read state" on public.chat_messages;
create policy "Members and drivers can update own chat read state"
on public.chat_messages
for update
to authenticated
using (
  exists (
    select 1
    from public.chat_threads t
    where t.id = chat_messages.thread_id
      and t.company_id = chat_messages.company_id
      and (
        (select public.is_company_member(t.company_id))
        or (
          t.driver_id is not null
          and (select public.is_driver_user(t.driver_id))
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.chat_threads t
    where t.id = chat_messages.thread_id
      and t.company_id = chat_messages.company_id
      and (
        (select public.is_company_member(t.company_id))
        or (
          t.driver_id is not null
          and (select public.is_driver_user(t.driver_id))
        )
      )
  )
);
