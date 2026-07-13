import Link from "next/link";
import { ArrowRight, BadgeCheck, LockKeyhole, PackageOpen, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

const trustReasons = [
  { title: "Protected checkout", detail: "TBX manages payment, courier progress and delivery confirmation in one structured flow.", icon: LockKeyhole },
  { title: "Collection-backed listings", detail: "Every item for sale starts from a private Collection Record rather than a blank advert.", icon: ShieldCheck },
  { title: "Collector-grade detail", detail: "Condition, completeness, photos and dispatch expectations are shown before purchase.", icon: Sparkles },
  { title: "Private by design", detail: "Collection ownership and private collector information are never exposed through marketplace browsing.", icon: BadgeCheck },
];

type ListingRow = {
  id: string;
  price_zar: number | string;
  condition: string;
  confidence_score: number;
  dispatch_days: number;
  lego_sets: {
    set_number: string;
    name: string;
    theme: string | null;
    image_url: string | null;
  } | null;
};

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

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("marketplace_listings")
    .select("id, price_zar, condition, confidence_score, dispatch_days, lego_sets(set_number, name, theme, image_url)")
    .eq("status", "live")
    .order("published_at", { ascending: false })
    .limit(3);

  const listings = ((data ?? []) as ListingRow[]).filter((listing) => listing.lego_sets);

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
            <Link href="/marketplace" className="hover:text-slate-950">Buy LEGO</Link>
            <Link href="/collection" className="hover:text-slate-950">My Collection</Link>
            <Link href="/wants" className="hover:text-slate-950">My Wants</Link>
            <Link href="/insights" className="hover:text-slate-950">Insights</Link>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link href="/dashboard" className="hidden text-slate-600 hover:text-slate-950 sm:inline">Sign In</Link>
            <Button asChild className="h-11 rounded-xl bg-yellow-400 px-5 font-semibold text-slate-950 hover:bg-yellow-300">
              <Link href="/sell">Sell LEGO</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden pt-28 lg:pt-36">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-yellow-600" />
                Collection-first LEGO marketplace
              </div>
              <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Your collection comes first.
                <br />
                Selling is one option.
              </h1>
              <p className="mt-7 text-pretty text-lg leading-relaxed text-slate-600">
                Document your LEGO collection privately, add any set to your wishlist, and buy only from real collection-backed listings at a fixed price.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-12 rounded-xl bg-slate-950 px-6 font-semibold text-white hover:bg-slate-800">
                  <Link href="/marketplace">Buy LEGO <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-xl border-slate-200 bg-white px-6">
                  <Link href="/sell">Sell LEGO</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-950 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-950/10 sm:aspect-[5/4] lg:aspect-[4/5]">
                <img src="https://the-block-exchange-landing-page.vercel.app/hero-cabinet.png" alt="A premium collector display cabinet with LEGO sets" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-5 left-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-950">Fixed-price buying</p>
                  <p className="text-xs text-slate-500">No offers. No buyer-seller chat.</p>
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
                  <Icon className="h-7 w-7 text-yellow-600" />
                  <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.13em] text-slate-950">{reason.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{reason.detail}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Available now</p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-slate-950">Real LEGO listings. No placeholders.</h2>
              </div>
              <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950">View Buy LEGO <ArrowRight className="h-4 w-4" /></Link>
            </div>

            {listings.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => {
                  const set = listing.lego_sets!;
                  return (
                    <Link key={listing.id} href={`/marketplace/${listing.id}`} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
                      <div className="grid aspect-[4/3] place-items-center bg-[#fffaf1] p-6">
                        {set.image_url ? <img src={set.image_url} alt={set.name} className="h-full w-full object-contain" /> : <PackageOpen className="h-12 w-12 text-slate-300" />}
                      </div>
                      <div className="p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-600">LEGO {set.set_number}</p>
                        <div className="mt-2 flex items-start justify-between gap-4">
                          <h3 className="text-xl font-semibold text-slate-950">{set.name}</h3>
                          <p className="shrink-0 text-lg font-semibold text-slate-950">R{Number(listing.price_zar).toLocaleString("en-ZA")}</p>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">{listing.condition} · Confidence {listing.confidence_score} · Dispatch in {listing.dispatch_days} day{listing.dispatch_days === 1 ? "" : "s"}</p>
                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">View listing <ArrowRight className="h-4 w-4" /></span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
                <PackageOpen className="mx-auto h-10 w-10 text-yellow-600" />
                <h3 className="mt-4 text-2xl font-semibold text-slate-950">No LEGO is listed for sale yet.</h3>
                <p className="mx-auto mt-2 max-w-xl text-slate-600">TBX will never invent listings to make the marketplace look busy. Add a set to your collection and list it when you are ready.</p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button asChild className="rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300"><Link href="/sell">Sell LEGO</Link></Button>
                  <Button asChild variant="outline" className="rounded-xl"><Link href="/wants">Add to Wishlist</Link></Button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/20 md:p-12">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-yellow-300">Join TBX</p>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight">The private digital home for your LEGO collection.</h2>
                <p className="mt-4 max-w-2xl text-slate-300">Own privately, wishlist any LEGO set, and sell through a structured fixed-price marketplace when you choose.</p>
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
