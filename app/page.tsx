import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  Camera,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Heart,
  PackageOpen,
  Search,
  ShieldCheck,
  Sparkles,
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

const systemModules = [
  {
    label: "Atlas",
    title: "Know every collectible.",
    description: "Identity, history, specifications, rarity and market context in one definitive record.",
    href: "/atlas",
    icon: BookOpen,
  },
  {
    label: "Marketplace",
    title: "Trade with context.",
    description: "Buy and sell against trusted catalogue data instead of guesswork and noisy listings.",
    href: "/marketplace",
    icon: Store,
  },
  {
    label: "Collections",
    title: "Own the full picture.",
    description: "Track what you own, what it is worth and what belongs in your collection next.",
    href: "/collection",
    icon: Boxes,
  },
];

const collectionSignals = [
  { label: "Collection value", value: "R148,420", icon: CircleDollarSign },
  { label: "Items tracked", value: "126", icon: Boxes },
  { label: "Watchlist movement", value: "+8.4%", icon: BarChart3 },
];

function Brand() {
  return (
    <Link href="/" className="group relative flex items-center gap-3" aria-label="TBX home">
      <span className="absolute left-5 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e8c86a]/20 blur-2xl transition group-hover:bg-[#e8c86a]/30" />
      <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a] shadow-[0_0_32px_rgba(232,200,106,0.18)]">
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
    <div className="min-h-screen bg-[#050912] pb-24 text-white md:pb-0">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050912]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 lg:px-10">
          <Brand />

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map(({ label, href }, index) => (
              <Link
                key={href}
                href={href}
                className={
                  index === 0
                    ? "text-sm font-bold text-[#e8c86a] transition hover:text-[#f4d982]"
                    : "text-sm font-semibold text-white/50 transition hover:text-white"
                }
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sell"
              className="hidden h-10 items-center rounded-xl border border-white/10 px-4 text-sm font-bold text-white/75 transition hover:border-[#e8c86a]/30 hover:text-white sm:inline-flex"
            >
              Sell a collection
            </Link>
            <Link
              href={user ? "/dashboard" : "/sign-in"}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-[#e8c86a]/35 hover:text-[#e8c86a]"
              aria-label={user ? "Open dashboard" : "Sign in"}
            >
              {user ? "W" : <UserRound className="h-4 w-4" />}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(232,200,106,0.12),transparent_27rem)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e8c86a]/35 to-transparent" />

          <div className="relative mx-auto grid min-h-[760px] max-w-[1440px] items-center gap-16 px-5 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e8c86a]">
                <Sparkles className="h-3.5 w-3.5" />
                The operating system for collectibles
              </div>

              <h1 className="mt-8 text-6xl font-black leading-[0.88] tracking-[-0.075em] sm:text-7xl lg:text-[7.25rem]">
                Every collectible.
                <span className="block text-[#e8c86a]">One intelligent system.</span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/55 sm:text-xl">
                Discover what you own, understand what it is worth, organise every collection and trade with confidence.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/atlas"
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#e8c86a] px-7 font-bold text-[#050912] transition hover:-translate-y-0.5 hover:bg-[#f1d478]"
                >
                  Explore Atlas <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/collection"
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/[0.035] px-7 font-bold text-white/80 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
                >
                  Build your collection
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/38">
                {[
                  "Identify",
                  "Catalogue",
                  "Value",
                  "Collect",
                  "Trade",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#e8c86a]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative min-h-[500px] lg:min-h-[620px]">
              <div className="absolute inset-10 rounded-full bg-[#e8c86a]/10 blur-3xl" />

              <div className="absolute inset-x-0 top-10 overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#09111f]/92 shadow-[0_40px_120px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e8c86a]">Atlas record</p>
                    <p className="mt-1 text-sm font-semibold text-white/70">Collector intelligence</p>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                    Verified
                  </span>
                </div>

                <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="relative grid min-h-[330px] place-items-center border-b border-white/[0.07] bg-white/[0.018] p-8 lg:border-b-0 lg:border-r">
                    {featuredSet?.image_url ? (
                      <img
                        src={featuredSet.image_url}
                        alt={featuredSet.name}
                        className="max-h-[300px] w-full object-contain drop-shadow-[0_35px_50px_rgba(0,0,0,0.48)]"
                      />
                    ) : (
                      <Boxes className="h-36 w-36 text-[#e8c86a]/45" />
                    )}
                  </div>

                  <div className="flex flex-col justify-between p-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30">
                        LEGO · {featuredSet?.set_number ?? "10317-1"}
                      </p>
                      <h2 className="mt-3 text-3xl font-black tracking-[-0.045em]">
                        {featuredSet?.name ?? "Land Rover Classic Defender 90"}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-white/42">
                        A definitive object record combining catalogue data, ownership context and market intelligence.
                      </p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3">
                      {[
                        ["Released", featuredSet?.year_released ?? "2023"],
                        ["Pieces", featuredSet?.piece_count?.toLocaleString("en-ZA") ?? "2,336"],
                        ["Category", featuredSet?.theme ?? "Icons"],
                        ["Status", "Collector ready"],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-white/28">{label}</p>
                          <p className="mt-1 text-sm font-bold text-white/75">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-t border-white/[0.07]">
                  {[
                    ["Catalogue quality", "96/100"],
                    ["Market confidence", "High"],
                    ["Collector demand", "Rising"],
                  ].map(([label, value], index) => (
                    <div key={label} className={`px-4 py-4 ${index ? "border-l border-white/[0.07]" : ""}`}>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">{label}</p>
                      <p className="mt-1 text-sm font-bold text-white/75">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#e8c86a]">Atlas</p>
              <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl">
                The intelligence layer for collecting.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/45 lg:justify-self-end">
              Atlas turns scattered product data into one trusted collectible identity. LEGO is first. The system is built for every category that follows.
            </p>
          </div>

          <form
            action="/atlas"
            method="get"
            className="mt-14 flex items-center gap-3 rounded-[1.75rem] border border-white/10 bg-[#0a111e] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.28)]"
          >
            <Search className="ml-3 h-6 w-6 shrink-0 text-white/28" />
            <input
              name="q"
              aria-label="Search Atlas"
              placeholder="Search any collectible, model, set number or barcode"
              className="min-w-0 flex-1 bg-transparent px-2 py-4 text-base outline-none placeholder:text-white/25 sm:text-lg"
            />
            <button
              type="submit"
              className="inline-flex h-14 shrink-0 items-center gap-2 rounded-2xl bg-[#e8c86a] px-5 font-bold text-[#050912] transition hover:bg-[#f1d478]"
              aria-label="Search"
            >
              <span className="hidden sm:inline">Search Atlas</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              "Rivendell",
              "Porsche 911",
              "Millennium Falcon",
              "Hot Wheels Skyline",
              "Charizard",
            ].map((term) => (
              <Link
                key={term}
                href={`/atlas?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-white/[0.08] px-4 py-2 text-sm text-white/38 transition hover:border-[#e8c86a]/25 hover:text-[#e8c86a]"
              >
                {term}
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto max-w-[1440px] px-5 py-24 lg:px-10 lg:py-32">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#e8c86a]">The TBX system</p>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-6xl">
                One platform. Every part of collecting.
              </h2>
            </div>

            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {systemModules.map(({ label, title, description, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex min-h-[330px] flex-col justify-between rounded-[1.75rem] border border-white/[0.07] bg-[#08101c] p-7 transition hover:-translate-y-1 hover:border-[#e8c86a]/25"
                >
                  <div>
                    <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] text-[#e8c86a]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-white/28">{label}</p>
                    <h3 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em]">{title}</h3>
                    <p className="mt-4 max-w-sm leading-7 text-white/42">{description}</p>
                  </div>
                  <span className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-[#e8c86a]">
                    Open {label} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-24 lg:px-10 lg:py-32">
          <div className="overflow-hidden rounded-[2rem] border border-[#e8c86a]/18 bg-[#0a111d]">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#e8c86a]/20 bg-[#e8c86a]/[0.07] text-[#e8c86a]">
                  <Camera className="h-5 w-5" />
                </div>
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-[#e8c86a]">Sell your collection</p>
                <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl">
                  From collection to market, beautifully.
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-8 text-white/48">
                  Start with photos or a known item. TBX identifies, structures and prepares your collection for the marketplace with less effort and better information.
                </p>

                <div className="mt-8 space-y-3 text-sm text-white/58">
                  {["Identify unknown items", "Create accurate catalogue records", "Prepare trusted marketplace listings"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e8c86a]/10 text-[#e8c86a]">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>

                <Link
                  href="/sell"
                  className="mt-10 inline-flex h-14 w-fit items-center gap-3 rounded-2xl bg-[#e8c86a] px-7 font-bold text-[#050912] transition hover:-translate-y-0.5 hover:bg-[#f1d478]"
                >
                  Start selling <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              <div className="relative min-h-[520px] border-t border-white/[0.07] bg-[#070d17] p-6 lg:border-l lg:border-t-0 lg:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_38%,rgba(232,200,106,0.1),transparent_22rem)]" />
                <div className="relative mx-auto max-w-xl space-y-4">
                  {[
                    { step: "01", title: "Photograph", text: "Capture the collection or individual item.", icon: Camera },
                    { step: "02", title: "Identify", text: "Match it to Atlas or create a structured record.", icon: Search },
                    { step: "03", title: "Prepare", text: "Add condition, ownership and pricing context.", icon: Tag },
                    { step: "04", title: "List", text: "Publish a clean, trusted marketplace listing.", icon: Store },
                  ].map(({ step, title, text, icon: Icon }) => (
                    <div key={step} className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-[#0b1422] text-[#e8c86a]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/24">{step}</span>
                          <h3 className="font-bold">{title}</h3>
                        </div>
                        <p className="mt-1 text-sm text-white/38">{text}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/18" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto max-w-[1440px] px-5 py-24 lg:px-10 lg:py-32">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">Marketplace</p>
                <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-6xl">The market, in motion.</h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/42">
                  Live listings connected to trusted catalogue records, richer context and better buying decisions.
                </p>
              </div>
              <Link href="/marketplace" className="hidden items-center gap-2 text-sm font-bold text-white/45 transition hover:text-[#e8c86a] sm:flex">
                Browse marketplace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {listings.length ? (
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {listings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/marketplace/${listing.id}`}
                    className="group overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[#09111e] transition hover:-translate-y-1 hover:border-[#e8c86a]/25"
                  >
                    <div className="relative grid aspect-[4/3] place-items-center bg-white/[0.02] p-6">
                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Live
                      </div>
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
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e8c86a]">LEGO · {listing.legoSet.set_number}</p>
                      <h3 className="mt-2 line-clamp-2 min-h-12 font-bold">{listing.legoSet.name}</h3>
                      <div className="mt-5 flex items-end justify-between gap-3">
                        <span className="text-xs text-white/34">{listing.condition}</span>
                        <span className="text-lg font-black">R{Number(listing.price_zar).toLocaleString("en-ZA")}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {["Rivendell", "Concorde", "Millennium Falcon", "Porsche 911"].map((name, index) => (
                  <Link
                    key={name}
                    href={`/atlas?q=${encodeURIComponent(name)}`}
                    className="group flex min-h-[270px] flex-col justify-between rounded-[1.75rem] border border-white/[0.07] bg-[#09111e] p-6 transition hover:-translate-y-1 hover:border-[#e8c86a]/25"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Watched
                        </span>
                        <Clock3 className="h-4 w-4 text-white/20" />
                      </div>
                      <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Featured in Atlas</p>
                      <h3 className="mt-4 text-2xl font-black tracking-[-0.04em]">{name}</h3>
                      <p className="mt-3 leading-7 text-white/38">Market intelligence is being prepared for this collectible.</p>
                    </div>
                    <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white/70">
                      Open record <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">Collections</p>
              <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl">
                Your collection should feel personal.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/45">
                A living view of what you own, what it means and how the collection is changing over time.
              </p>
              <Link href="/collection" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#e8c86a]">
                Open your collections <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-[2rem] border border-white/[0.08] bg-[#09111e] p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/28">My collection</p>
                  <h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">Modern Icons</h3>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] text-[#e8c86a]">
                  <Heart className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {collectionSignals.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <Icon className="h-4 w-4 text-[#e8c86a]" />
                    <p className="mt-5 text-2xl font-black tracking-[-0.04em]">{value}</p>
                    <p className="mt-1 text-xs text-white/30">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/[0.07] bg-[#070d17] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/25">Collection health</p>
                    <p className="mt-2 font-bold">Strong catalogue coverage</p>
                  </div>
                  <ShieldCheck className="h-6 w-6 text-emerald-300" />
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full w-[86%] rounded-full bg-[#e8c86a]" />
                </div>
                <div className="mt-3 flex justify-between text-xs text-white/28">
                  <span>86% fully catalogued</span>
                  <span>14% to review</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-5 py-10 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 text-sm text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <p>The operating system for collectibles.</p>
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
