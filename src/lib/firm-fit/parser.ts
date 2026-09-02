import Papa from "papaparse";

export interface NormalizedTrade {
  ticket: string;
  symbol: string;
  action: "BUY" | "SELL";
  lots: number;
  openTime: Date;
  closeTime: Date;
  openPrice: number;
  closePrice: number;
  pnl: number;
}

type RawRow = Record<string, unknown>;

const FIELD_ALIASES = {
  ticket: ["ticket", "item", "order", "ordernumber", "deal", "position"],
  symbol: ["symbol", "instrument", "pair", "market"],
  action: ["action", "type", "side", "direction"],
  lots: ["lots", "lot", "volume", "size", "quantity"],
  openTime: ["opentime", "open date", "open time", "entrytime", "entry date", "time open"],
  closeTime: ["closetime", "close date", "close time", "exittime", "exit date", "time close"],
  openPrice: ["openprice", "open price", "entryprice", "entry price"],
  closePrice: ["closeprice", "close price", "exitprice", "exit price"],
  pnl: ["profit", "p/l", "pnl", "p&l", "net profit", "net pnl", "result"],
} as const;

function cleanKey(value: string): string {
  return value.toLowerCase().replace(/[\u00a0_\-:/\\]+/g, " ").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

function valueFor(row: RawRow, aliases: readonly string[]): unknown {
  const entries = Object.entries(row);
  const match = entries.find(([key]) => {
    const normalized = cleanKey(key);
    return aliases.some((alias) => normalized === cleanKey(alias));
  });
  return match?.[1];
}

function parseNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const text = String(value ?? "").replace(/[,$%\s]/g, "").replace(/\(([^)]+)\)/, "-$1");
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const date = new Date(String(value ?? "").trim());
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseAction(value: unknown): "BUY" | "SELL" | null {
  const action = String(value ?? "").trim().toLowerCase();
  if (action.includes("buy") || action === "long" || action === "in") return "BUY";
  if (action.includes("sell") || action === "short" || action === "out") return "SELL";
  return null;
}

function normalizeRow(row: RawRow): NormalizedTrade | null {
  const ticket = String(valueFor(row, FIELD_ALIASES.ticket) ?? "").trim();
  const symbol = String(valueFor(row, FIELD_ALIASES.symbol) ?? "").trim();
  const action = parseAction(valueFor(row, FIELD_ALIASES.action));
  const lots = parseNumber(valueFor(row, FIELD_ALIASES.lots));
  const openTime = parseDate(valueFor(row, FIELD_ALIASES.openTime));
  const closeTime = parseDate(valueFor(row, FIELD_ALIASES.closeTime));
  const openPrice = parseNumber(valueFor(row, FIELD_ALIASES.openPrice));
  const closePrice = parseNumber(valueFor(row, FIELD_ALIASES.closePrice));
  const pnl = parseNumber(valueFor(row, FIELD_ALIASES.pnl));

  if (!ticket || !symbol || !action || !openTime || !closeTime || ![lots, openPrice, closePrice, pnl].every(Number.isFinite)) return null;
  return { ticket, symbol, action, lots, openTime, closeTime, openPrice, closePrice, pnl };
}

export function parseTradeCsv(csv: string): NormalizedTrade[] {
  const result = Papa.parse<RawRow>(csv, { header: true, skipEmptyLines: true, transformHeader: (header) => header.trim() });
  return result.data.map(normalizeRow).filter((trade): trade is NormalizedTrade => trade !== null);
}

export function parseTradeExport(csv: string): NormalizedTrade[] {
  return parseTradeCsv(csv);
}
