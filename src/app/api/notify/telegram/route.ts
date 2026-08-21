import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Propfident Telegram Alert Webhook
 *
 * Called by Supabase (via pg_net) whenever a `prop_accounts.drawdown_status`
 * transition to WARNING / CRITICAL / BREACHED is detected by the
 * `update_drawdown_status()` trigger function.
 *
 * Payload (from Supabase):
 * {
 *   user_id: string,
 *   account_id: string,
 *   account_number: string,
 *   account_name?: string,
 *   current_equity: number,
 *   drawdown_status: 'WARNING' | 'CRITICAL' | 'BREACHED',
 *   headroom_pct?: number
 * }
 *
 * Security:
 *   Bearer token must match TELEGRAM_WEBHOOK_SECRET.
 */

interface WebhookPayload {
  user_id: string;
  account_id?: string;
  account_number: string;
  account_name?: string;
  current_equity: number;
  drawdown_status: "SAFE" | "WARNING" | "CRITICAL" | "BREACHED";
  headroom_pct?: number;
}

/**
 * Escape MarkdownV2 reserved characters per Telegram spec.
 * https://core.telegram.org/bots/api#markdownv2-style
 */
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

function buildMessage(
  status: "WARNING" | "CRITICAL" | "BREACHED",
  accountNumber: string,
  accountName: string | undefined,
  headroomPct: number,
  currentEquity: number
): string {
  const num = escapeMarkdown(accountNumber);
  const name = accountName ? escapeMarkdown(accountName) : num;
  const pct = escapeMarkdown(headroomPct.toFixed(2));
  const equity = escapeMarkdown(
    currentEquity.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );

  if (status === "BREACHED") {
    return (
      `🔴 *BREACH ALERT — Account ${num}*\n\n` +
      `Your account *${name}* has breached its drawdown floor\\.\n` +
      `Equity: *${equity}*\n` +
      `Headroom: *${pct}%*\n\n` +
      `Immediate action is no longer possible \\- consult your prop firm\\.`
    );
  }

  if (status === "CRITICAL") {
    return (
      `🚨 *ACCOUNT ${num} CRITICAL*\n\n` +
      `Account *${name}* is critically close to breach\\.\n` +
      `Equity: *${equity}*\n` +
      `Headroom: *${pct}%*\n\n` +
      `*Immediate action required\\!* Close open trades or reduce exposure now\\.`
    );
  }

  // WARNING
  return (
    `⚠️ *Account ${num} is at Risk*\n\n` +
    `Account *${name}* is approaching its drawdown limit\\.\n` +
    `Equity: *${equity}*\n` +
    `Headroom: *${pct}%*\n\n` +
    `Please manage exposure carefully\\.`
  );
}

async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token === "your-telegram-bot-token-replace-me") {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN not configured" };
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "MarkdownV2",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Telegram API ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Telegram fetch failed",
    };
  }
}

export async function POST(request: Request) {
  // ── 1. Security: Bearer token check ─────────────────────────────
  const authHeader = request.headers.get("authorization") || "";
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!expected || expected === "your-telegram-webhook-secret-replace-me") {
    return NextResponse.json(
      { error: "Webhook secret is not configured on the server" },
      { status: 503 }
    );
  }

  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json(
      { error: "Unauthorized: invalid bearer token" },
      { status: 401 }
    );
  }

  // ── 2. Parse payload ────────────────────────────────────────────
  let payload: WebhookPayload;
  try {
    payload = (await request.json()) as WebhookPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const {
    user_id,
    account_id,
    account_number,
    account_name,
    current_equity,
    drawdown_status,
    headroom_pct,
  } = payload;

  if (!user_id || !account_number || !drawdown_status) {
    return NextResponse.json(
      { error: "Missing required fields: user_id, account_number, drawdown_status" },
      { status: 400 }
    );
  }

  // Only alert on WARNING/CRITICAL/BREACHED
  if (drawdown_status === "SAFE") {
    return NextResponse.json({ skipped: true, reason: "SAFE status" });
  }

  // ── 3. Look up user's Telegram chat ID ──────────────────────────
  const supabase = createAdminClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("telegram_chat_id, telegram_alerts_enabled")
    .eq("id", user_id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "User profile not found" },
      { status: 404 }
    );
  }

  if (!profile.telegram_chat_id) {
    return NextResponse.json({
      skipped: true,
      reason: "User has no Telegram chat ID linked",
    });
  }

  if (profile.telegram_alerts_enabled === false) {
    return NextResponse.json({
      skipped: true,
      reason: "User has disabled Telegram alerts",
    });
  }

  // ── 4. Compute headroom if not provided ─────────────────────────
  let pct = typeof headroom_pct === "number" ? headroom_pct : 0;
  if (!pct && account_id) {
    const { data: acct } = await supabase
      .from("mt5_accounts")
      .select("initial_balance, high_water_mark, max_total_drawdown_pct, drawdown_type")
      .eq("id", account_id)
      .single();
    if (acct) {
      const initial = Number(acct.initial_balance) || 1;
      const hwm = Number(acct.high_water_mark) || initial;
      const ddPct = Number(acct.max_total_drawdown_pct) || 10;
      const floor =
        acct.drawdown_type === "static"
          ? initial * (1 - ddPct / 100)
          : hwm * (1 - ddPct / 100);
      pct = ((Number(current_equity) - floor) / initial) * 100;
    }
  }

  // ── 5. Build & send Telegram message ────────────────────────────
  const message = buildMessage(
    drawdown_status,
    account_number,
    account_name,
    pct,
    Number(current_equity) || 0
  );

  const result = await sendTelegramMessage(profile.telegram_chat_id, message);

  if (!result.ok) {
    console.error("Telegram send failed:", result.error);
    return NextResponse.json(
      { error: result.error || "Telegram send failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    delivered_to: profile.telegram_chat_id,
    status: drawdown_status,
  });
}
