import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type AtlasRow = {
  id: string;
  set_number: string;
  name: string;
  theme: string | null;
  subtheme: string | null;
  year_released: number | null;
  piece_count: number | null;
  image_url: string | null;
  relevance?: number | string | null;
  match_reason?: string | null;
  atlas_visibility?: string | null;
};

const STOP_WORDS = new Set([
  "lego", "with", "from", "that", "this", "have", "has", "some", "very", "looks", "look", "like", "figure", "figures", "minifigure", "minifigures", "pieces", "piece", "parts", "part", "built", "build", "box", "instructions", "manual", "unknown", "set", "sets", "and", "the", "for", "not", "but", "are", "was", "were", "its", "about", "maybe", "colour", "colors", "colours",
]);

function clean(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\- ]/g, " ").replace(/\s+/g, " ").trim();
}

function searchTerms(text: string) {
  const words = clean(text).split(" ").filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
  return [...new Set(words)].slice(0, 8);
}

function isMinifigureRecord(row: AtlasRow) {
  return (row.theme ?? "").toLowerCase().includes("minifig") || (row.subtheme ?? "").toLowerCase().includes("minifig") || /^sw\d+/i.test(row.set_number);
}

function confidence(score: number, hits: number) {
  const base = 36 + Math.min(42, hits * 11) + Math.min(16, Math.log10(Math.max(score, 1)) * 7);
  return Math.max(28, Math.min(96, Math.round(base)));
}

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const kind = request.nextUrl.searchParams.get("kind") ?? "set";
  if (text.length < 2) return NextResponse.json({ results: [] });

  const terms = searchTerms(text);
  if (!terms.length) return NextResponse.json({ results: [] });

  const supabase = await createClient();
  const ranked = new Map<string, { row: AtlasRow; score: number; reasons: Set<string> }>();

  function addRows(rows: AtlasRow[], term: string, termIndex: number, sourceBoost: number) {
    rows.forEach((row, position) => {
      if (row.atlas_visibility && row.atlas_visibility !== "public") return;
      const minifigureRecord = isMinifigureRecord(row);
      if (kind === "minifigure" && !minifigureRecord) return;
      if (kind === "set" && minifigureRecord) return;

      const rpcRelevance = Number(row.relevance ?? 0);
      const exact = clean(row.set_number) === clean(term) || clean(row.name) === clean(term);
      const score = sourceBoost + rpcRelevance + Math.max(1, 8 - termIndex) * Math.max(1, 24 - position) * 4 + (exact ? 900 : 0);
      const existing = ranked.get(row.id);
      if (existing) {
        existing.score += score * 0.55;
        existing.reasons.add(term);
      } else {
        ranked.set(row.id, { row, score, reasons: new Set([term]) });
      }
    });
  }

  const searches = await Promise.all(terms.slice(0, 6).map(async (term, index) => {
    const [{ data: rpcData }, { data: directData }] = await Promise.all([
      supabase.rpc("atlas_search", { search_query: term, result_limit: 20 }),
      supabase
        .from("lego_sets")
        .select("id,set_number,name,theme,subtheme,year_released,piece_count,image_url,atlas_visibility")
        .eq("is_active", true)
        .eq("atlas_visibility", "public")
        .or(`set_number.ilike.%${term}%,name.ilike.%${term}%,theme.ilike.%${term}%,subtheme.ilike.%${term}%`)
        .limit(24),
    ]);
    return { term, index, rpcRows: (rpcData ?? []) as AtlasRow[], directRows: (directData ?? []) as AtlasRow[] };
  }));

  for (const search of searches) {
    addRows(search.rpcRows, search.term, search.index, 120);
    addRows(search.directRows, search.term, search.index, 60);
  }

  const results = [...ranked.values()]
    .sort((a, b) => {
      const hitDiff = b.reasons.size - a.reasons.size;
      return hitDiff || b.score - a.score;
    })
    .slice(0, 5)
    .map(({ row, score, reasons }) => ({
      id: row.id,
      setNumber: row.set_number,
      name: row.name,
      theme: row.theme,
      subtheme: row.subtheme,
      year: row.year_released,
      pieces: row.piece_count,
      imageUrl: row.image_url,
      confidence: confidence(score, reasons.size),
      matchedOn: [...reasons].slice(0, 4),
    }));

  return NextResponse.json({ source: "atlas-description-match", kind, terms, results });
}
