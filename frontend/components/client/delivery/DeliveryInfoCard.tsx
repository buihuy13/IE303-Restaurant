import type { MockOrder } from "@/constants";

type DeliveryInfoCardProps = {
  order: MockOrder;
  etaLabel: string;
};

export function DeliveryInfoCard({ order, etaLabel }: DeliveryInfoCardProps) {
  const date = new Date(order.createdAt);
  const formattedDate = Number.isNaN(date.getTime())
    ? order.createdAt
    : date.toLocaleString();

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-brand-black">
        Order #{order.code}
      </h2>
      <p className="mt-1 text-sm font-semibold text-brand-black">
        {order.restaurantName}
      </p>
      <p className="mt-1 text-xs text-brand-grey">{formattedDate}</p>

      <div className="mt-4 rounded-xl bg-brand-yellowlight px-4 py-3 text-sm">
        <p className="text-xs font-semibold uppercase text-brand-grey">
          Estimated time
        </p>
        <p className="mt-1 text-base font-bold text-brand-black">
          {etaLabel}
        </p>
      </div>

      <div className="mt-4 text-xs text-brand-grey">
        <p>
          This is a mock delivery tracking view using{" "}
          <span className="font-semibold">mockOrders</span>.
        </p>
        <p className="mt-1">
          Use IDs like <code>ord-1001</code> or codes like{" "}
          <code>ORD-1001</code> in the URL.
        </p>
      </div>
    </aside>
  );
}

