import { createRequire } from "module";
import type MetaApiClient from "metaapi.cloud-sdk";

const require = createRequire(import.meta.url);
const MetaApi = require("metaapi.cloud-sdk").default || require("metaapi.cloud-sdk");

/**
 * MetaApi Cloud SDK singleton + REST helpers.
 *
 * Reads the token from METAAPI_TOKEN (preferred) or METAAPI_KEY (fallback),
 * matching the environment contract used by the deployment.
 */

const globalForMetaApi = globalThis as unknown as {
  metaApi?: MetaApiClient;
};

function getRawToken(): string | undefined {
  return process.env.METAAPI_TOKEN || process.env.METAAPI_KEY;
}

/** Whether a non-placeholder MetaApi token is available. */
export function isMetaApiConfigured(): boolean {
  const token = getRawToken();
  return Boolean(token && token.length > 20 && !token.startsWith("YOUR_"));
}

/**
 * Returns the shared MetaApi client instance (created lazily on first use so a
 * missing token never crashes at build/import time).
 */
export function getMetaApi(): MetaApiClient {
  const token = getRawToken();
  if (!token || token.startsWith("YOUR_")) {
    throw new Error("METAAPI_TOKEN environment variable is not configured.");
  }

  if (!globalForMetaApi.metaApi) {
    globalForMetaApi.metaApi = new MetaApi(token, {
      application: "Propfident",
      // Generous timeouts for deployment (cloud terminals can take a while)
      requestTimeout: 120,
      connectTimeout: 30,
      retryOpts: { retries: 3, minDelayInSeconds: 1 },
    });
  }

  return globalForMetaApi.metaApi!;
}

/**
 * MetaApi REST client base URL for a given region (historical data reads).
 * Falls back to the default "new-york" region when unknown.
 */
function clientApiBase(region?: string): string {
  const safeRegion = region || "new-york";
  return `https://mt-client-api-v1.${safeRegion}.agiliumtrade.ai`;
}

/**
 * A normalized MetaApi deal (from the history-deals REST response).
 */
export interface MetaApiDeal {
  id: string;
  orderId?: string;
  positionId?: string;
  symbol: string;
  type: string; // DEAL_TYPE_BUY | DEAL_TYPE_SELL
  entryType?: string; // DEAL_ENTRY_IN | DEAL_ENTRY_OUT
  volume: number;
  price: number;
  profit: number;
  commission?: number;
  swap?: number;
  time?: string;
  brokerTime?: string;
  platform?: string;
}

/**
 * Fetches historical deals for an account within a time range.
 * Used as the fallback backfill so the journal is populated on first connect.
 * Returns an empty array on any failure (best-effort).
 */
export async function fetchHistoricalDeals(
  accountId: string,
  region: string | undefined,
  start: Date,
  end: Date
): Promise<MetaApiDeal[]> {
  const token = getRawToken();
  if (!token) return [];

  const url = `${clientApiBase(region)}/users/current/accounts/${accountId}/history-deals/time/${start.toISOString()}/${end.toISOString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "auth-token": token,
      },
    });

    if (!res.ok) {
      console.warn(
        `[metaapi] historical deals request failed: ${res.status} ${await safeText(res)}`
      );
      return [];
    }

    const json = (await res.json()) as MetaApiDeal[];
    return Array.isArray(json) ? json : [];
  } catch (err) {
    console.warn("[metaapi] historical deals error:", err);
    return [];
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return "";
  }
}

/**
 * Best-effort webhook subscription. MetaApi's per-account webhook REST contract
 * varies by region/plan, so this call is defensive: any failure is logged and
 * never blocks account creation. The webhook receiver at /api/webhooks/metaapi
 * is fully functional and the historical backfill guarantees journal data.
 */
export async function createWebhookSubscription(
  accountId: string,
  region: string | undefined,
  endpointUrl: string,
  secret: string
): Promise<{ ok: boolean; detail?: string }> {
  const token = getRawToken();
  if (!token) return { ok: false, detail: "no token" };

  const base = region
    ? `https://mt-client-api-v1.${region}.agiliumtrade.ai`
    : "https://mt-client-api-v1.new-york.agiliumtrade.ai";
  const url = `${base}/users/current/accounts/${accountId}/webhooks`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "auth-token": token,
      },
      body: JSON.stringify({
        name: "Propfident Trade Sync",
        endpointUrl,
        secretHeader: "X-MetaApi-Secret",
        secret,
        events: [
          "trade_opened",
          "trade_closed",
          "position_opened",
          "position_closed",
          "balance_updated",
          "equity_updated",
        ],
        enabled: true,
      }),
    });

    if (!res.ok) {
      return {
        ok: false,
        detail: `webhook subscription returned ${res.status} (non-fatal)`,
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "webhook subscription error (non-fatal)",
    };
  }
}
