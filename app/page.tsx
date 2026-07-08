import Link from "next/link";
import { ArrowRight, BadgeCheck, LockKeyhole, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroShowcase } from "@/features/renaissance/components/hero-showcase";
import { PremiumListingCard } from "@/features/renaissance/components/premium-listing-card";
import { marketplaceListings } from "@/features/renaissance/data/collector-experience.mock";

const categories = [
  {
    title: "Architectural Icons",
    detail: "Original brick-built museums, stations and townhouses.",
    imageSrc: "/images/category-brick-icons.svg",
  },
  {
    title: "Graded Cards",
    detail: "Population-aware slabs with visible provenance.",
    imageSrc: "/images/category-graded-card.svg",
  },
  {
    title: "Vintage Comics",
    detail: "Key issues from golden eras, handled with care.",
    imageSrc: "/images/category-vintage-comic.svg",
  },
  {
    title: "Designer Toys",
    detail: "Artist editions, low runs and gallery releases.",
    imageSrc: "/images/category-designer-toy.svg",
  },
  {
    title: "Game Memorabilia",
    detail: "Rare hardware, sealed games and culture pieces.",
    imageSrc: "/images/category-game-memorabilia.svg",
  },
];

const stories = [
  {
    collector: "Maya Chen",
    title: "From scattered shelves to a documented architectural archive.",
    detail: "Maya tracks provenance, insured value and seller reputation before every acquisition.",
  },
  {
    collector: "Andre Singh",
    title: "A lighthouse study found through a verified private seller.",
    detail: "TBX Secure held funds until condition, parts and dispatch evidence were confirmed.",
  },
  {
    collector: "Nadia Jacobs",
    title: "Gallery-grade toys without the marketplace noise.",
    detail: "Watchlist signals help Nadia move when rare editions surface at credible prices.",
  },
];

const trustReasons = [
  { title: "Escrow protection", detail: "Funds stay protected until the collector confirms delivery.", icon: LockKeyhole },
  { title: "Visible reputation", detail: "Seller trust, verification and history appear before purchase intent.", icon: ShieldCheck },
  { title: "Curated discovery", detail: "Listings are presented like collection pieces, not commodity stock.", icon: Sparkles },
  { title: "Private by design", detail: "Collector identity, value and ownership records stay carefully controlled.", icon: BadgeCheck },
];

const featuredCollectors = [
  { name: "Maya Chen", specialty: "Architectural builds", score: "94", location: "Cape Town" },
  { name: "Elliot Venter", specialty: "Museum editions", score: "97", location: "Johannesburg" },
  { name: "Nadia Jacobs", specialty: "Designer toys", score: "89", location: "Stellenbosch" },
];

const concepts = [
  {
    label: "A - Museum",
    title: "The chosen direction",
    detail: "A warm walnut cabinet, spotlit pieces and calm editorial pacing. This is the world TBX should own.",
  },
  {
    label: "B - Apple × Leica",
    title: "Sharper product theatre",
    detail: "Fewer words, tighter contrast and meticulous close-ups for collectors who care about precision.",
  },
  {
    label: "C - Curator's Atelier",
    title: "A little more wonder",
    detail: "A friendly TBX curator, floating bricks and tactile craft cues without becoming childish.",
  },
];

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
            eyebrow="The trusted marketplace for premium collectibles"
            title="Own with confidence. Trade with trust."
            description="Authenticated pieces. Protected transactions. Built for collectors, by collectors."
            imageLabel="Curated architectural collection"
            imageDetail="Museum-lit original builds, verified sellers and protected value in one trusted destination."
            primarySignal="TBX Secure"
            secondarySignal="Verified 96"
            imageSrc="/images/hero-collector-cabinet.svg"
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
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Trending collections</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-slate-950">Discover what collectors love.</h2>
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
                  <div className="aspect-[4/3] bg-[#fbf4e8] p-4">
                    <img src={category.imageSrc} alt="" className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" />
                  </div>
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
              <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-normal text-slate-950">The human side of provenance.</h2>
              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">TBX should feel like a private viewing, not a stock room. Every story is built around trust, condition, timing and taste.</p>
              <div className="mt-8 rounded-[1.75rem] border border-[#eadfce] bg-[#fffaf1] p-5 shadow-[0_18px_60px_rgba(43,30,18,0.08)]">
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 rounded-2xl bg-yellow-400 shadow-inner">
                    <div className="absolute left-5 top-5 h-10 w-10 rounded-full bg-[#ffd56a]" />
                    <div className="absolute left-8 top-8 h-2 w-2 rounded-full bg-slate-950" />
                    <div className="absolute right-8 top-8 h-2 w-2 rounded-full bg-slate-950" />
                    <div className="absolute bottom-6 left-7 h-2 w-7 rounded-full bg-slate-950/80" />
                    <div className="absolute -bottom-2 left-4 h-8 w-12 rounded-t-2xl bg-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Meet Theo, the TBX curator</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">A warm, original museum guide for onboarding, provenance cues and future collection education.</p>
                  </div>
                </div>
              </div>
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
              <h2 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950">Collector-grade listings, beautifully verified.</h2>
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
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal">Trust should be visible before anyone clicks buy.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">The experience leads with reputation, custody, condition and privacy. The design should make confidence feel immediate.</p>
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
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-slate-950">Verified people, not anonymous storefronts.</h2>
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
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Three homepage concepts</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950">Challenge accepted. Museum wins, but the system can flex.</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {concepts.map((concept) => (
                <article key={concept.label} className="rounded-[1.5rem] border border-[#eadfce] bg-[#fffaf1] p-6 shadow-[0_16px_50px_rgba(43,30,18,0.07)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-700">{concept.label}</p>
                  <h3 className="mt-4 text-2xl font-semibold text-slate-950">{concept.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{concept.detail}</p>
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
                <h2 className="mt-6 max-w-2xl text-5xl font-semibold leading-tight tracking-normal">Enter the collector museum built for trust.</h2>
                <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">Start with a watchlist, document your vault, or discover a piece worthy of the cabinet.</p>
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
