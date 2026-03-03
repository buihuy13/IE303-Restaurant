import { Search, SlidersHorizontal } from "lucide-react";

type SortOption = "rating-desc" | "rating-asc";

type FilterSidebarProps = {
  search: string;
  sort: SortOption;
  onSearchChange: (value: string) => void;
  onSearchApply: () => void;
  onSortChange: (value: SortOption) => void;
  onClearAll: () => void;
};

export function FilterSidebar({
  search,
  sort,
  onSearchChange,
  onSearchApply,
  onSortChange,
  onClearAll,
}: FilterSidebarProps) {
  return (
    <aside className="w-full py-2 px-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-manrope font-bold leading-[30px] text-brand-black">
          Filters
        </h2>
        <button
          type="button"
          onClick={onClearAll}
          className="cursor-pointer text-sm font-manrope font-bold leading-[30px] text-brand-purple underline hover:text-brand-purple/80"
        >
          Clear all
        </button>
      </div>

      {/* Search */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between gap-2 text-sm font-manrope text-brand-grey">
          <span className="inline-flex items-center gap-2 font-semibold">
            <Search className="h-4 w-4 text-brand-purple" />
            Search by name
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g., Pho 24, Milk Tea House"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearchApply()}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
          />
          <button
            type="button"
            onClick={onSearchApply}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-purple text-white hover:bg-brand-purple/90"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sort by */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center gap-2 text-sm font-manrope text-brand-grey">
          <SlidersHorizontal className="h-4 w-4 text-brand-purple" />
          <span className="font-semibold">Sort by rating</span>
        </div>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-grey">
            <input
              type="radio"
              name="sort"
              value="rating-desc"
              checked={sort === "rating-desc"}
              onChange={() => onSortChange("rating-desc")}
              className="h-4 w-4 border-gray-300 text-brand-purple focus:ring-brand-purple"
            />
            <span>High to low</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-grey">
            <input
              type="radio"
              name="sort"
              value="rating-asc"
              checked={sort === "rating-asc"}
              onChange={() => onSortChange("rating-asc")}
              className="h-4 w-4 border-gray-300 text-brand-purple focus:ring-brand-purple"
            />
            <span>Low to high</span>
          </label>
        </div>
      </div>
    </aside>
  );
}

