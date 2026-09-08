export interface PropFirmProfile {
  id: string;
  name: string;
  logo: string;
  dailyDrawdown: number;
  maxDrawdown: number;
  consistencyLimit?: number;
  lotSizeCap?: number;
  weekendHolding: boolean;
  requiresStopLoss?: boolean;
}

export const PROP_FIRMS: PropFirmProfile[] = [
  { id: "ftmo", name: "FTMO", logo: "/logos/ftmo.svg", dailyDrawdown: 0.05, maxDrawdown: 0.1, weekendHolding: false },
  { id: "fundingpips", name: "FundingPips", logo: "/logos/fundingpips.svg", dailyDrawdown: 0.05, maxDrawdown: 0.08, consistencyLimit: 0.35, weekendHolding: true },
  { id: "topstep", name: "Topstep", logo: "/logos/topstep.svg", dailyDrawdown: 0.04, maxDrawdown: 0.04, lotSizeCap: 5, weekendHolding: false },
  { id: "the5ers", name: "The5ers", logo: "/logos/the5ers.svg", dailyDrawdown: 0.05, maxDrawdown: 0.1, weekendHolding: true, requiresStopLoss: true },
  { id: "alphacapital", name: "Alpha Capital Group", logo: "/logos/alpha-capital-group.svg", dailyDrawdown: 0.05, maxDrawdown: 0.1, consistencyLimit: 0.4, weekendHolding: true },
  { id: "fundednext", name: "FundedNext", logo: "/logos/fundednext.svg", dailyDrawdown: 0.05, maxDrawdown: 0.1, consistencyLimit: 0.4, weekendHolding: true },
  { id: "aquafunded", name: "AquaFunded", logo: "/logos/aquafunded.svg", dailyDrawdown: 0.05, maxDrawdown: 0.1, weekendHolding: true },
  { id: "myfundedfx", name: "MyFundedFX", logo: "/logos/myfundedfx.svg", dailyDrawdown: 0.05, maxDrawdown: 0.1, consistencyLimit: 0.4, weekendHolding: true },
];
