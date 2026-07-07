import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function VaultPage() {
  return (
    <AppRoutePlaceholder
      title="Vault"
      description="Your private record of high-value pieces, from sealed LEGO icons to graded cards, with provenance, storage notes and insured values kept close."
      items={["Provenance timeline", "Condition and storage notes", "Insured value register"]}
    />
  );
}
