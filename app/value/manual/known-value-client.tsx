"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Boxes, Check, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AtlasIdentificationPanel, type AtlasCandidate } from "./atlas-identification-panel";
import type { IntakeType } from "./manual-value-smart-client";

type KnownFlow = Exclude<IntakeType, "unknown">;

type ManualDraft = {
  itemType?: string;
  condition?: string;
  description?: string;
  intent?: string;
  minifigureName?: string;
  minifigureCode?: string;
  minifigureTheme?: string;
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
const amounts = ["A small box or tub", "One storage crate", "Several boxes", "A large collection", "Not sure"];

function optionClass(active: boolean) {
  return `w-full rounded-2xl border p-4 text-left transition ${active ? "border-[#e8c86a]/55 bg-[#e8c86a]/10" : "border-white/10 bg-[#050912] hover:border-white/20"}`;
}

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

function manualIdentity(data: ManualDraft) {
  if (data.matchedName) {
    return {
      legoSetId: data.matchedSetId ?? null,
      setNumber: data.matchedSetNumber || "MATCHED",
      setName: data.matchedName,
      theme: data.matchedTheme || (data.itemType?.includes("minifigure") ? "Minifigures" : "LEGO"),
      isMinifigure: data.itemType === "Single minifigure" || data.itemType === "Minifigure collection",
    };
  }
  const isMinifigure = data.itemType === "Single minifigure" || data.itemType === "Minifigure collection";
  if (isMinifigure) {
    return {
      legoSetId: null,
      setNumber: data.minifigureCode?.trim().toUpperCase() || "MINIFIG",
      setName: data.minifigureName?.trim() || data.itemType || "LEGO minifigure",
      theme: data.minifigureTheme?.trim() || "Minifigures",
      isMinifigure: true,
    };
  }
  return {
    legoSetId: null,
    setNumber: data.weightKg ? "BULK" : "MANUAL",
    setName: data.itemType || "LEGO collection",
    theme: "Loose LEGO",
    isMinifigure: false,
  };
}

export function KnownValueClient({ flow, resume }: { flow: KnownFlow; resume?: string }) {
  const router = useRouter();
  const resumeAttempted = useRef(false);
  const [step, setStep] = useState(0);
  const [itemType, setItemType] = useState(flow === "mixed" ? "Mixed box of LEGO" : flow === "minifigures" ? "Single minifigure" : "Instructions and boxes");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [condition, setCondition] = useState("Not sure");
  const [minifigureName, setMinifigureName] = useState("");
  const [minifigureCode, setMinifigureCode] = useState("");
  const [minifigureTheme, setMinifigureTheme] = useState("");
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<AtlasCandidate | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoose = flow === "mixed";
  const isMinifigure = flow === "minifigures";
  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;
  const matchQuery = [minifigureCode, minifigureName, minifigureTheme, reference, description].filter(Boolean).join(" ").trim();

  const heading = useMemo(() => {
    if (step === 0) {
      if (flow === "mixed") return "Which sounds closer?";
      if (flow === "minifigures") return "One figure or a collection?";
      return "What do you have?";
    }
    if (step === 1) {
      if (isLoose) return "Tell Atlas a little more";
      if (isMinifigure) return "Tell Atlas about the figure";
      return "Tell Atlas what you know";
    }
    if (step === 2) return "What condition is it in?";
    return isLoose ? "Atlas can value this by weight" : "Atlas is narrowing it down";
  }, [flow, isLoose, isMinifigure, step]);

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(itemType);
    if (step === 1 && isLoose) return Boolean(amount || description.trim());
    if (step === 1 && isMinifigure) return Boolean(description.trim() || minifigureName.trim() || minifigureCode.trim());
    if (step === 1) return Boolean(description.trim() || reference.trim());
    return true;
  }, [amount, description, isLoose, isMinifigure, itemType, minifigureCode, minifigureName, reference, step]);

  function buildDraft(intent: string): ManualDraft {
    const low = weightKg && weightKg > 0 ? Math.round(weightKg * 150) : null;
    const high = weightKg && weightKg > 0 ? Math.round(weightKg * 250) : null;
    const notes = [
      amount ? `Approximate amount: ${amount}` : "",
      weightKg ? `Measured weight: ${weightKg} kg` : "",
      reference ? `Recognisable details: ${reference}` : "",
      selectedMatch ? `Atlas candidate confirmed: ${selectedMatch.setNumber} · ${selectedMatch.name} (${selectedMatch.confidence}% match)` : "",
      description.trim(),
    ].filter(Boolean).join("\n\n");
    return {
      itemType,
      condition,
      description: notes,
      intent,
      minifigureName,
      minifigureCode,
      minifigureTheme,
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

  async function resolveEstimatedValue(data: ManualDraft) {
    if (data.estimatedValueLow && data.estimatedValueHigh) {
      return Math.round((data.estimatedValueLow + data.estimatedValueHigh) / 2);
    }
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

  async function saveCollection(data: ManualDraft, allowLoginRedirect = true) {
    const identity = manualIdentity(data);
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      if (!allowLoginRedirect) throw new Error("Your sign-in could not be confirmed. Please sign in again.");
      window.localStorage.setItem(COLLECTION_PENDING_KEY, JSON.stringify(data));
      const returnPath = `/value/manual?type=${encodeURIComponent(flow)}&resume=collection`;
      router.push(`/sign-in?next=${encodeURIComponent(returnPath)}`);
      return false;
    }

    const estimatedValue = await resolveEstimatedValue(data);
    const listingDescription = [
      data.description,
      data.condition ? `Atlas condition: ${data.condition}` : "",
      data.estimatedValueLow && data.estimatedValueHigh ? `Atlas bulk estimate: R${data.estimatedValueLow}–R${data.estimatedValueHigh}` : "",
      identity.isMinifigure && identity.theme ? `Theme or series: ${identity.theme}` : "",
    ].filter(Boolean).join("\n\n");

    const { data: asset, error: insertError } = await supabase.from("assets").insert({
      owner_id: userData.user.id,
      lego_set_id: identity.legoSetId,
      set_number: identity.setNumber,
      set_name: identity.setName,
      theme: identity.theme,
      condition: assetCondition(data.condition),
      sealed: false,
      estimated_value: estimatedValue,
      passport_status: "Draft",
      is_public: false,
      notes: listingDescription || null,
    }).select("id").single();
    if (insertError || !asset) throw insertError ?? new Error("The collection record could not be created.");
    window.localStorage.removeItem(COLLECTION_PENDING_KEY);
    router.push(`/collection/${asset.id}`);
    router.refresh();
    return true;
  }

  async function complete(intent: string, overrideDraft?: ManualDraft, allowLoginRedirect = true) {
    setSaving(true);
    setError(null);
    const data = overrideDraft ?? buildDraft(intent);
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    const identity = manualIdentity(data);
    try {
      if (intent === "Add it to my Collection") {
        await saveCollection(data, allowLoginRedirect);
        return;
      }
      if (intent === "List it on the Marketplace") {
        const price = await resolveEstimatedValue(data);
        window.localStorage.setItem("tbx-listing-draft", JSON.stringify({
          title: identity.isMinifigure ? [identity.setNumber !== "MINIFIG" ? identity.setNumber : "", identity.setName].filter(Boolean).join(" · ") : identity.setName,
          condition: data.condition ?? "Not sure",
          included: data.itemType ?? "LEGO collection",
          description: data.description ?? "",
          price: price ? String(price) : "",
          delivery: "Seller ships",
          itemKind: identity.isMinifigure ? "minifigure" : "manual",
        }));
        router.push("/sell/create?source=manual");
        return;
      }
      setSubmitted(true);
    } catch (caughtError) {
      setSubmitted(false);
      setStep(3);
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
      setStep(3);
      setError("Atlas could not find the item you were adding. Your valuation draft is still available on this device.");
      return;
    }
    try {
      const data = JSON.parse(pending) as ManualDraft;
      setItemType(data.itemType || itemType);
      setDescription(data.description || "");
      setCondition(data.condition || "Not sure");
      setMinifigureName(data.minifigureName || "");
      setMinifigureCode(data.minifigureCode || "");
      setMinifigureTheme(data.minifigureTheme || "");
      setWeightKg(data.weightKg ?? null);
      setStep(3);
      void complete("Add it to my Collection", data, false);
    } catch {
      setStep(3);
      setError("Atlas could not restore the saved item. Please review the summary and try again.");
    }
  }, [flow, resume]);

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#050912] text-white">
        <div className="mx-auto flex min-h-screen max-w-[760px] items-center px-5 py-16 lg:px-10">
          <div className="w-full rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-8 text-center sm:p-12">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#e8c86a]/25 bg-[#e8c86a]/10 text-[#e8c86a]"><Check className="h-8 w-8" /></span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Atlas</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Atlas has enough to continue</h1>
            <p className="mx-auto mt-3 max-w-lg leading-7 text-white/48">Your valuation draft is ready. Add it to your Collection or start a Marketplace listing.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button disabled={saving} onClick={() => complete("Add it to my Collection")} className="h-12 rounded-xl border border-white/12 px-5 font-bold text-white/80">Add to Collection</button>
              <button disabled={saving} onClick={() => complete("List it on the Marketplace")} className="h-12 rounded-xl border border-white/12 px-5 font-bold text-white/80">List on Marketplace</button>
            </div>
            <Link href="/value" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#e8c86a]">Back to Value <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <header className="border-b border-white/[0.06] bg-[#050912]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[980px] items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 font-black"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a]"><Boxes className="h-5 w-5" /></span>TBX</Link>
          <Link href="/value" className="inline-flex items-center gap-2 text-sm font-bold text-white/55"><ArrowLeft className="h-4 w-4" /> Change what I have</Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(232,200,106,0.12),transparent_34rem)]" />
        <div className="relative mx-auto max-w-[760px] px-5 py-12 sm:py-16 lg:px-10">
          <div className="mb-7 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-[#e8c86a] transition-all" style={{ width: `${progress}%` }} /></div><span className="text-xs font-bold text-white/35">{step + 1} / {totalSteps}</span></div>
          <div className="mb-8"><div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]"><Sparkles className="h-3.5 w-3.5" /> Atlas</div><h1 className="mt-4 text-4xl font-black leading-[0.98] tracking-[-0.055em] sm:text-5xl">{heading}</h1><p className="mt-4 text-base leading-7 text-white/48">Atlas already knows the category you chose. This question only adds new information.</p></div>

          <div className="rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.48)] sm:p-8">
            {step === 0 && flow === "mixed" ? <div className="grid gap-3 sm:grid-cols-2">{[{ value: "Mixed box of LEGO", title: "A mixed box", text: "Pieces from different sets together." }, { value: "Loose bricks and parts", title: "Mostly loose bricks", text: "Individual pieces, spares or sorted parts." }].map((choice) => <button key={choice.value} onClick={() => setItemType(choice.value)} className={optionClass(itemType === choice.value)}><span className="font-black">{choice.title}</span><span className="mt-1 block text-sm text-white/40">{choice.text}</span></button>)}</div> : null}
            {step === 0 && flow === "minifigures" ? <div className="grid gap-3 sm:grid-cols-2">{[{ value: "Single minifigure", title: "One minifigure", text: "A single figure." }, { value: "Minifigure collection", title: "A collection", text: "Several figures together." }].map((choice) => <button key={choice.value} onClick={() => setItemType(choice.value)} className={optionClass(itemType === choice.value)}><span className="font-black">{choice.title}</span><span className="mt-1 block text-sm text-white/40">{choice.text}</span></button>)}</div> : null}
            {step === 0 && flow === "instructions" ? <div className="grid gap-3 sm:grid-cols-3">{[{ value: "Instructions", title: "Instructions" }, { value: "Boxes", title: "Boxes" }, { value: "Instructions and boxes", title: "Both" }].map((choice) => <button key={choice.value} onClick={() => setItemType(choice.value)} className={optionClass(itemType === choice.value)}><span className="font-black">{choice.title}</span></button>)}</div> : null}

            {step === 1 && isLoose ? <div><p className="text-sm font-bold text-white/70">Roughly how much is there?</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{amounts.map((value) => <button key={value} onClick={() => setAmount(value)} className={optionClass(amount === value)}><span className="font-bold">{value}</span></button>)}</div><label className="mt-6 block"><span className="text-sm font-bold text-white/70">Anything Atlas should notice? <span className="font-normal text-white/30">Optional</span></span><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Themes, minifigures, Technic pieces, recognisable builds..." className="mt-2 w-full rounded-xl border border-white/10 bg-[#050912] px-4 py-3 text-white placeholder:text-white/22" /></label></div> : null}

            {step === 1 && isMinifigure ? <div className="space-y-5"><label className="block"><span className="text-sm font-bold text-white/70">Do you know who it is? <span className="font-normal text-white/30">Optional</span></span><input value={minifigureName} onChange={(e) => { setMinifigureName(e.target.value); setSelectedMatch(null); }} placeholder="Character or minifigure name" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white" /></label><label className="block"><span className="text-sm font-bold text-white/70">Describe what you can see</span><textarea value={description} onChange={(e) => { setDescription(e.target.value); setSelectedMatch(null); }} rows={4} placeholder="Helmet or hair, colours, torso printing, cape, accessories..." className="mt-2 w-full rounded-xl border border-white/10 bg-[#050912] px-4 py-3 text-white" /></label><details className="rounded-xl border border-white/[0.08] bg-[#050912] p-4"><summary className="cursor-pointer text-sm font-bold text-white/60">I know the code or theme</summary><div className="mt-4 grid gap-4 sm:grid-cols-2"><input value={minifigureCode} onChange={(e) => { setMinifigureCode(e.target.value); setSelectedMatch(null); }} placeholder="Code" className="h-12 rounded-xl border border-white/10 bg-[#09111f] px-4 text-white" /><input value={minifigureTheme} onChange={(e) => { setMinifigureTheme(e.target.value); setSelectedMatch(null); }} placeholder="Theme or series" className="h-12 rounded-xl border border-white/10 bg-[#09111f] px-4 text-white" /></div></details></div> : null}

            {step === 1 && flow === "instructions" ? <div className="space-y-5"><label className="block"><span className="text-sm font-bold text-white/70">Any set number, theme or name? <span className="font-normal text-white/30">Optional</span></span><input value={reference} onChange={(e) => { setReference(e.target.value); setSelectedMatch(null); }} placeholder="e.g. 10294, Titanic, Star Wars..." className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white" /></label><label className="block"><span className="text-sm font-bold text-white/70">Describe what you have</span><textarea value={description} onChange={(e) => { setDescription(e.target.value); setSelectedMatch(null); }} rows={5} placeholder="Manuals, boxes, inserts, stickers, packaging condition..." className="mt-2 w-full rounded-xl border border-white/10 bg-[#050912] px-4 py-3 text-white" /></label></div> : null}

            {step === 2 ? <div className="grid gap-3 sm:grid-cols-2">{conditions.map((value) => <button key={value} onClick={() => setCondition(value)} className={optionClass(condition === value)}><span className="font-bold">{value}</span></button>)}</div> : null}

            {step === 3 ? <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#e8c86a]">What Atlas heard</p><div className="mt-4 space-y-3 rounded-2xl border border-white/[0.08] bg-[#050912] p-5 text-sm leading-6"><div className="flex justify-between gap-6"><span className="text-white/35">Type</span><span className="text-right font-bold text-white/85">{itemType}</span></div>{amount ? <div className="flex justify-between gap-6"><span className="text-white/35">Amount</span><span className="text-right font-bold text-white/85">{amount}</span></div> : null}<div className="flex justify-between gap-6"><span className="text-white/35">Condition</span><span className="text-right font-bold text-white/85">{condition}</span></div></div>{description ? <p className="mt-4 rounded-2xl border border-white/[0.08] bg-[#050912] p-5 text-sm leading-6 text-white/55">{description}</p> : null}<AtlasIdentificationPanel loose={isLoose} minifigure={isMinifigure} query={matchQuery} weightKg={weightKg} onWeightChange={setWeightKg} selected={selectedMatch} onSelect={setSelectedMatch} /></div> : null}

            {error ? <p role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-200">{error}</p> : null}
            <div className="mt-7 flex items-center gap-3 border-t border-white/[0.07] pt-6">{step > 0 ? <button disabled={saving} onClick={() => setStep((v) => v - 1)} className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 px-5 font-bold text-white/60"><ArrowLeft className="h-4 w-4" /> Back</button> : null}{step < 3 ? <button disabled={!canContinue || saving} onClick={() => { setError(null); setStep((v) => v + 1); }} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8c86a] px-5 font-black text-[#050912] disabled:opacity-35">Continue <ArrowRight className="h-4 w-4" /></button> : <button disabled={saving} onClick={() => complete("I am just checking the value")} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8c86a] px-5 font-black text-[#050912] disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Continue with Atlas <ArrowRight className="h-4 w-4" /></button>}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
