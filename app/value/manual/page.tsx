"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Boxes, Check, Loader2, Scale, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type IntakeType = "mixed" | "minifigures" | "instructions" | "unknown";

type ManualDraft = {
  itemType?: string;
  weight?: string;
  weightUnit?: string;
  condition?: string;
  description?: string;
  intent?: string;
  minifigureName?: string;
  minifigureCode?: string;
  minifigureTheme?: string;
};

const unknownTypes = [
  "Mixed box of LEGO",
  "Loose bricks and parts",
  "Single minifigure",
  "Minifigure collection",
  "Incomplete or unknown sets",
  "Instructions or boxes",
  "Other LEGO collection",
];

const flowCopy: Record<IntakeType, { eyebrow: string; title: string; description: string }> = {
  mixed: {
    eyebrow: "Value · Loose LEGO",
    title: "Tell Atlas about your loose LEGO",
    description: "A rough description is enough to start. Atlas only asks for details that can improve the valuation.",
  },
  minifigures: {
    eyebrow: "Value · Minifigures",
    title: "Tell Atlas about your minifigure",
    description: "Do not worry if you do not know the character or code. Describe what you can see and Atlas can work from there.",
  },
  instructions: {
    eyebrow: "Value · Instructions & boxes",
    title: "Tell Atlas what you have",
    description: "Describe the manuals, boxes or packaging you want to value. Set details are optional if you do not know them.",
  },
  unknown: {
    eyebrow: "Value · Not sure",
    title: "Let Atlas narrow it down",
    description: "Start with the closest description. You do not need a catalogue match, set number or photo to continue.",
  },
};

function manualIdentity(data: ManualDraft) {
  const isMinifigure = data.itemType === "Single minifigure" || data.itemType === "Minifigure collection";
  if (isMinifigure) {
    const name = data.minifigureName?.trim() || data.itemType || "LEGO minifigure";
    const code = data.minifigureCode?.trim().toUpperCase() || "MINIFIG";
    return {
      setNumber: code,
      setName: name,
      theme: data.minifigureTheme?.trim() || "Minifigures",
      isMinifigure: true,
    };
  }

  return {
    setNumber: "MANUAL",
    setName: data.itemType || "Manual LEGO collection",
    theme: "Loose LEGO",
    isMinifigure: false,
  };
}

function choiceClass(active: boolean) {
  return `rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
    active
      ? "border-[#e8c86a]/55 bg-[#e8c86a]/10 text-[#f0d374]"
      : "border-white/10 bg-[#050912] text-white/62 hover:border-white/20 hover:text-white"
  }`;
}

