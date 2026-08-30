"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const questions = [
  {
    question: "What is Propfident?",
    answer:
      "Propfident is a real-time risk management and automated journaling utility designed for funded traders to help prevent drawdown breaches and analyze performance.",
  },
  {
    question: "Does Propfident place trades or execute orders on my account?",
    answer:
      "No. Propfident is strictly an analytics and monitoring tool. It uses read-only investor access and cannot place, modify, or close trades.",
  },
  {
    question: "Can Propfident withdraw funds from my account?",
    answer:
      "Never. Read-only investor credentials do not grant withdrawal or trading privileges. Your funds remain 100% under your control.",
  },
  {
    question: "How does the MT4/MT5 connection work?",
    answer:
      "You connect your account securely via MetaApi using your read-only investor password. Propfident receives execution data in real time to calculate your drawdown and journal trades.",
  },
  {
    question: "Does Propfident guarantee I won't breach my prop firm account?",
    answer:
      "No system can guarantee trading outcomes. Propfident provides real-time alerts, buffer metrics, and position sizing tools to help you manage risk, but execution and discipline remain with the trader.",
  },
  {
    question: "Which prop firms and brokers are supported?",
    answer:
      "Propfident supports all major prop firm drawdown models across MT4 and MT5 platforms, including FTMO, Topstep, FundedNext, Apex, The5ers, and retail brokers.",
  },
] as const;

export default function Faq() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="border-b border-slate-200 bg-white py-16 dark:border-purple-500/20 dark:bg-slate-950 md:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
            Need to know
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tighter text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400 md:text-lg">
            Everything you need to know about Propfident, security, and account protection.
          </p>
        </div>

        <div className="mt-10 space-y-3 md:mt-14">
          {questions.map((item, index) => {
            const isOpen = openQuestion === index;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-purple-500/30 dark:bg-slate-900/90"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenQuestion(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-slate-900 transition hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800/60 md:px-6 md:py-5"
                >
                  {item.question}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-purple-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-200 px-5 pb-5 pt-4 text-sm leading-relaxed text-slate-600 dark:border-purple-500/20 dark:text-slate-400 md:px-6">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}