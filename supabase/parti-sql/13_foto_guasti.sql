-- FOTO SEGNALAZIONI GUASTO - CAMION CHIARO
-- Da eseguire una sola volta in Supabase SQL Editor.

alter table public.fault_reports
add column if not exists photo_path text;

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

drop policy if exists "Drivers can manage own fault image files" on storage.objects;
create policy "Drivers can manage own fault image files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[2] = 'faults'
  and exists (
    select 1
    from public.drivers d
    where d.company_id::text = (storage.foldername(name))[1]
      and d.id::text = (storage.foldername(name))[3]
      and (select public.is_driver_user(d.id))
  )
)
with check (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[2] = 'faults'
  and exists (
    select 1
    from public.drivers d
    where d.company_id::text = (storage.foldername(name))[1]
      and d.id::text = (storage.foldername(name))[3]
      and (select public.is_driver_user(d.id))
  )
);
