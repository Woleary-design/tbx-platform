import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ setNumber: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { setNumber } = await params;
  const condition = new URL(request.url).searchParams.get("condition") ?? "Used Complete";
  const supabase = await createClient();

  const { data: set, error: setError } = await supabase
    .from("lego_sets")
    .select("id, set_number, name, image_url")
    .eq("set_number", decodeURIComponent(setNumber))
    .maybeSingle();

  if (setError) return NextResponse.json({ error: setError.message }, { status: 500 });
  if (!set) return NextResponse.json({ error: "Set not found" }, { status: 404 });

  const { data: collectible, error: collectibleError } = await supabase
    .from("collectibles")
    .select("id")
    .eq("lego_set_id", set.id)
    .maybeSingle();

  if (collectibleError) return NextResponse.json({ error: collectibleError.message }, { status: 500 });
  if (!collectible) return NextResponse.json({ error: "Market record not ready" }, { status: 404 });

  const { data, error } = await supabase.rpc("seller_value_quote", {
    target_collectible_id: collectible.id,
    target_condition: condition,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const quote = Array.isArray(data) ? data[0] : data;

  return NextResponse.json({
    set: {
      setNumber: set.set_number,
      name: set.name,
      imageUrl: set.image_url,
    },
    condition,
    quote: quote ?? {
      estimated_value: null,
      quick_sale: null,
      recommended: null,
      premium: null,
      confidence: 0,
      verified_sales: 0,
      active_listings: 0,
      last_sale: null,
      data_status: "insufficient_data",
    },
  });
}
