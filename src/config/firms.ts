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
  { id: "ftmo", name: "FTMO", logo: "https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcRg8_G6by4U3jH3LnXhHAf8YXnj_5r2gYy5WnD5Kv2iLBqPeXMStaDjaFjSFQyqqtPw1aAIcMOzN73tlO4", dailyDrawdown: 0.05, maxDrawdown: 0.1, weekendHolding: false },
  { id: "fundingpips", name: "FundingPips", logo: "https://play-lh.googleusercontent.com/VlsYCLGO5q-aAHNY4LnKWI4rIjuSRAXZpYJaQgyS5THJJhdRL0iHdBPIgyonsx_bbWdFOiEqGiIBNhPQZuic", dailyDrawdown: 0.05, maxDrawdown: 0.08, consistencyLimit: 0.35, weekendHolding: true },
  { id: "topstep", name: "Topstep", logo: "https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcTnIdHAEeN82G2GaX6ZqyUmSCpFTrxZFrUltdx2fQJEeLLjZAWPEXBuSLZ8USjNX8hDtTek2Vr_yTcCtwA", dailyDrawdown: 0.04, maxDrawdown: 0.04, lotSizeCap: 5, weekendHolding: false },
  { id: "the5ers", name: "The5ers", logo: "https://res.cloudinary.com/dvt6xbblx/image/upload/v1735223394/logo_t7zj4f.png", dailyDrawdown: 0.05, maxDrawdown: 0.1, weekendHolding: true, requiresStopLoss: true },
  { id: "goatfunded", name: "Goat Funded Trader", logo: "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcQ-ncuz5qmBvJPIG6hRD-DKnd0yULx76B1FaP9_Y1qiAceT1IeVyQ2rFq3Y9XxnnxMJH90Py5-kWyOat3Y", dailyDrawdown: 0.04, maxDrawdown: 0.08, weekendHolding: true },
];
