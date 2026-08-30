import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
      <body className="w-full min-w-0 max-w-full overflow-x-hidden bg-slate-950 text-slate-100 antialiased">
        <Script
          id="adsense-init"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || "ca-pub-XXXXXXXXXXXXXXX"}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <div className="w-full max-w-full overflow-x-hidden relative">
          {children}
        </div>
      </body>
    </html>
  );
}
