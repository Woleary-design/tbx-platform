import Link from "next/link";
import { Boxes, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/admin";

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value || 0);
}

export default async function AdminMarketplacePage() {
  const { supabase } = await requireAdmin();
  const { data: listings } = await supabase
    .from("listings")
    .select("id,title,asking_price,status,lifecycle_state,views,watchers,seller_id,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = listings ?? [];
  const statusCount = (status: string) => rows.filter((row) => String(row.status).toLowerCase() === status.toLowerCase()).length;
  const counts = [
    ["Active", statusCount("Active")],
    ["Reserved", statusCount("Reserved")],
    ["Sold", statusCount("Sold")],
    ["Removed", statusCount("Removed")],
    ["Total", rows.length],
  ];

  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold text-violet-300">Listings</p><h1 className="mt-2 text-3xl font-semibold">Marketplace inventory</h1><p className="mt-2 text-slate-400">Every TBX listing in one operational view.</p></div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {counts.map(([label, value]) => <div key={label} className="tbx-surface rounded-2xl p-4"><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>)}
      </div>

      <div className="tbx-surface overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Listing</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Views</th><th className="px-5 py-4">Watchers</th><th className="px-5 py-4"></th></tr></thead>
            <tbody className="divide-y divide-white/10">
              {rows.length === 0 ? <tr><td colSpan={6} className="px-5 py-14 text-center text-slate-500">No listings yet.</td></tr> : rows.map((listing) => (
                <tr key={listing.id} className="hover:bg-white/[0.025]">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-400/[0.08] text-violet-300"><Boxes className="h-4 w-4" /></span><div><p className="max-w-[330px] truncate font-medium text-white">{listing.title}</p><p className="mt-1 text-xs text-slate-500">{listing.id.slice(0,8).toUpperCase()}</p></div></div></td>
                  <td className="px-5 py-4"><span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs">{listing.status}</span></td>
                  <td className="px-5 py-4 font-semibold">{money(Number(listing.asking_price))}</td>
                  <td className="px-5 py-4 text-slate-400">{listing.views ?? 0}</td>
                  <td className="px-5 py-4 text-slate-400">{listing.watchers ?? 0}</td>
                  <td className="px-5 py-4 text-right"><Link href={`/marketplace/${listing.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300">Open <ExternalLink className="h-3.5 w-3.5" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
