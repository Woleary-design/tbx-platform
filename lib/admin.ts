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

  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = adminUser?.role as AdminRole | undefined;

  if (error || !role || !ADMIN_ROLES.has(role)) {
    redirect("/");
  }

  return { user, role, supabase };
}
