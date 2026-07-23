import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Check,
  CircleDollarSign,
  HelpCircle,
  PackageOpen,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { QuickAddSetForm } from "@/components/collection/quick-add-set-form";

const valuePaths = [
  {
    title: "Complete LEGO set",
    text: "Search by set number, name or theme and retrieve available Atlas pricing.",
    icon: Search,
    href: "#known-set",
  },
  {
    title: "Mixed box or loose parts",
    text: "Describe bulk bricks, spare parts, unknown sets or a mixed collection.",
    icon: PackageOpen,
    href: "/value/manual?type=mixed",
  },
  {
    title: "Minifigures",
    text: "Start with one figure or describe a larger minifigure collection.",
    icon: UserRound,
    href: "/value/manual?type=minifigures",
  },
  {
    title: "Instructions and boxes",
    text: "Value manuals, packaging and accessories without matching a complete set.",
    icon: BookOpen,
    href: "/value/manual?type=instructions",
  },
  {
    title: "I am not sure what I have",
    text: "Use a guided description. No catalogue match or photo upload is required.",
    icon: HelpCircle,
    href: "/value/manual?type=unknown",
  },
];

export default function ValuePage() {
  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <header className="border-b border-white/[0.06] bg-[#050912]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 font-black tracking-[-0.04em]">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a]"><Boxes className="h-5 w-5" /></span>
            TBX
          </Link>
          <Link href="/atlas" className="text-sm font-bold text-white/55 transition hover:text-white">Explore Atlas</Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(232,200,106,0.16),transparent_36rem)]" />
        <div className="relative mx-auto max-w-[1280px] px-5 py-20 lg:px-10 lg:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e8c86a]"><Sparkles className="h-3.5 w-3.5" /> TBX Value</div>
            <h1 className="mt-7 text-6xl font-black leading-[0.9] tracking-[-0.07em] sm:text-7xl">What would you like <span className="block text-[#e8c86a]">to value?</span></h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/52">Start with a known set or describe loose, mixed or unlisted LEGO. Photos are not required.</p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {valuePaths.map(({ title, text, icon: Icon, href }) => (
              <Link key={title} href={href} className="group rounded-[1.5rem] border border-white/[0.08] bg-[#09111e] p-6 transition hover:-translate-y-1 hover:border-[#e8c86a]/30">
                <Icon className="h-6 w-6 text-[#e8c86a]" />
                <h2 className="mt-8 text-xl font-black tracking-[-0.035em]">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/42">{text}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#e8c86a]">Start <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="known-set" className="scroll-mt-20 border-b border-white/[0.06]">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-24 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">Known set valuation</p>
            <h2 className="mt-4 text-5xl font-black tracking-[-0.055em]">Search Atlas for a complete set.</h2>
            <p className="mt-6 text-lg leading-8 text-white/45">Choose the set and its condition. TBX then retrieves the market evidence currently available for that Atlas record.</p>
            <div className="mt-8 space-y-3 text-sm text-white/48">
              {["No photo upload", "Condition-aware valuation", "Limited evidence is reported honestly"].map((item) => <div key={item} className="flex items-center gap-3"><Check className="h-4 w-4 text-[#e8c86a]" />{item}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.48)] sm:p-7">
            <div className="mb-5 flex items-center justify-between border-b border-white/[0.07] pb-5">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Live Atlas valuation</p><p className="mt-1 text-sm text-white/42">Complete LEGO sets</p></div>
              <CircleDollarSign className="h-5 w-5 text-[#e8c86a]" />
            </div>
            <div className="rounded-[1.5rem] bg-white p-4 text-slate-950 sm:p-6"><QuickAddSetForm intent="sell" /></div>
          </div>
        </div>
      </section>
    </main>
  );
}
