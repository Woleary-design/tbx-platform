import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, Sparkles } from "lucide-react";
import { GuidedSellForm } from "@/components/sell/guided-sell-form";

export default function SellPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <section className="relative overflow-hidden rounded-[2rem] bg-[#050912] px-7 py-10 text-white shadow-[0_28px_100px_rgba(15,23,42,0.18)] md:px-10 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(232,200,106,0.15),transparent_27rem)]" />
        <div className="relative max-w-3xl">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#e8c86a]">
            <Sparkles className="h-4 w-4" /> TBX guided selling
          </p>
          <h1 className="mt-5 text-5xl font-black leading-[0.94] tracking-[-0.06em] md:text-7xl">Find it. Value it. Then decide.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/55">
            Start with the item—not a listing form. TBX identifies the set, separates completeness from condition and shows the available market evidence before you build the listing.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/42">
            {["No account needed to start", "No photos needed for valuation", "Pricing powered by Atlas"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#e8c86a]" />{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[#09111f] p-6 shadow-[0_24px_80px_rgba(5,9,18,0.2)] md:p-8">
        <GuidedSellForm />
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <p><strong>You stay in control.</strong> Buyers do not pay immediately. TBX first asks you to confirm that the item is still available, and the listing returns to My Items if you do not respond within 12 hours.</p>
        </div>
      </section>
    </div>
  );
}
