-- RINNOVO DOCUMENTI AUTISTA - CAMION CHIARO
-- Permette ad autista o azienda di aggiornare file, numero e nuova scadenza.
-- Aggiorna anche la scadenza collegata in compliance_items, cosi la criticita sparisce.

create or replace function public.renew_driver_document(
  target_document_id uuid,
  document_type text default null,
  document_number text default null,
  document_expires_at date default null,
  uploaded_file_path text default null
)
returns public.driver_documents
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_document public.driver_documents;
  updated_document public.driver_documents;
  previous_file_path text;
  clean_type text;
  clean_number text;
  clean_file_path text;
  next_status text;
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into existing_document
  from public.driver_documents
  where id = target_document_id
  for update;

  if existing_document.id is null then
    raise exception 'Document not found';
  end if;

  if not (
    (select public.is_company_operator(existing_document.company_id))
    or (
      existing_document.visible_to_driver
      and (select public.is_driver_user(existing_document.driver_id))
    )
  ) then
    raise exception 'Document not allowed';
  end if;

  previous_file_path := existing_document.file_path;
  clean_type := nullif(trim(coalesce(document_type, '')), '');
  clean_number := nullif(trim(coalesce(document_number, existing_document.document_number, '')), '');
  clean_file_path := nullif(trim(coalesce(uploaded_file_path, '')), '');

  next_status := case
    when coalesce(document_expires_at, existing_document.expires_at) is not null
      and coalesce(document_expires_at, existing_document.expires_at) < current_date
      then 'expired'
    when coalesce(clean_file_path, existing_document.file_path) is not null
      then 'uploaded'
    else 'missing'
  end;

  update public.driver_documents dd
  set
    type = coalesce(clean_type, dd.type),
    document_number = clean_number,
    expires_at = coalesce(document_expires_at, dd.expires_at),
    file_path = coalesce(clean_file_path, dd.file_path),
    status = next_status,
    updated_at = now()
  where dd.id = existing_document.id
  returning * into updated_document;

  update public.compliance_items ci
  set
    type = updated_document.type,
    document_number = updated_document.document_number,
    due_date = updated_document.expires_at,
    status = case
      when updated_document.expires_at is null then 'done'
      else 'open'
    end,
    updated_at = now()
  where ci.company_id = updated_document.company_id
    and ci.driver_id = updated_document.driver_id
    and ci.scope = 'driver'
    and ci.status in ('open', 'renewing')
    and updated_document.expires_at is not null
    and (
      lower(trim(ci.type)) = lower(trim(updated_document.type))
      or lower(trim(ci.type)) = lower(trim(existing_document.type))
      or (
        ci.document_number is not null
        and updated_document.document_number is not null
        and lower(trim(ci.document_number)) = lower(trim(updated_document.document_number))
      )
      or (
        ci.document_number is not null
        and existing_document.document_number is not null
        and lower(trim(ci.document_number)) = lower(trim(existing_document.document_number))
      )
    );

  if to_regprocedure('public.log_driver_document_event(uuid,text,text,text,text)') is not null then
    perform public.log_driver_document_event(
      updated_document.id,
      'updated',
      clean_file_path,
      previous_file_path,
      'Rinnovo documento con nuova scadenza'
    );
  end if;

  return updated_document;
end;
$$;

grant execute on function public.renew_driver_document(uuid, text, text, date, text) to authenticated;
