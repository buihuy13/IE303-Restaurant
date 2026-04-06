import { Search } from "lucide-react";

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
                        className="w-full rounded-xl border-2 border-gray-200 py-3.5 pl-12 pr-4 text-gray-700 placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                    />
                </div>
                <button
                    type="button"
                    onClick={onSearch}
                    className="whitespace-nowrap rounded-xl bg-brand-orange px-6 py-3.5 font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-brand-orange/90 hover:shadow-lg"
                >
                    Search
                </button>
            </div>
        </div>
    );
}
