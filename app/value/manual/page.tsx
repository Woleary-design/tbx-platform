"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Boxes, Check, Loader2, PackageOpen, Scale, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const itemTypes = [
  "Mixed box of LEGO",
  "Loose bricks and parts",
  "Single minifigure",
  "Minifigure collection",
  "Incomplete or unknown sets",
  "Instructions or boxes",
  "Other LEGO collection",
];

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

export default function ManualValuePage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [savedIntent, setSavedIntent] = useState("");
  const [itemType, setItemType] = useState(itemTypes[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <Link href="/value" className="inline-flex items-center gap-2 text-sm font-bold text-white/55 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Value</Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_10%,rgba(232,200,106,0.14),transparent_34rem)]" />
        <div className="relative mx-auto grid max-w-[1120px] gap-12 px-5 py-20 lg:grid-cols-[0.78fr_1.22fr] lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e8c86a]"><PackageOpen className="h-3.5 w-3.5" /> Atlas manual intake</div>
            <h1 className="mt-7 text-5xl font-black leading-[0.94] tracking-[-0.065em] sm:text-6xl">No set number?<span className="block text-[#e8c86a]">No problem.</span></h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/52">Add loose LEGO, mixed boxes or an individual minifigure. Atlas creates a usable collection identity even when there is no standard set record.</p>
            <div className="mt-8 space-y-3 text-sm text-white/48">{["Suitable for mixed boxes and spare parts", "Supports single minifigures and collections", "Can save directly into My Collection"].map((item) => <div key={item} className="flex items-center gap-3"><Check className="h-4 w-4 text-[#e8c86a]" />{item}</div>)}</div>
          </div>

          <div className="rounded-[2rem] border border-white/[0.09] bg-[#09111f]/95 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.48)] sm:p-8">
            {submitted ? (
              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <span className="grid h-16 w-16 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"><Check className="h-8 w-8" /></span>
                <h2 className="mt-6 text-3xl font-black tracking-[-0.04em]">Description saved</h2>
                <p className="mt-3 max-w-md leading-7 text-white/45">Your manual valuation details have been saved.</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => setSubmitted(false)} className="inline-flex h-12 items-center justify-center rounded-xl border border-white/12 px-5 font-bold text-white/75">Edit description</button><Link href={savedIntent === "Add it to my Collection" ? "/collection" : "/value"} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#e8c86a] px-5 font-bold text-[#050912]">Continue <ArrowRight className="h-4 w-4" /></Link></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Manual intake</p><h2 className="mt-2 text-3xl font-black tracking-[-0.045em]">Tell Atlas what you have</h2></div>
                <label className="block"><span className="text-sm font-bold text-white/70">What best describes it?</span><select name="itemType" required value={itemType} onChange={(event) => setItemType(event.target.value)} className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white">{itemTypes.map((item) => <option key={item}>{item}</option>)}</select></label>

                {isMinifigure ? (
                  <div className="rounded-2xl border border-[#e8c86a]/18 bg-[#e8c86a]/[0.04] p-5">
                    <div className="flex items-center gap-2 text-[#e8c86a]"><Sparkles className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[0.18em]">Atlas minifigure identity</p></div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="block sm:col-span-2"><span className="text-sm font-bold text-white/70">Character or minifigure name</span><input name="minifigureName" required placeholder="e.g. Darth Vader, Wolfpack Beastmaster" className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white placeholder:text-white/22" /></label>
                      <label className="block"><span className="text-sm font-bold text-white/70">Minifigure code</span><input name="minifigureCode" placeholder="Optional, e.g. sw0636" className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white placeholder:text-white/22" /></label>
                      <label className="block"><span className="text-sm font-bold text-white/70">Theme or series</span><input name="minifigureTheme" placeholder="e.g. Star Wars, CMF Series 27" className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white placeholder:text-white/22" /></label>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-white/35">The code is optional. Atlas will still create a searchable collection identity from the character name and theme.</p>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block"><span className="flex items-center gap-2 text-sm font-bold text-white/70"><Scale className="h-4 w-4 text-[#e8c86a]" /> Approximate weight</span><div className="mt-2 flex"><input name="weight" type="number" min="0" step="0.1" placeholder="e.g. 8" className="h-13 min-w-0 flex-1 rounded-l-xl border border-white/10 bg-[#050912] px-4 text-white" /><select name="weightUnit" className="h-13 rounded-r-xl border border-l-0 border-white/10 bg-[#050912] px-3 text-white"><option>kg</option><option>g</option></select></div></label>
                    <label className="block"><span className="text-sm font-bold text-white/70">Overall condition</span><select name="condition" className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white"><option>Mostly clean and usable</option><option>Mixed condition</option><option>Needs cleaning or sorting</option><option>Not sure</option></select></label>
                  </div>
                )}

                {isMinifigure ? <label className="block"><span className="text-sm font-bold text-white/70">Overall condition</span><select name="condition" className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white"><option>Excellent</option><option>Good</option><option>Fair</option><option>Damaged or incomplete</option><option>Not sure</option></select></label> : null}
                <label className="block"><span className="text-sm font-bold text-white/70">Anything notable?</span><textarea name="description" rows={5} placeholder={isMinifigure ? "Cape, accessories, cracks, printing condition, original packaging..." : "For example: mostly Technic pieces, around 40 minifigures, several instruction books..."} className="mt-2 w-full rounded-xl border border-white/10 bg-[#050912] px-4 py-3 text-white placeholder:text-white/22" /></label>
                <label className="block"><span className="text-sm font-bold text-white/70">What would you like to do?</span><select name="intent" className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-white"><option>List it on the Marketplace</option><option>Add it to my Collection</option><option>I am just checking the value</option></select></label>
                {error ? <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-200">{error}</p> : null}
                <button type="submit" disabled={saving} className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#e8c86a] px-7 font-bold text-[#050912] disabled:opacity-60">{saving ? <Loader2 className="h-5 w-5 animate-spin" /> : null}{saving ? "Saving…" : "Save and continue"}{!saving ? <ArrowRight className="h-5 w-5" /> : null}</button>
                <p className="text-center text-xs leading-5 text-white/30">Photos are not needed to create the collection record. They remain required before a Marketplace listing can be published.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
