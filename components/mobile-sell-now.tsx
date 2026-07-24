"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

export function MobileSellNow() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/sell") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <Link
      href="/sell/create"
      aria-label="Sell now"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-[70] flex h-12 items-center justify-center gap-2 rounded-full bg-[#e8c86a] px-5 text-sm font-black text-[#050912] shadow-[0_12px_35px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 hover:bg-[#f1d478] active:scale-95 md:bottom-6 md:right-6 md:h-14 md:px-7 md:text-base md:shadow-[0_18px_55px_rgba(0,0,0,0.5)]"
    >
      Sell Now <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
    </Link>
  );
}
