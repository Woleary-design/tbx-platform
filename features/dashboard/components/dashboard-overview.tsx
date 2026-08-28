import Link from "next/link";
import { ArrowRight, Heart, LibraryBig, PackageOpen, Search, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";

type CatalogueSet = {
  id: string;
  set_number: string;
  name: string;
  theme: string | null;
  year_released: number | null;
  piece_count: number | null;
  image_url: string | null;
};

type DashboardListingRow = {
  id: string;
  asking_price: number | string;
  title: string | null;
  published_at: string | null;
  value_quote: Record<string, unknown> | null;
  assets: Array<{
    set_number: string | null;
    set_name: string | null;
    theme: string | null;
    condition: string | null;
    lego_set_id: string | null;
  }> | null;
  collectors: Array<{
    average_dispatch_days: number | string | null;
  }> | null;
};

const categories = ["Icons", "Star Wars", "Technic", "Speed Champions", "Architecture", "NINJAGO"];

export async function DashboardOverview() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const [catalogueResult, listingsResult] = await Promise.all([
    supabase
      .from("lego_sets")
      .select("id, set_number, name, theme, year_released, piece_count, image_url")
      .eq("is_active", true)
      .eq("atlas_visibility", "public")
      .order("year_released", { ascending: false })
      .limit(8),
    supabase
      .from("listings")
      .select(`
        id,
        asking_price,
        title,
        published_at,
        value_quote,
        assets!listings_asset_id_fkey(set_number, set_name, theme, condition, lego_set_id),
        collectors!listings_seller_id_fkey(average_dispatch_days)
      `)
      .eq("status", "Active")
      .order("published_at", { ascending: false })
      .limit(4),
  ]);

  const sets = (catalogueResult.data ?? []) as CatalogueSet[];
  const listingRows = (listingsResult.data ?? []) as unknown as DashboardListingRow[];
  const legoSetIds = listingRows.flatMap((listing) => {
    const asset = Array.isArray(listing.assets) ? listing.assets[0] : null;
    return asset?.lego_set_id ? [asset.lego_set_id] : [];
  });

  const { data: listingSets } = legoSetIds.length
    ? await supabase.from("lego_sets").select("id, set_number, name, theme, image_url").in("id", legoSetIds)
    : { data: [] as Array<{ id: string; set_number: string; name: string; theme: string | null; image_url: string | null }> };

  const setById = new Map((listingSets ?? []).map((set) => [set.id, set]));
  const listings = listingRows.flatMap((listing) => {
    const asset = Array.isArray(listing.assets) ? listing.assets[0] : null;
    if (!asset) return [];
    const catalogueSet = asset.lego_set_id ? setById.get(asset.lego_set_id) : null;
    const seller = Array.isArray(listing.collectors) ? listing.collectors[0] : null;
    const quote = listing.value_quote && typeof listing.value_quote === "object" && !Array.isArray(listing.value_quote)
      ? listing.value_quote
      : {};
    return [{
      id: listing.id,
      priceZar: Number(listing.asking_price),
      condition: typeof quote.condition === "string" ? quote.condition : asset.condition ?? "Used",
      dispatchDays: Math.max(1, Math.round(Number(seller?.average_dispatch_days ?? 2))),
      setNumber: catalogueSet?.set_number ?? asset.set_number ?? "Collection",
      setName: listing.title || catalogueSet?.name || asset.set_name || "LEGO collection",
      theme: catalogueSet?.theme ?? asset.theme,
      imageUrl: catalogueSet?.image_url ?? null,
    }];
  });

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Collector";

  return (
    <div className="min-h-screen bg-[#fffaf1]">
      <main className="mx-auto max-w-7xl px-0 py-2 sm:px-2 sm:py-6 lg:py-8">
        <section className="overflow-hidden rounded-[1.75rem] bg-slate-950 px-5 py-8 text-white sm:px-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300">Welcome, {displayName}</p>
          <h1 className="mt-3 max-w-3xl text-[2.35rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:mt-4 sm:text-6xl sm:leading-[1.02]">
            Discover collectibles. Build your collection.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
            LEGO is the first category on TBX. Search the catalogue, add sets to your private collection or Wishlist, and buy only from real live listings.
          </p>
          <form action="/atlas" className="mt-7 flex max-w-2xl flex-col gap-3 sm:mt-8 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input name="theme" placeholder="Search LEGO sets by name or set number…" className="h-13 rounded-2xl border-white/10 bg-white pl-12 text-slate-950" />
            </div>
            <Button className="h-13 rounded-2xl bg-yellow-400 px-6 font-semibold text-slate-950 hover:bg-yellow-300">Search</Button>
          </form>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <Button asChild variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"><Link href="/collection"><LibraryBig className="h-4 w-4" /> My Collection</Link></Button>
            <Button asChild variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"><Link href="/wishlist"><Heart className="h-4 w-4" /> Wishlist</Link></Button>
            <Button asChild variant="outline" className="col-span-2 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 sm:col-span-1"><Link href="/marketplace"><ShoppingBag className="h-4 w-4" /> Marketplace</Link></Button>
          </div>
        </section>

        <section className="mt-10 px-1 sm:mt-12">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Explore</p><h2 className="mt-2 text-3xl font-semibold text-slate-950">Browse LEGO themes</h2></div>
            <Link href="/atlas" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">Open Atlas <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category} href={`/atlas?theme=${encodeURIComponent(category)}`} className="rounded-2xl border border-[#eadfce] bg-white p-5 text-lg font-semibold shadow-sm transition hover:-translate-y-0.5">{category}</Link>
            ))}
          </div>
        </section>

        <section className="mt-12 px-1">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Catalogue</p><h2 className="mt-2 text-3xl font-semibold text-slate-950">Recently added LEGO sets</h2></div><Link href="/atlas" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">Search all sets <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sets.map((set) => (
              <article key={set.id} className="overflow-hidden rounded-[1.5rem] border border-[#eadfce] bg-white shadow-[0_16px_50px_rgba(43,30,18,0.07)]">
                <div className="grid aspect-[4/3] place-items-center bg-white p-5">{set.image_url ? <img src={set.image_url} alt={set.name} className="h-full w-full object-contain" /> : <PackageOpen className="h-10 w-10 text-slate-300" />}</div>
                <div className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">{set.set_number}</p><h3 className="mt-2 font-semibold text-slate-950">{set.name}</h3><p className="mt-2 text-sm text-slate-500">{set.theme ?? "LEGO"}{set.year_released ? ` · ${set.year_released}` : ""}{set.piece_count ? ` · ${set.piece_count.toLocaleString("en-ZA")} pieces` : ""}</p><div className="mt-4 flex gap-2"><Button asChild size="sm" className="rounded-lg bg-slate-950 text-white"><Link href={`/collection?set=${encodeURIComponent(set.set_number)}`}>Add</Link></Button><Button asChild size="sm" variant="outline" className="rounded-lg"><Link href={`/atlas/${encodeURIComponent(set.set_number)}`}>Wishlist</Link></Button></div></div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 px-1">
          <div className="flex items-end justify-between gap-4"><div><p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600"><Sparkles className="h-4 w-4" /> Marketplace</p><h2 className="mt-2 text-3xl font-semibold text-slate-950">Recently listed</h2></div><Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">View marketplace <ArrowRight className="h-4 w-4" /></Link></div>
          {listings.length > 0 ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{listings.map((listing) => <Link key={listing.id} href={`/marketplace/${listing.id}`} className="overflow-hidden rounded-[1.5rem] border border-[#eadfce] bg-white shadow-sm"><div className="grid aspect-[4/3] place-items-center bg-white p-5">{listing.imageUrl ? <img src={listing.imageUrl} alt={listing.setName} className="h-full w-full object-contain" /> : <PackageOpen className="h-10 w-10 text-slate-300" />}</div><div className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">{listing.setNumber}</p><h3 className="mt-2 font-semibold">{listing.setName}</h3><p className="mt-2 text-lg font-semibold">R{listing.priceZar.toLocaleString("en-ZA")}</p><p className="mt-1 text-sm text-slate-500">{listing.condition} · Dispatch in {listing.dispatchDays} day{listing.dispatchDays === 1 ? "" : "s"}</p></div></Link>)}</div> : <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center"><PackageOpen className="mx-auto h-10 w-10 text-yellow-600" /><h3 className="mt-4 text-2xl font-semibold">No active listings yet.</h3><p className="mt-2 text-slate-600">The marketplace only shows real items currently for sale.</p><Button asChild className="mt-5 rounded-xl bg-yellow-400 font-semibold text-slate-950"><Link href="/sell/quick">Sell an item</Link></Button></div>}
        </section>
      </main>
    </div>
  );
}
