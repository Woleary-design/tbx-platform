import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function SettingsPage() {
  return (
    <AppRoutePlaceholder
      title="Settings"
      description="Account, verification, notification, privacy, and seller preference settings."
      items={["Account profile", "Verification", "Notifications"]}
    />
  );
}
