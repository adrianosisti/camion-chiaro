-- 51 - Permesso check giornaliero per singolo autista
-- Esegui in Supabase SQL editor. Non cancella dati.

alter table public.drivers
add column if not exists can_submit_checks boolean not null default true;

update public.drivers
set can_submit_checks = true
where can_submit_checks is null;

create index if not exists drivers_company_check_permission_idx
on public.drivers (company_id, can_submit_checks)
where status <> 'archived';
