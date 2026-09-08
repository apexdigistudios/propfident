import { createCanvas, loadImage } from "@napi-rs/canvas";
import { NextResponse } from "next/server";
import path from "node:path";

export const runtime = "nodejs";

interface ScorecardFirm {
  firm_name?: string;
  name?: string;
  account_model?: string;
  passScore?: number;
  matchScore?: number;
  matchPercentage?: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      topFirms?: ScorecardFirm[];
      maxDrawdown?: number;
      dailyDrawdown?: number;
      passRate?: number;
      accountSize?: number;
    };
    const canvas = createCanvas(1200, 675);
    const ctx = canvas.getContext("2d");
    const backgroundPath = path.join(process.cwd(), "public", "images", "scorecard.png");

    try {
      const background = await loadImage(backgroundPath);
      ctx.drawImage(background, 0, 0, 1200, 675);
    } catch {
      const gradient = ctx.createLinearGradient(0, 0, 1200, 675);
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(1, "#020617");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 675);
    }

    ctx.fillStyle = "rgba(2, 6, 23, 0.75)";
    ctx.fillRect(0, 0, 1200, 675);

    ctx.fillStyle = "#a855f7";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("PROPFIDENT - PROP MATCH SCORECARD", 60, 75);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("Strategy Rule Match Report", 60, 130);

    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.roundRect(60, 165, 1080, 110, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(168, 85, 247, 0.3)";
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "15px sans-serif";
    ctx.fillText("ACCOUNT SIZE", 90, 205);
    ctx.fillText("MAX DRAWDOWN", 360, 205);
    ctx.fillText("DAILY DRAWDOWN", 630, 205);
    ctx.fillText("OVERALL MATCH RATE", 900, 205);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(`$${(body.accountSize || 100000).toLocaleString()}`, 90, 245);
    ctx.fillText(`${body.maxDrawdown || 0}%`, 360, 245);
    ctx.fillText(`${body.dailyDrawdown || 0}%`, 630, 245);
    ctx.fillStyle = "#22c55e";
    ctx.fillText(`${body.passRate || 0}%`, 900, 245);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("Top Matched Prop Firms (Best 3 Fit)", 60, 325);

    const firms = (body.topFirms || []).slice(0, 3);
    firms.forEach((firm, index) => {
      const startY = 350 + index * 90;
      ctx.fillStyle = "rgba(30, 41, 59, 0.7)";
      ctx.roundRect(60, startY, 1080, 75, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(firm.firm_name || firm.name || "Prop Firm", 100, startY + 45);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "16px sans-serif";
      ctx.fillText(firm.account_model || "Standard Challenge", 340, startY + 45);
      ctx.fillStyle = "rgba(168, 85, 247, 0.25)";
      ctx.roundRect(930, startY + 18, 180, 40, 20);
      ctx.fill();
      ctx.fillStyle = "#c084fc";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(`${firm.passScore || firm.matchScore || firm.matchPercentage || 100}% MATCH`, 955, startY + 44);
    });

    ctx.fillStyle = "#64748b";
    ctx.font = "14px sans-serif";
    ctx.fillText("Verified by Propfident Risk Engine - propfident.online", 60, 640);

    return new NextResponse(new Uint8Array(canvas.toBuffer("image/png")), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="Propfident_Scorecard_${Date.now()}.png"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to generate scorecard via @napi-rs/canvas:", error);
    return new NextResponse("Error generating scorecard", { status: 500 });
  }
}
