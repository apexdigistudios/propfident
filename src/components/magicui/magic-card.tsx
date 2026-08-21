"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useState } from "react";

export function MagicCard({
  children,
  className = "",
  gradientSize = 200,
  gradientColor = "#4f46e5",
}: {
  children: ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
}) {
  const [position, setPosition] = useState({ x: -gradientSize, y: -gradientSize });
  const [active, setActive] = useState(false);

  function onMove(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPosition({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
  }

  const style = {
    "--magic-x": `${position.x}px`,
    "--magic-y": `${position.y}px`,
    "--magic-size": `${gradientSize}px`,
    "--magic-color": gradientColor,
    "--magic-opacity": active ? "0.22" : "0",
  } as CSSProperties;

  return (
    <div
      onMouseMove={onMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      style={style}
      className={`magic-card relative overflow-hidden ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 [background:radial-gradient(var(--magic-size)_circle_at_var(--magic-x)_var(--magic-y),var(--magic-color),transparent_70%)] [opacity:var(--magic-opacity)]" />
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}
