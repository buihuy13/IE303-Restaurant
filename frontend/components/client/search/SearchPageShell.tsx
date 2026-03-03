"use client";

import SearchFilters from "./SearchFilters";
import SearchResultCard from "./SearchResultCard";
import SearchSortBar from "./SearchSortBar";
import { useSearchPage } from "@/hooks/search/useSearchPage";

export default function SearchPageShell() {
  const {
    query,
    sort,
    setSort,
    priceRange,
    setPriceRange,
    filteredProducts,
  } = useSearchPage();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="custom-container py-6 flex flex-col gap-6 lg:flex-row">
        <div className="hidden lg:block shrink-0">
          <SearchFilters
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
          />
        </div>

        <section className="flex-1 min-w-0">
          <SearchSortBar
            sort={sort}
            onSortChange={setSort}
            total={filteredProducts.length}
            query={query}
          />

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <SearchResultCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="mt-12 flex flex-col items-center justify-center text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm">
                Try adjusting your search or filters to find more items.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

