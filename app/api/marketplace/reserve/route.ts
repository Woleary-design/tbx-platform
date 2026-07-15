import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { listingId?: string } | null;
  if (!body?.listingId) return NextResponse.json({ error: "listingId is required" }, { status: 400 });

  const { data, error } = await supabase.rpc("reserve_listing", {
    target_listing_id: body.listingId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json({ reservationId: data, status: "pending_seller", expiresInHours: 12 });
}
