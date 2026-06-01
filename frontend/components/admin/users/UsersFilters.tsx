import { Search } from "lucide-react";

interface UsersFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterRole: string;
    onFilterRoleChange: (value: string) => void;
}

export function UsersFilters({
    searchTerm,
    onSearchChange,
    filterRole,
    onFilterRoleChange,
}: UsersFiltersProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by username or email..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                </div>

                <select
                    value={filterRole}
                    onChange={(e) => onFilterRoleChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    aria-label="Filter by role"
                    title="Filter by role"
                >
                    <option value="ALL">All roles</option>
                    <option value="USER">User</option>
                    <option value="MERCHANT">Merchant</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>
        </div>
    );
}

