import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Boxes,
  CircleAlert,
  Clock3,
  Database,
  Lightbulb,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const metrics = [
  {
    label: "Marketplace value",
    value: "R0",
    detail: "Live order data will appear here",
    icon: TrendingUp,
  },
  {
    label: "Live listings",
    value: "0",
    detail: "Marketplace inventory",
    icon: Boxes,
  },
  {
    label: "Registered users",
    value: "0",
    detail: "Collector community",
    icon: Users,
  },
  {
    label: "Atlas confidence",
    value: "—",
    detail: "Awaiting valuation data",
    icon: ShieldCheck,
  },
];

const attention = [
  {
    title: "Listings awaiting review",
    description: "Moderation queue is clear.",
    count: 0,
    href: "/admin/marketplace?status=pending",
    icon: Boxes,
  },
  {
    title: "Low-confidence valuations",
    description: "No valuations currently need review.",
    count: 0,
    href: "/admin/atlas?filter=low-confidence",
    icon: ShieldCheck,
  },
  {
    title: "Unmatched catalogue searches",
    description: "No catalogue gaps have been recorded yet.",
    count: 0,
    href: "/admin/atlas?filter=unmatched",
    icon: SearchCheck,
  },
];

const prompts = [
  "Show listings awaiting review",
  "Which sets are trending?",
  "Show catalogue gaps",
  "Summarise marketplace activity",
];

export default function AdminDashboardPage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-violet-400/20 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,.2),transparent_38%),linear-gradient(135deg,rgba(255,255,255,.055),rgba(255,255,255,.015))] p-6 shadow-[0_30px_100px_rgba(0,0,0,.28)] sm:p-8 lg:p-10">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              Atlas is online
            </div>
            <div className="flex items-start gap-4">
              <div className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200 sm:grid">
                <Bot className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-violet-200">Atlas Command</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  {greeting}, Warren.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Marketplace activity is calm. There are no urgent items requiring your attention right now.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Systems healthy</p>
              <p className="text-xs text-slate-500">No active incidents</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon }) => (
          <article key={label} className="tbx-surface group rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-white/15">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-violet-300/15 bg-violet-400/[0.08] text-violet-300">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <article className="tbx-surface overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-300" />
                <h2 className="font-semibold">Daily briefing</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">What changed and what matters now.</p>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2.5 py-1 text-xs font-semibold text-emerald-300">
              All clear
            </span>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="rounded-2xl border border-violet-300/15 bg-violet-400/[0.055] p-5">
              <p className="text-sm leading-7 text-slate-300">
                Atlas is ready. As marketplace, search and valuation activity arrives, this briefing will surface changes, risks and opportunities automatically.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <Clock3 className="mb-3 h-5 w-5 text-violet-300" />
                <p className="text-2xl font-semibold">0</p>
                <p className="mt-1 text-xs text-slate-500">Orders today</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <SearchCheck className="mb-3 h-5 w-5 text-violet-300" />
                <p className="text-2xl font-semibold">—</p>
                <p className="mt-1 text-xs text-slate-500">Atlas match rate</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <Database className="mb-3 h-5 w-5 text-violet-300" />
                <p className="text-2xl font-semibold">0</p>
                <p className="mt-1 text-xs text-slate-500">Catalogue gaps</p>
              </div>
            </div>
          </div>
        </article>

        <article className="tbx-surface overflow-hidden rounded-2xl">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <CircleAlert className="h-4 w-4 text-amber-300" />
              <h2 className="font-semibold">Needs attention</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">Prioritised by Atlas.</p>
          </div>
          <div className="divide-y divide-white/10">
            {attention.map(({ title, description, count, href, icon: Icon }) => (
              <Link key={title} href={href} className="group flex items-center gap-4 px-5 py-4 hover:bg-white/[0.035]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-slate-400 group-hover:text-violet-300">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-200">{title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{description}</span>
                </span>
                <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-sm font-semibold text-slate-300">{count}</span>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="tbx-surface rounded-2xl p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-sky-300" />
                <h2 className="font-semibold">Atlas insight</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">Evidence-led opportunities will appear here.</p>
            </div>
            <span className="rounded-full border border-sky-300/20 bg-sky-300/[0.07] px-2.5 py-1 text-xs font-semibold text-sky-200">
              Learning
            </span>
          </div>
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
            <Database className="mx-auto h-7 w-7 text-slate-600" />
            <p className="mt-4 text-sm font-medium text-slate-300">Waiting for marketplace signals</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Search demand, completed sales and catalogue activity will give Atlas enough evidence to make its first recommendation.
            </p>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-2xl border border-violet-300/20 bg-violet-400/[0.055] p-5 sm:p-6">
          <div className="absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-violet-300" />
              <h2 className="font-semibold">Ask Atlas</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400">Use natural language to navigate Command.</p>

            <form className="mt-6 flex gap-2 rounded-2xl border border-white/10 bg-black/20 p-2">
              <input
                aria-label="Ask Atlas"
                placeholder="Ask about listings, users, values or catalogue gaps..."
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
              />
              <button
                type="button"
                aria-label="Send to Atlas"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500 text-white transition hover:bg-violet-400"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button key={prompt} type="button" className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-slate-400 hover:border-violet-300/25 hover:text-violet-200">
                  {prompt}
                </button>
              ))}
            </div>

            <Link href="/admin/atlas" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-200 hover:text-white">
              Open Atlas workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
