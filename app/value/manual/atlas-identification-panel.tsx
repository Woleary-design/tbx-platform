"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Search, Scale, Sparkles } from "lucide-react";

export type AtlasCandidate = {
  id: string;
  setNumber: string;
  name: string;
  theme: string | null;
  subtheme: string | null;
  year: number | null;
  pieces: number | null;
  imageUrl: string | null;
  confidence: number;
  matchedOn: string[];
};

function rand(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value);
}

export function AtlasIdentificationPanel({
  loose,
  minifigure,
  query,
  weightKg,
  onWeightChange,
  selected,
  onSelect,
}: {
  loose: boolean;
  minifigure: boolean;
  query: string;
  weightKg: number | null;
  onWeightChange: (value: number | null) => void;
  selected: AtlasCandidate | null;
  onSelect: (candidate: AtlasCandidate | null) => void;
}) {
  const [candidates, setCandidates] = useState<AtlasCandidate[]>([]);
  const [recognisedCharacter, setRecognisedCharacter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (loose || query.trim().length < 2) {
      setCandidates([]);
      setRecognisedCharacter(null);
      setSearched(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/atlas/match?kind=${minifigure ? "minifigure" : "set"}&q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Atlas could not search the catalogue.");
        setCandidates(Array.isArray(payload.results) ? payload.results : []);
        setRecognisedCharacter(typeof payload.recognisedCharacter === "string" ? payload.recognisedCharacter : null);
        setSearched(true);
      } catch {
        if (!controller.signal.aborted) {
          setCandidates([]);
          setRecognisedCharacter(null);
          setSearched(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loose, minifigure, query]);

  const bulkRange = useMemo(() => {
    if (!weightKg || weightKg <= 0) return null;
    return { low: Math.round(weightKg * 150), high: Math.round(weightKg * 250) };
  }, [weightKg]);

  if (loose) {
    return (
      <div className="mt-6 rounded-2xl border border-[#e8c86a]/20 bg-[#e8c86a]/[0.045] p-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#e8c86a]"><Scale className="h-4 w-4" /> Bulk value by weight</div>
        <p className="mt-3 text-sm leading-6 text-white/50">If you can weigh the LEGO, Atlas can make a much better bulk estimate. Enter the LEGO-only weight if possible.</p>
        <div className="mt-4 flex items-center gap-3">
          <input type="number" min="0" step="0.1" value={weightKg ?? ""} onChange={(event) => onWeightChange(event.target.value ? Number(event.target.value) : null)} placeholder="e.g. 6.5" className="h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#050912] px-4 text-white outline-none focus:border-[#e8c86a]/50" />
          <span className="font-bold text-white/55">kg</span>
        </div>
        {bulkRange ? <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#050912] p-4"><p className="text-sm text-white/45">Atlas bulk estimate</p><p className="mt-1 text-2xl font-black tracking-[-0.04em] text-white">{rand(bulkRange.low)} – {rand(bulkRange.high)}</p><p className="mt-2 text-xs leading-5 text-white/35">Based on a provisional second-hand bulk range of R150–R250/kg. Minifigures, recognised sets, Technic, sorting and condition can move the real value outside this range.</p></div> : null}
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-[#e8c86a]/20 bg-[#e8c86a]/[0.045] p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#e8c86a]"><Sparkles className="h-4 w-4" /> Atlas identification</div>
      {loading ? <p className="mt-4 flex items-center gap-2 text-sm text-white/45"><Loader2 className="h-4 w-4 animate-spin" /> Searching for the closest matches…</p> : null}
      {!loading && searched && candidates.length === 0 && recognisedCharacter && minifigure ? <div className="mt-4 rounded-xl border border-[#e8c86a]/20 bg-[#050912] p-4"><p className="font-bold text-white">Atlas recognises {recognisedCharacter}.</p><p className="mt-2 text-sm leading-6 text-white/45">TBX does not yet have the exact minifigure variants for this character in its catalogue. Add a minifigure code, theme/series, or visible variant details so Atlas can narrow it down without guessing.</p></div> : null}
      {!loading && searched && candidates.length === 0 && !recognisedCharacter ? <p className="mt-4 text-sm leading-6 text-white/45">Atlas could not find a strong catalogue match from this description yet. You can still continue with the manual description.</p> : null}
      {!loading && candidates.length > 0 ? <div className="mt-4 space-y-3"><p className="text-sm text-white/50">I found {candidates.length} possible {minifigure ? "minifigure" : "set"} matches. Choose one only if it looks right.</p>{candidates.slice(0, 5).map((candidate) => { const active = selected?.id === candidate.id; return <button key={candidate.id} type="button" onClick={() => onSelect(active ? null : candidate)} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${active ? "border-[#e8c86a]/55 bg-[#e8c86a]/10" : "border-white/[0.08] bg-[#050912] hover:border-white/20"}`}>{candidate.imageUrl ? <img src={candidate.imageUrl} alt="" className="h-16 w-16 rounded-lg bg-white/5 object-contain" /> : <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-white/25"><Search className="h-5 w-5" /></span>}<span className="min-w-0 flex-1"><span className="block truncate font-black text-white">{candidate.setNumber} · {candidate.name}</span><span className="mt-1 block truncate text-sm text-white/40">{[candidate.theme, candidate.subtheme, candidate.year].filter(Boolean).join(" · ")}</span><span className="mt-1 block text-xs font-bold text-[#e8c86a]">{candidate.confidence}% match</span></span>{active ? <Check className="h-5 w-5 shrink-0 text-[#e8c86a]" /> : null}</button>; })}</div> : null}
    </div>
  );
}
