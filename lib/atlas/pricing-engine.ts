export type AtlasQuote = {
  estimated_value: number | null;
  quick_sale: number | null;
  recommended: number | null;
  premium: number | null;
  confidence: number;
  verified_sales: number;
  active_listings: number;
  last_sale: number | null;
  data_status: string;
};

export type AtlasEvidence = {
  source: "tbx_sales" | "tbx_listings" | "external_retail";
  status: "available" | "empty" | "not_configured" | "unavailable" | "no_exact_matches";
  count: number;
  confidence: number;
  low: number | null;
  recommended: number | null;
  high: number | null;
  note: string;
};

type BuildPricingInput = {
  internalQuote: Partial<AtlasQuote> | null;
  livePrices: number[];
  externalMarket: {
    status: string;
    adjustedLow: number | null;
    adjustedRecommended: number | null;
    adjustedHigh: number | null;
    listings: unknown[];
  } | null;
};

function positive(value: unknown): number | null {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, Math.round(value)));
}

export function buildAtlasPricing({ internalQuote, livePrices, externalMarket }: BuildPricingInput) {
  const internalRecommended = positive(internalQuote?.recommended ?? internalQuote?.estimated_value);
  const verifiedSales = Number(internalQuote?.verified_sales ?? 0);
  const listingLow = livePrices.length ? Math.min(...livePrices) : null;
  const listingHigh = livePrices.length ? Math.max(...livePrices) : null;
  const listingMid = livePrices.length
    ? [...livePrices].sort((a, b) => a - b)[Math.floor(livePrices.length / 2)]
    : null;
  const externalAvailable = externalMarket?.status === "available";

  const evidence: AtlasEvidence[] = [
    {
      source: "tbx_sales",
      status: internalRecommended ? "available" : "empty",
      count: verifiedSales,
      confidence: internalRecommended ? clamp(Number(internalQuote?.confidence ?? 70)) : 0,
      low: positive(internalQuote?.quick_sale),
      recommended: internalRecommended,
      high: positive(internalQuote?.premium),
      note: internalRecommended ? "TBX transaction and valuation evidence" : "No usable TBX sale evidence yet",
    },
    {
      source: "tbx_listings",
      status: livePrices.length ? "available" : "empty",
      count: livePrices.length,
      confidence: livePrices.length ? clamp(45 + livePrices.length * 5, 0, 80) : 0,
      low: listingLow,
      recommended: listingMid,
      high: listingHigh,
      note: livePrices.length ? "Current TBX asking prices" : "No live TBX listings for this product",
    },
    {
      source: "external_retail",
      status: (externalMarket?.status as AtlasEvidence["status"]) ?? "unavailable",
      count: externalMarket?.listings.length ?? 0,
      confidence: externalAvailable ? clamp(45 + (externalMarket?.listings.length ?? 0) * 4, 0, 72) : 0,
      low: externalAvailable ? positive(externalMarket?.adjustedLow) : null,
      recommended: externalAvailable ? positive(externalMarket?.adjustedRecommended) : null,
      high: externalAvailable ? positive(externalMarket?.adjustedHigh) : null,
      note: externalAvailable
        ? "Exact-product South African retail anchors adjusted for condition"
        : externalMarket?.status === "not_configured"
          ? "External market provider is not configured"
          : externalMarket?.status === "no_exact_matches"
            ? "External search returned no reliable exact-product matches"
            : "External market evidence is currently unavailable",
    },
  ];

  const chosen = evidence.find((item) => item.source === "tbx_sales" && item.recommended)
    ?? evidence.find((item) => item.source === "tbx_listings" && item.recommended)
    ?? evidence.find((item) => item.source === "external_retail" && item.recommended);

  const quote: AtlasQuote = chosen
    ? {
        estimated_value: chosen.recommended,
        quick_sale: chosen.low ?? chosen.recommended,
        recommended: chosen.recommended,
        premium: chosen.high ?? chosen.recommended,
        confidence: chosen.confidence,
        verified_sales: verifiedSales,
        active_listings: livePrices.length,
        last_sale: positive(internalQuote?.last_sale),
        data_status: chosen.source,
      }
    : {
        estimated_value: null,
        quick_sale: null,
        recommended: null,
        premium: null,
        confidence: 0,
        verified_sales: verifiedSales,
        active_listings: livePrices.length,
        last_sale: positive(internalQuote?.last_sale),
        data_status: externalMarket?.status === "not_configured" ? "external_provider_not_configured" : "insufficient_evidence",
      };

  return {
    quote,
    evidence,
    diagnostics: {
      selectedSource: chosen?.source ?? null,
      externalProviderConfigured: externalMarket?.status !== "not_configured",
      evidenceCount: evidence.reduce((total, item) => total + item.count, 0),
      message: chosen
        ? `Atlas selected ${chosen.source.replaceAll("_", " ")} as the strongest available evidence.`
        : externalMarket?.status === "not_configured"
          ? "Atlas identified the product, but the external pricing provider is not configured in the deployment environment."
          : "Atlas identified the product but does not yet have reliable pricing evidence.",
    },
  };
}
