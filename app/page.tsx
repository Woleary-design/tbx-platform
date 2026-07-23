import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  Camera,
  Check,
  CircleDollarSign,
  Clock3,
  Heart,
  PackageOpen,
  ScanSearch,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Upload,
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

const navItems = [
  { label: "TBX Snap", href: "/snap" },
  { label: "Atlas", href: "/atlas" },
  { label: "Live Market", href: "/marketplace" },
  { label: "Collections", href: "/collection" },
];

const snapSteps = [
  { step: "01", title: "Snap", text: "Take a few photos.", icon: Camera },
  { step: "02", title: "Identify", text: "TBX finds the items.", icon: ScanSearch },
  { step: "03", title: "Value", text: "See a market estimate.", icon: CircleDollarSign },
  { step: "04", title: "Choose", text: "Sell, list or keep.", icon: Store },
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
  let listings: Array<Omit<ListingRow, "lego_sets"> & { legoSet: LegoSetJoin }> = [];

  try {
    user = (await supabase.auth.getUser()).data.user;
  } catch {
    user = null;
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

  const accountHref = user ? "/dashboard" : "/sign-in";

  return (
    <div className="min-h-screen bg-[#050912] pb-24 text-white md:pb-0">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050912]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 lg:px-10">
          <Brand />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            {navItems.map(({ label, href }, index) => (
              <Link key={href} href={href} className={index === 0 ? "text-sm font-bold text-[#e8c86a]" : "text-sm font-semibold text-white/50 transition hover:text-white"}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/snap" className="hidden h-10 items-center rounded-xl border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] px-4 text-sm font-bold text-[#e8c86a] transition hover:bg-[#e8c86a]/10 sm:inline-flex">
              Start with Snap
            </Link>
            <Link href={accountHref} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-[#e8c86a]/35 hover:text-[#e8c86a]" aria-label={user ? "Open dashboard" : "Sign in"}>
              {user ? "W" : <UserRound className="h-4 w-4" />}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_73%_25%,rgba(232,200,106,0.15),transparent_30rem)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e8c86a]/35 to-transparent" />
          <div className="relative mx-auto grid min-h-[800px] max-w-[1440px] items-center gap-16 px-5 py-20 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e8c86a]">
                <Sparkles className="h-3.5 w-3.5" /> TBX Snap
              </div>
              <h1 className="mt-8 text-6xl font-black leading-[0.88] tracking-[-0.075em] sm:text-7xl lg:text-[6.7rem]">
                Know what it&apos;s worth.
                <span className="block text-[#e8c86a]">Sell it smarter.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/55 sm:text-xl">
                Upload a few photos. TBX identifies your collectibles, estimates their value and helps you decide whether to sell or keep them.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/snap" className="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#e8c86a] px-7 font-bold text-[#050912] shadow-[0_16px_50px_rgba(232,200,106,0.16)] transition hover:-translate-y-0.5 hover:bg-[#f1d478]">
                  <Camera className="h-5 w-5" /> Start with TBX Snap <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </Link>
                <Link href="/atlas" className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/[0.035] px-7 font-bold text-white/80 transition hover:-translate-y-0.5 hover:border-[#e8c86a]/25 hover:text-white">
                  Explore Atlas
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/38">
                {["No catalogue needed", "One item or a whole collection", "Powered by Atlas"].map((item) => <span key={item} className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#e8c86a]" />{item}</span>)}
              </div>
            </div>

            <div className="relative rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.48)] sm:p-8">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]">TBX Snap</p><p className="mt-1 text-sm text-white/42">Collection valuation</p></div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">Analysis ready</span>
              </div>
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/[0.12] bg-white/[0.025] p-8 text-center">
                <Upload className="mx-auto h-8 w-8 text-[#e8c86a]" />
                <p className="mt-4 font-bold">Drop collection photos here</p>
                <p className="mt-2 text-sm text-white/34">or tap to upload from your phone</p>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {["34 sets", "2 manuals", "5 incomplete"].map((value) => <div key={value} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-center text-sm font-bold text-white/65">{value}</div>)}
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-[#e8c86a]/18 bg-[#e8c86a]/[0.055] p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">Estimated collection value</p>
                <p className="mt-3 text-4xl font-black tracking-[-0.05em]">R18,500–R22,000</p>
                <p className="mt-2 text-sm text-white/38">Based on Atlas market intelligence</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["Cash offer", "Sell for me", "Keep collection"].map((label) => <div key={label} className="rounded-xl border border-white/[0.07] bg-[#070d17] px-3 py-4 text-center text-xs font-bold text-white/60">{label}</div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-24 lg:px-10 lg:py-32">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#e8c86a]">How TBX Snap works</p>
          <h2 className="mt-5 max-w-3xl text-5xl font-black tracking-[-0.055em] sm:text-6xl">From cupboard to clarity.</h2>
          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {snapSteps.map(({ step, title, text, icon: Icon }) => (
              <div key={step} className="rounded-[1.5rem] border border-white/[0.07] bg-[#09111e] p-6">
                <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/24">{step}</span><Icon className="h-5 w-5 text-[#e8c86a]" /></div>
                <h3 className="mt-8 text-2xl font-black">{title}</h3><p className="mt-3 text-white/42">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10 lg:py-32">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#e8c86a]">Powered by Atlas</p>
              <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl">Every item becomes a trusted record.</h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/45">Atlas handles identity, market history, ownership and value behind the scenes—so casual sellers never have to catalogue anything manually.</p>
              <Link href="/atlas" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#e8c86a]">Explore Atlas <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <form action="/atlas" method="get" className="flex items-center gap-3 rounded-[1.75rem] border border-white/10 bg-[#0a111e] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.28)]">
              <Search className="ml-3 h-6 w-6 shrink-0 text-white/28" />
              <input name="q" aria-label="Search Atlas" placeholder="Search any collectible or set number" className="min-w-0 flex-1 bg-transparent px-2 py-4 text-base outline-none placeholder:text-white/25" />
              <button type="submit" className="inline-flex h-14 shrink-0 items-center gap-2 rounded-2xl bg-[#e8c86a] px-5 font-bold text-[#050912]">Search <ArrowRight className="h-5 w-5" /></button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-24 lg:px-10 lg:py-32">
          <div className="flex items-end justify-between gap-6">
            <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">Live Market</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-6xl">The market, in motion.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-white/42">Snap creates better inventory. Atlas creates better context. Buyers get more confidence.</p></div>
            <Link href="/marketplace" className="hidden items-center gap-2 text-sm font-bold text-white/45 transition hover:text-[#e8c86a] sm:flex">Browse market <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {listings.length ? listings.map((listing) => (
              <Link key={listing.id} href={`/marketplace/${listing.id}`} className="group overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[#09111e] transition hover:-translate-y-1 hover:border-[#e8c86a]/25">
                <div className="relative grid aspect-[4/3] place-items-center bg-white/[0.02] p-6">
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Live</div>
                  {listing.legoSet.image_url ? <img src={listing.legoSet.image_url} alt={listing.legoSet.name} className="h-full w-full object-contain" /> : <PackageOpen className="h-12 w-12 text-white/20" />}
                </div>
                <div className="border-t border-white/[0.06] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e8c86a]">LEGO · {listing.legoSet.set_number}</p><h3 className="mt-2 line-clamp-2 min-h-12 font-bold">{listing.legoSet.name}</h3><div className="mt-5 flex items-end justify-between gap-3"><span className="text-xs text-white/34">{listing.condition}</span><span className="text-lg font-black">R{Number(listing.price_zar).toLocaleString("en-ZA")}</span></div></div>
              </Link>
            )) : ["Rivendell", "Concorde", "Millennium Falcon", "Porsche 911"].map((name) => (
              <Link key={name} href={`/atlas?q=${encodeURIComponent(name)}`} className="group flex min-h-[270px] flex-col justify-between rounded-[1.75rem] border border-white/[0.07] bg-[#09111e] p-6 transition hover:-translate-y-1 hover:border-[#e8c86a]/25"><div><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.17em] text-emerald-300">Watched</span><Clock3 className="h-4 w-4 text-white/20" /></div><h3 className="mt-12 text-2xl font-black">{name}</h3><p className="mt-3 text-white/38">Market intelligence is being prepared.</p></div><span className="text-sm font-bold text-[#e8c86a]">Open record →</span></Link>
            ))}
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10 lg:py-32">
            <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">Collections</p><h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl">Build the collection you didn&apos;t know you already had.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-white/45">Every identified item can be kept, tracked and valued without starting over.</p><Link href="/collection" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#e8c86a]">Open Collections <ArrowRight className="h-4 w-4" /></Link></div>
            <div className="rounded-[2rem] border border-white/[0.08] bg-[#09111e] p-7"><div className="flex items-center justify-between border-b border-white/[0.07] pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/28">My collection</p><h3 className="mt-2 text-2xl font-black">Modern Icons</h3></div><Heart className="h-5 w-5 text-[#e8c86a]" /></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{[{ label: "Collection value", value: "R148,420", icon: CircleDollarSign },{ label: "Items tracked", value: "126", icon: Boxes },{ label: "30-day movement", value: "+8.4%", icon: BarChart3 }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"><Icon className="h-4 w-4 text-[#e8c86a]" /><p className="mt-5 text-2xl font-black">{value}</p><p className="mt-1 text-xs text-white/30">{label}</p></div>)}</div><div className="mt-5 rounded-2xl border border-white/[0.07] bg-[#070d17] p-5"><div className="flex items-center justify-between"><p className="font-bold">Strong catalogue coverage</p><ShieldCheck className="h-6 w-6 text-emerald-300" /></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full w-[86%] rounded-full bg-[#e8c86a]" /></div></div></div>
          </div>
        </section>

        <section className="px-5 py-24 lg:px-10 lg:py-32">
          <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] border border-[#e8c86a]/20 bg-[#0b1321] px-7 py-16 sm:px-12 lg:px-16 lg:py-20">
            <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#e8c86a]/10 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end"><div className="max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#e8c86a]">TBX Snap</p><h2 className="mt-5 text-5xl font-black leading-[0.94] tracking-[-0.06em] sm:text-7xl">Ready to see what&apos;s hiding in your cupboard?</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-white/48">Take a few photos. We&apos;ll do the rest.</p></div><Link href="/snap" className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#e8c86a] px-7 font-bold text-[#050912]"><Camera className="h-5 w-5" /> Start with TBX Snap</Link></div>
          </div>
        </section>
      </main>
    </div>
  );
}
