-- Isolated sandbox only. Sample locker prices; no live bookings or bank movements.
alter table public.sandbox_deliveries add column quote_cents bigint check(quote_cents in (4900,5900,6900,8900,11900)), add column quote_size text;

create function private.price_sandbox_locker() returns trigger
language plpgsql security definer set search_path='' as $$
declare r public.purchase_reservations%rowtype; rate record; sides numeric[];
begin
 select * into strict r from public.purchase_reservations where id=new.reservation_id for update;
 if tg_op='UPDATE' and new.method=old.method and new.destination=old.destination and new.parcel=old.parcel and old.quote_cents is not null then
  new.quote_cents:=old.quote_cents; new.quote_size:=old.quote_size; return new;
 end if;
 if exists(select 1 from public.payfast_sandbox_attempts where reservation_id=r.id) then raise exception 'Checkout started; delivery details are locked'; end if;
 new.quote_cents:=null; new.quote_size:=null;
 if new.method='locker' then
  select array_agg(v order by v) into sides from unnest(array[(new.parcel->>'lengthCm')::numeric,(new.parcel->>'widthCm')::numeric,(new.parcel->>'heightCm')::numeric]) v;
  for rate in select * from (values ('XS',8,17,60,2,4900),('Small',8,41,60,5,5900),('Medium',19,41,60,10,6900),('Large',41,41,60,15,8900),('XL',41,60,69,20,11900)) rates(size,a,b,c,kg,cents) loop
   if sides[1]>0 and sides[1]<=rate.a and sides[2]<=rate.b and sides[3]<=rate.c and (new.parcel->>'weightKg')::numeric>0 and (new.parcel->>'weightKg')::numeric<=rate.kg then
    new.quote_cents:=rate.cents; new.quote_size:=rate.size; exit;
   end if;
  end loop;
  if new.quote_cents is null then raise exception 'Parcel exceeds sample locker limits'; end if;
 end if;
 return new;
end; $$;
revoke all on function private.price_sandbox_locker() from public,anon,authenticated;
create trigger price_sandbox_locker before insert or update of method,destination,parcel on public.sandbox_deliveries for each row execute function private.price_sandbox_locker();

create function private.open_sandbox_payment_window() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.listings l join public.purchase_reservations r on r.listing_id=l.id where r.id=new.reservation_id and l.value_quote->>'sellerFundsShipping'='false')
 and not exists(select 1 from public.payfast_sandbox_attempts where reservation_id=new.reservation_id) then
  if new.quote_cents is null then
   update public.purchase_reservations set payment_deadline=null where id=new.reservation_id and status='awaiting_payment';
  else
   update public.purchase_reservations set payment_deadline=now()+interval '30 minutes',updated_at=now() where id=new.reservation_id and status='awaiting_payment' and payment_deadline is null;
  end if;
 end if;
 return new;
end; $$;
revoke all on function private.open_sandbox_payment_window() from public,anon,authenticated;
create trigger open_sandbox_payment_window after insert or update of method,destination,parcel on public.sandbox_deliveries for each row execute function private.open_sandbox_payment_window();

create function private.guard_sandbox_payment_window() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.status='awaiting_payment' and (old.status is distinct from new.status or new.payment_deadline is distinct from old.payment_deadline)
 and exists(select 1 from public.listings where id=new.listing_id and value_quote->>'sellerFundsShipping'='false')
 and not exists(select 1 from public.sandbox_deliveries where reservation_id=new.id and quote_cents is not null)
 and not exists(select 1 from public.payfast_sandbox_attempts where reservation_id=new.id) then new.payment_deadline:=null; end if;
 return new;
end; $$;
revoke all on function private.guard_sandbox_payment_window() from public,anon,authenticated;
create trigger guard_sandbox_payment_window before update on public.purchase_reservations for each row execute function private.guard_sandbox_payment_window();

