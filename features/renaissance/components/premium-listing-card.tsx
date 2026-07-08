import { Heart, ShieldCheck } from "lucide-react";
import { TrustBadge } from "@/features/renaissance/components/trust-badge";

type PremiumListingCardProps = {
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

function UcsVisual() {
  return (
    <div className="absolute left-1/2 top-1/2 h-40 w-56 -translate-x-1/2 -translate-y-1/2">
      <span className="absolute bottom-9 left-8 h-28 w-40 rounded-t-full border-[12px] border-slate-300 border-b-0 bg-slate-900 shadow-[0_24px_50px_rgba(43,30,18,0.22)]" />
      <span className="absolute bottom-14 left-[82px] h-16 w-16 rounded-full border-[7px] border-white bg-slate-500" />
      <span className="absolute bottom-12 left-[104px] h-8 w-8 rounded-full bg-slate-950" />
      <span className="absolute bottom-7 left-4 h-5 w-48 rounded-full bg-slate-100" />
      <span className="absolute bottom-4 left-16 h-2 w-28 rounded-full bg-red-500" />
    </div>
  );
}

function ModularVisual() {
  return (
    <div className="absolute left-1/2 top-1/2 h-40 w-60 -translate-x-1/2 -translate-y-1/2">
      <span className="absolute bottom-0 left-3 h-28 w-24 rounded-t-2xl bg-amber-300 shadow-[0_24px_50px_rgba(43,30,18,0.18)]" />
      <span className="absolute bottom-0 left-[92px] h-32 w-28 rounded-t-2xl bg-stone-100 shadow-[0_24px_50px_rgba(43,30,18,0.18)]" />
      <span className="absolute bottom-0 right-1 h-24 w-20 rounded-t-2xl bg-emerald-800 shadow-[0_24px_50px_rgba(43,30,18,0.18)]" />
      <span className="absolute left-8 top-6 h-5 w-14 rounded-t-full bg-slate-900" />
      <span className="absolute left-[115px] top-2 h-7 w-16 rounded-t-full bg-red-700" />
      <span className="absolute bottom-0 left-0 h-8 w-full rounded bg-slate-950" />
      <Studs rows={3} columns={3} className="absolute left-8 top-14 w-14" />
      <Studs rows={3} columns={3} className="absolute left-[124px] top-14 w-14" />
      <span className="absolute bottom-8 right-7 h-5 w-12 rounded-t-md bg-yellow-400" />
    </div>
  );
}

function BlacktronVisual() {
  return (
    <div className="absolute left-1/2 top-1/2 h-40 w-56 -translate-x-1/2 -translate-y-1/2">
      <span className="absolute bottom-9 left-10 h-20 w-36 rounded-[1.4rem] bg-slate-950 shadow-[0_24px_50px_rgba(43,30,18,0.24)]" />
      <span className="absolute bottom-16 left-[82px] h-11 w-20 rounded-t-full bg-yellow-300" />
      <span className="absolute bottom-4 left-2 h-8 w-28 skew-x-[-28deg] rounded bg-slate-950" />
      <span className="absolute bottom-4 right-2 h-8 w-28 skew-x-[28deg] rounded bg-slate-950" />
      <span className="absolute bottom-12 left-14 h-3 w-9 rounded bg-red-500" />
      <span className="absolute bottom-12 right-14 h-3 w-9 rounded bg-red-500" />
    </div>
  );
}

function SmartPlayVisual() {
  return (
    <div className="absolute left-1/2 top-1/2 h-40 w-56 -translate-x-1/2 -translate-y-1/2">
      <span className="absolute bottom-12 left-8 h-14 w-40 rounded-full bg-white shadow-[0_24px_50px_rgba(43,30,18,0.16)]" />
      <span className="absolute bottom-[72px] left-[88px] h-12 w-20 rounded-t-full bg-blue-500" />
      <span className="absolute bottom-7 left-1 h-6 w-28 skew-x-[-25deg] rounded bg-slate-200" />
      <span className="absolute bottom-7 right-1 h-6 w-28 skew-x-[25deg] rounded bg-slate-200" />
      <span className="absolute right-12 top-6 h-7 w-7 rounded-full bg-yellow-300 shadow-[0_0_26px_rgba(250,204,21,0.8)]" />
      <span className="absolute right-20 top-14 h-4 w-4 rounded-full bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.7)]" />
    </div>
  );
}

function SealedVisual() {
  return (
    <div className="absolute left-1/2 top-1/2 h-40 w-56 -translate-x-1/2 -translate-y-1/2">
      <span className="absolute bottom-5 left-8 h-28 w-40 rounded-2xl bg-red-600 shadow-[0_24px_50px_rgba(43,30,18,0.18)]" />
      <span className="absolute bottom-5 left-8 h-9 w-40 rounded-b-2xl bg-slate-950" />
      <span className="absolute left-14 top-12 h-14 w-28 rounded-xl bg-yellow-300" />
      <Studs rows={2} columns={5} className="absolute left-16 top-[60px] w-24" />
      <span className="absolute right-12 top-10 h-16 w-4 rounded-full bg-white/35" />
    </div>
  );
}

function ListingVisual({ title, category }: { title: string; category: string }) {
  const value = `${title} ${category}`.toLowerCase();
  const visual = value.includes("death") || value.includes("ucs") ? "ucs" : value.includes("blacktron") || value.includes("space") ? "blacktron" : value.includes("smart") ? "smart" : value.includes("sealed") || value.includes("18+") ? "sealed" : "modular";

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fbf4e8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_24%,rgba(250,204,21,0.34),transparent_30%),linear-gradient(135deg,#fff7e6,#ead7b8)]" />
      <div className="absolute left-1/2 top-1/2 h-52 w-72 -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-white/65 bg-white/62 shadow-[0_28px_70px_rgba(43,30,18,0.16)]" />
      {visual === "ucs" ? <UcsVisual /> : null}
      {visual === "modular" ? <ModularVisual /> : null}
      {visual === "blacktron" ? <BlacktronVisual /> : null}
      {visual === "smart" ? <SmartPlayVisual /> : null}
      {visual === "sealed" ? <SealedVisual /> : null}
      <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-slate-950 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-300 shadow-lg">
        {category}
      </div>
    </div>
  );
}

export function PremiumListingCard({
  title,
  price,
  condition,
  category,
  seller,
  trustScore,
  secure,
}: PremiumListingCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(15,23,42,0.14)]">
      <div className="relative aspect-[4/3] bg-slate-100">
        <ListingVisual title={title} category={category} />
        <button className="absolute right-4 top-4 rounded-full border border-white/70 bg-white/90 p-2 text-slate-700 shadow-sm transition-colors hover:text-slate-950" aria-label="Add to watchlist">
          <Heart className="h-4 w-4" />
        </button>
        {secure ? (
          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />
            TBX Secure
          </div>
        ) : null}
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold leading-tight text-slate-950">{title}</h2>
            <p className="mt-2 text-sm text-slate-500">{condition}</p>
          </div>
          <p className="shrink-0 text-lg font-semibold text-slate-950">{price}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            {category}
          </span>
          <TrustBadge score={trustScore} label={seller} compact />
        </div>
      </div>
    </article>
  );
}