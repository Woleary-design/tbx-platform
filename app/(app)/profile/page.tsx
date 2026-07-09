import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarDays, Camera, CheckCircle2, Gem, MapPin, ShieldCheck, Sparkles, Star, TrendingUp, Trophy, Vault } from "lucide-react";
import { Button } from "@/components/ui/button";

const profileStats = [
  { label: "TBX Score", value: "96", detail: "Premier Collector" },
  { label: "Completed Trades", value: "184", detail: "0 disputes" },
  { label: "Vault Value", value: "R2.81M", detail: "+8.4% this quarter" },
  { label: "Dispatch Avg", value: "1.4d", detail: "Fast seller" },
];

const collectorDna = [
  { label: "Retired Modulars", value: "92%" },
  { label: "Star Wars UCS", value: "84%" },
  { label: "Icons Display", value: "76%" },
  { label: "Vintage Pirates", value: "48%" },
];

const badges = ["Identity verified", "Address verified", "Payout verified", "Premier seller", "TBX Secure eligible", "Collector since 2021"];

const showcase = [
  { title: "Café Corner 10182", detail: "Modular grail · Complete", value: "R42 000" },
  { title: "UCS Millennium Falcon 75192", detail: "Star Wars UCS · TBX Verified", value: "R24 500" },
  { title: "Green Grocer 10185", detail: "Modular grail · Condition photos due", value: "R38 000" },
];

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-slate-950 shadow-[0_28px_100px_rgba(15,23,42,0.16)]">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="p-7 text-white md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-yellow-400 text-xl font-semibold text-slate-950">WO</span>
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-yellow-300"><ShieldCheck className="h-4 w-4" /> Premier Collector</p>
                <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-6xl">Warren O&apos;Leary</h1>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70">Trusted LEGO collector focused on retired modulars, Star Wars UCS and premium display sets. Reputation, proof and dispatch history stay visible before every trade.</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/70">
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-yellow-300" /> Johannesburg, South Africa</span>
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-yellow-300" /> Member since 2021</span>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              {profileStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <p className="text-xs text-white/55">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-white/55">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[360px] bg-[#f6f1e8]">
            <img src="https://the-block-exchange-landing-page.vercel.app/hero-cabinet.png" alt="Collector cabinet" className="h-full w-full object-cover" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">Public Profile</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">Reputation before price.</p>
              <p className="mt-1 text-sm text-slate-600">Buyers can see trust, dispatch and proof standards before making an offer.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Collector DNA</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">What Warren collects most.</h2>
          <div className="mt-6 space-y-4">
            {collectorDna.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-sm"><span className="font-medium text-slate-700">{item.label}</span><span className="font-semibold text-slate-950">{item.value}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[#fffaf1]"><div className="h-full rounded-full bg-yellow-400" style={{ width: item.value }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Trust Passport</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Verification badges buyers care about.</h2>
            </div>
            <ShieldCheck className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {badges.map((badge) => (
              <div key={badge} className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-4 text-sm font-medium text-slate-700"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> {badge}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Collection Showcase</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Public highlights from the vault.</h2>
            </div>
            <Button asChild variant="outline" className="hidden rounded-xl border-[#eadfce] bg-white sm:inline-flex"><Link href="/vault">Open My Vault <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
          <div className="mt-6 space-y-3">
            {showcase.map((item) => (
              <div key={item.title} className="grid gap-3 rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-4 md:grid-cols-[1fr_140px] md:items-center">
                <div><p className="font-semibold text-slate-950">{item.title}</p><p className="mt-1 text-sm text-slate-500">{item.detail}</p></div>
                <p className="font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#eadfce] bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300"><Sparkles className="h-4 w-4" /> Profile AI</p>
          <h2 className="mt-3 text-2xl font-semibold">Reputation insight</h2>
          <p className="mt-4 text-sm leading-6 text-white/70">Warren&apos;s profile is strongest on trust and dispatch history. Adding three more invoice records would improve buyer confidence on high-value modulars.</p>
          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl bg-white/8 p-4 text-sm"><Trophy className="mb-2 h-5 w-5 text-yellow-300" /> Top strength: 0 disputes across 184 trades.</div>
            <div className="rounded-2xl bg-white/8 p-4 text-sm"><TrendingUp className="mb-2 h-5 w-5 text-yellow-300" /> Best theme signal: Retired Modulars.</div>
            <div className="rounded-2xl bg-white/8 p-4 text-sm"><Camera className="mb-2 h-5 w-5 text-yellow-300" /> Next action: add condition photos.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
