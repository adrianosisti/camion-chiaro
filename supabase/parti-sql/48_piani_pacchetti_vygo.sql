-- 48 - Piani commerciali Vygo a pacchetti
-- Tutti i piani includono tutte le funzioni Vygo.
-- Cambiano solo limiti di mezzi, strumenti, utenti e storage.

create or replace function public.get_plan_limits(input_plan text)
returns jsonb
language sql
stable
as $$
  select case coalesce(input_plan, 'starter')
    when 'starter' then jsonb_build_object(
      'maxVehicles', 5,
      'maxAssets', 3,
      'maxUsers', 10,
      'storageGb', 10,
      'chat', true,
      'costCenter', true,
      'reports', true,
      'voiceCalls', true,
      'departments', true
    )
    when 'fleet10' then jsonb_build_object(
      'maxVehicles', 10,
      'maxAssets', 5,
      'maxUsers', 20,
      'storageGb', 20,
      'chat', true,
      'costCenter', true,
      'reports', true,
      'voiceCalls', true,
      'departments', true
    )
    when 'pro' then jsonb_build_object(
      'maxVehicles', 10,
      'maxAssets', 5,
      'maxUsers', 20,
      'storageGb', 20,
      'chat', true,
      'costCenter', true,
      'reports', true,
      'voiceCalls', true,
      'departments', true
    )
    when 'fleet20' then jsonb_build_object(
      'maxVehicles', 20,
      'maxAssets', 10,
      'maxUsers', 40,
      'storageGb', 30,
      'chat', true,
      'costCenter', true,
      'reports', true,
      'voiceCalls', true,
      'departments', true
    )
    when 'business' then jsonb_build_object(
      'maxVehicles', 20,
      'maxAssets', 10,
      'maxUsers', 40,
      'storageGb', 30,
      'chat', true,
      'costCenter', true,
      'reports', true,
      'voiceCalls', true,
      'departments', true
    )
    when 'fleet30' then jsonb_build_object(
      'maxVehicles', 30,
      'maxAssets', 15,
      'maxUsers', 60,
      'storageGb', 50,
      'chat', true,
      'costCenter', true,
      'reports', true,
      'voiceCalls', true,
      'departments', true
    )
    when 'fleet50' then jsonb_build_object(
      'maxVehicles', 50,
      'maxAssets', 25,
      'maxUsers', 100,
      'storageGb', 75,
      'chat', true,
      'costCenter', true,
      'reports', true,
      'voiceCalls', true,
      'departments', true
    )
    when 'enterprise' then jsonb_build_object(
      'maxVehicles', null,
      'maxAssets', null,
      'maxUsers', null,
      'storageGb', 100,
      'chat', true,
      'costCenter', true,
      'reports', true,
      'voiceCalls', true,
      'departments', true
    )
    else jsonb_build_object(
      'maxVehicles', 5,
      'maxAssets', 3,
      'maxUsers', 10,
      'storageGb', 10,
      'chat', true,
      'costCenter', true,
      'reports', true,
      'voiceCalls', true,
      'departments', true
    )
  end;
$$;

comment on function public.get_plan_limits(text) is
'Limiti piani Vygo: tutti i piani includono le funzioni complete; cambiano solo mezzi, strumenti, utenti e storage. Unico extra ricorrente: storage aggiuntivo.';

grant execute on function public.get_plan_limits(text) to authenticated;

select 'Piani Vygo aggiornati: tutte le funzioni incluse in tutti i piani.' as risultato;
