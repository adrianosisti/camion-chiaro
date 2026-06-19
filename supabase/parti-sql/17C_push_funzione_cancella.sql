-- NOTIFICHE PUSH TELEFONO - PARTE 17C
-- Funzione che disattiva un telefono dalle notifiche.

create or replace function public.delete_push_subscription(
  subscription_endpoint text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.push_subscriptions
  set disabled_at = now(), updated_at = now()
  where endpoint_hash = encode(digest(trim(subscription_endpoint), 'sha256'), 'hex')
    and user_id = (select auth.uid());

  return found;
end;
$$;

grant execute on function public.delete_push_subscription(text) to authenticated;
