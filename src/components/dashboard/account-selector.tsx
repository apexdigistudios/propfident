"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Server } from "lucide-react";

type AccountOption = {
  id: string;
  account_name: string;
  platform: string;
  account_number: string;
};

export function AccountSelector({
  accounts,
  isFreeTier,
}: {
  accounts: AccountOption[];
  isFreeTier: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentAccount = searchParams.get("account") || accounts[0]?.id || "";

  if (isFreeTier) {
    return (
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-sm font-bold text-purple-200 transition hover:bg-purple-500/20"
        title="Upgrade to Pro or Elite to connect accounts"
      >
        <Lock className="h-4 w-4" />
        Upgrade to Connect Accounts
      </Link>
    );
  }

  if (!accounts.length) {
    return (
      <Link
        href="/dashboard/account-intel/connect"
        className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-slate-900/90 px-4 py-2.5 text-sm font-bold text-slate-100 transition hover:bg-purple-500/10"
        title="Connect your first MT4/MT5 account"
      >
        <Server className="h-4 w-4 text-purple-300" />
        No Account Connected
      </Link>
    );
  }

  return (
    <label className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-purple-500/30 bg-slate-900/90 px-3 py-2 sm:w-auto">
      <Server className="h-4 w-4 text-purple-300" />
      <select
        aria-label="Select active prop account"
        value={currentAccount}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("account", event.target.value);
          router.push(`/dashboard?${params.toString()}`);
        }}
        className="min-w-0 w-full bg-transparent text-sm font-semibold text-slate-100 outline-none sm:min-w-[220px] sm:w-auto"
      >
        {accounts.map((account) => (
          <option key={account.id} value={account.id} className="bg-slate-950 text-slate-100">
            {account.account_name} · {account.platform}
          </option>
        ))}
      </select>
    </label>
  );
}
