"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Boxes, Check, LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Draft = {
  title: string;
  condition: string;
  included: string;
  description: string;
  price: string;
  delivery: string;
};

const emptyDraft: Draft = {
  title: "",
  condition: "Complete with box and instructions",
  included: "Original box, instructions and minifigures",
  description: "",
  price: "",
  delivery: "Seller ships",
};

const steps = ["Item", "Condition", "Photos", "Price", "Delivery", "Preview"];

export default function CreateListingPage() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("tbx-listing-draft");
    if (saved) setDraft({ ...emptyDraft, ...JSON.parse(saved) });
    createClient().auth.getUser().then(({ data }) => {
      setSignedIn(Boolean(data.user));
      setReady(true);
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem("tbx-listing-draft", JSON.stringify(draft));
  }, [draft]);

  const update = (field: keyof Draft, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const payout = useMemo(() => Math.max(0, Number(draft.price || 0) * 0.9), [draft.price]);

  function publish() {
    if (!signedIn) {
      window.location.href = `/sign-in?next=${encodeURIComponent("/sell/create?publish=1")}`;
      return;
    }
    window.localStorage.setItem("tbx-listing-ready-to-publish", "true");
    alert("Your listing draft is complete. The final marketplace database publish action is the next integration step.");
  }

  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 font-black"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a]"><Boxes className="h-5 w-5" /></span>TBX</Link>
          <Link href="/value" className="inline-flex items-center gap-2 text-sm font-bold text-white/55"><ArrowLeft className="h-4 w-4" /> Back to Value</Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-5 py-14 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">Create a listing</p>
        <h1 className="mt-4 text-5xl font-black tracking-[-0.055em]">Build everything first. Sign up only when you publish.</h1>

        <div className="mt-10 grid gap-2 sm:grid-cols-6">
          {steps.map((label, index) => <div key={label} className={`rounded-xl border px-3 py-3 text-center text-xs font-bold ${index <= step ? "border-[#e8c86a]/30 bg-[#e8c86a]/[0.08] text-[#e8c86a]" : "border-white/8 text-white/28"}`}>{index + 1}. {label}</div>)}
        </div>

        <div className="mt-8 rounded-[2rem] border border-white/[0.09] bg-[#09111f] p-6 sm:p-8">
          {step === 0 && <Field label="What are you selling?"><input value={draft.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. LEGO 10316 Rivendell or 8 kg mixed LEGO" className="input" /></Field>}
          {step === 1 && <><Field label="Condition"><select value={draft.condition} onChange={(e) => update("condition", e.target.value)} className="input"><option>New and sealed</option><option>Complete with box and instructions</option><option>Complete without box</option><option>Incomplete</option><option>Loose or mixed</option><option>Not sure</option></select></Field><Field label="What is included?"><textarea value={draft.included} onChange={(e) => update("included", e.target.value)} rows={4} className="input" /></Field></>}
          {step === 2 && <div><h2 className="text-3xl font-black">Photos</h2><p className="mt-3 text-white/45">Photos are not required for valuation, but they will be required before a marketplace listing can go live.</p><div className="mt-6 rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/35">Photo upload connection coming next. Your draft can continue without losing progress.</div><Field label="Seller description"><textarea value={draft.description} onChange={(e) => update("description", e.target.value)} rows={5} placeholder="Mention any marks, missing pieces or useful details." className="input" /></Field></div>}
          {step === 3 && <><Field label="Listing price (ZAR)"><input value={draft.price} onChange={(e) => update("price", e.target.value)} type="number" min="0" className="input" /></Field><div className="rounded-2xl border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] p-5"><p className="text-sm text-white/45">Estimated seller payout after an illustrative 10% fee</p><p className="mt-2 text-3xl font-black">R{payout.toLocaleString("en-ZA")}</p></div></>}
          {step === 4 && <Field label="Delivery option"><select value={draft.delivery} onChange={(e) => update("delivery", e.target.value)} className="input"><option>Seller ships</option><option>Collection only</option><option>TBX-managed delivery</option></select></Field>}
          {step === 5 && <div><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e8c86a]">Listing preview</p><h2 className="mt-2 text-3xl font-black">{draft.title || "Untitled listing"}</h2></div><p className="text-3xl font-black">R{Number(draft.price || 0).toLocaleString("en-ZA")}</p></div><div className="mt-7 grid gap-4 sm:grid-cols-3">{[["Condition", draft.condition],["Included", draft.included],["Delivery", draft.delivery]].map(([label,value]) => <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"><p className="text-xs uppercase tracking-wider text-white/30">{label}</p><p className="mt-2 font-bold">{value}</p></div>)}</div><p className="mt-6 leading-7 text-white/50">{draft.description || "No seller description added yet."}</p><div className="mt-8 rounded-2xl border border-white/10 bg-[#050912] p-5"><div className="flex items-center gap-3"><LockKeyhole className="h-5 w-5 text-[#e8c86a]" /><div><p className="font-bold">Publishing requires a free TBX account</p><p className="text-sm text-white/38">Your complete draft remains saved on this device.</p></div></div></div></div>}

          <div className="mt-8 flex items-center justify-between border-t border-white/[0.07] pt-6">
            <button onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0} className="rounded-xl border border-white/10 px-5 py-3 font-bold disabled:opacity-30">Back</button>
            {step < 5 ? <button onClick={() => setStep((value) => Math.min(5, value + 1))} className="inline-flex items-center gap-2 rounded-xl bg-[#e8c86a] px-5 py-3 font-bold text-[#050912]">Continue <ArrowRight className="h-4 w-4" /></button> : <button onClick={publish} disabled={!ready} className="inline-flex items-center gap-2 rounded-xl bg-[#e8c86a] px-6 py-3 font-bold text-[#050912] disabled:opacity-50">{signedIn ? "Finish publishing" : "Create account to publish"} <Check className="h-4 w-4" /></button>}
          </div>
        </div>
      </section>
      <style jsx>{`.input{margin-top:.5rem;width:100%;border-radius:.75rem;border:1px solid rgba(255,255,255,.1);background:#050912;padding:.9rem 1rem;color:white;outline:none}.input:focus{border-color:rgba(232,200,106,.45)}`}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mb-6 block"><span className="text-sm font-bold text-white/70">{label}</span>{children}</label>;
}
