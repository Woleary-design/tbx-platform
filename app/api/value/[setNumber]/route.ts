import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildAtlasPricing } from "@/lib/atlas/pricing-engine";

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

type LegoSet = {
  id: string;
  set_number: string;
  name: string;
  image_url: string | null;
};

const accessoryTerms = [
  "light kit", "lighting kit", "led kit", "light set", "nameplate", "display plaque",
  "display stand", "wall mount", "display case", "instructions", "instruction manual",
  "replacement", "sticker", "stickers", "minifigure only", "compatible with", "for lego",
  "motorize", "motorised", "motorized", "dust cover", "acrylic case", "frame", "keyring",
  "keychain", "poster",
];

const cloneTerms = [
  "building blocks", "building block", "model bricks", "brick model", "compatible bricks",
  "compatible blocks", "construction blocks", "construction bricks", "block set", "blocks set",
  "moc set", "moc model", "custom bricks", "unbranded", "clone", "replica",
  "alternative bricks", "lepin", "mould king", "mouldking", "cada", "reobrix", "joytoy",
  "gobricks", "jiestar", "king building blocks",
];

const stopWords = new Set(["lego", "icons", "classic", "architecture", "the", "and", "with", "set"]);

function canonicalSetNumber(value: string) {
  return decodeURIComponent(value).trim().toUpperCase().replace(/^LEGO\s+/i, "").split("-")[0];
}

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

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function exactSetMatch(title: string, setNumber: string) {
  const escaped = canonicalSetNumber(setNumber).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\D)${escaped}(\\D|$)`, "i").test(title);
}

function containsAnyTerm(title: string, terms: string[]) {
  const clean = normalise(title);
  return terms.some((term) => clean.includes(term));
}

function relevanceScore(title: string, setNumber: string, name: string) {
  const cleanTitle = normalise(title);
  if (!exactSetMatch(title, setNumber)) return 0;
  if (containsAnyTerm(title, accessoryTerms) || containsAnyTerm(title, cloneTerms)) return 0;

  let score = cleanTitle.includes("lego") ? 0.82 : 0.72;
  const tokens = normalise(name)
    .split(" ")
    .filter((token) => token.length > 2 && !stopWords.has(token));
  const coverage = tokens.length ? tokens.filter((token) => cleanTitle.includes(token)).length / tokens.length : 0;
  score += coverage * 0.18;
  return Math.min(score, 1);
}

function rejectPriceOutliers<T extends { price: number }>(listings: T[]) {
  if (listings.length < 3) return listings;
  const centre = median(listings.map((listing) => listing.price));
  if (centre == null) return listings;
  return listings.filter((listing) => listing.price >= centre * 0.45 && listing.price <= centre * 2.2);
}

async function resolveAtlasProduct(supabase: Awaited<ReturnType<typeof createClient>>, requested: string) {
  const canonical = canonicalSetNumber(requested);
  const candidates = [canonical, `${canonical}-1`];

  const exact = await supabase
    .from("lego_sets")
    .select("id, set_number, name, image_url")
    .in("set_number", candidates)
    .limit(1)
    .maybeSingle();

  if (exact.error) return { set: null, error: exact.error };
  if (exact.data) return { set: exact.data as LegoSet, error: null };

  const variant = await supabase
    .from("lego_sets")
    .select("id, set_number, name, image_url")
    .ilike("set_number", `${canonical}-%`)
    .order("set_number", { ascending: true })
    .limit(1)
    .maybeSingle();

  return { set: (variant.data as LegoSet | null) ?? null, error: variant.error };
}

async function runShoppingSearch(query: string, apiKey: string) {
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
  return (await response.json()) as { shopping_results?: ShoppingResult[] };
}

function extractOfficialPrice(html: string) {
  const patterns = [
    /property=["']product:price:amount["'][^>]*content=["']([0-9.,]+)["']/i,
    /content=["']([0-9.,]+)["'][^>]*property=["']product:price:amount["']/i,
    /["']price["']\s*:\s*["']?([0-9]+(?:\.[0-9]+)?)["']?/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) continue;
    const value = Number(match[1].replace(/,/g, ""));
    if (Number.isFinite(value) && value >= 100) return value;
  }
  return null;
}

async function getOfficialLegoMarket(setNumber: string, name: string, condition: string) {
  const canonical = canonicalSetNumber(setNumber);
  const productUrl = `https://www.lego.com/en-za/product/${slugify(name)}-${canonical}`;
  try {
    const response = await fetch(productUrl, {
      headers: { "user-agent": "Mozilla/5.0 TBX Atlas Pricing" },
      next: { revalidate: 21600 },
    });
    if (!response.ok) return null;
    const html = await response.text();
    const retailPrice = extractOfficialPrice(html);
    if (!retailPrice) return null;
    const factor = conditionFactor(condition);
    const adjusted = Math.round(retailPrice * factor);
    return {
      provider: "lego_official_za",
      status: "available",
      searchUrl: productUrl,
      retailLow: retailPrice,
      retailMedian: retailPrice,
      retailHigh: retailPrice,
      adjustedLow: adjusted,
      adjustedRecommended: adjusted,
      adjustedHigh: adjusted,
      listings: [{
        id: `lego-official-${canonical}`,
        title: `LEGO ${canonical} ${name}`,
        source: "LEGO South Africa",
        price: retailPrice,
        href: productUrl,
        thumbnail: null,
        condition: "New retail",
        relevance: 1,
      }],
    };
  } catch {
    return null;
  }
}

