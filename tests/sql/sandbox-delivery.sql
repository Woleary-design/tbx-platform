begin;
do $$
declare l public.sandbox_order_ledger%rowtype; count_before int; stamp timestamptz;
begin
 select * into strict l from public.sandbox_order_ledger limit 1;
 -- Re-use an existing test fixture inside a transaction; all effects are rolled back.
 update public.sandbox_order_ledger set status='pending',delivered_at=null,inspection_ends_at=null,buyer_accepted_at=null,courier_cents=10000,seller_cents=gross_cents-fee_cents-10000 where id=l.id;
 update public.purchase_reservations set status='awaiting_payment' where id=l.reservation_id;
 insert into public.admin_users(id,role) values(l.buyer_id,'super_admin') on conflict(id) do update set role='super_admin';
 perform set_config('request.jwt.claim.sub',l.buyer_id::text,true);
 begin
  perform public.act_on_sandbox_delivery(l.reservation_id,'select','{"method":"locker","destination":"Test locker","parcel":{"lengthCm":70,"widthCm":20,"heightCm":10,"weightKg":1}}');
  raise exception 'FAIL: oversized locker parcel allowed';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform public.act_on_sandbox_delivery(l.reservation_id,'select','{"method":"locker","destination":"Test destination locker","parcel":{"lengthCm":30,"widthCm":20,"heightCm":10,"weightKg":1}}');
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
 -- A door shipment must skip locker arrival and start inspection on doorstep receipt.
 delete from public.sandbox_deliveries where reservation_id=l.reservation_id;
 update public.sandbox_order_ledger set status='pending',delivered_at=null,inspection_ends_at=null,buyer_accepted_at=null where id=l.id;
 perform public.act_on_sandbox_delivery(l.reservation_id,'select','{"method":"door","destination":"Test door address","parcel":{"lengthCm":70,"widthCm":50,"heightCm":30,"weightKg":25}}');
 perform public.act_on_sandbox_delivery(l.reservation_id,'ready','{"origin":"Test collection address"}');
 perform public.act_on_sandbox_delivery(l.reservation_id,'dispatch');
 begin
  perform public.act_on_sandbox_delivery(l.reservation_id,'arrive'); raise exception 'FAIL: door shipment became locker arrival';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform public.act_on_sandbox_delivery(l.reservation_id,'receive');
 if (select status from public.sandbox_order_ledger where id=l.id)<>'delivered' then raise exception 'Door delivery missing'; end if;
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
select 'PASS: locker and door lifecycle, role restrictions, duplicate prevention, no inspection before collection, legacy endpoint guards, RLS; all test mutations rolled back' as result;
