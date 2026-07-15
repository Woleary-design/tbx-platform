import Link from "next/link";
import {
  ArrowLeft,
  Boxes,
  Camera,
  CarFront,
  Check,
  CircleDollarSign,
  PackageOpen,
  Search,
  Sparkles,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickAddSetForm } from "@/components/collection/quick-add-set-form";

type SellPageProps = {
  searchParams?: Promise<{ category?: string }>;
};

const futureCategories = [
  { name: "Hot Wheels", icon: CarFront },
  { name: "Trading Cards", icon: Sparkles },
  { name: "Coins", icon: CircleDollarSign },
];

const legoStartingPoints = [
  { title: "I know the set number", detail: "Enter the number printed on the box or instructions.", icon: Tag, available: true },
  { title: "Search by name or theme", detail: "Try words such as Porsche, Star Wars or Friends.", icon: Search, available: true },
  { title: "I only have photos", detail: "Photo-assisted identification is coming soon.", icon: Camera, available: false },
  { title: "I have a mixed LEGO box", detail: "Mixed-collection help is coming soon.", icon: PackageOpen, available: false },
];

export default async function SellPage({ searchParams }: SellPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const category = params?.category?.toLowerCase();

  if (category === "lego") {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <Link href="/sell" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" /> Choose another category
        </Link>

        <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)] md:p-10">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300"><Boxes className="h-4 w-4" /> Sell LEGO</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Tell us what you know. We’ll help with the rest.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">You do not need to be a LEGO expert. Start with a set number, a name, a theme or whatever information you have.</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {legoStartingPoints.map((option) => {
            const Icon = option.icon;
            return option.available ? (
              <a key={option.title} href="#find-set" className="group rounded-[1.75rem] border border-yellow-200 bg-white p-5 shadow-[0_16px_45px_rgba(43,30,18,0.06)] transition hover:-translate-y-0.5 hover:border-yellow-400">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-slate-950"><Icon className="h-5 w-5" /></div>
                <h2 className="mt-4 text-xl font-semibold text-slate-950">{option.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{option.detail}</p>
                <p className="mt-4 text-sm font-semibold text-slate-950">Start here →</p>
              </a>
            ) : (
              <div key={option.title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 text-slate-500">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200"><Icon className="h-5 w-5" /></div>
                <div className="mt-4 flex items-center gap-2"><h2 className="text-xl font-semibold text-slate-700">{option.title}</h2><span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Soon</span></div>
                <p className="mt-2 text-sm leading-6">{option.detail}</p>
              </div>
            );
          })}
        </section>

        <section id="find-set" className="scroll-mt-24 rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)] md:p-8">
          <div className="mb-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-700">First step</p><h2 className="mt-2 text-2xl font-semibold text-slate-950">Find the LEGO set</h2><p className="mt-2 text-sm leading-6 text-slate-600">Search using the set number, name or theme. You can confirm the exact set before creating the listing.</p></div>
          <QuickAddSetForm intent="sell" />
        </section>

        <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" /><div><h2 className="font-semibold text-emerald-950">No listing pressure</h2><p className="mt-1 text-sm leading-6 text-emerald-800">Finding the set does not publish anything. You will review the condition, photos and price before the item goes live.</p></div></div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)] md:p-10">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300"><Tag className="h-4 w-4" /> Start selling</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">What would you like to sell today?</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">You do not need to be a collector or know the exact model. Choose a category and TBX will guide you through the rest in plain language.</p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/sell?category=lego" className="group rounded-[2rem] border border-yellow-200 bg-white p-6 shadow-[0_18px_55px_rgba(43,30,18,0.07)] transition hover:-translate-y-1 hover:border-yellow-400">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950"><Boxes className="h-7 w-7" /></div>
          <div className="mt-6 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-700">Available now</p><h2 className="mt-2 text-2xl font-semibold text-slate-950">LEGO</h2></div><span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">Start</span></div>
          <p className="mt-4 text-sm leading-6 text-slate-600">Know the set or only have a rough idea? Start here and we’ll guide you.</p>
        </Link>

        {futureCategories.map((item) => {
          const Icon = item.icon;
          return <div key={item.name} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-slate-500"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200"><Icon className="h-7 w-7" /></div><p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Coming soon</p><h2 className="mt-2 text-2xl font-semibold text-slate-700">{item.name}</h2><p className="mt-4 text-sm leading-6">This category will use the same simple TBX selling experience when it launches.</p></div>;
        })}
      </section>

      <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-7 text-center md:p-10">
        <Camera className="mx-auto h-10 w-10 text-yellow-500" />
        <h2 className="mt-4 text-2xl font-semibold text-slate-950">Not sure what you have?</h2>
        <p className="mx-auto mt-2 max-w-xl text-slate-600">Photo identification and mixed-collection support are coming next. For now, choose LEGO and search using anything you know about the set.</p>
        <Button asChild className="mt-6 rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300"><Link href="/sell?category=lego">Start with LEGO</Link></Button>
      </section>
    </div>
  );
}
