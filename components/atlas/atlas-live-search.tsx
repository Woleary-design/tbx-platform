"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Boxes, Loader2, Search } from "lucide-react";

type AtlasResult = {
  id: string;
  setNumber: string;
  name: string;
  theme: string;
  subtheme: string | null;
  year: number | null;
  pieces: number | null;
  minifigures: number | null;
  imageUrl: string | null;
};

type AtlasSearchPayload = {
  results?: AtlasResult[];
  correctedQuery?: string | null;
};

const categories = ["Star Wars", "Technic", "Icons", "Harry Potter", "City", "NINJAGO", "Friends"];

type AtlasLiveSearchProps = {
  initialResults: AtlasResult[];
  initialQuery?: string;
};

export function AtlasLiveSearch({ initialResults, initialQuery = "" }: AtlasLiveSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [correction, setCorrection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(initialResults);
      setCorrection(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/catalogue/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search failed");
        const payload = (await response.json()) as AtlasSearchPayload;
        setResults(payload.results ?? []);
        setCorrection(payload.correctedQuery ?? null);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
          setCorrection(null);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, initialResults]);

  return (
    <>
      <div className="rounded-[1.5rem] border border-white/10 bg-[#0b1220] p-4 shadow-[0_20px_70px_rgba(0,0,0,.18)]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#ffd84d]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by set number, name, theme or subtheme"
            className="h-14 w-full rounded-2xl border border-white/10 bg-[#07101d] pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#ffd84d]/50 focus:ring-2 focus:ring-[#ffd84d]/10"
          />
          {loading ? <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-slate-400" /> : null}
        </label>

        {correction && !loading ? (
          <button type="button" onClick={() => setQuery(correction)} className="mt-3 rounded-xl border border-[#ffd84d]/20 bg-[#ffd84d]/[0.07] px-3 py-2 text-left text-sm text-slate-300">
            Showing results for <span className="font-semibold text-[#ffd84d]">{correction.toUpperCase()}</span>. Tap to use that spelling.
          </button>
        ) : null}

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Browse LEGO themes">
          {categories.map((category) => {
            const active = query.trim().toLowerCase() === category.toLowerCase();
            return (
              <button key={category} type="button" onClick={() => setQuery(category)} aria-pressed={active} className={active ? "whitespace-nowrap rounded-full bg-[#ffd84d] px-4 py-2 text-sm font-semibold text-[#050915]" : "whitespace-nowrap rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-white/20 hover:text-white"}>
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffd84d]">LEGO Directory</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{query.trim() ? `Results for “${correction ?? query.trim()}”` : "Browse LEGO sets"}</h2>
          </div>
          <p className="text-sm text-slate-500">{results.length} set{results.length === 1 ? "" : "s"}</p>
        </div>

        {results.length === 0 ? (
          <div className="mt-6 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.025] p-10 text-center">
            <Boxes className="mx-auto h-9 w-9 text-[#ffd84d]" />
            <h3 className="mt-4 text-2xl font-semibold text-white">No matching LEGO sets found.</h3>
            <p className="mt-2 text-slate-500">Try the set number or a broader theme name.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {results.map((set) => (
              <Link key={set.id} href={`/atlas/${encodeURIComponent(set.setNumber)}`} className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b1220] shadow-[0_20px_65px_rgba(0,0,0,0.15)] transition hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
                <div className="flex aspect-[4/3] items-center justify-center bg-white p-6">
                  {set.imageUrl ? <img src={set.imageUrl} alt={set.name} className="h-full w-full object-contain" /> : <Boxes className="h-14 w-14 text-slate-300" />}
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffd84d]">LEGO {set.setNumber}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{set.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{[set.theme, set.subtheme].filter(Boolean).join(" · ") || "Uncategorised"}</p>
                  <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-slate-300">
                    <div className="rounded-xl bg-white/[0.035] p-2">{set.year ?? "—"}<span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-600">Year</span></div>
                    <div className="rounded-xl bg-white/[0.035] p-2">{set.pieces ?? "—"}<span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-600">Pieces</span></div>
                    <div className="rounded-xl bg-white/[0.035] p-2">{set.minifigures ?? "—"}<span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-600">Minifigs</span></div>
                  </div>
                  <p className="mt-5 flex items-center justify-between text-sm font-semibold text-slate-300 group-hover:text-[#ffd84d]">View set details <ArrowRight className="h-4 w-4" /></p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
