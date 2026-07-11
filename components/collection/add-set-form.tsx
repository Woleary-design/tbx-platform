"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, Check, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LegoCatalogueSet } from "@/lib/lego/catalog";
import { createClient } from "@/lib/supabase/client";

type CatalogueSearchResult = LegoCatalogueSet & {
  id?: string;
  subtheme?: string | null;
  pieces?: number | null;
  minifigures?: number | null;
  imageUrl?: string | null;
};

const itemConditions = [
  { value: "New Sealed", label: "New — factory sealed" },
  { value: "New Open Box", label: "New — opened box" },
  { value: "Built / Displayed", label: "Built / displayed" },
  { value: "Unknown", label: "Not sure" },
];

const completenessOptions = [
  { value: "complete", label: "Build complete" },
  { value: "missing", label: "Missing pieces" },
  { value: "unchecked", label: "Not checked" },
];

export function AddSetForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"catalogue" | "manual">("catalogue");
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<CatalogueSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSet, setSelectedSet] = useState<CatalogueSearchResult | null>(null);
  const [itemCondition, setItemCondition] = useState("Built / Displayed");
  const [completeness, setCompleteness] = useState("complete");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cleanQuery = query.trim();

    if (mode !== "catalogue" || selectedSet || cleanQuery.length < 2) {
      setMatches([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);

      try {
        const response = await fetch(`/api/catalogue/search?q=${encodeURIComponent(cleanQuery)}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Catalogue search is temporarily unavailable.");

        const payload = (await response.json()) as { results?: CatalogueSearchResult[] };
        setMatches(payload.results ?? []);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") return;
        setMatches([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [mode, query, selectedSet]);

  function chooseSet(set: CatalogueSearchResult) {
    setSelectedSet(set);
    setQuery(`${set.setNumber} · ${set.name}`);
    setMatches([]);
  }

  function switchMode(nextMode: "catalogue" | "manual") {
    setMode(nextMode);
    setSelectedSet(null);
    setQuery("");
    setMatches([]);
    setError(null);
  }

  async function uploadPhotos(files: File[], userId: string, assetId: string) {
    const supabase = createClient();

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${assetId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("Asset-images")
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { error: evidenceError } = await supabase.from("asset_evidence").insert({
        asset_id: assetId,
        owner_id: userId,
        evidence_type: index === 0 ? "Front Photo" : "Other",
        storage_bucket: "Asset-images",
        storage_path: path,
      });

      if (evidenceError) throw evidenceError;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const form = new FormData(event.currentTarget);
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("Your session expired. Please sign in again.");
      }

      if (mode === "catalogue" && !selectedSet) {
        throw new Error("Select a LEGO set from the dropdown, or choose Add manually.");
      }

      const setNumber = mode === "catalogue"
        ? selectedSet!.setNumber
        : String(form.get("set_number") || "").trim();
      const setName = mode === "catalogue"
        ? selectedSet!.name
        : String(form.get("set_name") || "").trim();
      const theme = mode === "catalogue"
        ? selectedSet!.theme
        : String(form.get("theme") || "").trim();

      if (!setNumber || !setName) {
        throw new Error("Add a set number and product name before saving.");
      }

      const estimatedValueRaw = String(form.get("estimated_value") || "").trim();
      const purchasePriceRaw = String(form.get("purchase_price") || "").trim();
      const estimatedValue = estimatedValueRaw ? Number(estimatedValueRaw) : null;
      const purchasePrice = purchasePriceRaw ? Number(purchasePriceRaw) : null;
      const photos = form
        .getAll("photos")
        .filter((value): value is File => value instanceof File && value.size > 0);

      const missingCount = String(form.get("missing_piece_count") || "").trim();
      const missingDetails = String(form.get("missing_piece_details") || "").trim();
      const catalogueYear = mode === "catalogue" && selectedSet?.year
        ? `Catalogue year: ${selectedSet.year}`
        : "";
      const completenessNote = completeness === "complete"
        ? "Build completeness: Complete"
        : completeness === "missing"
          ? `Build completeness: Missing pieces${missingCount ? ` (${missingCount})` : ""}${missingDetails ? `. Missing: ${missingDetails}` : ""}`
          : "Build completeness: Not checked";
      const notes = [catalogueYear, completenessNote].filter(Boolean).join("\n");

      const databaseCondition = itemCondition === "New Sealed"
        ? "New Sealed"
        : itemCondition === "New Open Box"
          ? "New Open Box"
          : completeness === "complete"
            ? "Used Complete"
            : completeness === "missing"
              ? "Used Incomplete"
              : "Unknown";

      const { data: asset, error: insertError } = await supabase
        .from("assets")
        .insert({
          owner_id: userData.user.id,
          lego_set_id: selectedSet?.id ?? null,
          set_number: setNumber,
          set_name: setName,
          theme: theme || null,
          condition: databaseCondition,
          purchase_price: purchasePrice !== null && Number.isFinite(purchasePrice) ? purchasePrice : null,
          estimated_value: estimatedValue !== null && Number.isFinite(estimatedValue) ? estimatedValue : null,
          original_owner: form.get("original_owner") === "on",
          original_receipt: form.get("original_receipt") === "on",
          instructions_complete: form.get("instructions_complete") === "on",
          minifigures_complete: form.get("minifigures_complete") === "on",
          sealed: itemCondition === "New Sealed",
          passport_status: "Draft",
          is_public: false,
          notes,
        })
        .select("id")
        .single();

      if (insertError || !asset) {
        throw insertError ?? new Error("The item could not be saved.");
      }

      if (photos.length > 0) {
        await uploadPhotos(photos, userData.user.id, asset.id);
      }

      router.push("/vault");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The item could not be saved.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        <button type="button" onClick={() => switchMode("catalogue")} className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${mode === "catalogue" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>
          Find a LEGO set
        </button>
        <button type="button" onClick={() => switchMode("manual")} className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${mode === "manual" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>
          Add manually
        </button>
      </div>

      {mode === "catalogue" ? (
        <div className="relative">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Search by set number or product name</span>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedSet(null);
                }}
                placeholder="Try 10182 or Café Corner"
                autoComplete="off"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm outline-none focus:border-slate-400"
              />
              {searching ? <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" /> : null}
            </div>
          </label>

          {matches.length > 0 && !selectedSet ? (
            <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              {matches.map((set) => (
                <button key={set.id ?? set.setNumber} type="button" onClick={() => chooseSet(set)} className="flex w-full items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-[#fffaf1]">
                  <span>
                    <span className="block font-semibold text-slate-950">{set.name}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      LEGO {set.setNumber} · {set.theme}{set.year ? ` · ${set.year}` : ""}{set.pieces ? ` · ${set.pieces.toLocaleString()} pieces` : ""}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          ) : null}

          {query.trim().length >= 2 && !searching && matches.length === 0 && !selectedSet ? (
            <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              No match yet. Check the spelling or use <button type="button" onClick={() => switchMode("manual")} className="font-semibold text-slate-950 underline">Add manually</button>.
            </div>
          ) : null}

          {selectedSet ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-white"><Check className="h-4 w-4" /></span>
              <div>
                <p className="font-semibold text-slate-950">{selectedSet.name}</p>
                <p className="text-sm text-slate-600">LEGO {selectedSet.setNumber} · {selectedSet.theme}{selectedSet.year ? ` · ${selectedSet.year}` : ""}</p>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Set number or your reference</span>
            <input name="set_number" required placeholder="Unknown, custom, or 10182" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Product name</span>
            <input name="set_name" required placeholder="Describe the LEGO set" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Theme or category</span>
            <input name="theme" placeholder="Star Wars, City, mixed collection..." className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
          </label>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Item condition</span>
          <select value={itemCondition} onChange={(event) => setItemCondition(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400">
            {itemConditions.map((condition) => <option key={condition.value} value={condition.value}>{condition.label}</option>)}
          </select>
        </label>

        {itemCondition !== "New Sealed" ? (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Build completeness</span>
            <select value={completeness} onChange={(event) => setCompleteness(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400">
              {completenessOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        ) : <div />}

        {itemCondition !== "New Sealed" && completeness === "missing" ? (
          <>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">How many pieces are missing?</span>
              <input name="missing_piece_count" type="number" min="1" placeholder="e.g. 6" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">What is missing?</span>
              <input name="missing_piece_details" placeholder="e.g. 2 grey tiles and one minifigure" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
            </label>
          </>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Purchase price (R)</span>
          <input name="purchase_price" type="number" min="0" step="0.01" placeholder="Optional" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Estimated value (R)</span>
          <input name="estimated_value" type="number" min="0" step="0.01" placeholder="Optional" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Photos</span>
          <span className="mt-2 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:border-slate-400">
            <Camera className="h-4 w-4" /> Choose one or more images
            <input name="photos" type="file" accept="image/*" multiple className="sr-only" />
          </span>
        </label>
      </div>

      <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-5">
        <p className="font-semibold text-slate-950">Included items</p>
        <p className="mt-1 text-sm text-slate-600">Mark what is included. These details can be edited later.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["original_owner", "I am the original owner"],
            ["original_receipt", "Original receipt available"],
            ["instructions_complete", "Instructions included and complete"],
            ["minifigures_complete", "All minifigures included"],
          ].map(([name, label]) => (
            <label key={name} className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm text-slate-700">
              <input name={name} type="checkbox" className="h-4 w-4" /> {label}
            </label>
          ))}
        </div>
      </div>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <Button disabled={loading} className="h-12 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Add to My Collection
        {!loading ? <ArrowRight className="h-4 w-4" /> : null}
      </Button>
    </form>
  );
}
