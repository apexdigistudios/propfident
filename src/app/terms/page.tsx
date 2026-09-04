import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of Service | Propfident" };

const sections = [
  {
    heading: "1. Service Scope",
    content:
      "Propfident is a trade planning, risk management, and journaling utility designed to help traders monitor drawdown, size positions, and review performance. It is not a broker, execution desk, financial advisor, or registered investment adviser. The service does not provide personalized investment, tax, legal, or trading advice.",
  },
  {
    heading: "2. User Responsibility",
    content:
      "Users remain solely responsible for all trading, account decisions, order placement, execution, and risk-taking associated with their MT4/MT5 accounts or prop firm challenges. Propfident does not place trades, manage accounts, or control execution outside the user’s own trading workflow.",
  },
  {
    heading: "3. Account Connections",
    content:
      "When connecting to an account via MetaApi or related integrations, you are responsible for ensuring the access method, permissions, and account data you provide are accurate, lawful, and authorized by the account owner. Propfident relies on the data access you choose to enable.",
  },
  {
    heading: "4. Risks & Disclaimers",
    content:
      "The market, prop-firm rules, execution quality, and platform behavior may all affect outcomes. Propfident provides calculations and monitoring tools to assist decision-making, but it does not guarantee profitability, challenge approval, account survival, or protection from drawdown loss.",
  },
  {
    heading: "5. Service Availability",
    content:
      "We aim to provide a reliable and secure service, but we do not guarantee uninterrupted access, error-free data feeds, or continuous synchronization. We may suspend or modify the service for maintenance, bug fixes, security updates, or business reasons.",
  },
  {
    heading: "6. Acceptable Use",
    content:
      "You agree not to misuse the platform, attempt unauthorized access, reverse engineer essential logic, exploit data feeds, or use the service in any way that violates applicable law, trading platform terms, or prop firm rules. Any abusive or unlawful usage may result in account restriction or termination.",
  },
  {
    heading: "7. Limitation of Liability",
    content:
      "Propfident is provided on an as-is basis. To the extent permitted by law, we are not liable for indirect, incidental, consequential, or punitive damages arising from platform usage, including losses tied to decisions made from dashboard data or account telemetry.",
  },
] as const;

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100 md:px-8 md:py-24">
      <article className="mx-auto max-w-4xl rounded-2xl border border-purple-500/30 bg-slate-900/90 p-6 shadow-2xl sm:p-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-6 text-base leading-relaxed text-slate-400">
          These terms govern use of Propfident and describe the responsibilities of the service, users, and account integrations.
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.heading} className="border-b border-slate-800 pb-6 last:border-b-0 last:pb-0">
              <h2 className="text-xl font-bold text-white">{section.heading}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{section.content}</p>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm leading-relaxed text-slate-400">
          These terms may be updated over time. For questions, contact <Link href="mailto:propfidentceos@gmail.com" className="text-purple-300 underline">propfidentceos@gmail.com</Link>.
        </p>
      </article>
    </main>
  );
}
