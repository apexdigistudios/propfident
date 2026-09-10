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
    default: "Propfident - Never Breach Prop Firm Account Again",
    template: "%s | Propfident",
  },
  description: "High-performance prop firm rule matching engine, strategy stress-testing, and automated risk scoring to pass challenges effortlessly.",
  authors: [{ name: "Propfident" }],
  icons: {
    icon: [{ url: "/propfidentlogo.png" }, { url: "/icon.png", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/propfidentlogo.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Propfident",
    statusBarStyle: "black-translucent",
  },
  keywords: [
    "prop firm rules",
    "FTMO rules",
    "Topstep",
    "prop match",
    "drawdown calculator",
    "trading playbook",
  ],
  openGraph: {
    title: "Propfident - Never Breach Prop Firm Account Again",
    description: "Stress-test your trading strategy against 30+ prop firm rule models.",
    type: "website",
    url: "https://propfident.online",
    siteName: "Propfident",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Propfident Strategy Audit" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
