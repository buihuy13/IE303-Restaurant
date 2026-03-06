"use client";

import RestaurantFormModal from "@/components/admin/restaurants/RestaurantFormModal";
import { AdminRestaurantsHeader } from "@/components/admin/restaurants/AdminRestaurantsHeader";
import { AdminRestaurantsFilters } from "@/components/admin/restaurants/AdminRestaurantsFilters";
import { AdminRestaurantCard } from "@/components/admin/restaurants/AdminRestaurantCard";
import { useAdminRestaurantsData } from "@/hooks/admin/restaurants/useAdminRestaurantsData";
import { useAdminRestaurantOwners } from "@/hooks/admin/restaurants/useAdminRestaurantOwners";
import { useAdminRestaurantFilters } from "@/hooks/admin/restaurants/useAdminRestaurantFilters";
import { useAdminRestaurantModal } from "@/hooks/admin/restaurants/useAdminRestaurantModal";
import { useAdminRestaurantActions } from "@/hooks/admin/restaurants/useAdminRestaurantActions";
import { Loader2 } from "lucide-react";

export default function AdminRestaurantsPageClient() {
    const { restaurants, loading, fetchRestaurants } = useAdminRestaurantsData();
    const ownersByMerchantId = useAdminRestaurantOwners(restaurants);
    const { searchTerm, setSearchTerm, filterStatus, setFilterStatus, filteredRestaurants } =
        useAdminRestaurantFilters(restaurants);
    const { isModalOpen, editingRestaurant, openCreateModal, openEditModal, closeModal } =
        useAdminRestaurantModal();
    const { handleSaveRestaurant, handleToggleStatus, handleDeleteRestaurant } =
        useAdminRestaurantActions(fetchRestaurants);

    return (
        <div className="space-y-6">
            <AdminRestaurantsHeader
                total={restaurants.length}
                active={restaurants.filter((r) => r.enabled).length}
                inactive={restaurants.filter((r) => !r.enabled).length}
                onCreate={openCreateModal}
            />

            <AdminRestaurantsFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onFilterStatusChange={setFilterStatus}
            />

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-brand-orange" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {filteredRestaurants.map((restaurant) => (
                            <AdminRestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                owner={ownersByMerchantId[restaurant.merchantId]}
                                onEdit={() => openEditModal(restaurant)}
                                onToggleStatus={() => handleToggleStatus(restaurant)}
                                onDelete={() => handleDeleteRestaurant(restaurant.id)}
                            />
                        ))}
                    </div>
                )}
                {!loading && filteredRestaurants.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">No restaurants found</div>
                )}
            </div>

            {isModalOpen && (
                <RestaurantFormModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    restaurantToEdit={editingRestaurant}
                    onSave={(data, image) => handleSaveRestaurant(editingRestaurant, data, image).then(() => closeModal())}
                />
            )}
        </div>
    );
}

