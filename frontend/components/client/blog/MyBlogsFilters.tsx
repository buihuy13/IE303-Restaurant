import { Search } from "lucide-react";
import { BLOG_CATEGORIES_SIMPLE, BLOG_STATUS_LABELS, BRAND_ORANGE } from "@/lib/constants/blog";
import type { BlogCategory, BlogStatus } from "@/types/blog.type";

interface MyBlogsFiltersProps {
    searchInput: string;
    onSearchInputChange: (v: string) => void;
    onSearch: () => void;
    category: BlogCategory | "";
    onCategoryChange: (c: BlogCategory | "") => void;
    status: BlogStatus | "";
    onStatusChange: (s: BlogStatus | "") => void;
}

export function MyBlogsFilters({
    searchInput,
    onSearchInputChange,
    onSearch,
    category,
    onCategoryChange,
    status,
    onStatusChange,
}: MyBlogsFiltersProps) {
    return (
        <div className="mb-8 space-y-4">
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search your articles..."
                        value={searchInput}
                        onChange={(e) => onSearchInputChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSearch()}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                    />
                </div>
                <button
                    type="button"
                    onClick={onSearch}
                    className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                    style={{ backgroundColor: BRAND_ORANGE }}
                >
                    Search
                </button>
            </div>
            <div className="flex flex-wrap gap-3">
                <span className="text-sm font-medium text-gray-700 mr-2">Category:</span>
                {BLOG_CATEGORIES_SIMPLE.map((cat) => (
                    <button
                        key={cat.value}
                        type="button"
                        onClick={() => onCategoryChange(cat.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all mr-2 ${
                            category === cat.value ? "text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        }`}
                        style={category === cat.value ? { backgroundColor: BRAND_ORANGE } : undefined}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap gap-3">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <button
                    type="button"
                    onClick={() => onStatusChange("")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        status === "" ? "bg-gray-700 text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                >
                    All
                </button>
                {Object.entries(BLOG_STATUS_LABELS).map(([value, { label, color }]) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onStatusChange(value as BlogStatus)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            status === value ? "text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        }`}
                        style={status === value ? { backgroundColor: color } : undefined}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}
