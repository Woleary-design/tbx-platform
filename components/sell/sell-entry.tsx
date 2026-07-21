"use client";

import { useState } from "react";
import { ArrowLeft, Barcode, Camera, FilePlus2, Search, Sparkles } from "lucide-react";
import { QuickAddSetForm } from "@/components/collection/quick-add-set-form";

type SellMode = "photo" | "barcode" | "search" | "manual" | null;

const entryOptions = [
  {
    id: "photo" as const,
    icon: Camera,
    title: "Take photos",
    description: "Do not know the set number? Start with a few clear photos.",
    badge: "Best for beginners",
  },
  {
    id: "barcode" as const,
    icon: Barcode,
    title: "Scan the barcode",
    description: "Use the box barcode to narrow down the set quickly.",
  },
  {
    id: "search" as const,
    icon: Search,
    title: "I know the set",
    description: "Search by set number, name or theme.",
  },
  {
    id: "manual" as const,
    icon: FilePlus2,
    title: "List it manually",
    description: "Use this when the set cannot be identified yet.",
  },
];

export function SellEntry() {
  const [mode, setMode] = useState<SellMode>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [barcode, setBarcode] = useState("");

  if (mode === "search") {
    return (
      <div className="space-y-5">
        <ModeHeader title="Find your LEGO set" onBack={() => setMode(null)} />
        <div className="rounded-[2rem] border border-white/[0.08] bg-[#0b1223] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.22)] sm:p-7">
          <QuickAddSetForm intent="sell" />
        </div>
      </div>
    );
  }

  if (mode === "photo") {
    return (
      <div className="space-y-5">
        <ModeHeader title="Photograph what you have" onBack={() => setMode(null)} />
        <section className="rounded-[2rem] border border-white/[0.08] bg-[#0b1223] p-6 sm:p-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#ffd84d] text-[#050915]">
              <Camera className="h-7 w-7" />
            </span>
            <h2 className="mt-5 text-2xl font-black tracking-[-0.035em]">Add clear photos of the set</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Photograph the box front, set itself, minifigures and any loose pieces. These photos will also be ready for the final listing.
            </p>
            <label className="mt-7 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#ffd84d]/35 bg-[#ffd84d]/[0.045] px-5 transition hover:bg-[#ffd84d]/[0.075]">
              <Camera className="h-6 w-6 text-[#ffd84d]" />
              <span className="mt-3 font-semibold">Choose or take photos</span>
              <span className="mt-1 text-xs text-white/40">JPG, PNG or HEIC</span>
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="sr-only"
                onChange={(event) => setPhotoCount(event.target.files?.length ?? 0)}
              />
            </label>
            {photoCount > 0 ? (
              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] p-4 text-left text-sm text-emerald-100">
                {photoCount} photo{photoCount === 1 ? "" : "s"} ready. Continue by confirming the set in Atlas.
              </div>
            ) : null}
            <button
              type="button"
              disabled={photoCount === 0}
              onClick={() => setMode("search")}
              className="mt-5 h-12 w-full rounded-xl bg-[#ffd84d] px-5 font-bold text-[#050915] transition hover:bg-[#ffe16f] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to identify the set
            </button>
            <p className="mt-3 text-xs leading-5 text-white/35">
              Automatic photo identification is the next integration. For now, TBX keeps the beginner flow simple and asks you to confirm the closest Atlas match.
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (mode === "barcode") {
    return (
      <div className="space-y-5">
        <ModeHeader title="Find it from the barcode" onBack={() => setMode(null)} />
        <section className="rounded-[2rem] border border-white/[0.08] bg-[#0b1223] p-6 sm:p-8">
          <div className="mx-auto max-w-xl">
            <label className="block text-sm font-semibold text-white/75" htmlFor="sell-barcode">Barcode number</label>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.035] p-2">
              <Barcode className="ml-3 h-5 w-5 text-white/35" />
              <input
                id="sell-barcode"
                value={barcode}
                onChange={(event) => setBarcode(event.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="Enter the number beneath the barcode"
                className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>
            <button
              type="button"
              disabled={barcode.length < 6}
              onClick={() => setMode("search")}
              className="mt-5 h-12 w-full rounded-xl bg-[#ffd84d] px-5 font-bold text-[#050915] transition hover:bg-[#ffe16f] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to confirm the set
            </button>
            <p className="mt-3 text-xs leading-5 text-white/35">
              Barcode lookup is being connected to Atlas. Until then, the number is used as the starting point before confirming the correct set.
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (mode === "manual") {
    return (
      <div className="space-y-5">
        <ModeHeader title="Create a manual listing" onBack={() => setMode(null)} />
        <section className="rounded-[2rem] border border-white/[0.08] bg-[#0b1223] p-6 sm:p-8">
          <div className="mx-auto max-w-2xl text-center">
            <FilePlus2 className="mx-auto h-10 w-10 text-[#ffd84d]" />
            <h2 className="mt-4 text-2xl font-black">Start with the closest Atlas record</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              TBX keeps listings tied to one catalogue record so buyers can compare them safely. Search for the closest match, then describe missing pieces or uncertainty in the listing details.
            </p>
            <button type="button" onClick={() => setMode("search")} className="mt-6 h-12 rounded-xl bg-[#ffd84d] px-6 font-bold text-[#050915] hover:bg-[#ffe16f]">
              Search Atlas
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd84d]/20 bg-[#ffd84d]/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ffd84d]">
          <Sparkles className="h-3.5 w-3.5" /> Sell in a few simple steps
        </div>
        <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl">What LEGO have you got?</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/52">
          You do not need to know the set number or collector terminology. Choose the easiest starting point and TBX will guide you.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {entryOptions.map(({ id, icon: Icon, title, description, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`group relative min-h-52 overflow-hidden rounded-[1.75rem] border p-6 text-left transition ${id === "photo" ? "border-[#ffd84d]/30 bg-[#ffd84d]/[0.07] hover:bg-[#ffd84d]/[0.11]" : "border-white/[0.08] bg-[#0b1223] hover:border-[#ffd84d]/25 hover:bg-[#10192b]"}`}
          >
            {badge ? <span className="absolute right-5 top-5 rounded-full bg-[#ffd84d] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#050915]">{badge}</span> : null}
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${id === "photo" ? "bg-[#ffd84d] text-[#050915]" : "bg-white/[0.055] text-[#ffd84d]"}`}>
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-8 text-2xl font-black tracking-[-0.035em]">{title}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/45">{description}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#ffd84d]">Start here <span aria-hidden>→</span></span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ModeHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={onBack} aria-label="Back to selling options" className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.09] bg-white/[0.04] text-white/70 hover:border-[#ffd84d]/25 hover:text-[#ffd84d]">
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffd84d]">Sell LEGO</p>
        <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] sm:text-3xl">{title}</h1>
      </div>
    </div>
  );
}
