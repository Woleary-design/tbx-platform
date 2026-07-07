import { Clock, Sparkles } from "lucide-react";
import { CollectionValueCard } from "@/features/renaissance/components/collection-value-card";
import { HeroShowcase } from "@/features/renaissance/components/hero-showcase";
import { MarketMoverCard } from "@/features/renaissance/components/market-mover-card";
import { PremiumListingCard } from "@/features/renaissance/components/premium-listing-card";
import { TrustBadge } from "@/features/renaissance/components/trust-badge";
import { WatchlistOpportunityCard } from "@/features/renaissance/components/watchlist-opportunity-card";
import {
  collectionSummary,
  homeHero,
  marketMovers,
  recentActivity,
  recommendedAcquisitions,
  trustStatus,
  watchlistOpportunities,
} from "@/features/renaissance/data/collector-experience.mock";

export function DashboardOverview() {
  return (
    <div className="space-y-10">
      <HeroShowcase {...homeHero} primaryHref="/marketplace" />

      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <CollectionValueCard {...collectionSummary} />
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Trust status</p>
              <p className="mt-3 text-4xl font-semibold text-slate-950">{trustStatus.score}</p>
            </div>
            <TrustBadge score={trustStatus.score} label={trustStatus.level} />
          </div>
          <p className="mt-8 text-sm leading-6 text-slate-500">{trustStatus.detail}</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
            {['Identity', 'Address', 'Payout'].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="font-medium text-slate-950">{item}</p>
                <p className="mt-1 text-xs text-blue-600">Verified</p>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Watchlist opportunities</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">Pieces worth a closer look</h2>
            </div>
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div className="grid gap-4">
            {watchlistOpportunities.map((opportunity) => (
              <WatchlistOpportunityCard key={opportunity.title} {...opportunity} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Market movers</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Signals shaping the collection</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            {marketMovers.map((mover) => (
              <MarketMoverCard key={mover.title} {...mover} />
            ))}
          </div>
        </section>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-slate-500">Recommended acquisitions</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Collector-grade listings with visible trust</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {recommendedAcquisitions.map((listing) => (
            <PremiumListingCard key={listing.id} {...listing} />
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Recent activity</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Quiet confidence, clearly tracked</h2>
          </div>
          <Clock className="h-5 w-5 text-blue-600" />
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {recentActivity.map((activity) => (
            <div key={activity} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {activity}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
