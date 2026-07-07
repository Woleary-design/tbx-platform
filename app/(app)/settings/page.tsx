import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function SettingsPage() {
  return (
    <AppRoutePlaceholder
      title="Settings"
      description="Fine-tune the identity, privacy and notification preferences that shape how other collectors experience your reputation on TBX."
      items={["Identity and verification", "Trade notification cadence", "Privacy and seller controls"]}
    />
  );
}
