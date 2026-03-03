"use client";

import { Filter, X } from "lucide-react";

import { useRestaurantsPage } from "@/hooks/restaurants/useRestaurantsPage";

import { FilterSidebar } from "./FilterSidebar";
import { RestaurantList } from "./RestaurantList";

export default function RestaurantsPageShell() {
  const {
    search,
    activeCategory,
    sort,
    isFilterOpen,
    categories,
    restaurants,
    totalResults,
    setSearch,
    setActiveCategory,
    setSort,
    openFilter,
    closeFilter,
    clearAll,
  } = useRestaurantsPage();

  const handleSearchApply = () => {
    // no-op for now because filtering is live as user types,
    // but we keep the handler so the UI matches other pages
  };

  return (
    <>
      {/* Mobile filter button */}
      <div className="sticky top-0 z-10 border-b bg-white p-4 lg:hidden">
        <button
          type="button"
          onClick={openFilter}
          className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      <div className="custom-container grid grid-cols-1 gap-x-10 py-8 lg:grid-cols-12">
        {/* Desktop sidebar */}
        <div className="hidden lg:col-span-4 lg:block">
          <FilterSidebar
            search={search}
            sort={sort}
            onSearchChange={setSearch}
            onSearchApply={handleSearchApply}
            onSortChange={setSort}
            onClearAll={clearAll}
          />
        </div>

        {/* Mobile drawer */}
        {isFilterOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={closeFilter}
          >
            <div
              className="fixed left-0 top-0 z-50 h-full w-[85%] max-w-sm overflow-y-auto bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  title="Close"
                  onClick={closeFilter}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <FilterSidebar
                search={search}
                sort={sort}
                onSearchChange={setSearch}
                onSearchApply={handleSearchApply}
                onSortChange={setSort}
                onClearAll={clearAll}
              />
            </div>
          </div>
        )}

        {/* Main list */}
        <div className="col-span-1 lg:col-span-8">
          <RestaurantList
            restaurants={restaurants}
            categories={categories}
            activeCategory={activeCategory}
            totalResults={totalResults}
            onCategoryClick={setActiveCategory}
          />
        </div>
      </div>
    </>
  );
}

