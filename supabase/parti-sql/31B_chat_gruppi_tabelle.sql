create table if not exists public.team_chat_threads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  thread_type text not null default 'group' check (thread_type in ('direct', 'group')),
  audience_type text not null default 'custom'
    check (audience_type in ('direct', 'drivers', 'warehouse', 'office', 'all', 'custom')),
  title text not null,
  created_by_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'archived')),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists team_chat_threads_default_audience_uidx
on public.team_chat_threads (company_id, audience_type)
where thread_type = 'group' and audience_type in ('drivers', 'warehouse', 'office', 'all');

create index if not exists team_chat_threads_company_last_idx
on public.team_chat_threads (company_id, coalesce(last_message_at, created_at) desc);

create table if not exists public.team_chat_participants (
  thread_id uuid not null references public.team_chat_threads(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  person_id uuid not null references public.company_people(id) on delete cascade,
  can_write boolean not null default true,
  added_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (thread_id, person_id)
);

create index if not exists team_chat_participants_person_idx
on public.team_chat_participants (person_id, left_at);

create table if not exists public.team_chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.team_chat_threads(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  sender_user_id uuid references auth.users(id) on delete set null,
  sender_person_id uuid references public.company_people(id) on delete set null,
  sender_role text not null default 'company'
    check (sender_role in ('company', 'driver', 'warehouse', 'office', 'system')),
  body text,
  attachment_path text,
  created_at timestamptz not null default now(),
  constraint team_chat_message_has_content check (
    nullif(trim(coalesce(body, '')), '') is not null
    or nullif(trim(coalesce(attachment_path, '')), '') is not null
  )
);

create index if not exists team_chat_messages_thread_created_idx
on public.team_chat_messages (thread_id, created_at asc);

create index if not exists team_chat_messages_company_created_idx
on public.team_chat_messages (company_id, created_at desc);

create table if not exists public.team_chat_message_reads (
  message_id uuid not null references public.team_chat_messages(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  person_id uuid not null references public.company_people(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (message_id, person_id)
);

create index if not exists team_chat_message_reads_person_idx
on public.team_chat_message_reads (person_id, read_at desc);
