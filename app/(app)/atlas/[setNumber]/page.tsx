import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Boxes, CalendarDays, PackagePlus, Puzzle, ShoppingBag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AtlasMarketValue } from "@/components/atlas/atlas-market-value";
import { WishlistSetButton } from "@/components/atlas/wishlist-set-button";
import { getAtlasSetByNumber } from "@/lib/atlas/service";
import { createClient } from "@/lib/supabase/server";

export default async function AtlasSetPage({ params }: { params: Promise<{ setNumber: string }> }) {
  const { setNumber } = await params;
  const supabase = await createClient();
  const decodedSetNumber = decodeURIComponent(setNumber);
  const [{ data: set }, { data: userData }] = await Promise.all([
    getAtlasSetByNumber(supabase, decodedSetNumber),
    supabase.auth.getUser(),
  ]);

  if (!set) notFound();

  const user = userData.user;
  const [{ data: wishlistCount }, { data: existingWishlistItem }, { count: liveListingCount }] = await Promise.all([
    supabase.rpc("atlas_wishlist_count", { target_set_id: set.id }),
    user
      ? supabase.from("wishlist_items").select("id").eq("collector_id", user.id).eq("lego_set_id", set.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("marketplace_listings").select("id", { count: "exact", head: true }).eq("lego_set_id", set.id).eq("status", "live"),
  ]);

  const availableCount = liveListingCount ?? 0;
  const isWishlisted = Boolean(existingWishlistItem);
  const relatedSetsHref = set.theme ? `/atlas?theme=${encodeURIComponent(set.theme)}` : "/atlas";
  const signInHref = `/auth?next=${encodeURIComponent(`/atlas/${set.set_number}`)}`;

  const informationFields = [
    { label: "Set number", value: set.set_number },
    set.theme ? { label: "Theme", value: set.theme } : null,
    set.subtheme ? { label: "Subtheme", value: set.subtheme } : null,
    set.year_released ? { label: "Released", value: String(set.year_released) } : null,
    set.piece_count ? { label: "Pieces", value: Number(set.piece_count).toLocaleString("en-ZA") } : null,
    set.minifigure_count ? { label: "Minifigures", value: String(set.minifigure_count) } : null,
    set.year_retired ? { label: "Retired", value: String(set.year_retired) } : null,
    set.retail_price_zar ? { label: "Original retail price", value: `R${Number(set.retail_price_zar).toLocaleString("en-ZA")}` } : null,
    set.barcode ? { label: "Barcode", value: set.barcode } : null,
  ].filter((field): field is { label: string; value: string } => Boolean(field));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Link href="/atlas" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Back to Atlas Catalogue</Link>

      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-white shadow-[0_28px_100px_rgba(43,30,18,0.10)]">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex min-h-[420px] items-center justify-center bg-[#fffaf1] p-8">
            {set.image_url ? <img src={set.image_url} alt={set.name} className="max-h-[520px] w-full object-contain" /> : <Boxes className="h-24 w-24 text-yellow-500" />}
          </div>
          <div className="bg-slate-950 p-7 text-white md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">Verified Atlas Record · LEGO {set.set_number}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">{set.name}</h1>
            <p className="mt-4 text-lg text-white/60">{[set.theme, set.subtheme].filter(Boolean).join(" · ") || "Uncategorised"}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><CalendarDays className="h-5 w-5 text-yellow-300" /><p className="mt-3 text-2xl font-semibold">{set.year_released ?? "—"}</p><p className="mt-1 text-xs uppercase tracking-wide text-white/45">Released</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Puzzle className="h-5 w-5 text-yellow-300" /><p className="mt-3 text-2xl font-semibold">{set.piece_count ?? "—"}</p><p className="mt-1 text-xs uppercase tracking-wide text-white/45">Pieces</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Users className="h-5 w-5 text-yellow-300" /><p className="mt-3 text-2xl font-semibold">{Number(wishlistCount ?? 0)}</p><p className="mt-1 text-xs uppercase tracking-wide text-white/45">Collectors wishlisted</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><ShoppingBag className="h-5 w-5 text-yellow-300" /><p className="mt-3 text-2xl font-semibold">{availableCount}</p><p className="mt-1 text-xs uppercase tracking-wide text-white/45">Available now</p></div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-xl bg-yellow-400 px-6 font-semibold text-slate-950 hover:bg-yellow-300"><Link href={`/collection/add?set=${encodeURIComponent(set.set_number)}`}><PackagePlus className="h-4 w-4" /> Add to My Collection</Link></Button>
              {user ? <WishlistSetButton legoSetId={set.id} initialWishlisted={isWishlisted} /> : null}
              {availableCount > 0 ? <Button asChild variant="outline" className="h-12 rounded-xl border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"><Link href={`/marketplace?q=${encodeURIComponent(set.set_number)}`}><ShoppingBag className="h-4 w-4" /> View {availableCount} listing{availableCount === 1 ? "" : "s"}</Link></Button> : null}
            </div>
          </div>
        </div>
      </section>

      <AtlasMarketValue identity={{ category: "LEGO", identifier: set.set_number, name: set.name }} />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_20px_65px_rgba(43,30,18,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600">Verified catalogue data</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Record information</h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {informationFields.map(({ label, value }) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</dt><dd className="mt-2 font-semibold text-slate-950">{value}</dd></div>)}
            {set.instructions_url ? <div className="rounded-2xl bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Instructions</dt><dd className="mt-2 font-semibold text-slate-950"><a href={set.instructions_url} target="_blank" rel="noreferrer" className="underline decoration-yellow-400 underline-offset-4">View official instructions</a></dd></div> : null}
          </dl>
          <p className="mt-5 text-sm leading-6 text-slate-500">Atlas shows verified identity and specification data consistently across every collectible category.</p>
        </div>
        <div className="rounded-[2rem] border border-[#eadfce] bg-slate-950 p-6 text-white shadow-[0_20px_65px_rgba(15,23,42,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">Marketplace availability</p>
          <h2 className="mt-3 text-2xl font-semibold">{availableCount > 0 ? `${availableCount} listing${availableCount === 1 ? "" : "s"} available.` : "0 listings available."}</h2>
          <p className="mt-3 text-sm leading-6 text-white/65">{availableCount > 0 ? "These are live, fixed-price TBX listings tied to this exact Atlas record." : isWishlisted ? "You are tracking this record. TBX will surface a match when a collector lists one." : "Add this record to your Wishlist to track future marketplace availability."}</p>
          {availableCount > 0 ? <Button asChild className="mt-6 h-12 w-full rounded-xl bg-white font-semibold text-slate-950 hover:bg-slate-100"><Link href={`/marketplace?q=${encodeURIComponent(set.set_number)}`}>View available listings</Link></Button> : user && !isWishlisted ? <div className="mt-6 [&_button]:w-full [&_button]:justify-center [&_button]:border-white [&_button]:bg-white [&_button]:text-slate-950 [&_button]:hover:bg-slate-100"><WishlistSetButton legoSetId={set.id} initialWishlisted={false} /></div> : isWishlisted ? <Button asChild className="mt-6 h-12 w-full rounded-xl bg-white font-semibold text-slate-950 hover:bg-slate-100"><Link href={relatedSetsHref}>Browse similar {set.theme || "LEGO"} records</Link></Button> : <Button asChild className="mt-6 h-12 w-full rounded-xl bg-white font-semibold text-slate-950 hover:bg-slate-100"><Link href={signInHref}>Sign in to track this record</Link></Button>}
        </div>
      </section>
    </div>
  );
}
