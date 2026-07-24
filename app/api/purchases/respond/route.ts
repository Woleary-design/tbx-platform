import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { reservationId?: string; available?: boolean } | null;
  if (!body?.reservationId || typeof body.available !== "boolean") {
    return NextResponse.json({ error: "reservationId and available are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { data, error } = await supabase.rpc("respond_to_purchase_reservation", {
    target_reservation_id: body.reservationId,
    confirm_available: body.available,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json({ status: data });
}
