alter table public.assets add column if not exists collectible_details jsonb;
alter table public.assets add column if not exists catalogue_reference jsonb;
create table if not exists public.collectible_wishlist (
  id uuid primary key default gen_random_uuid(),
  collector_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('Pokémon','Hot Wheels')),
  catalogue_id text not null,
  catalogue_reference jsonb not null,
  created_at timestamptz not null default now(),
  unique (collector_id, category, catalogue_id)
);
alter table public.collectible_wishlist enable row level security;
create policy collectible_wishlist_owner on public.collectible_wishlist
  for all to authenticated using ((select auth.uid()) = collector_id)
  with check ((select auth.uid()) = collector_id);
grant select, insert, update, delete on public.collectible_wishlist to authenticated;
