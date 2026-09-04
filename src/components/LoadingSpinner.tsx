export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 animate-pulse rounded-full bg-purple-600/30 blur-2xl" />
        <img src="/propfidentlogo.png" alt="Loading Propfident..." className="relative z-10 h-20 w-20 animate-bounce object-contain transition-all duration-700" />
      </div>
      <p className="mt-4 animate-pulse font-mono text-xs uppercase tracking-widest text-purple-300">Securing Equity...</p>
    </div>
  );
}
