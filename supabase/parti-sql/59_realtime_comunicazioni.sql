-- 59 - Realtime comunicazioni aziendali / prese visione
-- Esegui dopo il file 58. File corto e rieseguibile.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'company_announcements'
  ) then
    alter publication supabase_realtime add table public.company_announcements;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'company_announcement_reads'
  ) then
    alter publication supabase_realtime add table public.company_announcement_reads;
  end if;
end $$;
