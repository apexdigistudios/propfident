import { NextResponse } from "next/server";
import { connectMetaApiAccount } from "@/app/actions/connect-metaapi";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function sanitizedConnectMessage(rawError: unknown): string {
  const raw = rawError instanceof Error ? rawError.message : String(rawError || "");
  const message = raw.toLowerCase();

  if (
    message.includes("billing") ||
    message.includes("resource slot") ||
    message.includes("account limit") ||
    message.includes("reached the account limit") ||
    message.includes("plan does not have enough")
  ) {
    return "Account provisioning service is currently unavailable. Please contact support.";
  }

  if (
    message.includes("credential") ||
    message.includes("password") ||
    message.includes("invalid server") ||
    message.includes("server not found") ||
    message.includes("unknown server") ||
    message.includes("authentication failed") ||
    message.includes("account number")
  ) {
    return "Invalid MT5 account credentials or server details. Please check your login details and try again.";
  }

  if (
    message.includes("signed in") ||
    message.includes("session") ||
    message.includes("jwt") ||
    message.includes("no authenticated user")
  ) {
    return "Session expired. Please sign in again.";
  }

  return "Failed to connect trading account. Please try again later.";
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const sessionError = authError || new Error("No authenticated user returned");
      console.error("[MetaApi Connect Error]:", sessionError);

      return NextResponse.json(
        { success: false, error: "Session expired. Please sign in again." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const initial_balance = Number(body.initial_balance || body.balance || 0);
    const accountName = body.account_name ?? body.accountName;
    const accountNumber = body.login_id ?? body.accountNumber;
    const brokerServer = body.server ?? body.brokerServer;
    const brokerName = body.broker ?? body.brokerName;
    const requiredFields: Array<[string, unknown]> = [
      ["account_name", accountName],
      ["login_id", accountNumber],
      ["password", body.password],
      ["server", brokerServer],
      ["broker", brokerName],
      ["platform", body.platform],
    ];
    const missingField = requiredFields.find(
      ([, value]) => typeof value !== "string" || !value.trim()
    )?.[0];

    if (missingField) {
      const message = `Missing required field: ${missingField}.`;
      return NextResponse.json(
        { success: false, message, error: message },
        { status: 400 }
      );
    }

    if (body.platform !== "MT5") {
      const message = "Only MT5 accounts can be connected at this time.";
      return NextResponse.json(
        { success: false, message, error: message },
        { status: 400 }
      );
    }

    if (!Number.isFinite(initial_balance) || initial_balance <= 0) {
      const message = "Initial balance must be a positive number.";
      return NextResponse.json(
        { success: false, message, error: message },
        { status: 400 }
      );
    }

    const input = {
      ...body,
      // The server action re-reads auth from cookies and uses that identity
      // for the mt5_accounts.user_id insert; this is the route-authenticated ID.
      authenticatedUserId: user.id,
      accountName,
      accountNumber,
      password: body.password,
      brokerServer,
      brokerName,
      accountCurrency: body.account_currency ?? body.accountCurrency,
      accountType: body.account_type ?? body.accountType,
      initial_balance,
      initialBalance: initial_balance,
      maxTotalDrawdownPct: body.max_total_drawdown ?? body.maxTotalDrawdownPct,
      maxDailyDrawdownPct: body.max_daily_drawdown ?? body.maxDailyDrawdownPct,
      drawdownType: body.drawdown_type ?? body.drawdownType,
    };

    // Delegate to the existing server-side action which handles auth,
    // MetaApi provisioning, Supabase persistence, and backfill.
    const result = await connectMetaApiAccount(input);

    if (!result.success) {
      console.error("[MetaApi Connect Error]:", result.error || "Account connection failed");
      return NextResponse.json(
        { success: false, error: sanitizedConnectMessage(result.error) },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[MetaApi Connect Error]:", err);
    return NextResponse.json(
      { success: false, error: sanitizedConnectMessage(err) },
      { status: 500 }
    );
  }
}
