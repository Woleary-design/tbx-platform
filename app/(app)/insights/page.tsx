import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function InsightsPage() {
  return (
    <AppRoutePlaceholder
      title="Insights"
      description="Portfolio intelligence, watchlist opportunities, and marketplace movement will live here."
      items={["Portfolio trend", "Category allocation", "Opportunity alerts"]}
    />
  );
}
