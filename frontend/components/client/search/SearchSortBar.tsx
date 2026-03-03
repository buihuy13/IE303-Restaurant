"use client";

type SortValue = "relevance" | "price-asc" | "price-desc";

type SearchSortBarProps = {
  sort: SortValue;
  onSortChange: (value: SortValue) => void;
  total: number;
  query: string;
};

export default function SearchSortBar({
  sort,
  onSortChange,
  total,
  query,
}: SearchSortBarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          {query ? `Search results for "${query}"` : "All food items"}
        </h1>
        <p className="text-sm text-gray-500">
          {total > 0
            ? `Found ${total} ${total === 1 ? "item" : "items"}.`
            : "No items match your search."}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          Sort by
        </span>
        <select
          aria-label="Sort search results"
          title="Sort search results"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortValue)}
          className="border border-gray-300 rounded-full px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]/30"
        >
          <option value="relevance">Relevance</option>
          <option value="price-asc">Price: Low to high</option>
          <option value="price-desc">Price: High to low</option>
        </select>
      </div>
    </div>
  );
}

