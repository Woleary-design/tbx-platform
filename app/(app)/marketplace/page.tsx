import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function MarketplacePage() {
  return (
    <AppRoutePlaceholder
      title="Marketplace"
      description="A curated buying room for verified collectibles, where seller trust, provenance and TBX Secure protection are visible before the first message."
      items={["Verified seller collections", "TBX Secure eligible pieces", "Private watchlist signals"]}
    />
  );
}
