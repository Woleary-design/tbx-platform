import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  Bot,
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
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/atlas", label: "Atlas AI", icon: Bot },
  { href: "/admin/marketplace", label: "Marketplace", icon: Boxes },
  { href: "/admin/atlas", label: "Catalogue", icon: Database },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Intelligence", icon: ChartNoAxesCombined },
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
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-[0_0_35px_rgba(139,92,246,.24)]">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">TBX</p>
              <p className="text-lg font-semibold">Atlas Command</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navigation.map(({ href, label, icon: Icon }, index) => (
              <Link
                key={`${href}-${label}`}
                href={href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-white/[0.06] hover:text-white ${
                  index === 0 ? "bg-violet-400/[0.08] text-white" : "text-slate-300"
                }`}
              >
                <Icon className={`h-5 w-5 ${index === 0 ? "text-violet-300" : "text-slate-500 group-hover:text-violet-300"}`} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-2 border-t border-white/10 pt-5">
            <div className="mb-4 rounded-2xl border border-violet-300/15 bg-violet-400/[0.055] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-violet-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Atlas online
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">Intelligence services are ready.</p>
            </div>
            <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/[0.06] hover:text-white">
              <Settings className="h-5 w-5" />
              Platform
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
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-violet-300">TBX</p>
                  <p className="font-semibold">Atlas Command</p>
                </div>
              </div>

              <button className="hidden min-w-0 max-w-xl flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-slate-500 hover:border-violet-300/30 md:flex">
                <Search className="h-4 w-4" />
                Ask Atlas or search Command
                <span className="ml-auto rounded-md border border-white/10 px-2 py-0.5 text-xs text-slate-500">⌘K</span>
              </button>

              <div className="flex items-center gap-3">
                <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-400" />
                </button>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs capitalize text-slate-500">{role.replace("_", " ")}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-400/10 text-sm font-semibold text-violet-300">
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
