"use client";

import { useAdminMerchantsPage } from "@/hooks/admin/useAdminMerchantsPage";

import { AdminMerchantRow } from "./AdminMerchantRow";

export default function AdminMerchantsPageShell() {
  const { merchants } = useAdminMerchantsPage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Merchants</h1>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
          Merchant list (mock)
        </div>
        {merchants.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            No merchants (mock).
          </p>
        ) : (
        <ul className="divide-y divide-gray-200">
          {merchants.map((m) => (
            <AdminMerchantRow
              key={m.id}
              restaurantName={m.restaurantName}
              email={m.email}
              status={m.status}
            />
          ))}
        </ul>
        )}
      </div>
    </div>
  );
}
