import { NextResponse } from "next/server";
import {
  upsertDealAsTrade,
  applyRealizedPnlToAccount,
} from "@/lib/account-sync";
import type { MetaApiDeal } from "@/lib/metaapi";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * MetaApi webhook receiver.
 *
 * Accepts trade / deal / balance / equity events from MetaApi, matches the
 * account to a prop_accounts row, upserts the trade, and recalculates the
 * Drawdown Shield (balance, equity, HWM, status). Idempotent via deal_id.
 */

/** Verifies the MetaApi webhook secret against WEBHOOK_SECRET. */
function isAuthorized(request: Request): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret || secret.startsWith("YOUR_")) {
    console.error("[webhooks/metaapi] WEBHOOK_SECRET is not configured; denying request.");
    return false;
  }

  const candidates = [
    request.headers.get("x-metaapi-secret"),
    request.headers.get("x-secret-header"),
    request.headers.get("x-webhook-secret"),
    request.headers.get("x-metaapi-webhook-secret"),
    (() => {
      const auth = request.headers.get("authorization") || "";
      return auth.startsWith("Bearer ") ? auth.slice(7) : null;
    })(),
  ];

  return candidates.some((value) => value === secret);
}

const num = (value: unknown, fallback = 0): number => {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? n : fallback;
};

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value.length ? value : undefined;

/** Normalizes a flexible MetaApi deal payload into a MetaApiDeal. */
function normalizeDeal(payload: Record<string, any>, event: string): MetaApiDeal | null {
  const candidates: any[] = [
    payload.deal,
    payload.data?.deal,
    payload.data,
    payload,
  ];

  const raw = candidates.find(
    (c) => c && typeof c === "object" && (c.symbol || c.type)
  );
  if (!raw) return null;

  // Determine if this is a realized close
  let entryType = str(raw.entryType) || str(raw.entry) || undefined;
  if (!entryType) {
    const closeEvent =
      event === "trade_closed" ||
      event === "position_closed" ||
      event === "deal_closed";
    const openEvent =
      event === "trade_opened" ||
      event === "position_opened" ||
      event === "deal_opened";
    entryType = closeEvent
      ? "DEAL_ENTRY_OUT"
      : openEvent
        ? "DEAL_ENTRY_IN"
        : num(raw.profit) !== 0
          ? "DEAL_ENTRY_OUT"
          : "DEAL_ENTRY_IN";
  }

  // Normalize type to DEAL_TYPE_*
  let type = str(raw.type) || str(raw.side) || "";
  if (type === "BUY") type = "DEAL_TYPE_BUY";
  else if (type === "SELL") type = "DEAL_TYPE_SELL";

  return {
    id: str(raw.id) || str(raw._id) || str(raw.dealId) || String(raw.orderId ?? ""),
    orderId: str(raw.orderId),
    positionId: str(raw.positionId),
    symbol: str(raw.symbol) || "UNKNOWN",
    type,
    entryType,
    volume: num(raw.volume, num(raw.lotSize, num(raw.lots))),
    price: num(raw.price, num(raw.closePrice, num(raw.openPrice))),
    profit: num(raw.profit, num(raw.pnl)),
    commission: num(raw.commission),
    swap: num(raw.swap),
    time: str(raw.time) || str(raw.closeTime) || str(raw.openTime),
    brokerTime: str(raw.brokerTime),
    platform: str(raw.platform),
  };
}

/** Extract the event name from a flexible payload. */
function eventOf(payload: Record<string, any>): string {
  return str(payload.event) || str(payload.type) || str(payload.action) || "unknown";
}

export async function POST(request: Request) {
  // ── 1. Authorize ─────────────────────────────────────────────────
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
  }

  let payload: Record<string, any>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const event = eventOf(payload);
    const accountId = str(payload.accountId) || str(payload.account_id);

    if (!accountId) {
      return NextResponse.json({ received: true, skipped: "no accountId" });
    }

    // ── 2. Match the prop account by MetaApi account id ────────────
    const supabase = createAdminClient();
    const { data: account } = await supabase
      .from("mt5_accounts")
      .select("id, user_id, is_active")
      .eq("metaapi_account_id", accountId)
      .maybeSingle();

    if (!account) {
      return NextResponse.json({ received: true, skipped: "account not found" });
    }

    // Non-fatal: if the event carries fresh equity/balance, sync it directly.
    const accountInfo = payload.accountInfo || payload.data?.accountInfo;
    if (accountInfo && typeof accountInfo === "object") {
      const balance = num(accountInfo.balance, 0);
      const equity = num(accountInfo.equity, 0);
      if (balance > 0 || equity > 0) {
        const update: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
          last_synced_at: new Date().toISOString(),
        };
        if (balance > 0) update.current_balance = balance;
        if (equity > 0) {
          update.current_equity = equity;
          update.high_water_mark = Math.max(
            num((await supabase.from("mt5_accounts").select("high_water_mark").eq("id", account.id).single()).data?.high_water_mark),
            equity
          );
        }
        await supabase.from("mt5_accounts").update(update).eq("id", account.id);
      }
    }

    // ── 3. Extract + upsert the deal/trade ─────────────────────────
    const deal = normalizeDeal(payload, event);
    if (!deal || !deal.id) {
      return NextResponse.json({ received: true, skipped: "no deal in payload" });
    }

    const result = await upsertDealAsTrade(
      supabase,
      { id: account.id, user_id: account.user_id },
      deal
    );

    // ── 4. Apply realized P&L exactly once (idempotent) ────────────
    if (result.isNew && result.realized && result.pnl) {
      await applyRealizedPnlToAccount(supabase, account.id, result.pnl);
    }

    return NextResponse.json({
      received: true,
      event,
      accountId,
      tradeInserted: result.isNew,
      pnlApplied: result.isNew && result.realized ? result.pnl : 0,
    });
  } catch (err) {
    console.error("[webhooks/metaapi] processing error:", err);
    // 500 lets MetaApi retry; but avoid an infinite retry storm for data errors.
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook processing failed" },
      { status: 500 }
    );
  }
}
