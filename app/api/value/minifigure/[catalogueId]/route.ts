import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ catalogueId: string }> };

type ShoppingResult = {
  title?: string;
  source?: string;
  extracted_price?: number;
  product_link?: string;
  link?: string;
  thumbnail?: string;
};

type MarketListing = {
  title: string;
  source: string;
  price: number;
  href: string;
  thumbnail: string | null;
};

const rejectTerms = [
  "keychain", "key ring", "keyring", "display case", "display stand", "frame", "poster",
  "custom", "compatible", "replica", "clone", "replacement", "parts only", "torso only",
  "head only", "helmet only", "hair only", "accessory", "accessories", "sticker",
];

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function conditionFactor(condition: string) {
  const value = condition.toLowerCase();
  if (value.includes("excellent")) return 0.95;
  if (value.includes("good")) return 0.85;
  if (value.includes("mixed")) return 0.65;
  if (value.includes("damaged") || value.includes("incomplete")) return 0.35;
  return 0.75;
}

function isRelevant(title: string, catalogueId: string, name: string) {
  const clean = normalise(title);
  if (rejectTerms.some((term) => clean.includes(term))) return false;
  const code = normalise(catalogueId).replace(/\s/g, "");
  const compactTitle = clean.replace(/\s/g, "");
  if (code && compactTitle.includes(code)) return true;
  const tokens = normalise(name).split(" ").filter((token) => token.length > 3 && !["lego", "minifigure", "minifig"].includes(token));
  if (!tokens.length) return false;
  const matched = tokens.filter((token) => clean.includes(token)).length;
  return matched >= Math.min(2, tokens.length);
}

function rejectOutliers(listings: MarketListing[]) {
  if (listings.length < 3) return listings;
  const centre = median(listings.map((listing) => listing.price));
  if (!centre) return listings;
  return listings.filter((listing) => listing.price >= centre * 0.4 && listing.price <= centre * 2.5);
}

async function searchShopping(query: string, apiKey: string) {
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
    signal: AbortSignal.timeout(6500),
    next: { revalidate: 21600 },
  });
  if (!response.ok) throw new Error("Shopping search failed");
  return (await response.json()) as { shopping_results?: ShoppingResult[] };
}

export async function GET(request: Request, context: RouteContext) {
  const { catalogueId: rawCatalogueId } = await context.params;
  const catalogueId = decodeURIComponent(rawCatalogueId).trim();
  const condition = new URL(request.url).searchParams.get("condition") || "Not sure";
  const supabase = await createClient();

  const { data: figure, error } = await supabase
    .from("lego_minifigures")
    .select("id, catalogue_id, name, character_name, theme, image_url")
    .ilike("catalogue_id", catalogueId)
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!figure) return NextResponse.json({ error: "Minifigure not found" }, { status: 404 });

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({
      figure,
      quote: { status: "unavailable", currency: "ZAR", low: null, recommended: null, high: null, evidenceCount: 0 },
    });
  }

  const displayName = figure.character_name || figure.name;
  const queries = [
    `LEGO minifigure ${figure.catalogue_id} ${displayName}`,
    `LEGO ${figure.catalogue_id} minifig`,
  ];

  const searches = await Promise.allSettled(queries.map((query) => searchShopping(query, apiKey)));
  const listings: MarketListing[] = [];
  for (const search of searches) {
    if (search.status !== "fulfilled") continue;
    for (const result of search.value.shopping_results ?? []) {
      const title = result.title?.trim() || "";
      const price = Number(result.extracted_price ?? 0);
      const href = result.product_link || result.link || "";
      if (!title || !href || !Number.isFinite(price) || price < 20) continue;
      if (!isRelevant(title, figure.catalogue_id, displayName)) continue;
      listings.push({ title, source: result.source || "Google Shopping", price, href, thumbnail: result.thumbnail || null });
    }
  }

  const unique = new Map<string, MarketListing>();
  for (const listing of listings) {
    const key = `${normalise(listing.title)}|${Math.round(listing.price)}`;
    if (!unique.has(key)) unique.set(key, listing);
  }

  const cleaned = rejectOutliers([...unique.values()]).sort((a, b) => a.price - b.price).slice(0, 10);
  if (!cleaned.length) {
    return NextResponse.json({
      figure,
      quote: { status: "unavailable", currency: "ZAR", low: null, recommended: null, high: null, evidenceCount: 0 },
      listings: [],
    });
  }

  const prices = cleaned.map((listing) => listing.price);
  const marketMedian = median(prices) ?? prices[0];
  const factor = conditionFactor(condition);
  const recommended = Math.max(20, Math.round(marketMedian * factor));
  const observedLow = Math.min(...prices) * factor;
  const observedHigh = Math.max(...prices) * factor;
  const low = Math.max(20, Math.round(cleaned.length > 1 ? observedLow : recommended * 0.85));
  const high = Math.max(low, Math.round(cleaned.length > 1 ? observedHigh : recommended * 1.15));

  return NextResponse.json({
    figure,
    quote: {
      status: "available",
      currency: "ZAR",
      low,
      recommended,
      high,
      evidenceCount: cleaned.length,
      condition,
      basis: "Current South African asking-market evidence",
    },
    listings: cleaned,
  });
}
