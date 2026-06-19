-- FATTURE AZIENDA - CAMION CHIARO
-- Da eseguire una sola volta dopo 23A_licenze_aziende.sql.

create table if not exists public.company_invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_number text not null,
  issued_at date not null default current_date,
  due_at date,
  paid_at timestamptz,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'eur',
  status text not null default 'draft' check (status in ('draft', 'open', 'paid', 'uncollectible', 'cancelled')),
  pdf_path text,
  billing_provider text not null default 'manual' check (billing_provider in ('manual', 'stripe')),
  external_invoice_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, invoice_number)
);

alter table public.company_invoices enable row level security;

drop policy if exists "Members can read company invoices" on public.company_invoices;
create policy "Members can read company invoices"
on public.company_invoices
for select
to authenticated
using ((select public.is_company_member(company_id)));

create index if not exists company_invoices_company_issued_idx
on public.company_invoices (company_id, issued_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-invoices',
  'company-invoices',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Members can read company invoice files" on storage.objects;
create policy "Members can read company invoice files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'company-invoices'
  and (select public.is_company_member(((storage.foldername(name))[1])::uuid))
);

-- I PDF vanno salvati nel bucket company-invoices con percorso:
-- ID_AZIENDA/fatture/NOME_FILE.pdf
--
-- Esempio record fattura:
--
-- insert into public.company_invoices (
--   company_id,
--   invoice_number,
--   issued_at,
--   due_at,
--   amount_cents,
--   status,
--   pdf_path
-- )
-- values (
--   'ID_AZIENDA',
--   'FAT-2026-0001',
--   current_date,
--   current_date + 15,
--   9900,
--   'paid',
--   'ID_AZIENDA/fatture/FAT-2026-0001.pdf'
-- );
