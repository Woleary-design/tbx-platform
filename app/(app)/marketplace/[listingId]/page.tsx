import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, Clock, FileText, ShieldCheck, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marketplaceListings } from "@/features/renaissance/data/collector-experience.mock";

const listing = marketplaceListings[0];

const conditionRows = [
  ["Box", "★★★★★", "Sharp corners, light shelf wear"],
  ["Instructions", "★★★★★", "Complete and protected"],
  ["Pieces", "100%", "Verified complete"],
  ["Stickers", "Excellent", "Applied cleanly"],
  ["Inspection", "TBX Verified", "Photos reviewed"],
];

const provenance = [
  ["Purchased", "2021"],
  ["Original invoice", "Included"],
  ["Storage", "Smoke-free cabinet"],
  ["Previous owners", "1"],
  ["Documentation", "Complete"],
];

function GalleryMock() {
  return (
    <div className="rounded-[2rem] border border-[#eadfce] bg-white p-4 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#fbf4e8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_22%,rgba(250,204,21,0.35),transparent_30%),linear-gradient(135deg,#fff7e6,#ead7b8)]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-96 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/70 bg-white/65 shadow-[0_34px_80px_rgba(43,30,18,0.16)]" />
        <div className="absolute left-1/2 top-1/2 h-48 w-72 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute bottom-0 left-4 h-36 w-28 rounded-t-3xl bg-amber-300 shadow-xl" />
          <span className="absolute bottom-0 left-[112px] h-44 w-32 rounded-t-3xl bg-stone-100 shadow-xl" />
          <span className="absolute bottom-0 right-1 h-32 w-24 rounded-t-3xl bg-emerald-800 shadow-xl" />
          <span className="absolute bottom-0 left-0 h-10 w-full rounded bg-slate-950" />
          <span className="absolute left-12 top-10 h-6 w-16 rounded-t-full bg-slate-900" />
          <span className="absolute left-[142px] top-3 h-8 w-20 rounded-t-full bg-red-700" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {["Front", "Box", "Pieces", "Seal"].map((item) => (
          <div key={item} className="rounded-xl border border-[#eadfce] bg-[#fffaf1] px-3 py-4 text-center text-xs font-semibold text-slate-600">{item}</div>
        ))}
      </div>
    </div>
  );
}

function TrustPanel() {
  return (
    <div className="rounded-[1.5rem] border border-[#eadfce] bg-white p-5 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-600">Seller Trust</p>
          <h3 className="mt-2 text-4xl font-semibold text-slate-950">96</h3>
          <p className="text-sm text-slate-500">Premier Seller</p>
        </div>
        <ShieldCheck className="h-10 w-10 text-yellow-500" />
      </div>
      <div className="mt-5 grid gap-3 text-sm text-slate-600">
        {["Identity verified", "Address verified", "Payout verified", "184 protected trades", "0 disputes", "1.4 day dispatch"].map((item) => (
          <div key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> {item}</div>
        ))}
      </div>
    </div>
  );
}

function PurchasePanel() {
  return (
    <aside className="sticky top-6 rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.10)]">
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white"><ShieldCheck className="h-3.5 w-3.5 text-yellow-300" /> TBX Verified</div>
      <h2 className="mt-5 text-3xl font-semibold text-slate-950">{listing.price}</h2>
      <p className="mt-2 text-sm text-slate-500">Protected checkout. Funds held safely until delivery.</p>
      <Button asChild className="mt-6 h-12 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 shadow-[0_16px_36px_rgba(245,179,1,0.25)] hover:bg-yellow-300">
        <Link href={`/checkout/${listing.id}`}>Buy Protected <ArrowRight className="h-4 w-4" /></Link>
      </Button>
      <div className="mt-6 grid gap-3 text-sm text-slate-600">
        <div className="flex items-center justify-between"><span>Courier</span><strong>Included</strong></div>
        <div className="flex items-center justify-between"><span>Insurance</span><strong>Included</strong></div>
        <div className="flex items-center justify-between"><span>Dispatch</span><strong>24h</strong></div>
      </div>
    </aside>
  );
}

export default function ProductDetailPage() {
  return (
    <div className="space-y-10">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">← Back to Marketplace</Link>
      <section className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <GalleryMock />
          <div className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600">Collector Piece</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{listing.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">A collector-grade piece presented with TBX Secure protection, seller reputation, condition evidence and provenance details before checkout.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <TrustPanel />
            <div className="rounded-[1.5rem] border border-[#eadfce] bg-white p-5 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-600">Shipping</p>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-slate-950" /> The Courier Guy estimate: 2 days</div>
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-slate-950" /> Insured delivery included</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-950" /> Seller dispatches within 24h</div>
              </div>
            </div>
          </div>
          <section className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-950">Condition Report</h2>
            <div className="mt-5 grid gap-3">
              {conditionRows.map(([label, value, detail]) => (
                <div key={label} className="grid gap-2 rounded-xl border border-[#eadfce] bg-[#fffaf1] p-4 text-sm sm:grid-cols-[160px_150px_1fr]"><strong>{label}</strong><span className="text-yellow-600">{value}</span><span className="text-slate-600">{detail}</span></div>
              ))}
            </div>
          </section>
          <section className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-950">Provenance</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {provenance.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-[#eadfce] bg-[#fffaf1] p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-2 font-semibold text-slate-950">{value}</p></div>
              ))}
            </div>
          </section>
        </div>
        <PurchasePanel />
      </section>
    </div>
  );
}
