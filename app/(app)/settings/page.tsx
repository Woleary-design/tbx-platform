import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function SettingsPage() {
  return (
    <AppRoutePlaceholder
      title="Account"
      description="Manage the identity, privacy and verification signals that shape how other collectors experience your reputation on TBX."
      items={["Identity and verification", "Privacy preferences", "Seller reputation controls"]}
    />
  );
}
