import { Plus } from "lucide-react";
import Link from "next/link";

interface FoodPageHeaderProps {
    restaurantName: string;
}

export function FoodPageHeader({ restaurantName }: FoodPageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Food Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage restaurant menu: {restaurantName}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Link
                    href="/merchant/food/new"
                    className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Food Item
                </Link>
            </div>
        </div>
    );
}
