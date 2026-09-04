import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LegalFooter } from "@/components/legal-footer";
import { MobileSellNow } from "@/components/mobile-sell-now";
import "./globals.css";

export const metadata: Metadata = {
  title: "TBX — The collectors’ marketplace",
  description: "Buy, sell and value collectibles with TBX.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <LegalFooter />
        <MobileSellNow />
      </body>
    </html>
  );
}
