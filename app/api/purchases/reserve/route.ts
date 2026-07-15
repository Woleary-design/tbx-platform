import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { listingId?: string } | null;
  if (!body?.listingId) return NextResponse.json({ error: "listingId is required" }, { status: 400 });

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { data, error } = await supabase.rpc("reserve_listing_for_purchase", {
    target_listing_id: body.listingId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json({ reservationId: data, status: "awaiting_seller" });
}
