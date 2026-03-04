"use client";

import { useAdminOrdersPage } from "@/hooks/admin/useAdminOrdersPage";

import { AdminOrderRow } from "./AdminOrderRow";

export default function AdminOrdersPageShell() {
  const { orders, formatPrice } = useAdminOrdersPage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
          Order list (mock)
        </div>
        {orders.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            No orders (mock).
          </p>
        ) : (
        <ul className="divide-y divide-gray-200">
          {orders.map((o) => (
            <AdminOrderRow
              key={o.orderId}
              orderId={o.orderId}
              userId={o.userId}
              createdAt={o.createdAt}
              totalFormatted={formatPrice(o.total)}
              status={o.status}
            />
          ))}
        </ul>
        )}
      </div>
    </div>
  );
}
