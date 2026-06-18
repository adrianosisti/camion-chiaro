-- IMPOSTAZIONI AZIENDA - CAMION CHIARO
-- Abilita il salvataggio di ragione sociale, partita IVA e sede dalla schermata Impostazioni.
-- Da eseguire una sola volta in Supabase SQL Editor.

drop policy if exists "Operators can update their companies" on public.companies;

create policy "Operators can update their companies"
on public.companies
for update
to authenticated
using ((select public.is_company_operator(id)))
with check ((select public.is_company_operator(id)));
