-- REAZIONI CHAT - CAMION CHIARO
-- Aggiunge reazioni rapide ai messaggi della chat.

alter table public.chat_messages
add column if not exists reactions jsonb not null default '{}'::jsonb;
