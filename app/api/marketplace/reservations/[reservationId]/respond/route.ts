import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ reservationId: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { reservationId } = await params;
  const body = (await request.json().catch(() => null)) as { available?: boolean } | null;
  if (typeof body?.available !== "boolean") {
    return NextResponse.json({ error: "available must be true or false" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("respond_to_reservation", {
    target_reservation_id: reservationId,
    confirm_available: body.available,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json({ status: data });
}
