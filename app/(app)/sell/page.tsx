import Link from "next/link";
import { ArrowLeft, BadgeCheck, HandCoins, Search, ShieldCheck, Sparkles } from "lucide-react";
import { QuickAddSetForm } from "@/components/collection/quick-add-set-form";

export default function SellPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)] md:p-10">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">
          <Sparkles className="h-4 w-4" /> Simple selling
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">What have you got?</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
          Find the item, tell us its condition, and TBX will help you choose a sensible price. You do not need to build a collector profile or understand the catalogue.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            [Search, "Find your item"],
            [HandCoins, "Get a value guide"],
            [BadgeCheck, "Fixed price or offers"],
          ].map(([Icon, label]) => {
            const ItemIcon = Icon as typeof ShieldCheck;
            return (
              <div key={label as string} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-4">
                <ItemIcon className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-medium">{label as string}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)] md:p-8">
        <QuickAddSetForm intent="sell" />
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <p><strong>Buyers do not pay immediately.</strong> When someone chooses your item, TBX asks you to confirm that it is still available. If you do not respond within 12 hours, the listing is removed and returned to My Items.</p>
        </div>
      </section>
    </div>
  );
}
