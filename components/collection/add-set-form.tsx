"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const conditions = ["New Sealed", "New Open Box", "Used Complete", "Used Incomplete", "Unknown"];

export function AddSetForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setError("Your session expired. Please sign in again.");
      setLoading(false);
      return;
    }

    const estimatedValue = Number(form.get("estimated_value") || 0);
    const purchasePrice = Number(form.get("purchase_price") || 0);

    const { error: insertError } = await supabase.from("assets").insert({
      owner_id: userData.user.id,
      set_number: String(form.get("set_number") || "").trim(),
      set_name: String(form.get("set_name") || "").trim(),
      theme: String(form.get("theme") || "").trim() || null,
      condition: String(form.get("condition") || "Unknown"),
      purchase_price: Number.isFinite(purchasePrice) ? purchasePrice : null,
      estimated_value: Number.isFinite(estimatedValue) ? estimatedValue : null,
      original_owner: form.get("original_owner") === "on",
      original_receipt: form.get("original_receipt") === "on",
      instructions_complete: form.get("instructions_complete") === "on",
      minifigures_complete: form.get("minifigures_complete") === "on",
      sealed: form.get("sealed") === "on",
      passport_status: "Draft",
      is_public: false,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/vault");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">LEGO set number</span>
          <input name="set_number" required placeholder="10182" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Set name</span>
          <input name="set_name" required placeholder="Café Corner" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Theme</span>
          <input name="theme" placeholder="Modular Buildings" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Condition</span>
          <select name="condition" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400">
            {conditions.map((condition) => <option key={condition}>{condition}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Purchase price (R)</span>
          <input name="purchase_price" type="number" min="0" step="0.01" placeholder="25000" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Estimated value (R)</span>
          <input name="estimated_value" type="number" min="0" step="0.01" placeholder="42000" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
        </label>
      </div>

      <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-5">
        <p className="font-semibold text-slate-950">Passport details</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["original_owner", "I am the original owner"],
            ["original_receipt", "Original receipt available"],
            ["instructions_complete", "Instructions complete"],
            ["minifigures_complete", "Minifigures complete"],
            ["sealed", "Factory sealed"],
          ].map(([name, label]) => (
            <label key={name} className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm text-slate-700">
              <input name={name} type="checkbox" className="h-4 w-4" /> {label}
            </label>
          ))}
        </div>
      </div>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <Button disabled={loading} className="h-12 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Create TBX Passport
        {!loading ? <ArrowRight className="h-4 w-4" /> : null}
      </Button>
    </form>
  );
}
