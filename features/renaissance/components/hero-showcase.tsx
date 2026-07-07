import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type HeroShowcaseProps = {
  eyebrow: string;
  title: string;
  description: string;
  imageLabel: string;
  imageDetail: string;
  primarySignal: string;
  secondarySignal: string;
  primaryHref?: string;
};

export function HeroShowcase({
  eyebrow,
  title,
  description,
  imageLabel,
  imageDetail,
  primarySignal,
  secondarySignal,
  primaryHref = "/marketplace",
}: HeroShowcaseProps) {
  return (
    <section className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          {eyebrow}
        </div>
        <div className="space-y-5">
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-slate-950 sm:text-6xl xl:text-7xl">
            {title}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="h-11 rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800">
            <Link href={primaryHref}>
              Browse Marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full bg-white px-5">
            <Link href="/vault">View Vault</Link>
          </Button>
        </div>
      </div>

      <div className="relative min-h-[560px] lg:min-h-[660px]">
        <div
          className="absolute inset-x-0 top-0 h-[560px] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-[0_34px_110px_rgba(15,23,42,0.22)] lg:h-[640px]"
          role="img"
          aria-label={imageLabel}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.16),transparent_26rem)]" />
          <div className="absolute inset-x-8 bottom-10 top-8 grid grid-cols-2 gap-5">
            {["Eiffel", "Taj", "Pyramid", "Colosseum", "Modular", "Diner", "Station", "Gallery"].map((piece) => (
              <div key={piece} className="rounded-xl border border-white/10 bg-white/10 p-4 shadow-inner">
                <div className="h-full rounded-lg bg-gradient-to-br from-stone-100/90 via-stone-200/70 to-slate-500/70" />
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
          <div className="absolute left-8 right-8 top-[27%] h-px bg-white/10" />
          <div className="absolute left-8 right-8 top-[73%] h-px bg-white/10" />
          <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/10 bg-white/90 p-5 text-slate-950 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{imageLabel}</p>
                <p className="mt-2 max-w-lg text-2xl font-semibold leading-tight">{imageDetail}</p>
              </div>
              <LockKeyhole className="h-6 w-6 shrink-0 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="absolute left-5 top-5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
          {primarySignal}
        </div>
        <div className="absolute right-5 top-5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white shadow-sm">
          {secondarySignal}
        </div>
      </div>
    </section>
  );
}
