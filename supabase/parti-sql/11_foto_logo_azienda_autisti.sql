-- FOTO AUTISTI E LOGO AZIENDA - CAMION CHIARO
-- Da eseguire una sola volta in Supabase SQL Editor.

alter table public.companies
add column if not exists logo_path text;

alter table public.drivers
add column if not exists profile_image_path text;

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

create or replace function public.set_company_logo_file(
  target_company_id uuid,
  uploaded_file_path text
)
returns public.companies
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_company public.companies;
begin
  if uploaded_file_path is null or length(trim(uploaded_file_path)) = 0 then
    raise exception 'File path required';
  end if;

  if trim(uploaded_file_path) not like target_company_id::text || '/%' then
    raise exception 'File path does not belong to this company';
  end if;

  update public.companies c
  set
    logo_path = trim(uploaded_file_path),
    updated_at = now()
  where c.id = target_company_id
    and (select public.is_company_operator(c.id))
  returning * into updated_company;

  if updated_company.id is null then
    raise exception 'Company not found or not allowed';
  end if;

  return updated_company;
end;
$$;

grant execute on function public.set_company_logo_file(uuid, text) to authenticated;

create or replace function public.set_driver_profile_image_file(
  target_driver_id uuid,
  uploaded_file_path text
)
returns public.drivers
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_driver public.drivers;
begin
  if uploaded_file_path is null or length(trim(uploaded_file_path)) = 0 then
    raise exception 'File path required';
  end if;

  update public.drivers d
  set
    profile_image_path = trim(uploaded_file_path),
    updated_at = now()
  where d.id = target_driver_id
    and trim(uploaded_file_path) like d.company_id::text || '/drivers/' || d.id::text || '/%'
    and (
      (select public.is_company_operator(d.company_id))
      or (select public.is_driver_user(d.id))
    )
  returning * into updated_driver;

  if updated_driver.id is null then
    raise exception 'Driver not found or not allowed';
  end if;

  return updated_driver;
end;
$$;

grant execute on function public.set_driver_profile_image_file(uuid, text) to authenticated;

drop policy if exists "Company members and drivers can read company assets" on storage.objects;
create policy "Company members and drivers can read company assets"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'company-assets'
  and (
    (select public.is_company_member(((storage.foldername(name))[1])::uuid))
    or exists (
      select 1
      from public.drivers d
      where d.company_id::text = (storage.foldername(name))[1]
        and (select public.is_driver_user(d.id))
    )
  )
);

drop policy if exists "Operators can manage company assets" on storage.objects;
create policy "Operators can manage company assets"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'company-assets'
  and (select public.is_company_operator(((storage.foldername(name))[1])::uuid))
)
with check (
  bucket_id = 'company-assets'
  and (select public.is_company_operator(((storage.foldername(name))[1])::uuid))
);

drop policy if exists "Drivers can manage own profile image" on storage.objects;
create policy "Drivers can manage own profile image"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[2] = 'drivers'
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
  and (storage.foldername(name))[2] = 'drivers'
  and exists (
    select 1
    from public.drivers d
    where d.company_id::text = (storage.foldername(name))[1]
      and d.id::text = (storage.foldername(name))[3]
      and (select public.is_driver_user(d.id))
  )
);
