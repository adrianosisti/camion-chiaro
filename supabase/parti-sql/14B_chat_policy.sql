-- CHAT INTERNA - PARTE 14B
-- Esegui questo file solo dopo che 14A_chat_tabelle.sql ha dato Success.

alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-assets',
  'company-assets',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Members and drivers can manage chat image files" on storage.objects;
create policy "Members and drivers can manage chat image files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[2] = 'chat'
  and (
    (
      (select public.is_company_operator(((storage.foldername(name))[1])::uuid))
    )
    or exists (
      select 1
      from public.chat_threads t
      where t.company_id::text = (storage.foldername(name))[1]
        and t.id::text = (storage.foldername(name))[3]
        and t.driver_id is not null
        and (select public.is_driver_user(t.driver_id))
    )
  )
)
with check (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[2] = 'chat'
  and (
    (
      (select public.is_company_operator(((storage.foldername(name))[1])::uuid))
    )
    or exists (
      select 1
      from public.chat_threads t
      where t.company_id::text = (storage.foldername(name))[1]
        and t.id::text = (storage.foldername(name))[3]
        and t.driver_id is not null
        and (select public.is_driver_user(t.driver_id))
    )
  )
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end;
$$;
