create or replace function public.respond_to_purchase_reservation(target_reservation_id uuid, confirm_available boolean)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid := auth.uid();
  target_reservation public.purchase_reservations%rowtype;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;

  select * into target_reservation
  from public.purchase_reservations
  where id = target_reservation_id
  for update;

  if not found then raise exception 'Reservation not found'; end if;
  if target_reservation.seller_id <> current_user_id then raise exception 'Only the seller may respond'; end if;
  if target_reservation.status <> 'awaiting_seller' then raise exception 'Reservation has already been resolved'; end if;

  update public.collectors
  set seller_response_count = seller_response_count + 1, updated_at = now()
  where id = current_user_id;

  if confirm_available then
    update public.purchase_reservations
    set status = 'awaiting_payment', seller_responded_at = now(),
        payment_deadline = now() + interval '30 minutes', updated_at = now()
    where id = target_reservation.id;

    update public.listings
    set status = 'Reserved', seller_confirmed_at = now(), updated_at = now()
    where id = target_reservation.listing_id;

    update public.assets
    set lifecycle_status = 'awaiting_payment', updated_at = now()
    where id = target_reservation.asset_id;

    update public.collectors
    set seller_confirmation_count = seller_confirmation_count + 1, updated_at = now()
    where id = current_user_id;

    insert into public.notifications (
      recipient_id, notification_type, title, body, entity_type, entity_id, data
    ) values (
      target_reservation.buyer_id,
      'purchase.seller_confirmed',
      'The seller confirmed availability',
      'Your item is ready for payment. Complete payment within 30 minutes.',
      'purchase_reservation', target_reservation.id,
      jsonb_build_object('paymentDeadline', now() + interval '30 minutes')
    );

    return 'awaiting_payment';
  else
    update public.purchase_reservations
    set status = 'seller_declined', seller_responded_at = now(),
        cancelled_at = now(), cancellation_reason = 'Seller confirmed item unavailable', updated_at = now()
    where id = target_reservation.id;

    update public.listings
    set status = 'Withdrawn', seller_declined_at = now(),
        removed_reason = 'seller_declined_unavailable', reserved_by = null,
        seller_confirmation_deadline = null, updated_at = now()
    where id = target_reservation.listing_id;

    update public.assets
    set lifecycle_status = 'in_inventory', is_public = false, updated_at = now()
    where id = target_reservation.asset_id;

    insert into public.notifications (
      recipient_id, notification_type, title, body, entity_type, entity_id
    ) values (
      target_reservation.buyer_id,
      'purchase.item_unavailable',
      'The item is no longer available',
      'The seller could not confirm availability. No payment was taken.',
      'purchase_reservation', target_reservation.id
    );

    return 'seller_declined';
  end if;
end;
$function$;
