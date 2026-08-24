import { Check, Minus } from "lucide-react";

const rows = [
  ["Account Connections", "1", "5", "10"],
  ["Dynamic Lot Calculator", "check", "check", "check"],
  ["Static Drawdown Tracking", "check", "check", "check"],
  ["Live Trailing Shield", "—", "check", "check"],
  ["Automated MT4/MT5 Journal", "—", "check", "check"],
  ["Telegram & Email Alerts", "—", "check", "Priority"],
  ["Advanced Expectancy Metrics", "—", "Advanced", "Advanced+"],
  ["Cross-Account Risk Controls", "—", "—", "check"],
  ["Support Level", "Community", "Standard", "24/7 Priority"],
] as const;

function CellValue({ value }: { value: string }) {
  if (value === "check") {
    return <Check className="mx-auto h-4 w-4 text-emerald-500" aria-label="Included" />;
  }
  if (value === "—") {
    return <Minus className="mx-auto h-4 w-4 text-slate-500" aria-label="Not included" />;
  }
  return <span>{value}</span>;
}

export default function PricingComparison() {
  return (
    <div className="mt-16 md:mt-20">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">Compare plans</span>
        <h3 className="mt-3 text-2xl font-extrabold tracking-tighter text-slate-900 dark:text-white sm:text-3xl">Pricing &amp; Feature Comparison</h3>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 dark:border-purple-500/20">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-900">
            <tr className="border-b border-slate-200 dark:border-purple-500/20">
              <th className="px-4 py-4 font-bold text-slate-900 dark:text-white">Features</th>
              <th className="px-4 py-4 text-center font-bold text-slate-900 dark:text-white">Free ($0)</th>
              <th className="px-4 py-4 text-center font-bold text-purple-600 dark:text-purple-300">Pro ($25/mo)</th>
              <th className="px-4 py-4 text-center font-bold text-slate-900 dark:text-white">Elite ($50/mo)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([feature, free, pro, elite]) => (
              <tr key={feature} className="border-b border-slate-200 last:border-b-0 dark:border-purple-500/10">
                <th scope="row" className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{feature}</th>
                {[free, pro, elite].map((value, index) => (
                  <td key={`${feature}-${index}`} className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">
                    <CellValue value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
        Which plan is right for you? 1 Account → Free/Pro | Serious Funded Trader → Pro | Multiple Accounts → Elite
      </p>
    </div>
  );
}