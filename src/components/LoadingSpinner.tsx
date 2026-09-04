export default function LoadingSpinner() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-500/20 blur-xl" />
        <img src="/propfidentlogo.png" alt="Loading..." className="h-16 w-16 animate-bounce object-contain transition-all duration-700" />
      </div>
      <p className="animate-pulse font-mono text-xs uppercase tracking-widest text-cyan-400">Securing Equity...</p>
    </div>
  );
}
