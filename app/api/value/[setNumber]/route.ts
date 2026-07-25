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

type ExternalListing = {
  id: string;
  title: string;
  source: string;
  price: number;
  href: string;
  thumbnail: string | null;
  condition: string;
  relevance: number;
};

const accessoryTerms = [
  "light kit", "lighting kit", "led kit", "light set", "nameplate", "display plaque",
  "display stand", "wall mount", "display case", "instructions", "instruction manual",
  "replacement", "sticker", "stickers", "minifigure only", "compatible with", "for lego",
  "motorize", "motorised", "motorized", "dust cover", "acrylic case", "frame", "keyring",
  "keychain", "poster", "display shelf", "protective case",
];

const cloneTerms = [
  "building blocks", "building block", "model bricks", "brick model", "compatible bricks",
  "compatible blocks", "construction blocks", "construction bricks", "block set", "blocks set",
  "moc set", "moc model", "custom bricks", "unbranded", "clone", "replica",
  "alternative bricks", "lepin", "mould king", "mouldking", "cada", "reobrix", "joytoy",
  "gobricks", "jiestar", "king building blocks",
];

const stopWords = new Set(["lego", "icons", "classic", "architecture", "technic", "ninjago", "the", "and", "with", "set"]);

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
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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

  let score = cleanTitle.includes("lego") ? 0.86 : 0.76;
  const tokens = normalise(name).split(" ").filter((token) => token.length > 2 && !stopWords.has(token));
  const coverage = tokens.length ? tokens.filter((token) => cleanTitle.includes(token)).length / tokens.length : 0;
  return Math.min(score + coverage * 0.14, 1);
}

function rejectPriceOutliers<T extends { price: number }>(listings: T[]) {
  if (listings.length < 3) return listings;
  const centre = median(listings.map((listing) => listing.price));
  if (centre == null) return listings;
  return listings.filter((listing) => listing.price >= centre * 0.42 && listing.price <= centre * 2.25);
}

function listingIdentity(listing: ExternalListing) {
  const href = listing.href.split("?")[0].replace(/\/$/, "");
  const title = normalise(listing.title).slice(0, 90);
  return `${normalise(listing.source)}|${href}|${title}|${Math.round(listing.price)}`;
}

function deduplicateListings(listings: ExternalListing[]) {
  const unique = new Map<string, ExternalListing>();
  for (const listing of listings) {
    const key = listingIdentity(listing);
    const existing = unique.get(key);
    if (!existing || listing.relevance > existing.relevance) unique.set(key, listing);
  }
  return [...unique.values()];
}

function buildMarket(provider: string, searchUrl: string, listings: ExternalListing[], condition: string) {
  const unique = deduplicateListings(listings);
  const cleaned = rejectPriceOutliers(unique).sort((a, b) => a.price - b.price).slice(0, 10);
  if (!cleaned.length) return null;

  const prices = cleaned.map((listing) => listing.price);
  const factor = conditionFactor(condition);
  const retailLow = Math.min(...prices);
  const retailHigh = Math.max(...prices);
  const retailMedian = median(prices) ?? retailLow;
  const adjustedAnchor = Math.round(retailMedian * factor);

  // One retailer or several identical retailer results are an anchor, not a real market range.
  const hasRealSpread = retailHigh > retailLow * 1.03;
  const adjustedLow = hasRealSpread ? Math.round(retailLow * factor) : Math.round(adjustedAnchor * 0.9);
  const adjustedHigh = hasRealSpread ? Math.round(retailHigh * factor) : Math.round(adjustedAnchor * 1.1);

  return {
    provider,
    status: "available",
    searchUrl,
    retailLow,
    retailMedian,
    retailHigh,
    adjustedLow,
    adjustedRecommended: adjustedAnchor,
    adjustedHigh,
    listings: cleaned,
  };
}

async function resolveAtlasProduct(supabase: Awaited<ReturnType<typeof createClient>>, requested: string) {
  const canonical = canonicalSetNumber(requested);
  const exact = await supabase.from("lego_sets").select("id, set_number, name, image_url").in("set_number", [canonical, `${canonical}-1`]).limit(1).maybeSingle();
  if (exact.error) return { set: null, error: exact.error };
  if (exact.data) return { set: exact.data as LegoSet, error: null };
  const variant = await supabase.from("lego_sets").select("id, set_number, name, image_url").ilike("set_number", `${canonical}-%`).order("set_number", { ascending: true }).limit(1).maybeSingle();
  return { set: (variant.data as LegoSet | null) ?? null, error: variant.error };
}

