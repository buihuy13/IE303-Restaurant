import { ArrowRight, Package } from "lucide-react";
import Link from "next/link";

import type { MockOrder } from "@/constants";

import { OrderStatusPill } from "./OrderStatusPill";

type OrderCardProps = {
  order: MockOrder;
};

export function OrderCard({ order }: OrderCardProps) {
  const date = new Date(order.createdAt);
  const formattedDate = Number.isNaN(date.getTime())
    ? order.createdAt
    : date.toLocaleString();

  const totalItems = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-grey">
            Order #{order.code}
          </p>
          <p className="mt-1 text-sm font-semibold text-brand-black">
            {order.restaurantName}
          </p>
          <p className="mt-1 text-xs text-brand-grey">{formattedDate}</p>
        </div>
        <OrderStatusPill status={order.status} />
      </div>

      {/* Body */}
      <div className="flex items-center gap-4 border-b border-gray-100 bg-gray-50 px-5 py-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-yellowlight text-brand-orange">
          <Package className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-black">
            {order.items[0]?.name ?? "Items"}
          </p>
          <p className="mt-1 text-xs text-brand-grey">
            {totalItems} item{totalItems > 1 ? "s" : ""} •{" "}
            {order.status === "COMPLETED"
              ? "Delivered"
              : order.status === "CANCELLED"
              ? "Order cancelled"
              : "On the way"}
          </p>
        </div>
        <p className="text-base font-bold text-brand-orange">
          {order.totalAmount.toLocaleString("vi-VN")}₫
        </p>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-5 py-3">
        <Link
          href={`/orders/${order.id}`}
          className="text-xs font-semibold text-brand-purple hover:underline"
        >
          View details
        </Link>
        <Link
          href={`/delivery/${order.id}`}
          className="inline-flex items-center gap-2 rounded-full border border-brand-black px-4 py-1.5 text-xs font-semibold text-brand-black hover:bg-brand-black hover:text-brand-white"
        >
          Track order
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

