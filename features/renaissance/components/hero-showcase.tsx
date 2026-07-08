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

function Studs({ x, y, columns, rows, gap = 19, fill = "#fff7bf" }: { x: number; y: number; columns: number; rows: number; gap?: number; fill?: string }) {
  return (
    <g>
      {Array.from({ length: columns * rows }).map((_, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        return <circle key={index} cx={x + col * gap} cy={y + row * gap} r="6.5" fill={fill} opacity="0.9" />;
      })}
    </g>
  );
}

function HeroCabinetArtwork() {
  return (
    <svg viewBox="0 0 920 700" role="img" aria-label="Bespoke TBX cream museum cabinet with original brick-built collector models" className="h-full w-full">
      <defs>
        <linearGradient id="shell" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#fffdf7" />
          <stop offset="48%" stopColor="#fff1d2" />
          <stop offset="100%" stopColor="#e9c991" />
        </linearGradient>
        <linearGradient id="bay" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff9ea" />
          <stop offset="55%" stopColor="#f7dfb0" />
          <stop offset="100%" stopColor="#d0a873" />
        </linearGradient>
        <linearGradient id="yellowBay" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff7c2" />
          <stop offset="58%" stopColor="#ffd757" />
          <stop offset="100%" stopColor="#d99b16" />
        </linearGradient>
        <radialGradient id="lamp" cx="50%" cy="18%" r="64%">
          <stop offset="0%" stopColor="#fff9dc" stopOpacity="1" />
          <stop offset="45%" stopColor="#ffd76a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="glass" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.44" />
          <stop offset="42%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
        </linearGradient>
        <filter id="cabinetShadow" x="-18%" y="-16%" width="136%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="22" floodColor="#8a5a1f" floodOpacity="0.16" />
        </filter>
        <filter id="objectShadow" x="-25%" y="-25%" width="150%" height="160%">
          <feDropShadow dx="0" dy="13" stdDeviation="8" floodColor="#4b2f14" floodOpacity="0.2" />
        </filter>
      </defs>

      <ellipse cx="460" cy="646" rx="355" ry="34" fill="#9f7a42" opacity="0.12" />
      <rect x="34" y="28" width="852" height="602" rx="54" fill="url(#shell)" filter="url(#cabinetShadow)" />
      <rect x="58" y="54" width="804" height="548" rx="38" fill="#fffaf0" opacity="0.94" />

      <rect x="76" y="76" width="236" height="218" rx="28" fill="url(#bay)" />
      <rect x="342" y="76" width="236" height="218" rx="28" fill="url(#bay)" />
      <rect x="608" y="76" width="236" height="218" rx="28" fill="url(#yellowBay)" />
      <rect x="76" y="326" width="236" height="218" rx="28" fill="url(#bay)" />
      <rect x="342" y="326" width="236" height="218" rx="28" fill="url(#bay)" />
      <rect x="608" y="326" width="236" height="218" rx="28" fill="url(#bay)" />

      {[194, 460, 726].map((cx) => <ellipse key={`lamp-top-${cx}`} cx={cx} cy="96" rx="72" ry="20" fill="url(#lamp)" />)}
      {[194, 460, 726].map((cx) => <ellipse key={`lamp-bottom-${cx}`} cx={cx} cy="346" rx="72" ry="20" fill="url(#lamp)" />)}
      <path d="M327 74V548M593 74V548M76 310H844" stroke="#fffaf0" strokeWidth="13" strokeLinecap="round" />
      <path d="M327 78V548M593 78V548M82 310H838" stroke="#e5c891" strokeWidth="2" opacity="0.35" />

      <g filter="url(#objectShadow)">
        <g transform="translate(108 126)">
          <path d="M18 74L98 34L178 74L98 96Z" fill="#eef2f7" />
          <path d="M98 34L126 68H70Z" fill="#94a3b8" />
          <path d="M18 74L0 112L84 94Z" fill="#f8fafc" />
          <path d="M178 74L196 112L112 94Z" fill="#f8fafc" />
          <rect x="66" y="96" width="64" height="11" rx="5.5" fill="#ef4444" />
          <circle cx="98" cy="74" r="16" fill="#111827" />
          <circle cx="98" cy="74" r="9" fill="#cbd5e1" />
        </g>

        <g transform="translate(374 122)">
          <rect x="18" y="70" width="164" height="78" rx="10" fill="#f6c95b" />
          <rect x="38" y="48" width="124" height="32" rx="10" fill="#263447" />
          <rect x="48" y="92" width="25" height="31" rx="4" fill="#fff8db" />
          <rect x="91" y="92" width="25" height="31" rx="4" fill="#fff8db" />
          <rect x="134" y="92" width="25" height="31" rx="4" fill="#fff8db" />
          <rect x="77" y="124" width="46" height="28" rx="5" fill="#047857" />
          <rect x="2" y="150" width="196" height="16" rx="8" fill="#111827" />
          <Studs x={53} y={61} columns={5} rows={1} gap={23} />
        </g>

        <g transform="translate(646 122)">
          <rect x="36" y="82" width="134" height="76" rx="20" fill="#d8f4df" />
          <path d="M28 84C62 32 150 30 184 84Z" fill="#7bd690" />
          <path d="M58 80C82 48 130 48 154 80Z" fill="#fff8dc" />
          <rect x="62" y="112" width="82" height="46" rx="10" fill="#168454" />
          <rect x="10" y="160" width="194" height="16" rx="8" fill="#111827" />
          <circle cx="78" cy="102" r="7" fill="#facc15" />
          <circle cx="106" cy="96" r="7" fill="#facc15" />
          <circle cx="134" cy="102" r="7" fill="#facc15" />
        </g>

        <g transform="translate(126 376)">
          <path d="M78 18L122 164H34Z" fill="#364557" />
          <path d="M78 18L96 164H60Z" fill="#dbe3ed" opacity="0.82" />
          <path d="M48 66H108M42 102H114M34 138H122" stroke="#fff8ea" strokeWidth="7" strokeLinecap="round" />
          <rect x="18" y="164" width="138" height="16" rx="8" fill="#111827" />
        </g>

        <g transform="translate(376 394)">
          <rect x="10" y="80" width="176" height="76" rx="12" fill="#dc2626" />
          <rect x="36" y="48" width="122" height="40" rx="10" fill="#334155" />
          <rect x="56" y="104" width="23" height="28" rx="5" fill="#fff7d6" />
          <rect x="100" y="104" width="23" height="28" rx="5" fill="#fff7d6" />
          <rect x="140" y="104" width="23" height="28" rx="5" fill="#fff7d6" />
          <rect x="0" y="156" width="198" height="16" rx="8" fill="#111827" />
          <Studs x={48} y={88} columns={5} rows={2} gap={24} fill="#fff2a8" />
        </g>

        <g transform="translate(638 378)">
          <rect x="24" y="98" width="172" height="76" rx="12" fill="#f9fafb" />
          <path d="M44 98C64 46 154 44 176 98Z" fill="#ffffff" />
          <rect x="50" y="126" width="20" height="48" rx="5" fill="#fff8ea" />
          <rect x="86" y="118" width="20" height="56" rx="5" fill="#fff8ea" />
          <rect x="122" y="118" width="20" height="56" rx="5" fill="#fff8ea" />
          <rect x="158" y="126" width="20" height="48" rx="5" fill="#fff8ea" />
          <circle cx="110" cy="92" r="34" fill="#fff3c4" />
          <circle cx="110" cy="92" r="22" fill="#fffefa" opacity="0.78" />
          <rect x="0" y="176" width="220" height="16" rx="8" fill="#111827" />
        </g>
      </g>

      <rect x="58" y="54" width="804" height="548" rx="38" fill="url(#glass)" />
      <path d="M96 94C144 222 156 392 142 576M772 92C722 230 710 390 732 576" stroke="#ffffff" strokeWidth="13" opacity="0.22" fill="none" />
      <path d="M74 76C166 44 280 52 346 100M610 76C714 44 798 54 846 104" stroke="#ffffff" strokeWidth="4" opacity="0.58" fill="none" />
      <rect x="34" y="28" width="852" height="602" rx="54" fill="none" stroke="#ffffff" strokeWidth="8" opacity="0.82" />
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
          <div className="absolute bottom-12 left-10 z-30 flex max-w-[520px] flex-wrap gap-2">
            {["TBX Secure", "Verified collectors", "Protected value"].map((item) => (
              <span key={item} className="rounded-full border border-white/80 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-800 shadow-[0_10px_30px_rgba(67,38,16,0.12)] backdrop-blur-md">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}