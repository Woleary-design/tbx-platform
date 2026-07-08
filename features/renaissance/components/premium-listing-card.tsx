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

function ListingVisual({ title, category }: { title: string; category: string }) {
  const isMinifigure = category.toLowerCase().includes("minifigure");
  const isSealed = conditionWords(title).includes("sealed") || category.toLowerCase().includes("sealed");

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fbf4e8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_24%,rgba(250,204,21,0.30),transparent_30%),linear-gradient(135deg,#fff7e6,#ead7b8)]" />
      <div className="absolute left-1/2 top-1/2 h-44 w-56 -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border border-white/60 bg-white/60 shadow-[0_24px_60px_rgba(43,30,18,0.16)]" />
      {isMinifigure ? (
        <div className="absolute inset-x-0 top-16 flex justify-center gap-4">
          {["bg-yellow-300", "bg-blue-600", "bg-red-600"].map((tone, index) => (
            <div key={tone} className={`relative h-28 w-14 rounded-t-2xl ${tone} shadow-[0_18px_30px_rgba(43,30,18,0.20)] ${index === 1 ? "mt-4" : ""}`}>
              <span className="absolute left-3 top-3 h-8 w-8 rounded-full bg-yellow-100" />
              <span className="absolute bottom-0 left-0 h-14 w-full rounded-t-lg bg-slate-950/90" />
            </div>
          ))}
        </div>
      ) : (
        <div className="absolute left-1/2 top-1/2 h-28 w-40 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-yellow-400 shadow-[0_22px_45px_rgba(43,30,18,0.22)]">
          <div className="grid grid-cols-4 gap-2 p-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <span key={index} className="h-5 rounded-full bg-white/35 shadow-inner" />
            ))}
          </div>
          <span className={`absolute bottom-0 left-0 h-8 w-full rounded-b-2xl ${isSealed ? "bg-red-600" : "bg-slate-950"}`} />
        </div>
      )}
      <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-slate-950 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-300 shadow-lg">
        {category}
      </div>
    </div>
  );
}

function conditionWords(value: string) {
  return value.toLowerCase().split(/\s+/);
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
