-- RESET DI PROVA - CAMION CHIARO
-- Usa questo file solo quando vuoi cancellare i guasti e i check mattutini di test.
-- Non cancella autisti, flotta, documenti, scadenze o impostazioni azienda.

delete from public.fault_reports
where company_id = 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976';

delete from public.vehicle_checks
where company_id = 'eaad6dc3-4cab-42e6-9d56-b9a3676ad976';
