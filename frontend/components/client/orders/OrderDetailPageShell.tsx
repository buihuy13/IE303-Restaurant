"use client";

import Link from "next/link";

import { useOrderDetailPage } from "@/hooks/orders/useOrderDetailPage";

type OrderDetailPageShellProps = {
  slug: string;
};

export default function OrderDetailPageShell({
  slug,
}: OrderDetailPageShellProps) {
  const { order, isNotFound, totalItems, formattedDate } = useOrderDetailPage(slug);

  if (isNotFound || !order) {
    return (
      <div className="custom-container py-10">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-base font-semibold text-brand-black">
            Order not found
          </p>
          <p className="mt-2 text-sm text-brand-grey">
            This is a mock order detail page. Use IDs like{" "}
            <code>ord-1001</code> or codes like{" "}
            <code>ORD-1001</code> in the URL.
          </p>
          <Link
            href="/orders"
            className="mt-4 inline-flex items-center rounded-full bg-brand-orange px-4 py-2 text-xs font-semibold text-brand-white"
          >
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-container py-10">
      <Link
        href="/orders"
        className="text-xs font-semibold text-brand-grey hover:text-brand-orange"
      >
        ← Back to orders
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-brand-black md:text-3xl">
        Order #{order.code}
      </h1>
      <p className="mt-1 text-sm text-brand-grey">
        {order.restaurantName} • {formattedDate}
      </p>
      <p className="mt-1 text-xs text-brand-grey">
        {totalItems} item{totalItems > 1 ? "s" : ""} •{" "}
        {order.totalAmount.toLocaleString("vi-VN")}₫
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-brand-black">Items</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0"
              >
                <div>
                  <p className="font-semibold text-brand-black">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-grey">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold text-brand-orange">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                </p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-brand-black">
            Summary (mock)
          </h2>
          <div className="mt-4 space-y-2 text-sm text-brand-grey">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-brand-black">
                {order.totalAmount.toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery</span>
              <span className="font-semibold text-brand-black">0₫</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-base font-bold text-brand-black">
              <span>Total</span>
              <span className="text-brand-orange">
                {order.totalAmount.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

