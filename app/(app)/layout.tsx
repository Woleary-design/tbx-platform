import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AppShell
        collector={{
          displayName: "Alpha Preview",
          initials: "TB",
          avatarUrl: null,
          level: "Read-only preview",
          score: 0,
          tbxId: "TBX PREVIEW",
          email: "preview@tbx.local",
        }}
      >
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <p className="font-semibold">Alpha Preview Mode</p>
          <p className="mt-1 text-amber-800">
            You can explore the current TBX interface without signing in. Private collector data and all write actions remain protected by Supabase authentication and row-level security.
          </p>
        </div>
        {children}
      </AppShell>
    );
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
