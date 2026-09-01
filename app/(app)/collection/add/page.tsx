import Link from "next/link";
import { ArrowLeft, BadgeCheck, BookOpen, PackageCheck, Sparkles } from "lucide-react";
import { QuickAddSetForm } from "@/components/collection/quick-add-set-form";

export default async function AddSetPage({
  searchParams,
}: {
  searchParams: Promise<{ set?: string }>;
}) {
  const { set } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl space-y-8 text-white">
      <Link href="/collection" className="inline-flex items-center gap-2 text-sm font-medium text-white/55 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to My Collection
      </Link>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#050912] px-7 py-10 shadow-[0_28px_100px_rgba(0,0,0,0.28)] md:px-10 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(232,200,106,0.15),transparent_27rem)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#e8c86a]"><Sparkles className="h-4 w-4" /> Atlas collection intake</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.06em] md:text-7xl">Find it. Value it. Add your copy.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/52">Atlas identifies the exact set, checks current market evidence and stores a condition-adjusted value with your collection record.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              [BadgeCheck, "Exact catalogue match"],
              [PackageCheck, "Condition recorded"],
              [BookOpen, "Atlas value saved"],
            ].map(([Icon, label]) => {
              const ItemIcon = Icon as typeof BadgeCheck;
              return <div key={label as string} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4"><ItemIcon className="h-5 w-5 text-[#e8c86a]" /><span className="text-sm font-medium text-white/75">{label as string}</span></div>;
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/[0.09] bg-[#09111f] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:p-7 md:p-8">
        <div className="mb-6 flex items-center gap-3 border-b border-white/[0.07] pb-5">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e8c86a] text-[#050912]"><PackageCheck className="h-5 w-5" /></span>
          <div><p className="font-bold">Add a collection item</p><p className="mt-1 text-sm text-white/42">Search, choose the condition and review Atlas pricing before saving.</p></div>
        </div>
        <QuickAddSetForm initialSetNumber={set} />
      </section>
    </div>
  );
}
