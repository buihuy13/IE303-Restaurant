import { useState } from "react";
import type { Restaurant } from "@/types";

export function useAdminRestaurantModal() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

    const openCreateModal = () => {
        setEditingRestaurant(null);
        setIsModalOpen(true);
    };

    const openEditModal = (restaurant: Restaurant) => {
        setEditingRestaurant(restaurant);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRestaurant(null);
    };

    return {
        isModalOpen,
        editingRestaurant,
        openCreateModal,
        openEditModal,
        closeModal,
    };
}

