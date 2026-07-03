-- VYGO - PASSWORD ACCESSO VISIBILE IN ANAGRAFICA AZIENDA
-- Esegui questo file una volta nel progetto Supabase corretto.

alter table public.drivers
add column if not exists access_password text;

alter table public.company_people
add column if not exists access_password text;

comment on column public.drivers.access_password is
'Ultima password impostata dall azienda per accesso app. Visibile solo dalle schermate azienda.';

comment on column public.company_people.access_password is
'Ultima password impostata dall azienda per accesso app. Visibile solo dalle schermate azienda.';
