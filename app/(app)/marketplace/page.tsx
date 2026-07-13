import { BuyLegoBrowser } from "@/components/marketplace/buy-lego-browser";
import { createClient } from "@/lib/supabase/server";

type ListingRow = {
  id: string;
  price_zar: number | string;
  condition: string;
  confidence_score: number;
  dispatch_days: number;
  lego_sets: {
    set_number: string;
    name: string;
    theme: string | null;
    image_url: string | null;
  } | null;
};

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("marketplace_listings")
    .select("id, price_zar, condition, confidence_score, dispatch_days, lego_sets(set_number, name, theme, image_url)")
    .eq("status", "live")
    .order("published_at", { ascending: false });

  const listings = ((data ?? []) as ListingRow[]).flatMap((listing) => {
    if (!listing.lego_sets) return [];
    return [{
      id: listing.id,
      priceZar: Number(listing.price_zar),
      condition: listing.condition,
      confidenceScore: listing.confidence_score,
      dispatchDays: listing.dispatch_days,
      setNumber: listing.lego_sets.set_number,
      setName: listing.lego_sets.name,
      theme: listing.lego_sets.theme,
      imageUrl: listing.lego_sets.image_url,
    }];
  });

  return <BuyLegoBrowser listings={listings} />;
}
