import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, CheckCircle2, Clock, Eye, FileText, Heart, ShieldCheck, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marketplaceListings } from "@/features/renaissance/data/collector-experience.mock";

const listing = marketplaceListings[0];

const conditionRows = [
  ["Box corners", "A", "Sharp presentation, light shelf touch"],
  ["Seals", "Verified", "Factory seals photographed and reviewed"],
  ["Instructions", "Complete", "Stored flat in protective sleeve"],
  ["Pieces", "100%", "Inventory verified against checklist"],
  ["Minifigures", "Complete", "All figures present and inspected"],
  ["Sun fading", "None seen", "Display photos show clean colour consistency"],
  ["Storage", "Smoke-free", "Cabinet stored, dry indoor environment"],
];

const provenance = [
  ["2021", "Purchased from LEGO retail partner"],
  ["2022", "Stored in a glass cabinet collection room"],
  ["2025", "Box and seal photos added to TBX record"],
  ["Today", "Available through TBX Secure protected checkout"],
];

const marketSignals = [
  ["Watchers", "42"],
  ["30-day demand", "+11%"],
  ["Similar listed", "3"],
  ["TBX Score", "94"],
];

function GalleryMock() {
  return (
    <div className="overflow-hidden rounded-[2.25rem] border border-[#eadfce] bg-white shadow-[0_30px_100px_rgba(43,30,18,0.12)]">
      <div className="relative aspect-[16/11] overflow-hidden bg-[#fbf4e8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_22%,rgba(250,204,21,0.38),transparent_30%),linear-gradient(135deg,#fff8e8,#ecd1a8)]" />
        <div className="absolute left-1/2 top-1/2 h-[72%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-[2.5rem] border border-white/70 bg-white/65 shadow-[0_40px_95px_rgba(43,30,18,0.18)]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-96 -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 hover:scale-105">
          <span className="absolute bottom-0 left-5 h-44 w-32 rounded-t-[2rem] bg-amber-300 shadow-2xl" />
          <span className="absolute bottom-0 left-[142px] h-56 w-40 rounded-t-[2rem] bg-stone-100 shadow-2xl" />
          <span className="absolute bottom-0 right-2 h-40 w-28 rounded-t-[2rem] bg-emerald-800 shadow-2xl" />
          <span className="absolute bottom-0 left-0 h-12 w-full rounded bg-slate-950" />
          <span className="absolute left-14 top-8 h-8 w-20 rounded-t-full bg-slate-900" />
          <span className="absolute left-[178px] top-0 h-10 w-24 rounded-t-full bg-red-700" />
          <span className="absolute bottom-14 left-16 h-12 w-12 rounded bg-amber-100" />
          <span className="absolute bottom-14 left-[190px] h-14 w-12 rounded bg-amber-100" />
          <span className="absolute bottom-14 right-10 h-12 w-10 rounded bg-yellow-300" />
        </div>
        <div className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm">360° view placeholder</div>
        <div className="absolute bottom-5 left-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-yellow-300 shadow-lg">Collector-grade gallery</div>
      </div>
      <div className="grid grid-cols-4 gap-3 p-4">
        {["Hero", "Box corners", "Seal photos", "Inventory"].map((item) => (
          <div key={item} className="rounded-2xl border border-[#eadfce] bg-[#fffaf1] px-3 py-4 text-center text-xs font-semibold text-slate-600">{item}</div>
        ))}
      </div>
    </div>
  );
}

function SellerTrust() {
  return (
    <section className="rounded-[1.75rem] border border-[#eadfce] bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">Seller Reputation</p>
          <h3 className="mt-3 text-5xl font-semibold">96</h3>
          <p className="mt-2 text-sm text-white/65">Premier Seller · BrickVault SA</p>
        </div>
        <ShieldCheck className="h-11 w-11 text-yellow-300" />
      </div>
      <div className="mt-7 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
        {["184 successful trades", "0 disputes", "1.4 day dispatch", "Member since 2021", "Identity verified", "Address verified"].map((item) => (
          <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/8 px-4 py-3"><CheckCircle2 className="h-4 w-4 text-yellow-300" /> {item}</div>
        ))}
      </div>
    </section>
  );
}

