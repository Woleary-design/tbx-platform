import Link from "next/link";
import { ArrowRight, BookOpen, Boxes, PackageOpen, Search, Sparkles, UserRound } from "lucide-react";
import { QuickAddSetForm } from "@/components/collection/quick-add-set-form";

const paths = [
  {
    title: "Complete LEGO set",
    text: "Search Atlas by set number or name and use the existing set valuation flow.",
    href: "#complete-set",
    icon: Search,
  },
  {
    title: "Loose LEGO",
    text: "Enter the measured weight. Atlas calculates a bulk value range from kilograms.",
    href: "/value/manual?type=mixed",
    icon: PackageOpen,
  },
  {
    title: "Minifigures",
    text: "Give Atlas the figure details. Atlas identifies the closest match and prices it when evidence is available.",
    href: "/value/manual?type=minifigures",
    icon: UserRound,
  },
  {
    title: "Instructions and boxes",
    text: "Record manuals, packaging and accessories separately from a complete set.",
    href: "/value/manual?type=instructions",
    icon: BookOpen,
  },
];

export default function ValuePage() {
  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <header className="border-b border-white/[0.06] bg-[#050912]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 font-black tracking-[-0.04em]">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a]"><Boxes className="h-5 w-5" /></span>
            TBX
          </Link>
          <Link href="/atlas" className="text-sm font-bold text-white/55 transition hover:text-white">Explore Atlas</Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(232,200,106,0.16),transparent_38rem)]" />
        <div className="relative mx-auto max-w-[1120px] px-5 py-16 lg:px-10 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e8c86a]"><Sparkles className="h-3.5 w-3.5" /> Atlas value</div>
            <h1 className="mt-7 text-5xl font-black leading-[0.94] tracking-[-0.06em] sm:text-7xl">What are you valuing?</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/52">Choose the route that matches the item. Atlas will not ask you to classify it again.</p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {paths.map(({ title, text, href, icon: Icon }) => (
              <Link key={title} href={href} className="group flex items-center gap-5 rounded-[1.5rem] border border-white/[0.08] bg-[#09111f] p-6 transition hover:-translate-y-0.5 hover:border-[#e8c86a]/30">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#e8c86a]/[0.07] text-[#e8c86a]"><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-black tracking-[-0.035em]">{title}</span>
                  <span className="mt-2 block text-sm leading-6 text-white/45">{text}</span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-white/25 transition group-hover:translate-x-1 group-hover:text-[#e8c86a]" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="complete-set" className="scroll-mt-20">
        <div className="mx-auto max-w-[1120px] px-5 py-16 lg:px-10 lg:py-20">
          <div className="mb-7 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">Complete set</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">Search Atlas as normal.</h2>
            <p className="mt-3 text-white/45">Enter the set number or name. Atlas identifies the set and retrieves the current pricing evidence.</p>
          </div>
          <div className="rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.38)] sm:p-7">
            <div className="rounded-[1.5rem] bg-white p-4 text-slate-950 sm:p-6"><QuickAddSetForm intent="sell" /></div>
          </div>
        </div>
      </section>
    </main>
  );
}
