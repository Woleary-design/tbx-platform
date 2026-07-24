import { AlertTriangle, Database, SearchCheck, Sparkles } from "lucide-react";

const cards = [
  { label: "Match confidence", value: "—", icon: SearchCheck },
  { label: "Unmatched searches", value: "0", icon: AlertTriangle },
  { label: "Catalogue gaps", value: "0", icon: Database },
  { label: "Valuations reviewed", value: "0", icon: Sparkles },
];

export default function AdminAtlasPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#ffd84d]">Atlas Intelligence</p>
        <h1 className="mt-2 text-3xl font-semibold">Atlas operations</h1>
        <p className="mt-2 text-slate-400">Monitor catalogue coverage, matching quality and valuation confidence.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="tbx-surface rounded-2xl p-5">
            <Icon className="h-5 w-5 text-[#ffd84d]" />
            <p className="mt-4 text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="tbx-surface rounded-2xl p-6">
          <h2 className="font-semibold">Items requiring review</h2>
          <p className="mt-1 text-sm text-slate-500">Low-confidence matches and unusual pricing will appear here.</p>
          <div className="mt-8 grid min-h-52 place-items-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-slate-600">No items awaiting review</div>
        </section>
        <section className="tbx-surface rounded-2xl p-6">
          <h2 className="font-semibold">Most searched</h2>
          <p className="mt-1 text-sm text-slate-500">Demand signals from marketplace searches.</p>
          <div className="mt-8 grid min-h-52 place-items-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-slate-600">Search intelligence connection pending</div>
        </section>
      </div>
    </div>
  );
}
