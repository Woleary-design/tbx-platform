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

export function PremiumListingCard({
  title,
  price,
  condition,
  category,
  seller,
  trustScore,
  secure,
  imageSrc,
}: PremiumListingCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(15,23,42,0.14)]">
      <div className="relative aspect-[4/3] bg-slate-100">
        <img src={imageSrc} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
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
