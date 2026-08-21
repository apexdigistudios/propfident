import type { ReactNode } from "react";

export function Marquee({
  children,
  className = "",
  pauseOnHover = true,
}: {
  children: ReactNode;
  className?: string;
  pauseOnHover?: boolean;
}) {
  return (
    <div className={`group flex overflow-hidden [--duration:34s] [--gap:1.5rem] ${className}`}>
      <div
        className={`flex min-w-full shrink-0 animate-marquee items-center justify-around gap-[var(--gap)] pr-[var(--gap)] ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={`flex min-w-full shrink-0 animate-marquee items-center justify-around gap-[var(--gap)] pr-[var(--gap)] ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
