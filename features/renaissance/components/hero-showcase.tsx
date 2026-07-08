import { ArrowRight, ShieldCheck } from "lucide-react";
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

function Studs({ x, y, columns, rows, gap = 20, fill = "#fff4c2" }: { x: number; y: number; columns: number; rows: number; gap?: number; fill?: string }) {
  return (
    <g>
      {Array.from({ length: columns * rows }).map((_, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        return <circle key={index} cx={x + col * gap} cy={y + row * gap} r="7" fill={fill} opacity="0.78" />;
      })}
    </g>
  );
}

function HeroCabinetArtwork() {
  return (
    <svg viewBox="0 0 900 700" role="img" aria-label="TBX museum cabinet with original brick-built collector models" className="h-full w-full">
      <defs>
        <linearGradient id="cabinetShell" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff8e8" />
          <stop offset="55%" stopColor="#f4dfbd" />
          <stop offset="100%" stopColor="#ead0a6" />
        </linearGradient>
        <linearGradient id="compartment" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff2d4" />
          <stop offset="56%" stopColor="#e8c48f" />
          <stop offset="100%" stopColor="#7a5430" />
        </linearGradient>
        <linearGradient id="highlightCompartment" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="58%" stopColor="#f4bd36" />
          <stop offset="100%" stopColor="#8c5d19" />
        </linearGradient>
        <radialGradient id="spotlight" cx="50%" cy="12%" r="65%">
          <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.95" />
          <stop offset="42%" stopColor="#ffd76a" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="glass" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.24" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="20" stdDeviation="18" floodColor="#3b2714" floodOpacity="0.18" />
        </filter>
        <filter id="modelShadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="14" stdDeviation="8" floodColor="#1f140a" floodOpacity="0.28" />
        </filter>
      </defs>

      <rect x="32" y="30" width="836" height="620" rx="50" fill="url(#cabinetShell)" filter="url(#softShadow)" />
      <rect x="54" y="52" width="792" height="570" rx="34" fill="#fffaf0" opacity="0.84" />
      <rect x="70" y="72" width="230" height="232" rx="22" fill="url(#compartment)" />
      <rect x="335" y="72" width="230" height="232" rx="22" fill="url(#compartment)" />
      <rect x="600" y="72" width="230" height="232" rx="22" fill="url(#highlightCompartment)" />
      <rect x="70" y="336" width="230" height="232" rx="22" fill="url(#compartment)" />
      <rect x="335" y="336" width="230" height="232" rx="22" fill="url(#compartment)" />
      <rect x="600" y="336" width="230" height="232" rx="22" fill="url(#compartment)" />

      {[185, 450, 715].map((cx) => <ellipse key={`top-${cx}`} cx={cx} cy="96" rx="72" ry="16" fill="url(#spotlight)" />)}
      {[185, 450, 715].map((cx) => <ellipse key={`bottom-${cx}`} cx={cx} cy="360" rx="72" ry="16" fill="url(#spotlight)" />)}
      <path d="M315 70V570M580 70V570M70 320H830" stroke="#fff8e8" strokeWidth="10" strokeLinecap="round" opacity="0.82" />
      <path d="M56 78C160 40 270 52 342 100M592 76C700 44 790 56 832 104" stroke="#fff" strokeWidth="4" opacity="0.56" fill="none" />

      <g filter="url(#modelShadow)">
        <g transform="translate(100 138)">
          <path d="M20 72L92 34L168 72L92 94Z" fill="#f3f4f6" />
          <path d="M92 34L118 66H66Z" fill="#94a3b8" />
          <path d="M16 72L0 106L78 92Z" fill="#e5e7eb" />
          <path d="M168 72L186 106L106 92Z" fill="#e5e7eb" />
          <rect x="68" y="92" width="50" height="12" rx="6" fill="#ef4444" />
          <circle cx="92" cy="72" r="14" fill="#0f172a" />
        </g>

        <g transform="translate(362 124)">
          <rect x="16" y="66" width="166" height="82" rx="8" fill="#f8d56b" />
          <rect x="36" y="42" width="124" height="34" rx="8" fill="#263447" />
          <rect x="48" y="88" width="24" height="30" rx="3" fill="#fff7d6" />
          <rect x="92" y="88" width="24" height="30" rx="3" fill="#fff7d6" />
          <rect x="132" y="88" width="24" height="30" rx="3" fill="#fff7d6" />
          <rect x="78" y="120" width="42" height="28" rx="4" fill="#064e3b" />
          <rect x="0" y="148" width="198" height="20" rx="6" fill="#0f172a" />
          <Studs x={52} y={58} columns={5} rows={1} gap={23} />
        </g>

        <g transform="translate(642 124)">
          <rect x="40" y="78" width="132" height="82" rx="18" fill="#d7f0df" />
          <path d="M30 82C62 32 154 30 184 82Z" fill="#7ccf91" />
          <path d="M58 78C78 48 134 48 154 78Z" fill="#fff6c7" />
          <rect x="64" y="110" width="82" height="50" rx="8" fill="#1f7a4d" />
          <rect x="10" y="160" width="194" height="18" rx="6" fill="#0f172a" />
          <circle cx="76" cy="102" r="7" fill="#fde047" />
          <circle cx="106" cy="96" r="7" fill="#fde047" />
          <circle cx="136" cy="102" r="7" fill="#fde047" />
        </g>

        <g transform="translate(118 386)">
          <path d="M78 14L120 176H36Z" fill="#2f3b4a" />
          <path d="M78 14L96 176H60Z" fill="#cbd5e1" opacity="0.72" />
          <path d="M46 66H110M40 106H116M32 150H124" stroke="#f8fafc" strokeWidth="7" strokeLinecap="round" />
          <rect x="18" y="176" width="138" height="18" rx="6" fill="#0f172a" />
        </g>

        <g transform="translate(358 404)">
          <rect x="12" y="82" width="172" height="76" rx="8" fill="#b91c1c" />
          <rect x="38" y="50" width="118" height="40" rx="8" fill="#334155" />
          <rect x="58" y="106" width="22" height="28" rx="4" fill="#fff7d6" />
          <rect x="102" y="106" width="22" height="28" rx="4" fill="#fff7d6" />
          <rect x="138" y="106" width="22" height="28" rx="4" fill="#fff7d6" />
          <rect x="0" y="158" width="198" height="20" rx="6" fill="#0f172a" />
          <Studs x={50} y={90} columns={5} rows={2} gap={24} fill="#fff1a3" />
        </g>

        <g transform="translate(630 386)">
          <rect x="20" y="96" width="178" height="82" rx="10" fill="#f8fafc" />
          <path d="M42 94C60 44 158 44 176 94Z" fill="#fff" />
          <rect x="48" y="126" width="20" height="52" rx="4" fill="#f8fafc" />
          <rect x="84" y="118" width="20" height="60" rx="4" fill="#f8fafc" />
          <rect x="120" y="118" width="20" height="60" rx="4" fill="#f8fafc" />
          <rect x="156" y="126" width="20" height="52" rx="4" fill="#f8fafc" />
          <rect x="0" y="178" width="218" height="20" rx="6" fill="#0f172a" />
          <circle cx="110" cy="92" r="34" fill="#fff6d2" />
          <circle cx="110" cy="92" r="24" fill="#fff" opacity="0.74" />
        </g>
      </g>

      <rect x="54" y="52" width="792" height="570" rx="34" fill="url(#glass)" />
      <path d="M88 92C134 238 148 392 138 580M736 82C688 212 676 390 700 580" stroke="#ffffff" strokeWidth="12" opacity="0.18" fill="none" />
      <rect x="32" y="30" width="836" height="620" rx="50" fill="none" stroke="#fff7e8" strokeWidth="7" opacity="0.9" />
    </svg>
  );
}

export function HeroShowcase({
  eyebrow,
  title,
  description,
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

      <div className="relative min-h-[540px] lg:min-h-[640px]">
        <div className="absolute inset-x-0 top-0 h-[540px] overflow-hidden rounded-[2.25rem] bg-transparent lg:h-[620px]">
          <HeroCabinetArtwork />
          <div className="absolute left-8 top-8 z-20 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-[0_10px_30px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/80">
            <ShieldCheck className="h-3.5 w-3.5" />
            {primarySignal}
          </div>
          <div className="absolute right-8 top-8 z-20 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white shadow-sm">
            {secondarySignal}
          </div>
          <div className="absolute bottom-10 left-10 z-30 max-w-[360px] rounded-2xl border border-white/70 bg-white/88 p-4 text-slate-950 shadow-[0_18px_55px_rgba(67,38,16,0.18)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-yellow-700">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              TBX Secure
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-semibold">Verified collectors</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Reputation visible before the trade.</p>
              </div>
              <div>
                <p className="font-semibold">Protected value</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Escrow-first collector confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}