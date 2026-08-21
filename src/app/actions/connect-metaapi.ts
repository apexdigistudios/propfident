"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  getMetaApi,
  isMetaApiConfigured,
  fetchHistoricalDeals,
  createWebhookSubscription,
} from "@/lib/metaapi";
import { upsertDealAsTrade, applyRealizedPnlToAccount } from "@/lib/account-sync";

export interface ConnectMetaApiInput {
  authenticatedUserId?: string;
  accountName: string;
  brokerName: string;
  brokerServer: string;
  platform: "MT4" | "MT5";
  accountNumber: string;
  password: string;
  accountCurrency: string;
  accountType: "evaluation" | "verification" | "funded";
  initialBalance: number;
  maxTotalDrawdownPct: number;
  maxDailyDrawdownPct: number;
  drawdownType: "trailing" | "static" | "balance_based";
}

export interface ConnectMetaApiResult {
  success: boolean;
  metaApiConnected?: boolean;
  dealCount?: number;
  error?: string;
}

/** Maps raw MetaApi errors to human-readable messages for the connect form. */
function friendlyMetaApiError(err: unknown): string {
  const raw =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const msg = raw.toLowerCase();

  if (msg.includes("auth") || msg.includes("password") || msg.includes("credentials")) {
    return "MetaApi could not authenticate with those credentials. Double-check your account number and investor/trader password.";
  }
  if (msg.includes("server not found") || msg.includes("invalid server") || msg.includes("unknown server")) {
    return "Broker server not recognized. Use the exact server name shown in your MetaTrader terminal (e.g. FTMO-Demo).";
  }
  if (msg.includes("already exists") || msg.includes("duplicate")) {
    return "An account with this login is already connected. Try a different account number or remove the existing one.";
  }
  if (msg.includes("resource slot") || msg.includes("billing") || msg.includes("insufficient")) {
    return "Your MetaApi plan does not have enough resource slots to provision this account. Please upgrade your MetaApi plan.";
  }
  if (msg.includes("deployment failed") || msg.includes("failed to deploy")) {
    return "The MetaApi cloud terminal failed to start. This is usually a bad server name or login. Please verify and retry.";
  }
  return raw
    ? `MetaApi error: ${raw}`
    : "MetaApi provisioning failed. Please verify your credentials and server name, then try again.";
}

const MAX_DEPLOY_TIMEOUT_MS = 90_000;