async function getExternalRetailMarket(setNumber: string, name: string, condition: string) {
  const apiKey = process.env.SERPAPI_KEY;
  const canonical = canonicalSetNumber(setNumber);
  const strictQuery = `LEGO ${canonical} ${name}`;
  const fallbackQuery = `LEGO ${canonical}`;
  const searchUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(fallbackQuery)}`;

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

  if (!apiKey) {
    return (await getOfficialLegoMarket(canonical, name, condition)) ?? emptyResult("not_configured");
  }

  try {
    const strictPayload = await runShoppingSearch(strictQuery, apiKey);
    let results = strictPayload.shopping_results ?? [];
    let accepted = results.filter((result) => result.title && relevanceScore(result.title, canonical, name) >= 0.8);

    if (!accepted.length) {
      const fallbackPayload = await runShoppingSearch(fallbackQuery, apiKey);
      results = fallbackPayload.shopping_results ?? [];
      accepted = results.filter((result) => result.title && relevanceScore(result.title, canonical, name) >= 0.72);
    }

    const matchedListings = accepted
      .map((result, index) => ({
        id: `external-${result.position ?? index}`,
        title: result.title ?? `${canonical} listing`,
        source: result.source ?? "Online retailer",
        price: Number(result.extracted_price),
        href: result.product_link ?? result.link ?? searchUrl,
        thumbnail: result.thumbnail ?? null,
        condition: "New retail",
        relevance: result.title ? relevanceScore(result.title, canonical, name) : 0,
      }))
      .filter((listing) => Number.isFinite(listing.price) && listing.price >= 100)
      .sort((a, b) => a.price - b.price);

    const listings = rejectPriceOutliers(matchedListings).slice(0, 8);
    if (!listings.length) {
      return (await getOfficialLegoMarket(canonical, name, condition)) ?? emptyResult("no_exact_matches");
    }

    const prices = listings.map((listing) => listing.price);
    const retailLow = Math.min(...prices);
    const retailHigh = Math.max(...prices);
    const retailMedian = median(prices);
    const factor = conditionFactor(condition);

    return {
      provider: "google_shopping",
      status: "available",
      searchUrl,
      retailLow,
      retailMedian,
      retailHigh,
      adjustedLow: Math.round(retailLow * factor),
      adjustedRecommended: retailMedian == null ? null : Math.round(retailMedian * factor),
      adjustedHigh: Math.round(retailHigh * factor),
      listings,
    };
  } catch {
    return (await getOfficialLegoMarket(canonical, name, condition)) ?? emptyResult("unavailable");
  }
}

export async function GET(request: Request, { params }: RouteContext) {
  const { setNumber } = await params;
  const requestedSetNumber = canonicalSetNumber(setNumber);
  const condition = new URL(request.url).searchParams.get("condition") ?? "Used Complete";
  const supabase = await createClient();

  const { set, error: setError } = await resolveAtlasProduct(supabase, requestedSetNumber);
  if (setError) return NextResponse.json({ error: setError.message }, { status: 500 });
  if (!set) return NextResponse.json({ error: "Set not found", requestedSetNumber }, { status: 404 });

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

  const internalQuote = Array.isArray(data) ? data[0] : data;
  const listings = listingError ? [] : ((listingData ?? []) as MarketplaceListing[]);
  const prices = listings.map((listing) => Number(listing.price_zar)).filter(Number.isFinite);
  const externalMarket = prices.length ? null : await getExternalRetailMarket(set.set_number, set.name, condition);
  const pricing = buildAtlasPricing({ internalQuote, livePrices: prices, externalMarket });

  return NextResponse.json({
    atlasProduct: {
      id: `atlas-lego-${requestedSetNumber}`,
      category: "LEGO",
      requestedIdentifier: requestedSetNumber,
      canonicalIdentifier: canonicalSetNumber(set.set_number),
      catalogueIdentifier: set.set_number,
      match: set.set_number === requestedSetNumber ? "exact" : "canonical_variant",
    },
    set: {
      setNumber: canonicalSetNumber(set.set_number),
      catalogueSetNumber: set.set_number,
      name: set.name,
      imageUrl: set.image_url,
    },
    condition,
    quote: pricing.quote,
    evidence: pricing.evidence,
    diagnostics: pricing.diagnostics,
    market: {
      lowestAsking: prices.length ? Math.min(...prices) : externalMarket?.adjustedLow ?? null,
      highestAsking: prices.length ? Math.max(...prices) : externalMarket?.adjustedHigh ?? null,
      activeListingCount: listings.length,
      evidenceCount: pricing.diagnostics.evidenceCount,
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
