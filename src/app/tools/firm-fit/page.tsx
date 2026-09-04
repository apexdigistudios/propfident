import type { Metadata } from "next";
import FirmFitClient from "./FirmFitClient";

export const metadata: Metadata = {
  title: "Prop Match™ - Free Prop Firm Strategy & Pass Probability Engine | Propfident",
  description: "Test your MT4/MT5 trade history against FTMO, FundingPips, Topstep & The5ers rules for free. Identify drawdown breaches before buying a prop firm challenge.",
  keywords: ["prop firm calculator", "FTMO drawdown test", "FundingPips rules", "prop trading risk manager", "MT4 trade analyzer", "Prop Match"],
  openGraph: {
    title: "Prop Match™ - Prop Firm Pass Probability Engine",
    description: "Instant zero-latency stress testing for your trading strategy against top prop firm rules.",
    url: "https://propfident.online/tools/prop-match",
    siteName: "Propfident",
    images: [{ url: "/propfidentlogo.png", width: 512, height: 512, alt: "Propfident Logo" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prop Match™ - Free Prop Firm Strategy Matcher",
    description: "Stress-test your trades against FTMO, Topstep, & FundingPips rules for free.",
    images: ["/propfidentlogo.png"],
  },
  alternates: { canonical: "https://propfident.online/tools/prop-match" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Prop Match™",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: "https://propfident.online/tools/prop-match",
  description: "Free prop firm strategy and pass probability engine.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function FirmFitPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <FirmFitClient />
    </>
  );
}
