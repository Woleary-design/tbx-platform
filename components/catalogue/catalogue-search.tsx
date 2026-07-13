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
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search LEGO sets by name, number or theme…"
        className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
      />

      {query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {loading ? <p className="px-4 py-5 text-sm text-slate-500">Searching LEGO directory…</p> : null}
          {!loading && results.length === 0 ? <p className="px-4 py-5 text-sm text-slate-500">No LEGO sets found.</p> : null}
          {!loading && results.length > 0 ? (
            <div className="max-h-[28rem] overflow-y-auto p-2">
              {results.map((set) => (
                <Link
                  key={set.id}
                  href={`/atlas/${encodeURIComponent(set.setNumber)}`}
                  onClick={() => setQuery("")}
                  className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50"
                >
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#fffaf1] p-2">
                    {set.imageUrl ? <img src={set.imageUrl} alt="" className="h-full w-full object-contain" /> : <Search className="h-5 w-5 text-slate-300" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">{set.name}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">LEGO {set.setNumber} · {set.theme}{set.year ? ` · ${set.year}` : ""}</p>
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
