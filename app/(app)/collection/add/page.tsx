import Link from "next/link";
import { ArrowLeft, BadgeCheck, BookOpen, Camera, PackageCheck } from "lucide-react";
import { QuickAddSetForm } from "@/components/collection/quick-add-set-form";

export default async function AddSetPage({
  searchParams,
}: {
  searchParams: Promise<{ set?: string }>;
}) {
  const { set } = await searchParams;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link
        href="/collection"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My Collection
      </Link>

      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-slate-950 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)]">
        <div className="grid gap-8 p-7 md:p-10 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">
              Add to My Collection
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Find it. Choose condition. Done.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
              Quick Add creates the Collection Record immediately. Photos, receipts and detailed evidence can be completed later without entering the set again.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              [BadgeCheck, "Atlas matched"],
              [Camera, "Evidence later"],
              [BookOpen, "One source of truth"],
            ].map(([Icon, label]) => {
              const ItemIcon = Icon as typeof BadgeCheck;
              return (
                <div
                  key={label as string}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-4"
                >
                  <ItemIcon className="h-5 w-5 text-yellow-300" />
                  <span className="text-sm font-medium">{label as string}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)] md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-yellow-400 text-slate-950">
            <PackageCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-950">Quick Add</p>
            <p className="text-sm text-slate-500">Target: a Collection Record in under 15 seconds.</p>
          </div>
        </div>
        <QuickAddSetForm initialSetNumber={set} />
      </section>
    </div>
  );
}
