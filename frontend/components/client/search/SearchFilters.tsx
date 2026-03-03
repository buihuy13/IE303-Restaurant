"use client";

type SearchFiltersProps = {
  priceRange?: string | null;
  onPriceRangeChange?: (value: string | null) => void;
};

const PRICE_OPTIONS = [
  { value: "0-50000", label: "Under 50.000₫" },
  { value: "50000-100000", label: "50.000₫ - 100.000₫" },
  { value: "100000-200000", label: "100.000₫ - 200.000₫" },
  { value: "200000+", label: "Over 200.000₫" },
];

export default function SearchFilters({
  priceRange,
  onPriceRangeChange,
}: SearchFiltersProps) {
  return (
    <aside className="w-full lg:w-64 bg-white border border-gray-200 rounded-2xl p-4 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Price range
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          {PRICE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="priceRange"
                value={option.value}
                checked={priceRange === option.value}
                onChange={() =>
                  onPriceRangeChange?.(
                    priceRange === option.value ? null : option.value,
                  )
                }
                className="h-4 w-4 border-gray-300 text-[#EE4D2D] focus:ring-[#EE4D2D]"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onPriceRangeChange?.(null)}
        className="w-full text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-full py-2 transition-colors"
      >
        Clear filters
      </button>
    </aside>
  );
}

