"use client";

import { useDeliveryTracking } from "@/hooks/delivery/useDeliveryTracking";

import { DeliveryTimeline } from "./DeliveryTimeline";
import { DeliveryInfoCard } from "./DeliveryInfoCard";

type DeliveryTrackingPageShellProps = {
  slug: string;
};

export default function DeliveryTrackingPageShell({
  slug,
}: DeliveryTrackingPageShellProps) {
  const { order, steps, etaLabel, isNotFound } = useDeliveryTracking(slug);

  if (isNotFound || !order) {
    return (
      <div className="custom-container py-10">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-base font-semibold text-brand-black">
            Order not found
          </p>
          <p className="mt-2 text-sm text-brand-grey">
            Make sure you are using one of the mock order IDs or codes, for example{" "}
            <code>ord-1001</code> or <code>ORD-1001</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-container py-10">
      <h1 className="mb-6 text-2xl font-bold text-brand-black md:text-3xl">
        Track your delivery
      </h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <DeliveryTimeline steps={steps} />
        <DeliveryInfoCard order={order} etaLabel={etaLabel} />
      </div>
    </div>
  );
}

