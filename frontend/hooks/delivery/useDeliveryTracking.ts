import { useMemo } from "react";

import { mockOrders, type MockOrder } from "@/constants";

type StepState = "done" | "current" | "upcoming" | "cancelled";

export type DeliveryStep = {
  id: string;
  label: string;
  description: string;
  state: StepState;
};

export function useDeliveryTracking(slug: string) {
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

  const steps: DeliveryStep[] = useMemo(() => {
    if (!order) return [];

    const baseSteps: DeliveryStep[] = [
      {
        id: "placed",
        label: "Order placed",
        description: "We have received your order.",
        state: "upcoming",
      },
      {
        id: "preparing",
        label: "Preparing",
        description: "Restaurant is preparing your food.",
        state: "upcoming",
      },
      {
        id: "on-the-way",
        label: "On the way",
        description: "Rider is delivering your order.",
        state: "upcoming",
      },
      {
        id: "delivered",
        label: "Delivered",
        description: "Order has been delivered.",
        state: "upcoming",
      },
    ];

    if (order.status === "CANCELLED") {
      return baseSteps.map((step, index) => ({
        ...step,
        state: index === 0 ? "cancelled" : "upcoming",
      }));
    }

    let currentIndex = 0;

    if (order.status === "PROCESSING") {
      currentIndex = 1;
    }

    if (order.status === "COMPLETED") {
      currentIndex = 3;
    }

    return baseSteps.map((step, index) => {
      if (index < currentIndex) return { ...step, state: "done" };
      if (index === currentIndex) return { ...step, state: "current" };
      return { ...step, state: "upcoming" };
    });
  }, [order]);

  const etaLabel = useMemo(() => {
    if (!order) return "";
    if (order.status === "COMPLETED") return "Delivered";
    if (order.status === "CANCELLED") return "Order cancelled";
    return "Approximately 25–35 minutes";
  }, [order]);

  return {
    order,
    steps,
    etaLabel,
    isNotFound,
  };
}

