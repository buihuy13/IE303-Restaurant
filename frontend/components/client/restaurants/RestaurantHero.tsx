"use client";

import type { MockRestaurant } from "@/constants";

type RestaurantHeroProps = {
  restaurant: MockRestaurant;
};

export function RestaurantHero({ restaurant }: RestaurantHeroProps) {
  const bannerUrl =
    "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200";

  return (
    <>
      <div className="relative h-[280px] w-full overflow-hidden bg-gray-900 md:h-[360px]">
        <img
          src={bannerUrl}
          alt={`${restaurant.name} background`}
          className="h-full w-full scale-110 object-cover opacity-70 blur-sm"
        />
        <div className="absolute inset-0 bg-linear-to-t from-gray-900/95 via-gray-900/60 to-gray-900/20" />

        <div className="absolute bottom-0 left-0 z-10 w-full px-4 pb-6 md:px-6 md:pb-8">
          <div className="mx-auto flex max-w-5xl items-end gap-4 md:gap-6">
            <div className="hidden shrink-0 md:block">
              <div className="relative h-20 w-20 overflow-hidden rounded-full bg-white p-1 shadow-2xl ring-2 ring-white/20">
                <div className="relative h-full w-full overflow-hidden rounded-full bg-gray-100">
                  <span className="flex h-full w-full items-center justify-center text-xl">
                    🍜
                  </span>
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="mb-1 line-clamp-2 text-3xl font-bold text-white drop-shadow md:text-4xl lg:text-5xl">
                {restaurant.name}
              </h1>
              <p className="mb-3 text-sm text-gray-200 md:text-base">
                {restaurant.tags.join(" • ")}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-200 md:text-sm">
                <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-white">
                  <span className="text-yellow-400">★</span>
                  <span className="font-semibold">
                    {restaurant.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-200">
                    ({restaurant.totalReviews.toLocaleString()} reviews)
                  </span>
                </div>
                <span>{restaurant.distanceKm.toFixed(1)} km away</span>
                <span>{restaurant.etaMinutes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-6 md:h-8" />
    </>
  );
}

