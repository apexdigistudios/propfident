export type PricingTier = {
  name: "Free" | "Pro" | "Elite";
  description: string;
  monthly: number;
  yearly: number;
  cta: string;
  recommended?: boolean;
  features: string[];
  accountConnections: string;
};

export const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    description: "Start protecting one evaluation account.",
    monthly: 0,
    yearly: 0,
    cta: "Protect Your First Account — Free",
    features: ["Manual trade journal", "Dynamic lot calculator", "Static drawdown tracking", "Community support"],
    accountConnections: "1",
  },
  {
    name: "Pro",
    description: "Automated protection for funded traders. Coming soon.",
    monthly: 25,
    yearly: 20,
    cta: "Coming Soon",
    recommended: false,
    features: ["1 MT4/MT5 MetaApi connection", "Live trailing drawdown shield", "Automated trade journal", "Telegram & email alerts", "Advanced performance metrics"],
    accountConnections: "5",
  },
  {
    name: "Elite",
    description: "Multi-account control for scaling traders. Coming soon.",
    monthly: 50,
    yearly: 40,
    cta: "Coming Soon",
    recommended: false,
    features: ["Up to 10 MT4/MT5 connections", "Cross-account risk controls", "Advanced expectancy analytics", "Priority breach alerts", "24/7 priority support"],
    accountConnections: "10",
  },
];

export const pricingByName = Object.fromEntries(
  pricingTiers.map((tier) => [tier.name, tier])
) as Record<PricingTier["name"], PricingTier>;
