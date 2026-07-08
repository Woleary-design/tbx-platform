import Link from "next/link";
import { ArrowRight, BadgeCheck, LockKeyhole, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroShowcase } from "@/features/renaissance/components/hero-showcase";
import { PremiumListingCard } from "@/features/renaissance/components/premium-listing-card";
import { marketplaceListings } from "@/features/renaissance/data/collector-experience.mock";

const categories = [
  {
    title: "UCS Display Grails",
    detail: "Flagship 18+ centrepieces, verified against market heat and seller history.",
    accent: "bg-slate-900",
  },
  {
    title: "2026 Modular Watch",
    detail: "Launch-window modular inventory, tracked before supply and pricing settle.",
    accent: "bg-yellow-400",
  },
  {
    title: "Smart Play Era",
    detail: "New tech-led LEGO releases with collector curiosity and early demand signals.",
    accent: "bg-blue-600",
  },
  {
    title: "Classic Space Return",
    detail: "Blacktron, space nostalgia and sealed archive lots with visible provenance.",
    accent: "bg-slate-950",
  },
  {
    title: "Sealed 18+ Icons",
    detail: "Factory-sealed adult collector sets where box condition drives value.",
    accent: "bg-red-600",
  },
];

const stories = [
  {
    collector: "Maya Chen",
    title: "A UCS flagship watchlist built before launch-week noise.",
    detail: "Maya tracks seller reputation, allocation quality and protected payment readiness before making a move.",
  },
  {
    collector: "Andre Singh",
    title: "A 2026 modular lead found through a verified private seller.",
    detail: "TBX Secure keeps the deal calm while condition photos, packaging and dispatch evidence are checked.",
  },
  {
    collector: "Nadia Jacobs",
    title: "Blacktron-era nostalgia without anonymous marketplace chaos.",
    detail: "Watchlist signals help Nadia spot credible sealed listings and complete archive lots before they spike.",
  },
];

const trustReasons = [
  { title: "Escrow protection", detail: "Funds stay protected until the collector confirms delivery.", icon: LockKeyhole },
  { title: "Visible reputation", detail: "Seller trust, verification and history appear before purchase intent.", icon: ShieldCheck },
  { title: "Collector-grade listings", detail: "Condition, seals, completeness and box quality are treated as first-class details.", icon: Sparkles },
  { title: "Private by design", detail: "Collector identity, value and ownership records stay carefully controlled.", icon: BadgeCheck },
];

const featuredCollectors = [
  { name: "Maya Chen", specialty: "UCS display grails", score: "94", location: "Cape Town" },
  { name: "Elliot Venter", specialty: "Sealed 18+ Icons", score: "97", location: "Johannesburg" },
  { name: "Nadia Jacobs", specialty: "Classic Space return", score: "89", location: "Stellenbosch" },
];

const principles = [
  {
    label: "Current Heat",
    title: "TBX should follow the sets collectors are chasing now.",
    detail: "UCS flagships, modular launches, sealed 18+ Icons and nostalgia waves are presented as market signals, not stale shelf filler.",
  },
  {
    label: "Trust Visible",
    title: "Seller reputation is part of the product.",
    detail: "Trust scores, verification and transaction history sit close to price and condition.",
  },
  {
    label: "Collector Calm",
    title: "A quieter way to trade LEGO.",
    detail: "The experience should feel curated, premium and focused, not like a noisy auction feed.",
  },
];

