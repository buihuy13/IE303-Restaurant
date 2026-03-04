"use client";

import Link from "next/link";

import { useMerchantFoodPage } from "@/hooks/merchant/useMerchantFoodPage";

import { MerchantFoodList } from "./MerchantFoodList";

/** Orchestrator: dùng hook, compose header + filter + list */
export default function MerchantFoodPageShell() {
  const {
    items,
    categories,
    categoryFilter,
    setCategoryFilter,
    clearFilter,
    formatPrice,
  } = useMerchantFoodPage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
        <Link
          href="/merchant/food/new"
          className="inline-flex items-center justify-center rounded-lg bg-[#EE4D2D] px-4 py-2 text-sm font-medium text-white hover:bg-[#EE4D2D]/90"
        >
          Add item
        </Link>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Category:</span>
          <button
            type="button"
            onClick={clearFilter}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              !categoryFilter
                ? "bg-[#EE4D2D] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-[#EE4D2D] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <MerchantFoodList items={items} formatPrice={formatPrice} />
        <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
          Mock data.
        </p>
      </div>
    </div>
  );
}
