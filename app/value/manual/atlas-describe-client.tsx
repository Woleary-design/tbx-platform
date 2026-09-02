"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Boxes, Check, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AtlasIdentificationPanel, type AtlasCandidate } from "./atlas-identification-panel";

type Draft = {
  itemType?: string;
  condition?: string;
  description?: string;
  intent?: string;
  weightKg?: number | null;
  matchedSetId?: string;
  matchedSetNumber?: string;
  matchedName?: string;
  matchedTheme?: string | null;
  matchedConfidence?: number;
  estimatedValueLow?: number | null;
  estimatedValueHigh?: number | null;
};

const DRAFT_KEY = "tbx-manual-lego-draft";
const COLLECTION_PENDING_KEY = "tbx-manual-collection-pending";
const conditions = ["Excellent", "Good", "Mixed condition", "Needs cleaning or sorting", "Damaged or incomplete", "Not sure"];

function assetCondition(condition?: string) {
  if (condition === "Excellent" || condition === "Good") return "Used Complete";
  if (condition === "Damaged or incomplete") return "Used Incomplete";
  return "Unknown";
}

function messageFromError(value: unknown, fallback: string) {
  if (value instanceof Error) return value.message;
  if (value && typeof value === "object" && "message" in value && typeof value.message === "string") return value.message;
  return fallback;
}

