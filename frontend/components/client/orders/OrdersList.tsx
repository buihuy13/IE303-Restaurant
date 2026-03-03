import type { MockOrder } from "@/constants";

import { OrderCard } from "./OrderCard";

type SortBy = "recent" | "oldest" | "amount-high" | "amount-low" | "status";

type OrdersListProps = {
  orders: MockOrder[];
  totalOrders: number;
  sortBy: SortBy;
  onSortChange: (value: SortBy) => void;
};

export function OrdersList({
  orders,
  totalOrders,
  sortBy,
  onSortChange,
}: OrdersListProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-xl font-bold text-brand-black md:text-2xl">
          Your orders ({totalOrders})
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-brand-grey">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortBy)}
            className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold shadow-sm outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
            title="Sort orders"
          >
            <option value="recent">Recent</option>
            <option value="oldest">Oldest first</option>
            <option value="amount-high">Amount: high to low</option>
            <option value="amount-low">Amount: low to high</option>
            <option value="status">By status</option>
          </select>
        </div>
      </div>

      {/* List / empty state */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-base font-semibold text-brand-black">
            You have no orders yet.
          </p>
          <p className="mt-2 text-sm text-brand-grey">
            Browse restaurants and place your first order.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

