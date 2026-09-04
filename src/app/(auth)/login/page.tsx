"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="hero-radial absolute inset-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-purple-500/30 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Logo width={40} height={40} />
          </Link>
          <h1 className="mt-6 text-xl font-bold tracking-tight text-white">
            Welcome back to your command center
          </h1>
          <p className="mt-2 text-xs text-slate-400">
            Secure MT4/MT5 drawdown protection & trade journaling
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@propfident.io"
                className="w-full rounded-xl border border-purple-500/30 bg-slate-950 px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-purple-500/30 bg-slate-950 px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-brand px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition-all duration-300 hover:shadow-purple-600/50 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <Link href="/signup" className="font-bold text-purple-400 hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
