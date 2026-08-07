"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Boxes, Check, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AtlasIdentificationPanel, type AtlasCandidate } from "./atlas-identification-panel";

type Draft = {
  itemType: "Instructions and boxes";
  condition: string;
  description: string;
  intent?: string;
  matchedSetId?: string;
  matchedSetNumber?: string;
  matchedName?: string;
  matchedTheme?: string | null;
  matchedConfidence?: number;
};

const DRAFT_KEY = "tbx-manual-lego-draft";
const PENDING_KEY = "tbx-manual-collection-pending";
const conditions = ["Excellent", "Good", "Mixed condition", "Damaged or incomplete", "Not sure"];

function assetCondition(condition: string) {
  if (condition === "Excellent" || condition === "Good") return "Used Complete";
  if (condition === "Damaged or incomplete") return "Used Incomplete";
  return "Unknown";
}

function errorMessage(value: unknown) {
  return value instanceof Error ? value.message : "TBX could not save this item.";
}

export function InstructionsValueClient({ resume }: { resume?: string }) {
  const router = useRouter();
  const resumed = useRef(false);
  const [step, setStep] = useState(0);
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("Not sure");
  const [selected, setSelected] = useState<AtlasCandidate | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = [reference, description].filter(Boolean).join(" ").trim();
  const heading = step === 0 ? "Tell Atlas about the instructions or box" : step === 1 ? "What condition is it in?" : "Atlas is matching it to a set";

  function buildDraft(intent?: string): Draft {
    return {
      itemType: "Instructions and boxes",
      condition,
      description: [reference ? `Set or theme reference: ${reference}` : "", description].filter(Boolean).join("\n\n"),
      intent,
      matchedSetId: selected?.id,
      matchedSetNumber: selected?.setNumber,
      matchedName: selected?.name,
      matchedTheme: selected?.theme,
      matchedConfidence: selected?.confidence,
    };
  }

  async function saveCollection(data: Draft, allowLogin = true) {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      if (!allowLogin) throw new Error("Your sign-in could not be confirmed. Please sign in again.");
      localStorage.setItem(PENDING_KEY, JSON.stringify(data));
      const next = "/value/manual?type=instructions&resume=collection";
      router.push(`/sign-in?next=${encodeURIComponent(next)}`);
      return;
    }

    const setNumber = data.matchedSetNumber || "ACCESSORY";
    const setName = data.matchedName ? `${data.matchedName} — instructions / box` : "LEGO instructions / box";
    const notes = [data.description, data.matchedSetNumber ? `Matched underlying set: ${data.matchedSetNumber} · ${data.matchedName ?? ""}` : ""].filter(Boolean).join("\n\n");
    const { data: asset, error: insertError } = await supabase.from("assets").insert({
      owner_id: auth.user.id,
      lego_set_id: data.matchedSetId ?? null,
      set_number: setNumber,
      set_name: setName,
      theme: data.matchedTheme || "Instructions & boxes",
      condition: assetCondition(data.condition),
      sealed: false,
      estimated_value: null,
      passport_status: "Draft",
      is_public: false,
      notes: notes || null,
    }).select("id").single();
    if (insertError || !asset) throw insertError ?? new Error("The collection record could not be created.");
    localStorage.removeItem(PENDING_KEY);
    router.push(`/collection/${asset.id}`);
    router.refresh();
  }

  async function complete(intent: "collection" | "sell" | "draft", override?: Draft, allowLogin = true) {
    setSaving(true);
    setError(null);
    const data = override ?? buildDraft(intent);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    try {
      if (intent === "collection") {
        await saveCollection(data, allowLogin);
        return;
      }
      if (intent === "sell") {
        localStorage.setItem("tbx-listing-draft", JSON.stringify({
          title: data.matchedName ? `${data.matchedName} — instructions / box` : "LEGO instructions / box",
          condition: data.condition,
          included: "Instructions and boxes",
          description: data.description,
          price: "",
          delivery: "Seller ships",
          itemKind: "manual",
        }));
        router.push("/sell/atlas");
        return;
      }
      setSubmitted(true);
    } catch (caught) {
      setError(errorMessage(caught));
      setSubmitted(false);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (resume !== "collection" || resumed.current) return;
    resumed.current = true;
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as Draft;
      setDescription(data.description || "");
      setCondition(data.condition || "Not sure");
      setStep(2);
      void complete("collection", data, false);
    } catch {
      setError("Atlas could not restore the saved item.");
    }
  }, [resume]);

  if (submitted) {
    return <main className="min-h-screen bg-[#050912] text-white"><div className="mx-auto flex min-h-screen max-w-[760px] items-center px-5 py-16"><div className="w-full rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-8 text-center sm:p-12"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#e8c86a]/25 bg-[#e8c86a]/10 text-[#e8c86a]"><Check className="h-8 w-8" /></span><p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Atlas</p><h1 className="mt-2 text-3xl font-black">Atlas has what it needs</h1><div className="mt-8 grid gap-3 sm:grid-cols-2"><button onClick={() => complete("collection")} className="h-12 rounded-xl border border-white/12 font-bold">Add to Collection</button><button onClick={() => complete("sell")} className="h-12 rounded-xl border border-white/12 font-bold">List on Marketplace</button></div></div></div></main>;
  }

  return <main className="min-h-screen bg-[#050912] text-white"><header className="border-b border-white/[0.06]"><div className="mx-auto flex h-20 max-w-[900px] items-center justify-between px-5"><Link href="/" className="flex items-center gap-3 font-black"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a]"><Boxes className="h-5 w-5" /></span>TBX</Link><Link href="/value" className="inline-flex items-center gap-2 text-sm font-bold text-white/55"><ArrowLeft className="h-4 w-4" /> Back to Value</Link></div></header><section><div className="mx-auto max-w-[760px] px-5 py-12 sm:py-16"><div className="mb-7 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-[#e8c86a]" style={{ width: `${((step + 1) / 3) * 100}%` }} /></div><span className="text-xs font-bold text-white/35">{step + 1} / 3</span></div><div className="mb-8"><div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]"><Sparkles className="h-3.5 w-3.5" /> Atlas</div><h1 className="mt-4 text-4xl font-black sm:text-5xl">{heading}</h1></div><div className="rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-5 sm:p-8">
    {step === 0 ? <div className="space-y-5"><label className="block"><span className="text-sm font-bold text-white/70">Set number, theme or name <span className="font-normal text-white/30">Optional</span></span><input value={reference} onChange={(e) => { setReference(e.target.value); setSelected(null); }} placeholder="e.g. 10294, Titanic, Star Wars" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white" /></label><label className="block"><span className="text-sm font-bold text-white/70">Anything else Atlas should know?</span><textarea value={description} onChange={(e) => { setDescription(e.target.value); setSelected(null); }} rows={4} placeholder="Box only, instruction booklet, inserts, condition..." className="mt-2 w-full rounded-xl border border-white/10 bg-[#050912] px-4 py-3 text-white" /></label></div> : null}
    {step === 1 ? <div className="grid gap-3 sm:grid-cols-2">{conditions.map((value) => <button key={value} onClick={() => setCondition(value)} className={`rounded-2xl border p-4 text-left font-bold ${condition === value ? "border-[#e8c86a]/55 bg-[#e8c86a]/10" : "border-white/10 bg-[#050912]"}`}>{value}</button>)}</div> : null}
    {step === 2 ? <div><div className="rounded-2xl border border-white/[0.08] bg-[#050912] p-5"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#e8c86a]">Instructions / box</p><p className="mt-2 text-sm text-white/55">{reference || description || "Atlas will save this as an instructions / box record."}</p></div><AtlasIdentificationPanel loose={false} minifigure={false} query={query} selected={selected} onSelect={setSelected} /></div> : null}
    {error ? <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-200">{error}</p> : null}
    <div className="mt-7 flex gap-3 border-t border-white/[0.07] pt-6">{step > 0 ? <button onClick={() => setStep((v) => v - 1)} className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 px-5 font-bold text-white/60"><ArrowLeft className="h-4 w-4" /> Back</button> : null}{step < 2 ? <button disabled={step === 0 && !reference.trim() && !description.trim()} onClick={() => setStep((v) => v + 1)} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8c86a] px-5 font-black text-[#050912] disabled:opacity-35">Continue <ArrowRight className="h-4 w-4" /></button> : <button disabled={saving} onClick={() => complete("draft")} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8c86a] px-5 font-black text-[#050912]">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Continue with Atlas <ArrowRight className="h-4 w-4" /></button>}</div>
  </div></div></section></main>;
}
