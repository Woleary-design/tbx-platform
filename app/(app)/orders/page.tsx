import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function OrdersPage() {
  return (
    <AppRoutePlaceholder
      title="Orders"
      description="A trust-first transaction hub for active, completed, and inspection-stage orders."
      items={["Awaiting inspection", "In progress", "Completed"]}
    />
  );
}
