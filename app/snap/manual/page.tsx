"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Boxes, Check, PackageOpen, Scale } from "lucide-react";

const itemTypes = [
  "Mixed box of LEGO",
  "Loose bricks and parts",
  "Minifigures",
  "Incomplete or unknown sets",
  "Instructions or boxes",
  "Other LEGO collection",
];

export default function ManualSnapPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const draft = Object.fromEntries(data.entries());
    window.localStorage.setItem("tbx-manual-lego-draft", JSON.stringify(draft));
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <header className="border-b border-white/[0.06] bg-[#050912]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1120px] items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 font-black tracking-[-0.04em]">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a]"><Boxes className="h-5 w-5" /></span>
            TBX
          </Link>
          <Link href="/snap" className="inline-flex items-center gap-2 text-sm font-bold text-white/55 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Snap</Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_10%,rgba(232,200,106,0.14),transparent_34rem)]" />
        <div className="relative mx-auto grid max-w-[1120px] gap-12 px-5 py-20 lg:grid-cols-[0.78fr_1.22fr] lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e8c86a]"><PackageOpen className="h-3.5 w-3.5" /> Loose or unlisted LEGO</div>
            <h1 className="mt-7 text-5xl font-black leading-[0.94] tracking-[-0.065em] sm:text-6xl">No set number?<span className="block text-[#e8c86a]">No problem.</span></h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/52">Describe what you have using simple details such as the type of LEGO, approximate weight and overall condition. Photos are not required.</p>
            <div className="mt-8 space-y-3 text-sm text-white/48">
              {["Suitable for mixed boxes and spare parts", "A rough weight is enough to begin", "TBX keeps bulk items separate from catalogue sets"].map((item) => <div key={item} className="flex items-center gap-3"><Check className="h-4 w-4 text-[#e8c86a]" />{item}</div>)}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.48)] sm:p-8">
            {submitted ? (
              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <span className="grid h-16 w-16 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"><Check className="h-8 w-8" /></span>
                <h2 className="mt-6 text-3xl font-black tracking-[-0.04em]">Description saved</h2>
                <p className="mt-3 max-w-md leading-7 text-white/45">Your loose LEGO draft has been saved on this device. The next product step is to connect this intake to a manual pricing review or bulk-price model.</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={() => setSubmitted(false)} className="inline-flex h-12 items-center justify-center rounded-xl border border-white/12 px-5 font-bold text-white/75">Edit description</button>
                  <Link href="/snap" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#e8c86a] px-5 font-bold text-[#050912]">Return to Snap <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Manual intake</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.045em]">Tell us what is in the box</h2>
                </div>

                <label className="block"><span className="text-sm font-bold text-white/70">What best describes it?</span><select name="itemType" required className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white outline-none focus:border-[#e8c86a]/45">{itemTypes.map((item) => <option key={item}>{item}</option>)}</select></label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block"><span className="flex items-center gap-2 text-sm font-bold text-white/70"><Scale className="h-4 w-4 text-[#e8c86a]" /> Approximate weight</span><div className="mt-2 flex"><input name="weight" type="number" min="0" step="0.1" placeholder="e.g. 8" className="h-13 min-w-0 flex-1 rounded-l-xl border border-white/10 bg-[#050912] px-4 text-white outline-none focus:border-[#e8c86a]/45" /><select name="weightUnit" className="h-13 rounded-r-xl border border-l-0 border-white/10 bg-[#050912] px-3 text-white"><option>kg</option><option>g</option></select></div></label>
                  <label className="block"><span className="text-sm font-bold text-white/70">Overall condition</span><select name="condition" className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white outline-none focus:border-[#e8c86a]/45"><option>Mostly clean and usable</option><option>Mixed condition</option><option>Needs cleaning or sorting</option><option>Not sure</option></select></label>
                </div>

                <label className="block"><span className="text-sm font-bold text-white/70">Anything notable?</span><textarea name="description" rows={5} placeholder="For example: mostly Technic pieces, around 40 minifigures, several instruction books, no complete sets known..." className="mt-2 w-full rounded-xl border border-white/10 bg-[#050912] px-4 py-3 text-white outline-none placeholder:text-white/22 focus:border-[#e8c86a]/45" /></label>

                <label className="block"><span className="text-sm font-bold text-white/70">What would you like to do?</span><select name="intent" className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white outline-none focus:border-[#e8c86a]/45"><option>Get a cash offer</option><option>Sell it for me</option><option>Add it to my collection</option><option>I am only checking the value</option></select></label>

                <button type="submit" className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#e8c86a] px-7 font-bold text-[#050912] transition hover:-translate-y-0.5 hover:bg-[#f1d478]">Save and continue <ArrowRight className="h-5 w-5" /></button>
                <p className="text-center text-xs leading-5 text-white/30">This flow does not require a catalogue match or photo upload.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
