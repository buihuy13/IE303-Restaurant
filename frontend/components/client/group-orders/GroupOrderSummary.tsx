"use client";

import { DollarSign } from "lucide-react";

import type { MockGroupOrder } from "@/constants";

type GroupOrderSummaryProps = {
  groupOrder: MockGroupOrder;
  formatPrice: (price: number) => string;
};

export function GroupOrderSummary({
  groupOrder,
  formatPrice,
}: GroupOrderSummaryProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
        <DollarSign className="h-5 w-5" />
        Summary
      </h2>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-gray-700">
          <span>Items total:</span>
          <span>${formatPrice(groupOrder.totalAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-gray-700">
          <span>Delivery fee:</span>
          <span>${formatPrice(groupOrder.deliveryFee)}</span>
        </div>
        <div className="flex items-center justify-between text-gray-700">
          <span>Tax:</span>
          <span>${formatPrice(groupOrder.tax)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900">
          <span>Total:</span>
          <span>${formatPrice(groupOrder.finalAmount)}</span>
        </div>
        {groupOrder.paymentMethod === "split" && (
          <p className="mt-2 text-xs text-gray-500">
            Each person pays their own share.
          </p>
        )}
      </div>
    </div>
  );
}
