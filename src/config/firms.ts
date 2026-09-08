export interface PropFirmProfile {
  id: string;
  name: string;
  logo: string;
  dailyDrawdown: number;
  maxDrawdown: number;
  profitTarget: number;
  dailyDrawdownType: "static" | "trailing";
  newsTrading: string;
  consistencyLimit?: number;
  lotSizeCap?: number;
  weekendHolding: boolean;
  requiresStopLoss?: boolean;
}

export const PROP_FIRMS: PropFirmProfile[] = [
  { id: "ftmo", name: "FTMO", logo: "/logos/ftmo-logo.png", dailyDrawdown: 0.05, maxDrawdown: 0.1, profitTarget: 0.1, dailyDrawdownType: "static", newsTrading: "Allowed outside restricted high-impact news windows", weekendHolding: false },
  { id: "topstep", name: "Topstep", logo: "/logos/topstep-logo.png", dailyDrawdown: 0.04, maxDrawdown: 0.04, profitTarget: 0.06, dailyDrawdownType: "trailing", newsTrading: "Allowed during eligible market hours", lotSizeCap: 5, weekendHolding: false },
  { id: "the5ers", name: "The5ers", logo: "/logos/5ers-Logo.png", dailyDrawdown: 0.05, maxDrawdown: 0.1, profitTarget: 0.1, dailyDrawdownType: "static", newsTrading: "Allowed; check the selected program rules", weekendHolding: true, requiresStopLoss: true },
  { id: "alphacapital", name: "Alpha Capital Group", logo: "/logos/Alpha-Capital-prop-firm-logo.webp", dailyDrawdown: 0.05, maxDrawdown: 0.1, profitTarget: 0.1, dailyDrawdownType: "static", newsTrading: "Allowed; execution restrictions vary by program", consistencyLimit: 0.4, weekendHolding: true },
  { id: "fundednext", name: "FundedNext", logo: "/logos/fundednext-logo.webp", dailyDrawdown: 0.05, maxDrawdown: 0.1, profitTarget: 0.1, dailyDrawdownType: "static", newsTrading: "Allowed on supported challenge types", consistencyLimit: 0.4, weekendHolding: true },
  { id: "aquafunded", name: "AquaFunded", logo: "/logos/aqua-funded-logo.webp", dailyDrawdown: 0.05, maxDrawdown: 0.1, profitTarget: 0.1, dailyDrawdownType: "static", newsTrading: "Allowed; verify the selected account plan", weekendHolding: true },
  { id: "goatfunded", name: "Goat Funded", logo: "/logos/Goat-Funded-Trader-logo.jpg", dailyDrawdown: 0.05, maxDrawdown: 0.1, profitTarget: 0.1, dailyDrawdownType: "static", newsTrading: "Allowed; verify current program restrictions", weekendHolding: true },
];
