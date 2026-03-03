import { useMemo, useState } from "react";

import { mockOrders, type MockOrder, type MockOrderStatus } from "@/constants";

type SortBy = "recent" | "oldest" | "amount-high" | "amount-low" | "status";

function statusWeight(status: MockOrderStatus): number {
  switch (status) {
    case "PROCESSING":
      return 1;
    case "COMPLETED":
      return 2;
    case "CANCELLED":
      return 3;
    default:
      return 99;
  }
}

export function useOrdersPage() {
  const [sortBy, setSortBy] = useState<SortBy>("recent");

  const orders = useMemo<MockOrder[]>(() => {
    const list = [...mockOrders];

    list.sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "amount-high") {
        return b.totalAmount - a.totalAmount;
      }
      if (sortBy === "amount-low") {
        return a.totalAmount - b.totalAmount;
      }
      if (sortBy === "status") {
        return statusWeight(a.status) - statusWeight(b.status);
      }
      return 0;
    });

    return list;
  }, [sortBy]);

  const totalOrders = orders.length;

  return {
    orders,
    totalOrders,
    sortBy,
    setSortBy,
  };
}

