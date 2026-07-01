-- 47B - Funzioni premium piano
-- Blocca chat e centro costi se non inclusi nel piano o negli addon.

create or replace function public.assert_company_plan_feature(target_company_id uuid, feature text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  company_row public.companies%rowtype;
  enabled boolean := false;
  feature_label text;
  limits jsonb;
begin
  select * into company_row
  from public.companies
  where id = target_company_id;

  if company_row.id is null then
    raise exception 'Company not found';
  end if;

  if company_row.billing_status <> 'active' then
    raise exception 'Piano Vygo non attivo. Completa o riattiva abbonamento.';
  end if;

  if feature not in ('chat', 'costCenter', 'reports', 'departments') then
    raise exception 'Unknown plan feature: %', feature;
  end if;

  feature_label := case feature
    when 'chat' then 'chat aziendale'
    when 'costCenter' then 'centro costi'
    when 'reports' then 'report avanzati'
    when 'departments' then 'reparti e gruppi'
    else 'funzione'
  end;

  limits := public.get_company_plan_limits(target_company_id);
  enabled := coalesce((limits ->> feature)::boolean, false);

  if not enabled then
    raise exception 'Piano Vygo: % non inclusa nel piano attuale. Aggiorna piano o attiva addon.', feature_label;
  end if;
end;
$$;

create or replace function public.enforce_company_plan_feature_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_company_plan_feature(new.company_id, tg_argv[0]);
  return new;
end;
$$;

do $$
begin
  if to_regclass('public.chat_messages') is not null then
    execute 'drop trigger if exists chat_messages_enforce_plan_feature on public.chat_messages';
    execute 'create trigger chat_messages_enforce_plan_feature before insert on public.chat_messages for each row execute function public.enforce_company_plan_feature_trigger(''chat'')';
  end if;

  if to_regclass('public.team_chat_messages') is not null then
    execute 'drop trigger if exists team_chat_messages_enforce_plan_feature on public.team_chat_messages';
    execute 'create trigger team_chat_messages_enforce_plan_feature before insert on public.team_chat_messages for each row execute function public.enforce_company_plan_feature_trigger(''chat'')';
  end if;

  if to_regclass('public.cost_entries') is not null then
    execute 'drop trigger if exists cost_entries_enforce_plan_feature on public.cost_entries';
    execute 'create trigger cost_entries_enforce_plan_feature before insert or update on public.cost_entries for each row execute function public.enforce_company_plan_feature_trigger(''costCenter'')';
  end if;
end $$;

grant execute on function public.assert_company_plan_feature(uuid, text) to authenticated;
