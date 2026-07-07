import { Archive, ArrowRight, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import {
  dashboardMetrics,
  recentActivity,
  recommendedListings,
  vaultPreview,
} from "@/features/dashboard/data/dashboard.mock";

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[1.75rem] border bg-card shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
        <div className="grid gap-8 p-6 md:p-8 xl:grid-cols-[1fr_420px] xl:items-stretch">
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                <ShieldCheck className="h-4 w-4" />
                Own with confidence. Trade with trust.
              </div>
              <div>
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal md:text-5xl">
                  Your private command centre for high-value collecting.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  Review protected trades, watch market signals and keep provenance close to every piece in your vault.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-background/70 p-4">
                <p className="text-sm text-muted-foreground">Verified identity</p>
                <p className="mt-2 font-semibold text-primary">Current</p>
              </div>
              <div className="rounded-2xl border bg-background/70 p-4">
                <p className="text-sm text-muted-foreground">Inspection window</p>
                <p className="mt-2 font-semibold">48 hours</p>
              </div>
              <div className="rounded-2xl border bg-background/70 p-4">
                <p className="text-sm text-muted-foreground">Vault insurance</p>
                <p className="mt-2 font-semibold">Reviewed</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[320px] rounded-[1.4rem] border bg-gradient-to-br from-stone-50 via-emerald-50 to-stone-300 p-5">
            <div className="absolute right-5 top-5 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-primary shadow-sm">
              TBX Secure active
            </div>
            <div className="flex h-full flex-col justify-end rounded-[1rem] border bg-card/70 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-muted-foreground">Featured vault piece</p>
              <h2 className="mt-2 max-w-xs text-3xl font-semibold leading-tight">Sealed UCS Millennium Falcon with original shipper</h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                Provenance note updated, market spread narrowed, and seller trust remains premier-grade.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <DashboardCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Recent Trust Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={activity} className="group flex gap-4 rounded-2xl border bg-background/60 p-4 transition-colors hover:border-primary/35">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-muted-foreground">{activity}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Curated Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendedListings.map((listing) => (
              <div key={listing.title} className="rounded-2xl border bg-background/60 p-4 transition-colors hover:border-primary/35">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium leading-6">{listing.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{listing.condition}</p>
                  </div>
                  <p className="shrink-0 font-semibold">{listing.price}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    {listing.trust}
                  </p>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            Vault Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {vaultPreview.map((item) => (
            <div key={item.name} className="rounded-2xl border bg-background/60 p-5 transition-colors hover:border-primary/35">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-muted-foreground">{item.name}</p>
                <BadgeCheck className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-5 text-3xl font-semibold">{item.count}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.value} insured value</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
