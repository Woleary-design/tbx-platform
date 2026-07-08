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
  imageSrc?: string;
  primaryHref?: string;
};

const cabinetPieces = [
  { label: "Retired Modular", tone: "bg-amber-300", accent: "bg-red-700", shape: "wide" },
  { label: "Sealed Icons", tone: "bg-stone-100", accent: "bg-slate-950", shape: "box" },
  { label: "Minifig Vault", tone: "bg-yellow-300", accent: "bg-blue-700", shape: "figures" },
  { label: "Space Grail", tone: "bg-slate-200", accent: "bg-red-500", shape: "ship" },
  { label: "Castle Lot", tone: "bg-stone-300", accent: "bg-emerald-700", shape: "castle" },
  { label: "Factory Sealed", tone: "bg-red-600", accent: "bg-yellow-300", shape: "box" },
];

function BrickStuds() {
  return (
    <div className="absolute inset-x-4 top-4 grid grid-cols-4 gap-2 opacity-80">
      {Array.from({ length: 8 }).map((_, index) => (
        <span key={index} className="h-3 rounded-full bg-white/35 shadow-inner" />
      ))}
    </div>
  );
}

function CabinetPiece({ piece }: { piece: (typeof cabinetPieces)[number] }) {
  return (
    <div className="group relative flex min-h-[142px] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-black/24 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform duration-300 hover:-translate-y-1">
      <div className="absolute inset-x-8 top-3 h-10 rounded-full bg-yellow-200/40 blur-xl" />
      <div className="relative mx-auto mb-4 flex h-20 w-full max-w-[150px] items-end justify-center">
        {piece.shape === "figures" ? (
          <div className="flex items-end gap-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="relative h-16 w-9 rounded-t-xl bg-yellow-300 shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
                <span className="absolute left-2 top-2 h-5 w-5 rounded-full bg-yellow-100" />
                <span className={`absolute bottom-0 left-0 h-8 w-full rounded-t-md ${item === 1 ? "bg-blue-700" : "bg-slate-900"}`} />
              </div>
            ))}
          </div>
        ) : piece.shape === "ship" ? (
          <div className="relative h-16 w-36">
            <span className="absolute bottom-3 left-4 h-5 w-28 rounded-full bg-stone-200" />
            <span className="absolute bottom-8 left-12 h-6 w-14 rounded-t-full bg-slate-400" />
            <span className="absolute bottom-0 left-0 h-3 w-12 skew-x-[-28deg] rounded bg-red-500" />
            <span className="absolute bottom-0 right-0 h-3 w-12 skew-x-[28deg] rounded bg-red-500" />
          </div>
        ) : piece.shape === "castle" ? (
          <div className="relative h-20 w-36">
            <span className={`absolute bottom-0 left-2 h-12 w-8 rounded-t-md ${piece.tone}`} />
            <span className={`absolute bottom-0 left-14 h-16 w-10 rounded-t-md ${piece.tone}`} />
            <span className={`absolute bottom-0 right-2 h-12 w-8 rounded-t-md ${piece.tone}`} />
            <span className={`absolute bottom-0 left-0 h-5 w-full rounded ${piece.accent}`} />
          </div>
        ) : (
          <div className={`relative h-16 ${piece.shape === "wide" ? "w-40" : "w-28"} rounded-xl ${piece.tone} shadow-[0_14px_24px_rgba(0,0,0,0.28)]`}>
            <BrickStuds />
            <span className={`absolute bottom-0 left-0 h-5 w-full rounded-b-xl ${piece.accent}`} />
          </div>
        )}
      </div>
      <div className="relative rounded-lg bg-slate-950 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-yellow-300 shadow-lg">
        {piece.label}
      </div>
    </div>
  );
}

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
    <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
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
        <div className="absolute inset-x-0 top-0 h-[560px] overflow-hidden rounded-[2rem] border border-[#e6d7bf] bg-[#24170f] p-6 shadow-[0_34px_110px_rgba(15,23,42,0.22)] lg:h-[640px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(250,204,21,0.30),transparent_24%),radial-gradient(circle_at_76%_18%,rgba(250,204,21,0.24),transparent_22%),linear-gradient(135deg,#4a2b18_0%,#0b1020_100%)]" />
          <div className="absolute inset-5 rounded-[1.65rem] border border-white/25 bg-white/5 shadow-[inset_0_0_60px_rgba(255,255,255,0.08)]" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="relative z-10 grid h-[440px] grid-cols-2 gap-4 sm:grid-cols-3 lg:h-[520px]">
            {cabinetPieces.map((piece) => (
              <CabinetPiece key={piece.label} piece={piece} />
            ))}
          </div>
          <div className="absolute left-10 top-6 z-20 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
            {primarySignal}
          </div>
          <div className="absolute right-10 top-6 z-20 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white shadow-sm">
            {secondarySignal}
          </div>
          <div className="absolute bottom-7 left-7 right-7 z-30 rounded-2xl border border-white/20 bg-white/90 p-5 text-slate-950 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{imageLabel}</p>
                <p className="mt-2 max-w-lg text-2xl font-semibold leading-tight">{imageDetail}</p>
              </div>
              <LockKeyhole className="h-6 w-6 shrink-0 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
