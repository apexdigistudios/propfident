import React, { CSSProperties } from "react";
import Link from "next/link";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
  href?: string;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "12px",
      background = "var(--brand-gradient)",
      className = "",
      children,
      href,
      ...props
    },
    ref,
  ) => {
    const Component = href ? Link : "button";
    const componentProps = href ? { href, ...props } : { ref, ...props };

    return (
      <Component
        {...(componentProps as any)}
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={`group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-7 py-3.5 text-sm font-bold text-white [background:var(--bg)] [border-radius:var(--radius)] shadow-lg shadow-purple-600/30 transition-all duration-300 hover:shadow-purple-600/50 hover:-translate-y-0.5 ${className}`}
      >
        {/* spark container */}
        <div className="absolute inset-0 overflow-hidden [container-type:size]">
          <div className="absolute inset-0 h-[100qhw] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        <span className="relative z-15 flex items-center gap-2">{children}</span>

        {/* backdrop */}
        <div className="absolute [inset:var(--cut)] -z-20 [background:var(--bg)] [border-radius:calc(var(--radius)-var(--cut))]" />
      </Component>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";
