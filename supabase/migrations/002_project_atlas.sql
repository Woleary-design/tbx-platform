-- =========================================================
-- PROJECT ATLAS v1
-- LEGO catalogue, search and market-price foundations
-- =========================================================

create extension if not exists pg_trgm;

create table if not exists public.lego_sets (
  id uuid primary key default gen_random_uuid(),
  set_number text not null unique,
  name text not null,
  theme text,
  subtheme text,
  year_released integer,
  year_retired integer,
  piece_count integer,
  minifigure_count integer,
  image_url text,
  external_source text,
  external_id text,
  retail_price_zar numeric(12,2),
  barcode text,
  instructions_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists lego_sets_external_source_id_idx
  on public.lego_sets(external_source, external_id)
  where external_source is not null and external_id is not null;

create index if not exists lego_sets_set_number_trgm_idx
  on public.lego_sets using gin (set_number gin_trgm_ops);

create index if not exists lego_sets_name_trgm_idx
  on public.lego_sets using gin (name gin_trgm_ops);

create index if not exists lego_sets_theme_trgm_idx
  on public.lego_sets using gin (theme gin_trgm_ops);

create table if not exists public.market_price_snapshots (
  id uuid primary key default gen_random_uuid(),
  lego_set_id uuid not null references public.lego_sets(id) on delete cascade,
  condition text not null check (condition in ('New Sealed', 'Used Complete', 'Used Incomplete', 'Unknown')),
  currency text not null default 'ZAR',
  market_value numeric(12,2),
  low_price numeric(12,2),
  high_price numeric(12,2),
  average_sold_price numeric(12,2),
  active_listing_count integer,
  sold_sample_count integer,
  confidence_score integer check (confidence_score between 0 and 100),
  source_summary jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create index if not exists market_price_snapshots_lookup_idx
  on public.market_price_snapshots(lego_set_id, condition, captured_at desc);

alter table public.assets
  add column if not exists lego_set_id uuid references public.lego_sets(id) on delete set null;

create index if not exists assets_lego_set_id_idx
  on public.assets(lego_set_id);

create or replace function public.search_lego_sets(search_term text, result_limit integer default 10)
returns table (
  id uuid,
  set_number text,
  name text,
  theme text,
  subtheme text,
  year_released integer,
  piece_count integer,
  minifigure_count integer,
  image_url text
)
language sql
stable
set search_path = public
as $$
  select
    ls.id,
    ls.set_number,
    ls.name,
    ls.theme,
    ls.subtheme,
    ls.year_released,
    ls.piece_count,
    ls.minifigure_count,
    ls.image_url
  from public.lego_sets ls
  where ls.is_active = true
    and (
      ls.set_number ilike '%' || trim(search_term) || '%'
      or ls.name ilike '%' || trim(search_term) || '%'
      or coalesce(ls.theme, '') ilike '%' || trim(search_term) || '%'
      or coalesce(ls.subtheme, '') ilike '%' || trim(search_term) || '%'
    )
  order by
    case when lower(ls.set_number) = lower(trim(search_term)) then 0 else 1 end,
    greatest(
      similarity(lower(ls.set_number), lower(trim(search_term))),
      similarity(lower(ls.name), lower(trim(search_term))),
      similarity(lower(coalesce(ls.theme, '')), lower(trim(search_term)))
    ) desc,
    ls.year_released desc nulls last
  limit greatest(1, least(result_limit, 25));
$$;

alter table public.lego_sets enable row level security;
alter table public.market_price_snapshots enable row level security;

create policy "LEGO catalogue is publicly readable"
  on public.lego_sets
  for select
  to anon, authenticated
  using (is_active = true);

create policy "Market prices are publicly readable"
  on public.market_price_snapshots
  for select
  to anon, authenticated
  using (true);

grant select on public.lego_sets to anon, authenticated;
grant select on public.market_price_snapshots to anon, authenticated;
grant execute on function public.search_lego_sets(text, integer) to anon, authenticated;

grant select, insert, update, delete on public.lego_sets to service_role;
grant select, insert, update, delete on public.market_price_snapshots to service_role;

-- Starter records keep the search usable before the full import runs.
insert into public.lego_sets (
  set_number,
  name,
  theme,
  subtheme,
  year_released,
  piece_count,
  image_url,
  external_source,
  external_id
)
values
  ('10182', 'Café Corner', 'Creator Expert', 'Modular Buildings', 2007, 2056, null, 'starter', '10182'),
  ('10185', 'Green Grocer', 'Creator Expert', 'Modular Buildings', 2008, 2352, null, 'starter', '10185'),
  ('75192', 'Millennium Falcon', 'Star Wars', 'Ultimate Collector Series', 2017, 7541, null, 'starter', '75192'),
  ('10294', 'Titanic', 'Icons', 'Vehicles', 2021, 9090, null, 'starter', '10294')
on conflict (set_number) do update set
  name = excluded.name,
  theme = excluded.theme,
  subtheme = excluded.subtheme,
  year_released = excluded.year_released,
  piece_count = excluded.piece_count,
  updated_at = now();
