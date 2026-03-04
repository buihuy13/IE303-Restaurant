"use client";

import { useAdminRestaurantsPage } from "@/hooks/admin/useAdminRestaurantsPage";

import { AdminRestaurantRow } from "./AdminRestaurantRow";

export default function AdminRestaurantsPageShell() {
  const { restaurants } = useAdminRestaurantsPage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
          Restaurant list (mock)
        </div>
        {restaurants.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            No restaurants (mock).
          </p>
        ) : (
        <ul className="divide-y divide-gray-200">
          {restaurants.map((r) => (
            <AdminRestaurantRow
              key={r.id}
              name={r.name}
              slug={r.slug}
              rating={r.rating}
            />
          ))}
        </ul>
        )}
        <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
          Mock data from constants.
        </p>
      </div>
    </div>
  );
}
