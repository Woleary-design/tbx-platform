"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

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

  return (
    <div ref={containerRef} className="relative flex-1">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#ffd84d]" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search LEGO sets by name, number or theme…"
        className="h-12 w-full rounded-full border border-white/35 bg-[#101827] pl-12 pr-4 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.05)] outline-none transition placeholder:text-white/62 focus:border-[#ffd84d] focus:bg-[#121c2d] focus:ring-2 focus:ring-[#ffd84d]/25 sm:h-11"
      />

      {query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-50 overflow-hidden rounded-2xl border border-white/15 bg-[#0a1220] shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
          {loading ? <p className="px-4 py-5 text-sm text-white/55">Searching LEGO directory…</p> : null}
          {!loading && results.length === 0 ? <p className="px-4 py-5 text-sm text-white/55">No LEGO sets found.</p> : null}
          {!loading && results.length > 0 ? (
            <div className="max-h-[31rem] overflow-y-auto p-2">
              {results.map((set) => (
                <Link
                  key={set.id}
                  href={`/atlas/${encodeURIComponent(set.setNumber)}`}
                  onClick={() => setQuery("")}
                  className="flex min-h-[84px] items-center gap-4 rounded-xl px-3 py-3 transition hover:bg-white/[0.06] active:bg-white/[0.08]"
                >
                  <div className="grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-2xl border border-black/5 bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.18)] sm:h-16 sm:w-16">
                    {set.imageUrl ? <img src={set.imageUrl} alt="" className="h-full w-full object-contain" /> : <Search className="h-6 w-6 text-slate-300" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-white">{set.name}</p>
                    <p className="mt-1 truncate text-sm text-white/55">LEGO {set.setNumber} · {set.theme}{set.year ? ` · ${set.year}` : ""}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
