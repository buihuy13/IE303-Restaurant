"use client";

import { useMerchantSettingsPage } from "@/hooks/merchant/useMerchantSettingsPage";

import { SettingsInfoList } from "./SettingsInfoList";

export default function MerchantSettingsPageShell() {
  const { restaurant } = useMerchantSettingsPage();

  const items = [
    { label: "Name", value: restaurant.restaurantName },
    { label: "Address", value: restaurant.address },
    {
      label: "Hours",
      value: `${restaurant.openingTime} – ${restaurant.closingTime}`,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Restaurant settings</h1>
      <SettingsInfoList
        title="Restaurant info (mock)"
        items={items}
        footerText="Mock data – edits are not persisted."
      />
    </div>
  );
}
