-- DEMO PLUS CAMION CHIARO - 35A2
-- Documenti autisti apribili con link PDF dimostrativo.
-- Esegui dopo 35A1.

with target as (
  select coalesce(
    (
      select cm.company_id
      from public.company_members cm
      join auth.users u on u.id = cm.user_id
      where lower(coalesce(u.email, '')) = lower('azienda@camionchiaro.it')
      order by cm.created_at desc
      limit 1
    ),
    'eaad6dc3-4cab-42e6-9d56-b9a3676ad976'::uuid
  ) as company_id
)
delete from public.driver_documents dd
using target
where dd.company_id = target.company_id
  and dd.document_number like 'DEMOPLUS-%';

with target as (
  select coalesce((select cm.company_id from public.company_members cm join auth.users u on u.id = cm.user_id where lower(coalesce(u.email, '')) = lower('azienda@camionchiaro.it') order by cm.created_at desc limit 1), 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976'::uuid) as company_id
),
demo_file as (
  select 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'::text as file_path
)
insert into public.driver_documents (
  company_id, driver_id, type, document_number, expires_at, file_path, status, visible_to_driver
)
select target.company_id, d.id, doc.type, doc.document_number, doc.expires_at, demo_file.file_path, doc.status, true
from target
cross join demo_file
join public.drivers d on d.company_id = target.company_id
join (
  values
    ('demo.ahmed', 'Patente C+E', 'DEMOPLUS-AHMED-PATENTE', current_date + 65, 'verified'),
    ('demo.ahmed', 'CQC merci', 'DEMOPLUS-AHMED-CQC', current_date + 22, 'uploaded'),
    ('demo.ahmed', 'Visita medica', 'DEMOPLUS-AHMED-MEDICA', current_date + 11, 'uploaded'),
    ('demo.ionut', 'Patente C+E', 'DEMOPLUS-IONUT-PATENTE', current_date + 210, 'verified'),
    ('demo.ionut', 'Carta tachigrafica', 'DEMOPLUS-IONUT-TACHO', current_date + 5, 'uploaded'),
    ('demo.tomasz', 'ADR base', 'DEMOPLUS-TOMASZ-ADR', current_date + 14, 'uploaded'),
    ('demo.tomasz', 'CQC merci', 'DEMOPLUS-TOMASZ-CQC', current_date + 88, 'verified'),
    ('demo.sofia', 'Patente B', 'DEMOPLUS-SOFIA-PATENTE', current_date + 390, 'verified'),
    ('demo.sofia', 'Visita medica', 'DEMOPLUS-SOFIA-MEDICA', current_date - 2, 'expired')
) as doc(username, type, document_number, expires_at, status)
  on doc.username = d.username;
