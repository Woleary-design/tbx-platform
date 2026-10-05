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
  const { data: reservation, error: reservationError } = await supabase
    .from("purchase_reservations")
    .select("buyer_id,listings(value_quote)")
    .eq("id", body.reservationId)
    .maybeSingle();
  if (reservationError || !reservation || reservation.buyer_id !== data.user.id) {
    return NextResponse.json({ error: "This order is unavailable." }, { status: 409 });
  }
  const listing = Array.isArray(reservation.listings) ? reservation.listings[0] : reservation.listings;
  if (!listing) return NextResponse.json({ error: "Order pricing could not be confirmed." }, { status: 409 });
  // Buyer-paid orders cannot use an item-only amount while courier quotes are pending.
  if (listing?.value_quote?.sellerFundsShipping === false) {
    return NextResponse.json({ error: "Delivery quote pending. Your full total must be confirmed before payment." }, { status: 409 });
  }
  // The database checks ownership, seller confirmation, expiry, and ZAR amount.
  const { data: attempt, error } = await supabase.rpc("start_payfast_sandbox_attempt", { target_reservation_id: body.reservationId });
  if (error || !attempt) return NextResponse.json({ error: "This reservation cannot start a sandbox payment." }, { status: 409 });
  return NextResponse.json({ mode: "sandbox", action: `${sandboxHost}/eng/process`, fields: checkoutFields(config, { ...attempt, amount: String(attempt.amount) }) });
}
