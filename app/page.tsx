import Link from "next/link";
import { ArrowRight, BadgeCheck, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumListingCard } from "@/features/renaissance/components/premium-listing-card";
import { marketplaceListings } from "@/features/renaissance/data/collector-experience.mock";

const trustReasons = [
  { title: "Escrow protection", detail: "Funds stay protected until the collector confirms delivery.", icon: LockKeyhole },
  { title: "Visible reputation", detail: "Seller trust, verification and trading history appear before purchase intent.", icon: ShieldCheck },
  { title: "Collector-grade listings", detail: "Condition, seals, completeness and box quality are treated as first-class details.", icon: Sparkles },
  { title: "Private by design", detail: "Collector identity, value and ownership records stay carefully controlled.", icon: BadgeCheck },
];

const categories = [
  "Star Wars UCS",
  "Retired Modulars",
  "Icons Display",
  "Castle",
  "Vintage Pirates",
];

function FourDotLogo() {
  return (
    <span className="grid h-10 w-10 grid-cols-2 gap-1 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200">
      <span className="rounded bg-slate-950" />
      <span className="rounded bg-slate-950" />
      <span className="rounded bg-slate-950" />
      <span className="rounded bg-yellow-400" />
    </span>
  );
}

export default function HomePage() {
  const previewListings = marketplaceListings.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f6f9fc] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#f6f9fc]/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 font-semibold text-slate-950">
            <FourDotLogo />
            <span className="leading-tight">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.32em] text-yellow-600">The</span>
              <span className="block text-lg font-semibold">Block Exchange</span>
            </span>
          </Link>

          <div className="hidden items-center gap-9 text-sm font-medium text-slate-600 md:flex">
            <Link href="/marketplace" className="hover:text-slate-950">Marketplace</Link>
            <Link href="/collection" className="hover:text-slate-950">My Collection</Link>
            <Link href="/insights" className="hover:text-slate-950">Insights</Link>
            <Link href="/marketplace" className="hover:text-slate-950">Pricing</Link>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="hidden text-slate-600 hover:text-slate-950 sm:inline">Sign In</Link>
            <Button asChild className="h-11 rounded-xl bg-slate-950 px-5 font-semibold text-white hover:bg-slate-800">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden pt-28 lg:pt-36">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                Escrow-protected collector marketplace
              </div>

              <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Own with confidence.
                <br />
                Trade with trust.
              </h1>

              <p className="mt-7 text-pretty text-lg leading-relaxed text-slate-600">
                South Africa&apos;s trusted platform for collectors. Specialising in rare, retired and sealed LEGO sets with verified sellers, protected checkout and transparent condition details.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-12 rounded-xl bg-slate-950 px-6 font-semibold text-white hover:bg-slate-800">
                  <Link href="/marketplace">Browse Marketplace <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-xl border-slate-200 bg-white px-6">
                  <Link href="/marketplace">Start Selling</Link>
                </Button>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
                <span><strong className="text-slate-950">4,821</strong> verified collectors</span>
                <span className="h-4 w-px bg-slate-200" />
                <span><strong className="text-slate-950">R34M</strong> protected value</span>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-950 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-950/10 sm:aspect-[5/4] lg:aspect-[4/5]">
                <img src="https://the-block-exchange-landing-page.vercel.app/hero-cabinet.png" alt="A premium collector display cabinet with beautifully lit LEGO sets" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-5 left-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-950">TBX Secure</p>
                  <p className="text-xs text-slate-500">Funds held in escrow</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_90px_rgba(15,23,42,0.08)] sm:grid-cols-2 lg:grid-cols-4">
            {trustReasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <div key={reason.title} className="p-4">
                  <Icon className="h-7 w-7 text-blue-600" />
                  <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.13em] text-slate-950">{reason.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{reason.detail}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Featured Collectibles</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-slate-950">Verified LEGO sets from trusted collectors.</h2>
              <div className="mt-8 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link key={category} href="/marketplace" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-950">
                    {category}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {previewListings.map((listing) => <PremiumListingCard key={listing.id} {...listing} />)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/20 md:p-12">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">Join TBX</p>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight">A quieter, safer marketplace for premium collectors.</h2>
                <p className="mt-4 max-w-2xl text-slate-300">Build reputation, protect payments and present every collectible with the care it deserves.</p>
              </div>
              <Button asChild className="h-12 rounded-xl bg-white px-6 font-semibold text-slate-950 hover:bg-slate-100">
                <Link href="/dashboard">Get Started <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
