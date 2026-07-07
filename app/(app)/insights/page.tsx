import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function InsightsPage() {
  return (
    <AppRoutePlaceholder
      title="Insights"
      description="Market intelligence for the collection you actually own, highlighting value movement, rarity pressure and opportunities worth a closer look."
      items={["Vault value movement", "Rarity and demand signals", "Watchlist price gaps"]}
    />
  );
}
