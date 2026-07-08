import { TrendingUp } from "lucide-react";

type MarketMoverCardProps = {
  title: string;
  movement: string;
  detail: string;
};

export function MarketMoverCard({ title, movement, detail }: MarketMoverCardProps) {
  const isPositive = !movement.startsWith("-");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-950">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
        </div>
        <span className={isPositive ? "text-sm font-semibold text-emerald-700" : "text-sm font-semibold text-slate-500"}>
          {movement}
        </span>
      </div>
      <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        <TrendingUp className="h-3.5 w-3.5" />
        Market signal
      </p>
    </div>
  );
}
