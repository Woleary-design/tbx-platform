import { ShieldCheck, Users } from "lucide-react";
import { requireAdmin } from "@/lib/admin";

export default async function AdminUsersPage() {
  const { supabase } = await requireAdmin();
  const [{ data: collectors }, { count: adminCount }] = await Promise.all([
    supabase.from("collectors").select("id,tbx_id,display_name,username,city,country,identity_verified,payment_verified,completed_trades,disputes,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("admin_users").select("id", { count: "exact", head: true }),
  ]);
  const rows = collectors ?? [];
  const verified = rows.filter((user) => user.identity_verified || user.payment_verified).length;
  const sellers = rows.filter((user) => (user.completed_trades ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold text-violet-300">Customers & sellers</p><h1 className="mt-2 text-3xl font-semibold">Community directory</h1><p className="mt-2 text-slate-400">Account, trust and trading signals without exposing unnecessary customer data.</p></div>
      <div className="grid gap-4 sm:grid-cols-4">
        {[["Registered", rows.length],["Verified", verified],["Completed sellers", sellers],["Admins", adminCount ?? 0]].map(([label,value]) => <div key={label} className="tbx-surface rounded-2xl p-5"><p className="text-3xl font-semibold">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>)}
      </div>
      <div className="tbx-surface overflow-hidden rounded-2xl"><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Location</th><th className="px-5 py-4">Verification</th><th className="px-5 py-4">Trades</th><th className="px-5 py-4">Disputes</th></tr></thead><tbody className="divide-y divide-white/10">{rows.length === 0 ? <tr><td colSpan={5} className="px-5 py-14 text-center text-slate-500">No users yet.</td></tr> : rows.map((user) => <tr key={user.id} className="hover:bg-white/[0.025]"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-violet-400/[0.09] text-violet-300"><Users className="h-4 w-4" /></span><div><p className="font-medium text-white">{user.display_name || user.username || "TBX member"}</p><p className="mt-1 text-xs text-slate-500">{user.tbx_id || user.id.slice(0,8).toUpperCase()}</p></div></div></td><td className="px-5 py-4 text-slate-400">{[user.city,user.country].filter(Boolean).join(", ") || "—"}</td><td className="px-5 py-4">{user.identity_verified || user.payment_verified ? <span className="inline-flex items-center gap-1.5 text-emerald-300"><ShieldCheck className="h-4 w-4" /> Verified</span> : <span className="text-slate-500">Not verified</span>}</td><td className="px-5 py-4">{user.completed_trades ?? 0}</td><td className="px-5 py-4">{user.disputes ?? 0}</td></tr>)}</tbody></table></div></div>
    </div>
  );
}
