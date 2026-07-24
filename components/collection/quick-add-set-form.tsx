"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddSetForm } from "@/components/collection/add-set-form";
import { MarketSnapshot, type MarketSnapshotData } from "@/components/market/market-snapshot";
import { legoCatalogue, type LegoCatalogueSet } from "@/lib/lego/catalog";
import { createClient } from "@/lib/supabase/client";

type AtlasSet = LegoCatalogueSet & {
  id?: string;
  pieceCount?: number | null;
  minifigureCount?: number | null;
  imageUrl?: string | null;
};

const conditions = [
  { value: "New Sealed", label: "New — factory sealed" },
  { value: "New Open Box", label: "New — opened box" },
  { value: "Used Complete", label: "Used — complete" },
  { value: "Used Incomplete", label: "Used — incomplete" },
  { value: "Unknown", label: "Not sure yet" },
];

function localMatches(query: string) {
  const clean = query.trim().toLowerCase();
  return legoCatalogue
    .filter((set) => set.setNumber.toLowerCase().includes(clean) || set.name.toLowerCase().includes(clean) || set.theme.toLowerCase().includes(clean))
    .slice(0, 8);
}

export function QuickAddSetForm({ initialSetNumber, intent = "collect" }: { initialSetNumber?: string; intent?: "collect" | "sell" }) {
  const router = useRouter();
  const initialApplied = useRef(false);
  const [showFullForm, setShowFullForm] = useState(false);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<AtlasSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<AtlasSet | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [condition, setCondition] = useState("Used Complete");
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketData, setMarketData] = useState<MarketSnapshotData | null>(null);
  const [error, setError] = useState<string | null>(null);

  function selectSet(set: AtlasSet) {
    setSelectedSet(set);
    setQuery(`${set.setNumber} · ${set.name}`);
    setMatches([]);
    setActiveIndex(0);
    setError(null);
  }

  async function searchCatalogue(term: string, signal?: AbortSignal) {
    const response = await fetch(`/api/catalogue/search?q=${encodeURIComponent(term.trim())}`, { signal });
    const payload = await response.json();
    return response.ok && Array.isArray(payload.results) ? (payload.results as AtlasSet[]) : [];
  }

  useEffect(() => {
    if (!initialSetNumber || initialApplied.current) return;
    initialApplied.current = true;
    const controller = new AbortController();
    void (async () => {
      setSearching(true);
      try {
        const results = await searchCatalogue(initialSetNumber, controller.signal);
        const exact = results.find((set) => set.setNumber.toLowerCase() === initialSetNumber.toLowerCase());
        if (exact) selectSet(exact);
        else setQuery(initialSetNumber);
      } catch {
        const fallback = localMatches(initialSetNumber)[0];
        if (fallback) selectSet(fallback);
        else setQuery(initialSetNumber);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    })();
    return () => controller.abort();
  }, [initialSetNumber]);

  useEffect(() => {
    if (selectedSet || query.trim().length < 2) {
      setMatches([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchCatalogue(query, controller.signal);
        setMatches(results.length ? results.slice(0, 8) : localMatches(query));
        setActiveIndex(0);
      } catch {
        if (!controller.signal.aborted) setMatches(localMatches(query));
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, selectedSet]);

  useEffect(() => {
    if (intent !== "sell" || !selectedSet) {
      setMarketData(null);
      return;
    }

    const controller = new AbortController();
    void (async () => {
      setMarketLoading(true);
      try {
        const response = await fetch(
          `/api/value/${encodeURIComponent(selectedSet.setNumber)}?condition=${encodeURIComponent(condition)}`,
          { signal: controller.signal },
        );
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Market pricing is not available yet.");
        setMarketData(payload as MarketSnapshotData);
      } catch (caughtError) {
        if (!controller.signal.aborted) {
          setMarketData(null);
          setError(caughtError instanceof Error ? caughtError.message : "Market pricing is not available yet.");
        }
      } finally {
        if (!controller.signal.aborted) setMarketLoading(false);
      }
    })();

    return () => controller.abort();
  }, [condition, intent, selectedSet]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!matches.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      selectSet(matches[activeIndex]);
    } else if (event.key === "Escape") {
      setMatches([]);
    }
  }

  async function handleQuickAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSet) {
      setError("Select a LEGO set first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Sign in is required to save or sell a LEGO set.");

      const { data: existing } = await supabase
        .from("assets")
        .select("id")
        .eq("owner_id", userData.user.id)
        .eq("lego_set_id", selectedSet.id ?? "")
        .limit(1)
        .maybeSingle();

      if (intent === "sell" && existing) {
        router.push(`/collection/${existing.id}/list`);
        return;
      }

      const { data: asset, error: insertError } = await supabase
        .from("assets")
        .insert({
          owner_id: userData.user.id,
          lego_set_id: selectedSet.id ?? null,
          set_number: selectedSet.setNumber,
          set_name: selectedSet.name,
          theme: selectedSet.theme || null,
          condition,
          sealed: condition === "New Sealed",
          passport_status: "Draft",
          is_public: false,
          notes: selectedSet.year ? `Catalogue year: ${selectedSet.year}` : "",
        })
        .select("id")
        .single();

      if (insertError || !asset) throw insertError ?? new Error("The Collection Record could not be created.");
      router.push(intent === "sell" ? `/collection/${asset.id}/list` : `/collection/${asset.id}`);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The set could not be saved.");
      setSaving(false);
    }
  }

  if (showFullForm && intent === "collect") {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
          <div><p className="font-semibold text-slate-950">Detailed add</p><p className="text-sm text-slate-500">Add pricing, evidence and documentation now.</p></div>
          <button type="button" onClick={() => setShowFullForm(false)} className="text-sm font-semibold text-slate-700 underline">Back to Quick Add</button>
        </div>
        <AddSetForm />
      </div>
    );
  }

  return (
    <form onSubmit={handleQuickAdd} className="space-y-6">
      <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-5">
        <p className="font-semibold text-slate-950">{intent === "sell" ? "Quick Sell" : "Quick Add"}</p>
        <p className="mt-1 text-sm text-slate-600">{intent === "sell" ? "Choose the set and condition. TBX then shows the current market before you choose your listing price." : "Choose the set and condition. Complete photos and documentation later."}</p>
      </div>

      <div className="relative">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Search all LEGO sets</span>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setSelectedSet(null); setMarketData(null); setError(null); }} onKeyDown={handleKeyDown} placeholder="Try 75192, Millennium Falcon or Star Wars" autoComplete="off" aria-autocomplete="list" className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-base outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
            {searching ? <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-slate-400" /> : null}
          </div>
        </label>

        {matches.length > 0 && !selectedSet ? (
          <div role="listbox" className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {matches.map((set, index) => (
              <button key={`${set.id ?? "starter"}-${set.setNumber}`} type="button" role="option" aria-selected={index === activeIndex} onMouseEnter={() => setActiveIndex(index)} onClick={() => selectSet(set)} className={`flex w-full items-center gap-4 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 ${index === activeIndex ? "bg-[#fffaf1]" : "hover:bg-slate-50"}`}>
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 text-xs font-semibold text-slate-500">{set.imageUrl ? <img src={set.imageUrl} alt="" className="h-full w-full object-contain" /> : set.setNumber}</span>
                <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-slate-950">{set.name}</span><span className="mt-1 block truncate text-xs text-slate-500">LEGO {set.setNumber} · {set.theme}{set.year ? ` · ${set.year}` : ""}{set.pieceCount ? ` · ${set.pieceCount.toLocaleString()} pieces` : ""}</span></span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {selectedSet ? (
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-emerald-700">{selectedSet.imageUrl ? <img src={selectedSet.imageUrl} alt="" className="h-full w-full object-contain" /> : <Check className="h-5 w-5" />}</span>
          <div className="min-w-0"><p className="truncate font-semibold text-slate-950">{selectedSet.name}</p><p className="truncate text-sm text-slate-600">LEGO {selectedSet.setNumber} · {selectedSet.theme}</p></div>
          <span className="ml-auto rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Selected</span>
        </div>
      ) : null}

      <label className="block"><span className="text-sm font-medium text-slate-700">Condition</span><select value={condition} onChange={(event) => { setCondition(event.target.value); setError(null); }} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm">{conditions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>

      {intent === "sell" && selectedSet ? <MarketSnapshot data={marketData} loading={marketLoading} /> : null}

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <Button disabled={saving || !selectedSet} className="h-12 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{intent === "sell" ? "Continue with this valuation" : "Add to My Collection"}{!saving ? <ArrowRight className="h-4 w-4" /> : null}</Button>
      {intent === "collect" ? <button type="button" onClick={() => setShowFullForm(true)} className="w-full text-sm font-semibold text-slate-600 underline hover:text-slate-950">Add with photos, pricing and documentation instead</button> : null}
    </form>
  );
}
