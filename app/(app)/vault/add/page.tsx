import Link from "next/link";
import { ArrowLeft, BadgeCheck, PackageCheck, SearchCheck } from "lucide-react";
import { AddSetForm } from "@/components/collection/add-set-form";

export default function AddSetPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/collection" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to My Collection
      </Link>

      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,216,77,.10),transparent_32%),linear-gradient(135deg,rgba(255,255,255,.045),rgba(255,255,255,.015))] p-6 text-white sm:p-8 lg:p-10">
        <div className="grid gap-7 lg:grid-cols-[1fr_300px] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-[#ffd84d]">My Collection</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Add a LEGO set</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">Add the set details and condition you know now. TBX will keep it in your private collection until you choose to list it for sale.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4"><SearchCheck className="h-5 w-5 text-[#ffd84d]" /><span className="text-sm font-medium">Identify the set</span></div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4"><BadgeCheck className="h-5 w-5 text-[#ffd84d]" /><span className="text-sm font-medium">Record its condition</span></div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#0b1220] p-5 shadow-[0_24px_80px_rgba(0,0,0,.18)] sm:p-7 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ffd84d] text-[#050915]"><PackageCheck className="h-5 w-5" /></span>
          <div><p className="font-semibold text-white">Set details</p><p className="text-sm text-slate-500">Saved to your TBX collection.</p></div>
        </div>
        <AddSetForm />
      </section>
    </div>
  );
}
