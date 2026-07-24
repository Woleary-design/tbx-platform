-- Replace legacy Wants terminology with Wishlist.

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  collector_id uuid not null references auth.users(id) on delete cascade,
  lego_set_id uuid not null references public.lego_sets(id) on delete cascade,
  condition_preference text,
  maximum_price_zar numeric(12,2),
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (collector_id, lego_set_id)
);

alter table public.wishlist_items enable row level security;

create policy "Collectors can view own wishlist"
on public.wishlist_items for select
using (auth.uid() = collector_id);

create policy "Collectors can add own wishlist items"
on public.wishlist_items for insert
with check (auth.uid() = collector_id);

create policy "Collectors can update own wishlist items"
on public.wishlist_items for update
using (auth.uid() = collector_id)
with check (auth.uid() = collector_id);

create policy "Collectors can remove own wishlist items"
on public.wishlist_items for delete
using (auth.uid() = collector_id);

create or replace function public.atlas_wishlist_count(target_set_id uuid)
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*) from public.wishlist_items where lego_set_id = target_set_id;
$$;

grant execute on function public.atlas_wishlist_count(uuid) to anon, authenticated;

do $$
begin
  if to_regclass('public.collector_wants') is not null then
    insert into public.wishlist_items (collector_id, lego_set_id, condition_preference, maximum_price_zar, created_at)
    select collector_id, lego_set_id, condition_preference, maximum_price_zar, created_at
    from public.collector_wants
    on conflict (collector_id, lego_set_id) do nothing;

    drop table public.collector_wants cascade;
  end if;
end $$;
