import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CreateListingBody = {
  assetId?: string;
  priceZar?: number;
  region?: "south_africa" | "worldwide";
  shippingOption?: "courier" | "collection" | "courier_or_collection";
  dispatchDays?: number;
  publish?: boolean;
};

function collectionConfidence(asset: {
  original_receipt: boolean;
  instructions_complete: boolean | null;
  minifigures_complete: boolean | null;
  original_owner: boolean;
  sealed: boolean;
  condition: string;
}) {
  const checks = [
    asset.original_receipt,
    asset.instructions_complete,
    asset.minifigures_complete,
    asset.original_owner,
    asset.sealed || asset.condition !== "New Sealed",
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as CreateListingBody | null;
  const priceZar = Number(body?.priceZar);
  const dispatchDays = Number(body?.dispatchDays ?? 3);

  if (!body?.assetId) return NextResponse.json({ error: "assetId is required" }, { status: 400 });
  if (!Number.isFinite(priceZar) || priceZar <= 0) return NextResponse.json({ error: "Enter a valid asking price" }, { status: 400 });
  if (!Number.isInteger(dispatchDays) || dispatchDays < 1 || dispatchDays > 30) {
    return NextResponse.json({ error: "Dispatch time must be between 1 and 30 days" }, { status: 400 });
  }

  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("id, lego_set_id, condition, original_receipt, instructions_complete, minifigures_complete, original_owner, sealed")
    .eq("id", body.assetId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (assetError) return NextResponse.json({ error: assetError.message }, { status: 500 });
  if (!asset) return NextResponse.json({ error: "Collection Record not found" }, { status: 404 });
  if (!asset.lego_set_id) {
    return NextResponse.json({ error: "Link this Collection Record to Atlas before listing it" }, { status: 409 });
  }

  const listing = {
    seller_id: user.id,
    asset_id: asset.id,
    lego_set_id: asset.lego_set_id,
    price_zar: priceZar,
    condition: asset.condition,
    confidence_score: collectionConfidence(asset),
    region: body.region ?? "south_africa",
    shipping_option: body.shippingOption ?? "courier",
    dispatch_days: dispatchDays,
    status: body.publish === false ? "draft" : "live",
  };

  const { data, error } = await supabase
    .from("marketplace_listings")
    .insert(listing)
    .select("id, status")
    .single();

  if (error?.code === "23505") {
    return NextResponse.json({ error: "This Collection Record already has an active listing" }, { status: 409 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ listingId: data.id, status: data.status }, { status: 201 });
}
