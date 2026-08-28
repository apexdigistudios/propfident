import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getMetaApi, isMetaApiConfigured } from "@/lib/metaapi";

type ChatMessage = { role: "user" | "assistant"; content: string };

const systemPrompt = `You are Propfident Trade Assist V2, a sharp and professional prop firm risk strategist.
Ask only 1-2 brief clarifying questions at a time about trading style, prop firm rules, account goals, and personal risk appetite before making a final plan. Keep intermediate replies concise.
When enough context is available, or when the user asks to build the plan, return a final structured Markdown plan in clear, simple 6th-grade English. It must include maximum daily loss limits in dollars and percent, recommended lot sizes per trade, and key execution rules. Use the supplied account balance and equity figures exactly. Never promise profits or guaranteed safety. Make reasonable assumptions explicit.`;

const modelsToTry = ["llama-3.3-70b-specdec", "llama-3.1-8b-instant"] as const;

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is missing from environment variables");
    return NextResponse.json(
      { error: "GROQ_API_KEY is missing in server environment. Please check .env.local" },
      { status: 500 }
    );
  }

  let body: { messages?: ChatMessage[]; accountId?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const messages = Array.isArray(body.messages)
    ? body.messages.filter((message) => (message.role === "user" || message.role === "assistant") && typeof message.content === "string" && message.content.trim()).slice(-20)
    : [];
  if (!messages.length) return NextResponse.json({ error: "Add a message first." }, { status: 400 });

  let accountQuery = supabase.from("mt5_accounts").select("id, metaapi_account_id, account_currency, currency, broker_server, connection_status, balance, equity, current_balance, current_equity").eq("user_id", user.id).eq("is_active", true).eq("platform", "MT5").eq("connection_status", "CONNECTED");
  if (body.accountId) accountQuery = accountQuery.eq("id", body.accountId);
  const { data: account } = await accountQuery.order("updated_at", { ascending: false }).maybeSingle();
  if (!account) return NextResponse.json({ error: "Connect an active MT5 account before using Trade Assist." }, { status: 400 });

  let balance = Number(account.balance ?? account.current_balance ?? 0);
  let equity = Number(account.equity ?? account.current_equity ?? balance);
  let currency = account.account_currency || account.currency || "USD";
  let leverage = "unavailable";
  if (account.metaapi_account_id && isMetaApiConfigured()) {
    try {
      const metaAccount = await getMetaApi().metatraderAccountApi.getAccount(account.metaapi_account_id);
      const rpc = metaAccount.getRPCConnection();
      await rpc.connect();
      await rpc.waitSynchronized();
      const live = await rpc.getAccountInformation();
      balance = Number(live.balance) || balance;
      equity = Number(live.equity) || equity;
      currency = live.currency || currency;
      leverage = String(live.leverage ?? "unavailable");
    } catch (error) { console.warn("[plan-chat] live MetaApi snapshot unavailable; using cached account state", error); }
  }

  const accountContext = `Client Account Data: Balance = ${balance} ${currency}, Equity = ${equity} ${currency}, Connection Status = CONNECTED. Server = ${account.broker_server || "unavailable"}, Leverage = ${leverage}. Use these exact balance/equity figures when discussing risk percentages, dollar limits, and lot sizes.`;
  const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });
  try {
    let reply = "";
    let lastError: unknown = null;

    for (const model of modelsToTry) {
      try {
        const response = await groq.chat.completions.create({
          model,
          messages: [{ role: "system", content: `${systemPrompt}\n\n${accountContext}` }, ...messages],
          temperature: 0.6,
          max_tokens: 1500,
        });
        reply = response.choices?.[0]?.message?.content?.trim() || "";
        if (reply) break;
        console.error(`Groq model ${model} returned an empty completion:`, JSON.stringify(response));
      } catch (error) {
        console.warn(`Groq model ${model} failed, attempting fallback...`, error);
        lastError = error;
      }
    }

    if (!reply) {
      throw lastError || new Error("All Groq model endpoints failed.");
    }
    return NextResponse.json({ role: "assistant", content: reply, account: { balance, equity, currency, leverage, status: account.connection_status } });
  } catch (error: any) {
    console.error("Detailed Groq API Error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate response from Groq." },
      { status: 500 }
    );
  }
}