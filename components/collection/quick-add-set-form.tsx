"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, Search, Sparkles } from "lucide-react";
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

function atlasEstimate(data: MarketSnapshotData | null) {
  if (!data) return null;
  return data.quote.recommended
    ?? data.quote.estimated_value
    ?? data.externalMarket?.adjustedRecommended
    ?? null;
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
    return response.ok && Array.isArray(payload.results) ? payload.results as AtlasSet[] : [];
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
    if (!selectedSet) {
      setMarketData(null);
      return;
    }
    const controller = new AbortController();
    void (async () => {
      setMarketLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/value/${encodeURIComponent(selectedSet.setNumber)}?condition=${encodeURIComponent(condition)}`, { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Atlas pricing is not available yet.");
        setMarketData(payload as MarketSnapshotData);
      } catch (caughtError) {
        if (!controller.signal.aborted) {
          setMarketData(null);
          setError(caughtError instanceof Error ? caughtError.message : "Atlas pricing is not available yet.");
        }
      } finally {
        if (!controller.signal.aborted) setMarketLoading(false);
      }
    })();
    return () => controller.abort();
  }, [condition, selectedSet]);

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
      if (userError || !userData.user) throw new Error("Sign in is required to add a LEGO set.");

      const { data: existing } = await supabase
        .from("assets")
        .select("id")
        .eq("owner_id", userData.user.id)
        .eq("lego_set_id", selectedSet.id ?? "")
        .limit(1)
        .maybeSingle();

      if (existing) {
        router.push(`/collection/${existing.id}`);
        return;
      }

      const estimatedValue = atlasEstimate(marketData);
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
          estimated_value: estimatedValue,
          passport_status: "Draft",
          is_public: false,
          notes: selectedSet.year ? `Catalogue year: ${selectedSet.year}` : "",
        })
        .select("id")
        .single();

      if (insertError || !asset) throw insertError ?? new Error("The Collection Record could not be created.");
      router.push(intent === "sell" ? `/sell/create?asset=${encodeURIComponent(asset.id)}` : `/collection/${asset.id}`);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The set could not be saved.");
      setSaving(false);
    }
  }

  if (showFullForm && intent === "collect") {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-white">
          <div><p className="font-semibold">Detailed add</p><p className="text-sm text-white/45">Add evidence and documentation now.</p></div>
          <button type="button" onClick={() => setShowFullForm(false)} className="text-sm font-semibold text-[#e8c86a] underline">Back to Quick Add</button>
        </div>
        <div className="rounded-2xl bg-white p-5 text-slate-950"><AddSetForm /></div>
      </div>
    );
  }

  const estimate = atlasEstimate(marketData);

  return (
    <form onSubmit={handleQuickAdd} className="space-y-6 text-white">
      <div className="rounded-2xl border border-[#e8c86a]/20 bg-[#e8c86a]/[0.06] p-5">
        <div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 text-[#e8c86a]" /><div><p className="font-bold">Atlas-assisted collection entry</p><p className="mt-1 text-sm leading-6 text-white/48">Choose the exact set and condition. Atlas will estimate today’s value and save it with the collection record.</p></div></div>
      </div>

      <div className="relative">
        <label className="block">
          <span className="text-sm font-medium text-white/70">Search all LEGO sets</span>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setSelectedSet(null); setMarketData(null); setError(null); }} onKeyDown={handleKeyDown} placeholder="Try 75192, Millennium Falcon or Star Wars" autoComplete="off" aria-autocomplete="list" className="h-14 w-full rounded-2xl border border-white/10 bg-[#050912] pl-12 pr-12 text-base text-white outline-none placeholder:text-white/25 focus:border-[#e8c86a]/45 focus:ring-4 focus:ring-[#e8c86a]/5" />
            {searching ? <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-white/35" /> : null}
          </div>
        </label>

        {matches.length > 0 && !selectedSet ? (
          <div role="listbox" className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1422] shadow-2xl">
            {matches.map((set, index) => (
              <button key={`${set.id ?? "starter"}-${set.setNumber}`} type="button" role="option" aria-selected={index === activeIndex} onMouseEnter={() => setActiveIndex(index)} onClick={() => selectSet(set)} className={`flex w-full items-center gap-4 border-b border-white/[0.07] px-4 py-3 text-left last:border-b-0 ${index === activeIndex ? "bg-[#e8c86a]/[0.08]" : "hover:bg-white/[0.04]"}`}>
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-xs font-semibold text-slate-500">{set.imageUrl ? <img src={set.imageUrl} alt="" className="h-full w-full object-contain" /> : set.setNumber}</span>
                <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-white">{set.name}</span><span className="mt-1 block truncate text-xs text-white/40">LEGO {set.setNumber} · {set.theme}{set.year ? ` · ${set.year}` : ""}{set.pieceCount ? ` · ${set.pieceCount.toLocaleString()} pieces` : ""}</span></span>
                <ArrowRight className="h-4 w-4 shrink-0 text-white/30" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {selectedSet ? (
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-emerald-700">{selectedSet.imageUrl ? <img src={selectedSet.imageUrl} alt="" className="h-full w-full object-contain" /> : <Check className="h-5 w-5" />}</span>
          <div className="min-w-0 flex-1"><p className="truncate font-bold">{selectedSet.name}</p><p className="mt-1 truncate text-sm text-white/45">LEGO {selectedSet.setNumber} · {selectedSet.theme}</p></div>
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">Selected</span>
        </div>
      ) : null}

      <label className="block"><span className="text-sm font-medium text-white/70">Condition</span><select value={condition} onChange={(event) => { setCondition(event.target.value); setError(null); }} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#050912] px-4 text-sm text-white">{conditions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>

      {selectedSet ? <MarketSnapshot data={marketData} loading={marketLoading} /> : null}

      {estimate != null ? <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-3 text-sm text-emerald-100">Atlas will save an estimated collection value of <strong>R{Math.round(estimate).toLocaleString("en-ZA")}</strong>. You can update it later.</p> : null}
      {error ? <p className="rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-200">{error}</p> : null}
      <Button disabled={saving || !selectedSet || marketLoading} className="h-12 w-full rounded-xl bg-[#e8c86a] font-black text-[#050912] hover:bg-[#f1d478]">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{saving ? "Adding to Collection…" : "Add to My Collection"}{!saving ? <ArrowRight className="h-4 w-4" /> : null}</Button>
      {intent === "collect" ? <button type="button" onClick={() => setShowFullForm(true)} className="w-full text-sm font-semibold text-white/45 underline hover:text-white">Add with photos and documentation instead</button> : null}
    </form>
  );
}
