import { BuyLegoBrowser } from "@/components/marketplace/buy-lego-browser";
import { marketplaceListings } from "@/features/marketplace/data/marketplace.mock";

type MarketplacePageProps = { searchParams?: Promise<{ set?: string }> };

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const listings = marketplaceListings.map((listing) => ({
    id: listing.id,
    priceZar: listing.priceZar,
    condition: listing.condition,
    confidenceScore: listing.seller.trustScore,
    dispatchDays: listing.dispatchDays,
    setNumber: listing.setNumber,
    setName: listing.title,
    theme: listing.category,
    imageUrl: listing.imageUrl,
    sellerName: listing.seller.name,
    sellerLevel: listing.seller.level,
  }));
  return <BuyLegoBrowser listings={listings} initialQuery={params?.set?.trim() ?? ""} />;
}