create function private.correct_sandbox_payment_notice() returns trigger
language plpgsql security definer set search_path='' as $$
declare r public.purchase_reservations%rowtype;
begin
 if new.notification_type='purchase.seller_confirmed' then
  select * into r from public.purchase_reservations where id=new.entity_id;
  if r.payment_deadline is null then
   new.body:='Seller confirmed availability. Confirm a sample delivery price on your order before test payment.';
   new.data:=coalesce(new.data,'{}'::jsonb)-'paymentDeadline';
  end if;
 end if;
 return new;
end; $$;
revoke all on function private.correct_sandbox_payment_notice() from public,anon,authenticated;
create trigger correct_sandbox_payment_notice before insert on public.notifications for each row execute function private.correct_sandbox_payment_notice();

-- Existing unpaid orders blocked by missing prices can continue; do not reopen cancelled orders.
update public.purchase_reservations r set payment_deadline=null
where r.status='awaiting_payment' and exists(select 1 from public.listings where id=r.listing_id and value_quote->>'sellerFundsShipping'='false')
and not exists(select 1 from public.payfast_sandbox_attempts where reservation_id=r.id);
update public.notifications n set body='Seller confirmed availability. Confirm a sample delivery price on your order before test payment.',data=coalesce(n.data,'{}'::jsonb)-'paymentDeadline'
where notification_type='purchase.seller_confirmed' and exists(select 1 from public.purchase_reservations r where r.id=n.entity_id and r.status='awaiting_payment' and r.payment_deadline is null);
create or replace function private.act_on_sandbox_delivery(target_reservation_id uuid, requested_action text, details jsonb)
returns text language plpgsql security definer set search_path='' as $$
declare r public.purchase_reservations%rowtype; l public.sandbox_order_ledger%rowtype; d public.sandbox_deliveries%rowtype;
 actor uuid:=auth.uid(); staff_role text; ops boolean; method text; dest text; parcel jsonb; n numeric; next_status text; message text;
