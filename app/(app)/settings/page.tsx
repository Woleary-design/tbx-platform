import Link from "next/link";
import { Bell, ChevronRight, CircleUserRound, PackageCheck, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: collector } = await supabase
    .from("collectors")
    .select("display_name, username, profile_public, identity_verified, payment_verified, completed_trades")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = collector?.display_name || collector?.username || user.email?.split("@")[0] || "TBX member";

  const rows = [
    {
      href: "/profile",
      icon: CircleUserRound,
      title: "Profile & privacy",
      detail: collector?.profile_public ? "Your public collector profile is visible." : "Your collector profile is private.",
    },
    {
      href: "/orders",
      icon: PackageCheck,
      title: "Orders & selling",
      detail: `${collector?.completed_trades ?? 0} completed trades on this account.`,
    },
    {
      href: "/notifications",
      icon: Bell,
      title: "Notifications",
      detail: "Review purchase, seller and marketplace updates.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(139,92,246,.12),rgba(255,255,255,.025))] p-6 sm:p-8">
        <p className="text-sm font-semibold text-violet-300">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{displayName}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Manage the parts of your TBX account that are live today. Payment and payout settings will appear here when the marketplace payment provider is connected.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <ShieldCheck className="h-5 w-5 text-emerald-300" />
          <p className="mt-4 text-sm text-slate-400">Identity</p>
          <p className="mt-1 text-lg font-semibold text-white">{collector?.identity_verified ? "Verified" : "Not verified yet"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <ShieldCheck className="h-5 w-5 text-violet-300" />
          <p className="mt-4 text-sm text-slate-400">Payments</p>
          <p className="mt-1 text-lg font-semibold text-white">{collector?.payment_verified ? "Verified" : "Not connected yet"}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
        {rows.map(({ href, icon: Icon, title, detail }) => (
          <Link key={href} href={href} className="flex items-center gap-4 border-b border-white/10 px-5 py-5 last:border-b-0 hover:bg-white/[0.035]">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Icon className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-white">{title}</span>
              <span className="mt-1 block text-sm text-slate-500">{detail}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-600" />
          </Link>
        ))}
      </section>
    </div>
  );
}
