"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileText, Loader2, PackageCheck, Save, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type EditableCollectionRecord = {
  id: string;
  condition: string;
  estimatedValue: number | null;
  purchasePrice: number | null;
  originalOwner: boolean;
  originalReceipt: boolean;
  instructionsComplete: boolean | null;
  minifiguresComplete: boolean | null;
  notes: string | null;
  isPublic: boolean;
};

const conditionOptions = ["New Sealed", "New Open Box", "Used Complete", "Used Incomplete", "Unknown"];
const inputClass = "mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#07101d] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#e8c86a]/45 focus:ring-4 focus:ring-[#e8c86a]/5";

export function EditCollectionRecordForm({ record }: { record: EditableCollectionRecord }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const form = new FormData(event.currentTarget);
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Your session expired. Please sign in again.");

      const purchaseValue = String(form.get("purchase_price") ?? "").trim();
      const estimateValue = String(form.get("estimated_value") ?? "").trim();
      const purchasePrice = purchaseValue === "" ? null : Number(purchaseValue);
      const estimatedValue = estimateValue === "" ? null : Number(estimateValue);

      if (purchasePrice !== null && (!Number.isFinite(purchasePrice) || purchasePrice < 0)) throw new Error("Purchase price must be a valid positive amount.");
      if (estimatedValue !== null && (!Number.isFinite(estimatedValue) || estimatedValue < 0)) throw new Error("Estimated value must be a valid positive amount.");

      const condition = String(form.get("condition") ?? "Unknown");
      const { data: updatedRecord, error: updateError } = await supabase
        .from("assets")
        .update({
          condition,
          sealed: condition === "New Sealed",
          purchase_price: purchasePrice,
          estimated_value: estimatedValue,
          original_owner: form.get("original_owner") === "on",
          original_receipt: form.get("original_receipt") === "on",
          instructions_complete: form.get("instructions_complete") === "on",
          minifigures_complete: form.get("minifigures_complete") === "on",
          notes: String(form.get("notes") ?? "").trim() || null,
          is_public: form.get("is_public") === "on",
        })
        .eq("id", record.id)
        .eq("owner_id", userData.user.id)
        .select("id")
        .maybeSingle();

      if (updateError) throw updateError;
      if (!updatedRecord) throw new Error("This collection record could not be updated.");

      setSaved(true);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The collection record could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord() {
    setDeleting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Your session expired. Please sign in again.");

      const { data: deletedRecord, error: deleteError } = await supabase
        .from("assets")
        .delete()
        .eq("id", record.id)
        .eq("owner_id", userData.user.id)
        .select("id")
        .maybeSingle();

      if (deleteError) {
        if (deleteError.code === "23503") throw new Error("This item is linked to a marketplace record. Remove or close that listing before deleting it from your collection.");
        throw deleteError;
      }
      if (!deletedRecord) throw new Error("This collection record could not be deleted.");

      router.replace("/collection?deleted=1");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The collection record could not be deleted.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#0a1321] p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8c86a]/10 text-[#e8c86a]"><ShieldCheck className="h-5 w-5" /></span>
            <div><h2 className="font-black text-white">Record details</h2><p className="mt-0.5 text-sm text-white/40">Condition, visibility and value.</p></div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block"><span className="text-sm font-semibold text-white/70">Condition</span><select name="condition" defaultValue={record.condition} className={inputClass}>{conditionOptions.map((condition) => <option key={condition} value={condition}>{condition}</option>)}</select></label>
            <label className="block"><span className="text-sm font-semibold text-white/70">Visibility</span><span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-[#07101d] px-4 text-sm text-white/70"><input name="is_public" type="checkbox" defaultChecked={record.isPublic} className="h-4 w-4 accent-[#e8c86a]" /> Public collection record</span></label>
            <label className="block"><span className="text-sm font-semibold text-white/70">Purchase price (R)</span><input name="purchase_price" type="number" min="0" step="0.01" defaultValue={record.purchasePrice ?? ""} placeholder="Optional" className={inputClass} /></label>
            <label className="block"><span className="text-sm font-semibold text-white/70">Atlas estimated value (R)</span><input name="estimated_value" type="number" min="0" step="0.01" defaultValue={record.estimatedValue ?? ""} placeholder="Optional" className={inputClass} /></label>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#0a1321] p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8c86a]/10 text-[#e8c86a]"><PackageCheck className="h-5 w-5" /></span>
            <div><h2 className="font-black text-white">Ownership and completeness</h2><p className="mt-0.5 text-sm text-white/40">These details improve Collection Health and pre-fill a future listing.</p></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[["original_owner", "I am the original owner", record.originalOwner], ["original_receipt", "Original receipt available", record.originalReceipt], ["instructions_complete", "Instructions included and complete", Boolean(record.instructionsComplete)], ["minifigures_complete", "All minifigures included", Boolean(record.minifiguresComplete)]].map(([name, label, checked]) => (
              <label key={String(name)} className="flex min-h-14 items-center gap-3 rounded-xl border border-white/[0.08] bg-[#07101d] px-4 py-3 text-sm text-white/75 transition hover:border-[#e8c86a]/25">
                <input name={String(name)} type="checkbox" defaultChecked={Boolean(checked)} className="h-4 w-4 shrink-0 accent-[#e8c86a]" />
                {String(label)}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#0a1321] p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8c86a]/10 text-[#e8c86a]"><FileText className="h-5 w-5" /></span>
            <div><h2 className="font-black text-white">Collector notes</h2><p className="mt-0.5 text-sm text-white/40">Purchase history, missing pieces or anything important about this copy.</p></div>
          </div>
          <textarea name="notes" defaultValue={record.notes ?? ""} rows={5} placeholder="Add notes about this item…" className="w-full rounded-xl border border-white/10 bg-[#07101d] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-[#e8c86a]/45 focus:ring-4 focus:ring-[#e8c86a]/5" />
        </section>

        {error ? <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
        {saved ? <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-200"><Check className="h-4 w-4" /> Collection record saved.</p> : null}
        <Button disabled={saving || deleting} className="h-13 w-full rounded-xl bg-[#e8c86a] font-black text-[#050912] hover:bg-[#f1d478]">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? "Saving record…" : "Save Collection Record"}</Button>
      </form>

      <section className="rounded-[1.5rem] border border-red-400/15 bg-red-500/[0.05] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-black text-red-200">Delete this set</h2><p className="mt-1 max-w-xl text-sm leading-6 text-red-200/55">Permanently remove this copy from My Collection. The same set can be added again later as a new record.</p></div>
          {!confirmDelete ? (
            <Button type="button" variant="outline" onClick={() => setConfirmDelete(true)} disabled={saving || deleting} className="shrink-0 rounded-xl border-red-400/25 bg-transparent text-red-200 hover:bg-red-400/10 hover:text-red-100"><Trash2 className="h-4 w-4" /> Delete Set</Button>
          ) : (
            <div className="flex shrink-0 gap-2"><Button type="button" variant="outline" onClick={() => setConfirmDelete(false)} disabled={deleting} className="rounded-xl border-white/15 bg-transparent text-white hover:bg-white/5">Cancel</Button><Button type="button" onClick={deleteRecord} disabled={deleting} className="rounded-xl bg-red-600 text-white hover:bg-red-700">{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}{deleting ? "Deleting…" : "Confirm Delete"}</Button></div>
          )}
        </div>
      </section>
    </div>
  );
}
