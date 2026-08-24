"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot,
} from "recharts";
import { toNumber, usdFormatter } from "./format";

type TradeSnapshot = {
  close_time?: string | null;
  created_at?: string | null;
  pnl?: string | number | null;
  current_equity?: string | number | null;
};

type ChartPoint = {
  label: string;
  equity: number;
  balance: number;
  rawDate: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function EquityChart({
  initialBalance,
  trades,
}: {
  initialBalance: string | number | null | undefined;
  trades: TradeSnapshot[];
}) {
  const startingBalance = toNumber(initialBalance);

  const data: ChartPoint[] = (() => {
    if (!trades.length) {
      return [
        {
          label: "Start",
          equity: startingBalance,
          balance: startingBalance,
          rawDate: "",
        },
        {
          label: "Now",
          equity: startingBalance,
          balance: startingBalance,
          rawDate: "",
        },
      ];
    }

    let runningEquity = startingBalance;
    let runningBalance = startingBalance;
    return trades.map((trade, index) => {
      const explicitEquity = toNumber(trade.current_equity);
      runningEquity = explicitEquity > 0 ? explicitEquity : runningEquity + toNumber(trade.pnl);
      runningBalance += toNumber(trade.pnl);
      const rawDate = trade.close_time || trade.created_at || "";
      return {
        label: rawDate ? formatDate(rawDate) : `Trade ${index + 1}`,
        equity: runningEquity,
        balance: runningBalance,
        rawDate,
      };
    });
  })();

  const hasAccount = startingBalance > 0;
  const peak = data.reduce((current, point) => point.equity > current.equity ? point : current, data[0]);
  const low = data.reduce((current, point) => point.equity < current.equity ? point : current, data[0]);

  return (
    <div className="h-[320px] w-full min-w-0 max-w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.42} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#334155" strokeOpacity={0.25} vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickFormatter={(value) => usdFormatter.format(Number(value)).replace(".00", "")}
            width={82}
          />
          <Tooltip
            cursor={{ stroke: "#8b5cf6", strokeWidth: 1, strokeDasharray: "4 4" }}
            contentStyle={{
              background: "rgba(15, 23, 42, 0.96)",
              border: "1px solid rgba(168, 85, 247, 0.28)",
              borderRadius: "12px",
              color: "#f8fafc",
              boxShadow: "0 18px 60px rgba(0, 0, 0, 0.35)",
            }}
            labelStyle={{ color: "#c4b5fd", fontWeight: 700 }}
              formatter={(value: unknown, name: unknown) => [usdFormatter.format(Number(value)), String(name) === "balance" ? "Balance" : "Equity"]}
              labelFormatter={(_, payload) => {
                const rawDate = payload?.[0]?.payload?.rawDate;
                return rawDate ? new Date(rawDate).toLocaleString() : "";
              }}
          />
          <Area type="monotone" dataKey="balance" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={hasAccount ? "#8b5cf6" : "#64748b"}
            strokeWidth={2.5}
            fill={hasAccount ? "url(#purpleGradient)" : "transparent"}
            dot={false}
            activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#f8fafc", strokeWidth: 2 }}
          />
          {hasAccount && <ReferenceDot x={peak.label} y={peak.equity} r={5} fill="#34d399" stroke="#ecfdf5" strokeWidth={2} label={{ value: "Peak", position: "top", fill: "#34d399", fontSize: 10 }} />}
          {hasAccount && <ReferenceDot x={low.label} y={low.equity} r={5} fill="#fb7185" stroke="#fff1f2" strokeWidth={2} label={{ value: "Low", position: "bottom", fill: "#fb7185", fontSize: 10 }} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
