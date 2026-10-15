-- Simulated accounting only. No fulfilment, ownership or bank movement.
create table public.sandbox_order_ledger (
 id uuid primary key default gen_random_uuid(),
 reservation_id uuid not null unique references public.purchase_reservations(id),
 payment_attempt_id uuid not null unique references public.payfast_sandbox_attempts(id),
 buyer_id uuid not null references auth.users(id), seller_id uuid not null references auth.users(id),
 mode text not null default 'sandbox' check (mode='sandbox'),
 currency text not null default 'ZAR' check(currency='ZAR'),
 gross_cents bigint not null check(gross_cents>0),
 item_cents bigint not null check(item_cents>0),
 fee_cents bigint not null check(fee_cents>=0),
 delivery_payer text not null check(delivery_payer in ('buyer','seller')),
 courier_cents bigint check(courier_cents>=0),
 processor_cents bigint check(processor_cents>=0),
 seller_cents bigint check(seller_cents>=0),
 status text not null default 'pending' check(status in ('pending','in_transit','delivered','disputed','paid_test','refunded_test')),
 delivered_at timestamptz, inspection_ends_at timestamptz, buyer_accepted_at timestamptz,
 payout_reference text, dispute_reason text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check (seller_cents is null or gross_cents = seller_cents + fee_cents + courier_cents),
 check (fee_cents <= item_cents)
);
create table public.sandbox_ledger_events (
 id uuid primary key default gen_random_uuid(), ledger_id uuid not null references public.sandbox_order_ledger(id),
 actor_id uuid references auth.users(id), action text not null, details jsonb not null default '{}', created_at timestamptz not null default now()
);
alter table public.sandbox_order_ledger enable row level security;
alter table public.sandbox_ledger_events enable row level security;
revoke all on public.sandbox_order_ledger,public.sandbox_ledger_events from anon,authenticated;
grant select on public.sandbox_order_ledger,public.sandbox_ledger_events to authenticated;
grant all on public.sandbox_order_ledger,public.sandbox_ledger_events to service_role;
create policy sandbox_ledger_read on public.sandbox_order_ledger for select to authenticated using (
 buyer_id=(select auth.uid()) or seller_id=(select auth.uid()) or exists(select 1 from public.admin_users where id=(select auth.uid()) and role in ('super_admin','finance','operations','support'))
);
create policy sandbox_events_read on public.sandbox_ledger_events for select to authenticated using (
 exists(select 1 from public.sandbox_order_ledger where id=ledger_id)
);

create or replace function private.capture_sandbox_ledger() returns trigger
language plpgsql security definer set search_path='' as $$
declare r public.purchase_reservations%rowtype; quote jsonb; ledger_id uuid; gross bigint; item bigint; fee bigint; payer text;
begin
 if new.status<>'complete' or new.verified_at is null then return new; end if;
 select * into r from public.purchase_reservations where id=new.reservation_id;
 select value_quote into quote from public.listings where id=r.listing_id;
 gross:=round(new.amount*100); item:=round(r.amount*100); fee:=round(item*0.1);
 payer:=case when quote->>'sellerFundsShipping'='false' then 'buyer' else 'seller' end;
 -- Existing transactions are item-only. Buyer-funded courier must be reconciled before checkout can use it.
 insert into public.sandbox_order_ledger(reservation_id,payment_attempt_id,buyer_id,seller_id,gross_cents,item_cents,fee_cents,delivery_payer)
 values(r.id,new.id,r.buyer_id,r.seller_id,gross,item,fee,payer)
 on conflict(reservation_id) do nothing returning id into ledger_id;
 if ledger_id is not null then
  insert into public.sandbox_ledger_events(ledger_id,action,details) values(ledger_id,'payment_verified',jsonb_build_object('gross_cents',gross));
 end if;
 return new;
end; $$;
revoke all on function private.capture_sandbox_ledger() from public,anon,authenticated;
create trigger capture_sandbox_order_ledger after insert or update of status on public.payfast_sandbox_attempts for each row execute function private.capture_sandbox_ledger();

