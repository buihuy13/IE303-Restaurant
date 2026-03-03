"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { mockGroupOrder } from "@/constants";

type MenuItem = {
  id: string;
  name: string;
  price: number;
};

const mockMenu: MenuItem[] = [
  { id: "m-1", name: "Margherita Pizza", price: 120000 },
  { id: "m-2", name: "Pepperoni Pizza", price: 150000 },
  { id: "m-3", name: "Chicken Wings", price: 80000 },
];

export function useJoinGroupOrderPage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const selectedItems = useMemo(
    () =>
      mockMenu
        .map((item) => ({
          item,
          quantity: quantities[item.id] ?? 0,
        }))
        .filter((line) => line.quantity > 0),
    [quantities],
  );

  const total = selectedItems.reduce(
    (sum, line) => sum + line.item.price * line.quantity,
    0,
  );

  const handleIncrease = (id: string) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const handleDecrease = (id: string) => {
    setQuantities((prev) => {
      const next = { ...prev };
      const current = next[id] ?? 0;
      if (current <= 1) {
        delete next[id];
      } else {
        next[id] = current - 1;
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item.");
      return;
    }
    toast.success("Items added to group order (mock).");
  };

  return {
    restaurantName: mockGroupOrder.restaurantName,
    menu: mockMenu,
    quantities,
    selectedItems,
    total,
    handleIncrease,
    handleDecrease,
    handleSubmit,
  };
}