function PurchasePanel() {
  return (
    <aside className="sticky top-6 rounded-[1.9rem] border border-[#eadfce] bg-white p-6 shadow-[0_30px_100px_rgba(43,30,18,0.13)]">
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white"><ShieldCheck className="h-3.5 w-3.5 text-yellow-300" /> TBX Verified</div>
        <button className="rounded-full border border-[#eadfce] p-2 text-slate-600 hover:text-red-500" aria-label="Save"><Heart className="h-4 w-4" /></button>
      </div>
      <h2 className="mt-6 text-4xl font-semibold text-slate-950">{listing.price}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">Protected checkout. Funds are held safely until delivery and inspection.</p>
      <Button asChild className="mt-6 h-13 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 shadow-[0_16px_36px_rgba(245,179,1,0.25)] hover:bg-yellow-300">
        <Link href={`/checkout/${listing.id}`}>Buy Protected <ArrowRight className="h-4 w-4" /></Link>
      </Button>
      <Button variant="outline" className="mt-3 h-12 w-full rounded-xl border-[#eadfce] bg-white">Make an Offer</Button>
      <div className="mt-6 grid gap-3 text-sm text-slate-600">
        <div className="flex items-center justify-between"><span>Courier</span><strong>Included</strong></div>
        <div className="flex items-center justify-between"><span>Insurance</span><strong>Included</strong></div>
        <div className="flex items-center justify-between"><span>Dispatch</span><strong>24h</strong></div>
        <div className="flex items-center justify-between"><span>Reserve timer</span><strong>30 min</strong></div>
      </div>
      <div className="mt-6 rounded-2xl bg-[#fffaf1] p-4 text-sm leading-6 text-slate-600"><strong className="text-slate-950">TBX Secure:</strong> seller paid only after delivery and buyer inspection.</div>
    </aside>
  );
}

export default function ProductDetailPage() {
  return (
    <div className="space-y-10">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">← Back to Marketplace</Link>
      <section className="grid gap-8 lg:grid-cols-[1fr_390px]">
        <div className="space-y-8">
          <GalleryMock />
          <div className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-slate-950">TBX Score 94</span>
              <span className="rounded-full border border-[#eadfce] bg-[#fffaf1] px-3 py-1.5 text-xs font-semibold text-slate-600">Collector Grade</span>
              <span className="rounded-full border border-[#eadfce] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">Original invoice</span>
            </div>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950">{listing.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">A collector-grade grail presented with condition evidence, seller reputation, provenance and TBX Secure protection before checkout.</p>
          </div>

          <SellerTrust />

          <section className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-950">Condition Report</h2>
            <div className="mt-5 grid gap-3">
              {conditionRows.map(([label, value, detail]) => (
                <div key={label} className="grid gap-2 rounded-xl border border-[#eadfce] bg-[#fffaf1] p-4 text-sm sm:grid-cols-[170px_150px_1fr]"><strong>{label}</strong><span className="font-semibold text-yellow-700">{value}</span><span className="text-slate-600">{detail}</span></div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
              <h2 className="text-2xl font-semibold text-slate-950">Provenance Timeline</h2>
              <div className="mt-6 space-y-4">
                {provenance.map(([year, detail]) => (
                  <div key={year} className="flex gap-4"><div className="grid h-10 w-10 place-items-center rounded-full bg-yellow-400 text-sm font-semibold text-slate-950">{year.slice(-2)}</div><div><p className="font-semibold text-slate-950">{year}</p><p className="text-sm text-slate-600">{detail}</p></div></div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
              <h2 className="text-2xl font-semibold text-slate-950">Market Intelligence</h2>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {marketSignals.map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-[#fffaf1] p-4"><p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p></div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[#eadfce] bg-white p-4 text-sm text-slate-600"><BarChart3 className="h-5 w-5 text-yellow-500" /> Price graph placeholder coming next.</div>
            </div>
          </section>
        </div>
        <PurchasePanel />
      </section>
    </div>
  );
}
