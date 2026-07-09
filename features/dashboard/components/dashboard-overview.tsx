import Link from "next/link";
import { ArrowRight, Clock, Package, ShieldCheck, Sparkles, TrendingUp, Vault } from "lucide-react";
import { PremiumListingCard } from "@/features/renaissance/components/premium-listing-card";
import { TrustBadge } from "@/features/renaissance/components/trust-badge";
import { recommendedAcquisitions, recentActivity, trustStatus } from "@/features/renaissance/data/collector-experience.mock";

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[1.5rem] border border-[#eadfce] bg-white p-6 shadow-[0_20px_70px_rgba(43,30,18,0.08)] ${className}`}>{children}</section>;
}

function TrustCard() {
  return (
    <Panel className="h-full bg-slate-950 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-yellow-300">TBX Trust</p>
          <p className="mt-4 text-6xl font-semibold">{trustStatus.score}</p>
          <p className="mt-2 text-sm text-white/65">{trustStatus.level}</p>
        </div>
        <ShieldCheck className="h-9 w-9 text-yellow-300" />
      </div>
      <div className="mt-8 grid gap-3 text-sm">
        {['Identity verified', 'Address verified', 'Payout verified'].map((item) => (
          <div key={item} className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3">
            <span>{item}</span>
            <span className="text-yellow-300">✓</span>
          </div>
        ))}
      </div>
      <Link href="/profile" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-yellow-300">View collector profile <ArrowRight className="h-4 w-4" /></Link>
    </Panel>
  );
}

function CollectionValueCard() {
  return (
    <Panel>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Collection Value</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">R2 486 000</h2>
          <p className="mt-2 text-sm font-medium text-emerald-700">+8.4% this quarter</p>
        </div>
        <TrendingUp className="h-6 w-6 text-yellow-500" />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl bg-[#fffaf1] p-3"><p className="font-semibold">47</p><p className="text-xs text-slate-500">Items</p></div>
        <div className="rounded-2xl bg-[#fffaf1] p-3"><p className="font-semibold">18</p><p className="text-xs text-slate-500">Watched</p></div>
        <div className="rounded-2xl bg-[#fffaf1] p-3"><p className="font-semibold">6</p><p className="text-xs text-slate-500">Selling</p></div>
      </div>
    </Panel>
  );
}

function ActiveOrdersCard() {
  return (
    <Panel>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Protected Orders</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">2 Active</h2>
          <p className="mt-2 text-sm text-slate-500">Both covered by TBX Secure</p>
        </div>
        <Package className="h-6 w-6 text-yellow-500" />
      </div>
      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <div className="rounded-2xl bg-[#fffaf1] p-3">Titanic 10294 — In transit</div>
        <div className="rounded-2xl bg-[#fffaf1] p-3">Assembly Square — Payment protected</div>
      </div>
    </Panel>
  );
}

function WatchlistCard() {
  return (
    <Panel>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Watchlist</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Café Corner dropped R1 200</h2>
        </div>
        <Sparkles className="h-6 w-6 text-yellow-500" />
      </div>
      <Link href="/marketplace" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">View opportunity <ArrowRight className="h-4 w-4" /></Link>
    </Panel>
  );
}

function RecentActivityCard() {
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">Recent Activity</p>
        <Clock className="h-5 w-5 text-yellow-500" />
      </div>
      <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
        {recentActivity.slice(0, 3).map((item) => <p key={item} className="rounded-2xl bg-[#fffaf1] p-3">{item}</p>)}
      </div>
    </Panel>
  );
}

function VaultPreview() {
  return (
    <Panel className="bg-[#fffaf1]">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-slate-500">Vault Preview</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">47 documented pieces. R2.81m insured value.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Your private collector vault tracks proof, condition, insured value and TBX Secure acquisition history.</p>
        </div>
        <Vault className="h-12 w-12 text-yellow-500" />
      </div>
    </Panel>
  );
}

export function DashboardOverview() {
  return (
    <div className="min-h-screen bg-[#fffaf1]">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Good morning, Warren</h1>
          <p className="mt-2 text-slate-600">Your collector dashboard</p>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1"><TrustCard /></div>
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2"><CollectionValueCard /><ActiveOrdersCard /></div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2"><WatchlistCard /><RecentActivityCard /></div>
          </div>
        </div>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Curated For You</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">Recommended acquisitions</h2>
            </div>
            <TrustBadge score={96} label="TBX Secure" compact />
          </div>
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {recommendedAcquisitions.map((listing) => <PremiumListingCard key={listing.id} {...listing} />)}
          </div>
        </section>

        <div className="mt-12"><VaultPreview /></div>
      </main>
    </div>
  );
}