begin
 if actor is null then raise exception 'Authentication required'; end if;
 select role into staff_role from public.admin_users where id=actor;
 ops:=coalesce(staff_role in ('super_admin','operations'),false);
 select * into r from public.purchase_reservations where id=target_reservation_id for update;
 if not found or not(actor=r.buyer_id or actor=r.seller_id or ops) then raise exception 'Order unavailable'; end if;
 select * into l from public.sandbox_order_ledger where reservation_id=r.id for update;
 select * into d from public.sandbox_deliveries where reservation_id=r.id for update;
 if l.id is not null and l.status<>'pending' and requested_action in ('select','ready') then raise exception 'Delivery cannot be changed'; end if;
 if l.status in ('disputed','paid_test','refunded_test') then raise exception 'Order paused or settled'; end if;
 if requested_action='select' then
  if actor<>r.buyer_id then raise exception 'Buyer required'; end if;
  if exists(select 1 from public.payfast_sandbox_attempts where reservation_id=r.id) then raise exception 'Checkout started; delivery details are locked'; end if;
  if r.status not in ('awaiting_seller','awaiting_payment') or (d.reservation_id is not null and d.status<>'selected') then raise exception 'Delivery cannot be changed'; end if;
  method:=details->>'method'; dest:=trim(details->>'destination'); parcel:=details->'parcel';
  if method not in ('locker','door') or method is null or dest is null or length(dest) not between 3 and 200 or jsonb_typeof(parcel)<>'object' or parcel is null then raise exception 'Choose delivery and packed dimensions'; end if;
  foreach dest in array array['lengthCm','widthCm','heightCm','weightKg'] loop
   if jsonb_typeof(parcel->dest) is distinct from 'number' then raise exception 'Invalid packed dimensions'; end if;
   n:=(parcel->>dest)::numeric;
   if n<=0 or n>300 or (dest='weightKg' and n>100) then raise exception 'Invalid packed dimensions'; end if;
  end loop;
  if method='locker' and ((parcel->>'weightKg')::numeric>20 or
   not exists(select 1 from (values (60,41,69),(60,69,41),(41,60,69),(41,69,60),(69,60,41),(69,41,60)) as fit(a,b,c)
    where (parcel->>'lengthCm')::numeric<=a and (parcel->>'widthCm')::numeric<=b and (parcel->>'heightCm')::numeric<=c)) then raise exception 'Parcel too large for a locker'; end if;
  dest:=trim(details->>'destination');
  if d.reservation_id is not null and d.method=method and d.destination=dest and d.parcel=parcel and (d.quote_cents is not null or method='door') then return d.status; end if;
  insert into public.sandbox_deliveries(reservation_id,method,destination,parcel) values(r.id,method,dest,parcel)
   on conflict(reservation_id) do update set method=excluded.method,destination=excluded.destination,parcel=excluded.parcel,updated_at=now();
  next_status:='selected'; message:=case when method='locker' then 'Sample locker price confirmed. View the item and delivery total on your order. Test payment is available after seller confirmation.' else 'Test door delivery selected. A separate delivery quote is still required before payment.' end;
 elsif requested_action='ready' then
  if actor<>r.seller_id and not ops then raise exception 'Seller required'; end if;
  if l.id is null or l.status<>'pending' or l.courier_cents is null then raise exception 'Verified test payment and courier cost required'; end if;
  if d.status='booked' and d.dropoff_deadline>now() then return d.status; end if;
  if d.reservation_id is null or d.status not in ('selected','booked') then raise exception 'Choose delivery first'; end if;
  dest:=trim(details->>'origin');
  if dest is null or length(dest) not between 3 and 200 then raise exception 'Enter your test drop-off or collection location'; end if;
  next_status:='booked';
  update public.sandbox_deliveries set origin=dest,status=next_status,booking_reference='SIM-DELIVERY-'||gen_random_uuid()::text,
   dropoff_deadline=now()+interval '36 hours',updated_at=now() where reservation_id=r.id;
  message:='Test booking prepared. Seller: simulate handover before the deadline. The SIM reference cannot open a locker. Do not send a real parcel.';
 elsif requested_action='dispatch' then
  if not ops then raise exception 'Operations required to simulate courier events'; end if;
  if d.status='in_transit' then return d.status; end if;
  if d.status<>'booked' or d.status is null or d.dropoff_deadline<=now() then raise exception 'A current test booking is required'; end if;
  next_status:='in_transit';
  update public.sandbox_deliveries set status=next_status,updated_at=now() where reservation_id=r.id;
  perform private.act_on_sandbox_ledger(l.id,'dispatch',null,null);
  message:='Test parcel in transit. Buyer: wait for arrival. No real courier was booked.';
 elsif requested_action='arrive' then
  if not ops then raise exception 'Operations required'; end if;
  if d.status='awaiting_collection' then return d.status; end if;
  if d.method<>'locker' or d.status<>'in_transit' or d.status is null then raise exception 'Locker shipment in transit required'; end if;
  next_status:='awaiting_collection';
  update public.sandbox_deliveries set status=next_status,collection_deadline=now()+interval '36 hours',updated_at=now() where reservation_id=r.id;
  message:='Test parcel ready for locker collection. Buyer: view the collection deadline. Inspection has not started. No real collection PIN exists.';
 elsif requested_action='receive' then
  if not ops then raise exception 'Operations required'; end if;
  if d.status='received' then return d.status; end if;
  if d.reservation_id is null or not((d.method='locker' and d.status='awaiting_collection' and d.collection_deadline>now()) or (d.method='door' and d.status='in_transit')) then raise exception 'Collection or door delivery is not ready; review expired collections'; end if;
  next_status:='received';
  update public.sandbox_deliveries set status=next_status,received_at=now(),updated_at=now() where reservation_id=r.id;
  perform private.act_on_sandbox_ledger(l.id,'deliver',null,null);
  message:='Test parcel received. Buyer: confirm receipt or report a problem. The 48-hour inspection window has started.';
 else raise exception 'Unknown delivery action'; end if;
 insert into public.notifications(recipient_id,notification_type,title,body,entity_type,entity_id,data)
 select recipient,'delivery.sandbox_'||requested_action,'Test delivery update',message,'purchase_reservation',r.id,jsonb_build_object('sandbox',true)
 from (values(r.buyer_id),(r.seller_id)) parties(recipient);
 if l.id is not null then insert into public.sandbox_ledger_events(ledger_id,actor_id,action,details)
 values(l.id,actor,'delivery_'||requested_action,jsonb_build_object('status',next_status)); end if;
 return next_status;
