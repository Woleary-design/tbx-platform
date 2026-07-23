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

type ShoppingResult = {
  position?: number;
  title?: string;
  source?: string;
  extracted_price?: number;
  price?: string;
  product_link?: string;
  link?: string;
  thumbnail?: string;
};

function conditionFactor(condition: string) {
  const value = condition.toLowerCase();
  if (value.includes("sealed")) return 1;
  if (value.includes("open box")) return 0.9;
  if (value.includes("complete")) return 0.72;
  if (value.includes("incomplete")) return 0.45;
  return 0.7;
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function exactSetMatch(title: string, setNumber: string) {
  const baseNumber = setNumber.split("-")[0];
  const escaped = baseNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\D)${escaped}(\\D|$)`, "i").test(title);
}

async function getExternalRetailMarket(setNumber: string, name: string, condition: string) {
  const apiKey = process.env.SERPAPI_KEY;
  const searchUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(`LEGO ${setNumber} ${name}`)}`;

  if (!apiKey) {
    return {
      provider: "google_shopping",
      status: "not_configured",
      searchUrl,
      retailLow: null,
      retailMedian: null,
      retailHigh: null,
      adjustedLow: null,
      adjustedRecommended: null,
      adjustedHigh: null,
      listings: [],
    };
  }

  try {
    const params = new URLSearchParams({
      engine: "google_shopping",
      q: `LEGO ${setNumber} ${name}`,
      gl: "za",
      hl: "en",
      location: "Johannesburg, Gauteng, South Africa",
      api_key: apiKey,
      num: "20",
    });
    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
      next: { revalidate: 21600 },
    });
    if (!response.ok) throw new Error("External shopping search failed");

    const payload = (await response.json()) as { shopping_results?: ShoppingResult[] };
    const listings = (payload.shopping_results ?? [])
      .filter((result) => result.title && exactSetMatch(result.title, setNumber))
      .map((result, index) => ({
        id: `external-${result.position ?? index}`,
        title: result.title ?? `${setNumber} listing`,
        source: result.source ?? "Online retailer",
        price: Number(result.extracted_price),
        href: result.product_link ?? result.link ?? searchUrl,
        thumbnail: result.thumbnail ?? null,
        condition: "New retail",
      }))
      .filter((listing) => Number.isFinite(listing.price) && listing.price > 0)
      .sort((a, b) => a.price - b.price)
      .slice(0, 8);

    const prices = listings.map((listing) => listing.price);
    const retailLow = prices.length ? Math.min(...prices) : null;
    const retailHigh = prices.length ? Math.max(...prices) : null;
    const retailMedian = median(prices);
    const factor = conditionFactor(condition);

    return {
      provider: "google_shopping",
      status: listings.length ? "available" : "no_exact_matches",
      searchUrl,
      retailLow,
      retailMedian,
      retailHigh,
      adjustedLow: retailLow == null ? null : Math.round(retailLow * factor),
      adjustedRecommended: retailMedian == null ? null : Math.round(retailMedian * factor),
      adjustedHigh: retailHigh == null ? null : Math.round(retailHigh * factor),
      listings,
    };
  } catch {
    return {
      provider: "google_shopping",
      status: "unavailable",
      searchUrl,
      retailLow: null,
      retailMedian: null,
      retailHigh: null,
      adjustedLow: null,
      adjustedRecommended: null,
      adjustedHigh: null,
      listings: [],
    };
  }
}

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
  const externalMarket = prices.length
    ? null
    : await getExternalRetailMarket(set.set_number, set.name, condition);

  return NextResponse.json({
    set: {
      setNumber: set.set_number,
      name: set.name,
      imageUrl: set.image_url,
    },
    condition,
    quote: quote ?? {
      estimated_value: externalMarket?.adjustedRecommended ?? null,
      quick_sale: externalMarket?.adjustedLow ?? null,
      recommended: externalMarket?.adjustedRecommended ?? null,
      premium: externalMarket?.adjustedHigh ?? null,
      confidence: externalMarket?.status === "available" ? 45 : 0,
      verified_sales: 0,
      active_listings: listings.length,
      last_sale: null,
      data_status: externalMarket?.status === "available" ? "external_retail_anchor" : collectible ? "insufficient_data" : "market_record_pending",
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
    externalMarket,
  });
}
