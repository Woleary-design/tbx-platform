-- Private reusable addresses for courier collection and delivery.
create table if not exists public.shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home' check (char_length(label) between 1 and 40),
  recipient_name text not null check (char_length(recipient_name) between 1 and 120),
  mobile_number text not null check (char_length(mobile_number) between 7 and 30),
  company text,
  street_address text not null check (char_length(street_address) between 1 and 200),
  local_area text not null check (char_length(local_area) between 1 and 120),
  city text not null check (char_length(city) between 1 and 120),
  province text not null check (char_length(province) between 1 and 80),
  postal_code text not null check (char_length(postal_code) between 1 and 12),
  address_type text not null default 'residential' check (address_type in ('residential','business')),
  latitude double precision,
  longitude double precision,
  is_default_dispatch boolean not null default false,
  is_default_delivery boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, label)
);

create unique index if not exists shipping_addresses_one_dispatch_default
  on public.shipping_addresses(user_id) where is_default_dispatch;
create unique index if not exists shipping_addresses_one_delivery_default
  on public.shipping_addresses(user_id) where is_default_delivery;

alter table public.shipping_addresses enable row level security;

create policy "Users can read their own shipping addresses"
  on public.shipping_addresses for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can add their own shipping addresses"
  on public.shipping_addresses for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can update their own shipping addresses"
  on public.shipping_addresses for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete their own shipping addresses"
  on public.shipping_addresses for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.shipping_addresses to authenticated;
grant all on public.shipping_addresses to service_role;
