-- 47C - Limite storage piano
-- Impedisce di registrare file oltre i GB inclusi nel piano + extra storage.

create or replace function public.assert_company_storage_limit(
  target_company_id uuid,
  incoming_bytes bigint,
  storage_bucket text default null,
  storage_path text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  company_row public.companies%rowtype;
  current_bytes bigint := 0;
  limit_bytes numeric;
  limit_gb numeric;
  limits jsonb;
begin
  select * into company_row
  from public.companies
  where id = target_company_id;

  if company_row.id is null then
    raise exception 'Company not found';
  end if;

  if company_row.billing_status <> 'active' then
    raise exception 'Piano Vygo non attivo. Completa o riattiva abbonamento.';
  end if;

  limits := public.get_company_plan_limits(target_company_id);
  limit_gb := nullif(limits ->> 'storageGb', '')::numeric;
  if limit_gb is null then
    return;
  end if;

  select coalesce(sum(size_bytes), 0)::bigint
  into current_bytes
  from public.company_storage_files sf
  where sf.company_id = target_company_id
    and sf.deleted_at is null
    and (
      storage_bucket is null
      or storage_path is null
      or sf.bucket_id <> trim(storage_bucket)
      or sf.file_path <> trim(storage_path)
    );

  limit_bytes := limit_gb * 1024 * 1024 * 1024;

  if current_bytes + greatest(coalesce(incoming_bytes, 0), 0) > limit_bytes then
    raise exception 'Spazio file Vygo esaurito: piano % GB. Elimina file vecchi, aggiungi storage o aggiorna piano.', limit_gb;
  end if;
end;
$$;

grant execute on function public.assert_company_storage_limit(uuid, bigint, text, text) to authenticated;
