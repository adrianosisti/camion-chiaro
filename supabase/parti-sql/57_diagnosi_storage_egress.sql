-- Diagnosi non distruttiva per capire dove nasce il consumo Storage / Cached Egress.
-- Esegui tutto: restituisce riepilogo bucket, cartelle piu pesanti e file piu grandi.

with storage_sizes as (
  select
    bucket_id,
    name,
    split_part(name, '/', 1) as company_id,
    split_part(name, '/', 2) as area,
    coalesce(nullif(metadata->>'size', '')::bigint, 0) as size_bytes,
    metadata->>'mimetype' as mime_type,
    created_at,
    updated_at,
    last_accessed_at
  from storage.objects
)
select
  bucket_id,
  count(*) as file_count,
  round(sum(size_bytes)::numeric / 1024 / 1024, 2) as total_mb,
  round(avg(nullif(size_bytes, 0))::numeric / 1024 / 1024, 2) as avg_mb,
  max(last_accessed_at) as last_accessed_at
from storage_sizes
group by bucket_id
order by sum(size_bytes) desc;

with storage_sizes as (
  select
    bucket_id,
    split_part(name, '/', 1) as company_id,
    coalesce(nullif(split_part(name, '/', 2), ''), 'root') as area,
    coalesce(nullif(metadata->>'size', '')::bigint, 0) as size_bytes,
    last_accessed_at
  from storage.objects
)
select
  bucket_id,
  company_id,
  area,
  count(*) as file_count,
  round(sum(size_bytes)::numeric / 1024 / 1024, 2) as total_mb,
  max(last_accessed_at) as last_accessed_at
from storage_sizes
group by bucket_id, company_id, area
order by sum(size_bytes) desc
limit 40;

with storage_sizes as (
  select
    bucket_id,
    name,
    coalesce(nullif(metadata->>'size', '')::bigint, 0) as size_bytes,
    metadata->>'mimetype' as mime_type,
    created_at,
    updated_at,
    last_accessed_at
  from storage.objects
)
select
  bucket_id,
  name,
  mime_type,
  round(size_bytes::numeric / 1024 / 1024, 2) as size_mb,
  created_at,
  updated_at,
  last_accessed_at
from storage_sizes
order by size_bytes desc
limit 50;
