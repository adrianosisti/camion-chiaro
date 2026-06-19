-- CHAT INTERNA - PARTE 14B3
-- Storage foto chat. Esegui dopo 14B2.

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