export async function connectMetaApiAccount(
  formData: ConnectMetaApiInput
): Promise<ConnectMetaApiResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "You must be signed in to connect an account." };
    }

    if (formData.authenticatedUserId && formData.authenticatedUserId !== user.id) {
      console.error("[connect-metaapi] Authenticated user mismatch between route and action.");
      return { success: false, error: "Authentication session changed. Please retry." };
    }

    // ── Field validation ──────────────────────────────────────────
    const missing: string[] = [];
    if (!formData.accountName?.trim()) missing.push("account name");
    if (formData.platform !== "MT5") missing.push("MT5 platform");
    if (!formData.brokerServer?.trim()) missing.push("broker server");
    if (!formData.accountNumber?.trim()) missing.push("account number");
    if (!formData.password?.trim()) missing.push("password");

    if (missing.length) {
      return {
        success: false,
        error: `Missing required fields: ${missing.join(", ")}.`,
      };
    }

    if (!isMetaApiConfigured()) {
      return {
        success: false,
        error: "MetaApi provisioning is not configured. Add METAAPI_TOKEN before connecting an MT5 account.",
      };
    }

    // ── Tier + account-limit gating ───────────────────────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .maybeSingle();

    const tier = profile?.subscription_tier || "free";
    if (tier === "free") {
      return {
        success: false,
        error: "Account connection is locked on the Free plan. Upgrade to Pro or Elite to connect MT4/MT5 accounts.",
      };
    }

    const { count: activeCount } = await supabase
      .from("mt5_accounts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("connection_status", ["CONNECTING", "SYNCING", "CONNECTED"])
      .eq("is_active", true);

    const maxAccounts = tier === "pro" ? 3 : 999;
    if ((activeCount || 0) >= maxAccounts) {
      return {
        success: false,
        error: `You've reached the account limit for your plan (${maxAccounts}). Upgrade to Elite for unlimited accounts.`,
      };
    }

    const balance = Number(formData.initialBalance) || 0;
    let savedAccountId: string | undefined;
    let accountRegion: string | undefined;

    const { data: pendingAccount, error: pendingError } = await supabase
      .from("mt5_accounts")
      .insert({
        user_id: user.id,
        account_name: formData.accountName.trim(),
        account_number: formData.accountNumber.trim(),
        account_password: formData.password,
        broker_name: formData.brokerName?.trim() || formData.brokerServer.trim(),
        broker_server: formData.brokerServer.trim(),
        platform: "MT5",
        connection_status: "CONNECTING",
        account_type: formData.accountType || "evaluation",
        account_currency: formData.accountCurrency || "USD",
        initial_balance: balance,
        balance,
        equity: balance,
        current_balance: balance,
        current_equity: balance,
        high_water_mark: balance,
        max_total_drawdown_pct: formData.maxTotalDrawdownPct,
        max_daily_drawdown_pct: formData.maxDailyDrawdownPct,
        daily_starting_balance: balance,
        drawdown_type: formData.drawdownType,
        is_active: true,
        is_breached: false,
      })
      .select("id")
      .single();

    if (pendingError || !pendingAccount) {
      return {
        success: false,
        error: pendingError?.message || "Failed to create the MT5 account record.",
      };
    }
    savedAccountId = pendingAccount.id;

    try {
        const metaApi = getMetaApi();
        const account = await metaApi.metatraderAccountApi.createAccount({
          name: formData.accountName.trim(),
          server: formData.brokerServer.trim(),
          login: formData.accountNumber.trim(),
          password: formData.password,
          platform: "mt5",
          magic: 1000,
          quoteStreamingIntervalInSeconds: 2.5,
          reliability: "high",
        });

        // Deploy the cloud terminal instance
        await account.deploy();

        // Wait for deployment with a timeout guard
        const deployWait = account.waitDeployed(
          Math.floor(MAX_DEPLOY_TIMEOUT_MS / 1000),
          2000
        );
        await Promise.race([
          deployWait,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Deployment timed out while waiting for the MetaApi terminal.")),
              MAX_DEPLOY_TIMEOUT_MS
            )
          ),
        ]);

        accountRegion = account.region;

        const connection = account.getRPCConnection();
        await connection.connect();
        await connection.waitSynchronized();
        const accountInformation = await connection.getAccountInformation();
        const liveBalance = Number(accountInformation?.balance);
        const liveEquity = Number(accountInformation?.equity);
        if (!Number.isFinite(liveBalance) || !Number.isFinite(liveEquity)) {
          throw new Error("MetaApi returned invalid balance or equity values.");
        }

        const { error: connectedError } = await supabase
          .from("mt5_accounts")
          .update({
            metaapi_account_id: account.id,
            connection_status: "CONNECTED",
            balance: liveBalance,
            equity: liveEquity,
            current_balance: liveBalance,
            current_equity: liveEquity,
            high_water_mark: liveEquity,
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", savedAccountId)
          .eq("user_id", user.id);

        if (connectedError) throw new Error(connectedError.message);

        // Best-effort webhook subscription (non-fatal)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
        if (appUrl) {
          await createWebhookSubscription(
            account.id,
            accountRegion,
            `${appUrl.replace(/\/$/, "")}/api/webhooks/metaapi`,
            process.env.WEBHOOK_SECRET || ""
          );
        }
    } catch (metaApiErr) {
      console.error("[connect-metaapi] provisioning error:", metaApiErr);
      if (savedAccountId) {
        await supabase
          .from("mt5_accounts")
          .update({
            connection_status: "ERROR",
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", savedAccountId)
          .eq("user_id", user.id);
      }
      return {
        success: false,
        error: friendlyMetaApiError(metaApiErr),
      };
    }

    // ── Fallback backfill: fetch historical deals for the journal ──
    let dealCount = 0;
    if (savedAccountId) {
      const end = new Date();
      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // last 30 days
      const accountRow = await supabase
        .from("mt5_accounts")
        .select("metaapi_account_id")
        .eq("id", savedAccountId)
        .single();
      const deals = await fetchHistoricalDeals(accountRow.data?.metaapi_account_id || "", accountRegion, start, end);

      for (const deal of deals) {
        try {
          const result = await upsertDealAsTrade(supabase, { id: savedAccountId, user_id: user.id }, deal);
          if (result.isNew && result.realized) {
            await applyRealizedPnlToAccount(supabase, savedAccountId, result.pnl);
          }
          dealCount += 1;
        } catch (dealErr) {
          console.warn("[connect-metaapi] deal sync error (non-fatal):", dealErr);
        }
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/account-intel");
    revalidatePath("/dashboard/prop-shield");
    revalidatePath("/dashboard/journal");
    revalidatePath("/dashboard/trade-assist");

    return { success: true, metaApiConnected: true, dealCount };
  } catch (err) {
    console.error("connectMetaApiAccount error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to connect the MetaApi account.",
    };
  }
}
