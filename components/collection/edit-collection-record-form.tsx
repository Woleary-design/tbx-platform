"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Save } from "lucide-react";
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

export function EditCollectionRecordForm({ record }: { record: EditableCollectionRecord }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><span className="text-sm font-medium text-slate-700">Condition</span><select name="condition" defaultValue={record.condition} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400">{conditionOptions.map((condition) => <option key={condition} value={condition}>{condition}</option>)}</select></label>
        <label className="block"><span className="text-sm font-medium text-slate-700">Visibility</span><span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700"><input name="is_public" type="checkbox" defaultChecked={record.isPublic} className="h-4 w-4" /> Public collection record</span></label>
        <label className="block"><span className="text-sm font-medium text-slate-700">Purchase price (R)</span><input name="purchase_price" type="number" min="0" step="0.01" defaultValue={record.purchasePrice ?? ""} placeholder="Optional" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" /></label>
        <label className="block"><span className="text-sm font-medium text-slate-700">Estimated value (R)</span><input name="estimated_value" type="number" min="0" step="0.01" defaultValue={record.estimatedValue ?? ""} placeholder="Optional" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" /></label>
      </div>

      <fieldset className="rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-5">
        <legend className="px-2 font-semibold text-slate-950">Ownership and completeness</legend>
        <p className="mt-1 text-sm text-slate-600">These details improve Collection Health and will pre-fill a future sale listing.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[["original_owner", "I am the original owner", record.originalOwner], ["original_receipt", "Original receipt available", record.originalReceipt], ["instructions_complete", "Instructions included and complete", Boolean(record.instructionsComplete)], ["minifigures_complete", "All minifigures included", Boolean(record.minifiguresComplete)]].map(([name, label, checked]) => <label key={String(name)} className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm text-slate-700"><input name={String(name)} type="checkbox" defaultChecked={Boolean(checked)} className="h-4 w-4" /> {String(label)}</label>)}
        </div>
      </fieldset>

      <label className="block"><span className="text-sm font-medium text-slate-700">Collector notes</span><textarea name="notes" defaultValue={record.notes ?? ""} rows={6} placeholder="Purchase history, missing pieces, restoration details or anything important about this copy." className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none focus:border-slate-400" /></label>

      {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {saved ? <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><Check className="h-4 w-4" /> Collection record saved.</p> : null}
      <Button disabled={saving} className="h-12 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? "Saving record…" : "Save Collection Record"}</Button>
    </form>
  );
}
