import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-purple-500/30 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-2xl font-black tracking-tight text-white">
          Authentication Error
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          We encountered an issue while verifying your authentication code or session. Please try logging in again.
        </p>
        <div className="mt-8">
          <ShimmerButton href="/login" className="w-full justify-center">
            Return to Login
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}
