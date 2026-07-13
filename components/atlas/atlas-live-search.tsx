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

const categories = ["Star Wars", "Technic", "Icons", "Harry Potter", "City", "NINJAGO", "Friends"];

type AtlasLiveSearchProps = {
  initialResults: AtlasResult[];
  initialQuery?: string;
};

export function AtlasLiveSearch({ initialResults, initialQuery = "" }: AtlasLiveSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(initialResults);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/catalogue/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        const payload = (await response.json()) as { results?: AtlasResult[] };
        setResults(payload.results ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
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
      <div className="rounded-[1.5rem] border border-[#eadfce] bg-white p-4 shadow-[0_16px_50px_rgba(43,30,18,0.08)]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by set number, name, theme or subtheme"
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm outline-none transition focus:border-slate-400"
          />
          {loading ? <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-slate-400" /> : null}
        </label>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Browse LEGO themes">
          {categories.map((category) => {
            const active = query.trim().toLowerCase() === category.toLowerCase();
            return (
              <button
                key={category}
                type="button"
                onClick={() => setQuery(category)}
                aria-pressed={active}
                className={active
                  ? "whitespace-nowrap rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                  : "whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950"}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">LEGO Directory</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">{query.trim() ? `Results for “${query.trim()}”` : "Browse Atlas"}</h2>
          </div>
          <p className="text-sm text-slate-500">{results.length} set{results.length === 1 ? "" : "s"}</p>
        </div>

        {results.length === 0 ? (
          <div className="mt-6 rounded-[2rem] border border-dashed border-[#d9c9af] bg-white p-10 text-center">
            <Boxes className="mx-auto h-9 w-9 text-yellow-600" />
            <h3 className="mt-4 text-2xl font-semibold text-slate-950">No Atlas match yet.</h3>
            <p className="mt-2 text-slate-600">Try the set number or a broader theme name.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {results.map((set) => (
              <Link key={set.id} href={`/atlas/${encodeURIComponent(set.setNumber)}`} className="group overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-white shadow-[0_20px_65px_rgba(43,30,18,0.07)] transition hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(43,30,18,0.13)]">
                <div className="flex aspect-[4/3] items-center justify-center bg-[#fffaf1] p-6">
                  {set.imageUrl ? <img src={set.imageUrl} alt={set.name} className="h-full w-full object-contain" /> : <Boxes className="h-14 w-14 text-yellow-500" />}
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">LEGO {set.setNumber}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{set.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{[set.theme, set.subtheme].filter(Boolean).join(" · ") || "Uncategorised"}</p>
                  <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                    <div className="rounded-xl bg-slate-50 p-2">{set.year ?? "—"}<span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-400">Year</span></div>
                    <div className="rounded-xl bg-slate-50 p-2">{set.pieces ?? "—"}<span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-400">Pieces</span></div>
                    <div className="rounded-xl bg-slate-50 p-2">{set.minifigures ?? "—"}<span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-400">Minifigs</span></div>
                  </div>
                  <p className="mt-5 flex items-center justify-between text-sm font-semibold text-slate-700 group-hover:text-yellow-700">View Atlas record <ArrowRight className="h-4 w-4" /></p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
