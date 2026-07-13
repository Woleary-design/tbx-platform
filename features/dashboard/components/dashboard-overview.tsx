import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Heart, LibraryBig, PackageOpen, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type JoinedSet = {
  set_number: string;
  name: string;
  theme: string | null;
  image_url: string | null;
};

type ListingRow = {
  id: string;
  price_zar: number | string;
  condition: string;
  confidence_score: number;
  dispatch_days: number;
  lego_sets: JoinedSet[] | null;
};

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[1.5rem] border border-[#eadfce] bg-white p-6 shadow-[0_20px_70px_rgba(43,30,18,0.08)] ${className}`}>
      {children}
    </section>
  );
}

function StatCard({ label, value, detail, href, icon: Icon }: {
  label: string;
  value: number;
  detail: string;
  href: string;
  icon: typeof LibraryBig;
}) {
  return (
    <Panel>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-4xl font-semibold text-slate-950">{value.toLocaleString("en-ZA")}</p>
          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fffaf1] text-yellow-600">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
        Open <ArrowRight className="h-4 w-4" />
      </Link>
    </Panel>
  );
}

export async function DashboardOverview() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const [collectionResult, wantsResult, sellingResult, listingsResult] = await Promise.all([
    user
      ? supabase.from("assets").select("id", { count: "exact", head: true }).eq("owner_id", user.id)
      : Promise.resolve({ count: 0 }),
    user
      ? supabase.from("collector_wants").select("id", { count: "exact", head: true }).eq("collector_id", user.id)
      : Promise.resolve({ count: 0 }),
    user
      ? supabase.from("marketplace_listings").select("id", { count: "exact", head: true }).eq("seller_id", user.id).eq("status", "live")
      : Promise.resolve({ count: 0 }),
    supabase
      .from("marketplace_listings")
      .select("id, price_zar, condition, confidence_score, dispatch_days, lego_sets(set_number, name, theme, image_url)")
      .eq("status", "live")
      .order("published_at", { ascending: false })
      .limit(3),
  ]);

  const collectionCount = collectionResult.count ?? 0;
  const wantsCount = wantsResult.count ?? 0;
  const sellingCount = sellingResult.count ?? 0;
  const listings = ((listingsResult.data ?? []) as unknown as ListingRow[]).flatMap((listing) => {
    const set = listing.lego_sets?.[0];
    return set ? [{ ...listing, set }] : [];
  });

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Collector";

  return (
    <div className="min-h-screen bg-[#fffaf1]">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Your TBX home</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Welcome, {displayName}</h1>
            <p className="mt-2 text-slate-600">Real collection activity only. No placeholders or invented marketplace data.</p>
          </div>
          <Button asChild className="h-11 rounded-xl bg-yellow-400 px-5 font-semibold text-slate-950 hover:bg-yellow-300">
            <Link href="/sell">Sell LEGO</Link>
          </Button>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <StatCard label="My Collection" value={collectionCount} detail="Private Collection Records" href="/collection" icon={LibraryBig} />
          <StatCard label="My Wants" value={wantsCount} detail="LEGO sets you want to find" href="/wants" icon={Heart} />
          <StatCard label="Selling" value={sellingCount} detail="Your live fixed-price listings" href="/marketplace" icon={ShoppingBag} />
        </div>

        <section className="mt-12">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600"><Sparkles className="h-4 w-4" /> Buy LEGO</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Newest live listings</h2>
            </div>
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">View all live listings <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {listings.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {listings.map((listing) => (
                <Link key={listing.id} href={`/marketplace/${listing.id}`} className="overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-white shadow-[0_18px_60px_rgba(43,30,18,0.08)] transition hover:-translate-y-1">
                  <div className="grid aspect-[4/3] place-items-center bg-[#fffaf1] p-6">
                    {listing.set.image_url ? <img src={listing.set.image_url} alt={listing.set.name} className="h-full w-full object-contain" /> : <PackageOpen className="h-12 w-12 text-slate-300" />}
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-600">LEGO {listing.set.set_number}</p>
                    <div className="mt-2 flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold text-slate-950">{listing.set.name}</h3>
                      <p className="shrink-0 text-lg font-semibold text-slate-950">R{Number(listing.price_zar).toLocaleString("en-ZA")}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{listing.condition} · Dispatch in {listing.dispatch_days} day{listing.dispatch_days === 1 ? "" : "s"}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Panel className="border-dashed text-center">
              <PackageOpen className="mx-auto h-10 w-10 text-yellow-600" />
              <h3 className="mt-4 text-2xl font-semibold text-slate-950">No LEGO is currently listed for sale.</h3>
              <p className="mx-auto mt-2 max-w-xl text-slate-600">Buy LEGO only shows real live listings. Add any set to My Wants or list one from your collection.</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild className="rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300"><Link href="/sell">Sell LEGO</Link></Button>
                <Button asChild variant="outline" className="rounded-xl"><Link href="/wants">Add to My Wants</Link></Button>
              </div>
            </Panel>
          )}
        </section>

        <Panel className="mt-12 bg-slate-950 text-white">
          <p className="text-sm font-medium text-yellow-300">My Collection</p>
          <h2 className="mt-3 text-3xl font-semibold">Your collection stays private.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Collection Records remain yours. Listing a set for sale creates a public fixed-price listing without exposing the rest of your collection or private ownership information.</p>
          <Link href="/collection" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-yellow-300">Open My Collection <ArrowRight className="h-4 w-4" /></Link>
        </Panel>
      </main>
    </div>
  );
}
