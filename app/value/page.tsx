import Link from "next/link";
import { ArrowRight, Boxes, CircleDollarSign, Search, Sparkles } from "lucide-react";
import { QuickAddSetForm } from "@/components/collection/quick-add-set-form";

export default function ValuePage() {
  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <header className="border-b border-white/[0.06] bg-[#050912]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 font-black tracking-[-0.04em]">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a]"><Boxes className="h-5 w-5" /></span>
            TBX
          </Link>
          <Link href="/atlas" className="text-sm font-bold text-white/55 transition hover:text-white">Explore Atlas</Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(232,200,106,0.16),transparent_38rem)]" />
        <div className="relative mx-auto max-w-[980px] px-5 py-16 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e8c86a]"><Sparkles className="h-3.5 w-3.5" /> Atlas</div>
            <h1 className="mt-7 text-5xl font-black leading-[0.94] tracking-[-0.06em] sm:text-7xl">Tell Atlas what you have.</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/52">If you know the set, search it. If you do not, describe what is in front of you. Atlas will take it from there.</p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.38)] sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-5 border-b border-white/[0.07] pb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]">I know what it is</p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">Search a LEGO set</h2>
                  <p className="mt-2 text-sm leading-6 text-white/42">Enter the set number or name and use live Atlas pricing.</p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e8c86a]/10 text-[#e8c86a]"><Search className="h-5 w-5" /></span>
              </div>
              <div className="rounded-[1.5rem] bg-white p-4 text-slate-950 sm:p-5"><QuickAddSetForm intent="sell" /></div>
            </div>

            <div className="flex flex-col rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-7 shadow-[0_40px_120px_rgba(0,0,0,0.38)]">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]">I am not certain</p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">Describe your LEGO</h2>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e8c86a]/10 text-[#e8c86a]"><Sparkles className="h-5 w-5" /></span>
              </div>
              <p className="mt-5 text-base leading-7 text-white/48">Mixed box, minifigure, loose bricks, partly built set, instructions — you do not need to decide the category here. Tell Atlas what you can see and it will narrow it down.</p>
              <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#050912] p-5 text-sm leading-6 text-white/45">
                <p className="font-bold text-white/75">Examples</p>
                <p className="mt-2">“White Star Wars figure with red helmet markings.”</p>
                <p className="mt-1">“About 10 kg of loose LEGO with Technic and minifigures.”</p>
                <p className="mt-1">“Large black pirate ship, partly built, no set number.”</p>
              </div>
              <Link href="/value/manual?type=unknown" className="mt-auto inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#e8c86a] px-6 font-black text-[#050912] transition hover:bg-[#f1d478]">Describe what I have <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/35">
            <CircleDollarSign className="h-4 w-4 text-[#e8c86a]" /> Atlas identifies first, then carries the same record into Collection or Marketplace.
          </div>
        </div>
      </section>
    </main>
  );
}
