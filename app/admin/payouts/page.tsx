import { requireAdmin } from '@/lib/admin';
import { OrderMoney } from '@/components/money/order-money';
import { moneyCents } from '@/lib/money/ledger';

export default async function AdminPayoutsPage() {
 const { supabase, role } = await requireAdmin('payouts');
 const { data: ledgers, error } = await supabase.from('sandbox_order_ledger').select('*').order('created_at', { ascending: false }).limit(100);
 const pending = (ledgers ?? []).filter(l=>!['paid_test','refunded_test'].includes(l.status));
 return <div className="space-y-6">
  <div><p className="text-sm font-semibold text-violet-300">Test accounting</p><h1 className="mt-2 text-3xl font-semibold">Seller payouts</h1><p className="mt-2 text-slate-400">Payment allocations, costs, disputes and simulated payouts. No real transfers are enabled.</p></div>
  <div className="rounded-2xl border border-white/10 p-5"><p className="text-sm text-slate-400">Outstanding simulated seller funds</p><p className="mt-2 text-3xl font-semibold">{moneyCents(pending.reduce((sum,l)=>sum+Number(l.seller_cents ?? 0),0))}</p><p className="mt-2 text-sm text-slate-400">{pending.filter(l=>l.seller_cents===null).length} orders still need a courier cost before seller proceeds can be calculated.</p></div>
  {error ? <p role="alert">The test ledger could not be loaded.</p> : null}
  {ledgers?.length===0 ? <p>No verified test payments yet.</p> : null}
  {ledgers?.map(l=><div key={l.id} id={`order-${l.reservation_id}`} className="space-y-3"><p className="text-sm text-violet-300">Order {l.reservation_id.slice(0,8).toUpperCase()}</p><OrderMoney ledger={l} viewer="finance" canOperate={role === "super_admin"} /></div>)}
 </div>;
}
