"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import { Button } from "@/components/ui";

import { FlashSaleItem } from "./FlashSaleItem";

const FLASH_SALE_ITEMS = [
  { name: "Grilled milk tea", oldPrice: "60.000đ", newPrice: "29.000đ", discountLabel: "-52%", soldPercentage: 70 },
  { name: "Pork chop broken rice", oldPrice: "55.000đ", newPrice: "35.000đ", discountLabel: "-36%", soldPercentage: 40 },
  { name: "Cheese pizza combo", oldPrice: "199.000đ", newPrice: "129.000đ", discountLabel: "-35%", soldPercentage: 55 },
  { name: "Fried chicken bucket", oldPrice: "150.000đ", newPrice: "99.000đ", discountLabel: "-34%", soldPercentage: 80 },
  { name: "Snack platter", oldPrice: "89.000đ", newPrice: "59.000đ", discountLabel: "-34%", soldPercentage: 30 },
  { name: "Beef pho", oldPrice: "65.000đ", newPrice: "45.000đ", discountLabel: "-31%", soldPercentage: 50 },
];

export function FlashSale() {
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
              {FLASH_SALE_ITEMS.map((item) => (
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

