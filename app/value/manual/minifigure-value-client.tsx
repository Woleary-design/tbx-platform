"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Boxes, Check, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AtlasIdentificationPanel, type AtlasCandidate } from "./atlas-identification-panel";

type ManualDraft = {
  itemType?: string;
  condition?: string;
  description?: string;
  intent?: string;
  minifigureName?: string;
  minifigureCode?: string;
  minifigureTheme?: string;
  matchedSetId?: string;
  matchedSetNumber?: string;
  matchedName?: string;
  matchedTheme?: string | null;
  matchedConfidence?: number;
};

const DRAFT_KEY = "tbx-manual-lego-draft";
const COLLECTION_PENDING_KEY = "tbx-manual-collection-pending";
const conditions = ["Excellent", "Good", "Mixed condition", "Damaged or incomplete", "Not sure"];

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

export function MinifigureValueClient({ resume }: { resume?: string }) {
  const router = useRouter();
  const resumeAttempted = useRef(false);
  const [step, setStep] = useState(0);
  const [isCollection, setIsCollection] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [theme, setTheme] = useState("");
  const [condition, setCondition] = useState("Not sure");
  const [selectedMatch, setSelectedMatch] = useState<AtlasCandidate | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemType = isCollection ? "Minifigure collection" : "Single minifigure";
  const query = [code, name, theme, description].filter(Boolean).join(" ").trim();
  const progress = ((step + 1) / 3) * 100;
  const heading = step === 0 ? "Tell Atlas about the minifigure" : step === 1 ? "What condition is it in?" : "Atlas is narrowing it down";
  const canContinue = step !== 0 || Boolean(name.trim() || description.trim() || code.trim());

  function buildDraft(intent: string): ManualDraft {
    return {
      itemType,
      condition,
      description: description.trim(),
      intent,
      minifigureName: name,
      minifigureCode: code,
      minifigureTheme: theme,
      matchedSetId: selectedMatch?.id,
      matchedSetNumber: selectedMatch?.setNumber,
      matchedName: selectedMatch?.name,
      matchedTheme: selectedMatch?.theme,
      matchedConfidence: selectedMatch?.confidence,
    };
  }

  async function resolveEstimatedValue(data: ManualDraft) {
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

  function identity(data: ManualDraft) {
    if (data.matchedName) {
      return {
        legoSetId: data.matchedSetId ?? null,
        setNumber: data.matchedSetNumber || "MATCHED",
        setName: data.matchedName,
        theme: data.matchedTheme || "Minifigures",
      };
    }
    return {
      legoSetId: null,
      setNumber: data.minifigureCode?.trim().toUpperCase() || "MINIFIG",
      setName: data.minifigureName?.trim() || data.itemType || "LEGO minifigure",
      theme: data.minifigureTheme?.trim() || "Minifigures",
    };
  }

  async function saveCollection(data: ManualDraft, allowLoginRedirect = true) {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      if (!allowLoginRedirect) throw new Error("Your sign-in could not be confirmed. Please sign in again.");
      window.localStorage.setItem(COLLECTION_PENDING_KEY, JSON.stringify(data));
      const returnPath = "/value/manual?type=minifigures&resume=collection";
      router.push(`/sign-in?next=${encodeURIComponent(returnPath)}`);
      return false;
    }

    const item = identity(data);
    const estimatedValue = await resolveEstimatedValue(data);
    const notes = [data.description, data.condition ? `Atlas condition: ${data.condition}` : "", data.minifigureTheme ? `Theme or series: ${data.minifigureTheme}` : ""].filter(Boolean).join("\n\n");
    const { data: asset, error: insertError } = await supabase.from("assets").insert({
      owner_id: userData.user.id,
      lego_set_id: item.legoSetId,
      set_number: item.setNumber,
      set_name: item.setName,
      theme: item.theme,
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
    return true;
  }

  async function complete(intent: string, overrideDraft?: ManualDraft, allowLoginRedirect = true) {
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
        const item = identity(data);
        const price = await resolveEstimatedValue(data);
        window.localStorage.setItem("tbx-listing-draft", JSON.stringify({
          title: [item.setNumber !== "MINIFIG" ? item.setNumber : "", item.setName].filter(Boolean).join(" · "),
          condition: data.condition ?? "Not sure",
          included: data.itemType ?? "Minifigure",
          description: data.description ?? "",
          price: price ? String(price) : "",
          delivery: "Seller ships",
          itemKind: "minifigure",
        }));
        router.push("/sell/create?source=manual");
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
      setError("Atlas could not find the minifigure you were adding. Your draft is still available on this device.");
      return;
    }
    try {
      const data = JSON.parse(pending) as ManualDraft;
      setIsCollection(data.itemType === "Minifigure collection");
      setName(data.minifigureName || "");
      setDescription(data.description || "");
      setCode(data.minifigureCode || "");
      setTheme(data.minifigureTheme || "");
      setCondition(data.condition || "Not sure");
      setStep(2);
      void complete("Add it to my Collection", data, false);
    } catch {
      setStep(2);
      setError("Atlas could not restore the saved minifigure. Please review it and try again.");
    }
  }, [resume]);

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#050912] text-white"><div className="mx-auto flex min-h-screen max-w-[760px] items-center px-5 py-16"><div className="w-full rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-8 text-center sm:p-12"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#e8c86a]/25 bg-[#e8c86a]/10 text-[#e8c86a]"><Check className="h-8 w-8" /></span><p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Atlas</p><h1 className="mt-2 text-3xl font-black">Atlas has enough to continue</h1><p className="mx-auto mt-3 max-w-lg leading-7 text-white/48">Choose what you want to do with this minifigure.</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><button disabled={saving} onClick={() => complete("Add it to my Collection")} className="h-12 rounded-xl border border-white/12 px-5 font-bold text-white/80">Add to Collection</button><button disabled={saving} onClick={() => complete("List it on the Marketplace")} className="h-12 rounded-xl border border-white/12 px-5 font-bold text-white/80">List on Marketplace</button></div></div></div></main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <header className="border-b border-white/[0.06] bg-[#050912]/90"><div className="mx-auto flex h-20 max-w-[980px] items-center justify-between px-5 lg:px-10"><Link href="/" className="flex items-center gap-3 font-black"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a]"><Boxes className="h-5 w-5" /></span>TBX</Link><Link href="/value" className="inline-flex items-center gap-2 text-sm font-bold text-white/55"><ArrowLeft className="h-4 w-4" /> Change what I have</Link></div></header>
      <section className="relative overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(232,200,106,0.12),transparent_34rem)]" /><div className="relative mx-auto max-w-[760px] px-5 py-12 sm:py-16 lg:px-10">
        <div className="mb-7 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-[#e8c86a]" style={{ width: `${progress}%` }} /></div><span className="text-xs font-bold text-white/35">{step + 1} / 3</span></div>
        <div className="mb-8"><div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]"><Sparkles className="h-3.5 w-3.5" /> Atlas</div><h1 className="mt-4 text-4xl font-black leading-[0.98] tracking-[-0.055em] sm:text-5xl">{heading}</h1><p className="mt-4 text-base leading-7 text-white/48">You already chose Minifigures. Atlas only asks for information that helps identify or value it.</p></div>
        <div className="rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-5 sm:p-8">
          {step === 0 ? <div className="space-y-5"><div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-[#050912] p-4"><div><p className="font-bold">Valuing several figures?</p><p className="mt-1 text-sm text-white/40">Leave this off for one minifigure.</p></div><button type="button" onClick={() => setIsCollection((value) => !value)} className={`rounded-full border px-4 py-2 text-sm font-bold ${isCollection ? "border-[#e8c86a]/50 bg-[#e8c86a]/10 text-[#e8c86a]" : "border-white/10 text-white/55"}`}>{isCollection ? "Collection" : "One figure"}</button></div><label className="block"><span className="text-sm font-bold text-white/70">Do you know who it is? <span className="font-normal text-white/30">Optional</span></span><input value={name} onChange={(e) => { setName(e.target.value); setSelectedMatch(null); }} placeholder="Character or minifigure name" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white" /></label><label className="block"><span className="text-sm font-bold text-white/70">Describe what you can see</span><textarea value={description} onChange={(e) => { setDescription(e.target.value); setSelectedMatch(null); }} rows={4} placeholder="Helmet or hair, colours, torso printing, cape, accessories..." className="mt-2 w-full rounded-xl border border-white/10 bg-[#050912] px-4 py-3 text-white" /></label><details className="rounded-xl border border-white/[0.08] bg-[#050912] p-4"><summary className="cursor-pointer text-sm font-bold text-white/60">I know the code or theme</summary><div className="mt-4 grid gap-4 sm:grid-cols-2"><input value={code} onChange={(e) => { setCode(e.target.value); setSelectedMatch(null); }} placeholder="Code, e.g. sw0636" className="h-12 rounded-xl border border-white/10 bg-[#09111f] px-4 text-white" /><input value={theme} onChange={(e) => { setTheme(e.target.value); setSelectedMatch(null); }} placeholder="Theme or series" className="h-12 rounded-xl border border-white/10 bg-[#09111f] px-4 text-white" /></div></details></div> : null}
          {step === 1 ? <div className="grid gap-3 sm:grid-cols-2">{conditions.map((value) => <button key={value} onClick={() => setCondition(value)} className={`w-full rounded-2xl border p-4 text-left font-bold ${condition === value ? "border-[#e8c86a]/55 bg-[#e8c86a]/10" : "border-white/10 bg-[#050912]"}`}>{value}</button>)}</div> : null}
          {step === 2 ? <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#e8c86a]">What Atlas heard</p><div className="mt-4 rounded-2xl border border-white/[0.08] bg-[#050912] p-5 text-sm leading-6"><div className="flex justify-between gap-6"><span className="text-white/35">Type</span><span className="font-bold text-white/85">{itemType}</span></div><div className="mt-3 flex justify-between gap-6"><span className="text-white/35">Condition</span><span className="font-bold text-white/85">{condition}</span></div></div>{description ? <p className="mt-4 rounded-2xl border border-white/[0.08] bg-[#050912] p-5 text-sm leading-6 text-white/55">{description}</p> : null}<AtlasIdentificationPanel loose={false} minifigure query={query} weightKg={null} onWeightChange={() => undefined} selected={selectedMatch} onSelect={setSelectedMatch} /></div> : null}
          {error ? <p role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-200">{error}</p> : null}
          <div className="mt-7 flex items-center gap-3 border-t border-white/[0.07] pt-6">{step > 0 ? <button disabled={saving} onClick={() => setStep((value) => value - 1)} className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 px-5 font-bold text-white/60"><ArrowLeft className="h-4 w-4" /> Back</button> : null}{step < 2 ? <button disabled={!canContinue || saving} onClick={() => { setError(null); setStep((value) => value + 1); }} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8c86a] px-5 font-black text-[#050912] disabled:opacity-35">Continue <ArrowRight className="h-4 w-4" /></button> : <button disabled={saving} onClick={() => complete("I am just checking the value")} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8c86a] px-5 font-black text-[#050912] disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Continue with Atlas <ArrowRight className="h-4 w-4" /></button>}</div>
        </div>
      </div></section>
    </main>
  );
}
