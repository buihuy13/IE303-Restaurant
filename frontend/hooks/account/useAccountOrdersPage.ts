import { useMemo } from "react";

import { mockOrders } from "@/constants";

export function useAccountOrdersPage() {
  const orders = mockOrders;

  const totalOrders = orders.length;

  const processing = useMemo(
    () => orders.filter((o) => o.status === "PROCESSING").length,
    [orders],
  );

  const completed = useMemo(
    () => orders.filter((o) => o.status === "COMPLETED").length,
    [orders],
  );

  return {
    orders,
    totalOrders,
    processing,
    completed,
  };
}

