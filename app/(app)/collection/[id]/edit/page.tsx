import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FilePenLine } from "lucide-react";
import { EditCollectionRecordForm } from "@/components/collection/edit-collection-record-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditCollectionRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) notFound();

  const { data: asset } = await supabase
    .from("assets")
    .select("id, set_number, set_name, condition, estimated_value, purchase_price, original_owner, original_receipt, instructions_complete, minifigures_complete, notes, is_public")
    .eq("id", id)
    .eq("owner_id", userData.user.id)
    .maybeSingle();

  if (!asset) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link href={`/collection/${asset.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Back to Collection Record</Link>

      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-slate-950 p-7 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)] md:p-10">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300"><FilePenLine className="h-4 w-4" /> Edit Collection Record</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{asset.set_name}</h1>
        <p className="mt-3 text-white/60">LEGO {asset.set_number}</p>
        <p className="mt-5 max-w-2xl leading-7 text-white/70">Keep the details of your copy accurate once. TBX will reuse them for Collection Health, valuation and future marketplace listings.</p>
      </section>

      <section className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)] md:p-8">
        <EditCollectionRecordForm record={{
          id: asset.id,
          condition: asset.condition,
          estimatedValue: asset.estimated_value,
          purchasePrice: asset.purchase_price,
          originalOwner: asset.original_owner,
          originalReceipt: asset.original_receipt,
          instructionsComplete: asset.instructions_complete,
          minifiguresComplete: asset.minifigures_complete,
          notes: asset.notes,
          isPublic: asset.is_public,
        }} />
      </section>
    </div>
  );
}
