import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminRole = "super_admin" | "admin" | "moderator" | "support";

const ADMIN_ROLES = new Set<AdminRole>([
  "super_admin",
  "admin",
  "moderator",
  "support",
]);

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const role = user.app_metadata?.role as AdminRole | undefined;

  if (!role || !ADMIN_ROLES.has(role)) {
    redirect("/");
  }

  return { user, role, supabase };
}
