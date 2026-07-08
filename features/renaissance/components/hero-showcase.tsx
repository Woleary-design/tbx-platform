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

type Piece = {
  label: string;
  accent: string;
  type: "space" | "home" | "tower" | "station" | "palace" | "vault";
  glow?: boolean;
};

const pieces: Piece[] = [
  { label: "Space Grail", accent: "bg-stone-200", type: "space" },
  { label: "Townhouse", accent: "bg-amber-600", type: "home" },
  { label: "Garden Build", accent: "bg-lime-700", type: "home", glow: true },
  { label: "Iron Tower", accent: "bg-slate-700", type: "tower" },
  { label: "Old Station", accent: "bg-red-700", type: "station" },
  { label: "Marble Palace", accent: "bg-stone-100", type: "palace" },
];

function SpacePiece() {
  return (
    <div className="relative h-28 w-44">
      <span className="absolute bottom-10 left-8 h-8 w-28 rounded-full bg-stone-200 shadow-lg" />
      <span className="absolute bottom-15 left-16 h-7 w-12 rounded-t-full bg-slate-300" />
      <span className="absolute bottom-7 left-0 h-4 w-24 -skew-x-[24deg] rounded bg-stone-100" />
      <span className="absolute bottom-7 right-0 h-4 w-24 skew-x-[24deg] rounded bg-stone-100" />
      <span className="absolute bottom-5 left-12 h-3 w-20 rounded-full bg-red-500" />
    </div>
  );
}

function BuildingPiece({ accent, station = false }: { accent: string; station?: boolean }) {
  return (
    <div className="relative h-32 w-44">
      <span className={`absolute bottom-0 left-4 h-22 w-36 rounded-t-lg ${accent} shadow-xl`} />
      <span className="absolute bottom-22 left-2 h-8 w-40 rounded-t-xl bg-slate-900" />
      {station ? <span className="absolute bottom-28 left-18 h-9 w-10 rounded-t-full bg-slate-800" /> : null}
      <span className="absolute bottom-5 left-7 h-8 w-8 rounded bg-amber-100" />
      <span className="absolute bottom-5 right-7 h-8 w-8 rounded bg-amber-100" />
      <span className="absolute bottom-4 left-18 h-11 w-9 rounded-t-lg bg-slate-950/85" />
      <span className="absolute bottom-0 left-0 h-4 w-full rounded bg-[#2f2118]" />
    </div>
  );
}

function TowerPiece() {
  return (
    <div className="relative h-36 w-36">
      <span className="absolute bottom-0 left-3 h-4 w-30 rounded bg-slate-800" />
      <span className="absolute bottom-4 left-8 h-28 w-20 rounded-t-full bg-slate-700 shadow-xl" />
      <span className="absolute bottom-16 left-9 h-2 w-18 rounded bg-stone-200" />
      <span className="absolute bottom-8 left-6 h-2 w-24 rounded bg-stone-200" />
      <span className="absolute bottom-28 left-16 h-8 w-2 rounded bg-slate-900" />
    </div>
  );
}

function PalacePiece() {
  return (
    <div className="relative h-32 w-48">
      <span className="absolute bottom-0 left-5 h-16 w-38 rounded bg-stone-100 shadow-xl" />
      <span className="absolute bottom-16 left-14 h-14 w-20 rounded-t-full bg-white shadow-lg" />
      <span className="absolute bottom-6 left-10 h-9 w-4 rounded-t-full bg-white" />
      <span className="absolute bottom-6 left-18 h-9 w-4 rounded-t-full bg-white" />
      <span className="absolute bottom-6 right-18 h-9 w-4 rounded-t-full bg-white" />
      <span className="absolute bottom-6 right-10 h-9 w-4 rounded-t-full bg-white" />
      <span className="absolute bottom-0 left-0 h-5 w-full rounded bg-stone-300" />
    </div>
  );
}

function VaultPiece() {
  return (
    <div className="relative h-28 w-40 rounded-xl bg-yellow-400 shadow-xl">
      <div className="grid grid-cols-4 gap-2 p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} className="h-4 rounded-full bg-white/40 shadow-inner" />
        ))}
      </div>
      <span className="absolute bottom-0 left-0 h-8 w-full rounded-b-xl bg-red-500" />
    </div>
  );
}

