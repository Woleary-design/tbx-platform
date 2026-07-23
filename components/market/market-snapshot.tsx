"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, ExternalLink, Loader2, TrendingUp } from "lucide-react";

type MarketListing = {
  id: string;
  price: number;
  condition: string;
  publishedAt: string | null;
  href: string;
};

type ValueQuote = {
  estimated_value: number | null;
  quick_sale: number | null;
  recommended: number | null;
  premium: number | null;
  confidence: number;
  verified_sales: number;
  active_listings: number;
  last_sale: number | null;
  data_status: string;
};

export type MarketSnapshotData = {
  quote: ValueQuote;
  market: {
    lowestAsking: number | null;
    highestAsking: number | null;
    activeListingCount: number;
    listings: MarketListing[];
  };
};

function money(value: number | null | undefined) {
  return value == null ? "—" : `R${Math.round(value).toLocaleString("en-ZA")}`;
}

export function MarketSnapshot({ data, loading }: { data: MarketSnapshotData | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-sm text-white/45">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reading the current market
      </div>
    );
  }

  if (!data) return null;

  const recommendedLow = data.quote.quick_sale ?? data.market.lowestAsking;
  const recommendedHigh = data.quote.premium ?? data.market.highestAsking;

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-[#e8c86a]/20 bg-[#08101c]">
      <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Live market snapshot</p>
          <h3 className="mt-2 text-2xl font-black tracking-[-0.035em]">See the market before choosing your price.</h3>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-200">
          <BadgeCheck className="h-4 w-4" /> {data.market.activeListingCount} live listing{data.market.activeListingCount === 1 ? "" : "s"}
        </div>
      </div>

      <div className="grid gap-px bg-white/[0.07] sm:grid-cols-3">
        {[
          ["Lowest asking", money(data.market.lowestAsking)],
          ["TBX recommended", money(data.quote.recommended ?? data.quote.estimated_value)],
          ["Highest asking", money(data.market.highestAsking)],
        ].map(([label, value]) => (
          <div key={label} className="bg-[#08101c] p-5">
            <p className="text-xs text-white/35">{label}</p>
            <p className="mt-2 text-2xl font-black tracking-[-0.035em]">{value}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.07] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-white/45">Suggested listing range</p>
            <p className="mt-1 text-3xl font-black tracking-[-0.045em] text-[#e8c86a]">
              {money(recommendedLow)} — {money(recommendedHigh)}
            </p>
          </div>
          <p className="max-w-sm text-xs leading-5 text-white/32">
            Based on current asking prices, verified sales and the selected condition. Asking prices are not guaranteed sale prices.
          </p>
        </div>
      </div>

      {data.market.listings.length ? (
        <div className="border-t border-white/[0.07] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#e8c86a]" />
              <h4 className="font-bold">Current listings</h4>
            </div>
            <span className="text-xs text-white/30">Lowest price first</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.market.listings.slice(0, 6).map((listing) => (
              <Link
                key={listing.id}
                href={listing.href}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:border-[#e8c86a]/25 hover:bg-white/[0.045]"
              >
                <div>
                  <p className="text-lg font-black">{money(listing.price)}</p>
                  <p className="mt-1 text-xs text-white/38">{listing.condition}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-white/25 transition group-hover:text-[#e8c86a]" />
              </Link>
            ))}
          </div>
          <Link href="/marketplace" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#e8c86a]">
            Browse the full marketplace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="border-t border-white/[0.07] p-5 text-sm leading-6 text-white/40">
          There are no live TBX listings for this item yet. The TBX value guide is based on the available market record and will improve as verified activity grows.
        </div>
      )}
    </section>
  );
}
