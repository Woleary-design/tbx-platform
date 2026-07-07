import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroShowcase } from "@/features/renaissance/components/hero-showcase";

const categories = ["Retired LEGO icons", "Graded cards", "Vintage comics", "Designer toys", "Game memorabilia"];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white">
      <header className="border-b bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-normal text-slate-950 sm:text-base">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            The Block Exchange
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            <Link className="transition-colors hover:text-slate-950" href="/marketplace">Marketplace</Link>
            <Link className="transition-colors hover:text-slate-950" href="/vault">Vault</Link>
            <Link className="transition-colors hover:text-slate-950" href="/insights">Insights</Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link className="hidden text-slate-500 transition-colors hover:text-slate-950 sm:inline" href="/dashboard">
              Sign in
            </Link>
            <Button asChild size="sm" className="rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-20">
          <HeroShowcase
            eyebrow="Escrow-protected collector marketplace"
            title="Own with confidence. Trade with trust."
            description="South Africa's trusted platform for collectors. Whether you're buying your first collectible or managing a premium collection, TBX provides secure transactions, trusted sellers and powerful collection management."
            imageLabel="Curated architectural collection"
            imageDetail="Museum-lit collectibles, verified sellers and protected value in a single trusted marketplace."
            primarySignal="TBX Secure"
            secondarySignal="Verified 96"
          />
        </div>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category}
                href="/marketplace"
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-950 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(15,23,42,0.10)]"
              >
                <span>{category}</span>
                <ArrowRight className="mt-10 h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
