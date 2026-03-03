"use client";

import Link from "next/link";

import { useRestaurantDetailPage } from "@/hooks/restaurants/useRestaurantDetailPage";
import { RestaurantActionsCard } from "./RestaurantActionsCard";
import { RestaurantHero } from "./RestaurantHero";
import { RestaurantInfoSection } from "./RestaurantInfoSection";
import { RestaurantMenuSection } from "./RestaurantMenuSection";
import { RestaurantNavTabs } from "./RestaurantNavTabs";
import { RestaurantReviewsSection } from "./RestaurantReviewsSection";

type RestaurantDetailPageShellProps = {
  slug: string;
};

export default function RestaurantDetailPageShell({
  slug,
}: RestaurantDetailPageShellProps) {
  const { restaurant, menu, reviews, isNotFound } =
    useRestaurantDetailPage(slug);

  if (isNotFound || !restaurant) {
    return (
      <main className="min-h-screen bg-gray-50 pb-16">
        <div className="custom-container py-14">
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center">
            <p className="text-base font-semibold text-gray-900">
              Restaurant not found
            </p>
            <p className="mt-2 text-sm text-gray-500">
              This is a mock restaurant detail page. Use one of the mock slugs
              defined in the restaurant mocks.
            </p>
            <Link
              href="/restaurants"
              className="mt-4 inline-flex items-center rounded-full bg-[#EE4D2D] px-4 py-2 text-xs font-semibold text-white"
            >
              Back to restaurants
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <RestaurantHero restaurant={restaurant} />
      <RestaurantNavTabs />

      <div className="custom-container pt-4">
        <nav className="mb-4 flex items-center gap-2 text-xs text-gray-600">
          <Link href="/" className="hover:text-[#EE4D2D]">
            Home
          </Link>
          <span>/</span>
          <Link href="/restaurants" className="hover:text-[#EE4D2D]">
            Restaurants
          </Link>
          <span>/</span>
          <span className="truncate font-semibold text-gray-900">
            {restaurant.name}
          </span>
        </nav>

        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-10">
            <RestaurantMenuSection restaurant={restaurant} menu={menu} />
            <RestaurantInfoSection restaurant={restaurant} />
            <RestaurantReviewsSection reviews={reviews} />
          </div>
          <RestaurantActionsCard restaurant={restaurant} />
        </div>
      </div>
    </main>
  );
}

