"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

const APP_ORIGIN = "https://www.propfident.online";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
      window.location.href =
        window.location.hostname === "localhost"
          ? "/dashboard"
          : `${APP_ORIGIN}/dashboard`;
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
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

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-white px-7 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"/>
                <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5Z"/>
                <path fill="#FBBC05" d="M6.54 13.59A5.86 5.86 0 0 1 6.23 12c0-.55.11-1.09.31-1.59V7.88H3.3A9.73 9.73 0 0 0 2.27 12c0 1.57.38 3.05 1.03 4.12l3.24-2.53Z"/>
                <path fill="#EA4335" d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.37 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 8.1 9.46 6.38 12 6.38Z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-[11px] uppercase tracking-wider text-slate-500">or</span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              disabled={loading || googleLoading}
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
