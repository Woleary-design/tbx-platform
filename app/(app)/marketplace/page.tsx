import { Search, ShieldCheck } from "lucide-react";
import { PremiumListingCard } from "@/features/renaissance/components/premium-listing-card";
import { marketplaceListings } from "@/features/renaissance/data/collector-experience.mock";

const filters = ["All", "Architectural Builds", "Limited Construction", "Museum Architecture", "Glasshouse Builds", "TBX Secure"];

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-8 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-blue-700">
            <ShieldCheck className="h-4 w-4" />
            TBX Secure marketplace
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
            Exceptional collectibles, presented with trust before price.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Browse verified sellers, protected listings and collector-grade pieces curated for provenance, condition and confidence.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400"
            placeholder="Search by piece, seller or category"
          />
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button
            key={filter}
            className={filter === "All" ? "whitespace-nowrap rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white" : "whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"}
          >
            {filter}
          </button>
        ))}
      </div>

      <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {marketplaceListings.map((listing) => (
          <PremiumListingCard key={listing.id} {...listing} />
        ))}
      </section>
    </div>
  );
}
