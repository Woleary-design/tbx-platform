import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  CarFront,
  CircleDollarSign,
  PackageOpen,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type LegoSetJoin = {
  set_number: string;
  name: string;
  theme: string | null;
  image_url: string | null;
};

type ListingRow = {
  id: string;
  price_zar: number | string;
  condition: string;
  dispatch_days: number;
  lego_sets: LegoSetJoin[] | null;
};

type LandingListing = Omit<ListingRow, "lego_sets"> & { legoSet: LegoSetJoin };

type FeaturedSet = {
  id: string;
  set_number: string;
  name: string;
  theme: string | null;
  subtheme: string | null;
  image_url: string | null;
  year_released: number | null;
  piece_count: number | null;
  completeness_score: number | null;
};

function TbxWordmark() {
  return (
    <span className="relative inline-flex items-end text-2xl font-black tracking-[-0.08em] text-white" aria-label="TBX">
      <span>T</span>
      <span>B</span>
      <span className="text-[#ff6a00]">X</span>
      <span className="absolute -bottom-1.5 left-[1.1rem] h-1.5 w-6 rounded-sm bg-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.45)]" />
    </span>
  );
}

const categories = [
  { name: "LEGO", detail: "27,000+ Atlas records", active: true, icon: Boxes, accent: "bg-yellow-400 text-slate-950" },
  { name: "Hot Wheels", detail: "Coming soon", active: false, icon: CarFront, accent: "bg-[#ff6a00] text-white" },
  { name: "Trading Cards", detail: "Coming soon", active: false, icon: Sparkles, accent: "bg-slate-200 text-slate-700" },
  { name: "Coins", detail: "Coming soon", active: false, icon: CircleDollarSign, accent: "bg-slate-200 text-slate-700" },
];

