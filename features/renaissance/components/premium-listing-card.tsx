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

const productPhotos: Record<string, string> = {
  "ucs-millennium-falcon-75192": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
  "lego-titanic-10294": "https://images.unsplash.com/photo-1544181093-c71225bb1dcf?auto=format&fit=crop&w=1200&q=80",
  "cafe-corner-10182": "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
  "ucs-at-at-75313": "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?auto=format&fit=crop&w=1200&q=80",
  "eiffel-tower-10307": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
  "rivendell-10316": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80",
};

function PhotoVisual({ id, title, category }: { id: string; title: string; category: string }) {
  const src = productPhotos[id] ?? "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200&q=80";
  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <img src={src} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-300">{category}</p>
          <p className="mt-1 text-sm font-medium text-white/85">Collector photography placeholder</p>
        </div>
        <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-950">TBX Score</span>
      </div>
    </div>
  );
}

export function PremiumListingCard({ id, title, price, condition, category, seller, trustScore, secure }: PremiumListingCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.65rem] border border-[#eadfce] bg-white shadow-[0_20px_70px_rgba(43,30,18,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_95px_rgba(43,30,18,0.16)]">
      <div className="relative aspect-[4/3] bg-slate-100">
        <PhotoVisual id={id} title={title} category={category} />
        <button className="absolute right-4 top-4 rounded-full border border-white/70 bg-white/90 p-2 text-slate-700 shadow-sm transition-colors hover:text-red-500" aria-label="Add to watchlist">
          <Heart className="h-4 w-4" />
        </button>
        {secure ? (
          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950/90 px-3 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur">
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
