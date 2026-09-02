-- Marketplace visitors may read photo metadata only while its listing is active.
-- Owners retain their existing access to all of their own evidence.

create policy "Marketplace can view active listing evidence"
on public.asset_evidence
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.listings
    where listings.asset_id = asset_evidence.asset_id
      and listings.status = 'Active'
  )
);
