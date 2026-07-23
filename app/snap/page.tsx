import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Camera,
  Check,
  CircleDollarSign,
  Heart,
  ScanSearch,
  Sparkles,
  Store,
  Upload,
} from "lucide-react";
import { QuickAddSetForm } from "@/components/collection/quick-add-set-form";

const steps = [
  { label: "Snap", text: "Take clear photos or search for a known collectible.", icon: Camera },
  { label: "Identify", text: "TBX matches the item to a trusted Atlas record.", icon: ScanSearch },
  { label: "Value", text: "Atlas checks live listings and available market evidence.", icon: CircleDollarSign },
  { label: "Choose", text: "Sell quickly, list it, or add it to your collection.", icon: Store },
];

const choices = [
  { title: "Get a cash offer", text: "The fastest route when you want the collection gone.", icon: CircleDollarSign },
  { title: "Sell for me", text: "TBX prepares the collection for market and helps maximise the return.", icon: Store },
  { title: "Keep my collection", text: "Add every identified item to your collection automatically.", icon: Heart },
];

export default function SnapPage() {
  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <header className="border-b border-white/[0.06] bg-[#050912]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 font-black tracking-[-0.04em]">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a]">
              <Boxes className="h-5 w-5" />
            </span>
            TBX
          </Link>
          <Link href="/atlas" className="text-sm font-bold text-white/55 transition hover:text-white">
            Explore Atlas
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(232,200,106,0.16),transparent_34rem)]" />
        <div className="relative mx-auto grid min-h-[720px] max-w-[1280px] items-center gap-14 px-5 py-20 lg:grid-cols-[0.82fr_1.18fr] lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e8c86a]">
              <Sparkles className="h-3.5 w-3.5" /> TBX Snap
            </div>
            <h1 className="mt-7 text-6xl font-black leading-[0.9] tracking-[-0.07em] sm:text-7xl">
              Know what it is.
              <span className="block text-[#e8c86a]">Know what it&apos;s worth.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/52">
              Start with photos or select a known item. Once Atlas identifies the record, TBX retrieves the available market pricing instead of showing a sample estimate.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/sell" className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#e8c86a] px-7 font-bold text-[#050912] transition hover:-translate-y-0.5 hover:bg-[#f1d478]">
                <Upload className="h-5 w-5" /> Start with photos
              </Link>
              <a href="#live-valuation" className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/[0.035] px-7 font-bold text-white/78 transition hover:border-[#e8c86a]/25 hover:text-white">
                Value a known item <ArrowRight className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-8 space-y-3 text-sm text-white/48">
              {["Prices come from the existing Atlas valuation service", "Condition changes the valuation", "Market evidence is shown when available"].map((item) => (
                <div key={item} className="flex items-center gap-3"><Check className="h-4 w-4 text-[#e8c86a]" />{item}</div>
              ))}
            </div>
          </div>

          <div id="live-valuation" className="scroll-mt-24 rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.48)] sm:p-6">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-2 pb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Live Atlas valuation</p>
                <p className="mt-1 text-sm text-white/42">Search for a LEGO set to retrieve current pricing</p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">Connected</span>
            </div>
            <div className="mt-5 rounded-[1.5rem] bg-white p-4 text-slate-950 sm:p-6">
              <QuickAddSetForm intent="sell" />
            </div>
            <p className="px-2 pt-4 text-xs leading-5 text-white/32">
              Pricing depends on the market evidence currently available for the selected record. TBX will say when evidence is limited rather than inventing a value.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-24 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">How it works</p>
        <h2 className="mt-4 max-w-3xl text-5xl font-black tracking-[-0.055em]">Four simple steps. Real market evidence.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {steps.map(({ label, text, icon: Icon }, index) => (
            <div key={label} className="rounded-[1.5rem] border border-white/[0.07] bg-[#09111e] p-6">
              <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">0{index + 1}</span><Icon className="h-5 w-5 text-[#e8c86a]" /></div>
              <h3 className="mt-8 text-2xl font-black">{label}</h3><p className="mt-3 leading-7 text-white/42">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-[1280px] px-5 py-24 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">After your valuation</p>
          <h2 className="mt-4 text-5xl font-black tracking-[-0.055em]">You stay in control.</h2>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {choices.map(({ title, text, icon: Icon }) => <div key={title} className="rounded-[1.75rem] border border-white/[0.07] bg-[#08101c] p-7"><Icon className="h-6 w-6 text-[#e8c86a]" /><h3 className="mt-8 text-2xl font-black">{title}</h3><p className="mt-3 leading-7 text-white/42">{text}</p></div>)}
          </div>
          <Link href="/sell" className="mt-12 inline-flex h-14 items-center gap-3 rounded-2xl bg-[#e8c86a] px-7 font-bold text-[#050912]">Start with TBX Snap <ArrowRight className="h-5 w-5" /></Link>
        </div>
      </section>
    </main>
  );
}
