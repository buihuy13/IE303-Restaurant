import { mockAdminOrders } from "@/constants";

export function useAdminOrdersPage() {
  const orders = mockAdminOrders;

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(v) + "₫";

  return { orders, formatPrice };
}
