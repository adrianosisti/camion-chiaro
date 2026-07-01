-- 47D - Registra file con limite piano
-- Aggancia il controllo storage alla funzione esistente register_company_storage_file.

create or replace function public.register_company_storage_file(
  target_company_id uuid,
  storage_bucket text,
  storage_path text,
  storage_category text,
  file_size_bytes bigint,
  target_driver_id uuid default null,
  target_document_id uuid default null
)
returns public.company_storage_files
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_file public.company_storage_files;
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated';
  end if;

  if not (select public.can_access_company_storage(target_company_id)) then
    raise exception 'Company not allowed';
  end if;

  if storage_category not in ('chat', 'document', 'fault', 'logo', 'profile', 'invoice', 'other') then
    raise exception 'Storage category not allowed';
  end if;

  perform public.assert_company_storage_limit(
    target_company_id,
    greatest(coalesce(file_size_bytes, 0), 0),
    storage_bucket,
    storage_path
  );

  insert into public.company_storage_files (
    company_id,
    bucket_id,
    file_path,
    category,
    size_bytes,
    driver_id,
    document_id,
    uploaded_by
  )
  values (
    target_company_id,
    trim(storage_bucket),
    trim(storage_path),
    storage_category,
    greatest(coalesce(file_size_bytes, 0), 0),
    target_driver_id,
    target_document_id,
    (select auth.uid())
  )
  on conflict (bucket_id, file_path) do update
    set size_bytes = excluded.size_bytes,
        category = excluded.category,
        driver_id = excluded.driver_id,
        document_id = excluded.document_id,
        uploaded_by = excluded.uploaded_by,
        deleted_at = null
  returning * into inserted_file;

  return inserted_file;
end;
$$;

grant execute on function public.register_company_storage_file(uuid, text, text, text, bigint, uuid, uuid) to authenticated;
