import Link from "next/link";
import { ArrowRight, BadgeCheck, Bot, Camera, FileText, LockKeyhole, ShieldCheck, Sparkles, TrendingUp, Upload, Vault } from "lucide-react";
import { Button } from "@/components/ui/button";

const vaultStats = [
  { label: "Vault Value", value: "R2.81M", detail: "+8.4% this quarter" },
  { label: "Documented Sets", value: "47", detail: "31 fully verified" },
  { label: "Insured Value", value: "R2.48M", detail: "92% coverage" },
  { label: "Watchlist Alerts", value: "6", detail: "3 price movements" },
];

const collectionRows = [
  { title: "UCS Millennium Falcon 75192", value: "R24 500", status: "TBX Verified", theme: "Star Wars UCS", score: 96 },
  { title: "Café Corner 10182", value: "R42 000", status: "Invoice missing", theme: "Modular Grails", score: 71 },
  { title: "Titanic 10294", value: "R18 900", status: "Insured", theme: "Icons Display", score: 92 },
  { title: "Green Grocer 10185", value: "R38 000", status: "Condition photos due", theme: "Modular Grails", score: 76 },
];

const healthItems = [
  { label: "Identity & ownership", value: "96%", icon: ShieldCheck },
  { label: "Condition photos", value: "78%", icon: Camera },
  { label: "Invoices attached", value: "64%", icon: FileText },
  { label: "Insurance coverage", value: "92%", icon: LockKeyhole },
];

const aiPrompts = [
  "What should I document next?",
  "Which sets are resale-ready?",
  "Which items need insurance?",
  "What changed this month?",
];

const aiInsights = [
  "Café Corner is your highest-value risk item: strong market signal, but invoice evidence is missing.",
  "Green Grocer needs 6 fresh condition photos before TBX would mark it resale-ready.",
  "Your insured value is healthy, but 8% of the vault is still outside declared cover.",
];

export default function VaultPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-slate-950 shadow-[0_28px_100px_rgba(15,23,42,0.16)]">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="p-7 text-white md:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-yellow-300">
              <Vault className="h-4 w-4" /> My Vault
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">Your private collector portfolio.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">
              Track provenance, condition evidence, insured value and ownership records for every premium LEGO set in your collection.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-semibold">47 documented pieces</div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-semibold">R2.81M insured view</div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-semibold">6 action alerts</div>
            </div>
          </div>
          <div className="relative min-h-[360px] bg-[#f6f1e8]">
            <img src="https://the-block-exchange-landing-page.vercel.app/hero-cabinet.png" alt="Premium collector cabinet" className="h-full w-full object-cover" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">Vault AI</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">3 actions recommended</p>
              <p className="mt-1 text-sm text-slate-600">Invoice evidence, condition photos and insurance cover can improve your vault score.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {vaultStats.map((stat) => (
          <div key={stat.label} className="rounded-[1.5rem] border border-[#eadfce] bg-white p-5 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-600">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-[#eadfce] bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300"><Bot className="h-4 w-4" /> Ask Vault AI</p>
              <h2 className="mt-3 text-3xl font-semibold">Your collector co-pilot.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Mocked AI for now: it reviews your vault evidence, resale readiness, insurance gaps and market signals.</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 text-center text-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Vault Score</p>
              <p className="mt-1 text-3xl font-semibold">84</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {aiPrompts.map((prompt) => (
              <button key={prompt} className="rounded-2xl border border-white/10 bg-white/8 p-4 text-left text-sm font-medium text-white transition hover:bg-white/12">
                {prompt}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-600">AI answer preview</p>
            <p className="mt-3 text-lg font-semibold">What should I document next?</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">Start with Café Corner: upload invoice proof and four box-corner photos. That single action would likely lift its vault score from 71 to 86 and make it resale-ready.</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">AI Action Queue</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Evidence that improves value.</h2>
          <div className="mt-6 space-y-3">
            {aiInsights.map((insight) => (
              <div key={insight} className="rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-4 text-sm leading-6 text-slate-700">
                <div className="mb-2 flex items-center gap-2 font-semibold text-slate-950"><Sparkles className="h-4 w-4 text-yellow-500" /> Vault AI</div>
                {insight}
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button className="rounded-xl bg-yellow-400 text-slate-950 hover:bg-yellow-300"><Upload className="h-4 w-4" /> Upload evidence</Button>
            <Button variant="outline" className="rounded-xl border-[#eadfce] bg-white">View all tasks</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Collection Register</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">High-value sets needing proof, photos or cover.</h2>
            </div>
            <Button asChild variant="outline" className="hidden rounded-xl border-[#eadfce] bg-white sm:inline-flex">
              <Link href="/marketplace">Add acquisition <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mt-6 space-y-3">
            {collectionRows.map((row) => (
              <div key={row.title} className="grid gap-3 rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-4 md:grid-cols-[1fr_110px_120px_150px] md:items-center">
                <div>
                  <p className="font-semibold text-slate-950">{row.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{row.theme}</p>
                </div>
                <p className="font-semibold text-slate-950">{row.value}</p>
                <p className="font-semibold text-slate-950">Score {row.score}</p>
                <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600"><BadgeCheck className="h-3.5 w-3.5 text-yellow-500" /> {row.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">Collection Health</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Make every set resale-ready.</h2>
          <div className="mt-6 space-y-4">
            {healthItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3"><Icon className="h-5 w-5 text-yellow-500" /><span className="font-medium text-slate-700">{item.label}</span></div>
                    <span className="font-semibold text-slate-950">{item.value}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-yellow-400" style={{ width: item.value }} /></div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-yellow-300" /><p className="font-semibold">Vault Intelligence</p></div>
            <p className="mt-3 text-sm leading-6 text-white/70">Café Corner has the strongest appreciation signal, but needs invoice evidence before resale.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
