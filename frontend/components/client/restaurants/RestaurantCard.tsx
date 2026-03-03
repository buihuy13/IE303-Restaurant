import { Star } from "lucide-react";

import type { MockRestaurant } from "@/constants";

type RestaurantCardProps = {
  restaurant: MockRestaurant;
};

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-40 w-full bg-linear-to-br from-brand-purple/5 via-brand-orange/5 to-brand-yellow/10">
        <div className="absolute left-0 top-0 rounded-br-xl bg-brand-orange px-3 py-1.5 text-xs font-bold text-white shadow-md">
          {restaurant.promo}
        </div>
        <div className="absolute bottom-2 right-2 rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-brand-black shadow-sm">
          {restaurant.etaMinutes}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="truncate text-lg font-bold text-brand-black group-hover:text-brand-purple">
          {restaurant.name}
        </p>
        <p className="mt-1 text-sm text-brand-grey">
          {restaurant.distanceKm.toFixed(1)} km •{" "}
          {restaurant.tags.join(" · ")}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-brand-grey">
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-brand-yellow text-brand-yellow" />
            <span className="font-semibold text-brand-black">
              {restaurant.rating.toFixed(1)}
            </span>
          </span>
          <span className="font-semibold text-brand-purple opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            View details →
          </span>
        </div>
      </div>
    </div>
  );
}

