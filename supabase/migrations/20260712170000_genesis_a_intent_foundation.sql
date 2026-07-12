create table if not exists public.collector_wants (
  id uuid primary key default gen_random_uuid(),
  collector_id uuid not null references auth.users(id) on delete cascade,
  lego_set_id uuid not null references public.lego_sets(id) on delete cascade,
  condition_preference text not null default 'any' check (condition_preference in ('any', 'new_sealed', 'used_complete')),
  maximum_price_zar numeric(12,2),
  minimum_confidence smallint check (minimum_confidence between 0 and 100),
  region_preference text not null default 'south_africa' check (region_preference in ('south_africa', 'worldwide')),
  notification_frequency text not null default 'instant' check (notification_frequency in ('instant', 'daily', 'weekly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collector_id, lego_set_id)
);

create index if not exists collector_wants_set_idx on public.collector_wants (lego_set_id);
create index if not exists collector_wants_collector_idx on public.collector_wants (collector_id, created_at desc);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  subject_type text not null,
  subject_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_events_subject_idx on public.activity_events (subject_type, subject_id, created_at desc);
create index if not exists activity_events_actor_idx on public.activity_events (actor_id, created_at desc);
create index if not exists activity_events_type_idx on public.activity_events (event_type, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  collector_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  href text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_collector_idx on public.notifications (collector_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications (collector_id, created_at desc) where read_at is null;

alter table public.collector_wants enable row level security;
alter table public.activity_events enable row level security;
alter table public.notifications enable row level security;

create policy "Collectors can view their own wants"
on public.collector_wants for select
using (auth.uid() = collector_id);

create policy "Collectors can create their own wants"
on public.collector_wants for insert
with check (auth.uid() = collector_id);

create policy "Collectors can update their own wants"
on public.collector_wants for update
using (auth.uid() = collector_id)
with check (auth.uid() = collector_id);

create policy "Collectors can delete their own wants"
on public.collector_wants for delete
using (auth.uid() = collector_id);

create policy "Collectors can create their own activity events"
on public.activity_events for insert
with check (auth.uid() = actor_id);

create policy "Collectors can read their own activity events"
on public.activity_events for select
using (auth.uid() = actor_id);

create policy "Collectors can read their own notifications"
on public.notifications for select
using (auth.uid() = collector_id);

create policy "Collectors can update their own notifications"
on public.notifications for update
using (auth.uid() = collector_id)
with check (auth.uid() = collector_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists collector_wants_touch_updated_at on public.collector_wants;
create trigger collector_wants_touch_updated_at
before update on public.collector_wants
for each row execute function public.touch_updated_at();

create or replace function public.atlas_want_count(target_set_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from public.collector_wants where lego_set_id = target_set_id;
$$;

grant execute on function public.atlas_want_count(uuid) to authenticated;
