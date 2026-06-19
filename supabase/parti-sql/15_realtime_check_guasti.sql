-- REALTIME CHECK E GUASTI - CAMION CHIARO
-- Aggiornamento live per check mattutini e guasti. Esegui dopo 14B4.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'vehicle_checks'
  ) then
    alter publication supabase_realtime add table public.vehicle_checks;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'fault_reports'
  ) then
    alter publication supabase_realtime add table public.fault_reports;
  end if;
end;
$$;
