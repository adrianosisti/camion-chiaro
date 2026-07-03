-- 53 - Controllo progetto pilota Vygo

create table if not exists public.pilot_feedback (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  actor_user_id uuid default auth.uid() references auth.users(id) on delete set null,
  actor_role text not null default 'company' check (actor_role in ('company', 'driver', 'office', 'warehouse', 'admin', 'unknown')),
  category text not null default 'problem' check (category in ('problem', 'idea', 'question', 'praise', 'training')),
  screen text,
  message text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'done', 'archived')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pilot_feedback_company_created_idx
on public.pilot_feedback (company_id, created_at desc);

create index if not exists pilot_feedback_company_status_idx
on public.pilot_feedback (company_id, status, created_at desc);

create or replace function public.touch_pilot_feedback_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pilot_feedback_touch_updated_at on public.pilot_feedback;
create trigger pilot_feedback_touch_updated_at
before update on public.pilot_feedback
for each row
execute function public.touch_pilot_feedback_updated_at();

alter table public.pilot_feedback enable row level security;

drop policy if exists "Pilot feedback company can read" on public.pilot_feedback;
create policy "Pilot feedback company can read"
on public.pilot_feedback
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (select public.can_access_workforce_company(company_id))
);

drop policy if exists "Pilot feedback company can insert" on public.pilot_feedback;
create policy "Pilot feedback company can insert"
on public.pilot_feedback
for insert
to authenticated
with check (
  actor_user_id = (select auth.uid())
  and (
    (select public.is_company_member(company_id))
    or exists (
      select 1
      from public.drivers d
      where d.company_id = pilot_feedback.company_id
        and d.user_id = (select auth.uid())
        and d.status <> 'archived'
    )
    or exists (
      select 1
      from public.company_people p
      where p.company_id = pilot_feedback.company_id
        and p.user_id = (select auth.uid())
        and p.status <> 'archived'
    )
  )
);

drop policy if exists "Pilot feedback company operators update" on public.pilot_feedback;
create policy "Pilot feedback company operators update"
on public.pilot_feedback
for update
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

comment on table public.pilot_feedback is
'Feedback del progetto pilota Vygo: problemi, idee, richieste e note raccolte da azienda e utenti durante il test.';
