-- STORAGE FILE E LIMITI - CAMION CHIARO
-- Da eseguire una sola volta dopo 24_dati_fatturazione_stripe.sql.

create table if not exists public.company_storage_files (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  bucket_id text not null,
  file_path text not null,
  category text not null check (category in ('chat', 'document', 'fault', 'logo', 'profile', 'invoice', 'other')),
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  driver_id uuid references public.drivers(id) on delete set null,
  document_id uuid references public.driver_documents(id) on delete set null,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (bucket_id, file_path)
);

alter table public.company_storage_files enable row level security;

create index if not exists company_storage_files_company_active_idx
on public.company_storage_files (company_id, category)
where deleted_at is null;

create or replace function public.can_access_company_storage(target_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    (select public.is_company_member(target_company_id))
    or exists (
      select 1
      from public.drivers d
      where d.company_id = target_company_id
        and d.user_id = (select auth.uid())
    );
$$;

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
  select
    coalesce(sum(size_bytes), 0)::bigint as total_bytes,
    coalesce(sum(size_bytes) filter (where category = 'chat'), 0)::bigint as chat_bytes,
    coalesce(sum(size_bytes) filter (where category = 'document'), 0)::bigint as document_bytes,
    coalesce(sum(size_bytes) filter (where category = 'fault'), 0)::bigint as fault_bytes,
    coalesce(sum(size_bytes) filter (where category in ('profile', 'logo')), 0)::bigint as profile_bytes,
    count(*)::bigint as file_count
  from public.company_storage_files
  where company_id = target_company_id
    and deleted_at is null
    and (select public.can_access_company_storage(target_company_id));
$$;

create or replace function public.mark_company_storage_file_deleted(
  storage_bucket text,
  storage_path text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer := 0;
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated';
  end if;

  update public.company_storage_files sf
  set deleted_at = now()
  where sf.bucket_id = trim(storage_bucket)
    and sf.file_path = trim(storage_path)
    and sf.deleted_at is null
    and (select public.can_access_company_storage(sf.company_id));

  get diagnostics affected_count = row_count;
  return affected_count > 0;
end;
$$;

grant execute on function public.register_company_storage_file(uuid, text, text, text, bigint, uuid, uuid) to authenticated;
grant execute on function public.get_company_storage_summary(uuid) to authenticated;
grant execute on function public.mark_company_storage_file_deleted(text, text) to authenticated;

drop policy if exists "Members can read company storage files" on public.company_storage_files;
create policy "Members can read company storage files"
on public.company_storage_files
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or exists (
    select 1
    from public.drivers d
    where d.company_id = company_storage_files.company_id
      and d.user_id = (select auth.uid())
  )
);
