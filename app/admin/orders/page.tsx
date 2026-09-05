import { ListChecks, Truck } from "lucide-react";
import { requireAdmin } from "@/lib/admin";

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value || 0);
}

export default async function AdminOrdersPage() {
  const { supabase } = await requireAdmin("orders");
  const { data: orders } = await supabase
    .from("purchase_reservations")
    .select("id,listing_id,amount,currency,status,created_at,seller_deadline,payment_deadline,paid_at,shipped_at,completed_at,tracking_number,carrier")
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = orders ?? [];
  const awaitingSeller = rows.filter((o) => o.status === "awaiting_seller").length;
  const awaitingPayment = rows.filter((o) => o.status === "awaiting_payment").length;
  const shipped = rows.filter((o) => o.shipped_at).length;
  const completed = rows.filter((o) => o.completed_at || o.status === "completed").length;

  return <div className="space-y-6">
    <div><p className="text-sm font-semibold text-violet-300">Orders</p><h1 className="mt-2 text-3xl font-semibold">Order management</h1><p className="mt-2 text-slate-400">Follow every reservation from checkout through seller confirmation, payment and delivery.</p></div>
    <div className="grid gap-4 sm:grid-cols-4">{[["Awaiting seller",awaitingSeller],["Awaiting payment",awaitingPayment],["Shipped",shipped],["Completed",completed]].map(([label,value]) => <div key={label} className="tbx-surface rounded-2xl p-5"><p className="text-3xl font-semibold">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>)}</div>
    <div className="tbx-surface overflow-hidden rounded-2xl"><div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Order</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Created</th><th className="px-5 py-4">Delivery</th></tr></thead><tbody className="divide-y divide-white/10">{rows.length === 0 ? <tr><td colSpan={5} className="px-5 py-14 text-center text-slate-500">No orders yet.</td></tr> : rows.map(order => <tr key={order.id} className="hover:bg-white/[0.025]"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-400/[0.08] text-violet-300"><ListChecks className="h-4 w-4" /></span><div><p className="font-medium">{order.id.slice(0,8).toUpperCase()}</p><p className="mt-1 text-xs text-slate-500">Listing {order.listing_id.slice(0,8).toUpperCase()}</p></div></div></td><td className="px-5 py-4"><span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs capitalize">{String(order.status).replaceAll("_"," ")}</span></td><td className="px-5 py-4 font-semibold">{money(Number(order.amount))}</td><td className="px-5 py-4 text-slate-400">{new Date(order.created_at).toLocaleDateString("en-ZA")}</td><td className="px-5 py-4">{order.shipped_at ? <span className="inline-flex items-center gap-2 text-emerald-300"><Truck className="h-4 w-4" /> {order.carrier || "Shipped"}</span> : <span className="text-slate-500">Not shipped</span>}</td></tr>)}</tbody></table></div></div>
  </div>;
}
