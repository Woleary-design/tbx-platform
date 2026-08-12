import type { CourierCode } from "@/features/marketplace/data/shipping-options";

export type TrustCheck = { label: string; verified: boolean };

export type MarketplaceListing = {
  id: string;
  setNumber: string;
  title: string;
  category: string;
  priceZar: number;
  condition: string;
  imageUrl: string | null;
  verified?: boolean;
  publishedAt: string;
  rarityRank: number;
  seller: {
    name: string;
    level: string;
    trustScore: number;
    rating: number;
    sales: number;
    averageDispatchDays: number;
    disputes: number;
    repeatBuyerPercent: number;
    checks: TrustCheck[];
  };
  dispatchDays: number;
  conditionReport: Array<{ label: string; value: string; detail: string }>;
  provenance: Array<{ label: string; value: string }>;
  shipping: { estimate: string; courierIncluded: boolean; insuranceIncluded: boolean; enabledMethods: CourierCode[] };
};

export const marketplaceListings: MarketplaceListing[] = [
  {
    id: "ucs-millennium-falcon-75192",
    setNumber: "75192",
    title: "UCS Millennium Falcon 75192",
    category: "Star Wars UCS",
    priceZar: 24500,
    condition: "Sealed box, collector stored",
    imageUrl: "https://cdn.rebrickable.com/media/sets/75192-1.jpg",
    publishedAt: "2026-08-11T08:00:00Z",
    rarityRank: 98,
    seller: {
      name: "BrickVault SA", level: "Premier Seller", trustScore: 96, rating: 4.9,
      sales: 184, averageDispatchDays: 1.4, disputes: 0, repeatBuyerPercent: 72,
      checks: [{ label: "Identity verified", verified: true }, { label: "Address verified", verified: true }, { label: "Payout verified", verified: true }],
    },
    dispatchDays: 1,
    conditionReport: [
      { label: "Box", value: "5 stars", detail: "Sharp corners with no visible crushing" },
      { label: "Instructions", value: "5 stars", detail: "Factory packed" },
      { label: "Pieces", value: "100%", detail: "Factory sealed" },
      { label: "Minifigures", value: "5 stars", detail: "Factory sealed" },
      { label: "Stickers", value: "Excellent", detail: "Unapplied sheet included" },
      { label: "Inspection", value: "TBX Verified", detail: "Seal and storage evidence reviewed" },
    ],
    provenance: [
      { label: "Purchased", value: "2021" }, { label: "Original invoice", value: "Included" },
      { label: "Storage", value: "Climate controlled" }, { label: "Smoke free", value: "Yes" },
      { label: "Inspection", value: "TBX Certified" }, { label: "Previous owners", value: "1" },
      { label: "Documentation", value: "Complete" },
    ],
    shipping: { estimate: "1–5 business days", courierIncluded: false, insuranceIncluded: true, enabledMethods: ["courier-guy", "paxi", "pargo"] },
  },
  {
    id: "lego-titanic-10294", setNumber: "10294", title: "Titanic 10294", category: "Icons Display",
    priceZar: 18900, condition: "New sealed, display-grade box", imageUrl: "https://cdn.rebrickable.com/media/sets/10294-1.jpg",
    publishedAt: "2026-08-10T08:00:00Z", rarityRank: 91,
    seller: { name: "Cape Collector Co.", level: "Verified Seller", trustScore: 94, rating: 4.8, sales: 88, averageDispatchDays: 1.8, disputes: 0, repeatBuyerPercent: 64, checks: [{ label: "Identity verified", verified: true }, { label: "Address verified", verified: true }, { label: "Payout verified", verified: true }] },
    dispatchDays: 2,
    conditionReport: [{ label: "Box", value: "5 stars", detail: "Display-grade sealed box" }, { label: "Pieces", value: "100%", detail: "Factory sealed" }, { label: "Inspection", value: "TBX Verified", detail: "Listing evidence reviewed" }],
    provenance: [{ label: "Purchased", value: "2023" }, { label: "Original invoice", value: "Included" }, { label: "Storage", value: "Dry indoor cabinet" }, { label: "Smoke free", value: "Yes" }],
    shipping: { estimate: "1–5 business days", courierIncluded: false, insuranceIncluded: true, enabledMethods: ["courier-guy", "paxi"] },
  },
  {
    id: "cafe-corner-10182", setNumber: "10182", title: "Café Corner 10182", category: "Modular Grails",
    priceZar: 42000, condition: "Used complete, instructions included", imageUrl: "https://cdn.rebrickable.com/media/sets/10182-1.jpg",
    publishedAt: "2026-08-09T08:00:00Z", rarityRank: 100,
    seller: { name: "Modular Museum", level: "Premier Seller", trustScore: 98, rating: 5, sales: 231, averageDispatchDays: 1.2, disputes: 0, repeatBuyerPercent: 81, checks: [{ label: "Identity verified", verified: true }, { label: "Address verified", verified: true }, { label: "Payout verified", verified: true }] },
    dispatchDays: 1,
    conditionReport: [{ label: "Pieces", value: "100%", detail: "Inventory checked" }, { label: "Instructions", value: "4 stars", detail: "Complete with light age wear" }, { label: "Minifigures", value: "5 stars", detail: "All figures verified" }, { label: "Inspection", value: "TBX Verified", detail: "Collector-grade inspection complete" }],
    provenance: [{ label: "Purchased", value: "2008" }, { label: "Previous owners", value: "1" }, { label: "Storage", value: "Display cabinet" }, { label: "Smoke free", value: "Yes" }],
    shipping: { estimate: "1–4 business days", courierIncluded: false, insuranceIncluded: true, enabledMethods: ["courier-guy", "pargo"] },
  },
];

export function getListingById(id: string) {
  return marketplaceListings.find((listing) => listing.id === id);
}

export function formatZar(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value);
}
