import Image from "next/image";

interface LogoProps {
  width?: number;
  height?: number;
  showName?: boolean;
  className?: string;
}

export default function Logo({ width = 40, height = 40, showName = true, className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image src="/propfidentlogo.png" alt="Propfident Logo" width={width} height={height} className="object-contain" />
      {showName && <span className="text-xl font-extrabold tracking-tight text-white">Propfident</span>}
    </span>
  );
}
