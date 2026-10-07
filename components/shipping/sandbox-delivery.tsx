'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deliveryStage, lockerFits, sandboxLockerQuote, type SandboxDelivery } from '@/lib/shipping/delivery';
import type { SandboxLedger } from '@/lib/money/ledger';

type Props = { reservationId:string; delivery:SandboxDelivery|null; ledger:SandboxLedger|null; viewer:'buyer'|'seller'|'staff'; canOperate?:boolean; canSelect?:boolean; checkoutStarted?:boolean };
export function SandboxDeliveryPanel({reservationId,delivery,ledger,viewer,canOperate=false,canSelect=false,checkoutStarted=false}:Props) {
 const router=useRouter(); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
 const [method,setMethod]=useState<'locker'|'door'>(delivery?.method??'locker');
 const [destination,setDestination]=useState(delivery?.destination??''); const [origin,setOrigin]=useState(delivery?.origin??'');
 const [parcel,setParcel]=useState(delivery?.parcel??{lengthCm:30,widthCm:20,heightCm:10,weightKg:1});
 const sampleQuote=method==='locker'?sandboxLockerQuote(parcel):null;
 const active = !ledger || !['disputed','paid_test','refunded_test'].includes(ledger.status);
 async function act(action:string,details:Record<string,unknown>={}) {
  if(busy)return; setBusy(true);setError('');
  try { const response=await fetch('/api/shipping/sandbox',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reservationId,action,details})});
   const result=await response.json();if(!response.ok)throw new Error(result.error);window.dispatchEvent(new Event('tbx-notifications-read'));router.refresh();
  }catch(e){setError(e instanceof Error?e.message:'Try again.');}finally{setBusy(false);}
 }
 const button=(action:string,label:string,details:Record<string,unknown>={})=><button type="button" disabled={busy} onClick={()=>void act(action,details)} className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50">{label}</button>;
 const date=(value:string)=>`${new Date(value).toLocaleString('en-ZA',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Johannesburg'})} SAST`;
 const inputClass='mt-2 w-full rounded-xl border border-slate-300 p-3';
 const bookingExpired=delivery?.status==='booked'&&Boolean(delivery.dropoff_deadline&&Date.parse(delivery.dropoff_deadline)<=Date.now());
 const collectionExpired=delivery?.status==='awaiting_collection'&&Boolean(delivery.collection_deadline&&Date.parse(delivery.collection_deadline)<=Date.now());
 return <section className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 text-slate-950">
  <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Delivery simulation</p>
  <h2 className="mt-2 text-xl font-semibold">{delivery?deliveryStage(delivery):'Choose test delivery'}</h2>
  <p className="mt-2 text-sm text-slate-600">No courier is booked. Use sample locations. Locker prices are samples for testing; no usable PIN or live courier quote is generated.</p>
  {delivery?<div className="mt-4 space-y-2 text-sm"><p><strong>{delivery.method==='locker'?'Locker delivery':'Door delivery'}</strong> · {delivery.destination}</p>
   {delivery.quote_cents!=null?<p>Confirmed sample delivery: <strong>R{(delivery.quote_cents/100).toFixed(2)}</strong> · {delivery.quote_size}</p>:null}
   {delivery.origin?<p>From: {delivery.origin}</p>:null}
   {delivery.status==='booked'&&delivery.dropoff_deadline?<p>{delivery.method==='locker'?'Drop-off':'Test handover'} deadline: <strong>{date(delivery.dropoff_deadline)}</strong> · test allowance only</p>:null}
   {delivery.status==='awaiting_collection'&&delivery.collection_deadline?<p>Collection deadline: <strong>{date(delivery.collection_deadline)}</strong>. Inspection starts after collection.</p>:null}
   {delivery.status==='received'?<p>Receipt recorded. Confirm receipt or report a problem in the payment panel.</p>:null}
   {delivery.booking_reference?<details><summary className="cursor-pointer">Test booking details</summary><p className="mt-2 break-all">{delivery.booking_reference}</p><p>This reference cannot open a locker. Packed parcel: {delivery.parcel.lengthCm} × {delivery.parcel.widthCm} × {delivery.parcel.heightCm} cm · {delivery.parcel.weightKg} kg</p></details>:null}
  </div>:null}
  {active&&viewer==='buyer'&&canSelect&&!checkoutStarted&&(!delivery||delivery.status==='selected')?<div className="mt-5 space-y-3">
   <label className="block text-sm">Delivery method<select value={method} onChange={e=>setMethod(e.target.value as 'locker'|'door')} className={inputClass}><option value="locker">Locker delivery</option><option value="door">Door delivery</option></select></label>
   <label className="block text-sm">{method==='locker'?'Sample destination locker':'Sample delivery address'}<input value={destination} maxLength={200} onChange={e=>setDestination(e.target.value)} className={inputClass}/></label>
   <fieldset><legend className="text-sm">Packed parcel — confirm these measurements with the seller</legend><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Object.entries({lengthCm:'Length (cm)',widthCm:'Width (cm)',heightCm:'Height (cm)',weightKg:'Weight (kg)'}).map(([key,label])=><label key={key} className="text-xs">{label}<input type="number" min="0.01" step="0.01" value={parcel[key as keyof typeof parcel]} onChange={e=>setParcel({...parcel,[key]:Number(e.target.value)})} className={inputClass}/></label>)}</div></fieldset>
   {method==='locker'&&!lockerFits(parcel)?<p role="alert" className="text-sm text-red-700">This parcel exceeds locker limits. Choose door delivery.</p>:button('select',method==='locker'?'Confirm sample locker price':'Save test door delivery',{method,destination,parcel})}
   <p className="text-sm font-semibold">{sampleQuote?`${sampleQuote.size} sample locker price: R${(sampleQuote.cents/100).toFixed(2)}`:method==='door'?'Door delivery needs a separate quote; sample locker rates do not apply.':'Enter a parcel within locker limits.'}</p>
   <p className="text-xs text-slate-500">Confirm the packed measurements with the seller. A confirmed locker price unlocks test checkout after seller confirmation.</p>
  </div>:null}
  {active&&delivery&&(viewer==='seller'||canOperate)&&ledger?.status==='pending'&&ledger.courier_cents!==null&&(delivery.status==='selected'||bookingExpired)?<div className="mt-5 space-y-3"><label className="block text-sm">{delivery.method==='locker'?'Sample drop-off locker':'Sample collection address'}<input value={origin} maxLength={200} onChange={e=>setOrigin(e.target.value)} className={inputClass}/></label><p className="text-sm">Check the packed dimensions above before preparing a test booking.</p>{button('ready',bookingExpired?'Renew expired test booking':'Ready to send — prepare test booking',{origin})}</div>:null}
  {active&&delivery&&canOperate?<div className="mt-5 flex flex-wrap gap-3">{delivery.status==='booked'&&!bookingExpired?button('dispatch','Simulate courier handover'):null}{delivery.status==='in_transit'&&delivery.method==='locker'?button('arrive','Simulate locker arrival'):null}{(delivery.status==='awaiting_collection'&&!collectionExpired)||(delivery.status==='in_transit'&&delivery.method==='door')?button('receive',delivery.method==='locker'?'Simulate buyer collection':'Simulate door delivery'):null}</div>:null}
  {bookingExpired?<p className="mt-4 text-sm text-amber-700">Seller: renew the test booking before handover.</p>:null}
  {collectionExpired?<p className="mt-4 text-sm text-amber-700">Admin must review the uncollected parcel. Inspection and payout remain held.</p>:null}
  {!delivery&&viewer!=='buyer'?<p className="mt-4 text-sm">Waiting for the buyer to choose test delivery.</p>:null}
  {delivery?.status==='selected'&&(!ledger||ledger.courier_cents===null)?<p className="mt-4 text-sm">Waiting for verified test payment and a confirmed courier cost.</p>:null}
  {error?<p role="alert" className="mt-4 text-sm text-red-700">{error}</p>:null}
 </section>;
}
