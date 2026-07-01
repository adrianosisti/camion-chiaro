-- 48 - Piani commerciali Vygo a pacchetti
-- Start 5 diventa operativo; da Fleet 10 in poi tutte le funzioni principali sono incluse.

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
      'departments', false
    )
    when 'fleet10' then jsonb_build_object(
      'maxVehicles', 10,
      'maxAssets', 5,
      'maxUsers', 20,
      'storageGb', 20,
      'chat', true,
      'costCenter', true,
      'reports', true,
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
      'departments', false
    )
  end;
$$;

comment on function public.get_plan_limits(text) is
'Limiti piani Vygo: Start 5 operativo; Fleet 10 e superiori con funzioni principali complete. Extra commerciali: storage, onboarding, import dati e assistenza.';

grant execute on function public.get_plan_limits(text) to authenticated;

select 'Piani Vygo aggiornati: Start 5 operativo, Fleet 10+ completo.' as risultato;
