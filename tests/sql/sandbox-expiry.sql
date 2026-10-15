-- Only run against sandbox. Fixture changes are always rolled back.
begin;
do $$
declare r public.purchase_reservations%rowtype; previous_status text; n integer;
begin
 select reservation.* into strict r from public.purchase_reservations reservation
 join public.sandbox_order_ledger l on l.reservation_id=reservation.id
 where l.status='paid_test' limit 1;
 previous_status:=r.status;
 update public.purchase_reservations set payment_deadline=now()-interval '1 day' where id=r.id;
 perform private.expire_sandbox_reservations();
 if (select status from public.purchase_reservations where id=r.id) is distinct from previous_status then
  raise exception 'FAIL: verified test payment expired';
 end if;
 -- Turn the fixture into an unpaid reservation, only inside this transaction.
 delete from public.sandbox_ledger_events where ledger_id in(select id from public.sandbox_order_ledger where reservation_id=r.id);
 delete from public.sandbox_order_ledger where reservation_id=r.id;
 delete from public.payfast_sandbox_attempts where reservation_id=r.id;
 update public.purchase_reservations set status='awaiting_seller',seller_deadline=now()-interval '1 minute' where id=r.id;
 update public.listings set status='Reserved',reserved_by=r.buyer_id where id=r.listing_id;
 perform private.expire_sandbox_reservations();
 if (select status from public.purchase_reservations where id=r.id)<>'seller_expired' then raise exception 'FAIL: seller expiry'; end if;
 if (select status from public.listings where id=r.listing_id)<>'Active' then raise exception 'FAIL: listing not reopened'; end if;
 n:=private.expire_sandbox_reservations();
 if n<>0 then raise exception 'FAIL: repeated expiry'; end if;
 update public.purchase_reservations set status='awaiting_payment',payment_deadline=now()-interval '1 minute' where id=r.id;
 update public.listings set status='Reserved',reserved_by=r.buyer_id where id=r.listing_id;
 perform private.expire_sandbox_reservations();
 if (select status from public.purchase_reservations where id=r.id)<>'payment_expired' then raise exception 'FAIL: payment expiry'; end if;
end $$;
rollback;
select 'PASS: verified payment protection, unpaid seller/payment expiry, reopening and idempotency; changes rolled back' as result;
