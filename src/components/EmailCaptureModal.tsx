"use client";

import { useState } from "react";
import { Check, X, Mail } from "lucide-react";
import { subscribeToWaitlist } from "@/app/actions/waitlist";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

export default function EmailCaptureModal({
  isOpen,
  onClose,
  source = "pricing_waitlist",
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    const result = await subscribeToWaitlist(email, source);

    if (result.success) {
      setStatus("success");
      setMessage(result.message);
      setEmail("");
      setTimeout(() => {
        onClose();
        setStatus("idle");
      }, 2000);
    } else {
      setStatus("error");
      setMessage(result.error || "Failed to subscribe");
    }

    setIsLoading(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-purple-500/20 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-500/20 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Mail className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Get Notified</h2>
              <p className="text-xs text-slate-400">Join our waitlist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === "success" ? (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  <Check className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
              <p className="text-lg font-bold text-white">You're on the list!</p>
              <p className="mt-2 text-sm text-slate-400">
                We'll notify you when paid plans launch. Thanks for your interest!
              </p>
            </div>
          ) : status === "error" ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
              <p className="text-sm font-bold text-red-300">{message}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-400 mb-4">
                Be the first to know when we launch Pro and Unlimited tiers with advanced features like multi-account sync, real-time AI coaching, and priority support.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition"
                    required
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full rounded-lg bg-gradient-brand px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Subscribing..." : "Notify Me"}
                </button>
              </form>

              <p className="mt-4 text-xs text-slate-500 text-center">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
