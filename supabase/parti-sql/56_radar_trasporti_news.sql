create table if not exists public.transport_news_items (
  id text primary key,
  source_id text not null,
  source_name text not null,
  title text not null,
  summary text,
  url text not null,
  category text not null default 'Logistica',
  language text not null default 'it',
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  importance integer not null default 50 check (importance between 0 and 100),
  tags text[] not null default '{}',
  is_active boolean not null default true
);

create index if not exists transport_news_language_idx
on public.transport_news_items (language, is_active, importance desc, published_at desc);

create index if not exists transport_news_fetched_idx
on public.transport_news_items (fetched_at desc);

alter table public.transport_news_items enable row level security;

drop policy if exists "Authenticated users can read transport news" on public.transport_news_items;
create policy "Authenticated users can read transport news"
on public.transport_news_items
for select
to authenticated
using (is_active = true);

comment on table public.transport_news_items is
'Cache Radar Trasporti Vygo: notizie operative raccolte da fonti pubbliche e mostrate come titolo, fonte, sintesi e link originale.';
