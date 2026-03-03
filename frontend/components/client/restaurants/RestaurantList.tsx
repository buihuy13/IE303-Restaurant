import type { MockRestaurant } from "@/constants";

import { RestaurantCard } from "./RestaurantCard";

type RestaurantListProps = {
  restaurants: MockRestaurant[];
  categories: string[];
  activeCategory: string;
  totalResults: number;
  onCategoryClick: (category: string) => void;
};

const categoryIcons: Record<string, string> = {
  Pho: "🍜",
  Rice: "🍚",
  Chicken: "🍗",
  "Milk tea": "🧋",
  Cafe: "☕",
  Dessert: "🍰",
  Healthy: "🥗",
  Snacks: "🍟",
};

export function RestaurantList({
  restaurants,
  categories,
  activeCategory,
  totalResults,
  onCategoryClick,
}: RestaurantListProps) {
  return (
    <div>
      {/* Explore by category */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-black">
            Explore by category
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex w-full items-center gap-4 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryClick(category)}
                className={`flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg p-3 text-center text-sm font-semibold transition-all ${
                  activeCategory === category
                    ? "bg-brand-purple text-white shadow-lg"
                    : "bg-white text-brand-black shadow-sm hover:bg-gray-50"
                }`}
              >
                {category !== "All" && (
                  <span className="text-2xl">
                    {categoryIcons[category] ?? "🍽️"}
                  </span>
                )}
                <span className="truncate">{category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <h2 className="text-xl font-bold text-brand-black">
          {totalResults} Restaurants found
        </h2>
      </div>

      {/* List */}
      {restaurants.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-brand-grey">
          No restaurants found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}

