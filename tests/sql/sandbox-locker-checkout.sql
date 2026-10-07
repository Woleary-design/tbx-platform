begin;
do $$
declare r public.purchase_reservations%rowtype; a jsonb; l public.sandbox_order_ledger%rowtype; deadline timestamptz; notices int;
begin
 select * into strict r from public.purchase_reservations where id='5dc998eb-5329-4a2a-b034-608e85694351';
 -- Reuse the completed sandbox fixture only within this rollback transaction.
 delete from public.sandbox_ledger_events where ledger_id in(select id from public.sandbox_order_ledger where reservation_id=r.id);
 delete from public.sandbox_order_ledger where reservation_id=r.id;
 delete from public.sandbox_deliveries where reservation_id=r.id;
 delete from public.payfast_sandbox_attempts where reservation_id=r.id;
 update public.listings set value_quote=coalesce(value_quote,'{}'::jsonb)||'{"sellerFundsShipping":false}'::jsonb where id=r.listing_id;
 update public.purchase_reservations set status='awaiting_payment',payment_deadline=now()+interval '30 minutes' where id=r.id;
 if (select payment_deadline from public.purchase_reservations where id=r.id) is not null then raise exception 'FAIL: payment clock before quote'; end if;
 perform set_config('request.jwt.claim.sub',r.buyer_id::text,true);
 begin
  perform public.start_payfast_sandbox_attempt(r.id); raise exception 'FAIL: checkout before quote';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform public.act_on_sandbox_delivery(r.id,'select','{"method":"door","destination":"Test address","parcel":{"lengthCm":30,"widthCm":20,"heightCm":10,"weightKg":1}}');
 if (select quote_cents from public.sandbox_deliveries where reservation_id=r.id) is not null then raise exception 'FAIL: locker price applied to door'; end if;
 perform public.act_on_sandbox_delivery(r.id,'select','{"method":"locker","destination":"Test locker","quote_cents":1,"parcel":{"lengthCm":30,"widthCm":20,"heightCm":10,"weightKg":1}}');
 if (select quote_cents from public.sandbox_deliveries where reservation_id=r.id)<>6900 then raise exception 'FAIL: server quote'; end if;
 select payment_deadline into deadline from public.purchase_reservations where id=r.id;
 if deadline is null or deadline<>now()+interval '30 minutes' then raise exception 'FAIL: payment clock'; end if;
 select count(*) into notices from public.notifications where entity_id=r.id;
 perform public.act_on_sandbox_delivery(r.id,'select','{"method":"locker","destination":"Test locker","parcel":{"lengthCm":30,"widthCm":20,"heightCm":10,"weightKg":1}}');
 if (select count(*) from public.notifications where entity_id=r.id)<>notices then raise exception 'FAIL: duplicate notices'; end if;
 a:=public.start_payfast_sandbox_attempt(r.id);
 if (a->>'amount')::numeric<>r.amount+69 then raise exception 'FAIL: buyer total'; end if;
 begin
  perform public.act_on_sandbox_delivery(r.id,'select','{"method":"locker","destination":"Changed locker","parcel":{"lengthCm":10,"widthCm":10,"heightCm":5,"weightKg":1}}'); raise exception 'FAIL: checkout quote mutable';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform set_config('request.jwt.claim.sub',r.seller_id::text,true);
 begin
  perform public.start_payfast_sandbox_attempt(r.id); raise exception 'FAIL: seller checkout';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform public.record_payfast_sandbox_notification((a->>'id')::uuid,'999888777666',r.amount+69,'COMPLETE');
 select * into strict l from public.sandbox_order_ledger where reservation_id=r.id;
 if l.courier_cents<>6900 or l.gross_cents<>round((r.amount+69)*100) or l.seller_cents<>round(r.amount*100)-round(r.amount*10) then raise exception 'FAIL: ledger reconciliation'; end if;
 perform public.act_on_sandbox_delivery(r.id,'ready','{"origin":"Test origin locker"}');
 insert into public.admin_users(id,role) values(r.buyer_id,'super_admin') on conflict(id) do update set role='super_admin';
 perform set_config('request.jwt.claim.sub',r.buyer_id::text,true);
 perform public.act_on_sandbox_delivery(r.id,'dispatch');
 perform public.act_on_sandbox_delivery(r.id,'arrive');
 if (select inspection_ends_at from public.sandbox_order_ledger where id=l.id) is not null then raise exception 'FAIL: inspection at locker arrival'; end if;
 perform public.act_on_sandbox_delivery(r.id,'receive');
 perform public.act_on_sandbox_ledger(l.id,'accept');
 perform public.act_on_sandbox_ledger(l.id,'processor_cost',1000);
 perform public.act_on_sandbox_ledger(l.id,'payout');
 if (select status from public.sandbox_order_ledger where id=l.id)<>'paid_test' then raise exception 'FAIL: seller payout'; end if;
end $$;
rollback;
select 'PASS: quote, full buyer total, immutable checkout, reconciled ledger, locker collection, inspection, receipt and simulated payout; fixture changes rolled back' as result;
