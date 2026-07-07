import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function MessagesPage() {
  return (
    <AppRoutePlaceholder
      title="Messages"
      description="A future communication center for transaction-safe buyer and seller conversations."
      items={["Priority inbox", "Order threads", "System notices"]}
    />
  );
}
