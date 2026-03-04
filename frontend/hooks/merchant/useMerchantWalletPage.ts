import { mockMerchantWallet } from "@/constants";

export function useMerchantWalletPage() {
  const wallet = mockMerchantWallet;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(v);

  return {
    wallet,
    formatCurrency,
  };
}
