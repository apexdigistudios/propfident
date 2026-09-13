import type { HTMLAttributes, ReactNode } from "react";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function GlassPanel({ children, className = "", ...props }: GlassPanelProps) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white/90 shadow-xl shadow-slate-200/30 backdrop-blur-xl transition-colors hover:border-purple-300 dark:border-purple-500/20 dark:bg-slate-950/80 dark:shadow-purple-950/20 dark:hover:border-purple-500/40 ${className}`} {...props}>
      {children}
    </div>
  );
}
