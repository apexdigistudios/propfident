"use client";

import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface DataPoint {
  day: string;
  timestamp: string;
  balance: number;
  equity: number;
}

const data: DataPoint[] = [
  { day: "D1", timestamp: "2026-07-25T09:30:00Z", balance: 49000, equity: 49000 },
  { day: "D5", timestamp: "2026-07-29T09:30:00Z", balance: 50600, equity: 50800 },
  { day: "D10", timestamp: "2026-08-03T09:30:00Z", balance: 52200, equity: 52500 },
  { day: "D15", timestamp: "2026-08-08T09:30:00Z", balance: 53400, equity: 53600 },
  { day: "D20", timestamp: "2026-08-13T09:30:00Z", balance: 54800, equity: 55100 },
  { day: "D25", timestamp: "2026-08-18T09:30:00Z", balance: 56200, equity: 56450 },
  { day: "D30", timestamp: "2026-08-23T09:30:00Z", balance: 58100, equity: 58450 },
];

const maxDrawdown = 50000;
const peak = data.reduce((current, point) => point.equity > current.equity ? point : current, data[0]);
const latest = data[data.length - 1];

export default function EquityChart() {
  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-purple-600 uppercase dark:text-purple-400">
          <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
          30-Day Equity Trend
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
          Active Shield
        </span>
      </div>

      <div className="h-[220px] w-full rounded-2xl border border-slate-200 bg-white p-2 md:h-[240px] dark:border-purple-500/20 dark:bg-slate-950">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#334155" strokeOpacity={0.25} vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: 500 }}
              tickMargin={6}
            />
            <YAxis
              domain={[46000, 62000]}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: 500 }}
              tickMargin={6}
            />
            <Tooltip
              cursor={{ stroke: "#a855f7", strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                background: "rgba(12, 12, 24, 0.95)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 8px 30px rgba(168, 85, 247, 0.2)",
                color: "#fff",
                fontSize: "12px",
                fontFamily: "inherit",
                padding: "10px 14px",
              }}
              formatter={(value: unknown, name: unknown) => [`$${Number(value || 0).toLocaleString()}`, String(name) === "balance" ? "Balance" : "Equity"]}
              labelFormatter={(_, payload) => {
                const timestamp = payload?.[0]?.payload?.timestamp;
                return timestamp ? new Date(timestamp).toLocaleString() : "";
              }}
            />
            <ReferenceLine y={maxDrawdown} stroke="#f87171" strokeDasharray="6 4" strokeWidth={1.5} label={{ position: "insideTopRight", value: "Breach Limit", fill: "#f87171", fontSize: 9, fontWeight: 600, dx: 10, dy: -14 }} />
            <Area type="monotone" dataKey="balance" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#a855f7"
              strokeWidth={2.5}
              fill="url(#equityGrad)"
              dot={{ r: 3, fill: "#7c3aed", strokeWidth: 2, stroke: "#a855f7" }}
              activeDot={{ r: 5, fill: "#a855f7", stroke: "#fff", strokeWidth: 2 }}
            />
            <ReferenceDot x={peak.day} y={peak.equity} r={5} fill="#34d399" stroke="#ecfdf5" strokeWidth={2} label={{ value: "Peak", position: "top", fill: "#34d399", fontSize: 9 }} />
            <ReferenceDot x={latest.day} y={latest.equity} r={5} fill="#a855f7" stroke="#fff" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric value="+18.7%" label="30-Day Growth" />
        <Metric value="$2,450" label="Breach Buffer" />
        <Metric value="0" label="Breach Events" />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 md:px-4 dark:border-purple-500/30 dark:bg-slate-900/90">
      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-extrabold tracking-tighter text-slate-900 md:text-base dark:text-white">{value}</div>
    </div>
  );
}
