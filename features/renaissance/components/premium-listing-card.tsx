import Link from "next/link";
import { ArrowRight, Clock, Heart, ShieldCheck, Star } from "lucide-react";
import { TrustBadge } from "@/features/renaissance/components/trust-badge";

type PremiumListingCardProps = {
  id: string;
  title: string;
  price: string;
  condition: string;
  category: string;
  seller: string;
  trustScore: number;
  secure: boolean;
  imageSrc: string;
};

function Studs({ rows = 2, columns = 4, className = "" }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={`grid gap-1.5 ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: rows * columns }).map((_, index) => (
        <span key={index} className="h-3 rounded-full bg-white/45 shadow-inner" />
      ))}
    </div>
  );
}

function PremiumBuildVisual({ title, category }: { title: string; category: string }) {
  const value = `${title} ${category}`.toLowerCase();
  const sealed = value.includes("sealed") || value.includes("icons");
  const space = value.includes("space") || value.includes("blacktron") || value.includes("starfighter");

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fbf4e8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_24%,rgba(250,204,21,0.34),transparent_30%),linear-gradient(135deg,#fff7e6,#ead7b8)]" />
      <div className="absolute left-1/2 top-1/2 h-52 w-72 -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-white/65 bg-white/62 shadow-[0_28px_70px_rgba(43,30,18,0.16)]" />
      <div className="absolute left-1/2 top-1/2 h-40 w-60 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 group-hover:scale-105">
        {sealed ? (
          <>
            <span className="absolute bottom-5 left-8 h-28 w-40 rounded-2xl bg-red-600 shadow-[0_24px_50px_rgba(43,30,18,0.18)]" />
            <span className="absolute bottom-5 left-8 h-9 w-40 rounded-b-2xl bg-slate-950" />
            <span className="absolute left-14 top-12 h-14 w-28 rounded-xl bg-yellow-300" />
            <Studs rows={2} columns={5} className="absolute left-16 top-[60px] w-24" />
          </>
        ) : space ? (
          <>
            <span className="absolute bottom-12 left-8 h-14 w-40 rounded-full bg-white shadow-[0_24px_50px_rgba(43,30,18,0.16)]" />
            <span className="absolute bottom-[72px] left-[88px] h-12 w-20 rounded-t-full bg-blue-500" />
            <span className="absolute bottom-7 left-1 h-6 w-28 skew-x-[-25deg] rounded bg-slate-200" />
            <span className="absolute bottom-7 right-1 h-6 w-28 skew-x-[25deg] rounded bg-slate-200" />
            <span className="absolute right-12 top-6 h-7 w-7 rounded-full bg-yellow-300 shadow-[0_0_26px_rgba(250,204,21,0.8)]" />
          </>
        ) : (
          <>
            <span className="absolute bottom-0 left-3 h-28 w-24 rounded-t-2xl bg-amber-300 shadow-[0_24px_50px_rgba(43,30,18,0.18)]" />
            <span className="absolute bottom-0 left-[92px] h-32 w-28 rounded-t-2xl bg-stone-100 shadow-[0_24px_50px_rgba(43,30,18,0.18)]" />
            <span className="absolute bottom-0 right-1 h-24 w-20 rounded-t-2xl bg-emerald-800 shadow-[0_24px_50px_rgba(43,30,18,0.18)]" />
            <span className="absolute left-8 top-6 h-5 w-14 rounded-t-full bg-slate-900" />
            <span className="absolute left-[115px] top-2 h-7 w-16 rounded-t-full bg-red-700" />
            <span className="absolute bottom-0 left-0 h-8 w-full rounded bg-slate-950" />
            <Studs rows={3} columns={3} className="absolute left-8 top-14 w-14" />
            <Studs rows={3} columns={3} className="absolute left-[124px] top-14 w-14" />
          </>
        )}
      </div>
      <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-slate-950 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-300 shadow-lg">
        {category}
      </div>
    </div>
  );
}

export function PremiumListingCard({ id, title, price, condition, category, seller, trustScore, secure }: PremiumListingCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.65rem] border border-[#eadfce] bg-white shadow-[0_20px_70px_rgba(43,30,18,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_95px_rgba(43,30,18,0.16)]">
      <div className="relative aspect-[4/3] bg-slate-100">
        <PremiumBuildVisual title={title} category={category} />
        <button className="absolute right-4 top-4 rounded-full border border-white/70 bg-white/90 p-2 text-slate-700 shadow-sm transition-colors hover:text-red-500" aria-label="Add to watchlist">
          <Heart className="h-4 w-4" />
        </button>
        {secure ? (
          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-yellow-300" />
            Protected by TBX
          </div>
        ) : null}
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-yellow-600">Premier Seller</p>
            <h2 className="mt-2 text-xl font-semibold leading-tight text-slate-950">{title}</h2>
            <p className="mt-2 text-sm text-slate-500">{condition}</p>
          </div>
          <p className="shrink-0 text-xl font-semibold text-slate-950">{price}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TrustBadge score={trustScore} label={seller} compact />
          <span className="inline-flex items-center gap-1 rounded-full border border-[#eadfce] bg-[#fffaf1] px-3 py-1 text-xs font-medium text-slate-600">
            <Clock className="h-3.5 w-3.5" /> Ships within 24h
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#eadfce] bg-white px-3 py-1 text-xs font-medium text-slate-600">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> Collector grade
          </span>
        </div>
        <Link href={`/marketplace/${id}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_28px_rgba(245,179,1,0.22)] transition-colors hover:bg-yellow-300">
          View Listing <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
