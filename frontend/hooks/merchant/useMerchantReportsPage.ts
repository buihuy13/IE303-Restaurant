import { mockMerchantDashboard } from "@/constants";

export function useMerchantReportsPage() {
  const topProducts = mockMerchantDashboard.topProducts;

  const formatNumber = (v: number) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(v);

  return {
    topProducts,
    formatNumber,
  };
}
