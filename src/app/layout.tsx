import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dragon Live 龍播 - Asian Casino Streaming",
  description: "Premium live streaming for Mahjong, Baccarat, Blackjack & Poker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <Suspense fallback={null}>
          <Sidebar />
        </Suspense>
        <main className="md:pl-64 min-h-screen pb-20 md:pb-0 relative bg-black/50 overflow-x-hidden">
          {children}
        </main>
        <Suspense fallback={null}>
          <MobileNav />
        </Suspense>
      </body>
    </html>
  );
}
