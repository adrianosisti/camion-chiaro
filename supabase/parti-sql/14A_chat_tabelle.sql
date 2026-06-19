-- CHAT INTERNA - PARTE 14A
-- Esegui prima questo file in Supabase SQL Editor.

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete cascade,
  context_type text not null default 'general' check (context_type in ('general', 'fault', 'check')),
  fault_report_id uuid references public.fault_reports(id) on delete cascade,
  vehicle_check_id uuid references public.vehicle_checks(id) on delete cascade,
  title text,
  status text not null default 'open' check (status in ('open', 'archived')),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_thread_context_target check (
    (context_type = 'general' and fault_report_id is null and vehicle_check_id is null)
    or (context_type = 'fault' and fault_report_id is not null and vehicle_check_id is null)
    or (context_type = 'check' and vehicle_check_id is not null and fault_report_id is null)
  )
);

create unique index if not exists chat_threads_one_general_per_driver_idx
on public.chat_threads (company_id, driver_id, context_type)
where context_type = 'general' and driver_id is not null;

create index if not exists chat_threads_company_id_idx
on public.chat_threads (company_id);

create index if not exists chat_threads_company_last_idx
on public.chat_threads (company_id, coalesce(last_message_at, created_at) desc);

create index if not exists chat_threads_driver_idx
on public.chat_threads (driver_id, coalesce(last_message_at, created_at) desc)
where driver_id is not null;

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  sender_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('company', 'driver')),
  body text,
  attachment_path text,
  read_by_company_at timestamptz,
  read_by_driver_at timestamptz,
  created_at timestamptz not null default now(),
  constraint chat_message_has_content check (
    nullif(trim(coalesce(body, '')), '') is not null
    or nullif(trim(coalesce(attachment_path, '')), '') is not null
  )
);

create index if not exists chat_messages_thread_created_idx
on public.chat_messages (thread_id, created_at asc);

create index if not exists chat_messages_company_created_idx
on public.chat_messages (company_id, created_at desc);

create index if not exists chat_messages_company_thread_idx
on public.chat_messages (company_id, thread_id);

create or replace function public.is_driver_in_company(target_driver_id uuid, target_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.drivers d
    where d.id = target_driver_id
      and d.company_id = target_company_id
  );
$$;

grant execute on function public.is_driver_in_company(uuid, uuid) to authenticated;

create or replace function public.touch_chat_thread_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_threads
  set last_message_at = new.created_at,
      updated_at = now()
  where id = new.thread_id;

  return new;
end;
$$;

drop trigger if exists chat_messages_touch_thread on public.chat_messages;
create trigger chat_messages_touch_thread
after insert on public.chat_messages
for each row execute function public.touch_chat_thread_last_message();
