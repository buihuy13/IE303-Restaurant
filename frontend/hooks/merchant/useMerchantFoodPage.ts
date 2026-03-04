import { useMemo, useState } from "react";

import {
  mockMerchantFoodItems,
  type MockMerchantFoodItem,
} from "@/constants";

export function useMerchantFoodPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const categories = useMemo(() => {
    const set = new Set(mockMerchantFoodItems.map((i) => i.category));
    return Array.from(set).sort();
  }, []);

  const items: MockMerchantFoodItem[] = useMemo(() => {
    if (!categoryFilter) return mockMerchantFoodItems;
    return mockMerchantFoodItems.filter((i) => i.category === categoryFilter);
  }, [categoryFilter]);

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(v) + "₫";

  const clearFilter = () => setCategoryFilter("");

  return {
    items,
    categories,
    categoryFilter,
    setCategoryFilter,
    clearFilter,
    formatPrice,
  };
}