-- Explicit auth checks live inside the privileged private function; direct table writes remain forbidden.
create or replace function private.act_on_sandbox_ledger(target_ledger_id uuid,requested_action text,cost_cents bigint,note text)
returns text language plpgsql security definer set search_path='' as $$
declare l public.sandbox_order_ledger%rowtype; actor uuid:=auth.uid(); staff_role text; finance boolean; ops boolean; next_status text; due bigint;
begin
 if actor is null then raise exception 'Authentication required'; end if;
 select role into staff_role from public.admin_users where id=actor;
 finance:=coalesce(staff_role in ('super_admin','finance'),false); ops:=coalesce(staff_role in ('super_admin','operations'),false);
 select * into l from public.sandbox_order_ledger where id=target_ledger_id for update;
 if not found or not (actor=l.buyer_id or actor=l.seller_id or finance or ops) then raise exception 'Order unavailable'; end if;
 if l.status in ('paid_test','refunded_test') then
  if (requested_action='payout' and finance and l.status='paid_test') or (requested_action='refund' and finance and l.status='refunded_test') then return l.status; end if;
  raise exception 'Ledger already settled';
 end if;
 next_status:=l.status;
 if requested_action='courier_cost' then
  if not finance and not ops then raise exception 'Operations or Finance required'; end if;
  if l.status<>'pending' or l.courier_cents is not null or cost_cents is null or cost_cents<0 then raise exception 'Courier cost cannot be changed'; end if;
  if l.delivery_payer='buyer' and l.gross_cents<>l.item_cents+cost_cents then raise exception 'Buyer total does not include delivery'; end if;
  due:=l.gross_cents-l.fee_cents-cost_cents;
  if due<0 then raise exception 'Courier cost exceeds available funds'; end if;
  update public.sandbox_order_ledger set courier_cents=cost_cents,seller_cents=due where id=l.id;
 elsif requested_action='processor_cost' then
  if not finance then raise exception 'Finance required'; end if;
  if l.processor_cents is not null or cost_cents is null or cost_cents<0 then raise exception 'Processor cost cannot be changed'; end if;
  update public.sandbox_order_ledger set processor_cents=cost_cents where id=l.id;
 elsif requested_action='dispatch' then
  if actor<>l.seller_id and not ops then raise exception 'Seller required'; end if;
  if l.status='in_transit' then return l.status; end if;
  if l.status<>'pending' or l.courier_cents is null then raise exception 'Confirm courier cost first'; end if;
  next_status:='in_transit';
 elsif requested_action='deliver' then
  if not ops then raise exception 'Operations required'; end if;
  if l.status='delivered' then return l.status; end if;
  if l.status<>'in_transit' then raise exception 'Dispatch required'; end if;
  next_status:='delivered';
  update public.sandbox_order_ledger set delivered_at=now(),inspection_ends_at=now()+interval '48 hours' where id=l.id;
 elsif requested_action='accept' then
  if actor<>l.buyer_id then raise exception 'Buyer required'; end if;
  if l.status<>'delivered' then raise exception 'Delivery required'; end if;
  if l.buyer_accepted_at is not null then return l.status; end if;
  update public.sandbox_order_ledger set buyer_accepted_at=now() where id=l.id;
 elsif requested_action='dispute' then
  if actor<>l.buyer_id and actor<>l.seller_id then raise exception 'Order participant required'; end if;
  if l.status='disputed' then return l.status; end if;
  if note is null or length(trim(note))<5 or length(note)>1000 then raise exception 'Explain the problem'; end if;
  next_status:='disputed';
  update public.sandbox_order_ledger set dispute_reason=trim(note) where id=l.id;
 elsif requested_action='payout' then
  if not finance then raise exception 'Finance required'; end if;
  if l.status<>'delivered' or (l.buyer_accepted_at is null and (l.inspection_ends_at is null or l.inspection_ends_at>now())) or l.seller_cents is null or l.processor_cents is null then raise exception 'Payout is not ready'; end if;
  next_status:='paid_test';
  update public.sandbox_order_ledger set payout_reference='SIMULATED-'||l.id::text where id=l.id;
 elsif requested_action='refund' then
  if not finance then raise exception 'Finance required'; end if;
  next_status:='refunded_test';
 else raise exception 'Unknown action'; end if;
 update public.sandbox_order_ledger set status=next_status,updated_at=now() where id=l.id;
 insert into public.sandbox_ledger_events(ledger_id,actor_id,action,details) values(l.id,actor,requested_action,jsonb_strip_nulls(jsonb_build_object('cost_cents',cost_cents,'note',note,'status',next_status)));
 insert into public.notifications(recipient_id,notification_type,title,body,entity_type,entity_id,data)
 select recipient,'money.sandbox_'||requested_action,'Test order update',case requested_action
 when 'courier_cost' then 'Test courier cost confirmed. View your order breakdown.'
 when 'processor_cost' then 'Test payment-processing cost recorded. The seller payout is unchanged.'
 when 'dispatch' then 'Simulated parcel dispatched. No actual courier was booked.'
 when 'deliver' then 'Simulated delivery recorded. Buyer: confirm receipt or report a problem within 48 hours.'
 when 'accept' then 'Buyer confirmed the test delivery. Finance can review the simulated payout.'
 when 'dispute' then 'A problem was reported. Seller payout is paused.'
 when 'payout' then 'Simulated seller payout recorded. No bank transfer was made.'
 when 'refund' then 'Simulated buyer refund recorded. No actual refund was issued.' end,
 'purchase_reservation',l.reservation_id,jsonb_build_object('sandbox',true)
 from (values(l.buyer_id),(l.seller_id)) parties(recipient);
 return next_status;
end; $$;
revoke all on function private.act_on_sandbox_ledger(uuid,text,bigint,text) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.act_on_sandbox_ledger(uuid,text,bigint,text) to authenticated;
create function public.act_on_sandbox_ledger(target_ledger_id uuid,requested_action text,cost_cents bigint default null,note text default null)
returns text language sql security invoker set search_path='' as $$ select private.act_on_sandbox_ledger(target_ledger_id,requested_action,cost_cents,note); $$;
revoke all on function public.act_on_sandbox_ledger(uuid,text,bigint,text) from public,anon;
grant execute on function public.act_on_sandbox_ledger(uuid,text,bigint,text) to authenticated;

-- Backfill verified tests without touching order status or ownership.
update public.payfast_sandbox_attempts set status=status where status='complete' and verified_at is not null;
