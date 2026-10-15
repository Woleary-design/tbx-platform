begin;
do $$
declare r public.purchase_reservations%rowtype; a jsonb; l public.sandbox_order_ledger%rowtype; deadline timestamptz; notices int; count_before int; stamp timestamptz;
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

 insert into public.admin_users(id,role) values(l.buyer_id,'super_admin') on conflict(id) do update set role='super_admin';
 begin
  perform public.act_on_sandbox_ledger(l.id,'dispatch'); raise exception 'FAIL: old dispatch skipped booking';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform set_config('request.jwt.claim.sub',l.seller_id::text,true);
 perform public.act_on_sandbox_delivery(l.reservation_id,'ready','{"origin":"Test origin locker"}');
 begin
  perform public.act_on_sandbox_delivery(l.reservation_id,'arrive'); raise exception 'FAIL: seller forged arrival';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform set_config('request.jwt.claim.sub',l.buyer_id::text,true);
 select count(*) into count_before from public.notifications where entity_id=l.reservation_id;
 perform public.act_on_sandbox_delivery(l.reservation_id,'ready','{"origin":"Test origin locker"}');
 if (select count(*) from public.notifications where entity_id=l.reservation_id)<>count_before then raise exception 'Duplicate booking notification'; end if;
 update public.sandbox_deliveries set dropoff_deadline=now()-interval '1 minute' where reservation_id=l.reservation_id;
 begin
  perform public.act_on_sandbox_delivery(l.reservation_id,'dispatch'); raise exception 'FAIL: expired booking dispatched';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform public.act_on_sandbox_delivery(l.reservation_id,'ready','{"origin":"Test origin locker"}');
 perform public.act_on_sandbox_delivery(l.reservation_id,'dispatch');
 begin
  perform public.act_on_sandbox_ledger(l.id,'deliver'); raise exception 'FAIL: old delivery skipped collection';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform public.act_on_sandbox_delivery(l.reservation_id,'arrive');
 if (select inspection_ends_at from public.sandbox_order_ledger where id=l.id) is not null then raise exception 'Inspection started at locker arrival'; end if;
 begin
  perform public.act_on_sandbox_ledger(l.id,'accept'); raise exception 'FAIL: receipt before collection';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform public.act_on_sandbox_delivery(l.reservation_id,'receive');
 select inspection_ends_at into stamp from public.sandbox_order_ledger where id=l.id;
 if stamp is null or stamp<>now()+interval '48 hours' then raise exception 'Inspection missing after collection'; end if;
 perform public.act_on_sandbox_delivery(l.reservation_id,'receive');
 if (select inspection_ends_at from public.sandbox_order_ledger where id=l.id)<>stamp then raise exception 'Duplicate collection reset inspection'; end if;
 perform public.act_on_sandbox_ledger(l.id,'accept');
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 begin
  perform public.act_on_sandbox_delivery('5dc998eb-5329-4a2a-b034-608e85694351','receive'); raise exception 'FAIL: unrelated RPC allowed';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 if exists(select 1 from public.sandbox_deliveries) then raise exception 'RLS leaked deliveries'; end if;
 begin
  insert into public.sandbox_deliveries(reservation_id,method,destination,parcel) values(gen_random_uuid(),'locker','Test','{}');
  raise exception 'FAIL: direct delivery writes allowed';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
end $$;
reset role;
rollback;
select 'PASS: locker lifecycle, role restrictions, duplicate prevention, no inspection before collection, legacy endpoint guards, RLS; all test mutations rolled back' as result;
