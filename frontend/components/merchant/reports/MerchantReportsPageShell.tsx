"use client";

import { BarChart3 } from "lucide-react";

import { useMerchantReportsPage } from "@/hooks/merchant/useMerchantReportsPage";

import { ReportProductRow } from "./ReportProductRow";

export default function MerchantReportsPageShell() {
  const { topProducts, formatNumber } = useMerchantReportsPage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <BarChart3 className="h-5 w-5" />
          Top products (mock)
        </h2>
        <ul className="space-y-3">
          {topProducts.map((p, i) => (
            <ReportProductRow
              key={p.productId}
              rank={i + 1}
              productName={p.productName}
              quantitySold={formatNumber(p.totalQuantity)}
              revenueFormatted={formatNumber(p.totalRevenue)}
            />
          ))}
        </ul>
        <p className="mt-4 text-xs text-gray-500">
          Mock data – no real analytics.
        </p>
      </div>
    </div>
  );
}
