import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Propfident — Never Breach a Prop Firm Account Again",
  description:
    "Real-time drawdown protection, dynamic lot sizing, automated trading journals, and hands-free MT4/MT5 syncing through MetaApi.",
  keywords: [
    "Propfident",
    "prop firm",
    "trailing drawdown",
    "lot size calculator",
    "trading journal",
    "MT4",
    "MT5",
    "MetaApi",
    "funded trading",
  ],
  openGraph: {
    title: "Propfident — Trade Funded Accounts With Confidence",
    description:
      "Protect every funded account with live drawdown tracking, exact risk sizing, and automated MT4/MT5 journaling.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
