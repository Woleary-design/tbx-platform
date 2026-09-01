import { Landmark, WalletCards } from "lucide-react";
import { requireAdmin } from "@/lib/admin";

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value || 0);
}

export default async function AdminPayoutsPage() {
  const { supabase } = await requireAdmin();
  const { data: orders } = await supabase.from("purchase_reservations").select("id,amount,status,paid_at,completed_at,seller_id,created_at").order("created_at", { ascending: false }).limit(100);
  const paidOrders = (orders ?? []).filter((order) => order.paid_at || order.status === "paid" || order.status === "completed");
  const sellerDue = paidOrders.reduce((sum, order) => sum + Number(order.amount || 0) * 0.9, 0);
  const tbxFees = paidOrders.reduce((sum, order) => sum + Number(order.amount || 0) * 0.1, 0);

  return <div className="space-y-6">
    <div><p className="text-sm font-semibold text-violet-300">Payouts</p><h1 className="mt-2 text-3xl font-semibold">Seller payouts</h1><p className="mt-2 text-slate-400">One place to control what TBX owes sellers once payments go live.</p></div>
    <div className="grid gap-4 sm:grid-cols-3"><div className="tbx-surface rounded-2xl p-5"><WalletCards className="h-5 w-5 text-violet-300"/><p className="mt-4 text-3xl font-semibold">{money(sellerDue)}</p><p className="mt-1 text-sm text-slate-500">Seller proceeds at 90%</p></div><div className="tbx-surface rounded-2xl p-5"><Landmark className="h-5 w-5 text-violet-300"/><p className="mt-4 text-3xl font-semibold">{money(tbxFees)}</p><p className="mt-1 text-sm text-slate-500">TBX fees at 10%</p></div><div className="tbx-surface rounded-2xl p-5"><p className="text-sm text-slate-500">Eligible paid orders</p><p className="mt-4 text-3xl font-semibold">{paidOrders.length}</p></div></div>
    <div className="rounded-2xl border border-violet-300/15 bg-violet-400/[0.05] p-5"><h2 className="font-semibold">Ready for the payment provider</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">This workspace already calculates seller proceeds and TBX fees from real orders. When Stitch, Peach or another provider is selected, payout status, bank verification and payout references will connect here. No fake escrow or manual wallet has been introduced.</p></div>
    <div className="tbx-surface overflow-hidden rounded-2xl"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Order</th><th className="px-5 py-4">Gross</th><th className="px-5 py-4">TBX fee</th><th className="px-5 py-4">Seller due</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-white/10">{paidOrders.length === 0 ? <tr><td colSpan={5} className="px-5 py-14 text-center text-slate-500">No paid orders awaiting payout.</td></tr> : paidOrders.map(order => { const gross=Number(order.amount||0); return <tr key={order.id}><td className="px-5 py-4 font-medium">{order.id.slice(0,8).toUpperCase()}</td><td className="px-5 py-4">{money(gross)}</td><td className="px-5 py-4">{money(gross*.1)}</td><td className="px-5 py-4 font-semibold">{money(gross*.9)}</td><td className="px-5 py-4 text-amber-300">Provider pending</td></tr>})}</tbody></table></div></div>
  </div>;
}
