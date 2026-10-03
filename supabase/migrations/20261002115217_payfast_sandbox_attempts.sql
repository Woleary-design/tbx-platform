-- Sandbox accounting is deliberately separate from sale fulfilment.
begin;
create table public.payfast_sandbox_attempts (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references public.purchase_reservations(id),
  buyer_id uuid not null references auth.users(id),
  amount numeric(12,2) not null check (amount >= 5),
  currency text not null default 'ZAR' check (currency = 'ZAR'),
  status text not null default 'pending' check (status in ('pending','complete','cancelled')),
  payfast_payment_id text unique,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);
alter table public.payfast_sandbox_attempts enable row level security;
revoke all on public.payfast_sandbox_attempts from anon, authenticated;
grant select on public.payfast_sandbox_attempts to authenticated;
grant all on public.payfast_sandbox_attempts to service_role;
create policy "Buyers read their sandbox attempts" on public.payfast_sandbox_attempts
  for select to authenticated using ((select auth.uid()) = buyer_id);

create function public.start_payfast_sandbox_attempt(target_reservation_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  reservation public.purchase_reservations%rowtype;
  attempt public.payfast_sandbox_attempts%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into reservation from public.purchase_reservations where id=target_reservation_id for update;
  if not found or reservation.buyer_id <> auth.uid() then raise exception 'Buyer required'; end if;
  if reservation.status <> 'awaiting_payment' or reservation.payment_deadline is null
     or reservation.payment_deadline <= now() then raise exception 'Payment window unavailable'; end if;
  if reservation.currency <> 'ZAR' or reservation.amount < 5 then raise exception 'Unsupported amount or currency'; end if;
  insert into public.payfast_sandbox_attempts(reservation_id,buyer_id,amount,currency)
    values (reservation.id,reservation.buyer_id,reservation.amount,reservation.currency)
    on conflict (reservation_id) do nothing;
  select * into attempt from public.payfast_sandbox_attempts where reservation_id=reservation.id;
  if attempt.status <> 'pending' then raise exception 'Sandbox test already finished'; end if;
  return to_jsonb(attempt);
end;
$$;
revoke all on function public.start_payfast_sandbox_attempt(uuid) from public, anon;
grant execute on function public.start_payfast_sandbox_attempt(uuid) to authenticated;

create function public.record_payfast_sandbox_notification(
  target_attempt_id uuid, provider_payment_id text, received_amount numeric, received_status text
) returns text language plpgsql security invoker set search_path = '' as $$
declare attempt public.payfast_sandbox_attempts%rowtype;
begin
  select * into attempt from public.payfast_sandbox_attempts where id=target_attempt_id for update;
  if not found then raise exception 'Unknown payment attempt'; end if;
  if received_amount is null or received_amount <> attempt.amount then raise exception 'Amount mismatch'; end if;
  if received_status is null or received_status not in ('COMPLETE','CANCELLED') then raise exception 'Invalid payment status'; end if;
  if provider_payment_id is null or provider_payment_id !~ '^[0-9]+$' then raise exception 'Invalid provider ID'; end if;
  if attempt.payfast_payment_id is not null and attempt.payfast_payment_id <> provider_payment_id then raise exception 'Conflicting provider ID'; end if;
  -- Repeated notifications cannot duplicate a payment or downgrade COMPLETE.
  if attempt.status = 'complete' then return 'complete'; end if;
  update public.payfast_sandbox_attempts set
    status = case when received_status='COMPLETE' then 'complete' else 'cancelled' end,
    payfast_payment_id = provider_payment_id, verified_at=now()
    where id=target_attempt_id;
  return case when received_status='COMPLETE' then 'complete' else 'cancelled' end;
end;
$$;
revoke all on function public.record_payfast_sandbox_notification(uuid,text,numeric,text) from public, anon, authenticated;
grant execute on function public.record_payfast_sandbox_notification(uuid,text,numeric,text) to service_role;
commit;
