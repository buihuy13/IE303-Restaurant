import { Search } from "lucide-react";
import { BRAND_ORANGE } from "@/lib/constants/blog";

interface BlogListSearchProps {
    searchInput: string;
    onSearchInputChange: (value: string) => void;
    onSearch: () => void;
}

export function BlogListSearch({ searchInput, onSearchInputChange, onSearch }: BlogListSearchProps) {
    return (
        <div className="mb-6">
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchInput}
                        onChange={(e) => onSearchInputChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSearch()}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
                        style={{ "--tw-ring-color": BRAND_ORANGE } as React.CSSProperties}
                    />
                </div>
                <button
                    type="button"
                    onClick={onSearch}
                    className="px-6 py-3.5 text-white rounded-xl hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
                    style={{ backgroundColor: BRAND_ORANGE }}
                >
                    Search
                </button>
            </div>
        </div>
    );
}
