-- Atlas Curation 6.1
-- Adds public/advanced/hidden/review visibility, categories, quality scoring,
-- automatic import curation, and a private review queue.

alter table public.lego_sets
  add column if not exists atlas_visibility text not null default 'review',
  add column if not exists atlas_category text not null default 'unclassified',
  add column if not exists atlas_quality_score integer not null default 0,
  add column if not exists atlas_review_status text not null default 'needs_review',
  add column if not exists atlas_reviewed_at timestamptz,
  add column if not exists atlas_reviewed_by uuid references auth.users(id);

create or replace function public.atlas_apply_curation()
returns trigger language plpgsql set search_path = public, pg_temp as $$
declare
  n text := lower(coalesce(new.name,''));
  t text := lower(coalesce(new.theme,''));
  pt text := lower(coalesce(new.product_type,'unclassified'));
  score integer := 0;
begin
  score := score
    + case when nullif(trim(new.set_number),'') is not null then 15 else 0 end
    + case when nullif(trim(new.name),'') is not null then 15 else 0 end
    + case when nullif(trim(new.theme),'') is not null then 10 else 0 end
    + case when new.year_released between 1949 and extract(year from now())::int + 2 then 10 else 0 end
    + case when new.piece_count is not null and new.piece_count > 0 then 15 else 0 end
    + case when nullif(trim(new.image_url),'') is not null then 20 else 0 end
    + case when nullif(trim(new.instructions_url),'') is not null then 10 else 0 end
    + case when new.minifigure_count is not null then 5 else 0 end;
  new.atlas_quality_score := least(100, greatest(0, score));

  if pt in ('book','gear','storage') or t in ('books','gear','storage')
     or n ~ '(usb power adapter|power adapter type|store display|retail display|sticker sheet|sticker book|activity book|colouring book|coloring book|pencil case|backpack|rucksack|wallet|key ?chain|luggage tag|storage box|watch|clock|notebook|journal|calendar|poster|t-shirt|shirt|hoodie|costume|plush|cushion|duvet|bedding|lunch ?box|water bottle|mug|umbrella)'
  then
    new.atlas_visibility := 'hidden'; new.atlas_category := 'specialist'; new.atlas_review_status := 'rejected'; new.is_active := false;
  elsif pt = 'retail_set' and coalesce(new.piece_count,0) >= 2 then
    new.atlas_visibility := 'public'; new.atlas_category := 'sets'; new.atlas_review_status := case when score >= 55 then 'approved' else 'needs_review' end;
  elsif pt = 'gift_with_purchase' then
    new.atlas_visibility := 'public'; new.atlas_category := 'gift_with_purchase'; new.atlas_review_status := 'approved';
  elsif pt = 'brickheadz' then
    new.atlas_visibility := 'public'; new.atlas_category := 'brickheadz'; new.atlas_review_status := 'approved';
  elsif pt = 'polybag' and coalesce(new.piece_count,0) >= 2 then
    new.atlas_visibility := 'public'; new.atlas_category := 'polybags'; new.atlas_review_status := case when score >= 50 then 'approved' else 'needs_review' end;
  elsif pt = 'seasonal' then
    new.atlas_visibility := 'public'; new.atlas_category := 'seasonal'; new.atlas_review_status := 'approved';
  elsif pt in ('promotional','make_and_take') then
    new.atlas_visibility := 'public'; new.atlas_category := 'promotional'; new.atlas_review_status := case when score >= 50 then 'approved' else 'needs_review' end;
  elsif pt = 'education' then
    new.atlas_visibility := 'advanced'; new.atlas_category := 'education'; new.atlas_review_status := 'approved';
  elsif pt in ('minifigure_pack','parts_pack') then
    new.atlas_visibility := 'advanced'; new.atlas_category := 'specialist'; new.atlas_review_status := 'approved';
  else
    new.atlas_visibility := 'review'; new.atlas_category := 'unclassified'; new.atlas_review_status := 'needs_review';
  end if;
  return new;
end; $$;

drop trigger if exists lego_sets_atlas_curation_trigger on public.lego_sets;
create trigger lego_sets_atlas_curation_trigger
before insert or update of name, theme, product_type, set_number, year_released, piece_count, image_url, instructions_url, minifigure_count
on public.lego_sets for each row execute function public.atlas_apply_curation();

update public.lego_sets set name = name;

create index if not exists lego_sets_atlas_visibility_year_idx on public.lego_sets(atlas_visibility, is_active, year_released desc);
create index if not exists lego_sets_atlas_review_idx on public.lego_sets(atlas_review_status, atlas_quality_score);

drop view if exists public.atlas_review_queue;
create view public.atlas_review_queue with (security_invoker = true) as
select id, set_number, name, theme, subtheme, product_type, atlas_visibility,
       atlas_category, atlas_quality_score, atlas_review_status, year_released,
       piece_count, image_url, enrichment_conflicts, updated_at
from public.lego_sets
where atlas_review_status = 'needs_review'
   or atlas_visibility = 'review'
   or atlas_quality_score < 55;

revoke all on public.atlas_review_queue from anon, authenticated;
grant select on public.atlas_review_queue to service_role;
