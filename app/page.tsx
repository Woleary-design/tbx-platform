import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Camera,
  PackageOpen,
  Search,
  Store,
  Tag,
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
};

const navItems = [
  { label: "Atlas", href: "/atlas" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Identify", href: "/sell" },
  { label: "Collections", href: "/collection" },
];

const pillars = [
  {
    eyebrow: "Know",
    title: "Explore Atlas",
    description: "Discover collectible details, history and market context.",
    href: "/atlas",
    icon: BookOpen,
  },
  {
    eyebrow: "Trade",
    title: "Marketplace",
    description: "Buy and sell collectible items with confidence.",
    href: "/marketplace",
    icon: Store,
  },
  {
    eyebrow: "Collect",
    title: "Your Collections",
    description: "Keep every item beautifully organised in one place.",
    href: "/collection",
    icon: Boxes,
  },
];

function Brand() {
  return (
    <Link href="/" className="group relative flex items-center gap-3" aria-label="TBX home">
      <span className="absolute left-5 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffd84d]/30 blur-2xl transition group-hover:bg-[#ffd84d]/45" />
      <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#ffd84d]/25 bg-[#0a0f19] text-[#ffd84d] shadow-[0_0_32px_rgba(255,216,77,0.28)]">
        <Boxes className="h-5 w-5" />
      </span>
      <span className="relative text-xl font-black tracking-[-0.055em] text-white">TBX</span>
    </Link>
  );
}

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
      .select("set_number, name, theme, image_url, year_released, piece_count")
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
    <div className="min-h-screen bg-[#060a12] pb-24 text-white md:pb-0">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060a12]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Brand />

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map(({ label, href }, index) => (
              <Link
                key={href}
                href={href}
                className={
                  index === 0
                    ? "text-sm font-bold text-[#ffd84d] transition hover:text-[#ffe16f]"
                    : "text-sm font-semibold text-white/55 transition hover:text-white"
                }
              >
                {label}
              </Link>
            ))}
          </nav>

          <Link
            href={user ? "/dashboard" : "/sign-in"}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-[#ffd84d]/35 hover:text-[#ffd84d]"
            aria-label={user ? "Open dashboard" : "Sign in"}
          >
            {user ? "W" : <UserRound className="h-4 w-4" />}
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_36%,rgba(255,216,77,0.13),transparent_30rem)]" />
          <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-28">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#ffd84d]">
                Collect with confidence
              </p>
              <h1 className="mt-7 text-6xl font-black leading-[0.9] tracking-[-0.07em] sm:text-7xl lg:text-[6.5rem]">
                Know what
                <span className="block text-[#ffd84d]">you own.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-white/55 sm:text-xl">
                Discover, organise, value and trade the collectibles that matter to you.
              </p>
              <Link
                href="/atlas"
                className="mt-10 inline-flex h-14 items-center gap-3 rounded-2xl bg-[#ffd84d] px-7 font-bold text-[#050915] transition hover:-translate-y-0.5 hover:bg-[#ffe16f]"
              >
                Explore Atlas <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="relative flex min-h-[360px] items-center justify-center lg:min-h-[560px]">
              <div className="absolute inset-8 rounded-full bg-[#ffd84d]/12 blur-3xl" />
              {featuredSet?.image_url ? (
                <img
                  src={featuredSet.image_url}
                  alt={featuredSet.name}
                  className="relative max-h-[520px] w-full object-contain drop-shadow-[0_45px_60px_rgba(0,0,0,0.55)]"
                />
              ) : (
                <Boxes className="relative h-40 w-40 text-[#ffd84d]/60" />
              )}
              {featuredSet ? (
                <div className="absolute bottom-3 left-0 rounded-2xl border border-white/10 bg-[#0b111d]/80 px-5 py-4 backdrop-blur-xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffd84d]">Featured in Atlas</p>
                  <p className="mt-1 font-bold">{featuredSet.name}</p>
                  <p className="mt-1 text-xs text-white/40">LEGO · {featuredSet.set_number}</p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-24 lg:px-8 lg:py-32">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#ffd84d]">Atlas</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-5xl">Search the world of collecting.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/45">
              LEGO leads the way today. Hot Wheels and more collectible categories can follow without changing the platform.
            </p>
          </div>

          <form
            action="/atlas"
            method="get"
            className="mx-auto mt-10 flex max-w-4xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-2.5 shadow-[0_30px_90px_rgba(0,0,0,0.32)]"
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-white/35" />
            <input
              name="q"
              aria-label="Search Atlas"
              placeholder="Search Rivendell, Millennium Falcon or 10316"
              className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base outline-none placeholder:text-white/30"
            />
            <button
              type="submit"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#ffd84d] text-[#050915] transition hover:bg-[#ffe16f]"
              aria-label="Search"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/38">
            <span>Popular:</span>
            {["Rivendell", "Concorde", "Millennium Falcon", "Lion Knights Castle"].map((term) => (
              <Link key={term} href={`/atlas?q=${encodeURIComponent(term)}`} className="transition hover:text-[#ffd84d]">
                {term}
              </Link>
            ))}
          </div>
        </section>

        <section className="px-5 pb-24 lg:px-8 lg:pb-32">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#ffd84d]/20 bg-[#ffd84d] px-7 py-14 text-[#050915] sm:px-12 sm:py-16 lg:px-16">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
            <div className="relative max-w-3xl">
              <Camera className="h-8 w-8" />
              <h2 className="mt-7 text-4xl font-black tracking-[-0.05em] sm:text-6xl">Found something collectible?</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#050915]/65">
                Take a few photos. TBX will help identify the item and prepare it for your collection or the marketplace.
              </p>
              <Link
                href="/sell"
                className="mt-8 inline-flex h-14 items-center gap-3 rounded-2xl bg-[#050915] px-7 font-bold text-white transition hover:-translate-y-0.5"
              >
                Start identifying <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.018]">
          <div className="mx-auto grid max-w-7xl gap-px px-5 py-20 md:grid-cols-3 lg:px-8 lg:py-28">
            {pillars.map(({ eyebrow, title, description, href, icon: Icon }) => (
              <Link
                key={title}
                href={href}
                className="group border-white/[0.07] px-2 py-8 first:pt-0 last:pb-0 md:border-l md:px-10 md:py-6 md:first:border-l-0"
              >
                <Icon className="h-6 w-6 text-[#ffd84d]" />
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-white/30">{eyebrow}</p>
                <h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">{title}</h3>
                <p className="mt-3 max-w-xs leading-7 text-white/45">{description}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#ffd84d]">
                  Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ffd84d]">Marketplace</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-5xl">Available now.</h2>
            </div>
            <Link href="/marketplace" className="hidden items-center gap-2 text-sm font-bold text-white/45 transition hover:text-[#ffd84d] sm:flex">
              Browse all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {listings.length ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/marketplace/${listing.id}`}
                  className="group overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[#0b111d] transition hover:-translate-y-1 hover:border-[#ffd84d]/25"
                >
                  <div className="grid aspect-[4/3] place-items-center bg-white/[0.025] p-6">
                    {listing.legoSet.image_url ? (
                      <img
                        src={listing.legoSet.image_url}
                        alt={listing.legoSet.name}
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <PackageOpen className="h-12 w-12 text-white/20" />
                    )}
                  </div>
                  <div className="border-t border-white/[0.06] p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#ffd84d]">LEGO · {listing.legoSet.set_number}</p>
                    <h3 className="mt-2 line-clamp-2 min-h-12 font-bold">{listing.legoSet.name}</h3>
                    <div className="mt-5 flex items-end justify-between gap-3">
                      <span className="text-xs text-white/38">{listing.condition}</span>
                      <span className="text-lg font-black">R{Number(listing.price_zar).toLocaleString("en-ZA")}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {["Rivendell", "Concorde", "Millennium Falcon"].map((name) => (
                <Link
                  key={name}
                  href={`/atlas?q=${encodeURIComponent(name)}`}
                  className="group rounded-[1.75rem] border border-white/[0.07] bg-[#0b111d] p-7 transition hover:-translate-y-1 hover:border-[#ffd84d]/25"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffd84d]">Featured in Atlas</p>
                  <h3 className="mt-4 text-2xl font-black tracking-[-0.04em]">{name}</h3>
                  <p className="mt-3 leading-7 text-white/40">Explore this collectible while marketplace listings are being prepared.</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white/70">
                    View in Atlas <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-5 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <p>The trusted home for collectors.</p>
        </div>
      </footer>

      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-[1.35rem] border border-white/[0.09] bg-[#080e1d]/95 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:hidden">
        {[
          { label: "Atlas", href: "/atlas", icon: BookOpen },
          { label: "Market", href: "/marketplace", icon: Store },
          { label: "Identify", href: "/sell", icon: Tag },
          { label: "Collections", href: "/collection", icon: Boxes },
          { label: "Account", href: user ? "/dashboard" : "/sign-in", icon: UserRound },
        ].map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold text-white/45 transition hover:bg-white/[0.05] hover:text-white"
          >
            <Icon className="h-5 w-5" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
