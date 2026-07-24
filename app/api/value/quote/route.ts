import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const legoSetId = request.nextUrl.searchParams.get("legoSetId");
  const condition = request.nextUrl.searchParams.get("condition") ?? "Used Complete";

  if (!legoSetId) {
    return NextResponse.json({ error: "legoSetId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("tbx_seller_value_quote", {
    target_lego_set_id: legoSetId,
    target_condition: condition,
    target_currency: "ZAR",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