function PieceModel({ piece }: { piece: Piece }) {
  if (piece.type === "space") return <SpacePiece />;
  if (piece.type === "tower") return <TowerPiece />;
  if (piece.type === "station") return <BuildingPiece accent={piece.accent} station />;
  if (piece.type === "palace") return <PalacePiece />;
  if (piece.type === "vault") return <VaultPiece />;
  return <BuildingPiece accent={piece.accent} />;
}

function CabinetCell({ piece }: { piece: Piece }) {
  return (
    <div className={piece.glow ? "relative flex min-h-[206px] flex-col justify-end overflow-hidden rounded-[1.6rem] border border-yellow-300/50 bg-gradient-to-b from-yellow-100 to-yellow-300/70 p-4 shadow-lg" : "relative flex min-h-[206px] flex-col justify-end overflow-hidden rounded-[1.6rem] border border-[#eadfce] bg-gradient-to-b from-[#fff8eb] to-[#f5dfbd] p-4 shadow-lg"}>
      <div className="absolute left-1/2 top-2 h-16 w-28 -translate-x-1/2 rounded-full bg-yellow-300/45 blur-xl" />
      <div className="absolute left-1/2 top-2 h-3 w-20 -translate-x-1/2 rounded-full bg-white/70 shadow" />
      <div className="relative mx-auto mb-5 flex h-36 w-full items-end justify-center">
        <PieceModel piece={piece} />
      </div>
      <div className="relative mx-auto min-w-[118px] rounded-lg bg-slate-950 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-yellow-300 shadow-lg">
        {piece.label}
      </div>
    </div>
  );
}

export function HeroShowcase({ eyebrow, description, imageLabel, imageDetail, primarySignal, secondarySignal, primaryHref = "/marketplace" }: HeroShowcaseProps) {
  return (
    <section className="relative grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          {eyebrow}
        </div>
        <div className="space-y-5">
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-slate-950 sm:text-6xl xl:text-7xl">
            <span className="block">Own with confidence.</span>
            <span className="relative block text-yellow-500">Trade with trust.<span className="absolute -bottom-3 left-0 hidden h-3 w-72 rounded-full bg-yellow-300/70 blur-[1px] sm:block" /></span>
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-600">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="h-12 rounded-xl bg-yellow-400 px-6 font-semibold text-slate-950 shadow-[0_16px_36px_rgba(245,179,1,0.28)] hover:bg-yellow-300">
            <Link href={primaryHref}>Browse Marketplace <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-xl border-[#eadfce] bg-white px-6 shadow-[0_12px_28px_rgba(43,30,18,0.06)]">
            <Link href="/vault">View Vault <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      <div className="relative min-h-[560px] lg:min-h-[660px]">
        <div className="absolute inset-x-0 top-0 h-[560px] overflow-hidden rounded-[2.4rem] border border-[#eadfce] bg-[#fff7e7] p-5 shadow-[0_38px_120px_rgba(67,38,16,0.16)] lg:h-[640px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.9),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(250,204,21,0.24),transparent_28%),linear-gradient(135deg,#fffaf1_0%,#f4dfbd_100%)]" />
          <div className="absolute inset-3 rounded-[2rem] border border-white/80 bg-white/45 shadow-[inset_0_0_55px_rgba(255,255,255,0.65)]" />
          <div className="relative z-10 grid h-[438px] grid-cols-2 gap-3 sm:grid-cols-3 lg:h-[520px]">
            {pieces.map((piece) => <CabinetCell key={piece.label} piece={piece} />)}
          </div>
          <div className="absolute left-8 top-8 z-20 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm">{primarySignal}</div>
          <div className="absolute right-8 top-8 z-20 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white shadow-sm">{secondarySignal}</div>
          <div className="absolute bottom-12 left-8 right-8 z-30 rounded-2xl border border-white/70 bg-white/90 p-5 text-slate-950 shadow-[0_20px_70px_rgba(67,38,16,0.18)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-medium text-slate-500">{imageLabel}</p><p className="mt-2 max-w-lg text-2xl font-semibold leading-tight">{imageDetail}</p></div>
              <LockKeyhole className="h-6 w-6 shrink-0 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
