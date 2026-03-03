"use client";

import { useHomePage } from "@/hooks/home/useHomePage";

import { CategoryList } from "./categories/CategoryList";
import { FlashSale } from "./flash-sale/FlashSale";
import { HeroBanner } from "./hero/HeroBanner";
import { NearbyRestaurants } from "./nearby/NearbyRestaurants";

export default function HomePageShell() {
  const {
    categoryItems,
    flashSaleItems,
    heroSuggestTags,
  } = useHomePage();

  return (
    <main className="flex-1">
      <HeroBanner suggestTags={heroSuggestTags} />
      <CategoryList items={categoryItems} />
      <FlashSale items={flashSaleItems} />
      <NearbyRestaurants />
    </main>
  );
}

