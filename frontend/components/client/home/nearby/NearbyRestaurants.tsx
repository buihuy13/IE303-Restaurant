"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import { Button } from "@/components/ui";

import { RestaurantCard } from "./RestaurantCard";

const NEARBY_RESTAURANTS = [
  { name: "Pho 24 - Beef Pho", rating: 4.6, distance: "0.8 km", time: "20-30 min", promo: "Save 30.000đ" },
  { name: "Broken Rice 123", rating: 4.4, distance: "1.2 km", time: "25-35 min", promo: "Free delivery" },
  { name: "Milk Tea House", rating: 4.8, distance: "0.5 km", time: "15-25 min", promo: "Buy 1 get 1" },
  { name: "Fried Chicken Corner", rating: 4.3, distance: "1.8 km", time: "30-40 min", promo: "Save 40.000đ" },
  { name: "Snack & Fries Shop", rating: 4.1, distance: "1.0 km", time: "20-30 min", promo: "Combo deals" },
  { name: "Healthy Salad Bar", rating: 4.7, distance: "2.0 km", time: "30-45 min", promo: "Save 25.000đ" },
  { name: "Sweet Desserts Cafe", rating: 4.5, distance: "1.4 km", time: "25-35 min", promo: "Free topping" },
  { name: "Coffee & Bakery", rating: 4.2, distance: "0.9 km", time: "15-25 min", promo: "Morning combo" },
];

export function NearbyRestaurants() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: true },
    [Autoplay({ delay: 3200, stopOnInteraction: false })],
  );

  return (
    <section className="bg-white py-8">
      <div className="custom-container mx-auto">
        <h2 className="mb-6 px-4 text-2xl font-bold text-brand-black sm:px-0">📍 Nearby restaurants</h2>
        <div className="relative px-4 sm:px-0">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {NEARBY_RESTAURANTS.map((restaurant) => (
                <div key={restaurant.name} className="flex-[0_0_auto] basis-[85%] sm:basis-[48%] lg:basis-[24%]">
                  <RestaurantCard {...restaurant} />
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

