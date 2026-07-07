import { Archive, TrendingUp } from "lucide-react";

type CollectionValueCardProps = {
  value: string;
  change: string;
  itemCount: string;
  insured: string;
};

export function CollectionValueCard({ value, change, itemCount, insured }: CollectionValueCardProps) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Collection value</p>
          <p className="mt-3 text-4xl font-semibold text-slate-950">{value}</p>
        </div>
        <Archive className="h-6 w-6 text-emerald-700" />
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <TrendingUp className="h-4 w-4" />
            {change}
          </p>
          <p className="mt-2 text-sm text-slate-500">Market movement</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-950">{itemCount}</p>
          <p className="mt-2 text-sm text-slate-500">{insured}</p>
        </div>
      </div>
    </section>
  );
}
