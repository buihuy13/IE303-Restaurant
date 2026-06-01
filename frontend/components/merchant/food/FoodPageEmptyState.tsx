import { Plus } from "lucide-react";
import Link from "next/link";

interface FoodPageEmptyStateProps {
    hasAnyProducts: boolean;
}

export function FoodPageEmptyState({ hasAnyProducts }: FoodPageEmptyStateProps) {
    return (
        <div className="grid grid-cols-1 gap-6">
            <div className="col-span-full">
                <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                    <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {hasAnyProducts ? "No food items match your search" : "No food items yet"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {hasAnyProducts
                            ? "Try changing your search term or add a new food item"
                            : "Start by adding your first food item"}
                    </p>
                    <Link
                        href="/merchant/food/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add Food Item
                    </Link>
                </div>
            </div>
        </div>
    );
}
