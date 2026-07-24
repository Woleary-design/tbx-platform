import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function OrdersPage() {
  return (
    <AppRoutePlaceholder
      title="Orders"
      description="Protected purchase and sale timelines with inspection windows, courier handover clarity and TBX Secure confidence."
      items={["Inspection window active", "Courier handover scheduled", "Funds protected by TBX Secure"]}
    />
  );
}
