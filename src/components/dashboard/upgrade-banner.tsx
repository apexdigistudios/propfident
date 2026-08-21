import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

export function UpgradeBanner({ message }: { message: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-900/90 p-5 shadow-2xl shadow-purple-950/20">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-100">Account Integration Locked</p>
            <p className="mt-1 text-sm text-slate-400">{message}</p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-600/20 transition hover:brightness-110"
        >
          <Sparkles className="h-4 w-4" />
          View Pro & Elite Plans
        </Link>
      </div>
    </div>
  );
}
