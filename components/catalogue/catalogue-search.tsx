"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

type SearchResult = {
  id: string;
  setNumber: string;
  name: string;
  theme: string;
  year: number | null;
  imageUrl: string | null;
};

export function CatalogueSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/catalogue/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        const payload = await response.json();
        setResults(Array.isArray(payload.results) ? payload.results : []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const hasQuery = query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative flex-1">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#ffd84d]" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search LEGO sets by name, number or theme…"
        className="h-12 w-full rounded-full border border-white/35 bg-[#101827] pl-12 pr-11 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.05)] outline-none transition placeholder:text-white/62 focus:border-[#ffd84d] focus:bg-[#121c2d] focus:ring-2 focus:ring-[#ffd84d]/25 sm:h-11"
      />
      {hasQuery ? (
        <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      ) : null}

      {hasQuery ? (
        <div className="fixed inset-x-3 bottom-3 top-[8.75rem] z-[70] flex flex-col overflow-hidden rounded-[1.5rem] border border-white/15 bg-[#08111f] shadow-[0_28px_90px_rgba(0,0,0,0.72)] sm:absolute sm:inset-x-0 sm:bottom-auto sm:top-[calc(100%+0.6rem)] sm:block sm:max-h-[34rem] sm:rounded-2xl sm:bg-[#0a1220]">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:hidden">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffd84d]">Atlas search</p>
              <p className="mt-1 text-sm font-semibold text-white">Results for “{query.trim()}”</p>
            </div>
            <button type="button" onClick={() => setQuery("")} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70" aria-label="Close search results">
              <X className="h-4 w-4" />
            </button>
          </div>

          {loading ? <p className="px-4 py-5 text-sm text-white/55">Searching LEGO directory…</p> : null}
          {!loading && results.length === 0 ? <p className="px-4 py-5 text-sm text-white/55">No LEGO sets found. Try a set number, name or theme.</p> : null}
          {!loading && results.length > 0 ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:max-h-[31rem]">
              {results.map((set) => (
                <Link
                  key={set.id}
                  href={`/atlas/${encodeURIComponent(set.setNumber)}`}
                  onClick={() => setQuery("")}
                  className="flex min-h-[96px] items-center gap-4 rounded-2xl border-b border-white/[0.05] px-3 py-3 transition last:border-b-0 hover:bg-white/[0.06] active:bg-white/[0.08] sm:min-h-[84px] sm:rounded-xl"
                >
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-black/5 bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.18)] sm:h-16 sm:w-16">
                    {set.imageUrl ? <img src={set.imageUrl} alt="" className="h-full w-full object-contain" /> : <Search className="h-6 w-6 text-slate-300" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold leading-5 text-white sm:truncate">{set.name}</p>
                    <p className="mt-1 text-sm text-white/58 sm:truncate">LEGO {set.setNumber} · {set.theme}{set.year ? ` · ${set.year}` : ""}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {!loading ? (
            <Link href={`/atlas?theme=${encodeURIComponent(query.trim())}`} onClick={() => setQuery("")} className="m-3 mt-auto inline-flex min-h-12 items-center justify-center rounded-xl bg-[#ffd84d] px-4 text-sm font-bold text-[#050915] sm:hidden">
              View all Atlas results
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
