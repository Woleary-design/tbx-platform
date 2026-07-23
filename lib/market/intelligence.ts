export const MARKET_CONDITIONS = [
  { value: "New Sealed", label: "New — factory sealed" },
  { value: "New Open Box", label: "New — opened box" },
  { value: "Used Complete", label: "Used — complete" },
  { value: "Used Incomplete", label: "Used — incomplete" },
] as const;

export type MarketCondition = (typeof MARKET_CONDITIONS)[number]["value"];

export type CatalogueIdentity = {
  category: string;
  identifier: string;
  name: string;
};

export type MarketListing = {
  id: string;
  price: number;
  condition: string;
  publishedAt: string | null;
  href: string;
};

export type ExternalMarketListing = {
  id: string;
  title: string;
  source: string;
  price: number;
  href: string;
  thumbnail: string | null;
  condition: string;
};

export type ValueQuote = {
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

export type MarketSnapshotData = {
  identity?: CatalogueIdentity;
  quote: ValueQuote;
  market: {
    lowestAsking: number | null;
    highestAsking: number | null;
    activeListingCount: number;
    listings: MarketListing[];
  };
  externalMarket?: {
    provider: string;
    status: string;
    searchUrl: string;
    retailLow: number | null;
    retailMedian: number | null;
    retailHigh: number | null;
    adjustedLow: number | null;
    adjustedRecommended: number | null;
    adjustedHigh: number | null;
    listings: ExternalMarketListing[];
  } | null;
};
