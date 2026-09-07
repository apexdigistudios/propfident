import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import AdSlot from "@/components/AdSlot";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import BreachNotificationListener from "@/components/BreachNotificationListener";
import { Toaster } from "sonner";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#020617",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://propfident.online"),
  title: {
    default: "Propfident | Prop Trading Risk Shield & Prop Match™",
    template: "%s | Propfident",
  },
  description:
    "Real-time drawdown protection, dynamic lot sizing, automated trading journals, and hands-free MT4/MT5 syncing through MetaApi.",
  icons: {
    icon: "/propfidentlogo.png",
    apple: "/propfidentlogo.png",
    shortcut: "/propfidentlogo.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Propfident",
    statusBarStyle: "black-translucent",
  },
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
    title: "Propfident | Prop Trading Risk Shield",
    description:
      "Protect every funded account with live drawdown tracking, exact risk sizing, and automated MT4/MT5 journaling.",
    type: "website",
    url: "https://propfident.online",
    siteName: "Propfident",
    images: [{ url: "/propfidentlogo.png", width: 512, height: 512, alt: "Propfident Logo" }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen w-full bg-background antialiased overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Propfident",
              url: "https://propfident.online",
              logo: "https://propfident.online/propfidentlogo.png",
              sameAs: [],
            }),
          }}
        />
        <Script
          id="adsense-init"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || "ca-pub-XXXXXXXXXXXXXXX"}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <div className="relative w-full">{children}</div>
        <PWAInstallPrompt />
        <BreachNotificationListener />
        <Toaster richColors closeButton theme="dark" position="top-right" />
        <AdSlot />
      </body>
    </html>
  );
}
