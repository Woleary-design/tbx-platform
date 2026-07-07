import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroShowcase } from "@/features/renaissance/components/hero-showcase";

const categories = [
  {
    title: "Retired LEGO Icons",
    detail: "Rarest sets. Timeless investments.",
    imageSrc: "/images/category-brick-icons.svg",
  },
  {
    title: "Graded Cards",
    detail: "PSA, BGS and SGC certified.",
    imageSrc: "/images/category-graded-card.svg",
  },
  {
    title: "Vintage Comics",
    detail: "Key issues from golden eras.",
    imageSrc: "/images/category-vintage-comic.svg",
  },
  {
    title: "Designer Toys",
    detail: "Limited editions from top artists.",
    imageSrc: "/images/category-designer-toy.svg",
  },
  {
    title: "Game Memorabilia",
    detail: "Rare consoles, games and collectibles.",
    imageSrc: "/images/category-game-memorabilia.svg",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white">
      <header className="border-b bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-normal text-slate-950 sm:text-base">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400 text-slate-950">
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
            imageSrc="/images/hero-collector-cabinet.svg"
          />
        </div>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.title}
                href="/marketplace"
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(15,23,42,0.10)]"
              >
                <img src={category.imageSrc} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{category.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">{category.detail}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-950 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
