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

export function HeroShowcase({
  eyebrow,
  title,
  description,
  imageLabel,
  imageDetail,
  imageSrc,
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

      <div className="relative min-h-[520px] lg:min-h-[640px]">
        <div className="absolute inset-x-0 top-2 overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/70 shadow-[0_34px_110px_rgba(67,38,16,0.16)] ring-1 ring-[#eadfce] lg:top-0">
          <div className="relative aspect-[1.18/1] overflow-hidden bg-[#fff8ec]">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={imageLabel}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#fff8ec] text-sm font-medium text-slate-500">
                {imageLabel}
              </div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.38),transparent_32%,transparent_62%,rgba(255,255,255,0.16)),radial-gradient(circle_at_76%_18%,rgba(250,204,21,0.16),transparent_30%)]" />
            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-[0_10px_30px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/80 backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" />
              {primarySignal}
            </div>
            <div className="absolute right-5 top-5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white shadow-sm">
              {secondarySignal}
            </div>
            <div className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] border border-white/75 bg-white/88 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.15)] backdrop-blur-xl sm:left-8 sm:right-auto sm:max-w-[480px]">
              <p className="text-sm font-semibold text-slate-500">{imageDetail}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["TBX Secure", "Verified collectors", "Protected value"].map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}