"use client";

import type { MockDeliveryAddress } from "@/constants";

type GroupOrderDeliveryAddressProps = {
  address: MockDeliveryAddress;
};

export function GroupOrderDeliveryAddress({
  address,
}: GroupOrderDeliveryAddressProps) {
  const line = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold text-gray-900">
        Delivery Address
      </h2>
      <p className="text-gray-700">{line}</p>
    </div>
  );
}
