create extension if not exists pg_trgm;

create table if not exists public.lego_minifigures (
  id uuid primary key default gen_random_uuid(),
  catalogue_id text not null unique,
  name text not null,
  character_name text,
  theme text,
  subtheme text,
  year_released integer,
  num_parts integer,
  image_url text,
  aliases text[] not null default '{}',
  source_sets text[] not null default '{}',
  external_ids jsonb not null default '{}'::jsonb,
  source text not null default 'rebrickable',
  source_url text,
  is_active boolean not null default true,
  atlas_visibility text not null default 'public' check (atlas_visibility in ('public','review','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lego_minifigures_name_trgm_idx on public.lego_minifigures using gin (name gin_trgm_ops);
create index if not exists lego_minifigures_character_trgm_idx on public.lego_minifigures using gin (character_name gin_trgm_ops);
create index if not exists lego_minifigures_catalogue_id_trgm_idx on public.lego_minifigures using gin (catalogue_id gin_trgm_ops);
create index if not exists lego_minifigures_theme_idx on public.lego_minifigures (theme);
create index if not exists lego_minifigures_visibility_idx on public.lego_minifigures (atlas_visibility, is_active);

alter table public.lego_minifigures enable row level security;

drop policy if exists "Public can read visible minifigures" on public.lego_minifigures;
create policy "Public can read visible minifigures"
on public.lego_minifigures for select
to anon, authenticated
using (is_active = true and atlas_visibility = 'public');

create or replace function public.atlas_minifigure_search(search_query text, result_limit integer default 12)
returns table (
  id uuid,
  catalogue_id text,
  name text,
  character_name text,
  theme text,
  subtheme text,
  year_released integer,
  num_parts integer,
  image_url text,
  aliases text[],
  source_sets text[],
  external_ids jsonb,
  relevance real
)
language sql
stable
security invoker
set search_path = public
as $$
  with q as (
    select lower(regexp_replace(coalesce(search_query,''), '[^a-zA-Z0-9]+', '', 'g')) as compact,
           lower(trim(coalesce(search_query,''))) as raw
  )
  select m.id, m.catalogue_id, m.name, m.character_name, m.theme, m.subtheme,
         m.year_released, m.num_parts, m.image_url, m.aliases, m.source_sets, m.external_ids,
         greatest(
           similarity(lower(m.name), q.raw),
           similarity(lower(coalesce(m.character_name,'')), q.raw),
           similarity(lower(m.catalogue_id), q.raw),
           case when lower(regexp_replace(m.name, '[^a-zA-Z0-9]+', '', 'g')) = q.compact then 1.0 else 0.0 end,
           case when lower(regexp_replace(coalesce(m.character_name,''), '[^a-zA-Z0-9]+', '', 'g')) = q.compact then 1.0 else 0.0 end,
           case when exists (
             select 1 from unnest(m.aliases) a
             where lower(regexp_replace(a, '[^a-zA-Z0-9]+', '', 'g')) = q.compact
                or similarity(lower(a), q.raw) >= 0.34
           ) then 0.92 else 0.0 end
         )::real as relevance
  from public.lego_minifigures m
  cross join q
  where m.is_active = true
    and m.atlas_visibility = 'public'
    and (
      lower(m.name) % q.raw
      or lower(coalesce(m.character_name,'')) % q.raw
      or lower(m.catalogue_id) % q.raw
      or lower(regexp_replace(m.name, '[^a-zA-Z0-9]+', '', 'g')) = q.compact
      or lower(regexp_replace(coalesce(m.character_name,''), '[^a-zA-Z0-9]+', '', 'g')) = q.compact
      or exists (
        select 1 from unnest(m.aliases) a
        where lower(regexp_replace(a, '[^a-zA-Z0-9]+', '', 'g')) = q.compact
           or similarity(lower(a), q.raw) >= 0.34
      )
    )
  order by relevance desc, m.name asc
  limit greatest(1, least(result_limit, 50));
$$;
