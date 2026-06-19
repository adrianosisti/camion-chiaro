-- RIMOZIONE FOTO PROFILO AUTISTA - CAMION CHIARO
-- Da eseguire una sola volta in Supabase SQL Editor.

create or replace function public.clear_driver_profile_image_file(
  target_driver_id uuid
)
returns public.drivers
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_driver public.drivers;
begin
  update public.drivers d
  set
    profile_image_path = null,
    updated_at = now()
  where d.id = target_driver_id
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

grant execute on function public.clear_driver_profile_image_file(uuid) to authenticated;
