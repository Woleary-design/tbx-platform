import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { CreateListingForm } from "@/components/marketplace/create-listing-form";
import { createClient } from "@/lib/supabase/server";

export default async function ListCollectionRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) notFound();

  const { data: asset } = await supabase
    .from("assets")
    .select("id, lego_set_id, set_number, set_name, condition, estimated_value")
    .eq("id", id)
    .eq("owner_id", userData.user.id)
    .maybeSingle();

  if (!asset) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link href={`/collection/${asset.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Back to Collection Record</Link>
      <section className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)] md:p-10">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300"><ShoppingBag className="h-4 w-4" /> List for Sale</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{asset.set_name}</h1>
        <p className="mt-3 text-white/60">LEGO {asset.set_number} · {asset.condition}</p>
      </section>
      {!asset.lego_set_id ? (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-7">
          <h2 className="text-xl font-semibold text-slate-950">Atlas link required</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">This Collection Record must be linked to an Atlas set before it can power Wants matching.</p>
          <Link href={`/collection/${asset.id}/edit`} className="mt-4 inline-flex text-sm font-semibold text-slate-950 underline">Edit Collection Record</Link>
        </section>
      ) : (
        <section className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)] md:p-8">
          <CreateListingForm assetId={asset.id} suggestedPrice={asset.estimated_value ? Number(asset.estimated_value) : null} />
        </section>
      )}
    </div>
  );
}
