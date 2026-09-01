import { BarChart3, Boxes, ShoppingBag, Users } from "lucide-react";
import { requireAdmin } from "@/lib/admin";

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value || 0);
}

export default async function AdminReportsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: orders }, { count: activeListings }, { count: users }] = await Promise.all([
    supabase.from("purchase_reservations").select("amount,status,created_at"),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "Active"),
    supabase.from("collectors").select("id", { count: "exact", head: true }),
  ]);
  const rows = orders ?? [];
  const completed = rows.filter((o) => o.status === "completed" || o.status === "paid");
  const gmv = completed.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const aov = completed.length ? gmv / completed.length : 0;
  const cards = [
    ["GMV", money(gmv), BarChart3],
    ["Transactions", String(completed.length), ShoppingBag],
    ["Average order", money(aov), Boxes],
    ["Users", String(users ?? 0), Users],
  ] as const;

  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold text-violet-300">Reports</p><h1 className="mt-2 text-3xl font-semibold">Business performance</h1><p className="mt-2 text-slate-400">Core marketplace and transaction metrics.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon]) => <div key={label} className="tbx-surface rounded-2xl p-5"><Icon className="h-5 w-5 text-violet-300" /><p className="mt-4 text-3xl font-semibold">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>)}</div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tbx-surface rounded-2xl p-6"><h2 className="font-semibold">Marketplace health</h2><div className="mt-5 space-y-4"><div className="flex justify-between border-b border-white/10 pb-3"><span className="text-slate-400">Active listings</span><span className="font-semibold">{activeListings ?? 0}</span></div><div className="flex justify-between border-b border-white/10 pb-3"><span className="text-slate-400">Completed transactions</span><span className="font-semibold">{completed.length}</span></div><div className="flex justify-between"><span className="text-slate-400">Current take rate</span><span className="font-semibold">10%</span></div></div></div>
        <div className="tbx-surface rounded-2xl p-6"><h2 className="font-semibold">Launch target</h2><p className="mt-2 text-sm leading-6 text-slate-400">The reporting workspace is ready to track the first 100 real sales together with active listings, average order value and completed transactions.</p></div>
      </div>
    </div>
  );
}
