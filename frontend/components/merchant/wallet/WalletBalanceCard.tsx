import { DollarSign } from "lucide-react";

type WalletBalanceCardProps = {
  balanceFormatted: string;
  pendingPayoutFormatted: string;
  lastPayoutAt: string;
  footerText: string;
};

/** Chỉ render card số dư: balance, pending, last payout, footer */
export function WalletBalanceCard({
  balanceFormatted,
  pendingPayoutFormatted,
  lastPayoutAt,
  footerText,
}: WalletBalanceCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EE4D2D]/10">
          <DollarSign className="h-6 w-6 text-[#EE4D2D]" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Available balance</p>
          <p className="text-2xl font-bold text-gray-900">{balanceFormatted}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">Pending payout</p>
          <p className="font-semibold text-gray-900">{pendingPayoutFormatted}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">Last payout</p>
          <p className="font-semibold text-gray-900">{lastPayoutAt}</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-500">{footerText}</p>
    </div>
  );
}
