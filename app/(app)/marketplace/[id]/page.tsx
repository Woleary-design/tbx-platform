import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
}

export default async function MarketplaceListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("marketplace_listings")
    .select("id, seller_id, price_zar, condition, confidence_score, region, shipping_option, dispatch_days, status, published_at, lego_sets(set_number, name, theme, image_url)")
    .eq("id", id)
    .maybeSingle();

  if (!listing || !["live", "reserved"].includes(listing.status)) notFound();
  const set = Array.isArray(listing.lego_sets) ? listing.lego_sets[0] : listing.lego_sets;
  if (!set) notFound();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Back to Marketplace</Link>
      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-white shadow-[0_28px_100px_rgba(43,30,18,0.10)]">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex min-h-[440px] items-center justify-center bg-[#fffaf1] p-8">
            {set.image_url ? <img src={set.image_url} alt={set.name} className="max-h-[520px] w-full object-contain" /> : <PackageCheck className="h-24 w-24 text-yellow-500" />}
          </div>
          <div className="bg-slate-950 p-7 text-white md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">LEGO {set.set_number}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{set.name}</h1>
            <p className="mt-3 text-white/60">{set.theme || "Uncategorised"}</p>
            <p className="mt-8 text-4xl font-semibold">{money(Number(listing.price_zar))}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">{listing.condition}</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-sm text-emerald-200"><ShieldCheck className="h-4 w-4" /> Collector Confidence {listing.confidence_score}</span>
            </div>
            <Button className="mt-8 h-12 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300">Start Purchase</Button>
          </div>
        </div>
      </section>
      <section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-[#eadfce] bg-white p-5"><Truck className="h-5 w-5 text-yellow-600" /><p className="mt-3 font-semibold">{listing.shipping_option.replaceAll("_", " ")}</p><p className="mt-1 text-sm text-slate-500">Dispatch within {listing.dispatch_days} days</p></div>
        <div className="rounded-2xl border border-[#eadfce] bg-white p-5"><MapPin className="h-5 w-5 text-yellow-600" /><p className="mt-3 font-semibold">{listing.region === "south_africa" ? "South Africa" : "Worldwide"}</p><p className="mt-1 text-sm text-slate-500">Listing availability</p></div>
        <div className="rounded-2xl border border-[#eadfce] bg-white p-5"><BadgeCheck className="h-5 w-5 text-yellow-600" /><p className="mt-3 font-semibold">Collection-backed listing</p><p className="mt-1 text-sm text-slate-500">Condition and set identity reuse the seller's Collection Record</p></div>
      </section>
    </div>
  );
}
