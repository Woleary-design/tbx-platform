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

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase();
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
  const cleanQuery = normalize(query).replace(/[^a-z0-9]/g, "");
  return legoCatalogue
    .filter((set) => {
      const number = normalize(set.setNumber).replace(/[^a-z0-9]/g, "");
      const name = normalize(set.name).replace(/[^a-z0-9]/g, "");
      const theme = normalize(set.theme).replace(/[^a-z0-9]/g, "");
      return (number.includes(cleanQuery) || name.includes(cleanQuery) || theme.includes(cleanQuery)) &&
        isCollectorCatalogueRecord({ name: set.name, theme: set.theme, piece_count: null });
    })
    .sort((a, b) => {
      const aNumber = normalize(a.setNumber).replace(/[^a-z0-9]/g, "");
      const bNumber = normalize(b.setNumber).replace(/[^a-z0-9]/g, "");
      return Number(bNumber === cleanQuery) - Number(aNumber === cleanQuery) || (b.year ?? 0) - (a.year ?? 0);
    })
    .slice(0, MAX_RESULTS);
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const requestedLimit = Number.parseInt(request.nextUrl.searchParams.get("limit") ?? String(MAX_RESULTS), 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : MAX_RESULTS;

  if (query.length < 2) return NextResponse.json({ source: "atlas", results: [] });

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

  if (!error && visibleRows.length > 0) {
    const results = visibleRows.map(toClientSet);
    const top = results[0];
    const exact = top.matchReason === "set_number" || top.matchReason === "exact_name";
    const didYouMean = !exact && top.relevance >= 250 ? top.name : null;
    const exactTheme = results.find((set) => normalize(set.theme) === normalize(query))?.theme ?? null;
    const exactSubtheme = results.find((set) => normalize(set.subtheme) === normalize(query))?.subtheme ?? null;

    return NextResponse.json({
      source: "atlas",
      matchType: exactTheme ? "theme" : exactSubtheme ? "subtheme" : top.matchReason,
      matchedCategory: exactTheme ?? exactSubtheme,
      didYouMean,
      results,
    });
  }

  const fallback = starterFallback(query);
  return NextResponse.json({
    source: "starter",
    results: fallback,
    warning: error?.message,
  });
}
