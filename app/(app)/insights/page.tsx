import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function InsightsPage() {
  return (
    <AppRoutePlaceholder
      title="Collection"
      description="A refined view of owned pieces, market movement, category exposure and opportunities that deserve a place in the vault."
      items={["Portfolio value movement", "Rarity and demand signals", "Acquisition opportunities"]}
    />
  );
}
