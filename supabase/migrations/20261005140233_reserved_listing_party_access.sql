create policy "Reservation buyers can view reserved listings"
on public.listings for select to authenticated
using (status = 'Reserved' and exists (
  select 1 from public.purchase_reservations r
  where r.listing_id = listings.id and r.buyer_id = (select auth.uid())
    and r.status in ('awaiting_seller', 'awaiting_payment', 'ready_to_ship', 'shipped')
));
create policy "Reservation parties can view item evidence"
on public.asset_evidence for select to authenticated
using (exists (
  select 1 from public.purchase_reservations r
  where r.asset_id = asset_evidence.asset_id
    and ((select auth.uid()) = r.buyer_id or (select auth.uid()) = r.seller_id)
    and r.status in ('awaiting_seller', 'awaiting_payment', 'ready_to_ship', 'shipped')
));