function CategoryVisual({ accent, title }: { accent: string; title: string }) {
  const isUcs = title.includes("UCS");
  const isSmart = title.includes("Smart");
  const isSpace = title.includes("Space");
  const isSealed = title.includes("Sealed");

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-[#fbf4e8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_28%,rgba(250,204,21,0.28),transparent_28%),linear-gradient(135deg,#fff7e6,#f2dfbf)]" />
      <div className="absolute left-1/2 top-1/2 h-24 w-32 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/70 shadow-[0_18px_45px_rgba(43,30,18,0.15)]" />
      {isUcs ? (
        <div className="absolute left-1/2 top-1/2 h-20 w-28 -translate-x-1/2 -translate-y-1/2 rounded-t-full border-[8px] border-slate-300 border-b-0 bg-slate-950 shadow-[0_14px_28px_rgba(43,30,18,0.18)]" />
      ) : isSmart ? (
        <div className="absolute left-1/2 top-1/2 h-16 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_14px_28px_rgba(43,30,18,0.18)]">
          <span className="absolute right-3 top-2 h-5 w-5 rounded-full bg-yellow-300 shadow-[0_0_22px_rgba(250,204,21,0.75)]" />
          <span className="absolute left-8 top-5 h-8 w-12 rounded-t-full bg-blue-500" />
        </div>
      ) : isSpace ? (
        <div className="absolute left-1/2 top-1/2 h-16 w-32 -translate-x-1/2 -translate-y-1/2 rounded-[1rem] bg-slate-950 shadow-[0_14px_28px_rgba(43,30,18,0.18)]">
          <span className="absolute left-1/2 top-3 h-7 w-12 -translate-x-1/2 rounded-t-full bg-yellow-300" />
          <span className="absolute -bottom-3 left-1 h-5 w-20 -skew-x-[24deg] rounded bg-slate-950" />
          <span className="absolute -bottom-3 right-1 h-5 w-20 skew-x-[24deg] rounded bg-slate-950" />
        </div>
      ) : (
        <div className={`absolute left-1/2 top-1/2 h-16 w-24 -translate-x-1/2 -translate-y-1/2 rounded-xl ${accent} shadow-[0_14px_28px_rgba(43,30,18,0.18)]`}>
          <div className="grid grid-cols-3 gap-2 p-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <span key={index} className="h-4 rounded-full bg-white/35 shadow-inner" />
            ))}
          </div>
          <span className={`absolute bottom-0 left-0 h-4 w-full rounded-b-xl ${isSealed ? "bg-slate-950" : "bg-slate-950/80"}`} />
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const previewListings = marketplaceListings.slice(0, 3);

  return (
    <div className="min-h-screen overflow-hidden bg-[#fffaf1] text-slate-950">
      <header className="border-b border-[#eadfce] bg-[#fffaf1]/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-normal text-slate-950 sm:text-base">
            <span className="grid h-10 w-10 grid-cols-2 gap-1 rounded-xl p-1 shadow-sm">
              <span className="rounded bg-slate-950" />
              <span className="rounded bg-slate-950" />
              <span className="rounded bg-slate-950" />
              <span className="rounded bg-yellow-400" />
            </span>
            <span className="leading-tight">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.32em] text-yellow-600">The</span>
              <span className="block text-lg font-semibold">Block Exchange</span>
            </span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
            <Link className="transition-colors hover:text-slate-950" href="/marketplace">Marketplace</Link>
            <Link className="transition-colors hover:text-slate-950" href="/insights">Collections</Link>
            <Link className="transition-colors hover:text-slate-950" href="/vault">Vault</Link>
            <Link className="transition-colors hover:text-slate-950" href="/marketplace">Sell</Link>
            <Link className="transition-colors hover:text-slate-950" href="#trust">About</Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Button asChild variant="ghost" className="hidden h-10 w-10 rounded-full p-0 text-slate-950 sm:inline-flex" aria-label="Search">
              <Link href="/marketplace"><Search className="h-5 w-5" /></Link>
            </Button>
            <Link className="hidden text-slate-700 transition-colors hover:text-slate-950 sm:inline" href="/dashboard">
              Sign in
            </Link>
            <Button asChild size="sm" className="h-11 rounded-xl bg-yellow-400 px-5 font-semibold text-slate-950 shadow-[0_12px_28px_rgba(245,179,1,0.28)] hover:bg-yellow-300">
              <Link href="/dashboard">Join TBX</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
          <div className="pointer-events-none absolute left-1/2 top-8 hidden h-16 w-16 -translate-x-[420px] rounded-[1.25rem] bg-yellow-400/80 shadow-[0_22px_50px_rgba(245,179,1,0.28)] rotate-12 lg:block" />
          <div className="pointer-events-none absolute bottom-20 left-4 hidden h-10 w-10 rounded-xl bg-red-500/80 shadow-[0_22px_50px_rgba(185,28,28,0.18)] -rotate-12 lg:block" />
          <div className="pointer-events-none absolute bottom-16 right-8 hidden h-12 w-12 rounded-xl bg-blue-500/80 shadow-[0_22px_50px_rgba(37,99,235,0.18)] rotate-12 lg:block" />
          <HeroShowcase
            eyebrow="The trusted marketplace for premium LEGO collectors"
            title="Own with confidence. Trade with trust."
            description="Rare sets, sealed boxes and current collector heat traded with verification, reputation and TBX Secure protection."
            imageLabel="Current LEGO collector cabinet"
            imageDetail="UCS 75419, 2026 modular watchlists, Blacktron return and sealed 18+ grails, presented with seller trust and protected value."
            primarySignal="TBX Secure"
            secondarySignal="Verified 96"
          />
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="rounded-[2rem] border border-[#eadfce] bg-white/80 p-5 shadow-[0_24px_80px_rgba(43,30,18,0.08)] backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trustReasons.map((reason) => {
                const Icon = reason.icon;
                return (
                  <div key={reason.title} className="flex gap-4 border-[#eadfce] p-3 lg:border-r last:border-r-0">
                    <Icon className="mt-1 h-7 w-7 shrink-0 text-yellow-500" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-950">{reason.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{reason.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Current collector heat</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-slate-950">Discover what serious LEGO collectors are watching now.</h2>
              <Link href="/marketplace" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                View all collections <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {categories.map((category) => (
                <Link
                  key={category.title}
                  href="/marketplace"
                  className="group overflow-hidden rounded-2xl border border-[#eadfce] bg-white text-slate-950 shadow-[0_16px_50px_rgba(43,30,18,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_80px_rgba(43,30,18,0.13)]"
                >
                  <CategoryVisual accent={category.accent} title={category.title} />
                  <div className="p-4">
                    <span className="block text-sm font-semibold">{category.title}</span>
                    <span className="mt-2 block text-sm leading-6 text-slate-600">{category.detail}</span>
                    <ArrowRight className="mt-4 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Collector stories</p>
              <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-normal text-slate-950">For the LEGO you never want to explain to a generic marketplace.</h2>
              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">TBX should feel like a private collector room for LEGO: calm, trusted and tuned to what is moving now.</p>
            </div>
            <div className="grid gap-4">
              {stories.map((story) => (
                <article key={story.collector} className="rounded-[1.5rem] border border-[#eadfce] bg-[#fffaf1] p-6 shadow-[0_16px_50px_rgba(43,30,18,0.07)]">
                  <p className="text-sm font-semibold text-yellow-700">{story.collector}</p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight text-slate-950">{story.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{story.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Marketplace preview</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950">Current LEGO listings, beautifully verified.</h2>
            </div>
            <Button asChild variant="outline" className="h-11 rounded-xl border-[#eadfce] bg-white px-5">
              <Link href="/marketplace">Browse marketplace <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {previewListings.map((listing) => (
              <PremiumListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </section>

        <section id="trust" className="bg-slate-950 py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-400">Why trust TBX</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal">The condition report should be as visible as the price.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">Every LEGO trade should make trust obvious: seller history, seal status, completeness, box condition and protected payment.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {trustReasons.map((reason) => {
                const Icon = reason.icon;
                return (
                  <article key={reason.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.24)]">
                    <Icon className="h-7 w-7 text-yellow-400" />
                    <h3 className="mt-5 text-lg font-semibold">{reason.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{reason.detail}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Featured collectors</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-slate-950">Verified LEGO people, not anonymous storefronts.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {featuredCollectors.map((collector) => (
                <article key={collector.name} className="rounded-[1.5rem] border border-[#eadfce] bg-white p-6 shadow-[0_16px_50px_rgba(43,30,18,0.07)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-lg font-semibold text-slate-950">
                    {collector.name.split(" ").map((part) => part[0]).join("")}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">{collector.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{collector.specialty}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-[#eadfce] pt-4 text-sm">
                    <span className="text-slate-500">Trust {collector.score}</span>
                    <span className="text-slate-500">{collector.location}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Built for LEGO trading</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950">Not another auction feed.</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {principles.map((principle) => (
                <article key={principle.label} className="rounded-[1.5rem] border border-[#eadfce] bg-[#fffaf1] p-6 shadow-[0_16px_50px_rgba(43,30,18,0.07)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-700">{principle.label}</p>
                  <h3 className="mt-4 text-2xl font-semibold text-slate-950">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{principle.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-16 text-white shadow-[0_30px_100px_rgba(15,23,42,0.22)] sm:px-12">
            <div className="absolute right-10 top-10 h-24 w-24 rounded-[2rem] bg-yellow-400/90 blur-sm" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-yellow-200"><Users className="h-4 w-4" /> Join TBX</p>
                <h2 className="mt-6 max-w-2xl text-5xl font-semibold leading-tight tracking-normal">Enter the trusted home for serious LEGO collectors.</h2>
                <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">Start with a watchlist, document your vault, or discover the current set your collection has been missing.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="h-12 rounded-xl bg-yellow-400 px-6 font-semibold text-slate-950 hover:bg-yellow-300">
                  <Link href="/dashboard">Join TBX <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-xl border-white/20 bg-white/10 px-6 text-white hover:bg-white/15 hover:text-white">
                  <Link href="/marketplace">Explore first</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}