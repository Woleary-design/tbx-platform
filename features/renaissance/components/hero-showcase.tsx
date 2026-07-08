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
  kind: "modular" | "sealed" | "figures" | "ship" | "castle" | "boxed";
  glow: string;
};

const cabinetPieces: CabinetPiece[] = [
  { label: "Retired Modular", kind: "modular", glow: "rgba(250,204,21,0.34)" },
  { label: "Sealed Icons", kind: "sealed", glow: "rgba(255,255,255,0.26)" },
  { label: "Minifig Vault", kind: "figures", glow: "rgba(59,130,246,0.24)" },
  { label: "Space Grail", kind: "ship", glow: "rgba(226,232,240,0.28)" },
  { label: "Castle Lot", kind: "castle", glow: "rgba(16,185,129,0.20)" },
  { label: "Factory Sealed", kind: "boxed", glow: "rgba(239,68,68,0.26)" },
];

function StudGrid({ rows = 2, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="absolute inset-x-4 top-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: rows * columns }).map((_, index) => (
        <span key={index} className="h-3.5 rounded-full bg-white/40 shadow-[inset_0_2px_3px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.16)]" />
      ))}
    </div>
  );
}

function BoxedSet({ color = "bg-yellow-400", band = "bg-red-600", wide = false }: { color?: string; band?: string; wide?: boolean }) {
  return (
    <div className={`relative ${wide ? "h-24 w-40" : "h-24 w-32"} rounded-xl ${color} shadow-[0_18px_34px_rgba(0,0,0,0.34)] ring-1 ring-white/35`}>
      <StudGrid rows={2} columns={wide ? 5 : 4} />
      <div className="absolute inset-x-4 bottom-8 h-8 rounded-lg bg-white/26" />
      <span className={`absolute bottom-0 left-0 h-7 w-full rounded-b-xl ${band}`} />
      <span className="absolute inset-y-3 right-3 w-2 rounded-full bg-white/25" />
    </div>
  );
}

function Minifigures() {
  return (
    <div className="flex items-end justify-center gap-3">
      {["bg-slate-950", "bg-blue-600", "bg-slate-950"].map((torso, index) => (
        <div key={`${torso}-${index}`} className={`${index === 1 ? "h-[86px]" : "h-20"} relative w-12 rounded-t-2xl bg-yellow-300 shadow-[0_16px_28px_rgba(0,0,0,0.30)] ring-1 ring-white/25`}>
          <span className="absolute left-3 top-3 h-6 w-6 rounded-full bg-yellow-100 shadow-inner" />
          <span className={`absolute bottom-0 left-0 h-10 w-full rounded-t-lg ${torso}`} />
          <span className="absolute bottom-3 left-3 h-4 w-2 rounded bg-yellow-300" />
          <span className="absolute bottom-3 right-3 h-4 w-2 rounded bg-yellow-300" />
        </div>
      ))}
    </div>
  );
}

function SpaceShip() {
  return (
    <div className="relative h-28 w-44">
      <span className="absolute bottom-8 left-8 h-8 w-28 rounded-full bg-stone-200 shadow-[0_16px_28px_rgba(0,0,0,0.24)]" />
      <span className="absolute bottom-14 left-16 h-8 w-14 rounded-t-full bg-slate-400" />
      <span className="absolute bottom-3 left-2 h-5 w-16 skew-x-[-28deg] rounded bg-red-500" />
      <span className="absolute bottom-3 right-2 h-5 w-16 skew-x-[28deg] rounded bg-red-500" />
      <span className="absolute bottom-7 left-0 h-4 w-12 rounded-full bg-slate-300" />
      <span className="absolute bottom-7 right-0 h-4 w-12 rounded-full bg-slate-300" />
      <span className="absolute bottom-0 left-10 h-3 w-24 rounded-full bg-black/55 blur-sm" />
    </div>
  );
}

function CastleLot() {
  return (
    <div className="relative h-28 w-44">
      <span className="absolute bottom-0 left-1 h-16 w-10 rounded-t-md bg-stone-300 shadow-lg" />
      <span className="absolute bottom-0 left-14 h-24 w-14 rounded-t-md bg-stone-200 shadow-lg" />
      <span className="absolute bottom-0 right-1 h-16 w-10 rounded-t-md bg-stone-300 shadow-lg" />
      <span className="absolute bottom-0 left-0 h-7 w-full rounded bg-emerald-800" />
      <span className="absolute left-16 top-3 h-4 w-10 rounded-t-full bg-red-700" />
      <span className="absolute bottom-9 left-6 h-6 w-4 rounded bg-slate-950/70" />
      <span className="absolute bottom-9 right-6 h-6 w-4 rounded bg-slate-950/70" />
    </div>
  );
}

function CabinetPieceCard({ piece }: { piece: CabinetPiece }) {
  return (
    <div className="group relative flex min-h-[148px] flex-col justify-end overflow-hidden rounded-[1.35rem] border border-white/12 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.13)] transition-transform duration-300 hover:-translate-y-1">
      <div className="absolute inset-x-5 top-2 h-16 rounded-full blur-2xl" style={{ backgroundColor: piece.glow }} />
      <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
      <div className="relative mx-auto mb-4 flex h-28 w-full max-w-[190px] items-end justify-center">
        {piece.kind === "modular" ? <BoxedSet wide /> : null}
        {piece.kind === "sealed" ? <BoxedSet color="bg-stone-100" band="bg-slate-950" /> : null}
        {piece.kind === "figures" ? <Minifigures /> : null}
        {piece.kind === "ship" ? <SpaceShip /> : null}
        {piece.kind === "castle" ? <CastleLot /> : null}
        {piece.kind === "boxed" ? <BoxedSet color="bg-red-600" band="bg-yellow-300" wide /> : null}
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(250,204,21,0.34),transparent_24%),radial-gradient(circle_at_76%_18%,rgba(250,204,21,0.24),transparent_22%),linear-gradient(135deg,#4a2b18_0%,#0b1020_100%)]" />
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
