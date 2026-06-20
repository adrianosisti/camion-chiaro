-- Reset sicuro per il badge chat dell'autista "Stufetta".
-- Non cancella messaggi: marca come letti i messaggi azienda gia presenti.

update public.chat_messages m
set read_by_driver_at = coalesce(m.read_by_driver_at, now())
from public.chat_threads t
join public.drivers d on d.id = t.driver_id
where m.thread_id = t.id
  and m.company_id = t.company_id
  and m.sender_role = 'company'
  and m.read_by_driver_at is null
  and (
    lower(coalesce(d.full_name, '')) like '%stufetta%'
    or lower(coalesce(d.username, '')) like '%stufetta%'
  );

select
  d.full_name,
  d.username,
  count(m.id) as messaggi_azienda_ancora_da_leggere
from public.drivers d
left join public.chat_threads t
  on t.driver_id = d.id
  and t.context_type = 'general'
left join public.chat_messages m
  on m.thread_id = t.id
  and m.sender_role = 'company'
  and m.read_by_driver_at is null
where lower(coalesce(d.full_name, '')) like '%stufetta%'
   or lower(coalesce(d.username, '')) like '%stufetta%'
group by d.full_name, d.username;
