"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        const message = error.message.toLowerCase();
        setError(
          message.includes("already registered") || message.includes("already exists")
            ? "An account with this email already exists. Try signing in instead."
            : "Unable to create account right now. Please check your connection and try again."
        );
        setLoading(false);
      } else {
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      setError("Unable to create account right now. Please check your connection and try again.");
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
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

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-purple-500/30 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Logo width={40} height={40} />
            </Link>
            <h1 className="mt-6 text-xl font-bold tracking-tight text-white">
              Create your free Propfident account
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              Start protecting your prop firm account in 60 seconds.
            </p>
          </div>

          <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
            <li>🛡️ Protect your drawdown in real time</li>
            <li>📊 Calculate risk &amp; lot sizes instantly</li>
            <li>📒 Journal every trade automatically</li>
          </ul>

          {error && (
            <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignup}
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

          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Name
              </label>
              <div className="relative mt-1.5">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-purple-500/30 bg-slate-950 px-4 py-3 pl-10 text-base text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email address
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-purple-500/30 bg-slate-950 px-4 py-3 pl-10 text-base text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 sm:text-sm"
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
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-purple-500/30 bg-slate-950 px-4 py-3 pl-10 pr-12 text-base text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">Minimum 8 characters</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-brand px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition-all duration-300 hover:shadow-purple-600/50 hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating your account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Free Account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-slate-500">No credit card required. Start free.</p>
            <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-purple-300 hover:underline">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-purple-300 hover:underline">Privacy Policy</Link>.
            </p>
          </form>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
          🔒 Your account is securely protected. Propfident uses read-only connections and never has withdrawal authority.{" "}
          <Link href="/security" className="text-purple-300 hover:underline">Learn about security →</Link>
        </p>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-purple-400 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
