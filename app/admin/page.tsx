import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CircleAlert,
  Database,
  Gauge,
  SearchCheck,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

const metrics = [
  { label: "Marketplace value", value: "R0", change: "Live data pending", icon: TrendingUp },
  { label: "Live listings", value: "0", change: "Marketplace", icon: Boxes },
  { label: "Registered users", value: "0", change: "Community", icon: Users },
  { label: "Needs attention", value: "0", change: "Moderation queue", icon: CircleAlert },
];

const attention = [
  { title: "Listings awaiting review", count: 0, href: "/admin/marketplace?status=pending" },
  { title: "Low-confidence valuations", count: 0, href: "/admin/atlas?filter=low-confidence" },
  { title: "Unmatched catalogue searches", count: 0, href: "/admin/atlas?filter=unmatched" },
  { title: "Reported users", count: 0, href: "/admin/users?filter=reported" },
];

export default function AdminDashboardPage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ffd84d]/20 bg-[#ffd84d]/[0.06] px-3 py-1.5 text-xs font-semibold text-[#ffd84d]">
            <Gauge className="h-3.5 w-3.5" />
            Marketplace control centre
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{greeting}.</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Here is the current operating view of TBX. Anything needing action will surface here first.
          </p>
        </div>
        <Link href="/admin/marketplace" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffd84d] px-5 py-3 text-sm font-semibold text-[#07101f] hover:bg-[#ffe271]">
          Open moderation queue
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, change, icon: Icon }) => (
          <article key={label} className="tbx-surface rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#ffd84d]/15 bg-[#ffd84d]/[0.07] text-[#ffd84d]">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">{change}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <article className="tbx-surface overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold">Morning brief</h2>
              <p className="mt-1 text-sm text-slate-500">A concise summary of what changed.</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-[#ffd84d]" />
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-slate-300">
              TBX Command is now active. Marketplace metrics will populate as the admin data views are connected to production tables.
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <UserPlus className="mb-3 h-5 w-5 text-[#ffd84d]" />
                <p className="text-2xl font-semibold">0</p>
                <p className="mt-1 text-xs text-slate-500">New users today</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <SearchCheck className="mb-3 h-5 w-5 text-[#ffd84d]" />
                <p className="text-2xl font-semibold">—</p>
                <p className="mt-1 text-xs text-slate-500">Atlas match rate</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <Database className="mb-3 h-5 w-5 text-[#ffd84d]" />
                <p className="text-2xl font-semibold">0</p>
                <p className="mt-1 text-xs text-slate-500">Catalogue gaps</p>
              </div>
            </div>
          </div>
        </article>

        <article className="tbx-surface rounded-2xl">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-semibold">Needs attention</h2>
            <p className="mt-1 text-sm text-slate-500">Prioritised operating queue.</p>
          </div>
          <div className="divide-y divide-white/10">
            {attention.map((item) => (
              <Link key={item.title} href={item.href} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.035]">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.05] text-sm font-semibold text-[#ffd84d]">{item.count}</span>
                <span className="min-w-0 flex-1 text-sm text-slate-300">{item.title}</span>
                <ArrowRight className="h-4 w-4 text-slate-600" />
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Marketplace", "Review, approve and manage every listing.", "/admin/marketplace", Boxes],
          ["Users", "Manage accounts, roles and trust signals.", "/admin/users", Users],
          ["Atlas", "Improve catalogue coverage and valuation confidence.", "/admin/atlas", Database],
        ].map(([title, description, href, Icon]) => {
          const CardIcon = Icon as typeof Boxes;
          return (
            <Link key={title as string} href={href as string} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 hover:border-[#ffd84d]/25 hover:bg-white/[0.045]">
              <CardIcon className="h-5 w-5 text-[#ffd84d]" />
              <h3 className="mt-5 font-semibold">{title as string}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description as string}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 group-hover:text-[#ffd84d]">
                Open section <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
