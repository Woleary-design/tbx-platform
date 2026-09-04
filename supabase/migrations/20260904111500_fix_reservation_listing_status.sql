create or replace function public.reserve_listing_for_purchase(target_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid := auth.uid();
  target_listing public.listings%rowtype;
  reservation_id uuid;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;

  select * into target_listing
  from public.listings
  where id = target_listing_id
  for update;

  if not found then raise exception 'Listing not found'; end if;
  if target_listing.seller_id = current_user_id then raise exception 'You cannot buy your own listing'; end if;
  if target_listing.status not in ('Live', 'live', 'Active', 'active') then raise exception 'Item is no longer available'; end if;

  insert into public.purchase_reservations (
    listing_id, asset_id, buyer_id, seller_id, amount, currency
  ) values (
    target_listing.id, target_listing.asset_id, current_user_id,
    target_listing.seller_id, target_listing.asking_price, target_listing.currency
  ) returning id into reservation_id;

  update public.listings
  set status = 'Reserved', reserved_by = current_user_id, reserved_at = now(),
      seller_confirmation_deadline = now() + interval '12 hours', updated_at = now()
  where id = target_listing.id;

  update public.assets
  set lifecycle_status = 'reserved', updated_at = now()
  where id = target_listing.asset_id;

  insert into public.notifications (
    recipient_id, notification_type, title, body, entity_type, entity_id, data
  ) values (
    target_listing.seller_id,
    'purchase.seller_confirmation_required',
    'A buyer wants your item',
    'Please confirm within 12 hours that the item is still available. No payment has been taken yet.',
    'purchase_reservation', reservation_id,
    jsonb_build_object('listingId', target_listing.id, 'buyerId', current_user_id, 'deadline', now() + interval '12 hours')
  );

  return reservation_id;
end;
$function$;
