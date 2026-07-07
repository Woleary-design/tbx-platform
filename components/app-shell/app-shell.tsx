"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Archive,
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  Gauge,
  Inbox,
  LayoutGrid,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/marketplace", label: "Marketplace", icon: LayoutGrid },
  { href: "/vault", label: "Vault", icon: Archive },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/messages", label: "Messages", icon: Inbox },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-card lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b p-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-lg font-semibold">TBX</span>
                <span className="block text-xs text-muted-foreground">Collector Console</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="m-4 rounded-lg border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Boxes className="h-4 w-4 text-primary" />
              Trust-first mode
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Mock data only. Ready for Supabase-backed account intelligence.
            </p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold lg:hidden">
                <ShieldCheck className="h-5 w-5 text-primary" />
                TBX
              </Link>
              <div className="hidden text-sm text-muted-foreground lg:block">Authenticated Workspace</div>
            </div>

            <div className="flex flex-1 items-center gap-3 sm:max-w-xl">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search listings, orders, vault items..." className="pl-10" />
              </div>
              <Button variant="outline" size="sm" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" aria-label="Messages">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  W
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto border-t px-4 py-2 lg:hidden">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
