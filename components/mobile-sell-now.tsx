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
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-[#e8c86a]/20 bg-[#050912]/92 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl md:hidden">
      <Link
        href="/sell/create"
        className="mx-auto flex h-14 w-full max-w-xl items-center justify-center gap-2 rounded-2xl bg-[#e8c86a] px-6 text-base font-black text-[#050912] shadow-[0_12px_35px_rgba(232,200,106,0.2)] transition active:scale-[0.99]"
      >
        Sell Now <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  );
}
