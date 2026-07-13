import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck, Tag } from "lucide-react";
import { QuickAddSetForm } from "@/components/collection/quick-add-set-form";

export default function SellLegoPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link href="/collection" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
        <ArrowLeft className="h-4 w-4" /> Back to My Collection
      </Link>

      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)] md:p-10">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">
          <Tag className="h-4 w-4" /> Sell LEGO
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">List at your price. No chat. No offers.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
          Search the full LEGO catalogue, choose the condition and continue to price and delivery. TBX quietly creates or reuses the private Collection Record behind the listing.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            [ShieldCheck, "Fixed price only"],
            [LockKeyhole, "Collection stays private"],
            [Tag, "One structured listing"],
          ].map(([Icon, label]) => {
            const ItemIcon = Icon as typeof ShieldCheck;
            return <div key={label as string} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-4"><ItemIcon className="h-5 w-5 text-yellow-300" /><span className="text-sm font-medium">{label as string}</span></div>;
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)] md:p-8">
        <QuickAddSetForm intent="sell" />
      </section>
    </div>
  );
}
