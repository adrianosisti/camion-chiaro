insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'driver-documents',
  'driver-documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.set_driver_document_file(
  target_document_id uuid,
  uploaded_file_path text
)
returns public.driver_documents
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_document public.driver_documents;
begin
  if uploaded_file_path is null or length(trim(uploaded_file_path)) = 0 then
    raise exception 'File path required';
  end if;

  update public.driver_documents dd
  set
    file_path = trim(uploaded_file_path),
    status = 'uploaded',
    updated_at = now()
  where dd.id = target_document_id
    and (
      (select public.is_company_operator(dd.company_id))
      or (
        dd.visible_to_driver
        and (select public.is_driver_user(dd.driver_id))
      )
    )
  returning * into updated_document;

  if updated_document.id is null then
    raise exception 'Document not found or not allowed';
  end if;

  return updated_document;
end;
$$;

grant execute on function public.set_driver_document_file(uuid, text) to authenticated;

drop policy if exists "Members and assigned drivers can read driver document files" on storage.objects;
create policy "Members and assigned drivers can read driver document files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'driver-documents'
  and (
    exists (
      select 1
      from public.drivers d
      where d.company_id::text = (storage.foldername(name))[1]
        and (select public.is_company_member(d.company_id))
    )
    or exists (
      select 1
      from public.drivers d
      where d.company_id::text = (storage.foldername(name))[1]
        and d.id::text = (storage.foldername(name))[2]
        and (select public.is_driver_user(d.id))
    )
  )
);

drop policy if exists "Operators can manage driver document files" on storage.objects;
create policy "Operators can manage driver document files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'driver-documents'
  and exists (
    select 1
    from public.drivers d
    where d.company_id::text = (storage.foldername(name))[1]
      and (select public.is_company_operator(d.company_id))
  )
)
with check (
  bucket_id = 'driver-documents'
  and exists (
    select 1
    from public.drivers d
    where d.company_id::text = (storage.foldername(name))[1]
      and (select public.is_company_operator(d.company_id))
  )
);

drop policy if exists "Assigned drivers can upload their document files" on storage.objects;
create policy "Assigned drivers can upload their document files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'driver-documents'
  and exists (
    select 1
    from public.drivers d
    where d.company_id::text = (storage.foldername(name))[1]
      and d.id::text = (storage.foldername(name))[2]
      and (select public.is_driver_user(d.id))
  )
);
