import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ setNumber: string }>;
};

type MarketplaceListing = {
  id: string;
  price_zar: number | string;
  condition: string;
  published_at: string | null;
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

  const quotePromise = collectible
    ? supabase.rpc("seller_value_quote", {
        target_collectible_id: collectible.id,
        target_condition: condition,
      })
    : Promise.resolve({ data: null, error: null });

  const listingsPromise = supabase
    .from("marketplace_listings")
    .select("id, price_zar, condition, published_at")
    .eq("status", "live")
    .eq("lego_set_id", set.id)
    .order("price_zar", { ascending: true })
    .limit(12);

  const [{ data, error }, { data: listingData, error: listingError }] = await Promise.all([
    quotePromise,
    listingsPromise,
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const quote = Array.isArray(data) ? data[0] : data;
  const listings = listingError ? [] : ((listingData ?? []) as MarketplaceListing[]);
  const prices = listings.map((listing) => Number(listing.price_zar)).filter(Number.isFinite);

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
      active_listings: listings.length,
      last_sale: null,
      data_status: collectible ? "insufficient_data" : "market_record_pending",
    },
    market: {
      lowestAsking: prices.length ? Math.min(...prices) : null,
      highestAsking: prices.length ? Math.max(...prices) : null,
      activeListingCount: listings.length,
      listings: listings.map((listing) => ({
        id: listing.id,
        price: Number(listing.price_zar),
        condition: listing.condition,
        publishedAt: listing.published_at,
        href: `/marketplace/${listing.id}`,
      })),
    },
  });
}
