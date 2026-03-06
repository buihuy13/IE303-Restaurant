import { Calendar, Percent, Tag } from "lucide-react";

export function PromotionsStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                        <Tag className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Expiring Soon</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
                        <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Discount</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">$0.00</p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                        <Percent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Used</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                        <Tag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}
