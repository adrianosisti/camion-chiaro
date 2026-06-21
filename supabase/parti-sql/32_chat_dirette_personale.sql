alter table public.team_chat_threads
  add column if not exists direct_key text;

create unique index if not exists team_chat_threads_direct_key_uidx
on public.team_chat_threads (company_id, direct_key)
where thread_type = 'direct' and direct_key is not null;

create or replace function public.ensure_direct_team_thread(
  target_company_id uuid,
  target_person_id uuid
)
returns public.team_chat_threads
language plpgsql
security definer
set search_path = public
as $$
declare
  current_person_id uuid;
  current_person public.company_people;
  target_person public.company_people;
  saved_thread public.team_chat_threads;
  saved_direct_key text;
  saved_title text;
begin
  if not (select public.can_access_workforce_company(target_company_id)) then
    raise exception 'Company not allowed';
  end if;

  select *
  into target_person
  from public.company_people
  where id = target_person_id
    and company_id = target_company_id
    and status <> 'archived';

  if target_person.id is null then
    raise exception 'Person not found';
  end if;

  current_person_id := public.get_current_company_person(target_company_id);

  if current_person_id is not null then
    select *
    into current_person
    from public.company_people
    where id = current_person_id
      and company_id = target_company_id
      and status <> 'archived';

    if current_person.id = target_person.id then
      saved_direct_key := 'company:' || target_person.id::text;
      saved_title := target_person.full_name;
    else
      if current_person.id < target_person.id then
        saved_direct_key := 'person:' || current_person.id::text || ':' || target_person.id::text;
      else
        saved_direct_key := 'person:' || target_person.id::text || ':' || current_person.id::text;
      end if;

      saved_title := current_person.full_name || ' / ' || target_person.full_name;
    end if;
  else
    if not (select public.is_company_operator(target_company_id)) then
      raise exception 'Person not found for current user';
    end if;

    saved_direct_key := 'company:' || target_person.id::text;
    saved_title := target_person.full_name;
  end if;

  insert into public.team_chat_threads (
    audience_type,
    company_id,
    direct_key,
    thread_type,
    title,
    created_by_user_id
  )
  values (
    'direct',
    target_company_id,
    saved_direct_key,
    'direct',
    saved_title,
    (select auth.uid())
  )
  on conflict (company_id, direct_key) where thread_type = 'direct' and direct_key is not null
  do update set title = excluded.title, updated_at = now()
  returning * into saved_thread;

  insert into public.team_chat_participants (thread_id, company_id, person_id, can_write, left_at)
  values (saved_thread.id, target_company_id, target_person.id, true, null)
  on conflict (thread_id, person_id) do update
  set can_write = true,
      left_at = null;

  if current_person_id is not null and current_person_id <> target_person.id then
    insert into public.team_chat_participants (thread_id, company_id, person_id, can_write, left_at)
    values (saved_thread.id, target_company_id, current_person_id, true, null)
    on conflict (thread_id, person_id) do update
    set can_write = true,
        left_at = null;
  end if;

  return saved_thread;
end;
$$;

grant execute on function public.ensure_direct_team_thread(uuid, uuid) to authenticated;
