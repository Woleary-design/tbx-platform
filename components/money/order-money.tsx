'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { moneyCents, payoutLabel, payoutReady, type SandboxLedger } from '@/lib/money/ledger';

type Props = { ledger: SandboxLedger; viewer: 'buyer' | 'seller' | 'finance' | 'operations'; canOperate?: boolean; deliveryManaged?: boolean };
export function OrderMoney({ ledger, viewer, canOperate = false, deliveryManaged = false }: Props) {
 const router = useRouter();
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState('');
 const [courierCost, setCourierCost] = useState('');
 const [processorCost, setProcessorCost] = useState('');
 const [feeConfirmed, setFeeConfirmed] = useState(false);
 const [reason, setReason] = useState('');
 const staff = viewer === 'finance' || viewer === 'operations';
 const settled = ['paid_test','refunded_test'].includes(ledger.status);
 async function act(action: string, withCost = false) {
  if (busy) return;
  const cost = action === 'processor_cost' ? processorCost : courierCost;
  if (action === 'processor_cost' && Number(cost) * 100 >= ledger.fee_cents && !feeConfirmed) { setError('Confirm the payment fee: it uses all or more of TBX’s commission.'); return; }
  const costCents = withCost ? Math.round(Number(cost) * 100) : undefined;
  if (withCost && (!/^\d+(\.\d{1,2})?$/.test(cost) || !Number.isSafeInteger(costCents))) { setError('Enter a rand amount, for example 100.00.'); return; }
  setBusy(true); setError('');
  try {
   const response = await fetch('/api/money/sandbox', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ledgerId: ledger.id, action, costCents, note: action === 'dispute' ? reason : undefined }) });
   const payload = await response.json();
   if (!response.ok) throw new Error(payload.error || 'Action unavailable.');
   window.dispatchEvent(new Event("tbx-notifications-read"));
   router.refresh();
  } catch (e) { setError(e instanceof Error ? e.message : 'Try again.'); }
  finally { setBusy(false); }
 }
 const button = (action: string, label: string, withCost = false) => <button type="button" disabled={busy} onClick={() => void act(action, withCost)} className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50">{label}</button>;
 const rows: [string, string][] = [
  ['Buyer test payment', moneyCents(ledger.gross_cents)],
  ['Item price', moneyCents(ledger.item_cents)],
  [`Delivery (${ledger.delivery_payer} pays)`, ledger.courier_cents === null ? 'Cost pending' : moneyCents(ledger.courier_cents)],
  ['TBX fee (10% of item)', moneyCents(ledger.fee_cents)],
  ['Seller receives', ledger.seller_cents === null ? 'Waiting for courier cost' : moneyCents(ledger.seller_cents)],
 ];
 if (viewer === 'finance') rows.push(['Payment fee covered by TBX', ledger.processor_cents === null ? 'Cost pending' : moneyCents(ledger.processor_cents)], ['TBX after payment fee', ledger.processor_cents === null ? 'Cost pending' : moneyCents(ledger.fee_cents-ledger.processor_cents)]);
 return <section className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 text-slate-950">
  <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Sandbox · no money moves</p>
  <h2 className="mt-2 text-xl font-semibold">{viewer === 'buyer' ? 'Your payment' : 'Seller payout'}</h2>
  <p className="mt-2 text-sm text-slate-600">{viewer === 'buyer' ? ledger.status === 'refunded_test' ? 'Test refund recorded' : 'Test payment verified' : payoutLabel(ledger)}</p>
  <dl className="mt-5 space-y-3">{rows.map(([label,value]) => <div key={label} className="flex justify-between gap-4 text-sm"><dt className="text-slate-600">{label}</dt><dd className="text-right font-semibold">{value}</dd></div>)}</dl>
  {ledger.delivery_payer === 'seller' ? <p className="mt-4 text-xs text-slate-500">This earlier order keeps seller-funded delivery. New listings use buyer-paid delivery.</p> : null}
  {ledger.inspection_ends_at && ledger.status === 'delivered' && !ledger.buyer_accepted_at ? <p className="mt-4 text-sm text-slate-600">Inspection ends {new Date(ledger.inspection_ends_at).toLocaleString('en-ZA',{ dateStyle:'medium', timeStyle:'short', timeZone:'Africa/Johannesburg' })} SAST. Confirm receipt or report a problem.</p> : null}
  <p className="mt-4 text-sm text-slate-600">These controls simulate delivery, payout and refunds. Do not dispatch the actual item. No courier booking or bank transfer occurs.</p>
  {!settled ? <div className="mt-5 space-y-4">
   {staff && ledger.courier_cents === null && ledger.status === 'pending' ? <div><label className="block text-sm font-medium" htmlFor={`courier-cost-${ledger.id}`}>Test courier cost (rand)</label><input id={`courier-cost-${ledger.id}`} inputMode="decimal" value={courierCost} onChange={e=>setCourierCost(e.target.value)} placeholder="69.00" className="mt-2 w-full rounded-xl border border-slate-300 p-3"/><div className="mt-3">{button('courier_cost','Confirm test courier cost',true)}</div></div> : null}
   {viewer === 'finance' && ledger.processor_cents === null ? <div><label className="block text-sm font-medium" htmlFor={`processor-cost-${ledger.id}`}>Payment-processing fee charged by the provider (rand)</label><p className="mt-1 text-xs text-slate-500">Enter only the provider’s fee, not the seller payout. This cost is covered by TBX.</p><input id={`processor-cost-${ledger.id}`} inputMode="decimal" value={processorCost} onChange={e=>{setProcessorCost(e.target.value);setFeeConfirmed(false);}} placeholder="Enter verified test fee" className="mt-2 w-full rounded-xl border border-slate-300 p-3"/>{processorCost && Number(processorCost)*100 >= ledger.fee_cents ? <label className="mt-3 flex items-start gap-2 text-sm text-amber-700"><input type="checkbox" checked={feeConfirmed} onChange={e=>setFeeConfirmed(e.target.checked)}/>This fee uses all or more of TBX’s {moneyCents(ledger.fee_cents)} commission. I have checked the amount.</label> : null}<div className="mt-3">{button('processor_cost','Record test payment-processing fee',true)}</div></div> : null}
   <div className="flex flex-wrap gap-3">
    {!deliveryManaged && (viewer === 'seller' || viewer === 'operations' || canOperate) && ledger.status === 'pending' && ledger.courier_cents !== null ? button('dispatch','Simulate dispatch') : null}
    {!deliveryManaged && (viewer === 'operations' || canOperate) && ledger.status === 'in_transit' ? button('deliver','Simulate delivery') : null}
    {viewer === 'buyer' && ledger.status === 'delivered' && !ledger.buyer_accepted_at ? button('accept','Confirm test receipt') : null}
    {viewer === 'finance' && payoutReady(ledger) ? button('payout','Simulate seller payout') : null}
    {viewer === 'finance' ? button('refund','Simulate full refund') : null}
   </div>
   {(viewer === 'buyer' || viewer === 'seller') && ledger.status !== 'disputed' ? <div><label className="block text-sm font-medium" htmlFor={`problem-${ledger.id}`}>Report a problem</label><textarea id={`problem-${ledger.id}`} value={reason} onChange={e=>setReason(e.target.value)} maxLength={1000} placeholder="Explain what went wrong" className="mt-2 w-full rounded-xl border border-slate-300 p-3"/>{reason.trim().length >= 5 ? button('dispute','Report problem and pause payout') : null}</div> : null}
  </div> : null}
  {ledger.payout_reference ? <p className="mt-4 break-all text-xs text-slate-500">Test reference: {ledger.payout_reference}</p> : null}
  {error ? <p role="alert" className="mt-4 text-sm text-red-700">{error}</p> : null}
 </section>;
}
