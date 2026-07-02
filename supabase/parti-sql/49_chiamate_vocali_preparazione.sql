-- VYGO - PARTE 49
-- Preparazione chiamate vocali live.
-- Crea lo storico tecnico delle chiamate. Non registra audio.

create table if not exists public.voice_call_sessions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  thread_id uuid references public.chat_threads(id) on delete set null,
  team_thread_id uuid references public.team_chat_threads(id) on delete set null,
  caller_role text not null check (caller_role in ('company', 'driver', 'person')),
  caller_user_id uuid references auth.users(id) on delete set null,
  caller_driver_id uuid references public.drivers(id) on delete set null,
  caller_person_id uuid references public.company_people(id) on delete set null,
  receiver_user_id uuid references auth.users(id) on delete set null,
  receiver_driver_id uuid references public.drivers(id) on delete set null,
  receiver_person_id uuid references public.company_people(id) on delete set null,
  call_type text not null default 'voice' check (call_type in ('voice')),
  status text not null default 'missed' check (status in ('ringing', 'accepted', 'declined', 'missed', 'ended', 'failed')),
  started_at timestamptz,
  answered_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  provider text,
  provider_room_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint voice_call_sessions_one_thread check (
    (thread_id is not null and team_thread_id is null)
    or (thread_id is null and team_thread_id is not null)
  )
);

create index if not exists voice_call_sessions_company_created_idx
on public.voice_call_sessions (company_id, created_at desc);

create index if not exists voice_call_sessions_thread_idx
on public.voice_call_sessions (thread_id)
where thread_id is not null;

create index if not exists voice_call_sessions_team_thread_idx
on public.voice_call_sessions (team_thread_id)
where team_thread_id is not null;

create index if not exists voice_call_sessions_caller_driver_idx
on public.voice_call_sessions (caller_driver_id)
where caller_driver_id is not null;

create index if not exists voice_call_sessions_caller_person_idx
on public.voice_call_sessions (caller_person_id)
where caller_person_id is not null;

create index if not exists voice_call_sessions_receiver_driver_idx
on public.voice_call_sessions (receiver_driver_id)
where receiver_driver_id is not null;

create index if not exists voice_call_sessions_receiver_person_idx
on public.voice_call_sessions (receiver_person_id)
where receiver_person_id is not null;

alter table public.voice_call_sessions enable row level security;

drop policy if exists "Workforce can read voice call sessions" on public.voice_call_sessions;
create policy "Workforce can read voice call sessions"
on public.voice_call_sessions
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (
    thread_id is not null
    and exists (
      select 1
      from public.chat_threads ct
      where ct.id = voice_call_sessions.thread_id
        and ct.company_id = voice_call_sessions.company_id
        and ct.driver_id is not null
        and (select public.is_driver_user(ct.driver_id))
    )
  )
  or (
    team_thread_id is not null
    and (select public.can_access_team_thread(team_thread_id))
  )
);

drop policy if exists "Workforce can create voice call sessions" on public.voice_call_sessions;
create policy "Workforce can create voice call sessions"
on public.voice_call_sessions
for insert
to authenticated
with check (
  (select public.is_company_operator(company_id))
  or (
    caller_driver_id is not null
    and (select public.is_driver_user(caller_driver_id))
  )
  or (
    caller_person_id is not null
    and (select public.is_company_person(caller_person_id))
  )
);

drop policy if exists "Workforce can update own voice call sessions" on public.voice_call_sessions;
create policy "Workforce can update own voice call sessions"
on public.voice_call_sessions
for update
to authenticated
using (
  (select public.is_company_operator(company_id))
  or (
    caller_driver_id is not null
    and (select public.is_driver_user(caller_driver_id))
  )
  or (
    caller_person_id is not null
    and (select public.is_company_person(caller_person_id))
  )
  or (
    receiver_driver_id is not null
    and (select public.is_driver_user(receiver_driver_id))
  )
  or (
    receiver_person_id is not null
    and (select public.is_company_person(receiver_person_id))
  )
)
with check (
  (select public.is_company_operator(company_id))
  or (
    caller_driver_id is not null
    and (select public.is_driver_user(caller_driver_id))
  )
  or (
    caller_person_id is not null
    and (select public.is_company_person(caller_person_id))
  )
  or (
    receiver_driver_id is not null
    and (select public.is_driver_user(receiver_driver_id))
  )
  or (
    receiver_person_id is not null
    and (select public.is_company_person(receiver_person_id))
  )
);

grant select, insert, update on public.voice_call_sessions to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.voice_call_sessions;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

select 'Parte 49 pronta: storico tecnico chiamate vocali creato.' as risultato;
