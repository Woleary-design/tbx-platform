import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, CirclePlus, LibraryBig, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type Asset = {
  id: string;
  asset_id: string;
  set_number: string;
  set_name: string;
  theme: string | null;
  condition: string;
  collectible_details?: Record<string,string> | null;
  estimated_value: number | null;
  purchase_price: number | null;
  passport_status: string;
  original_receipt: boolean;
  instructions_complete: boolean | null;
  minifigures_complete: boolean | null;
  original_owner: boolean;
  sealed: boolean;
  lego_sets: { image_url: string | null } | { image_url: string | null }[] | null;
};

function money(value: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value ?? 0);
}

function collectionHealth(asset: Asset) {
  if(asset.theme === "Pokémon" || asset.theme === "Hot Wheels") return 0;
  const checks = [asset.original_receipt, asset.instructions_complete, asset.minifigures_complete, asset.original_owner, asset.sealed || asset.condition !== "New Sealed"];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function imageFor(asset: Asset) {
  const relation = Array.isArray(asset.lego_sets) ? asset.lego_sets[0] : asset.lego_sets;
  return relation?.image_url ?? null;
}

export default async function CollectionPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data } = userData.user
    ? await supabase
        .from("assets")
        .select("id, asset_id, set_number, set_name, theme, condition, estimated_value, purchase_price, passport_status, collectible_details, original_receipt, instructions_complete, minifigures_complete, original_owner, sealed, lego_sets(image_url)")
        .eq("owner_id", userData.user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const allAssets = (data ?? []) as Asset[];
  const sales = new Map<string, { orderId: string; simulation: boolean }>();
  if (userData.user && allAssets.length) {
    const { data: orders, error: orderError } = await supabase.from("purchase_reservations")
      .select("id,asset_id,status").eq("seller_id", userData.user.id).in("asset_id", allAssets.map(asset => asset.id)).order("created_at", { ascending: false });
    if (orderError) throw new Error("Collection sale status could not be loaded. Please try again.");
    const { data: ledgers, error: ledgerError } = process.env.VERCEL_ENV === "preview" && orders?.length
      ? await supabase.from("sandbox_order_ledger").select("reservation_id,status").eq("seller_id", userData.user.id).in("reservation_id", orders.map(order => order.id))
      : { data: [], error: null };
    if (ledgerError) throw new Error("Collection test sale status could not be loaded. Please try again.");
    const paidTests = new Set((ledgers ?? []).filter(ledger => ledger.status === "paid_test").map(ledger => ledger.reservation_id));
    for (const order of orders ?? []) {
      if (!sales.has(order.asset_id) && (order.status === "completed" || paidTests.has(order.id)))
        sales.set(order.asset_id, { orderId: order.id, simulation: paidTests.has(order.id) });
    }
  }
  const assets = allAssets.filter(asset => !sales.has(asset.id));
  const soldAssets = allAssets.filter(asset => sales.has(asset.id));
  const collectionValue = assets.reduce((sum, asset) => sum + Number(asset.estimated_value ?? 0), 0);
  const purchaseValue = assets.reduce((sum, asset) => sum + Number(asset.purchase_price ?? 0), 0);
  const averageHealth = assets.length ? Math.round(assets.reduce((sum, asset) => sum + collectionHealth(asset), 0) / assets.length) : 0;
  const cabinetAssets = assets.filter((asset) => imageFor(asset)).slice(0, 1);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-slate-950 shadow-[0_28px_100px_rgba(15,23,42,0.16)]">
        <div className="grid gap-0 lg:grid-cols-[1fr_420px]">
          <div className="p-7 text-white md:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-yellow-300"><LibraryBig className="h-4 w-4" /> My Collection</p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">Build your collection. Track its value. Sell with confidence.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">Every item has one clear home for its condition, value and sale status.</p>
            <Button asChild className="mt-8 h-12 rounded-xl bg-yellow-400 px-6 font-semibold text-slate-950 hover:bg-yellow-300"><Link href="/collection/add"><CirclePlus className="h-4 w-4" /> Add to Collection</Link></Button>
          </div>

          <div className="flex flex-col justify-center border-t border-white/10 bg-[#101725] p-6 lg:border-l lg:border-t-0">
            {cabinetAssets[0] ? <Link href={`/collection/${cabinetAssets[0].id}`} className="group block">
              <div className="flex h-60 items-center justify-center rounded-2xl bg-[#f1f0e9] p-6"><img src={imageFor(cabinetAssets[0]) ?? ""} alt={cabinetAssets[0].set_name} className="h-full w-full object-contain transition duration-300 group-hover:scale-105"/></div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-yellow-300">From your collection</p>
              <h2 className="mt-2 text-xl font-semibold text-white">{cabinetAssets[0].set_name}</h2>
              <p className="mt-1 text-sm text-white/55">{cabinetAssets[0].set_number} · View item →</p>
            </Link> : <div className="py-12 text-center text-white/60"><LibraryBig className="mx-auto h-12 w-12 text-yellow-300"/><p className="mt-4">Your next favourite belongs here.</p></div>}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[["Collection Value", money(collectionValue), "Current estimated value"], ["Sets", String(assets.length), "Items in your collection"], ["Collection Health", `${averageHealth}%`, "Average item completeness"], ["Value Difference", money(collectionValue - purchaseValue), "Estimated value less purchase cost"]].map(([label, value, detail]) => (
          <div key={label} className="rounded-[1.5rem] border border-[#eadfce] bg-white p-5 shadow-[0_18px_55px_rgba(43,30,18,0.08)]"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p><p className="mt-2 text-sm text-slate-600">{detail}</p></div>
        ))}
      </section>

      {assets.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-[#d9c9af] bg-white p-10 text-center"><CirclePlus className="mx-auto h-8 w-8 text-yellow-600" /><h2 className="mt-4 text-3xl font-semibold">Add your first collectible.</h2><p className="mt-3 text-slate-600">Search Atlas or enter the set details you know.</p><Button asChild className="mt-6 rounded-xl bg-slate-950 text-white"><Link href="/collection/add">Add to Collection <ArrowRight className="h-4 w-4" /></Link></Button></section>
      ) : (
        <section>
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Live Collection</p><h2 className="mt-2 text-3xl font-semibold text-slate-950">Your collection</h2></div><Button asChild variant="outline" className="rounded-xl"><Link href="/collection/add">Add another set</Link></Button></div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => {
              const health = collectionHealth(asset);
              const image = imageFor(asset);
              return (
                <Link key={asset.id} href={`/collection/${asset.id}`} className="group overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-white shadow-[0_24px_80px_rgba(43,30,18,0.08)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(43,30,18,0.14)]">
                  <div className="relative grid h-52 grid-cols-[1fr_42%] overflow-hidden bg-slate-950 text-white">
                    <div className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">{asset.theme === "Pokémon" || asset.theme === "Hot Wheels" ? asset.theme : "LEGO"} {asset.set_number}</p><h3 className="mt-5 text-2xl font-semibold">{asset.set_name}</h3><p className="mt-1 text-sm text-white/60">{asset.theme || "Uncategorised"}</p><span className="absolute bottom-5 left-5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">{asset.theme === "Pokémon" || asset.theme === "Hot Wheels" ? "Collectible" : `${health}% health`}</span></div>
                    <div className="relative flex items-center justify-center bg-gradient-to-br from-white/[0.08] to-transparent p-4">
                      {image ? <img src={image} alt={asset.set_name} className="max-h-40 w-full object-contain drop-shadow-2xl transition duration-300 group-hover:scale-105" /> : <PackageCheck className="h-9 w-9 text-white/20" />}
                    </div>
                  </div>
                  <div className="p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-sm text-slate-500">Estimated value</p><p className="mt-1 text-2xl font-semibold text-slate-950">{asset.estimated_value == null ? "Not valued" : money(asset.estimated_value)}</p></div><span className="rounded-full bg-[#fffaf1] px-3 py-1 text-xs font-semibold text-slate-600">{asset.collectible_details?.Condition || asset.condition}</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-[#fffaf1]"><div className="h-full rounded-full bg-yellow-400" style={{ width: `${health}%` }} /></div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-slate-600"><div className="rounded-xl bg-slate-50 p-3"><BadgeCheck className="mx-auto mb-1 h-4 w-4 text-yellow-500" /> Owner</div><div className="rounded-xl bg-slate-50 p-3"><BookOpen className="mx-auto mb-1 h-4 w-4 text-yellow-500" /> Details</div><div className="rounded-xl bg-slate-50 p-3"><PackageCheck className="mx-auto mb-1 h-4 w-4 text-yellow-500" /> Condition</div></div><p className="mt-4 flex items-center justify-between text-xs text-slate-400"><span>{asset.asset_id}</span><span className="font-semibold text-slate-700 group-hover:text-yellow-700">View item →</span></p></div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
      {soldAssets.length ? <section className="rounded-[1.75rem] border border-white/10 bg-slate-950 p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">Sale history</p><h2 className="mt-2 text-2xl font-semibold">Sold items</h2><p className="mt-2 text-sm text-white/55">Excluded from your current collection count and value. Test sales are labelled; no real ownership transfer occurs.</p>
        <div className="mt-5 divide-y divide-white/10">{soldAssets.map(asset => { const sale = sales.get(asset.id)!; return <Link key={asset.id} href={`/orders/${sale.orderId}`} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><h3 className="font-semibold">{asset.set_name}</h3><p className="mt-1 text-sm text-white/50">{asset.set_number} · {sale.simulation ? "Sold — simulation" : "Sold"}</p></div><span className="text-sm font-semibold text-yellow-300">View sale history →</span></Link>; })}</div>
      </section> : null}
    </div>
  );
}