export default function ManualValuePage() {
  const router = useRouter();
  const [flow, setFlow] = useState<IntakeType>("unknown");
  const [itemType, setItemType] = useState("Other LEGO collection");
  const [submitted, setSubmitted] = useState(false);
  const [savedIntent, setSavedIntent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("type");
    const nextFlow: IntakeType = requested === "mixed" || requested === "minifigures" || requested === "instructions" ? requested : "unknown";
    setFlow(nextFlow);
    setItemType(
      nextFlow === "mixed"
        ? "Mixed box of LEGO"
        : nextFlow === "minifigures"
          ? "Single minifigure"
          : nextFlow === "instructions"
            ? "Instructions or boxes"
            : "Other LEGO collection",
    );
  }, []);

  const copy = flowCopy[flow];
  const isMinifigure = itemType === "Single minifigure" || itemType === "Minifigure collection";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as ManualDraft;
    window.localStorage.setItem("tbx-manual-lego-draft", JSON.stringify(data));
    setSavedIntent(data.intent ?? "");

    const identity = manualIdentity(data);
    const weight = data.weight ? `${data.weight} ${data.weightUnit ?? "kg"}` : "";
    const listingTitle = identity.isMinifigure
      ? [identity.setNumber !== "MINIFIG" ? identity.setNumber : "", identity.setName].filter(Boolean).join(" · ")
      : [data.itemType, weight].filter(Boolean).join(" · ");
    const listingDescription = [
      data.description,
      data.condition ? `Overall condition: ${data.condition}` : "",
      weight ? `Approximate weight: ${weight}` : "",
      identity.isMinifigure && identity.theme ? `Theme or series: ${identity.theme}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      if (data.intent === "Add it to my Collection") {
        const supabase = createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          window.localStorage.setItem("tbx-manual-collection-pending", JSON.stringify(data));
          router.push(`/sign-in?next=${encodeURIComponent("/value/manual?resume=collection")}`);
          return;
        }

        const { data: asset, error: insertError } = await supabase
          .from("assets")
          .insert({
            owner_id: userData.user.id,
            lego_set_id: null,
            set_number: identity.setNumber,
            set_name: identity.setName,
            theme: identity.theme,
            condition: data.condition || "Unknown",
            sealed: false,
            passport_status: "Draft",
            is_public: false,
            notes: listingDescription || null,
          })
          .select("id")
          .single();

        if (insertError || !asset) throw insertError ?? new Error("The collection record could not be created.");
        router.push(`/collection/${asset.id}`);
        router.refresh();
        return;
      }

      if (data.intent === "List it on the Marketplace") {
        window.localStorage.setItem(
          "tbx-listing-draft",
          JSON.stringify({
            title: listingTitle,
            condition: data.condition ?? "Not sure",
            included: data.itemType ?? "Mixed LEGO collection",
            description: listingDescription,
            price: "",
            delivery: "Seller ships",
            itemKind: identity.isMinifigure ? "minifigure" : "manual",
          }),
        );
        router.push("/sell/create?source=manual");
        return;
      }

      setSubmitted(true);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "TBX could not save this item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <header className="border-b border-white/[0.06] bg-[#050912]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1120px] items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 font-black tracking-[-0.04em]"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a]"><Boxes className="h-5 w-5" /></span>TBX</Link>
          <Link href="/value" className="inline-flex items-center gap-2 text-sm font-bold text-white/55 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Change what I have</Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(232,200,106,0.12),transparent_34rem)]" />
        <div className="relative mx-auto max-w-[820px] px-5 py-14 sm:py-20 lg:px-10">
          {submitted ? (
            <div className="rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-8 text-center shadow-[0_40px_120px_rgba(0,0,0,0.48)] sm:p-12">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"><Check className="h-8 w-8" /></span>
              <h1 className="mt-6 text-3xl font-black tracking-[-0.04em]">Atlas has your description</h1>
              <p className="mx-auto mt-3 max-w-md leading-7 text-white/45">The details are saved and ready for the next TBX action.</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={() => setSubmitted(false)} className="inline-flex h-12 items-center justify-center rounded-xl border border-white/12 px-5 font-bold text-white/75">Edit</button><Link href={savedIntent === "Add it to my Collection" ? "/collection" : "/value"} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#e8c86a] px-5 font-bold text-[#050912]">Continue <ArrowRight className="h-4 w-4" /></Link></div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]"><Sparkles className="h-3.5 w-3.5" /> {copy.eyebrow}</div>
                <h1 className="mt-4 text-4xl font-black leading-[0.98] tracking-[-0.055em] sm:text-5xl">{copy.title}</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/48">{copy.description}</p>
                <p className="mt-2 text-sm text-white/30">Fill in what you know. Optional really means optional.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-7 rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.48)] sm:p-8">
                <input type="hidden" name="itemType" value={itemType} />

                {flow === "minifigures" ? (
                  <section>
                    <p className="text-sm font-bold text-white/72">Is it one minifigure or several?</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {["Single minifigure", "Minifigure collection"].map((option) => <button key={option} type="button" onClick={() => setItemType(option)} className={choiceClass(itemType === option)}>{option === "Single minifigure" ? "One minifigure" : "A collection"}</button>)}
                    </div>
                  </section>
                ) : null}

                {flow === "mixed" ? (
                  <section>
                    <p className="text-sm font-bold text-white/72">Which is closest?</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {["Mixed box of LEGO", "Loose bricks and parts", "Incomplete or unknown sets", "Other LEGO collection"].map((option) => <button key={option} type="button" onClick={() => setItemType(option)} className={choiceClass(itemType === option)}>{option}</button>)}
                    </div>
                  </section>
                ) : null}

                {flow === "instructions" ? (
                  <section>
                    <p className="text-sm font-bold text-white/72">What do you have?</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {["Instructions", "Boxes or packaging", "Instructions and boxes"].map((option) => <button key={option} type="button" onClick={() => setItemType("Instructions or boxes")} className={choiceClass(itemType === "Instructions or boxes")}>{option}</button>)}
                    </div>
                  </section>
                ) : null}

                {flow === "unknown" ? (
                  <label className="block"><span className="text-sm font-bold text-white/72">What sounds closest?</span><select value={itemType} onChange={(event) => setItemType(event.target.value)} className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white">{unknownTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
                ) : null}

                {isMinifigure ? (
                  <section className="space-y-5 border-t border-white/[0.07] pt-6">
                    <label className="block"><span className="text-sm font-bold text-white/70">Do you know who it is? <span className="font-normal text-white/30">Optional</span></span><input name="minifigureName" placeholder="Character, minifigure name, or leave blank" className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white placeholder:text-white/22" /></label>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block"><span className="text-sm font-bold text-white/70">Minifigure code <span className="font-normal text-white/30">Optional</span></span><input name="minifigureCode" placeholder="e.g. sw0636" className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white placeholder:text-white/22" /></label>
                      <label className="block"><span className="text-sm font-bold text-white/70">Theme or series <span className="font-normal text-white/30">Optional</span></span><input name="minifigureTheme" placeholder="e.g. Star Wars, CMF" className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white placeholder:text-white/22" /></label>
                    </div>
                    <label className="block"><span className="text-sm font-bold text-white/70">Describe anything you can see</span><textarea name="description" rows={4} placeholder="Helmet or hair, colours, torso printing, cape, accessories, weapon, cracks..." className="mt-2 w-full rounded-xl border border-white/10 bg-[#050912] px-4 py-3 text-white placeholder:text-white/22" /></label>
                    <label className="block"><span className="text-sm font-bold text-white/70">Condition</span><select name="condition" className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white"><option>Excellent</option><option>Good</option><option>Fair</option><option>Damaged or incomplete</option><option>Not sure</option></select></label>
                  </section>
                ) : (
                  <section className="space-y-5 border-t border-white/[0.07] pt-6">
                    {flow === "mixed" || flow === "unknown" ? (
                      <label className="block"><span className="flex items-center gap-2 text-sm font-bold text-white/70"><Scale className="h-4 w-4 text-[#e8c86a]" /> Rough quantity or weight <span className="font-normal text-white/30">Optional</span></span><div className="mt-2 flex"><input name="weight" type="number" min="0" step="0.1" placeholder="e.g. 8" className="h-13 min-w-0 flex-1 rounded-l-xl border border-white/10 bg-[#050912] px-4 text-white" /><select name="weightUnit" className="h-13 rounded-r-xl border border-l-0 border-white/10 bg-[#050912] px-3 text-white"><option>kg</option><option>g</option></select></div></label>
                    ) : null}
                    <label className="block"><span className="text-sm font-bold text-white/70">Tell Atlas anything useful</span><textarea name="description" rows={5} placeholder={flow === "instructions" ? "Set numbers if known, condition, manuals, box inserts, packaging, stickers..." : "Themes, recognisable sets, minifigures, colours, Technic pieces, instructions, anything unusual..."} className="mt-2 w-full rounded-xl border border-white/10 bg-[#050912] px-4 py-3 text-white placeholder:text-white/22" /></label>
                    <label className="block"><span className="text-sm font-bold text-white/70">Overall condition</span><select name="condition" className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white"><option>Mostly clean and usable</option><option>Mixed condition</option><option>Needs cleaning or sorting</option><option>Damaged or incomplete</option><option>Not sure</option></select></label>
                  </section>
                )}

                <label className="block border-t border-white/[0.07] pt-6"><span className="text-sm font-bold text-white/70">What should Atlas do next?</span><select name="intent" className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white"><option>I am just checking the value</option><option>Add it to my Collection</option><option>List it on the Marketplace</option></select></label>

                {error ? <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-200">{error}</p> : null}
                <button type="submit" disabled={saving} className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#e8c86a] px-7 font-black text-[#050912] transition hover:bg-[#f1d478] disabled:opacity-60">{saving ? <Loader2 className="h-5 w-5 animate-spin" /> : null}{saving ? "Working…" : "Get Atlas value"}{!saving ? <ArrowRight className="h-5 w-5" /> : null}</button>
                <p className="text-center text-xs leading-5 text-white/30">No photo is required to start. Atlas will ask for one later only if it genuinely helps identification or a Marketplace listing.</p>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
