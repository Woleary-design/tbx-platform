import { BadgeCheck, CheckCircle2, ShieldCheck } from "lucide-react";
import type { MarketplaceListing } from "@/features/marketplace/data/marketplace.mock";

export function SellerTrustCard({ seller }: { seller: MarketplaceListing["seller"] }) {
  const verified = seller.checks.length > 0 && seller.checks.every((check) => check.verified);
  return (
    <section className="rounded-[2rem] border border-[#eadfce] bg-slate-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">Seller profile</p>
          <div className="mt-3 text-3xl font-semibold">{verified ? "Verified seller" : "Verification pending"}</div>
          <p className="mt-2 font-semibold">{seller.name} · {seller.level}</p>
        </div>
        <ShieldCheck className="h-12 w-12 text-yellow-300" />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {seller.checks.map((check) => <div key={check.label} className="flex items-center gap-2 rounded-xl bg-white/[0.07] p-3 text-sm text-white/75"><CheckCircle2 className={`h-4 w-4 ${check.verified ? "text-yellow-300" : "text-white/25"}`} />{check.label}{check.verified ? "" : ": pending"}</div>)}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[["Sales", seller.sales], ["Dispatch", `${seller.averageDispatchDays} days`], ["Disputes", seller.disputes], ["Repeat buyers", `${seller.repeatBuyerPercent}%`], ["Rating", seller.rating]].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 p-3"><p className="text-xs text-white/40">{label}</p><p className="mt-1 font-semibold">{value}</p></div>
        ))}
      </div>
    </section>
  );
}

export function ConditionReport({ rows }: { rows: MarketplaceListing["conditionReport"] }) {
  return (
    <section className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
      <div className="flex items-center gap-3"><BadgeCheck className="h-6 w-6 text-yellow-600" /><h2 className="text-2xl font-semibold">Condition Report</h2></div>
      <div className="mt-5 grid gap-3">
        {rows.map((row) => <div key={row.label} className="grid gap-2 rounded-xl border border-[#eadfce] bg-white p-4 text-sm sm:grid-cols-[150px_140px_1fr]"><strong>{row.label}</strong><span className="font-semibold text-yellow-700">{row.value}</span><span className="text-slate-600">{row.detail}</span></div>)}
      </div>
    </section>
  );
}

export function ProvenanceCard({ rows }: { rows: MarketplaceListing["provenance"] }) {
  return (
    <section className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
      <h2 className="text-2xl font-semibold">Provenance</h2>
      <p className="mt-2 text-sm text-slate-500">Ownership, storage and documentation history supplied for this collectible.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => <div key={row.label} className="flex items-center justify-between gap-4 rounded-xl border border-[#eadfce] bg-white p-4"><span className="text-sm text-slate-500">{row.label}</span><strong className="text-sm text-slate-950">{row.value}</strong></div>)}
      </div>
    </section>
  );
}

export function SellerProtectedLabel({ paymentsLive = false }: { paymentsLive?: boolean }) {
  return <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white"><ShieldCheck className="h-3.5 w-3.5 text-yellow-300" /> {paymentsLive ? "Seller listed · TBX Protected" : "Seller listed · Reservation only"}</span>;
}
