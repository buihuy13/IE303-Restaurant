import { useMemo, useState } from "react";

import { mockProducts, mockRestaurants } from "@/constants";

type SortOption = "rating-desc" | "rating-asc";

export function useRestaurantsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sort, setSort] = useState<SortOption>("rating-desc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = useMemo(
    () => ["All", "Pho", "Rice", "Chicken", "Milk tea", "Cafe", "Dessert", "Healthy"],
    [],
  );

  const filteredRestaurants = useMemo(() => {
    let items = [...mockRestaurants];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((r) => r.name.toLowerCase().includes(q));
    }

    if (activeCategory !== "All") {
      items = items.filter((r) => r.tags.includes(activeCategory));
    }

    items.sort((a, b) =>
      sort === "rating-desc" ? b.rating - a.rating : a.rating - b.rating,
    );

    return items;
  }, [activeCategory, search, sort]);

  const filteredProducts = useMemo(() => {
    // Simple mock for potential future "foods" tab if needed
    let items = [...mockProducts];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(q));
    }

    return items;
  }, [search]);

  const totalResults = filteredRestaurants.length;

  const openFilter = () => setIsFilterOpen(true);
  const closeFilter = () => setIsFilterOpen(false);

  const clearAll = () => {
    setSearch("");
    setActiveCategory("All");
    setSort("rating-desc");
  };

  return {
    // state
    search,
    activeCategory,
    sort,
    isFilterOpen,
    categories,
    // derived
    restaurants: filteredRestaurants,
    products: filteredProducts,
    totalResults,
    // actions
    setSearch,
    setActiveCategory,
    setSort,
    openFilter,
    closeFilter,
    clearAll,
  };
}

