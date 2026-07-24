import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  Database,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin";

const navigation = [
  { href: "/admin", label: "Command", icon: LayoutDashboard },
  { href: "/admin/marketplace", label: "Marketplace", icon: Boxes },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/atlas", label: "Atlas", icon: Database },
  { href: "/admin/analytics", label: "Analytics", icon: ChartNoAxesCombined },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, role } = await requireAdmin();
  const displayName =
    user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Admin";

  return (
    <div className="min-h-screen bg-[#050915] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#070d1a]/95 px-5 py-6 lg:flex lg:flex-col">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ffd84d] text-[#07101f] shadow-[0_0_35px_rgba(255,216,77,.18)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffd84d]">TBX</p>
              <p className="text-lg font-semibold">Command</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                <Icon className="h-5 w-5 text-slate-500 group-hover:text-[#ffd84d]" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-2 border-t border-white/10 pt-5">
            <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/[0.06] hover:text-white">
              <Settings className="h-5 w-5" />
              Settings
            </Link>
            <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/[0.06] hover:text-white">
              <Activity className="h-5 w-5" />
              View marketplace
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050915]/85 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3 lg:hidden">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ffd84d] text-[#07101f]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#ffd84d]">TBX</p>
                  <p className="font-semibold">Command</p>
                </div>
              </div>

              <button className="hidden min-w-0 max-w-xl flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-slate-500 hover:border-[#ffd84d]/30 md:flex">
                <Search className="h-4 w-4" />
                Search users, listings, sets and actions
                <span className="ml-auto rounded-md border border-white/10 px-2 py-0.5 text-xs text-slate-500">⌘K</span>
              </button>

              <div className="flex items-center gap-3">
                <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ffd84d]" />
                </button>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs capitalize text-slate-500">{role.replace("_", " ")}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-sm font-semibold text-[#ffd84d]">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
