import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function MarketplacePage() {
  return (
    <AppRoutePlaceholder
      title="Marketplace"
      description="A future operating view for seller listings, buyer discovery, and marketplace quality controls."
      items={["Listing pipeline", "Quality review", "Buyer demand"]}
    />
  );
}
