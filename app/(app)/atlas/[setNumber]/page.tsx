import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Boxes, CalendarDays, PackagePlus, Puzzle, ShoppingBag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    supabase
      .from("marketplace_listings")
      .select("id", { count: "exact", head: true })
      .eq("lego_set_id", set.id)
      .eq("status", "live"),
  ]);

  const availableCount = liveListingCount ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Link href="/atlas" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Back to LEGO Directory</Link>

      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-white shadow-[0_28px_100px_rgba(43,30,18,0.10)]">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex min-h-[420px] items-center justify-center bg-[#fffaf1] p-8">
            {set.image_url ? <img src={set.image_url} alt={set.name} className="max-h-[520px] w-full object-contain" /> : <Boxes className="h-24 w-24 text-yellow-500" />}
          </div>
          <div className="bg-slate-950 p-7 text-white md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">Official LEGO Set · {set.set_number}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">{set.name}</h1>
            <p className="mt-4 text-lg text-white/60">{[set.theme, set.subtheme].filter(Boolean).join(" · ") || "Uncategorised"}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><CalendarDays className="h-5 w-5 text-yellow-300" /><p className="mt-3 text-2xl font-semibold">{set.year_released ?? "—"}</p><p className="mt-1 text-xs uppercase tracking-wide text-white/45">Released</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Puzzle className="h-5 w-5 text-yellow-300" /><p className="mt-3 text-2xl font-semibold">{set.piece_count ?? "—"}</p><p className="mt-1 text-xs uppercase tracking-wide text-white/45">Pieces</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Users className="h-5 w-5 text-yellow-300" /><p className="mt-3 text-2xl font-semibold">{Number(wishlistCount ?? 0)}</p><p className="mt-1 text-xs uppercase tracking-wide text-white/45">Collectors wishlisted</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><ShoppingBag className="h-5 w-5 text-yellow-300" /><p className="mt-3 text-2xl font-semibold">{availableCount}</p><p className="mt-1 text-xs uppercase tracking-wide text-white/45">Available now</p></div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-xl bg-yellow-400 px-6 font-semibold text-slate-950 hover:bg-yellow-300">
                <Link href={`/collection/add?set=${encodeURIComponent(set.set_number)}`}><PackagePlus className="h-4 w-4" /> Add to My Collection</Link>
              </Button>
              {user ? <WishlistSetButton legoSetId={set.id} initialWishlisted={Boolean(existingWishlistItem)} /> : null}
              {availableCount > 0 ? (
                <Button asChild variant="outline" className="h-12 rounded-xl border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
                  <Link href={`/marketplace?q=${encodeURIComponent(set.set_number)}`}><ShoppingBag className="h-4 w-4" /> View {availableCount} listing{availableCount === 1 ? "" : "s"}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_20px_65px_rgba(43,30,18,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600">Official reference</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Set information</h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Theme", set.theme || "Not recorded"],
              ["Subtheme", set.subtheme || "Not recorded"],
              ["Year retired", set.year_retired ?? "Not recorded"],
              ["Original retail price", set.retail_price_zar ? `R${Number(set.retail_price_zar).toLocaleString("en-ZA")}` : "Not recorded"],
              ["Barcode", set.barcode || "Not recorded"],
              ["Instructions", set.instructions_url ? "Available" : "Not linked yet"],
            ].map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</dt><dd className="mt-2 font-semibold text-slate-950">{String(value)}</dd></div>)}
          </dl>
        </div>

        <div className="rounded-[2rem] border border-[#eadfce] bg-slate-950 p-6 text-white shadow-[0_20px_65px_rgba(15,23,42,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">Marketplace availability</p>
          <h2 className="mt-3 text-2xl font-semibold">{availableCount > 0 ? `${availableCount} available now.` : "None available right now."}</h2>
          <p className="mt-3 text-sm leading-6 text-white/65">
            {availableCount > 0
              ? "These are live, fixed-price TBX listings for this exact LEGO set."
              : "Keep it on your Wishlist and TBX can notify you when a matching listing goes live."}
          </p>
          {availableCount > 0 ? (
            <Button asChild className="mt-6 h-12 w-full rounded-xl bg-white font-semibold text-slate-950 hover:bg-slate-100"><Link href={`/marketplace?q=${encodeURIComponent(set.set_number)}`}>View available listings</Link></Button>
          ) : (
            <Button asChild className="mt-6 h-12 w-full rounded-xl bg-white font-semibold text-slate-950 hover:bg-slate-100"><Link href="/wishlist">View my Wishlist</Link></Button>
          )}
        </div>
      </section>
    </div>
  );
}