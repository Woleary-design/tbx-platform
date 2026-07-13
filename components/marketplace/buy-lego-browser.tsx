"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, Search, ShieldCheck, ShoppingBag } from "lucide-react";

type Listing = {
  id: string;
  priceZar: number;
  condition: string;
  confidenceScore: number;
  dispatchDays: number;
  setNumber: string;
  setName: string;
  theme: string | null;
  imageUrl: string | null;
};

export function BuyLegoBrowser({ listings }: { listings: Listing[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return listings;
    return listings.filter((listing) =>
      [listing.setName, listing.setNumber, listing.theme ?? "", listing.condition]
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [listings, query]);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)] md:p-10">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">
          <ShieldCheck className="h-4 w-4" /> Fixed-price marketplace
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Buy LEGO with confidence.</h1>
        <p className="mt-4 max-w-2xl text-white/70">Only sets currently listed for sale appear here. No offers, no chat and no catalogue clutter.</p>
      </section>

      <section className="sticky top-20 z-10 rounded-[1.5rem] border border-[#eadfce] bg-white/95 p-4 shadow-[0_16px_50px_rgba(43,30,18,0.08)] backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search sets currently for sale…"
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-base outline-none focus:border-slate-400 focus:bg-white"
          />
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Live listings</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">{filtered.length} set{filtered.length === 1 ? "" : "s"} available</h2>
          </div>
        </div>

        {filtered.length ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((listing) => (
              <Link key={listing.id} href={`/marketplace/${listing.id}`} className="group overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-white shadow-[0_20px_65px_rgba(43,30,18,0.07)] transition hover:-translate-y-1">
                <div className="flex aspect-[4/3] items-center justify-center bg-[#fffaf1] p-6">
                  {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.setName} className="h-full w-full object-contain" /> : <ShoppingBag className="h-14 w-14 text-yellow-500" />}
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">LEGO {listing.setNumber}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{listing.setName}</h3>
                  <p className="mt-2 text-sm text-slate-500">{listing.condition}{listing.theme ? ` · ${listing.theme}` : ""}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-2xl font-semibold text-slate-950">R{listing.priceZar.toLocaleString("en-ZA")}</p>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Confidence {listing.confidenceScore}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">Dispatches within {listing.dispatchDays} day{listing.dispatchDays === 1 ? "" : "s"}</p>
                  <span className="mt-5 inline-flex font-semibold text-slate-950">Buy now →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[2rem] border border-dashed border-[#d9c9af] bg-white p-10 text-center">
            <Heart className="mx-auto h-9 w-9 text-yellow-600" />
            <h3 className="mt-4 text-2xl font-semibold text-slate-950">No matching sets are for sale.</h3>
            <p className="mt-2 text-slate-600">Add the set to My Wants and TBX will notify you when a matching listing appears.</p>
            <Link href="/wants" className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Search all LEGO for My Wants</Link>
          </div>
        )}
      </section>
    </div>
  );
}
