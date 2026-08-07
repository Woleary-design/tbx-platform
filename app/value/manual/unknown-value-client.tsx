"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Boxes, Check, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AtlasIdentificationPanel, type AtlasCandidate } from "./atlas-identification-panel";

const DRAFT_KEY = "tbx-manual-lego-draft";
const COLLECTION_PENDING_KEY = "tbx-manual-collection-pending";
const conditions = ["Excellent", "Good", "Mixed condition", "Needs cleaning or sorting", "Damaged or incomplete", "Not sure"];

type Draft = {
  itemType: string;
  condition: string;
  description: string;
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

function optionClass(active: boolean) {
  return `w-full rounded-2xl border p-4 text-left font-bold transition ${active ? "border-[#e8c86a]/55 bg-[#e8c86a]/10" : "border-white/10 bg-[#050912] hover:border-white/20"}`;
}

function assetCondition(condition: string) {
  if (condition === "Excellent" || condition === "Good") return "Used Complete";
  if (condition === "Damaged or incomplete") return "Used Incomplete";
  return "Unknown";
}

export function UnknownValueClient({ resume }: { resume?: string }) {
  const router = useRouter();
  const resumeAttempted = useRef(false);
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("Not sure");
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<AtlasCandidate | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;

  function buildDraft(intent?: string): Draft {
    const low = weightKg && weightKg > 0 ? Math.round(weightKg * 150) : null;
    const high = weightKg && weightKg > 0 ? Math.round(weightKg * 250) : null;
    return {
      itemType: selectedMatch ? "Atlas matched item" : weightKg ? "Loose LEGO collection" : "Unidentified LEGO collection",
      condition,
      description,
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

  async function resolvePrice(data: Draft) {
    if (data.matchedSetNumber) {
      try {
        const response = await fetch(`/api/value/${encodeURIComponent(data.matchedSetNumber)}?condition=${encodeURIComponent(assetCondition(data.condition))}`);
        const payload = await response.json();
        const value = Number(payload?.quote?.recommended ?? payload?.quote?.estimated_value ?? 0);
        if (response.ok && Number.isFinite(value) && value > 0) return Math.round(value);
      } catch {}
    }
    if (data.estimatedValueLow && data.estimatedValueHigh) return Math.round((data.estimatedValueLow + data.estimatedValueHigh) / 2);
    return null;
  }

  async function saveCollection(data: Draft, allowLoginRedirect = true) {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      if (!allowLoginRedirect) throw new Error("Your sign-in could not be confirmed. Please sign in again.");
      window.localStorage.setItem(COLLECTION_PENDING_KEY, JSON.stringify(data));
      router.push(`/sign-in?next=${encodeURIComponent("/value/manual?type=unknown&resume=collection")}`);
      return;
    }
    const estimatedValue = await resolvePrice(data);
    const setName = data.matchedName || (data.weightKg ? "Loose LEGO collection" : "Unidentified LEGO collection");
    const setNumber = data.matchedSetNumber || (data.weightKg ? "BULK" : "MANUAL");
    const notes = [data.description, data.weightKg ? `Measured weight: ${data.weightKg} kg` : "", data.estimatedValueLow && data.estimatedValueHigh ? `Atlas bulk estimate: R${data.estimatedValueLow}–R${data.estimatedValueHigh}` : ""].filter(Boolean).join("\n\n");
    const { data: asset, error: insertError } = await supabase.from("assets").insert({
      owner_id: userData.user.id,
      lego_set_id: data.matchedSetId ?? null,
      set_number: setNumber,
      set_name: setName,
      theme: data.matchedTheme || (data.weightKg ? "Loose LEGO" : "LEGO"),
      condition: assetCondition(data.condition),
      sealed: false,
      estimated_value: estimatedValue,
      passport_status: "Draft",
      is_public: false,
      notes: notes || null,
    }).select("id").single();
    if (insertError || !asset) throw insertError ?? new Error("The collection record could not be created.");
    window.localStorage.removeItem(COLLECTION_PENDING_KEY);
    router.push(`/collection/${asset.id}`);
    router.refresh();
  }

  async function complete(intent: string, override?: Draft, allowLoginRedirect = true) {
    setSaving(true);
    setError(null);
    const data = override ?? buildDraft(intent);
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    try {
      if (intent === "collection") {
        await saveCollection(data, allowLoginRedirect);
        return;
      }
      if (intent === "sell") {
        const price = await resolvePrice(data);
        window.localStorage.setItem("tbx-listing-draft", JSON.stringify({
          title: data.matchedName || (data.weightKg ? "Loose LEGO collection" : "Unidentified LEGO collection"),
          condition: data.condition,
          included: data.itemType,
          description: data.description,
          weight: data.weightKg ? String(data.weightKg) : "",
          price: price ? String(price) : "",
          delivery: "Seller ships",
          itemKind: data.matchedSetNumber ? "known-set" : data.weightKg ? "mixed-box" : "unknown",
        }));
        router.push("/sell/atlas");
        return;
      }
      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "TBX could not save this item.");
      setSubmitted(false);
      setStep(2);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (resume !== "collection" || resumeAttempted.current) return;
    resumeAttempted.current = true;
    const saved = window.localStorage.getItem(COLLECTION_PENDING_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved) as Draft;
      setDescription(data.description || "");
      setCondition(data.condition || "Not sure");
      setWeightKg(data.weightKg ?? null);
      setStep(2);
      void complete("collection", data, false);
    } catch {
      setError("Atlas could not restore the saved item. Please try again.");
    }
  }, [resume]);

  if (submitted) {
    return <main className="min-h-screen bg-[#050912] text-white"><div className="mx-auto flex min-h-screen max-w-[760px] items-center px-5 py-16"><div className="w-full rounded-[2rem] border border-white/[0.09] bg-[#09111f] p-8 text-center sm:p-12"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#e8c86a]/25 bg-[#e8c86a]/10 text-[#e8c86a]"><Check className="h-8 w-8" /></span><p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Atlas</p><h1 className="mt-2 text-3xl font-black">Atlas has enough to continue</h1><p className="mx-auto mt-3 max-w-lg text-white/48">Use the identification Atlas found, or keep the description as an unlisted LEGO item.</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><button disabled={saving} onClick={() => complete("collection")} className="h-12 rounded-xl border border-white/12 font-bold">Add to Collection</button><button disabled={saving} onClick={() => complete("sell")} className="h-12 rounded-xl border border-white/12 font-bold">List on Marketplace</button></div></div></div></main>;
  }

  return <main className="min-h-screen bg-[#050912] text-white"><header className="border-b border-white/[0.06]"><div className="mx-auto flex h-20 max-w-[980px] items-center justify-between px-5 lg:px-10"><Link href="/" className="flex items-center gap-3 font-black"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a]"><Boxes className="h-5 w-5" /></span>TBX</Link><Link href="/value" className="inline-flex items-center gap-2 text-sm font-bold text-white/55"><ArrowLeft className="h-4 w-4" /> Change what I have</Link></div></header><section><div className="mx-auto max-w-[760px] px-5 py-12 sm:py-16 lg:px-10"><div className="mb-7 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-[#e8c86a]" style={{width:`${progress}%`}} /></div><span className="text-xs font-bold text-white/35">{step + 1} / {totalSteps}</span></div><div className="mb-8"><div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]"><Sparkles className="h-3.5 w-3.5" /> Atlas</div><h1 className="mt-4 text-4xl font-black tracking-[-0.055em] sm:text-5xl">{step === 0 ? "Describe what you can see" : step === 1 ? "What condition is it in?" : "Atlas is narrowing it down"}</h1><p className="mt-4 leading-7 text-white/48">{step === 0 ? "No category needed. Use ordinary words and Atlas will work from your description." : step === 2 ? "Confirm a likely match if Atlas finds one. If it is loose LEGO, weight can provide a bulk estimate." : "Only choose what you know."}</p></div><div className="rounded-[2rem] border border-white/[0.09] bg-[#09111f] p-5 sm:p-8">{step === 0 ? <div><textarea autoFocus value={description} onChange={(e)=>{setDescription(e.target.value);setSelectedMatch(null);}} rows={7} placeholder="For example: black and red Spider-Man figure, white eyes, red web printing... or a tub of mixed bricks with wheels and minifigures..." className="w-full rounded-xl border border-white/10 bg-[#050912] px-4 py-3 text-white placeholder:text-white/25"/><label className="mt-5 block"><span className="text-sm font-bold text-white/70">Weight in kg <span className="font-normal text-white/30">Optional, useful for loose LEGO</span></span><input type="number" min="0" step="0.1" value={weightKg ?? ""} onChange={(e)=>setWeightKg(e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 9.7" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white"/></label></div> : null}{step === 1 ? <div className="grid gap-3 sm:grid-cols-2">{conditions.map((value)=><button key={value} onClick={()=>setCondition(value)} className={optionClass(condition===value)}>{value}</button>)}</div> : null}{step === 2 ? <div><AtlasIdentificationPanel loose={false} minifigure={false} query={description} weightKg={weightKg} onWeightChange={setWeightKg} selected={selectedMatch} onSelect={setSelectedMatch}/>{weightKg ? <div className="mt-5 rounded-2xl border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] p-5"><p className="text-sm text-white/45">Bulk estimate from weight</p><p className="mt-1 text-2xl font-black">R{Math.round(weightKg*150).toLocaleString("en-ZA")}–R{Math.round(weightKg*250).toLocaleString("en-ZA")}</p></div> : null}</div> : null}{error ? <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-200">{error}</p> : null}<div className="mt-7 flex gap-3 border-t border-white/[0.07] pt-6">{step>0 ? <button onClick={()=>setStep((v)=>v-1)} className="h-12 rounded-xl border border-white/10 px-5 font-bold text-white/60">Back</button> : null}{step<2 ? <button disabled={step===0 && !description.trim()} onClick={()=>setStep((v)=>v+1)} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8c86a] px-5 font-black text-[#050912] disabled:opacity-35">Continue <ArrowRight className="h-4 w-4" /></button> : <button disabled={saving} onClick={()=>complete("check")} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8c86a] px-5 font-black text-[#050912]">{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : null} Continue with Atlas <ArrowRight className="h-4 w-4" /></button>}</div></div></div></section></main>;
}
