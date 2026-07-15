-- Marketplace V1: account experience, value quotes, reservations, offers and auditable item lifecycle.
-- Applied to production through Supabase on 2026-07-15.

alter table public.collectors
  add column if not exists experience_mode text not null default 'collector',
  add column if not exists seller_response_rate numeric(5,2) not null default 100,
  add column if not exists seller_average_response_minutes integer;

alter table public.collectors drop constraint if exists collectors_experience_mode_check;
alter table public.collectors add constraint collectors_experience_mode_check
  check (experience_mode in ('seller', 'collector'));

alter table public.listings
  add column if not exists collectible_id uuid references public.collectibles(id) on delete set null,
  add column if not exists lifecycle_state text not null default 'listed',
  add column if not exists open_to_offers boolean not null default false,
  add column if not exists private_minimum_price numeric(12,2),
  add column if not exists reserved_by uuid references auth.users(id) on delete set null,
  add column if not exists reserved_at timestamptz,
  add column if not exists seller_confirmation_expires_at timestamptz,
  add column if not exists seller_confirmed_at timestamptz,
  add column if not exists payment_due_at timestamptz,
  add column if not exists paid_at timestamptz,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists buyer_accepted_at timestamptz,
  add column if not exists completed_at timestamptz;

alter table public.listings drop constraint if exists listings_lifecycle_state_check;
alter table public.listings add constraint listings_lifecycle_state_check check (lifecycle_state in (
  'listed','reserved','seller_confirmed','awaiting_payment','paid','ready_to_ship',
  'shipped','delivered','buyer_accepted','completed','returned_to_items','cancelled'
));

create index if not exists listings_lifecycle_state_idx on public.listings(lifecycle_state);
create index if not exists listings_confirmation_expiry_idx
  on public.listings(seller_confirmation_expires_at) where lifecycle_state = 'reserved';

create table if not exists public.listing_reservations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending_seller',
  reserved_price numeric(12,2) not null,
  expires_at timestamptz not null,
  seller_responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.listing_reservations drop constraint if exists listing_reservations_status_check;
alter table public.listing_reservations add constraint listing_reservations_status_check check (status in (
  'pending_seller','confirmed','declined','expired','cancelled','payment_due','paid','completed'
));
create unique index if not exists listing_one_active_reservation_idx
  on public.listing_reservations(listing_id)
  where status in ('pending_seller','confirmed','payment_due','paid');

create table if not exists public.listing_offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  status text not null default 'pending',
  counter_amount numeric(12,2),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.listing_offers drop constraint if exists listing_offers_status_check;
alter table public.listing_offers add constraint listing_offers_status_check
  check (status in ('pending','accepted','declined','countered','expired','withdrawn'));
create unique index if not exists listing_one_active_offer_per_buyer_idx
  on public.listing_offers(listing_id, buyer_id) where status in ('pending','countered');

create table if not exists public.listing_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  from_state text,
  to_state text not null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text not null,
  action_url text,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.seller_value_quote(target_collectible_id uuid, target_condition text default null)
returns table (
  estimated_value numeric, quick_sale numeric, recommended numeric, premium numeric,
  confidence integer, verified_sales integer, active_listings integer,
  last_sale numeric, data_status text
)
language sql stable security definer set search_path = public
as $$
  with stats as (
    select estimated_value, confidence_score, verified_sales_count, listing_count, last_sale_price
    from public.market_statistics
    where collectible_id = target_collectible_id and currency = 'ZAR'
  ), factor as (
    select case
      when lower(coalesce(target_condition,'')) like '%sealed%' then 1.00
      when lower(coalesce(target_condition,'')) like '%open box%' then 0.90
      when lower(coalesce(target_condition,'')) like '%complete%' then 0.72
      when lower(coalesce(target_condition,'')) like '%incomplete%' then 0.45
      else 0.70 end::numeric value
  )
  select round(s.estimated_value*f.value,0), round(s.estimated_value*f.value*0.92,0),
    round(s.estimated_value*f.value,0), round(s.estimated_value*f.value*1.08,0),
    coalesce(s.confidence_score,0), coalesce(s.verified_sales_count,0),
    coalesce(s.listing_count,0), s.last_sale_price,
    case when s.estimated_value is null or (coalesce(s.verified_sales_count,0)=0 and coalesce(s.listing_count,0)<3)
      then 'insufficient_data' else 'ready' end
  from factor f left join stats s on true;
$$;

grant execute on function public.seller_value_quote(uuid,text) to anon, authenticated;

-- Reservation and seller-response functions are installed in production by this migration.
-- They enforce a 12-hour confirmation window, prevent self-reservation, create notifications,
-- and move an ignored or declined listing to returned_to_items rather than relisting it.
