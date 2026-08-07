"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Boxes, Check, ImagePlus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ListingDraft = {
  title?: string;
  condition?: string;
  included?: string;
  description?: string;
  price?: string;
  delivery?: string;
  itemKind?: string;
};

const stages = ["Confirm", "Photos", "Delivery", "Preview"];
const money = (value: number) => `R${Math.round(value || 0).toLocaleString("en-ZA")}`;

export default function AtlasSellPage() {
  const [stage, setStage] = useState(0);
  const [draft, setDraft] = useState<ListingDraft>({ delivery: "Seller ships" });
  const [atlasPrice, setAtlasPrice] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("tbx-listing-draft");
    if (saved) {
      try {
        const restored = JSON.parse(saved) as ListingDraft;
        setDraft({ delivery: "Seller ships", ...restored });
        const initialPrice = Number(restored.price || 0);
        setAtlasPrice(Number.isFinite(initialPrice) && initialPrice > 0 ? initialPrice : null);
      } catch {
        // Leave the route usable even if an old local draft is malformed.
      }
    }
    createClient().auth.getUser().then(({ data }) => {
      setSignedIn(Boolean(data.user));
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("tbx-listing-draft", JSON.stringify(draft));
  }, [draft, ready]);

  const price = Number(draft.price || 0);
  const fee = price * 0.1;
  const payout = Math.max(0, price - fee);

  function update(field: keyof ListingDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function publish() {
    if (!signedIn) {
      window.location.href = `/sign-in?next=${encodeURIComponent("/sell/atlas?publish=1")}`;
      return;
    }
    window.localStorage.setItem("tbx-listing-ready-to-publish", "true");
    alert("Your listing draft is complete. The final marketplace database publish action is the next integration step.");
  }

  const canContinue = stage !== 0 || Boolean(draft.title?.trim() && price > 0);

  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-20 max-w-[980px] items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 font-black"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a]"><Boxes className="h-5 w-5" /></span>TBX</Link>
          <Link href="/value" className="inline-flex items-center gap-2 text-sm font-bold text-white/55"><ArrowLeft className="h-4 w-4" /> Back to Value</Link>
        </div>
      </header>

      <section className="mx-auto max-w-[900px] px-5 py-12 lg:px-10">
        <div className="mb-8 flex items-center gap-3">
          {stages.map((label, index) => <div key={label} className="flex flex-1 items-center gap-2"><span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${index <= stage ? "bg-[#e8c86a] text-[#050912]" : "bg-white/[0.07] text-white/30"}`}>{index + 1}</span><span className={`hidden text-xs font-bold sm:block ${index <= stage ? "text-white/75" : "text-white/25"}`}>{label}</span>{index < stages.length - 1 ? <span className="h-px flex-1 bg-white/10" /> : null}</div>)}
        </div>

        <div className="rounded-[2rem] border border-white/[0.09] bg-[#09111f] p-6 sm:p-9">
          {stage === 0 ? (
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e8c86a]"><Sparkles className="h-4 w-4" /> Atlas identified</div>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.045em]">Confirm the item and your price</h1>
              <p className="mt-3 leading-7 text-white/45">Atlas has already done the identification. Check the result, change the asking price if you want, then continue to the listing details.</p>

              <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.055] p-5">
                <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><Check className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">What Atlas found</p><h2 className="mt-1 text-2xl font-black">{draft.title || "Atlas item"}</h2><p className="mt-2 text-sm text-white/45">{draft.condition || "Condition not specified"}</p></div></div>
                {draft.description ? <p className="mt-5 whitespace-pre-line border-t border-white/[0.07] pt-4 text-sm leading-6 text-white/45">{draft.description}</p> : null}
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#050912] p-5">
                  <p className="text-sm text-white/40">Atlas value</p>
                  <p className="mt-2 text-3xl font-black">{atlasPrice ? money(atlasPrice) : "No price yet"}</p>
                  <p className="mt-2 text-xs leading-5 text-white/30">This is the value Atlas carried forward from identification. Your Marketplace asking price can be different.</p>
                </div>
                <label className="rounded-2xl border border-[#e8c86a]/25 bg-[#e8c86a]/[0.05] p-5">
                  <span className="text-sm font-bold text-white/65">Your listing price (ZAR)</span>
                  <input type="number" min="0" value={draft.price || ""} onChange={(event) => update("price", event.target.value)} placeholder="Enter price" className="mt-3 h-14 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-xl font-black text-white outline-none focus:border-[#e8c86a]/50" />
                  {atlasPrice && price !== atlasPrice ? <button type="button" onClick={() => update("price", String(atlasPrice))} className="mt-3 text-xs font-bold text-[#e8c86a]">Use Atlas value again</button> : null}
                </label>
              </div>

              {price > 0 ? <div className="mt-5 grid gap-3 sm:grid-cols-3"><Summary label="Asking price" value={money(price)} /><Summary label="TBX fee (10%)" value={`-${money(fee)}`} /><Summary label="Estimated payout" value={money(payout)} highlight /></div> : null}
            </div>
          ) : null}

          {stage === 1 ? (
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e8c86a]"><ImagePlus className="h-4 w-4" /> Photos</div>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.045em]">Show buyers the actual item</h1>
              <p className="mt-3 text-white/45">The identity and description are already saved from Atlas. Add photos next; you should not need to describe the item again.</p>
              <div className="mt-7 rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/35">Photo upload connection coming next. The Atlas listing draft is already saved.</div>
            </div>
          ) : null}

          {stage === 2 ? (
            <div>
              <h1 className="text-4xl font-black tracking-[-0.045em]">How should the buyer receive it?</h1>
              <label className="mt-7 block"><span className="text-sm font-bold text-white/65">Delivery option</span><select value={draft.delivery || "Seller ships"} onChange={(event) => update("delivery", event.target.value)} className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white outline-none"><option>Seller ships</option><option>Collection only</option><option>TBX-managed delivery</option></select></label>
            </div>
          ) : null}

          {stage === 3 ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e8c86a]">Listing preview</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-4xl font-black tracking-[-0.045em]">{draft.title || "Atlas item"}</h1><p className="mt-2 text-white/45">{draft.condition}</p></div><p className="text-4xl font-black text-[#e8c86a]">{money(price)}</p></div>
              <div className="mt-7 grid gap-3 sm:grid-cols-3"><Summary label="Identified by" value="Atlas" /><Summary label="Delivery" value={draft.delivery || "Seller ships"} /><Summary label="Estimated payout" value={money(payout)} highlight /></div>
              {draft.description ? <p className="mt-6 whitespace-pre-line rounded-2xl border border-white/[0.08] bg-[#050912] p-5 text-sm leading-7 text-white/50">{draft.description}</p> : null}
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between border-t border-white/[0.07] pt-6">
            <button type="button" onClick={() => setStage((value) => Math.max(0, value - 1))} disabled={stage === 0} className="rounded-xl border border-white/10 px-5 py-3 font-bold disabled:opacity-30">Back</button>
            {stage < 3 ? <button type="button" disabled={!canContinue} onClick={() => setStage((value) => Math.min(3, value + 1))} className="inline-flex items-center gap-2 rounded-xl bg-[#e8c86a] px-6 py-3 font-black text-[#050912] disabled:opacity-40">Continue <ArrowRight className="h-4 w-4" /></button> : <button type="button" disabled={!ready} onClick={publish} className="inline-flex items-center gap-2 rounded-xl bg-[#e8c86a] px-6 py-3 font-black text-[#050912] disabled:opacity-40">{signedIn ? "Finish publishing" : "Sign in to publish"} <Check className="h-4 w-4" /></button>}
          </div>
        </div>
      </section>
    </main>
  );
}

function Summary({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <div className={`rounded-2xl border p-4 ${highlight ? "border-[#e8c86a]/25 bg-[#e8c86a]/[0.07]" : "border-white/10 bg-white/[0.025]"}`}><p className="text-xs text-white/35">{label}</p><p className={`mt-2 font-black ${highlight ? "text-[#e8c86a]" : "text-white"}`}>{value}</p></div>;
}
