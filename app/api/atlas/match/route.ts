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

function compact(value: string) {
  return clean(value).replace(/[^a-z0-9]/g, "");
}

function normalizeWord(word: string) {
  if (word.length > 4 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function variants(term: string) {
  const base = clean(term);
  const joined = compact(term);
  const out = new Set<string>([base, joined]);
  if (joined) {
    out.add(joined.replace(/([0-9])([a-z])/g, "$1-$2"));
    out.add(joined.replace(/([a-z])([0-9])/g, "$1-$2"));
    out.add(joined.replace(/([a-z])([0-9])/g, "$1-$2").replace(/([0-9])([a-z])/g, "$1-$2"));
    out.add(joined.replace(/([0-9])([a-z])/g, "$1 $2"));
    out.add(joined.replace(/([a-z])([0-9])/g, "$1 $2"));
  }
  return [...out].filter(Boolean);
}

function searchTerms(text: string) {
  const words = clean(text)
    .split(" ")
    .map(normalizeWord)
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word));
  return [...new Set(words)].slice(0, 8);
}

function isMinifigureRecord(row: AtlasRow) {
  return (row.theme ?? "").toLowerCase().includes("minifig") || (row.subtheme ?? "").toLowerCase().includes("minifig") || /^sw\d+/i.test(row.set_number);
}

function fieldBoost(row: AtlasRow, term: string) {
  const needle = clean(term);
  const needleCompact = compact(term);
  const name = clean(row.name);
  const theme = clean(row.theme ?? "");
  const subtheme = clean(row.subtheme ?? "");
  const number = clean(row.set_number);
  const nameCompact = compact(row.name);
  const numberCompact = compact(row.set_number);

  if (number === needle || name === needle) return 900;
  if (needleCompact && (nameCompact === needleCompact || numberCompact === needleCompact)) return 880;
  if (needleCompact && (nameCompact.includes(needleCompact) || numberCompact.includes(needleCompact))) return 420;
  if (name.includes(needle)) return 240;
  if (theme === needle || subtheme === needle) return 260;
  if (theme.includes(needle) || subtheme.includes(needle)) return 170;
  return 0;
}

function confidence(score: number, hits: number) {
  const base = 38 + Math.min(46, hits * 13) + Math.min(12, Math.log10(Math.max(score, 1)) * 5);
  return Math.max(32, Math.min(97, Math.round(base)));
}

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const kind = request.nextUrl.searchParams.get("kind") ?? "set";
  if (text.length < 2) return NextResponse.json({ results: [] });

  const terms = searchTerms(text);
  if (!terms.length) return NextResponse.json({ results: [] });

  const supabase = await createClient();
  const ranked = new Map<string, { row: AtlasRow; score: number; reasons: Set<string> }>();
  const seenCatalogueRows = new Map<string, AtlasRow>();

  function addRows(rows: AtlasRow[], term: string, termIndex: number, sourceBoost: number) {
    rows.forEach((row, position) => {
      if (row.atlas_visibility && row.atlas_visibility !== "public") return;
      seenCatalogueRows.set(row.id, row);
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

  const expanded = terms.flatMap((term, index) => variants(term).map((variant) => ({ term, variant, index })));
  const searches = await Promise.all(expanded.slice(0, 24).map(async ({ term, variant, index }) => {
    const safeVariant = variant.replace(/,/g, " ");
    const [{ data: rpcData }, { data: directData }] = await Promise.all([
      supabase.rpc("atlas_search", { search_query: variant, result_limit: 24 }),
      supabase
        .from("lego_sets")
        .select("id,set_number,name,theme,subtheme,year_released,piece_count,image_url,atlas_visibility")
        .eq("is_active", true)
        .eq("atlas_visibility", "public")
        .or(`set_number.ilike.%${safeVariant}%,name.ilike.%${safeVariant}%,theme.ilike.%${safeVariant}%,subtheme.ilike.%${safeVariant}%`)
        .limit(40),
    ]);
    return { term, variant, index, rpcRows: (rpcData ?? []) as AtlasRow[], directRows: (directData ?? []) as AtlasRow[] };
  }));

  for (const search of searches) {
    const variantBoost = search.variant === search.term ? 135 : 115;
    addRows(search.rpcRows, search.term, search.index, variantBoost);
    addRows(search.directRows, search.term, search.index, variantBoost - 55);
  }

  const queryCompact = compact(text);
  const results = [...ranked.values()]
    .sort((a, b) => {
      const aExact = queryCompact && (compact(a.row.name) === queryCompact || compact(a.row.set_number) === queryCompact) ? 1 : 0;
      const bExact = queryCompact && (compact(b.row.name) === queryCompact || compact(b.row.set_number) === queryCompact) ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      const hitDiff = b.reasons.size - a.reasons.size;
      return hitDiff || b.score - a.score;
    })
    .slice(0, 8)
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

  let recognisedCharacter: string | null = null;
  if (kind === "minifigure" && results.length === 0 && queryCompact) {
    const hint = [...seenCatalogueRows.values()]
      .filter((row) => !isMinifigureRecord(row))
      .sort((a, b) => {
        const aName = compact(a.name);
        const bName = compact(b.name);
        const aExact = aName === queryCompact ? 1 : 0;
        const bExact = bName === queryCompact ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
        return aName.length - bName.length;
      })
      .find((row) => compact(row.name) === queryCompact || compact(row.name).includes(queryCompact));
    recognisedCharacter = hint?.name ?? null;
  }

  return NextResponse.json({ source: "atlas-description-match", kind, terms, recognisedCharacter, results });
}
