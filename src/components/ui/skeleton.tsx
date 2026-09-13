import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-2xl border border-white/5 bg-slate-800/50 dark:bg-slate-800/40", className)} {...props} />;
}
