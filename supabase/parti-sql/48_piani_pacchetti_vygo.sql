-- 48 - Piani commerciali Vygo a pacchetti
-- Start 5 diventa operativo; da Fleet 10 in poi si sbloccano anche reparti e gruppi.

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
	      'departments', false
    )
  end;
$$;

comment on function public.get_plan_limits(text) is
'Limiti piani Vygo: Start 5 operativo con chat, chiamate, centro costi e report; Fleet 10 e superiori aggiungono reparti e gruppi. Extra commerciali: storage, onboarding, import dati e assistenza.';

grant execute on function public.get_plan_limits(text) to authenticated;

select 'Piani Vygo aggiornati: chiamate vocali incluse anche in Start 5.' as risultato;
