import { Search } from "lucide-react";

interface OrdersSearchBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export function OrdersSearchBar({ searchTerm, onSearchChange }: OrdersSearchBarProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="relative w-full sm:max-w-sm">
                <input
                    type="text"
                    placeholder="Search by Order ID, Customer..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
        </div>
    );
}

