"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, PackageOpen, Scale } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type BulkDraft = {
  itemType: "Loose LEGO";
  condition: string;
  description: string;
  intent: string;
  weightKg: number;
  estimatedValueLow: number;
  estimatedValueHigh: number;
};

const DRAFT_KEY = "tbx-manual-lego-draft";
const COLLECTION_PENDING_KEY = "tbx-manual-collection-pending";
const conditions = ["Mostly clean and usable", "Mixed condition", "Needs cleaning or sorting", "Damaged or incomplete", "Not sure"];

function assetCondition(condition: string) {
  if (condition === "Mostly clean and usable") return "Used Complete";
  if (condition === "Damaged or incomplete") return "Used Incomplete";
  return "Unknown";
}

function money(value: number) {
  return `R${Math.round(value).toLocaleString("en-ZA")}`;
}

export function BulkValueClient({ resume }: { resume?: string }) {
  const router = useRouter();
  const resumeAttempted = useRef(false);
  const [step, setStep] = useState(0);
  const [weight, setWeight] = useState("");
  const [condition, setCondition] = useState("Not sure");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weightKg = Number(weight || 0);
  const low = useMemo(() => (weightKg > 0 ? Math.round(weightKg * 150) : 0), [weightKg]);
  const high = useMemo(() => (weightKg > 0 ? Math.round(weightKg * 250) : 0), [weightKg]);
  const midpoint = low && high ? Math.round((low + high) / 2) : 0;

  function buildDraft(intent: string): BulkDraft {
    return {
      itemType: "Loose LEGO",
      condition,
      description: `Measured weight: ${weightKg} kg`,
      intent,
      weightKg,
      estimatedValueLow: low,
      estimatedValueHigh: high,
    };
  }

  async function saveCollection(data: BulkDraft, allowLoginRedirect = true) {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      if (!allowLoginRedirect) throw new Error("Your sign-in could not be confirmed. Please sign in again.");
      window.localStorage.setItem(COLLECTION_PENDING_KEY, JSON.stringify(data));
      router.push(`/sign-in?next=${encodeURIComponent("/value/manual?type=mixed&resume=collection")}`);
      return;
    }

    const { data: asset, error: insertError } = await supabase.from("assets").insert({
      owner_id: userData.user.id,
      lego_set_id: null,
      set_number: "BULK",
      set_name: `${data.weightKg} kg Loose LEGO`,
      theme: "Loose LEGO",
      condition: assetCondition(data.condition),
      sealed: false,
      estimated_value: Math.round((data.estimatedValueLow + data.estimatedValueHigh) / 2),
      passport_status: "Draft",
      is_public: false,
      notes: `Measured weight: ${data.weightKg} kg\n\nAtlas bulk estimate: ${money(data.estimatedValueLow)}–${money(data.estimatedValueHigh)}\n\nAtlas condition: ${data.condition}`,
    }).select("id").single();

    if (insertError || !asset) throw insertError ?? new Error("The collection record could not be created.");
    window.localStorage.removeItem(COLLECTION_PENDING_KEY);
    router.push(`/collection/${asset.id}`);
    router.refresh();
  }

  async function complete(intent: string, override?: BulkDraft, allowLoginRedirect = true) {
    setSaving(true);
    setError(null);
    const data = override ?? buildDraft(intent);
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    try {
      if (intent === "collection") {
        await saveCollection(data, allowLoginRedirect);
        return;
      }
      window.localStorage.setItem("tbx-listing-draft", JSON.stringify({
        title: `${data.weightKg} kg Loose LEGO`,
        condition: data.condition,
        included: "Loose LEGO sold by measured weight",
        description: `Measured weight: ${data.weightKg} kg\n\nAtlas bulk estimate: ${money(data.estimatedValueLow)}–${money(data.estimatedValueHigh)}`,
        weight: String(data.weightKg),
        price: String(Math.round((data.estimatedValueLow + data.estimatedValueHigh) / 2)),
        delivery: "Seller ships",
        itemKind: "mixed-box",
      }));
      router.push("/sell/atlas");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "TBX could not save this item.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (resume !== "collection" || resumeAttempted.current) return;
    resumeAttempted.current = true;
    const pending = window.localStorage.getItem(COLLECTION_PENDING_KEY);
    if (!pending) return;
    try {
      const data = JSON.parse(pending) as BulkDraft;
      setWeight(String(data.weightKg));
      setCondition(data.condition);
      setStep(2);
      void complete("collection", data, false);
    } catch {
      setError("Atlas could not restore the saved loose LEGO draft.");
    }
  }, [resume]);

  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <div className="mx-auto max-w-[760px] px-5 py-12 lg:px-10 lg:py-16">
        <Link href="/value" className="inline-flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Value</Link>
        <div className="mt-8 rounded-[2rem] border border-white/[0.09] bg-[#09111f] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Atlas · Loose LEGO</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">{step === 0 ? "How much does it weigh?" : step === 1 ? "What condition is it in?" : "Atlas bulk value"}</h1>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e8c86a]/10 text-[#e8c86a]">{step === 0 ? <Scale className="h-6 w-6" /> : <PackageOpen className="h-6 w-6" />}</span>
          </div>

          {step === 0 ? (
            <div className="mt-8">
              <label className="text-sm font-bold text-white/70">Measured weight</label>
              <div className="relative mt-2">
                <input autoFocus value={weight} onChange={(e) => setWeight(e.target.value)} type="number" min="0.1" step="0.1" placeholder="e.g. 9.7" className="w-full rounded-xl border border-white/10 bg-[#050912] px-4 py-4 pr-14 text-lg outline-none focus:border-[#e8c86a]/45" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/40">kg</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/42">Loose LEGO is valued from the measured kilograms. Atlas currently uses a provisional bulk range of R150–R250/kg.</p>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="mt-8 grid gap-3">
              {conditions.map((option) => (
                <button key={option} type="button" onClick={() => setCondition(option)} className={`flex items-center justify-between rounded-xl border px-4 py-4 text-left font-bold ${condition === option ? "border-[#e8c86a]/50 bg-[#e8c86a]/10" : "border-white/10 bg-[#050912]"}`}>
                  {option}{condition === option ? <Check className="h-4 w-4 text-[#e8c86a]" /> : null}
                </button>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-8">
              <div className="rounded-2xl border border-[#e8c86a]/25 bg-[#e8c86a]/[0.07] p-6">
                <p className="text-sm font-bold text-white/55">{weightKg} kg measured</p>
                <p className="mt-2 text-4xl font-black text-[#e8c86a]">{money(low)}–{money(high)}</p>
                <p className="mt-3 text-sm leading-6 text-white/45">Midpoint: {money(midpoint)}. This is a bulk estimate, not an individual-parts appraisal.</p>
              </div>
              {error ? <div className="mt-4 rounded-xl border border-red-400/25 bg-red-400/[0.08] p-4 text-sm text-red-200">{error}</div> : null}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button disabled={saving} onClick={() => complete("collection")} className="h-12 rounded-xl border border-white/12 font-bold disabled:opacity-50">{saving ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Add to Collection"}</button>
                <button disabled={saving} onClick={() => complete("sell")} className="h-12 rounded-xl bg-[#e8c86a] font-black text-[#050912] disabled:opacity-50">Sell</button>
              </div>
            </div>
          ) : null}

          {step < 2 ? (
            <div className="mt-8 flex justify-between border-t border-white/[0.07] pt-6">
              <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-xl border border-white/10 px-5 py-3 font-bold disabled:opacity-30">Back</button>
              <button type="button" onClick={() => setStep((s) => Math.min(2, s + 1))} disabled={step === 0 && !(weightKg > 0)} className="inline-flex items-center gap-2 rounded-xl bg-[#e8c86a] px-5 py-3 font-black text-[#050912] disabled:opacity-40">Continue <ArrowRight className="h-4 w-4" /></button>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
