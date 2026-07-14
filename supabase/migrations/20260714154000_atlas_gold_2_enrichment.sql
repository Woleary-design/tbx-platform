-- Atlas Gold 2.0 enrichment
-- Adds inventory provenance, conflict tracking and a richer review queue.

alter table public.lego_sets
  add column if not exists inventory_source text,
  add column if not exists inventory_source_version integer,
  add column if not exists minifigure_source text,
  add column if not exists instructions_source text,
  add column if not exists enrichment_version text,
  add column if not exists enrichment_conflicts jsonb not null default '[]'::jsonb,
  add column if not exists last_inventory_sync_at timestamptz,
  add column if not exists last_instructions_sync_at timestamptz;

create index if not exists lego_sets_enrichment_version_idx
  on public.lego_sets(enrichment_version);

create index if not exists lego_sets_enrichment_conflicts_idx
  on public.lego_sets using gin(enrichment_conflicts);

create or replace view public.atlas_review_queue as
select
  id,
  set_number,
  name,
  theme,
  subtheme,
  year_released,
  piece_count,
  minifigure_count,
  image_url,
  product_type,
  atlas_status,
  completeness_score,
  data_source,
  source_record_id,
  inventory_source,
  inventory_source_version,
  minifigure_source,
  instructions_source,
  enrichment_version,
  enrichment_conflicts,
  review_notes,
  enriched_at,
  updated_at
from public.lego_sets
where atlas_status in ('needs_review', 'duplicate')
   or completeness_score < 65
   or jsonb_array_length(enrichment_conflicts) > 0
order by
  case when jsonb_array_length(enrichment_conflicts) > 0 then 0 else 1 end,
  completeness_score asc,
  set_number asc;

comment on column public.lego_sets.enrichment_conflicts is
  'Structured source disagreements or suspicious values requiring Atlas review.';
comment on column public.lego_sets.enrichment_version is
  'Importer/enrichment release that most recently processed this record.';
