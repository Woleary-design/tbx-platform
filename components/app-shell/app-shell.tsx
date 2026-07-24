"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, BookOpen, ChevronDown, Heart, Home, LayoutDashboard, LibraryBig, ShoppingBag, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { CatalogueSearch } from "@/components/catalogue/catalogue-search";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Home", icon: Home },
  { href: "/collection", label: "My Collection", icon: LibraryBig },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/atlas", label: "Atlas", icon: BookOpen },
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
  isAdmin?: boolean;
};

function FourDotLogo({ small = false }: { small?: boolean }) {
  return (
    <span
      className={cn(
        "grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-[#0b1223] p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.28)]",
        small ? "h-8 w-8" : "h-11 w-11",
      )}
    >
      <span className="rounded bg-[#162036]" />
      <span className="rounded bg-[#162036]" />
      <span className="rounded bg-[#162036]" />
      <span className="rounded bg-[#ffd84d] shadow-[0_0_14px_rgba(255,216,77,0.28)]" />
    </span>
  );
}

export function AppShell({ children, collector, isAdmin = false }: AppShellProps) {
  const pathname = usePathname();
  const visibleNavigation = isAdmin
    ? [...navigation, { href: "/admin", label: "Command Centre", icon: LayoutDashboard }]
    : navigation;

  return (
    <div className="min-h-screen bg-[#050915] text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-[#ffd84d]/20 bg-[linear-gradient(180deg,#08111f_0%,#050915_58%,#030711_100%)] shadow-[18px_0_70px_rgba(0,0,0,0.30)] lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/[0.07] px-6 py-7">
            <Link href="/" aria-label="Go to Home" className="flex items-center gap-3">
              <FourDotLogo />
              <span className="leading-tight">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.32em] text-[#ffd84d]">The</span>
                <span className="block text-lg font-semibold tracking-normal text-white">Block Exchange</span>
                <span className="block text-xs text-white/45">Discover. Collect. Trade.</span>
              </span>
            </Link>
          </div>

          <div className="p-4 pb-1">
            <Button asChild className="h-12 w-full rounded-2xl bg-[#ffd84d] font-semibold text-[#050915] shadow-[0_12px_30px_rgba(255,216,77,0.14)] hover:bg-[#ffe374]">
              <Link href="/sell"><Tag className="h-4 w-4" /> Sell</Link>
            </Button>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {visibleNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200",
                    item.href === "/admin"
                      ? "mt-4 border border-[#ffd84d]/20 bg-[#ffd84d]/[0.055] text-[#ffd84d] hover:bg-[#ffd84d]/[0.10]"
                      : isActive
                        ? "border border-white/[0.07] bg-[#111a2d] text-[#ffd84d] shadow-[0_14px_40px_rgba(0,0,0,0.28)]"
                        : "text-white/62 hover:bg-white/[0.055] hover:text-white",
                  )}
                >
                  {isActive && item.href !== "/admin" ? <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-[#ffd84d]" /> : null}
                  <Icon className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-105", isActive || item.href === "/admin" ? "text-[#ffd84d]" : "text-white/58")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="m-4 space-y-3 border-t border-white/[0.07] pt-4">
            <Link href="/profile" className="block rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-[#ffd84d]/30 hover:bg-[#ffd84d]/[0.045]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#ffd84d] text-sm font-semibold text-[#050915]">
                  {collector.avatarUrl ? <img src={collector.avatarUrl} alt="" className="h-full w-full object-cover" /> : collector.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{collector.displayName}</p>
                  <p className="truncate text-xs text-white/45">{collector.level}</p>
                </div>
              </div>
            </Link>

            <div className="rounded-2xl border border-[#ffd84d]/15 bg-[#ffd84d]/[0.045] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-white"><Sparkles className="h-4 w-4 text-[#ffd84d]" /> Secure &amp; Private</div>
              <p className="mt-2 text-xs leading-5 text-white/45">Your collection stays private. Selling is always a fixed-price transaction.</p>
            </div>
            <div className="text-white/55 [&_button]:text-white/55 hover:[&_button]:text-white">
              <SignOutButton />
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#050915]/92 backdrop-blur-xl">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" aria-label="Go to Home" className="flex items-center gap-2 font-semibold text-white lg:hidden"><FourDotLogo small /> TBX</Link>
            </div>

            <div className="flex flex-1 items-center gap-3 sm:max-w-3xl">
              <CatalogueSearch />
              {isAdmin ? (
                <Button asChild variant="outline" size="sm" className="hidden rounded-full border-[#ffd84d]/25 bg-[#ffd84d]/[0.06] px-4 text-[#ffd84d] hover:bg-[#ffd84d]/[0.12] hover:text-[#ffd84d] md:inline-flex">
                  <Link href="/admin"><LayoutDashboard className="h-4 w-4" /> Command</Link>
                </Button>
              ) : null}
              <Button asChild className="hidden rounded-full bg-[#ffd84d] px-5 font-semibold text-[#050915] hover:bg-[#ffe374] sm:inline-flex"><Link href="/sell"><Tag className="h-4 w-4" /> Sell</Link></Button>
              <Button asChild variant="outline" size="sm" className="rounded-full border-white/10 bg-white/[0.04] px-3 text-white hover:border-[#ffd84d]/30 hover:bg-[#ffd84d]/[0.06] hover:text-[#ffd84d]"><Link href="/notifications" aria-label="Notifications"><Bell className="h-4 w-4" /></Link></Button>
              <Button asChild variant="outline" size="sm" className="rounded-full border-white/10 bg-white/[0.04] pl-1.5 pr-3 text-white hover:border-[#ffd84d]/30 hover:bg-[#ffd84d]/[0.06]"><Link href="/profile" title={collector.displayName}><span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#ffd84d] text-xs font-semibold text-[#050915]">{collector.avatarUrl ? <img src={collector.avatarUrl} alt="" className="h-full w-full object-cover" /> : collector.initials}</span><ChevronDown className="h-4 w-4" /></Link></Button>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto border-t border-white/[0.06] px-4 py-2 lg:hidden">
            {visibleNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return <Link key={item.href} href={item.href} className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium", item.href === "/admin" ? "border border-[#ffd84d]/20 text-[#ffd84d]" : isActive ? "bg-[#ffd84d] text-[#050915]" : "text-white/55 hover:bg-white/[0.05] hover:text-white")}>{item.label}</Link>;
            })}
          </nav>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <Button asChild className="fixed bottom-5 right-5 z-40 h-14 rounded-full bg-[#ffd84d] px-5 font-semibold text-[#050915] shadow-2xl hover:bg-[#ffe374] sm:hidden"><Link href="/sell"><Tag className="h-5 w-5" /> Sell</Link></Button>
    </div>
  );
}
