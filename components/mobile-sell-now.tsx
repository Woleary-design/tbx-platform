"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

export function MobileSellNow() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/sell") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  ) {
    return null;
  }

  return (
    <Link
      href="/sell/create"
      aria-label="Sell now"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-[70] flex h-12 items-center justify-center gap-2 rounded-full bg-[#e8c86a] px-5 text-sm font-black text-[#050912] shadow-[0_12px_35px_rgba(0,0,0,0.45)] transition active:scale-95 md:hidden"
    >
      Sell Now <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
