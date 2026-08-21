import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { getMetaApi, isMetaApiConfigured } from "@/lib/metaapi";

type RequestBody = {
  strategy?: string;
  rules?: string;
  personalPlan?: string;
  pair?: string;
  riskPercent?: number;
  stopLossPips?: number;
  pipValue?: number;
};

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("subscription_tier").eq("id", user.id).maybeSingle();
  if ((profile?.subscription_tier || "free") === "free") return NextResponse.json({ error: "Upgrade your plan to use Trade Assist V2." }, { status: 403 });

  let body: RequestBody;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const strategy = String(body.strategy || "").trim();
  const rules = String(body.rules || "").trim();
  const personalPlan = String(body.personalPlan || "").trim();
  const pair = String(body.pair || "EURUSD").trim().toUpperCase();
  const riskPercent = Number(body.riskPercent);
  const stopLossPips = Number(body.stopLossPips);
  const pipValue = Number(body.pipValue);
  if (!strategy || !rules || !personalPlan || !Number.isFinite(riskPercent) || riskPercent <= 0 || riskPercent > 10 || !Number.isFinite(stopLossPips) || stopLossPips <= 0 || !Number.isFinite(pipValue) || pipValue <= 0) {
    return NextResponse.json({ error: "Complete all fields with valid risk and stop-loss values." }, { status: 400 });
  }

  const { data: account } = await supabase
    .from("mt5_accounts")
    .select("id, metaapi_account_id, account_currency, currency, balance, equity, current_balance, current_equity, connection_status")
    .eq("user_id", user.id)
    .eq("platform", "MT5")
    .eq("connection_status", "CONNECTED")
    .order("updated_at", { ascending: false })
    .maybeSingle();
  if (!account) return NextResponse.json({ error: "Connect an MT5 account before generating a live plan." }, { status: 400 });

  let accountBalance = Number(account.balance ?? account.current_balance ?? 0);
  let equity = Number(account.equity ?? account.current_equity ?? accountBalance);
  let freeMargin = equity;
  let currency = account.account_currency || account.currency || "USD";
  let pairPrice: number | null = null;

  if (isMetaApiConfigured() && account.metaapi_account_id) {
    try {
      const metaAccount = await getMetaApi().metatraderAccountApi.getAccount(account.metaapi_account_id);
      const rpc = metaAccount.getRPCConnection();
      const live = await rpc.getAccountInformation();
      accountBalance = Number(live.balance) || accountBalance;
      equity = Number(live.equity) || equity;
      freeMargin = Number(live.freeMargin) || freeMargin;
      currency = live.currency || currency;
      const quote = await rpc.getSymbolPrice(pair, false);
      pairPrice = Number(quote?.ask || quote?.bid) || null;
    } catch (error) {
      console.warn("[trade-plan] live MetaApi snapshot unavailable; using cached account state", error);
    }
  }

  if (!Number.isFinite(equity) || equity <= 0) return NextResponse.json({ error: "Live account equity is not available yet." }, { status: 503 });
  // These values are intentionally calculated on the server from live equity.
  const maxDailyRisk = equity * (riskPercent / 100);
  const lotSize = maxDailyRisk / (stopLossPips * pipValue);

  const apiKey = process.env.GEMINI_API_KEY;
  const snapshot = { accountBalance, equity, freeMargin, currency, pair, pairPrice, maxDailyRisk, lotSize, riskPercent, stopLossPips, pipValue };
  if (!apiKey) return NextResponse.json({ snapshot, plan: fallbackPlan(snapshot) });

  const prompt = `You are an elite prop firm risk manager. Based on the user's live account balance of ${equity} and strategy inputs, analyze their plan and explain their trade rules in clear, simple 6th-grade English. Emphasize why the calculated lot size of ${lotSize} protects their account from breaching prop firm rules. Analyze the user's trading strategy, prop firm rules, and personal plan. Generate a clear, highly practical trading execution plan written in simple 6th-grade English. Use these server-calculated numbers exactly: live account balance ${accountBalance} ${currency}, equity ${equity}, free margin ${freeMargin}, pair ${pair}, pair price ${pairPrice ?? "unavailable"}, selected risk ${riskPercent}%, max daily risk ${maxDailyRisk} ${currency}, stop loss ${stopLossPips} pips, pip value ${pipValue}, calculated lot size ${lotSize}. Strategy: ${strategy}. Prop firm rules and objectives: ${rules}. Personal risk tolerance and plan: ${personalPlan}. Return valid JSON with exactly these string fields: dailyRiskLimit, lotSizes, goldenRules, executionSchedule.`;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", temperature: 0.3 } });
    const content = result.text;
    if (!content) throw new Error("Empty Gemini response");
    return NextResponse.json({ snapshot, plan: JSON.parse(content) });
  } catch { return NextResponse.json({ error: "The plan service returned an invalid response. Please try again." }, { status: 502 }); }
}

function fallbackPlan(snapshot: { equity: number; currency: string; maxDailyRisk: number; lotSize: number; riskPercent: number; stopLossPips: number; pair: string }) {
  return { dailyRiskLimit: `Risk no more than ${snapshot.maxDailyRisk.toFixed(2)} ${snapshot.currency} (${snapshot.riskPercent}%) in one day. Stop after two losing trades.`, lotSizes: `For ${snapshot.pair}, use ${snapshot.lotSize.toFixed(2)} lots with a ${snapshot.stopLossPips}-pip stop. This keeps the planned loss near ${snapshot.maxDailyRisk.toFixed(2)} ${snapshot.currency}.`, goldenRules: "Use a stop loss on every trade. Do not move it farther away. Stop trading when the daily limit is reached. Protect the account before chasing profit.", executionSchedule: "Review rules before the session. Trade only your planned setup during your chosen session. Log each trade, then review results after the market closes." };
}
