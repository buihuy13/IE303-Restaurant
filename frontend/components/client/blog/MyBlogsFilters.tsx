import { Search } from "lucide-react";
import { BLOG_CATEGORIES_SIMPLE, BLOG_STATUS_LABELS } from "@/lib/constants/blog";
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
    const statusClasses: Record<Exclude<BlogStatus, "">, string> = {
        draft: "bg-gray-600",
        published: "bg-emerald-500",
        archived: "bg-amber-500",
    };

    return (
        <div className="mb-8 space-y-4 rounded-3xl border border-gray-200/90 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your articles..."
                        value={searchInput}
                        onChange={(e) => onSearchInputChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSearch()}
                        className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                    />
                </div>
                <button
                    type="button"
                    onClick={onSearch}
                    className="rounded-xl bg-brand-orange px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
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
                        className={`mr-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                            category === cat.value
                                ? "bg-brand-orange text-white shadow-sm"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                        }`}
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
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        status === "" ? "bg-gray-700 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    All
                </button>
                {Object.entries(BLOG_STATUS_LABELS).map(([value, { label }]) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onStatusChange(value as BlogStatus)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                            status === value
                                ? `${statusClasses[value as BlogStatus]} text-white`
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}
