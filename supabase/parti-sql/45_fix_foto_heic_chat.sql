-- FIX FOTO GALLERIA IPHONE / ANDROID IN CHAT
-- Forza il bucket ad accettare anche HEIC/HEIF. L'app ora prova comunque a convertire
-- la galleria in formato compatibile, ma questo evita blocchi con foto già in HEIC.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-assets',
  'company-assets',
  false,
  52428800,
  array[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/heic-sequence',
    'image/heif-sequence',
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
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

select id, allowed_mime_types
from storage.buckets
where id = 'company-assets';
