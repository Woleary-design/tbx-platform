-- Automatically release listings when a seller or buyer misses a reservation deadline.
-- The job is database-owned so expiry does not depend on an application request.

create extension if not exists pg_cron;

create schema if not exists private;

create index if not exists purchase_reservations_awaiting_seller_deadline_idx
  on public.purchase_reservations (seller_deadline)
  where status = 'awaiting_seller';

create index if not exists purchase_reservations_awaiting_payment_deadline_idx
  on public.purchase_reservations (payment_deadline)
  where status = 'awaiting_payment';

create or replace function private.expire_purchase_reservations()
returns integer
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  expired_reservation public.purchase_reservations%rowtype;
  expired_count integer := 0;
  listing_reopened integer;
  expiry_status text;
  expiry_reason text;
begin
  for expired_reservation in
    select reservation.*
    from public.purchase_reservations reservation
    where (
      reservation.status = 'awaiting_seller'
      and reservation.seller_deadline <= now()
    ) or (
      reservation.status = 'awaiting_payment'
      and reservation.payment_deadline is not null
      and reservation.payment_deadline <= now()
    )
    order by coalesce(reservation.payment_deadline, reservation.seller_deadline)
    limit 500
    for update skip locked
  loop
    expiry_status := case expired_reservation.status
      when 'awaiting_seller' then 'seller_expired'
      else 'payment_expired'
    end;
    expiry_reason := case expired_reservation.status
      when 'awaiting_seller' then 'Seller confirmation deadline expired'
      else 'Buyer payment deadline expired'
    end;

    update public.purchase_reservations
    set status = expiry_status,
        cancelled_at = now(),
        cancellation_reason = expiry_reason,
        updated_at = now()
    where id = expired_reservation.id
      and status = expired_reservation.status;

    if not found then
      continue;
    end if;

    update public.listings
    set status = 'Active',
        lifecycle_state = 'listed',
        reserved_by = null,
        reserved_at = null,
        seller_confirmation_deadline = null,
        seller_confirmed_at = null,
        payment_due_at = null,
        updated_at = now()
    where id = expired_reservation.listing_id
      and status = 'Reserved';

    get diagnostics listing_reopened = row_count;

    if listing_reopened = 1 then
      update public.assets
      set lifecycle_status = 'listed',
          is_public = true,
          updated_at = now()
      where id = expired_reservation.asset_id;
    end if;

    if expiry_status = 'seller_expired' then
      insert into public.notifications (
        recipient_id, notification_type, title, body, entity_type, entity_id, data
      ) values
      (
        expired_reservation.buyer_id,
        'purchase.seller_expired',
        'The seller did not confirm in time',
        'Your reservation expired and the item is available again. No payment was taken.',
        'purchase_reservation',
        expired_reservation.id,
        jsonb_build_object('listingId', expired_reservation.listing_id)
      ),
      (
        expired_reservation.seller_id,
        'purchase.seller_response_expired',
        'Your confirmation window expired',
        'The reservation expired because it was not confirmed in time. Your listing is available again.',
        'purchase_reservation',
        expired_reservation.id,
        jsonb_build_object('listingId', expired_reservation.listing_id)
      );
    else
      insert into public.notifications (
        recipient_id, notification_type, title, body, entity_type, entity_id, data
      ) values
      (
        expired_reservation.buyer_id,
        'purchase.payment_expired',
        'Your payment window expired',
        'The reservation expired and the item is available again. No payment was taken.',
        'purchase_reservation',
        expired_reservation.id,
        jsonb_build_object('listingId', expired_reservation.listing_id)
      ),
      (
        expired_reservation.seller_id,
        'purchase.buyer_payment_expired',
        'The buyer did not pay in time',
        'The buyer payment window expired. Your listing is available again.',
        'purchase_reservation',
        expired_reservation.id,
        jsonb_build_object('listingId', expired_reservation.listing_id)
      );
    end if;

    expired_count := expired_count + 1;
  end loop;

  return expired_count;
end;
$function$;

revoke all on function private.expire_purchase_reservations() from public, anon, authenticated;

select cron.unschedule(jobid)
from cron.job
where jobname = 'expire-tbx-purchase-reservations';

select cron.schedule(
  'expire-tbx-purchase-reservations',
  '*/5 * * * *',
  $cron$select private.expire_purchase_reservations();$cron$
);
