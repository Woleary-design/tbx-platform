"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BadgeCheck, Boxes, Car, CircleDollarSign, Gem, ScanSearch, Sparkles, Watch } from "lucide-react";

type FeaturedSet = {
  set_number: string;
  name: string;
  theme: string | null;
  image_url: string | null;
  year_released: number | null;
  piece_count: number | null;
};

type AtlasHeroRecordProps = {
  featuredSet: FeaturedSet | null;
};

type HeroRecord = {
  category: string;
  identifier: string;
  name: string;
  subtitle: string;
  visual: "image" | "car" | "card" | "watch";
  imageUrl?: string | null;
  value: string;
  trend: string;
  collectors: string;
  listings: string;
  lastSale: string;
};

const fallbackRecords: HeroRecord[] = [
  {
    category: "Hot Wheels",
    identifier: "RLC · 2024",
    name: "Skyline GT-R",
    subtitle: "Verified release, edition and market history.",
    visual: "car",
    value: "R2,480",
    trend: "+11.2%",
    collectors: "1,924",
    listings: "18",
    lastSale: "2h ago",
  },
  {
    category: "Trading Cards",
    identifier: "Base Set · 4/102",
    name: "Charizard",
    subtitle: "Grading, population and sale history in one record.",
    visual: "card",
    value: "R18,900",
    trend: "+6.8%",
    collectors: "8,412",
    listings: "43",
    lastSale: "Today",
  },
  {
    category: "Watches",
    identifier: "Reference · 124060",
    name: "Submariner",
    subtitle: "Reference identity, ownership and live market context.",
    visual: "watch",
    value: "R214,000",
    trend: "+2.4%",
    collectors: "3,106",
    listings: "27",
    lastSale: "Yesterday",
  },
];

function ProductVisual({ record }: { record: HeroRecord }) {
  if (record.visual === "image" && record.imageUrl) {
    return (
      <img
        src={record.imageUrl}
        alt={record.name}
        className="max-h-[290px] w-full object-contain drop-shadow-[0_34px_55px_rgba(0,0,0,0.5)]"
      />
    );
  }

  const Icon = record.visual === "car" ? Car : record.visual === "watch" ? Watch : Gem;
  return (
    <div className="relative grid h-52 w-52 place-items-center rounded-[3rem] border border-[#e8c86a]/16 bg-[#e8c86a]/[0.05] shadow-[0_35px_80px_rgba(0,0,0,0.42)]">
      <div className="absolute inset-8 rounded-full bg-[#e8c86a]/12 blur-3xl" />
      <Icon className="relative h-24 w-24 text-[#e8c86a]" strokeWidth={1.2} />
    </div>
  );
}

export function AtlasHeroRecord({ featuredSet }: AtlasHeroRecordProps) {
  const records = useMemo<HeroRecord[]>(
    () => [
      {
        category: "LEGO",
        identifier: featuredSet?.set_number ?? "10317-1",
        name: featuredSet?.name ?? "Land Rover Classic Defender 90",
        subtitle: "One trusted record for identity, ownership and market intelligence.",
        visual: "image",
        imageUrl: featuredSet?.image_url,
        value: "R4,895",
        trend: "+8.1%",
        collectors: "2,483",
        listings: "14",
        lastSale: "Yesterday",
      },
      ...fallbackRecords,
    ],
    [featuredSet],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const record = records[activeIndex];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % records.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [records.length]);

  return (
    <div className="relative min-h-[540px] lg:min-h-[630px]">
      <div className="absolute inset-8 rounded-full bg-[#e8c86a]/10 blur-3xl" />
      <div className="absolute inset-x-0 top-8 overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#09111f]/94 shadow-[0_42px_130px_rgba(0,0,0,0.52)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-[#e8c86a]/20">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e8c86a]">Atlas record</p>
            <p className="mt-1 text-sm font-semibold text-white/70">Live collector intelligence</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified
          </span>
        </div>

        <div key={`${record.category}-${record.identifier}`} className="animate-in fade-in duration-500">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative grid min-h-[330px] place-items-center overflow-hidden border-b border-white/[0.07] bg-white/[0.018] p-8 lg:border-b-0 lg:border-r">
              <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#07101c]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45 backdrop-blur">
                <ScanSearch className="h-3.5 w-3.5 text-[#e8c86a]" /> Identity confirmed
              </div>
              <ProductVisual record={record} />
              <div className="absolute bottom-5 right-5 rounded-2xl border border-[#e8c86a]/18 bg-[#07101c]/88 px-4 py-3 shadow-xl backdrop-blur">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/28">Current value</p>
                <p className="mt-1 text-xl font-black tracking-[-0.04em] text-[#e8c86a]">{record.value}</p>
              </div>
            </div>

            <div className="flex flex-col justify-between p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30">
                  {record.category} · {record.identifier}
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.045em]">{record.name}</h2>
                <p className="mt-3 text-sm leading-6 text-white/42">{record.subtitle}</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  ["Market value", record.value],
                  ["30-day trend", `▲ ${record.trend}`],
                  ["Collectors", record.collectors],
                  ["Live listings", record.listings],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/28">{label}</p>
                    <p className={`mt-1 text-sm font-bold ${label === "30-day trend" ? "text-emerald-300" : "text-white/78"}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-white/[0.07]">
            {[
              ["Last verified sale", record.lastSale],
              ["Market confidence", "High"],
              ["Atlas status", "Collector ready"],
            ].map(([label, value], index) => (
              <div key={label} className={`px-4 py-4 ${index ? "border-l border-white/[0.07]" : ""}`}>
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">{label}</p>
                <p className="mt-1 text-sm font-bold text-white/75">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3">
          <div className="flex gap-2" aria-label="Atlas record examples">
            {records.map((item, index) => (
              <button
                key={`${item.category}-${item.identifier}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-7 bg-[#e8c86a]" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
                aria-label={`Show ${item.name}`}
              />
            ))}
          </div>
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/25">
            <Sparkles className="h-3.5 w-3.5 text-[#e8c86a]" /> One record. Every category.
          </span>
        </div>
      </div>
    </div>
  );
}
