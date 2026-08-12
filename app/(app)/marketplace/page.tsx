import { BuyLegoBrowser } from "@/components/marketplace/buy-lego-browser";
import { marketplaceListings } from "@/features/marketplace/data/marketplace.mock";
import { createClient } from "@/lib/supabase/server";

type MarketplacePageProps = { searchParams?: Promise<{ set?: string; published?: string }> };

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const supabase = await createClient();
  const { data: liveListings, error } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      description,
      asking_price,
      published_at,
      value_quote,
      assets!listings_asset_id_fkey(set_number, set_name, theme, condition, lego_sets!assets_lego_set_id_fkey(image_url)),
      collectors!listings_seller_id_fkey(display_name, username, collector_level, confidence_score, average_dispatch_days)
    `)
    .eq("status", "Active")
    .order("published_at", { ascending: false });

  if (error) console.error("Marketplace listings could not be loaded", error.message);

  const databaseListings = (liveListings ?? []).map((listing) => {
    const asset = Array.isArray(listing.assets) ? listing.assets[0] : listing.assets;
    const seller = Array.isArray(listing.collectors) ? listing.collectors[0] : listing.collectors;
    const legoSet = Array.isArray(asset?.lego_sets) ? asset.lego_sets[0] : asset?.lego_sets;
    const valueQuote = listing.value_quote && typeof listing.value_quote === "object" && !Array.isArray(listing.value_quote)
      ? listing.value_quote as Record<string, unknown>
      : {};
    return {
      id: listing.id,
      priceZar: Number(listing.asking_price),
      condition: typeof valueQuote.condition === "string" ? valueQuote.condition : asset?.condition ?? "Used",
      confidenceScore: seller?.confidence_score ?? 50,
      dispatchDays: Math.max(1, Math.round(Number(seller?.average_dispatch_days ?? 2))),
      setNumber: asset?.set_number ?? "Collection",
      setName: listing.title || asset?.set_name || "LEGO collection",
      theme: asset?.theme ?? null,
      imageUrl: legoSet?.image_url ?? null,
      sellerName: seller?.display_name || seller?.username || "TBX Collector",
      sellerLevel: seller?.collector_level ?? "Collector",
    };
  });

  const demoListings = marketplaceListings.map((listing) => ({
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

  return (
    <BuyLegoBrowser
      listings={[...databaseListings, ...demoListings]}
      initialQuery={params?.set?.trim() ?? ""}
      publishedId={params?.published}
    />
  );
}