export default async function HomePage() {
  const supabase = await createClient();
  let listings: LandingListing[] = [];
  let user: { id: string } | null = null;
  let featuredSet: FeaturedSet | null = null;

  try {
    const listingResult = await supabase
      .from("marketplace_listings")
      .select("id, price_zar, condition, dispatch_days, lego_sets(set_number, name, theme, image_url)")
      .eq("status", "live")
      .order("published_at", { ascending: false })
      .limit(4);

    listings = ((listingResult.data ?? []) as ListingRow[]).flatMap((listing) => {
      const legoSet = listing.lego_sets?.[0];
      if (!legoSet) return [];
      const { lego_sets, ...listingFields } = listing;
      void lego_sets;
      return [{ ...listingFields, legoSet }];
    });
  } catch {
    listings = [];
  }

  try {
    const featuredResult = await supabase
      .from("lego_sets")
      .select("id, set_number, name, theme, subtheme, image_url, year_released, piece_count, completeness_score")
      .eq("set_number", "10317-1")
      .maybeSingle();
    featuredSet = (featuredResult.data as FeaturedSet | null) ?? null;
  } catch {
    featuredSet = null;
  }

  try {
    const userResult = await supabase.auth.getUser();
    user = userResult.data.user;
  } catch {
    user = null;
  }

  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080b10]/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-4">
            <TbxWordmark />
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45 sm:block">Discover · Collect · Trade</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-white/65 md:flex">
            <Link href="/" className="text-white">Discover</Link>
            <Link href="/marketplace" className="hover:text-white">Marketplace</Link>
            <Link href="/atlas" className="hover:text-white">Atlas</Link>
            <Link href={user ? "/collection" : "/sign-in?next=/collection"} className="hover:text-white">Vault</Link>
            <Link href={user ? "/wishlist" : "/sign-in?next=/wishlist"} className="hover:text-white">Watchlist</Link>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link href={user ? "/dashboard" : "/sign-in"} className="hidden text-white/60 hover:text-white sm:inline">{user ? "My TBX" : "Sign in"}</Link>
            <Button asChild className="h-11 rounded-xl bg-yellow-400 px-5 font-semibold text-slate-950 hover:bg-yellow-300">
              <Link href="/sell">Sell</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,106,0,0.16),transparent_32%),radial-gradient(circle_at_20%_30%,rgba(250,204,21,0.12),transparent_28%)]" />
          <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
                <ShieldCheck className="h-3.5 w-3.5" /> Built for collectors
              </div>
              <h1 className="mt-7 text-balance text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
                Discover what belongs in your <span className="text-yellow-400">vault.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/60">
                TBX is the trusted home for collectibles. LEGO is first. Hot Wheels, trading cards and more are next.
              </p>

              <form action="/atlas" method="get" className="mt-9 flex max-w-3xl gap-2 rounded-2xl border border-white/10 bg-white p-2 shadow-2xl shadow-black/30">
                <Search className="ml-3 mt-3 h-5 w-5 shrink-0 text-slate-400" />
                <input name="q" aria-label="Search Atlas" placeholder="Search 27,000+ LEGO sets..." className="min-w-0 flex-1 bg-transparent px-2 text-slate-950 outline-none placeholder:text-slate-400" />
                <Button type="submit" className="h-12 rounded-xl bg-slate-950 px-6 font-semibold text-white hover:bg-slate-800">Search Atlas</Button>
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-400">Featured LEGO set</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">This week in Atlas</h2>
            </div>
            <Link href="/atlas" className="hidden items-center gap-2 text-sm font-semibold text-white/65 hover:text-white sm:inline-flex">Explore Atlas <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {featuredSet ? (
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#11151d] shadow-2xl shadow-black/20">
              <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                <div className="flex min-h-[360px] items-center justify-center bg-[#f8f1df] p-8 lg:min-h-[500px]">
                  {featuredSet.image_url ? <img src={featuredSet.image_url} alt={featuredSet.name} className="max-h-[430px] w-full object-contain" /> : <Boxes className="h-24 w-24 text-yellow-500" />}
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-yellow-300">
                    <BadgeCheck className="h-4 w-4" /> Atlas verified
                  </div>
                  <p className="mt-7 text-sm font-semibold uppercase tracking-[0.22em] text-white/45">{featuredSet.theme ?? "LEGO"} · {featuredSet.set_number}</p>
                  <h3 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{featuredSet.name}</h3>
                  <p className="mt-4 text-white/55">A standout collector build selected from the TBX Atlas.</p>

                  <div className="mt-8 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-2xl font-bold">{featuredSet.year_released ?? "—"}</p><p className="mt-1 text-xs uppercase tracking-wide text-white/40">Released</p></div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-2xl font-bold">{featuredSet.piece_count?.toLocaleString() ?? "—"}</p><p className="mt-1 text-xs uppercase tracking-wide text-white/40">Pieces</p></div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-2xl font-bold">{featuredSet.completeness_score ?? 0}%</p><p className="mt-1 text-xs uppercase tracking-wide text-white/40">Atlas score</p></div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild className="h-12 rounded-xl bg-yellow-400 px-6 font-semibold text-slate-950 hover:bg-yellow-300"><Link href={`/atlas/${encodeURIComponent(featuredSet.set_number)}`}>View in Atlas <ArrowRight className="h-4 w-4" /></Link></Button>
                    <Button asChild variant="outline" className="h-12 rounded-xl border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"><Link href={`/marketplace?q=${encodeURIComponent(featuredSet.set_number)}`}>Find one</Link></Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-10 text-center text-white/60">Featured set is being prepared.</div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ff8a3d]">Marketplace</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Just listed</h2>
            </div>
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-white/65 hover:text-white">View all <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {listings.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {listings.map((listing) => (
                <Link key={listing.id} href={`/marketplace/${listing.id}`} className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#11151d] transition hover:-translate-y-1 hover:border-white/20">
                  <div className="grid aspect-[4/3] place-items-center bg-[#f8f1df] p-5">
                    {listing.legoSet.image_url ? <img src={listing.legoSet.image_url} alt={listing.legoSet.name} className="h-full w-full object-contain transition group-hover:scale-105" /> : <PackageOpen className="h-12 w-12 text-slate-300" />}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-400">{listing.legoSet.set_number}</p>
                    <h3 className="mt-2 line-clamp-2 min-h-12 text-lg font-semibold">{listing.legoSet.name}</h3>
                    <div className="mt-4 flex items-center justify-between gap-3"><span className="text-sm text-white/45">{listing.condition}</span><span className="font-bold">R{Number(listing.price_zar).toLocaleString("en-ZA")}</span></div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-10 text-center">
              <PackageOpen className="mx-auto h-10 w-10 text-yellow-400" />
              <h3 className="mt-4 text-2xl font-semibold">The next listing could be yours.</h3>
              <p className="mt-2 text-white/55">TBX only displays real collector listings.</p>
              <Button asChild className="mt-6 rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300"><Link href="/sell">Quick Sell</Link></Button>
            </div>
          )}
        </section>

        <section className="border-t border-white/10 bg-[#0d1118]">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-400">Choose your world</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">One TBX. Every collection.</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const content = (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/[0.07]">
                    <div className={`grid h-11 w-11 place-items-center rounded-xl ${category.accent}`}><Icon className="h-5 w-5" /></div>
                    <h3 className="mt-5 text-xl font-semibold">{category.name}</h3>
                    <p className="mt-2 text-sm text-white/45">{category.detail}</p>
                  </div>
                );
                return category.active ? <Link key={category.name} href="/atlas">{content}</Link> : <div key={category.name} aria-disabled="true">{content}</div>;
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
