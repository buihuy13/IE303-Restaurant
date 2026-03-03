"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import { Button } from "@/components/ui";
import { mockRestaurants } from "@/constants";

import { RestaurantCard } from "./RestaurantCard";

export function NearbyRestaurants() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: true },
    [Autoplay({ delay: 3200, stopOnInteraction: false })],
  );

  const restaurants = mockRestaurants.slice(0, 8);

  return (
    <section className="bg-white py-8">
      <div className="custom-container mx-auto">
        <h2 className="mb-6 px-4 text-2xl font-bold text-brand-black sm:px-0">📍 Nearby restaurants</h2>
        <div className="relative px-4 sm:px-0">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="flex-[0_0_auto] basis-[85%] sm:basis-[48%] lg:basis-[24%]"
                >
                  <RestaurantCard
                    name={restaurant.name}
                    rating={restaurant.rating}
                    distance={`${restaurant.distanceKm} km`}
                    time={restaurant.etaMinutes}
                    promo={restaurant.promo}
                  />
                </div>
              ))}
            </div>
          </div>
          <Button
            aria-label="Previous nearby restaurants"
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/70 backdrop-blur-sm hover:bg-white"
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            aria-label="Next nearby restaurants"
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/70 backdrop-blur-sm hover:bg-white"
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => emblaApi?.scrollNext()}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-8 flex justify-center">
          <Button type="button" className="px-6" variant="ghost">
            View more
          </Button>
        </div>
      </div>
    </section>
  );
}

