import { Archive, ShieldCheck, Sparkles } from "lucide-react";
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
      <section className="flex flex-col justify-between gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">TBX authenticated workspace</p>
          <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            A trust-first operating view for your collection, active transactions, and market opportunities.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
          <ShieldCheck className="h-4 w-4" />
          Mock portfolio data
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <DashboardCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={activity} className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <p className="text-sm text-muted-foreground">{activity}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Listings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendedListings.map((listing) => (
              <div key={listing.title} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{listing.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{listing.condition}</p>
                  </div>
                  <p className="font-semibold">{listing.price}</p>
                </div>
                <p className="mt-3 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {listing.trust}
                </p>
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
            <div key={item.name} className="rounded-lg border p-4">
              <p className="text-sm font-medium text-muted-foreground">{item.name}</p>
              <p className="mt-2 text-2xl font-semibold">{item.count}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
