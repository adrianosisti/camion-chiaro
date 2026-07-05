-- 58 - POD digitale, circolari con presa visione e basi chicche operative
-- Esegui dopo i file 31/46/48. File rieseguibile.

create table if not exists public.delivery_pods (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text,
  customer_name text,
  delivery_date date not null default current_date,
  driver_id uuid references public.drivers(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  status text not null default 'open'
    check (status in ('open', 'completed', 'archived')),
  signature_name text,
  notes text,
  proof_file_bucket text not null default 'company-assets',
  proof_file_path text,
  created_by_user_id uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists delivery_pods_company_date_idx
on public.delivery_pods (company_id, delivery_date desc);

create index if not exists delivery_pods_driver_date_idx
on public.delivery_pods (company_id, driver_id, delivery_date desc)
where driver_id is not null;

create index if not exists delivery_pods_vehicle_date_idx
on public.delivery_pods (company_id, vehicle_id, delivery_date desc)
where vehicle_id is not null;

alter table public.delivery_pods
  alter column created_by_user_id set default auth.uid();

create table if not exists public.company_announcements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  body text not null,
  audience_type text not null default 'all'
    check (audience_type in ('all', 'drivers', 'office', 'warehouse', 'management')),
  requires_ack boolean not null default true,
  status text not null default 'published'
    check (status in ('draft', 'published', 'archived')),
  published_at timestamptz not null default now(),
  created_by_user_id uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists company_announcements_company_status_idx
on public.company_announcements (company_id, status, published_at desc);

update public.company_announcements
set published_at = coalesce(published_at, created_at, now())
where published_at is null;

alter table public.company_announcements
  alter column published_at set default now(),
  alter column published_at set not null,
  alter column created_by_user_id set default auth.uid();

create table if not exists public.company_announcement_reads (
  announcement_id uuid not null references public.company_announcements(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  driver_id uuid references public.drivers(id) on delete set null,
  person_id uuid references public.company_people(id) on delete set null,
  read_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  primary key (announcement_id, user_id)
);

create index if not exists company_announcement_reads_company_idx
on public.company_announcement_reads (company_id, announcement_id);

create or replace view public.company_announcements_with_counts
with (security_invoker = true)
as
select
  a.*,
  count(r.*) filter (where r.read_at is not null)::integer as read_count,
  count(r.*) filter (where r.acknowledged_at is not null)::integer as acknowledged_count
from public.company_announcements a
left join public.company_announcement_reads r on r.announcement_id = a.id
group by a.id;

alter table public.delivery_pods enable row level security;
alter table public.company_announcements enable row level security;
alter table public.company_announcement_reads enable row level security;

grant select, insert, update, delete on public.delivery_pods to authenticated;
grant select, insert, update, delete on public.company_announcements to authenticated;
grant select, insert, update, delete on public.company_announcement_reads to authenticated;
grant select on public.company_announcements_with_counts to authenticated;

drop policy if exists "Members can read delivery pods" on public.delivery_pods;
create policy "Members can read delivery pods"
on public.delivery_pods
for select
to authenticated
using ((select public.can_access_workforce_company(company_id)));

drop policy if exists "Operators can manage delivery pods" on public.delivery_pods;
create policy "Operators can manage delivery pods"
on public.delivery_pods
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

drop policy if exists "Workforce can read company announcements" on public.company_announcements;
create policy "Workforce can read company announcements"
on public.company_announcements
for select
to authenticated
using (
  status = 'published'
  and (select public.can_access_workforce_company(company_id))
);

drop policy if exists "Operators can manage company announcements" on public.company_announcements;
create policy "Operators can manage company announcements"
on public.company_announcements
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

drop policy if exists "Workforce can read announcement reads" on public.company_announcement_reads;
create policy "Workforce can read announcement reads"
on public.company_announcement_reads
for select
to authenticated
using ((select public.can_access_workforce_company(company_id)));

drop policy if exists "Users can insert own announcement reads" on public.company_announcement_reads;
create policy "Users can insert own announcement reads"
on public.company_announcement_reads
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select public.can_access_workforce_company(company_id))
);

drop policy if exists "Users can update own announcement reads" on public.company_announcement_reads;
create policy "Users can update own announcement reads"
on public.company_announcement_reads
for update
to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and (select public.can_access_workforce_company(company_id))
);
