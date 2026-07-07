import { AppRoutePlaceholder } from "@/features/dashboard/components/app-route-placeholder";

export default function VaultPage() {
  return (
    <AppRoutePlaceholder
      title="Vault"
      description="A secure collection workspace for catalogued assets, provenance, grading, and portfolio views."
      items={["Collection inventory", "Valuation snapshot", "Provenance records"]}
    />
  );
}
