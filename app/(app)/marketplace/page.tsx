"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import { PremiumListingCard } from "@/features/renaissance/components/premium-listing-card";
import { marketplaceListings } from "@/features/renaissance/data/collector-experience.mock";

const filters = ["All", "Star Wars UCS", "Retired Modulars", "Icons", "Castle", "Vintage", "Sealed", "TBX Secure"];
const sorts = ["Newest", "Price", "TBX Score", "Rarest"];

export default function MarketplacePage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredListings = useMemo(() => {
    const search = query.trim().toLowerCase();
    return marketplaceListings.filter((listing) => {
      const matchesSearch = !search || [listing.title, listing.seller, listing.category, listing.condition]
        .some((value) => value.toLowerCase().includes(search));

      const matchesFilter = activeFilter === "All"
        || (activeFilter === "TBX Secure" && listing.secure)
        || (activeFilter === "Sealed" && listing.condition.toLowerCase().includes("sealed"))
        || listing.category.toLowerCase().includes(activeFilter.toLowerCase().replace("retired ", ""));

      return matchesSearch && matchesFilter;
    });
  }, [query, activeFilter]);

  const featured = filteredListings[0] ?? marketplaceListings[0];

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-slate-950 shadow-[0_28px_100px_rgba(15,23,42,0.16)]">
        <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
          <div className="p-7 text-white md:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-yellow-300">
              <ShieldCheck className="h-4 w-4" /> TBX Secure Marketplace
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">The trusted marketplace for premium LEGO collectors.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">Buy rare, retired and sealed LEGO sets from verified sellers with TBX Secure protection.</p>
          </div>
          <div className="relative min-h-[360px] bg-[#f6f1e8]">
            <img src="https://the-block-exchange-landing-page.vercel.app/hero-cabinet.png" alt="Premium collector cabinet" className="h-full w-full object-cover" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">Featured collectible</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">{featured.title}</p>
              <p className="mt-1 text-sm text-slate-600">{featured.price} · TBX Score {featured.trustScore}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-20 z-20 rounded-[1.5rem] border border-[#eadfce] bg-white/95 p-4 shadow-[0_16px_50px_rgba(43,30,18,0.08)] backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#eadfce] bg-[#fffaf1] pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400"
              placeholder="Search by set name, number, seller or category"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-500" />
            {sorts.map((sort) => <button key={sort} type="button" className="whitespace-nowrap rounded-xl border border-[#eadfce] bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950">{sort}</button>)}
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={filter === activeFilter ? "whitespace-nowrap rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white" : "whitespace-nowrap rounded-full border border-[#eadfce] bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"}>{filter}</button>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600"><Sparkles className="h-4 w-4" /> Marketplace results</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">{filteredListings.length} matching collectible{filteredListings.length === 1 ? "" : "s"}.</h2>
          </div>
        </div>
        {filteredListings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {filteredListings.map((listing) => <PremiumListingCard key={listing.id} {...listing} />)}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[#d9c9af] bg-white p-10 text-center">
            <Search className="mx-auto h-9 w-9 text-yellow-600" />
            <h3 className="mt-4 text-2xl font-semibold text-slate-950">No marketplace match.</h3>
            <p className="mt-2 text-slate-600">Try a set number, seller name or broader category.</p>
          </div>
        )}
      </section>
    </div>
  );
}
