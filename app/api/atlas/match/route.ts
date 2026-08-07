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
  "lego", "with", "from", "that", "this", "have", "has", "some", "very", "looks", "look", "like", "figure", "figures", "minifigure", "minifigures", "pieces", "piece", "parts", "part", "built", "build", "box", "instructions", "manual", "unknown", "set", "sets", "and", "the", "for", "not", "but", "are", "was", "were", "its", "about", "maybe", "colour", "colors", "colours", "large", "small", "big",
]);

function clean(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\- ]/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeWord(word: string) {
  if (word.length > 4 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function searchTerms(text: string) {
  const words = clean(text)
    .split(" ")
    .map(normalizeWord)
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
  return [...new Set(words)].slice(0, 8);
}

function isMinifigureRecord(row: AtlasRow) {
  return (row.theme ?? "").toLowerCase().includes("minifig") || (row.subtheme ?? "").toLowerCase().includes("minifig") || /^sw\d+/i.test(row.set_number);
}

function fieldBoost(row: AtlasRow, term: string) {
  const needle = clean(term);
  const name = clean(row.name);
  const theme = clean(row.theme ?? "");
  const subtheme = clean(row.subtheme ?? "");
  const number = clean(row.set_number);
  if (number === needle || name === needle) return 900;
  if (name.includes(needle)) return 240;
  if (theme === needle || subtheme === needle) return 260;
  if (theme.includes(needle) || subtheme.includes(needle)) return 170;
  return 0;
}

function confidence(score: number, hits: number) {
  const base = 34 + Math.min(48, hits * 13) + Math.min(14, Math.log10(Math.max(score, 1)) * 6);
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
      const score = sourceBoost + rpcRelevance + fieldBoost(row, term) + Math.max(1, 8 - termIndex) * Math.max(1, 24 - position) * 3;
      const existing = ranked.get(row.id);
      if (existing) {
        existing.score += score * 0.65;
        existing.reasons.add(term);
      } else {
        ranked.set(row.id, { row, score, reasons: new Set([term]) });
      }
    });
  }

  const searches = await Promise.all(terms.slice(0, 7).map(async (term, index) => {
    const [{ data: rpcData }, { data: directData }] = await Promise.all([
      supabase.rpc("atlas_search", { search_query: term, result_limit: 20 }),
      supabase
        .from("lego_sets")
        .select("id,set_number,name,theme,subtheme,year_released,piece_count,image_url,atlas_visibility")
        .eq("is_active", true)
        .eq("atlas_visibility", "public")
        .or(`set_number.ilike.%${term}%,name.ilike.%${term}%,theme.ilike.%${term}%,subtheme.ilike.%${term}%`)
        .limit(30),
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
