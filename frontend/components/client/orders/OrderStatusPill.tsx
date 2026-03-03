import type { MockOrderStatus } from "@/constants";

type OrderStatusPillProps = {
  status: MockOrderStatus;
};

export function OrderStatusPill({ status }: OrderStatusPillProps) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";

  if (status === "PROCESSING") {
    return (
      <span className={`${base} bg-brand-yellowlight text-brand-orange`}>
        Processing
      </span>
    );
  }

  if (status === "COMPLETED") {
    return (
      <span className={`${base} bg-green-50 text-brand-green`}>
        Completed
      </span>
    );
  }

  return (
    <span className={`${base} bg-red-50 text-red-600`}>
      Cancelled
    </span>
  );
}

