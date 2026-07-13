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

type ListingRow = {
  id: string;
  price_zar: number | string;
  condition: string;
  dispatch_days: number;
  lego_sets: CatalogueSet[] | null;
};

const categories = ["Icons", "Star Wars", "Technic", "Speed Champions", "Architecture", "Ninjago"];

export async function DashboardOverview() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const [catalogueResult, listingsResult] = await Promise.all([
    supabase
      .from("lego_sets")
      .select("id, set_number, name, theme, year_released, piece_count, image_url")
      .eq("is_active", true)
      .order("year_released", { ascending: false })
      .limit(8),
    supabase
      .from("marketplace_listings")
      .select("id, price_zar, condition, dispatch_days, lego_sets(id, set_number, name, theme, year_released, piece_count, image_url)")
      .eq("status", "live")
      .order("published_at", { ascending: false })
      .limit(4),
  ]);

  const sets = (catalogueResult.data ?? []) as CatalogueSet[];
  const listings = ((listingsResult.data ?? []) as unknown as ListingRow[]).flatMap((listing) => {
    const set = listing.lego_sets?.[0];
    return set ? [{ ...listing, set }] : [];
  });
  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Collector";

  return (
    <div className="min-h-screen bg-[#fffaf1]">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">Welcome, {displayName}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Discover collectibles. Build your collection.</h1>
          <p className="mt-4 max-w-2xl text-white/65">LEGO is the first category on TBX. Search the catalogue, add sets to your private collection or Wishlist, and buy only from real live listings.</p>
          <form action="/wants" className="mt-8 flex max-w-2xl gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input name="q" placeholder="Search LEGO sets by name or set number…" className="h-13 rounded-2xl border-white/10 bg-white pl-12 text-slate-950" />
            </div>
            <Button className="h-13 rounded-2xl bg-yellow-400 px-6 font-semibold text-slate-950 hover:bg-yellow-300">Search</Button>
          </form>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"><Link href="/collection"><LibraryBig className="h-4 w-4" /> My Collection</Link></Button>
            <Button asChild variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"><Link href="/wants"><Heart className="h-4 w-4" /> Wishlist</Link></Button>
            <Button asChild variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"><Link href="/marketplace"><ShoppingBag className="h-4 w-4" /> Marketplace</Link></Button>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Explore</p><h2 className="mt-2 text-3xl font-semibold text-slate-950">Browse LEGO themes</h2></div>
            <Link href="/insights" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">Open Discover <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => <Link key={category} href={`/wants?q=${encodeURIComponent(category)}`} className="rounded-2xl border border-[#eadfce] bg-white p-5 text-lg font-semibold shadow-sm transition hover:-translate-y-0.5">{category}</Link>)}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Catalogue</p><h2 className="mt-2 text-3xl font-semibold text-slate-950">Recently added LEGO sets</h2></div><Link href="/wants" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">Search all sets <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sets.map((set) => (
              <article key={set.id} className="overflow-hidden rounded-[1.5rem] border border-[#eadfce] bg-white shadow-[0_16px_50px_rgba(43,30,18,0.07)]">
                <div className="grid aspect-[4/3] place-items-center bg-white p-5">{set.image_url ? <img src={set.image_url} alt={set.name} className="h-full w-full object-contain" /> : <PackageOpen className="h-10 w-10 text-slate-300" />}</div>
                <div className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">{set.set_number}</p><h3 className="mt-2 font-semibold text-slate-950">{set.name}</h3><p className="mt-2 text-sm text-slate-500">{set.theme ?? "LEGO"}{set.year_released ? ` · ${set.year_released}` : ""}{set.piece_count ? ` · ${set.piece_count.toLocaleString("en-ZA")} pieces` : ""}</p><div className="mt-4 flex gap-2"><Button asChild size="sm" className="rounded-lg bg-slate-950 text-white"><Link href={`/collection?set=${encodeURIComponent(set.set_number)}`}>Add</Link></Button><Button asChild size="sm" variant="outline" className="rounded-lg"><Link href={`/wants?set=${encodeURIComponent(set.set_number)}`}>Wishlist</Link></Button></div></div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4"><div><p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600"><Sparkles className="h-4 w-4" /> Marketplace</p><h2 className="mt-2 text-3xl font-semibold text-slate-950">Recently listed</h2></div><Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">View marketplace <ArrowRight className="h-4 w-4" /></Link></div>
          {listings.length > 0 ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{listings.map((listing) => <Link key={listing.id} href={`/marketplace/${listing.id}`} className="overflow-hidden rounded-[1.5rem] border border-[#eadfce] bg-white shadow-sm"><div className="grid aspect-[4/3] place-items-center bg-white p-5">{listing.set.image_url ? <img src={listing.set.image_url} alt={listing.set.name} className="h-full w-full object-contain" /> : <PackageOpen className="h-10 w-10 text-slate-300" />}</div><div className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">{listing.set.set_number}</p><h3 className="mt-2 font-semibold">{listing.set.name}</h3><p className="mt-2 text-lg font-semibold">R{Number(listing.price_zar).toLocaleString("en-ZA")}</p><p className="mt-1 text-sm text-slate-500">{listing.condition} · Dispatch in {listing.dispatch_days} day{listing.dispatch_days === 1 ? "" : "s"}</p></div></Link>)}</div> : <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center"><PackageOpen className="mx-auto h-10 w-10 text-yellow-600" /><h3 className="mt-4 text-2xl font-semibold">No live listings yet.</h3><p className="mt-2 text-slate-600">The marketplace only shows real items currently for sale.</p><Button asChild className="mt-5 rounded-xl bg-yellow-400 font-semibold text-slate-950"><Link href="/sell">Sell an item</Link></Button></div>}
        </section>
      </main>
    </div>
  );
}
