import {
  mockMerchantDashboard,
  mockMerchantRestaurant,
} from "@/constants";

export function useMerchantDashboard() {
  const restaurant = mockMerchantRestaurant;
  const stats = mockMerchantDashboard;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(v);

  const formatNumber = (v: number) =>
    new Intl.NumberFormat("vi-VN").format(v);

  return {
    restaurant,
    stats,
    formatCurrency,
    formatNumber,
  };
}
