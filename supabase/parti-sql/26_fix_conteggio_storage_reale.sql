-- FIX CONTEGGIO STORAGE REALE - CAMION CHIARO
-- Da eseguire dopo 25_storage_file_e_limiti.sql se il pannello "Spazio file" resta a 0.

create or replace function public.get_company_storage_summary(target_company_id uuid)
returns table (
  total_bytes bigint,
  chat_bytes bigint,
  document_bytes bigint,
  fault_bytes bigint,
  profile_bytes bigint,
  file_count bigint
)
language sql
security definer
set search_path = public
as $$
  with storage_objects as (
    select
      so.bucket_id,
      so.name as file_path,
      case
        when so.bucket_id = 'driver-documents' then 'document'
        when so.bucket_id = 'company-invoices' then 'invoice'
        when so.bucket_id = 'company-assets' and (storage.foldername(so.name))[2] = 'chat' then 'chat'
        when so.bucket_id = 'company-assets' and (storage.foldername(so.name))[2] = 'faults' then 'fault'
        when so.bucket_id = 'company-assets' and (storage.foldername(so.name))[2] in ('company-logo', 'drivers') then 'profile'
        else 'other'
      end as category,
      greatest(coalesce(nullif(so.metadata->>'size', '')::bigint, 0), 0) as size_bytes
    from storage.objects so
    where so.bucket_id in ('driver-documents', 'company-assets', 'company-invoices')
      and (storage.foldername(so.name))[1] = target_company_id::text
      and (select public.can_access_company_storage(target_company_id))
  ),
  registered_files as (
    select
      sf.bucket_id,
      sf.file_path,
      sf.category,
      sf.size_bytes
    from public.company_storage_files sf
    where sf.company_id = target_company_id
      and sf.deleted_at is null
      and (select public.can_access_company_storage(target_company_id))
  ),
  files_to_count as (
    select category, size_bytes
    from registered_files
    union all
    select so.category, so.size_bytes
    from storage_objects so
    where not exists (
      select 1
      from public.company_storage_files sf
      where sf.bucket_id = so.bucket_id
        and sf.file_path = so.file_path
        and sf.deleted_at is null
    )
  )
  select
    coalesce(sum(size_bytes), 0)::bigint as total_bytes,
    coalesce(sum(size_bytes) filter (where category = 'chat'), 0)::bigint as chat_bytes,
    coalesce(sum(size_bytes) filter (where category = 'document'), 0)::bigint as document_bytes,
    coalesce(sum(size_bytes) filter (where category = 'fault'), 0)::bigint as fault_bytes,
    coalesce(sum(size_bytes) filter (where category in ('profile', 'logo')), 0)::bigint as profile_bytes,
    count(*)::bigint as file_count
  from files_to_count;
$$;

grant execute on function public.get_company_storage_summary(uuid) to authenticated;
