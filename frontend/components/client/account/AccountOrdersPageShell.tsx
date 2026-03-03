"use client";

import Link from "next/link";

import { useAccountOrdersPage } from "@/hooks/account/useAccountOrdersPage";

import { AccountSidebar } from "./AccountSidebar";

export default function AccountOrdersPageShell() {
  const { orders, totalOrders, processing, completed } =
    useAccountOrdersPage();

  return (
    <div className="custom-container py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <AccountSidebar />
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-brand-black md:text-2xl">
            My orders (mock)
          </h1>
          <p className="mt-2 text-xs text-brand-grey">
            Total: {totalOrders} • Processing: {processing} • Completed:{" "}
            {completed}
          </p>

          {orders.length === 0 ? (
            <p className="mt-6 text-sm text-brand-grey">
              You have no mock orders.
            </p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-brand-black">
                      Order #{order.code}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-grey">
                      {order.restaurantName} •{" "}
                      {order.totalAmount.toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-xs font-semibold text-brand-purple hover:underline"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

