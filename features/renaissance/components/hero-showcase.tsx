"use client";

import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const verifiedHeroImage =
  "https://storage.ghost.io/c/51/f8/51f871d8-b6be-4a73-b958-0ca4fff0110a/content/images/hyperallergic-newspack-s3-amazonaws-com/uploads/2017/03/models-prototypes.jpg";

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
  primarySignal,
  secondarySignal,
  imageSrc = verifiedHeroImage,
  primaryHref = "/marketplace",
}: HeroShowcaseProps) {
  const safeImageSrc = imageSrc.includes("upload.wikimedia.org") ? verifiedHeroImage : imageSrc;

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
        <div className="absolute inset-x-0 top-0 h-[560px] overflow-hidden rounded-[2rem] border border-slate-200 bg-[#21160f] shadow-[0_34px_110px_rgba(15,23,42,0.22)] lg:h-[640px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(250,204,21,0.34),transparent_24%),radial-gradient(circle_at_72%_18%,rgba(250,204,21,0.22),transparent_20%),linear-gradient(135deg,#3b2518_0%,#0f172a_100%)]" />
          <img
            src={safeImageSrc}
            alt={imageLabel}
            className="relative z-10 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/10 via-transparent to-black/5" />
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
        <div className="absolute left-5 top-5 z-40 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
          {primarySignal}
        </div>
        <div className="absolute right-5 top-5 z-40 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white shadow-sm">
          {secondarySignal}
        </div>
      </div>
    </section>
  );
}
