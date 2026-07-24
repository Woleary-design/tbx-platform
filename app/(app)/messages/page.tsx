import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function MessagesPage() {
  return (
    <AppRoutePlaceholder
      title="Messages"
      description="Calm, transaction-aware conversations for provenance questions, protected offers and serious collector negotiations."
      items={["Seller reputation context", "Provenance questions", "Protected trade reminders"]}
    />
  );
}
