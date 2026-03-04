import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  mockMerchantOrders,
  type MockMerchantOrder,
  type MockMerchantOrderStatus,
} from "@/constants";

const STATUS_LABELS: Record<MockMerchantOrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function useMerchantOrders() {
  const [filterStatus, setFilterStatus] = useState<MockMerchantOrderStatus | "ALL">("ALL");

  const orders = useMemo(() => [...mockMerchantOrders], []);

  const filteredOrders = useMemo(() => {
    if (filterStatus === "ALL") return orders;
    return orders.filter((o) => o.status === filterStatus);
  }, [orders, filterStatus]);

  const handleAccept = (orderId: string) => {
    toast.success(`Order ${orderId} accepted (mock).`);
  };

  const handleReject = (orderId: string) => {
    toast.success(`Order ${orderId} rejected (mock).`);
  };

  const handleUpdateStatus = (orderId: string, newStatus: MockMerchantOrderStatus) => {
    toast.success(`Order ${orderId} → ${STATUS_LABELS[newStatus]} (mock).`);
  };

  const getNextStatus = (current: MockMerchantOrderStatus): MockMerchantOrderStatus | null => {
    const next: Record<MockMerchantOrderStatus, MockMerchantOrderStatus | null> = {
      pending: "confirmed",
      confirmed: "preparing",
      preparing: "ready",
      ready: "completed",
      completed: null,
      cancelled: null,
    };
    return next[current] ?? null;
  };

  return {
    orders: filteredOrders,
    filterStatus,
    setFilterStatus,
    statusLabels: STATUS_LABELS,
    handleAccept,
    handleReject,
    handleUpdateStatus,
    getNextStatus,
  };
}
