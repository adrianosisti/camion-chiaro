-- 63_diagnosi_rifornimenti_cruscotto.sql
-- Usalo solo se il cruscotto mezzo mostra rifornimenti a zero.
-- Non modifica dati: legge gli ultimi movimenti gasolio e spiega se sono collegati bene.

select
  fm.created_at,
  fm.occurred_at,
  c.name as company_name,
  fm.movement_type,
  fm.liters,
  fm.odometer_km,
  ft.name as tank_name,
  v.plate as vehicle_plate,
  v.fleet_type,
  v.model as vehicle_model,
  d.full_name as driver_name,
  d.username as driver_username,
  cp.full_name as person_name,
  cp.username as person_username,
  cp.linked_driver_id,
  fm.vehicle_id,
  fm.driver_id,
  fm.person_id,
  fm.tank_id,
  case
    when fm.movement_type <> 'dispense' then 'non e rifornimento mezzo'
    when fm.vehicle_id is null then 'manca vehicle_id'
    when v.id is null then 'vehicle_id non agganciato a nessun mezzo'
    when fm.driver_id is null and fm.person_id is null then 'manca autista/persona'
    else 'ok per cruscotto'
  end as diagnosi
from public.fuel_movements fm
left join public.companies c on c.id = fm.company_id
left join public.fuel_tanks ft on ft.id = fm.tank_id
left join public.vehicles v on v.id = fm.vehicle_id
left join public.drivers d on d.id = fm.driver_id
left join public.company_people cp on cp.id = fm.person_id
order by fm.created_at desc
limit 100;

select
  c.name as company_name,
  count(*) filter (where fm.movement_type = 'dispense') as rifornimenti_mezzo,
  count(*) filter (where fm.movement_type = 'dispense' and fm.vehicle_id is null) as senza_mezzo,
  count(*) filter (where fm.movement_type = 'dispense' and fm.driver_id is null and fm.person_id is null) as senza_autista_o_persona,
  coalesce(sum(fm.liters) filter (where fm.movement_type = 'dispense'), 0) as litri_riforniti
from public.fuel_movements fm
join public.companies c on c.id = fm.company_id
group by c.name
order by c.name;
