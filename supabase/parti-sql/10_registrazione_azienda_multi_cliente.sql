-- REGISTRAZIONE AZIENDA MULTI-CLIENTE - CAMION CHIARO
-- Collega automaticamente ogni nuovo utente azienda alla sua azienda.
-- Da eseguire una sola volta in Supabase SQL Editor.

create or replace function public.ensure_company_for_current_user(
  input_company_name text,
  input_vat_number text default null,
  input_headquarters text default null
)
returns table (
  id uuid,
  name text,
  vat_number text,
  headquarters text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_company_name text;
  target_company_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated';
  end if;

  select cm.company_id
  into target_company_id
  from public.company_members cm
  where cm.user_id = (select auth.uid())
  order by cm.created_at asc
  limit 1;

  if target_company_id is null then
    clean_company_name := nullif(trim(input_company_name), '');

    if clean_company_name is null then
      select nullif(trim(up.full_name), '')
      into clean_company_name
      from public.user_profiles up
      where up.user_id = (select auth.uid());
    end if;

    clean_company_name := coalesce(clean_company_name, 'Nuova azienda');

    insert into public.companies (name, vat_number, headquarters)
    values (clean_company_name, nullif(trim(input_vat_number), ''), nullif(trim(input_headquarters), ''))
    returning companies.id into target_company_id;

    insert into public.company_members (company_id, user_id, role)
    values (target_company_id, (select auth.uid()), 'owner');

    insert into public.user_profiles (user_id, account_type, full_name)
    values ((select auth.uid()), 'company', clean_company_name)
    on conflict (user_id) do update
      set account_type = 'company',
          full_name = excluded.full_name,
          updated_at = now();
  end if;

  return query
  select c.id, c.name, c.vat_number, c.headquarters
  from public.companies c
  where c.id = target_company_id;
end;
$$;

grant execute on function public.ensure_company_for_current_user(text, text, text) to authenticated;
