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
};

const atlasSelect = "id, set_number, name, theme, subtheme, year_released, piece_count, minifigure_count, image_url";
const MAX_RESULTS = 40;
const QUERY_LIMIT = 120;

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase();
}

function rankResult(set: AtlasSearchRow, query: string) {
  const setNumber = normalize(set.set_number);
  const name = normalize(set.name);
  const theme = normalize(set.theme);
  const subtheme = normalize(set.subtheme);
  if (setNumber === query) return 0;
  if (theme === query) return 1;
  if (subtheme === query) return 2;
  if (name === query) return 3;
  if (setNumber.startsWith(query)) return 4;
  if (name.startsWith(query)) return 5;
  if (theme.startsWith(query)) return 6;
  if (subtheme.startsWith(query)) return 7;
  if (name.includes(query)) return 8;
  if (theme.includes(query)) return 9;
  if (subtheme.includes(query)) return 10;
  return 11;
}

function dedupeAndRank(rows: AtlasSearchRow[], query: string) {
  const unique = new Map<string, AtlasSearchRow>();
  for (const row of rows) {
    if (isCollectorCatalogueRecord(row)) unique.set(row.id, row);
  }
  return [...unique.values()]
    .sort((a, b) => {
      const rankDifference = rankResult(a, query) - rankResult(b, query);
      if (rankDifference !== 0) return rankDifference;
      return (b.year_released ?? 0) - (a.year_released ?? 0) || a.name.localeCompare(b.name);
    })
    .slice(0, MAX_RESULTS);
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
  };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ results: [] });

  const supabase = await createClient();
  const pattern = `%${query.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
  const [numberResult, nameResult, themeResult, subthemeResult] = await Promise.all([
    supabase.from("lego_sets").select(atlasSelect).eq("is_active", true).ilike("set_number", pattern).limit(QUERY_LIMIT),
    supabase.from("lego_sets").select(atlasSelect).eq("is_active", true).ilike("name", pattern).limit(QUERY_LIMIT),
    supabase.from("lego_sets").select(atlasSelect).eq("is_active", true).ilike("theme", pattern).limit(QUERY_LIMIT),
    supabase.from("lego_sets").select(atlasSelect).eq("is_active", true).ilike("subtheme", pattern).limit(QUERY_LIMIT),
  ]);

  const errors = [numberResult.error, nameResult.error, themeResult.error, subthemeResult.error].filter(Boolean);
  const rows = [
    ...(numberResult.data ?? []),
    ...(nameResult.data ?? []),
    ...(themeResult.data ?? []),
    ...(subthemeResult.data ?? []),
  ] as AtlasSearchRow[];

  if (rows.length > 0) {
    const cleanQuery = normalize(query);
    const results = dedupeAndRank(rows, cleanQuery);
    const exactTheme = results.find((set) => normalize(set.theme) === cleanQuery)?.theme ?? null;
    const exactSubtheme = results.find((set) => normalize(set.subtheme) === cleanQuery)?.subtheme ?? null;
    return NextResponse.json({
      source: "atlas",
      matchType: exactTheme ? "theme" : exactSubtheme ? "subtheme" : "sets",
      matchedCategory: exactTheme ?? exactSubtheme,
      results: results.map(toClientSet),
    });
  }

  const cleanQuery = normalize(query);
  const fallback = legoCatalogue
    .filter((set) =>
      (normalize(set.setNumber).includes(cleanQuery) || normalize(set.name).includes(cleanQuery) || normalize(set.theme).includes(cleanQuery)) &&
      isCollectorCatalogueRecord({ name: set.name, theme: set.theme, piece_count: null }),
    )
    .sort((a, b) => (normalize(a.theme) === cleanQuery ? 0 : 1) - (normalize(b.theme) === cleanQuery ? 0 : 1) || (b.year ?? 0) - (a.year ?? 0))
    .slice(0, MAX_RESULTS);

  return NextResponse.json({ source: "starter", results: fallback, warning: errors.map((error) => error?.message).filter(Boolean).join("; ") || undefined });
}
