"use client";

import { useAdminPromotionsPage } from "@/hooks/admin/useAdminPromotionsPage";

import { AdminPromotionRow } from "./AdminPromotionRow";

export default function AdminPromotionsPageShell() {
  const { promotions, formatDate } = useAdminPromotionsPage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
          Promotion list (mock)
        </div>
        {promotions.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            No promotions (mock).
          </p>
        ) : (
        <ul className="divide-y divide-gray-200">
          {promotions.map((p) => (
            <AdminPromotionRow
              key={p.id}
              promotion={p}
              formatDate={formatDate}
            />
          ))}
        </ul>
        )}
      </div>
    </div>
  );
}
