import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function MessagesPage() {
  return (
    <AppRoutePlaceholder
      title="Messages"
      description="A quieter way to negotiate serious collectibles, with order context, seller reputation and protected-trade prompts always within reach."
      items={["Seller reputation context", "Offer and provenance threads", "Protected handover reminders"]}
    />
  );
}
