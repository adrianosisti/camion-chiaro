-- DOCUMENTI AUTISTA - CAMION CHIARO
-- Permette all autista collegato di creare una scheda documento propria dall app.

create or replace function public.create_driver_document_for_current_driver(
  document_type text,
  document_number text default null,
  document_expires_at date default null
)
returns public.driver_documents
language plpgsql
security definer
set search_path = public
as $$
declare
  current_driver public.drivers;
  new_document public.driver_documents;
begin
  if document_type is null or length(trim(document_type)) = 0 then
    raise exception 'Document type required';
  end if;

  select *
  into current_driver
  from public.drivers d
  where d.user_id = (select auth.uid())
    and d.status <> 'archived'
  order by d.created_at desc
  limit 1;

  if current_driver.id is null then
    raise exception 'Driver not found';
  end if;

  insert into public.driver_documents (
    company_id,
    driver_id,
    type,
    document_number,
    expires_at,
    status,
    visible_to_driver
  )
  values (
    current_driver.company_id,
    current_driver.id,
    trim(document_type),
    nullif(trim(coalesce(document_number, '')), ''),
    document_expires_at,
    'missing',
    true
  )
  returning * into new_document;

  return new_document;
end;
$$;

grant execute on function public.create_driver_document_for_current_driver(text, text, date) to authenticated;
