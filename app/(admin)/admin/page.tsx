import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Camera,
  CheckCircle2,
  Clock3,
  PackageSearch,
  ShieldAlert,
  Truck,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function formatDate(value: string | null) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminOperationsPage() {
  const supabase = await createClient();

  const [collectorsResult, assetsResult, evidenceResult, recentAssetsResult] = await Promise.all([
    supabase.from("collectors").select("id", { count: "exact", head: true }),
    supabase.from("assets").select("id", { count: "exact", head: true }),
    supabase.from("asset_evidence").select("id", { count: "exact", head: true }),
    supabase
      .from("assets")
      .select("id, asset_id, set_number, set_name, condition, estimated_value, created_at, updated_at, owner_id")
      .order("updated_at", { ascending: false })
      .limit(8),
  ]);

  const metrics = [
    { label: "Collectors", value: collectorsResult.count ?? 0, icon: Users, detail: "Registered collector profiles" },
    { label: "Collection records", value: assetsResult.count ?? 0, icon: Boxes, detail: "Sets documented on TBX" },
    { label: "Evidence files", value: evidenceResult.count ?? 0, icon: Camera, detail: "Uploaded ownership and condition evidence" },
    { label: "Open interventions", value: 0, icon: ShieldAlert, detail: "Dispute workflow connects in the order sprint" },
  ];

  const recentAssets = recentAssetsResult.data ?? [];

  const queues = [
    {
      title: "Orders requiring attention",
      description: "Payment, acceptance and dispatch exceptions will appear here.",
      icon: PackageSearch,
      status: "Order domain not connected",
    },
    {
      title: "Courier follow-up",
      description: "Late collections, stalled tracking and delivery exceptions will be prioritised here.",
      icon: Truck,
      status: "Courier integration pending",
    },
    {
      title: "Conflicts and disputes",
      description: "Evidence, messages, decisions and refund actions will live in one case file.",
      icon: AlertTriangle,
      status: "Case management pending",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 md:flex-row md:items-end md:justify-between md:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-300">Owner command centre</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Run TBX from one place.</h1>
          <p className="mt-4 max-w-3xl leading-7 text-white/60">
            Monitor collector activity, inspect collection records, manage evidence and prepare the operational queues for orders, couriers and disputes.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          <span className="inline-flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" /> Private admin access active</span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, detail }) => (
          <article key={label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/50">{label}</p>
                <p className="mt-3 text-4xl font-semibold">{value}</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-yellow-400 text-slate-950"><Icon className="h-5 w-5" /></span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/50">{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">Live activity</p>
              <h2 className="mt-2 text-2xl font-semibold">Recently updated collection records</h2>
            </div>
            <Clock3 className="h-5 w-5 text-white/40" />
          </div>

          {recentAssets.length ? (
            <div className="divide-y divide-white/10">
              {recentAssets.map((asset) => (
                <div key={asset.id} className="grid gap-4 p-5 transition hover:bg-white/[0.03] md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{asset.set_name}</p>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/60">LEGO {asset.set_number}</span>
                      <span className="rounded-full bg-yellow-400/10 px-2.5 py-1 text-xs text-yellow-200">{asset.condition}</span>
                    </div>
                    <p className="mt-2 text-sm text-white/45">Updated {formatDate(asset.updated_at)} · {asset.asset_id}</p>
                  </div>
                  <Link href={`/collection/${asset.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-300 hover:text-yellow-200">
                    Open record <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-sm text-white/50">No collection activity is available yet.</div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">Operations queues</p>
            <h2 className="mt-2 text-2xl font-semibold">What needs your attention</h2>
            <p className="mt-3 text-sm leading-6 text-white/50">These queues are deliberately workflow-led. We will connect each one as the order and fulfilment domains are built.</p>
          </div>

          {queues.map(({ title, description, icon: Icon, status }) => (
            <article key={title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-yellow-300"><Icon className="h-5 w-5" /></span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
                  <p className="mt-3 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white/45">{status}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
