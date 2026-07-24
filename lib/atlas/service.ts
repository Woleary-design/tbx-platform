import type { SupabaseClient } from "@supabase/supabase-js";

export const atlasSetFields = "id, set_number, name, theme, subtheme, year_released, year_retired, piece_count, minifigure_count, image_url, retail_price_zar, instructions_url, barcode";

export type AtlasSetRecord = {
  id: string;
  set_number: string;
  name: string;
  theme: string | null;
  subtheme: string | null;
  year_released: number | null;
  year_retired: number | null;
  piece_count: number | null;
  minifigure_count: number | null;
  image_url: string | null;
  retail_price_zar: number | null;
  instructions_url: string | null;
  barcode: string | null;
};

export async function getAtlasSetByNumber(supabase: SupabaseClient, setNumber: string) {
  return supabase
    .from("lego_sets")
    .select(atlasSetFields)
    .eq("set_number", setNumber)
    .eq("is_active", true)
    .maybeSingle<AtlasSetRecord>();
}

export async function searchAtlas(supabase: SupabaseClient, query: string, limit = 12) {
  const clean = query.trim().replaceAll(",", " ");
  if (clean.length < 2) return { data: [] as AtlasSetRecord[], error: null };

  return supabase
    .from("lego_sets")
    .select(atlasSetFields)
    .eq("is_active", true)
    .or(`set_number.ilike.%${clean}%,name.ilike.%${clean}%,theme.ilike.%${clean}%,subtheme.ilike.%${clean}%`)
    .order("year_released", { ascending: false, nullsFirst: false })
    .limit(limit)
    .returns<AtlasSetRecord[]>();
}
