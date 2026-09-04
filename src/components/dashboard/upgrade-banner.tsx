import { Info, Sparkles } from "lucide-react";

export function UpgradeBanner({ message }: { message: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-purple-950/40 p-5 shadow-2xl shadow-purple-950/20">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <Info className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-100">Advanced Features Coming Soon</p>
            <p className="mt-1 text-sm text-slate-400">{message}</p>
          </div>
        </div>
        <div className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-black text-slate-300 shadow-lg shadow-slate-950/20">
          <Sparkles className="h-4 w-4" />
          Stay Tuned
        </div>
      </div>
    </div>
  );
}
