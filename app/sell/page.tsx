import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { SellEntry } from "@/components/sell/sell-entry";

export default function SellPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 text-white">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/45 hover:text-[#ffd84d]">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <SellEntry />

      <section className="rounded-2xl border border-[#ffd84d]/15 bg-[#ffd84d]/[0.045] p-5 text-sm leading-6 text-white/58">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#ffd84d]" />
          <p>
            <strong className="text-white">You stay in control.</strong> Buyers do not pay immediately. When someone chooses your item, TBX asks you to confirm it is still available before the sale moves forward.
          </p>
        </div>
      </section>
    </div>
  );
}
