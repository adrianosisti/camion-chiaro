-- 55 - Verifica Area test pilota Vygo
-- Non modifica nulla: mostra gli ultimi messaggi inviati dall'Area test.

select
  pf.created_at,
  c.name as azienda,
  pf.actor_role as mittente,
  pf.category as tipo,
  pf.screen as area,
  pf.status,
  pf.message
from public.pilot_feedback pf
join public.companies c on c.id = pf.company_id
order by pf.created_at desc
limit 30;
