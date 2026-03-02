"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui";

import { CategoryItem } from "./CategoryItem";

const CATEGORY_ITEMS = [
  { name: "Broken rice", icon: "🍛" },
  { name: "Milk tea", icon: "🧋" },
  { name: "Noodles & Pho", icon: "🍜" },
  { name: "Fried chicken", icon: "🍗" },
  { name: "Snacks", icon: "🍟" },
  { name: "Pizza", icon: "🍕" },
  { name: "Burger", icon: "🍔" },
  { name: "Healthy", icon: "🥗" },
  { name: "Desserts", icon: "🍰" },
  { name: "Coffee", icon: "☕" },
];

export function CategoryList() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { dragFree: true, loop: true },
    [Autoplay({ delay: 3500, stopOnInteraction: false })],
  );

  return (
    <section className="bg-white py-12">
      <div className="custom-container mx-auto">
        <h2 className="mb-6 px-4 text-2xl font-bold text-brand-black sm:px-0">Explore categories</h2>
        <div className="relative px-4 sm:px-0">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="ml-4 flex gap-4 md:gap-8">
              {CATEGORY_ITEMS.map((item) => (
                <CategoryItem key={item.name} name={item.name} icon={item.icon} />
              ))}
            </div>
          </div>
          <Button
            aria-label="Previous categories"
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/70 backdrop-blur-sm hover:bg-white"
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            aria-label="Next categories"
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/70 backdrop-blur-sm hover:bg-white"
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => emblaApi?.scrollNext()}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
