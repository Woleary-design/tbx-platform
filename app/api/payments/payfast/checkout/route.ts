import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkoutFields, sandboxConfig, sandboxHost } from "@/lib/payments/payfast";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const config = sandboxConfig();
  if (!config) return NextResponse.json({ error: "Sandbox payments are not enabled." }, { status: 503 });
  if (request.headers.get("origin") !== config.siteUrl) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (typeof body?.reservationId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.reservationId)) return NextResponse.json({ error: "Invalid reservation" }, { status: 400 });
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  // The database checks ownership, seller confirmation, expiry, and ZAR amount.
  const { data: attempt, error } = await supabase.rpc("start_payfast_sandbox_attempt", { target_reservation_id: body.reservationId });
  if (error || !attempt) return NextResponse.json({ error: "This reservation cannot start a sandbox payment." }, { status: 409 });
  return NextResponse.json({ mode: "sandbox", action: `${sandboxHost}/eng/process`, fields: checkoutFields(config, { ...attempt, amount: String(attempt.amount) }) });
}
