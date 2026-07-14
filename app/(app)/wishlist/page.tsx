import Link from "next/link";
import { Heart, PackagePlus, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: items } = user
    ? await supabase
        .from("wishlist_items")
        .select("id, created_at, condition_preference, maximum_price_zar, notifications_enabled, lego_sets(id, set_number, name, theme, year_released, image_url)")
        .eq("collector_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const setIds = (items ?? []).flatMap((item) => {
    const set = Array.isArray(item.lego_sets) ? item.lego_sets[0] : item.lego_sets;
    return set?.id ? [set.id] : [];
  });

  const { data: liveListings } = setIds.length
    ? await supabase
        .from("marketplace_listings")
        .select("id, lego_set_id")
        .eq("status", "live")
        .in("lego_set_id", setIds)
    : { data: [] };

  const availabilityBySetId = new Map<string, number>();
  for (const listing of liveListings ?? []) {
    availabilityBySetId.set(
      listing.lego_set_id,
      (availabilityBySetId.get(listing.lego_set_id) ?? 0) + 1,
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)] md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">Wishlist</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Sets you would love to own one day.</h1>
        <p className="mt-4 max-w-xl text-white/70">See live availability now, and TBX will notify you when new matching fixed-price listings appear.</p>
      </section>

      {!items || items.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
          <Heart className="mx-auto h-11 w-11 text-yellow-500" />
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">Your Wishlist is empty</h2>
          <p className="mt-2 text-slate-500">Search the LEGO directory and add the sets you are looking for.</p>
          <Button asChild className="mt-6 rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300">
            <Link href="/atlas"><Search className="h-4 w-4" /> Search LEGO Directory</Link>
          </Button>
        </section>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const set = Array.isArray(item.lego_sets) ? item.lego_sets[0] : item.lego_sets;
            if (!set) return null;
            const availableCount = availabilityBySetId.get(set.id) ?? 0;

            return (
              <article key={item.id} className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-white shadow-[0_18px_55px_rgba(43,30,18,0.07)]">
                <Link href={`/atlas/${encodeURIComponent(set.set_number)}`} className="relative block bg-[#fffaf1] p-6">
                  <div className="flex h-52 items-center justify-center">
                    {set.image_url ? <img src={set.image_url} alt={set.name} className="h-full w-full object-contain" /> : <Heart className="h-16 w-16 text-yellow-400" />}
                  </div>
                  <span className={availableCount > 0
                    ? "absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                    : "absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    {availableCount > 0 ? `${availableCount} available` : "None available"}
                  </span>
                </Link>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-yellow-600">LEGO {set.set_number}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">{set.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">{set.theme || "Uncategorised"}{set.year_released ? ` · ${set.year_released}` : ""}</p>

                  {availableCount > 0 ? (
                    <Button asChild className="mt-5 w-full rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700">
                      <Link href={`/marketplace?set=${encodeURIComponent(set.set_number)}`}>
                        <ShoppingBag className="h-4 w-4" /> View {availableCount} listing{availableCount === 1 ? "" : "s"}
                      </Link>
                    </Button>
                  ) : (
                    <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      No live listings yet. Notifications remain active.
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <Button asChild variant="outline" className="flex-1 rounded-xl"><Link href={`/atlas/${encodeURIComponent(set.set_number)}`}>View set</Link></Button>
                    <Button asChild className="flex-1 rounded-xl bg-yellow-400 text-slate-950 hover:bg-yellow-300"><Link href={`/collection/add?set=${encodeURIComponent(set.set_number)}`}><PackagePlus className="h-4 w-4" /> I own this</Link></Button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
