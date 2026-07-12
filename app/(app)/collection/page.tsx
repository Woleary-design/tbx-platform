import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, Camera, CirclePlus, LibraryBig, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type Asset = {
  id: string;
  asset_id: string;
  set_number: string;
  set_name: string;
  theme: string | null;
  condition: string;
  estimated_value: number | null;
  purchase_price: number | null;
  passport_status: string;
  original_receipt: boolean;
  instructions_complete: boolean | null;
  minifigures_complete: boolean | null;
  original_owner: boolean;
  sealed: boolean;
};

function money(value: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value ?? 0);
}

function collectionHealth(asset: Asset) {
  const checks = [asset.original_receipt, asset.instructions_complete, asset.minifigures_complete, asset.original_owner, asset.sealed || asset.condition !== "New Sealed"];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default async function CollectionPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data } = userData.user
    ? await supabase.from("assets").select("id, asset_id, set_number, set_name, theme, condition, estimated_value, purchase_price, passport_status, original_receipt, instructions_complete, minifigures_complete, original_owner, sealed").eq("owner_id", userData.user.id).order("created_at", { ascending: false })
    : { data: [] };

  const assets = (data ?? []) as Asset[];
  const collectionValue = assets.reduce((sum, asset) => sum + Number(asset.estimated_value ?? 0), 0);
  const purchaseValue = assets.reduce((sum, asset) => sum + Number(asset.purchase_price ?? 0), 0);
  const averageHealth = assets.length ? Math.round(assets.reduce((sum, asset) => sum + collectionHealth(asset), 0) / assets.length) : 0;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-slate-950 shadow-[0_28px_100px_rgba(15,23,42,0.16)]">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="p-7 text-white md:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-yellow-300"><LibraryBig className="h-4 w-4" /> My Collection</p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">Build your collection. Track its value. Sell with confidence.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">Every set has one clear home for its condition, documentation, value and sale status.</p>
            <Button asChild className="mt-8 h-12 rounded-xl bg-yellow-400 px-6 font-semibold text-slate-950 hover:bg-yellow-300"><Link href="/collection/add"><CirclePlus className="h-4 w-4" /> Add to Collection</Link></Button>
          </div>
          <div className="relative min-h-[340px] bg-[#f6f1e8]">
            <img src="https://the-block-exchange-landing-page.vercel.app/hero-cabinet.png" alt="Collector cabinet" className="h-full w-full object-cover" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">Collection status</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">{assets.length ? `${assets.length} set${assets.length === 1 ? "" : "s"}` : "Ready for your first set"}</p>
              <p className="mt-1 text-sm text-slate-600">Open any item below to view and manage its full record.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[["Collection Value", money(collectionValue), "Current estimated value"], ["Sets", String(assets.length), "Items in your collection"], ["Collection Health", `${averageHealth}%`, "Average documentation progress"], ["Value Difference", money(collectionValue - purchaseValue), "Estimated value less purchase cost"]].map(([label, value, detail]) => (
          <div key={label} className="rounded-[1.5rem] border border-[#eadfce] bg-white p-5 shadow-[0_18px_55px_rgba(43,30,18,0.08)]"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p><p className="mt-2 text-sm text-slate-600">{detail}</p></div>
        ))}
      </section>

      {assets.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-[#d9c9af] bg-white p-10 text-center"><CirclePlus className="mx-auto h-8 w-8 text-yellow-600" /><h2 className="mt-4 text-3xl font-semibold">Add your first LEGO set.</h2><p className="mt-3 text-slate-600">Search Atlas or add it manually with photos.</p><Button asChild className="mt-6 rounded-xl bg-slate-950 text-white"><Link href="/collection/add">Add to Collection <ArrowRight className="h-4 w-4" /></Link></Button></section>
      ) : (
        <section>
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Live Collection</p><h2 className="mt-2 text-3xl font-semibold text-slate-950">Your LEGO sets</h2></div><Button asChild variant="outline" className="rounded-xl"><Link href="/collection/add">Add another set</Link></Button></div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => {
              const health = collectionHealth(asset);
              return (
                <Link key={asset.id} href={`/collection/${asset.id}`} className="group overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-white shadow-[0_24px_80px_rgba(43,30,18,0.08)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(43,30,18,0.14)]">
                  <div className="relative h-44 bg-slate-950 p-5 text-white"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">LEGO {asset.set_number}</p><h3 className="mt-5 text-2xl font-semibold">{asset.set_name}</h3><p className="mt-1 text-sm text-white/60">{asset.theme || "Uncategorised"}</p><span className="absolute bottom-5 right-5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">{health}% health</span></div>
                  <div className="p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-sm text-slate-500">Estimated value</p><p className="mt-1 text-2xl font-semibold text-slate-950">{money(asset.estimated_value)}</p></div><span className="rounded-full bg-[#fffaf1] px-3 py-1 text-xs font-semibold text-slate-600">{asset.condition}</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-[#fffaf1]"><div className="h-full rounded-full bg-yellow-400" style={{ width: `${health}%` }} /></div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-slate-600"><div className="rounded-xl bg-slate-50 p-3"><BadgeCheck className="mx-auto mb-1 h-4 w-4 text-yellow-500" /> Owner</div><div className="rounded-xl bg-slate-50 p-3"><BookOpen className="mx-auto mb-1 h-4 w-4 text-yellow-500" /> Details</div><div className="rounded-xl bg-slate-50 p-3"><Camera className="mx-auto mb-1 h-4 w-4 text-yellow-500" /> Photos</div></div><p className="mt-4 flex items-center justify-between text-xs text-slate-400"><span>{asset.asset_id}</span><span className="font-semibold text-slate-700 group-hover:text-yellow-700">View item →</span></p></div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300"><Sparkles className="h-4 w-4" /> Collection intelligence — coming later</p><p className="mt-3 text-lg font-semibold">First we make every collection item complete and easy to use.</p></section>
    </div>
  );
}
