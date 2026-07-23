import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ setNumber: string }> };

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
  product_link?: string;
  link?: string;
  thumbnail?: string;
};

const accessoryTerms = [
  "light kit",
  "lighting kit",
  "led kit",
  "light set",
  "nameplate",
  "display plaque",
  "display stand",
  "wall mount",
  "display case",
  "instructions",
  "instruction manual",
  "replacement",
  "sticker",
  "stickers",
  "minifigure only",
  "compatible with",
  "for lego",
  "motorize",
  "motorised",
  "motorized",
  "dust cover",
  "acrylic case",
  "frame",
  "keyring",
  "keychain",
  "poster",
];

const cloneTerms = [
  "building blocks",
  "building block",
  "model bricks",
  "brick model",
  "compatible bricks",
  "compatible blocks",
  "construction blocks",
  "construction bricks",
  "block set",
  "blocks set",
  "moc set",
  "moc model",
  "custom bricks",
  "unbranded",
  "clone",
  "replica",
  "alternative bricks",
  "lepin",
  "mould king",
  "mouldking",
  "cada",
  "reobrix",
  "joytoy",
  "gobricks",
  "jiestar",
  "king building blocks",
];

const stopWords = new Set(["lego", "icons", "classic", "the", "and", "with", "set"]);

function conditionFactor(condition: string) {
  const value = condition.toLowerCase();
  if (value.includes("sealed")) return 1;
  if (value.includes("open box")) return 0.9;
  if (value.includes("incomplete")) return 0.45;
  if (value.includes("complete")) return 0.72;
  return 0.7;
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function exactSetMatch(title: string, setNumber: string) {
  const baseNumber = setNumber.split("-")[0];
  const escaped = baseNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\D)${escaped}(\\D|$)`, "i").test(title);
}

function containsAnyTerm(title: string, terms: string[]) {
  const clean = normalise(title);
  return terms.some((term) => clean.includes(term));
}

function isAuthenticLegoProduct(title: string, setNumber: string, name: string) {
  const cleanTitle = normalise(title);

  if (!exactSetMatch(title, setNumber)) return false;
  if (!cleanTitle.includes("lego")) return false;
  if (containsAnyTerm(title, accessoryTerms) || containsAnyTerm(title, cloneTerms)) return false;

  const meaningfulNameTokens = normalise(name)
    .split(" ")
    .filter((token) => token.length > 2 && !stopWords.has(token));
  const matchedTokens = meaningfulNameTokens.filter((token) => cleanTitle.includes(token)).length;
  const tokenCoverage = meaningfulNameTokens.length ? matchedTokens / meaningfulNameTokens.length : 0;

  return tokenCoverage >= 0.6;
}

function relevanceScore(title: string, setNumber: string, name: string) {
  if (!isAuthenticLegoProduct(title, setNumber, name)) return 0;

  const cleanTitle = normalise(title);
  const meaningfulNameTokens = normalise(name)
    .split(" ")
    .filter((token) => token.length > 2 && !stopWords.has(token));
  const matchedTokens = meaningfulNameTokens.filter((token) => cleanTitle.includes(token)).length;
  const tokenCoverage = meaningfulNameTokens.length ? matchedTokens / meaningfulNameTokens.length : 0;

  return Math.min(0.7 + tokenCoverage * 0.3, 1);
}

function rejectPriceOutliers<T extends { price: number }>(listings: T[]) {
  if (listings.length < 3) return listings;
  const centre = median(listings.map((listing) => listing.price));
  if (centre == null) return listings;

  return listings.filter((listing) => listing.price >= centre * 0.5 && listing.price <= centre * 2);
}

async function getExternalRetailMarket(setNumber: string, name: string, condition: string) {
  const apiKey = process.env.SERPAPI_KEY;
  const query = `LEGO set ${setNumber} ${name} -light -lighting -LED -kit -stand -mount -case -instructions -stickers -compatible -blocks -bricks -MOC`;
  const searchUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;

  const emptyResult = (status: string) => ({
    provider: "google_shopping",
    status,
    searchUrl,
    retailLow: null,
    retailMedian: null,
    retailHigh: null,
    adjustedLow: null,
    adjustedRecommended: null,
    adjustedHigh: null,
    listings: [],
  });

  if (!apiKey) return emptyResult("not_configured");

  try {
    const params = new URLSearchParams({
      engine: "google_shopping",
      q: query,
      gl: "za",
      hl: "en",
      location: "Johannesburg, Gauteng, South Africa",
      api_key: apiKey,
      num: "40",
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
      next: { revalidate: 21600 },
    });
    if (!response.ok) throw new Error("External shopping search failed");

    const payload = (await response.json()) as { shopping_results?: ShoppingResult[] };
    const matchedListings = (payload.shopping_results ?? [])
      .map((result, index) => ({
        result,
        index,
        score: result.title ? relevanceScore(result.title, setNumber, name) : 0,
      }))
      .filter(({ result, score }) => Boolean(result.title) && score >= 0.88)
      .map(({ result, index, score }) => ({
        id: `external-${result.position ?? index}`,
        title: result.title ?? `${setNumber} listing`,
        source: result.source ?? "Online retailer",
        price: Number(result.extracted_price),
        href: result.product_link ?? result.link ?? searchUrl,
        thumbnail: result.thumbnail ?? null,
        condition: "New retail",
        relevance: score,
      }))
      .filter((listing) => Number.isFinite(listing.price) && listing.price >= 1000)
      .sort((a, b) => a.price - b.price);

    const listings = rejectPriceOutliers(matchedListings).slice(0, 8);
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
    return emptyResult("unavailable");
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
  const externalMarket = prices.length ? null : await getExternalRetailMarket(set.set_number, set.name, condition);

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
      confidence: externalMarket?.status === "available" ? 55 : 0,
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
