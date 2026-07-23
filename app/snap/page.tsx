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

const steps = [
  { label: "Snap", text: "Take a few clear photos of the collection.", icon: Camera },
  { label: "Identify", text: "TBX matches items to trusted Atlas records.", icon: ScanSearch },
  { label: "Value", text: "See an estimated current market value.", icon: CircleDollarSign },
  { label: "Choose", text: "Sell quickly, sell for more, or keep collecting.", icon: Store },
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
        <div className="relative mx-auto grid min-h-[720px] max-w-[1280px] items-center gap-14 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e8c86a]">
              <Sparkles className="h-3.5 w-3.5" /> TBX Snap
            </div>
            <h1 className="mt-7 text-6xl font-black leading-[0.9] tracking-[-0.07em] sm:text-7xl">
              Know what it is.
              <span className="block text-[#e8c86a]">Know what it&apos;s worth.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/52">
              Upload a few photos. TBX identifies your collectibles, estimates their value and helps you choose what to do next.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/sell" className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#e8c86a] px-7 font-bold text-[#050912] transition hover:-translate-y-0.5 hover:bg-[#f1d478]">
                <Upload className="h-5 w-5" /> Upload photos
              </Link>
              <Link href="/atlas" className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/[0.035] px-7 font-bold text-white/78 transition hover:border-[#e8c86a]/25 hover:text-white">
                Explore Atlas <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="mt-8 space-y-3 text-sm text-white/48">
              {["No set numbers required", "No catalogue knowledge needed", "Start with one item or a whole collection"].map((item) => (
                <div key={item} className="flex items-center gap-3"><Check className="h-4 w-4 text-[#e8c86a]" />{item}</div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.48)] sm:p-8">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Collection analysis</p><p className="mt-1 text-sm text-white/42">Example result</p></div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">Ready</span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {["34 sets", "2 manuals", "5 incomplete"].map((value) => <div key={value} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-center text-sm font-bold text-white/70">{value}</div>)}
            </div>
            <div className="mt-5 rounded-[1.5rem] border border-[#e8c86a]/18 bg-[#e8c86a]/[0.055] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">Estimated collection value</p>
              <p className="mt-3 text-4xl font-black tracking-[-0.05em]">R18,500–R22,000</p>
              <p className="mt-2 text-sm text-white/38">Powered by Atlas market intelligence</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {["Cash offer", "Sell for me", "Keep collection"].map((label) => <div key={label} className="rounded-xl border border-white/[0.07] bg-[#070d17] px-3 py-4 text-center text-xs font-bold text-white/60">{label}</div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-24 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">How it works</p>
        <h2 className="mt-4 max-w-3xl text-5xl font-black tracking-[-0.055em]">Four simple steps. No cataloguing.</h2>
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
