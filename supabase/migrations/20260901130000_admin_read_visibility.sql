create policy "Admins can read all collectors"
on public.collectors for select to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.id = auth.uid()
      and au.role in ('super_admin', 'admin', 'moderator', 'support')
  )
);

create policy "Admins can read all assets"
on public.assets for select to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.id = auth.uid()
      and au.role in ('super_admin', 'admin', 'moderator', 'support')
  )
);

create policy "Admins can read all listings"
on public.listings for select to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.id = auth.uid()
      and au.role in ('super_admin', 'admin', 'moderator', 'support')
  )
);

create policy "Admins can read all reservations"
on public.purchase_reservations for select to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.id = auth.uid()
      and au.role in ('super_admin', 'admin', 'moderator', 'support')
  )
);
