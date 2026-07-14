import { BuyLegoBrowser } from "@/components/marketplace/buy-lego-browser";
import { createClient } from "@/lib/supabase/server";

type JoinedSet = {
  set_number: string;
  name: string;
  theme: string | null;
  image_url: string | null;
};

type ListingRow = {
  id: string;
  price_zar: number | string;
  condition: string;
  confidence_score: number;
  dispatch_days: number;
  lego_sets: JoinedSet[];
};

type MarketplacePageProps = {
  searchParams?: Promise<{ set?: string }>;
};

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const initialQuery = params?.set?.trim() ?? "";
  const supabase = await createClient();
  const { data } = await supabase
    .from("marketplace_listings")
    .select("id, price_zar, condition, confidence_score, dispatch_days, lego_sets(set_number, name, theme, image_url)")
    .eq("status", "live")
    .order("published_at", { ascending: false });

  const listings = ((data ?? []) as ListingRow[]).flatMap((listing) => {
    const set = listing.lego_sets[0];
    if (!set) return [];

    return [{
      id: listing.id,
      priceZar: Number(listing.price_zar),
      condition: listing.condition,
      confidenceScore: listing.confidence_score,
      dispatchDays: listing.dispatch_days,
      setNumber: set.set_number,
      setName: set.name,
      theme: set.theme,
      imageUrl: set.image_url,
    }];
  });

  return <BuyLegoBrowser listings={listings} initialQuery={initialQuery} />;
}
