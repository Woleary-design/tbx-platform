import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { marketplaceReadiness } from "@/lib/marketplace/readiness";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { listingId?: string } | null;
  if (!body?.listingId) return NextResponse.json({ error: "listingId is required" }, { status: 400 });

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  if (marketplaceReadiness.requireVerifiedSellers) {
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("collectors!listings_seller_id_fkey(identity_verified,address_verified,payment_verified)")
      .eq("id", body.listingId)
      .eq("status", "Active")
      .maybeSingle();
    if (listingError) return NextResponse.json({ error: "Seller verification could not be confirmed." }, { status: 503 });
    const collector = Array.isArray(listing?.collectors) ? listing.collectors[0] : listing?.collectors;
    if (!collector?.identity_verified || !collector.address_verified || !collector.payment_verified) {
      return NextResponse.json({ error: "This seller must complete identity, address and payout verification before accepting reservations." }, { status: 409 });
    }
  }

  const { data, error } = await supabase.rpc("reserve_listing_for_purchase", {
    target_listing_id: body.listingId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json({ reservationId: data, status: "awaiting_seller" });
}