export function AtlasDescribeClient({ resume }: { resume?: string }) {
  const router = useRouter();
  const resumeAttempted = useRef(false);
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [condition, setCondition] = useState("Not sure");
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<AtlasCandidate | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;
  const query = [reference, description].filter(Boolean).join(" ").trim();
  const loose = Boolean(weightKg && weightKg > 0 && !selectedMatch);
  const itemType = selectedMatch
    ? selectedMatch.theme?.toLowerCase().includes("minifig") ? "Single minifigure" : "Incomplete or unknown sets"
    : weightKg && weightKg > 0 ? "Loose bricks and parts" : "Other LEGO collection";

  const heading = useMemo(() => {
    if (step === 0) return "Tell Atlas what you can see";
    if (step === 1) return "What condition is it in?";
    return "Atlas is narrowing it down";
  }, [step]);

  function buildDraft(intent: string): Draft {
    const low = weightKg && weightKg > 0 ? Math.round(weightKg * 150) : null;
    const high = weightKg && weightKg > 0 ? Math.round(weightKg * 250) : null;
    const notes = [
      reference ? `Recognisable details: ${reference}` : "",
      weightKg ? `Measured weight: ${weightKg} kg` : "",
      selectedMatch ? `Atlas candidate confirmed: ${selectedMatch.setNumber} · ${selectedMatch.name} (${selectedMatch.confidence}% match)` : "",
      description.trim(),
    ].filter(Boolean).join("\n\n");
    return {
      itemType,
      condition,
      description: notes,
      intent,
      weightKg,
      matchedSetId: selectedMatch?.id,
      matchedSetNumber: selectedMatch?.setNumber,
      matchedName: selectedMatch?.name,
      matchedTheme: selectedMatch?.theme,
      matchedConfidence: selectedMatch?.confidence,
      estimatedValueLow: low,
      estimatedValueHigh: high,
    };
  }

  async function resolveEstimatedValue(data: Draft) {
    if (data.estimatedValueLow && data.estimatedValueHigh) return Math.round((data.estimatedValueLow + data.estimatedValueHigh) / 2);
    if (!data.matchedSetNumber) return null;
    try {
      const response = await fetch(`/api/value/${encodeURIComponent(data.matchedSetNumber)}?condition=${encodeURIComponent(assetCondition(data.condition))}`);
      const payload = await response.json();
      if (!response.ok) return null;
      const value = Number(payload?.quote?.recommended ?? payload?.quote?.estimated_value ?? 0);
      return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
    } catch {
      return null;
    }
  }

  async function saveCollection(data: Draft, allowLoginRedirect = true) {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      if (!allowLoginRedirect) throw new Error("Your sign-in could not be confirmed. Please sign in again.");
      window.localStorage.setItem(COLLECTION_PENDING_KEY, JSON.stringify(data));
      router.push(`/sign-in?next=${encodeURIComponent("/value/manual?type=unknown&resume=collection")}`);
      return false;
    }

    const estimatedValue = await resolveEstimatedValue(data);
    const setNumber = data.matchedSetNumber || (data.weightKg ? "BULK" : "MANUAL");
    const setName = data.matchedName || (data.weightKg ? "Loose LEGO collection" : "Unidentified LEGO collection");
    const theme = data.matchedTheme || (data.weightKg ? "Loose LEGO" : "LEGO");
    const { data: asset, error: insertError } = await supabase.from("assets").insert({
      owner_id: userData.user.id,
      lego_set_id: data.matchedSetId ?? null,
      set_number: setNumber,
      set_name: setName,
      theme,
      condition: assetCondition(data.condition),
      sealed: false,
      estimated_value: estimatedValue,
      passport_status: "Draft",
      is_public: false,
      notes: data.description || null,
    }).select("id").single();
    if (insertError || !asset) throw insertError ?? new Error("The collection record could not be created.");
    window.localStorage.removeItem(COLLECTION_PENDING_KEY);
    router.push(`/collection/${asset.id}`);
    router.refresh();
    return true;
  }

  async function complete(intent: string, overrideDraft?: Draft, allowLoginRedirect = true) {
    setSaving(true);
    setError(null);
    const data = overrideDraft ?? buildDraft(intent);
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    try {
      if (intent === "Add it to my Collection") {
        await saveCollection(data, allowLoginRedirect);
        return;
      }
      if (intent === "List it on the Marketplace") {
        const price = await resolveEstimatedValue(data);
        window.localStorage.setItem("tbx-listing-draft", JSON.stringify({
          title: data.matchedName || (data.weightKg ? "Loose LEGO collection" : "LEGO collection"),
          condition: data.condition ?? "Not sure",
          included: data.itemType ?? "LEGO collection",
          description: data.description ?? "",
          price: price ? String(price) : "",
          delivery: "Seller ships",
          itemKind: data.weightKg ? "loose" : data.matchedName ? "known-set" : "manual",
          weight: data.weightKg ? String(data.weightKg) : "",
        }));
        router.push("/sell/atlas");
        return;
      }
      setSubmitted(true);
    } catch (caughtError) {
      setSubmitted(false);
      setStep(2);
      setError(messageFromError(caughtError, "TBX could not save this item."));
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (resume !== "collection" || resumeAttempted.current) return;
    resumeAttempted.current = true;
    const pending = window.localStorage.getItem(COLLECTION_PENDING_KEY);
    if (!pending) {
      setStep(2);
      setError("Atlas could not find the item you were adding. Your draft is still available on this device.");
      return;
    }
    try {
      const data = JSON.parse(pending) as Draft;
      setDescription(data.description || "");
      setCondition(data.condition || "Not sure");
      setWeightKg(data.weightKg ?? null);
      setStep(2);
      void complete("Add it to my Collection", data, false);
    } catch {
      setStep(2);
      setError("Atlas could not restore the saved item. Please review it and try again.");
    }
  }, [resume]);

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#050912] text-white">
        <div className="mx-auto flex min-h-screen max-w-[760px] items-center px-5 py-16 lg:px-10">
          <div className="w-full rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-8 text-center sm:p-12">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#e8c86a]/25 bg-[#e8c86a]/10 text-[#e8c86a]"><Check className="h-8 w-8" /></span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Atlas</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Atlas has what it needs</h1>
            <p className="mx-auto mt-3 max-w-lg leading-7 text-white/48">Keep this as a draft, add it to your Collection, or turn the same Atlas record into a Marketplace listing.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button disabled={saving} onClick={() => complete("Add it to my Collection")} className="h-12 rounded-xl border border-white/12 px-5 font-bold text-white/80">Add to Collection</button>
              <button disabled={saving} onClick={() => complete("List it on the Marketplace")} className="h-12 rounded-xl border border-white/12 px-5 font-bold text-white/80">Sell</button>
            </div>
            <Link href="/value" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#e8c86a]">Start another <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <header className="border-b border-white/[0.06] bg-[#050912]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[920px] items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 font-black"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a]"><Boxes className="h-5 w-5" /></span>TBX</Link>
          <Link href="/value" className="inline-flex items-center gap-2 text-sm font-bold text-white/55"><ArrowLeft className="h-4 w-4" /> Back</Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(232,200,106,0.12),transparent_34rem)]" />
        <div className="relative mx-auto max-w-[760px] px-5 py-12 sm:py-16 lg:px-10">
          <div className="mb-7 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-[#e8c86a]" style={{ width: `${progress}%` }} /></div><span className="text-xs font-bold text-white/35">{step + 1} / {totalSteps}</span></div>
          <div className="mb-8"><div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]"><Sparkles className="h-3.5 w-3.5" /> Atlas</div><h1 className="mt-4 text-4xl font-black leading-[0.98] tracking-[-0.055em] sm:text-5xl">{heading}</h1><p className="mt-4 text-base leading-7 text-white/48">No category required. Describe what you know and Atlas will do the matching.</p></div>

          <div className="rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.48)] sm:p-8">
            {step === 0 ? <div className="space-y-5"><label className="block"><span className="text-sm font-bold text-white/70">Describe what you have</span><textarea autoFocus value={description} onChange={(e) => { setDescription(e.target.value); setSelectedMatch(null); }} rows={6} placeholder="Colours, characters, theme, shape, loose pieces, partly built sets, packaging — anything you can see..." className="mt-2 w-full rounded-xl border border-white/10 bg-[#050912] px-4 py-3 text-white placeholder:text-white/22" /></label><label className="block"><span className="text-sm font-bold text-white/70">Any name, code or number? <span className="font-normal text-white/30">Optional</span></span><input value={reference} onChange={(e) => { setReference(e.target.value); setSelectedMatch(null); }} placeholder="e.g. Miles Morales, 71050, Star Wars..." className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white" /></label><label className="block"><span className="text-sm font-bold text-white/70">Weight in kg <span className="font-normal text-white/30">Optional — useful for loose LEGO</span></span><input value={weightKg ?? ""} onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : null)} type="number" min="0" step="0.1" placeholder="e.g. 9.7" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white" /></label></div> : null}
            {step === 1 ? <div className="grid gap-3 sm:grid-cols-2">{conditions.map((value) => <button key={value} onClick={() => setCondition(value)} className={`rounded-2xl border p-4 text-left font-bold transition ${condition === value ? "border-[#e8c86a]/55 bg-[#e8c86a]/10" : "border-white/10 bg-[#050912] hover:border-white/20"}`}>{value}</button>)}</div> : null}
            {step === 2 ? <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#e8c86a]">What Atlas heard</p><div className="mt-4 rounded-2xl border border-white/[0.08] bg-[#050912] p-5 text-sm leading-6 text-white/60">{description}{reference ? <p className="mt-3 text-white/40">Reference: {reference}</p> : null}{weightKg ? <p className="mt-1 text-white/40">Weight: {weightKg} kg</p> : null}</div><AtlasIdentificationPanel loose={loose} minifigure={false} query={query} weightKg={weightKg} onWeightChange={setWeightKg} selected={selectedMatch} onSelect={setSelectedMatch} /></div> : null}
            {error ? <p role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-200">{error}</p> : null}
            <div className="mt-7 flex items-center gap-3 border-t border-white/[0.07] pt-6">{step > 0 ? <button disabled={saving} onClick={() => setStep((v) => v - 1)} className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 px-5 font-bold text-white/60"><ArrowLeft className="h-4 w-4" /> Back</button> : null}{step < 2 ? <button disabled={(step === 0 && !description.trim()) || saving} onClick={() => { setError(null); setStep((v) => v + 1); }} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8c86a] px-5 font-black text-[#050912] disabled:opacity-35">Continue <ArrowRight className="h-4 w-4" /></button> : <button disabled={saving} onClick={() => complete("I am just checking the value")} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8c86a] px-5 font-black text-[#050912] disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Continue with Atlas <ArrowRight className="h-4 w-4" /></button>}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
