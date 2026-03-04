import { useMemo } from "react";

import { mockOrders, type MockOrder } from "@/constants";

export function useOrderDetailPage(slug: string) {
  const order: MockOrder | undefined = useMemo(
    () =>
      mockOrders.find(
        (o) =>
          o.id.toLowerCase() === slug.toLowerCase() ||
          o.code.toLowerCase() === slug.toLowerCase(),
      ),
    [slug],
  );

  const isNotFound = !order;

  const totalItems = useMemo(
    () => (order ? order.items.reduce((sum, it) => sum + it.quantity, 0) : 0),
    [order],
  );

  const formattedDate = useMemo(() => {
    if (!order) return "";
    const date = new Date(order.createdAt);
    return Number.isNaN(date.getTime()) ? order.createdAt : date.toLocaleString();
  }, [order]);

  return {
    order,
    isNotFound,
    totalItems,
    formattedDate,
  };
}

