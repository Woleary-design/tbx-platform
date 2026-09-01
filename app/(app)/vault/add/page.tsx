import { redirect } from "next/navigation";

export default function LegacyVaultAddPage() {
  redirect("/collection/add");
}
