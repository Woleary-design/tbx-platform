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
  const unique = [...new Set(words)];
  const phrases: string[] = [];
  if (unique.length >= 2) phrases.push(unique.slice(0, 4).join(" "));
  phrases.push(...unique.slice(0, 6));
  return [...new Set(phrases)].slice(0, 6);
}

function confidence(score: number) {
  return Math.max(25, Math.min(96, Math.round(35 + Math.log10(Math.max(score, 1)) * 22)));
}

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const kind = request.nextUrl.searchParams.get("kind") ?? "set";
  if (text.length < 2) return NextResponse.json({ results: [] });

  const terms = searchTerms(text);
  if (!terms.length) return NextResponse.json({ results: [] });

  const supabase = await createClient();
  const ranked = new Map<string, { row: AtlasRow; score: number; reasons: Set<string> }>();

  const searches = await Promise.all(
    terms.map(async (term, index) => {
      const { data } = await supabase.rpc("atlas_search", { search_query: term, result_limit: 24 });
      return { term, index, rows: (data ?? []) as AtlasRow[] };
    }),
  );

  for (const { term, index, rows } of searches) {
    for (let position = 0; position < rows.length; position += 1) {
      const row = rows[position];
      if (row.atlas_visibility && row.atlas_visibility !== "public") continue;
      const minifigureRecord = (row.theme ?? "").toLowerCase().includes("minifig") || (row.subtheme ?? "").toLowerCase().includes("minifig") || /^sw\d+/i.test(row.set_number);
      if (kind === "minifigure" && !minifigureRecord) continue;
      if (kind === "set" && minifigureRecord) continue;

      const rpcRelevance = Number(row.relevance ?? 0);
      const termWeight = Math.max(1, 6 - index);
      const rankWeight = Math.max(1, 24 - position);
      const exactBoost = clean(row.set_number) === clean(term) || clean(row.name) === clean(term) ? 900 : 0;
      const score = rpcRelevance + termWeight * rankWeight * 5 + exactBoost;
      const existing = ranked.get(row.id);
      if (existing) {
        existing.score += score * 0.6;
        existing.reasons.add(term);
      } else {
        ranked.set(row.id, { row, score, reasons: new Set([term]) });
      }
    }
  }

  const results = [...ranked.values()]
    .sort((a, b) => b.score - a.score)
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
      confidence: confidence(score),
      matchedOn: [...reasons].slice(0, 3),
    }));

  return NextResponse.json({ source: "atlas-description-match", kind, results });
}
