alter table public.compliance_items
add column if not exists file_bucket text not null default 'company-assets';

alter table public.compliance_items
add column if not exists file_path text;
