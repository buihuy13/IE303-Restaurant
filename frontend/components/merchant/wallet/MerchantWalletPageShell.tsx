"use client";

import { useMerchantWalletPage } from "@/hooks/merchant/useMerchantWalletPage";

import { WalletBalanceCard } from "./WalletBalanceCard";

export default function MerchantWalletPageShell() {
  const { wallet, formatCurrency } = useMerchantWalletPage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
      <WalletBalanceCard
        balanceFormatted={formatCurrency(wallet.balance)}
        pendingPayoutFormatted={formatCurrency(wallet.pendingPayout)}
        lastPayoutAt={wallet.lastPayoutAt}
        footerText="Mock data – no real payouts."
      />
    </div>
  );
}
