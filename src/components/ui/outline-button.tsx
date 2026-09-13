import type { ButtonHTMLAttributes, ReactNode } from "react";

interface OutlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function OutlineButton({ children, className = "", ...props }: OutlineButtonProps) {
  return (
    <button className={`inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-purple-400 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:border-purple-500/40 dark:hover:bg-purple-500/10 ${className}`} {...props}>
      {children}
    </button>
  );
}
