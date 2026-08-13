"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, FileQuestion, Search, Sparkles } from "lucide-react";
import { QuickAddSetForm } from "@/components/collection/quick-add-set-form";

type SellMode = "search" | null;

const entryOptions = [
  {
    id: "search" as const,
    icon: Search,
    title: "I know the set or number",
    description: "Type anything from the box, instructions or LEGO set.",
    badge: "Fastest",
  },
];

export function SellEntry() {
  const [mode, setMode] = useState<SellMode>(null);

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

  return (
    <section className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd84d]/20 bg-[#ffd84d]/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ffd84d]">
          <Sparkles className="h-3.5 w-3.5" /> Sell in a few simple steps
        </div>
        <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl">What LEGO have you got?</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/52">
          Choose the simple option that matches what you know. Photos are added later for buyers—they are not used to identify the set.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {entryOptions.map(({ id, icon: Icon, title, description, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className="group relative min-h-52 overflow-hidden rounded-[1.75rem] border border-[#ffd84d]/30 bg-[#ffd84d]/[0.07] p-6 text-left transition hover:bg-[#ffd84d]/[0.11]"
          >
            {badge ? <span className="absolute right-5 top-5 rounded-full bg-[#ffd84d] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#050915]">{badge}</span> : null}
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ffd84d] text-[#050915]">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-8 text-2xl font-black tracking-[-0.035em]">{title}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/45">{description}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#ffd84d]">Start here <span aria-hidden>→</span></span>
          </button>
        ))}
      </div>

      <Link
        href="/value/manual?type=unknown"
        className="group flex min-h-52 items-start gap-5 rounded-[1.75rem] border border-white/[0.08] bg-[#0b1223] p-6 transition hover:border-[#ffd84d]/25 hover:bg-[#10192b] md:-mt-[224px] md:ml-[calc(50%+0.5rem)]"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/[0.055] text-[#ffd84d]">
          <FileQuestion className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-2xl font-black tracking-[-0.035em]">I don’t know what it is</span>
          <span className="mt-2 block text-sm leading-6 text-white/45">Tell TBX what you can see. A set number is not required.</span>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#ffd84d]">Start here <span aria-hidden>→</span></span>
        </span>
      </Link>
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
