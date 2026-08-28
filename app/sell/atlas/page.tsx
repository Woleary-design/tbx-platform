"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Boxes, Check, ImagePlus, Loader2, Sparkles, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ListingDraft = {
  title?: string;
  condition?: string;
  included?: string;
  description?: string;
  price?: string;
  delivery?: string;
  itemKind?: string;
  legoMinifigureId?: string | null;
  atlasLow?: number | null;
  atlasRecommended?: number | null;
  atlasHigh?: number | null;
  atlasEvidenceCount?: number | null;
  atlasBasis?: string | null;
};

type MinifigureQuote = { status?: string; low?: number | null; recommended?: number | null; high?: number | null; evidenceCount?: number | null; basis?: string | null };
const stages = ["Confirm", "Details", "Delivery", "Preview"];
const money = (value: number) => `R${Math.round(value || 0).toLocaleString("en-ZA")}`;

export default function AtlasSellPage() {
  const [stage, setStage] = useState(0);
  const [draft, setDraft] = useState<ListingDraft>({ delivery: "Seller ships" });
  const [atlasPrice, setAtlasPrice] = useState<number | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingChecked, setPricingChecked] = useState(false);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("tbx-listing-draft");
    if (saved) try { const restored = JSON.parse(saved) as ListingDraft; setDraft({ delivery: "Seller ships", ...restored }); const initialPrice = Number(restored.atlasRecommended ?? restored.price ?? 0); setAtlasPrice(Number.isFinite(initialPrice) && initialPrice > 0 ? initialPrice : null); } catch {}
    createClient().auth.getUser().then(({ data }) => { setSignedIn(Boolean(data.user)); setReady(true); });
  }, []);
  useEffect(() => { if (ready) window.localStorage.setItem("tbx-listing-draft", JSON.stringify(draft)); }, [draft, ready]);
  useEffect(() => {
    if (!ready || pricingChecked || draft.itemKind !== "minifigure" || !draft.legoMinifigureId) return;
    if (draft.atlasRecommended && draft.atlasRecommended > 0) { setAtlasPrice(draft.atlasRecommended); if (!draft.price) setDraft((c) => ({ ...c, price: String(c.atlasRecommended ?? "") })); setPricingChecked(true); return; }
    const controller = new AbortController(); setPricingLoading(true);
    void (async () => { try { const supabase = createClient(); const { data: figure } = await supabase.from("lego_minifigures").select("catalogue_id").eq("id", draft.legoMinifigureId).maybeSingle(); if (!figure?.catalogue_id) return; const response = await fetch(`/api/value/minifigure/${encodeURIComponent(figure.catalogue_id)}?condition=${encodeURIComponent(draft.condition || "Not sure")}`, { signal: controller.signal }); const payload = await response.json(); if (!response.ok) return; const quote = (payload?.quote ?? {}) as MinifigureQuote; const recommended = Number(quote.recommended ?? 0); if (quote.status !== "available" || !Number.isFinite(recommended) || recommended <= 0) return; setAtlasPrice(Math.round(recommended)); setDraft((c) => ({ ...c, price: c.price || String(Math.round(recommended)), atlasLow: quote.low ?? null, atlasRecommended: Math.round(recommended), atlasHigh: quote.high ?? null, atlasEvidenceCount: quote.evidenceCount ?? 0, atlasBasis: quote.basis ?? null })); } catch {} finally { if (!controller.signal.aborted) { setPricingLoading(false); setPricingChecked(true); } } })();
    return () => controller.abort();
  }, [ready, pricingChecked, draft.itemKind, draft.legoMinifigureId, draft.atlasRecommended, draft.condition, draft.price]);

  const price = Number(draft.price || 0); const fee = price * 0.1; const payout = Math.max(0, price - fee);
  function update(field: keyof ListingDraft, value: string) { setDraft((c) => ({ ...c, [field]: value })); }
  function publish() { if (!signedIn) { window.location.href = `/sign-in?next=${encodeURIComponent("/sell/atlas?publish=1")}`; return; } window.localStorage.setItem("tbx-listing-ready-to-publish", "true"); alert("Your listing draft is complete. The final marketplace database publish action is the next integration step."); }
  const canContinue = stage !== 0 || Boolean(draft.title?.trim() && price > 0);

  return <main className="min-h-screen bg-[#050912] text-white">
    <header className="border-b border-white/[0.06]"><div className="mx-auto flex h-20 max-w-[980px] items-center justify-between px-5 lg:px-10"><Link href="/" className="flex items-center gap-3 font-black"><span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/25 bg-[#09101d] text-emerald-300"><Boxes className="h-5 w-5" /></span>TBX</Link><Link href="/value" className="inline-flex items-center gap-2 text-sm font-bold text-white/55"><ArrowLeft className="h-4 w-4" /> Start over</Link></div></header>
    <section className="mx-auto max-w-[900px] px-4 py-7 sm:px-5 sm:py-10 lg:px-10">
      <div className="mb-6 flex items-center gap-2">{stages.map((label,index)=><div key={label} className="flex flex-1 items-center gap-2"><span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${index<=stage?"bg-emerald-400 text-[#050912]":"bg-white/[0.07] text-white/30"}`}>{index+1}</span><span className={`hidden text-xs font-bold sm:block ${index<=stage?"text-white/75":"text-white/25"}`}>{label}</span>{index<stages.length-1?<span className="h-px flex-1 bg-white/10"/>:null}</div>)}</div>
      <div className="rounded-[1.75rem] border border-emerald-400/15 bg-[#09111f] p-5 sm:p-8">
        {stage===0?<div>
          <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300"><Check className="h-6 w-6"/></span><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Atlas result</p><h1 className="mt-1 text-3xl font-black tracking-[-0.04em] sm:text-4xl">We found your set!</h1><p className="mt-2 text-sm text-white/45">Atlas has identified your LEGO item.</p></div></div>
          <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.045] p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Match confirmed</p><h2 className="mt-2 text-2xl font-black">{draft.title || "LEGO item"}</h2><p className="mt-2 text-sm text-white/45">{draft.condition || "Condition not specified"}</p></div>
          <div className="mt-6 border-t border-white/[0.07] pt-6"><div className="flex items-center gap-2"><Tag className="h-5 w-5 text-emerald-300"/><h2 className="text-2xl font-black">{atlasPrice ? "Set your price" : "Set your price"}</h2></div>
            {pricingLoading?<p className="mt-3 flex items-center gap-2 text-sm text-white/45"><Loader2 className="h-4 w-4 animate-spin"/> Checking for a suggested price…</p>:atlasPrice?<p className="mt-2 text-sm leading-6 text-white/45">Atlas suggests <strong className="text-white">{money(atlasPrice)}</strong>. Use it or choose the price that works for you.</p>:<p className="mt-2 text-sm leading-6 text-white/45">We don’t have enough local sales data yet to suggest a price. You’re in control — choose a fair price that works for you.</p>}
            <label className="mt-5 block"><span className="text-sm font-bold text-white/65">Your price (ZAR)</span><div className="mt-2 flex h-16 items-center rounded-2xl border border-white/10 bg-[#050912] px-4 focus-within:border-emerald-400/45"><span className="mr-2 text-xl font-black text-white/35">R</span><input type="number" min="0" value={draft.price||""} onChange={(e)=>update("price",e.target.value)} placeholder="e.g. 350" className="h-full min-w-0 flex-1 bg-transparent text-2xl font-black text-white outline-none placeholder:text-white/20"/><span className="text-xs font-bold text-white/30">ZAR</span></div>{atlasPrice&&price!==atlasPrice?<button type="button" onClick={()=>update("price",String(atlasPrice))} className="mt-3 text-xs font-bold text-emerald-300">Use Atlas suggestion</button>:null}</label>
          </div>
          {price>0?<div className="mt-5 grid gap-3 sm:grid-cols-3"><Summary label="Asking price" value={money(price)}/><Summary label="TBX fee (10%)" value={`-${money(fee)}`}/><Summary label="Estimated payout" value={money(payout)} highlight/></div>:null}
        </div>:null}
        {stage===1?<div><div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300"><ImagePlus className="h-4 w-4"/> Listing details</div><h1 className="mt-3 text-3xl font-black">Quick check</h1><p className="mt-3 text-white/45">Atlas already knows the item. Confirm the condition and continue — no technical description needed.</p><label className="mt-6 block"><span className="text-sm font-bold text-white/65">Condition</span><select value={draft.condition||"Not sure"} onChange={(e)=>update("condition",e.target.value)} className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white outline-none"><option>Not sure</option><option>New / sealed</option><option>Complete used</option><option>Incomplete</option></select></label></div>:null}
        {stage===2?<div><h1 className="text-3xl font-black">How should the buyer receive it?</h1><label className="mt-6 block"><span className="text-sm font-bold text-white/65">Delivery option</span><select value={draft.delivery||"Seller ships"} onChange={(e)=>update("delivery",e.target.value)} className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white outline-none"><option>Seller ships</option><option>Collection only</option><option>TBX-managed delivery</option></select></label></div>:null}
        {stage===3?<div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Listing preview</p><div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-black">{draft.title||"Atlas item"}</h1><p className="mt-2 text-white/45">{draft.condition}</p></div><p className="text-4xl font-black text-emerald-300">{money(price)}</p></div><div className="mt-7 grid gap-3 sm:grid-cols-3"><Summary label="Identified by" value="Atlas"/><Summary label="Delivery" value={draft.delivery||"Seller ships"}/><Summary label="Estimated payout" value={money(payout)} highlight/></div></div>:null}
        <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-5">{stage===0?<Link href="/value" className="px-2 py-3 text-sm font-bold text-white/45 hover:text-white">Start over</Link>:<button type="button" onClick={()=>setStage((v)=>Math.max(0,v-1))} className="rounded-xl border border-white/10 px-5 py-3 font-bold">Back</button>}{stage<3?<button type="button" disabled={!canContinue} onClick={()=>setStage((v)=>Math.min(3,v+1))} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 font-black text-[#050912] disabled:opacity-40 sm:flex-none">{stage===0?"Continue to listing":"Continue"}<ArrowRight className="h-4 w-4"/></button>:<button type="button" disabled={!ready} onClick={publish} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 font-black text-[#050912] disabled:opacity-40 sm:flex-none">{signedIn?"Finish publishing":"Sign in to publish"}<Check className="h-4 w-4"/></button>}</div>
      </div>
    </section>
  </main>;
}

function Summary({label,value,highlight=false}:{label:string;value:string;highlight?:boolean}){return <div className={`rounded-2xl border p-4 ${highlight?"border-emerald-400/25 bg-emerald-400/[0.07]":"border-white/10 bg-white/[0.025]"}`}><p className="text-xs text-white/35">{label}</p><p className={`mt-2 font-black ${highlight?"text-emerald-300":"text-white"}`}>{value}</p></div>}
