import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function OrdersPage() {
  return (
    <AppRoutePlaceholder
      title="Orders"
      description="A protected trade view for every purchase and sale, with inspection windows, courier movement and fund-release confidence in one calm timeline."
      items={["Inspection window active", "Courier handover scheduled", "Funds protected by TBX Secure"]}
    />
  );
}
