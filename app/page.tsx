import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Boxes,
  Heart,
  Home,
  PackageOpen,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  UserRound,
} from "lucide-react";
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
  lego_sets: LegoSetJoin[] | null;
};

type FeaturedSet = {
  set_number: string;
  name: string;
  theme: string | null;
  image_url: string | null;
  year_released: number | null;
  piece_count: number | null;
  completeness_score: number | null;
};

function Brand() {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="TBX home">
      <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#ffd84d]/30 bg-[#ffd84d]/10 shadow-[0_0_30px_rgba(255,216,77,0.08)]">
        <Boxes className="h-6 w-6 text-[#ffd84d]" />
      </span>
      <span>
        <span className="block text-xl font-black tracking-[-0.055em] text-white">TBX</span>
        <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-[#ffd84d]">The Block Exchange</span>
      </span>
    </Link>
  );
}

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Collection", href: "/collection", icon: Boxes },
  { label: "Atlas", href: "/atlas", icon: BookOpen },
  { label: "Market", href: "/marketplace", icon: Store },
  { label: "Profile", href: "/dashboard", icon: UserRound },
];

export default async function HomePage() {
  const supabase = await createClient();
  let user: { id: string } | null = null;
  let featuredSet: FeaturedSet | null = null;
  let listings: Array<Omit<ListingRow, "lego_sets"> & { legoSet: LegoSetJoin }> = [];

  try {
    user = (await supabase.auth.getUser()).data.user;
  } catch {
    user = null;
  }

  try {
    const result = await supabase
      .from("lego_sets")
      .select("set_number, name, theme, image_url, year_released, piece_count, completeness_score")
      .eq("set_number", "10317-1")
      .maybeSingle();
    featuredSet = (result.data as FeaturedSet | null) ?? null;
  } catch {
    featuredSet = null;
  }

  try {
    const result = await supabase
      .from("marketplace_listings")
      .select("id, price_zar, condition, lego_sets(set_number, name, theme, image_url)")
      .eq("status", "live")
      .order("published_at", { ascending: false })
      .limit(4);

    listings = ((result.data ?? []) as ListingRow[]).flatMap((listing) => {
      const legoSet = listing.lego_sets?.[0];
      if (!legoSet) return [];
      const { lego_sets, ...rest } = listing;
      void lego_sets;
      return [{ ...rest, legoSet }];
    });
  } catch {
    listings = [];
  }

  return (
    <div className="min-h-screen bg-[#050915] pb-24 text-white md:pb-0">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050915]/88 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-1.5 md:flex">
            {navItems.slice(0, 4).map(({ label, href, icon: Icon }, index) => (
              <Link key={href} href={href} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${index === 0 ? "bg-[#ffd84d] text-[#050915]" : "text-white/60 hover:bg-white/[0.06] hover:text-white"}`}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button aria-label="Notifications" className="grid h-11 w-11 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-white/75 hover:border-[#ffd84d]/30 hover:text-[#ffd84d]">
              <Bell className="h-5 w-5" />
            </button>
            <Link href={user ? "/dashboard" : "/sign-in"} className="grid h-11 w-11 place-items-center rounded-2xl border border-[#ffd84d]/25 bg-[#ffd84d]/10 font-bold text-[#ffd84d]">
              {user ? "W" : <UserRound className="h-5 w-5" />}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,216,77,0.13),transparent_25rem),radial-gradient(circle_at_12%_18%,rgba(50,90,170,0.18),transparent_30rem)]" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd84d]/20 bg-[#ffd84d]/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ffd84d]">
                  <ShieldCheck className="h-3.5 w-3.5" /> Built for serious collectors
                </div>
                <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.065em] sm:text-7xl lg:text-[5.4rem]">
                  Your collection. <span className="text-[#ffd84d]">Known.</span><br />Valued. Ready.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
                  Document every set, understand its value, protect what matters and trade with confidence.
                </p>
                <form action="/atlas" method="get" className="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-white/[0.09] bg-[#0b1223]/90 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                  <Search className="ml-3 h-5 w-5 shrink-0 text-white/35" />
                  <input name="q" aria-label="Search Atlas" placeholder="Search LEGO by name or set number" className="min-w-0 flex-1 border-0 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:shadow-none" />
                  <button type="submit" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#ffd84d] text-[#050915] hover:bg-[#ffe16f]" aria-label="Search">
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </form>
              </div>

              <div className="relative">
                <div className="tbx-surface overflow-hidden rounded-[2rem] p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">Collection snapshot</p>
                      <p className="mt-3 text-4xl font-black tracking-[-0.05em]">Your TBX home</p>
                    </div>
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ffd84d] text-[#050915]"><Sparkles className="h-6 w-6" /></span>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <Link href={user ? "/collection" : "/sign-in?next=/collection"} className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 hover:border-[#ffd84d]/30 hover:bg-[#ffd84d]/[0.05]">
                      <Boxes className="h-5 w-5 text-[#ffd84d]" />
                      <p className="mt-8 text-2xl font-bold">Collection</p>
                      <p className="mt-1 text-sm text-white/40">Document and protect</p>
                    </Link>
                    <Link href={user ? "/wishlist" : "/sign-in?next=/wishlist"} className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 hover:border-[#ffd84d]/30 hover:bg-[#ffd84d]/[0.05]">
                      <Heart className="h-5 w-5 text-[#ffd84d]" />
                      <p className="mt-8 text-2xl font-bold">Wishlist</p>
                      <p className="mt-1 text-sm text-white/40">Watch what matters</p>
                    </Link>
                  </div>
                  <Link href="/sell" className="mt-3 flex items-center justify-between rounded-2xl bg-[#ffd84d] px-5 py-4 font-bold text-[#050915] hover:bg-[#ffe16f]">
                    List a set for sale <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffd84d]">Atlas spotlight</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">A collector icon</h2></div>
            <Link href="/atlas" className="hidden items-center gap-2 text-sm font-semibold text-white/50 hover:text-[#ffd84d] sm:flex">Explore Atlas <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="mt-7 overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[#0b1223]">
            {featuredSet ? (
              <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
                <div className="relative grid min-h-[300px] place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,216,77,0.13),transparent_55%)] p-8 lg:min-h-[470px]">
                  {featuredSet.image_url ? <img src={featuredSet.image_url} alt={featuredSet.name} className="max-h-[390px] w-full object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,0.45)]" /> : <Boxes className="h-24 w-24 text-[#ffd84d]" />}
                </div>
                <div className="flex flex-col justify-center border-t border-white/[0.06] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-14">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#ffd84d]"><ShieldCheck className="h-4 w-4" /> Atlas verified</div>
                  <p className="mt-7 text-sm font-semibold text-white/35">{featuredSet.theme ?? "LEGO"} · {featuredSet.set_number}</p>
                  <h3 className="mt-2 text-4xl font-black tracking-[-0.045em] sm:text-5xl">{featuredSet.name}</h3>
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {[['Released', featuredSet.year_released ?? '—'], ['Pieces', featuredSet.piece_count?.toLocaleString() ?? '—'], ['Atlas score', `${featuredSet.completeness_score ?? 0}%`]].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"><p className="text-xl font-bold sm:text-2xl">{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/30">{label}</p></div>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href={`/atlas/${encodeURIComponent(featuredSet.set_number)}`} className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#ffd84d] px-5 font-bold text-[#050915] hover:bg-[#ffe16f]">View record <ArrowRight className="h-4 w-4" /></Link>
                    <Link href={`/marketplace?q=${encodeURIComponent(featuredSet.set_number)}`} className="inline-flex h-12 items-center rounded-xl border border-white/[0.09] bg-white/[0.035] px-5 font-semibold text-white/75 hover:border-[#ffd84d]/25 hover:text-white">Find one</Link>
                  </div>
                </div>
              </div>
            ) : <div className="p-12 text-center text-white/45">Atlas spotlight is being prepared.</div>}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffd84d]">Marketplace</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Recently listed</h2></div><Link href="/marketplace" className="flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-[#ffd84d]">View all <ArrowRight className="h-4 w-4" /></Link></div>
          {listings.length ? (
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {listings.map((listing) => (
                <Link key={listing.id} href={`/marketplace/${listing.id}`} className="group overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0b1223] hover:-translate-y-1 hover:border-[#ffd84d]/25">
                  <div className="grid aspect-[4/3] place-items-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07),transparent_65%)] p-5">{listing.legoSet.image_url ? <img src={listing.legoSet.image_url} alt={listing.legoSet.name} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" /> : <PackageOpen className="h-12 w-12 text-white/20" />}</div>
                  <div className="border-t border-white/[0.06] p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#ffd84d]">{listing.legoSet.set_number}</p><h3 className="mt-2 line-clamp-2 min-h-12 font-bold">{listing.legoSet.name}</h3><div className="mt-5 flex items-center justify-between"><span className="text-xs text-white/40">{listing.condition}</span><span className="font-black">R{Number(listing.price_zar).toLocaleString("en-ZA")}</span></div></div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-3xl border border-dashed border-white/[0.1] bg-white/[0.025] p-10 text-center"><TrendingUp className="mx-auto h-8 w-8 text-[#ffd84d]" /><p className="mt-4 font-semibold">The market is getting ready.</p></div>
          )}
        </section>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-[1.4rem] border border-white/[0.09] bg-[#080e1d]/95 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:hidden">
        {navItems.map(({ label, href, icon: Icon }, index) => (
          <Link key={href} href={href} className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold ${index === 0 ? "bg-[#ffd84d] text-[#050915]" : "text-white/45 hover:bg-white/[0.05] hover:text-white"}`}>
            <Icon className="h-5 w-5" /><span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
