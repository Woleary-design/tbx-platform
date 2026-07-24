import { ShieldCheck } from "lucide-react";

type TrustBadgeProps = {
  score: number;
  label?: string;
  compact?: boolean;
};

export function TrustBadge({ score, label = "Premier seller", compact = false }: TrustBadgeProps) {
  return (
    <div
      className={
        compact
          ? "inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-950 shadow-sm"
          : "inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-950 shadow-sm"
      }
    >
      <ShieldCheck className={compact ? "h-3.5 w-3.5 text-emerald-700" : "h-4 w-4 text-emerald-700"} />
      <span>{score}</span>
      <span className="text-slate-500">{label}</span>
    </div>
  );
}