end; $$;
create or replace function public.start_payfast_sandbox_attempt(target_reservation_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  reservation public.purchase_reservations%rowtype;
  attempt public.payfast_sandbox_attempts%rowtype;
  total numeric; delivery public.sandbox_deliveries%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into reservation from public.purchase_reservations where id=target_reservation_id for update;
  if not found or reservation.buyer_id <> auth.uid() then raise exception 'Buyer required'; end if;
  if reservation.status <> 'awaiting_payment' or reservation.payment_deadline is null
     or reservation.payment_deadline <= now() then raise exception 'Payment window unavailable'; end if;
  if reservation.currency <> 'ZAR' or reservation.amount < 5 then raise exception 'Unsupported amount or currency'; end if;
  total:=reservation.amount;
  if exists(select 1 from public.listings where id=reservation.listing_id and value_quote->>'sellerFundsShipping'='false') then
   select * into delivery from public.sandbox_deliveries where reservation_id=reservation.id;
   if delivery.method is distinct from 'locker' or delivery.quote_cents is null then raise exception 'Confirm sample delivery price first'; end if;
   total:=total+delivery.quote_cents::numeric/100;
  end if;
  insert into public.payfast_sandbox_attempts(reservation_id,buyer_id,amount,currency)
    values (reservation.id,reservation.buyer_id,total,reservation.currency)
    on conflict (reservation_id) do nothing;
  select * into attempt from public.payfast_sandbox_attempts where reservation_id=reservation.id;
  if attempt.amount<>total then raise exception 'Checkout amount changed'; end if;
  if attempt.status <> 'pending' then raise exception 'Sandbox test already finished'; end if;
  return to_jsonb(attempt);
end;
$$;
create or replace function private.capture_sandbox_ledger() returns trigger
language plpgsql security definer set search_path='' as $$
declare r public.purchase_reservations%rowtype; quote jsonb; ledger_id uuid; gross bigint; item bigint; fee bigint; payer text; courier bigint;
begin
 if new.status<>'complete' or new.verified_at is null then return new; end if;
 select * into r from public.purchase_reservations where id=new.reservation_id;
 select value_quote into quote from public.listings where id=r.listing_id;
 gross:=round(new.amount*100); item:=round(r.amount*100); fee:=round(item*0.1);
 payer:=case when quote->>'sellerFundsShipping'='false' then 'buyer' else 'seller' end;
 if payer='buyer' then
  select quote_cents into courier from public.sandbox_deliveries where reservation_id=r.id and method='locker';
  if courier is null or gross<>item+courier then raise exception 'Verified amount does not match confirmed item and delivery total'; end if;
 end if;
 insert into public.sandbox_order_ledger(reservation_id,payment_attempt_id,buyer_id,seller_id,gross_cents,item_cents,fee_cents,delivery_payer,courier_cents,seller_cents)
 values(r.id,new.id,r.buyer_id,r.seller_id,gross,item,fee,payer,courier,case when courier is not null then item-fee else null end)
 on conflict(reservation_id) do nothing returning id into ledger_id;
 if ledger_id is not null then
  insert into public.sandbox_ledger_events(ledger_id,action,details) values(ledger_id,'payment_verified',jsonb_build_object('gross_cents',gross));
 end if;
 return new;
end; $$;
