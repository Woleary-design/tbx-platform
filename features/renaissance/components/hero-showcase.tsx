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

type CabinetPiece = {
  label: string;
  kind: "ucs" | "modular2026" | "smart" | "blacktron" | "sealed18" | "tudor";
  glow: string;
};

const cabinetPieces: CabinetPiece[] = [
  { label: "UCS 75419", kind: "ucs", glow: "rgba(226,232,240,0.32)" },
  { label: "2026 Modular", kind: "modular2026", glow: "rgba(250,204,21,0.34)" },
  { label: "Smart Play", kind: "smart", glow: "rgba(59,130,246,0.26)" },
  { label: "Blacktron 2025", kind: "blacktron", glow: "rgba(250,204,21,0.30)" },
  { label: "Sealed 18+", kind: "sealed18", glow: "rgba(239,68,68,0.24)" },
  { label: "Tudor Corner", kind: "tudor", glow: "rgba(245,158,11,0.28)" },
];

function Studs({ rows = 2, columns = 4, className = "" }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={`grid gap-1.5 ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: rows * columns }).map((_, index) => (
        <span key={index} className="h-3.5 rounded-full bg-white/45 shadow-[inset_0_2px_3px_rgba(255,255,255,0.58),inset_0_-2px_4px_rgba(0,0,0,0.18)]" />
      ))}
    </div>
  );
}

function UcsDiorama() {
  return (
    <div className="relative h-32 w-44">
      <span className="absolute bottom-6 left-7 h-24 w-32 rounded-t-full border-[10px] border-slate-300/95 border-b-0 bg-slate-950/70 shadow-[0_18px_40px_rgba(0,0,0,0.34)]" />
      <span className="absolute bottom-10 left-16 h-14 w-16 rounded-full border-[7px] border-slate-100/90 bg-slate-500/70" />
      <span className="absolute bottom-7 left-[74px] h-8 w-8 rounded-full bg-slate-950" />
      <span className="absolute bottom-[18px] left-3 h-4 w-36 rounded-full bg-slate-200" />
      <span className="absolute bottom-3 left-14 h-2 w-20 rounded-full bg-red-500/80" />
      <span className="absolute bottom-0 left-8 h-3 w-28 rounded-full bg-black/45 blur-sm" />
    </div>
  );
}

function ModularStreet() {
  return (
    <div className="relative h-32 w-48">
      <span className="absolute bottom-0 left-2 h-24 w-20 rounded-t-xl bg-amber-300 shadow-[0_18px_34px_rgba(0,0,0,0.26)] ring-1 ring-white/30" />
      <span className="absolute bottom-0 right-2 h-28 w-24 rounded-t-xl bg-stone-100 shadow-[0_18px_34px_rgba(0,0,0,0.26)] ring-1 ring-white/30" />
      <span className="absolute left-6 top-5 h-4 w-12 rounded-t-full bg-slate-800" />
      <span className="absolute right-9 top-1 h-5 w-12 rounded-t-full bg-red-700" />
      <Studs rows={2} columns={3} className="absolute left-7 top-12 w-12" />
      <Studs rows={3} columns={3} className="absolute right-8 top-12 w-14" />
      <span className="absolute bottom-0 left-0 h-7 w-full rounded bg-slate-950" />
      <span className="absolute bottom-7 left-6 h-5 w-16 rounded-t-lg bg-emerald-600" />
      <span className="absolute bottom-7 right-8 h-5 w-14 rounded-t-lg bg-yellow-400" />
    </div>
  );
}

function SmartPlay() {
  return (
    <div className="relative h-32 w-44">
      <span className="absolute bottom-9 left-5 h-12 w-32 rounded-full bg-white/90 shadow-[0_16px_30px_rgba(0,0,0,0.22)]" />
      <span className="absolute bottom-14 left-16 h-11 w-16 rounded-t-full bg-blue-500" />
      <span className="absolute bottom-5 left-1 h-5 w-20 skew-x-[-25deg] rounded bg-slate-200" />
      <span className="absolute bottom-5 right-1 h-5 w-20 skew-x-[25deg] rounded bg-slate-200" />
      <span className="absolute right-7 top-4 h-6 w-6 rounded-full bg-yellow-300 shadow-[0_0_22px_rgba(250,204,21,0.72)]" />
      <span className="absolute right-11 top-9 h-4 w-4 rounded-full bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.64)]" />
      <span className="absolute bottom-0 left-10 h-3 w-24 rounded-full bg-black/45 blur-sm" />
    </div>
  );
}

function BlacktronReturn() {
  return (
    <div className="relative h-32 w-44">
      <span className="absolute bottom-7 left-9 h-16 w-28 rounded-[1.1rem] bg-slate-950 shadow-[0_18px_34px_rgba(0,0,0,0.34)]" />
      <span className="absolute bottom-12 left-16 h-9 w-16 rounded-t-full bg-yellow-300" />
      <span className="absolute bottom-3 left-1 h-7 w-24 skew-x-[-30deg] rounded bg-slate-950" />
      <span className="absolute bottom-3 right-1 h-7 w-24 skew-x-[30deg] rounded bg-slate-950" />
      <span className="absolute bottom-9 left-11 h-3 w-8 rounded bg-red-500" />
      <span className="absolute bottom-9 right-11 h-3 w-8 rounded bg-red-500" />
      <span className="absolute bottom-0 left-8 h-3 w-28 rounded-full bg-black/45 blur-sm" />
    </div>
  );
}

function SealedIcons() {
  return (
    <div className="relative h-32 w-44">
      <span className="absolute bottom-3 left-4 h-24 w-36 rounded-2xl bg-red-600 shadow-[0_18px_36px_rgba(0,0,0,0.28)] ring-1 ring-white/30" />
      <span className="absolute bottom-3 left-4 h-7 w-36 rounded-b-2xl bg-slate-950" />
      <span className="absolute left-8 top-10 h-10 w-28 rounded-xl bg-yellow-300" />
      <Studs rows={2} columns={5} className="absolute left-10 top-12 w-24" />
      <span className="absolute right-9 top-8 h-14 w-4 rounded-full bg-white/35" />
      <span className="absolute bottom-0 left-8 h-3 w-28 rounded-full bg-black/35 blur-sm" />
    </div>
  );
}

function TudorCorner() {
  return (
    <div className="relative h-32 w-48">
      <span className="absolute bottom-0 left-4 h-28 w-36 rounded-t-xl bg-stone-100 shadow-[0_18px_34px_rgba(0,0,0,0.26)] ring-1 ring-white/30" />
      <span className="absolute bottom-0 right-4 h-20 w-16 rounded-t-xl bg-amber-700" />
      <span className="absolute left-9 top-7 h-16 w-3 bg-amber-900" />
      <span className="absolute left-20 top-7 h-16 w-3 bg-amber-900" />
      <span className="absolute left-4 top-3 h-7 w-36 rounded-t-xl bg-slate-800" />
      <span className="absolute bottom-0 left-0 h-7 w-full rounded bg-slate-950" />
      <span className="absolute bottom-8 left-12 h-8 w-7 rounded-t-full bg-slate-950/75" />
      <Studs rows={2} columns={3} className="absolute right-10 top-12 w-12" />
    </div>
  );
}

function CabinetPieceCard({ piece }: { piece: CabinetPiece }) {
  return (
    <div className="group relative flex min-h-[148px] flex-col justify-end overflow-hidden rounded-[1.35rem] border border-white/12 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.13)] transition-transform duration-300 hover:-translate-y-1">
      <div className="absolute inset-x-5 top-2 h-16 rounded-full blur-2xl" style={{ backgroundColor: piece.glow }} />
      <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
      <div className="relative mx-auto mb-4 flex h-28 w-full max-w-[190px] items-end justify-center">
        {piece.kind === "ucs" ? <UcsDiorama /> : null}
        {piece.kind === "modular2026" ? <ModularStreet /> : null}
        {piece.kind === "smart" ? <SmartPlay /> : null}
        {piece.kind === "blacktron" ? <BlacktronReturn /> : null}
        {piece.kind === "sealed18" ? <SealedIcons /> : null}
        {piece.kind === "tudor" ? <TudorCorner /> : null}
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_16%,rgba(250,204,21,0.36),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(250,204,21,0.24),transparent_22%),linear-gradient(135deg,#51301d_0%,#0b1020_100%)]" />
          <div className="absolute inset-5 rounded-[1.65rem] border border-white/25 bg-white/5 shadow-[inset_0_0_70px_rgba(255,255,255,0.08)]" />
          <div className="absolute left-10 right-10 top-[48%] h-px bg-white/18" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="relative z-10 grid h-[440px] grid-cols-2 gap-4 sm:grid-cols-3 lg:h-[520px]">
            {cabinetPieces.map((piece) => (
              <CabinetPieceCard key={piece.label} piece={piece} />
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