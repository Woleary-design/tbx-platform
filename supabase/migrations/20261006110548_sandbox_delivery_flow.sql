-- Sandbox only: no courier calls, real PINs, order fulfilment or bank transfers.
create table public.sandbox_deliveries (
 reservation_id uuid primary key references public.purchase_reservations(id),
 method text not null check(method in ('locker','door')),
 destination text not null check(length(trim(destination)) between 3 and 200),
 origin text check(length(trim(origin)) between 3 and 200),
 parcel jsonb not null,
 status text not null default 'selected' check(status in ('selected','booked','in_transit','awaiting_collection','received')),
 booking_reference text, dropoff_deadline timestamptz, collection_deadline timestamptz,
 received_at timestamptz, updated_at timestamptz not null default now()
);
alter table public.sandbox_deliveries enable row level security;
revoke all on public.sandbox_deliveries from anon,authenticated;
grant select on public.sandbox_deliveries to authenticated;
grant all on public.sandbox_deliveries to service_role;
create policy sandbox_delivery_read on public.sandbox_deliveries for select to authenticated using (
 exists(select 1 from public.purchase_reservations r where r.id=reservation_id and (r.buyer_id=(select auth.uid()) or r.seller_id=(select auth.uid())))
 or exists(select 1 from public.admin_users where id=(select auth.uid()) and role in ('super_admin','operations','finance','support'))
);

create function private.act_on_sandbox_delivery(target_reservation_id uuid, requested_action text, details jsonb)
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
  if d.reservation_id is not null and d.method=method and d.destination=dest and d.parcel=parcel then return d.status; end if;
  insert into public.sandbox_deliveries(reservation_id,method,destination,parcel) values(r.id,method,dest,parcel)
   on conflict(reservation_id) do update set method=excluded.method,destination=excluded.destination,parcel=excluded.parcel,updated_at=now();
  next_status:='selected'; message:='Test delivery selected. No live quote or booking exists. Seller: check the packed dimensions before preparing delivery.';
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
revoke all on function private.act_on_sandbox_delivery(uuid,text,jsonb) from public,anon;
grant execute on function private.act_on_sandbox_delivery(uuid,text,jsonb) to authenticated;
create function public.act_on_sandbox_delivery(target_reservation_id uuid,requested_action text,details jsonb default '{}')
returns text language sql security invoker set search_path='' as $$ select private.act_on_sandbox_delivery(target_reservation_id,requested_action,details); $$;
revoke all on function public.act_on_sandbox_delivery(uuid,text,jsonb) from public,anon;
grant execute on function public.act_on_sandbox_delivery(uuid,text,jsonb) to authenticated;

-- The older ledger endpoints must not skip locker collection or booking for new delivery records.
create function private.guard_sandbox_delivery_progress() returns trigger
language plpgsql security definer set search_path='' as $$
declare d public.sandbox_deliveries%rowtype;
begin
 select * into d from public.sandbox_deliveries where reservation_id=new.reservation_id;
 if d.reservation_id is null then return new; end if;
 if old.status<>new.status and new.status='in_transit' and d.status<>'in_transit' then raise exception 'Use delivery handover'; end if;
 if old.status<>new.status and new.status='delivered' and d.status<>'received' then raise exception 'Actual receipt required before inspection'; end if;
 return new;
end; $$;
revoke all on function private.guard_sandbox_delivery_progress() from public,anon,authenticated;
create trigger guard_sandbox_delivery_progress before update on public.sandbox_order_ledger for each row execute function private.guard_sandbox_delivery_progress();
