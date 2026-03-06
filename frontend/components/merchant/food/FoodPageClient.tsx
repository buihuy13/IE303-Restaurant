"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import ConfirmDeleteFoodModal from "@/components/merchant/food/ConfirmDeleteFoodModal";
import FoodCard from "@/components/merchant/food/FoodCard";
import FoodSearch from "@/components/merchant/food/FoodSearch";
import FoodStats from "@/components/merchant/food/FoodStats";
import { FoodPageHeader } from "@/components/merchant/food/FoodPageHeader";
import { FoodPageEmptyState } from "@/components/merchant/food/FoodPageEmptyState";
import { useMerchantFoodData } from "@/hooks/merchant/food/useMerchantFoodData";
import { useMerchantFoodFilters } from "@/hooks/merchant/food/useMerchantFoodFilters";

export default function FoodPageClient() {
    const {
        products,
        loading,
        currentRestaurant,
        isLoadingRestaurant,
        hasRestaurant,
        deleteTargetId,
        deleteTargetName,
        deleteLoading,
        openDeleteModal,
        closeDeleteModal,
        handleConfirmDelete,
    } = useMerchantFoodData();
    const { searchTerm, setSearchTerm, filteredFoods } = useMerchantFoodFilters(products);

    if (isLoadingRestaurant) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-brand-orange animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading information...</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">Loading restaurant data...</p>
            </div>
        );
    }

    if (!hasRestaurant || !currentRestaurant) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-700 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200">
                <h2 className="text-xl font-bold mb-2">Restaurant setup required</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    You need to create your restaurant profile before managing food items.
                </p>
                <Link
                    href="/merchant/manage/settings"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg transition-colors"
                >
                    Go to Settings
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <FoodPageHeader restaurantName={currentRestaurant.resName} />
            <FoodStats foods={products} />
            <FoodSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={40} className="animate-spin text-brand-orange" />
                </div>
            ) : filteredFoods.length === 0 ? (
                <FoodPageEmptyState hasAnyProducts={products.length > 0} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFoods.map((food) => (
                        <FoodCard
                            key={food.id}
                            food={food}
                            onDelete={(id) => openDeleteModal(id, food.productName)}
                        />
                    ))}
                </div>
            )}

            <ConfirmDeleteFoodModal
                open={!!deleteTargetId}
                foodName={deleteTargetName}
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteModal}
                loading={deleteLoading}
            />
        </div>
    );
}
