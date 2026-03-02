import { CategoryList } from "@/components/client/home/categories/CategoryList";
import { FlashSale } from "@/components/client/home/flash-sale/FlashSale";
import { HeroBanner } from "@/components/client/home/hero/HeroBanner";
import { NearbyRestaurants } from "@/components/client/home/nearby/NearbyRestaurants";

export default function HomePage() {
  return (
    <main className="flex-1">
      <HeroBanner />
      <CategoryList />
      <FlashSale />
      <NearbyRestaurants />
    </main>
  );
}
