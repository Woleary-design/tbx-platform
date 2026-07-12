alter table public.notifications
add column if not exists dedupe_key text;

create unique index if not exists notifications_dedupe_key_idx
on public.notifications (dedupe_key)
where dedupe_key is not null;

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete restrict,
  lego_set_id uuid not null references public.lego_sets(id) on delete restrict,
  price_zar numeric(12,2) not null check (price_zar > 0),
  condition text not null check (condition in ('New Sealed', 'New Open Box', 'Used Complete', 'Used Incomplete', 'Unknown')),
  confidence_score smallint not null default 0 check (confidence_score between 0 and 100),
  region text not null default 'south_africa' check (region in ('south_africa', 'worldwide')),
  shipping_option text not null default 'courier' check (shipping_option in ('courier', 'collection', 'courier_or_collection')),
  dispatch_days smallint not null default 3 check (dispatch_days between 1 and 30),
  status text not null default 'draft' check (status in ('draft', 'live', 'reserved', 'sold', 'withdrawn')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists marketplace_listings_active_asset_idx
on public.marketplace_listings (asset_id)
where status in ('draft', 'live', 'reserved');

create index if not exists marketplace_listings_live_set_idx
on public.marketplace_listings (lego_set_id, published_at desc)
where status = 'live';

create index if not exists marketplace_listings_seller_idx
on public.marketplace_listings (seller_id, created_at desc);

alter table public.marketplace_listings enable row level security;

create policy "Anyone can view live marketplace listings"
on public.marketplace_listings for select
using (status = 'live' or auth.uid() = seller_id);

create policy "Sellers can create listings from their records"
on public.marketplace_listings for insert
with check (
  auth.uid() = seller_id
  and exists (
    select 1 from public.assets
    where assets.id = asset_id and assets.owner_id = auth.uid()
  )
);

create policy "Sellers can update their own listings"
on public.marketplace_listings for update
using (auth.uid() = seller_id)
with check (auth.uid() = seller_id);

create policy "Sellers can delete their own draft listings"
on public.marketplace_listings for delete
using (auth.uid() = seller_id and status = 'draft');

drop trigger if exists marketplace_listings_touch_updated_at on public.marketplace_listings;
create trigger marketplace_listings_touch_updated_at
before update on public.marketplace_listings
for each row execute function public.touch_updated_at();

create or replace function public.match_live_listing_to_wants()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status <> 'live' then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status = 'live' then
    return new;
  end if;

  new.published_at := coalesce(new.published_at, now());

  insert into public.activity_events (actor_id, event_type, subject_type, subject_id, payload)
  values (
    new.seller_id,
    'listing.created',
    'marketplace_listing',
    new.id::text,
    jsonb_build_object('lego_set_id', new.lego_set_id, 'price_zar', new.price_zar)
  );

  insert into public.notifications (
    collector_id,
    type,
    title,
    body,
    href,
    metadata,
    dedupe_key
  )
  select
    wants.collector_id,
    'want.match',
    'A set on your Wants list is now available',
    sets.name || ' is listed for R' || trim(to_char(new.price_zar, 'FM9999999990D00')) || '.',
    '/marketplace/' || new.id::text,
    jsonb_build_object(
      'listing_id', new.id,
      'want_id', wants.id,
      'lego_set_id', new.lego_set_id,
      'price_zar', new.price_zar,
      'condition', new.condition,
      'confidence_score', new.confidence_score
    ),
    'want-match:' || wants.id::text || ':' || new.id::text
  from public.collector_wants wants
  join public.lego_sets sets on sets.id = new.lego_set_id
  where wants.lego_set_id = new.lego_set_id
    and wants.collector_id <> new.seller_id
    and wants.notification_frequency = 'instant'
    and (wants.maximum_price_zar is null or new.price_zar <= wants.maximum_price_zar)
    and (
      wants.condition_preference = 'any'
      or (wants.condition_preference = 'new_sealed' and new.condition = 'New Sealed')
      or (wants.condition_preference = 'used_complete' and new.condition = 'Used Complete')
    )
    and (wants.minimum_confidence is null or new.confidence_score >= wants.minimum_confidence)
    and (wants.region_preference = 'worldwide' or new.region = 'south_africa')
  on conflict (dedupe_key) where dedupe_key is not null do nothing;

  insert into public.activity_events (actor_id, event_type, subject_type, subject_id, payload)
  select
    notifications.collector_id,
    'want.matched',
    'marketplace_listing',
    new.id::text,
    jsonb_build_object('notification_id', notifications.id, 'lego_set_id', new.lego_set_id)
  from public.notifications notifications
  where notifications.dedupe_key like 'want-match:%:' || new.id::text;

  return new;
end;
$$;

drop trigger if exists marketplace_listing_match_trigger on public.marketplace_listings;
create trigger marketplace_listing_match_trigger
before insert or update of status on public.marketplace_listings
for each row execute function public.match_live_listing_to_wants();
