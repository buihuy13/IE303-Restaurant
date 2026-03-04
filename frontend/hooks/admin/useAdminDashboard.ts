import { mockAdminDashboard } from "@/constants";

export function useAdminDashboard() {
  const stats = mockAdminDashboard;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(v);

  const formatNumber = (v: number) =>
    new Intl.NumberFormat("vi-VN").format(v);

  return {
    stats,
    formatCurrency,
    formatNumber,
  };
}
