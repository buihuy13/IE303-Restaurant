"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import { Button } from "@/components/ui";

import { FlashSaleItem } from "./FlashSaleItem";

type FlashSaleProps = {
  items: {
    name: string;
    oldPrice: string;
    newPrice: string;
    discountLabel: string;
    soldPercentage: number;
  }[];
};

export function FlashSale({ items }: FlashSaleProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: true },
    [Autoplay({ delay: 2800, stopOnInteraction: false })],
  );

  return (
    <section className="bg-gray-50/50 py-8">
      <div className="custom-container mx-auto">
        <div className="flex items-center justify-between px-4 sm:px-0">
          <h2 className="text-2xl font-bold text-brand-orange">🔥 Flash Sale - Golden Hour</h2>
          <Button type="button" variant="ghost" className="text-sm text-gray-500 hover:text-brand-purple">
            View all &gt;
          </Button>
        </div>
        <div className="relative px-4 pt-4 pb-4 sm:px-0">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6">
              {items.map((item) => (
                <FlashSaleItem key={item.name} {...item} />
              ))}
            </div>
          </div>
          <Button
            aria-label="Previous flash sale items"
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/70 backdrop-blur-sm hover:bg-white"
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            aria-label="Next flash sale items"
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

