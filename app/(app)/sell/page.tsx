import Link from "next/link";
import { ArrowLeft, ArrowRight, CirclePlus, LibraryBig, ShoppingBag, Sparkles } from "lucide-react";
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
};

function money(value: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value ?? 0);
}

export default async function SellPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data } = userData.user
    ? await supabase
        .from("assets")
        .select("id, asset_id, set_number, set_name, theme, condition, estimated_value")
        .eq("owner_id", userData.user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const assets = (data ?? []) as Asset[];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/55 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <section className="relative overflow-hidden rounded-[2rem] bg-[#050912] px-7 py-10 text-white shadow-[0_28px_100px_rgba(15,23,42,0.18)] md:px-10 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(232,200,106,0.15),transparent_27rem)]" />
        <div className="relative max-w-3xl">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#e8c86a]"><Sparkles className="h-4 w-4" /> Sell from your collection</p>
          <h1 className="mt-5 text-5xl font-black leading-[0.94] tracking-[-0.06em] md:text-7xl">Choose the item you want to list.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/55">Collection records hold the identity, condition and Atlas value. Selling starts from that record, so users never have to describe the same item twice.</p>
        </div>
      </section>

      {assets.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-white/15 bg-[#09111f] p-10 text-center text-white">
          <LibraryBig className="mx-auto h-10 w-10 text-[#e8c86a]" />
          <h2 className="mt-5 text-3xl font-black">Your collection is empty.</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/45">Value and add the item to your collection first. Once the record exists, you can list it for sale from here.</p>
          <Button asChild className="mt-7 h-12 rounded-xl bg-[#e8c86a] px-6 font-black text-[#050912] hover:bg-[#f1d478]"><Link href="/collection/add"><CirclePlus className="h-4 w-4" /> Add to Collection</Link></Button>
        </section>
      ) : (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">My Collection</p><h2 className="mt-2 text-3xl font-black text-white">Select an item</h2></div>
            <Button asChild variant="outline" className="rounded-xl border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"><Link href="/collection/add"><CirclePlus className="h-4 w-4" /> Add another item</Link></Button>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => (
              <Link key={asset.id} href={`/sell/from-collection/${encodeURIComponent(asset.id)}`} className="group rounded-[1.75rem] border border-white/[0.09] bg-[#09111f] p-6 text-white transition hover:-translate-y-1 hover:border-[#e8c86a]/35">
                <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e8c86a]">LEGO {asset.set_number}</p><h3 className="mt-3 text-2xl font-black">{asset.set_name}</h3><p className="mt-2 text-sm text-white/40">{asset.theme ?? "LEGO"} · {asset.condition}</p></div><ShoppingBag className="h-6 w-6 shrink-0 text-[#e8c86a]" /></div>
                <div className="mt-7 flex items-end justify-between gap-4"><div><p className="text-xs text-white/35">Atlas value</p><p className="mt-1 text-2xl font-black">{money(asset.estimated_value)}</p></div><span className="inline-flex items-center gap-2 text-sm font-bold text-[#e8c86a]">List this item <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
