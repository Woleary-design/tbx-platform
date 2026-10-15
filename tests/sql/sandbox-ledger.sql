begin;
do $$
declare l public.sandbox_order_ledger%rowtype; before_count int; after_count int;
begin
 select * into strict l from public.sandbox_order_ledger where status='pending' and courier_cents is null order by created_at limit 1;
 if l.gross_cents<>41400 or l.fee_cents<>4140 or l.courier_cents is not null or l.status<>'pending' then raise exception 'Initial ledger mismatch'; end if;
 insert into public.admin_users(id,role) values(l.buyer_id,'super_admin') on conflict(id) do update set role='super_admin';
 perform set_config('request.jwt.claim.sub',l.buyer_id::text,true);
 begin
  perform public.act_on_sandbox_ledger(l.id,'payout');
  raise exception 'FAIL: premature payout allowed';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform public.act_on_sandbox_ledger(l.id,'courier_cost',10000);
 perform public.act_on_sandbox_ledger(l.id,'processor_cost',1500);
 select * into strict l from public.sandbox_order_ledger where id=l.id;
 if l.seller_cents<>27260 or l.gross_cents<>l.seller_cents+l.fee_cents+l.courier_cents then raise exception 'Allocation mismatch'; end if;
 begin
  perform public.act_on_sandbox_ledger(l.id,'courier_cost',20000);
  raise exception 'FAIL: frozen courier cost changed';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform set_config('request.jwt.claim.sub',l.seller_id::text,true);
 begin
  perform public.act_on_sandbox_ledger(l.id,'payout');
  raise exception 'FAIL: seller allowed payout';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform public.act_on_sandbox_ledger(l.id,'dispatch');
 perform set_config('request.jwt.claim.sub',l.buyer_id::text,true);
 perform public.act_on_sandbox_ledger(l.id,'deliver');
 begin
  perform public.act_on_sandbox_ledger(l.id,'payout');
  raise exception 'FAIL: inspection skipped';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 -- A dispute must block payout even after the inspection period.
 begin
  perform public.act_on_sandbox_ledger(l.id,'dispute',null,'Item arrived damaged');
  update public.sandbox_order_ledger set inspection_ends_at=now()-interval '1 hour' where id=l.id;
  begin
   perform public.act_on_sandbox_ledger(l.id,'payout');
   raise exception 'FAIL: dispute ignored';
  exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
  perform public.act_on_sandbox_ledger(l.id,'refund');
  if (select status from public.sandbox_order_ledger where id=l.id)<>'refunded_test' then raise exception 'Refund missing'; end if;
  raise exception 'RESET_SCENARIO';
 exception when others then if sqlerrm<>'RESET_SCENARIO' then raise; end if; end;
 perform public.act_on_sandbox_ledger(l.id,'accept');
 perform public.act_on_sandbox_ledger(l.id,'payout');
 select count(*) into before_count from public.sandbox_ledger_events where ledger_id=l.id;
 perform public.act_on_sandbox_ledger(l.id,'payout');
 select count(*) into after_count from public.sandbox_ledger_events where ledger_id=l.id;
 if before_count<>after_count or (select status from public.sandbox_order_ledger where id=l.id)<>'paid_test' then raise exception 'Payout idempotency failed'; end if;
 if (select status from public.purchase_reservations where id=l.reservation_id)='completed' then raise exception 'Real fulfilment changed'; end if;
end $$;
-- Check actual RLS as an unrelated authenticated user, including private RPC authorization.
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 if exists(select 1 from public.sandbox_order_ledger) or exists(select 1 from public.sandbox_ledger_events) then raise exception 'RLS exposed another account ledger'; end if;
 begin
  perform public.act_on_sandbox_ledger((select id from public.sandbox_order_ledger limit 1),'refund');
  raise exception 'FAIL: unrelated action allowed';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 begin
  update public.sandbox_order_ledger set status='paid_test';
  raise exception 'FAIL: direct writes allowed';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
end $$;
reset role;
rollback;
select 'PASS: allocation, immutable costs, role checks, delivery gate, inspection, dispute hold, refund, duplicate payout, RLS and fulfilment isolation; all test changes rolled back' as acceptance;
