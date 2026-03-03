import type { MockRestaurant } from "@/constants";

type RestaurantActionsCardProps = {
  restaurant: MockRestaurant;
};

export function RestaurantActionsCard({
  restaurant,
}: RestaurantActionsCardProps) {
  return (
    <aside className="sticky top-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Restaurant info
        </h2>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Opening:</span>{" "}
            {restaurant.openingTime} – {restaurant.closingTime}
          </p>
          <p>
            <span className="font-semibold">Distance:</span>{" "}
            {restaurant.distanceKm.toFixed(1)} km away
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {restaurant.phone}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            className="flex w-full items-center justify-center rounded-lg bg-[#EE4D2D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#EE4D2D]/90"
          >
            Start group order (mock)
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Chat with restaurant (mock)
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          These buttons are mock-only in IE303 and do not create real orders or
          chats.
        </p>
      </div>
    </aside>
  );
}

