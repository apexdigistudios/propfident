import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

const EMOTIONS = ["Disciplined", "FOMO", "Anxious", "Revenge Trade", "Confident", "Hesitant"] as const;

function fallbackAnalysis(note: string) {
  const text = note.toLowerCase();
  const emotion = text.includes("revenge") || text.includes("make it back")
    ? "Revenge Trade"
    : text.includes("fomo") || text.includes("missed") || text.includes("late")
      ? "FOMO"
      : text.includes("anxious") || text.includes("fear") || text.includes("nervous")
        ? "Anxious"
        : text.includes("hesitat") || text.includes("uncertain")
          ? "Hesitant"
          : text.includes("confident") || text.includes("clear")
            ? "Confident"
            : "Disciplined";

  return {
    emotionTag: emotion,
    executionRemark: "Recorded your trading mindset for later review and pattern analysis.",
  };
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  let body: { note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const note = String(body.note || "").trim();
  if (!note) return NextResponse.json({ error: "Note text is required." }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json(fallbackAnalysis(note));

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this private trading journal note for mindset, not financial advice. Choose exactly one emotionTag from ${EMOTIONS.join(", ")}. Return JSON with exactly two string fields: emotionTag and executionRemark. The remark must be one concise sentence and must not promise outcomes. Note: ${note}`,
      config: { responseMimeType: "application/json", temperature: 0.2 },
    });
    const parsed = JSON.parse(result.text || "{}");
    const emotionTag = EMOTIONS.includes(parsed.emotionTag) ? parsed.emotionTag : fallbackAnalysis(note).emotionTag;
    const executionRemark = typeof parsed.executionRemark === "string" && parsed.executionRemark.trim()
      ? parsed.executionRemark.trim()
      : fallbackAnalysis(note).executionRemark;
    return NextResponse.json({ emotionTag, executionRemark });
  } catch {
    return NextResponse.json(fallbackAnalysis(note));
  }
}