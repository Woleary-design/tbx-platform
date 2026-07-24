"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, Search, Sparkles } from "lucide-react";
import { MarketSnapshot, type MarketSnapshotData } from "@/components/market/market-snapshot";
import { legoCatalogue, type LegoCatalogueSet } from "@/lib/lego/catalog";

type AtlasSet = LegoCatalogueSet & {
  id?: string;
  pieceCount?: number | null;
  imageUrl?: string | null;
};

const completenessOptions = [
  { value: "New Sealed", label: "Factory sealed", detail: "Unopened in the original packaging" },
  { value: "Used Complete", label: "Complete", detail: "All important pieces are present" },
  { value: "Used Incomplete", label: "Incomplete", detail: "Some pieces or figures are missing" },
  { value: "Unknown", label: "Not sure", detail: "TBX can help you work it out later" },
];

const qualityOptions = ["Mint", "Excellent", "Good", "Fair"];

function localMatches(query: string) {
  const clean = query.trim().toLowerCase();
  return legoCatalogue
    .filter((set) => set.setNumber.toLowerCase().includes(clean) || set.name.toLowerCase().includes(clean) || set.theme.toLowerCase().includes(clean))
    .slice(0, 8);
}

export function GuidedSellForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<AtlasSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<AtlasSet | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [completeness, setCompleteness] = useState("Used Complete");
  const [quality, setQuality] = useState("Good");
  const [searching, setSearching] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketData, setMarketData] = useState<MarketSnapshotData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSet || query.trim().length < 2) {
      setMatches([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/catalogue/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        const payload = await response.json();
        const results = response.ok && Array.isArray(payload.results) ? payload.results as AtlasSet[] : [];
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
        const response = await fetch(`/api/value/${encodeURIComponent(selectedSet.setNumber)}?condition=${encodeURIComponent(completeness)}`, { signal: controller.signal });
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
  }, [completeness, selectedSet]);

  function selectSet(set: AtlasSet) {
    setSelectedSet(set);
    setQuery(`${set.setNumber} · ${set.name}`);
    setMatches([]);
    setError(null);
  }

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
    }
  }

  function continueToListing() {
    if (!selectedSet) return;
    const completenessLabel = completenessOptions.find((option) => option.value === completeness)?.label ?? completeness;
    window.localStorage.setItem("tbx-listing-draft", JSON.stringify({
      title: `${selectedSet.setNumber} · ${selectedSet.name}`,
      condition: completeness,
      included: completenessLabel,
      description: `Overall condition: ${quality}`,
      price: "",
      delivery: "Seller ships",
    }));
    router.push("/sell/create?source=guided");
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">Step 1 · Identify</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">What are you selling?</h2>
        <p className="mt-2 text-sm leading-6 text-white/45">Search by set number or name. Choose the correct result before describing it.</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
        <input
          value={query}
          onChange={(event) => { setQuery(event.target.value); setSelectedSet(null); setMarketData(null); setError(null); }}
          onKeyDown={handleKeyDown}
          placeholder="Search 75192 or Millennium Falcon"
          className="h-16 w-full rounded-2xl border border-white/10 bg-[#050912] pl-12 pr-12 text-base text-white outline-none placeholder:text-white/25 focus:border-[#e8c86a]/45 focus:ring-4 focus:ring-[#e8c86a]/5"
        />
        {searching ? <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-white/35" /> : null}
        {matches.length && !selectedSet ? (
          <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1422] shadow-2xl">
            {matches.map((set, index) => (
              <button key={`${set.id ?? "starter"}-${set.setNumber}`} type="button" onMouseEnter={() => setActiveIndex(index)} onClick={() => selectSet(set)} className={`flex w-full items-center gap-4 border-b border-white/7 px-4 py-3 text-left last:border-0 ${index === activeIndex ? "bg-[#e8c86a]/8" : "hover:bg-white/4"}`}>
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-xs font-bold text-slate-600">{set.imageUrl ? <img src={set.imageUrl} alt="" className="h-full w-full object-contain" /> : set.setNumber}</span>
                <span className="min-w-0 flex-1"><span className="block truncate font-bold text-white">{set.name}</span><span className="mt-1 block truncate text-xs text-white/40">LEGO {set.setNumber} · {set.theme}{set.year ? ` · ${set.year}` : ""}</span></span>
                <ArrowRight className="h-4 w-4 text-white/30" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {selectedSet ? (
        <>
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/7 p-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-emerald-700">{selectedSet.imageUrl ? <img src={selectedSet.imageUrl} alt="" className="h-full w-full object-contain" /> : <Check className="h-5 w-5" />}</span>
            <div className="min-w-0 flex-1"><p className="truncate font-black text-white">{selectedSet.name}</p><p className="mt-1 truncate text-sm text-white/45">LEGO {selectedSet.setNumber} · {selectedSet.theme}</p></div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">Found</span>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">Step 2 · Completeness</p>
            <h3 className="mt-3 text-2xl font-black text-white">How complete is it?</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {completenessOptions.map((option) => (
                <button type="button" key={option.value} onClick={() => setCompleteness(option.value)} className={`rounded-2xl border p-4 text-left transition ${completeness === option.value ? "border-[#e8c86a] bg-[#e8c86a]/10" : "border-white/10 bg-white/2 hover:border-white/20"}`}>
                  <div className="flex items-center justify-between gap-3"><span className="font-bold text-white">{option.label}</span>{completeness === option.value ? <Check className="h-5 w-5 text-[#e8c86a]" /> : null}</div>
                  <p className="mt-2 text-sm text-white/40">{option.detail}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">Step 3 · Condition</p>
            <h3 className="mt-3 text-2xl font-black text-white">How would you describe it?</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {qualityOptions.map((option) => <button type="button" key={option} onClick={() => setQuality(option)} className={`rounded-xl border px-4 py-4 text-sm font-bold transition ${quality === option ? "border-[#e8c86a] bg-[#e8c86a]/10 text-[#e8c86a]" : "border-white/10 text-white/60 hover:border-white/20"}`}>{option}</button>)}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#e8c86a]" /><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">Current market guide</p></div>
            <MarketSnapshot data={marketData} loading={marketLoading} />
          </div>

          {error ? <p className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-200">{error}</p> : null}
          <button type="button" onClick={continueToListing} className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#e8c86a] px-6 font-black text-[#050912] transition hover:bg-[#f1d478]">Use this value and build my listing <ArrowRight className="h-5 w-5" /></button>
        </>
      ) : null}
    </div>
  );
}
