-- FIX ALLEGATI CHAT DIPENDENTI
-- Permette a dipendenti/autisti/ufficio/magazzino di caricare foto, video, audio e file
-- nelle chat team/private. La lettura resta legata al thread accessibile.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-assets',
  'company-assets',
  false,
  52428800,
  array[
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
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Workforce can manage team chat attachment files" on storage.objects;
drop policy if exists "Workforce can read team chat attachment files" on storage.objects;
drop policy if exists "Workforce can upload team chat attachment files" on storage.objects;
drop policy if exists "Workforce can update own team chat attachment files" on storage.objects;
drop policy if exists "Workforce can delete own team chat attachment files" on storage.objects;

create policy "Workforce can read team chat attachment files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[2] = 'team-chat'
  and exists (
    select 1
    from public.team_chat_threads t
    where t.company_id::text = (storage.foldername(name))[1]
      and t.id::text = (storage.foldername(name))[3]
      and (select public.can_access_team_thread(t.id))
  )
);

create policy "Workforce can upload team chat attachment files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[2] = 'team-chat'
  and exists (
    select 1
    from public.team_chat_threads t
    where t.company_id::text = (storage.foldername(name))[1]
      and t.id::text = (storage.foldername(name))[3]
      and (select public.can_access_workforce_company(t.company_id))
  )
);

create policy "Workforce can update own team chat attachment files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[2] = 'team-chat'
  and exists (
    select 1
    from public.team_chat_threads t
    where t.company_id::text = (storage.foldername(name))[1]
      and t.id::text = (storage.foldername(name))[3]
      and (select public.can_access_team_thread(t.id))
  )
)
with check (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[2] = 'team-chat'
  and exists (
    select 1
    from public.team_chat_threads t
    where t.company_id::text = (storage.foldername(name))[1]
      and t.id::text = (storage.foldername(name))[3]
      and (select public.can_access_team_thread(t.id))
  )
);

create policy "Workforce can delete own team chat attachment files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[2] = 'team-chat'
  and exists (
    select 1
    from public.team_chat_threads t
    where t.company_id::text = (storage.foldername(name))[1]
      and t.id::text = (storage.foldername(name))[3]
      and (select public.can_access_team_thread(t.id))
  )
);

select 'Fix allegati chat dipendenti pronto.' as risultato;
