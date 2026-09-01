import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { legoCatalogue } from "@/lib/lego/catalog";
import { isCollectorCatalogueRecord, normalizeCatalogueTheme } from "@/lib/lego/catalogue-visibility";

type AtlasSearchRow = {
  id: string;
  set_number: string;
  name: string;
  theme: string | null;
  subtheme: string | null;
  year_released: number | null;
  piece_count: number | null;
  minifigure_count: number | null;
  image_url: string | null;
  relevance?: number | string | null;
  match_reason?: string | null;
  atlas_visibility?: string | null;
};

const MAX_RESULTS = 40;
const COMMON_ATLAS_TERMS = [
  "ninjago",
  "technic",
  "icons",
  "city",
  "friends",
  "star wars",
  "harry potter",
  "creator",
  "speed champions",
  "architecture",
  "ideas",
];

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase();
}

function compact(value: string | null | undefined) {
  return normalize(value).replace(/[^a-z0-9]/g, "");
}

function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      );
    }
    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j];
  }

  return previous[b.length];
}

function fuzzyCorrection(query: string) {
  const clean = compact(query);
  if (clean.length < 4 || /^\d+$/.test(clean)) return null;

  const vocabulary = new Set<string>(COMMON_ATLAS_TERMS.map(compact));
  for (const set of legoCatalogue) {
    const theme = compact(set.theme);
    if (theme.length >= 4) vocabulary.add(theme);
    for (const token of normalize(set.name).split(/\s+/)) {
      const candidate = compact(token);
      if (candidate.length >= 5) vocabulary.add(candidate);
    }
  }

  let best: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of vocabulary) {
    if (Math.abs(candidate.length - clean.length) > 2) continue;
    const distance = levenshtein(clean, candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  const maxDistance = clean.length >= 8 ? 2 : 1;
  return best && best !== clean && bestDistance <= maxDistance ? best : null;
}

function toClientSet(set: AtlasSearchRow) {
  return {
    id: set.id,
    setNumber: set.set_number,
    name: set.name,
    theme: normalizeCatalogueTheme(set.theme) ?? "LEGO",
    subtheme: set.subtheme,
    year: set.year_released,
    pieces: set.piece_count,
    minifigures: set.minifigure_count,
    imageUrl: set.image_url,
    relevance: Number(set.relevance ?? 0),
    matchReason: set.match_reason ?? "related",
  };
}

function starterFallback(query: string) {
  const cleanQuery = compact(query);
  return legoCatalogue
    .filter((set) => {
      const number = compact(set.setNumber);
      const name = compact(set.name);
      const theme = compact(set.theme);
      return (number.includes(cleanQuery) || name.includes(cleanQuery) || theme.includes(cleanQuery)) &&
        isCollectorCatalogueRecord({ name: set.name, theme: set.theme, piece_count: null });
    })
    .sort((a, b) => {
      const aNumber = compact(a.setNumber);
      const bNumber = compact(b.setNumber);
      return Number(bNumber === cleanQuery) - Number(aNumber === cleanQuery) || (b.year ?? 0) - (a.year ?? 0);
    })
    .slice(0, MAX_RESULTS);
}

async function searchAtlas(query: string, limit: number) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("atlas_search", {
    search_query: query,
    result_limit: Math.min(limit * 3, 100),
  });

  const candidateRows = (data ?? []) as AtlasSearchRow[];
  const candidateIds = candidateRows.map((row) => row.id);
  let publicIds = new Set<string>();

  if (candidateIds.length > 0) {
    const { data: curatedRows } = await supabase
      .from("lego_sets")
      .select("id")
      .in("id", candidateIds)
      .eq("is_active", true)
      .eq("atlas_visibility", "public");
    publicIds = new Set((curatedRows ?? []).map((row) => row.id as string));
  }

  const visibleRows = candidateRows
    .filter((row) => publicIds.has(row.id))
    .map((row) => ({ ...row, atlas_visibility: "public" }))
    .filter((row) => isCollectorCatalogueRecord(row))
    .slice(0, limit);

  return { visibleRows, error };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const requestedLimit = Number.parseInt(request.nextUrl.searchParams.get("limit") ?? String(MAX_RESULTS), 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : MAX_RESULTS;

  if (query.length < 2) return NextResponse.json({ source: "atlas", results: [] });

  let searchQuery = query;
  let { visibleRows, error } = await searchAtlas(searchQuery, limit);
  let correctedQuery: string | null = null;

  if (!error && visibleRows.length === 0) {
    correctedQuery = fuzzyCorrection(query);
    if (correctedQuery) {
      searchQuery = correctedQuery;
      const corrected = await searchAtlas(searchQuery, limit);
      visibleRows = corrected.visibleRows;
      error = corrected.error;
    }
  }

  if (!error && visibleRows.length > 0) {
    const results = visibleRows.map(toClientSet);
    const top = results[0];
    const exact = top.matchReason === "set_number" || top.matchReason === "exact_name";
    const didYouMean = correctedQuery ?? (!exact && top.relevance >= 250 ? top.name : null);
    const exactTheme = results.find((set) => normalize(set.theme) === normalize(searchQuery))?.theme ?? null;
    const exactSubtheme = results.find((set) => normalize(set.subtheme) === normalize(searchQuery))?.subtheme ?? null;

    return NextResponse.json({
      source: "atlas",
      query,
      correctedQuery,
      matchType: exactTheme ? "theme" : exactSubtheme ? "subtheme" : top.matchReason,
      matchedCategory: exactTheme ?? exactSubtheme,
      didYouMean,
      results,
    });
  }

  const fallbackQuery = correctedQuery ?? query;
  const fallback = starterFallback(fallbackQuery);
  return NextResponse.json({
    source: "starter",
    query,
    correctedQuery,
    didYouMean: correctedQuery,
    results: fallback,
    warning: error?.message,
  });
}
