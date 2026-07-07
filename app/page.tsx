import Link from "next/link";
import { ArrowRight, BadgeCheck, LockKeyhole, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = ["Retired LEGO icons", "Graded cards", "Vintage comics", "Designer toys", "Game memorabilia"];

const trustSignals = [
  { label: "Verified sellers", value: "1,240", icon: BadgeCheck },
  { label: "Protected order value", value: "$8.6M", icon: LockKeyhole },
  { label: "Median dispatch", value: "1.8 days", icon: Truck },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="border-b bg-card/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-normal">
            <ShieldCheck className="h-5 w-5 text-primary" />
            The Block Exchange
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline" href="/marketplace">
              Marketplace
            </Link>
            <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/dashboard">
              Dashboard
            </Link>
            <Button asChild size="sm" className="rounded-full">
              <Link href="/dashboard">Enter TBX</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-14">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 text-sm font-medium text-primary shadow-sm">
              <Sparkles className="h-4 w-4" />
              Private marketplace for serious collectors
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
                Own with confidence. Trade with trust.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                TBX brings verified reputation, protected transactions and provenance-aware presentation to the collectibles that deserve more than an ordinary listing page.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-full px-5">
                <Link href="/dashboard">
                  Open collector console
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full bg-card/70 px-5">
                <Link href="/marketplace">Browse vaulted pieces</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {trustSignals.map((signal) => {
                const Icon = signal.icon;
                return (
                  <div key={signal.label} className="rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur">
                    <Icon className="h-4 w-4 text-primary" />
                    <p className="mt-4 text-2xl font-semibold">{signal.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{signal.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative min-h-[620px]">
            <div className="absolute left-0 top-8 h-[500px] w-[76%] rounded-[2rem] border bg-card p-5 shadow-[0_30px_90px_rgba(15,23,42,0.16)] transition-transform duration-300 hover:-translate-y-1">
              <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-gradient-to-br from-stone-50 via-emerald-50 to-stone-300 p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-card/85 px-3 py-1 text-xs font-medium text-primary">TBX Secure</span>
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">Verified 92</span>
                </div>
                <div className="mt-auto space-y-3 rounded-3xl border bg-card/70 p-5 backdrop-blur-sm">
                  <p className="text-sm font-medium text-muted-foreground">Vaulted collectible</p>
                  <h2 className="max-w-sm text-4xl font-semibold leading-tight">UCS Millennium Falcon sealed first owner set</h2>
                  <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                    Original shipper, documented storage history and insured handover options.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-0 w-[58%] rounded-[1.5rem] border bg-card p-4 shadow-[0_24px_70px_rgba(15,23,42,0.14)] transition-transform duration-300 hover:-translate-y-1">
              <div className="rounded-[1.1rem] border bg-background p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Seller trust</p>
                    <p className="mt-2 text-5xl font-semibold">96</p>
                  </div>
                  <ShieldCheck className="h-9 w-9 text-primary" />
                </div>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span>Identity verified</span>
                    <span className="font-medium text-primary">Complete</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Successful trades</span>
                    <span className="font-medium">184</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Average dispatch</span>
                    <span className="font-medium">1.6 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category}
                href="/marketplace"
                className="group rounded-2xl border bg-card/80 p-5 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_18px_55px_rgba(15,23,42,0.1)]"
              >
                <span>{category}</span>
                <ArrowRight className="mt-8 h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
