import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function VaultPage() {
  return (
    <AppRoutePlaceholder
      title="Vault"
      description="A private archive for provenance, condition notes, storage history and insured values across exceptional collectibles."
      items={["Provenance timeline", "Condition and storage notes", "Insured value register"]}
    />
  );
}
