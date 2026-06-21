do $$
begin
  alter publication supabase_realtime add table public.team_chat_threads;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.team_chat_participants;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.team_chat_messages;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.team_chat_message_reads;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
