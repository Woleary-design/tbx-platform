import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminRole = "super_admin" | "admin" | "moderator" | "operations" | "technical" | "support" | "finance";
export type AdminSection = "dashboard" | "orders" | "listings" | "users" | "payouts" | "atlas" | "reports" | "settings";

const ADMIN_ROLES = new Set<AdminRole>([
  "super_admin",
  "admin",
  "moderator",
  "operations",
  "technical",
  "support",
  "finance",
]);

const SECTION_ROLES: Record<AdminSection, ReadonlySet<AdminRole>> = {
  dashboard: ADMIN_ROLES,
  orders: new Set(["super_admin", "admin", "moderator", "operations", "support", "finance"]),
  listings: new Set(["super_admin", "admin", "moderator", "operations", "support"]),
  users: new Set(["super_admin", "admin", "moderator", "operations", "support"]),
  payouts: new Set(["super_admin", "finance"]),
  atlas: new Set(["super_admin", "admin", "operations", "technical"]),
  reports: new Set(["super_admin", "admin", "operations", "finance"]),
  settings: new Set(["super_admin", "technical"]),
};

export function canAccessAdminSection(role: AdminRole, section: AdminSection) {
  return SECTION_ROLES[section].has(role);
}

export async function requireAdmin(section: AdminSection = "dashboard") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/admin");
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

  if (!canAccessAdminSection(role, section)) {
    redirect("/admin");
  }

  return { user, role, supabase };
}
