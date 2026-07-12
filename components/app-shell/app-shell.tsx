"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Archive,
  Bell,
  BookOpen,
  ChevronDown,
  Home,
  Inbox,
  LayoutGrid,
  LibraryBig,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/collection", label: "My Collection", icon: LibraryBig },
  { href: "/atlas", label: "Atlas", icon: BookOpen },
  { href: "/marketplace", label: "Marketplace", icon: LayoutGrid },
  { href: "/insights", label: "Insights", icon: Archive },
  { href: "/messages", label: "Messages", icon: Inbox },
  { href: "/profile", label: "Profile", icon: Settings },
];

type CollectorIdentity = {
  displayName: string;
  initials: string;
  avatarUrl: string | null;
  level: string;
  score: number;
  tbxId: string;
  email: string;
};

type AppShellProps = {
  children: ReactNode;
  collector: CollectorIdentity;
};

function FourDotLogo({ small = false }: { small?: boolean }) {
  return (
    <span className={cn("grid grid-cols-2 gap-1 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200", small ? "h-8 w-8" : "h-11 w-11")}>
      <span className="rounded bg-slate-950" />
      <span className="rounded bg-slate-950" />
      <span className="rounded bg-slate-950" />
      <span className="rounded bg-yellow-400" />
    </span>
  );
}

export function AppShell({ children, collector }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-white/80 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b px-6 py-7">
            <Link href="/dashboard" className="flex items-center gap-3">
              <FourDotLogo />
              <span className="leading-tight">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.32em] text-yellow-600">The</span>
                <span className="block text-lg font-semibold tracking-normal text-slate-950">Block Exchange</span>
                <span className="block text-xs text-slate-500">Private Collector Platform</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1.5 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive ? "bg-slate-950 text-white shadow-[0_16px_44px_rgba(15,23,42,0.16)]" : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
                  )}
                >
                  <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-105" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="m-4 space-y-3">
            <Link href="/profile" className="block rounded-2xl border bg-white p-4 shadow-sm transition hover:border-slate-300">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-yellow-400 text-sm font-semibold text-slate-950">
                  {collector.avatarUrl ? <img src={collector.avatarUrl} alt="" className="h-full w-full object-cover" /> : collector.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{collector.displayName}</p>
                  <p className="truncate text-xs text-slate-500">{collector.level} · Score {collector.score}</p>
                </div>
              </div>
              <p className="mt-3 truncate text-[11px] font-medium uppercase tracking-[0.12em] text-yellow-600">{collector.tbxId}</p>
            </Link>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-950">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                TBX Secure ready
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">Reputation, provenance and protected trading signals stay visible across every collection decision.</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-xl">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-950 lg:hidden">
                <FourDotLogo small />
                TBX
              </Link>
              <div className="hidden text-sm text-slate-500 lg:block">Own with confidence. Trade with trust.</div>
            </div>

            <div className="flex flex-1 items-center gap-3 sm:max-w-xl">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search collection, Atlas, sellers, orders..." className="rounded-full border-slate-200 bg-slate-50 pl-10" />
              </div>
              <Button variant="outline" size="sm" aria-label="Notifications" className="rounded-full border-slate-200 bg-white px-3">
                <Bell className="h-4 w-4" />
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-full border-slate-200 bg-white pl-1.5 pr-3">
                <Link href="/profile" title={collector.displayName}>
                  <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-slate-950 text-xs font-semibold text-white">
                    {collector.avatarUrl ? <img src={collector.avatarUrl} alt="" className="h-full w-full object-cover" /> : collector.initials}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto border-t px-4 py-2 lg:hidden">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium", isActive ? "bg-slate-950 text-white" : "text-slate-500")}>
                  {item.label}
                </Link>
              );
            })}
            <SignOutButton />
          </nav>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
