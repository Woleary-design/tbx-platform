import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { legoCatalogue } from "@/lib/lego/catalog";

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

  if (!error && data && data.length > 0) {
    return NextResponse.json({
      source: "atlas",
      results: data.map((set) => ({
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
