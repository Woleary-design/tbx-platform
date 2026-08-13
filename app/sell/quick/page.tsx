import Link from "next/link";
import { ArrowLeft, Settings2 } from "lucide-react";
import { SellEntry } from "@/components/sell/sell-entry";

export default function QuickSellPage() {
  return (
    <div className="min-h-screen bg-[#050915] text-white">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <Link href="/sell" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white/65 hover:border-[#ffd84d]/30 hover:text-white">
            <Settings2 className="h-4 w-4" /> Advanced listing
          </Link>
        </div>
        <SellEntry />
      </main>
    </div>
  );
}
