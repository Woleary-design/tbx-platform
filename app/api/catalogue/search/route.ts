import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { legoCatalogue } from "@/lib/lego/catalog";

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

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_lego_sets", {
    search_term: query,
    result_limit: 10,
  });

  const atlasResults = (data ?? []) as AtlasSearchRow[];

  if (!error && atlasResults.length > 0) {
    return NextResponse.json({
      source: "atlas",
      results: atlasResults.map((set) => ({
        id: set.id,
        setNumber: set.set_number,
        name: set.name,
        theme: set.theme ?? "LEGO",
        subtheme: set.subtheme,
        year: set.year_released,
        pieces: set.piece_count,
        minifigures: set.minifigure_count,
        imageUrl: set.image_url,
      })),
    });
  }

  const cleanQuery = query.toLowerCase();
  const fallback = legoCatalogue
    .filter(
      (set) =>
        set.setNumber.toLowerCase().includes(cleanQuery) ||
        set.name.toLowerCase().includes(cleanQuery) ||
        set.theme.toLowerCase().includes(cleanQuery),
    )
    .slice(0, 10);

  return NextResponse.json({
    source: "starter",
    results: fallback,
    warning: error?.message,
  });
}