async function runShoppingSearch(query: string, apiKey: string) {
  const params = new URLSearchParams({ engine: "google_shopping", q: query, gl: "za", hl: "en", location: "Johannesburg, Gauteng, South Africa", api_key: apiKey, num: "40" });
  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`, { next: { revalidate: 21600 } });
  if (!response.ok) throw new Error("External shopping search failed");
  return (await response.json()) as { shopping_results?: ShoppingResult[] };
}

function extractOfficialPrice(html: string) {
  const patterns = [
    /property=["']product:price:amount["'][^>]*content=["']([0-9.,]+)["']/i,
    /content=["']([0-9.,]+)["'][^>]*property=["']product:price:amount["']/i,
    /["']price["']\s*:\s*["']?([0-9]+(?:\.[0-9]+)?)["']?/i,
    /R\s*([0-9][0-9\s,.]{2,})/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) continue;
    const value = Number(match[1].replace(/\s/g, "").replace(/,/g, ""));
    if (Number.isFinite(value) && value >= 100) return value;
  }
  return null;
}

async function getOfficialLegoMarket(setNumber: string, name: string, condition: string) {
  const canonical = canonicalSetNumber(setNumber);
  const productUrl = `https://www.lego.com/en-za/product/${slugify(name)}-${canonical}`;
  try {
    const response = await fetch(productUrl, { headers: { "user-agent": "Mozilla/5.0 (compatible; TBXAtlas/1.0)" }, next: { revalidate: 21600 } });
    if (!response.ok) return null;
    const retailPrice = extractOfficialPrice(await response.text());
    if (!retailPrice) return null;
    const listing: ExternalListing = { id: `lego-official-${canonical}`, title: `LEGO ${canonical} ${name}`, source: "LEGO South Africa", price: retailPrice, href: productUrl, thumbnail: null, condition: "New retail", relevance: 1 };
    return buildMarket("lego_official_za", productUrl, [listing], condition);
  } catch {
    return null;
  }
}

function parsePublicShoppingHtml(html: string, setNumber: string, name: string, searchUrl: string) {
  const canonical = canonicalSetNumber(setNumber);
  const decoded = html.replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/<[^>]+>/g, " ");
  const windows = decoded.split(new RegExp(`(?=${canonical})`, "i")).slice(1, 35).map((part) => `${canonical}${part.slice(0, 520)}`);
  const listings: ExternalListing[] = [];

  windows.forEach((text, index) => {
    if (relevanceScore(text, canonical, name) < 0.75) return;
    const matches = [...text.matchAll(/R\s*([0-9][0-9\s]*(?:[.,][0-9]{2})?)/gi)];
    const priceText = matches.find((match) => match[1].replace(/\s/g, "").length >= 3)?.[1];
    if (!priceText) return;
    const price = Number(priceText.replace(/\s/g, "").replace(/,/g, "."));
    if (!Number.isFinite(price) || price < 100) return;
    listings.push({ id: `google-public-${index}`, title: text.slice(0, 140).trim(), source: "Google Shopping result", price, href: searchUrl, thumbnail: null, condition: "New retail", relevance: relevanceScore(text, canonical, name) });
  });

  return deduplicateListings(listings);
}

