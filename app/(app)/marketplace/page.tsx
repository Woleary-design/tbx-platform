import { BuyLegoBrowser } from "@/components/marketplace/buy-lego-browser";
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
      assets!listings_asset_id_fkey(id, set_number, set_name, theme, condition, lego_set_id),
      collectors!listings_seller_id_fkey(display_name, username, collector_level, confidence_score, average_dispatch_days)
    `)
    .eq("status", "Active")
    .order("published_at", { ascending: false });

  if (error) console.error("Marketplace listings could not be loaded", error.message);

  const legoSetIds = (liveListings ?? [])
    .flatMap((listing) => {
      const asset = Array.isArray(listing.assets) ? listing.assets[0] : listing.assets;
      return asset?.lego_set_id ? [asset.lego_set_id] : [];
    });
  const { data: legoSets } = legoSetIds.length
    ? await supabase.from("lego_sets").select("id, image_url").in("id", legoSetIds)
    : { data: [] as Array<{ id: string; image_url: string | null }> };
  const imageBySetId = new Map((legoSets ?? []).map((set) => [set.id, set.image_url]));
  const assetIds = (liveListings ?? []).flatMap((listing) => { const asset = Array.isArray(listing.assets) ? listing.assets[0] : listing.assets; return asset?.id ? [asset.id] : []; });
  const { data: evidence } = assetIds.length ? await supabase.from("asset_evidence").select("asset_id, storage_bucket, storage_path, evidence_type").in("asset_id", assetIds).order("created_at", { ascending: true }) : { data: [] as Array<{ asset_id:string; storage_bucket:string; storage_path:string; evidence_type:string }> };
  const imageByAssetId = new Map<string,string>();
  for (const photo of evidence ?? []) if (!imageByAssetId.has(photo.asset_id)) imageByAssetId.set(photo.asset_id, supabase.storage.from(photo.storage_bucket).getPublicUrl(photo.storage_path).data.publicUrl);

  const databaseListings = (liveListings ?? []).map((listing) => {
    const asset = Array.isArray(listing.assets) ? listing.assets[0] : listing.assets;
    const seller = Array.isArray(listing.collectors) ? listing.collectors[0] : listing.collectors;
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
      imageUrl: asset?.id && imageByAssetId.has(asset.id) ? imageByAssetId.get(asset.id)! : asset?.lego_set_id ? imageBySetId.get(asset.lego_set_id) ?? null : null,
      sellerName: "Verified seller",
      sellerLevel: seller?.collector_level ?? "Collector",
    };
  });

  return (
    <BuyLegoBrowser
      listings={databaseListings}
      initialQuery={params?.set?.trim() ?? ""}
      publishedId={params?.published}
    />
  );
}
