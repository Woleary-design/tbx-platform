import { ArrowRight } from "lucide-react";

type WatchlistOpportunityCardProps = {
  title: string;
  price: string;
  signal: string;
  category: string;
};

export function WatchlistOpportunityCard({ title, price, signal, category }: WatchlistOpportunityCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{category}</p>
          <p className="mt-2 font-semibold text-slate-950">{title}</p>
        </div>
        <p className="font-semibold text-slate-950">{price}</p>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm leading-6 text-slate-500">{signal}</p>
        <ArrowRight className="h-4 w-4 shrink-0 text-emerald-700 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
}
