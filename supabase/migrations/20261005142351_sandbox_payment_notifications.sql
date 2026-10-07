create schema if not exists private;
revoke create on schema private from public, anon, authenticated;

create policy "Sellers read their sandbox payment results"
on public.payfast_sandbox_attempts for select to authenticated
using (exists (
  select 1 from public.purchase_reservations r
  where r.id = payfast_sandbox_attempts.reservation_id
    and r.seller_id = (select auth.uid())
));

create unique index notifications_sandbox_payment_once
on public.notifications (recipient_id, notification_type, entity_id)
where notification_type = 'purchase.sandbox_payment_verified';

create or replace function private.notify_sandbox_payment_verified()
returns trigger language plpgsql security definer set search_path = '' as $$
declare reservation public.purchase_reservations%rowtype;
begin
  if new.status <> 'complete' or new.verified_at is null then return new; end if;
  select * into reservation from public.purchase_reservations where id = new.reservation_id;
  insert into public.notifications (recipient_id, notification_type, title, body, entity_type, entity_id, data)
  values
    (reservation.buyer_id, 'purchase.sandbox_payment_verified', 'Your test payment was verified',
     'PayFast verified your sandbox payment. No real money was taken. Delivery and ownership transfer are not active in this test.',
     'purchase_reservation', reservation.id, jsonb_build_object('sandbox', true)),
    (reservation.seller_id, 'purchase.sandbox_payment_verified', 'Buyer test payment verified — do not dispatch',
     'The buyer completed a verified sandbox payment. This is a test, not a real sale. Do not dispatch the item.',
     'purchase_reservation', reservation.id, jsonb_build_object('sandbox', true))
  on conflict (recipient_id, notification_type, entity_id)
    where notification_type = 'purchase.sandbox_payment_verified' do nothing;
  return new;
end;
$$;
revoke all on function private.notify_sandbox_payment_verified() from public, anon, authenticated;
create trigger sandbox_payment_verified_notification
after insert or update of status on public.payfast_sandbox_attempts
for each row execute function private.notify_sandbox_payment_verified();

-- Give participants in completed sandbox tests the same clear updates.
insert into public.notifications (recipient_id, notification_type, title, body, entity_type, entity_id, data)
select party.recipient_id, 'purchase.sandbox_payment_verified', party.title, party.body,
       'purchase_reservation', r.id, jsonb_build_object('sandbox', true)
from public.payfast_sandbox_attempts p
join public.purchase_reservations r on r.id = p.reservation_id
cross join lateral (values
  (r.buyer_id, 'Your test payment was verified', 'PayFast verified your sandbox payment. No real money was taken. Delivery and ownership transfer are not active in this test.'),
  (r.seller_id, 'Buyer test payment verified — do not dispatch', 'The buyer completed a verified sandbox payment. This is a test, not a real sale. Do not dispatch the item.')
) party(recipient_id, title, body)
where p.status = 'complete' and p.verified_at is not null
on conflict (recipient_id, notification_type, entity_id)
  where notification_type = 'purchase.sandbox_payment_verified' do nothing;
