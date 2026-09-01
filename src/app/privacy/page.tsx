import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy Policy | Propfident" };

const sections = [
  {
    heading: "1. Overview",
    content:
      "Propfident provides trade planning, risk monitoring, and journaling tools for funded traders. We process only the data necessary to deliver these features, and we do not sell personal data. This policy explains what we collect, how we use it, and how we protect it.",
  },
  {
    heading: "2. Information We Collect",
    content:
      "We may collect account identifiers, trading metadata, balance and equity values, drawdown limits, platform details, email addresses, and usage activity needed to power the dashboard and account intelligence experience. When you join our email waitlist, we store your email address and source in Supabase so we can notify you about product updates and paid plan launches.",
  },
  {
    heading: "3. Local Browser Storage & Client-Side Processing",
    content:
      "Propfident calculates risk metrics, lot size inputs, and dashboard state in the browser to minimize unnecessary server latency and reduce the amount of sensitive trading data transmitted beyond the account connection itself. Local browser storage may be used to maintain app preferences and session context for a smoother experience.",
  },
  {
    heading: "4. How We Use Your Data",
    content:
      "We use account telemetry and risk inputs to provide real-time drawdown protection, analytics, journaling, and plan generation. We use your email solely to manage waitlist access, product communication, and account-related updates. We do not use your trading data to sell advertising or to train third-party models without your explicit consent.",
  },
  {
    heading: "5. Supabase & Email Waitlist",
    content:
      "The email waitlist is managed via Supabase, which stores the email address, source, and subscription timestamps in a secure table. We retain this data only as long as needed to support announcements, customer communication, and service delivery, and we provide a straightforward path for removal if required by product or legal obligations.",
  },
  {
    heading: "6. Data Sharing",
    content:
      "Propfident does not sell personal data. We may share account information with trusted infrastructure providers needed to support authentication, storage, analytics, and message delivery, but only under contractual privacy and security controls aligned with industry best practices.",
  },
  {
    heading: "7. Your Rights",
    content:
      "You may request access to or correction of the personal data we hold, and you may request account or email data removal where legally permitted. If you have questions about your data, please contact hello@propfident.io.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100 md:px-8 md:py-24">
      <article className="mx-auto max-w-4xl rounded-2xl border border-purple-500/30 bg-slate-900/90 p-6 shadow-2xl sm:p-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-6 text-base leading-relaxed text-slate-400">
          Propfident is built for clarity, security, and accountability. This policy explains how we handle account information, website usage, and email waitlist data.
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
          This policy may be updated to reflect product changes or legal requirements. The latest version will remain effective on the website. For privacy requests, contact <Link href="mailto:hello@propfident.io" className="text-purple-300 underline">hello@propfident.io</Link>.
        </p>
      </article>
    </main>
  );
}
