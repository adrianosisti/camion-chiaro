-- DEMO PLUS CAMION CHIARO - 35A3
-- Documenti mezzi apribili con link PDF dimostrativo.
-- Esegui dopo 35A1. Se dice che vehicle_documents non esiste, dimmelo.

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
delete from public.vehicle_documents vd
using target
where vd.company_id = target.company_id
  and vd.document_number like 'DEMOPLUS-%';

with target as (
  select coalesce((select cm.company_id from public.company_members cm join auth.users u on u.id = cm.user_id where lower(coalesce(u.email, '')) = lower('azienda@camionchiaro.it') order by cm.created_at desc limit 1), 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976'::uuid) as company_id
),
demo_file as (
  select 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'::text as file_path
)
insert into public.vehicle_documents (
  company_id, vehicle_id, type, document_number, expires_at, file_bucket, file_path, status, notes
)
select target.company_id, v.id, doc.type, doc.document_number, doc.expires_at, 'company-assets', demo_file.file_path, doc.status, '[DEMOPLUS] Documento dimostrativo apribile.'
from target
cross join demo_file
join public.vehicles v on v.company_id = target.company_id
join (
  values
    ('DEMOF02', 'Assicurazione RCA', 'DEMOPLUS-F02-RCA', current_date + 34, 'uploaded'),
    ('DEMOF02', 'Libretto', 'DEMOPLUS-F02-LIBRETTO', current_date + 720, 'verified'),
    ('DEMOM02', 'Revisione mezzo', 'DEMOPLUS-M02-REVISIONE', current_date + 2, 'uploaded'),
    ('DEMOT02', 'Assicurazione RCA', 'DEMOPLUS-T02-RCA', current_date + 19, 'uploaded'),
    ('DEMOT03', 'Revisione trattore', 'DEMOPLUS-T03-REVISIONE', current_date - 1, 'expired'),
    ('DEMOS02', 'Revisione semirimorchio', 'DEMOPLUS-S02-REVISIONE', current_date + 44, 'uploaded'),
    ('DEMOS03', 'ATP frigo', 'DEMOPLUS-S03-ATP', current_date + 9, 'uploaded')
) as doc(plate, type, document_number, expires_at, status)
  on doc.plate = v.plate;
