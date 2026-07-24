create extension if not exists pg_trgm;
create extension if not exists unaccent;

create table if not exists public.atlas_search_aliases (
  id uuid primary key default gen_random_uuid(),
  lego_set_id uuid not null references public.lego_sets(id) on delete cascade,
  alias text not null,
  alias_type text not null default 'nickname' check (alias_type in ('nickname','misspelling','abbreviation','character','vehicle','keyword')),
  weight integer not null default 20 check (weight between 1 and 100),
  created_at timestamptz not null default now(),
  unique (lego_set_id, alias)
);

create index if not exists atlas_search_aliases_alias_trgm_idx on public.atlas_search_aliases using gin (alias gin_trgm_ops);
create index if not exists lego_sets_name_trgm_idx on public.lego_sets using gin (name gin_trgm_ops);
create index if not exists lego_sets_number_trgm_idx on public.lego_sets using gin (set_number gin_trgm_ops);
create index if not exists lego_sets_theme_trgm_idx on public.lego_sets using gin (theme gin_trgm_ops);
create index if not exists lego_sets_subtheme_trgm_idx on public.lego_sets using gin (subtheme gin_trgm_ops);

alter table public.atlas_search_aliases enable row level security;
drop policy if exists "Public can read Atlas aliases" on public.atlas_search_aliases;
create policy "Public can read Atlas aliases" on public.atlas_search_aliases for select using (true);
grant select on public.atlas_search_aliases to anon, authenticated;

insert into public.atlas_search_aliases (lego_set_id, alias, alias_type, weight)
select id, regexp_replace(lower(name), '[^a-z0-9]+', '', 'g'), 'keyword', 12
from public.lego_sets
where is_active = true and length(regexp_replace(lower(name), '[^a-z0-9]+', '', 'g')) >= 3
on conflict do nothing;

insert into public.atlas_search_aliases (lego_set_id, alias, alias_type, weight)
select id, replace(lower(name), 'millennium', 'millenium'), 'misspelling', 35
from public.lego_sets
where is_active = true and lower(name) like '%millennium%'
on conflict do nothing;

insert into public.atlas_search_aliases (lego_set_id, alias, alias_type, weight)
select id, replace(replace(lower(name), 'at-at', 'atat'), 'at-st', 'atst'), 'abbreviation', 30
from public.lego_sets
where is_active = true and (lower(name) like '%at-at%' or lower(name) like '%at-st%')
on conflict do nothing;

create or replace function public.atlas_search(search_query text, result_limit integer default 40)
returns table (
  id uuid,
  set_number text,
  name text,
  theme text,
  subtheme text,
  year_released integer,
  piece_count integer,
  minifigure_count integer,
  image_url text,
  relevance numeric,
  match_reason text
)
language sql
stable
security definer
set search_path = public
as $$
with parsed as (
  select
    lower(unaccent(trim(search_query))) q,
    regexp_replace(lower(unaccent(trim(search_query))), '[^a-z0-9]+', '', 'g') compact_q,
    case when trim(search_query) ~ '^(19|20)[0-9]{2}$' then trim(search_query)::int end q_year,
    case when lower(search_query) ~ '[0-9]+\s*(pieces|pcs|piece)' then nullif(regexp_replace(lower(search_query), '.*?([0-9]+)\s*(pieces|pcs|piece).*', '\1'), '')::int end q_pieces
), candidates as (
  select s.*, coalesce(a.aliases, '') aliases, coalesce(a.max_weight, 0) alias_weight,
    lower(unaccent(s.set_number)) n_number,
    lower(unaccent(s.name)) n_name,
    lower(unaccent(coalesce(s.theme,''))) n_theme,
    lower(unaccent(coalesce(s.subtheme,''))) n_subtheme
  from public.lego_sets s
  left join lateral (
    select string_agg(lower(unaccent(alias)), ' ') aliases, max(weight) max_weight
    from public.atlas_search_aliases x where x.lego_set_id = s.id
  ) a on true
  where s.is_active = true
), scored as (
  select c.*, p.q, p.compact_q,
    greatest(
      case when c.n_number = p.q then 1000 else 0 end,
      case when regexp_replace(c.n_number, '[^a-z0-9]+','','g') = p.compact_q then 970 else 0 end,
      case when c.n_name = p.q then 930 else 0 end,
      case when c.n_theme = p.q then 820 else 0 end,
      case when c.n_subtheme = p.q then 800 else 0 end,
      case when c.aliases like '%' || p.q || '%' then 760 + c.alias_weight else 0 end,
      case when c.n_number like p.q || '%' then 720 else 0 end,
      case when c.n_name like p.q || '%' then 680 else 0 end,
      case when c.n_name like '%' || p.q || '%' then 600 else 0 end,
      case when c.n_theme like '%' || p.q || '%' then 520 else 0 end,
      case when c.n_subtheme like '%' || p.q || '%' then 500 else 0 end,
      similarity(c.n_name, p.q) * 450,
      similarity(c.n_number, p.q) * 500,
      similarity(c.aliases, p.q) * 420 + c.alias_weight,
      case when p.q_year is not null and c.year_released = p.q_year then 700 else 0 end,
      case when p.q_pieces is not null and c.piece_count between greatest(0,p.q_pieces-100) and p.q_pieces+100 then 500 else 0 end
    )::numeric relevance
  from candidates c cross join parsed p
)
select id,set_number,name,theme,subtheme,year_released,piece_count,minifigure_count,image_url,relevance,
  case
    when n_number=q or regexp_replace(n_number,'[^a-z0-9]+','','g')=compact_q then 'set_number'
    when n_name=q then 'exact_name'
    when aliases like '%'||q||'%' then 'alias'
    when n_theme=q then 'theme'
    when n_subtheme=q then 'subtheme'
    when similarity(n_name,q) >= .35 then 'fuzzy_name'
    else 'related'
  end match_reason
from scored
where relevance >= 110
order by relevance desc, year_released desc nulls last, name
limit least(greatest(result_limit,1),100);
$$;

grant execute on function public.atlas_search(text, integer) to anon, authenticated;
