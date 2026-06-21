create or replace function public.refresh_team_thread_participants(target_thread_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_thread public.team_chat_threads;
begin
  select *
  into target_thread
  from public.team_chat_threads
  where id = target_thread_id;

  if target_thread.id is null or target_thread.audience_type not in ('drivers', 'warehouse', 'office', 'all') then
    return;
  end if;

  update public.team_chat_participants
  set left_at = now()
  where thread_id = target_thread.id;

  insert into public.team_chat_participants (thread_id, company_id, person_id, can_write, left_at)
  select
    target_thread.id,
    target_thread.company_id,
    p.id,
    true,
    null
  from public.company_people p
  where p.company_id = target_thread.company_id
    and p.status <> 'archived'
    and (
      target_thread.audience_type = 'all'
      or (target_thread.audience_type = 'drivers' and p.department = 'drivers')
      or (target_thread.audience_type = 'warehouse' and p.department = 'warehouse')
      or (target_thread.audience_type = 'office' and p.department = 'office')
    )
  on conflict (thread_id, person_id) do update
  set left_at = null,
      can_write = excluded.can_write;
end;
$$;

create or replace function public.ensure_default_team_threads(target_company_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_thread_id uuid;
begin
  if not (select public.is_company_operator(target_company_id)) then
    raise exception 'Company not allowed';
  end if;

  insert into public.team_chat_threads (company_id, thread_type, audience_type, title, created_by_user_id)
  values (target_company_id, 'group', 'drivers', 'Tutti gli autisti', (select auth.uid()))
  on conflict (company_id, audience_type) where thread_type = 'group' and audience_type in ('drivers', 'warehouse', 'office', 'all')
  do update set title = excluded.title, updated_at = now()
  returning id into saved_thread_id;
  perform public.refresh_team_thread_participants(saved_thread_id);

  insert into public.team_chat_threads (company_id, thread_type, audience_type, title, created_by_user_id)
  values (target_company_id, 'group', 'warehouse', 'Magazzino', (select auth.uid()))
  on conflict (company_id, audience_type) where thread_type = 'group' and audience_type in ('drivers', 'warehouse', 'office', 'all')
  do update set title = excluded.title, updated_at = now()
  returning id into saved_thread_id;
  perform public.refresh_team_thread_participants(saved_thread_id);

  insert into public.team_chat_threads (company_id, thread_type, audience_type, title, created_by_user_id)
  values (target_company_id, 'group', 'office', 'Ufficio', (select auth.uid()))
  on conflict (company_id, audience_type) where thread_type = 'group' and audience_type in ('drivers', 'warehouse', 'office', 'all')
  do update set title = excluded.title, updated_at = now()
  returning id into saved_thread_id;
  perform public.refresh_team_thread_participants(saved_thread_id);

  insert into public.team_chat_threads (company_id, thread_type, audience_type, title, created_by_user_id)
  values (target_company_id, 'group', 'all', 'Tutta l azienda', (select auth.uid()))
  on conflict (company_id, audience_type) where thread_type = 'group' and audience_type in ('drivers', 'warehouse', 'office', 'all')
  do update set title = excluded.title, updated_at = now()
  returning id into saved_thread_id;
  perform public.refresh_team_thread_participants(saved_thread_id);
end;
$$;
