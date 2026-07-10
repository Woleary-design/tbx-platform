import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, Camera, CirclePlus, PackageCheck, Sparkles } from "lucide-react";
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

function passportCompletion(asset: Asset) {
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
  const averageCompletion = assets.length ? Math.round(assets.reduce((sum, asset) => sum + passportCompletion(asset), 0) / assets.length) : 0;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-slate-950 shadow-[0_28px_100px_rgba(15,23,42,0.16)]">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="p-7 text-white md:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-yellow-300"><PackageCheck className="h-4 w-4" /> My Collection</p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">Your real LEGO collection, powered by TBX Passports.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">Add sets, record ownership and documentation, and build a permanent digital record for every collectible.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-xl bg-yellow-400 px-6 font-semibold text-slate-950 hover:bg-yellow-300"><Link href="/vault/add"><CirclePlus className="h-4 w-4" /> Add a Set</Link></Button>
            </div>
          </div>
          <div className="relative min-h-[340px] bg-[#f6f1e8]">
            <img src="https://the-block-exchange-landing-page.vercel.app/hero-cabinet.png" alt="Premium collector cabinet" className="h-full w-full object-cover" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">Collection status</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">{assets.length ? `${assets.length} live passport${assets.length === 1 ? "" : "s"}` : "Ready for your first set"}</p>
              <p className="mt-1 text-sm text-slate-600">Everything shown below is loaded from your Supabase account.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Collection Value", money(collectionValue), "Current estimated value"],
          ["Sets", String(assets.length), "Passports in your collection"],
          ["Passport Completion", `${averageCompletion}%`, "Average documentation progress"],
          ["Value Difference", money(collectionValue - purchaseValue), "Estimated value less purchase cost"],
        ].map(([label, value, detail]) => (
          <div key={label} className="rounded-[1.5rem] border border-[#eadfce] bg-white p-5 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
            <p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p><p className="mt-2 text-sm text-slate-600">{detail}</p>
          </div>
        ))}
      </section>

      {assets.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-[#d9c9af] bg-white p-10 text-center shadow-[0_24px_80px_rgba(43,30,18,0.06)]">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-yellow-100 text-yellow-700"><CirclePlus className="h-7 w-7" /></span>
          <h2 className="mt-5 text-3xl font-semibold text-slate-950">Add your first LEGO set.</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">Create a real TBX Passport. The set will be saved to Supabase and appear here immediately.</p>
          <Button asChild className="mt-6 h-12 rounded-xl bg-slate-950 px-6 text-white hover:bg-slate-800"><Link href="/vault/add">Create First Passport <ArrowRight className="h-4 w-4" /></Link></Button>
        </section>
      ) : (
        <section>
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Live Collection</p><h2 className="mt-2 text-3xl font-semibold text-slate-950">Your TBX Passports</h2></div>
            <Button asChild variant="outline" className="rounded-xl border-[#eadfce] bg-white"><Link href="/vault/add">Add another set</Link></Button>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => {
              const completion = passportCompletion(asset);
              return (
                <article key={asset.id} className="overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-white shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
                  <div className="relative h-44 bg-slate-950 p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">TBX Passport</p>
                    <h3 className="mt-5 text-2xl font-semibold">{asset.set_name}</h3>
                    <p className="mt-1 text-sm text-white/60">LEGO {asset.set_number} · {asset.theme || "Uncategorised"}</p>
                    <span className="absolute bottom-5 right-5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">{completion}% complete</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-4"><div><p className="text-sm text-slate-500">Estimated value</p><p className="mt-1 text-2xl font-semibold text-slate-950">{money(asset.estimated_value)}</p></div><span className="rounded-full bg-[#fffaf1] px-3 py-1 text-xs font-semibold text-slate-600">{asset.condition}</span></div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#fffaf1]"><div className="h-full rounded-full bg-yellow-400" style={{ width: `${completion}%` }} /></div>
                    <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                      <div className="rounded-xl bg-slate-50 p-3"><BadgeCheck className="mx-auto mb-1 h-4 w-4 text-yellow-500" /> Owner</div>
                      <div className="rounded-xl bg-slate-50 p-3"><BookOpen className="mx-auto mb-1 h-4 w-4 text-yellow-500" /> Docs</div>
                      <div className="rounded-xl bg-slate-50 p-3"><Camera className="mx-auto mb-1 h-4 w-4 text-yellow-500" /> Photos</div>
                    </div>
                    <p className="mt-4 text-xs text-slate-400">{asset.asset_id} · {asset.passport_status}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300"><Sparkles className="h-4 w-4" /> Collector AI — coming next</p>
        <p className="mt-3 text-lg font-semibold">First we make your collection real. Then we make it intelligent.</p>
      </section>
    </div>
  );
}
