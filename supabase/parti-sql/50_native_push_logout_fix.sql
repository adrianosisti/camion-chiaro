-- 50 - Logout pulito notifiche app native
-- Esegui in Supabase SQL Editor dopo il file 30_native_push_tokens.sql.

create or replace function public.delete_native_push_token(
  token_value text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
  cleaned_rows integer := 0;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if token_value is null or length(trim(token_value)) = 0 then
    return false;
  end if;

  update public.native_push_tokens
  set disabled_at = now(), updated_at = now()
  where expo_push_token = trim(token_value);

  get diagnostics cleaned_rows = row_count;
  return cleaned_rows > 0;
end;
$$;

grant execute on function public.delete_native_push_token(text) to authenticated;

select 'Logout notifiche native corretto.' as risultato;
