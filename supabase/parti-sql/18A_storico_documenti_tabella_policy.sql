-- STORICO DOCUMENTI - PARTE 18A
-- Crea tabella, indici e regole di lettura dello storico documenti.

create table if not exists public.driver_document_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete set null,
  document_id uuid references public.driver_documents(id) on delete set null,
  document_type text not null,
  document_number text,
  event_type text not null check (event_type in ('created', 'updated', 'file_uploaded', 'file_removed', 'deleted')),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text not null check (actor_role in ('company', 'driver', 'system')),
  file_path text,
  previous_file_path text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists driver_document_events_company_created_idx
on public.driver_document_events (company_id, created_at desc);

create index if not exists driver_document_events_driver_created_idx
on public.driver_document_events (driver_id, created_at desc)
where driver_id is not null;

create index if not exists driver_document_events_document_created_idx
on public.driver_document_events (document_id, created_at desc)
where document_id is not null;

alter table public.driver_document_events enable row level security;

drop policy if exists "Members and drivers can read document events" on public.driver_document_events;
create policy "Members and drivers can read document events"
on public.driver_document_events
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (
    driver_id is not null
    and (select public.is_driver_user(driver_id))
  )
);
