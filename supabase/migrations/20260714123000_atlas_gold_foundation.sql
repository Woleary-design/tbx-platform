-- Atlas Gold foundation
-- Adds durable classification, provenance, completeness scoring and review state.
-- Existing catalogue records are preserved and enriched in place.

alter table public.lego_sets
  add column if not exists product_type text not null default 'unclassified',
  add column if not exists atlas_status text not null default 'needs_review',
  add column if not exists completeness_score integer not null default 0,
  add column if not exists data_source text,
  add column if not exists image_source text,
  add column if not exists source_record_id text,
  add column if not exists source_data jsonb not null default '{}'::jsonb,
  add column if not exists source_updated_at timestamptz,
  add column if not exists enriched_at timestamptz,
  add column if not exists review_notes text,
  add column if not exists official_description text;

alter table public.lego_sets
  drop constraint if exists lego_sets_product_type_check;

alter table public.lego_sets
  add constraint lego_sets_product_type_check check (
    product_type in (
      'retail_set',
      'polybag',
      'gift_with_purchase',
      'promotional',
      'make_and_take',
      'brickheadz',
      'seasonal',
      'education',
      'minifigure_pack',
      'parts_pack',
      'book',
      'gear',
      'storage',
      'unclassified'
    )
  );

alter table public.lego_sets
  drop constraint if exists lego_sets_atlas_status_check;

alter table public.lego_sets
  add constraint lego_sets_atlas_status_check check (
    atlas_status in ('gold', 'collector_ready', 'needs_review', 'hidden', 'duplicate')
  );

alter table public.lego_sets
  drop constraint if exists lego_sets_completeness_score_check;

alter table public.lego_sets
  add constraint lego_sets_completeness_score_check check (
    completeness_score between 0 and 100
  );

create index if not exists lego_sets_product_type_idx on public.lego_sets(product_type);
create index if not exists lego_sets_atlas_status_idx on public.lego_sets(atlas_status);
create index if not exists lego_sets_completeness_score_idx on public.lego_sets(completeness_score desc);
create index if not exists lego_sets_source_record_id_idx on public.lego_sets(source_record_id);

create or replace function public.atlas_classify_product(
  set_name text,
  set_theme text,
  set_subtheme text,
  set_number text,
  piece_count integer
)
returns text
language plpgsql
immutable
as $$
declare
  haystack text := lower(concat_ws(' ', set_name, set_theme, set_subtheme));
  clean_number text := lower(coalesce(set_number, ''));
begin
  if haystack ~ '\m(book|activity book|sticker book|colouring book|coloring book|magazine)\M' then return 'book'; end if;
  if haystack ~ '\m(storage|storage box|storage head|storage brick)\M' then return 'storage'; end if;
  if haystack ~ '\m(key ?chain|keyring|wallet|backpack|rucksack|pencil case|watch|clock|mug|cup|bottle|shirt|t-shirt|hoodie|cap|hat|plush|magnet|luggage tag|lunch ?box)\M' then return 'gear'; end if;
  if haystack ~ '(make[ -]?and[ -]?take|\mm&t\M|mini build)' then return 'make_and_take'; end if;
  if haystack ~ '(gift with purchase|\mgwp\M)' then return 'gift_with_purchase'; end if;
  if haystack ~ '\mpolybag\M' or clean_number ~ '^[0-9]{5,6}-[0-9]+$' and coalesce(piece_count, 0) between 1 and 80 then return 'polybag'; end if;
  if haystack ~ '\mbrickheadz\M' then return 'brickheadz'; end if;
  if haystack ~ '\meducation\M' then return 'education'; end if;
  if haystack ~ '(minifigure pack|minifigures|collectible minifigure)' then return 'minifigure_pack'; end if;
  if haystack ~ '(parts pack|accessory pack|service pack)' then return 'parts_pack'; end if;
  if haystack ~ '(promotional|promo|event exclusive)' then return 'promotional'; end if;
  if haystack ~ '(christmas|easter|halloween|valentine|seasonal)' then return 'seasonal'; end if;
  if coalesce(piece_count, 0) > 0 then return 'retail_set'; end if;
  return 'unclassified';
end;
$$;

create or replace function public.atlas_calculate_completeness(target public.lego_sets)
returns integer
language plpgsql
immutable
as $$
declare
  score integer := 0;
begin
  if nullif(trim(target.set_number), '') is not null then score := score + 10; end if;
  if nullif(trim(target.name), '') is not null then score := score + 10; end if;
  if nullif(trim(target.theme), '') is not null then score := score + 10; end if;
  if nullif(trim(target.subtheme), '') is not null then score := score + 8; end if;
  if target.year_released is not null then score := score + 10; end if;
  if target.piece_count is not null and target.piece_count > 0 then score := score + 10; end if;
  if target.minifigure_count is not null then score := score + 7; end if;
  if nullif(trim(target.image_url), '') is not null then score := score + 12; end if;
  if target.retail_price_zar is not null then score := score + 7; end if;
  if nullif(trim(target.instructions_url), '') is not null then score := score + 8; end if;
  if nullif(trim(target.barcode), '') is not null then score := score + 4; end if;
  if target.product_type <> 'unclassified' then score := score + 4; end if;
  return least(score, 100);
end;
$$;

create or replace function public.atlas_prepare_record()
returns trigger
language plpgsql
as $$
begin
  if new.product_type is null or new.product_type = 'unclassified' then
    new.product_type := public.atlas_classify_product(new.name, new.theme, new.subtheme, new.set_number, new.piece_count);
  end if;

  new.completeness_score := public.atlas_calculate_completeness(new);

  if new.product_type in ('book', 'gear', 'storage', 'make_and_take') then
    new.atlas_status := 'hidden';
  elsif new.completeness_score >= 90 then
    new.atlas_status := 'gold';
  elsif new.completeness_score >= 65 then
    new.atlas_status := 'collector_ready';
  else
    new.atlas_status := 'needs_review';
  end if;

  return new;
end;
$$;

drop trigger if exists atlas_prepare_record_trigger on public.lego_sets;
create trigger atlas_prepare_record_trigger
before insert or update of
  set_number, name, theme, subtheme, year_released, piece_count,
  minifigure_count, image_url, retail_price_zar, instructions_url,
  barcode, product_type
on public.lego_sets
for each row execute function public.atlas_prepare_record();

-- Classify and score the current catalogue immediately.
update public.lego_sets
set product_type = public.atlas_classify_product(name, theme, subtheme, set_number, piece_count),
    enriched_at = coalesce(enriched_at, now());

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
  review_notes,
  updated_at
from public.lego_sets
where atlas_status in ('needs_review', 'duplicate')
   or completeness_score < 65
order by completeness_score asc, set_number asc;

comment on column public.lego_sets.source_data is 'Raw source-specific payload retained for traceability and future reprocessing.';
comment on column public.lego_sets.completeness_score is 'Atlas quality score from 0 to 100, recalculated by trigger.';
comment on view public.atlas_review_queue is 'Internal Atlas records requiring enrichment, classification or duplicate review.';
