-- FIX FOTO GALLERIA IPHONE / ANDROID IN CHAT
-- Aggiunge i formati HEIC/HEIF al bucket degli allegati, usati spesso dalle gallerie dei telefoni.

update storage.buckets
set allowed_mime_types = array[
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'audio/aac',
  'audio/mp4',
  'audio/mpeg',
  'audio/ogg',
  'audio/opus',
  'audio/wav',
  'audio/webm',
  'audio/x-m4a',
  'audio/x-wav',
  'application/pdf'
]
where id = 'company-assets';

select 'Foto galleria HEIC/HEIF abilitate nelle chat.' as risultato;
