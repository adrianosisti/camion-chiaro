-- REAZIONI CHAT TEAM / GRUPPI / DIPENDENTI
-- Attiva le emoji anche sulle chat tra persone, gruppi e reparti.

alter table public.team_chat_messages
  add column if not exists reactions jsonb not null default '{}'::jsonb;

create or replace function public.get_current_company_person(target_company_id uuid)
returns uuid
language sql
security definer
set search_path = public
as $$
  select p.id
  from public.company_people p
  left join public.drivers d
    on d.id = p.linked_driver_id
   and d.company_id = p.company_id
   and d.status <> 'archived'
  where p.company_id = target_company_id
    and p.status <> 'archived'
    and (
      p.user_id = (select auth.uid())
      or d.user_id = (select auth.uid())
    )
  order by
    case when p.user_id = (select auth.uid()) then 0 else 1 end,
    p.created_at desc
  limit 1;
$$;

create or replace function public.is_company_person(target_person_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_people p
    left join public.drivers d
      on d.id = p.linked_driver_id
     and d.company_id = p.company_id
     and d.status <> 'archived'
    where p.id = target_person_id
      and p.status <> 'archived'
      and (
        p.user_id = (select auth.uid())
        or d.user_id = (select auth.uid())
      )
  );
$$;

create or replace function public.can_access_workforce_company(target_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    (select public.is_company_member(target_company_id))
    or exists (
      select 1
      from public.company_people p
      left join public.drivers d
        on d.id = p.linked_driver_id
       and d.company_id = p.company_id
       and d.status <> 'archived'
      where p.company_id = target_company_id
        and p.status <> 'archived'
        and (
          p.user_id = (select auth.uid())
          or d.user_id = (select auth.uid())
        )
    );
$$;

create or replace function public.can_access_team_thread(target_thread_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_chat_threads t
    where t.id = target_thread_id
      and (
        (
          (select public.is_company_member(t.company_id))
          and (select public.is_company_visible_team_thread(t.id))
        )
        or exists (
          select 1
          from public.team_chat_participants tp
          join public.company_people p on p.id = tp.person_id
          left join public.drivers d
            on d.id = p.linked_driver_id
           and d.company_id = p.company_id
           and d.status <> 'archived'
          where tp.thread_id = t.id
            and tp.left_at is null
            and p.status <> 'archived'
            and (
              p.user_id = (select auth.uid())
              or d.user_id = (select auth.uid())
            )
        )
      )
  );
$$;

create or replace function public.set_team_chat_message_reaction(
  target_message_id uuid,
  actor_role text,
  reaction_value text
)
returns public.team_chat_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  target_message public.team_chat_messages;
  current_person_id uuid;
  reaction_key text;
  clean_reaction text;
begin
  select *
  into target_message
  from public.team_chat_messages
  where id = target_message_id;

  if target_message.id is null then
    raise exception 'Message not found';
  end if;

  if not (select public.can_access_team_thread(target_message.thread_id)) then
    raise exception 'Thread not allowed';
  end if;

  if actor_role = 'company' and (select public.is_company_operator(target_message.company_id)) then
    reaction_key := 'company';
  else
    current_person_id := public.get_current_company_person(target_message.company_id);

    if current_person_id is null then
      raise exception 'Person not found for current user';
    end if;

    if not exists (
      select 1
      from public.team_chat_participants tp
      where tp.thread_id = target_message.thread_id
        and tp.person_id = current_person_id
        and tp.left_at is null
    ) then
      raise exception 'Person not allowed in thread';
    end if;

    reaction_key := 'person:' || current_person_id::text;
  end if;

  clean_reaction := nullif(trim(coalesce(reaction_value, '')), '');

  update public.team_chat_messages
  set reactions = case
    when clean_reaction is null then coalesce(reactions, '{}'::jsonb) - reaction_key
    else jsonb_set(coalesce(reactions, '{}'::jsonb), array[reaction_key], to_jsonb(clean_reaction), true)
  end
  where id = target_message.id
  returning * into target_message;

  return target_message;
end;
$$;

grant execute on function public.set_team_chat_message_reaction(uuid, text, text) to authenticated;
grant execute on function public.get_current_company_person(uuid) to authenticated;
grant execute on function public.is_company_person(uuid) to authenticated;
grant execute on function public.can_access_workforce_company(uuid) to authenticated;
grant execute on function public.can_access_team_thread(uuid) to authenticated;

select 'Reazioni chat team pronte.' as risultato;
