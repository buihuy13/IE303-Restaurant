"use client";

import { useAdminMerchantRequestsPage } from "@/hooks/admin/useAdminMerchantRequestsPage";

import { AdminRequestRow } from "./AdminRequestRow";

export default function AdminMerchantRequestsPageShell() {
  const { requests, handleApprove } = useAdminMerchantRequestsPage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Merchant requests</h1>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
          Pending requests (mock)
        </div>
        {requests.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            No pending requests (mock).
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {requests.map((r) => (
              <AdminRequestRow
                key={r.id}
                id={r.id}
                restaurantName={r.restaurantName}
                email={r.email}
                requestedAt={r.requestedAt}
                onApprove={handleApprove}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
