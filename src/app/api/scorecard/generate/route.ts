import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import { NextResponse } from "next/server";
import path from "node:path";

export const runtime = "nodejs";

const fontPath = path.join(process.cwd(), "public", "fonts", "Inter-Regular.ttf");
const boldFontPath = path.join(process.cwd(), "public", "fonts", "Inter-Bold.ttf");
GlobalFonts.registerFromPath(fontPath, "Inter");
GlobalFonts.registerFromPath(boldFontPath, "Inter");

interface ScorecardFirm {
  firm_name?: string;
  name?: string;
  account_model?: string;
  logo?: string;
  passScore?: number;
  matchScore?: number;
  matchPercentage?: number;
}

function drawRoundedRect(ctx: ReturnType<typeof createCanvas> extends never ? never : any, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      topFirms?: ScorecardFirm[];
      maxDrawdown?: number;
      dailyDrawdown?: number;
      passRate?: number;
    };
    const width = 1200;
    const height = 675;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    try {
      const bgPath = path.join(process.cwd(), "public", "images", "scorecard.png");
      const bg = await loadImage(bgPath);
      ctx.drawImage(bg, 0, 0, width, height);
    } catch {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#090d16");
      gradient.addColorStop(1, "#030712");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
    ctx.fillRect(0, 0, width, height);

    const topGlow = ctx.createLinearGradient(0, 0, width, 0);
    topGlow.addColorStop(0, "#7c3aed");
    topGlow.addColorStop(0.5, "#c084fc");
    topGlow.addColorStop(1, "#4f46e5");
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, 6);

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 20px Inter";
    ctx.fillText("PROPFIDENT - PROP MATCH RISK AUDIT", 60, 65);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px Inter";
    ctx.fillText("Strategy Rule Match Breakdown", 60, 115);

    ctx.fillStyle = "rgba(34, 197, 94, 0.15)";
    drawRoundedRect(ctx, 940, 55, 200, 42, 21);
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#4ade80";
    ctx.font = "bold 15px Inter";
    ctx.fillText("AUDIT VERIFIED", 975, 82);

    ctx.fillStyle = "rgba(30, 41, 59, 0.75)";
    drawRoundedRect(ctx, 60, 150, 1080, 115, 16);
    ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    const metrics = [
      { label: "MAX DRAWDOWN", value: `${body.maxDrawdown || 0}%`, x: 120, color: "#f87171" },
      { label: "DAILY DRAWDOWN", value: `${body.dailyDrawdown || 0}%`, x: 500, color: "#fb923c" },
      { label: "OVERALL PASS RATE", value: `${body.passRate || 0}%`, x: 880, color: "#4ade80" },
    ];
    metrics.forEach((metric) => {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 13px Inter";
      ctx.fillText(metric.label, metric.x, 190);
      ctx.fillStyle = metric.color;
      ctx.font = "bold 28px Inter";
      ctx.fillText(metric.value, metric.x, 232);
    });

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 20px Inter";
    ctx.fillText("Top 3 Matched Prop Firms", 60, 310);

    const firms = (body.topFirms || []).slice(0, 3);
    for (let index = 0; index < firms.length; index += 1) {
      const firm = firms[index];
      const yPos = 330 + index * 95;
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      drawRoundedRect(ctx, 60, yPos, 1080, 80, 14);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.stroke();

      let textXOffset = 100;
      if (firm.logo) {
        try {
          const logoPath = path.join(process.cwd(), "public", firm.logo.replace(/^[/\\]+/, ""));
          const logo = await loadImage(logoPath);
          ctx.drawImage(logo, 80, yPos + 20, 40, 40);
          textXOffset = 135;
        } catch {
          textXOffset = 100;
        }
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Inter";
      ctx.fillText(firm.firm_name || firm.name || "Prop Firm", textXOffset, yPos + 40);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px Inter";
      ctx.fillText(firm.account_model || "Standard Challenge", textXOffset, yPos + 62);

      const score = Math.max(0, Math.min(100, firm.passScore || firm.matchScore || firm.matchPercentage || 100));
      const barWidth = 240;
      ctx.fillStyle = "rgba(51, 65, 85, 0.8)";
      drawRoundedRect(ctx, 680, yPos + 34, barWidth, 12, 6);
      ctx.fillStyle = "#a855f7";
      drawRoundedRect(ctx, 680, yPos + 34, (barWidth * score) / 100, 12, 6);

      ctx.fillStyle = "rgba(168, 85, 247, 0.2)";
      drawRoundedRect(ctx, 950, yPos + 22, 160, 36, 18);
      ctx.fillStyle = "#c084fc";
      ctx.font = "bold 16px Inter";
      ctx.fillText(`${score}% MATCH`, 985, yPos + 45);
    }

    ctx.fillStyle = "#64748b";
    ctx.font = "13px Inter";
    ctx.fillText("Generated automatically by Propfident Risk Engine - propfident.online", 60, 645);
    ctx.fillStyle = "#475569";
    ctx.font = "12px Inter";
    ctx.fillText(new Date().toISOString().split("T")[0], 1060, 645);

    return new NextResponse(new Uint8Array(canvas.toBuffer("image/png")), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="Propfident_Scorecard_${Date.now()}.png"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error generating canvas scorecard:", error);
    return new NextResponse("Failed to render scorecard image", { status: 500 });
  }
}
