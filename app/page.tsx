import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Check,
  CircleDollarSign,
  Heart,
  HelpCircle,
  PackageOpen,
  Search,
  ShieldCheck,
  Store,
  UserRound,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  { label: "Value", href: "/value" },
  { label: "Atlas", href: "/atlas" },
  { label: "Market", href: "/marketplace" },
  { label: "Collection", href: "/collection" },
];

const valueRoutes = [
  {
    title: "Complete LEGO set",
    text: "Search by set number or name and use live Atlas pricing.",
    href: "/value#known-set",
    icon: Boxes,
  },
  {
    title: "Mixed box or loose parts",
    text: "Describe bulk bricks, spare parts and unknown sets.",
    href: "/value/manual",
    icon: PackageOpen,
  },
  {
    title: "Minifigures",
    text: "Start with one figure or an entire collection.",
    href: "/value/manual",
    icon: Users,
  },
  {
    title: "Instructions and boxes",
    text: "Record manuals, packaging and accessories.",
    href: "/value/manual",
    icon: BookOpen,
  },
  {
    title: "I am not sure what I have",
    text: "Use a guided description without choosing a listed set.",
    href: "/value/manual",
    icon: HelpCircle,
  },
];

function Brand() {
  return (
    <Link href="/" className="group relative flex items-center gap-3" aria-label="TBX home">
      <span className="absolute left-5 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e8c86a]/20 blur-2xl transition group-hover:bg-[#e8c86a]/30" />
      <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a] shadow-[0_0_32px_rgba(232,200,106,0.18)]">
        <Boxes className="h-5 w-5" />
      </span>
      <span className="relative text-xl font-black tracking-[-0.055em] text-white">TBX</span>
    </Link>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  let user: { id: string } | null = null;

  try {
    user = (await supabase.auth.getUser()).data.user;
  } catch {
    user = null;
  }

  const accountHref = user ? "/dashboard" : "/sign-in";

  return (
    <div className="min-h-screen bg-[#050912] pb-28 text-white sm:pb-0">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050912]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 lg:px-10">
          <Brand />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            {navItems.map(({ label, href }, index) => (
              <Link key={href} href={href} className={index === 0 ? "text-sm font-bold text-[#e8c86a]" : "text-sm font-semibold text-white/50 transition hover:text-white"}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/value" className="hidden h-10 items-center rounded-xl border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] px-4 text-sm font-bold text-[#e8c86a] transition hover:bg-[#e8c86a]/10 sm:inline-flex">
              Value my collection
            </Link>
            <Link href={accountHref} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-[#e8c86a]/35 hover:text-[#e8c86a]" aria-label={user ? "Open dashboard" : "Sign in"}>
              {user ? "W" : <UserRound className="h-4 w-4" />}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(232,200,106,0.15),transparent_31rem)]" />
          <div className="relative mx-auto grid min-h-[790px] max-w-[1440px] items-center gap-14 px-5 py-20 lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e8c86a]">
                <CircleDollarSign className="h-3.5 w-3.5" /> TBX Value
              </div>
              <h1 className="mt-8 text-6xl font-black leading-[0.9] tracking-[-0.075em] sm:text-7xl lg:text-[6.2rem]">
                Discover what your
                <span className="block text-[#e8c86a]">collection is worth.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/55 sm:text-xl">
                Start with a complete set, a mixed box, loose parts, minifigures or an unknown collection. Photos are not required.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/value" className="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#e8c86a] px-7 font-bold text-[#050912] shadow-[0_16px_50px_rgba(232,200,106,0.16)] transition hover:-translate-y-0.5 hover:bg-[#f1d478]">
                  Value my collection <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </Link>
                <Link href="/atlas" className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/[0.035] px-7 font-bold text-white/80 transition hover:-translate-y-0.5 hover:border-[#e8c86a]/25 hover:text-white">
                  Explore Atlas
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/38">
                {["No photo upload required", "No catalogue match required", "Powered by Atlas"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#e8c86a]" />{item}</span>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.48)] sm:p-7">
              <div className="border-b border-white/[0.07] px-1 pb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Start here</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">What would you like to value?</h2>
              </div>
              <div className="mt-5 grid gap-3">
                {valueRoutes.map(({ title, text, href, icon: Icon }) => (
                  <Link key={title} href={href} className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:-translate-y-0.5 hover:border-[#e8c86a]/30 hover:bg-[#e8c86a]/[0.045]">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#e8c86a]/18 bg-[#e8c86a]/[0.06] text-[#e8c86a]"><Icon className="h-5 w-5" /></span>
                    <span className="min-w-0 flex-1"><span className="block font-bold">{title}</span><span className="mt-1 block text-sm leading-5 text-white/38">{text}</span></span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-white/20 transition group-hover:translate-x-1 group-hover:text-[#e8c86a]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-24 lg:px-10 lg:py-32">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#e8c86a]">Powered by Atlas</p>
          <div className="mt-5 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl">Every valuation needs evidence.</h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/45">Atlas supplies identity, market history and pricing context. TBX shows when evidence is limited instead of inventing a number.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {["Live market prices", "Sales history", "Pricing confidence", "Collection intelligence"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#09111e] p-5"><ShieldCheck className="h-5 w-5 text-[#e8c86a]" /><span className="font-bold">{item}</span></div>
              ))}
            </div>
          </div>
          <form action="/atlas" method="get" className="mt-12 flex items-center gap-3 rounded-[1.75rem] border border-white/10 bg-[#0a111e] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.28)]">
            <Search className="ml-3 h-6 w-6 shrink-0 text-white/28" />
            <input name="q" aria-label="Search Atlas" placeholder="Search a LEGO set or set number" className="min-w-0 flex-1 bg-transparent px-2 py-4 text-base outline-none placeholder:text-white/25" />
            <button type="submit" className="inline-flex h-14 shrink-0 items-center gap-2 rounded-2xl bg-[#e8c86a] px-5 font-bold text-[#050912]">Search Atlas <ArrowRight className="h-5 w-5" /></button>
          </form>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-24 md:grid-cols-3 lg:px-10 lg:py-28">
            {[
              { title: "Value", text: "Understand what you have and what the available evidence suggests.", href: "/value", icon: CircleDollarSign },
              { title: "Market", text: "List or buy collectibles with clearer pricing context.", href: "/marketplace", icon: Store },
              { title: "Collection", text: "Keep and track the items you are not ready to sell.", href: "/collection", icon: Heart },
            ].map(({ title, text, href, icon: Icon }) => (
              <Link key={title} href={href} className="group rounded-[1.75rem] border border-white/[0.07] bg-[#09111e] p-7 transition hover:-translate-y-1 hover:border-[#e8c86a]/25">
                <Icon className="h-6 w-6 text-[#e8c86a]" />
                <h3 className="mt-8 text-3xl font-black">{title}</h3>
                <p className="mt-4 leading-7 text-white/42">{text}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#e8c86a]">Open {title} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-5 py-24 lg:px-10 lg:py-32">
          <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] border border-[#e8c86a]/20 bg-[#0b1321] px-7 py-16 sm:px-12 lg:px-16 lg:py-20">
            <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#e8c86a]/10 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-4xl">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#e8c86a]">TBX Value</p>
                <h2 className="mt-5 text-5xl font-black leading-[0.94] tracking-[-0.06em] sm:text-7xl">Start with what you know.</h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/48">A set number is helpful, but it is not required. Mixed boxes and loose collections have a place too.</p>
              </div>
              <Link href="/value" className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#e8c86a] px-7 font-bold text-[#050912]">Value my collection <ArrowRight className="h-5 w-5" /></Link>
            </div>
          </div>
        </section>
      </main>

      <aside className="fixed inset-x-4 bottom-4 z-40 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[360px]">
        <div className="flex items-center gap-4 rounded-2xl border border-[#e8c86a]/25 bg-[#09111f]/95 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e8c86a]/10 text-[#e8c86a]"><CircleDollarSign className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="font-black tracking-[-0.025em]">Ready to sell?</p>
            <p className="mt-1 text-xs leading-5 text-white/42">Build the listing now. Sign up only when you publish.</p>
          </div>
          <Link href="/sell/create" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#e8c86a] px-4 py-3 text-sm font-black text-[#050912] transition hover:bg-[#f1d478]">Sell Now <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </aside>
    </div>
  );
}
