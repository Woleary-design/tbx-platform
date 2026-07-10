import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: collector } = await supabase
    .from("collectors")
    .select("display_name, username, avatar_url, collector_level, confidence_score, tbx_id")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = collector?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "Collector";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join("") || "TB";

  return (
    <AppShell
      collector={{
        displayName,
        initials,
        avatarUrl: collector?.avatar_url ?? null,
        level: collector?.collector_level ?? "Collector",
        score: collector?.confidence_score ?? 50,
        tbxId: collector?.tbx_id ?? "TBX pending",
        email: user.email ?? "",
      }}
    >
      {children}
    </AppShell>
  );
}
