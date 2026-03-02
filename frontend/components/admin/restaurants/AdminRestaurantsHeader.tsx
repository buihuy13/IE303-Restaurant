import { Plus } from "lucide-react";

interface AdminRestaurantsHeaderProps {
    total: number;
    active: number;
    inactive: number;
    onCreate: () => void;
}

export function AdminRestaurantsHeader({ total, active, inactive, onCreate }: AdminRestaurantsHeaderProps) {
    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Restaurants</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all restaurants in the system</p>
                </div>
                <button
                    onClick={onCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90 transition-colors"
                >
                    <Plus size={20} />
                    Add Restaurant
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Restaurants</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{total}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{active}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{inactive}</p>
                </div>
            </div>
        </>
    );
}

