import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = ["Graded cards", "Sealed LEGO", "Vintage comics", "Designer toys", "Game memorabilia"];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-normal">
            <ShieldCheck className="h-5 w-5 text-primary" />
            The Block Exchange
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link className="text-muted-foreground hover:text-foreground" href="/dashboard">
              Dashboard
            </Link>
            <Button asChild size="sm">
              <Link href="/dashboard">Enter TBX</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-4 py-10">
        <section className="grid gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-sm font-medium text-primary">Premium collector marketplace</p>
            <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">Collect with confidence.</h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              TBX is a trust-first marketplace for high-value collectibles, built around visible reputation,
              protected transactions, and quality-first discovery.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard">View dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/marketplace">Browse marketplace</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-soft">
            <div className="rounded-lg border bg-background p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">TBX Trust</p>
                  <p className="mt-2 text-4xl font-semibold">92</p>
                </div>
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {categories.slice(0, 3).map((category) => (
                  <div key={category} className="rounded-md border bg-card p-3 text-sm font-medium">
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Explore collector categories</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category}
                href="/marketplace"
                className="rounded-lg border bg-card p-4 text-sm font-medium transition-colors hover:border-primary/60"
              >
                {category}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