async function getPublicGoogleShoppingMarket(setNumber: string, name: string, condition: string) {
  const canonical = canonicalSetNumber(setNumber);
  const searchUrl = `https://www.google.com/search?tbm=shop&gl=za&hl=en&q=${encodeURIComponent(`LEGO ${canonical}`)}`;
  try {
    const response = await fetch(searchUrl, { headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36", "accept-language": "en-ZA,en;q=0.9" }, next: { revalidate: 21600 } });
    if (!response.ok) return null;
    return buildMarket("google_shopping_public", searchUrl, parsePublicShoppingHtml(await response.text(), canonical, name, searchUrl), condition);
  } catch {
    return null;
  }
}

async function getExternalRetailMarket(setNumber: string, name: string, condition: string) {
  const apiKey = process.env.SERPAPI_KEY;
  const canonical = canonicalSetNumber(setNumber);
  const queries = [`LEGO ${canonical} ${name}`, `LEGO set ${canonical}`, `LEGO ${canonical}`];
  const searchUrl = `https://www.google.com/search?tbm=shop&gl=za&hl=en&q=${encodeURIComponent(`LEGO ${canonical}`)}`;
  const emptyResult = (status: string) => ({ provider: "google_shopping", status, searchUrl, retailLow: null, retailMedian: null, retailHigh: null, adjustedLow: null, adjustedRecommended: null, adjustedHigh: null, listings: [], queries });

  if (apiKey) {
    try {
      const collected: ExternalListing[] = [];
      for (const query of queries) {
        const payload = await runShoppingSearch(query, apiKey);
        for (const [index, result] of (payload.shopping_results ?? []).entries()) {
          if (!result.title) continue;
          const relevance = relevanceScore(result.title, canonical, name);
          const price = Number(result.extracted_price);
          if (relevance < 0.75 || !Number.isFinite(price) || price < 100) continue;
          collected.push({ id: `external-${result.position ?? index}`, title: result.title, source: result.source ?? "Online retailer", price, href: result.product_link ?? result.link ?? searchUrl, thumbnail: result.thumbnail ?? null, condition: "New retail", relevance });
        }
      }
      const serpMarket = buildMarket("google_shopping", searchUrl, collected, condition);
      if (serpMarket) return { ...serpMarket, queries };
    } catch {
      // Continue through provider-independent fallbacks.
    }
  }

  const publicMarket = await getPublicGoogleShoppingMarket(canonical, name, condition);
  if (publicMarket) return { ...publicMarket, queries };
  const officialMarket = await getOfficialLegoMarket(canonical, name, condition);
  if (officialMarket) return { ...officialMarket, queries };
  return emptyResult(apiKey ? "no_exact_matches" : "not_configured");
}

export async function GET(request: Request, { params }: RouteContext) {
  const { setNumber } = await params;
  const requestedSetNumber = canonicalSetNumber(setNumber);
  const condition = new URL(request.url).searchParams.get("condition") ?? "Used Complete";
  const supabase = await createClient();

  const { set, error: setError } = await resolveAtlasProduct(supabase, requestedSetNumber);
  if (setError) return NextResponse.json({ error: setError.message }, { status: 500 });
  if (!set) return NextResponse.json({ error: "Set not found", requestedSetNumber }, { status: 404 });

  const { data: collectible, error: collectibleError } = await supabase.from("collectibles").select("id").eq("lego_set_id", set.id).maybeSingle();
  if (collectibleError) return NextResponse.json({ error: collectibleError.message }, { status: 500 });

  const quotePromise = collectible ? supabase.rpc("seller_value_quote", { target_collectible_id: collectible.id, target_condition: condition }) : Promise.resolve({ data: null, error: null });
  const listingsPromise = supabase.from("marketplace_listings").select("id, price_zar, condition, published_at").eq("status", "live").eq("lego_set_id", set.id).order("price_zar", { ascending: true }).limit(12);
  const [{ data, error }, { data: listingData, error: listingError }] = await Promise.all([quotePromise, listingsPromise]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const internalQuote = Array.isArray(data) ? data[0] : data;
  const listings = listingError ? [] : ((listingData ?? []) as MarketplaceListing[]);
  const prices = listings.map((listing) => Number(listing.price_zar)).filter(Number.isFinite);
  const externalMarket = prices.length ? null : await getExternalRetailMarket(set.set_number, set.name, condition);
  const pricing = buildAtlasPricing({ internalQuote, livePrices: prices, externalMarket });

  return NextResponse.json({
    atlasProduct: { id: `atlas-lego-${requestedSetNumber}`, category: "LEGO", requestedIdentifier: requestedSetNumber, canonicalIdentifier: canonicalSetNumber(set.set_number), catalogueIdentifier: set.set_number, match: set.set_number === requestedSetNumber ? "exact" : "canonical_variant" },
    set: { setNumber: canonicalSetNumber(set.set_number), catalogueSetNumber: set.set_number, name: set.name, imageUrl: set.image_url },
    condition,
    quote: pricing.quote,
    evidence: pricing.evidence,
    diagnostics: { ...pricing.diagnostics, attemptedQueries: externalMarket?.queries ?? [] },
    market: {
      lowestAsking: prices.length ? Math.min(...prices) : externalMarket?.adjustedLow ?? null,
      highestAsking: prices.length ? Math.max(...prices) : externalMarket?.adjustedHigh ?? null,
      activeListingCount: listings.length,
      evidenceCount: pricing.diagnostics.evidenceCount,
      listings: listings.map((listing) => ({ id: listing.id, price: Number(listing.price_zar), condition: listing.condition, publishedAt: listing.published_at, href: `/marketplace/${listing.id}` })),
    },
    externalMarket,
  });
}
