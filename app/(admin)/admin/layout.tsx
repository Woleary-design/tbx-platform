import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function isAdmin(email: string | undefined, role: unknown) {
  const configuredAdmins = (process.env.TBX_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return role === "admin" || Boolean(email && configuredAdmins.includes(email.toLowerCase()));
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");
  if (!isAdmin(user.email, user.app_metadata?.role)) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-[1500px] items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/admin" className="flex items-center gap-3 font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-400 text-slate-950">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs uppercase tracking-[0.22em] text-yellow-300">TBX Private</span>
              <span className="block">Operations Console</span>
            </span>
          </Link>
          <Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white">
            Return to TBX
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] px-5 py-8 lg:px-8">{children}</main>
    </div>
  );
}
