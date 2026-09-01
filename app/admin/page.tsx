import Link from "next/link";
import { ArrowRight, Boxes, CircleAlert, ListChecks, TrendingUp, Users, WalletCards } from "lucide-react";
import { requireAdmin } from "@/lib/admin";

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value || 0);
}

export default async function AdminDashboardPage() {
  const { supabase, user } = await requireAdmin();

  const [usersRes, listingsRes, activeRes, ordersRes, recentOrdersRes, recentListingsRes] = await Promise.all([
    supabase.from("collectors").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "Active"),
    supabase.from("purchase_reservations").select("amount,status,created_at"),
    supabase.from("purchase_reservations").select("id,amount,status,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("listings").select("id,title,asking_price,status,created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const orders = ordersRes.data ?? [];
  const completed = orders.filter((order) => order.status === "completed" || order.status === "paid");
  const gmv = completed.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const tbxFees = gmv * 0.1;
  const openOrders = orders.filter((order) => !["completed", "cancelled", "expired"].includes(order.status || "")).length;
  const name = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Admin";

  const metrics = [
    ["GMV", money(gmv), "Completed/paid orders", TrendingUp],
    ["TBX fees", money(tbxFees), "At current 10% fee", WalletCards],
    ["Active listings", String(activeRes.count ?? 0), `${listingsRes.count ?? 0} total listings`, Boxes],
    ["Users", String(usersRes.count ?? 0), "Collectors and sellers", Users],
  ] as const;

  return (
    <div className="space-y-7">
      <section className="rounded-[28px] border border-violet-400/20 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,.18),transparent_42%),linear-gradient(135deg,rgba(255,255,255,.055),rgba(255,255,255,.015))] p-6 sm:p-8">
        <p className="text-sm font-semibold text-violet-200">TBX Admin</p>
        <div className="mt-2 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, {name}.</h1>
            <p className="mt-3 max-w-2xl text-slate-400">The operational view of TBX: sales, listings, sellers and anything that needs attention.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-xs text-slate-500">Orders needing action</p>
            <p className="mt-1 text-2xl font-semibold">{openOrders}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, detail, Icon]) => (
          <article key={label} className="tbx-surface rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-3 text-3xl font-semibold">{value}</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-400/[0.09] text-violet-300"><Icon className="h-5 w-5" /></div>
            </div>
            <p className="mt-4 text-xs text-slate-500">{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="tbx-surface overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div><h2 className="font-semibold">Recent orders</h2><p className="mt-1 text-xs text-slate-500">Latest checkout activity</p></div>
            <Link href="/admin/orders" className="text-sm font-semibold text-violet-300">View all</Link>
          </div>
          <div className="divide-y divide-white/10">
            {(recentOrdersRes.data ?? []).length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">No orders yet.</div>
            ) : (recentOrdersRes.data ?? []).map((order) => (
              <Link key={order.id} href={`/admin/orders?order=${order.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03]">
                <ListChecks className="h-4 w-4 text-violet-300" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{order.id.slice(0, 8).toUpperCase()}</p><p className="mt-1 text-xs capitalize text-slate-500">{String(order.status).replaceAll("_", " ")}</p></div>
                <p className="text-sm font-semibold">{money(Number(order.amount))}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="tbx-surface overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div><h2 className="font-semibold">Newest listings</h2><p className="mt-1 text-xs text-slate-500">Fresh marketplace supply</p></div>
            <Link href="/admin/marketplace" className="text-sm font-semibold text-violet-300">View all</Link>
          </div>
          <div className="divide-y divide-white/10">
            {(recentListingsRes.data ?? []).length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">No listings yet.</div>
            ) : (recentListingsRes.data ?? []).map((listing) => (
              <Link key={listing.id} href={`/marketplace/${listing.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03]">
                <Boxes className="h-4 w-4 text-violet-300" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{listing.title}</p><p className="mt-1 text-xs text-slate-500">{listing.status}</p></div>
                <p className="text-sm font-semibold">{money(Number(listing.asking_price))}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-5">
        <div className="flex items-start gap-3"><CircleAlert className="mt-0.5 h-5 w-5 text-amber-300" /><div><h2 className="font-semibold">Payment provider not connected yet</h2><p className="mt-1 text-sm leading-6 text-slate-400">Orders and seller reservations are live. Payments and payouts will plug into this admin once the provider is selected, without changing the seller flow.</p><Link href="/admin/payouts" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-200">Open payout workspace <ArrowRight className="h-4 w-4" /></Link></div></div>
      </section>
    </div>
  );
}
