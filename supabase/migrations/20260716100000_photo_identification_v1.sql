create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('identification-photos', 'identification-photos', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.identification_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'uploading' check (status in ('uploading','analysing','needs_review','confirmed','failed','expired')),
  detected_text text,
  analysis_summary text,
  confidence integer not null default 0 check (confidence between 0 and 100),
  selected_lego_set_id uuid references public.lego_sets(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.identification_photos (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.identification_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  mime_type text not null,
  byte_size integer not null check (byte_size > 0 and byte_size <= 10485760),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.identification_candidates (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.identification_sessions(id) on delete cascade,
  lego_set_id uuid not null references public.lego_sets(id) on delete cascade,
  rank integer not null check (rank between 1 and 10),
  confidence integer not null check (confidence between 0 and 100),
  reason text,
  created_at timestamptz not null default now(),
  unique (session_id, lego_set_id),
  unique (session_id, rank)
);

create index if not exists identification_sessions_user_idx on public.identification_sessions(user_id, created_at desc);
create index if not exists identification_photos_session_idx on public.identification_photos(session_id, sort_order);
create index if not exists identification_candidates_session_idx on public.identification_candidates(session_id, rank);

alter table public.identification_sessions enable row level security;
alter table public.identification_photos enable row level security;
alter table public.identification_candidates enable row level security;

drop policy if exists identification_sessions_owner_all on public.identification_sessions;
create policy identification_sessions_owner_all on public.identification_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists identification_photos_owner_all on public.identification_photos;
create policy identification_photos_owner_all on public.identification_photos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists identification_candidates_owner_read on public.identification_candidates;
create policy identification_candidates_owner_read on public.identification_candidates for select using (
  exists (select 1 from public.identification_sessions s where s.id = session_id and s.user_id = auth.uid())
);

drop policy if exists identification_storage_owner_select on storage.objects;
create policy identification_storage_owner_select on storage.objects for select using (
  bucket_id = 'identification-photos' and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists identification_storage_owner_insert on storage.objects;
create policy identification_storage_owner_insert on storage.objects for insert with check (
  bucket_id = 'identification-photos' and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists identification_storage_owner_delete on storage.objects;
create policy identification_storage_owner_delete on storage.objects for delete using (
  bucket_id = 'identification-photos' and auth.uid()::text = (storage.foldername(name))[1]
);

create or replace function public.touch_identification_session() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists identification_sessions_touch on public.identification_sessions;
create trigger identification_sessions_touch before update on public.identification_sessions
for each row execute function public.touch_identification_session();