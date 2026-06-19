-- STORICO DOCUMENTI - PARTE 18B
-- Funzione che salva un movimento nello storico documenti.

create or replace function public.log_driver_document_event(
  target_document_id uuid,
  event_type text,
  event_file_path text default null,
  event_previous_file_path text default null,
  event_notes text default null
)
returns public.driver_document_events
language plpgsql
security definer
set search_path = public
as $$
declare
  document_row public.driver_documents;
  actor_role text;
  inserted_event public.driver_document_events;
begin
  if event_type not in ('created', 'updated', 'file_uploaded', 'file_removed', 'deleted') then
    raise exception 'Invalid document event type';
  end if;

  select *
  into document_row
  from public.driver_documents
  where id = target_document_id;

  if document_row.id is null then
    raise exception 'Document not found';
  end if;

  if (select public.is_company_operator(document_row.company_id)) then
    actor_role := 'company';
  elsif document_row.visible_to_driver and (select public.is_driver_user(document_row.driver_id)) then
    actor_role := 'driver';
  else
    raise exception 'Document event not allowed';
  end if;

  insert into public.driver_document_events (
    company_id,
    driver_id,
    document_id,
    document_type,
    document_number,
    event_type,
    actor_user_id,
    actor_role,
    file_path,
    previous_file_path,
    notes
  )
  values (
    document_row.company_id,
    document_row.driver_id,
    document_row.id,
    document_row.type,
    document_row.document_number,
    event_type,
    (select auth.uid()),
    actor_role,
    event_file_path,
    event_previous_file_path,
    nullif(trim(coalesce(event_notes, '')), '')
  )
  returning * into inserted_event;

  return inserted_event;
end;
$$;

grant execute on function public.log_driver_document_event(uuid, text, text, text, text) to authenticated;
