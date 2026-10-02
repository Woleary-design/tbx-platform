alter table public.admin_users
  drop constraint if exists admin_users_role_check;

alter table public.admin_users
  add constraint admin_users_role_check
  check (role in (
    'super_admin',
    'admin',
    'moderator',
    'operations',
    'technical',
    'support',
    'finance'
  ));

drop policy if exists "Admins can read all collectors" on public.collectors;
create policy "Scoped admins can read collectors"
on public.collectors for select to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.id = auth.uid()
      and au.role in ('super_admin', 'admin', 'moderator', 'operations', 'support')
  )
);

drop policy if exists "Admins can read all assets" on public.assets;
create policy "Scoped admins can read assets"
on public.assets for select to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.id = auth.uid()
      and au.role in ('super_admin', 'admin', 'moderator', 'operations', 'support', 'technical')
  )
);

drop policy if exists "Admins can read all listings" on public.listings;
create policy "Scoped admins can read listings"
on public.listings for select to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.id = auth.uid()
      and au.role in ('super_admin', 'admin', 'moderator', 'operations', 'support')
  )
);

drop policy if exists "Admins can read all reservations" on public.purchase_reservations;
create policy "Scoped admins can read reservations"
on public.purchase_reservations for select to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.id = auth.uid()
      and au.role in ('super_admin', 'admin', 'moderator', 'operations', 'support', 'finance')
  )
);
